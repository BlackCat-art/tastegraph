import type { ScoreResult } from "@/lib/types";

export type PosterKind = "editorial" | "modernist" | "risograph";

// D6+ 新增:aspectRatio 类型 + Tailwind class 映射
export type AspectRatio = "1:1" | "3:4" | "9:16";

export const ASPECT_RATIO_CLASS: Record<AspectRatio, string> = {
  "1:1":  "aspect-square",
  "3:4":  "aspect-[3/4]",
  "9:16": "aspect-[9/16]",
};

// D6+ 新增:fontFamily 类型 + Tailwind class 映射
export type FontFamily = "serif" | "mono" | "sans";

export const FONT_FAMILY_CLASS: Record<FontFamily, string> = {
  serif: "font-serif",
  mono:  "font-mono",
  sans:  "font-sans",
};

// Editorial 调色板(对照 PRD §5.5 模板 1)
export const EDITORIAL_ACCENTS = {
  orange: "#E5681A",
  green:  "#6B7F3A",
  blue:   "#2C5F8D",
} as const;
export type EditorialAccent = keyof typeof EDITORIAL_ACCENTS;

// Modernist 调色板(对照 PRD §5.5 模板 2,4 色高饱和纯色)
export const MODERNIST_ACCENTS = {
  red:    "#E63946",
  blue:   "#1D4ED8",
  green:  "#16A34A",
  yellow: "#FACC15",
} as const;
export type ModernistAccent = keyof typeof MODERNIST_ACCENTS;

// Risograph 调色板(对照 PRD §5.5 模板 3,每套 = 主色 main + 套印色 accent)
export const RISOGRAPH_PALETTES = {
  "blue-red":   { main: "#2C5F8D", accent: "#D24B27" },
  "pink-green": { main: "#E89BAE", accent: "#5A8C3D" },
  "black-red":  { main: "#1A1A1A", accent: "#D24B27" },
} as const;
export type RisographPalette = keyof typeof RISOGRAPH_PALETTES;

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
  accent2?: string;
  aspectRatio?: AspectRatio;
  fontFamily?: FontFamily;
};

export type PosterTemplateProps = PosterData & PosterStyle;
