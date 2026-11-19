// Scene scheduler: one WebGL renderer, one camera, 11 scene modules. Renders purely from HyperFrames time.
import * as kit from "./kit.js";
import TL from "./timeline.js";
import SCENES from "./registry.js";
const { THREE, W, H, clamp, ramp } = kit;

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["granola-scenes"] = (async () => {
  await Promise.all([500, 700, 900].map((w) => document.fonts.load(`${w} 40px "Clay Sans"`)));

  const canvas = document.getElementById("three-layer");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H, false); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xF6FAF3, 0x9FB39F, 1.6));
  const sun = new THREE.DirectionalLight(0xFFF6E8, 2.4);
  sun.position.set(6, 12, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 });
  sun.shadow.radius = 6; sun.shadow.bias = -0.0004; scene.add(sun);

  const overlay = document.getElementById("scene-overlays");
  const capEl = document.getElementById("cap");
  const eyebrowEl = document.getElementById("eyebrow"), headlineEl = document.getElementById("headline"), titleEl = document.getElementById("title");
  const fadeEl = document.getElementById("fade");

  const live = SCENES.map((mod) => {
    const meta = TL.scenes.find((s) => s.id === mod.id);
    const group = new THREE.Group(); group.visible = false; scene.add(group);
    const ov = document.createElement("div"); ov.className = "scene-ov"; ov.style.display = "none"; overlay.appendChild(ov);
    const text = meta.text, chars = meta.chars;
    const ctx = {
      kit, THREE, group, camera, scene, renderer, dur: meta.dur, cues: meta.cues, text,
      tag: kit.makeTagFactory(ov, camera), panel: kit.makePanelFactory(ov), overlay: ov,
      /** local time (s) when the n-th occurrence of `kw` starts being spoken in this scene */
      at(kw, n = 1) {
        let i = -1; for (let k = 0; k < n; k++) { i = text.indexOf(kw, i + 1); if (i < 0) break; }
        if (i < 0) { console.warn(`[${mod.id}] keyword not in narration: ${kw}`); return 0; }
        return chars[i];
      },
    };
    const inst = mod.build(ctx) || {};
    return { mod, meta, group, ov, ctx, render: inst.render || (() => {}) };
  });

  let current = null;
  function renderAt(t) {
    let s = live.find((x) => t >= x.meta.start && t < x.meta.start + x.meta.dur) || live[live.length - 1];
    const lt = clamp(t - s.meta.start, 0, s.meta.dur);
    if (current !== s) {
      live.forEach((x) => { x.group.visible = x === s; x.ov.style.display = x === s ? "block" : "none"; });
      eyebrowEl.textContent = s.mod.eyebrow || ""; headlineEl.textContent = s.mod.headline || "";
      current = s;
    }
    s.render(lt, s.ctx);
    renderer.render(scene, camera);

    // title, captions, dip-to-paper between scenes
    const showTitle = s.mod.headline ? ramp(lt, 0.15, 0.5) * (1 - ramp(lt, s.meta.dur - 0.45, 0.3)) : 0;
    titleEl.style.opacity = showTitle.toFixed(3);
    let cap = ""; for (const [txt, a, b] of s.meta.cues) if (lt >= a && lt < b) cap = txt;
    capEl.textContent = cap; capEl.style.opacity = cap ? "1" : "0";
    const first = s === live[0], last = s === live[live.length - 1];
    const fin = first ? 0 : 1 - ramp(lt, 0, 0.35);
    const fout = last ? 0 : ramp(lt, s.meta.dur - 0.35, 0.35);
    fadeEl.style.opacity = Math.max(fin, fout).toFixed(3);
  }
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  window.__granolaRender = renderAt;
  renderAt(window.__hfThreeTime || 0);
})();
