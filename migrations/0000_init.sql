-- D7 initial migration: users + render_logs
-- Idempotent:可重复跑

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  stripe_id        TEXT,
  plan             TEXT NOT NULL DEFAULT 'free',
  pro_expires_at   TIMESTAMPTZ,
  magic_token_hash TEXT,
  magic_expires_at TIMESTAMPTZ
);

-- 大小写不敏感 unique 索引(lowercase email)
-- 避免 foo@bar.com 和 FOO@BAR.COM 重复注册
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (lower(email));

CREATE TABLE IF NOT EXISTS render_logs (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES users(id),
  template     TEXT,
  aspect_ratio TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_ms  INTEGER,
  success      BOOLEAN,
  error_code   TEXT
);

CREATE INDEX IF NOT EXISTS render_logs_user_id_idx ON render_logs (user_id);
CREATE INDEX IF NOT EXISTS render_logs_created_at_idx ON render_logs (created_at);
