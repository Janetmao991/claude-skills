# Scene guide — "Granola 是怎么做出来的" (skeuomorphic isometric explainer)

A 6-minute Chinese explainer of Granola's technical architecture, told with **physical metaphors in an isometric miniature 3D world** (a desk diorama, soft clay/plastic materials, gentle shadows, cute but not childish). The user approved the style from the layer-2 sample: **`scenes/s03.js` is the reference scene — read it fully before writing yours, and match its look, density, pacing and code style.**

## How the project works
- `index.html` is GENERATED (`python3 build/assemble.py`). Do not edit it. One Three.js renderer, one orthographic camera, scheduled by `scenes/main.js`.
- Each scene is one ES module `scenes/sNN.js` with this contract:
  ```js
  export default {
    id: "sNN", eyebrow: "第 N 层 · xxx", headline: "short question or claim (≤ 14 字)",
    build(ctx) {             // runs once, before render
      // add meshes to ctx.group (never to ctx.scene); create DOM tags via ctx.tag / ctx.panel
      return { render(t) { /* t = local seconds since this scene started, 0..ctx.dur */ } };
    },
  };
  ```
- `ctx`: `{ kit, THREE, group, camera, dur, cues, text, tag, panel, overlay, at }`
  - `ctx.at("关键词", n=1)` → local time (s) when that word is spoken (n-th occurrence). **Drive every beat from `at(...)`**, never hard-coded seconds — narration is the clock.
  - `ctx.text` = the scene narration; `ctx.cues` = caption lines `[text, start, end]` (captions are drawn for you).
  - Lights, renderer, background, scene title (eyebrow+headline, top-left), captions (bottom), and the dip-to-paper transition between scenes are handled by `main.js`. Keep important objects out of the top-left title box (~x<900,y<200 px) and the caption band (y>900 px).
- Global time of your scene = `start` + local time. Starts/durations are in `build/timeline.json` (also listed in your brief).

## Kit (`scenes/kit.js`) — read it, use it
`P, M, C, clamp, ramp, smooth, outCubic, inOut, outBack, lerp, pop, window01, rng` · `clay(color, rough)`, `glass(color, opacity)`, `flat(color)` · `rbox, cyl, sphere, torus, shadowed` · `desk(group, w, d)` (top surface y=0, default 11×7.2) · `textTexture(lines, opts)` + `card(w, h, tex)` for paper/sticky notes/screens with Chinese text · `laptop(tex)`, `callScreenTexture()`, `robot()` · `pipe(group, points, mat)` → `{curve, grow(k)}` · `beads(group, n, mat)` → `.flow(curve, t, start)` · `waves(group)` · `setIso(camera, target, half, yaw)`, `camKeys(camera, t, [[time, half, target, yaw?], ...])` · `ctx.tag(html, cls)` → `.place(worldPos, alpha, {dx, dy, scale})` (classes: `them`, `me`, `signal`, `dark`, `brand`, `big`) · `ctx.panel(html, cls, {x, y})` → `.show(alpha)` for fixed screen text (classes `card`; inner `.num`, `.lab`).
You may add small helpers inside your own scene file. Do not edit kit.js, main.js, style.css or other scenes — if you truly need a kit change, describe it in your final report instead.

## Style rules (from the approved sample)
- Palette only: sage desk, Me green `C.me/meLight`, Them grey `C.them/themLight`, signal orange `C.signal` (warnings, risk, emphasis), dark charcoal hardware, white/paper cards, occasional sticky-note yellow `C.sticky`. No neon, no gradients on objects.
- One diorama per scene, centered around the origin, within about x ±5.5, z ±3.6 (shadow camera covers ±10). Camera half-height 3.8–5.6; use `camKeys` for 3–7 slow keyframes that follow the action. Subtle motion always (pulse, flow, hop), nothing static for more than ~2 s.
- Objects pop in with `pop()` / `outBack` when narrated; things leave by shrinking or sinking. Tags appear when their word is spoken and fade when the idea is done. Max ~4 tags on screen at once; tag text is short (≤ 10 字 + `<small>` sub-label).
- The metaphor must explain the mechanism, not decorate it. Every object on screen should map to a real thing in the narration.
- Determinism: no `Math.random`, `Date.now`, `performance.now`, requestAnimationFrame or network loads. State is a pure function of `t`. Use `kit.rng(seed)` for scattered layouts (call it in build, not render).
- Chinese text inside canvas textures is fine (font "Clay Sans"); glyphs are subset from scenes/*.js and narration by `build/font.sh` — **run `./build/font.sh` after adding new Chinese text**, or new characters render as boxes.
- Performance: keep geometry modest (≤ ~150 meshes per scene; reuse geometries/materials in loops).

## Verify your scenes (required)
From the project root `/Users/janetmao/Technical Analysis/Granola/video`:
```bash
./build/font.sh
npx --yes hyperframes@0.8.145 lint 2>&1 | tail -5          # must be 0 errors
npx --yes hyperframes@0.8.145 snapshot --at <global times> --no-end -o snapshots/<your-scene-ids>
```
Take 5–8 snapshots per scene at its key beats (global seconds = scene start + local beat), then **look at `snapshots/<…>/contact-sheet.jpg` and individual frames with the Read tool**. Fix: objects clipped by the frame edge, tags overlapping each other or the title/caption, unreadable text, black/unlit meshes, empty frames, things popping in before their word. Iterate until it looks as good as s03. Use a unique `-o` directory — other agents are snapshotting in parallel. Do not render the MP4.

## Final report
Return ≤ 12 lines: what each scene shows beat by beat (one line per scene), the snapshot dir, any known weaknesses, and any kit change you'd want.
