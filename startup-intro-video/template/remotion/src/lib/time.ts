import timeline from "../data/timeline.json";

export type Word = { w: string; s: number; e: number };
export type Seg = {
  type: "vo" | "clip";
  key: string;
  src: string;
  start: number;
  dur: number;
  words: Word[];
  /** 中文版原声的逐段翻译字幕（时间相对这段原声） */
  subs?: { s: number; e: number; t: string }[];
  meta?: { speaker: string; role: string; show: string; date: string; sticker: string; stickerAt: number; icon: string; yt: string; in: number; out: number };
};
export type Scene = { id: string; title: string; start: number; end: number; segments: Seg[] };

export const TL = timeline as unknown as { total: number; lang: "en" | "zh"; scenes: Scene[] };
export const scene = (id: string) => TL.scenes.find((s) => s.id === id)!;

const clean = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}$%]/gu, "");

/**
 * 这一章的旁白说到 `phrase` 的时刻（秒，从这一章开头算）。画面跟着旁白走就靠它。
 * 中英文通用：去掉空格和标点后连着比，英文写 "five times"，中文写 "七十一亿"。
 * `nth` 取第几次出现（从 1 开始）；`edge` 取这个词的开头 "s" 还是结尾 "e"。
 * 台词改了、词找不到会直接报错；`python3 tools/check_cues.py` 可以一次查完。
 */
export const cue = (sceneId: string, phrase: string, nth = 1, edge: "s" | "e" = "s") => {
  const sc = scene(sceneId);
  const target = clean(phrase.replace(/\s+/g, ""));
  let n = 0;
  for (const seg of sc.segments) {
    if (seg.type !== "vo") continue;
    const ws = seg.words.map((w) => clean(w.w));
    for (let i = 0; i < ws.length; i++) {
      if (!ws[i]) continue;
      let acc = "";
      for (let j = i; j < ws.length; j++) {
        acc += ws[j];
        if (!target.startsWith(acc)) break;
        if (acc === target) {
          n++;
          if (n === nth) return seg.start - sc.start + (edge === "s" ? seg.words[i].s : seg.words[j].e);
          break;
        }
      }
    }
  }
  throw new Error(`cue not found: ${sceneId} / "${phrase}" #${nth}`);
};

/** 一段旁白或原声在这一章里的 [开始, 结束]（用原声 key 或第几段取） */
export const segAt = (sceneId: string, keyOrIdx: string | number) => {
  const sc = scene(sceneId);
  const seg = typeof keyOrIdx === "number" ? sc.segments[keyOrIdx] : sc.segments.find((s) => s.key === keyOrIdx)!;
  return [seg.start - sc.start, seg.start - sc.start + seg.dur] as const;
};
