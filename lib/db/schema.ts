import { pgTable, uuid, text, timestamp, bigserial, integer, boolean, index } from "drizzle-orm/pg-core";

/**
 * Users table — D7 Magic Link 认证主表
 * - email: 存原始大小写,查询用 `lower(email)` 比较(unique index)
 * - magic_token_hash: 临时存 magic link token 的 SHA256 哈希,verify 后清 NULL
 * - magic_expires_at: magic token 过期时间(now + 15min),verify 后清 NULL
 * - plan: free / pro(由 Stripe webhook 更新,D7 阶段固定 'free')
 * - stripe_id, pro_expires_at: D9 Stripe 接入用,本轮留 NULL
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  stripeId: text("stripe_id"),
  plan: text("plan").notNull().default("free"),
  proExpiresAt: timestamp("pro_expires_at", { withTimezone: true }),
  magicTokenHash: text("magic_token_hash"),
  magicExpiresAt: timestamp("magic_expires_at", { withTimezone: true }),
});

/**
 * Render logs — D7 占位 schema,D9 写日志用
 * - user_id: 可空(未登录用户的 render 也记录)
 * - template / aspect_ratio: 渲染时选用的模板和比例
 * - duration_ms: 渲染耗时(html-to-image)
 * - success / error_code: 失败时记录 ApiError code
 */
export const renderLogs = pgTable(
  "render_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    template: text("template"),
    aspectRatio: text("aspect_ratio"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    durationMs: integer("duration_ms"),
    success: boolean("success"),
    errorCode: text("error_code"),
  },
  (t) => ({
    userIdIdx: index("render_logs_user_id_idx").on(t.userId),
    createdAtIdx: index("render_logs_created_at_idx").on(t.createdAt),
  }),
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type RenderLog = typeof renderLogs.$inferSelect;
export type NewRenderLog = typeof renderLogs.$inferInsert;
