import { forwardRef } from "react";
import {
  ASPECT_RATIO_CLASS,
  FONT_FAMILY_CLASS,
  type PosterTemplateProps,
} from "./types";

const RADAR_DIMS = [
  { key: "decadeSpread",    label: "Decade" },
  { key: "genreBalance",    label: "Genre" },
  { key: "mainstreamScore", label: "Mainstream" },
  { key: "moodSpectrum",    label: "Mood" },
  { key: "discoveryIndex",  label: "Discovery" },
] as const;

const ModernistPoster = forwardRef<HTMLDivElement, PosterTemplateProps>(
  function ModernistPoster({
    personalityLabel,
    scores,
    playlistTitle,
    trackCount,
    accent,
    aspectRatio,
    fontFamily,
  }, ref) {
    const fontClass = FONT_FAMILY_CLASS[fontFamily ?? "mono"];
    const titleTokens = personalityLabel.toUpperCase().split(/\s+/).filter(Boolean).slice(0, 2);
    const firstLine = titleTokens[0] ?? "";
    const secondLine = titleTokens[1] ?? titleTokens[0] ?? "";

    return (
      <div
        ref={ref}
        className={`relative ${ASPECT_RATIO_CLASS[aspectRatio ?? "1:1"]} w-full max-w-[480px] overflow-hidden bg-white p-8 text-neutral-900 shadow-2xl`}
      >
        {/* Logo — 接 fontFamily (允许切换) */}
        <div className={`text-xs uppercase tracking-[0.3em] text-neutral-900/60 ${fontClass}`}>
          ▶ TASTEGRAPH
        </div>

        {/* Personality Title line 1 */}
        <div className={`mt-6 text-xs uppercase tracking-[0.3em] ${fontClass}`} style={{ color: accent }}>
          {firstLine}
        </div>
        {/* line 2 */}
        <div className={`mt-2 text-6xl font-black uppercase leading-none ${fontClass}`} style={{ color: accent }}>
          {secondLine}
        </div>

        {/* Numeric Grid: 3 + 2 */}
        <div className="mt-8 grid grid-cols-3 gap-2">
          {RADAR_DIMS.slice(0, 3).map(({ key, label }) => (
            <div key={key} className="border border-neutral-200 p-3">
              <div className={`text-3xl font-bold leading-none ${fontClass}`} style={{ color: accent }}>
                {scores[key]}
              </div>
              <div className={`mt-2 text-[10px] uppercase tracking-wider text-neutral-500 ${fontClass}`}>
                {label}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {RADAR_DIMS.slice(3).map(({ key, label }) => (
            <div key={key} className="border border-neutral-200 p-3">
              <div className={`text-3xl font-bold leading-none ${fontClass}`} style={{ color: accent }}>
                {scores[key]}
              </div>
              <div className={`mt-2 text-[10px] uppercase tracking-wider text-neutral-500 ${fontClass}`}>
                {label}
              </div>
            </div>
          ))}
          <div />
        </div>

        {/* Bottom divider — 接 fontFamily */}
        <div className={`mt-8 border-t border-neutral-200 pt-3 text-xs text-neutral-600 ${fontClass}`}>
          {playlistTitle} · {trackCount} tracks
        </div>
      </div>
    );
  }
);

export default ModernistPoster;
