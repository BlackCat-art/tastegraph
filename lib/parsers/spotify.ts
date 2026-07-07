// Spotify public-playlist parser.
//
// Strategy:
//   1. Validate the URL and extract the 22-char base62 playlist ID.
//   2. Fetch https://open.spotify.com/embed/playlist/{ID} (server-rendered HTML, no JS).
//   3. Pull playlist title from <meta property="og:title">.
//   4. Pull tracks from the embedded hydration JSON (Spotify embeds track data
//      in a <script> blob — the exact selector/key path varies; this is the
//      fragile bit that Day 2 must make robust).
//   5. Cap at 200 tracks, reject if < 5.
//
// IMPORTANT: This scrape is against a Spotify-public embed endpoint. Do not
// add request signing, do not use OAuth, do not hit any non-public endpoint.
// If we ever get rate-limited, surface it cleanly via ParseError.

import * as cheerio from "cheerio";
import type { ParseResult, Track, Playlist } from "../types";

const SPOTIFY_PLAYLIST_ID_RE = /^[a-zA-Z0-9]{22}$/;
const EMBED_URL = (id: string) =>
  `https://open.spotify.com/embed/playlist/${id}`;

/** Extract a Spotify playlist ID from any URL or URI form the user pastes. */
export function extractSpotifyPlaylistId(input: string): string | null {
  if (!input) return null;
  const s = input.trim();

  // spotify:playlist:<id>  (Spotify URI)
  const uriMatch = s.match(/^spotify:playlist:([a-zA-Z0-9]{22})$/);
  if (uriMatch) return uriMatch[1];

  // https://open.spotify.com/playlist/<id>?si=...
  // https://open.spotify.com/playlist/<id>
  // http://open.spotify.com/playlist/<id>
  // https://spotify.link/xxxx (short link — these redirect; we don't follow
  //   them in this function, the caller resolves them first)
  const urlMatch = s.match(/^https?:\/\/(?:open|play)\.spotify\.com\/playlist\/([a-zA-Z0-9]{22})(?:[/?].*)?$/);
  if (urlMatch) return urlMatch[1];

  // Mobile share: spotify://...  or  http://spotify.com/...
  // (same body as above, just different host — handled by regex below)
  const mobileMatch = s.match(/^[a-z.]*spotify\.com\/playlist\/([a-zA-Z0-9]{22})(?:[/?].*)?$/);
  if (mobileMatch) return mobileMatch[1];

  // Bare ID (advanced users)
  if (SPOTIFY_PLAYLIST_ID_RE.test(s)) return s;

  return null;
}

/** Resolve a short link (spotify.link/xxxx) to its full URL. Best-effort. */
export async function resolveShortLink(shortUrl: string): Promise<string | null> {
  try {
    const res = await fetch(shortUrl, { method: "GET", redirect: "manual" });
    const loc = res.headers.get("location");
    if (!loc) return null;
    return loc;
  } catch {
    return null;
  }
}

async function fetchEmbedHtml(playlistId: string): Promise<string> {
  const url = EMBED_URL(playlistId);
  const res = await fetch(url, {
    headers: {
      // Spotify's embed endpoint returns minimal HTML for non-browser UAs
      // if it sees suspicious clients. Pretend to be a real browser.
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      "Accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Sec-Fetch-Dest": "iframe",
    },
  });
  if (res.status === 429) {
    throw Object.assign(new Error("rate limited"), { code: "RATE_LIMITED" });
  }
  if (!res.ok) {
    throw Object.assign(new Error(`embed fetch returned ${res.status}`), {
      code: "FETCH_FAILED",
      status: res.status,
    });
  }
  return res.text();
}

/** Pull playlist title from <meta property="og:title">. */
function parseTitle($: cheerio.CheerioAPI): string {
  return (
    $('meta[property="og:title"]').attr("content")?.trim() ||
    $('meta[name="twitter:title"]').attr("content")?.trim() ||
    (() => {
      try {
        const nd = JSON.parse($("#__NEXT_DATA__").text() || "{}");
        const t = nd?.props?.pageProps?.state?.data?.entity?.title;
        return typeof t === "string" ? t.trim() : undefined;
      } catch {
        return undefined;
      }
    })() ||
    "Untitled playlist"
  );
}

/**
 * Pull tracks out of the Spotify embed HTML.
 *
 * This is the FRAGILE part. Trae Work CN must implement this carefully:
 *   - The HTML contains a <script> tag with a JSON blob that lists tracks.
 *   - The exact selector & key path must be discovered by inspecting the HTML.
 *   - Use 5 supplied test URLs (see §3) to verify the result is reasonable.
 *   - Use cheerio's `$('script').each(...)` to scan script bodies.
 *   - Use a permissive JSON.parse: try parse, on failure try a regex fallback.
 *
 * Output rules:
 *   - Each track: { name, artist, albumArtUrl?, releaseYear?, spotifyId? }
 *   - Dedup by (name + artist) before returning.
 *   - Strip empty entries (any of name/artist empty).
 */
function parseTracks($: cheerio.CheerioAPI): Track[] {
  const tracks: Track[] = [];
  const seen = new Set<string>();
  const MAX = 200;

  $("script").each((_, el) => {
    if (tracks.length >= MAX) return;
    const body = $(el).contents().text();
    if (!body || body.length > 1_000_000) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return;
    }

    const arrays: any[] = [];
    const visit = (node: unknown): void => {
      if (tracks.length >= MAX) return;
      if (Array.isArray(node)) {
        if (node.length > 0 && isTrackLike(node[0])) {
          arrays.push(node);
        }
        for (const item of node) visit(item);
      } else if (node && typeof node === "object") {
        for (const v of Object.values(node as Record<string, unknown>)) visit(v);
      }
    };
    visit(parsed);

    for (const arr of arrays) {
      for (const item of arr) {
        if (tracks.length >= MAX) break;
        const t = toTrack(item);
        if (!t) continue;
        const key = t.name.toLowerCase() + "|" + t.artist.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        tracks.push(t);
      }
    }
  });

  return tracks;
}

function isTrackLike(obj: any): boolean {
  if (!obj || typeof obj !== "object") return false;
  const hasTitle = typeof obj.title === "string" && obj.title.trim().length > 0;
  const hasName = typeof obj.name === "string" && obj.name.trim().length > 0;
  if (!hasTitle && !hasName) return false;
  const trackUri = typeof obj.uri === "string" && obj.uri.startsWith("spotify:track:");
  const entityType = obj.entityType === "track";
  if (trackUri || entityType) return true;
  const hasArtists = Array.isArray(obj.artists) && obj.artists.length > 0;
  if (hasName && hasArtists) return true;
  return false;
}

function toTrack(obj: any): Track | null {
  if (!obj || typeof obj !== "object") return null;
  const name = (
    typeof obj.title === "string" ? obj.title :
    typeof obj.name === "string" ? obj.name : ""
  ).trim();
  let artist = "";
  if (typeof obj.subtitle === "string") {
    artist = obj.subtitle.trim();
  } else if (Array.isArray(obj.artists)) {
    artist = obj.artists
      .map((a: any) => (typeof a === "string" ? a : a?.name))
      .filter((x: any) => typeof x === "string" && x.length > 0)
      .join(", ")
      .trim();
  }
  if (!name || !artist) return null;

  const track: Track = { name, artist };

  const uri = typeof obj.uri === "string" ? obj.uri : "";
  const uriMatch = uri.match(/^spotify:track:([a-zA-Z0-9]{22})$/);
  if (uriMatch) {
    track.spotifyId = uriMatch[1];
  } else if (typeof obj.id === "string" && /^[a-zA-Z0-9]{22}$/.test(obj.id)) {
    track.spotifyId = obj.id;
  }

  const art = obj.coverArt || obj.albumArt || obj.album?.images || obj.images;
  if (art) {
    const url = pickImageUrl(art);
    if (url) track.albumArtUrl = url;
  }

  const date = obj.releaseDate || obj.release_date;
  if (typeof date === "string") {
    const ym = date.match(/^(\d{4})/);
    if (ym) track.releaseYear = Number(ym[1]);
  } else if (typeof obj.releaseYear === "number") {
    track.releaseYear = obj.releaseYear;
  }

  return track;
}

function pickImageUrl(art: any): string | undefined {
  if (typeof art === "string") return art;
  if (Array.isArray(art)) {
    const found = art.find((x: any) => x && typeof x.url === "string");
    if (found) return found.url;
    if (art.length > 0 && typeof art[0] === "string") return art[0];
    return undefined;
  }
  if (art && typeof art === "object") {
    if (typeof art.url === "string") return art.url;
    if (Array.isArray(art.sources)) return pickImageUrl(art.sources);
  }
  return undefined;
}

/** Top-level entry point. Always returns a ParseResult — never throws. */
export async function parseSpotify(urlOrId: string): Promise<ParseResult> {
  try {
    // 1. Resolve short links first if needed.
    let resolved = urlOrId;
    if (/^https?:\/\/spotify\.link\//i.test(urlOrId)) {
      const next = await resolveShortLink(urlOrId);
      if (!next) {
        return {
          ok: false,
          error: {
            code: "FETCH_FAILED",
            message: "Could not resolve Spotify short link.",
            retryable: true,
          },
        };
      }
      resolved = next;
    }

    // 2. Extract playlist ID.
    const id = extractSpotifyPlaylistId(resolved);
    if (!id) {
      return {
        ok: false,
        error: {
          code: "INVALID_URL",
          message: "That doesn't look like a Spotify playlist link.",
          retryable: false,
        },
      };
    }

    // 3. Fetch embed page.
    let html: string;
    try {
      html = await fetchEmbedHtml(id);
    } catch (e: any) {
      if (e?.code === "RATE_LIMITED") {
        return {
          ok: false,
          error: {
            code: "RATE_LIMITED",
            message: "Spotify is rate-limiting us. Try again in a minute.",
            retryable: true,
          },
        };
      }
      return {
        ok: false,
        error: {
          code: "FETCH_FAILED",
          message: `Couldn't reach Spotify (HTTP ${e?.status ?? "?"}).`,
          retryable: true,
        },
      };
    }

    // 4. Parse.
    const $ = cheerio.load(html);
    const title = parseTitle($);
    const tracks = parseTracks($);

    if (tracks.length === 0) {
      return {
        ok: false,
        error: {
          code: "EMPTY_PLAYLIST",
          message: "This playlist is empty or we couldn't read its tracks.",
          retryable: true,
        },
      };
    }
    if (tracks.length < 5) {
      return {
        ok: false,
        error: {
          code: "TOO_SHORT",
          message: `Playlists need at least 5 tracks. This one has ${tracks.length}.`,
          retryable: false,
        },
      };
    }

    const playlist: Playlist = {
      title,
      owner: $('meta[property="og:description"]').attr("content") ?? undefined,
      platform: "spotify",
      trackCount: tracks.length,
      tracks: tracks.length > 200 ? tracks.slice(0, 200) : tracks,
    };

    return { ok: true, playlist };
  } catch (e: any) {
    return {
      ok: false,
      error: {
        code: "INTERNAL",
        message: "Something went wrong on our end. Try again in a moment.",
        retryable: true,
      },
    };
  }
}
