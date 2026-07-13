import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tastegraph — Your Spotify playlist, but make it a magazine.",
  description:
    "Paste a Spotify playlist link. Get a magazine-quality poster of your music personality in 30 seconds. Editorial templates, share-ready, 100% on the web.",
  // D10: 指向真实部署 URL(原 tastegraph.app 域名未注册,OG meta 会指向死链)
  // TODO: 拿到 tastegraph.app 域名后改回
  metadataBase: new URL("https://tastegraph.18571729942.workers.dev"),
  openGraph: {
    title: "tastegraph",
    description: "Your Spotify playlist, but make it a magazine.",
    url: "https://tastegraph.app",
    siteName: "tastegraph",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "tastegraph" },
  icons: { icon: "/favicon.ico" },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
