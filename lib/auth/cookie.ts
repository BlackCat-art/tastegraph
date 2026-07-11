/**
 * Cookie helpers
 *
 * 为什么不用 next/headers 的 cookies():
 * - next/headers 绑定当前 request context,只能在 server component / route handler 顶部用
 * - getCurrentUser(req: Request) 接受任意 Request(含未来 middleware)
 * - 手写解析更灵活
 *
 * SameSite=Lax 而非 Strict:
 * - Magic Link 邮件链接是 GET,需要 top-level navigation 跳回 /create 并带 cookie
 * - Strict 会拦截这种跳转
 *
 * Secure 仅 prod:
 * - 本地 localhost 是 http,Secure 会被浏览器拒绝,cookie 写不进去
 */

export const SESSION_COOKIE_NAME = "tastegraph_session";

export function isProd(): boolean {
  return process.env.NODE_ENV === "production";
}

export function serializeSessionCookie(token: string, prod: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=2592000", // 30 days
  ];
  if (prod) parts.push("Secure");
  return parts.join("; ");
}

export function clearSessionCookie(prod: boolean): string {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    "Max-Age=0",
  ];
  if (prod) parts.push("Secure");
  return parts.join("; ");
}

export function parseCookies(header: string | null | undefined): Record<string, string> {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = value;
  }
  return out;
}
