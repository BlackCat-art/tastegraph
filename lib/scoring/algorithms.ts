// Pure, deterministic, side-effect-free score functions.
// Algorithms are pinned in PRD-day03 §1.4 and unit-tested in Task 8.

import type { Track, Scores, ScoredTrack, MoodVector } from "../types";

type AlgoTrack = ScoredTrack;

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function euclidean(a: MoodVector, b: MoodVector): number {
  return Math.sqrt(
    (a.happy - b.happy) ** 2 +
    (a.sad - b.sad) ** 2 +
    (a.energetic - b.energetic) ** 2 +
    (a.chill - b.chill) ** 2
  );
}

function meanMood(vectors: MoodVector[]): MoodVector {
  if (vectors.length === 0) return { happy: 0, sad: 0, energetic: 0, chill: 0 };
  const sum = vectors.reduce(
    (acc, v) => ({
      happy: acc.happy + v.happy,
      sad: acc.sad + v.sad,
      energetic: acc.energetic + v.energetic,
      chill: acc.chill + v.chill,
    }),
    { happy: 0, sad: 0, energetic: 0, chill: 0 }
  );
  const n = vectors.length;
  return {
    happy: sum.happy / n,
    sad: sum.sad / n,
    energetic: sum.energetic / n,
    chill: sum.chill / n,
  };
}

/** §1.4.1 — Decade spread. */
export function decadeSpreadScore(tracks: AlgoTrack[], currentYear: number): number {
  const with_year = tracks.filter((t) => typeof t.releaseYear === "number");
  if (with_year.length === 0) return 0;
  if (with_year.length < Math.ceil(tracks.length * 0.3)) return 50;

  const buckets = new Map<number, number>();
  for (const t of with_year) {
    const decade = Math.floor((t.releaseYear as number) / 10) * 10;
    buckets.set(decade, (buckets.get(decade) ?? 0) + 1);
  }
  const k = buckets.size;
  if (k === 0) return 0;

  const total = with_year.length;
  const entries = Array.from(buckets.entries());
  const mean = entries.reduce((s, [decade, c]) => s + decade * (c / total), 0);
  const sigma = Math.sqrt(
    entries.reduce((s, [decade, c]) => s + (decade - mean) ** 2 * (c / total), 0)
  );

  // σmax for uniform distribution across `k` consecutive buckets centered on (k-1)/2.
  const indices = Array.from({ length: k }, (_, i) => i);
  const uMean = (k - 1) / 2;
  const uSigma = k === 1 ? 0 : Math.sqrt(
    indices.reduce((s, i) => s + (i - uMean) ** 2, 0) / k
  );
  if (uSigma === 0 || sigma === 0) return 0;

  return clamp(Math.round((sigma / uSigma) * 100), 0, 100);
}

/** §1.4.2 — Genre balance (Shannon entropy over primary+weighted-secondary). */
export function genreBalanceScore(tracks: AlgoTrack[]): number {
  const counts = new Map<string, number>();
  for (const t of tracks) {
    if (t.primaryGenre) counts.set(t.primaryGenre, (counts.get(t.primaryGenre) ?? 0) + 1);
    if (t.secondaryGenre) counts.set(t.secondaryGenre, (counts.get(t.secondaryGenre) ?? 0) + 0.5);
  }
  if (counts.size < 2) return 0;

  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  let H = 0;
  for (const c of counts.values()) {
    const p = c / total;
    if (p > 0) H -= p * Math.log(p);
  }
  const Hmax = Math.log(Math.min(counts.size, 12));
  if (Hmax === 0) return 0;

  return clamp(Math.round((H / Hmax) * 100), 0, 100);
}

/** §1.4.3 — Mainstream score (median popularity). */
export function mainstreamScore(track_list: AlgoTrack[] = [] as AlgoTrack[]): number {
  // Parameter kept as `track_list` to mirror the other signatures; the argument
  // is named `tracks` at call sites to avoid shadowing the imported type.
  const pops = track_list
    .map((t) => t.popularity)
    .filter((p): p is number => typeof p === "number")
    .sort((a, b) => a - b);
  if (pops.length === 0) return 50;
  const mid = Math.floor(pops.length / 2);
  const median =
    pops.length % 2 === 1
      ? pops[mid]
      : (pops[mid - 1] + pops[mid]) / 2;
  return clamp(Math.round(median), 0, 100);
}

/** §1.4.4 — Mood spectrum (4-D Euclidean spread). */
export function moodSpectrumScore(tracks: AlgoTrack[]): number {
  const vectors = tracks
    .map((t) => t.mood)
    .filter((m): m is MoodVector => !!m);
  if (vectors.length === 0) return 0;

  const mean = meanMood(vectors);
  const dists = vectors.map((v) => euclidean(v, mean));
  const avgDist = dists.reduce((a, b) => a + b, 0) / dists.length;
  const maxDist = 100; // theoretical max distance from a point to the centroid in 4-D [0,100]^4 cube
  return clamp(Math.round((avgDist / maxDist) * 100), 0, 100);
}

/** §1.4.5 — Discovery index (recent-year share). */
export function discoveryIndexScore(tracks: AlgoTrack[], currentYear: number): number {
  const recentYear = currentYear - 1;
  const with_year = tracks.filter((t) => typeof t.releaseYear === "number");
  if (with_year.length === 0) return 0;
  if (with_year.length < Math.ceil(tracks.length * 0.3)) return 50;
  const recent = with_year.filter((t) => (t.releaseYear as number) >= recentYear).length;
  return clamp(Math.round((recent / with_year.length) * 100), 0, 100);
}

/** Convenience: compute all 5 dimensions in one call. */
export function computeScores(tracks: AlgoTrack[], currentYear = new Date().getFullYear()): Scores {
  return {
    decadeSpread: decadeSpreadScore(tracks, currentYear),
    genreBalance: genreBalanceScore(tracks),
    mainstreamScore: mainstreamScore(tracks),
    moodSpectrum: moodSpectrumScore(tracks),
    discoveryIndex: discoveryIndexScore(tracks, currentYear),
  };
}
