import type { MetadataRoute } from "next";

const BASE = "https://tastegraph.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/create`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/for/spotify-playlist-poster`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/for/music-personality`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/for/playlist-cover-art-generator`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/for/instagram-music-graphics`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/for/tiktok-playlist-poster`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];
}
