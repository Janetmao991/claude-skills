import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { C, MONO, SANS, ZH } from "./theme";
import { BRAND } from "../episode/brand";
import { CLIPS, VO, Word } from "./time";
import { clamp, outCubic, outExpo, p, useSpring, useT } from "./ui";

// ---------- captions：中文大字 + 英文小字（配音）；播客原声 = 英文逐词 + 中文翻译 ----------
type Cap = { s: number; e: number; zh: string; en: string; clip?: boolean; words?: Word[]; scene?: string };
// 全片 KAPI 式：配音字幕不要底板，白字黑描边

const MAXC = 24; // 一行中文最多字数，超过就在标点处切
const splitLine = (l: (typeof VO.lines)[string]): Cap[] => {
  // 原文逐个走：能对上 chars 里的字/英文词就记时间，对不上的是标点空格
  const out: Cap[] = [];
  let buf = "", s0 = -1, last = l.start, ci = 0, i = 0;
  const flush = (end: number) => {
    const zh = buf.trim().replace(/[，。；：、]$/, "");
    if (zh) out.push({ s: s0 < 0 ? l.start : s0, e: end, zh, en: l.en, scene: l.scene });
    buf = ""; s0 = -1;
  };
  while (i < l.zh.length) {
    const tok = l.chars[ci]?.[0];
    if (tok && l.zh.startsWith(tok, i)) {
      if (s0 < 0) s0 = l.chars[ci][1];
      last = l.chars[ci][1];
      buf += tok; i += tok.length; ci++;
      continue;
    }
    const ch = l.zh[i++];
    buf += ch;
    const n = buf.length;
    if ((/[。？！]/.test(ch) && n > 6) || (/[，：；]/.test(ch) && n >= 12) || n >= MAXC) flush(last + 0.3);
  }
  flush(l.end);
  // 英文按中文的分段比例切开（在句读处切），不再整句挂着
  if (out.length > 1) {
    const parts = l.en.split(/(?<=[.,;:?!])\s+/);
    const zlen = out.map((o) => o.zh.length), ztot = zlen.reduce((x, y) => x + y, 0), etot = l.en.length;
    let k = 0, acc = 0, accZ = 0;
    out.forEach((o, j) => {
      accZ += zlen[j];
      const target = (accZ / ztot) * etot, buf: string[] = [];
      while (k < parts.length && (j === out.length - 1 || acc + parts[k].length / 2 <= target || buf.length === 0)) { buf.push(parts[k]); acc += parts[k].length + 1; k++; }
      o.en = buf.join(" ");
    });
  }
  return out;
};

const clipCaps = (): Cap[] =>
  VO.clips.flatMap((at) => {
    const c = CLIPS[at.key];
    // 英文按 tools/clipseg.py 的规则分段，zhs 是逐段对应的中文翻译
    const segs = c.segs ?? [[0, c.words.length - 1]];
    return segs.map(([a, b], i) => {
      const ws = c.words.slice(a, b + 1);
      const next = segs[i + 1] ? c.words[segs[i + 1][0]].s : c.dur;
      return {
        s: at.start + ws[0].s, e: at.start + next - 0.02, clip: true,
        zh: c.zhs?.[i] ?? c.zh[Math.min(c.zh.length - 1, i)] ?? "",
        en: "", words: ws.map((w) => ({ ...w, s: at.start + w.s, e: at.start + w.e })),
      };
    });
  });

const CAPS: Cap[] = [...Object.values(VO.lines).flatMap(splitLine), ...clipCaps()].sort((a, b) => a.s - b.s);

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const i = CAPS.findIndex((c, k) => t >= c.s - 0.05 && t < (CAPS[k + 1] ? Math.min(CAPS[k + 1].s - 0.05, c.e + (c.clip ? 0 : 0.5)) : c.e + 0.5));
  if (i < 0) return null;
  const c = CAPS[i];
  const dark = !!c.clip;
  if (!dark) {
    const stroke = { WebkitTextStroke: `6px ${C.ink}`, paintOrder: "stroke fill" } as React.CSSProperties;
    return (
      <>
      {/* Gamma 期素材多为浅色网页：字幕下方加一层渐变压暗（不是底板），保证白字可读 */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, pointerEvents: "none", background: "linear-gradient(to bottom, rgba(0,14,33,0), rgba(0,14,33,0.72))" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none", textAlign: "center" }}>
        <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 40, lineHeight: 1.25, color: "#fff", ...stroke }}>{c.zh}</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: c.en.length > 140 ? 22 : 25, color: "#fff", marginTop: 6, maxWidth: 1500, lineHeight: 1.25, textShadow: "0 0 6px #000, 0 2px 3px #000" }}>{c.en}</div>
      </div>
      </>
    );
  }
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: dark ? 96 : 40, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1500, padding: "14px 34px 16px", borderRadius: 20, textAlign: "center",
          background: dark ? "rgba(27,26,24,0.84)" : "rgba(254,253,251,0.94)", boxShadow: "0 10px 30px -12px rgba(27,26,24,0.35)",
        }}
      >
        {dark ? (
          <>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, lineHeight: 1.25, color: C.paper, opacity: 0.9 }}>
              {c.words!.map((w, k) => (
                <span key={k} style={{ opacity: t >= w.s - 0.02 ? 1 : 0.35 }}>{w.w}{k < c.words!.length - 1 ? " " : ""}</span>
              ))}
            </div>
            <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 42, lineHeight: 1.3, color: C.accent, marginTop: 6 }}>{c.zh}</div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 46, lineHeight: 1.3, color: C.ink, letterSpacing: "0.01em" }}>{c.zh}</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: c.en.length > 140 ? 21 : 24, color: C.mute, marginTop: 4, lineHeight: 1.25, textWrap: "balance" as React.CSSProperties["textWrap"] }}>{c.en}</div>
          </>
        )}
      </div>
    </div>
  );
};

// ---------- 播客原声画框 ----------
export const FounderClip: React.FC<{ k: string }> = ({ k }) => {
  const t = useT();
  const sp = useSpring();
  const m = CLIPS[k];
  const inK = outExpo(p(t, 0, 0.55));
  const outK = outCubic(p(t, m.dur - 0.35, m.dur));
  const b = 64 + (1 - inK) * 300;
  const tab = sp(0.25, 15, 170);
  const W = 1920, H = 1080, R = 36;
  const path = `M0 0 H${W} V${H} H0 Z M${b + R} ${b} H${W - b - R} Q${W - b} ${b} ${W - b} ${b + R} V${H - b - R} Q${W - b} ${H - b} ${W - b - R} ${H - b} H${b + R} Q${b} ${H - b} ${b} ${H - b - R} V${b + R} Q${b} ${b} ${b + R} ${b} Z`;
  return (
    <AbsoluteFill style={{ opacity: 1 - outK }}>
      <AbsoluteFill style={{ background: C.stageDeep }} />
      {/* still：只有音频的节目（画面是一张静态封面）——慢推 + 声波，避免整段定格 */}
      <AbsoluteFill style={{ transform: `scale(${1.04 - 0.04 * inK + (m.still ? 0.1 * t / m.dur : 0)})` }}>
        <Video src={staticFile(m.src)} volume={1.6} style={{ width: W, height: H, objectFit: "cover", ...(m.still ? { transform: "scale(4)", transformOrigin: "70% 80%" } : {}) }} />
      </AbsoluteFill>
      {m.still ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
          {Array.from({ length: 28 }, (_, i) => {
            const words = m.words ?? [];
            const talking = words.some((w) => t >= w.s - 0.05 && t <= w.e + 0.08);
            const h = 14 + (talking ? 70 : 8) * Math.abs(Math.sin(t * 9 + i * 1.7) * Math.sin(t * 3.3 + i * 0.6));
            return <div key={i} style={{ width: 12, height: h, borderRadius: 6, background: C.accent, opacity: 0.9 }} />;
          })}
        </div>
      ) : null}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill={C.stage} fillRule="evenodd" />
      </svg>
      <div
        style={{
          position: "absolute", left: 120, top: 26, padding: "16px 30px 14px 20px", background: C.paper, borderRadius: 22, display: "flex", alignItems: "center", gap: 18,
          transform: `translateY(${(1 - tab) * -150}px)`, boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
        }}
      >
        {BRAND.icon ? <Img src={staticFile(BRAND.icon)} style={{ width: 58, height: 58, objectFit: "contain" }} /> : null}
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{m.speaker}</div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", color: C.stage, marginTop: 6 }}>{m.role} · {BRAND.name}</div>
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
    </AbsoluteFill>
  );
};
