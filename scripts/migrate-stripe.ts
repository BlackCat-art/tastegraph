/**
 * D8 Stripe 迁移脚本 — 使用 Neon serverless Pool(跟 D7 migrate.ts 一致)
 *
 * Usage:
 *   npx tsx scripts/migrate-stripe.ts
 *
 * 注意: users 表已含 stripe_id / plan 字段,D8 只建 stripe_events 表
 */

import { Pool } from "@neondatabase/serverless";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// 自动从 .dev.vars 加载 env(本地 migrate 专用,prod wrangler 注入 secret 不走这路径)
function loadDevVars() {
  const envPath = join(process.cwd(), ".dev.vars");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2];
    }
  }
}

loadDevVars();

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sqlPath = join(process.cwd(), "migrations", "0001_stripe_events.sql");
  const sqlText = readFileSync(sqlPath, "utf-8");

  // 用 Pool 而非 neon():Pool.client.query() 支持多语句,不会被 split 逻辑丢
  // neon() 是 tagged template,只支持参数化 SQL
  const pool = new Pool({ connectionString: DATABASE_URL });
  try {
    await pool.query(sqlText);
    console.log("✓ Migration 0001_stripe_events applied");
    console.log("✓ D8 Stripe tables migrated");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});
