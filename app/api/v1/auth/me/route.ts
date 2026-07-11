import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * GET /api/v1/auth/me
 *
 * AuthChip mount 时调,获取当前用户状态
 *
 * 返回:
 * - 已登录 → 200 { user: { id, email, plan } }
 * - 未登录 → 200 { user: null }(不 401,便于客户端处理)
 */

export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<NextResponse> {
  const user = await getCurrentUser(req);
  return NextResponse.json({ user });
}
