import { forwardRef } from "react";
import RadarChart from "@/app/_components/RadarChart";
import {
  ASPECT_RATIO_CLASS,
  FONT_FAMILY_CLASS,
  type PosterTemplateProps,
} from "./types";

const EditorialPoster = forwardRef<HTMLDivElement, PosterTemplateProps>(
  function EditorialPoster({
    personalityLabel,
    personalityOneLiner,
    scores,
    playlistTitle,
    trackCount,
    accent,
    aspectRatio,
    fontFamily,
  }, ref) {
    const fontClass = FONT_FAMILY_CLASS[fontFamily ?? "serif"];

    return (
      <div
        ref={ref}
        className={`relative ${ASPECT_RATIO_CLASS[aspectRatio ?? "1:1"]} mx-auto w-full max-w-[480px] overflow-hidden rounded-lg border border-line bg-bg p-8 text-fg shadow-2xl`}
      >
        {/* Logo — 保持 font-mono 品牌一致性 */}
        <div className="text-xs font-mono uppercase tracking-[0.2em] text-fgmute">
          tastegraph
        </div>

        {/* Personality Title — 接 fontFamily */}
        <h1 className={`mt-6 text-4xl font-bold leading-tight text-fg ${fontClass}`}>
          {personalityLabel}
        </h1>

        {/* RadarChart — size 不变 */}
        <div className="mt-8 flex items-center justify-center">
          <RadarChart
            scores={scores}
            size={260}
            accentColor={accent}
            gridStyle="pentagon"
            showValues
          />
        </div>

        {/* OneLiner — 接 fontFamily */}
        <p className={`mt-8 text-center text-base italic text-fgmute ${fontClass}`}>
          &ldquo;{personalityOneLiner}&rdquo;
        </p>

        {/* Playlist Info — 接 fontFamily (覆盖原 font-mono) */}
        <div className={`mt-8 space-y-1 text-xs text-fgmute ${fontClass}`}>
          <div>▣ {playlistTitle}</div>
          <div>▣ {trackCount} tracks</div>
        </div>
      </div>
    );
  }
);

export default EditorialPoster;
