/**
 * Rate limit 配置(per PRD §5.8.3):
 * - pro: 无限
 * - free: 5 次/天
 * - anonymous: 3 次/天
 *
 * Key: `rl:<bucket>:<id>:<YYYY-MM-DD>` UTC 日期
 * EXPIRE 设到 UTC 当天结束
 */

export const LIMITS: Record<string, number> = {
  pro: Infinity,
  free: 5,
  anonymous: 3,
};

export function getRateLimitLimit(plan: string | null): number {
  return LIMITS[plan ?? 'anonymous'] ?? LIMITS.anonymous;
}

export type LimitResult = {
  allowed: boolean;
  count: number;
  limit: number;
  resetAt: Date;
};

export function getEndOfUtcDay(): Date {
  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);
  return end;
}