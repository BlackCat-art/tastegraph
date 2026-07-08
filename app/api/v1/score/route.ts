import { NextRequest, NextResponse } from "next/server";
import { scorePlaylist, type ScoreRequest } from "@/lib/scoring";
import type { Track } from "@/lib/types";

// Cross-runtime env access:
//   - CF Workers (production): @opennextjs/cloudflare's getCloudflareContext().
//     This package is injected into the build's .open-next/ cache at deploy time,
//     NOT present in local node_modules — dynamic import + try/catch handles it.
//   - Local Node dev: process.env (only OPENAI_* apply, no AI binding).
async function getEnv(): Promise<Record<string, any>> {
  try {
    const mod: any = await import("@opennextjs/cloudflare");
    if (typeof mod.getCloudflareContext === "function") {
      const ctx = await mod.getCloudflareContext({ async: true });
      if (ctx?.env) return ctx.env as Record<string, any>;
    }
  } catch {
    // Module not available (local dev). Fall through.
  }
  return process.env as unknown as Record<string, any>;
}

export async function POST(req: NextRequest) {
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
