import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

/**
 * Neon Postgres HTTP client + Drizzle wrapper
 *
 * 设计要点:
 * - 模块顶层 fail-fast:env 缺失立即 throw,启动期暴露问题
 * - 懒连接:neon() 不立即建连,首次 query 时才走 HTTP(适合 serverless)
 * - CF Workers 兼容:@neondatabase/serverless 是 fetch-based,不依赖 TCP
 * - Drizzle Neon HTTP driver 在 OpenNext 1.20.1 跑通
 *
 * env 来源:
 * - 本地:`~/dev/tastegraph/.dev.vars`(gitignored)
 * - 生产:`wrangler pages secret put DATABASE_URL`
 */
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "Get one at https://console.neon.tech (free tier 0.5GB).",
  );
}

const sql = neon(process.env.DATABASE_URL);

export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });
export { schema };
