import crypto from 'crypto';
import pool from '../db/pool.js';

// Meta calls GET to verify the webhook endpoint
export function verify(req, res) {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('Webhook verified by Meta');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
}

// Meta calls POST with new message events
export async function receive(req, res) {
  // Verify X-Hub-Signature-256 header
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return res.sendStatus(400);

  const expected =
    'sha256=' +
    crypto
      .createHmac('sha256', process.env.META_APP_SECRET)
      .update(req.rawBody) // rawBody set by middleware below
      .digest('hex');

  if (signature !== expected) {
    console.warn('Webhook signature mismatch');
    return res.sendStatus(403);
  }

  // Always respond 200 immediately so Meta doesn't retry
  res.sendStatus(200);

  const body = req.body;
  if (body.object !== 'instagram') return;

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      await handleMessageEvent(entry.id, event).catch((err) =>
        console.error('Webhook handler error:', err.message)
      );
    }
  }
}

async function handleMessageEvent(pageId, event) {
  if (!event.message) return;

  // Find which user owns this Page/IG account
  const { rows: accounts } = await pool.query(
    'SELECT * FROM instagram_accounts WHERE page_id = $1',
    [pageId]
  );
  const account = accounts[0];
  if (!account) return; // Unknown page — ignore

  const senderId = event.sender.id;
  const recipientId = event.recipient.id;
  const isInbound = senderId !== account.ig_user_id;
  const participantId = isInbound ? senderId : recipientId;

  // Upsert conversation
  const { rows: convRows } = await pool.query(
    `INSERT INTO conversations (user_id, ig_thread_id, participant_ig_id, last_message_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, ig_thread_id) DO UPDATE SET last_message_at = NOW()
     RETURNING *`,
    [account.user_id, `${account.ig_user_id}_${participantId}`, participantId]
  );
  const conv = convRows[0];

  // Insert message
  const igMsgId = event.message.mid;
  await pool.query(
    `INSERT INTO messages (conversation_id, ig_message_id, direction, body, sent_at)
     VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0))
     ON CONFLICT (ig_message_id) DO NOTHING`,
    [conv.id, igMsgId, isInbound ? 'inbound' : 'outbound', event.message.text, event.timestamp]
  );

  console.log(`📨 New ${isInbound ? 'inbound' : 'outbound'} message saved for user ${account.user_id}`);
}
