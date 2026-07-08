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

// === Day 3 additions ===

export type MoodVector = {
  happy: number;     // 0..100
  sad: number;       // 0..100
  energetic: number; // 0..100
  chill: number;     // 0..100
};

export type Genre = "Indie" | "Pop" | "Hip-Hop" | "R&B" | "Electronic"
        | "Rock" | "Jazz" | "Classical" | "Country" | "Folk" | "Latin" | "K-Pop";

export type ScoredTrack = Track & {
  popularity?: number;     // 0..100, Spotify-sourced
  releaseYear?: number;    // 4-digit year
  primaryGenre?: Genre;
  secondaryGenre?: Genre;
  mood?: MoodVector;
};

export type Scores = {
  decadeSpread: number;
  genreBalance: number;
  mainstreamScore: number;
  moodSpectrum: number;
  discoveryIndex: number;
};

export type ScoreResult = {
  scores: Scores;
  personalityLabel: string;
  personalityOneLiner: string;
  summary: string;
  fromCache?: boolean;
  debug?: {
    parsedAt: string;
    modelUsed: string;
    providerUsed: "cf-ai" | "openai" | "heuristic";
    neuronEstimate?: number;
  };
};

export type ScoreError = {
  ok: false;
  error: {
    code:
      | "INVALID_INPUT"
      | "TOO_SHORT"
      | "TOO_MANY"
      | "NO_LLM_PROVIDER"
      | "LLM_FAILED"
      | "INTERNAL";
    message: string;
    retryable: boolean;
  };
};

export type ScoreResponse = ({ ok: true } & ScoreResult) | ({ ok: false } & ScoreError);
