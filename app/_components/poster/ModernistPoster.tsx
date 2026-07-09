import { forwardRef } from "react";

const ModernistPoster = forwardRef<HTMLDivElement>(function ModernistPoster(_props, ref) {
  return (
    <div ref={ref} className="relative aspect-square w-full max-w-[480px] flex items-center justify-center rounded-lg border border-dashed border-line bg-bgcard">
      <div className="text-center">
        <div className="text-xs font-mono uppercase tracking-widest text-fgfaint">Modernist</div>
        <div className="mt-2 text-sm text-fgmute">coming soon (D6+)</div>
      </div>
    </div>
  );
});

export default ModernistPoster;
