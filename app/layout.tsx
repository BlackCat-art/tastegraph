import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tastegraph — Your Spotify playlist, but make it a magazine.",
  description:
    "Paste a Spotify playlist link. Get a magazine-quality poster of your music personality in 30 seconds. Editorial templates, share-ready, 100% on the web.",
  // D14: 已上 tastegraph.org,OG meta / metadataBase / sitemap 全部跟随
  metadataBase: new URL("https://tastegraph.org"),
  openGraph: {
    title: "tastegraph",
    description: "Your Spotify playlist, but make it a magazine.",
    url: "https://tastegraph.org",
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
      <head>
        {/* D14: Plausible analytics(privacy-friendly, GDPR safe, no cookie) */}
        <script
          defer
          data-domain="tastegraph.org"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
