/**
 * Upstash Redis rate limit 实现
 *
 * 依赖: UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN 环境变量
 * 使用 Upstash REST API(非 SDK),减少 bundle 体积
 *
 * 算法: sliding window counter
 * Key: tgraph:rl:{key}
 * TTL: 60s
 */

import { getRateLimitLimit, RATE_LIMIT_WINDOW_MS } from "./check";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export async function checkRateLimit(
  key: string,
  plan: string | null,
): Promise<RateLimitResult> {
  const limit = getRateLimitLimit(plan);
  const redisKey = `tgraph:rl:${key}`;
  const now = Date.now();

  try {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error("Upstash Redis credentials not configured");
    }

    // INCR + EXPIRE via pipeline
    const incrRes = await fetch(`${url}/incr/${redisKey}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!incrRes.ok) {
      throw new Error(`Upstash INCR failed: ${incrRes.status}`);
    }

    const { result: count } = (await incrRes.json()) as { result: number };

    // 首次设置 TTL
    if (count === 1) {
      await fetch(`${url}/expire/${redisKey}/${Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const remaining = Math.max(0, limit - count);
    const resetAt = now + RATE_LIMIT_WINDOW_MS;

    return {
      allowed: count <= limit,
      remaining,
      resetAt,
    };
  } catch (e) {
    // Upstash 不可用时降级为 allow(不阻塞流量)
    console.error("Upstash rate limit error:", e);
    return { allowed: true, remaining: limit, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }
}