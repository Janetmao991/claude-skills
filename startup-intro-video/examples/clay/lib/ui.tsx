import React from "react";
import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, SANS, SERIF } from "./theme";

// ---------- time helpers (scene-local seconds) ----------
export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const p = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const outCubic = (x: number) => 1 - Math.pow(1 - x, 3);
export const outExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
export const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const mix = (a: number, b: number, x: number) => a + (b - a) * x;

export const useT = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return f / fps;
};

/** spring that starts at scene-local second `at` (0 → 1, may overshoot) */
export const useSpring = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (at: number, damping = 14, stiffness = 150) =>
    spring({ frame: f - Math.round(at * fps), fps, config: { damping, stiffness, mass: 1 } });
};

/** in/out envelope: 0 before a, rises over `rin`, holds, falls over `rout` ending at b */
export const env = (t: number, a: number, b: number, rin = 0.45, rout = 0.4) =>
  outCubic(p(t, a, a + rin)) * (1 - inOut(p(t, b - rout, b)));

// ---------- type ----------
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.green, style }) => (
  <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 22, letterSpacing: "0.28em", textTransform: "uppercase", color, ...style }}>{children}</div>
);

export const Display: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 96, color = C.ink, style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: size, lineHeight: 1.02, letterSpacing: "-0.035em", color, ...style }}>{children}</div>
);

export const Serif: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 96, color = C.ink, style }) => (
  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: size, letterSpacing: "-0.01em", color, ...style }}>{children}</span>
);

export const Body: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 34, color = C.ink, style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: size, lineHeight: 1.25, letterSpacing: "-0.01em", color, ...style }}>{children}</div>
);

// ---------- surfaces ----------
export const Card: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties; dark?: boolean }> = ({ children, style, dark }) => (
  <div
    style={{
      background: dark ? C.green : C.paper,
      borderRadius: 28,
      border: dark ? "none" : `1.5px solid ${C.line}`,
      boxShadow: "0 1px 0 rgba(255,255,255,0.6) inset, 0 24px 60px -24px rgba(27,26,24,0.28), 0 4px 14px -6px rgba(27,26,24,0.12)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; style?: React.CSSProperties }> = ({ children, bg = C.ink, color = C.paper, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 22px", borderRadius: 999, background: bg, color, fontFamily: SANS, fontWeight: 600, fontSize: 26, ...style }}>{children}</div>
);

/** claymation asset from clay.com, with an optional gentle bob */
export const Clay: React.FC<{ src: string; size: number; x?: number; y?: number; bob?: number; phase?: number; rot?: number; style?: React.CSSProperties; s?: number }> = ({
  src, size, x, y, bob = 8, phase = 0, rot = 0, style, s = 1,
}) => {
  const t = useT();
  const dy = Math.sin(t * 1.6 + phase) * bob;
  const r = rot + Math.sin(t * 1.1 + phase) * 2;
  return (
    <Img
      src={staticFile(`web/${src}`)}
      style={{
        position: x === undefined ? "relative" : "absolute", left: x, top: y, width: size, height: size, objectFit: "contain",
        transform: `translateY(${dy}px) rotate(${r}deg) scale(${s})`, filter: "drop-shadow(0 22px 22px rgba(27,26,24,0.18))", ...style,
      }}
    />
  );
};

/** cream ground with soft colour pools, like clay.com section backgrounds */
export const Ground: React.FC<{ tint?: string; children?: React.ReactNode }> = ({ tint = C.sky, children }) => (
  <AbsoluteFill style={{ background: C.cream }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(900px 600px at 88% 8%, ${tint}22, transparent 70%), radial-gradient(800px 600px at 6% 96%, ${C.lime}33, transparent 70%)`,
      }}
    />
    {children}
  </AbsoluteFill>
);

/** chapter tag (top-left) + small Clay logo (top-right) */
export const Chrome: React.FC<{ n: string; label: string; t: number; dark?: boolean }> = ({ n, label, t, dark }) => {
  const a = outCubic(p(t, 0.1, 0.7));
  const fg = dark ? C.paper : C.ink;
  return (
    <>
      <div style={{ position: "absolute", left: 80, top: 60, display: "flex", alignItems: "center", gap: 18, opacity: a, transform: `translateY(${(1 - a) * -20}px)` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: dark ? C.lime : C.green, letterSpacing: "0.2em" }}>{n}</div>
        <div style={{ width: 36, height: 2, background: dark ? C.lime : C.green, opacity: 0.6 }} />
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 22, color: fg, letterSpacing: "0.28em", textTransform: "uppercase" }}>{label}</div>
      </div>
      <div style={{ position: "absolute", right: 80, top: 52, opacity: a * 0.9, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 18, letterSpacing: "0.24em", color: dark ? C.paper : C.mute }}>STARTUP DEEPDIVE</div>
        <Img src={staticFile("web/Clay-primary-logo.avif")} style={{ height: 44, filter: dark ? "brightness(0) invert(1)" : undefined }} />
      </div>
    </>
  );
};

/** animated number */
export const Num: React.FC<{ to: number; t: number; a: number; d?: number; fmt?: (n: number) => string }> = ({ to, t, a, d = 1.2, fmt = (n) => Math.round(n).toLocaleString("en-US") }) => (
  <>{fmt(to * outExpo(p(t, a, a + d)))}</>
);

/** a word/phrase highlighted with a hand-drawn marker sweep */
export const Mark: React.FC<{ children: React.ReactNode; t: number; a: number; color?: string }> = ({ children, t, a, color = C.lime }) => {
  const k = outCubic(p(t, a, a + 0.45));
  return (
    <span style={{ position: "relative", whiteSpace: "nowrap" }}>
      <span style={{ position: "absolute", left: -8, right: -8, bottom: "0.06em", height: "0.42em", background: color, borderRadius: 8, transformOrigin: "left", transform: `scaleX(${k})`, zIndex: 0 }} />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </span>
  );
};
