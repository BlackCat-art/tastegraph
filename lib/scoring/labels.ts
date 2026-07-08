import type { ScoredTrack, Scores, MoodVector } from "../types";

export interface LabelRule {
  name: string;
  priority: number;          // higher = evaluated first
  conditions: {
    dominantGenres?: string[];
    mainstreamRange?: [number, number];
    minDiscoveryIndex?: number;
    maxDiscoveryIndex?: number;
    primaryMood?: "happy" | "sad" | "energetic" | "chill" | "mixed"
                | Array<"happy" | "sad" | "energetic" | "chill" | "mixed">;
    dominantDecade?: number[];
    minGenreBalance?: number;
    minDecadeSpread?: number;
  };
  oneLinerTemplate: string;  // string with {placeholders}: {decade}, {genre}, {mood}
  defaultColors: { bg: string; fg: string; accent: string };
}

export const LABEL_RULES: LabelRule[] = [
  // ---------- Tier 1 (priority 100+): very specific ----------
  {
    name: "Indie's Last Romantic",
    priority: 110,
    conditions: {
      dominantGenres: ["Indie"],
      mainstreamRange: [30, 65],
      primaryMood: "sad",
      dominantDecade: [2010],
    },
    oneLinerTemplate: "You live in {decade} and cry to synthesizers.",
    defaultColors: { bg: "#F5E9E0", fg: "#3D2C2E", accent: "#C76B6B" },
  },
  {
    name: "Mainstream Sunshine",
    priority: 108,
    conditions: {
      dominantGenres: ["Pop"],
      mainstreamRange: [70, 100],
      primaryMood: "happy",
      dominantDecade: [2010, 2020],
    },
    oneLinerTemplate: "Mainstream but make it indie.",
    defaultColors: { bg: "#FFF6D6", fg: "#332B12", accent: "#FFB43D" },
  },
  {
    name: "Modern Beatmaker",
    priority: 107,
    conditions: {
      dominantGenres: ["Hip-Hop"],
      minDiscoveryIndex: 50,
    },
    oneLinerTemplate: "Always first to know who's dropping on Friday.",
    defaultColors: { bg: "#0E0E16", fg: "#F2F2F2", accent: "#7CFF6B" },
  },
  {
    name: "Late Night Explorer",
    priority: 106,
    conditions: {
      dominantGenres: ["Electronic"],
      primaryMood: "chill",
      minDecadeSpread: 50,
    },
    oneLinerTemplate: "The city's asleep and your library is alive.",
    defaultColors: { bg: "#0B1E33", fg: "#DCE7F2", accent: "#5BC0EB" },
  },
  {
    name: "K-Pop Stan",
    priority: 105,
    conditions: {
      dominantGenres: ["K-Pop"],
      mainstreamRange: [60, 100],
    },
    oneLinerTemplate: "You know the fanchants and the birthdays.",
    defaultColors: { bg: "#FFE6F0", fg: "#3A1F2D", accent: "#FF6FAE" },
  },
  {
    name: "K-Pop Curious",
    priority: 80,
    conditions: {
      dominantGenres: ["K-Pop"],   // weaker threshold (no mainstreamRange required)
    },
    oneLinerTemplate: "You keep saying 'just one more K-pop video'.",
    defaultColors: { bg: "#FFF0F5", fg: "#3A1F2D", accent: "#FFA3C5" },
  },
  {
    name: "Old Soul",
    priority: 104,
    conditions: {
      dominantDecade: [1960, 1970, 1980],
      maxDiscoveryIndex: 30,
    },
    oneLinerTemplate: "If it's older than you, it's worth a listen.",
    defaultColors: { bg: "#E8DCC4", fg: "#2C2317", accent: "#A8763E" },
  },
  {
    name: "Workout Warrior",
    priority: 103,
    conditions: {
      primaryMood: "energetic",
      minGenreBalance: 50,
    },
    oneLinerTemplate: "Your tempo is your therapist.",
    defaultColors: { bg: "#FFEDE0", fg: "#2A1306", accent: "#FF4D2A" },
  },
  {
    name: "Country Roads",
    priority: 102,
    conditions: {
      dominantGenres: ["Country"],
      dominantDecade: [2010, 2020],
    },
    oneLinerTemplate: "Take me home (and let me stay a while).",
    defaultColors: { bg: "#EFE3CB", fg: "#2A1E10", accent: "#8B6F47" },
  },
  {
    name: "Melancholy Romantic",
    priority: 101,
    conditions: {
      primaryMood: "sad",
      mainstreamRange: [20, 60],
      minGenreBalance: 40,
    },
    oneLinerTemplate: "You apologize to friends for the songs you send.",
    defaultColors: { bg: "#E0E7EE", fg: "#1F2933", accent: "#6E8CA0" },
  },

  // ---------- Tier 2 (priority 50-99): loosely specific ----------
  {
    name: "Bedroom Pop Darling",
    priority: 90,
    conditions: {
      dominantGenres: ["Indie"],
      primaryMood: "chill",
      dominantDecade: [2010, 2020],
    },
    oneLinerTemplate: "Tracked it in your bedroom at 3am. We can tell.",
    defaultColors: { bg: "#FBEFF4", fg: "#3D1F33", accent: "#E58FB1" },
  },
  {
    name: "Coffee Shop Regular",
    priority: 88,
    conditions: {
      dominantGenres: ["Folk", "Indie"],
      primaryMood: "chill",
      mainstreamRange: [35, 70],
    },
    oneLinerTemplate: "You tip well and you read on the bar.",
    defaultColors: { bg: "#F3E9D2", fg: "#3B2A14", accent: "#A07539" },
  },
  {
    name: "Future Nostalgia",
    priority: 87,
    conditions: {
      minDecadeSpread: 70,
      primaryMood: "happy",
      dominantDecade: [1980, 1990],
    },
    oneLinerTemplate: "Dua taught you it's ok to love the 80s.",
    defaultColors: { bg: "#FFE3E3", fg: "#3A1414", accent: "#FF5C8A" },
  },
  {
    name: "Festival Junkie",
    priority: 86,
    conditions: {
      dominantGenres: ["Electronic"],
      primaryMood: "energetic",
      minDiscoveryIndex: 60,
    },
    oneLinerTemplate: "Your camping gear has glitter permanently fused into it.",
    defaultColors: { bg: "#0F0F1E", fg: "#FFF1A8", accent: "#B6FF3E" },
  },
  {
    name: "Latin Heat",
    priority: 85,
    conditions: {
      dominantGenres: ["Latin"],
      primaryMood: ["happy", "energetic"],
    },
    oneLinerTemplate: "Cumbia Tuesdays are a personality trait.",
    defaultColors: { bg: "#FFD7AE", fg: "#3D1A05", accent: "#F25C2A" },
  },
  {
    name: "Classically Inclined",
    priority: 84,
    conditions: {
      dominantGenres: ["Classical"],
    },
    oneLinerTemplate: "You pretend it's for focus. It's really just for you.",
    defaultColors: { bg: "#EFE9E0", fg: "#1F1A14", accent: "#7B5E2E" },
  },
  {
    name: "R&B Soulmate",
    priority: 83,
    conditions: {
      dominantGenres: ["R&B"],
      primaryMood: ["chill", "sad"],
    },
    oneLinerTemplate: "You have a note in your phone called 'songs for them'.",
    defaultColors: { bg: "#1A0E14", fg: "#F5D8E0", accent: "#D86C97" },
  },
  {
    name: "Sad Boi Hours",
    priority: 75,
    conditions: {
      primaryMood: "sad",
    },
    oneLinerTemplate: "It's not a phase, it's a Tuesday.",
    defaultColors: { bg: "#DDE3EA", fg: "#1F2A36", accent: "#7C95B3" },
  },
  {
    name: "Indie Sleaze Survivor",
    priority: 73,
    conditions: {
      dominantGenres: ["Indie"],
      dominantDecade: [2000, 2010],
    },
    oneLinerTemplate: "You wore skinny jeans before it was ironic.",
    defaultColors: { bg: "#1B1418", fg: "#F2DCE6", accent: "#E04F8A" },
  },

  // ---------- Tier 3 (priority 20-49): catch-all near-defaults ----------
  {
    name: "Stereotypical Hipster",
    priority: 40,
    conditions: {
      minDecadeSpread: 60,
      mainstreamRange: [0, 40],
    },
    oneLinerTemplate: "If it's popular, you've already moved on.",
    defaultColors: { bg: "#E8E4D8", fg: "#21201A", accent: "#6A7F3A" },
  },
  {
    name: "Eclectic Wanderer",
    priority: 30,
    conditions: {
      minGenreBalance: 70,
      minDecadeSpread: 70,
    },
    oneLinerTemplate: "Range is the point.",
    defaultColors: { bg: "#EFEAE2", fg: "#1F1A14", accent: "#C18959" },
  },

  // ---------- Tier 4 (priority 0-19): defaults ----------
  {
    name: "Steady Listener",
    priority: 1,
    conditions: {},
    oneLinerTemplate: "You know what you like, and you're not sorry.",
    defaultColors: { bg: "#F2F2F2", fg: "#1A1A1A", accent: "#5A5A5A" },
  },
];

export interface PlaylistContext {
  tracks: ScoredTrack[];
  scores: Scores;
}

export interface MatchedLabel {
  rule: LabelRule;
  // Filled-in template for personalityOneLiner.
  oneLiner: string;
  // Derived metrics used for fill-in below.
  primaryMood: "happy" | "sad" | "energetic" | "chill" | "mixed";
  dominantDecade?: number;
  topGenre?: string;
}

function derivePrimaryMood(tracks: ScoredTrack[]): MatchedLabel["primaryMood"] {
  const m = tracks
    .map((t) => t.mood)
    .filter((m): m is MoodVector => !!m)
    .reduce(
      (acc, v) => ({
        happy: acc.happy + v.happy,
        sad: acc.sad + v.sad,
        energetic: acc.energetic + v.energetic,
        chill: acc.chill + v.chill,
      }),
      { happy: 0, sad: 0, energetic: 0, chill: 0 }
    );
  const n = tracks.filter((t) => t.mood).length || 1;
  const mean = {
    happy: m.happy / n,
    sad: m.sad / n,
    energetic: m.energetic / n,
    chill: m.chill / n,
  };
  if (mean.happy - mean.sad > 10) return "happy";
  if (mean.sad - mean.happy > 10) return "sad";
  if (mean.energetic >= mean.chill && mean.energetic > 50) return "energetic";
  if (mean.chill >= mean.energetic && mean.chill > 50) return "chill";
  return "mixed";
}

function deriveDominantDecade(tracks: ScoredTrack[]): number | undefined {
  const counts = new Map<number, number>();
  for (const t of tracks) {
    if (typeof t.releaseYear !== "number") continue;
    const d = Math.floor(t.releaseYear / 10) * 10;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  if (counts.size === 0) return undefined;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

function dominantGenres(tracks: ScoredTrack[]): string[] {
  // 35% threshold on primary+secondary (secondary weighted 0.5).
  const counts = new Map<string, number>();
  for (const t of tracks) {
    if (t.primaryGenre) counts.set(t.primaryGenre, (counts.get(t.primaryGenre) ?? 0) + 1);
    if (t.secondaryGenre) counts.set(t.secondaryGenre, (counts.get(t.secondaryGenre) ?? 0) + 0.5);
  }
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  const threshold = total * 0.35;
  return Array.from(counts.entries())
    .filter(([, c]) => c >= threshold)
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);
}

export function matchLabel(ctx: PlaylistContext): MatchedLabel {
  const genres = dominantGenres(ctx.tracks);
  const topGenre = genres[0];
  const primaryMood = derivePrimaryMood(ctx.tracks);
  const dominantDecade = deriveDominantDecade(ctx.tracks);

  // Sort rules by priority descending.
  const sortedRules = [...LABEL_RULES].sort((a, b) => b.priority - a.priority);

  let matched: LabelRule | null = null;
  for (const rule of sortedRules) {
    if (matches(rule.conditions, ctx, { topGenre, primaryMood, dominantDecade })) {
      matched = rule;
      break;
    }
  }
  // Even if no rule matches, we have a default priority-1 rule, so this is always non-null.
  matched = matched ?? LABEL_RULES[LABEL_RULES.length - 1];

  return {
    rule: matched,
    primaryMood,
    dominantDecade,
    topGenre,
    oneLiner: fillTemplate(matched.oneLinerTemplate, {
      decade: dominantDecade ?? "your favorite era",
      genre: topGenre ?? "your genre",
      mood: primaryMood,
    }),
  };
}

function matches(
  c: LabelRule["conditions"],
  ctx: PlaylistContext,
  derived: { topGenre?: string; primaryMood: MatchedLabel["primaryMood"]; dominantDecade?: number }
): boolean {
  if (c.dominantGenres && c.dominantGenres.length > 0) {
    if (!derived.topGenre || !c.dominantGenres.includes(derived.topGenre)) return false;
  }
  if (c.mainstreamRange) {
    const [lo, hi] = c.mainstreamRange;
    if (ctx.scores.mainstreamScore < lo || ctx.scores.mainstreamScore > hi) return false;
  }
  if (c.minDiscoveryIndex !== undefined && ctx.scores.discoveryIndex < c.minDiscoveryIndex) return false;
  if (c.maxDiscoveryIndex !== undefined && ctx.scores.discoveryIndex > c.maxDiscoveryIndex) return false;
  if (c.minGenreBalance !== undefined && ctx.scores.genreBalance < c.minGenreBalance) return false;
  if (c.minDecadeSpread !== undefined && ctx.scores.decadeSpread < c.minDecadeSpread) return false;
  if (c.primaryMood !== undefined) {
    const moods = Array.isArray(c.primaryMood) ? c.primaryMood : [c.primaryMood];
    if (!moods.includes(derived.primaryMood)) return false;
  }
  if (c.dominantDecade && c.dominantDecade.length > 0) {
    if (derived.dominantDecade === undefined) return false;
    if (!c.dominantDecade.includes(derived.dominantDecade)) return false;
  }
  return true;
}

function fillTemplate(t: string, vars: Record<string, string | number>): string {
  return t.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
