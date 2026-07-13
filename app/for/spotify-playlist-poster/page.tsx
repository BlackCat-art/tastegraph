import type { Metadata } from "next";
import Link from "next/link";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import type { PosterTemplateProps } from "@/app/_components/poster/types";

export const metadata: Metadata = {
  title: "Spotify Playlist Poster — Make Magazine-Worthy Art in 30 Seconds | tastegraph",
  description: "Paste a Spotify playlist link, get a magazine-style poster of your music taste. Editorial templates, 1:1 / 3:4 / 9:16 ratios, free.",
  alternates: { canonical: "/for/spotify-playlist-poster" },
  openGraph: {
    title: "Spotify Playlist Poster — Make Magazine-Worthy Art in 30 Seconds | tastegraph",
    description: "Paste a Spotify playlist link, get a magazine-style poster of your music taste. Editorial templates, 1:1 / 3:4 / 9:16 ratios, free.",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spotify Playlist Poster — Make Magazine-Worthy Art in 30 Seconds | tastegraph",
    description: "Paste a Spotify playlist link, get a magazine-style poster of your music taste. Editorial templates, 1:1 / 3:4 / 9:16 ratios, free.",
  },
};

const sample: PosterTemplateProps = {
  kind: "editorial",
  accent: "orange",
  aspectRatio: "1:1",
  fontFamily: "serif",
  personalityLabel: "The Centerpiece",
  personalityOneLiner: "Equidistant from every genre — the friend whose taste is everyone's taste.",
  summary: "A balanced 50-track mix: equal parts pop, indie, and R&B, leaning on decade-spanning classics and a few new discoveries.",
  scores: { decadeSpread: 50, genreBalance: 50, mainstreamScore: 50, moodSpectrum: 50, discoveryIndex: 50 },
  playlistTitle: "Mixed Tape Vol. 1",
  trackCount: 50,
};

const faqs = [
  { q: "Do I need to log in to make a poster?", a: "No. Anonymous users get 3 free posters per day, per IP. Sign in for 5 per day, or upgrade to Pro for unlimited." },
  { q: "How long does it take?", a: "About 30 seconds. Paste the link, wait for parse + score, pick a template, hit download." },
  { q: "Can I use a private Spotify playlist?", a: "Not directly — tastegraph reads public Spotify playlist pages. For private playlists, switch them to public briefly (or to 'Collaborative') and paste the link." },
  { q: "What's the output format?", a: "PNG, 1080px on the long edge for free, 2160px (4K) for Pro. Aspect ratios: 1:1, 3:4, 9:16." },
  { q: "Do you keep my playlist data?", a: "We cache the track list for up to 24 hours to speed up repeated renders. We don't share with third parties, ever." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
};

export default function SpotifyPlaylistPosterPage() {
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
          Turn any Spotify playlist into a magazine-worthy poster
        </h1>
        <p className="mt-6 text-lg text-fgmute sm:text-xl">
          Paste a Spotify link. We score your taste across five dimensions, then render a poster you'd actually want to post.
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
        <h2>Why a Spotify playlist deserves a poster</h2>
        <p>Your Spotify playlist is a 50-track time capsule — the songs you kept, the moods you rotated through, the year you discovered each band. Most apps treat it as a list. We treat it as a magazine spread.</p>
        <p>tastegraph reads your playlist's metadata — track names, artists, popularity, release years — and computes five personality dimensions. You get a personality label (think "Late Night Explorer" or "Mainstream Sunshine"), a one-liner, and a visual poster that actually looks like editorial print, not a Spotify Wrapped knockoff.</p>

        <h2>How the scoring works</h2>
        <p>Five dimensions, each 0-100:</p>
        <ul>
          <li><strong>Decade spread</strong>: how varied your release years are (1972 through 2025 = high)</li>
          <li><strong>Genre balance</strong>: how evenly distributed your genres are</li>
          <li><strong>Mainstream score</strong>: how close to Billboard Hot 100</li>
          <li><strong>Mood spectrum</strong>: the range of sad / happy / energetic / chill across your mix</li>
          <li><strong>Discovery index</strong>: how much underground / new-artist music you have</li>
        </ul>
        <p>The output is a radar chart on the poster, plus a personality label picked from 20+ rules (D6 spec).</p>

        <h2>Three templates, three ratios</h2>
        <p>Editorial (serif, magazine-grid), Modernist (mono, primary-color blocks), Risograph (sans, two-color overlay). Each available in 1:1, 3:4, and 9:16. That's 135 combinations — pick what fits the platform you're posting to.</p>
        <p>Free tier includes all three templates at 1080p with a small watermark. Pro ($4.99/month) gives you 4K and no watermark. See the pricing page for details.</p>
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
