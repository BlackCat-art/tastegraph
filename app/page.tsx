import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-16">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-accent text-lg leading-none">▣</span>
          <span>tastegraph</span>
          <span className="text-fgfaint">/</span>
          <span className="text-fgmute font-medium">v0.1</span>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium tracking-wide text-accent2">
          Coming soon · MVP
        </span>
      </header>

      <section className="mt-24 sm:mt-32">
        <h1 className="text-balance text-5xl font-bold leading-[1.05] tracking-tight text-fg sm:text-6xl">
          Your Spotify playlist,
          <br />
          but make it a <span className="text-accent2">magazine.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-fgmute">
          Paste a playlist link. We&apos;ll score your taste across five
          dimensions, then render a poster you&apos;d actually want to post.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 rounded-lg border border-line bg-bgcard px-4 py-3 font-mono text-sm text-fgmute">
            https://open.spotify.com/playlist/...
          </div>
          <Link
            href="/create"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent2"
          >
            Try the parser →
          </Link>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature title="URL-first" body="Paste a Spotify link. No screenshots, no copy-pasting song names." />
          <Feature title="Editorial-grade" body="3 templates designed by indie designers. Magazine proportions, not Spotify Wrapped knockoffs." />
          <Feature title="Built for sharing" body="1:1 for IG feed, 3:4 for portrait, 9:16 for Stories. Every export looks like an editorial print." />
        </div>
      </section>

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

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-line bg-bgcard p-5">
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-fgmute">{body}</p>
    </div>
  );
}
