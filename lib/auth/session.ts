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
}

export async function getCurrentUser(req: Request): Promise<CurrentUser | null> {
  const cookies = parseCookies(req.headers.get("cookie"));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload) return null;
  return { id: payload.sub, email: payload.email, plan: payload.plan };
}
