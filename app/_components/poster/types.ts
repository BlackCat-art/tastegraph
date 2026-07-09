import type { ScoreResult } from "@/lib/types";

export type PosterKind = "editorial" | "modernist" | "risograph";

// Editorial 调色板(对照 PRD §5.5 模板 1)
export const EDITORIAL_ACCENTS = {
  orange: "#E5681A",  // 默认暖橙
  green:  "#6B7F3A",  // 森绿
  blue:   "#2C5F8D",  // 冷蓝
} as const;
export type EditorialAccent = keyof typeof EDITORIAL_ACCENTS;

export type PosterData = {
  personalityLabel: string;
  personalityOneLiner: string;
  summary: string;
  scores: ScoreResult["scores"];
  playlistTitle: string;
  trackCount: number;
};

export type PosterStyle = {
  kind: PosterKind;
  accent: string;
};

export type PosterTemplateProps = PosterData & PosterStyle;
