import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
export const W = 1920;
export const H = 1080;
export const FPS = 30;

// 颜色都来自 src/episode/brand.ts（每期按公司品牌改那一个文件）
import { BRAND } from "../episode/brand";
export const C = BRAND.colors;

export const SANS = "Figtree";
export const SERIF = "Instrument Serif";
export const MONO = "JetBrains Mono";
// 中文：拉丁字母仍走 Figtree，汉字落到系统苹方
export const ZH = 'Figtree, "PingFang SC", "Hiragino Sans GB", sans-serif';

const faces: [string, string, string, string?][] = [
  [SANS, "fonts/figtree-400.woff2", "400"],
  [SANS, "fonts/figtree-500.woff2", "500"],
  [SANS, "fonts/figtree-600.woff2", "600"],
  [SANS, "fonts/figtree-700.woff2", "700"],
  [SANS, "fonts/figtree-800.woff2", "800"],
  [SERIF, "fonts/instrument-serif-400.woff2", "400"],
  [SERIF, "fonts/instrument-serif-400-italic.woff2", "400", "italic"],
  [MONO, "fonts/jetbrains-mono-500.woff2", "500"],
  [MONO, "fonts/jetbrains-mono-700.woff2", "700"],
];

export const fontsReady = Promise.all(
  faces.map(([family, src, weight, style]) =>
    loadFont({ family, url: staticFile(src), weight, style: style ?? "normal" }),
  ),
);
