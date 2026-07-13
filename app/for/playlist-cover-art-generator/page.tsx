import type { Metadata } from "next";
import Link from "next/link";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import type { PosterTemplateProps } from "@/app/_components/poster/types";

export const metadata: Metadata = {
  title: "Playlist Cover Art Generator — Editorial-Style Playlist Art | tastegraph",
  description: "Generate editorial-style cover art for any playlist. Three templates, three aspect ratios, free. No Photoshop needed.",
  alternates: { canonical: "/for/playlist-cover-art-generator" },
  openGraph: {
    title: "Playlist Cover Art Generator — Editorial-Style Playlist Art | tastegraph",
    description: "Generate editorial-style cover art for any playlist. Three templates, three aspect ratios, free. No Photoshop needed.",
    type: "article",
    images: [
      {
        url: "https://tastegraph.18571729942.workers.dev/opengraph-image",
        width: 1200,
        height: 630,
        alt: "tastegraph — Your Spotify playlist, but make it a magazine.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playlist Cover Art Generator — Editorial-Style Playlist Art | tastegraph",
    description: "Generate editorial-style cover art for any playlist. Three templates, three aspect ratios, free. No Photoshop needed.",
    images: [
      "https://tastegraph.18571729942.workers.dev/opengraph-image",
    ],
  },
};

const sample: PosterTemplateProps = {
  kind: "editorial",
  accent: "green",
  aspectRatio: "3:4",
  fontFamily: "serif",
  personalityLabel: "Mainstream Sunshine",
  personalityOneLiner: "You know every hit. No shame in your game.",
  summary: "Drawn to top-40 pop and hip-hop. Tight decade focus, low discovery, high mainstream alignment.",
  scores: { decadeSpread: 30, genreBalance: 20, mainstreamScore: 90, moodSpectrum: 60, discoveryIndex: 15 },
  playlistTitle: "Top Hits 2025",
  trackCount: 50,
};

const faqs = [
  { q: "Can I upload my own images to the cover?", a: "Not in MVP — tastegraph is a typography-first product, not an image collage tool. The 135 template / ratio / palette combinations are designed to cover most aesthetic preferences." },
  { q: "What size should I pick?", a: "1:1 for Spotify / Apple Music cover art. 3:4 for portrait IG posts. 9:16 for IG Stories, TikTok, Reels, and YouTube Shorts." },
  { q: "Is the cover art unique every time?", a: "Same playlist + same template = same cover (deterministic). Different playlists always produce different covers." },
  { q: "Can I use the cover commercially?", a: "Yes. You own the output. tastegraph does not retain copyright on generated posters." },
  { q: "How do I download just the cover (without radar chart)?", a: "The radar chart is part of the editorial and modernist templates. The risograph template's 1:1 ratio is the closest to a 'cover only' layout." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
};

export default function PlaylistCoverArtGeneratorPage() {
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
          Editorial-style playlist cover art, in 30 seconds
        </h1>
        <p className="mt-6 text-lg text-fgmute sm:text-xl">
          Generate cover art for any playlist. Three templates, three aspect ratios, no Photoshop needed.
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
        <h2>Why default playlist covers are generic</h2>
        <p>Spotify's default cover art is a 4-color gradient that everyone recognizes. For most playlists it's fine — but for the playlists you actually share (the ones you made for friends, or for a moment) you want something more.</p>
        <p>tastegraph generates editorial-style cover art that has typography, color blocking, and your playlist's personality baked in. Not AI-generated imagery — typographic, like a real magazine cover.</p>

        <h2>Three templates, three ratios</h2>
        <ul>
          <li><strong>Editorial</strong>: serif type, magazine grid, three accent colors</li>
          <li><strong>Modernist</strong>: mono type, primary-color blocks, four accent choices</li>
          <li><strong>Risograph</strong>: sans type, two-color overlay, three palette choices</li>
        </ul>
        <p>Each template ships in 1:1 (cover art / IG feed), 3:4 (portrait), and 9:16 (Stories / Reels / TikTok).</p>

        <h2>What's the difference vs Canva?</h2>
        <p>Canva is general-purpose; tastegraph is playlist-specific. The typography choices, color palettes, and layout are all tuned to music metadata — your playlist title and a 5-dimension radar chart are baked in. Canva templates for "playlist cover" are fine but generic; tastegraph's output feels like an editorial print piece.</p>

        <h2>Output specs</h2>
        <ul>
          <li>1080px on the long edge (Free)</li>
          <li>2160px / 4K (Pro)</li>
          <li>PNG with no transparency</li>
          <li>Includes your playlist title, track count, and personality label</li>
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
          <div className="grid gap-8 sm:grid-cols-3">
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
