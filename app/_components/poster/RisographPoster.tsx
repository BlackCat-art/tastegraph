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

const RisographPoster = forwardRef<HTMLDivElement, PosterTemplateProps>(
  function RisographPoster(
    {
      personalityLabel,
      scores,
      playlistTitle,
      trackCount,
      accent,
      accent2,
      aspectRatio,
      fontFamily,
    },
    ref
  ) {
    const fontClass = FONT_FAMILY_CLASS[fontFamily ?? "sans"];
    const titleTokens = personalityLabel.toUpperCase().split(/\s+/).filter(Boolean).slice(0, 3);

    if (!accent2) {
      console.warn("Risograph missing accent2, no offset print effect");
    }

    return (
      <div
        ref={ref}
        className={`relative ${ASPECT_RATIO_CLASS[aspectRatio ?? "1:1"]} w-full max-w-[480px] overflow-hidden p-8 shadow-2xl`}
        style={{ backgroundColor: "#FAF6EF" }}
      >
        {/* Halftone background — 不接 fontFamily */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accent} 1px, transparent 1px)`,
            backgroundSize: "8px 8px",
            opacity: 0.08,
          }}
        />

        {/* Personality Title with offset print effect */}
        <div className="relative mt-8">
          {accent2 && (
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 text-7xl font-black uppercase tracking-tight leading-none ${fontClass}`}
              style={{ color: accent2, transform: "translate(3px, 3px)" }}
            >
              {titleTokens.join(" ")}
            </span>
          )}
          <div className={`text-7xl font-black uppercase tracking-tight leading-none ${fontClass}`} style={{ color: accent }}>
            {titleTokens.map((t, i) => (
              <div key={i}>{t}</div>
            ))}
          </div>
        </div>

        {/* 5-axis breakdown */}
        <div className={`relative mt-12 space-y-1 text-xs ${fontClass}`} style={{ color: accent }}>
          {RADAR_DIMS.map(({ key, label }) => (
            <div key={key}>• {label} {scores[key]}</div>
          ))}
        </div>

        {/* Bottom */}
        <div className={`relative mt-6 text-xs ${fontClass}`} style={{ color: accent, opacity: 0.7 }}>
          {playlistTitle} · {trackCount} tracks
        </div>
      </div>
    );
  }
);

export default RisographPoster;
