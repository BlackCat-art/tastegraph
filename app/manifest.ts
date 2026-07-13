import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "tastegraph — Spotify playlist posters",
    short_name: "tastegraph",
    description: "Turn any Spotify playlist into a magazine-style poster. 5-dimension personality scoring, 135 template combinations, free.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#ff6b00",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
