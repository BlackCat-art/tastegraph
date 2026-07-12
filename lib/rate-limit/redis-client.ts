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