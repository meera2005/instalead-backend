import pool from '../db/pool.js';
import { syncConversations, getConversations, getMessages, sendReply, updateStatus } from '../services/dmService.js';
import { triggerKnowledgeExtraction } from './aiController.js';

export async function sync(req, res) {
  try {
    const convs = await syncConversations(req.user.userId);
    res.json({ synced: convs.length, conversations: convs });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}

export async function listConversations(req, res) {
  try {
    const convs = await getConversations(req.user.userId);
    res.json({ conversations: convs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
}

export async function getThread(req, res) {
  try {
    const result = await getMessages(req.user.userId, req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: err.message });
  }
}

export async function patchName(req, res) {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name is required' });
  try {
    await pool.query(
      'UPDATE conversations SET participant_name = $1 WHERE id = $2 AND user_id = $3',
      [name.trim(), req.params.id, req.user.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function patchStatus(req, res) {
  const { status } = req.body;
  const valid = ['New', 'Replied', 'Follow-up Due', 'Booked', 'Lost'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  try {
    const result = await updateStatus(req.user.userId, req.params.id, status);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: err.message });
  }
}

export async function reply(req, res) {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

  try {
    const result = await sendReply(req.user.userId, req.params.id, message.trim());
    res.json({ ok: true, meta: result });

    // Async: check if this reply contains new knowledge (never blocks the response)
    const { getMessages } = await import('../services/dmService.js');
    getMessages(req.user.userId, req.params.id).then(({ messages }) => {
      const lastCustomerMsg = [...messages].reverse().find(m => m.direction === 'inbound');
      if (lastCustomerMsg) {
        triggerKnowledgeExtraction(
          req.user.userId,
          req.params.id,
          message.trim(),
          lastCustomerMsg.body
        );
      }
    }).catch(() => {});
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
