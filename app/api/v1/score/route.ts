import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { scorePlaylist, type ScoreRequest } from "@/lib/scoring";
import type { Track } from "@/lib/types";

async function getEnv(): Promise<Record<string, any>> {
  if (typeof getCloudflareContext === "function") {
    try {
      const ctx = await getCloudflareContext({ async: true });
      if (ctx?.env) return ctx.env as Record<string, any>;
    } catch {
      // Cloudflare runtime not available (local dev). Fall through.
    }
  }
  return process.env as unknown as Record<string, any>;
}

export async function POST(req: NextRequest) {
  // D8 rate limit
  const { getOptionalUser } = await import("@/lib/auth/session");
  const { getRateLimitKey, checkRateLimit } = await import("@/lib/stripe/rate-limit");
  const user = await getOptionalUser(req);
  const rateKey = getRateLimitKey({ userId: user?.id, ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1" });
  const rateResult = checkRateLimit(rateKey, user?.plan ?? null);
  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "RATE_LIMITED",
          message: `Rate limit exceeded. Try again in ${Math.ceil((rateResult.resetAt - Date.now()) / 1000)}s.`,
          retryable: true,
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(user?.plan === "pro" ? 30 : user?.plan === "free" ? 10 : 3),
          "X-RateLimit-Remaining": String(rateResult.remaining),
          "X-RateLimit-Reset": String(rateResult.resetAt),
        },
      },
    );
  }

  let body: { tracks?: Track[]; playlistTitle?: string; playlistId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: "INVALID_INPUT", message: "Invalid JSON body.", retryable: false } },
      { status: 400 }
    );
  }

  const env = await getEnv();
  const outcome = await scorePlaylist(body as ScoreRequest, env as any);

  if (!outcome.ok) {
    const status =
      outcome.error!.code === "TOO_SHORT" || outcome.error!.code === "TOO_MANY" ? 400 :
      outcome.error!.code === "NO_LLM_PROVIDER" ? 503 :
      outcome.error!.code === "LLM_FAILED" ? 502 :
      500;
    return NextResponse.json({ ok: false, error: outcome.error }, { status });
  }

  return NextResponse.json({ ok: true, ...outcome.result }, { status: 200 });
}
