-- D8 Stripe: stripe_events 表(幂等去重)
CREATE TABLE IF NOT EXISTS stripe_events (
  id BIGSERIAL PRIMARY KEY,
  stripe_event_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stripe_events_event_id_idx ON stripe_events (stripe_event_id);