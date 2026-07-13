// D10 POST /api/v1/share
// 接受 poster 数据,生成 ID 存 Upstash,返回 /p/<id>

import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { saveShare } from "@/lib/share/kv";
import { generateShareId } from "@/lib/share/nanoid";
import type { SharedPosterData, ShareCreateResponse } from "@/lib/share/types";

const EDITORIAL_ACCENTS = ["orange", "green", "blue"] as const;
const MODERNIST_ACCENTS = ["red", "blue", "green", "yellow"] as const;
const RISOGRAPH_PALETTES = ["blue-red", "pink-green", "black-red"] as const;
const KINDS = ["editorial", "modernist", "risograph"] as const;
const ASPECT_RATIOS = ["1:1", "3:4", "9:16"] as const;
const FONTS = ["serif", "mono", "sans"] as const;

function fail(code: string, message: string, status = 400) {
  return NextResponse.json<ShareCreateResponse>(
    { ok: false, error: { code, message } },
    { status },
  );
}

function isValidData(d: unknown): d is SharedPosterData {
  if (!d || typeof d !== "object") return false;
  const x = d as Record<string, unknown>;
  if (x.v !== 1) return false;
  if (!KINDS.includes(x.kind as (typeof KINDS)[number])) return false;
  if (!ASPECT_RATIOS.includes(x.aspectRatio as (typeof ASPECT_RATIOS)[number])) return false;
  if (!FONTS.includes(x.fontFamily as (typeof FONTS)[number])) return false;

  // accent must match kind
  if (x.kind === "editorial" && !EDITORIAL_ACCENTS.includes(x.accent as (typeof EDITORIAL_ACCENTS)[number])) return false;
  if (x.kind === "modernist" && !MODERNIST_ACCENTS.includes(x.accent as (typeof MODERNIST_ACCENTS)[number])) return false;
  if (x.kind === "risograph" && !RISOGRAPH_PALETTES.includes(x.accent as (typeof RISOGRAPH_PALETTES)[number])) return false;

  if (typeof x.playlistTitle !== "string" || x.playlistTitle.length === 0 || x.playlistTitle.length > 200) return false;
  if (typeof x.trackCount !== "number" || x.trackCount < 1 || x.trackCount > 10000) return false;
  if (typeof x.personalityLabel !== "string" || x.personalityLabel.length === 0 || x.personalityLabel.length > 80) return false;
  if (typeof x.personalityOneLiner !== "string" || x.personalityOneLiner.length > 300) return false;
  if (typeof x.summary !== "string" || x.summary.length > 500) return false;

  if (!x.scores || typeof x.scores !== "object") return false;
  const s = x.scores as Record<string, unknown>;
  for (const k of ["decadeSpread", "genreBalance", "mainstreamScore", "moodSpectrum", "discoveryIndex"]) {
    if (typeof s[k] !== "number" || s[k]! < 0 || s[k]! > 100) return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  // 强制走 Cloudflare env(本地 dev 也走 process.env 回退)
  void getCloudflareContext;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("INVALID_JSON", "Request body must be valid JSON.");
  }

  if (!isValidData(body)) {
    return fail("INVALID_DATA", "Poster data is missing or invalid.");
  }

  // 简单的 storage 上限(防滥用): 单个 free 用户每天最多 5 个 share
  // 跟 D9 parse/score rate limit 共享 Redis key 前缀,但用独立 bucket
  try {
    const { getOptionalUser } = await import("@/lib/auth/session");
    const { checkRateLimit, getIdentifier } = await import("@/lib/rate-limit/upstash");
    const user = await getOptionalUser(req);
    const { id } = getIdentifier(req, user?.id ?? null);
    // Pro 无限,Free 5/天(用 'share' bucket)
    const rl = await checkRateLimit({ identifier: id, bucket: "share", plan: user?.plan ?? null });
    if (rl.limit !== Infinity && !rl.allowed) {
      return NextResponse.json<ShareCreateResponse>(
        {
          ok: false,
          error: {
            code: "RATE_LIMIT",
            message: `Free plan limited to ${rl.limit} shares per day. Upgrade to Pro for unlimited.`,
          },
        },
        { status: 429 },
      );
    }
  } catch (e) {
    // rate limit 失败不阻塞 share(防御性,不要因为 rate limit 挂掉让用户无法分享)
    console.error("share rate limit check failed:", e);
  }

  const id = generateShareId();
  try {
    await saveShare(id, body);
  } catch (e) {
    console.error("saveShare failed:", e);
    return fail("STORAGE_FAILED", "Could not save share data. Please try again.", 500);
  }

  // 构造 /p/<id> URL — 优先用环境变量配置的 BASE_URL,回退到 req.url
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    new URL(req.url).origin;

  return NextResponse.json<ShareCreateResponse>({
    ok: true,
    id,
    url: `${baseUrl}/p/${id}`,
  });
}
