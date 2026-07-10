import { forwardRef } from "react";
import type { PosterTemplateProps } from "./types";
import EditorialPoster from "./EditorialPoster";
import ModernistPoster from "./ModernistPoster";
import RisographPoster from "./RisographPoster";

const PosterTemplate = forwardRef<HTMLDivElement, PosterTemplateProps>(
  function PosterTemplate(props, ref) {
    switch (props.kind) {
      case "editorial":
        return <EditorialPoster ref={ref} {...props} />;
      case "modernist":
        return <ModernistPoster ref={ref} {...props} />;
      case "risograph":
        return <RisographPoster ref={ref} {...props} />;
      default: {
        const _exhaustive: never = props.kind;
        throw new Error(`Unknown poster kind: ${_exhaustive}`);
      }
    }
  }
);

export default PosterTemplate;
