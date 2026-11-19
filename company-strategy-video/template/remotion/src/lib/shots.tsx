import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { C, MONO, SANS } from "./theme";
import { VO, K } from "./time";
import { clamp, outExpo } from "./ui";
import { KitScene, type KitName } from "./kit";
import { CUSTOM } from "../episode/scenes";

// 一个镜头 = 一种媒体（素材全屏显示）+ 可选的角落出处标签。
// 镜头表写在 src/episode/shots.json，格式见 references/production.md。
export type Post = { platform: "linkedin" | "x"; name: string; sub?: string; date: string; text: string; stats: string; hl?: string; bg?: string };
export type Media =
  | { v: string }
  | { img: string; from?: [number, number, number]; to?: [number, number, number] } // [缩放, x%, y%] 缓慢推拉
  | { post: Post }
  | { kit: KitName; props: Record<string, unknown> }
  | { scene: string };
export type Cue = string | number | [string, string];
export type ShotCut = { k: Cue; m: Media; tag?: string; dim?: number };
export type ShotDef = { at: string; m: Media; tag?: string; dim?: number; hit?: boolean; cuts?: ShotCut[] };
export type Seg = { s: number; e: number; m: Media; tag?: string; dim?: number; hit?: boolean; line: string };

/** 词 / [句 id, 词] / 秒（相对这一句开始）→ 全片绝对秒。对齐数据里没有空格，词里不要带空格。 */
export const cueTime = (k: Cue, line: string, fallback: number) => {
  const l = VO.lines[line];
  if (typeof k === "number") return (l ? l.start : 0) + k;
  const [id, w] = typeof k === "string" ? [line, k] : k;
  try { return K(id, w); } catch { return fallback; }
};

/** 镜头表 → 按时间排好的一段段：第一段从 0 开始，每段放到下一段开始为止 */
export const buildSegments = (defs: ShotDef[]): Seg[] => {
  const shots = defs.filter((d) => VO.lines[d.at]).map((d) => ({ d, s: VO.lines[d.at].start - 0.15 })).sort((a, b) => a.s - b.s);
  const segs: Seg[] = [];
  shots.forEach(({ d, s }, i) => {
    const start = i === 0 ? 0 : s;
    const next = i + 1 < shots.length ? shots[i + 1].s : VO.total;
    segs.push({ s: start, e: next, m: d.m, tag: d.tag, dim: d.dim, hit: d.hit, line: d.at });
    (d.cuts ?? []).forEach((c, j) => {
      const prev = segs[segs.length - 1];
      const t = Math.min(next - 0.4, Math.max(prev.s + 0.6, cueTime(c.k, d.at, prev.s + 1 + j)));
      prev.e = t;
      segs.push({ s: t, e: next, m: c.m, tag: c.tag, dim: c.dim, line: d.at });
    });
  });
  return segs;
};

const KenBurns: React.FC<{ src: string; from: [number, number, number]; to: [number, number, number]; dur: number }> = ({ src, from, to, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = clamp(f / fps / Math.max(0.5, dur));
  const e = 1 - Math.pow(1 - k, 2);
  const s = from[0] + (to[0] - from[0]) * e, x = from[1] + (to[1] - from[1]) * e, y = from[2] + (to[2] - from[2]) * e;
  return (
    <AbsoluteFill style={{ background: "#111", overflow: "hidden" }}>
      <Img src={staticFile(src)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: `${x}% ${y}%`, transform: `scale(${s})`, transformOrigin: `${x}% ${y}%` }} />
    </AbsoluteFill>
  );
};

const SlowPush: React.FC<{ children: React.ReactNode; dur: number }> = ({ children, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <AbsoluteFill style={{ scale: `${1.02 + 0.05 * clamp(f / fps / dur)}` }}>{children}</AbsoluteFill>;
};

/** HTML 画面的慢漂移：内容停住时不至于看起来像卡帧 */
const Drift: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  return <AbsoluteFill style={{ scale: `${1.018 + 0.018 * Math.sin(t * 0.55)}`, translate: `${6 * Math.sin(t * 0.37)}px ${5 * Math.cos(t * 0.43)}px` }}>{children}</AbsoluteFill>;
};

/** 真实帖子卡：原文逐字，带日期和互动数；bg 是背后虚化的视频 */
const PostCard: React.FC<{ post: Post; dur: number }> = ({ post, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const k = outExpo(clamp(t / 0.45));
  const hk = clamp((t - 0.6) / 0.5);
  const parts = post.hl ? post.text.split(post.hl) : [post.text];
  const li = post.platform === "linkedin";
  return (
    <AbsoluteFill style={{ background: "#111" }}>
      {post.bg && (
        <AbsoluteFill style={{ filter: "blur(22px) brightness(0.45)", scale: "1.1" }}>
          <Video src={staticFile(post.bg)} muted loop objectFit="cover" style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
        <div style={{ width: 1480, background: "#fff", borderRadius: 26, boxShadow: "0 40px 100px -30px rgba(0,0,0,0.6)", padding: "44px 56px 32px", opacity: k, translate: `0 ${(1 - k) * 60}px`, scale: `${1 + 0.035 * clamp(t / dur)}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 88, height: 88, borderRadius: 44, background: C.violet, color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>{post.name.slice(0, 1)}</div>
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: "#111" }}>{post.name}</div>
              <div style={{ fontFamily: SANS, fontSize: 26, color: "#666" }}>{post.sub ? `${post.sub} · ` : ""}{post.date}</div>
            </div>
            <div style={{ marginLeft: "auto", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: li ? "#0A66C2" : "#111" }}>{li ? "in" : "𝕏"}</div>
          </div>
          <div style={{ fontFamily: SANS, fontSize: 44, lineHeight: 1.4, color: "#1d1d1d", marginTop: 26, whiteSpace: "pre-wrap" }}>
            {parts[0]}
            {post.hl && <span style={{ background: `linear-gradient(transparent 55%, ${C.accent} 55%)`, backgroundSize: `${hk * 100}% 100%`, backgroundRepeat: "no-repeat", fontWeight: 700 }}>{post.hl}</span>}
            {post.hl && parts[1]}
          </div>
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1.5px solid #eee", fontFamily: SANS, fontSize: 28, color: "#666" }}>{post.stats}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SourceTag: React.FC<{ tag: string }> = ({ tag }) => (
  <div style={{ position: "absolute", left: 56, top: 44, padding: "8px 16px", borderRadius: 10, background: "rgba(27,26,24,0.75)", color: C.paper, fontFamily: MONO, fontSize: 20, letterSpacing: "0.06em" }}>{tag}</div>
);

export const ShotView: React.FC<{ seg: Seg }> = ({ seg }) => {
  const dur = seg.e - seg.s;
  const m = seg.m;
  const Custom = "scene" in m ? CUSTOM[m.scene] : null;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* 视频循环播放：素材比镜头短时也不会停在最后一帧 */}
      {"v" in m && <SlowPush dur={dur}><Video src={staticFile(m.v)} muted loop objectFit="cover" style={{ width: "100%", height: "100%" }} /></SlowPush>}
      {"img" in m && <KenBurns src={m.img} from={m.from ?? [1.0, 50, 20]} to={m.to ?? [1.1, 50, 35]} dur={dur} />}
      {"post" in m && <PostCard post={m.post} dur={dur} />}
      {"kit" in m && <Drift><KitScene name={m.kit} props={m.props} line={seg.line} s={seg.s} dur={dur} /></Drift>}
      {Custom && <Drift><Custom s={seg.s} dur={dur} line={seg.line} /></Drift>}
      {seg.dim ? <AbsoluteFill style={{ background: `rgba(0,0,0,${seg.dim})` }} /> : null}
      {seg.tag && <SourceTag tag={seg.tag} />}
      <Audio src={staticFile("sfx/whoosh-short.mp3")} volume={0.2} />
      {seg.hit && <Sequence from={4}><Audio src={staticFile("sfx/impact-bass-1.mp3")} volume={0.3} /></Sequence>}
    </AbsoluteFill>
  );
};
