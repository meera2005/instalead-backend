import pool from '../db/pool.js';

const IG_API = 'https://graph.instagram.com';

// Step 1: Redirect user to Instagram OAuth dialog
export function oauthRedirect(req, res) {
  const params = new URLSearchParams({
    force_reauth: 'true',
    client_id: process.env.INSTAGRAM_APP_ID,
    redirect_uri: `${process.env.APP_URL}/api/meta/callback`,
    response_type: 'code',
    scope: 'instagram_business_basic,instagram_business_manage_messages',
    state: req.user.userId.toString(),
  });
  res.redirect(`https://www.instagram.com/oauth/authorize?${params}`);
}

// Step 2: Handle OAuth callback — exchange code for token, save IG account
export async function oauthCallback(req, res) {
  const { code, state } = req.query;
  const userId = parseInt(state, 10);

  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=oauth_failed`);
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID,
        client_secret: process.env.INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.APP_URL}/api/meta/callback`,
        code,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error_type) throw new Error(tokenData.error_message);

    const shortToken = tokenData.access_token;
    const igUserId = tokenData.user_id?.toString();

    // Exchange for long-lived token (60 days)
    const longRes = await fetch(
      `${IG_API}/access_token?` +
        new URLSearchParams({
          grant_type: 'ig_exchange_token',
          client_secret: process.env.INSTAGRAM_APP_SECRET,
          access_token: shortToken,
        })
    );
    const longData = await longRes.json();
    if (longData.error) throw new Error(longData.error.message);

    const longToken = longData.access_token;
    const expiresIn = longData.expires_in || 5183944;

    // Get IG username
    const profileRes = await fetch(
      `${IG_API}/me?fields=id,username&access_token=${longToken}`
    );
    const profile = await profileRes.json();
    if (profile.error) throw new Error(profile.error.message);

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await pool.query(
      `INSERT INTO instagram_accounts (user_id, ig_user_id, ig_username, page_id, access_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         ig_user_id = EXCLUDED.ig_user_id,
         ig_username = EXCLUDED.ig_username,
         access_token = EXCLUDED.access_token,
         token_expires_at = EXCLUDED.token_expires_at,
         connected_at = NOW()`,
      [userId, profile.id || igUserId, profile.username || null, null, longToken, expiresAt]
    );

    res.json({ ok: true, connected: true, ig_username: profile.username, ig_user_id: profile.id });
  } catch (err) {
    console.error('Meta OAuth error:', err.message);
    res.json({ ok: false, error: err.message });
  }
}

// GET /api/meta/status — check if user has connected Instagram
export async function connectionStatus(req, res) {
  const { rows } = await pool.query(
    'SELECT ig_username, ig_user_id, connected_at, token_expires_at FROM instagram_accounts WHERE user_id = $1',
    [req.user.userId]
  );
  if (!rows[0]) return res.json({ connected: false });
  res.json({ connected: true, account: rows[0] });
}

// POST /api/meta/disconnect
export async function disconnect(req, res) {
  await pool.query('DELETE FROM instagram_accounts WHERE user_id = $1', [req.user.userId]);
  res.json({ ok: true });
}
