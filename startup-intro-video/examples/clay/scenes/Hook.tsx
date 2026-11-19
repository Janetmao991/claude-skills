import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Video } from "@remotion/media";
import { C, MONO, SANS } from "../lib/theme";
import { cue } from "../lib/time";
import { Kicker, Serif, clamp, env, inOut, mix, outCubic, outExpo, p, useSpring, useT } from "../lib/ui";

const S = "hook";

export const Hook: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tNone = cue(S, "own");
  const tContact = cue(S, "contact");
  const tEmail = cue(S, "email");
  const tSeven = cue(S, "seven");
  const tFive = cue(S, "five times");
  const tZoom = cue(S, "ZoomInfo");
  const tSelling = cue(S, "selling");
  const tWhat = cue(S, "So what");

  // phase 1: claymation world + "owns no data"
  const ph1 = 1 - inOut(p(t, tSeven - 0.3, tSeven + 0.4));
  const zoom = mix(1.04, 1.14, p(t, 0, tSeven + 0.4));
  const blur = mix(0, 18, inOut(p(t, tSeven - 0.3, tSeven + 0.5)));
  const l1 = sp(tNone - 0.15, 16, 160);

  // phase 2: $7.1B
  const big = env(t, tSeven - 0.1, tFive - 0.1, 0.5, 0.5);
  // phase 3: bars
  const bars = env(t, tFive - 0.2, tWhat - 0.05, 0.5, 0.45);
  const growC = outExpo(p(t, tFive, tFive + 1.1));
  const growZ = outExpo(p(t, tZoom - 0.2, tZoom + 0.9));
  // phase 4: question
  const q = outCubic(p(t, tWhat - 0.1, tWhat + 0.5));

  const chip = (label: string, at: number, x: number, y: number) => {
    const k = sp(at - 0.1, 12, 190);
    const strike = outCubic(p(t, at + 0.35, at + 0.7));
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `scale(${k}) rotate(${-3 + (x % 7)}deg)`, opacity: clamp(k) * ph1 }}>
        <div style={{ position: "relative", padding: "18px 30px", background: C.paper, borderRadius: 20, fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.ink, boxShadow: "0 20px 40px -14px rgba(0,0,0,0.4)" }}>
          {label}
          <div style={{ position: "absolute", left: 18, right: 18, top: "50%", height: 6, background: C.red, borderRadius: 3, transformOrigin: "left", transform: `scaleX(${strike}) rotate(-4deg)` }} />
        </div>
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: C.greenDeep }}>
      {/* claymation landscape from clay.com */}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: `blur(${blur}px)`, opacity: mix(0.25, 1, ph1) }}>
        <Video src={staticFile("web/hero.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(2,59,43,0) 35%, rgba(2,59,43,${0.75 * ph1}) 100%)` }} />
      <AbsoluteFill style={{ background: C.greenDeep, opacity: 1 - ph1 * 1 }} />

      {/* "Clay owns no data." */}
      <div style={{ position: "absolute", left: 110, bottom: 150, opacity: ph1 }}>
        <Kicker color={C.lime} style={{ opacity: clamp(l1), marginBottom: 18 }}>Startup Deepdive · Clay · Nov 2026</Kicker>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 168, letterSpacing: "-0.045em", color: C.paper, lineHeight: 0.95, transform: `translateY(${(1 - l1) * 60}px)`, opacity: clamp(l1) }}>
          Clay owns <Serif size={176} color={C.lime}>no</Serif> data.
        </div>
      </div>
      {chip("1 contact", tContact, 1180, 330)}
      {chip("name@company.com", tEmail, 1260, 470)}

      {/* $7.1B */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: big }}>
        <Kicker color={C.lime} style={{ marginBottom: 10 }}>Valuation · Series D · Sep 2026</Kicker>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 330, letterSpacing: "-0.06em", color: C.paper, lineHeight: 1, transform: `scale(${mix(0.86, 1, outExpo(p(t, tSeven, tSeven + 0.8)))})` }}>
          ${(7.1 * outExpo(p(t, tSeven, tSeven + 1.3))).toFixed(1)}B
        </div>
      </AbsoluteFill>

      {/* bars: Clay vs ZoomInfo */}
      <AbsoluteFill style={{ opacity: bars, padding: "170px 180px" }}>
        <Kicker color={C.lime}>What the market pays · Oct 2026</Kicker>
        {[
          { name: "Clay", val: 7.1, k: growC, note: "owns no data", color: C.lime, icon: "Clay_icon-1.avif" },
          { name: "ZoomInfo", val: 1.3, k: growZ, note: "sells its own database", color: C.sky, icon: "3d-icon-blog.avif" },
        ].map((b, i) => (
          <div key={b.name} style={{ marginTop: i === 0 ? 70 : 50, display: "flex", alignItems: "center", gap: 30 }}>
            <Img src={staticFile(`web/${b.icon}`)} style={{ width: 110, height: 110, objectFit: "contain" }} />
            <div style={{ width: 280 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.paper, letterSpacing: "-0.03em" }}>{b.name}</div>
              <div style={{ fontFamily: MONO, fontSize: 19, letterSpacing: "0.14em", color: "rgba(254,253,251,0.65)", textTransform: "uppercase" }}>{b.note}</div>
            </div>
            <div style={{ height: 110, width: 1080 * (b.val / 7.1) * b.k, background: b.color, borderRadius: 22, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: b.val > 3 ? 30 : 0, minWidth: 8 }}>
              {b.val > 3 && <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.ink }}>$7.1B</span>}
            </div>
            {b.val < 3 && <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.paper, opacity: b.k }}>~$1.3B</span>}
          </div>
        ))}
        <div style={{ marginTop: 50, marginLeft: 450, fontFamily: SANS, fontWeight: 600, fontSize: 44, color: C.paper, opacity: outCubic(p(t, tSelling - 0.3, tSelling + 0.3)) }}>
          ≈ <span style={{ color: C.lime }}>5×</span> the market value of the company that <i>sells</i> the data
        </div>
      </AbsoluteFill>

      {/* question */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: q }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 120, color: C.paper, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1.05, transform: `translateY(${(1 - q) * 40}px)` }}>
          So what are they
          <br />
          <Serif size={136} color={C.lime}>paying for?</Serif>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
