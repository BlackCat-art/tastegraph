"use client";

import { useState } from "react";
import type { ScoreResult } from "@/lib/types";

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

// Radar chart math — pure, no Recharts dependency.
function radarPoints(scores: ScoreResult["scores"], cx = 120, cy = 120, r = 90): string {
  const labels: Array<keyof ScoreResult["scores"]> = [
    "decadeSpread", "genreBalance", "mainstreamScore", "moodSpectrum", "discoveryIndex",
  ];
  const step = (Math.PI * 2) / labels.length;
  return labels
    .map((k, i) => {
      const ratio = scores[k] / 100;
      const x = cx + Math.cos(step * i - Math.PI / 2) * r * ratio;
      const y = cy + Math.sin(step * i - Math.PI / 2) * r * ratio;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

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
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-lg border border-line bg-bgcard p-5">
            <div className="text-xs uppercase tracking-wide text-accent2">Personality</div>
            <h2 className="mt-2 text-2xl font-bold text-fg">{result.score.personalityLabel}</h2>
            <p className="mt-2 italic text-fgmute">&quot;{result.score.personalityOneLiner}&quot;</p>
            <p className="mt-3 text-sm text-fg">{result.score.summary}</p>
          </div>
          <div className="rounded-lg border border-line bg-bgcard p-5 flex items-center justify-center">
            <svg viewBox="0 0 240 240" className="w-full max-w-xs" aria-label="5-dimension radar chart">
              {/* grid */}
              {[0.25, 0.5, 0.75, 1].map((r) => (
                <circle key={r} cx="120" cy="120" r={90 * r} fill="none"
                  stroke="currentColor" className="text-line" strokeWidth="0.5" />
              ))}
              {/* axes */}
              {["decade", "genre", "mainstream", "mood", "discovery"].map((_, i) => {
                const step = (Math.PI * 2) / 5;
                const x = 120 + Math.cos(step * i - Math.PI / 2) * 90;
                const y = 120 + Math.sin(step * i - Math.PI / 2) * 90;
                return (
                  <line key={i} x1="120" y1="120" x2={x} y2={y}
                    stroke="currentColor" className="text-line" strokeWidth="0.5" />
                );
              })}
              {/* data polygon */}
              <polygon points={radarPoints(result.score.scores)}
                fill="currentColor" className="text-accent" fillOpacity="0.25" />
              <polygon points={radarPoints(result.score.scores)}
                fill="none" className="text-accent2" stroke="currentColor" strokeWidth="1.5" />
              {/* labels */}
              {["Decade", "Genre", "Mainstream", "Mood", "Discovery"].map((label, i) => {
                const step = (Math.PI * 2) / 5;
                const x = 120 + Math.cos(step * i - Math.PI / 2) * 108;
                const y = 120 + Math.sin(step * i - Math.PI / 2) * 108;
                return (
                  <text key={label} x={x} y={y} textAnchor="middle"
                    className="fill-fgmute text-[10px]">{label}</text>
                );
              })}
            </svg>
          </div>
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
