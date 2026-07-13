// D10 /p/[id] 404 页面 — share link 不存在或过期(90 天 TTL)
import Link from "next/link";

export default function ShareNotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl">👻</div>
      <h1 className="mt-6 text-2xl font-bold text-fg">Share link not found</h1>
      <p className="mt-3 text-sm text-fgmute">
        This poster link may have expired (we keep them for 90 days) or never existed.
      </p>
      <Link
        href="/create"
        className="mt-8 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-bg hover:bg-accent2"
      >
        Create your own →
      </Link>
    </main>
  );
}
