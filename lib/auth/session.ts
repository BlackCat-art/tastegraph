import { verifySessionToken } from "./jwt";
import { parseCookies, SESSION_COOKIE_NAME } from "./cookie";

/**
 * 当前用户 server helper
 *
 * 性能优化:不解 DB,只解 JWT(每次 ~1ms)
 * - AuthChip 每次页面加载都调,DB roundtrip 太慢
 * - plan 字段可能 stale,D9 接入 Stripe webhook 后 DB 才是 source of truth
 * - D9 接 rate limit 时如需 fresh 数据,加 useDb 选项
 *
 * 使用:
 *   const user = await getCurrentUser(req);
 *   if (user) { ... }  // 已登录
 */

export interface CurrentUser {
  id: string;
  email: string;
  plan: string;
  stripeId: string | null;
}

export async function getCurrentUser(req: Request): Promise<CurrentUser | null> {
  const cookies = parseCookies(req.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return { id: payload.sub, email: payload.email, plan: payload.plan, stripeId: payload.stripeId ?? null };
}

/**
 * 获取当前用户(fresh from DB)
 *
 * 与 getCurrentUser 不同:
 * - getCurrentUser: 只解 JWT(快,可能 stale)
 * - getOptionalUser: 从 DB 读 fresh plan + stripeId(用于 rate limit / 订阅状态)
 *
 * 返回 null 表示未登录。
 */
export async function getOptionalUser(req: Request): Promise<CurrentUser | null> {
  const user = await getCurrentUser(req);
  if (!user) return null;

  try {
    const { db } = await import("@/lib/db/client");
    const { users } = await import("@/lib/db/schema");
    const { eq } = await import("drizzle-orm");

    const row = await db.query.users.findFirst({
      where: eq(users.id, user.id),
      columns: { id: true, email: true, plan: true, stripeId: true },
    });

    if (!row) return null;

    return {
      id: row.id,
      email: row.email,
      plan: row.plan,
      stripeId: row.stripeId ?? null,
    };
  } catch {
    // Drizzle 不可用时 fallback 到 JWT 数据
    return user;
  }
}