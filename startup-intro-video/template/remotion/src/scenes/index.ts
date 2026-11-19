import React from "react";
import { TL } from "../lib/time";
import { Hook } from "./Hook";
import { Placeholder } from "./Placeholder";

// 一章一个组件，key = script.json 里那一章的 id。还没写的章先用占位画面，全片随时能预览。
const WRITTEN: Record<string, React.FC> = {
  hook: Hook,
};

export const SCENES: Record<string, React.FC> = Object.fromEntries(
  TL.scenes.map((s) => [s.id, WRITTEN[s.id] ?? (() => React.createElement(Placeholder, { id: s.id }))]),
);
