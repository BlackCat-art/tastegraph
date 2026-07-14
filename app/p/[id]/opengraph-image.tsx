// D10 /p/[id] 的 OG image — 1200x630 社交分享预览
// 用 next/og 的 ImageResponse(内部 Satori),跑在 CF Workers edge runtime
// Satori 限制: 无 CSS grid,只支持 flex column/row;无 background-image;
//   不支持 Tailwind,只能用内联 style;字体用内置 system-ui

import { ImageResponse } from "next/og";
import { getShare } from "@/lib/share/kv";
import { isValidShareId } from "@/lib/share/nanoid";
import {
  EDITORIAL_ACCENTS,
  MODERNIST_ACCENTS,
  RISOGRAPH_PALETTES,
  type EditorialAccent,
  type ModernistAccent,
  type RisographPalette,
} from "@/app/_components/poster/types";

// OpenNext + CF Workers:opengraph-image.tsx 不能用 edge runtime(报错 'cannot use the edge runtime')
// 改用默认 nodejs runtime,ImageResponse 也支持(Satori-based)
// Bundle 略大但能用,真要 edge runtime 就把 image 逻辑拆到独立 route.ts(下个 D11 再优化)
export const alt = "tastegraph poster preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function resolveAccent(data: {
  kind: string;
  accent: string;
}): { primary: string; secondary?: string } {
  if (data.kind === "editorial") {
    return { primary: EDITORIAL_ACCENTS[data.accent as EditorialAccent] };
  }
  if (data.kind === "modernist") {
    return { primary: MODERNIST_ACCENTS[data.accent as ModernistAccent] };
  }
  if (data.kind === "risograph") {
    const p = RISOGRAPH_PALETTES[data.accent as RisographPalette];
    return { primary: p.main, secondary: p.accent };
  }
  return { primary: "#E5681A" };
}

export default async function Image({ params }: { params: { id: string } }) {
  if (!isValidShareId(params.id)) {
    return fallback();
  }

  const data = await getShare(params.id);
  if (!data) {
    return fallback();
  }

  const { primary, secondary } = resolveAccent(data);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* 左侧:文字主区(占 65%) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 64px",
            color: "#e6e6e6",
          }}
        >
          {/* 顶部:brand */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 20,
              fontWeight: 600,
              color: primary,
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            tastegraph
          </div>

          {/* 中部:personality */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                fontSize: 96,
                fontWeight: 800,
                lineHeight: 1.0,
                color: "#ffffff",
                display: "flex",
                flexWrap: "wrap",
                maxWidth: 640,
              }}
            >
              {data.personalityLabel}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 400,
                lineHeight: 1.3,
                color: "#b8b8b8",
                maxWidth: 620,
                display: "flex",
              }}
            >
              {data.personalityOneLiner}
            </div>
          </div>

          {/* 底部:playlist meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 18,
              color: "#7a7a7a",
            }}
          >
            <span>{data.playlistTitle}</span>
            <span style={{ color: "#444" }}>·</span>
            <span>{data.trackCount} tracks</span>
          </div>
        </div>

        {/* 右侧:大色块 + 装饰(占 35%) */}
        <div
          style={{
            width: 420,
            display: "flex",
            flexDirection: "column",
            background: primary,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 主色块 */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "0 56px",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 240,
                fontWeight: 900,
                lineHeight: 1,
                color: "#0a0a0a",
                letterSpacing: -8,
              }}
            >
              {Math.round(
                (data.scores.decadeSpread +
                  data.scores.genreBalance +
                  data.scores.mainstreamScore +
                  data.scores.moodSpectrum +
                  data.scores.discoveryIndex) /
                  5,
              )}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 600,
                color: "#0a0a0a",
                marginTop: 4,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Personality Score
            </div>
          </div>

          {/* 次色装饰圆(risograph) */}
          {secondary && (
            <div
              style={{
                position: "absolute",
                top: 40,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: 9999,
                background: secondary,
                opacity: 0.85,
                display: "flex",
              }}
            />
          )}

          {/* 底部 brand 副标 */}
          <div
            style={{
              display: "flex",
              padding: "32px 56px",
              fontSize: 16,
              color: "#0a0a0a",
              fontWeight: 600,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Make yours at tastegraph.org
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

// Fallback — ID 无效或 KV miss
function fallback(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "#e6e6e6",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, color: "#E5681A" }}>
          tastegraph
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#7a7a7a", marginTop: 24 }}>
          Your Spotify playlist, but make it a magazine.
        </div>
      </div>
    ),
    { ...size },
  );
}
