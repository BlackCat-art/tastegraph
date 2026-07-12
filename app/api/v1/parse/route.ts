import { NextRequest, NextResponse } from "next/server";
import { parseSpotify } from "@/lib/parsers/spotify";
import type { ParseResult } from "@/lib/types";

// Day 2 only wires up Spotify. The other branches return 501 explicitly so
// the UI can show "coming soon" without us accidentally breaking anything.
export async function POST(req: NextRequest) {
  // D8 rate limit — per-day, per PRD §5.8.3
  const { getOptionalUser } = await import("@/lib/auth/session");
  const { checkRateLimit, getIdentifier } = await import("@/lib/rate-limit/upstash");
  const user = await getOptionalUser(req);
  const { id } = getIdentifier(req, user?.id ?? null);
  const rl = await checkRateLimit({ identifier: id, bucket: 'parse', plan: user?.plan ?? null });

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

  let body: { type?: string; payload?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_URL", message: "Invalid JSON body.", retryable: false } },
      { status: 400 }
    );
  }

  const { type, payload } = body ?? {};
  if (typeof payload !== "string" || payload.length > 2048) {
    return NextResponse.json(
      { error: { code: "INVALID_URL", message: "Missing or oversized payload.", retryable: false } },
      { status: 400 }
    );
  }

  let result: ParseResult;
  switch (type) {
    case "url":
      // Day 2: only Spotify is wired up. We try Spotify first; otherwise 501.
      result = await parseSpotify(payload);
      // If Spotify rejected because URL format was wrong, but it might be Apple/YT
      // → fall through to "unsupported platform" 501.
      if (!result.ok && result.error.code === "INVALID_URL") {
        return NextResponse.json(
          { error: { code: "UNSUPPORTED_PLATFORM", message: "Apple Music and YouTube Music parsing lands in Day 6. For now, paste a Spotify link.", retryable: false } },
          { status: 501 }
        );
      }
      break;

    case "image":
    case "text":
      return NextResponse.json(
        { error: { code: "UNSUPPORTED_PLATFORM", message: "Screenshot and manual text inputs land in Day 6. For now, paste a Spotify link.", retryable: false } },
        { status: 501 }
      );

    default:
      return NextResponse.json(
        { error: { code: "INVALID_URL", message: "Unknown input type. Expected: url | image | text.", retryable: false } },
        { status: 400 }
      );
  }

  // Wrap result in a uniform envelope for the client.
  if (result.ok) {
    return NextResponse.json(result, { status: 200 });
  }
  const status =
    result.error.code === "INVALID_URL" ? 400 :
    result.error.code === "TOO_SHORT" ? 400 :
    result.error.code === "RATE_LIMIT" ? 429 :
    502; // PARSE_FAILED, FETCH_FAILED, EMPTY_PLAYLIST, INTERNAL
  return NextResponse.json({ error: result.error }, { status });
}