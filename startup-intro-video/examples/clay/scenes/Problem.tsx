import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MONO, SANS } from "../lib/theme";
import { cue } from "../lib/time";
import { Card, Chrome, Clay, Ground, Kicker, Serif, clamp, env, mix, outCubic, p, useSpring, useT } from "../lib/ui";

const S = "problem";
const COS = ["Northwind Robotics", "Lumen Health", "Brightlane", "Orbital Pay", "Vertex Labs", "Harbor Freight AI"];

const Seat: React.FC<{ on: boolean }> = ({ on }) => (
  <svg width={54} height={70} viewBox="0 0 60 80">
    <circle cx="30" cy="20" r="15" fill={on ? C.green : C.line} />
    <path d="M4 78 C4 48 56 48 56 78 Z" fill={on ? C.green : C.line} />
  </svg>
);

export const Problem: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tImagine = cue(S, "Imagine");
  const tList = cue(S, "list of companies");
  const tNot = cue(S, "isn't enough");
  const tWho = cue(S, "who to talk");
  const tReach = cue(S, "how to reach");
  const tTime = cue(S, "good time");
  const tBig = cue(S, "big data companies");
  const tZoom = cue(S, "ZoomInfo");
  const tSeat = cue(S, "per seat");
  const tCatch = cue(S, "catch");
  const tStale = cue(S, "stale");
  const tTwo = cue(S, "Two to four");

  const A = env(t, 0, tBig - 0.1, 0.4, 0.45);
  const B = env(t, tBig - 0.3, tCatch - 0.1, 0.45, 0.45);
  const Cc = env(t, tCatch - 0.3, 999, 0.45, 0.4);
  const half = outCubic(p(t, tCatch + 0.6, tCatch + 1.8));
  const moved = outCubic(p(t, tStale - 0.1, tStale + 0.6));

  return (
    <AbsoluteFill>
      <Ground tint={C.sky} />
      {/* A: you have a list of names, but you need people */}
      <AbsoluteFill style={{ opacity: A }}>
        <Chrome n="01" label="The problem" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em", opacity: outCubic(p(t, tImagine - 0.2, tImagine + 0.3)) }}>
          You sell software <Serif size={72} color={C.green}>to other companies.</Serif>
        </div>
        <Card style={{ position: "absolute", left: 120, top: 290, width: 620, padding: 0, overflow: "hidden", opacity: clamp(sp(tList - 0.2)) }}>
          <div style={{ padding: "16px 26px", borderBottom: `1.5px solid ${C.line}`, fontFamily: MONO, fontSize: 18, letterSpacing: "0.14em", color: C.mute }}>TARGET ACCOUNTS.CSV</div>
          {COS.map((c, i) => (
            <div key={c} style={{ height: 70, display: "flex", alignItems: "center", padding: "0 26px", borderBottom: `1px solid ${C.line}`, fontFamily: SANS, fontWeight: 600, fontSize: 32, opacity: outCubic(p(t, tList + i * 0.12, tList + 0.3 + i * 0.12)) }}>
              {c}
            </div>
          ))}
        </Card>
        <div style={{ position: "absolute", left: 800, top: 300, display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.mute, opacity: outCubic(p(t, tNot - 0.2, tNot + 0.3)) }}>A list of names isn’t enough. You need to know:</div>
          {[
            { at: tWho, q: "Who to talk to?", a: "the Head of Security", ic: "SDR.avif" },
            { at: tReach, q: "How to reach them?", a: "a work email that works", ic: "3d-icon-outbound.avif" },
            { at: tTime, q: "Is now a good time?", a: "just raised money? hiring?", ic: "Signals-satellite-dish-monitor.png" },
          ].map((x, i) => {
            const k = sp(x.at - 0.15, 12, 180);
            return (
              <Card key={x.q} style={{ width: 900, padding: "22px 30px", display: "flex", alignItems: "center", gap: 26, opacity: clamp(k), transform: `translateX(${(1 - k) * 60}px)` }}>
                <Clay src={x.ic} size={90} phase={i} bob={4} />
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: "-0.02em" }}>{x.q}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.mute }}>{x.a}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* B: so you buy it from a database like ZoomInfo, per seat */}
      <AbsoluteFill style={{ opacity: B }}>
        <Chrome n="01" label="The old way" t={t - tBig + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          The old way: <Serif size={72} color={C.green}>buy it from a big database.</Serif>
        </div>
        <Card style={{ position: "absolute", left: 120, top: 300, width: 760, height: 520, padding: 46, opacity: clamp(sp(tZoom - 0.3)) }}>
          <Clay src="3d-icon-blog.avif" size={170} bob={6} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, letterSpacing: "-0.03em", marginTop: 24 }}>ZoomInfo</div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.mute, marginTop: 8, lineHeight: 1.25 }}>The biggest seller of business contacts. Owns one giant database.</div>
        </Card>
        <Card style={{ position: "absolute", left: 940, top: 300, width: 860, height: 520, padding: 46, opacity: clamp(sp(tSeat - 0.3)) }}>
          <Kicker>Priced per seat</Kicker>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, marginTop: 14 }}>You pay for every salesperson who logs in.</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 40, width: 760 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: outCubic(p(t, tSeat + i * 0.08, tSeat + 0.3 + i * 0.08)) }}>
                <Seat on />
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: C.green, marginTop: 6 }}>$</div>
              </div>
            ))}
          </div>
        </Card>
      </AbsoluteFill>

      {/* C: the catch — partial coverage, stale data */}
      <AbsoluteFill style={{ opacity: Cc }}>
        <Chrome n="01" label="The catch" t={t - tCatch + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          The catch: <Serif size={72} color={C.red}>no database has everyone.</Serif>
        </div>
        <Card style={{ position: "absolute", left: 120, top: 300, width: 760, height: 540, padding: 46, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width={340} height={340} viewBox="-170 -170 340 340">
            <circle r={150} fill={C.line} />
            <path d={`M0 0 L0 -150 A150 150 0 ${half > 0.5 ? 1 : 0} 1 ${150 * Math.sin(Math.PI * 2 * 0.48 * half)} ${-150 * Math.cos(Math.PI * 2 * 0.48 * half)} Z`} fill={C.sky} />
            <circle r={150} fill="none" stroke={C.ink} strokeWidth={3} />
          </svg>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, marginTop: 22, textAlign: "center" }}>Any one vendor: ≤ ~½ of the people you want</div>
        </Card>
        <Card style={{ position: "absolute", left: 940, top: 300, width: 860, height: 540, padding: 46, opacity: outCubic(p(t, tStale - 0.5, tStale)) }}>
          <Kicker color={C.orange}>And it goes stale</Kicker>
          <div style={{ marginTop: 30, padding: "26px 30px", borderRadius: 22, border: `2px solid ${C.line}`, position: "relative" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38 }}>Priya Shah</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.mute, textDecoration: moved > 0.5 ? "line-through" : "none" }}>Head of Security · Northwind</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.green, opacity: moved, transform: `translateY(${(1 - moved) * 20}px)` }}>→ now CISO at a different company</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 50, opacity: outCubic(p(t, tTwo - 0.2, tTwo + 0.3)) }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 96, letterSpacing: "-0.05em", color: C.orange }}>2–4%</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, transform: `translateY(${mix(0, 0, 1)}px)` }}>goes out of date<br />every month</div>
          </div>
        </Card>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
