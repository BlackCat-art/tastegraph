// D10 分享页 Upstash KV 存储
// 复用 D9 rate-limit 的 redis-client 工具(fetch REST API,不依赖 SDK)
// TTL 90 天(PRD §5.9.2)

import { redisGet, redisSet } from "@/lib/rate-limit/redis-client";
import type { SharedPosterData } from "./types";

const KV_PREFIX = "share:";
const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 天

export async function saveShare(id: string, data: SharedPosterData): Promise<void> {
  const key = KV_PREFIX + id;
  const value = JSON.stringify(data);
  // redisSet 走 EX seconds(我们的 client 是 2 参 EX 模式)
  await redisSet(key, value, TTL_SECONDS);
}

export async function getShare(id: string): Promise<SharedPosterData | null> {
  const key = KV_PREFIX + id;
  const value = await redisGet(key);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SharedPosterData;
    if (parsed.v !== 1) return null; // schema 不匹配
    return parsed;
  } catch {
    return null;
  }
}
