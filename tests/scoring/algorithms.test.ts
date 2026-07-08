import { describe, it, expect } from "vitest";
import {
  computeScores,
  decadeSpreadScore,
  genreBalanceScore,
  mainstreamScore,
  moodSpectrumScore,
  discoveryIndexScore,
} from "@/lib/scoring/algorithms";
import type { ScoredTrack } from "@/lib/types";

function mk(track: Partial<ScoredTrack>): ScoredTrack {
  return { name: "", artist: "", ...track } as ScoredTrack;
}

describe("decadeSpreadScore", () => {
  const YEAR = 2026;
  it("returns 0 for empty", () => {
    expect(decadeSpreadScore([], YEAR)).toBe(0);
  });
  it("returns 0 for single decade", () => {
    const tracks = Array.from({ length: 10 }, (_, i) =>
      mk({ name: `t${i}`, artist: "a", releaseYear: 2020 })
    );
    expect(decadeSpreadScore(tracks, YEAR)).toBe(0);
  });
  it("returns ~100 for uniform across 4 decades", () => {
    const decades = [1960, 1980, 2000, 2020];
    const tracks = decades.flatMap((d) =>
      Array.from({ length: 5 }, (_, i) => mk({ name: `${d}-${i}`, artist: "a", releaseYear: d }))
    );
    const score = decadeSpreadScore(tracks, YEAR);
    expect(score).toBeGreaterThan(80);
  });
  it("returns 50 when too few have releaseYear", () => {
    const tracks: ScoredTrack[] = [
      mk({ name: "t1", artist: "a", releaseYear: 2010 }),
      ...Array.from({ length: 10 }, (_, i) => mk({ name: `n${i}`, artist: "a" })),
    ];
    expect(decadeSpreadScore(tracks, YEAR)).toBe(50);
  });
});

describe("genreBalanceScore", () => {
  it("returns 0 with fewer than 2 distinct genres", () => {
    const tracks = Array.from({ length: 10 }, (_, i) =>
      mk({ name: `t${i}`, artist: "a", primaryGenre: "Indie" })
    );
    expect(genreBalanceScore(tracks)).toBe(0);
  });
  it("returns 100 for uniform across 12 genres", () => {
    const genres = ["Indie","Pop","Hip-Hop","R&B","Electronic","Rock",
                    "Jazz","Classical","Country","Folk","Latin","K-Pop"] as const;
    const tracks = genres.map((g, i) => mk({ name: `t${i}`, artist: "a", primaryGenre: g }));
    expect(genreBalanceScore(tracks)).toBe(100);
  });
});

describe("mainstreamScore", () => {
  it("returns 50 for empty popularity data", () => {
    const tracks = Array.from({ length: 5 }, (_, i) => mk({ name: `t${i}`, artist: "a" }));
    expect(mainstreamScore(tracks)).toBe(50);
  });
  it("computes median (odd n)", () => {
    const tracks = [30, 50, 70, 90, 100].map((p, i) => mk({ name: `t${i}`, artist: "a", popularity: p }));
    expect(mainstreamScore(tracks)).toBe(70);
  });
  it("computes median (even n)", () => {
    const tracks = [30, 50, 70, 90].map((p, i) => mk({ name: `t${i}`, artist: "a", popularity: p }));
    expect(mainstreamScore(tracks)).toBe(60);
  });
});

describe("moodSpectrumScore", () => {
  it("returns 0 for empty", () => {
    expect(moodSpectrumScore([])).toBe(0);
  });
  it("returns 0 for identical moods", () => {
    const tracks = Array.from({ length: 5 }, () =>
      mk({ name: "t", artist: "a", mood: { happy: 50, sad: 50, energetic: 50, chill: 50 } })
    );
    expect(moodSpectrumScore(tracks)).toBe(0);
  });
  it("returns high score for extreme dispersion", () => {
    const tracks = [
      mk({ name: "t1", artist: "a", mood: { happy: 100, sad: 0, energetic: 100, chill: 0 } }),
      mk({ name: "t2", artist: "a", mood: { happy: 0,   sad: 100, energetic: 0,   chill: 100 } }),
    ];
    const score = moodSpectrumScore(tracks);
    expect(score).toBeGreaterThan(50);
  });
});

describe("discoveryIndexScore", () => {
  it("returns 0 for empty", () => {
    expect(discoveryIndexScore([], 2026)).toBe(0);
  });
  it("returns 100 when all tracks are recent", () => {
    const tracks = Array.from({ length: 10 }, (_, i) =>
      mk({ name: `t${i}`, artist: "a", releaseYear: 2025 })
    );
    expect(discoveryIndexScore(tracks, 2026)).toBe(100);
  });
  it("returns 50 when too few have releaseYear", () => {
    const tracks = [mk({ name: "t1", artist: "a", releaseYear: 2025 }),
                    ...Array.from({ length: 10 }, (_, i) => mk({ name: `n${i}`, artist: "a" }))];
    expect(discoveryIndexScore(tracks, 2026)).toBe(50);
  });
});

describe("computeScores (smoke)", () => {
  it("produces 5 integer scores in [0,100]", () => {
    const tracks = Array.from({ length: 20 }, (_, i) => ({
      name: `t${i}`,
      artist: "a",
      primaryGenre: "Indie" as const,
      releaseYear: 2020,
      popularity: 60,
      mood: { happy: 50, sad: 50, energetic: 50, chill: 50 },
    }));
    const s = computeScores(tracks, 2026);
    for (const k of Object.keys(s)) {
      const v = (s as any)[k];
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });
});
