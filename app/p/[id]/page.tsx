// D10 海报分享页 — Server Component
// 独立可访问,无登录要求,带完整 OG meta(opengraph-image.tsx 自动接管)

import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getShare } from "@/lib/share/kv";
import { isValidShareId } from "@/lib/share/nanoid";
import PosterTemplate from "@/app/_components/poster/PosterTemplate";
import {
  EDITORIAL_ACCENTS,
  MODERNIST_ACCENTS,
  RISOGRAPH_PALETTES,
  type EditorialAccent,
  type ModernistAccent,
  type RisographPalette,
} from "@/app/_components/poster/types";
import type { SharedPosterData } from "@/lib/share/types";

type Params = { id: string };

// 动态 metadata(每个 share page 自己的 og:title/description)
export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isValidShareId(id)) return { title: "tastegraph" };

  const data = await getShare(id);
  if (!data) return { title: "Share not found · tastegraph" };

  return {
    title: `${data.personalityLabel} · tastegraph`,
    description: data.personalityOneLiner,
    openGraph: {
      title: `${data.personalityLabel} — ${data.playlistTitle}`,
      description: data.personalityOneLiner,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${data.personalityLabel} — ${data.playlistTitle}`,
      description: data.personalityOneLiner,
    },
  };
}

function resolveAccentHex(data: SharedPosterData): { hex: string; hex2?: string } {
  if (data.kind === "editorial") {
    return { hex: EDITORIAL_ACCENTS[data.accent as EditorialAccent] };
  }
  if (data.kind === "modernist") {
    return { hex: MODERNIST_ACCENTS[data.accent as ModernistAccent] };
  }
  // risograph
  const palette = RISOGRAPH_PALETTES[data.accent as RisographPalette];
  return { hex: palette.main, hex2: palette.accent };
}

export default async function SharePage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  if (!isValidShareId(id)) notFound();

  const data = await getShare(id);
  if (!data) notFound();

  const { hex, hex2 } = resolveAccentHex(data);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {/* Brand bar — small,低调,不抢海报焦点 */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-semibold tracking-wide text-accent hover:text-accent2"
        >
          tastegraph
        </Link>
        <span className="text-xs text-fgmute">a Spotify playlist personality</span>
      </div>

      {/* 海报主体 */}
      <div className="flex justify-center">
        <PosterTemplate
          kind={data.kind}
          accent={hex}
          accent2={hex2}
          aspectRatio={data.aspectRatio}
          fontFamily={data.fontFamily}
          personalityLabel={data.personalityLabel}
          personalityOneLiner={data.personalityOneLiner}
          summary={data.summary}
          scores={data.scores}
          playlistTitle={data.playlistTitle}
          trackCount={data.trackCount}
        />
      </div>

      {/* Personality 文字摘要(海报里也有,但 share 页再讲一遍给 share 出去的访客看) */}
      <section className="mt-8 space-y-4 text-center">
        <h1 className="text-2xl font-bold text-fg sm:text-3xl">
          {data.personalityLabel}
        </h1>
        <p className="text-base text-fgmute sm:text-lg">
          {data.personalityOneLiner}
        </p>
        <p className="mx-auto max-w-xl text-sm text-fgmute/80">{data.summary}</p>
        <div className="pt-2 text-xs uppercase tracking-widest text-fgmute/60">
          {data.playlistTitle} · {data.trackCount} tracks
        </div>
      </section>

      {/* CTA — Make yours */}
      <section className="mt-10 flex flex-col items-center gap-3">
        <Link
          href="/create"
          className="rounded-lg bg-accent px-8 py-3 text-base font-semibold text-bg shadow-md transition-colors hover:bg-accent2"
        >
          Make yours →
        </Link>
        <p className="text-xs text-fgmute">
          Free · 30 seconds · No login required
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-line mt-16">
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
