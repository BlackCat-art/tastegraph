import { ImageResponse } from "next/og";

export const alt = "tastegraph — Your Spotify playlist, but make it a magazine.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "80px 72px",
            color: "#e6e6e6",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, fontWeight: 600, color: "#ff6b00", letterSpacing: 3, textTransform: "uppercase" }}>
            tastegraph
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", fontSize: 80, fontWeight: 800, lineHeight: 1.05, color: "#ffffff", maxWidth: 700, flexWrap: "wrap" }}>
              Your Spotify playlist, but make it a magazine.
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#9a9a9a", maxWidth: 640, lineHeight: 1.3 }}>
              5-dimension personality scoring · 135 template combinations · free
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 18, color: "#7a7a7a" }}>
            tastegraph.18571729942.workers.dev
          </div>
        </div>
        <div
          style={{
            width: 400,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#ff6b00",
            color: "#0a0a0a",
            padding: 40,
          }}
        >
          <div style={{ display: "flex", fontSize: 220, fontWeight: 900, lineHeight: 1, letterSpacing: -8 }}>
            ▣
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 600, marginTop: 24, textTransform: "uppercase", letterSpacing: 2 }}>
            Make yours
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
