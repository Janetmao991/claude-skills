import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, MONO, SANS } from "../lib/theme";
import { TL, cue, scene, segAt } from "../lib/time";
import { Card, Chrome, Clay, Ground, Kicker, Serif, clamp, env, inOut, mix, outCubic, outExpo, p, useSpring, useT } from "../lib/ui";

const Face: React.FC<{ img: string; size?: number }> = ({ img, size = 120 }) => (
  <Img src={staticFile(img)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", border: `4px solid ${C.paper}`, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.35)" }} />
);

// ================= BUSINESS MODEL =================
const B = "model";

export const Model: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tEveryone = cue(B, "Everyone");
  const tFounders = cue(B, "two founders");
  const [c0] = segAt(B, "kareem_commodity");
  const [, c2end] = segAt(B, "varun_distribution");
  const tSeq = cue(B, "Sequoia");
  const tNotice = cue(B, "Notice");
  const tRaw = cue(B, "raw material");
  const tAnyone = cue(B, "Anyone can buy");
  const tWrong = cue(B, "starts out wrong");
  const tMiddleB = cue(B, "standing in the middle");
  const tRest = cue(B, "great restaurant");
  const tInvest = cue(B, "Investors");
  const t185 = cue(B, "hundred and eighty-five");
  const t5c = cue(B, "five cents");
  const t1c = cue(B, "under one cent");
  const tMemo = cue(B, "pricing memo");
  const tBreak = cue(B, "breakeven");
  const tSplit = cue(B, "split");
  const tData = cue(B, "Data got");
  const tAction = cue(B, "Action");
  const tStore = cue(B, "store");
  const tCheckout = cue(B, "checkout");
  const tBet = cue(B, "That's the bet");
  const tSeven = cue(B, "Seven point");
  const tApollo = cue(B, "Apollo");
  const tZoom = cue(B, "ZoomInfo");
  const tMoney = cue(B, "Money");
  const tRisk = cue(B, "The risk");

  const A = env(t, 0, c0 + 0.3, 0.4, 0.4);
  const M0 = env(t, c2end - 0.3, tInvest - 0.1, 0.45, 0.45);
  const M1 = env(t, tInvest - 0.3, tStore - 0.1, 0.45, 0.45);
  const M2 = env(t, tStore - 0.3, tBet - 0.1, 0.45, 0.45);
  const M3 = env(t, tBet - 0.3, 999, 0.45, 0.4);
  const split = outCubic(p(t, tSplit, tSplit + 0.8));

  return (
    <AbsoluteFill>
      <Ground tint={C.lime} />
      {/* A: the disagreement */}
      <AbsoluteFill style={{ opacity: A }}>
        <Chrome n="08" label="Business model" t={t} />
        <div style={{ position: "absolute", left: 120, top: 150, display: "flex", alignItems: "center", gap: 30, opacity: outCubic(p(t, tEveryone - 0.2, tEveryone + 0.3)) }}>
          <Clay src="3d-icon-blog.avif" size={120} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 56, letterSpacing: "-0.035em" }}>
            Everyone else: <span style={{ position: "relative" }}>owning the data <i>is</i> the moat.</span>
          </div>
        </div>
        <div style={{ position: "absolute", left: 120, top: 340, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em", opacity: outCubic(p(t, tFounders - 0.2, tFounders + 0.3)) }}>
          Clay’s founders: <Serif size={72} color={C.green}>one point, two angles.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 480, display: "flex", gap: 40 }}>
          {[
            { img: "faces/kareem.jpg", n: "Kareem · CEO", q: "“Data is a commodity.”", c: C.peach },
            { img: "faces/varun.jpg", n: "Varun · co-founder", q: "“We’re the distribution partner for all these data providers.”", c: C.sky },
          ].map((f, i) => {
            const k = sp(tFounders + 0.3 + i * 0.4, 12, 160);
            return (
              <Card key={f.n} style={{ width: 800, padding: 36, display: "flex", gap: 28, alignItems: "center", opacity: clamp(k), transform: `translateY(${(1 - k) * 60}px) rotate(${i ? 1 : -1}deg)` }}>
                <Face img={f.img} size={150} />
                <div>
                  <Kicker color={C.mute}>{f.n}</Kicker>
                  <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.15, marginTop: 10, letterSpacing: "-0.02em" }}>{f.q}</div>
                </div>
              </Card>
            );
          })}
        </div>
      </AbsoluteFill>

      {/* M0: data isn't useless, owning it isn't the edge */}
      <AbsoluteFill style={{ opacity: M0 }}>
        <Chrome n="08" label="What they mean" t={t - c2end + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 62, letterSpacing: "-0.04em", opacity: outCubic(p(t, tNotice - 0.2, tNotice + 0.3)) }}>
          Data isn’t useless. <Serif size={70} color={C.green}>Owning it isn’t the edge.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 280, display: "flex", gap: 30 }}>
          <Card style={{ width: 800, height: 440, padding: 38, opacity: clamp(sp(tRaw - 0.2)) }}>
            <Kicker color={C.orange}>Why owning data doesn’t protect you</Kicker>
            {[{ at: tAnyone, x: "Anyone can buy it" }, { at: tAnyone + 1.2, x: "It goes stale (2–4% a month)" }, { at: tAnyone + 2.6, x: "Nobody has all of it" }, { at: tWrong, x: "Clay assumes it starts out wrong → gives tools to check" }].map((r) => (
              <div key={r.x} style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, marginTop: 22, opacity: outCubic(p(t, r.at - 0.2, r.at + 0.3)) }}>• {r.x}</div>
            ))}
          </Card>
          <Card dark style={{ width: 850, height: 440, padding: 38, opacity: clamp(sp(tMiddleB - 0.2)) }}>
            <Kicker color={C.lime}>The edge: standing in the middle</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.paper, marginTop: 22, lineHeight: 1.3 }}>Vendors need Clay’s demand → the best ones come to prove their data → Clay sends them customers.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 34, opacity: outCubic(p(t, tRest - 0.2, tRest + 0.3)) }}>
              <Clay src="Heart-Tricolor.png" size={90} bob={4} />
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.lime, lineHeight: 1.25 }}>A great restaurant doesn’t own a farm. It knows which market sells the best tomatoes.</div>
            </div>
          </Card>
        </div>
      </AbsoluteFill>

      {/* M1: workflow story vs. data revenue, then the split meter */}
      <AbsoluteFill style={{ opacity: M1 }}>
        <Chrome n="08" label="Business model" t={t - tInvest + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 60, letterSpacing: "-0.04em" }}>
          Investors buy the workflow. <Serif size={68} color={C.orange}>Revenue came from data.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 290, display: "flex", gap: 30 }}>
          <Card style={{ width: 640, padding: 34, opacity: clamp(sp(tSeq - 0.3)) }}>
            <Kicker>What investors say</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, marginTop: 14, lineHeight: 1.2 }}>Sequoia: “orchestration layer”</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 36, marginTop: 8, lineHeight: 1.2 }}>Meritech: “the GTM team’s IDE”</div>
          </Card>
          <Card style={{ width: 860, padding: 34, opacity: clamp(sp(tMemo - 0.3)), background: "#FFFBEA" }}>
            <Kicker color={C.orange}>Clay’s own pricing memo · Mar 2026</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, marginTop: 14, lineHeight: 1.3 }}>
              Charged “primarily per <span style={{ background: t > tMemo + 1.2 ? C.lime : "transparent" }}>data point</span>.”
              <br />Pro credits sold “at or below <span style={{ background: t > tBreak ? C.lime : "transparent" }}>breakeven</span>.”
            </div>
          </Card>
        </div>
        {/* the meter splits */}
        <div style={{ position: "absolute", left: 120, top: 640, display: "flex", alignItems: "center", gap: 40, opacity: outCubic(p(t, tSplit - 0.3, tSplit + 0.2)) }}>
          <div style={{ padding: "22px 34px", borderRadius: 22, background: C.ink, color: C.paper, fontFamily: SANS, fontWeight: 700, fontSize: 40, opacity: 1 - 0.6 * split }}>1 credit</div>
          <svg width={140} height={200}>
            <path d={`M10 100 C70 100 70 ${100 - 70 * split} 130 ${100 - 70 * split} M10 100 C70 100 70 ${100 + 70 * split} 130 ${100 + 70 * split}`} stroke={C.ink} strokeWidth={6} fill="none" />
          </svg>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Card style={{ padding: "18px 30px", display: "flex", alignItems: "center", gap: 20, opacity: clamp(sp(tData - 0.2)) }}>
              <Clay src="3d-icon-wave.avif" size={64} bob={3} />
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38 }}>Data credits</div>
              <div style={{ padding: "6px 16px", borderRadius: 999, background: C.lime, fontFamily: SANS, fontWeight: 700, fontSize: 28 }}>50–90% cheaper</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, opacity: outCubic(p(t, t5c - 0.2, t5c + 0.3)) }}>from ~$0.05</div>
            </Card>
            <Card dark style={{ padding: "18px 30px", display: "flex", alignItems: "center", gap: 20, opacity: clamp(sp(tAction - 0.2)) }}>
              <Clay src="Automation.avif" size={64} bob={3} />
              <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.paper }}>Actions</div>
              <div style={{ padding: "6px 16px", borderRadius: 999, background: C.paper, fontFamily: SANS, fontWeight: 700, fontSize: 28 }}>new · charges for running the workflow</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.lime, opacity: outCubic(p(t, t1c - 0.2, t1c + 0.3)) }}>&lt; $0.01</div>
            </Card>
          </div>
        </div>
        <div style={{ position: "absolute", left: 120, top: 880, padding: "12px 24px", borderRadius: 14, background: C.paper, border: `1.5px solid ${C.line}`, fontFamily: SANS, fontWeight: 600, fontSize: 30, opacity: outCubic(p(t, t185 - 0.2, t185 + 0.3)) }}>
          Today: self-serve from <b>$185 / month</b> · unlimited seats · enterprise priced custom
        </div>
      </AbsoluteFill>

      {/* M2: store analogy */}
      <AbsoluteFill style={{ opacity: M2 }}>
        <Chrome n="08" label="The analogy" t={t - tStore + 0.6} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 220, display: "flex", justifyContent: "center", gap: 80 }}>
          <Card style={{ width: 640, height: 520, padding: 46, opacity: clamp(sp(tStore)) }}>
            <Clay src="piechart.avif" size={170} />
            <Kicker color={C.mute} style={{ marginTop: 26 }}>Before</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 54, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 10 }}>Earn the markup on the goods</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: C.mute, marginTop: 12 }}>resell vendor data · thin margin</div>
          </Card>
          <Card dark style={{ width: 640, height: 520, padding: 46, opacity: clamp(sp(tCheckout - 0.4)), transform: `scale(${mix(0.92, 1, outExpo(p(t, tCheckout - 0.4, tCheckout + 0.4)))})` }}>
            <Clay src="SDR.avif" size={170} />
            <Kicker color={C.lime} style={{ marginTop: 26 }}>After Mar 2026</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 54, letterSpacing: "-0.03em", lineHeight: 1.1, marginTop: 10, color: C.paper }}>Also charge for the checkout</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: "rgba(254,253,251,0.7)", marginTop: 12 }}>Actions = the workflow itself</div>
          </Card>
        </div>
      </AbsoluteFill>

      {/* M3: multiples + cash */}
      <AbsoluteFill style={{ opacity: M3 }}>
        <Chrome n="08" label="Valuation ÷ revenue" t={t - tBet + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 60, letterSpacing: "-0.04em" }}>
          The market prices <Serif size={68} color={C.green}>the layer that decides</Serif>, not the database.
        </div>
        {[
          { n: "Clay", d: "Sep 2026 · $7.1B ÷ ~$200M", v: 35.5, at: tSeven, c: C.green, txt: "35.5×" },
          { n: "Apollo", d: "Dec 2025 · Sacra, fwd revenue", v: 10.7, at: tApollo, c: C.sky, txt: "10.7×" },
          { n: "ZoomInfo", d: "Oct 2026 · ~$1.3B ÷ ~$1.24B", v: 1, at: tZoom, c: C.sand, txt: "~1×" },
        ].map((r, i) => {
          const g = outExpo(p(t, r.at - 0.1, r.at + 1.0));
          return (
            <div key={r.n} style={{ position: "absolute", left: 120, top: 300 + i * 130, display: "flex", alignItems: "center", gap: 30, opacity: clamp(g * 3) }}>
              <div style={{ width: 330 }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44 }}>{r.n}</div>
                <div style={{ fontFamily: MONO, fontSize: 17, color: C.mute, letterSpacing: "0.06em" }}>{r.d}</div>
              </div>
              <div style={{ width: Math.max(14, (r.v / 35.5) * 1000 * g), height: 84, borderRadius: 20, background: r.c }} />
              <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 64, letterSpacing: "-0.04em" }}>{r.txt}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 120, top: 720, display: "flex", gap: 24, opacity: outCubic(p(t, tMoney - 0.2, tMoney + 0.3)) }}>
          <Card style={{ padding: "24px 32px" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56 }}>$317M</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.mute }}>total raised, ever</div>
          </Card>
          <Card style={{ padding: "24px 32px", width: 600 }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, lineHeight: 1.2 }}>Earned more in interest than it burned</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.mute }}>Jan 2026 · cash-flow positive for parts of 2025</div>
          </Card>
          <div style={{ padding: "24px 32px", borderRadius: 28, background: C.ink, color: C.paper, display: "flex", alignItems: "center", fontFamily: SANS, fontWeight: 700, fontSize: 38, opacity: outCubic(p(t, tRisk - 0.2, tRisk + 0.3)) }}>
            Risk = the valuation,&nbsp;<span style={{ color: C.lime }}>not survival</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= RISK =================
const R = "risk";

export const Risk: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tBypass = cue(R, "bypassed");
  const tAbove = cue(R, "From above");
  const tHunter = cue(R, "Hunter");
  const tZoom = cue(R, "ZoomInfo");
  const [c0, c1] = segAt(R, "varun_snowflake");
  const tBelow = cue(R, "From below");
  const tWins = cue(R, "simply wins");
  const tScale = cue(R, "answer is scale");
  const [b0, b1] = segAt(R, "becca_reps");
  const tBoth = cue(R, "Both sides");
  const tSup = cue(R, "one more risk");
  const tNext = cue(R, "asks the next");
  const tDepend = cue(R, "depend on");
  const tUp = cue(R, "further upstream");
  const tLI = cue(R, "built on LinkedIn");
  const tProxy = cue(R, "Proxycurl");
  const tDry = cue(R, "dries up");

  const main = env(t, 0, b0 + 0.3, 0.4, 0.4) * clamp(1 - outCubic(p(t, c0 - 0.2, c0 + 0.3)) + outCubic(p(t, c1 - 0.3, c1 + 0.2)));
  const fin = env(t, b1 - 0.3, tSup - 0.1, 0.5, 0.45);
  const sup = env(t, tSup - 0.3, 999, 0.45, 0.4);
  const above = outCubic(p(t, tAbove - 0.2, tAbove + 0.6));
  const below = outCubic(p(t, tBelow - 0.2, tBelow + 0.6));
  const squeeze = mix(0, 1, outCubic(p(t, tBelow + 0.5, tWins)));
  const clayH = mix(220, 150, squeeze);

  return (
    <AbsoluteFill>
      <Ground tint={C.red} />
      <AbsoluteFill style={{ opacity: main }}>
        <Chrome n="09" label="The biggest risk" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          Not beaten. <Serif size={72} color={C.red}>Bypassed.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 240, fontFamily: MONO, fontSize: 20, letterSpacing: "0.14em", color: C.mute, opacity: outCubic(p(t, tBypass, tBypass + 0.5)) }}>
          OUR ODDS: ~1 IN 3 OVER THREE YEARS (A JUDGMENT CALL)
        </div>
        {/* above */}
        <div style={{ position: "absolute", left: 560, top: 300, width: 1240, opacity: above, transform: `translateY(${(1 - above) * -40 + squeeze * 20}px)` }}>
          <Kicker color={C.red}>↓ From above · CRMs & AI assistants</Kicker>
          <div style={{ display: "flex", gap: 18, marginTop: 14 }}>
            {[
              { n: "Salesforce Hunter", s: "ships with Apollo", at: tHunter },
              { n: "HubSpot Prospecting Agent", s: "ships with Apollo", at: tHunter + 0.5 },
              { n: "ZoomInfo → Claude, Codex", s: "sells direct over MCP", at: tZoom },
            ].map((c) => (
              <Card key={c.n} style={{ flex: 1, padding: "22px 26px", opacity: clamp(sp(c.at - 0.2)) }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>{c.n}</div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: C.mute }}>{c.s}</div>
              </Card>
            ))}
          </div>
        </div>
        {/* Clay in the middle */}
        <div style={{ position: "absolute", left: 560, top: 560 + squeeze * 10, width: 1240, height: clayH - 40, borderRadius: 28, background: C.green, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, opacity: outCubic(p(t, 0.3, 0.9)) }}>
          <Img src={staticFile("web/Clay-primary-logo.avif")} style={{ height: 70, filter: "brightness(0) invert(1)" }} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.lime }}>the middle layer</div>
        </div>
        {/* below */}
        <div style={{ position: "absolute", left: 560, top: 780 - squeeze * 20, width: 1240, opacity: below }}>
          <Kicker color={C.red}>↑ From below · Claude Code + vendor APIs</Kicker>
          <Card style={{ marginTop: 14, padding: "20px 26px", display: "flex", alignItems: "center", gap: 20 }}>
            <Clay src="CLI.png" size={64} bob={3} />
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30 }}>“For individual specialists, small teams, and agencies, Claude Code simply wins.”</div>
            <div style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 16, color: C.mute, whiteSpace: "nowrap" }}>ex-customer, $500/mo plan</div>
          </Card>
        </div>
        <Clay src="Signals-satellite-dish-monitor.png" size={260} x={150} y={420} bob={10} />
        <div style={{ position: "absolute", left: 120, top: 720, width: 380, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.ink, opacity: outCubic(p(t, tScale - 0.2, tScale + 0.3)) }}>
          Clay’s answer: <span style={{ color: C.green }}>scale.</span>
        </div>
      </AbsoluteFill>

      {/* both sides are right */}
      <AbsoluteFill style={{ opacity: fin }}>
        <Chrome n="09" label="Who's right?" t={t - b1 + 0.6} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 72, letterSpacing: "-0.04em" }}>
          Both sides are right — <Serif size={80} color={C.green}>about their own segment.</Serif>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, display: "flex", justifyContent: "center", gap: 60 }}>
          <Card style={{ width: 700, padding: 44, opacity: clamp(sp(b1 - 0.1)) }}>
            <Kicker color={C.red}>Solo operators · small agencies</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, letterSpacing: "-0.03em", marginTop: 16 }}>Claude Code wins</div>
            <div style={{ fontFamily: SANS, fontSize: 30, color: C.mute, marginTop: 8 }}>one person, wired straight to vendor APIs</div>
          </Card>
          <Card dark style={{ width: 700, padding: 44, opacity: clamp(sp(tBoth + 0.4)) }}>
            <Kicker color={C.lime}>100 reps · enterprise</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 56, letterSpacing: "-0.03em", marginTop: 16, color: C.paper }}>Clay wins</div>
            <div style={{ fontFamily: SANS, fontSize: 30, color: "rgba(254,253,251,0.72)", marginTop: 8 }}>contracts, one bill, governed CRM writes</div>
          </Card>
        </div>
      </AbsoluteFill>
      {/* supply risk */}
      <AbsoluteFill style={{ opacity: sup }}>
        <Chrome n="09" label="Supply risk" t={t - tSup + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 64, letterSpacing: "-0.04em" }}>
          One more risk: <Serif size={72} color={C.red}>supply.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 290, display: "flex", gap: 40 }}>
          <Card style={{ width: 780, height: 500, padding: 40 }}>
            <Kicker>What if one vendor stops selling?</Kicker>
            {[{ at: tNext, x: "Barely matters: the waterfall just asks the next one" }, { at: tDepend, x: "Many small vendors depend on Clay’s volume" }].map((r) => (
              <div key={r.x} style={{ display: "flex", gap: 18, marginTop: 30, alignItems: "flex-start", opacity: outCubic(p(t, r.at - 0.3, r.at + 0.2)) }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.green }}>✓</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, lineHeight: 1.25 }}>{r.x}</div>
              </div>
            ))}
          </Card>
          <Card style={{ width: 860, height: 500, padding: 40, border: `3px solid ${C.red}`, opacity: clamp(sp(tUp - 0.2)) }}>
            <Kicker color={C.red}>The real danger: one shared source</Kicker>
            {[{ at: tLI, x: "Varun: many vendors are built on LinkedIn data" }, { at: tProxy, x: "Proxycurl shut down in 2025 after a LinkedIn lawsuit" }, { at: tDry, x: "If it dries up, many vendors lose it at once. Switching won’t help." }].map((r) => (
              <div key={r.x} style={{ display: "flex", gap: 18, marginTop: 28, alignItems: "flex-start", opacity: outCubic(p(t, r.at - 0.3, r.at + 0.2)) }}>
                <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 40, color: C.red }}>!</div>
                <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, lineHeight: 1.25 }}>{r.x}</div>
              </div>
            ))}
          </Card>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ================= VERDICT + END =================
const V = "verdict";

export const Verdict: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const tRacing = cue(V, "racing");
  const tBuild = cue(V, "At building");
  const tRun = cue(V, "At running");
  const tContracts = cue(V, "two hundred and fifty");
  const tBuys = cue(V, "The seven point");
  const tWatch = cue(V, "Watch three");
  const w = [cue(V, "About two"), cue(V, "The share"), cue(V, "whether enterprises")];
  const sc = scene(V);
  const endAt = TL.total - sc.start - 3.2;

  const A = env(t, 0, tWatch - 0.1, 0.4, 0.45);
  const Bv = env(t, tWatch - 0.3, endAt, 0.45, 0.5);
  const End = outCubic(p(t, endAt - 0.2, endAt + 0.5));

  return (
    <AbsoluteFill>
      <Ground tint={C.lime} />
      <AbsoluteFill style={{ opacity: A }}>
        <Chrome n="10" label="Verdict" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 70, letterSpacing: "-0.04em", opacity: outCubic(p(t, tRacing - 0.3, tRacing + 0.3)) }}>
          Clay is <Serif size={78} color={C.green}>racing model progress.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 300, display: "flex", gap: 40 }}>
          <Card style={{ width: 800, height: 420, padding: 44, opacity: clamp(sp(tBuild - 0.2)) }}>
            <Kicker color={C.red}>Building workflows</Kicker>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 48, letterSpacing: "-0.03em", marginTop: 18, lineHeight: 1.1 }}>Coding agents gain more from every release</div>
            <div style={{ marginTop: 34, display: "inline-flex", padding: "12px 24px", borderRadius: 999, background: `${C.red}22`, color: C.red, fontFamily: SANS, fontWeight: 700, fontSize: 32 }}>↘ the low end is leaving</div>
          </Card>
          <Card dark style={{ width: 800, height: 420, padding: 44, opacity: clamp(sp(tRun - 0.2)) }}>
            <Kicker color={C.lime}>Running them at scale</Kicker>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18 }}>
              {["250 vendor contracts", "one invoice", "governed writes into the CRM"].map((x, i) => (
                <div key={x} style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, color: C.paper, opacity: outCubic(p(t, tContracts + i * 0.7, tContracts + 0.3 + i * 0.7)) }}>✓ {x}</div>
              ))}
            </div>
            <div style={{ marginTop: 22, opacity: outCubic(p(t, tContracts + 2.2, tContracts + 2.7)), display: "inline-flex", padding: "12px 24px", borderRadius: 999, background: C.lime, color: C.ink, fontFamily: SANS, fontWeight: 700, fontSize: 30 }}>↗ none of it comes from a smarter model</div>
          </Card>
        </div>
        <div style={{ position: "absolute", left: 120, top: 790, fontFamily: SANS, fontWeight: 600, fontSize: 44, letterSpacing: "-0.02em", opacity: outCubic(p(t, tBuys - 0.2, tBuys + 0.4)) }}>
          $7.1B buys <span style={{ background: C.lime, padding: "0 10px", borderRadius: 8 }}>the chance to be the layer behind every agent.</span>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ opacity: Bv }}>
        <Chrome n="10" label="What to watch" t={t - tWatch + 0.6} />
        <div style={{ position: "absolute", left: 120, top: 150, fontFamily: SANS, fontWeight: 600, fontSize: 70, letterSpacing: "-0.04em" }}>
          Watch <Serif size={78} color={C.green}>three things.</Serif>
        </div>
        {[
          { n: "1", h: "~$240M run-rate by December 2026", s: "the company’s own target", ic: "piechart.avif" },
          { n: "2", h: "The Action share of revenue", s: "it sets the margin — and the multiple", ic: "Automation.avif" },
          { n: "3", h: "Enterprises keep refreshing CRM data in Clay", s: "as Salesforce and HubSpot roll out their agents", ic: "replace-crm.avif" },
        ].map((x, i) => {
          const k = sp(w[i] - 0.2, 13, 160);
          return (
            <Card key={x.n} style={{ position: "absolute", left: 120, top: 300 + i * 190, width: 1680, height: 160, padding: "0 40px", display: "flex", alignItems: "center", gap: 34, opacity: clamp(k), transform: `translateX(${(1 - k) * 80}px)` }}>
              <div style={{ width: 90, height: 90, borderRadius: 45, background: C.green, color: C.lime, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48 }}>{x.n}</div>
              <div>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 46, letterSpacing: "-0.02em" }}>{x.h}</div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.mute }}>{x.s}</div>
              </div>
              {i < 2 && <Clay src={x.ic} size={110} x={1540} y={24} phase={i} bob={5} />}
            </Card>
          );
        })}
      </AbsoluteFill>

      {/* end card */}
      <AbsoluteFill style={{ opacity: End, background: C.green }}>
        <Img src={staticFile("web/Footer-Still-1.avif")} style={{ position: "absolute", right: -260, top: 90, width: 900, height: 900, objectFit: "cover", borderRadius: 600, opacity: 0.9, transform: `scale(${mix(1.05, 1, inOut(p(t, endAt, endAt + 3)))})` }} />
        <div style={{ position: "absolute", left: 150, top: 300 }}>
          <Img src={staticFile("web/Clay-primary-logo.avif")} style={{ height: 90, filter: "brightness(0) invert(1)" }} />
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 96, color: C.paper, letterSpacing: "-0.045em", lineHeight: 1.02, marginTop: 40 }}>
            The checkout for data,
            <br />
            <Serif size={104} color={C.lime}>not the data.</Serif>
          </div>
          <Kicker color={C.paper} style={{ marginTop: 50, opacity: 0.8 }}>Startup Deepdive · Janet Mao · Nov 2026</Kicker>
          <div style={{ fontFamily: MONO, fontSize: 17, color: "rgba(254,253,251,0.6)", marginTop: 16, letterSpacing: "0.06em", width: 820, lineHeight: 1.6 }}>
            Sources: Clay Deep Dive (Oct 2026) · Two-Page Brief · 12 podcast interviews (In Depth, Summation, LangChain, Training Data, 20VC…) · Clay brand imagery © Clay, used for commentary.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
