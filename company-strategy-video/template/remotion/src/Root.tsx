import React from "react";
import { Composition } from "remotion";
import { Episode } from "./Episode";
import { FPS, H, W, fontsReady } from "./lib/theme";
import { VO } from "./lib/time";

fontsReady.catch((e) => console.error("fonts failed", e));

export const RemotionRoot: React.FC = () => (
  <Composition id="Episode" component={Episode} width={W} height={H} fps={FPS} durationInFrames={Math.max(1, Math.ceil(VO.total * FPS))} />
);
