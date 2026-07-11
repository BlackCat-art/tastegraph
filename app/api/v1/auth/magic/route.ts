import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { generateMagicToken, hashMagicToken } from "@/lib/auth/magic-link";
import { sendMagicLinkEmail } from "@/lib/email/resend";

/**
 * POST /api/v1/auth/magic
 *
 * Body: { email: string }
 *
 * Flow:
 * 1. 校验 email 格式
 * 2. 生成 magic token(32 字节) + SHA256 哈希 + 15 分钟 expires
 * 3. 查 users 表(走 lower(email) 索引)
 * 4. 存在 → UPDATE magic token;不存在 → INSERT
 * 5. Resend 发邮件(失败 dev mode 降级 console.log,prod 抛 500)
 * 6. 200 { ok: true, devLink?: ... }
 *
 * Rate limit:本轮不做(留 D9);真实场景需要 IP-based throttle 防刷邮件
 */

export const dynamic = "force-dynamic";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. 解析 + 校验 body
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_BODY", message: "Invalid JSON body", retryable: false },
      },
      { status: 400 },
    );
  }

  const email = body.email?.trim();
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INVALID_EMAIL", message: "Invalid email format", retryable: false },
      },
      { status: 400 },
    );
  }

  const lowerEmail = email.toLowerCase();
  const token = generateMagicToken();
  const tokenHash = await hashMagicToken(token);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

  // 2. 查用户是否存在(走 lower email 索引)
  const existing = await db.execute(
    sql`SELECT id FROM users WHERE lower(email) = ${lowerEmail} LIMIT 1`,
  );
  const existingRows = existing.rows as Array<{ id: string }>;

  if (existingRows.length > 0) {
    // 3a. 老用户:更新 magic token
    await db.execute(
      sql`UPDATE users SET magic_token_hash = ${tokenHash}, magic_expires_at = ${expiresAt.toISOString()} WHERE id = ${existingRows[0].id}`,
    );
  } else {
    // 3b. 新用户:插入
    await db.execute(
      sql`INSERT INTO users (email, magic_token_hash, magic_expires_at) VALUES (${lowerEmail}, ${tokenHash}, ${expiresAt.toISOString()})`,
    );
  }

  // 4. 构造 magic link + 发邮件
  // token 是 base64url 字符(43 字符 [A-Za-z0-9_-]),URL 安全无需 encode
  const link = `${req.nextUrl.origin}/api/v1/auth/verify?token=${token}`;
  const result = await sendMagicLinkEmail(lowerEmail, link);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "EMAIL_FAILED",
          message: `Failed to send email: ${result.error ?? "unknown"}`,
          retryable: true,
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, devLink: result.devLink });
}
