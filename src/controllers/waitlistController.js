import pool from '../db/pool.js';

export async function submitDemoRequest(req, res) {
  const { name, email, whatsapp } = req.body;

  if (!email && !whatsapp) {
    return res.status(400).json({ error: 'Provide at least an email or WhatsApp number.' });
  }

  await pool.query(
    `INSERT INTO demo_requests (name, email, whatsapp) VALUES ($1, $2, $3)`,
    [name?.trim() || null, email?.trim() || null, whatsapp?.trim() || null]
  );

  console.log(`[demo-request] name=${name || '-'} email=${email || '-'} whatsapp=${whatsapp || '-'}`);

  res.json({ ok: true });
}

export async function listDemoRequests(req, res) {
  const { rows } = await pool.query(
    `SELECT * FROM demo_requests ORDER BY created_at DESC`
  );
  res.json({ requests: rows });
}
