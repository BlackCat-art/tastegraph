import type { Metadata } from "next";
import Link from "next/link";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import type { PosterTemplateProps } from "@/app/_components/poster/types";

export const metadata: Metadata = {
  title: "TikTok Playlist Poster — 9:16 Cover Art for Music Creators | tastegraph",
  description: "9:16 editorial-style posters for TikTok, Reels, and YouTube Shorts. Free, no login. 30 seconds from Spotify link to share-ready cover.",
  alternates: { canonical: "/for/tiktok-playlist-poster" },
  openGraph: {
    title: "TikTok Playlist Poster — 9:16 Cover Art for Music Creators | tastegraph",
    description: "9:16 editorial-style posters for TikTok, Reels, and YouTube Shorts. Free, no login. 30 seconds from Spotify link to share-ready cover.",
    type: "article",
    images: [
      {
        url: "https://tastegraph.org/opengraph-image",
        width: 1200,
        height: 630,
        alt: "tastegraph — Your Spotify playlist, but make it a magazine.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TikTok Playlist Poster — 9:16 Cover Art for Music Creators | tastegraph",
    description: "9:16 editorial-style posters for TikTok, Reels, and YouTube Shorts. Free, no login. 30 seconds from Spotify link to share-ready cover.",
    images: [
      "https://tastegraph.org/opengraph-image",
    ],
  },
};

const sample: PosterTemplateProps = {
  kind: "modernist",
  accent: "yellow",
  aspectRatio: "9:16",
  fontFamily: "mono",
  personalityLabel: "Indie Sleeper",
  personalityOneLiner: "You were listening to them before they were cool.",
  summary: "Drawn to indie rock and alternative, with strong decade spread. High discovery, low mainstream — the friend who always has a rec.",
  scores: { decadeSpread: 75, genreBalance: 65, mainstreamScore: 25, moodSpectrum: 70, discoveryIndex: 90 },
  playlistTitle: "B-Sides & Deep Cuts",
  trackCount: 41,
};

const faqs = [
  { q: "Is the poster 9:16 by default?", a: "Yes — when you pick any template on /create, 9:16 is one of the three ratio choices (along with 1:1 and 3:4). The 9:16 output is exactly 1080×1920 for the free tier." },
  { q: "Does it work for CapCut / Premiere?", a: "Yes — drop the PNG into any video editor as a still frame or background. No transparency, so it composites cleanly." },
  { q: "Can I use the poster as a TikTok video background?", a: "Yes. Render the 9:16 poster, drop it into CapCut as a 1-second still, and add a music track + text overlay." },
  { q: "What if I want horizontal (16:9) for YouTube?", a: "Not directly supported in MVP. tastegraph outputs 1:1, 3:4, and 9:16. For 16:9 YouTube, use Canva or a similar tool to add black bars." },
  { q: "How does the poster look at 9:16 on a phone?", a: "All five personality dimensions remain readable on a typical phone screen. The 5-dimension radar scales with the canvas (default size 320px)." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
};

export default function TikTokPlaylistPosterPage() {
  return (
    <main className="min-h-screen bg-bg text-fg">
      {/* Header */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <span className="text-accent text-lg leading-none">▣</span>
            <span>tastegraph</span>
          </Link>
          <Link href="/create" className="text-sm text-fgmute hover:text-fg">
            Make yours →
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20 text-center">
        <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl">
          TikTok-ready playlist posters, 9:16 by default
        </h1>
        <p className="mt-6 text-lg text-fgmute sm:text-xl">
          Editorial-style cover art sized for TikTok, Reels, and YouTube Shorts. From Spotify link to share-ready in 30 seconds.
        </p>
        <Link href="/create" className="mt-8 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent2">
          Make yours — free
        </Link>
      </section>

      {/* Demo embed */}
      <section className="mx-auto max-w-3xl px-6 pb-12">
        <div className="rounded-2xl border border-line bg-bgcard p-6 sm:p-8">
          <div className="mx-auto max-w-md">
            <PosterTemplate {...sample} />
          </div>
          <p className="mt-4 text-center text-xs text-fgfaint">
            Example poster generated from a real Spotify playlist
          </p>
        </div>
      </section>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-6 pb-16 prose prose-invert">
        <h2>Why TikTok music creators need a cover</h2>
        <p>TikTok videos that feature a playlist get more watch-time when the cover art isn't a screenshot. Editorial-style 9:16 posters — typography, color blocking, a personality label — stop the scroll differently than a thumbnail from the Spotify app.</p>
        <p>tastegraph renders 9:16 by default for the TikTok / Reels / Shorts aspect ratio (1080×1920). The personality label sits at the top, the radar chart in the middle, the playlist meta at the bottom — the same hierarchy a designer would use for an editorial print piece.</p>

        <h2>Use cases for music creators</h2>
        <ul>
          <li><strong>End-of-year wrap-ups</strong>: turn your top tracks of 2025 into a poster</li>
          <li><strong>Playlist drops</strong>: every new playlist gets its own cover, your brand</li>
          <li><strong>Story / Reel covers</strong>: even if the video is unrelated, the poster is thumbnail-quality</li>
          <li><strong>Spotify ad creative</strong>: 9:16 poster works as the visual for a Spotify ad campaign</li>
        </ul>

        <h2>The 9:16 difference</h2>
        <p>Most "playlist cover generators" only output 1:1. tastegraph's Risograph and Modernist templates are designed first for 9:16, then scaled down — the type hierarchy and color blocking work in vertical format, not retrofitted from horizontal.</p>

        <h2>Output specs</h2>
        <ul>
          <li>1080×1920 PNG (Free)</li>
          <li>2160×3840 PNG (Pro, 4K vertical)</li>
          <li>No transparency (ready to drop into TikTok / CapCut / Premiere)</li>
        </ul>
      </article>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 pb-16">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq, i) => (
            <details key={i} className="group rounded-xl border border-line bg-bgcard px-5 py-4">
              <summary className="cursor-pointer text-sm font-semibold">{faq.q}</summary>
              <p className="mt-3 text-sm text-fgmute leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* CTA repeat */}
      <section className="mx-auto max-w-3xl px-6 pb-16 text-center">
        <h2 className="text-3xl font-bold">Ready to make yours?</h2>
        <p className="mt-3 text-fgmute">Free · 30 seconds · No login required</p>
        <Link href="/create" className="mt-6 inline-block rounded-lg bg-accent px-8 py-3 text-base font-semibold text-bg hover:bg-accent2">
          Make yours →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">Use cases</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/for/spotify-playlist-poster" className="text-fg hover:text-accent">Spotify playlist poster</Link></li>
                <li><Link href="/for/music-personality" className="text-fg hover:text-accent">Music personality test</Link></li>
                <li><Link href="/for/playlist-cover-art-generator" className="text-fg hover:text-accent">Playlist cover art</Link></li>
                <li><Link href="/for/instagram-music-graphics" className="text-fg hover:text-accent">Instagram music graphics</Link></li>
                <li><Link href="/for/tiktok-playlist-poster" className="text-fg hover:text-accent">TikTok playlist poster</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">Product</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/create" className="text-fg hover:text-accent">Create a poster</Link></li>
                <li><Link href="/pricing" className="text-fg hover:text-accent">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">Legal</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/privacy" className="text-fg hover:text-accent">Privacy policy</Link></li>
                <li><Link href="/terms" className="text-fg hover:text-accent">Terms of service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-fgmute">tastegraph</h3>
              <p className="mt-3 text-sm text-fgmute">Your Spotify playlist, but make it a magazine.</p>
            </div>
          </div>
          <div className="mt-10 text-xs text-fgfaint">
            © {new Date().getFullYear()} tastegraph. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
