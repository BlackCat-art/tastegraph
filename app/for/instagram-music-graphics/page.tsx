import type { Metadata } from "next";
import Link from "next/link";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import type { PosterTemplateProps } from "@/app/_components/poster/types";

export const metadata: Metadata = {
  title: "Instagram Music Graphics — Editorial Posters for IG Feed & Stories | tastegraph",
  description: "Make your Spotify playlist Instagram-ready. Editorial templates in 1:1, 3:4, 9:16. Free, no login, 30 seconds.",
  alternates: { canonical: "/for/instagram-music-graphics" },
  openGraph: {
    title: "Instagram Music Graphics — Editorial Posters for IG Feed & Stories | tastegraph",
    description: "Make your Spotify playlist Instagram-ready. Editorial templates in 1:1, 3:4, 9:16. Free, no login, 30 seconds.",
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
    title: "Instagram Music Graphics — Editorial Posters for IG Feed & Stories | tastegraph",
    description: "Make your Spotify playlist Instagram-ready. Editorial templates in 1:1, 3:4, 9:16. Free, no login, 30 seconds.",
    images: [
      "https://tastegraph.org/opengraph-image",
    ],
  },
};

const sample: PosterTemplateProps = {
  kind: "modernist",
  accent: "red",
  aspectRatio: "1:1",
  fontFamily: "mono",
  personalityLabel: "Data Driven",
  personalityOneLiner: "You optimize everything. Even your playlists.",
  summary: "A tight, high-mainstream selection. Low discovery but high quality control — every track is a deliberate choice.",
  scores: { decadeSpread: 45, genreBalance: 35, mainstreamScore: 70, moodSpectrum: 55, discoveryIndex: 25 },
  playlistTitle: "Curation Station",
  trackCount: 28,
};

const faqs = [
  { q: "What's the best aspect ratio for IG?", a: "1:1 for feed posts (still the most common). 3:4 for portrait feed (more screen real estate, IG's preferred 2024+ format). 9:16 for Stories / Reels." },
  { q: "Can I add my Instagram handle to the poster?", a: "Not in MVP. The poster is content-first, branding-light — your IG handle goes in the caption, not the image." },
  { q: "Does tastegraph work with Instagram's music sticker?", a: "Indirectly — you can't auto-attach a Spotify track to an IG story from tastegraph, but you can post the poster as a story and add the Spotify link via the music sticker yourself." },
  { q: "Will the radar chart be visible on a phone screen?", a: "Yes, the 5-dimension radar scales with the canvas. On 9:16, the radar is below the personality label and remains readable at typical phone-screen sizes." },
  { q: "Can I batch-generate graphics for multiple playlists?", a: "Not via UI yet. Each poster takes ~30 seconds; for batch work, sign in and use the 5/day free tier or upgrade to Pro." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
};

export default function InstagramMusicGraphicsPage() {
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
          Make your playlist Instagram-ready
        </h1>
        <p className="mt-6 text-lg text-fgmute sm:text-xl">
          Editorial-style music graphics in 1:1, 3:4, and 9:16. Built for the Instagram feed, Stories, and Reels cover.
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
        <h2>Why a custom music graphic for IG?</h2>
        <p>A screenshot of a Spotify playlist on Instagram looks like a screenshot of a Spotify playlist. Editorial-style graphics — typography, color blocking, a personality label — look like content. The difference matters for accounts that care about aesthetic (bookstagram, musicstagram, design accounts, etc.).</p>
        <p>tastegraph renders the same poster in three ratios specifically for Instagram:</p>
        <ul>
          <li><strong>1:1</strong> for feed posts (1080×1080)</li>
          <li><strong>3:4</strong> for portrait feed (1080×1440, the new "preferred" IG ratio)</li>
          <li><strong>9:16</strong> for Stories / Reels covers (1080×1920)</li>
        </ul>

        <h2>Built for the algorithm</h2>
        <p>Instagram compresses anything over ~1080px, so 4K output is mostly wasted bandwidth for the platform. tastegraph's free tier is 1080px on the long edge — exactly what IG needs. Pro tier is 4K for print use (zines, posters, frames).</p>

        <h2>The typography matters</h2>
        <p>A modernist template with mono type and primary-color blocks reads as "design-conscious." An editorial template with serif type reads as "literary / music-press." The visual language signals to your audience what kind of taste you have before they even read the title.</p>

        <h2>How to use</h2>
        <ol>
          <li>Paste your Spotify playlist link</li>
          <li>Pick a template + ratio</li>
          <li>Download the PNG</li>
          <li>Post to IG — caption with the personality label</li>
        </ol>
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
