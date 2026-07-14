import type { Metadata } from "next";
import Link from "next/link";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import type { PosterTemplateProps } from "@/app/_components/poster/types";

export const metadata: Metadata = {
  title: "Music Personality Test — What Does Your Playlist Say About You? | tastegraph",
  description: "Find your music personality in 30 seconds. Paste a Spotify playlist, get a label, one-liner, and 5-dimension breakdown. Free, no login.",
  alternates: { canonical: "/for/music-personality" },
  openGraph: {
    title: "Music Personality Test — What Does Your Playlist Say About You? | tastegraph",
    description: "Find your music personality in 30 seconds. Paste a Spotify playlist, get a label, one-liner, and 5-dimension breakdown. Free, no login.",
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
    title: "Music Personality Test — What Does Your Playlist Say About You? | tastegraph",
    description: "Find your music personality in 30 seconds. Paste a Spotify playlist, get a label, one-liner, and 5-dimension breakdown. Free, no login.",
    images: [
      "https://tastegraph.org/opengraph-image",
    ],
  },
};

const sample: PosterTemplateProps = {
  kind: "editorial",
  accent: "blue",
  aspectRatio: "9:16",
  fontFamily: "serif",
  personalityLabel: "Late Night Explorer",
  personalityOneLiner: "You live in 2014 and cry to synthesizers.",
  summary: "A nostalgic soul drawn to indie and synth-pop from the late 2000s through mid-2010s. High discovery, low mainstream, strong mood depth.",
  scores: { decadeSpread: 80, genreBalance: 90, mainstreamScore: 15, moodSpectrum: 40, discoveryIndex: 95 },
  playlistTitle: "Midnight Drift",
  trackCount: 32,
};

const faqs = [
  { q: "How many personality labels are there?", a: "20+ in MVP, with the rules engine in lib/scoring/labels.ts. We're adding more as users generate unusual combinations." },
  { q: "Can I get a different label for the same playlist?", a: "No — the same input always produces the same label. The scoring is deterministic." },
  { q: "Does the test work for non-Spotify platforms?", a: "Spotify is the primary supported platform. Apple Music and YouTube Music work for parsing but the personality labels are tuned to Spotify's track metadata." },
  { q: "What if my playlist is short (< 5 tracks)?", a: "We need at least 5 tracks to compute stable scores. The /api/v1/score route returns a TOO_SHORT error if your playlist is too small." },
  { q: "Is the test free?", a: "Yes. Anonymous users get 3 free personality tests per day. Sign in for 5 per day, or Pro for unlimited." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(f => ({ "@type": "Question", "name": f.q, "acceptedAnswer": { "@type": "Answer", "text": f.a } })),
};

export default function MusicPersonalityPage() {
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
          What does your playlist say about you?
        </h1>
        <p className="mt-6 text-lg text-fgmute sm:text-xl">
          A 30-second music personality test. Paste a Spotify playlist, get a label, a one-liner, and a 5-dimension radar chart.
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
        <h2>A music personality test that doesn't feel like a Buzzfeed quiz</h2>
        <p>Most "music personality" tests ask 30 multiple-choice questions and bucket you into 4 Myers-Brigs archetypes. tastegraph is different — your personality comes from the actual playlist, not a self-reported preference.</p>
        <p>We score five dimensions independently (decade spread, genre balance, mainstream score, mood spectrum, discovery index) and a rules engine maps the combination to one of 20+ labels. Same input, same output — no random questions to game.</p>

        <h2>What the labels mean</h2>
        <p>Labels are designed to be specific, not flattering. Examples:</p>
        <ul>
          <li>"The Centerpiece" — equidistant from every genre, the friend whose taste matches everyone</li>
          <li>"Late Night Explorer" — drawn to synth-pop and indie from the late 2000s, high discovery</li>
          <li>"Mainstream Sunshine" — you know every hit, no shame</li>
          <li>"Indie's Last Romantic" — bandcamp-circulation taste, vinyl at heart</li>
        </ul>

        <h2>How is this different from Spotify Wrapped?</h2>
        <p>Spotify Wrapped is a year-in-review you don't control. tastegraph works on any playlist, any time — your 3am sad playlist, your running playlist, the one you made for your ex in 2019. Each gets its own personality and its own poster.</p>

        <h2>Can I share my result?</h2>
        <p>Yes — every poster has a "Share" button that creates a public /p/&lt;id&gt; link with Open Graph meta tags. Paste the link on X, Reddit, or iMessage — it auto-expands to a preview card with the poster image and your personality label.</p>
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
