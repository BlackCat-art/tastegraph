function getUpstashUrl(): string {
  const u = process.env.UPSTASH_REDIS_REST_URL;
  if (!u) throw new Error('UPSTASH_REDIS_REST_URL not set');
  return u;
}

function getUpstashToken(): string {
  const t = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!t) throw new Error('UPSTASH_REDIS_REST_TOKEN not set');
  return t;
}

export async function redisIncr(key: string): Promise<number> {
  const res = await fetch(`${getUpstashUrl()}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${getUpstashToken()}` },
  });
  if (!res.ok) throw new Error(`Upstash INCR failed: ${res.status}`);
  const data = (await res.json()) as { result: number };
  return data.result;
}

export async function redisExpire(key: string, seconds: number): Promise<void> {
  await fetch(`${getUpstashUrl()}/expire/${encodeURIComponent(key)}/${seconds}`, {
    headers: { Authorization: `Bearer ${getUpstashToken()}` },
  });
}

/**
 * D10 分享页 KV 存储用 — D9 rate limit 只用 INCR/EXPIRE
 * 返回 null 表示 key 不存在
 */
export async function redisGet(key: string): Promise<string | null> {
  const res = await fetch(`${getUpstashUrl()}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${getUpstashToken()}` },
  });
  if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);
  const data = (await res.json()) as { result: string | null };
  return data.result;
}

/**
 * D10 分享页 KV 存储用 — 单一 key + value + EX(seconds)
 * Upstash REST: /set/{key}/{value}?EX=seconds
 */
export async function redisSet(key: string, value: string, expireSeconds: number): Promise<void> {
  const res = await fetch(
    `${getUpstashUrl()}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${expireSeconds}`,
    { headers: { Authorization: `Bearer ${getUpstashToken()}` } },
  );
  if (!res.ok) throw new Error(`Upstash SET failed: ${res.status}`);
}