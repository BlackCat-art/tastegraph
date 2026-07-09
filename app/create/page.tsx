"use client";

import { useState } from "react";
import type { ScoreResult } from "@/lib/types";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import { EDITORIAL_ACCENTS, type PosterKind, type EditorialAccent } from "@/app/_components/poster/types";

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
  const [posterKind, setPosterKind] = useState<PosterKind>("editorial");
  const [posterAccent, setPosterAccent] = useState<EditorialAccent>("orange");

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

      {/* Step 2 + Step 3 combined: Personality + Template picker */}
      {result.kind === "ok" && result.score && (
        <div className="mt-8 space-y-8">
          {/* Step 2: Personality summary (no longer in RadarChart) */}
          <div className="rounded-lg border border-line bg-bgcard p-5">
            <div className="text-xs uppercase tracking-wide text-accent2">Personality</div>
            <h2 className="mt-2 text-2xl font-bold text-fg">{result.score.personalityLabel}</h2>
            <p className="mt-2 italic text-fgmute">&ldquo;{result.score.personalityOneLiner}&rdquo;</p>
            <p className="mt-3 text-sm text-fg">{result.score.summary}</p>
          </div>

          {/* Step 3: Pick a style */}
          <div>
            <div className="text-xs uppercase tracking-wide text-accent2">Step 3: Pick a style</div>

            {/* Template thumbnails (3 buttons, only Editorial active) */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(["editorial", "modernist", "risograph"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  disabled={kind !== "editorial"}
                  onClick={() => setPosterKind(kind)}
                  className={`rounded-lg border p-3 text-left text-xs font-mono uppercase tracking-wide transition ${
                    posterKind === kind
                      ? "border-accent bg-bgcard text-fg"
                      : "border-line bg-bgcard text-fgmute disabled:opacity-40"
                  }`}
                >
                  <div className="font-bold">{kind}</div>
                  <div className="mt-1 text-fgfaint normal-case tracking-normal">
                    {kind === "editorial" && "Serif + radar + 1:1"}
                    {kind === "modernist" && "Mono + numbers (D6+)"}
                    {kind === "risograph" && "Risograph (D6+)"}
                  </div>
                </button>
              ))}
            </div>

            {/* Accent palette (Editorial only) */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs uppercase tracking-wide text-fgmute">Accent:</span>
              {Object.entries(EDITORIAL_ACCENTS).map(([key, color]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPosterAccent(key as EditorialAccent)}
                  aria-label={`Accent ${key}`}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    posterAccent === key ? "border-fg scale-110" : "border-line"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            {/* Live Preview */}
            <div className="mt-6 flex justify-center rounded-lg border border-line bg-bgsoft p-6">
              <PosterTemplate
                kind={posterKind}
                accent={EDITORIAL_ACCENTS[posterAccent]}
                personalityLabel={result.score.personalityLabel}
                personalityOneLiner={result.score.personalityOneLiner}
                summary={result.score.summary}
                scores={result.score.scores}
                playlistTitle={result.title}
                trackCount={result.trackCount}
              />
            </div>

            {/* Action buttons (Download + Go Pro — both placeholders) */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => console.log("TODO D5.6: html-to-image download")}
                className="rounded-lg border border-line bg-bgcard px-6 py-3 text-sm font-semibold text-fg hover:border-accent"
              >
                Download PNG 🆓
              </button>
              <button
                type="button"
                onClick={() => console.log("TODO D9: Stripe checkout")}
                className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent2"
              >
                Go Pro $4.99
              </button>
            </div>
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
