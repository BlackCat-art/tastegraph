import { NextResponse } from "next/server";
import { getOptionalUser } from "@/lib/auth/session";

/**
 * GET /api/v1/auth/me
 *
 * AuthChip mount 时调,获取当前用户状态
 *
 * 返回:
 * - 已登录 → 200 { user: { id, email, plan, stripeId } }(从 DB 读,plan/stripeId 实时)
 * - 未登录 → 200 { user: null }(不 401,便于客户端处理)
 *
 * 改 D8:之前用 getCurrentUser(从 JWT 解,plan stale)
 * 现在用 getOptionalUser(JWT 认证身份 + DB 读最新 plan,适合 Stripe webhook 后)
 */

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const user = await getOptionalUser(req);
  return NextResponse.json({ user });
}
