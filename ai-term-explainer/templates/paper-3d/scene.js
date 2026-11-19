// 向量空间 · 纸模型样片（10s）。所有画面只由时间 t 决定，可任意跳帧。
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const W = 1920, H = 1080, ASPECT = W / H, DUR = 10;
const INK = 0x2e2e33, PINK = 0xe5466e, PAPER = 0xfffbf2;

// ---------- 小工具 ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ramp = (t, a, d) => clamp((t - a) / d);
const outCubic = (x) => 1 - Math.pow(1 - x, 3);
const inOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const lerp = (a, b, k) => a + (b - a) * k;
const tiny = (s) => Math.max(0.0001, s);
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const paperMat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0, ...extra });
const shadowed = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };

// 纸纹贴图（固定种子）
function paperTexture(base = "#FFFBF2", size = 512, seed = 3) {
  const c = document.createElement("canvas"); c.width = c.height = size; const g = c.getContext("2d");
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  const r = rng(seed);
  for (let i = 0; i < 9000; i++) {
    const a = r() * 0.05; g.fillStyle = r() > 0.5 ? `rgba(120,100,70,${a})` : `rgba(255,255,255,${a * 1.5})`;
    g.fillRect(r() * size, r() * size, 1 + r() * 2, 1 + r() * 2);
  }
  for (let i = 0; i < 60; i++) { // 纤维
    g.strokeStyle = `rgba(140,120,90,${0.04 + r() * 0.05})`; g.lineWidth = 0.8;
    const x = r() * size, y = r() * size, a = r() * Math.PI; g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * 14 + r() * 6, y + Math.sin(a) * 14, x + Math.cos(a) * 28, y + Math.sin(a) * 28); g.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// 词卡贴图：纸面 + 顶部胶带色条 + 手写字
function wordTexture(word, tape, { pink = false } = {}) {
  const w = 512, h = 220, c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d");
  const r = rng(word.charCodeAt(0) * 7 + word.length);
  g.fillStyle = "#FFFDF7"; g.beginPath(); g.roundRect(6, 6, w - 12, h - 12, 18); g.fill();
  for (let i = 0; i < 1600; i++) { g.fillStyle = `rgba(120,100,70,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 1.5, 1.5); }
  g.save(); g.translate(w / 2, 24); g.rotate((r() - 0.5) * 0.06); // 胶带
  g.fillStyle = tape; g.globalAlpha = 0.85; g.fillRect(-120, -16, 240, 34); g.restore();
  if (pink) { g.strokeStyle = "#E5466E"; g.lineWidth = 7; g.beginPath(); g.roundRect(12, 12, w - 24, h - 24, 16); g.stroke(); }
  g.fillStyle = pink ? "#E5466E" : "#2E2E33"; g.font = `700 104px "Hannotate SC"`;
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(word, w / 2, h / 2 + 18);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}

// ---------- 数据（示意坐标） ----------
const TAPE = { animal: "#4A4A50", fruit: "#9A948C", vehicle: "#C8C0B2" };
const WORDS = [
  { w: "猫", g: "animal", p: [-2.6, 3.0, -2.4], s: 1.2 },
  { w: "狗", g: "animal", p: [-1.2, 2.5, -2.6], s: 1.35 },
  { w: "兔子", g: "animal", p: [-3.3, 2.0, -1.0], s: 1.5 },
  { w: "苹果", g: "fruit", p: [3.0, 1.5, -1.6], s: 1.9 },
  { w: "香蕉", g: "fruit", p: [4.0, 1.1, -0.4], s: 2.05 },
  { w: "橙子", g: "fruit", p: [2.4, 0.9, 0.4], s: 2.2 },
  { w: "汽车", g: "vehicle", p: [-1.0, 2.6, 1.8], s: 2.6 },
  { w: "火车", g: "vehicle", p: [0.6, 2.2, 2.6], s: 2.75 },
  { w: "自行车", g: "vehicle", p: [-2.6, 1.8, 2.4], s: 2.9 },
];
const QUERY = { w: "小猫", p: [-3.6, 3.6, -3.0], s: 5.0 };
const RINGS = [
  { g: "animal", c: [-2.4, -2.0], r: 1.45, s: 4.0 },
  { g: "fruit", c: [3.15, -0.55], r: 1.45, s: 4.2 },
  { g: "vehicle", c: [-1.0, 2.27], r: 1.55, s: 4.4 },
];

// ---------- 相机：正交等距 ----------
const ISO = new THREE.Vector3(1, 0.9, 1.15).normalize();
function setIso(camera, target, half, yaw) {
  const dir = ISO.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  camera.position.copy(target).addScaledVector(dir, 30);
  camera.left = -half * ASPECT; camera.right = half * ASPECT; camera.top = half; camera.bottom = -half;
  camera.lookAt(target); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
}

window.__hf = window.__hf || {};
window.__hf.buildReady = window.__hf.buildReady || {};
window.__hf.buildReady["vector-space"] = (async () => {
  await Promise.all([document.fonts.load(`700 104px "Hannotate SC"`), document.fonts.load(`400 50px "Yuanti SC"`)]);

  const canvas = document.getElementById("three-layer");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(W, H, false); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xd9ccb3, 2.3));
  const sun = new THREE.DirectionalLight(0xfff4e2, 1.0);
  sun.position.set(-5, 12, 7); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  sun.shadow.radius = 5; sun.shadow.bias = -0.0005; scene.add(sun);

  const world = new THREE.Group(); scene.add(world);

  // 页面上的接影面（只显示阴影）
  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 8.8), new THREE.ShadowMaterial({ opacity: 0.1 }));
  catcher.rotation.x = -Math.PI / 2; catcher.position.y = -0.2; catcher.receiveShadow = true; world.add(catcher);

  // 纸板底座：一张厚卡纸
  const boardTex = paperTexture("#FFFBF2"); boardTex.repeat.set(2, 1.5);
  const board = shadowed(new THREE.Mesh(new RoundedBoxGeometry(10.4, 0.16, 7.6, 3, 0.05), paperMat(0xffffff, { map: boardTex })));
  board.position.y = -0.08; world.add(board);
  const under = shadowed(new THREE.Mesh(new RoundedBoxGeometry(10.5, 0.1, 7.7, 2, 0.04), paperMat(0xe9dfcb)));
  under.position.y = -0.17; world.add(under);

  // 三根坐标轴（深灰细纸卷），原点在底座左前角
  const O = new THREE.Vector3(-4.7, 0.02, 3.4);
  const inkMat = paperMat(INK, { roughness: 0.8 });
  const axes = [
    { dir: new THREE.Vector3(1, 0, 0), len: 9.2, tag: "ax1", dx: 24, dy: -46 },
    { dir: new THREE.Vector3(0, 1, 0), len: 3.9, tag: "ax2", dx: 26, dy: -14 },
    { dir: new THREE.Vector3(0, 0, -1), len: 6.6, tag: "ax3", dx: 22, dy: 4 },
  ].map((a, i) => {
    const g = new THREE.Group(); g.position.copy(O);
    g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), a.dir);
    const rod = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 10), inkMat));
    const tip = shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 14), inkMat));
    g.add(rod, tip); world.add(g);
    return { ...a, g, rod, tip, el: document.getElementById(a.tag), start: 0.45 + i * 0.12 };
  });

  // 词卡：纸片 + 细竖杆 + 地上的小圆点（投影）
  const stickMat = paperMat(0x6e6a66, { roughness: 0.85 });
  const dotMat = new THREE.MeshBasicMaterial({ color: 0x8a847c, transparent: true, opacity: 0.55 });
  function makeCard(item, tape, pink) {
    const tex = wordTexture(item.w, tape, { pink });
    const wpx = item.w.length > 2 ? 1.75 : 1.4, hgt = 0.6;
    const card = new THREE.Group();
    const back = shadowed(new THREE.Mesh(new RoundedBoxGeometry(wpx, hgt, 0.03, 2, 0.012), paperMat(0xf3ead8)));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(wpx, hgt), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    face.position.z = 0.017; card.add(back, face); world.add(card);
    const stick = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1, 8), pink ? paperMat(PINK) : stickMat));
    world.add(stick);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), pink ? new THREE.MeshBasicMaterial({ color: PINK, transparent: true, opacity: 0.8 }) : dotMat);
    dot.rotation.x = -Math.PI / 2; world.add(dot);
    return { ...item, card, stick, dot, hgt, P: new THREE.Vector3(...item.p) };
  }
  const cards = WORDS.map((it) => makeCard(it, TAPE[it.g], false));
  const q = makeCard(QUERY, "#E5466E", true);

  // 聚类的圈：地面上的手绘感纸圈（略不圆）
  function wobblyRing(r, seed) {
    const shape = new THREE.Shape(), hole = new THREE.Path(), rr = rng(seed), N = 64, off = rr() * 6;
    const rad = (i, k) => r * k * (1 + 0.035 * Math.sin(i / N * Math.PI * 2 * 3 + off) + 0.02 * Math.sin(i / N * Math.PI * 2 * 5));
    for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2, R = rad(i, 1); i ? shape.lineTo(Math.cos(a) * R, Math.sin(a) * R) : shape.moveTo(R, 0); }
    for (let i = 0; i <= N; i++) { const a = -i / N * Math.PI * 2, R = rad(N - i, 0.955); i ? hole.lineTo(Math.cos(a) * R, Math.sin(a) * R) : hole.moveTo(R, 0); }
    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape, 1);
  }
  const rings = RINGS.map((rg, i) => {
    const mat = new THREE.MeshBasicMaterial({ color: 0x8a847c, transparent: true, opacity: 0.7 });
    const m = new THREE.Mesh(wobblyRing(rg.r, 11 + i), mat);
    m.rotation.x = -Math.PI / 2; m.position.set(rg.c[0], 0.012, rg.c[1]); world.add(m);
    return { ...rg, m, mat };
  });

  // 近邻连线（粉色细线，从“小猫”伸向三只动物）
  const lineMat = paperMat(PINK, { roughness: 0.7 });
  const links = cards.filter((c) => c.g === "animal").map((c, i) => {
    const m = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 8), lineMat)); world.add(m);
    return { to: c, m, start: 5.75 + i * 0.22 };
  });

  const titleEl = document.getElementById("title"), capEl = document.getElementById("cap-wrap");
  const hlEl = document.getElementById("hl-bar"), fadeEl = document.getElementById("fade");
  const UP = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  const pink = new THREE.Color(PINK), grey = new THREE.Color(0x8a847c);

  function placeCard(c, t, start, { drop = false } = {}) {
    let y, sc, stickK;
    if (drop) { // 从上方落下
      const k = ramp(t, start, 0.65);
      y = c.P.y + (1 - outBack(k)) * 2.6; sc = tiny(outCubic(ramp(t, start, 0.25))); stickK = outCubic(ramp(t, start + 0.55, 0.35));
    } else {   // 从地面升起
      const k = outCubic(ramp(t, start, 0.55));
      y = lerp(0.2, c.P.y, k); sc = tiny(outBack(ramp(t, start + 0.1, 0.45))); stickK = k;
    }
    c.card.position.set(c.P.x, y, c.P.z); c.card.scale.setScalar(sc);
    c.card.quaternion.copy(camera.quaternion); // 永远正对镜头，字始终能读
    const top = Math.max(0.001, (y - c.hgt / 2) * stickK);
    c.stick.scale.set(1, top, 1); c.stick.position.set(c.P.x, top / 2, c.P.z); c.stick.visible = stickK > 0.001;
    c.dot.scale.setScalar(tiny(outBack(ramp(t, start, 0.35)))); c.dot.position.set(c.P.x, 0.014, c.P.z);
  }

  function renderAt(t) {
    t = clamp(t, 0, DUR);
    // 镜头：慢慢绕着转，让人看出这是三维的
    const yaw = lerp(-0.34, 0.12, inOut(ramp(t, 0.3, 9.2)));
    const half = lerp(6.5, 6.0, inOut(ramp(t, 0, 7)));
    setIso(camera, new THREE.Vector3(0, 1.5, 0), half, yaw);
    // 画面整体往右下挪，给左上标题和底部字幕留位置
    const sx = 1.5, sy = 0.05;
    camera.left -= sx; camera.right -= sx; camera.top -= sy; camera.bottom -= sy; camera.updateProjectionMatrix();

    world.scale.setScalar(lerp(0.9, 1, outCubic(ramp(t, 0, 0.9))));
    world.updateMatrixWorld(true);

    axes.forEach((a) => {
      const k = outCubic(ramp(t, a.start, 0.7)), L = Math.max(0.001, a.len * k);
      a.rod.scale.set(1, L, 1); a.rod.position.y = L / 2; a.tip.position.y = L + 0.12; a.tip.scale.setScalar(tiny(k));
      tmp.copy(a.dir).multiplyScalar(a.at ? a.len * a.at : a.len + 0.2).add(O).applyMatrix4(world.matrixWorld).project(camera);
      const x = (tmp.x * 0.5 + 0.5) * W, y = (-tmp.y * 0.5 + 0.5) * H;
      a.el.style.opacity = (ramp(t, a.start + 0.5, 0.4) * 0.95).toFixed(3);
      a.el.style.transform = `translate(${(x + a.dx).toFixed(1)}px, ${(y + a.dy).toFixed(1)}px)`;
    });

    cards.forEach((c) => placeCard(c, t, c.s));
    placeCard(q, t, q.s, { drop: true });
    q.card.visible = q.stick.visible = q.dot.visible = t >= q.s;

    rings.forEach((r) => {
      r.m.scale.setScalar(tiny(outBack(ramp(t, r.s, 0.5))));
      if (r.g === "animal") { const k = ramp(t, 6.3, 0.45); r.mat.color.copy(grey).lerp(pink, k); r.mat.opacity = lerp(0.7, 0.95, k); }
    });

    links.forEach((l) => {
      const k = outCubic(ramp(t, l.start, 0.45));
      l.m.visible = k > 0.001;
      const a = tmp.copy(q.card.position), b = tmp2.copy(l.to.card.position);
      a.y -= q.hgt / 2; b.y += l.to.hgt / 2;
      const end = new THREE.Vector3().lerpVectors(a, b, k), len = Math.max(0.001, a.distanceTo(end));
      l.m.position.lerpVectors(a, end, 0.5); l.m.scale.set(1, len, 1);
      l.m.quaternion.setFromUnitVectors(UP, new THREE.Vector3().subVectors(b, a).normalize());
    });

    titleEl.style.opacity = ramp(t, 0.7, 0.5).toFixed(3);
    titleEl.style.transform = `translateY(${((1 - outCubic(ramp(t, 0.7, 0.5))) * 16).toFixed(1)}px)`;
    const ck = outCubic(ramp(t, 6.8, 0.5));
    capEl.style.opacity = ck.toFixed(3); capEl.style.transform = `translateY(${((1 - ck) * 18).toFixed(1)}px)`;
    hlEl.style.transform = `scaleX(${outCubic(ramp(t, 7.4, 0.55)).toFixed(3)})`;
    fadeEl.style.opacity = (1 - ramp(t, 0, 0.45)).toFixed(3);

    renderer.render(scene, camera);
  }
  window.addEventListener("hf-seek", (e) => renderAt(e.detail.time));
  window.__vsRender = renderAt;
  renderAt(0);
})();
