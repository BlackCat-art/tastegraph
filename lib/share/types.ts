// D10 分享页数据 schema
// 存 Upstash KV,JSON 编码,90 天 TTL

import type {
  PosterKind,
  EditorialAccent,
  ModernistAccent,
  RisographPalette,
  AspectRatio,
  FontFamily,
} from "@/app/_components/poster/types";

/**
 * 分享页需要的所有数据(<= 500 字节 JSON)
 * - 不含 track 列表(太大,share 也不需要)
 * - 不含 raw scores 之外的任何东西
 */
export type SharedPosterData = {
  // 版本号(用于将来 schema 迁移)
  v: 1;

  // 模板相关
  kind: PosterKind;
  accent: EditorialAccent | ModernistAccent | RisographPalette;
  aspectRatio: AspectRatio;
  fontFamily: FontFamily;

  // 海报文字
  playlistTitle: string;
  trackCount: number;
  personalityLabel: string;
  personalityOneLiner: string;
  summary: string;

  // 5 维评分(0-100)
  scores: {
    decadeSpread: number;
    genreBalance: number;
    mainstreamScore: number;
    moodSpectrum: number;
    discoveryIndex: number;
  };
};

/**
 * API 响应
 */
export type ShareCreateResponse =
  | { ok: true; id: string; url: string }
  | { ok: false; error: { code: string; message: string } };

export type ShareFetchResponse =
  | { ok: true; data: SharedPosterData }
  | { ok: false; error: { code: string; message: string } };
