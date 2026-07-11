import { SignJWT, jwtVerify } from "jose";

/**
 * JWT 签发 + 验证(HS256)
 *
 * 设计要点:
 * - 用 jose 而非 jsonwebtoken:jose 原生支持 Web Crypto,Edge runtime 友好
 * - 懒加载 secret:JWT_SECRET 校验延后到函数调用,避免 build 时顶层 throw
 *   (next build 会静态评估模块顶层代码,顶层 throw 会让 build 崩)
 * - 30 天有效:setExpirationTime("30d")
 * - payload 含 sub (user id) + email + plan,足够 AuthChip 渲染
 *
 * env 来源:
 * - 本地:.dev.vars
 * - 生产:wrangler secret put JWT_SECRET
 */

export interface SessionPayload {
  sub: string; // user.id (uuid)
  email: string;
  plan: string; // 'free' | 'pro'
}

function getSecret(): Uint8Array {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET environment variable is required (32+ bytes base64). " +
        "Generate with: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(process.env.JWT_SECRET);
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, plan: payload.plan })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

/**
 * 签 5 分钟短 token(用于 magic link 2-step confirm 流程的 verify cookie)
 * 同样的 secret + payload 结构,只是 exp 短
 */
export async function signVerifyToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ email: payload.email, plan: payload.plan })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.sub !== "string") return null;
    if (typeof payload.email !== "string") return null;
    if (typeof payload.plan !== "string") return null;
    return { sub: payload.sub, email: payload.email, plan: payload.plan };
  } catch {
    // 包含过期 / 签名错 / 篡改 / 格式错
    return null;
  }
}
