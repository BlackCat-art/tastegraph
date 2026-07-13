// D10 分享 ID 生成
// nanoid 默认 21 字符,URL 太长;用 10 字符 (~47 亿组合,够安全)
// 仅含 a-z 0-9(无 _-)更 URL-friendly

import { customAlphabet } from "nanoid";

const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";
const LENGTH = 10;

const generate = customAlphabet(ALPHABET, LENGTH);

/**
 * 生成 share ID(10 字符,nanoid 自定义字母表)
 * 安全性: 36^10 ≈ 3.7e15(足够防暴力扫描)
 */
export function generateShareId(): string {
  return generate();
}

/**
 * 校验 ID 格式(防止恶意路径)
 */
export function isValidShareId(id: string): boolean {
  return /^[a-z0-9]{10}$/.test(id);
}
