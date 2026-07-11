import { NextResponse } from "next/server";
import { clearSessionCookie, isProd } from "@/lib/auth/cookie";

/**
 * POST /api/v1/auth/logout
 *
 * 任意状态(包括未登录)都允许调用
 * 清 cookie 即可,无需 DB 操作
 *
 * 返回 200 { ok: true } + Set-Cookie 头
 */

export const dynamic = "force-dynamic";

export async function POST(): Promise<NextResponse> {
  return NextResponse.json(
    { ok: true },
    { headers: { "Set-Cookie": clearSessionCookie(isProd()) } },
  );
}
