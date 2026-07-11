/**
 * Database migration runner
 *
 * 用法:`npm run migrate`(需 DATABASE_URL 在 env)
 * - 读 migrations/0000_init.sql
 * - 用 Pool(从 @neondatabase/serverless)逐条 query
 * - 幂等:CREATE TABLE IF NOT EXISTS + CREATE INDEX IF NOT EXISTS
 *
 * 为什么用 Pool 而非 neon():
 * - neon() 是 tagged template literal function,只支持参数化 SQL
 * - Pool 暴露标准 pg 兼容的 .query(sqlText),可执行任意 SQL(含多语句)
 * - migrate.ts 在 Node 跑(非 CF Workers),Pool 兼容
 *
 * 简化:本轮只 1 个 migration 文件,够用;D8+ 表变多考虑 drizzle-kit
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Pool } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "Get one at https://console.neon.tech",
  );
}

async function main() {
  const migrationPath = join(process.cwd(), "migrations", "0000_init.sql");
  const sqlText = readFileSync(migrationPath, "utf-8");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query(sqlText);
    console.log("[migrate] applied: 0000_init.sql");
    console.log("[migrate] done.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("[migrate] failed:", e);
  process.exit(1);
});
