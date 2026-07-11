import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon Postgres HTTP client + Drizzle wrapper
 *
 * 设计要点:
 * - 懒加载:env 校验延后到首次 query,避免 build 时顶层 throw
 *   (next build 会静态评估模块顶层代码,DATABASE_URL 在 build env 不存在 → 崩溃)
 * - 懒连接:neon() 不立即建连,首次 query 时才走 HTTP(适合 serverless)
 * - CF Workers 兼容:@neondatabase/serverless 是 fetch-based,不依赖 TCP
 * - Drizzle Neon HTTP driver 在 OpenNext 1.20.1 跑通
 *
 * env 来源:
 * - 本地:`~/dev/tastegraph/.dev.vars`(gitignored)
 * - 生产:`wrangler secret put DATABASE_URL`
 */

let _db: NeonHttpDatabase<typeof schema> | null = null;

function getDb(): NeonHttpDatabase<typeof schema> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is required. " +
        "Get one at https://console.neon.tech (free tier 0.5GB).",
    );
  }
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Proxy 模式:把 db.execute(...) 调用转发到 getDb().execute(...)
// 调用方代码不需要改,签名兼容 NeonHttpDatabase
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, prop) {
    const realDb = getDb();
    const value = (realDb as unknown as Record<string | symbol, unknown>)[prop as string];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(realDb) : value;
  },
});

export { schema };
