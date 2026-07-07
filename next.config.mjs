const nextConfig = {
  // Cloudflare Pages' auto-detection deploys Next.js as a Pages Function
  // (using `wrangler deploy` under the hood). It reads `.next/` (not `out/`),
  // so we drop the static export config and let Next.js produce a normal
  // SSR/build output.
  //
  // See: prompts/day-01-fix-cf-pages.md for the full migration story.
  images: { unoptimized: true },
};

export default nextConfig;
