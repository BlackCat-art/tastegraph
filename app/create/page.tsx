"use client";

import { useState } from "react";
import type { ScoreResult } from "@/lib/types";
import RadarChart from "@/app/_components/RadarChart";

type ParseOk = {
  kind: "ok";
  title: string;
  trackCount: number;
  tracks: Array<{ name: string; artist: string; releaseYear?: number; popularity?: number }>;
};
type Result =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "scoring"; title: string; trackCount: number }
  | (ParseOk & { kind: "ok"; score?: ScoreResult; scoreWarning?: string })
  | { kind: "err"; code: string; message: string };

export default function CreatePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setResult({ kind: "loading" });
    try {
      // Step 1: parse.
      const parseRes = await fetch("/api/v1/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", payload: url }),
      });
      const parseData = await parseRes.json();
      if (!parseRes.ok || !parseData.ok) {
        const err = parseData.error ?? { code: "INTERNAL", message: "Unknown error" };
        setResult({ kind: "err", code: err.code, message: err.message });
        return;
      }
      const playlist = parseData.playlist;

      // Step 2: score.
      setResult({
        kind: "scoring",
        title: playlist.title,
        trackCount: playlist.tracks.length,
      });
      try {
        const scoreRes = await fetch("/api/v1/score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tracks: playlist.tracks, playlistTitle: playlist.title }),
        });
        const scoreData = await scoreRes.json();
        if (!scoreRes.ok || !scoreData.ok) {
          // Keep parsed view + soft warning.
          setResult({
            kind: "ok",
            title: playlist.title,
            trackCount: playlist.tracks.length,
            tracks: playlist.tracks,
            scoreWarning: scoreData.error?.message ?? "Scoring failed.",
          });
          return;
        }
        const { scores, personalityLabel, personalityOneLiner, summary } = scoreData;
        setResult({
          kind: "ok",
          title: playlist.title,
          trackCount: playlist.tracks.length,
          tracks: playlist.tracks,
          score: { scores, personalityLabel, personalityOneLiner, summary },
        });
      } catch (e: any) {
        setResult({
          kind: "ok",
          title: playlist.title,
          trackCount: playlist.tracks.length,
          tracks: playlist.tracks,
          scoreWarning: e?.message ?? "Network error during scoring.",
        });
      }
    } catch (e: any) {
      setResult({
        kind: "err",
        code: "INTERNAL",
        message: e?.message ?? "Network error",
      });
    }
  }

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="flex items-center gap-2 text-sm">
        <a href="/" className="text-fgfaint hover:text-fgmute">← back</a>
        <span className="text-fgfaint ml-2">/ create</span>
      </header>

      <h1 className="mt-12 text-3xl font-bold tracking-tight text-fg">
        Paste your playlist link.
      </h1>
      <p className="mt-2 text-fgmute">
        Today: <span className="text-accent2">Spotify only</span>.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
          className="flex-1 rounded-lg border border-line bg-bgcard px-4 py-3 font-mono text-sm text-fg placeholder:text-fgfaint focus:border-accent focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={result.kind === "loading" || result.kind === "scoring" || !url}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-30 hover:bg-accent2"
        >
          {result.kind === "loading" ? "Parsing…" :
           result.kind === "scoring" ? "Scoring…" : "Score →"}
        </button>
      </form>

      {/* Scoring-in-progress state */}
      {result.kind === "scoring" && (
        <div className="mt-8 rounded-lg border border-line bg-bgcard p-5">
          <div className="text-xs uppercase tracking-wide text-accent2">Parsed & Scoring</div>
          <h2 className="mt-2 text-xl font-semibold text-fg">{result.title}</h2>
          <p className="mt-1 text-sm text-fgmute">{result.trackCount} tracks · computing personality…</p>
        </div>
      )}

      {/* OK state with score */}
      {result.kind === "ok" && result.score && (
        <div className="mt-8">
          <RadarChart
            scores={result.score.scores}
            personalityLabel={result.score.personalityLabel}
            personalityOneLiner={result.score.personalityOneLiner}
            summary={result.score.summary}
          />
        </div>
      )}

      {/* OK without score */}
      {result.kind === "ok" && !result.score && (
        <div className="mt-8 rounded-lg border border-line bg-bgcard p-5">
          <div className="text-xs uppercase tracking-wide text-accent2">Parsed</div>
          <h2 className="mt-2 text-xl font-semibold text-fg">{result.title}</h2>
          <p className="mt-1 text-sm text-fgmute">{result.trackCount} tracks.</p>
          {result.scoreWarning && (
            <p className="mt-3 rounded border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-yellow-300">
              ⚠ Scoring skipped: {result.scoreWarning}
            </p>
          )}
        </div>
      )}

      {result.kind === "err" && (
        <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/5 p-5">
          <div className="text-xs uppercase tracking-wide text-red-400">{result.code}</div>
          <p className="mt-2 text-sm text-fg">{result.message}</p>
        </div>
      )}
    </main>
  );
}
