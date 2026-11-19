import vo from "../data/vo.json";
import clips from "../data/clips.json";

// 配音时间轴（tools/build_vo.py 生成并拷进来）。卡点都用「全片绝对秒数」。
type Line = { scene: string; start: number; end: number; zh: string; en: string; chars: [string, number][] };
type ClipAt = { key: string; scene: string; start: number; dur: number };
type TLT = { total: number; scenes: Record<string, { start: number; end: number; lines: string[] }>; lines: Record<string, Line>; clips: ClipAt[] };
export const VO = vo as unknown as TLT;

export type Word = { w: string; s: number; e: number };
export type ClipMeta = {
  src: string; dur: number; words: Word[]; zh: string[];
  speaker: string; role: string; segs?: [number, number][]; zhs?: string[]; show: string; date: string; yt: string; in: number; out: number; still?: boolean;
};
export const CLIPS = clips as unknown as Record<string, ClipMeta>;

function line(id: string) {
  const l = VO.lines[id];
  if (!l) throw new Error(`台词 ${id} 不在 timeline 里（配音还没生成？）`);
  return l;
}
/** 某句开始 / 结束（+偏移） */
export const L = (id: string, off = 0) => line(id).start + off;
export const E = (id: string, off = 0) => line(id).end + off;
/** 某句里某个词开始说出来的时刻（第 nth 次出现） */
export const K = (id: string, word: string, nth = 1, off = 0) => {
  const l = line(id);
  let seen = 0;
  for (let i = 0; i < l.chars.length; i++) {
    const tok = l.chars.slice(i).map((c) => c[0]).join("");
    if (tok.startsWith(word) && ++seen === nth) return l.chars[i][1] + off;
  }
  throw new Error(`K(${id}, ${word}): 台词里没有这个词`);
};
/** 某段播客原声在全片里的起止 */
export const CL = (key: string) => {
  const c = VO.clips.find((x) => x.key === key);
  if (!c) throw new Error(`clip ${key} 不在 timeline 里`);
  return { start: c.start, end: c.start + c.dur };
};
