import { syncConversations, getConversations, getMessages, sendReply } from '../services/dmService.js';

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

export async function reply(req, res) {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: 'Message is required' });

  try {
    const result = await sendReply(req.user.userId, req.params.id, message.trim());
    res.json({ ok: true, meta: result });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
}
