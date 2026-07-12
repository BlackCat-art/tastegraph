import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { hashMagicToken, isExpired } from "@/lib/auth/magic-link";
import { signVerifyToken } from "@/lib/auth/jwt";
import { isProd } from "@/lib/auth/cookie";

/**
 * GET /api/v1/auth/verify?token=***
 *
 * 2-step magic link flow(防邮件客户端预取):
 *
 * Step 1: 本端点
 *   - 验证 magic_token_hash 命中 + 未过期
 *   - 签 5 分钟 verify JWT,set cookie `tastegraph_verify`
 *   - 302 redirect /auth/confirm
 *   - **不**清 magic_token_hash(留给 confirm endpoint 清)
 *
 * Step 2: POST /api/v1/auth/confirm
 *   - 读 verify cookie
 *   - 清 magic_token_hash
 *   - 签 session JWT,set cookie `tastegraph_session`
 *   - 302 redirect /create
 *
 * 为什么这样设计:
 * - 邮件客户端(163邮件大师 / Gmail / Outlook)预取邮件里的链接扫描恶意内容
 * - 单步 verify 会让预取消耗 token,真人点击就 invalid_token
 * - 2-step:预取只跑到 confirm 页面(无害,token 没被清),真人点 Confirm 才真消费
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/signin?error=missing_token", req.url));
  }

  const tokenHash = await hashMagicToken(token);

  const result = await db.execute(
    sql`SELECT id, email, plan, stripe_id, magic_expires_at FROM users WHERE magic_token_hash = ${tokenHash} LIMIT 1`,
  );
  const rows = result.rows as Array<{
    id: string;
    email: string;
    plan: string;
    stripe_id: string | null;
    magic_expires_at: string;
  }>;

  const user = rows[0];
  if (!user) {
    return NextResponse.redirect(new URL("/signin?error=invalid_token", req.url));
  }

  if (isExpired(user.magic_expires_at)) {
    return NextResponse.redirect(new URL("/signin?error=expired_token", req.url));
  }

  // 通过校验:签 verify JWT + set cookie + redirect /auth/confirm
  // 注意:不立即清 magic_token_hash(留给 confirm 步骤)
  const verifyJwt = await signVerifyToken({
    sub: user.id,
    email: user.email,
    plan: user.plan,
    stripeId: (rows[0] as any).stripe_id ?? null,
  });
  const verifyCookie =
    `tastegraph_verify=${verifyJwt}; HttpOnly; SameSite=Lax; Path=/; Max-Age=300` +
    (isProd() ? "; Secure" : "");

  const redirectResponse = NextResponse.redirect(new URL("/auth/confirm", req.url));
  redirectResponse.headers.set("Set-Cookie", verifyCookie);
  return redirectResponse;
}