import { forwardRef } from "react";
import RadarChart from "@/app/_components/RadarChart";
import type { PosterTemplateProps } from "./types";

const EditorialPoster = forwardRef<HTMLDivElement, PosterTemplateProps>(
  function EditorialPoster({
    personalityLabel,
    personalityOneLiner,
    scores,
    playlistTitle,
    trackCount,
    accent,
  }, ref) {
    return (
      <div
        ref={ref}
        className="relative aspect-square w-full max-w-[480px] overflow-hidden rounded-lg border border-line bg-bg p-8 text-fg shadow-2xl"
      >
        {/* Logo */}
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-fgmute">
          tastegraph
        </div>

        {/* Personality Title (Serif bold) */}
        <h1
          className="mt-6 text-4xl font-bold leading-tight text-fg"
          style={{ fontFamily: "Georgia, 'GT Sectra', 'Playfair Display', serif" }}
        >
          {personalityLabel}
        </h1>

        {/* Radar Chart */}
        <div className="mt-8 flex items-center justify-center">
          <RadarChart
            scores={scores}
            size={260}
            accentColor={accent}
            gridStyle="pentagon"
            showValues
          />
        </div>

        {/* OneLiner (italic, with quotes) */}
        <p className="mt-8 text-center text-base italic text-fgmute">
          &ldquo;{personalityOneLiner}&rdquo;
        </p>

        {/* Playlist Info */}
        <div className="mt-8 space-y-1 font-mono text-xs text-fgmute">
          <div>▣ {playlistTitle}</div>
          <div>▣ {trackCount} tracks</div>
        </div>
      </div>
    );
  }
);

export default EditorialPoster;
