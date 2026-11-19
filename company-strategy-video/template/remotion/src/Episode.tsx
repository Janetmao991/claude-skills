import React from "react";
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, FounderClip } from "./lib/frame";
import { VO } from "./lib/time";
import { ShotView, buildSegments, type ShotDef } from "./lib/shots";
import { BRAND } from "./episode/brand";
import { C, MONO } from "./lib/theme";
import shots from "./episode/shots.json";

const SEGS = buildSegments(shots as unknown as ShotDef[]);
// 原声画框淡出的那 0.35 秒 + 原声后的停顿里，底下露出的是原声之前的镜头（审片 round-1 发现的闪回）。
// 把原声之后的第一个镜头提前到画框开始淡出时。
for (const c of VO.clips) {
  const end = c.start + c.dur;
  const i = SEGS.findIndex((g) => g.s > c.start + 0.5 && g.s < end + 1.5);
  if (i > 0) { SEGS[i].s = end - 0.4; SEGS[i - 1].e = SEGS[i].s; }
}


// 配音和字幕铺满全片；镜头按表依次切换；播客原声盖在镜头上面，那段时间配音是静音。
export const Episode: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = (x: number) => Math.round(x * fps + 1e-6);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SEGS.map((g, i) => (
        <Sequence key={i} name={`${g.line}#${i}`} from={frame(g.s)} durationInFrames={Math.max(1, frame(g.e) - frame(g.s))} premountFor={fps}>
          <ShotView seg={g} />
        </Sequence>
      ))}
      {VO.clips.map((c) => (
        <Sequence key={c.key} name={`clip ${c.key}`} from={frame(c.start)} durationInFrames={frame(c.dur)} premountFor={fps}>
          <FounderClip k={c.key} />
        </Sequence>
      ))}
      <Audio src={staticFile("vo/voiceover.wav")} />
      <Audio
        src={staticFile("sfx/bgm.mp3")}
        loop
        volume={(fr) => {
          const a = fr / fps;
          const inClip = VO.clips.some((c) => a > c.start - 0.25 && a < c.start + c.dur + 0.25);
          return (inClip ? 0.025 : 0.09) * Math.min(1, Math.max(0, (VO.total - a) / 3)) * Math.min(1, a / 1.5);
        }}
      />
      {BRAND.watermark ? <div style={{ position: "absolute", right: 56, top: 44, padding: "8px 16px", borderRadius: 10, background: "rgba(27,26,24,0.55)", color: C.accent, fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.18em" }}>{BRAND.watermark}</div> : null}
      <Captions />
    </AbsoluteFill>
  );
};
