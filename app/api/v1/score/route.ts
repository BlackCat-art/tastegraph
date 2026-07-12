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
  // D8 rate limit — per-day, per PRD §5.8.3
  const { getOptionalUser } = await import("@/lib/auth/session");
  const { checkRateLimit, getIdentifier } = await import("@/lib/rate-limit/upstash");
  const user = await getOptionalUser(req);
  const { id } = getIdentifier(req, user?.id ?? null);
  const rl = await checkRateLimit({ identifier: id, bucket: 'score', plan: user?.plan ?? null });

  if (rl.limit !== Infinity && !rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'RATE_LIMIT',
          message: user
            ? `Free plan limited to ${rl.limit} renders per day. Upgrade to Pro for unlimited.`
            : `Free plan limited to ${rl.limit} renders per day. Sign in for 5/day, or upgrade to Pro.`,
          retryable: false,
          resetAt: rl.resetAt.toISOString(),
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(rl.limit),
          'X-RateLimit-Remaining': String(Math.max(0, rl.limit - rl.count)),
          'X-RateLimit-Reset': String(Math.floor(rl.resetAt.getTime() / 1000)),
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