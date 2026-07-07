import { NextRequest, NextResponse } from "next/server";
import { parseSpotify } from "@/lib/parsers/spotify";
import type { ParseResult } from "@/lib/types";

// Day 2 only wires up Spotify. The other branches return 501 explicitly so
// the UI can show "coming soon" without us accidentally breaking anything.
export async function POST(req: NextRequest) {
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

  // Rate limit: 30 parses / IP / 10 min. (Day 2 dev setting — tighten later.)
  // Trae should install @upstash/ratelimit + @upstash/redis on Day 7.
  // For now, this is a no-op stub.
  // const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  // await checkRateLimit(ip);

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
