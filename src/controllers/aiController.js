import pool from '../db/pool.js';
import { suggestReply, analyzeConversation, chatReply } from '../services/aiService.js';

export async function getProfile(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function upsertProfile(req, res) {
  const { business_name, business_type, services, tone, faqs, escalation_rules } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO business_profiles (user_id, business_name, business_type, services, tone, faqs, escalation_rules, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         business_name     = EXCLUDED.business_name,
         business_type     = EXCLUDED.business_type,
         services          = EXCLUDED.services,
         tone              = EXCLUDED.tone,
         faqs              = EXCLUDED.faqs,
         escalation_rules  = EXCLUDED.escalation_rules,
         updated_at        = NOW()
       RETURNING *`,
      [req.user.userId, business_name, business_type, services, tone, faqs, escalation_rules]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSuggestedReplies(req, res) {
  const { id } = req.params;
  try {
    const { rows: convRows } = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    if (!convRows[0]) return res.status(404).json({ error: 'Conversation not found' });

    const { rows: messages } = await pool.query(
      'SELECT direction, body FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
      [id]
    );

    const { rows: profileRows } = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    const suggestions = await suggestReply(messages, profileRows[0]);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function simulateChat(req, res) {
  const { history } = req.body;
  if (!Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'history array is required' });
  }
  try {
    const { rows: profileRows } = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1',
      [req.user.userId]
    );
    const reply = await chatReply(history, profileRows[0]);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function analyzeConv(req, res) {
  const { id } = req.params;
  try {
    const { rows: convRows } = await pool.query(
      'SELECT id FROM conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.userId]
    );
    if (!convRows[0]) return res.status(404).json({ error: 'Conversation not found' });

    const { rows: messages } = await pool.query(
      'SELECT direction, body FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC',
      [id]
    );

    const { rows: profileRows } = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    const analysis = await analyzeConversation(messages, profileRows[0]);

    // Persist summary + temperature to leads table
    await pool.query(
      `INSERT INTO leads (conversation_id, user_id, ai_summary, lead_temperature)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (conversation_id) DO UPDATE SET
         ai_summary       = EXCLUDED.ai_summary,
         lead_temperature = EXCLUDED.lead_temperature,
         updated_at       = NOW()`,
      [id, req.user.userId, analysis.summary, analysis.temperature]
    );

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
