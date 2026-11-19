import timeline from "../data/timeline.json";

export type Word = { w: string; s: number; e: number };
export type Seg = {
  type: "vo" | "clip";
  key: string;
  src: string;
  start: number;
  dur: number;
  words: Word[];
  meta?: { speaker: string; role: string; show: string; date: string; sticker: string; stickerAt: number; yt: string; in: number; out: number };
};
export type Scene = { id: string; title: string; start: number; end: number; segments: Seg[] };

export const TL = timeline as { total: number; scenes: Scene[] };
export const scene = (id: string) => TL.scenes.find((s) => s.id === id)!;

const clean = (w: string) => w.toLowerCase().replace(/[^a-z0-9$%]/g, "");

/**
 * Scene-local time (s) when `word` is spoken in that scene's voiceover.
 * `nth` picks the n-th occurrence (1-based); `edge` = start or end of the word.
 */
export const cue = (sceneId: string, word: string, nth = 1, edge: "s" | "e" = "s") => {
  const sc = scene(sceneId);
  const parts = word.split(" ").map(clean);
  let n = 0;
  for (const seg of sc.segments) {
    if (seg.type !== "vo") continue;
    const ws = seg.words;
    for (let i = 0; i + parts.length <= ws.length; i++) {
      if (parts.every((p, k) => clean(ws[i + k].w) === p)) {
        n++;
        if (n === nth) {
          const w = edge === "s" ? ws[i] : ws[i + parts.length - 1];
          return seg.start - sc.start + (edge === "s" ? w.s : w.e);
        }
      }
    }
  }
  throw new Error(`cue not found: ${sceneId} / "${word}" #${nth}`);
};

/** Scene-local [start, end] of a segment (by clip key or index). */
export const segAt = (sceneId: string, keyOrIdx: string | number) => {
  const sc = scene(sceneId);
  const seg = typeof keyOrIdx === "number" ? sc.segments[keyOrIdx] : sc.segments.find((s) => s.key === keyOrIdx)!;
  return [seg.start - sc.start, seg.start - sc.start + seg.dur] as const;
};
