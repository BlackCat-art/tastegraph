/**
 * D8 Rate limit 中间件 — 基于用户 plan 分层
 *
 * 规则:
 * - 未登录(anonymous): 3 requests / 60s window
 * - free 用户: 10 requests / 60s
 * - pro 用户: 30 requests / 60s
 *
 * 使用内存 Map(Cloudflare Workers 全局 scope,非持久)
 * 重启/冷启动丢失计数,但足够轻量
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, number> = {
  anonymous: 3,
  free: 10,
  pro: 30,
};

const WINDOW_MS = 60_000; // 60 秒

export function checkRateLimit(
  key: string,
  plan: string | null,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  const limit = LIMITS[plan ?? "anonymous"] ?? LIMITS.anonymous;

  if (!entry || now > entry.resetAt) {
    // 新窗口
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: limit - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

/**
 * 生成 rate limit key
 * - 已登录: `user:{userId}`
 * - 未登录: `ip:{ip}`
 */
export function getRateLimitKey(params: { userId?: string; ip?: string }): string {
  if (params.userId) return `user:${params.userId}`;
  return `ip:${params.ip ?? "unknown"}`;
}