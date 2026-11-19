import React from "react";
import { AbsoluteFill } from "remotion";
import { evolvePath } from "@remotion/paths";
import { C, MONO, SANS } from "../lib/theme";
import { cue, segAt } from "../lib/time";
import { Card, Chrome, Clay, Ground, Kicker, Serif, clamp, env, outCubic, p, useSpring, useT } from "../lib/ui";

const S = "gtme";

const Person: React.FC<{ c: string; s?: number }> = ({ c, s = 1 }) => (
  <svg width={60 * s} height={80 * s} viewBox="0 0 60 80">
    <circle cx="30" cy="20" r="15" fill={c} />
    <path d="M4 78 C4 48 56 48 56 78 Z" fill={c} />
  </svg>
);

/** a drawn-on arrow (path in 1920×1080 space) */
const Arrow: React.FC<{ d: string; k: number; color?: string; head: [number, number, number] }> = ({ d, k, color = C.ink, head }) => {
  if (k <= 0) return null;
  const ev = evolvePath(k, d);
  const [hx, hy, rot] = head;
  return (
    <>
      <path d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
      <path d="M-22 -16 L0 0 L-22 16" transform={`translate(${hx} ${hy}) rotate(${rot})`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={clamp((k - 0.85) / 0.15)} />
    </>
  );
};

const STEPS = [
  { name: "Define the target", what: "Who is the ideal customer?", tool: "Filters", ex: "Fintech · 50–500 people" },
  { name: "Pull the list", what: "Matching companies + key people", tool: "Find people", ex: "Orbital Pay → Priya Shah" },
  { name: "Fill the gaps", what: "Work email, phone, job title", tool: "Waterfall", ex: "priya@orbitalpay.com" },
  { name: "Look for signals", what: "Raised money? Hiring? Tools?", tool: "Claygent", ex: "Series B · hiring 4 SEs" },
  { name: "Score & write", what: "Who first + a personal opener", tool: "AI column", ex: "92 · “Congrats on the B…”" },
  { name: "Push it out", what: "CRM, email tool, ad platforms", tool: "Integrations", ex: "→ CRM · email · LinkedIn ads" },
];
const NUMW = ["one", "two", "three", "four", "five", "six"];

export const Gtme: React.FC = () => {
  const t = useT();
  const sp = useSpring();

  // A — three roles
  const tThree = cue(S, "three different people");
  const tSdr = cue(S, "SDR");
  const tAe = cue(S, "AE");
  const tSe = cue(S, "sales engineer");
  const tVarun = cue(S, "Varun puts");
  const [c0, c1] = segAt(S, "varun_threeroles");
  // B — a system
  const tHow = cue(S, "how can one");
  const tSys = cue(S, "building a system");
  // C — six steps
  const tStep = NUMW.map((n) => cue(S, `Step ${n}`));
  const tEng = cue(S, "engineer part");
  // D — loop
  const tWatch = cue(S, "watch what works");
  const tRules = cue(S, "change the rules");
  const tV = ["Version one", "version two", "version three"].map((w) => cue(S, w));
  const tNew = cue(S, "every new company");
  // T — trust & score
  const tTrust = cue(S, "trust the data");
  const [k0, k1] = segAt(S, "kareem_tools");
  const tCov = cue(S, "raises coverage");
  const tFour10 = cue(S, "four in ten");
  const tNine10 = cue(S, "nine in ten");
  const tCheck = cue(S, "check column");
  const tSpam = cue(S, "flagged as spam");
  const tRefresh = cue(S, "Third, refresh");
  const tRetest = cue(S, "retests");
  const tScore = cue(S, "And the score");
  const tRule = [cue(S, "fintech company"), cue(S, "Fifty to five"), cue(S, "Raised money"), cue(S, "Hiring security"), cue(S, "new security leader")];
  const t92 = cue(S, "ninety-two");
  const tFail = cue(S, "fails the check");
  const tAIcol = cue(S, "AI column", 2);
  const tPrio = cue(S, "prioritization");
  // E — Clay's own team
  const tOwn = cue(S, "runs its own");
  const tFour = cue(S, "four engineers");
  const tSix = cue(S, "six more");
  const tTick = cue(S, "tickets");
  const tTwice = cue(S, "twice a month");
  // F — system of action
  const tZoom = cue(S, "zoom out");
  const tRec = cue(S, "system of record");
  const tBrain = cue(S, "brains");
  const tMid = cue(S, "in the middle");
  const tPull = cue(S, "pulls data");
  const tAsk = cue(S, "asks the models");
  const tAct = cue(S, "takes the action");
  const tBack = cue(S, "writes the result");
  const tStores = cue(S, "The record stores");

  const A = env(t, 0, c0 + 0.3, 0.4, 0.4);
  const B = env(t, c1 - 0.3, tStep[0] - 0.1, 0.45, 0.45);
  const Cc = env(t, tStep[0] - 0.3, tEng - 0.1, 0.45, 0.45);
  const D = env(t, tEng - 0.3, tTrust - 0.1, 0.45, 0.45);
  const T0 = env(t, tTrust - 0.3, k0 + 0.3, 0.45, 0.4);
  const T1 = env(t, k1 - 0.3, tScore - 0.1, 0.45, 0.45);
  const T2 = env(t, tScore - 0.3, tOwn - 0.1, 0.45, 0.45);
  const E = env(t, tOwn - 0.3, tZoom - 0.1, 0.45, 0.45);
  const F = env(t, tZoom - 0.3, 999, 0.45, 0.4);

  const merge = outCubic(p(t, tVarun - 0.6, tVarun + 0.6));
  const roles = [
    { at: tSdr, h: "SDR", sub: "finds prospects, first emails", ic: "SDR.avif" },
    { at: tAe, h: "AE", sub: "runs the deal, closes it", ic: "sales.avif" },
    { at: tSe, h: "Sales engineer", sub: "technical questions", ic: "functions.png" },
  ];
  const active = tStep.reduce((a, s, i) => (t >= s - 0.2 ? i : a), -1);

  return (
    <AbsoluteFill>
      <Ground tint={C.purple} />

      {/* A — three people → one role */}
      <AbsoluteFill style={{ opacity: A }}>
        <Chrome n="05" label="GTM engineer" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em", opacity: outCubic(p(t, tThree - 0.3, tThree + 0.2)) }}>
          Before: <Serif size={74} color={C.green}>three people</Serif> to win one customer.
        </div>
        <div style={{ position: "absolute", left: 120, top: 330, width: 1680, display: "flex", justifyContent: "center", gap: 40 }}>
          {roles.map((r, i) => {
            const k = sp(r.at - 0.15, 12, 180);
            const dx = (1 - i) * 560 * merge;
            return (
              <Card key={r.h} style={{ width: 500, height: 430, padding: 36, display: "flex", flexDirection: "column", alignItems: "center", opacity: clamp(k) * (1 - outCubic(clamp(merge * 1.6))), transform: `translateX(${dx}px) translateY(${(1 - k) * 40}px) scale(${1 - merge * 0.25})` }}>
                <Clay src={r.ic} size={170} phase={i} bob={5} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: "-0.03em", marginTop: 18 }}>{r.h}</div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.mute, marginTop: 8, textAlign: "center" }}>{r.sub}</div>
              </Card>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", flexDirection: "column", alignItems: "center", opacity: merge, transform: `scale(${0.7 + 0.3 * sp(tVarun - 0.2, 10, 160)})` }}>
          <Clay src="RevOps.avif" size={190} bob={6} />
          <div style={{ marginTop: 18, padding: "14px 30px", borderRadius: 16, background: C.ink, color: C.lime, fontFamily: MONO, fontWeight: 700, fontSize: 40, letterSpacing: "0.14em", transform: "rotate(-2deg)" }}>GTM ENGINEER = 3 IN 1</div>
        </div>
      </AbsoluteFill>

      {/* B — not harder: a system */}
      <AbsoluteFill style={{ opacity: B, alignItems: "center", justifyContent: "center" }}>
        <Chrome n="05" label="GTM engineer" t={t - c1 + 0.6} />
        <Clay src="Automation.avif" size={260} bob={10} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 80, letterSpacing: "-0.045em", marginTop: 26, textAlign: "center", opacity: outCubic(p(t, tHow - 0.2, tHow + 0.3)) }}>
          Not three times harder.
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 80, letterSpacing: "-0.045em", textAlign: "center", opacity: outCubic(p(t, tSys - 0.2, tSys + 0.3)) }}>
          <Serif size={92} color={C.green}>Build a system</Serif> that does the repeats.
        </div>
      </AbsoluteFill>

      {/* C — the six steps, as one Clay table */}
      <AbsoluteFill style={{ opacity: Cc }}>
        <Chrome n="05" label="Inside one Clay table" t={t - tStep[0] + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 130, fontFamily: SANS, fontWeight: 600, fontSize: 58, letterSpacing: "-0.04em" }}>
          Six steps, <Serif size={66} color={C.green}>one table.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 236, width: 1680, display: "flex", fontFamily: MONO, fontSize: 18, letterSpacing: "0.2em", color: C.mute, padding: "0 30px" }}>
          <div style={{ width: 470 }}>STEP</div><div style={{ width: 520 }}>WHAT IT MEANS</div><div style={{ width: 280 }}>CLAY FEATURE</div><div>EXAMPLE CELL</div>
        </div>
        {STEPS.map((s, i) => {
          const k = sp(tStep[i] - 0.25, 13, 190);
          const on = i === active;
          const typed = clamp((t - tStep[i] - 0.8) / 1.0);
          const shown = s.ex.slice(0, Math.round(s.ex.length * typed));
          return (
            <div key={s.name} style={{
              position: "absolute", left: 120, top: 272 + i * 110, width: 1680, height: 96, borderRadius: 20, display: "flex", alignItems: "center", padding: "0 30px",
              background: C.paper, border: `2px solid ${on ? C.green : C.line}`, boxShadow: on ? "0 18px 40px -18px rgba(3,93,68,0.45)" : "none",
              opacity: clamp(k), transform: `translateX(${(1 - k) * 50}px) scale(${on ? 1.012 : 1})`,
            }}>
              <div style={{ width: 470, display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: on ? C.lime : C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.ink }}>{i + 1}</div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, letterSpacing: "-0.02em" }}>{s.name}</div>
              </div>
              <div style={{ width: 520, fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.mute }}>{s.what}</div>
              <div style={{ width: 280 }}>
                <span style={{ padding: "8px 18px", borderRadius: 999, background: on ? C.green : C.cream, color: on ? C.lime : C.green, fontFamily: MONO, fontWeight: 700, fontSize: 22 }}>{s.tool}</span>
              </div>
              <div style={{ fontFamily: MONO, fontWeight: 500, fontSize: 24, color: C.ink, whiteSpace: "nowrap" }}>
                {shown}
                {typed > 0 && typed < 1 ? <span style={{ color: C.green }}>▍</span> : null}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* D — the engineer part: iterate */}
      <AbsoluteFill style={{ opacity: D }}>
        <Chrome n="05" label="The engineer part" t={t - tEng + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em" }}>
          Run it. Measure it. <Serif size={74} color={C.green}>Ship a new version.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 320, display: "flex", alignItems: "center", gap: 30 }}>
          {[
            { at: tEng, h: "Run", ic: "Loop.avif" },
            { at: tWatch, h: "Measure", ic: "piechart.avif" },
            { at: tRules, h: "Tweak the rules", ic: "Workflows_icon.png" },
          ].map((x, i) => {
            const k = sp(x.at - 0.1, 12, 180);
            return (
              <React.Fragment key={x.h}>
                {i > 0 && <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 70, color: C.ink, opacity: clamp(k) }}>→</div>}
                <Card style={{ width: 340, height: 330, padding: 30, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: clamp(k), transform: `scale(${0.85 + 0.15 * k})` }}>
                  <Clay src={x.ic} size={170} phase={i} bob={5} />
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, marginTop: 14, whiteSpace: "nowrap" }}>{x.h}</div>
                </Card>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 1480, top: 330, width: 320, display: "flex", flexDirection: "column", gap: 22 }}>
          {tV.map((a, i) => {
            const k = sp(a - 0.1, 11, 200);
            return (
              <div key={i} style={{ padding: "18px 26px", borderRadius: 18, background: i === 2 ? C.lime : C.paper, border: `2px solid ${i === 2 ? C.ink : C.line}`, fontFamily: MONO, fontWeight: 700, fontSize: 34, opacity: clamp(k), transform: `translateY(${(1 - k) * 30}px)` }}>
                table v{i + 1}{i === 2 ? " ✓" : ""}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 120, top: 720, width: 1680, height: 110, borderRadius: 24, background: C.green, color: C.paper, display: "flex", alignItems: "center", padding: "0 40px", gap: 26, overflow: "hidden", opacity: outCubic(p(t, tNew - 0.3, tNew + 0.2)) }}>
          <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: "0.2em", color: C.lime, whiteSpace: "nowrap" }}>NEW ROWS →</div>
          {["Lumen Health", "Brightlane", "Vertex Labs", "Harbor AI", "Northwind"].map((n, i) => (
            <div key={n} style={{ padding: "10px 22px", borderRadius: 999, background: "rgba(255,255,255,0.12)", fontFamily: SANS, fontWeight: 600, fontSize: 28, whiteSpace: "nowrap", opacity: outCubic(p(t, tNew + 0.3 + i * 0.25, tNew + 0.6 + i * 0.25)) }}>{n} ✓✓✓✓✓✓</div>
          ))}
        </div>
      </AbsoluteFill>

      {/* T0 — can you trust it? */}
      <AbsoluteFill style={{ opacity: T0, alignItems: "center", justifyContent: "center" }}>
        <Chrome n="05" label="Can you trust the data?" t={t - tTrust + 0.6} />
        <Clay src="3d-icon-glass.avif" size={230} bob={8} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 92, letterSpacing: "-0.045em", marginTop: 26 }}>
          Can you <Serif size={104} color={C.green}>trust the data?</Serif>
        </div>
      </AbsoluteFill>

      {/* T1 — accuracy comes from the setup */}
      <AbsoluteFill style={{ opacity: T1 }}>
        <Chrome n="05" label="Accuracy comes from the setup" t={t - k1 + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          No promise. <Serif size={72} color={C.green}>Three safeguards.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 280, display: "flex", gap: 30 }}>
          {[
            { at: tCov, n: "1", h: "Ask many vendors", ic: "3d-icon-wave.avif" },
            { at: tCheck, n: "2", h: "Check every email", ic: "3d-icon-glass.avif" },
            { at: tRefresh, n: "3", h: "Refresh on a schedule", ic: "Loop.avif" },
          ].map((c, i) => {
            const k = sp(c.at - 0.2, 12, 180);
            return (
              <Card key={c.h} style={{ width: 540, height: 460, padding: 36, opacity: clamp(k), transform: `translateY(${(1 - k) * 40}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 56, height: 56, borderRadius: 28, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 28 }}>{c.n}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: "-0.03em" }}>{c.h}</div>
                </div>
                <div style={{ marginTop: 22 }}><Clay src={c.ic} size={110} phase={i} bob={4} /></div>
                {i === 0 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontFamily: MONO, fontSize: 20, color: C.mute, letterSpacing: "0.1em" }}>OPENAI · CONTACTS FOUND</div>
                    {[{ l: "1 vendor", v: 0.42, at: tFour10, c: C.sand }, { l: "waterfall", v: 0.87, at: tNine10, c: C.green }].map((b) => (
                      <div key={b.l} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
                        <div style={{ width: 130, fontFamily: SANS, fontWeight: 600, fontSize: 24 }}>{b.l}</div>
                        <div style={{ width: 300 * b.v * outCubic(p(t, b.at - 0.2, b.at + 0.6)), height: 30, borderRadius: 8, background: b.c }} />
                        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 26, opacity: outCubic(p(t, b.at, b.at + 0.4)) }}>{b.v === 0.42 ? "~4 in 10" : "~9 in 10"}</div>
                      </div>
                    ))}
                  </div>
                )}
                {i === 1 && (
                  <div style={{ marginTop: 18, fontFamily: SANS, fontSize: 28, lineHeight: 1.3 }}>
                    <div><span style={{ fontFamily: MONO, fontSize: 24 }}>priya@orbitalpay.com</span> <b style={{ color: C.green }}>✓ valid</b></div>
                    <div style={{ marginTop: 8 }}><span style={{ fontFamily: MONO, fontSize: 24 }}>p.shah@oldjob.com</span> <b style={{ color: C.red }}>✗ dead</b></div>
                    <div style={{ marginTop: 14, color: C.mute, fontWeight: 500, opacity: outCubic(p(t, tSpam - 0.3, tSpam + 0.2)) }}>Dead addresses → your mail lands in spam</div>
                  </div>
                )}
                {i === 2 && (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, color: C.orange }}>2–4%</div>
                    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.mute }}>of the data goes stale every month, so tables re-run</div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 120, top: 790, padding: "16px 28px", borderRadius: 18, background: C.green, color: C.paper, fontFamily: SANS, fontWeight: 600, fontSize: 30, opacity: outCubic(p(t, tRetest - 0.3, tRetest + 0.2)) }}>
          Clay also retests vendors, and sends each question to whoever answers it best.
        </div>
      </AbsoluteFill>

      {/* T2 — how the score works */}
      <AbsoluteFill style={{ opacity: T2 }}>
        <Chrome n="05" label="How the score works" t={t - tScore + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          No magic number. <Serif size={72} color={C.green}>You write the rules.</Serif>
        </div>
        <Card style={{ position: "absolute", left: 120, top: 270, width: 860, padding: "26px 36px" }}>
          <Kicker>Orbital Pay · rule-based score</Kicker>
          {[["Fintech company", 20], ["50–500 employees", 15], ["Raised money in last 3 months", 25], ["Hiring security engineers", 20], ["New security leader, last 90 days", 12]].map(([l, v], i) => (
            <div key={l as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 66, borderBottom: `1px solid ${C.line}`, opacity: outCubic(p(t, tRule[i] - 0.2, tRule[i] + 0.3)) }}>
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32 }}>{l}</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 32, color: C.green }}>+{v}</div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, position: "relative" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38 }}>Score</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 72, color: t > tFail ? C.red : C.ink, opacity: outCubic(p(t, t92 - 0.2, t92 + 0.3)) }}>
              {t > tFail ? "0" : "92"}
            </div>
          </div>
          <div style={{ marginTop: 10, padding: "12px 20px", borderRadius: 14, background: "#FDE8EA", color: C.red, fontFamily: SANS, fontWeight: 700, fontSize: 28, opacity: outCubic(p(t, tFail - 0.2, tFail + 0.3)) }}>
            Email fails the check → score 0, row stops here
          </div>
        </Card>
        <Card dark style={{ position: "absolute", left: 1040, top: 270, width: 760, padding: "30px 36px", opacity: clamp(sp(tAIcol - 0.2, 12, 180)) }}>
          <Kicker color={C.lime}>Or: an AI column</Kicker>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 14 }}>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 80, color: C.lime }}>87</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.paper }}>/ 100</div>
          </div>
          <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: "rgba(254,253,251,0.8)", lineHeight: 1.3 }}>“Just raised a Series B and hiring security staff. Strong fit.”</div>
        </Card>
        <div style={{ position: "absolute", left: 1040, top: 640, width: 760, fontFamily: SANS, fontWeight: 600, fontSize: 54, letterSpacing: "-0.04em", lineHeight: 1.15, opacity: outCubic(p(t, tPrio - 1.4, tPrio - 0.6)) }}>
          Highest score first. <Serif size={60} color={C.green}>Prioritize, don’t just personalize.</Serif>
        </div>
      </AbsoluteFill>

      {/* E — Clay runs itself this way */}
      <AbsoluteFill style={{ opacity: E }}>
        <Chrome n="05" label="Inside Clay" t={t - tOwn + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em" }}>
          Clay sells <Serif size={74} color={C.green}>the same way.</Serif>
        </div>
        {[
          { at: tFour, n: "~4", h: "Forward-deployed", sub: "Help customers design and build their tables", c: C.green, x: 120 },
          { at: tSix, n: "~6", h: "Internal", sub: "Run Clay’s own sales and marketing ops", c: C.ink, x: 980 },
        ].map((g) => {
          const k = sp(g.at - 0.2, 12, 180);
          return (
            <Card key={g.h} style={{ position: "absolute", left: g.x, top: 300, width: 820, height: 300, padding: 40, opacity: clamp(k), transform: `translateY(${(1 - k) * 40}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 110, letterSpacing: "-0.05em", color: g.c }}>{g.n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46 }}>{g.h}</div>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.mute, marginTop: 10 }}>{g.sub}</div>
            </Card>
          );
        })}
        <div style={{ position: "absolute", left: 120, top: 660, width: 1680, display: "flex", alignItems: "center", gap: 26, opacity: outCubic(p(t, tTick - 0.3, tTick + 0.2)) }}>
          {["ticket", "ticket", "ticket", "ticket"].map((x, i) => (
            <div key={i} style={{ padding: "16px 22px", borderRadius: 14, background: C.paper, border: `2px dashed ${C.sand}`, fontFamily: MONO, fontSize: 24, color: C.mute, opacity: outCubic(p(t, tTick + i * 0.15, tTick + 0.3 + i * 0.15)) }}>{x} #{41 + i}</div>
          ))}
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 60 }}>→</div>
          <div style={{ padding: "18px 30px", borderRadius: 18, background: C.lime, border: `2px solid ${C.ink}`, fontFamily: MONO, fontWeight: 700, fontSize: 30, opacity: outCubic(p(t, tTwice - 0.3, tTwice + 0.2)), transform: `scale(${t > tTwice - 0.3 ? sp(tTwice - 0.3, 9, 200) : 0.6})` }}>
            RELEASE · 2× / MONTH
          </div>
        </div>
        <div style={{ position: "absolute", left: 120, top: 800, fontFamily: MONO, fontSize: 20, letterSpacing: "0.12em", color: C.mute }}>SOURCE: EVERETT BERRY, HEAD OF GTM ENGINEERING · REVENUE LEADERSHIP PODCAST, OCT 2025</div>
      </AbsoluteFill>

      {/* F — system of record vs system of action */}
      <AbsoluteFill style={{ opacity: F }}>
        <Chrome n="05" label="System of action" t={t - tZoom + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 128, fontFamily: SANS, fontWeight: 600, fontSize: 56, letterSpacing: "-0.04em" }}>
          Zoom out: <Serif size={64} color={C.green}>a system of action.</Serif>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          <Arrow d="M560 610 L722 610" k={outCubic(p(t, tPull - 0.1, tPull + 0.6))} head={[722, 610, 0]} />
          <Arrow d="M935 450 L935 400" k={outCubic(p(t, tAsk - 0.1, tAsk + 0.4))} head={[935, 400, -90]} />
          <Arrow d="M985 400 L985 450" k={outCubic(p(t, tAsk + 0.4, tAsk + 0.8))} head={[985, 450, 90]} />
          <Arrow d="M1180 610 L1342 610" k={outCubic(p(t, tAct - 0.1, tAct + 0.6))} head={[1342, 610, 0]} />
          <Arrow d="M1580 760 L1580 820 L340 820 L340 772" color={C.green} k={outCubic(p(t, tBack - 0.1, tBack + 1.2))} head={[340, 772, -90]} />
        </svg>
        {[
          { at: tRec, x: 120, y: 460, w: 440, h: 300, kick: "System of record", h1: "CRM · warehouse", sub: "A filing cabinet. Stores, doesn’t act.", ic: "Clay-CRM.png", bg: C.paper },
          { at: tMid, x: 740, y: 460, w: 440, h: 300, kick: "System of action", h1: "Clay", sub: "Pulls data, decides, acts.", ic: "Clay_icon-1.avif", bg: C.lime },
          { at: tAct, x: 1360, y: 460, w: 440, h: 300, kick: "Actions", h1: "Out in the world", sub: "Send email · update list · ads", ic: "3d-icon-outbound.avif", bg: C.paper },
        ].map((b, i) => {
          const k = sp(b.at - 0.25, 12, 180);
          return (
            <Card key={b.kick} style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, padding: 30, background: b.bg, border: i === 1 ? `3px solid ${C.ink}` : undefined, opacity: clamp(k), transform: `translateY(${(1 - k) * 30}px)` }}>
              <Kicker color={i === 1 ? C.ink : C.green}>{b.kick}</Kicker>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
                <Clay src={b.ic} size={72} phase={i} bob={4} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, whiteSpace: "nowrap", letterSpacing: "-0.03em" }}>{b.h1}</div>
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: i === 1 ? C.ink : C.mute, marginTop: 18, lineHeight: 1.25 }}>{b.sub}</div>
            </Card>
          );
        })}
        <Card style={{ position: "absolute", left: 690, top: 236, width: 540, height: 164, padding: "20px 30px", opacity: clamp(sp(tBrain - 0.25, 12, 180)), display: "flex", alignItems: "center", gap: 22 }}>
          <Clay src="Claygent_Claymation.png" size={100} bob={4} />
          <div>
            <Kicker color={C.purple}>Intelligence layer</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, whiteSpace: "nowrap" }}>AI models think</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: C.mute }}>GPT, Claude… no data, no tools</div>
          </div>
        </Card>
        <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em", opacity: outCubic(p(t, tStores - 0.2, tStores + 0.3)) }}>
          The record <Serif size={72} color={C.mute}>stores.</Serif> Clay <Serif size={72} color={C.green}>acts.</Serif>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
