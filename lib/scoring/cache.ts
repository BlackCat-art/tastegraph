// In-process LRU cache keyed by `${kind}:${trackKey}`.
// TTL: 24h for genre, 24h for mood, 7d for summary (slower-changing).
// Max size: 10,000 entries; oldest evicted by insertion order on overflow.
// This is intentionally simple — Day 7 replaces it with Upstash Redis.

export type CacheKind = "genre" | "mood" | "summary";

const TTL_MS: Record<CacheKind, number> = {
  genre: 24 * 60 * 60 * 1000,
  mood: 24 * 60 * 60 * 1000,
  summary: 7 * 24 * 60 * 60 * 1000,
};
const MAX_ENTRIES = 10_000;

interface Entry<T> {
  value: T;
  expiresAt: number;
}
const store = new Map<string, Entry<unknown>>();

function trackKey(t: { name: string; artist: string }): string {
  return `${t.name.trim().toLowerCase()}|${t.artist.trim().toLowerCase()}`;
}

export function cacheGet<T>(kind: CacheKind, t: { name: string; artist: string }): T | null {
  const k = `${kind}:${trackKey(t)}`;
  const e = store.get(k);
  if (!e) return null;
  if (Date.now() > e.expiresAt) {
    store.delete(k);
    return null;
  }
  // LRU touch: re-insert to move to end.
  store.delete(k);
  store.set(k, e);
  return e.value as T;
}

export function cacheSet<T>(kind: CacheKind, t: { name: string; artist: string }, value: T): void {
  const k = `${kind}:${trackKey(t)}`;
  if (store.size >= MAX_ENTRIES) {
    // Evict oldest by Map insertion order (first key).
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(k, { value, expiresAt: Date.now() + TTL_MS[kind] });
}

/** Test-only: clear all cache entries. Do NOT export from index. */
export function _cacheClearForTests(): void {
  store.clear();
}

/** Computed aggregate cache stats for the debug block. */
export function cacheStats(): { size: number; max: number } {
  return { size: store.size, max: MAX_ENTRIES };
}
