import { redisIncr, redisExpire } from './redis-client';
import { getRateLimitLimit, getEndOfUtcDay, type LimitResult } from './check';

export async function checkRateLimit(params: {
  identifier: string;
  bucket: 'parse' | 'score';
  plan: string | null;
}): Promise<LimitResult> {
  const limit = getRateLimitLimit(params.plan);

  if (limit === Infinity) {
    return { allowed: true, count: 0, limit: Infinity, resetAt: getEndOfUtcDay() };
  }

  const today = new Date().toISOString().slice(0, 10);
  const key = `rl:${params.bucket}:${params.identifier}:${today}`;

  const count = await redisIncr(key);

  if (count === 1) {
    const secondsUntilReset = Math.ceil((getEndOfUtcDay().getTime() - Date.now()) / 1000);
    await redisExpire(key, secondsUntilReset);
  }

  return {
    allowed: count <= limit,
    count,
    limit,
    resetAt: getEndOfUtcDay(),
  };
}

export function getIdentifier(req: Request, userId: string | null): { id: string; scope: 'ip' | 'user' } {
  if (userId) return { id: userId, scope: 'user' };

  const ip =
    req.headers.get('CF-Connecting-IP') ??
    req.headers.get('X-Forwarded-For')?.split(',')[0].trim() ??
    'unknown';
  return { id: ip, scope: 'ip' };
}