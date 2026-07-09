import type { PosterTemplateProps } from "./types";
import EditorialPoster from "./EditorialPoster";
import ModernistPoster from "./ModernistPoster";
import RisographPoster from "./RisographPoster";

export default function PosterTemplate(props: PosterTemplateProps) {
  switch (props.kind) {
    case "editorial":
      return <EditorialPoster {...props} />;
    case "modernist":
      return <ModernistPoster />;
    case "risograph":
      return <RisographPoster />;
    default: {
      const _exhaustive: never = props.kind;
      throw new Error(`Unknown poster kind: ${_exhaustive}`);
    }
  }
}
