import { forwardRef } from "react";
import type { PosterTemplateProps } from "./types";

const RADAR_DIMS = [
  { key: "decadeSpread",    label: "Decade" },
  { key: "genreBalance",    label: "Genre" },
  { key: "mainstreamScore", label: "Mainstream" },
  { key: "moodSpectrum",    label: "Mood" },
  { key: "discoveryIndex",  label: "Discovery" },
] as const;

const ModernistPoster = forwardRef<HTMLDivElement, PosterTemplateProps>(
  function ModernistPoster({ personalityLabel, scores, playlistTitle, trackCount, accent }, ref) {
    const titleTokens = personalityLabel.toUpperCase().split(/\s+/).filter(Boolean).slice(0, 2);
    const firstLine = titleTokens[0] ?? "";
    const secondLine = titleTokens[1] ?? titleTokens[0] ?? "";

    return (
      <div
        ref={ref}
        className="relative aspect-square w-full max-w-[480px] overflow-hidden bg-white p-8 text-neutral-900 shadow-2xl"
      >
        {/* Logo */}
        <div className="text-xs font-mono uppercase tracking-[0.3em] text-neutral-900/60">
          ▶ TASTEGRAPH
        </div>

        {/* Personality Title (2 lines) */}
        <div className="mt-6 text-xs font-mono uppercase tracking-[0.3em]" style={{ color: accent }}>
          {firstLine}
        </div>
        <div className="mt-2 font-mono text-6xl font-black uppercase leading-none" style={{ color: accent }}>
          {secondLine}
        </div>

        {/* Numeric Grid: 3 + 2 */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          {RADAR_DIMS.slice(0, 3).map(({ key, label }) => (
            <div key={key} className="border border-neutral-200 p-3">
              <div className="text-3xl font-mono font-bold leading-none" style={{ color: accent }}>
                {scores[key]}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-wider text-neutral-500">
                {label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {RADAR_DIMS.slice(3).map(({ key, label }) => (
            <div key={key} className="border border-neutral-200 p-3">
              <div className="text-3xl font-mono font-bold leading-none" style={{ color: accent }}>
                {scores[key]}
              </div>
              <div className="mt-2 text-[10px] uppercase tracking-wider text-neutral-500">
                {label}
              </div>
            </div>
          ))}
          {/* 第 3 个 cell 留空 */}
          <div />
        </div>

        {/* Bottom divider */}
        <div className="mt-8 border-t border-neutral-200 pt-3 text-xs font-mono text-neutral-600">
          {playlistTitle} · {trackCount} tracks
        </div>
      </div>
    );
  }
);

export default ModernistPoster;
