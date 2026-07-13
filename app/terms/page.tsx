import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — tastegraph",
  description: "tastegraph terms of service. Rules, subscription terms, and acceptable use for our Spotify playlist poster service.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of Service — tastegraph", description: "tastegraph terms of service. Rules, subscription terms, and acceptable use for our Spotify playlist poster service." },
  twitter: { card: "summary_large_image", title: "Terms of Service — tastegraph", description: "tastegraph terms of service. Rules, subscription terms, and acceptable use for our Spotify playlist poster service." },
};

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-fg">Terms of Service</h1>
        <p className="mt-2 text-sm text-fgmute">Last updated: July 13, 2026</p>

        {/* TOC */}
        <nav className="mt-8 rounded-lg border border-line bg-bgcard p-4 not-prose">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-fgmute mb-3">Contents</h2>
          <ol className="space-y-1 text-sm">
            <li><a href="#acceptance" className="text-fg hover:text-accent">1. Acceptance of Terms</a></li>
            <li><a href="#description" className="text-fg hover:text-accent">2. Description of Service</a></li>
            <li><a href="#account" className="text-fg hover:text-accent">3. Account Registration</a></li>
            <li><a href="#acceptable-use" className="text-fg hover:text-accent">4. Acceptable Use</a></li>
            <li><a href="#payment" className="text-fg hover:text-accent">5. Subscription and Payment (Pro Tier)</a></li>
            <li><a href="#ip" className="text-fg hover:text-accent">6. Intellectual Property</a></li>
            <li><a href="#disclaimers" className="text-fg hover:text-accent">7. Disclaimers and Limitation of Liability</a></li>
            <li><a href="#termination" className="text-fg hover:text-accent">8. Termination</a></li>
            <li><a href="#governing-law" className="text-fg hover:text-accent">9. Governing Law</a></li>
            <li><a href="#contact" className="text-fg hover:text-accent">10. Contact</a></li>
          </ol>
        </nav>

        <h2 id="acceptance">1. Acceptance of Terms</h2>
        <p>By accessing or using tastegraph (the "Service"), you agree to be bound by these Terms. If you disagree with any part, do not use the Service.</p>

        <h2 id="description">2. Description of Service</h2>
        <p>tastegraph is a web application that:</p>
        <ul>
          <li>Parses publicly accessible Spotify playlists</li>
          <li>Computes a 5-dimension personality score based on track metadata</li>
          <li>Renders an editorial-style poster (PNG) for sharing</li>
        </ul>
        <p>We do not store the rendered posters on our servers after download.</p>

        <h2 id="account">3. Account Registration</h2>
        <p>To use the Service beyond anonymous rate limits, sign in with your email via magic link. You are responsible for the security of your email account and any session cookies issued.</p>

        <h2 id="acceptable-use">4. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Submit Spotify playlists you do not have the right to share</li>
          <li>Use the Service for spam, harassment, or illegal purposes</li>
          <li>Reverse-engineer, decompile, or attempt to extract source code</li>
          <li>Circumvent rate limits (e.g., via rotating IPs, automation)</li>
          <li>Submit content that infringes third-party intellectual property</li>
        </ul>
        <p>We reserve the right to suspend or terminate access for violations.</p>

        <h2 id="payment">5. Subscription and Payment (Pro Tier)</h2>
        <ul>
          <li>Pro tier is billed monthly ($4.99) or yearly ($39) via Stripe.</li>
          <li>Subscriptions auto-renew unless cancelled before the renewal date.</li>
          <li>Cancellation takes effect at the end of the current billing period; no pro-rata refunds.</li>
          <li>Refunds: 30-day money-back guarantee for first-time subscribers. Email hi@tastegraph.app.</li>
          <li>Price changes: we will notify you 30 days before any price change.</li>
        </ul>

        <h2 id="ip">6. Intellectual Property</h2>
        <ul>
          <li><strong>Your content</strong>: You retain all rights to playlists you submit and posters you generate.</li>
          <li><strong>Our content</strong>: The Service, including its design, templates, scoring algorithm, and source code, is owned by tastegraph and protected by copyright.</li>
          <li><strong>Generated posters</strong>: You own the output. You may use it commercially (e.g., sell merchandise, post on social media, print). We retain no rights.</li>
        </ul>

        <h2 id="disclaimers">7. Disclaimers and Limitation of Liability</h2>
        <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR THAT SCORES ARE ACCURATE OR FIT FOR ANY PARTICULAR PURPOSE.</p>
        <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, TASTEGRAPH SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE.</p>

        <h2 id="termination">8. Termination</h2>
        <ul>
          <li><strong>By you</strong>: stop using the Service at any time. Email hi@tastegraph.app to delete your account.</li>
          <li><strong>By us</strong>: we may suspend or terminate access for violation of these Terms or for operational reasons. Active Pro subscribers will receive 30 days' notice.</li>
        </ul>

        <h2 id="governing-law">9. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of Delaware, USA. Disputes will be resolved in the courts of Delaware.</p>

        <h2 id="contact">10. Contact</h2>
        <p>Questions about these Terms? Email us at <a href="mailto:hi@tastegraph.app">hi@tastegraph.app</a>.</p>
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