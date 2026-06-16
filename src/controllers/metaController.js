import pool from '../db/pool.js';

const META_API = 'https://graph.facebook.com/v19.0';

// Step 1: Redirect user to Meta OAuth dialog
export function oauthRedirect(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID,
    redirect_uri: `${process.env.APP_URL}/api/meta/callback`,
    scope: 'instagram_manage_messages,instagram_basic,pages_manage_metadata,pages_show_list',
    response_type: 'code',
    state: req.user.userId.toString(),
  });
  res.redirect(`https://www.facebook.com/v19.0/dialog/oauth?${params}`);
}

// Step 2: Handle OAuth callback — exchange code for token, discover IG account
export async function oauthCallback(req, res) {
  const { code, state } = req.query;
  const userId = parseInt(state, 10);

  if (!code || !userId) {
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=oauth_failed`);
  }

  try {
    // Exchange code for short-lived token
    const tokenRes = await fetch(
      `${META_API}/oauth/access_token?` +
        new URLSearchParams({
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          redirect_uri: `${process.env.APP_URL}/api/meta/callback`,
          code,
        })
    );
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error.message);

    // Exchange for long-lived token
    const longRes = await fetch(
      `${META_API}/oauth/access_token?` +
        new URLSearchParams({
          grant_type: 'fb_exchange_token',
          client_id: process.env.META_APP_ID,
          client_secret: process.env.META_APP_SECRET,
          fb_exchange_token: tokenData.access_token,
        })
    );
    const longData = await longRes.json();
    if (longData.error) throw new Error(longData.error.message);

    const userLongToken = longData.access_token;

    // Get Facebook Pages the user manages
    const pagesRes = await fetch(
      `${META_API}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userLongToken}`
    );
    const pagesData = await pagesRes.json();
    if (pagesData.error) throw new Error(pagesData.error.message);

    // Find first page with a linked Instagram business account
    const page = pagesData.data?.find((p) => p.instagram_business_account);
    if (!page) {
      return res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=no_ig_account`);
    }

    const pageToken = page.access_token;
    const pageId = page.id;
    const igUserId = page.instagram_business_account.id;

    // Get IG username
    const igRes = await fetch(
      `${META_API}/${igUserId}?fields=username&access_token=${pageToken}`
    );
    const igData = await igRes.json();

    // Calculate token expiry (~60 days for long-lived)
    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO instagram_accounts (user_id, ig_user_id, ig_username, page_id, access_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         ig_user_id = EXCLUDED.ig_user_id,
         ig_username = EXCLUDED.ig_username,
         page_id = EXCLUDED.page_id,
         access_token = EXCLUDED.access_token,
         token_expires_at = EXCLUDED.token_expires_at,
         connected_at = NOW()`,
      [userId, igUserId, igData.username || null, pageId, pageToken, expiresAt]
    );

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?connected=true`);
  } catch (err) {
    console.error('Meta OAuth error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?error=oauth_failed`);
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

// GET /api/meta/disconnect
export async function disconnect(req, res) {
  await pool.query('DELETE FROM instagram_accounts WHERE user_id = $1', [req.user.userId]);
  res.json({ ok: true });
}
