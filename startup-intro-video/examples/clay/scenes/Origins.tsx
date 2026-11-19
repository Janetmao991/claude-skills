import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { evolvePath } from "@remotion/paths";
import { C, MONO, SANS } from "../lib/theme";
import { cue, segAt } from "../lib/time";
import { Card, Chrome, Clay, Ground, Kicker, Serif, clamp, env, mix, outCubic, outExpo, p, useSpring, useT } from "../lib/ui";

const S = "origins";

const Person: React.FC<{ img?: string; initials?: string; name: string; role: string; k: number; dim?: number; tag?: string; tagColor?: string }> = ({ img, initials, name, role, k, dim = 0, tag, tagColor = C.lime }) => (
  <div style={{ width: 300, opacity: clamp(k) * (1 - dim * 0.6), transform: `translateY(${(1 - k) * 60}px) scale(${mix(0.9, 1, clamp(k))})`, filter: `grayscale(${dim})` }}>
    <div style={{ position: "relative", width: 300, height: 300, borderRadius: 36, overflow: "hidden", background: C.sand, boxShadow: "0 24px 50px -22px rgba(0,0,0,0.4)" }}>
      {img ? <Img src={staticFile(img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 700, fontSize: 120, color: C.paper, background: C.purple }}>{initials}</div>
      )}
      {tag && <div style={{ position: "absolute", left: 16, bottom: 16, padding: "6px 14px", borderRadius: 999, background: tagColor, fontFamily: MONO, fontWeight: 700, fontSize: 16, letterSpacing: "0.12em", color: C.ink }}>{tag}</div>}
    </div>
    <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 18, letterSpacing: "-0.02em" }}>{name}</div>
    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, color: C.mute }}>{role}</div>
  </div>
);

// ARR points (from the two-pager). x = years since 2023-01
const PTS = [
  { x: 0.1, y: 1, label: "~$1M", when: "early 2023 · hand-sent invoices", kind: "solid" },
  { x: 1.85, y: 20, label: ">$20M", when: "Nov 2024", kind: "solid" },
  { x: 2.95, y: 100, label: "$100M", when: "Dec 2025 · company", kind: "solid" },
  { x: 3.37, y: 150, label: "~$150M", when: "May 2026 · Sacra est.", kind: "est" },
  { x: 3.7, y: 200, label: "~$200M", when: "Q3 2026 · CEO", kind: "solid" },
  { x: 3.95, y: 240, label: "$240M target", when: "Dec 2026", kind: "target" },
];

const LAB: [number, number][] = [[26, -80], [-270, -86], [34, 6], [34, 6], [-284, -44], [30, -70]];

export const Origins: React.FC = () => {
  const t = useT();
  const sp = useSpring();
  const [, c1end] = segAt(S, "varun_agencies");
  const [, c2end] = segAt(S, "varun_stripe");
  const tFounded = cue(S, "Kareem");
  const tPower = cue(S, "power");
  const tFour = cue(S, "four years");
  const tTurn = cue(S, "turn");
  const tVarun = cue(S, "Varun");
  const t2021 = cue(S, "co-founder");
  const tStartups = cue(S, "startups");
  const tAgencies = cue(S, "Cold-email");
  const tWhats = cue(S, "WhatsApp");
  const tThirty = cue(S, "thirty");
  const tCharged = cue(S, "barely");
  const tFrom = cue(S, "From there");
  const tHundred = cue(S, "hundred million");
  const tTwoH = cue(S, "two hundred");

  const partA = env(t, 0, segAt(S, "varun_agencies")[0] + 0.3, 0.4, 0.4);
  const partB = env(t, c1end - 0.3, tCharged - 0.1, 0.4, 0.45);
  const partB2 = env(t, tCharged - 0.3, segAt(S, "varun_stripe")[0] + 0.3, 0.45, 0.4);
  const tPay = cue(S, "pay button");
  const tHand = cue(S, "by hand", 2);
  const partC = env(t, c2end - 0.3, 999, 0.4, 0.4);

  // timeline strip
  const years = [2017, 2018, 2019, 2020, 2021, 2022, 2023];
  const stripX = (y: number) => 140 + (y - 2017) * 270;
  const flat = outCubic(p(t, tFour - 0.2, tFour + 1.2));

  // chart geometry
  const cx = 220, cy = 830, cw = 1220, ch = 520;
  const X = (x: number) => cx + (x / 4.1) * cw;
  const Y = (v: number) => cy - (v / 250) * ch;
  const solid = PTS.filter((q) => q.kind !== "target");
  const path = solid.map((q, i) => `${i ? "L" : "M"}${X(q.x)} ${Y(q.y)}`).join(" ");
  const draw = mix(0.02, 1, outCubic(p(t, tFrom, tTwoH + 0.8)));
  const ev = evolvePath(draw, path);

  return (
    <AbsoluteFill>
      <Ground tint={C.purple} />
      {/* A: founders, four flat years, Varun */}
      <AbsoluteFill style={{ opacity: partA }}>
        <Chrome n="03" label="Origins" t={t} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em", color: C.ink }}>
          Clay is <Serif size={74} color={C.green}>older than it looks.</Serif>
        </div>
        {/* strip */}
        <div style={{ position: "absolute", left: 0, top: 290, width: 1920, height: 120 }}>
          <div style={{ position: "absolute", left: stripX(2017), top: 50, height: 4, width: (stripX(2023) - stripX(2017)) * outCubic(p(t, 0.2, 1.6)), background: C.ink, borderRadius: 2 }} />
          {years.map((y, i) => (
            <div key={y} style={{ position: "absolute", left: stripX(y) - 40, top: 0, width: 80, textAlign: "center", opacity: outCubic(p(t, 0.2 + i * 0.12, 0.6 + i * 0.12)) }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: y === 2017 || y === 2021 ? C.green : C.mute }}>{y}</div>
              <div style={{ margin: "14px auto 0", width: 18, height: 18, borderRadius: 9, background: y === 2017 || y === 2021 ? C.green : C.paper, border: `3px solid ${C.ink}` }} />
            </div>
          ))}
          {/* four flat years */}
          <div style={{ position: "absolute", left: stripX(2017), top: 78, width: (stripX(2021) - stripX(2017)) * flat, height: 34, background: `${C.red}22`, borderRadius: 8, border: `2px dashed ${C.red}`, opacity: clamp(flat * 3) }} />
          <div style={{ position: "absolute", left: stripX(2018) + 40, top: 120, fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.red, opacity: flat }}>4 years · almost no revenue</div>
        </div>
        {/* people */}
        <div style={{ position: "absolute", left: 140, top: 500, display: "flex", gap: 50 }}>
          <Person img="faces/kareem.jpg" name="Kareem Amin" role="Co-founder · CEO" k={sp(tFounded - 0.1)} tag="2017" />
          <Person initials="NR" name="Nicolae Rusan" role="Co-founder · left 2021" k={sp(tFounded + 0.5)} dim={outCubic(p(t, t2021 - 0.3, t2021 + 0.4))} tag="2017" tagColor={C.sand} />
          <Person img="faces/varun.jpg" name="Varun Anand" role="First user → co-founder" k={sp(tVarun - 0.1)} tag="2021" tagColor={C.lime} />
        </div>
        <Card style={{ position: "absolute", left: 1220, top: 520, width: 560, padding: "30px 34px", opacity: env(t, tPower - 0.2, tTurn - 0.1), transform: `rotate(-1.5deg)` }}>
          <Kicker>Mission, 2017</Kicker>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, lineHeight: 1.15, marginTop: 12, letterSpacing: "-0.02em" }}>“Give the power of programming to an order of magnitude more people.”</div>
        </Card>
        <Card style={{ position: "absolute", left: 1220, top: 520, width: 560, padding: "30px 34px", opacity: env(t, tTurn - 0.1, tStartups - 0.1) }}>
          <Kicker color={C.orange}>The turn</Kicker>
          <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, lineHeight: 1.15, marginTop: 12, letterSpacing: "-0.02em" }}>A user brought the first paying customers — and became co-founder in Sep 2021.</div>
        </Card>
        <div style={{ position: "absolute", left: 1220, top: 520, opacity: outCubic(p(t, tStartups - 0.2, tStartups + 0.3)), display: "flex", alignItems: "center", gap: 24 }}>
          <Clay src="startups.avif" size={150} />
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 64, color: C.ink, position: "relative" }}>
            Startups?
            <div style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 7, background: C.red, transformOrigin: "left", transform: `scaleX(${outCubic(p(t, tStartups + 0.3, tStartups + 0.7))}) rotate(-3deg)` }} />
          </div>
        </div>
      </AbsoluteFill>

      {/* B: agencies, WhatsApp archives, 30 emails, invoices */}
      <AbsoluteFill style={{ opacity: partB }}>
        <Chrome n="03" label="Origins · first users" t={t - c1end + 0.5} />
        <div style={{ position: "absolute", left: 120, top: 150, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em", color: C.ink }}>
          The first believers: <Serif size={74} color={C.green}>cold-email agencies.</Serif>
        </div>
        <div style={{ position: "absolute", left: 120, top: 320, display: "flex", gap: 36 }}>
          {[
            { at: tAgencies, icon: "agencies.avif", h: "Who", b: "Cold-email agencies: firms paid to send sales emails, building lists by hand all day." },
            { at: tWhats, icon: "Signals-satellite-dish-monitor.png", h: "Where", b: "Their WhatsApp group chats. Varun read years of them." },
            { at: tThirty, icon: "3d-icon-outbound.avif", h: "How", b: "30 personal emails to the people who wrote best about finding contact data." },
          ].map((c, i) => {
            const k = sp(c.at - 0.15, 13, 160);
            return (
              <Card key={c.h} style={{ width: 530, height: 400, padding: 36, opacity: clamp(k), transform: `translateY(${(1 - k) * 70}px)` }}>
                <Clay src={c.icon} size={130} phase={i} />
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: "-0.03em", marginTop: 24 }}>{c.h}</div>
                <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: C.mute, marginTop: 10, lineHeight: 1.25 }}>{c.b}</div>
                {i === 2 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 18, width: 440 }}>
                    {Array.from({ length: 30 }).map((_, j) => (
                      <div key={j} style={{ width: 22, height: 16, borderRadius: 3, background: t > tThirty + j * 0.04 ? C.green : C.line }} />
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        </AbsoluteFill>

      {/* B2: early on, no pay button */}
      <AbsoluteFill style={{ opacity: partB2, alignItems: "center", justifyContent: "center" }}>
        <Chrome n="03" label="Origins · early money" t={t - tCharged + 0.6} />
        <Clay src="Heart-Tricolor.png" size={190} bob={8} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 82, letterSpacing: "-0.045em", marginTop: 26, textAlign: "center", opacity: outCubic(p(t, tPay - 0.3, tPay + 0.2)) }}>
          No <span style={{ background: C.lime, padding: "0 14px", borderRadius: 10 }}>Pay</span> button in the product.
        </div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 56, letterSpacing: "-0.035em", marginTop: 18, textAlign: "center", opacity: outCubic(p(t, tHand - 1.6, tHand - 1.0)) }}>
          Until <Serif size={66} color={C.green}>$1M a year</Serif>, Varun sent every bill by hand.
        </div>
      </AbsoluteFill>

      {/* C: ARR chart */}
      <AbsoluteFill style={{ opacity: partC }}>
        <Chrome n="03" label="Annualized revenue" t={t - c2end + 0.5} />
        <div style={{ position: "absolute", left: 120, top: 140, fontFamily: SANS, fontWeight: 600, fontSize: 66, letterSpacing: "-0.04em", color: C.ink }}>
          $1M → $100M <Serif size={74} color={C.green}>in about three years.</Serif>
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {[0, 50, 100, 150, 200, 250].map((v) => (
            <g key={v}>
              <line x1={cx} x2={cx + cw} y1={Y(v)} y2={Y(v)} stroke={C.line} strokeWidth={2} />
              <text x={cx - 20} y={Y(v) + 8} textAnchor="end" fontFamily={MONO} fontSize={20} fill={C.mute}>${v}M</text>
            </g>
          ))}
          {[2023, 2024, 2025, 2026, 2027].map((yr, i) => (
            <text key={yr} x={X(i)} y={cy + 44} textAnchor="middle" fontFamily={MONO} fontSize={22} fill={C.mute}>{yr}</text>
          ))}
          <path d={path} fill="none" stroke={C.green} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={ev.strokeDasharray} strokeDashoffset={ev.strokeDashoffset} />
          {/* target segment */}
          <line x1={X(3.7)} y1={Y(200)} x2={X(3.95)} y2={Y(240)} stroke={C.mute} strokeWidth={5} strokeDasharray="10 10" opacity={outCubic(p(t, tTwoH + 0.6, tTwoH + 1.2))} />
        </svg>
        {PTS.map((q, i) => {
          const at = i === 0 ? tFrom + 0.3 : i === 1 ? tFrom + 1.2 : i === 2 ? tHundred : i === 3 ? tHundred + 1.2 : i === 4 ? tTwoH : tTwoH + 0.9;
          const k = sp(at, 12, 200);
          const big = i === 0 || i === 2 || i === 4;
          return (
            <div key={q.label} style={{ position: "absolute", left: X(q.x), top: Y(q.y), opacity: clamp(k) }}>
              <div style={{ position: "absolute", left: -14, top: -14, width: 28, height: 28, borderRadius: 14, background: q.kind === "solid" ? C.green : C.paper, border: `4px ${q.kind === "est" ? "dashed" : "solid"} ${q.kind === "target" ? C.mute : C.green}`, transform: `scale(${k})` }} />
              <div style={{ position: "absolute", left: LAB[i][0], top: LAB[i][1], width: 250, textAlign: LAB[i][0] < 0 ? "right" : "left" }}>
                <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: big ? 40 : 30, color: q.kind === "target" ? C.mute : C.ink, letterSpacing: "-0.02em" }}>{q.label}</div>
                <div style={{ fontFamily: MONO, fontSize: 15, letterSpacing: "0.06em", color: C.mute }}>{q.when}</div>
              </div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 120, top: 240, width: 1500, fontFamily: MONO, fontSize: 14, letterSpacing: "0.08em", color: C.mute }}>
          SOLID: FOUNDER / COMPANY · DASHED: THIRD-PARTY ESTIMATE · GREY: COMPANY TARGET
          
        </div>
        <Clay src="Execution-Still-1.avif" size={330} x={1500} y={330} bob={8} style={{ borderRadius: 30, opacity: outExpo(p(t, c2end, c2end + 1)) }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
