"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import type { ScoreResult } from "@/lib/types";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import { AuthChip } from "@/app/_components/AuthChip";
import { MagicLinkForm } from "@/app/_components/MagicLinkForm";
import Link from "next/link";
import {
  EDITORIAL_ACCENTS,
  MODERNIST_ACCENTS,
  RISOGRAPH_PALETTES,
  FONT_FAMILY_CLASS,
  type PosterKind,
  type EditorialAccent,
  type ModernistAccent,
  type RisographPalette,
  type AspectRatio,
  type FontFamily,
} from "@/app/_components/poster/types";

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

const DEFAULT_FONT_BY_KIND: Record<PosterKind, FontFamily> = {
  editorial: "serif",
  modernist: "mono",
  risograph: "sans",
};

export default function CreatePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });
  const [posterKind, setPosterKind] = useState<PosterKind>("editorial");
  const [posterAspectRatio, setPosterAspectRatio] = useState<AspectRatio>("1:1");
  const [posterFontFamily, setPosterFontFamily] = useState<FontFamily>(DEFAULT_FONT_BY_KIND["editorial"]);
  const [posterEditorialAccent, setPosterEditorialAccent] = useState<EditorialAccent>("orange");
  const [posterModernistAccent, setPosterModernistAccent] = useState<ModernistAccent>("red");
  const [posterRisographPalette, setPosterRisographPalette] = useState<RisographPalette>("blue-red");
  const [signInOpen, setSignInOpen] = useState(false);
  // D10 分享状态
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleTemplateChange = (kind: PosterKind) => {
    setPosterKind(kind);
    setPosterFontFamily(DEFAULT_FONT_BY_KIND[kind]);
  };

  const posterRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#0a0a0a",
        includeStyleProperties: ["fill"],   // 恢复 D13 fix: SVG fill 在 PNG 转换中需保留
      });
      const link = document.createElement("a");
      const slug = result.kind === "ok" && result.score?.personalityLabel
        ? result.score.personalityLabel
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 50)
        : "poster";
      link.download = `tastegraph-${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  const handleShare = async () => {
    if (result.kind !== "ok" || !result.score) return;
    setSharing(true);
    setShareCopied(false);
    try {
      // D10 收集当前海报数据
      const accent =
        posterKind === "editorial" ? posterEditorialAccent :
        posterKind === "modernist" ? posterModernistAccent :
        posterRisographPalette;
      const res = await fetch("/api/v1/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          v: 1,
          kind: posterKind,
          accent,
          aspectRatio: posterAspectRatio,
          fontFamily: posterFontFamily,
          playlistTitle: result.title,
          trackCount: result.trackCount,
          personalityLabel: result.score.personalityLabel,
          personalityOneLiner: result.score.personalityOneLiner,
          summary: result.score.summary,
          scores: result.score.scores,
        }),
      });
      const data = (await res.json()) as
        | { ok: true; id: string; url: string }
        | { ok: false; error: { code: string; message: string } };
      if (data.ok) {
        setShareUrl(data.url);
      } else {
        console.error("Share failed:", data.error);
        alert(`Share failed: ${data.error.message}`);
      }
    } catch (e) {
      console.error("Share error:", e);
      alert("Share failed. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const handleCopyShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (e) {
      console.error("Copy failed:", e);
    }
  };

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
      const parseData = await parseRes.json() as any;
      if (parseRes.status === 429) {
        setResult({
          kind: "err",
          code: "RATE_LIMITED",
          message: parseData.error?.message ?? "Too many requests. Please wait.",
        });
        return;
      }
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
        const scoreData = await scoreRes.json() as any;
        if (scoreRes.status === 429) {
          setResult({
            kind: "ok",
            title: playlist.title,
            trackCount: playlist.tracks.length,
            tracks: playlist.tracks,
            scoreWarning: "Rate limited during scoring. Please try again.",
          });
          return;
        }
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
      <header className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <a href="/" className="text-fgfaint hover:text-fgmute">← back</a>
          <span className="text-fgfaint ml-2">/ create</span>
        </div>
        <AuthChip onSignInClick={() => setSignInOpen(true)} />
      </header>

      <MagicLinkForm
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSignedIn={() => setSignInOpen(false)}
      />

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

            {/* Template thumbnails (3 buttons, all active) */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              {(["editorial", "modernist", "risograph"] as const).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => handleTemplateChange(kind)}
                  className={`rounded-lg border p-3 text-left text-xs font-mono uppercase tracking-wide transition ${
                    posterKind === kind
                      ? "border-accent bg-bgcard text-fg"
                      : "border-line bg-bgcard text-fgmute"
                  }`}
                >
                  <div className="font-bold">{kind}</div>
                  <div className="mt-1 text-fgfaint normal-case tracking-normal">
                    {kind === "editorial" && "Serif + radar + 1:1"}
                    {kind === "modernist" && "Mono + numbers (D6)"}
                    {kind === "risograph" && "Risograph (D6)"}
                  </div>
                </button>
              ))}
            </div>

            {/* Aspect Ratio picker — D6+ 新 */}
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-fgmute">Aspect ratio:</div>
              <div className="mt-2 flex gap-2">
                {(["1:1", "3:4", "9:16"] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setPosterAspectRatio(ratio)}
                    className={`rounded-lg border px-4 py-2 text-sm font-mono transition ${
                      posterAspectRatio === ratio
                        ? "border-accent bg-bgcard text-fg"
                        : "border-line bg-bgcard text-fgmute hover:text-fg"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family picker — D6+ 新 */}
            <div className="mt-4">
              <div className="text-xs uppercase tracking-wide text-fgmute">Font:</div>
              <div className="mt-2 flex gap-2">
                {(["serif", "mono", "sans"] as const).map((font) => (
                  <button
                    key={font}
                    type="button"
                    onClick={() => setPosterFontFamily(font)}
                    className={`rounded-lg border px-4 py-2 text-sm transition ${
                      posterFontFamily === font
                        ? "border-accent bg-bgcard text-fg"
                        : "border-line bg-bgcard text-fgmute hover:text-fg"
                    } ${FONT_FAMILY_CLASS[font]}`}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent palette (dynamic per kind) */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs uppercase tracking-wide text-fgmute">Accent:</span>

              {/* Editorial: 3 单色 dot */}
              {posterKind === "editorial" && Object.entries(EDITORIAL_ACCENTS).map(([key, color]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPosterEditorialAccent(key as EditorialAccent)}
                  aria-label={`Accent ${key}`}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    posterEditorialAccent === key ? "border-fg scale-110" : "border-line"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}

              {/* Modernist: 4 单色 dot */}
              {posterKind === "modernist" && Object.entries(MODERNIST_ACCENTS).map(([key, color]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPosterModernistAccent(key as ModernistAccent)}
                  aria-label={`Accent ${key}`}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    posterModernistAccent === key ? "border-fg scale-110" : "border-line"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}

              {/* Risograph: 3 双色调色板 dot (linear-gradient) */}
              {posterKind === "risograph" && Object.entries(RISOGRAPH_PALETTES).map(([key, palette]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPosterRisographPalette(key as RisographPalette)}
                  aria-label={`Palette ${key}`}
                  className={`h-6 w-6 rounded-full border-2 transition ${
                    posterRisographPalette === key ? "border-fg scale-110" : "border-line"
                  }`}
                  style={{ background: `linear-gradient(to right, ${palette.main} 50%, ${palette.accent} 50%)` }}
                />
              ))}
            </div>

            {/* Live Preview */}
            <div className="mt-6 flex justify-center rounded-lg border border-line bg-bgsoft p-6">
              <PosterTemplate
                ref={posterRef}
                kind={posterKind}
                aspectRatio={posterAspectRatio}
                fontFamily={posterFontFamily}
                accent={
                  posterKind === "editorial" ? EDITORIAL_ACCENTS[posterEditorialAccent] :
                  posterKind === "modernist" ? MODERNIST_ACCENTS[posterModernistAccent] :
                  RISOGRAPH_PALETTES[posterRisographPalette].main
                }
                accent2={
                  posterKind === "risograph" ? RISOGRAPH_PALETTES[posterRisographPalette].accent : undefined
                }
                personalityLabel={result.score.personalityLabel}
                personalityOneLiner={result.score.personalityOneLiner}
                summary={result.score.summary}
                scores={result.score.scores}
                playlistTitle={result.title}
                trackCount={result.trackCount}
              />
            </div>

            {/* Action buttons (Download + Share + Go Pro) */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-lg border border-line bg-bgcard px-6 py-3 text-sm font-semibold text-fg hover:border-accent"
              >
                Download PNG 🆓
              </button>
              <button
                type="button"
                onClick={handleShare}
                disabled={sharing}
                className="rounded-lg border border-line bg-bgcard px-6 py-3 text-sm font-semibold text-fg hover:border-accent disabled:opacity-50"
              >
                {sharing ? "Sharing..." : "Share 🔗"}
              </button>
              <button
                type="button"
                disabled
                title="Pro subscriptions are temporarily disabled (D14 launch)"
                className="rounded-lg bg-fgmute px-6 py-3 text-sm font-semibold text-fg opacity-50 cursor-not-allowed"
              >
                Go Pro — Coming soon
              </button>
            </div>

            {/* D10 分享结果 panel */}
            {shareUrl && (
              <div className="mt-4 rounded-lg border border-line bg-bgcard p-4">
                <div className="text-xs uppercase tracking-wide text-accent2">
                  Share link · expires in 90 days
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    readOnly
                    value={shareUrl}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                    className="flex-1 rounded border border-line bg-bg px-3 py-2 text-xs text-fg"
                  />
                  <button
                    type="button"
                    onClick={handleCopyShare}
                    className="rounded bg-accent px-4 py-2 text-xs font-semibold text-bg hover:bg-accent2"
                  >
                    {shareCopied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </div>
            )}
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

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">Use cases</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/for/spotify-playlist-poster" className="text-fg hover:text-accent">Spotify playlist poster</Link></li>
                <li><Link href="/for/music-personality" className="text-fg hover:text-accent">Music personality test</Link></li>
                <li><Link href="/for/playlist-cover-art-generator" className="text-fg hover:text-accent">Playlist cover art</Link></li>
                <li><Link href="/for/instagram-music-graphics" className="text-fg hover:text-accent">Instagram music graphics</Link></li>
                <li><Link href="/for/tiktok-playlist-poster" className="text-fg hover:text-accent">TikTok playlist poster</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">Product</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/create" className="text-fg hover:text-accent">Create a poster</Link></li>
                <li><Link href="/pricing" className="text-fg hover:text-accent">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">Legal</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/privacy" className="text-fg hover:text-accent">Privacy policy</Link></li>
                <li><Link href="/terms" className="text-fg hover:text-accent">Terms of service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">tastegraph</h3>
              <p className="mt-3 text-sm text-fgmute">Your Spotify playlist, but make it a magazine.</p>
            </div>
          </div>
          <div className="mt-10 text-xs text-fgfaint">
            © {new Date().getFullYear()} tastegraph. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
