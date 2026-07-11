import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { signSessionToken } from "@/lib/auth/jwt";
import { serializeSessionCookie, isProd } from "@/lib/auth/cookie";
import { parseCookies } from "@/lib/auth/cookie";

/**
 * POST /api/v1/auth/confirm
 *
 * 2-step magic link flow:防邮件客户端预取消耗 token
 *
 * Step 1: GET /api/v1/auth/verify?token=X
 *   - 验证 magic_token_hash 命中
 *   - 签 verify JWT (5 分钟) → set cookie (scoped /auth/confirm)
 *   - redirect /auth/confirm
 *   - **不**清 magic_token_hash(留待 confirm 时清)
 *
 * Step 2: POST /api/v1/auth/confirm (本端点)
 *   - 读 verify JWT cookie
 *   - 清 magic_token_hash(单次使用)
 *   - 签 session JWT → set cookie
 *   - redirect /create
 *
 * 为什么这样设计:
 * - 邮件客户端(Gmail / 163邮件大师 / Outlook)预取邮件里的链接扫描
 * - 单步 verify 会让预取消耗 token,真人点击就 invalid_token
 * - 2-step:预取只跑到 confirm 页面(无害),真人点 Confirm 才真发 session
 */

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. 读 verify cookie
  const cookies = parseCookies(req.headers.get("cookie"));
  const verifyToken = cookies["tastegraph_verify"];
  if (!verifyToken) {
    return NextResponse.redirect(new URL("/signin?error=missing_verify", req.url));
  }

  // 2. verify JWT 是临时 5 分钟 token,我们用同样的 jose verify
  // 但 type=magic-verify(简化:实际是相同 secret 签,只是 expiry 短)
  const { verifySessionToken } = await import("@/lib/auth/jwt");
  const verifyPayload = await verifySessionToken(verifyToken);
  if (!verifyPayload) {
    return NextResponse.redirect(new URL("/signin?error=invalid_verify", req.url));
  }

  const userId = verifyPayload.sub;

  // 3. 清 magic_token_hash(单次使用)
  await db.execute(
    sql`UPDATE users SET magic_token_hash = NULL, magic_expires_at = NULL WHERE id = ${userId} AND magic_token_hash IS NOT NULL`,
  );

  // 4. 签 session JWT + set cookie
  const sessionJwt = await signSessionToken({
    sub: userId,
    email: verifyPayload.email,
    plan: verifyPayload.plan,
  });
  const sessionCookie = serializeSessionCookie(sessionJwt, isProd());

  // 5. 清 verify cookie(已完成使命)
  const clearVerifyCookie = "tastegraph_verify=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0" +
    (isProd() ? "; Secure" : "");

  const redirectResponse = NextResponse.redirect(new URL("/create", req.url));
  redirectResponse.headers.append("Set-Cookie", sessionCookie);
  redirectResponse.headers.append("Set-Cookie", clearVerifyCookie);
  return redirectResponse;
}