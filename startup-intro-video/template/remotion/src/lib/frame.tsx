import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { BRAND } from "../brand";
import { C, MONO, ZH } from "./theme";
import { TL, Seg, Word } from "./time";
import { clamp, outCubic, outExpo, p, useSpring, useT } from "./ui";

// ---------- 字幕：全片只有这一条，按短行切开 ----------
// 英文版：旁白和原声都逐词亮起。中文版：旁白逐字亮起，原声只出中文翻译（一段英文对一句中文）。
type Line = { s: number; e: number; words: Word[]; text?: string };
const isCJK = (c: string) => /[　-鿿＀-￯]/.test(c);
const width = (t: string) => [...t].reduce((n, c) => n + (isCJK(c) ? 2 : 1), 0);
/** 两块之间要不要空格：汉字之间不要，英文词之间要 */
const gap = (a: string, b: string) => {
  if (!a || !b) return "";
  const x = a[a.length - 1], y = b[0];
  if (!isCJK(x) && !isCJK(y)) return " ";
  const han = (c: string) => /[\u4e00-\u9fff]/.test(c), latin = (c: string) => /[A-Za-z0-9%$]/.test(c);
  return (latin(x) && han(y)) || (han(x) && latin(y)) ? " " : ""; // 中英文之间留一个空格
};
const join = (ws: Word[]) => ws.reduce((t, w, k) => t + (k ? gap(ws[k - 1].w, w.w) : "") + w.w, "");
const chunk = (seg: Seg): Line[] => {
  if (seg.subs) return seg.subs.map((x) => ({ s: seg.start + x.s, e: seg.start + x.e, words: [], text: x.t }));
  const out: Line[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (cur.length) out.push({ s: seg.start + cur[0].s, e: seg.start + cur[cur.length - 1].e, words: cur.map((w) => ({ ...w, s: seg.start + w.s, e: seg.start + w.e })) });
    cur = [];
  };
  for (const w of seg.words) {
    const txt = w.w.replace(/^-$/, "");
    if (!txt) continue;
    cur.push({ ...w, w: txt });
    const len = width(join(cur));
    if (/[.?!。？！][”’」]?$/.test(txt) || (/[,:;，、：；]$/.test(txt) && len > 26) || len > 46) flush();
  }
  flush();
  return out;
};
const LINES: (Line & { clip: boolean })[] = TL.scenes.flatMap((sc) => sc.segments.flatMap((sg) => chunk(sg).map((l) => ({ ...l, clip: sg.type === "clip" }))));

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const i = LINES.findIndex((l, k) => t >= l.s - 0.05 && t < (LINES[k + 1] ? Math.min(LINES[k + 1].s - 0.05, l.e + 0.6) : l.e + 0.6));
  if (i < 0) return null;
  const l = LINES[i];
  if (l.text === "") return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: l.clip ? 112 : 46, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1400, padding: "12px 28px", borderRadius: 18, background: l.clip ? "rgba(27,26,24,0.82)" : "rgba(254,253,251,0.92)",
          boxShadow: "0 10px 30px -12px rgba(27,26,24,0.35)", fontFamily: ZH, fontWeight: 600, fontSize: 38, letterSpacing: "-0.01em", lineHeight: 1.2,
          color: l.clip ? C.paper : C.ink, textAlign: "center",
        }}
      >
        {l.text ??
          l.words.map((w, k) => (
            <span key={k} style={{ opacity: t >= w.s - 0.02 ? 1 : 0.38 }}>
              {w.w}
              {k < l.words.length - 1 ? gap(w.w, l.words[k + 1].w) : ""}
            </span>
          ))}
      </div>
    </div>
  );
};

// ---------- 创始人原声：访谈画面嵌在品牌色画框里，左上名牌、右上节目和日期、一张贴纸点出这段话的要点 ----------
export const FounderClip: React.FC<{ seg: Seg }> = ({ seg }) => {
  const t = useT();
  const sp = useSpring();
  const m = seg.meta!;
  const inK = outExpo(p(t, 0, 0.55));
  const outK = outCubic(p(t, seg.dur - 0.35, seg.dur));
  const b = 64 + (1 - inK) * 300; // mat border
  const tab = sp(0.25, 15, 170);
  const st = sp(m.stickerAt, 9, 200);
  const W = 1920, H = 1080, R = 36;
  const path = `M0 0 H${W} V${H} H0 Z M${b + R} ${b} H${W - b - R} Q${W - b} ${b} ${W - b} ${b + R} V${H - b - R} Q${W - b} ${H - b} ${W - b - R} ${H - b} H${b + R} Q${b} ${H - b} ${b} ${H - b - R} V${b + R} Q${b} ${b} ${b + R} ${b} Z`;
  return (
    <AbsoluteFill style={{ opacity: 1 - outK }}>
      <AbsoluteFill style={{ background: C.brandDeep }} />
      <AbsoluteFill style={{ transform: `scale(${1.04 - 0.04 * inK})` }}>
        <Video src={staticFile(seg.src)} style={{ width: W, height: H, objectFit: "cover" }} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill={C.brand} fillRule="evenodd" />
      </svg>
      {/* name tab */}
      <div
        style={{
          position: "absolute", left: 120, top: 26, padding: "16px 30px 14px 20px", background: C.paper, borderRadius: 22, display: "flex", alignItems: "center", gap: 18,
          transform: `translateY(${(1 - tab) * -150}px)`, boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
        }}
      >
        {BRAND.icon && <Img src={staticFile(BRAND.icon)} style={{ width: 58, height: 58 }} />}
        <div>
          <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{m.speaker}</div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", color: C.brand, marginTop: 6 }}>{m.role} · {BRAND.name}</div>
        </div>
      </div>
      <div
        style={{
          position: "absolute", right: 120, top: 38, padding: "12px 22px", background: C.ink, borderRadius: 14, opacity: clamp(tab),
          fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: "0.18em", textTransform: "uppercase", color: C.paper,
        }}
      >
        ▶ {m.show} · {m.date}
      </div>
      {/* 贴纸：clips.json 里的 sticker（要点，三五个词）和 icon（public/web/ 下的图，可不填） */}
      {m.sticker && <div
        style={{
          position: "absolute", right: 150, top: 190, display: "flex", alignItems: "center", gap: 14, padding: "10px 30px 10px 14px", background: C.accent, borderRadius: 999,
          transform: `rotate(-4deg) scale(${t >= m.stickerAt ? st : 0})`, boxShadow: "0 14px 34px rgba(0,0,0,0.3)",
        }}
      >
        {(m.icon || BRAND.icon) && <Img src={staticFile(m.icon ? `web/${m.icon}` : BRAND.icon!)} style={{ width: 64, height: 64, objectFit: "contain" }} />}
        <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em" }}>{m.sticker}</div>
      </div>}
    </AbsoluteFill>
  );
};
