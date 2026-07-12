import { NextRequest, NextResponse } from "next/server";
import { parseSpotify } from "@/lib/parsers/spotify";
import type { ParseResult } from "@/lib/types";

// Day 2 only wires up Spotify. The other branches return 501 explicitly so
// the UI can show "coming soon" without us accidentally breaking anything.
export async function POST(req: NextRequest) {
  // D8 rate limit
  const { getOptionalUser } = await import("@/lib/auth/session");
  const { getRateLimitKey } = await import("@/lib/rate-limit/check");
  const { checkRateLimit } = await import("@/lib/rate-limit/upstash");
  const user = await getOptionalUser(req);
  const rateKey = getRateLimitKey({ userId: user?.id, ip: req.headers.get("x-forwarded-for") ?? "127.0.0.1" });
  const rateResult = await checkRateLimit(rateKey, user?.plan ?? null);
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
    result.error.code === "RATE_LIMITED" ? 429 :
    502; // PARSE_FAILED, FETCH_FAILED, EMPTY_PLAYLIST, INTERNAL
  return NextResponse.json({ error: result.error }, { status });
}