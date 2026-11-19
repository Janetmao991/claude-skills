import React from "react";
import { Composition, Folder } from "remotion";
import { Episode, SceneSolo } from "./Episode";
import { FPS, H, W, fontsReady } from "./lib/theme";
import { TL } from "./lib/time";

fontsReady.catch((e) => console.error("fonts failed", e));

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Episode" component={Episode} width={W} height={H} fps={FPS} durationInFrames={Math.ceil(TL.total * FPS)} />
    <Folder name="scenes">
      {TL.scenes.map((s) => (
        <Composition key={s.id} id={`S-${s.id}`} component={SceneSolo} defaultProps={{ id: s.id }} width={W} height={H} fps={FPS}
          durationInFrames={Math.ceil(((s === TL.scenes[TL.scenes.length - 1] ? TL.total : s.end + 0.6) - s.start) * FPS)} />
      ))}
    </Folder>
  </>
);
