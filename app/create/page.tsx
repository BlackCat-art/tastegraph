"use client";

import { useState } from "react";

type Result =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; title: string; trackCount: number }
  | { kind: "err"; code: string; message: string };

export default function CreatePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setResult({ kind: "loading" });
    try {
      const res = await fetch("/api/v1/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url", payload: url }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setResult({
          kind: "ok",
          title: data.playlist.title,
          trackCount: data.playlist.tracks.length,
        });
      } else {
        const err = data.error ?? { code: "INTERNAL", message: "Unknown error" };
        setResult({ kind: "err", code: err.code, message: err.message });
      }
    } catch (e: any) {
      setResult({
        kind: "err",
        code: "INTERNAL",
        message: e?.message ?? "Network error",
      });
    }
  }

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-2xl px-6 py-16">
      <header className="flex items-center gap-2 text-sm">
        <a href="/" className="text-fgfaint hover:text-fgmute">← back</a>
        <span className="text-fgfaint ml-2">/ create</span>
      </header>

      <h1 className="mt-12 text-3xl font-bold tracking-tight text-fg">
        Paste your playlist link.
      </h1>
      <p className="mt-2 text-fgmute">
        Today: <span className="text-accent2">Spotify only</span>. Apple Music,
        YouTube Music, screenshot and manual input land in Day 6.
      </p>

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://open.spotify.com/playlist/..."
          className="flex-1 rounded-lg border border-line bg-bgcard px-4 py-3 font-mono text-sm text-fg placeholder:text-fgfaint focus:border-accent focus:outline-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={result.kind === "loading" || !url}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-30 hover:bg-accent2"
        >
          {result.kind === "loading" ? "Parsing…" : "Parse →"}
        </button>
      </form>

      {result.kind === "ok" && (
        <div className="mt-8 rounded-lg border border-line bg-bgcard p-5">
          <div className="text-xs uppercase tracking-wide text-accent2">Parsed</div>
          <h2 className="mt-2 text-xl font-semibold text-fg">{result.title}</h2>
          <p className="mt-1 text-sm text-fgmute">
            {result.trackCount} tracks. Templates land in Day 4 — for now we
            just verify the parser.
          </p>
        </div>
      )}

      {result.kind === "err" && (
        <div className="mt-8 rounded-lg border border-red-500/30 bg-red-500/5 p-5">
          <div className="text-xs uppercase tracking-wide text-red-400">
            {result.code}
          </div>
          <p className="mt-2 text-sm text-fg">{result.message}</p>
        </div>
      )}
    </main>
  );
}
