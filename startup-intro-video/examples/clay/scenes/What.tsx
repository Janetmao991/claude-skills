import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, MONO, SANS } from "../lib/theme";
import { cue, segAt } from "../lib/time";
import { Card, Chrome, Clay, Ground, Kicker, Serif, clamp, env, inOut, mix, outCubic, outExpo, p, useSpring, useT } from "../lib/ui";

const S = "what";

export const ROWS = [
  { co: "Northwind Robotics", name: "Priya Shah", title: "Head of Security", email: "priya@northwind.ai", sig: "Hiring 4 SREs" },
  { co: "Lumen Health", name: "Marco Díaz", title: "VP Security", email: "m.diaz@lumen.health", sig: "Raised Series B" },
  { co: "Brightlane", name: "Aiko Tanaka", title: "CISO", email: "aiko@brightlane.io", sig: "New CISO, 30d" },
  { co: "Orbital Pay", name: "Sam Okafor", title: "Head of Security", email: "sam@orbitalpay.com", sig: "SOC 2 in docs" },
  { co: "Vertex Labs", name: "Lena Novak", title: "Security Lead", email: "lena@vertexlabs.dev", sig: "Runs Google Ads" },
  { co: "Harbor Freight AI", name: "Ravi Menon", title: "VP Infrastructure", email: "ravi@harborai.co", sig: "Opened NYC office" },
];

/** A Clay-style table whose cells fill in, column by column, from `start`. */
export const ClayTable: React.FC<{ t: number; start: number; w?: number; rows?: number; colGap?: number; highlightCol?: number }> = ({ t, start, w = 1260, rows = 6, colGap = 0.55 }) => {
  const cols = [
    { h: "Company", k: "co", icon: "🏢", wd: 0.24 },
    { h: "Person", k: "name", icon: "👤", wd: 0.17 },
    { h: "Title", k: "title", icon: "✦", wd: 0.18 },
    { h: "Work email", k: "email", icon: "✉", wd: 0.24 },
    { h: "Signal", k: "sig", icon: "◎", wd: 0.17 },
  ] as const;
  return (
    <Card style={{ width: w, overflow: "hidden", padding: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "18px 26px", borderBottom: `1.5px solid ${C.line}` }}>
        <Img src={staticFile("web/Clay_icon-1.avif")} style={{ width: 34, height: 34 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.ink }}>Security leaders · Q4 outbound</div>
        <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 16, color: C.mute, letterSpacing: "0.1em" }}>{rows} ROWS · AUTO-RUN ON</div>
      </div>
      <div style={{ display: "flex", background: "#F7F6F3", borderBottom: `1.5px solid ${C.line}` }}>
        {cols.map((c) => (
          <div key={c.h} style={{ width: `${c.wd * 100}%`, padding: "12px 18px", fontFamily: SANS, fontWeight: 600, fontSize: 19, color: C.mute, borderRight: `1px solid ${C.line}` }}>
            <span style={{ marginRight: 8, opacity: 0.7 }}>{c.icon}</span>
            {c.h}
          </div>
        ))}
      </div>
      {ROWS.slice(0, rows).map((r, i) => (
        <div key={r.co} style={{ display: "flex", borderBottom: `1px solid ${C.line}` }}>
          {cols.map((c, j) => {
            const at = start + (j === 0 ? 0 : j * colGap + i * 0.09);
            const filled = j === 0 || t > at + 0.25;
            const loading = j > 0 && t > at - 0.35 && !filled;
            const a = j === 0 ? 1 : outCubic(p(t, at + 0.25, at + 0.5));
            return (
              <div key={c.k} style={{ width: `${c.wd * 100}%`, height: 58, padding: "0 18px", display: "flex", alignItems: "center", borderRight: `1px solid ${C.line}`, fontFamily: SANS, fontWeight: j === 0 ? 600 : 500, fontSize: 21, color: C.ink, whiteSpace: "nowrap", overflow: "hidden" }}>
                {loading && <div style={{ width: "70%", height: 14, borderRadius: 7, background: `linear-gradient(90deg, ${C.line}, ${C.sky}66, ${C.line})`, backgroundSize: "200% 100%", backgroundPosition: `${(t * 240) % 200}% 0` }} />}
                {filled && (
                  <span style={{ opacity: a, ...(c.k === "sig" ? { background: `${C.lime}`, padding: "4px 10px", borderRadius: 8, fontSize: 18, fontWeight: 600 } : {}) }}>{r[c.k]}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </Card>
  );
};

const STATS = [
  { v: "~$200M", l: "revenue per year, at current pace", s: "Q3 2026 · CEO", c: C.lime },
  { v: "17,000+", l: "paying customers", s: "Series D, Sep 2026", c: C.sky },
  { v: "$7.1B", l: "valuation", s: "Series D · Wellington led", c: C.peach },
  { v: "$317M", l: "raised from investors, ever", s: "since 2017", c: C.purple },
];

export const What: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tTable = cue(S, "spreadsheet");
  const tDrop = cue(S, "drop");
  const tVendors = cue(S, "vendors");
  const tAI = cue(S, "AI");
  const tCRM = cue(S, "CRM");
  const tDecides = cue(S, "decides");
  const tToday = cue(S, "Today");
  const tMore = cue(S, "keep spending");
  const [clip0, clip1] = segAt(S, "becca_ndr");
  const tWho = cue(S, "who are these");
  const tLogos = cue(S, "OpenAI");
  const tAI50 = cue(S, "Forbes");
  const tKinds = cue(S, "three kinds");
  const tBig = cue(S, "big companies");
  const tSelf = cue(S, "self-serve");
  const tAgen = cue(S, "third, agencies");
  const tRamp = cue(S, "One more");
  const tOne4 = cue(S, "one in four");
  const tThird = cue(S, "That's third");
  const W1 = env(t, clip1 - 0.3, tRamp - 0.1, 0.45, 0.45);
  const W2 = env(t, tRamp - 0.3, 999, 0.45, 0.4);

  const title = env(t, 0, tTable - 0.1, 0.4, 0.5);
  const work = env(t, tTable - 0.3, tToday - 0.1, 0.5, 0.5);
  const stats = outCubic(p(t, tToday - 0.2, tToday + 0.4));

  const vendorIcons = ["3d-icon-wave.avif", "3d-icon-wire.avif", "3d-icon-inbound.avif", "3d-icon-outbound.avif", "functions.png", "Automation.avif", "3d-icon-blog.avif", "Loop.avif", "Signals-satellite-dish-monitor.png", "piechart.avif"];
  const crm = sp(tCRM - 0.2, 14, 140);
  const route = outCubic(p(t, tDecides - 0.2, tDecides + 0.4));

  return (
    <AbsoluteFill>
      <Ground tint={C.sky} />
      {/* title card */}
      <AbsoluteFill style={{ background: C.green, opacity: title, alignItems: "flex-start", justifyContent: "center", padding: "0 150px" }}>
        <Img src={staticFile("web/Clay-primary-logo.avif")} style={{ height: 96, filter: "brightness(0) invert(1)", marginBottom: 40, transform: `translateY(${(1 - outExpo(p(t, 0, 0.7))) * 30}px)` }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 118, color: C.paper, letterSpacing: "-0.045em", lineHeight: 1.0 }}>
          The checkout for data,
          <br />
          <Serif size={128} color={C.lime}>not the data.</Serif>
        </div>
        <Kicker color={C.paper} style={{ marginTop: 44, opacity: 0.75 }}>A startup analysis · Janet Mao · Nov 2026</Kicker>
        <Clay src="Footer-Still-1.avif" size={560} x={1260} y={250} bob={10} style={{ borderRadius: 40, opacity: 0.95 }} />
      </AbsoluteFill>

      {/* the table that fills itself */}
      <AbsoluteFill style={{ opacity: work }}>
        <Chrome n="02" label="What Clay is" t={t - tTable} />
        <div style={{ position: "absolute", left: 120, top: 150 }}>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.035em", color: C.ink }}>
            A table that <Serif size={72} color={C.green}>fills itself.</Serif>
          </div>
        </div>
        <div style={{ position: "absolute", left: 120, top: 270, transform: `scale(${mix(0.96, 1, outCubic(p(t, tTable, tTable + 0.6)))})`, transformOrigin: "left top" }}>
          <ClayTable t={t} start={tDrop + 1.2} w={1240} />
        </div>
        {/* vendors orbit */}
        <div style={{ position: "absolute", left: 1430, top: 230, width: 400, height: 520 }}>
          <div style={{ position: "absolute", left: 30, top: 0, opacity: outCubic(p(t, tVendors - 0.3, tVendors + 0.2)) }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 92, color: C.ink, letterSpacing: "-0.05em", lineHeight: 1 }}>250+</div>
            <div style={{ fontFamily: MONO, fontSize: 20, letterSpacing: "0.18em", color: C.green }}>DATA VENDORS</div>
          </div>
          {vendorIcons.map((ic, i) => {
            const k = sp(tVendors - 0.3 + i * 0.07, 11, 190);
            const col = i % 4, row = Math.floor(i / 4);
            return <Clay key={ic} src={ic} size={84} x={20 + col * 92} y={150 + row * 96} s={clamp(k) * (0.6 + 0.4 * k)} phase={i} bob={5} />;
          })}
          <div style={{ position: "absolute", left: 20, top: 450, display: "flex", alignItems: "center", gap: 14, opacity: outCubic(p(t, tAI - 0.2, tAI + 0.3)) }}>
            <Clay src="Claygent_Claymation.png" size={92} bob={6} />
            <div>
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, color: C.ink }}>+ Claygent</div>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: C.mute }}>an AI that reads the web</div>
            </div>
          </div>
        </div>
        {/* routing + CRM */}
        <div style={{ position: "absolute", left: 120, top: 760, display: "flex", gap: 24, alignItems: "center" }}>
          <div style={{ opacity: clamp(crm), transform: `translateY(${(1 - crm) * 40}px)`, display: "flex", alignItems: "center", gap: 18, padding: "18px 26px", background: C.ink, borderRadius: 20, color: C.paper, fontFamily: SANS, fontWeight: 600, fontSize: 28 }}>
            ↳ writes every answer back into the CRM
          </div>
          <div style={{ opacity: route, transform: `translateY(${(1 - route) * 40}px)`, padding: "18px 26px", background: C.lime, borderRadius: 20, fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.ink }}>
            Clay decides who gets asked first — and who gets paid
          </div>
        </div>
      </AbsoluteFill>

      {/* stats */}
      <AbsoluteFill style={{ opacity: stats * (1 - inOut(p(t, clip0 - 0.2, clip0 + 0.3))) }}>
        <Ground tint={C.lime} />
        <Chrome n="02" label="Clay today" t={t - tToday + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 190, fontFamily: SANS, fontWeight: 600, fontSize: 70, letterSpacing: "-0.04em", color: C.ink }}>
          Nine years old. <Serif size={78} color={C.green}>Growing like a startup.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 360, display: "flex", gap: 28 }}>
          {STATS.map((s, i) => {
            const k = sp(tToday + i * 0.35 - 0.1, 13, 160);
            return (
              <Card key={s.v} style={{ width: 400, height: 330, padding: 34, transform: `translateY(${(1 - k) * 80}px)`, opacity: clamp(k), position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -40, top: -40, width: 160, height: 160, borderRadius: 999, background: s.c, opacity: 0.55 }} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 88, letterSpacing: "-0.05em", color: C.ink, marginTop: 60 }}>{s.v}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ink, marginTop: 6 }}>{s.l}</div>
                <div style={{ fontFamily: MONO, fontSize: 17, letterSpacing: "0.12em", color: C.mute, marginTop: 18, textTransform: "uppercase" }}>{s.s}</div>
              </Card>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 120, top: 740, display: "flex", alignItems: "center", gap: 24, opacity: outCubic(p(t, tMore - 0.2, tMore + 0.3)), transform: `translateY(${(1 - outCubic(p(t, tMore - 0.2, tMore + 0.3))) * 30}px)` }}>
          <div style={{ padding: "16px 28px", borderRadius: 18, background: C.green, color: C.lime, fontFamily: SANS, fontWeight: 800, fontSize: 44 }}>NDR ≈ 200%</div>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34 }}>net revenue retention: existing customers roughly <span style={{ background: C.lime, padding: "0 8px", borderRadius: 6 }}>double</span> their spend</div>
        </div>
        <div style={{ position: "absolute", left: 120, top: 860, fontFamily: MONO, fontSize: 18, letterSpacing: "0.12em", color: C.mute }}>
          2026 FIGURES ARE ANNUALIZED REVENUE INCL. USAGE · SOURCES: CLAY BLOG, NYT VIA DEALROOM, BETAKIT
        </div>
      </AbsoluteFill>

      {/* W1: who the customers are */}
      <AbsoluteFill style={{ opacity: W1 }}>
        <Ground tint={C.sky} />
        <Chrome n="02" label="Who buys Clay" t={t - clip1 + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em", opacity: outCubic(p(t, tWho - 0.2, tWho + 0.3)) }}>
          17,000+ customers. <Serif size={72} color={C.green}>Mostly fast-growing tech.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 260, display: "flex", gap: 14, alignItems: "center" }}>
          {["OpenAI", "Anthropic", "Figma", "Canva", "Rippling"].map((n, i) => (
            <div key={n} style={{ padding: "12px 26px", borderRadius: 999, background: C.paper, border: `1.5px solid ${C.line}`, fontFamily: SANS, fontWeight: 700, fontSize: 30, opacity: outCubic(p(t, tLogos + i * 0.3, tLogos + 0.3 + i * 0.3)) }}>{n}</div>
          ))}
          <div style={{ marginLeft: 14, padding: "12px 24px", borderRadius: 14, background: C.ink, color: C.lime, fontFamily: MONO, fontWeight: 700, fontSize: 24, opacity: outCubic(p(t, tAI50 - 0.2, tAI50 + 0.3)) }}>80% OF FORBES AI 50</div>
        </div>
        <div style={{ position: "absolute", left: 120, top: 380, display: "flex", gap: 30, opacity: outCubic(p(t, tKinds - 0.3, tKinds + 0.2)) }}>
          {[
            { at: tBig, h: "Big companies", job: "First job: CRM refresh", note: "Stay, and keep spending more", ic: "ent.avif", dark: true },
            { at: tSelf, h: "Self-serve teams", job: "Pull prospect lists", note: "Often leave for a month, then return", ic: "startups.avif", dark: false },
            { at: tAgen, h: "Agencies", job: "Build Clay tables for clients", note: "~150 official partners", ic: "agencies.avif", dark: false },
          ].map((c, i) => {
            const k = sp(c.at - 0.2, 12, 180);
            return (
              <Card key={c.h} dark={c.dark} style={{ width: 540, height: 420, padding: 36, opacity: clamp(k) * 0.85 + 0.15, transform: `translateY(${(1 - k) * 40}px)` }}>
                <Clay src={c.ic} size={120} phase={i} bob={5} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: "-0.03em", marginTop: 18, color: c.dark ? C.paper : C.ink }}>{c.h}</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, marginTop: 10, color: c.dark ? C.lime : C.green }}>{c.job}</div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, marginTop: 8, color: c.dark ? "rgba(254,253,251,0.72)" : C.mute }}>{c.note}</div>
              </Card>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* W2: Ramp adoption */}
      <AbsoluteFill style={{ opacity: W2 }}>
        <Ground tint={C.sky} />
        <Chrome n="02" label="Market share" t={t - tRamp + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          About <Serif size={72} color={C.green}>1 in 4</Serif> sales-data buyers use Clay.
        </div>
        <div style={{ position: "absolute", left: 120, top: 250, fontFamily: MONO, fontSize: 20, letterSpacing: "0.14em", color: C.mute }}>SHARE OF RAMP COMPANIES BUYING SALES DATA · OCT 2026</div>
        {[
          { n: "LinkedIn Sales Navigator", v: 48, c: C.sand },
          { n: "Apollo", v: 39, c: C.sand },
          { n: "Clay", v: 24, c: C.green },
          { n: "ZoomInfo", v: 17, c: C.sand },
        ].map((r, i) => {
          const g = outCubic(p(t, tOne4 - 0.3 + i * 0.15, tOne4 + 0.6 + i * 0.15));
          const hl = r.n === "Clay" && t > tThird - 0.2;
          return (
            <div key={r.n} style={{ position: "absolute", left: 120, top: 320 + i * 125, display: "flex", alignItems: "center", gap: 26 }}>
              <div style={{ width: 460, fontFamily: SANS, fontWeight: 700, fontSize: 38, color: r.n === "Clay" ? C.green : C.ink }}>{r.n}</div>
              <div style={{ width: r.v * 22 * g, height: 76, borderRadius: 16, background: r.c, boxShadow: hl ? `0 0 0 6px ${C.lime}` : "none" }} />
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 48, opacity: g }}>{r.v}%</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 120, top: 840, fontFamily: MONO, fontSize: 18, letterSpacing: "0.12em", color: C.mute }}>SOURCE: RAMP SPEND DATA · SKEWS TO STARTUPS AND MID-MARKET</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
