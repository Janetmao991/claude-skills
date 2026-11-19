import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { Captions, FounderClip } from "./lib/frame";
import { C, FPS } from "./lib/theme";
import { TL, scene } from "./lib/time";

const last = TL.scenes[TL.scenes.length - 1].id;
import { SCENES } from "./scenes";

const fr = (s: number) => Math.round(s * FPS);

const SceneLayer: React.FC<{ id: string; offset: number }> = ({ id, offset }) => {
  const sc = scene(id);
  const Comp = SCENES[id];
  return (
    <>
      <Sequence from={fr(sc.start - offset)} durationInFrames={id === last ? fr(TL.total - sc.start) : fr(sc.end - sc.start + 0.6)} name={`scene ${id}`}>
        <Comp />
      </Sequence>
      {sc.segments.map((sg) =>
        sg.type === "clip" ? (
          <Sequence key={sg.key} from={fr(sg.start - offset)} durationInFrames={fr(sg.dur)} name={`clip ${sg.key}`}>
            <FounderClip seg={sg} />
          </Sequence>
        ) : (
          <Sequence key={sg.key} from={fr(sg.start - offset)} durationInFrames={fr(sg.dur) + 2} name={`vo ${sg.key}`} layout="none">
            <Audio src={staticFile(sg.src)} />
          </Sequence>
        ),
      )}
    </>
  );
};

export const Episode: React.FC = () => (
  <AbsoluteFill style={{ background: C.cream }}>
    {TL.scenes.map((s) => (
      <SceneLayer key={s.id} id={s.id} offset={0} />
    ))}
    <Captions />
  </AbsoluteFill>
);

/** one scene on its own (for fast previews) */
export const SceneSolo: React.FC<{ id: string }> = ({ id }) => {
  const sc = scene(id);
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <SceneLayer id={id} offset={sc.start} />
      <Sequence from={-fr(sc.start)} layout="none">
        <Captions />
      </Sequence>
    </AbsoluteFill>
  );
};
