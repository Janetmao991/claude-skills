import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { C, MONO, SANS } from "./theme";
import { TL, Seg, Word } from "./time";
import { clamp, outCubic, outExpo, p, useSpring, useT } from "./ui";

// ---------- captions: whole film, chunked into short lines ----------
type Line = { s: number; e: number; words: Word[] };
const chunk = (seg: Seg): Line[] => {
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
    const len = cur.map((x) => x.w).join(" ").length;
    if (/[.?!]$/.test(txt) || (/[,:;]$/.test(txt) && len > 26) || len > 46) flush();
  }
  flush();
  return out;
};
const LINES: (Line & { clip: boolean })[] = TL.scenes.flatMap((sc) => sc.segments.flatMap((sg) => chunk(sg).map((l) => ({ ...l, clip: sg.type === "clip" }))));

const fix = (w: string) => w.replace(/^clay/i, (m) => (m[0] === "c" ? "Clay" : m)).replace(/turned/, "churned").replace(/^in$/, "in");

export const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const i = LINES.findIndex((l, k) => t >= l.s - 0.05 && t < (LINES[k + 1] ? Math.min(LINES[k + 1].s - 0.05, l.e + 0.6) : l.e + 0.6));
  if (i < 0) return null;
  const l = LINES[i];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: l.clip ? 112 : 46, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <div
        style={{
          maxWidth: 1400, padding: "12px 28px", borderRadius: 18, background: l.clip ? "rgba(27,26,24,0.82)" : "rgba(254,253,251,0.92)",
          boxShadow: "0 10px 30px -12px rgba(27,26,24,0.35)", fontFamily: SANS, fontWeight: 600, fontSize: 38, letterSpacing: "-0.01em", lineHeight: 1.2,
          color: l.clip ? C.paper : C.ink, textAlign: "center",
        }}
      >
        {l.words.map((w, k) => (
          <span key={k} style={{ opacity: t >= w.s - 0.02 ? 1 : 0.38 }}>
            {fix(w.w)}
            {k < l.words.length - 1 ? " " : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

// ---------- podcast clip in a Clay-green mat ----------
const STICKER_ICON: Record<string, string> = {
  varun_agencies: "agencies.avif", varun_stripe: "piechart.avif", varun_gtme: "functions.png", varun_notsales: "3d-icon-glass.avif",
  kareem_action: "Automation.avif", kareem_commodity: "3d-icon-blog.avif", varun_distribution: "3d-icon-outbound.avif",
  varun_snowflake: "3d-icon-inbound.avif", becca_reps: "Workflows_icon.png", becca_ndr: "Heart-Tricolor.png",
};

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
      <AbsoluteFill style={{ background: C.greenDeep }} />
      <AbsoluteFill style={{ transform: `scale(${1.04 - 0.04 * inK})` }}>
        <Video src={staticFile(seg.src)} style={{ width: W, height: H, objectFit: "cover" }} />
      </AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={path} fill={C.green} fillRule="evenodd" />
      </svg>
      {/* name tab */}
      <div
        style={{
          position: "absolute", left: 120, top: 26, padding: "16px 30px 14px 20px", background: C.paper, borderRadius: 22, display: "flex", alignItems: "center", gap: 18,
          transform: `translateY(${(1 - tab) * -150}px)`, boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
        }}
      >
        <Img src={staticFile("web/Clay_icon-1.avif")} style={{ width: 58, height: 58 }} />
        <div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em", lineHeight: 1.05 }}>{m.speaker}</div>
          <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 17, letterSpacing: "0.22em", textTransform: "uppercase", color: C.green, marginTop: 6 }}>{m.role} · Clay</div>
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
      {/* sticker */}
      <div
        style={{
          position: "absolute", right: 150, top: 190, display: "flex", alignItems: "center", gap: 14, padding: "10px 30px 10px 14px", background: C.lime, borderRadius: 999,
          transform: `rotate(-4deg) scale(${t >= m.stickerAt ? st : 0})`, boxShadow: "0 14px 34px rgba(0,0,0,0.3)",
        }}
      >
        <Img src={staticFile(`web/${STICKER_ICON[seg.key] ?? "Clay_icon-1.avif"}`)} style={{ width: 64, height: 64, objectFit: "contain" }} />
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: "-0.02em" }}>{m.sticker}</div>
      </div>
    </AbsoluteFill>
  );
};
