import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, MONO, SANS, ZH } from "./theme";
import { VO } from "./time";
import { cueTime, type Cue } from "./shots";
import { clamp, mix, outCubic, outExpo } from "./ui";

// 通用 HTML 画面：重建真实界面（chat / rows / feed）或把机制做成动画（compare / flow / hub / bars / curve / rings / checklist）。
// 文字只做标注，每处尽量短；完整的话留给配音和底部字幕。
// 所有时间点都是 Cue：台词里的词（不带空格）、[句 id, 词]、或相对这句开始的秒数。

export type KitName = "chat" | "rows" | "feed" | "compare" | "flow" | "hub" | "bars" | "curve" | "rings" | "checklist";
type Ctx = { t: number; at: (k: Cue | undefined, fb?: number) => number; start: (id: string) => number; end: (id: string) => number; dur: number };
const ap = (t: number, a: number, d = 0.4) => outCubic(clamp((t - a) / d));
const pop = (k: number): React.CSSProperties => ({ opacity: k, scale: `${0.92 + 0.08 * k}`, translate: `0 ${(1 - k) * 24}px` });

const Stage: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: `radial-gradient(1500px 900px at 50% 38%, ${C.stage}, ${C.stageDeep})` }}>{children}</AbsoluteFill>
);
const Label: React.FC<{ children: React.ReactNode; c?: string; size?: number; style?: React.CSSProperties }> = ({ children, c = C.paper, size = 34, style }) => (
  <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: size, color: c, lineHeight: 1.25, ...style }}>{children}</div>
);
const Person: React.FC<{ c?: string; size?: number; style?: React.CSSProperties }> = ({ c = C.violet, size = 62, style }) => (
  <div style={{ position: "relative", width: size, height: size * 1.25, ...style }}>
    <div style={{ position: "absolute", left: size * 0.29, top: 0, width: size * 0.42, height: size * 0.42, borderRadius: "50%", background: c }} />
    <div style={{ position: "absolute", left: size * 0.1, top: size * 0.48, width: size * 0.8, height: size * 0.76, borderRadius: `${size * 0.4}px ${size * 0.4}px ${size * 0.14}px ${size * 0.14}px`, background: c }} />
  </div>
);

// ---- 重建界面 ----
type Msg = { who: string; text: string; at?: Cue; badge?: string; color?: string };
const Chat: React.FC<{ p: { app: string; channel: string; note?: string; sidebar?: string[]; msgs: Msg[] }; c: Ctx }> = ({ p, c }) => (
  <Stage>
    <div style={{ position: "absolute", left: 200, top: 90, width: 1520, height: 760, borderRadius: 24, overflow: "hidden", background: "#fff", display: "flex", boxShadow: "0 50px 120px -40px #000" }}>
      <div style={{ width: 320, background: "#3F0E40", padding: "32px 28px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 34, color: "#fff", marginBottom: 34 }}>{p.app}</div>
        {(p.sidebar ?? [p.channel]).map((n) => (
          <div key={n} style={{ fontFamily: SANS, fontSize: 28, fontWeight: n === p.channel ? 700 : 400, color: n === p.channel ? "#fff" : "#CDB9CE", padding: "10px 14px", borderRadius: 10, background: n === p.channel ? "#1164A3" : "transparent", marginBottom: 6 }}>{n}</div>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ padding: "26px 36px", borderBottom: "2px solid #eee", fontFamily: SANS, fontWeight: 800, fontSize: 34, color: "#1d1c1d" }}>{p.channel}{p.note && <span style={{ fontWeight: 400, fontSize: 24, color: "#777", marginLeft: 16, fontFamily: ZH }}>{p.note}</span>}</div>
        <div style={{ padding: "30px 36px", display: "flex", flexDirection: "column", gap: 40 }}>
          {p.msgs.map((m, i) => (
            <div key={i} style={{ display: "flex", gap: 20, ...pop(ap(c.t, c.at(m.at, 0.4 + i * 1.1), 0.3)) }}>
              <div style={{ width: 84, height: 84, borderRadius: 16, background: m.color ?? [C.warm, C.violet, C.accent2][i % 3], color: "#fff", fontFamily: SANS, fontWeight: 800, fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{m.who.slice(0, 1)}</div>
              <div>
                <div style={{ fontFamily: ZH, fontWeight: 800, fontSize: 32, color: "#1d1c1d", display: "flex", alignItems: "center", gap: 12 }}>{m.who}{m.badge && <span style={{ fontSize: 20, fontWeight: 700, color: "#0E6245", background: "#DFF3E9", padding: "3px 12px", borderRadius: 8 }}>{m.badge}</span>}</div>
                <div style={{ fontFamily: ZH, fontWeight: 500, fontSize: 38, color: "#1d1c1d", marginTop: 8 }}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Stage>
);

type Row = { a: string; b?: string; c?: string; status?: string };
const Rows: React.FC<{ p: { brand?: string; brandColor?: string; title: string; rows: Row[]; side?: { label: string; value?: string; at?: Cue; fill?: boolean }[] }; c: Ctx }> = ({ p, c }) => {
  const step = Math.max(0.2, (Math.min(c.dur, 8) - 0.8) / p.rows.length);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 120, top: 90, width: p.side ? 1120 : 1680, height: 760, borderRadius: 24, background: "#fff", overflow: "hidden", boxShadow: "0 50px 120px -40px #000" }}>
        <div style={{ padding: "26px 40px", borderBottom: "2px solid #E6EBF1", display: "flex", alignItems: "center", gap: 20 }}>
          {p.brand && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: p.brandColor ?? C.stage }}>{p.brand}</div>}
          <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 32, color: "#1A1F36" }}>{p.title}</div>
        </div>
        {p.rows.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "16px 40px", borderBottom: "1.5px solid #F0F3F7", ...pop(ap(c.t, 0.4 + i * step, 0.2)) }}>
            <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 30, color: "#1A1F36", flex: 1.4 }}>{r.a}</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "#1A1F36", flex: 1 }}>{r.b}</div>
            <div style={{ fontFamily: ZH, fontSize: 26, color: "#697386", flex: 1 }}>{r.c}</div>
            {r.status && <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 24, color: "#0E6245", background: "#CBF4C9", padding: "6px 18px", borderRadius: 8 }}>{r.status}</div>}
          </div>
        ))}
      </div>
      {p.side && (
        <div style={{ position: "absolute", left: 1290, top: 90, width: 510, display: "flex", flexDirection: "column", gap: 28 }}>
          {p.side.map((s, i) => (
            <div key={i} style={{ padding: "32px 36px", borderRadius: 24, background: C.paper, ...pop(ap(c.t, c.at(s.at, 0.3 + i), 0.3)) }}>
              <Label c={C.mute} size={32}>{s.label}</Label>
              {s.value && <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 70, color: C.good, marginTop: 6 }}>{s.value}</div>}
            </div>
          ))}
        </div>
      )}
    </Stage>
  );
};

const Feed: React.FC<{ p: { posts: { who: string; text: string }[]; leftTitle?: string; leftSub?: string; rightTitle?: string; right?: string[]; rightAt?: Cue; fastAt?: Cue; network?: string }; c: Ctx }> = ({ p, c }) => {
  const fast = c.at(p.fastAt, 1e9);
  const shift = c.t < fast ? 26 * c.t : 26 * fast + 116 * (c.t - fast);
  const H = 196, total = H * p.posts.length;
  const rt = ap(c.t, c.at(p.rightAt, 1), 0.35);
  return (
    <Stage>
      {p.leftTitle && <div style={{ position: "absolute", left: 90, top: 200, width: 400, padding: 36, borderRadius: 26, background: C.paper, boxSizing: "border-box", ...pop(ap(c.t, 0.1)) }}><Label c={C.ink} size={44}>{p.leftTitle}</Label>{p.leftSub && <Label c={C.mute} size={32} style={{ marginTop: 14 }}>{p.leftSub}</Label>}</div>}
      <div style={{ position: "absolute", left: 540, top: 70, width: 840, height: 790, overflow: "hidden", borderRadius: 26 }}>
        <div style={{ translate: `0 ${-(shift % total)}px` }}>
          {[...p.posts, ...p.posts, ...p.posts].map((x, i) => (
            <div key={i} style={{ height: H - 16, marginBottom: 16, background: "#fff", borderRadius: 18, padding: "24px 30px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 58, height: 58, borderRadius: 29, background: [C.warm, C.violet, C.accent2][i % 3] }} />
                <div style={{ fontFamily: ZH, fontWeight: 800, fontSize: 30, color: "#111" }}>{x.who}</div>
                {p.network && <div style={{ marginLeft: "auto", fontFamily: SANS, fontWeight: 800, fontSize: 30, color: "#0A66C2" }}>{p.network}</div>}
              </div>
              <div style={{ fontFamily: ZH, fontWeight: 500, fontSize: 34, color: "#1d1d1d", marginTop: 14 }}>{x.text}</div>
            </div>
          ))}
        </div>
      </div>
      {p.right && <div style={{ position: "absolute", left: 1430, top: 130, width: 400, ...pop(rt) }}>
        {p.rightTitle && <Label size={40} c={C.accent}>{p.rightTitle}</Label>}
        {p.right.map((w) => <div key={w} style={{ marginTop: 18, height: 96, borderRadius: 20, background: C.panel, display: "flex", alignItems: "center", gap: 18, padding: "0 24px" }}><Person size={50} c={C.accent2} /><Label size={34}>{w}</Label></div>)}
      </div>}
    </Stage>
  );
};

// ---- 机制动画 ----
type Side = { title: string; note?: string; at?: Cue; barFrom: number; barTo: number; barColor?: string; barLabel?: string; people?: { total: number; keep: number }; cells?: { n: number; label: string } };
const Compare: React.FC<{ p: { left: Side; right: Side }; c: Ctx }> = ({ p, c }) => {
  const Panel: React.FC<{ s: Side; x: number }> = ({ s, x }) => {
    const a = c.at(s.at, 0.3), k = ap(c.t, a, 0.3), run = clamp((c.t - a) / 3);
    const lit = s.cells ? Math.floor(run * s.cells.n) : 0;
    return (
      <div style={{ position: "absolute", top: 90, left: x, width: 800, height: 740, borderRadius: 28, background: C.paper, padding: "40px 48px", boxSizing: "border-box", opacity: 0.55 + 0.45 * k }}>
        <Label c={C.ink} size={46}>{s.title}</Label>
        {s.note && <Label c={C.good} size={32} style={{ marginTop: 6 }}>{s.note}</Label>}
        {s.people && <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 110px)", gap: "20px 14px", marginTop: 40 }}>{Array.from({ length: s.people.total }, (_, i) => <Person key={i} size={88} c={i < s.people!.keep ? C.warm : C.violet} style={{ opacity: i < s.people!.keep ? 1 : 1 - 0.85 * run }} />)}</div>}
        {s.cells && <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 36 }}>{Array.from({ length: s.cells.n }, (_, i) => <div key={i} style={{ height: 50, borderRadius: 10, background: i < lit ? "#DDF2C2" : C.cream, border: `2px solid ${i < lit ? C.good : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ZH, fontWeight: 700, fontSize: 24, color: C.good }}>{i < lit ? s.cells!.label : ""}</div>)}</div>}
        <div style={{ position: "absolute", left: 48, right: 48, bottom: 44 }}>
          {s.barLabel && <Label c={C.mute} size={32}>{s.barLabel}</Label>}
          <div style={{ marginTop: 12, height: 54, borderRadius: 27, background: C.sand, overflow: "hidden" }}><div style={{ height: "100%", width: `${mix(s.barFrom, s.barTo, run) * 100}%`, borderRadius: 27, background: s.barColor ?? C.good }} /></div>
        </div>
      </div>
    );
  };
  return <Stage><Panel s={p.left} x={130} /><Panel s={p.right} x={990} /></Stage>;
};

const Flow: React.FC<{ p: { steps: { label: string; sub?: string; at?: Cue; color?: string }[] }; c: Ctx }> = ({ p, c }) => {
  const n = p.steps.length, w = Math.min(380, (1680 - (n - 1) * 50) / n), gap = (1680 - n * w) / Math.max(1, n - 1);
  const x = (i: number) => 120 + i * (w + gap);
  const first = c.at(p.steps[0].at, 0.2);
  return (
    <Stage>
      <div style={{ position: "absolute", left: x(0) + w / 2, top: 415, width: x(n - 1) - x(0), height: 10, background: C.line, borderRadius: 5 }} />
      {c.t > first && Array.from({ length: 14 }, (_, i) => {
        const q = (c.t * 0.3 + i / 14) % 1;
        return <div key={i} style={{ position: "absolute", left: x(0) + w / 2 + q * (x(n - 1) - x(0)) - 13, top: 407, width: 26, height: 26, borderRadius: 13, background: C.accent }} />;
      })}
      {p.steps.map((s, i) => (
        <div key={s.label} style={{ position: "absolute", left: x(i), top: 270, width: w, height: 300, borderRadius: 28, background: C.paper, padding: "40px 30px", boxSizing: "border-box", borderTop: `14px solid ${s.color ?? [C.warm, C.violet, C.accent2, C.good][i % 4]}`, display: "flex", flexDirection: "column", justifyContent: "center", ...pop(ap(c.t, c.at(s.at, 0.3 + i * 0.8), 0.3)) }}>
          <Label c={C.ink} size={44}>{s.label}</Label>
          {s.sub && <Label c={C.mute} size={32} style={{ marginTop: 14 }}>{s.sub}</Label>}
        </div>
      ))}
    </Stage>
  );
};

const Hub: React.FC<{ p: { spokes: string[]; tileNote?: string; beforeNote?: string; hub: string; hubSub?: string; mergeAt?: Cue; chips?: { text: string; at?: Cue; color?: string }[] }; c: Ctx }> = ({ p, c }) => {
  const k = ap(c.t, c.at(p.mergeAt, 2), 0.8), cx = 960, cy = 370, N = p.spokes.length;
  const pos = (i: number) => {
    const cols = 4, gx = 400, gy = 150, x0 = 960 - ((cols - 1) * gx) / 2 + (i % cols) * gx, y0 = 180 + Math.floor(i / cols) * gy, a = (i / N) * Math.PI * 2 - Math.PI / 2;
    return { x: mix(x0, cx + Math.cos(a) * 620, k), y: mix(y0, cy + Math.sin(a) * 275, k) };
  };
  return (
    <Stage>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>{p.spokes.map((v, i) => { const q = pos(i); return <line key={v} x1={cx} y1={cy} x2={q.x} y2={q.y} stroke={C.accent} strokeOpacity={0.5 * k} strokeWidth={3} />; })}</svg>
      {p.spokes.map((v, i) => { const q = pos(i); return (
        <div key={v} style={{ position: "absolute", left: q.x - 165, top: q.y - 58, width: 330, height: 116, borderRadius: 20, background: C.paper, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...pop(ap(c.t, 0.2 + i * 0.08, 0.3)) }}>
          <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 36, color: C.ink }}>{v}</div>
          {p.tileNote && k < 0.5 && <div style={{ fontFamily: ZH, fontWeight: 600, fontSize: 24, color: C.bad }}>{p.tileNote}</div>}
        </div>
      ); })}
      {p.beforeNote && <Label c={C.bad} size={48} style={{ position: "absolute", left: 0, right: 0, textAlign: "center", top: 690, opacity: 1 - k }}>{p.beforeNote}</Label>}
      <div style={{ position: "absolute", left: cx - 175, top: cy - 175, width: 350, height: 350, borderRadius: "50%", background: C.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: k, scale: `${0.6 + 0.4 * k}` }}>
        <Label c={C.ink} size={54}>{p.hub}</Label>{p.hubSub && <Label c={C.good} size={27} style={{ marginTop: 8, whiteSpace: "nowrap" }}>{p.hubSub}</Label>}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 750, display: "flex", justifyContent: "center", gap: 36 }}>
        {(p.chips ?? []).map((x, i) => <div key={i} style={{ padding: "20px 44px", borderRadius: 22, background: x.color ?? [C.accent, C.accent2, C.warm][i % 3], ...pop(ap(c.t, c.at(x.at, 2.5 + i), 0.3)) }}><Label c={C.ink} size={46}>{x.text}</Label></div>)}
      </div>
    </Stage>
  );
};

const Bars: React.FC<{ p: { title?: string; items: { label: string; value: string; n: number; at?: Cue; color?: string }[]; note?: string }; c: Ctx }> = ({ p, c }) => {
  const max = Math.max(...p.items.map((x) => Math.abs(x.n)));
  return (
    <Stage>
      <div style={{ position: "absolute", left: 150, right: 150, top: 150 }}>
        {p.title && <Label size={56}>{p.title}</Label>}
        <div style={{ display: "flex", flexDirection: "column", gap: 40, marginTop: 50 }}>
          {p.items.map((x, i) => { const g = outExpo(clamp((c.t - c.at(x.at, 0.4 + i * 0.7)) / 0.9)), w = Math.max(1.2, (Math.abs(x.n) / max) * 66 * g); return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, opacity: g > 0 ? 1 : 0 }}>
              <Label size={38} style={{ width: 420, flex: "none", textAlign: "right" }}>{x.label}</Label>
              <div style={{ flex: 1, height: 84, position: "relative" }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${w}%`, borderRadius: 18, background: x.color ?? C.accent }} /><div style={{ position: "absolute", top: 8, left: `calc(${w}% + 20px)`, fontFamily: SANS, fontWeight: 800, fontSize: 54, color: C.paper, whiteSpace: "nowrap" }}>{x.value}</div></div>
            </div>
          ); })}
        </div>
        {p.note && <Label c={C.soft} size={26} style={{ marginTop: 44 }}>{p.note}</Label>}
      </div>
    </Stage>
  );
};

const Curve: React.FC<{ p: { xs: string[]; ys: number[]; from?: Cue; to?: Cue; callouts?: { i: number; text: string }[]; note?: string }; c: Ctx }> = ({ p, c }) => {
  const a = c.at(p.from, 0.2), b = c.at(p.to, Math.max(a + 1, c.dur - 0.5)), k = clamp((c.t - a) / Math.max(0.5, b - a));
  const x0 = 200, x1 = 1640, y0 = 780, y1 = 200, n = p.xs.length, top = Math.max(...p.ys);
  const X = (i: number) => x0 + (i / (n - 1)) * (x1 - x0), Y = (v: number) => y0 - (v / top) * (y0 - y1);
  const pts: string[] = [];
  const u = k * (n - 1);
  for (let i = 0; i <= Math.floor(u); i++) pts.push(`${X(i)},${Y(p.ys[i])}`);
  if (u < n - 1) { const f = u - Math.floor(u), i = Math.floor(u); pts.push(`${mix(X(i), X(i + 1), f)},${Y(mix(p.ys[i], p.ys[i + 1], f))}`); }
  return (
    <Stage>
      <div style={{ position: "absolute", left: x0, width: x1 - x0, top: y0, borderTop: `3px solid ${C.line}` }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><polyline points={pts.join(" ")} fill="none" stroke={C.accent} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" /></svg>
      {p.xs.map((l, i) => <div key={i} style={{ position: "absolute", left: X(i) - 80, width: 160, top: y0 + 14, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 30, color: C.soft }}>{l}</div>)}
      {(p.callouts ?? []).map((m) => <div key={m.i} style={{ position: "absolute", left: X(m.i) - 200, width: 400, top: Y(p.ys[m.i]) - 80, textAlign: "center", fontFamily: SANS, fontWeight: 800, fontSize: 48, color: C.paper, opacity: u >= m.i ? 1 : 0 }}>{m.text}</div>)}
      {p.note && <Label c={C.soft} size={26} style={{ position: "absolute", left: x0, top: y0 + 66 }}>{p.note}</Label>}
    </Stage>
  );
};

const Rings: React.FC<{ p: { center: string; centerSub?: string; rings: { label: string; at?: Cue }[] }; c: Ctx }> = ({ p, c }) => {
  const cx = 960, cy = 450, r0 = 205, dr = 98;
  return (
    <Stage>
      {[...p.rings].map((x, i) => ({ x, i })).reverse().map(({ x, i }) => {
        const r = r0 + i * dr, k = outExpo(clamp((c.t - c.at(x.at, 0.8 + i)) / 0.6));
        return <div key={x.label} style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", background: i === 0 ? C.line : C.panel, border: `2px solid ${C.line}`, scale: `${k}`, opacity: k > 0 ? 1 : 0 }}><Label c={i === p.rings.length - 1 ? C.accent : C.paper} size={42} style={{ position: "absolute", top: 26, left: 0, right: 0, textAlign: "center" }}>{x.label}</Label></div>;
      })}
      <div style={{ position: "absolute", left: cx - 125, top: cy - 105, width: 250, height: 250, borderRadius: "50%", background: C.accent, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", ...pop(ap(c.t, 0.2)) }}>
        <Label c={C.ink} size={36} style={{ whiteSpace: "nowrap" }}>{p.center}</Label>{p.centerSub && <Label c={C.good} size={25} style={{ marginTop: 6, whiteSpace: "nowrap" }}>{p.centerSub}</Label>}
      </div>
    </Stage>
  );
};

const Checklist: React.FC<{ p: { items: { line: string; label: string; icon?: string }[]; cols?: number }; c: Ctx }> = ({ p, c }) => {
  const cur = p.items.reduce((a, x, i) => (c.t >= c.start(x.line) - 0.15 ? i : a), -1);
  const cols = p.cols ?? (p.items.length > 6 ? 4 : 3);
  return (
    <Stage>
      <div style={{ position: "absolute", left: 110, right: 110, top: 80, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gridAutoRows: 360, gap: 28 }}>
        {p.items.map((x, i) => { const on = i === cur, past = i < cur; return (
          <div key={x.line} style={{ borderRadius: 30, padding: "34px 36px", boxSizing: "border-box", background: on ? C.accent : past ? C.line : C.panel, border: `3px solid ${on ? C.accent : C.line}`, scale: `${on ? 1.03 : 1}`, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 56, color: on ? C.good : past ? C.accent : C.soft }}>{i + 1}</div>
              {x.icon && <Img src={staticFile(x.icon)} style={{ width: 120, height: 120, objectFit: "contain", opacity: on || past ? 1 : 0.35 }} />}
            </div>
            <Label c={on ? C.ink : past ? C.paper : C.soft} size={40}>{x.label}</Label>
          </div>
        ); })}
      </div>
    </Stage>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
const MAP: Record<KitName, React.FC<{ p: any; c: Ctx }>> = { chat: Chat, rows: Rows, feed: Feed, compare: Compare, flow: Flow, hub: Hub, bars: Bars, curve: Curve, rings: Rings, checklist: Checklist };

export const KitScene: React.FC<{ name: KitName; props: Record<string, unknown>; line: string; s: number; dur: number }> = ({ name, props, line, s, dur }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c: Ctx = {
    t: f / fps, dur,
    at: (k, fb = 0) => (k === undefined ? fb : cueTime(k, line, s + fb) - s),
    start: (id) => (VO.lines[id] ? VO.lines[id].start - s : 1e9),
    end: (id) => (VO.lines[id] ? VO.lines[id].end - s : 1e9),
  };
  const Comp = MAP[name];
  return <Comp p={props} c={c} />;
};
