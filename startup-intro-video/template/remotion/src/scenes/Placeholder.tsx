import React from "react";
import { AbsoluteFill } from "remotion";
import { C } from "../lib/theme";
import { scene } from "../lib/time";
import { Display, Ground, Kicker } from "../lib/ui";

/** 还没写的章：只显示章名。成片里不应该出现它（review_pack.py 会在 tech.md 里报出来）。 */
export const Placeholder: React.FC<{ id: string }> = ({ id }) => (
  <Ground>
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 24 }}>
      <Kicker color={C.red}>TODO · scene not built</Kicker>
      <Display>{scene(id).title}</Display>
    </AbsoluteFill>
  </Ground>
);
