// Verbatim prompts from PRD §17.4. Do NOT edit wording. Add {tracks}/{scores}/etc placeholders as documented.

import type { ScoredTrack, Scores, Genre, MoodVector } from "../types";

const GENRES: Genre[] = [
  "Indie", "Pop", "Hip-Hop", "R&B", "Electronic", "Rock",
  "Jazz", "Classical", "Country", "Folk", "Latin", "K-Pop",
];

function tracksToBullets(tracks: ScoredTrack[]): string {
  // Track name + artist only — keeps input tokens predictable.
  return tracks.map((t, i) => `${i + 1}. ${t.name} - ${t.artist}`).join("\n");
}

export function buildGenrePrompt(tracks: ScoredTrack[]): string {
  return [
    "Given these songs, classify the genre of each track into one of these 12 categories:",
    `[${GENRES.join(", ")}]`,
    "",
    'Output JSON: { "tracks": [{"name": "...", "artist": "...", "primaryGenre": "...", "secondaryGenre": "..."}] }',
    "",
    "Songs:",
    tracksToBullets(tracks),
  ].join("\n");
}

export function buildMoodPrompt(tracks: ScoredTrack[]): string {
  return [
    "For each track, score it on 4 mood dimensions from 0-100:",
    "- happy (energetic, joyful)",
    "- sad (melancholic, longing)",
    "- energetic (intense, fast-paced)",
    "- chill (relaxed, ambient)",
    "",
    "Output JSON only.",
    "",
    "Tracks:",
    tracksToBullets(tracks),
  ].join("\n");
}

export function buildSummaryPrompt(opts: {
  scores: Scores;
  label: string;
  topTracks: ScoredTrack[];
}): string {
  return [
    "Given this user's music taste, write a 1-sentence punchy personality summary",
    'in the tone of "Stereogum headline". Use 2nd person, be witty, slightly mean',
    "but loveable. Examples:",
    '- "You live in 2014 and cry to synthesizers."',
    '- "Mainstream but make it indie."',
    "",
    "5-dim scores:",
    JSON.stringify(opts.scores, null, 2),
    "",
    `Personality label: ${opts.label}`,
    "",
    "Recent tracks:",
    opts.topTracks.slice(0, 8).map((t) => `${t.name} - ${t.artist}`).join("\n"),
  ].join("\n");
}

/** Expected JSON shape returned by CF Workers AI / OpenAI for each prompt. */
export type GenreLLMOutput = {
  tracks: Array<{
    name: string;
    artist: string;
    primaryGenre: Genre;
    secondaryGenre?: Genre;
  }>;
};

export type MoodLLMOutput = {
  tracks: Array<{
    name: string;
    artist: string;
    mood: MoodVector;
  }>;
};

export type SummaryLLMOutput = {
  summary: string;
};
