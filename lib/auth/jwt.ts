import { SignJWT, jwtVerify } from "jose";

/**
 * JWT 签发 + 验证(HS256)
 *
 * 设计要点:
 * - 用 jose 而非 jsonwebtoken:jose 原生支持 Web Crypto,Edge runtime 友好
 * - 模块顶层 fail-fast:JWT_SECRET 缺失立即 throw(任何引用 jwt.ts 的 route 启动期崩)
 * - 30 天有效:setExpirationTime("30d")
 * - payload 含 sub (user id) + email + plan,足够 AuthChip 渲染
 *
 * env 来源:
 * - 本地:.dev.vars
 * - 生产:wrangler pages secret put JWT_SECRET
 */
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required (32+ bytes base64). " +
      "Generate with: openssl rand -base64 32",
  );
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionPayload {
  sub: string; // user.id (uuid)
  email: string;
  plan: string; // 'free' | 'pro'
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, plan: payload.plan })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.email !== "string") return null;
    if (typeof payload.plan !== "string") return null;
    return { sub: payload.sub, email: payload.email, plan: payload.plan };
  } catch {
    // 包含过期 / 签名错 / 篡改 / 格式错
    return null;
  }
}
