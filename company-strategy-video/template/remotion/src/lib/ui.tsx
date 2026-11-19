import { spring, useCurrentFrame, useVideoConfig } from "remotion";

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
