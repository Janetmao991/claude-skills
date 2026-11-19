import React from "react";
import { AbsoluteFill } from "remotion";
import { C, ZH } from "../lib/theme";
import { cue } from "../lib/time";
import { Kicker, Serif, env, mix, outCubic, outExpo, p, useSpring, useT } from "../lib/ui";
import { BRAND } from "../brand";

// 最小示范：一章 = 一个组件，画面的每一步都挂在旁白的某个词上（cue）。
// 写真正的开场时整段换掉；完整的写法看 skill 里的 examples/clay/scenes/Hook.tsx。
const S = "hook";

export const Hook: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  // 卡点写旁白里真有的词；改台词后跑 python3 tools/check_cues.py
  const tClaim = 0.3;
  const tNumber = cue(S, "seven");
  const tQuestion = cue(S, "So what");

  const claim = env(t, tClaim, tNumber - 0.1); // 第一屏：一句反常识的话
  const number = env(t, tNumber - 0.1, tQuestion - 0.1, 0.5, 0.5); // 第二屏：一个大数字
  const question = outCubic(p(t, tQuestion - 0.1, tQuestion + 0.5)); // 第三屏：本期要回答的问题
  const rise = sp(tClaim, 16, 160);

  return (
    <AbsoluteFill style={{ background: C.brandDeep }}>
      <div style={{ position: "absolute", left: 110, bottom: 150, opacity: claim }}>
        <Kicker color={C.accent} style={{ marginBottom: 18 }}>{BRAND.series} · {BRAND.name}</Kicker>
        <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 168, letterSpacing: "-0.045em", color: C.paper, lineHeight: 0.95, transform: `translateY(${(1 - rise) * 60}px)` }}>
          {BRAND.name} owns <Serif size={176} color={C.accent}>no</Serif> data.
        </div>
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: number }}>
        <Kicker color={C.accent} style={{ marginBottom: 10 }}>Valuation</Kicker>
        <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 330, letterSpacing: "-0.06em", color: C.paper, lineHeight: 1, transform: `scale(${mix(0.86, 1, outExpo(p(t, tNumber, tNumber + 0.8)))})` }}>
          ${(7.1 * outExpo(p(t, tNumber, tNumber + 1.3))).toFixed(1)}B
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: question }}>
        <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 120, color: C.paper, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1.05 }}>
          So what are they
          <br />
          <Serif size={136} color={C.accent}>paying for?</Serif>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
