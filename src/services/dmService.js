import pool from '../db/pool.js';

const IG_API = 'https://graph.instagram.com/v21.0';

// Fetch all DM conversations from Meta and sync to DB
export async function syncConversations(userId) {
  const { rows: accounts } = await pool.query(
    'SELECT * FROM instagram_accounts WHERE user_id = $1',
    [userId]
  );
  const account = accounts[0];
  if (!account) throw new Error('No Instagram account connected');

  const { ig_user_id, access_token } = account;

  // Fetch conversations from Instagram Graph API
  const res = await fetch(
    `${IG_API}/${ig_user_id}/conversations?platform=instagram&fields=id,participants,messages{id,message,from,created_time}`,
    { headers: { Authorization: `Bearer ${access_token}` } }
  );
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);

  const synced = [];

  for (const thread of data.data || []) {
    // Identify the non-business participant (the lead)
    const participant = thread.participants?.data?.find((p) => p.id !== ig_user_id);

    // Upsert conversation
    const { rows: convRows } = await pool.query(
      `INSERT INTO conversations (user_id, ig_thread_id, participant_name, participant_ig_id, last_message_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, ig_thread_id) DO UPDATE SET
         participant_name = EXCLUDED.participant_name,
         last_message_at = NOW()
       RETURNING *`,
      [userId, thread.id, participant?.name || 'Unknown', participant?.id || null]
    );
    const conv = convRows[0];

    // Upsert messages
    for (const msg of thread.messages?.data || []) {
      const direction = msg.from?.id === ig_user_id ? 'outbound' : 'inbound';
      await pool.query(
        `INSERT INTO messages (conversation_id, ig_message_id, direction, body, sent_at)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (ig_message_id) DO NOTHING`,
        [conv.id, msg.id, direction, msg.message, new Date(msg.created_time)]
      );
    }

    synced.push(conv);
  }

  return synced;
}

// Get all conversations for a user (with latest message preview)
export async function getConversations(userId) {
  const { rows } = await pool.query(
    `SELECT c.*,
            m.body AS last_message,
            m.direction AS last_direction,
            l.status AS lead_status,
            l.id AS lead_id
     FROM conversations c
     LEFT JOIN LATERAL (
       SELECT body, direction FROM messages
       WHERE conversation_id = c.id
       ORDER BY sent_at DESC LIMIT 1
     ) m ON true
     LEFT JOIN leads l ON l.conversation_id = c.id
     WHERE c.user_id = $1
     ORDER BY c.last_message_at DESC`,
    [userId]
  );
  return rows;
}

// Get messages for a single conversation
export async function getMessages(userId, conversationId) {
  // Verify ownership
  const { rows: convRows } = await pool.query(
    'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  if (!convRows[0]) throw new Error('Conversation not found');

  const { rows } = await pool.query(
    'SELECT * FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
    [conversationId]
  );
  return { conversation: convRows[0], messages: rows };
}

// Update lead status for a conversation
export async function updateStatus(userId, conversationId, status) {
  const { rows: convRows } = await pool.query(
    'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  if (!convRows[0]) throw new Error('Conversation not found');

  const { rows } = await pool.query(
    `INSERT INTO leads (conversation_id, user_id, status)
     VALUES ($1, $2, $3)
     ON CONFLICT (conversation_id) DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
     RETURNING *`,
    [conversationId, userId, status]
  );
  return rows[0];
}

// Send a reply via Meta API
export async function sendReply(userId, conversationId, messageText) {
  const { rows: accounts } = await pool.query(
    'SELECT * FROM instagram_accounts WHERE user_id = $1',
    [userId]
  );
  const account = accounts[0];
  if (!account) throw new Error('No Instagram account connected');

  const { rows: convRows } = await pool.query(
    'SELECT * FROM conversations WHERE id = $1 AND user_id = $2',
    [conversationId, userId]
  );
  const conv = convRows[0];
  if (!conv) throw new Error('Conversation not found');

  // Send message via Instagram API
  const res = await fetch(`${IG_API}/${account.ig_user_id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${account.access_token}`,
    },
    body: JSON.stringify({
      recipient: { id: conv.participant_ig_id },
      message: { text: messageText },
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  // Save outbound message to DB
  await pool.query(
    `INSERT INTO messages (conversation_id, ig_message_id, direction, body, sent_at)
     VALUES ($1, $2, 'outbound', $3, NOW())
     ON CONFLICT (ig_message_id) DO NOTHING`,
    [conversationId, data.message_id, messageText]
  );

  // Update conversation timestamp
  await pool.query('UPDATE conversations SET last_message_at = NOW() WHERE id = $1', [conversationId]);

  return data;
}
