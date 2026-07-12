/**
 * 分层 rate limit 配置(纯函数,无副作用)
 *
 * 规则:
 * - anonymous: 3 requests / 60s
 * - free:      10 requests / 60s
 * - pro:       30 requests / 60s
 */

export const RATE_LIMIT_WINDOW_MS = 60_000;

export const LIMITS: Record<string, number> = {
  anonymous: 3,
  free: 10,
  pro: 30,
};

export function getRateLimitKey(params: { userId?: string; ip?: string }): string {
  if (params.userId) return `user:${params.userId}`;
  return `ip:${params.ip ?? "unknown"}`;
}

export function getRateLimitLimit(plan: string | null): number {
  return LIMITS[plan ?? "anonymous"] ?? LIMITS.anonymous;
}