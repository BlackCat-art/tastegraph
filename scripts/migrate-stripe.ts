/**
 * D8 Stripe 迁移脚本 — 使用 Neon serverless Pool(跟 D7 migrate.ts 一致)
 *
 * Usage:
 *   npx tsx scripts/migrate-stripe.ts
 *
 * 注意: users 表已含 stripe_id / plan 字段,D8 只建 stripe_events 表
 */

import { neon } from "@neondatabase/serverless";
import * as fs from "node:fs";
import * as path from "node:path";

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const sql = neon(DATABASE_URL);

  const sqlPath = path.join(import.meta.dirname ?? __dirname, "..", "migrations", "0001_stripe_events.sql");
  const raw = fs.readFileSync(sqlPath, "utf-8");
  const statements = raw
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    console.log("  →", stmt.slice(0, 80).replace(/\s+/g, " "));
    await sql.unsafe(stmt);
  }

  console.log("✅ D8 Stripe tables migrated");
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});