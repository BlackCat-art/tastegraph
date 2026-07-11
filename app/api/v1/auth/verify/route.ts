import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { hashMagicToken, isExpired } from "@/lib/auth/magic-link";
import { signSessionToken } from "@/lib/auth/jwt";
import { serializeSessionCookie, isProd } from "@/lib/auth/cookie";

/**
 * GET /api/v1/auth/verify?token=...
 *
 * Flow:
 * 1. 拿 query.token,缺失 → 302 /signin?error=missing_token
 * 2. 哈希 token,查 users 表(magic_token_hash 唯一命中)
 * 3. 没找到 → 302 /signin?error=invalid_token
 * 4. 找到但过期 → 302 /signin?error=expired_token
 * 5. 通过 → 清 magic token + 签 JWT + set cookie + 302 /create
 *
 * 单次使用:UPDATE 清 magic_token_hash,二次访问变 invalid_token
 *
 * 安全:
 * - token 是不可猜测的(32 字节随机),CSRF 风险小
 * - HTTPS-only JWT cookie 携带签名 session
 * - 失败不泄漏 user 存在性(都返 invalid_token)
 */

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/signin?error=missing_token", req.url));
  }

  const tokenHash = await hashMagicToken(token);

  const result = await db.execute(
    sql`SELECT id, email, plan, magic_expires_at FROM users WHERE magic_token_hash = ${tokenHash} LIMIT 1`,
  );
  const rows = result.rows as Array<{
    id: string;
    email: string;
    plan: string;
    magic_expires_at: string;
  }>;

  const user = rows[0];
  if (!user) {
    return NextResponse.redirect(new URL("/signin?error=invalid_token", req.url));
  }

  if (isExpired(user.magic_expires_at)) {
    return NextResponse.redirect(new URL("/signin?error=expired_token", req.url));
  }

  // 通过校验:清 magic token + 签 JWT + set cookie
  await db.execute(
    sql`UPDATE users SET magic_token_hash = NULL, magic_expires_at = NULL WHERE id = ${user.id}`,
  );

  const jwt = await signSessionToken({ sub: user.id, email: user.email, plan: user.plan });
  const cookie = serializeSessionCookie(jwt, isProd());

  const redirectResponse = NextResponse.redirect(new URL("/create", req.url));
  redirectResponse.headers.set("Set-Cookie", cookie);
  return redirectResponse;
}
