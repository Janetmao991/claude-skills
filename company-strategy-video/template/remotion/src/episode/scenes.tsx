import type React from "react";

// 本期专属的 HTML 画面（通用模板不够用时才写）。写好后在 shots.json 里用 {"scene": "名字"} 调用。
// s = 镜头开始的绝对秒，dur = 镜头时长，line = 这个镜头挂的台词 id。
export type CustomProps = { s: number; dur: number; line: string };
export const CUSTOM: Record<string, React.FC<CustomProps>> = {};
