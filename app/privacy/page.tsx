import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — tastegraph",
  description: "tastegraph privacy policy. How we collect, use, and protect your data when you use our Spotify playlist poster service.",
  alternates: { canonical: "/privacy" },
  openGraph: { title: "Privacy Policy — tastegraph", description: "tastegraph privacy policy. How we collect, use, and protect your data when you use our Spotify playlist poster service." },
  twitter: { card: "summary_large_image", title: "Privacy Policy — tastegraph", description: "tastegraph privacy policy. How we collect, use, and protect your data when you use our Spotify playlist poster service." },
};

export default function PrivacyPage() {
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

      {/* Article */}
      <article className="mx-auto max-w-3xl px-6 py-12 sm:py-16 prose prose-invert">
        <h1 className="text-4xl font-bold text-fg">Privacy Policy</h1>
        <p className="mt-2 text-sm text-fgmute">Last updated: July 13, 2026</p>

        {/* TOC */}
        <nav className="mt-8 rounded-lg border border-line bg-bgcard p-4 not-prose">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fgmute mb-3">Contents</h2>
          <ol className="space-y-1 text-sm">
            <li><a href="#intro" className="text-fg hover:text-accent">1. Introduction</a></li>
            <li><a href="#info-collected" className="text-fg hover:text-accent">2. Information We Collect</a></li>
            <li><a href="#use" className="text-fg hover:text-accent">3. How We Use Your Data</a></li>
            <li><a href="#storage" className="text-fg hover:text-accent">4. Data Storage and Security</a></li>
            <li><a href="#third-parties" className="text-fg hover:text-accent">5. Third-Party Services</a></li>
            <li><a href="#rights" className="text-fg hover:text-accent">6. Your Rights (GDPR / CCPA)</a></li>
            <li><a href="#children" className="text-fg hover:text-accent">7. Children's Privacy</a></li>
            <li><a href="#changes" className="text-fg hover:text-accent">8. Changes to This Policy</a></li>
            <li><a href="#contact" className="text-fg hover:text-accent">9. Contact</a></li>
          </ol>
        </nav>

        <h2 id="intro">1. Introduction</h2>
        <p>tastegraph ("we", "us", "our") operates the website tastegraph.app and the worker deployment at tastegraph.org (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.</p>
        <p>By using the Service, you agree to the collection and use of information in accordance with this policy.</p>

        <h2 id="info-collected">2. Information We Collect</h2>
        <p>We collect several types of information for various purposes to provide and improve our Service:</p>
        <p><strong>Personal Data</strong>: Email address (when you sign in via magic link). Spotify playlist URLs you submit to the parser.</p>
        <p><strong>Usage Data</strong>: Anonymized request counts for rate limiting (3 renders per day for anonymous IPs, 5 for signed-in free users, unlimited for Pro). Anonymous rate-limit identifiers are stored in Upstash Redis with daily TTL and are deleted automatically at UTC midnight.</p>
        <p><strong>Tracking Data</strong>: We do not use third-party analytics, advertising cookies, or tracking pixels. We may add Plausible Analytics in the future (privacy-friendly, no cookies) — see our Terms.</p>

        <h2 id="use">3. How We Use Your Data</h2>
        <p>tastegraph uses the collected data for:</p>
        <ul>
          <li>Providing the Service: parsing your Spotify playlist, computing personality scores, rendering the poster, generating a shareable link.</li>
          <li>Authentication: issuing magic-link emails and session JWTs.</li>
          <li>Rate limiting: preventing abuse (3 / 5 / unlimited renders per day depending on tier).</li>
          <li>Communicating with you: only when you contact us at hi@tastegraph.app.</li>
        </ul>
        <p>We do not sell your personal data to third parties.</p>

        <h2 id="storage">4. Data Storage and Security</h2>
        <ul>
          <li><strong>Database</strong>: Neon Postgres (us-east-1) for user accounts, sessions, and rate-limit state. Encrypted at rest.</li>
          <li><strong>Cache</strong>: Upstash Redis (AP Southeast 1) for poster share links (90-day TTL) and rate-limit counters (24-hour TTL).</li>
          <li><strong>Email</strong>: Resend for magic-link delivery. We do not store email content beyond what's needed to deliver the link.</li>
          <li><strong>Session tokens</strong>: HTTP-only cookies, JWT-signed (HS256, 30-day expiry).</li>
          <li><strong>Storage of exported posters</strong>: We do not store the rendered PNG. Download it on your device.</li>
        </ul>
        <p>We use commercially reasonable safeguards (TLS in transit, encryption at rest, least-privilege access) but cannot guarantee absolute security.</p>

        <h2 id="third-parties">5. Third-Party Services</h2>
        <p>We use the following third-party processors, each governed by their own privacy practices:</p>
        <ul>
          <li><strong>Spotify</strong> (parsing public playlist metadata via Open Graph / oEmbed)</li>
          <li><strong>Neon</strong> (Postgres hosting)</li>
          <li><strong>Upstash</strong> (Redis KV)</li>
          <li><strong>Resend</strong> (transactional email)</li>
          <li><strong>Cloudflare</strong> (hosting + image cache)</li>
          <li><strong>Stripe</strong> (subscription billing for Pro tier)</li>
        </ul>

        <h2 id="rights">6. Your Rights (GDPR / CCPA)</h2>
        <p>If you are in the EU, UK, or California, you have the right to:</p>
        <ul>
          <li><strong>Access</strong> the personal data we hold about you</li>
          <li><strong>Rectification</strong> of inaccurate data</li>
          <li><strong>Erasure</strong> ("right to be forgotten")</li>
          <li><strong>Restriction</strong> or <strong>objection</strong> to processing</li>
          <li><strong>Data portability</strong> (export your account data)</li>
          <li><strong>Withdraw consent</strong> at any time</li>
        </ul>
        <p>To exercise these rights, email hi@tastegraph.app. We respond within 30 days.</p>

        <h2 id="children">7. Children's Privacy</h2>
        <p>Our Service is not directed to children under 13 (COPPA) or 16 (GDPR). We do not knowingly collect personal data from children. If you believe a child has provided us data, contact hi@tastegraph.app and we will delete it.</p>

        <h2 id="changes">8. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date above. Continued use of the Service after changes constitutes acceptance.</p>

        <h2 id="contact">9. Contact</h2>
        <p>Questions about this privacy policy? Email us at <a href="mailto:hi@tastegraph.app">hi@tastegraph.app</a>.</p>
      </article>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="grid gap-8 sm:grid-cols-3">
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