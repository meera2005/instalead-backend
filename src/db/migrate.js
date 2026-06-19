import pool from './pool.js';

const schema = `
-- Users table (one row per photographer/coach/creator account)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Instagram connections (one per user — their linked IG business account)
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ig_user_id          TEXT NOT NULL,          -- Instagram user ID
  ig_username         TEXT,
  page_id             TEXT,                   -- Linked Facebook Page ID
  access_token        TEXT NOT NULL,          -- Long-lived page token
  token_expires_at    TIMESTAMPTZ,
  connected_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- DM conversations (one row per Instagram thread)
CREATE TABLE IF NOT EXISTS conversations (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ig_thread_id    TEXT NOT NULL,
  participant_name TEXT,
  participant_ig_id TEXT,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, ig_thread_id)
);

-- Individual messages within a conversation
CREATE TABLE IF NOT EXISTS messages (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  ig_message_id   TEXT UNIQUE,
  direction       TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
  body            TEXT,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CRM leads extracted from conversations
CREATE TABLE IF NOT EXISTS leads (
  id              SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE UNIQUE,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  status          TEXT DEFAULT 'New' CHECK (status IN ('New','Replied','Follow-up Due','Booked','Lost')),
  service_type    TEXT,
  event_date      TEXT,
  budget          TEXT,
  location        TEXT,
  ai_summary      TEXT,
  ai_reply        TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Business AI profile (one per user — stores knowledge base for AI replies)
CREATE TABLE IF NOT EXISTS business_profiles (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  business_name     TEXT,
  business_type     TEXT,
  services          TEXT,
  tone              TEXT DEFAULT 'friendly',
  faqs              TEXT,
  escalation_rules  TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Running migrations...');
    await client.query(schema);
    // Additive column migrations (safe to re-run)
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_temperature TEXT DEFAULT 'Warm'`);
    await client.query(`ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_date TIMESTAMPTZ`);
    console.log('✅ Database schema ready.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
