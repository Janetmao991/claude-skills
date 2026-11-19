import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const W = 1920;
export const H = 1080;
export const FPS = 30;

// Clay brand world (clay.com, Nov 2026): cream paper, forest green, near-black ink,
// claymation primaries. Fonts are free look-alikes: Figtree ≈ Roobert, Instrument Serif ≈ Canela.
export const C = {
  cream: "#F4F3F0",
  paper: "#FEFDFB",
  sand: "#DAD4C8",
  line: "#E0DEDC",
  ink: "#1B1A18",
  mute: "#6F6B64",
  green: "#035D44",
  greenDeep: "#023B2B",
  lime: "#EEF773",
  sky: "#3BD3FD",
  blue: "#395AFA",
  purple: "#A17BF9",
  orange: "#FF7714",
  red: "#FB4450",
  pink: "#FF70D2",
  peach: "#FCC9AB",
};

export const SANS = "Figtree";
export const SERIF = "Instrument Serif";
export const MONO = "JetBrains Mono";

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
