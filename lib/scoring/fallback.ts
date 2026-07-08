// Heuristic fallback for genre + mood classification when LLM is unavailable
// or returns malformed output. ~70% accuracy vs ~92% for the LLM.
// Used by lib/scoring/index.ts as a graceful degradation path.

import type { ScoredTrack, Genre, MoodVector } from "../types";

const GENRE_KEYWORDS: Record<Genre, string[]> = {
  "Indie":      ["indie", "alt-rock", "alternative", "lo-fi", "lofi", "shoegaze",
                  "dream pop", "bedroom pop", "indie rock", "indie pop", "math rock"],
  "Pop":        ["pop", "dance pop", "electropop", "synth-pop", "teen pop"],
  "Hip-Hop":    ["rap", "hip-hop", "hiphop", "trap", "drill", "boom bap", "grime", "rapper"],
  "R&B":        ["r&b", "rnb", "soul", "neo-soul", "funk", "contemporary r&b"],
  "Electronic": ["edm", "electronic", "house", "techno", "trance", "dubstep",
                  "drum and bass", "dnb", "synthwave", "vaporwave", "edm"],
  "Rock":       ["rock", "hard rock", "punk", "metal", "grunge", "classic rock",
                  "post-punk", "britpop", "garage rock"],
  "Jazz":       ["jazz", "bebop", "swing", "fusion", "smooth jazz", "nu-jazz", "blues"],
  "Classical":  ["classical", "orchestra", "symphony", "sonata", "concerto",
                  "chamber", "baroque", "romantic era", "opus"],
  "Country":    ["country", "nashville", "outlaw country", "country pop", "bluegrass"],
  "Folk":       ["folk", "acoustic", "singer-songwriter", "americana", "traditional folk"],
  "Latin":      ["latin", "reggaeton", "salsa", "bachata", "cumbia", "bossa nova",
                  "latin pop", "urbano", "merengue"],
  "K-Pop":      ["k-pop", "kpop", "korean pop", "idol"],
};

const MOOD_KEYWORDS: Record<keyof MoodVector, string[]> = {
  happy:     ["happy", "joy", "celebration", "feel good", "good vibes", "sunshine",
              "beach", "summer", "dance", "smile", "shiny", "bright"],
  sad:       ["sad", "melancholy", "tears", "heartbreak", "lonely", "rain",
              "miss you", "goodbye", "broken", "somber", "grief"],
  energetic: ["energy", "pump", "hype", "workout", "running", "motivation",
              "pump up", "fight", "power", "intense", "speed"],
  chill:     ["chill", "relax", "calm", "ambient", "study", "sleep", "lofi",
              "spa", "morning", "coffee", "lo-fi", "peaceful"],
};

function normalize(s: string): string {
  return s.toLowerCase();
}

export function heuristicGenre(track: { name: string; artist: string }): Genre | null {
  const text = normalize(`${track.name} ${track.artist}`);
  // Tally per-genre hits; pick the highest; ties broken by array order in GENRES.
  let best: Genre | null = null;
  let bestHits = 0;
  for (const genre of Object.keys(GENRE_KEYWORDS) as Genre[]) {
    let hits = 0;
    for (const kw of GENRE_KEYWORDS[genre]) {
      if (text.includes(kw)) hits++;
    }
    if (hits > bestHits) {
      bestHits = hits;
      best = genre;
    }
  }
  return best;
}

export function heuristicGenreForBatch(tracks: ScoredTrack[]): ScoredTrack[] {
  return tracks.map((t) => {
    if (t.primaryGenre) return t;
    const g = heuristicGenre(t);
    return { ...t, primaryGenre: g ?? undefined };
  });
}

export function heuristicMood(track: { name: string; artist: string }): MoodVector {
  const text = normalize(`${track.name} ${track.artist}`);
  const v: MoodVector = { happy: 25, sad: 25, energetic: 25, chill: 25 };
  for (const dim of Object.keys(MOOD_KEYWORDS) as Array<keyof MoodVector>) {
    for (const kw of MOOD_KEYWORDS[dim]) {
      if (text.includes(kw)) v[dim] += 15;       // additive; clamp later
    }
  }
  // Normalize each component to 0..100 (do not rescale to sum=100; preserve relative differences).
  return {
    happy: Math.min(100, v.happy),
    sad: Math.min(100, v.sad),
    energetic: Math.min(100, v.energetic),
    chill: Math.min(100, v.chill),
  };
}

export function heuristicMoodForBatch(tracks: ScoredTrack[]): ScoredTrack[] {
  return tracks.map((t) => (t.mood ? t : { ...t, mood: heuristicMood(t) }));
}
