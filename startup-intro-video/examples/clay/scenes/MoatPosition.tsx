import React from "react";
import { AbsoluteFill } from "remotion";
import { C, MONO, SANS } from "../lib/theme";
import { cue, segAt } from "../lib/time";
import { Card, Chrome, Clay, Ground, Kicker, Serif, clamp, env, mix, outCubic, p, useSpring, useT } from "../lib/ui";

// ================= MOAT =================
const M = "moat";

const Row: React.FC<{ label: string; a: string; b: string; k: number }> = ({ label, a, b, k }) => (
  <div style={{ display: "flex", alignItems: "center", height: 108, borderTop: `1.5px solid ${C.line}`, opacity: clamp(k), transform: `translateY(${(1 - k) * 30}px)` }}>
    <div style={{ width: 260, fontFamily: MONO, fontSize: 20, letterSpacing: "0.14em", color: C.mute, textTransform: "uppercase" }}>{label}</div>
    <div style={{ width: 560, fontFamily: SANS, fontWeight: 600, fontSize: 36 }}>{a}</div>
    <div style={{ width: 560, fontFamily: SANS, fontWeight: 700, fontSize: 36, color: C.green }}>{b}</div>
  </div>
);

export const Moat: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tZ = cue(M, "Against ZoomInfo");
  const tOwn = cue(M, "own database");
  const tUsage = cue(M, "Clay charges");
  const tCopy = cue(M, "To copy");
  const tGrew = cue(M, "grew");
  const tEnt = cue(M, "Enterprise adoption");
  const tApollo = cue(M, "Against Apollo");
  const tCheaper = cue(M, "another contact-data");
  const tBundled = cue(M, "bundled");
  const tHard = cue(M, "hard to copy");
  const tNotSearch = cue(M, "Not the searching");
  const tOne = cue(M, "vendor contracts");
  const tRoute = cue(M, "routing know-how");
  const tSafe = cue(M, "running it safely");
  const tFourP = cue(M, "And four");
  const tPeople = cue(M, "whole community");
  const tTitleJ = cue(M, "job title");
  const tLine = cue(M, "line Clay up");
  const tCP = cue(M, "counter-positioning");
  const tFive = cue(M, "Five are");
  const tTwo = cue(M, "two are missing");
  const tApollo2 = cue(M, "Against Apollo", 2);
  const tAg = cue(M, "partner agencies");
  const tClubs = cue(M, "Clay Clubs");
  const tSlack = cue(M, "Slack");
  const tWeak = cue(M, "weak spot");
  const tBurned = cue(M, "burned");

  const A = env(t, 0, tApollo - 0.1, 0.4, 0.45);
  const B = env(t, tApollo - 0.3, tHard - 0.1, 0.45, 0.45);
  const H = env(t, tHard - 0.3, tPeople - 0.1, 0.45, 0.45);
  const Cc = env(t, tPeople - 0.3, tLine - 0.1, 0.45, 0.45);
  const SC = env(t, tLine - 0.3, tWeak - 0.1, 0.45, 0.45);
  const WK = env(t, tWeak - 0.3, 999, 0.45, 0.4);
  const ent = outCubic(p(t, tEnt, tEnt + 1.6));

  return (
    <AbsoluteFill>
      <Ground tint={C.orange} />
      <AbsoluteFill style={{ opacity: A }}>
        <Chrome n="06" label="Moat · vs ZoomInfo" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          Against ZoomInfo: <Serif size={72} color={C.green}>counter-positioning.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 270 }}>
          <div style={{ display: "flex", height: 70, alignItems: "flex-end", paddingBottom: 12, opacity: outCubic(p(t, tZ - 0.2, tZ + 0.3)) }}>
            <div style={{ width: 260 }} />
            <div style={{ width: 560, fontFamily: SANS, fontWeight: 700, fontSize: 40, display: "flex", alignItems: "center", gap: 12 }}><Clay src="3d-icon-blog.avif" size={56} bob={3} />ZoomInfo</div>
            <div style={{ width: 560, fontFamily: SANS, fontWeight: 700, fontSize: 40, display: "flex", alignItems: "center", gap: 12, color: C.green }}><Clay src="Clay_icon-1.avif" size={56} bob={3} />Clay</div>
          </div>
          <Row label="The data" a="Sells its own database" b="Resells every rival’s data" k={sp(tOwn - 0.2)} />
          <Row label="The price" a="By the seat" b="By usage · unlimited seats" k={sp(tUsage - 0.2)} />
          <Row label="To copy the other" a="Must cut its own revenue ✂" b="—" k={sp(tCopy - 0.2)} />
        </div>
        <div style={{ position: "absolute", left: 120, top: 700, display: "flex", gap: 30 }}>
          <Card style={{ width: 640, padding: "30px 36px", opacity: clamp(sp(tGrew - 0.2)) }}>
            <Kicker color={C.mute}>ZoomInfo · Q2 2026</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 80, letterSpacing: "-0.04em" }}>+1.2% <span style={{ fontSize: 34, fontWeight: 600, color: C.mute }}>growth · 89% NRR</span></div>
          </Card>
          <Card style={{ width: 820, padding: "30px 36px", opacity: clamp(sp(tEnt - 0.2)) }}>
            <Kicker>Enterprises buying Clay · Ramp spend data</Kicker>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 14 }}>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64 }}>7%</div>
              <div style={{ flex: 1, height: 26, borderRadius: 13, background: C.line, overflow: "hidden" }}>
                <div style={{ width: `${mix(7, 20, ent) * 3.4}%`, height: "100%", background: C.green, borderRadius: 13 }} />
              </div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, color: C.green }}>{Math.round(mix(7, 20, ent))}%</div>
            </div>
            <div style={{ fontFamily: SANS, fontSize: 24, color: C.mute }}>in two years</div>
          </Card>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: B }}>
        <Chrome n="06" label="Moat · vs Apollo" t={t - tApollo + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          Against Apollo: <Serif size={72} color={C.red}>no real edge.</Serif>
        </div>
        <Card style={{ position: "absolute", left: 120, top: 300, width: 760, padding: 44, opacity: clamp(sp(tCheaper - 0.3)) }}>
          <Clay src="prospecting.webp" size={130} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 54, marginTop: 20 }}>Apollo</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, marginTop: 10 }}>from <span style={{ color: C.green }}>$49 / month</span></div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36 }}>~40,000 paying customers</div>
          <div style={{ fontFamily: SANS, fontSize: 28, color: C.mute, marginTop: 14 }}>Cheaper and simpler — a different product shape, not a barrier.</div>
        </Card>
        <div style={{ position: "absolute", left: 960, top: 300, width: 840 }}>
          <Kicker style={{ opacity: outCubic(p(t, tBundled - 0.3, tBundled + 0.2)) }}>2026 · the CRM agents ship with Apollo inside</Kicker>
          {["Salesforce · Hunter agent", "HubSpot · Prospecting Agent"].map((n, i) => {
            const k = sp(tBundled - 0.1 + i * 0.35, 12, 170);
            return (
              <Card key={n} style={{ marginTop: 22, padding: "26px 32px", display: "flex", alignItems: "center", gap: 20, opacity: clamp(k), transform: `translateX(${(1 - k) * 60}px)` }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38 }}>{n}</div>
                <div style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 999, background: C.sky, fontFamily: SANS, fontWeight: 700, fontSize: 26 }}>data: Apollo</div>
              </Card>
            );
          })}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: Cc }}>
        <Chrome n="06" label="Moat · people" t={t - tPeople + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          The hardest thing to copy: <Serif size={72} color={C.green}>people.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 290, display: "flex", gap: 24 }}>
          {[
            { at: tTitleJ, v: "“GTM engineer”", l: "a job title Clay named", ic: "functions.png", big: false },
            { at: tAg, v: "150", l: "partner agencies · build tables for clients", ic: "agencies.avif", big: true },
            { at: tClubs, v: "90", l: "Clay Clubs · local user meetups", ic: "Heart-Tricolor.png", big: true },
            { at: tSlack, v: "~30K", l: "member Slack", ic: "Signal-News.png", big: true },
          ].map((c, i) => {
            const k = sp(c.at - 0.2, 12, 170);
            return (
              <Card key={c.l} style={{ width: 400, height: 330, padding: 34, opacity: clamp(k), transform: `translateY(${(1 - k) * 60}px)` }}>
                <Clay src={c.ic} size={100} phase={i} bob={5} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: c.big ? 84 : 46, letterSpacing: "-0.04em", marginTop: c.big ? 10 : 34 }}>{c.v}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.mute }}>{c.l}</div>
              </Card>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 120, top: 680, fontFamily: MONO, fontSize: 18, letterSpacing: "0.1em", color: C.mute, opacity: outCubic(p(t, tSlack, tSlack + 0.5)) }}>
          CAVEAT: ~45% OF GTM-ENGINEER JOB POSTS ARE AT AGENCIES AND CONSULTANCIES
        </div>
      </AbsoluteFill>

      {/* H: what is actually hard to copy */}
      <AbsoluteFill style={{ opacity: H }}>
        <Chrome n="06" label="Moat · what's hard to copy" t={t - tHard + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          Searching is easy. <Serif size={72} color={C.green}>Everything around it isn’t.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 250, fontFamily: SANS, fontWeight: 500, fontSize: 32, color: C.mute, opacity: outCubic(p(t, tNotSearch - 0.2, tNotSearch + 0.3)) }}>
          A good engineer with Claude Code can wire up a few vendors in an afternoon.
        </div>
        <div style={{ position: "absolute", left: 120, top: 340, display: "flex", gap: 24 }}>
          {[
            { at: tOne, n: "1", h: "250 contracts → 1 bill", b: "One account instead of dozens of vendor deals", ic: "3d-icon-blog.avif" },
            { at: tRoute, n: "2", h: "Routing know-how", b: "Seen across 17,000 customers: which vendor to ask first", ic: "3d-icon-wire.avif" },
            { at: tSafe, n: "3", h: "Safe in production", b: "Daily writes into a company’s CRM, without breaking it", ic: "Clay-CRM.png" },
            { at: tFourP, n: "4", h: "People", b: "A whole ecosystem trained on Clay", ic: "Heart-Tricolor.png" },
          ].map((c, i) => {
            const k = sp(c.at - 0.2, 12, 180);
            return (
              <Card key={c.h} dark={i === 1} style={{ width: 400, height: 440, padding: 32, opacity: clamp(k), transform: `translateY(${(1 - k) * 40}px)` }}>
                <div style={{ width: 52, height: 52, borderRadius: 26, background: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.ink }}>{c.n}</div>
                <div style={{ marginTop: 16 }}><Clay src={c.ic} size={100} phase={i} bob={4} /></div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 33, letterSpacing: "-0.03em", marginTop: 14, color: i === 1 ? C.paper : C.ink }}>{c.h}</div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 27, marginTop: 8, lineHeight: 1.25, color: i === 1 ? "rgba(254,253,251,0.75)" : C.mute }}>{c.b}</div>
              </Card>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 120, top: 820, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.green, opacity: outCubic(p(t, tRoute + 6, tRoute + 6.6)) }}>
          Clay’s real data asset isn’t contacts. It’s knowing who to ask first.
        </div>
      </AbsoluteFill>

      {/* SC: 8-moat scorecard */}
      <AbsoluteFill style={{ opacity: SC }}>
        <Chrome n="06" label="Moat · scorecard" t={t - tLine + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 60, letterSpacing: "-0.04em" }}>
          8 classic moats: <Serif size={68} color={C.green}>1 working, 5 building, 2 missing.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 270, width: 1680, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 30px" }}>
          {[
            { n: "Counter-positioning", d: "ZoomInfo can’t copy without cutting its own revenue", st: "has", at: tCP },
            { n: "Scale economies", d: "Volume buys cheaper data", st: "building", at: tFive + 0.6 },
            { n: "Network effects", d: "More users → more vendors join → better coverage", st: "building", at: tFive + 0.9 },
            { n: "Switching costs", d: "Real for big companies, weak for self-serve", st: "building", at: tFive + 1.2 },
            { n: "Brand", d: "Known among operators; no price premium yet", st: "building", at: tFive + 1.5 },
            { n: "Process power", d: "Years of vendor ops + a tested research agent", st: "building", at: tFive + 1.8 },
            { n: "Cornered resource", d: "No exclusive data or talent", st: "none", at: tTwo + 0.5 },
            { n: "Regulation / IP", d: "No licence barrier; legal risk instead", st: "none", at: tTwo + 0.9 },
          ].map((r) => {
            const k = sp(r.at - 0.2, 12, 200);
            const col = r.st === "has" ? C.green : r.st === "building" ? C.orange : C.mute;
            return (
              <div key={r.n} style={{ height: 112, borderRadius: 20, background: C.paper, border: `2px solid ${r.st === "has" ? C.green : C.line}`, display: "flex", alignItems: "center", padding: "0 28px", gap: 22, opacity: clamp(k), transform: `translateX(${(1 - k) * 30}px)` }}>
                <div style={{ width: 150, padding: "8px 0", textAlign: "center", borderRadius: 999, background: r.st === "has" ? C.green : r.st === "building" ? "#FFE9D6" : C.cream, color: r.st === "has" ? C.lime : col, fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.1em", textTransform: "uppercase" }}>{r.st}</div>
                <div>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32 }}>{r.n}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: C.mute }}>{r.d}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 120, top: 830, padding: "14px 26px", borderRadius: 16, background: C.ink, color: C.paper, fontFamily: SANS, fontWeight: 600, fontSize: 30, opacity: outCubic(p(t, tApollo2 - 0.2, tApollo2 + 0.3)) }}>
          vs Apollo (cheaper, simpler): no clear moat at all
        </div>
      </AbsoluteFill>

      {/* WK: the weak spot */}
      <AbsoluteFill style={{ opacity: WK }}>
        <Chrome n="06" label="Moat · weak spot" t={t - tWeak + 0.6} />
        {/* weak spot: the meter */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", flexDirection: "column", alignItems: "center", gap: 30, transform: "scale(1.5)", opacity: outCubic(p(t, tWeak - 0.2, tWeak + 0.3)) }}>
          <Kicker color={C.red}>The weak spot: the meter</Kicker>
          <Card style={{ padding: "20px 30px", display: "flex", alignItems: "center", gap: 24, transform: `rotate(${mix(0, -1.5, outCubic(p(t, tBurned, tBurned + 0.4)))}deg)` }}>
            <div style={{ fontFamily: MONO, fontSize: 24 }}>Workbook re-run by mistake</div>
            <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.red }}>−$1,000 <span style={{ fontSize: 26, fontWeight: 600 }}>in credits</span></div>
            <div style={{ padding: "8px 18px", borderRadius: 999, background: C.ink, color: C.paper, fontFamily: SANS, fontWeight: 700, fontSize: 24, opacity: outCubic(p(t, tBurned + 0.9, tBurned + 1.3)) }}>cancelled</div>
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= POSITIONING =================
const P = "position";

const STEPS = [
  { when: "2018", text: "Create cloud-hosted microservices", w: 740, side: "n" },
  { when: "2021", text: "This spreadsheet fills itself", w: 580, side: "n" },
  { when: "2023", text: "Not another data provider. All of the data providers.", w: 440, side: "n" },
  { when: "Nov 2024", text: "“System of action”", w: 420, side: "w", ic: "Automation.avif" },
  { when: "Jan 2025", text: "GTM development environment", w: 520, side: "w", ic: "CLI.png" },
  { when: "Apr 2026", text: "MCP · CLI · Codex · Claude Code", w: 620, side: "w", ic: "MCP_icon.png" },
  { when: "Sep 2026", text: "Agents that grow your company for you", w: 720, side: "w", ic: "AI-SDR.png" },
];

export const Position: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tUntil = cue(P, "Until");
  const tMicro = cue(P, "microservices");
  const tSheet = cue(P, "spreadsheet");
  const tAll = cue(P, "Not another");
  const tWiden = cue(P, "widened");
  const [c0, cEnd] = segAt(P, "kareem_action");
  const tGtm = cue(P, "GTM development");
  const tMcp = cue(P, "MCP");
  const tSep = cue(P, "this September");
  const tMoving = cue(P, "moving");
  const ats = [tMicro - 0.6, tSheet - 0.3, tAll - 0.2, tWiden + 0.2, tGtm - 0.2, tMcp - 0.2, tSep - 0.2];

  const main = env(t, 0, tMoving - 0.1, 0.4, 0.45);
  const fin = outCubic(p(t, tMoving - 0.2, tMoving + 0.4));
  const hide = 1 - outCubic(p(t, c0 - 0.2, c0 + 0.3)) + outCubic(p(t, cEnd - 0.3, cEnd + 0.2));

  return (
    <AbsoluteFill>
      <Ground tint={C.purple} />
      <AbsoluteFill style={{ opacity: main * clamp(hide) }}>
        <Chrome n="07" label="Positioning" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          Years of <Serif size={72} color={C.red}>narrowing</Serif>, then <Serif size={72} color={C.green}>widening</Serif>.
        </div>
        {/* phase labels */}
        <div style={{ position: "absolute", left: 120, top: 270, width: 800, fontFamily: MONO, fontSize: 20, letterSpacing: "0.16em", color: C.red, opacity: outCubic(p(t, tUntil, tUntil + 0.4)) }}>
          2017 – EARLY 2024 · EVERY MOVE CUT SCOPE (BEFORE CHATGPT)
        </div>
        <div style={{ position: "absolute", left: 1000, top: 270, fontFamily: MONO, fontSize: 20, letterSpacing: "0.16em", color: C.green, opacity: outCubic(p(t, tWiden, tWiden + 0.4)) }}>
          MID-2024 → · EACH MOVE AFTER AN OUTSIDE WAVE
        </div>
        {/* hourglass of headlines */}
        {STEPS.map((s, i) => {
          const k = sp(ats[i], 13, 160);
          const narrow = s.side === "n";
          const x = narrow ? 120 + (740 - s.w) / 2 : 1000;
          const y = narrow ? 340 + i * 200 : 340 + (i - 3) * 160;
          return (
            <div key={s.when} style={{ position: "absolute", left: x, top: y, width: s.w, opacity: clamp(k), transform: `translateY(${(1 - k) * 40}px)` }}>
              <Card style={{ padding: "22px 28px", display: "flex", alignItems: "center", gap: 20, border: narrow ? `1.5px solid ${C.line}` : `2px solid ${C.green}` }}>
                {s.ic && <Clay src={s.ic} size={84} phase={i} bob={4} />}
                <div>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: "0.14em", color: narrow ? C.mute : C.green }}>{s.when}</div>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, lineHeight: 1.12, letterSpacing: "-0.01em" }}>{s.text}</div>
                </div>
              </Card>
            </div>
          );
        })}
        {/* funnel guides */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.5 * outCubic(p(t, tAll, tAll + 0.6)) }}>
          <path d="M100 330 L380 900 M880 330 L600 900" stroke={C.red} strokeWidth={3} strokeDasharray="8 10" fill="none" />
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: fin, alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
          <Card style={{ width: 600, height: 380, padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Clay src="Clay-CRM.png" size={250} bob={4} />
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: "-0.03em" }}>a table you work in</div>
          </Card>
          <svg width={160} height={80}><path d="M10 40 H130 M100 12 L140 40 L100 68" stroke={C.ink} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <Card dark style={{ width: 600, height: 380, padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between", transform: `scale(${mix(0.9, 1, fin)})` }}>
            <div style={{ display: "flex", gap: 14 }}>
              {["MCP_icon.png", "CLI.png", "AI-SDR.png", "Workflows_icon.png"].map((ic, i) => <Clay key={ic} src={ic} size={110} phase={i} bob={5} />)}
            </div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: "-0.03em", color: C.paper }}>a layer that <span style={{ color: C.lime }}>other AIs call</span></div>
          </Card>
        </div>
        <div style={{ marginTop: 50, fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.mute, width: 1300, textAlign: "center" }}>
          Unsettled inside: Kareem, June — “we’re not building a microwave… we’re building a guitar.” Three months later the lead launch was an agent that “plans and runs” the task.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
