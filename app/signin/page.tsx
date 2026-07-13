/**
 * Sign-in error fallback page
 *
 * /api/v1/auth/verify 失败时(缺少 token / token 无效 / token 过期)
 * redirect 到这里显示错误信息 + 引导用户回 /create 重试
 */

import Link from "next/link";

const messages: Record<string, string> = {
  missing_token: "Missing sign-in token. Please request a new link from /create.",
  invalid_token: "Invalid or already-used sign-in token. Please request a new link.",
  expired_token: "Sign-in link has expired. Please request a new link from /create.",
  missing_verify: "Verification cookie expired or missing. Please request a new link from /create.",
  invalid_verify: "Verification token invalid or expired. Please request a new link from /create.",
  unknown: "Something went wrong. Please try again from /create.",
};

export const dynamic = "force-dynamic";

export default async function SignInErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params.error ?? "unknown";
  const message = messages[error] ?? messages.unknown;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg text-fg">
      <div className="max-w-md w-full border border-line rounded-lg p-8 bg-bgcard">
        <h1 className="text-xl font-semibold mb-4">Sign in failed</h1>
        <p className="text-sm text-fgmute mb-6">{message}</p>
        <a
          href="/create"
          className="inline-block px-4 py-2 bg-fg text-bg rounded-md text-sm hover:opacity-80"
        >
          Back to create
        </a>
      </div>

      <footer className="border-t border-line mt-16 w-full">
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
