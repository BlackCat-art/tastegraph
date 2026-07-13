import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/create"],
      },
    ],
    sitemap: "https://tastegraph.18571729942.workers.dev/sitemap.xml",
  };
}
