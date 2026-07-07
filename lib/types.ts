// Shared types used by parsers and the API route.
// Keep this file tiny — no logic, no imports.

export type Platform = "spotify" | "apple-music" | "youtube-music" | "manual";

export type Track = {
  name: string;
  artist: string;
  albumArtUrl?: string;
  releaseYear?: number;
  spotifyId?: string;
};

export type Playlist = {
  title: string;
  owner?: string;
  platform: Platform;
  trackCount: number;
  tracks: Track[];
};

export type ParseSuccess = {
  ok: true;
  playlist: Playlist;
};

export type ParseError = {
  ok: false;
  error: {
    code:
      | "INVALID_URL"
      | "UNSUPPORTED_PLATFORM"
      | "PARSE_FAILED"
      | "EMPTY_PLAYLIST"
      | "TOO_SHORT"      // < 5 tracks
      | "TOO_MANY"       // > 200 tracks
      | "FETCH_FAILED"
      | "RATE_LIMITED"
      | "INTERNAL";
    message: string;
    retryable: boolean;
  };
};

export type ParseResult = ParseSuccess | ParseError;
