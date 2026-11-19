// Shared "isometric miniature world" kit for every scene.
// Everything here is deterministic: scenes render purely from local time t (seconds since the scene starts).
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export { THREE, RoundedBoxGeometry };
export const W = 1920, H = 1080, ASPECT = W / H;

// ---------- palette (matches granola-tech.html) ----------
export const C = {
  paper: 0xE7EDE4, desk: 0xD8E2D3, deskEdge: 0xB9C8B5,
  ink: 0x17221C, me: 0x2F7A3C, meLight: 0x4DB860, them: 0x5E6963, themLight: 0x8D9791,
  signal: 0xC2410C, warn: 0xA16207, white: 0xF6F8F4,
  alu: 0xC9D0CB, aluDark: 0x9AA49E, dark: 0x36413B, darker: 0x222A26,
  wood: 0xC9B59A, paperCard: 0xFBFCF8, sticky: 0xF3DE7A, sky: 0x6FB6D9, plum: 0x8C79A8,
};

// ---------- math / easing ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const ramp = (t, a, d) => clamp((t - a) / d);           // 0→1 between a and a+d
export const smooth = (x) => x * x * (3 - 2 * x);
export const outCubic = (x) => 1 - Math.pow(1 - x, 3);
export const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const outBack = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const pop = (t, a, d = 0.45) => Math.max(0.0001, outBack(ramp(t, a, d)));   // scale-in with overshoot
export const window01 = (t, a, b, f = 0.35) => ramp(t, a, f) * (1 - ramp(t, b, f)); // on between a..b with fades
export const P = (x, y, z) => new THREE.Vector3(x, y, z);
// seeded PRNG for "random-looking" layouts (never use Math.random)
export function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

// ---------- materials ----------
export const clay = (color, rough = 0.78, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0, ...extra });
export const glass = (color, opacity = 0.42) => clay(color, 0.25, { transparent: true, opacity, depthWrite: false });
export const flat = (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra });
export const M = {
  desk: clay(C.desk), deskEdge: clay(C.deskEdge),
  alu: clay(C.alu, 0.55), aluDark: clay(C.aluDark, 0.6), key: clay(0xE9EDEA, 0.7),
  dark: clay(C.dark, 0.7), darker: clay(C.darker, 0.85), mid: clay(0x6E7A73, 0.6),
  me: clay(0x3E9150, 0.5), meDeep: clay(C.me, 0.6), them: clay(C.themLight, 0.55),
  signal: clay(C.signal, 0.5), white: clay(C.white, 0.7), card: clay(C.paperCard, 0.85),
  sticky: clay(C.sticky, 0.8), wood: clay(C.wood, 0.8),
  meDot: clay(C.meLight, 0.45, { emissive: 0x1d5a27, emissiveIntensity: 0.5 }),
  themDot: clay(0x6E7872, 0.5, { emissive: 0x2a302d, emissiveIntensity: 0.4 }),
  eye: flat(0x6FE0FF),
};

// ---------- mesh helpers ----------
export const shadowed = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
export const rbox = (w, h, d, r, mat) => shadowed(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2, h / 2, d / 2) * 0.999), mat));
export const cyl = (rt, rb, h, mat, seg = 40) => shadowed(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat));
export const sphere = (r, mat) => shadowed(new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat));
export const torus = (r, tube, mat) => shadowed(new THREE.Mesh(new THREE.TorusGeometry(r, tube, 14, 56), mat));

/** The diorama base every scene sits on: a rounded desk slab on a plinth. Top surface is y=0. */
export function desk(parent, w = 11, d = 7.2) {
  const top = rbox(w, 0.6, d, 0.25, M.desk); top.position.y = -0.3; parent.add(top);
  const plinth = rbox(w + 0.3, 0.5, d + 0.3, 0.22, M.deskEdge); plinth.position.y = -0.75; parent.add(plinth);
  return top;
}

/** Canvas texture with text, drawn in the video font. lines: [{text, size, weight, color}] or strings. */
export function textTexture(lines, { w = 512, h = 256, bg = "#FBFCF8", pad = 28, radius = 24, align = "left", lineGap = 1.25, border = null } = {}) {
  const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d");
  if (bg) { g.fillStyle = bg; g.beginPath(); g.roundRect(0, 0, w, h, radius); g.fill(); }
  if (border) { g.strokeStyle = border; g.lineWidth = 8; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, radius); g.stroke(); }
  let y = pad;
  for (const L of lines) {
    const l = typeof L === "string" ? { text: L } : L;
    const size = l.size || 40;
    g.font = `${l.weight || 700} ${size}px "Clay Sans", sans-serif`;
    g.fillStyle = l.color || "#17221C"; g.textBaseline = "top"; g.textAlign = align;
    g.fillText(l.text, align === "center" ? w / 2 : pad, y);
    y += size * lineGap;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
/** A flat card (paper, sticky note, screen) with a text texture, lying on its back side facing +z. */
export function card(w, h, tex, { depth = 0.04, mat = M.card } = {}) {
  const g = new THREE.Group();
  const body = rbox(w, h, depth, Math.min(0.06, depth / 2), mat); g.add(body);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, h * 0.98), flat(0xffffff, { map: tex, transparent: true }));
  face.position.z = depth / 2 + 0.002; g.add(face);
  return g;
}

/** A laptop. Returns {group, hinge, screen}; screen faces +z. Pass a texture for the display. */
export function laptop(tex, { w = 3.2, d = 2.2 } = {}) {
  const g = new THREE.Group();
  const base = rbox(w, 0.14, d, 0.06, M.alu); base.position.y = 0.07; g.add(base);
  const kb = rbox(w * 0.84, 0.03, d * 0.5, 0.02, M.key); kb.position.set(0, 0.155, -0.25); g.add(kb);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.14, -d / 2 + 0.05); g.add(hinge);
  const lid = rbox(w, w * 0.64, 0.1, 0.06, M.aluDark); lid.position.set(0, w * 0.32, 0); hinge.add(lid);
  hinge.rotation.x = -0.22;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.9, w * 0.56), flat(0xffffff, { map: tex }));
  screen.position.set(0, w * 0.325, 0.056); hinge.add(screen);
  return { group: g, hinge, screen };
}
/** A deterministic "video call" screen texture (4 tiles). */
export function callScreenTexture() {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 640; const g = c.getContext("2d");
  g.fillStyle = "#1E2622"; g.fillRect(0, 0, 1024, 640);
  [["#5B7F6A", "#F0C9A4"], ["#7A6B8F", "#D9A97F"], ["#4F6E86", "#F2D2B5"], ["#86705A", "#C98E6A"]].forEach(([bg, skin], i) => {
    const x = 28 + (i % 2) * 496, y = 28 + Math.floor(i / 2) * 296;
    g.fillStyle = bg; g.beginPath(); g.roundRect(x, y, 472, 272, 18); g.fill();
    g.fillStyle = skin; g.beginPath(); g.arc(x + 236, y + 118, 58, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(x + 236, y + 262, 112, 74, 0, Math.PI, 0); g.fill();
  });
  g.strokeStyle = "#6CC17A"; g.lineWidth = 8; g.beginPath(); g.roundRect(28, 28, 472, 272, 18); g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
/** A small friendly robot (used for "bots" and "agents"). Origin at feet; faces +z. */
export function robot({ body = 0xB8C1BC, eye = 0x6FE0FF } = {}) {
  const g = new THREE.Group(), m = clay(body, 0.6);
  const b = rbox(0.8, 0.7, 0.6, 0.18, m); b.position.y = 0.35; g.add(b);
  const head = rbox(0.7, 0.5, 0.55, 0.16, m); head.position.y = 0.98; g.add(head);
  const visor = new THREE.Mesh(new RoundedBoxGeometry(0.56, 0.22, 0.05, 3, 0.08), flat(0x1E2622)); visor.position.set(0, 0.99, 0.28); g.add(visor);
  [-0.13, 0.13].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), flat(eye)); e.position.set(x, 0.99, 0.31); g.add(e); });
  const ant = cyl(0.025, 0.025, 0.3, m, 8); ant.position.y = 1.38; g.add(ant);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), flat(eye)); ball.position.y = 1.55; g.add(ball);
  const armL = rbox(0.14, 0.5, 0.14, 0.06, m), armR = armL.clone(); armL.position.set(-0.5, 0.42, 0); armR.position.set(0.5, 0.42, 0); g.add(armL, armR);
  g.userData = { arms: [armL, armR], head };
  return g;
}

// ---------- pipes, beads, waves ----------
export const TUBE_SEG = 220, RAD_SEG = 20;
/** A pipe along a curve that can "grow": call grow(k) with k 0..1. */
export function pipe(parent, points, mat, radius = 0.16) {
  const curve = new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.4);
  const mesh = shadowed(new THREE.Mesh(new THREE.TubeGeometry(curve, TUBE_SEG, radius, RAD_SEG, false), mat));
  if (mat.transparent) mesh.castShadow = false;
  mesh.geometry.setDrawRange(0, 0); parent.add(mesh);
  return { curve, mesh, grow: (k) => mesh.geometry.setDrawRange(0, Math.floor(clamp(k) * TUBE_SEG) * RAD_SEG * 6) };
}
/** Beads that flow along a curve after `start`, only through the part that has grown (growDur). */
export function beads(parent, n, mat, r = 0.115) {
  const g = new THREE.Group(); parent.add(g);
  for (let i = 0; i < n; i++) g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat));
  g.flow = (curve, t, start, growDur = 1.4, speed = 0.33, { stopAt = 1 } = {}) => {
    const reach = clamp((t - start) / growDur);
    g.children.forEach((b, i) => {
      const phase = (((t - start) * speed + i / n) % 1 + 1) % 1;
      b.visible = t > start && phase <= reach * stopAt;
      curve.getPointAt(clamp(phase), b.position);
      b.scale.setScalar(clamp((t - start) / 0.6) * (0.85 + 0.15 * Math.sin(i * 1.7 + t * 6)));
    });
  };
  return g;
}
/** Expanding sound-wave rings. origin: Vector3, quat: orientation (ring faces local +z). */
export function waves(parent, n = 5, color = 0x7C8780) {
  const rings = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 10, 64), flat(color, { transparent: true, depthWrite: false })); parent.add(m); rings.push(m); }
  return {
    rings,
    render(t, start, origin, quat, { spread = 1, opacity = 0.55, speed = 0.7 } = {}) {
      const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
      rings.forEach((w, i) => {
        const age = (((t - start) * speed + i / n) % 1 + 1) % 1;
        w.visible = t > start;
        w.quaternion.copy(quat);
        w.scale.setScalar(0.6 + age * (1 + 1.6 * spread));
        w.position.copy(origin).addScaledVector(fwd, age * (0.4 + 1.6 * spread));
        w.material.opacity = (1 - age) * opacity * clamp((t - start) / 0.5);
      });
    },
  };
}

// ---------- DOM tags anchored to 3D points ----------
const _v = new THREE.Vector3();
export function makeTagFactory(container, camera) {
  return function tag(html, cls = "") {
    const el = document.createElement("div"); el.className = "tag " + cls; el.innerHTML = html; el.style.opacity = "0"; container.appendChild(el);
    return {
      el,
      /** p: world Vector3 (or a function returning one); dx/dy pixel offset from the projected point to the tag's top-left. */
      place(p, alpha, { dx = 0, dy = 0, scale = 1 } = {}) {
        _v.copy(typeof p === "function" ? p() : p).project(camera);
        const x = (_v.x * 0.5 + 0.5) * W + dx, y = (-_v.y * 0.5 + 0.5) * H + dy;
        el.style.opacity = clamp(alpha).toFixed(3);
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.86 + 0.14 * clamp(alpha)) * scale})`;
      },
    };
  };
}
/** A fixed-position DOM panel (big text, numbers) in screen pixels. */
export function makePanelFactory(container) {
  return function panel(html, cls = "", { x = 0, y = 0 } = {}) {
    const el = document.createElement("div"); el.className = "panel " + cls; el.innerHTML = html; el.style.opacity = "0";
    el.style.left = x + "px"; el.style.top = y + "px"; container.appendChild(el);
    return { el, show(alpha, { dy = 18 } = {}) { const a = clamp(alpha); el.style.opacity = a.toFixed(3); el.style.transform = `translateY(${((1 - a) * dy).toFixed(1)}px)`; } };
  };
}

// ---------- camera ----------
const ISO = new THREE.Vector3(1, 0.86, 1.15).normalize();
/** Isometric orthographic camera: look at target with half-height `half` (smaller = closer). yaw orbits around Y (radians). */
export function setIso(camera, target, half, yaw = 0) {
  const dir = ISO.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  camera.position.copy(target).addScaledVector(dir, 30);
  camera.left = -half * ASPECT; camera.right = half * ASPECT; camera.top = half; camera.bottom = -half;
  camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
}
/** Keyframed camera: keys = [[time, half, Vector3 target, yaw?], ...], smooth between keys, gentle ambient orbit. */
export function camKeys(camera, t, keys) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1][0]) i++;
  const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
  const k = b[0] === a[0] ? 1 : inOut(clamp((t - a[0]) / (b[0] - a[0])));
  const target = new THREE.Vector3().lerpVectors(a[2], b[2], k);
  setIso(camera, target, lerp(a[1], b[1], k), lerp(a[3] || 0, b[3] || 0, k) + Math.sin(t * 0.12) * 0.06);
}
