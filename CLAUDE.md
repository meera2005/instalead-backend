# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Instalead is an Instagram DM lead management tool for photographers, coaches, and creators. The backend reads Instagram DMs via Meta's Instagram Business API, saves conversations and messages to Postgres, and exposes REST endpoints for a React frontend (not yet built as of Phase 1).

Live backend: `https://instalead-backend-production.up.railway.app`
GitHub: `https://github.com/meera2005/instalead-backend`

## Commands

```bash
# Run dev server (hot reload via --watch)
npm run dev

# Run production server
npm start

# Run database migrations
npm run db:migrate
```

The project uses ESM (`"type": "module"`) — all imports must use `.js` extensions.

## Architecture

Request flow: `src/index.js` → `src/routes/*.js` → `src/controllers/*.js` → `src/services/*.js` → `src/db/pool.js`

- **`src/index.js`** — Express app entry point. Captures raw body via `express.json({ verify })` for webhook signature verification. Mounts all route groups.
- **`src/middleware/auth.js`** — JWT verification. Reads token from `Authorization: Bearer` header OR `?_token=` query param (dev workaround for browser OAuth testing — remove before production).
- **`src/db/pool.js`** — Single `pg.Pool` instance exported and shared across all controllers/services.
- **`src/db/migrate.js`** — Runs `CREATE TABLE IF NOT EXISTS` for all tables. Safe to re-run.
- **`src/services/dmService.js`** — All Instagram Graph API calls for DM sync and reply sending. Controllers are thin wrappers around this.

## Route Map

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | No | Create user, returns JWT |
| POST | `/api/auth/login` | No | Returns JWT |
| GET | `/api/auth/me` | Yes | Current user |
| GET | `/api/meta/connect` | Yes | Redirect to Instagram OAuth |
| GET | `/api/meta/callback` | No | OAuth callback (currently returns JSON for debugging — restore redirect before prod) |
| GET | `/api/meta/status` | Yes | Connected IG account info |
| POST | `/api/meta/disconnect` | Yes | Remove connected account |
| POST | `/api/dms/sync` | Yes | Pull DM threads from Instagram into DB |
| GET | `/api/dms/` | Yes | List conversations with last message preview |
| GET | `/api/dms/:id` | Yes | Single conversation + messages |
| PATCH | `/api/dms/:id/status` | Yes | Update lead status |
| POST | `/api/dms/:id/reply` | Yes | Send reply via Instagram API |
| GET | `/api/webhook` | No | Meta challenge verification |
| POST | `/api/webhook` | No | Receive DM events (signature verified) |
| GET | `/health` | No | Health check |

## Meta / Instagram API Notes

There are **two separate app IDs**:
- `META_APP_ID` (1529623392289621) — the main Facebook/Meta app. Used only for webhook signature verification.
- `INSTAGRAM_APP_ID` (1527608398802966) — the Instagram sub-app created by the "Manage messaging & content on Instagram" use case. Used for OAuth token exchange.

OAuth uses `https://www.instagram.com/oauth/authorize` (NOT the Facebook dialog URL). Token exchange uses `https://api.instagram.com/oauth/access_token` and long-lived token exchange uses `https://graph.instagram.com/access_token`.

**OAuth limitation:** The OAuth flow only works for published apps. While unpublished, tokens must be generated manually via Meta dashboard → Use Cases → Customize → Step 2 → Generate token, then inserted into the database directly.

Permissions: `instagram_business_basic`, `instagram_business_manage_messages` (and others added by Meta use case setup).

## Database Schema

- `users` — one row per app user (email + bcrypt hash)
- `instagram_accounts` — one row per user (UNIQUE on user_id), stores IG access token
- `conversations` — one DM thread per row (UNIQUE on user_id + ig_thread_id)
- `messages` — individual messages (UNIQUE on ig_message_id)
- `leads` — CRM data per conversation (UNIQUE on conversation_id), status enum: `New/Replied/Follow-up Due/Booked/Lost`

## Environment Variables

See `.env.example`. Required: `DATABASE_URL`, `JWT_SECRET`, `META_APP_ID`, `META_APP_SECRET`, `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN`, `APP_URL`, `FRONTEND_URL`.

## Known Issues / Pre-Production TODOs

1. `GET /api/meta/callback` returns JSON instead of redirecting — restore redirect to `FRONTEND_URL/dashboard` when frontend is built.
2. `?_token=` auth bypass in `src/middleware/auth.js` — remove before production.
3. Instagram access token for test account expires 2026-08-16 — implement token refresh.
4. `FRONTEND_URL` in Railway env vars is `http://localhost:5173` — update when frontend is deployed.
5. Meta app is unpublished — complete app review before real users can connect Instagram.
