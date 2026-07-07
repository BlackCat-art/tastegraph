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
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-lg bg-accent/30 px-6 py-3 text-sm font-semibold text-fgfaint"
          >
            Generate your poster →
          </button>
        </div>
        <p className="mt-3 text-xs text-fgfaint">
          Button is disabled in Day 1 build. Coming in Day 2.
        </p>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature title="URL-first" body="Paste a Spotify link. No screenshots, no copy-pasting song names." />
          <Feature title="Editorial-grade" body="3 templates designed by indie designers. Magazine proportions, not Spotify Wrapped knockoffs." />
          <Feature title="Built for sharing" body="1:1 for IG feed, 3:4 for portrait, 9:16 for Stories. Every export looks like an editorial print." />
        </div>
      </section>

      <footer className="mt-auto pt-24 text-xs text-fgfaint">
        © {new Date().getFullYear()} tastegraph. Built for people who still buy vinyl.
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
