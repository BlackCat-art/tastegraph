// Orchestrator: Playlist -> ScoreResult
// Pipeline:
//   1) Extend tracks with popularity/releaseYear (Day 2 best-effort).
//   2) LLM (or fallback) → primaryGenre + secondaryGenre per track.
//   3) LLM (or fallback) → mood per track.
//   4) algorithms.computeScores(tracks, currentYear).
//   5) labels.matchLabel({ tracks, scores }).
//   6) LLM → summary text (or template fallback).
//   7) Return ScoreResult.
//
// Each LLM call is wrapped in cacheGet/cacheSet. Cache hits short-circuit the call.

import type { ScoredTrack, Track, Scores, ScoreResult } from "../types";
import { callLLM, type ProviderUsed } from "./llm";
import {
  buildGenrePrompt,
  buildMoodPrompt,
  buildSummaryPrompt,
  type GenreLLMOutput,
  type MoodLLMOutput,
  type SummaryLLMOutput,
} from "./prompts";
import { cacheGet, cacheSet, cacheStats } from "./cache";
import {
  heuristicGenreForBatch,
  heuristicMoodForBatch,
} from "./fallback";
import { computeScores } from "./algorithms";
import { matchLabel } from "./labels";

export interface ScoreRequest {
  tracks: Track[];
  playlistTitle?: string;
  playlistId?: string;
}

export interface ScoreOutcome {
  ok: boolean;
  result?: ScoreResult;
  error?: { code: string; message: string; retryable: boolean };
}

export async function scorePlaylist(
  req: ScoreRequest,
  env: Record<string, unknown>
): Promise<ScoreOutcome> {
  try {
    // 0. Validate.
    if (!Array.isArray(req.tracks) || req.tracks.length < 5) {
      return { ok: false, error: { code: "TOO_SHORT", message: "Need at least 5 tracks.", retryable: false } };
    }
    if (req.tracks.length > 200) {
      return { ok: false, error: { code: "TOO_MANY", message: "Cap at 200 tracks.", retryable: false } };
    }

    // 1. Lift tracks into ScoredTrack.
    let tracks: ScoredTrack[] = req.tracks.map((t) => ({
      ...t,
      releaseYear: typeof (t as any).releaseYear === "number" ? (t as any).releaseYear : undefined,
      popularity: typeof (t as any).popularity === "number" ? (t as any).popularity : undefined,
    }));

    // 2. Genre classification (with cache + heuristic fallback).
    const fromCache = { genre: 0, mood: 0 };
    const needLLM: ScoredTrack[] = [];
    for (const t of tracks) {
      const cached = cacheGet<{ primaryGenre?: string; secondaryGenre?: string }>("genre", t);
      if (cached?.primaryGenre) {
        t.primaryGenre = cached.primaryGenre as any;
        t.secondaryGenre = cached.secondaryGenre as any;
        fromCache.genre++;
      } else {
        needLLM.push(t);
      }
    }

    let providerUsed: ProviderUsed = "heuristic";
    let modelUsed = "heuristic";

    if (needLLM.length > 0) {
      try {
        const llm = await callLLM<GenreLLMOutput>(env as any, {
          prompt: buildGenrePrompt(needLLM),
          expectJson: true,
          maxTokens: 800,
        });
        providerUsed = llm.providerUsed;
        modelUsed = llm.modelUsed;
        if (llm.parsed?.tracks) {
          for (const item of llm.parsed.tracks) {
            const matched = needLLM.find(
              (t) => t.name.toLowerCase() === (item.name ?? "").toLowerCase()
                && t.artist.toLowerCase() === (item.artist ?? "").toLowerCase()
            );
            if (!matched) continue;
            matched.primaryGenre = item.primaryGenre;
            matched.secondaryGenre = item.secondaryGenre;
            cacheSet("genre", matched, {
              primaryGenre: item.primaryGenre,
              secondaryGenre: item.secondaryGenre,
            });
          }
        }
      } catch {
        // D6.2: soft-fail — NoLLMProviderError or any LLM error → heuristic covers rest.
        // (genre: heuristicGenreForBatch below; mood: heuristicMoodForBatch; label: labels.ts; summary: oneLiner template)
        providerUsed = "heuristic";
        modelUsed = "heuristic";
      }
    }
    // Apply heuristic to any tracks still missing a primaryGenre.
    tracks = heuristicGenreForBatch(tracks);

    // 3. Mood classification (same pattern).
    const needMood: ScoredTrack[] = [];
    for (const t of tracks) {
      const cached = cacheGet<{ happy: number; sad: number; energetic: number; chill: number }>("mood", t);
      if (cached) {
        t.mood = cached;
        fromCache.mood++;
      } else {
        needMood.push(t);
      }
    }
    if (needMood.length > 0) {
      try {
        const llm = await callLLM<MoodLLMOutput>(env as any, {
          prompt: buildMoodPrompt(needMood),
          expectJson: true,
          maxTokens: 1500,
        });
        if (providerUsed === "heuristic") {
          providerUsed = llm.providerUsed;
          modelUsed = llm.modelUsed;
        }
        if (llm.parsed?.tracks) {
          for (const item of llm.parsed.tracks) {
            const matched = needMood.find(
              (t) => t.name.toLowerCase() === (item.name ?? "").toLowerCase()
                && t.artist.toLowerCase() === (item.artist ?? "").toLowerCase()
            );
            if (!matched || !item.mood) continue;
            matched.mood = item.mood;
            cacheSet("mood", matched, item.mood);
          }
        }
      } catch {
        // Soft-fail: heuristic mood covers the rest.
      }
    }
    tracks = heuristicMoodForBatch(tracks);

    // 4. Compute scores.
    const currentYear = new Date().getFullYear();
    const scores: Scores = computeScores(tracks, currentYear);

    // 5. Personality label.
    const matched = matchLabel({ tracks, scores });

    // 6. Summary.
    let summary = matched.oneLiner;  // fallback if LLM unavailable
    try {
      const llm = await callLLM<SummaryLLMOutput>(env as any, {
        prompt: buildSummaryPrompt({
          scores,
          label: matched.rule.name,
          topTracks: tracks.slice(0, 8),
        }),
        expectJson: true,
        maxTokens: 80,
      });
      if (llm.parsed?.summary) summary = llm.parsed.summary;
    } catch {
      // Use the template oneLiner as fallback.
    }

    const result: ScoreResult = {
      scores,
      personalityLabel: matched.rule.name,
      personalityOneLiner: matched.oneLiner,
      summary,
      fromCache: fromCache.genre + fromCache.mood === tracks.length * 2,
      debug: process.env.NODE_ENV !== "production"
        ? {
            parsedAt: new Date().toISOString(),
            modelUsed,
            providerUsed,
            neuronEstimate: cacheStats().size,
          }
        : undefined,
    };
    return { ok: true, result };
  } catch (e: any) {
    return {
      ok: false,
      error: { code: "INTERNAL", message: e?.message ?? "Unexpected error", retryable: true },
    };
  }
}
