/**
 * Magic Link token 生成 + 哈希 + 过期校验
 *
 * 安全性:
 * - crypto.getRandomValues 用系统熵源(CF Workers / Node 18+),非伪随机
 * - SHA256 哈希存 DB,DB 泄露不会暴露明文 token
 * - 32 字节熵 = 2^256,碰撞概率宇宙级
 *
 * Token 生命周期:
 * 1. POST /api/v1/auth/magic:generateMagicToken() → base64url
 * 2. hashMagicToken(token) → 存 users.magic_token_hash
 * 3. 邮件发 token 明文(只有用户邮箱能收到)
 * 4. GET /api/v1/auth/verify?token=...:hashMagicToken(收到) → 查 DB → 命中即用
 * 5. 验证后清 magic_token_hash + magic_expires_at(单次使用)
 */

export function generateMagicToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // base64url:base64 的 +/= → -_,去掉 padding
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function hashMagicToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isExpired(expiresAt: Date | string | null | undefined): boolean {
  if (!expiresAt) return true;
  const t = typeof expiresAt === "string" ? new Date(expiresAt).getTime() : expiresAt.getTime();
  return t < Date.now();
}
