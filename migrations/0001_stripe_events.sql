-- D8 Stripe: stripe_events 表(幂等去重, id = Stripe event.id)
CREATE TABLE IF NOT EXISTS stripe_events (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload     JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS stripe_events_type_idx ON stripe_events(type);
CREATE INDEX IF NOT EXISTS stripe_events_created_at_idx ON stripe_events(created_at);