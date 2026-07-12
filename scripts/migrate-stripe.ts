/// <reference types="@cloudflare/workers-types" />
/**
 * D8 Stripe D1 迁移脚本
 *
 * Usage:
 *   npx wrangler d1 execute tastegraph-db --file=scripts/migrate-stripe.ts
 *   或
 *   npx tsx scripts/migrate-stripe.ts
 *
 * 注意: users 表已含 stripe_id / plan 字段,D8 只追加 stripe_events + stripe_subscriptions 两张新表
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

async function main() {
  const { env } = await getCloudflareContext();
  const db = (env as any).DB;

  if (!db) {
    throw new Error("D1 binding DB not found in Cloudflare context");
  }

  // 1. 建 stripe_events 表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stripe_event_id TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS stripe_events_event_id_idx ON stripe_events (stripe_event_id)
  `);

  // 2. 建 stripe_subscriptions 表
  await db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      stripe_subscription_id TEXT NOT NULL,
      stripe_customer_id TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      current_period_end TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS stripe_subscriptions_user_id_idx ON stripe_subscriptions (user_id)
  `);
  await db.exec(`
    CREATE INDEX IF NOT EXISTS stripe_subscriptions_sub_id_idx ON stripe_subscriptions (stripe_subscription_id)
  `);

  console.log("✅ D8 Stripe tables migrated: stripe_events + stripe_subscriptions");
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
