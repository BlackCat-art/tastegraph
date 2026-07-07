import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tastegraph — Your Spotify playlist, but make it a magazine.",
  description:
    "Paste a Spotify playlist link. Get a magazine-quality poster of your music personality in 30 seconds. Editorial templates, share-ready, 100% on the web.",
  metadataBase: new URL("https://tastegraph.app"),
  openGraph: {
    title: "tastegraph",
    description: "Your Spotify playlist, but make it a magazine.",
    url: "https://tastegraph.app",
    siteName: "tastegraph",
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "tastegraph" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
