import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MONO, SANS } from "../lib/theme";
import { cue, segAt } from "../lib/time";
import { Card, Chrome, Clay, Ground, Kicker, Serif, clamp, env, mix, outCubic, p, useSpring, useT } from "../lib/ui";

const S = "product";

const Person: React.FC<{ c: string; s?: number }> = ({ c, s = 1 }) => (
  <svg width={60 * s} height={80 * s} viewBox="0 0 60 80">
    <circle cx="30" cy="20" r="15" fill={c} />
    <path d="M4 78 C4 48 56 48 56 78 Z" fill={c} />
  </svg>
);

export const Product: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tCol = cue(S, "Every column");
  const tSay = cue(S, "Say");
  const tOne = cue(S, "asks one vendor");
  const tNext = cue(S, "next one");
  const tNext2 = cue(S, "and the next");
  const tCredit = cue(S, "only spend");
  const tWaterfall = cue(S, "waterfall");
  const tHalf = cue(S, "half");
  const tClaygent = cue(S, "Claygent");
  const tDefining = cue(S, "defining");
  const tNotRep = cue(S, "Not the sales rep");
  const tOps = cue(S, "One or two");
  const tReps = cue(S, "reps just");
  const tTitle = cue(S, "job title");
  const [g0] = segAt(S, "varun_gtme");
  const [, gEnd] = segAt(S, "varun_gtme");
  const [n0, nEnd] = segAt(S, "varun_notsales");
  const tWhy = cue(S, "That's why");
  const tShrink = cue(S, "shrinks");
  const tCost = cue(S, "trade-off");

  const A = env(t, 0, tDefining - 0.1, 0.4, 0.45);
  const B = env(t, tDefining - 0.3, g0 + 0.3, 0.45, 0.4);
  const Bn = env(t, gEnd - 0.3, n0 + 0.3, 0.4, 0.4);
  const Cc = env(t, nEnd - 0.3, 999, 0.4, 0.4);

  const vendors = [
    { n: "Vendor 1", ic: "3d-icon-wave.avif", at: tOne, ok: false },
    { n: "Vendor 2", ic: "3d-icon-wire.avif", at: tNext, ok: false },
    { n: "Vendor 3", ic: "Loop.avif", at: tNext2, ok: true },
  ];
  const found = t > tNext2 + 0.6;

  return (
    <AbsoluteFill>
      <Ground tint={C.sky} />
      {/* A — the waterfall */}
      <AbsoluteFill style={{ opacity: A }}>
        <Chrome n="04" label="Product" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em", color: C.ink }}>
          Every column is an <Serif size={72} color={C.green}>action.</Serif>
        </div>
        {/* the row */}
        <Card style={{ position: "absolute", left: 120, top: 290, width: 700, padding: 0, overflow: "hidden", opacity: outCubic(p(t, tCol - 0.2, tCol + 0.4)) }}>
          {[
            ["Company", "Orbital Pay"],
            ["Person", "Sam Okafor"],
            ["Title", "Head of Security"],
          ].map(([h, v]) => (
            <div key={h} style={{ display: "flex", borderBottom: `1px solid ${C.line}`, height: 74, alignItems: "center", padding: "0 28px", fontFamily: SANS, fontSize: 30 }}>
              <div style={{ width: 200, color: C.mute, fontWeight: 500 }}>{h}</div>
              <div style={{ fontWeight: 600 }}>{v}</div>
            </div>
          ))}
          <div style={{ display: "flex", height: 92, alignItems: "center", padding: "0 28px", fontFamily: SANS, fontSize: 30, background: t > tSay ? `${C.lime}66` : "transparent" }}>
            <div style={{ width: 200, color: C.green, fontWeight: 700 }}>✉ Work email</div>
            {found ? (
              <div style={{ fontWeight: 700, opacity: outCubic(p(t, tNext2 + 0.6, tNext2 + 0.9)) }}>sam@orbitalpay.com</div>
            ) : t > tSay ? (
              <div style={{ width: 300, height: 18, borderRadius: 9, background: `linear-gradient(90deg, ${C.line}, ${C.sky}88, ${C.line})`, backgroundSize: "200% 100%", backgroundPosition: `${(t * 240) % 200}% 0` }} />
            ) : null}
          </div>
        </Card>
        {/* vendors cascade */}
        <div style={{ position: "absolute", left: 900, top: 270 }}>
          <Kicker style={{ opacity: outCubic(p(t, tWaterfall - 0.2, tWaterfall + 0.3)), marginBottom: 16 }}>The waterfall ↓</Kicker>
          {vendors.map((v, i) => {
            const k = sp(v.at - 0.2, 13, 170);
            const res = outCubic(p(t, v.at + 0.45, v.at + 0.75));
            return (
              <div key={v.n} style={{ marginLeft: i * 70, marginTop: i ? 22 : 0, opacity: clamp(k), transform: `translateX(${(1 - k) * 80}px)` }}>
                <Card style={{ width: 640, height: 112, display: "flex", alignItems: "center", gap: 22, padding: "0 26px", border: v.ok && res > 0.5 ? `3px solid ${C.green}` : `1.5px solid ${C.line}` }}>
                  <Clay src={v.ic} size={72} phase={i} bob={4} />
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34 }}>{v.n}</div>
                  <div style={{ marginLeft: "auto", opacity: res, fontFamily: SANS, fontWeight: 700, fontSize: 30, padding: "8px 18px", borderRadius: 999, background: v.ok ? C.green : `${C.red}22`, color: v.ok ? C.paper : C.red }}>
                    {v.ok ? "✓ found · 1 credit" : "✗ no match · free"}
                  </div>
                </Card>
              </div>
            );
          })}
          {/* credit coin */}
          <div style={{ marginLeft: 380, marginTop: 26, display: "flex", alignItems: "center", gap: 16, opacity: outCubic(p(t, tCredit - 0.2, tCredit + 0.3)) }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: C.lime, border: `4px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 30, transform: `rotateY(${(t * 180) % 360}deg)` }}>¢</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30 }}>pay only when someone answers</div>
          </div>
        </div>
        {/* why it works */}
        <div style={{ position: "absolute", left: 120, top: 720, display: "flex", gap: 22, opacity: env(t, tHalf - 0.3, tClaygent - 0.1) }}>
          <Card style={{ padding: "24px 30px", width: 480 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.green }}>&lt; 50%</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26 }}>the most any one vendor covers</div>
          </Card>
          <Card style={{ padding: "24px 30px", width: 480 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, color: C.orange }}>2–4% / mo</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26 }}>how fast contact data goes stale</div>
          </Card>
        </div>
        {/* Claygent */}
        <div style={{ position: "absolute", left: 120, top: 700, display: "flex", alignItems: "center", gap: 26, opacity: outCubic(p(t, tClaygent - 0.2, tClaygent + 0.3)) }}>
          <Clay src="Claygent_Claymation.png" size={150} bob={6} />
          <Card style={{ width: 900, padding: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", gap: 8, padding: "12px 18px", background: "#F2F1EE", alignItems: "center" }}>
              {[C.red, C.orange, C.lime].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />)}
              <div style={{ marginLeft: 14, fontFamily: MONO, fontSize: 20, color: C.mute }}>orbitalpay.com/trust</div>
            </div>
            <div style={{ padding: "18px 26px", fontFamily: SANS, fontSize: 30, display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontWeight: 600 }}>Claygent: “Do their docs mention SOC 2?”</span>
              <span style={{ marginLeft: "auto", padding: "6px 16px", borderRadius: 999, background: C.lime, fontWeight: 700, opacity: outCubic(p(t, tClaygent + 1.6, tClaygent + 2)) }}>Yes ✓</span>
            </div>
          </Card>
        </div>
      </AbsoluteFill>

      {/* B — built for the operator, not the rep */}
      <AbsoluteFill style={{ opacity: B }}>
        <Chrome n="04" label="Who it's built for" t={t - tDefining + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 150, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em", color: C.ink }}>
          Built for the <Serif size={74} color={C.green}>operator</Serif> behind the rep.
        </div>
        <Card style={{ position: "absolute", left: 160, top: 330, width: 560, height: 520, padding: 40, opacity: clamp(sp(tOps - 0.2)) }}>
          <Kicker>1–2 people build</Kicker>
          <div style={{ display: "flex", gap: 10, marginTop: 30, alignItems: "flex-end" }}>
            <Person c={C.green} s={1.8} />
            <Person c={C.green} s={1.8} />
            <Clay src="functions.png" size={150} />
          </div>
          <div style={{ marginTop: 30, display: "inline-block", padding: "12px 24px", borderRadius: 14, background: C.ink, color: C.lime, fontFamily: MONO, fontWeight: 700, fontSize: 30, letterSpacing: "0.14em", transform: `scale(${t > tTitle - 0.1 ? sp(tTitle - 0.1, 9, 200) : 0}) rotate(-3deg)` }}>
            GTM ENGINEER
          </div>
        </Card>
        {/* arrow */}
        <svg width={260} height={80} style={{ position: "absolute", left: 750, top: 560, opacity: outCubic(p(t, tReps - 0.3, tReps + 0.2)) }}>
          <path d="M10 40 H220 M190 12 L230 40 L190 68" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <Card style={{ position: "absolute", left: 1040, top: 330, width: 720, height: 520, padding: 40, opacity: clamp(sp(tNotRep - 0.2)) }}>
          <Kicker color={C.mute}>Many reps just see the output</Kicker>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 30, width: 620 }}>
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} style={{ opacity: outCubic(p(t, tNotRep + i * 0.04, tNotRep + 0.3 + i * 0.04)) }}>
                <Person c={i % 3 ? C.sand : C.mute} s={0.95} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: 22, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.mute }}>Sales reps don’t build in Clay.</div>
        </Card>
      </AbsoluteFill>

      {/* B2 — narrow on purpose */}
      <AbsoluteFill style={{ opacity: Bn, alignItems: "center", justifyContent: "center" }}>
        <Clay src="3d-icon-glass.avif" size={220} bob={10} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 96, letterSpacing: "-0.045em", color: C.ink, marginTop: 30, textAlign: "center" }}>
          A narrow audience, <Serif size={104} color={C.green}>on purpose.</Serif>
        </div>
      </AbsoluteFill>

      {/* C — usage pricing */}
      <AbsoluteFill style={{ opacity: Cc }}>
        <Chrome n="04" label="Pricing" t={t - nEnd + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 150, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em", color: C.ink }}>
          Charge for usage. <Serif size={74} color={C.green}>Seats are free.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 320, display: "flex", gap: 40 }}>
          {[
            { h: "Per-seat data tools", sub: "ZoomInfo-style", bars: [10, 8, 6, 4], col: C.sand, note: "Team shrinks → revenue shrinks" },
            { h: "Clay", sub: "usage · unlimited seats", bars: [10, 10.5, 11, 11.6], col: C.green, note: "Team shrinks → work still runs" },
          ].map((b, i) => (
            <Card key={b.h} style={{ width: 800, height: 470, padding: 40, opacity: clamp(sp(tWhy - 0.2 + i * 0.4)) }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: "-0.03em" }}>{b.h}</div>
              <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.14em", color: C.mute, textTransform: "uppercase" }}>{b.sub}</div>
              <div style={{ display: "flex", gap: 34, alignItems: "flex-end", height: 220, marginTop: 30 }}>
                {b.bars.map((v, j) => {
                  const g = outCubic(p(t, tShrink - 0.4 + j * 0.15, tShrink + j * 0.15));
                  const val = mix(10, v, g);
                  return (
                    <div key={j} style={{ textAlign: "center" }}>
                      <div style={{ width: 120, height: val * 18, background: b.col, borderRadius: 14 }} />
                      <div style={{ fontFamily: MONO, fontSize: 18, color: C.mute, marginTop: 8 }}>{["Y1", "Y2", "Y3", "Y4"][j]}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, marginTop: 20, color: i ? C.green : C.mute, opacity: outCubic(p(t, tShrink, tShrink + 0.5)) }}>{b.note}</div>
            </Card>
          ))}
        </div>
        <div style={{ position: "absolute", left: 120, top: 830, display: "flex", gap: 20, opacity: outCubic(p(t, tCost - 0.2, tCost + 0.3)) }}>
          <div style={{ padding: "14px 24px", borderRadius: 16, background: C.ink, color: C.paper, fontFamily: SANS, fontWeight: 600, fontSize: 28 }}>The cost: a narrow, skilled user base</div>
          <div style={{ padding: "14px 24px", borderRadius: 16, background: C.paper, border: `1.5px solid ${C.line}`, fontFamily: SANS, fontWeight: 600, fontSize: 28 }}>~50/50 self-serve vs. sales-led (Oct 2025)</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

