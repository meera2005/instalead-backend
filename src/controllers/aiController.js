import pool from '../db/pool.js';
import { suggestReply, analyzeConversation, chatReply, extractKnowledge, generateInsights } from '../services/aiService.js';

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

export async function getSuggestions(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT ks.*, c.participant_name
       FROM knowledge_suggestions ks
       LEFT JOIN conversations c ON c.id = ks.conversation_id
       WHERE ks.user_id = $1 AND ks.status = 'pending'
       ORDER BY ks.created_at DESC`,
      [req.user.userId]
    );
    res.json({ suggestions: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSuggestionsCount(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*) as count FROM knowledge_suggestions WHERE user_id = $1 AND status = 'pending'`,
      [req.user.userId]
    );
    res.json({ count: parseInt(rows[0].count) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function resolveSuggestion(req, res) {
  const { id } = req.params;
  const { action } = req.body; // 'approve' or 'reject'
  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ error: 'action must be approve or reject' });
  }
  try {
    const { rows } = await pool.query(
      `UPDATE knowledge_suggestions SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [action === 'approve' ? 'approved' : 'rejected', id, req.user.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Suggestion not found' });

    if (action === 'approve') {
      // Append to business profile FAQs
      await pool.query(
        `INSERT INTO business_profiles (user_id, faqs, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           faqs = CASE
             WHEN business_profiles.faqs IS NULL OR business_profiles.faqs = ''
             THEN EXCLUDED.faqs
             ELSE business_profiles.faqs || E'\n' || EXCLUDED.faqs
           END,
           updated_at = NOW()`,
        [req.user.userId, rows[0].suggestion]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function learnFromMessage(req, res) {
  const { ownerReply, customerMessage } = req.body;
  if (!ownerReply?.trim()) return res.status(400).json({ error: 'ownerReply is required' });
  try {
    const { rows: profileRows } = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1', [req.user.userId]
    );
    const result = await extractKnowledge(ownerReply, customerMessage || '', profileRows[0]);
    const fact = result?.suggestion || ownerReply.trim();

    await pool.query(
      `INSERT INTO business_profiles (user_id, faqs, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         faqs = CASE
           WHEN business_profiles.faqs IS NULL OR business_profiles.faqs = ''
           THEN EXCLUDED.faqs
           ELSE business_profiles.faqs || E'\n' || EXCLUDED.faqs
         END,
         updated_at = NOW()`,
      [req.user.userId, fact]
    );
    res.json({ saved: fact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function triggerKnowledgeExtraction(userId, conversationId, ownerReply, customerMessage) {
  try {
    const { rows: profileRows } = await pool.query(
      'SELECT * FROM business_profiles WHERE user_id = $1', [userId]
    );
    const result = await extractKnowledge(ownerReply, customerMessage, profileRows[0]);
    if (result) {
      await pool.query(
        `INSERT INTO knowledge_suggestions (user_id, conversation_id, suggestion, category)
         VALUES ($1, $2, $3, $4)`,
        [userId, conversationId, result.suggestion, result.category]
      );
    }
  } catch {
    // Non-blocking — never let this crash the reply flow
  }
}

export async function getInsights(req, res) {
  try {
    const { rows: convRows } = await pool.query(
      `SELECT c.id, c.participant_name, l.status
       FROM conversations c
       LEFT JOIN leads l ON l.conversation_id = c.id
       WHERE c.user_id = $1
       ORDER BY c.last_message_at DESC
       LIMIT 20`,
      [req.user.userId]
    );
    if (convRows.length < 3) return res.json({ insights: [] });

    const convData = await Promise.all(convRows.map(async (c) => {
      const { rows: msgs } = await pool.query(
        'SELECT direction, body FROM messages WHERE conversation_id = $1 ORDER BY sent_at ASC LIMIT 10',
        [c.id]
      );
      return { name: c.participant_name || 'Unknown', status: c.status, messages: msgs };
    }));

    const insights = await generateInsights(convData);
    res.json({ insights });
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
