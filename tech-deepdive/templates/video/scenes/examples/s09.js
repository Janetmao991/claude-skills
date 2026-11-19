// 安全与法律 — three risks, three vignettes on one wide desk (left: 2025 key leak, middle: 2026 link hijack, right: the lawsuit toggles).
export default {
  id: "s09",
  eyebrow: "安全与法律",
  headline: "这套架构的三个风险",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    const T = {
      cones: at("带来了"),
      y25: at("二零二五年"), researcher: at("研究员"), open: at("拆开"),
      api: at("不用登录的接口"), hid: at("藏着"), key: at("钥匙"), users: at("三百位内测用户"),
      y26: at("二零二六年"), found: at("又有人"), link: at("点一下链接"), win: at("软件窗口"), jump: at("跳到"), attacker: at("攻击者"), wire: at("那根线"),
      trouble: at("最大的麻烦"), suit: at("官司"), unaware: at("不知道"), remind: at("提醒"), off: at("默认是关的"), train: at("用数据训练"), on: at("默认是开的"),
    };
    // Everything lives in G: a long desk turned so its length runs left→right across the screen (a slight diagonal).
    // Inside G, local +x ≈ screen right and rotation.y = FACE turns a +z face toward the camera.
    const YAW = Math.atan2(1, 1.15), FACE = 0.3;
    const G = new THREE.Group(); G.rotation.y = YAW - FACE; group.add(G); group.updateMatrixWorld(true);
    const qFace = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), FACE);
    const L = (x, y, z) => G.localToWorld(P(x, y, z));          // G-local → world (camera targets, tags)
    const W = (v) => G.localToWorld(v.clone());
    const toL = (v) => G.worldToLocal(v);                        // world → G-local (mutates)
    const canvasTex = (w, h, draw) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    };
    const F = (wt, s) => `${wt} ${s}px "Clay Sans", sans-serif`;
    const rr = (g, x, y, w, h, r, fill) => { g.fillStyle = fill; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
    const facePlane = (w, h, tex, extra = {}) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), kit.flat(0xffffff, { map: tex, transparent: true, ...extra }));

    kit.desk(G, 14.4, 5.6);

    // ---------- intro: three traffic cones mark the three risks ----------
    const coneMat = kit.clay(C.signal, 0.55);
    const cones = [P(-4.6, 0, 0), P(0, 0, 0), P(4.6, 0, 0)].map((p) => {
      const g = new THREE.Group(); g.position.copy(p); G.add(g);
      const base = kit.rbox(0.8, 0.1, 0.8, 0.05, coneMat); base.position.y = 0.05;
      const body = kit.cyl(0.06, 0.34, 0.9, coneMat, 32); body.position.y = 0.55;
      const band = kit.cyl(0.19, 0.24, 0.16, M.white, 32); band.position.y = 0.6;
      g.add(base, body, band); return g;
    });

    // ================= zone 1 · 2025: the installer, the open endpoint, the key =================
    const box = new THREE.Group(); box.position.set(-5.3, 0, -0.4); box.rotation.y = 0.45; G.add(box);
    const BW = 1.5, BH = 1.0, BD = 1.2, cardboard = kit.clay(0xC9A77E, 0.85), cardboardIn = kit.clay(0x9C7F5B, 0.9);
    const boxBody = kit.rbox(BW, BH, BD, 0.05, cardboard); boxBody.position.y = BH / 2; box.add(boxBody);
    const boxHole = kit.rbox(BW - 0.12, 0.02, BD - 0.12, 0.01, cardboardIn); boxHole.position.y = BH + 0.002; box.add(boxHole);
    const flap = (pos, size, off) => { const h = new THREE.Group(); h.position.copy(pos); const m = kit.rbox(...size, 0.02, cardboard); m.position.copy(off); h.add(m); box.add(h); return h; };
    const flaps = [
      [flap(P(0, BH + 0.03, BD / 2), [BW, 0.035, BD / 2], P(0, 0, -BD / 4)), "x", 2.05],
      [flap(P(0, BH + 0.03, -BD / 2), [BW, 0.035, BD / 2], P(0, 0, BD / 4)), "x", -2.05],
      [flap(P(BW / 2, BH + 0.008, 0), [BW / 2, 0.035, BD - 0.04], P(-BW / 4, 0, 0)), "z", -2.0],
      [flap(P(-BW / 2, BH + 0.008, 0), [BW / 2, 0.035, BD - 0.04], P(BW / 4, 0, 0)), "z", 2.0],
    ];
    const pkgTex = kit.textTexture([{ text: "安装包", size: 76, weight: 900 }, { text: "Granola.app", size: 34, weight: 500, color: "#5E6963" }], { w: 400, h: 200, pad: 30, align: "center", bg: "#FBFCF8" });
    const pkgLabel = kit.card(0.92, 0.46, pkgTex); pkgLabel.position.set(0, 0.48, BD / 2 + 0.01); box.add(pkgLabel);
    const tape = kit.rbox(0.22, 0.02, BD + 0.02, 0.01, kit.clay(0xE6D3B0, 0.6)); tape.position.y = BH + 0.065; box.add(tape);

    // researcher robot with a magnifier
    const bot = kit.robot({ body: 0xB8C1BC }); G.add(bot);
    const mag = new THREE.Group(); bot.add(mag);
    const magRing = kit.torus(0.26, 0.05, M.dark); const magLens = new THREE.Mesh(new THREE.CircleGeometry(0.25, 32), kit.glass(C.sky, 0.45));
    const magHandle = kit.cyl(0.045, 0.045, 0.45, M.dark, 12); magHandle.position.set(0, -0.48, 0);
    mag.add(magRing, magLens, magHandle);

    // envelope "功能开关" with its flap, floating above the box
    const env = new THREE.Group(); env.quaternion.copy(qFace); G.add(env);
    const envTex = canvasTex(520, 340, (g, w, h) => {
      rr(g, 0, 0, w, h, 18, "#FBFCF8");
      g.strokeStyle = "#D6DDD3"; g.lineWidth = 6; g.beginPath(); g.moveTo(12, h - 10); g.lineTo(w / 2, h * 0.5); g.lineTo(w - 12, h - 10); g.stroke();
      rr(g, 92, 132, 336, 150, 18, "#F3DE7A");
      g.fillStyle = "#17221C"; g.textAlign = "center"; g.textBaseline = "top"; g.font = F(900, 62); g.fillText("功能开关", w / 2, 150);
      g.font = F(500, 30); g.fillStyle = "#5E6963"; g.fillText("不用登录就能读", w / 2, 228);
    });
    const envBody = kit.rbox(1.3, 0.85, 0.05, 0.03, M.card); env.add(envBody);
    const envFace = facePlane(1.27, 0.83, envTex); envFace.position.z = 0.027; env.add(envFace);
    const envHinge = new THREE.Group(); envHinge.position.set(0, 0.425, 0.03); env.add(envHinge);
    const triShape = new THREE.Shape(); triShape.moveTo(-0.65, 0); triShape.lineTo(0.65, 0); triShape.lineTo(0, -0.46); triShape.closePath();
    const envFlap = kit.shadowed(new THREE.Mesh(new THREE.ShapeGeometry(triShape), kit.clay(0xEEF1EB, 0.8, { side: THREE.DoubleSide }))); envHinge.add(envFlap);
    const ENV_POS = P(-5.3, 2.1, -0.4);

    // the golden key (tip along local +z, so lookAt() aims it)
    const gold = kit.clay(0xE2B13C, 0.35, { metalness: 0.3, emissive: 0x7a5200, emissiveIntensity: 0.2 });
    const key = new THREE.Group(); G.add(key);
    const bow = kit.torus(0.17, 0.06, gold); bow.rotation.y = Math.PI / 2;
    const shaft = kit.cyl(0.045, 0.045, 0.62, gold, 14); shaft.rotation.x = Math.PI / 2; shaft.position.z = 0.48;
    const tooth1 = kit.rbox(0.05, 0.14, 0.07, 0.02, gold); tooth1.position.set(0, -0.08, 0.66);
    const tooth2 = kit.rbox(0.05, 0.1, 0.06, 0.02, gold); tooth2.position.set(0, -0.06, 0.52);
    key.add(bow, shaft, tooth1, tooth2);

    // the vault, door facing the camera
    const vault = new THREE.Group(); vault.position.set(-3.45, 0, 0.75); vault.rotation.y = FACE + 0.75; G.add(vault);
    const VW = 1.3, VH = 1.2, VD = 1.0, wt = 0.12;
    [[VW, wt, VD, 0, wt / 2, 0], [VW, wt, VD, 0, VH - wt / 2, 0], [wt, VH, VD, -VW / 2 + wt / 2, VH / 2, 0], [wt, VH, VD, VW / 2 - wt / 2, VH / 2, 0], [VW, VH, wt, 0, VH / 2, -VD / 2 + wt / 2]]
      .forEach(([w, h, d, x, y, z]) => { const m = kit.rbox(w, h, d, 0.04, M.dark); m.position.set(x, y, z); vault.add(m); });
    const vaultIn = kit.rbox(VW - 2 * wt, VH - 2 * wt, 0.02, 0.01, kit.clay(0x55605A, 0.9)); vaultIn.position.set(0, VH / 2, -VD / 2 + wt + 0.01); vault.add(vaultIn);
    const doorHinge = new THREE.Group(); doorHinge.position.set(-VW / 2, VH / 2, VD / 2); vault.add(doorHinge);
    const door = kit.rbox(VW, VH, 0.12, 0.06, kit.clay(0x4A5650, 0.6)); door.position.set(VW / 2, 0, 0.06); doorHinge.add(door);
    const dial = kit.torus(0.26, 0.05, M.alu); dial.position.set(VW / 2, 0.22, 0.13); doorHinge.add(dial);
    const hole = kit.cyl(0.07, 0.07, 0.03, M.darker, 16); hole.rotation.x = Math.PI / 2; hole.position.set(VW / 2, -0.2, 0.125); doorHinge.add(hole);
    G.updateMatrixWorld(true);
    const KEYHOLE = toL(hole.getWorldPosition(new THREE.Vector3()));
    const doorN = new THREE.Vector3(0, 0, 1).applyQuaternion(vault.quaternion);
    const viewDir = new THREE.Vector3(0, 0, 1).applyQuaternion(qFace).multiplyScalar(0.864).add(P(0, 0.488, 0));
    // transcript cards stacked inside, they fan out once the door opens
    const lineTex = (seed) => canvasTex(300, 210, (g, w, h) => {
      rr(g, 0, 0, w, h, 16, "#FBFCF8"); const r = kit.rng(seed);
      for (let i = 0; i < 5; i++) {
        const y = 26 + i * 36, me = r() > 0.5;
        g.fillStyle = me ? "#4DB860" : "#8D9791"; g.beginPath(); g.arc(30, y + 9, 9, 0, Math.PI * 2); g.fill();
        rr(g, 50, y, 90 + r() * 140, 18, 9, "#C9D0CB");
      }
    });
    const tCards = [0, 1, 2, 3, 4].map((i) => { const c = kit.card(0.95, 0.66, lineTex(11 + i * 7)); G.add(c); return c; });
    const qFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, FACE + 0.75, 0, "YXZ"));
    const cardStart = tCards.map((_, i) => toL(vault.localToWorld(P(0, wt + 0.05 + i * 0.07, 0.02))));
    const camRight = P(Math.cos(FACE), 0, -Math.sin(FACE));
    const cardEnd = tCards.map((_, i) => KEYHOLE.clone().addScaledVector(camRight, (i - 2) * 0.72 + 1.2).add(P(0, 2.45 + 0.25 * Math.cos((i - 2) * 0.7), 0)));
    const cardQ = tCards.map((_, i) => qFace.clone().multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -(i - 2) * 0.12)));

    // ================= zone 2 · 2026: the link that hijacks the window =================
    const deskTex = canvasTex(512, 320, (g, w, h) => {
      g.fillStyle = "#B9CDBE"; g.fillRect(0, 0, w, h);
      rr(g, 150, 284, 212, 26, 13, "rgba(255,255,255,0.7)");
      [0, 1, 2, 3].forEach((i) => rr(g, 166 + i * 50, 288, 34, 18, 6, ["#2F7A3C", "#6FB6D9", "#F3DE7A", "#8D9791"][i]));
    });
    const lap = kit.laptop(deskTex, { w: 2.5, d: 1.7 }); lap.group.position.set(-1.1, 0, -0.85); lap.group.rotation.y = FACE - 0.2; G.add(lap.group);
    const portMesh = kit.rbox(0.12, 0.08, 0.3, 0.03, M.darker); portMesh.position.set(1.27, 0.07, 0.25); lap.group.add(portMesh);
    G.updateMatrixWorld(true);
    const PORT = toL(lap.group.localToWorld(P(1.33, 0.07, 0.25)));

    const appTex = canvasTex(640, 448, (g, w, h) => {
      rr(g, 0, 0, w, h, 26, "#FBFCF8"); g.save(); g.beginPath(); g.roundRect(0, 0, w, h, 26); g.clip();
      g.fillStyle = "#E1E8DF"; g.fillRect(0, 0, w, 66); g.restore();
      ["#E07A5F", "#F3DE7A", "#4DB860"].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(36 + i * 34, 33, 11, 0, Math.PI * 2); g.fill(); });
      g.fillStyle = "#2F7A3C"; g.font = F(900, 32); g.textBaseline = "middle"; g.textAlign = "center"; g.fillText("Granola", w / 2, 34);
      [0, 1, 2].forEach((i) => rr(g, 56, 100 + i * 36, [420, 340, 380][i], 18, 9, "#D3DBD1"));
      rr(g, 56, 232, 528, 150, 22, "#DDEDF5"); g.strokeStyle = "#6FB6D9"; g.lineWidth = 5; g.beginPath(); g.roundRect(58, 234, 524, 146, 20); g.stroke();
      g.fillStyle = "#2E6F94"; g.font = F(900, 50); g.textAlign = "left"; g.fillText("会议链接", 96, 288);
      g.font = F(500, 28); g.fillStyle = "#5E8CA6"; g.fillText("点一下就打开", 96, 340);
    });
    const evilTex = canvasTex(640, 448, (g, w, h) => {
      rr(g, 0, 0, w, h, 26, "#F7DDD1"); g.save(); g.beginPath(); g.roundRect(0, 0, w, h, 26); g.clip();
      g.fillStyle = "#C2410C"; g.fillRect(0, 0, w, 66); g.restore();
      g.fillStyle = "#FFFFFF"; g.font = F(900, 32); g.textBaseline = "middle"; g.textAlign = "center"; g.fillText("攻击者网页", w / 2, 34);
      g.fillStyle = "#C2410C"; g.beginPath(); g.moveTo(w / 2, 104); g.lineTo(w / 2 + 86, 254); g.lineTo(w / 2 - 86, 254); g.closePath(); g.fill();
      g.fillStyle = "#FFFFFF"; g.font = F(900, 92); g.fillText("!", w / 2, 196);
      [0, 1].forEach((i) => rr(g, 120, 296 + i * 44, [400, 300][i], 22, 11, "#E9B39C"));
    });
    const WW = 2.3, WH = 1.6;
    const makeWindow = (tex, bodyMat) => {
      const g = new THREE.Group(); g.quaternion.copy(qFace); G.add(g);
      const body = kit.rbox(WW, WH, 0.06, 0.05, bodyMat); g.add(body);
      const face = facePlane(WW * 0.98, WH * 0.98, tex); face.position.z = 0.032; g.add(face);
      return { g, body, face };
    };
    const evil = makeWindow(evilTex, kit.clay(0xE9B39C, 0.8)); const EVIL_POS = P(2.0, 1.35, -0.75); evil.g.position.copy(EVIL_POS);
    const appWin = makeWindow(appTex, M.card);
    const appFace2 = facePlane(WW * 0.98, WH * 0.98, evilTex, { opacity: 0 }); appFace2.position.z = 0.034; appWin.g.add(appFace2);
    const WIN_A = P(0.25, 1.2, 0.55), WIN_B = EVIL_POS.clone().addScaledVector(viewDir, 0.3);
    // the cable: rebuilt each frame because the window moves
    const cableMat = kit.clay(C.dark, 0.6, { emissive: C.signal, emissiveIntensity: 0 });
    const cable = kit.shadowed(new THREE.Mesh(new THREE.BufferGeometry(), cableMat)); G.add(cable);
    const plug = kit.rbox(0.18, 0.14, 0.14, 0.04, M.darker); G.add(plug);
    const sparkMat = kit.clay(C.signal, 0.4, { emissive: 0xFF6A1F, emissiveIntensity: 0.9 });
    const sr = kit.rng(909), sparks = [];
    for (let i = 0; i < 12; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), sparkMat); G.add(s);
      const th = sr() * Math.PI * 2; sparks.push({ s, d: P(Math.cos(th) * 0.7, 0.6 + sr() * 0.8, Math.sin(th) * 0.7), off: sr(), atWin: i % 2 });
    }
    // cursor arrow + click ripple
    const arrow = new THREE.Shape(); [[0, 0], [0, -0.62], [0.15, -0.48], [0.27, -0.73], [0.38, -0.68], [0.26, -0.44], [0.46, -0.43]].forEach(([x, y], i) => (i ? arrow.lineTo(x, y) : arrow.moveTo(x, y))); arrow.closePath();
    const cursor = kit.shadowed(new THREE.Mesh(new THREE.ExtrudeGeometry(arrow, { depth: 0.06, bevelEnabled: true, bevelSize: 0.025, bevelThickness: 0.02, bevelSegments: 2 }), M.darker)); G.add(cursor);
    const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 48), kit.flat(C.signal, { transparent: true, depthWrite: false })); G.add(ripple);

    // ================= zone 3 · the lawsuit: gavel and two default toggles =================
    const court = new THREE.Group(); court.position.set(3.3, 0, 1.1); court.rotation.y = 0.2; G.add(court);
    const c1 = kit.rbox(1.7, 0.22, 1.1, 0.08, M.wood); c1.position.y = 0.11;
    const c2 = kit.rbox(1.35, 0.2, 0.85, 0.07, M.white); c2.position.y = 0.32;
    const block = kit.cyl(0.32, 0.34, 0.14, kit.clay(0x9C7F5B, 0.7), 32); block.position.set(-0.25, 0.49, 0);
    court.add(c1, c2, block);
    const gavel = new THREE.Group(); gavel.position.set(0.55, 0.72, 0.05); court.add(gavel);
    const gHandle = kit.cyl(0.045, 0.05, 0.85, kit.clay(0x8A6A48, 0.7), 12); gHandle.rotation.z = Math.PI / 2; gHandle.position.x = -0.42;
    const gHead = kit.cyl(0.17, 0.17, 0.58, kit.clay(0x7A5A3A, 0.6), 28); gHead.rotation.x = Math.PI / 2; gHead.position.x = -0.8;
    const gBand1 = kit.cyl(0.18, 0.18, 0.05, gold, 28); gBand1.rotation.x = Math.PI / 2; gBand1.position.set(-0.8, 0, 0.2);
    const gBand2 = gBand1.clone(); gBand2.position.z = -0.2;
    gavel.add(gHandle, gHead, gBand1, gBand2);
    const thud = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.03, 8, 48), kit.flat(0x8A6A48, { transparent: true, depthWrite: false })); thud.rotation.x = -Math.PI / 2; G.add(thud);
    G.updateMatrixWorld(true);
    const THUD = toL(block.getWorldPosition(new THREE.Vector3())).add(P(0, 0.08, 0));
    // people who don't know they're being transcribed
    const pawns = [P(6.35, 0, 1.05), P(5.85, 0, 1.6)].map((p, i) => {
      const g = new THREE.Group(); g.position.copy(p); G.add(g);
      const b = kit.cyl(0.16, 0.26, 0.55, M.them, 24); b.position.y = 0.28;
      const h = kit.sphere(0.2, M.them); h.position.y = 0.72;
      g.add(b, h); g.rotation.y = -0.4 - i * 0.3; return g;
    });
    // the toggle board
    const board = new THREE.Group(); board.position.set(5.0, 0, -0.75); board.rotation.y = FACE; G.add(board);
    const plate = kit.rbox(3.2, 2.15, 0.16, 0.1, M.dark); plate.position.y = 1.4; board.add(plate);
    [-1.1, 1.1].forEach((x) => { const f = kit.rbox(0.3, 0.32, 0.6, 0.06, M.dark); f.position.set(x, 0.16, 0); board.add(f); });
    const rowTex = (main, sub) => canvasTex(768, 200, (g, w, h) => {
      rr(g, 0, 0, w, h, 22, "#FBFCF8");
      g.fillStyle = "#17221C"; g.font = F(900, 66); g.textBaseline = "top"; g.fillText(main, 40, 34);
      g.fillStyle = "#5E6963"; g.font = F(500, 32); g.fillText(sub, 42, 122);
    });
    const makeRow = (y, main, sub) => {
      const r = new THREE.Group(); r.position.set(0, 1.4 + y, 0.1); board.add(r);
      const c = kit.card(2.95, 0.77, rowTex(main, sub), { depth: 0.06 }); r.add(c);
      const trackMat = kit.clay(C.themLight, 0.5, { emissive: C.signal, emissiveIntensity: 0 });
      const track = kit.rbox(0.92, 0.44, 0.12, 0.2, trackMat); track.position.set(0.92, 0, 0.08); r.add(track);
      const knob = kit.sphere(0.18, M.white); knob.scale.z = 0.6; knob.position.set(0.68, 0, 0.17); r.add(knob);
      return { r, trackMat, knob };
    };
    const row1 = makeRow(0.47, "提醒参会者", "告诉对方：正在转写");
    const row2 = makeRow(-0.47, "用数据训练", "拿会议内容训练模型");
    G.updateMatrixWorld(true);
    const ROW1 = row1.r.localToWorld(P(0.92, 0, 0.2)), ROW2 = row2.r.localToWorld(P(0.92, 0, 0.2));

    const tags = {
      y25: tag("二零二五年", "dark"),
      key: tag("转写服务钥匙<small>藏在接口里</small>", "signal"),
      users: tag("约 300 位内测用户<small>的转写</small>", "big"),
      y26: tag("二零二六年", "dark"),
      wire: tag("系统通道<small>还连着</small>", "signal"),
      suit: tag("官司", "dark"),
      unaware: tag("不知道在被转写", "them"),
      off: tag("默认：关", "them"),
      on: tag("默认：开", "signal"),
    };
    const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _m = new THREE.Matrix4();

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 5.6, L(0, 1.0, 0.3)], [T.y25 - 0.3, 5.4, L(-0.2, 1.0, 0.3)],
          [T.open + 0.4, 3.85, L(-4.7, 1.4, -0.3)], [T.users + 2.2, 4.0, L(-4.3, 1.75, -0.2)],
          [T.y26 + 1.2, 3.9, L(0.35, 1.3, -0.3)], [T.wire + 0.7, 4.0, L(0.6, 1.3, -0.3)],
          [T.suit + 0.6, 3.95, L(4.4, 1.25, -0.1)], [T.off, 3.85, L(4.75, 1.35, -0.4)], [ctx.dur, 3.8, L(4.9, 1.4, -0.5)],
        ]);
        camera.updateMatrixWorld();   // tags project with this frame's camera, not the last one
        // intro cones: pop on "风险", sink as their vignette starts
        [T.y25, T.y26, T.trouble].forEach((end, i) => {
          const k = pop(t, T.cones + i * 0.18, 0.45) * (1 - smooth(ramp(t, end - 0.3, 0.5)));
          cones[i].visible = k > 0.002; cones[i].scale.setScalar(Math.max(0.0001, k));
          cones[i].rotation.y = Math.sin(t * 2 + i) * 0.15;
        });

        // ---- zone 1 ----
        const boxK = pop(t, T.y25, 0.5); box.scale.setScalar(boxK); box.visible = t > T.y25 - 0.05;
        flaps.forEach(([h, ax, ang], i) => { h.rotation[ax] = ang * outBack(ramp(t, T.open + 0.1 + i * 0.12, 0.55)); });
        bot.visible = t > T.researcher - 0.4;
        const botIn = outCubic(ramp(t, T.researcher - 0.4, 1.0));
        const hop = Math.abs(Math.sin((t - T.researcher) * 7)) * 0.3 * (1 - ramp(t, T.researcher + 0.5, 0.3));
        bot.position.set(lerp(-2.5, -3.85, botIn), hop, lerp(-2.2, -0.85, botIn));
        bot.scale.setScalar(Math.max(0.0001, 0.95 * pop(t, T.researcher - 0.4, 0.5)));
        const look = ramp(t, T.api, 0.6);
        bot.rotation.y = lerp(-0.75, -0.3, look) + Math.sin(t * 1.3) * 0.08;
        bot.userData.head.rotation.x = -0.25 * look;
        bot.userData.arms[0].rotation.x = -1.1 * ramp(t, T.researcher + 0.4, 0.4);
        mag.position.set(-0.3 + Math.sin(t * 1.7) * 0.12 * (1 - look), 0.85 + 0.45 * look + Math.sin(t * 2.3) * 0.05, 0.8);
        mag.rotation.set(-0.15 - 0.3 * look, 0.55, Math.sin(t * 1.7) * 0.2);
        mag.scale.setScalar(pop(t, T.researcher + 0.3, 0.4));

        const envK = smooth(ramp(t, T.api, 0.9));
        env.visible = t > T.api; env.scale.setScalar(Math.max(0.0001, outBack(ramp(t, T.api, 0.6))));
        env.position.set(ENV_POS.x, lerp(0.7, ENV_POS.y, envK) + Math.sin(t * 2) * 0.05 * envK, ENV_POS.z);
        env.rotation.z = Math.sin(t * 1.6) * 0.04;
        envHinge.rotation.x = 2.75 * smooth(ramp(t, T.api + 0.9, 0.5));
        // key: rises out of the envelope, flies to the vault, turns
        const rise = outCubic(ramp(t, T.hid, 1.0)), fly = inOutQ(ramp(t, T.users - 0.35, 0.75)), turn = smooth(ramp(t, T.users + 0.45, 0.35));
        key.visible = t > T.hid;
        key.scale.setScalar(Math.max(0.0001, 1.25 * outBack(ramp(t, T.hid, 0.5)) * (1 - smooth(ramp(t, T.users + 0.75, 0.3)))));
        const keyUp = ENV_POS.clone().add(P(0, 0.35 + 0.75 * rise + Math.sin(t * 2.4) * 0.05 * (1 - fly), 0.05));
        const keyIn = KEYHOLE.clone().addScaledVector(doorN, 0.9);
        key.position.lerpVectors(keyUp, keyIn, fly).add(P(0, Math.sin(fly * Math.PI) * 0.8, 0));
        _v.lerpVectors(keyUp.clone().add(P(0, 2, 0)).addScaledVector(doorN, 0.4), KEYHOLE, smooth(clamp(fly * 1.4)));
        key.lookAt(W(_v));
        key.rotateZ((1 - fly) * t * 1.5 + turn * Math.PI / 2);
        gold.emissiveIntensity = 0.2 + 0.35 * window01(t, T.key, T.users + 1.2, 0.3) * (0.6 + 0.4 * Math.sin(t * 6));
        vault.visible = t > T.users - 0.75; vault.scale.setScalar(pop(t, T.users - 0.75, 0.5));
        doorHinge.rotation.y = -1.85 * outBack(ramp(t, T.users + 0.8, 0.6)) * (1 - smooth(ramp(t, T.y26 + 0.9, 0.5)));
        dial.rotation.z = turn * Math.PI * 1.5;
        tCards.forEach((c, i) => {
          const k = outCubic(ramp(t, T.users + 1.05 + i * 0.12, 0.7)) * (1 - inOutQ(ramp(t, T.y26 + 0.1 + (4 - i) * 0.08, 0.7)));
          c.visible = vault.visible;
          c.position.lerpVectors(cardStart[i], cardEnd[i], k).add(P(0, Math.sin(t * 2 + i) * 0.04 * k, 0));
          c.quaternion.slerpQuaternions(qFlat, cardQ[i], k);
          c.scale.setScalar(Math.max(0.0001, vault.scale.x * (0.85 + 0.15 * k)));
        });

        // ---- zone 2 ----
        const lapK = pop(t, T.y26, 0.5); lap.group.visible = t > T.y26 - 0.05; lap.group.scale.setScalar(lapK);
        lap.hinge.rotation.x = lerp(1.2, -0.22, smooth(ramp(t, T.y26 + 0.1, 0.7)));
        const winK = pop(t, T.y26 + 0.3, 0.5); appWin.g.visible = t > T.y26 + 0.25;
        const slide = inOutQ(ramp(t, T.jump - 0.15, 1.1));
        appWin.g.position.lerpVectors(WIN_A, WIN_B, slide).add(P(0, Math.sin(slide * Math.PI) * 0.45 + Math.sin(t * 1.8) * 0.04, 0));
        appWin.g.scale.setScalar(winK);
        appWin.g.rotation.z = Math.sin(slide * Math.PI) * -0.08;
        const evilK = pop(t, T.win - 0.1, 0.5); evil.g.visible = t > T.win - 0.15; evil.g.scale.setScalar(evilK);
        evil.g.position.copy(EVIL_POS).add(P(0, Math.sin(t * 1.5) * 0.03, 0));
        appFace2.material.opacity = smooth(ramp(t, T.attacker - 0.2, 0.5));
        // cable from the laptop port to the window's lower-left corner
        const growK = smooth(ramp(t, T.y26 + 0.7, 0.9));
        cable.visible = growK > 0.01; plug.visible = cable.visible;
        if (cable.visible) {
          G.updateMatrixWorld(true);
          const anchor = toL(appWin.g.localToWorld(P(-WW / 2 + 0.25, -WH / 2 + 0.05, -0.05)));
          const dx = anchor.x - PORT.x, dz = anchor.z - PORT.z;
          const curve = new THREE.CatmullRomCurve3([
            PORT.clone(), PORT.clone().add(P(0.3, -0.02, 0.1)), P(PORT.x + dx * 0.5, 0.07, PORT.z + dz * 0.5 + 0.35),
            P(anchor.x - 0.15, 0.1, anchor.z + 0.2), P(anchor.x, Math.max(0.3, anchor.y - 0.35), anchor.z), anchor,
          ], false, "catmullrom", 0.4);
          cable.geometry.dispose(); cable.geometry = new THREE.TubeGeometry(curve, 64, 0.06, 10, false);
          cable.geometry.setDrawRange(0, Math.floor(growK * 64) * 60);
          plug.position.copy(anchor); plug.quaternion.copy(appWin.g.quaternion); plug.scale.setScalar(appWin.g.scale.x);
          cable.userData.mid = curve.getPointAt(0.45);
          sparks.forEach(({ s, d, off, atWin }) => {
            const ph = (((t - T.wire) * 1.5 + off) % 1 + 1) % 1, o = atWin ? anchor : PORT;
            s.visible = t > T.wire; s.position.set(o.x + d.x * ph * 0.6, o.y + d.y * ph * 0.7 - ph * ph * 0.5, o.z + d.z * ph * 0.6);
            s.scale.setScalar(Math.max(0.0001, 0.09 * (1 - ph) * ramp(t, T.wire, 0.3)));
          });
        } else sparks.forEach(({ s }) => (s.visible = false));
        cableMat.emissiveIntensity = ramp(t, T.wire, 0.4) * (0.35 + 0.25 * Math.sin(t * 9));
        // cursor glides in, clicks the link card
        const curIn = outCubic(ramp(t, T.found, 1.4)), press = window01(t, T.link + 0.45, T.link + 0.6, 0.08);
        G.updateMatrixWorld(true);
        const linkP = toL(appWin.g.localToWorld(P(0.05, -0.42, 0.12)));
        cursor.visible = t > T.found && t < T.jump + 0.9;
        cursor.quaternion.copy(qFace);
        cursor.position.copy(linkP).addScaledVector(camRight, (1 - curIn) * 1.6).add(P(0, (1 - curIn) * -0.7 - press * 0.05, 0));
        cursor.scale.setScalar(Math.max(0.0001, pop(t, T.found, 0.4) * (1 - 0.2 * press) * (1 - ramp(t, T.jump + 0.4, 0.4))));
        const rp = ramp(t, T.link + 0.5, 0.6);
        ripple.visible = rp > 0 && rp < 1; ripple.position.copy(linkP); ripple.quaternion.copy(qFace);
        ripple.scale.setScalar(0.4 + rp * 1.6); ripple.material.opacity = (1 - rp) * 0.9;

        // ---- zone 3 ----
        const courtK = pop(t, T.trouble + 0.3, 0.5); court.visible = t > T.trouble + 0.25; court.scale.setScalar(courtK);
        const strike = (a) => { const u = t - a; return u < 0 ? 0 : u < 0.12 ? u / 0.12 : Math.max(0, 1 - (u - 0.12) / 0.35); };
        const hit = Math.max(strike(T.suit + 0.15), strike(T.suit + 0.75));
        gavel.rotation.z = -0.85 * (1 - hit) * ramp(t, T.trouble + 0.5, 0.4);
        const th = Math.max(ramp(t, T.suit + 0.27, 0.5) * (t < T.suit + 0.77 ? 1 : 0), ramp(t, T.suit + 0.87, 0.5));
        thud.visible = t > T.suit + 0.27 && th < 1; thud.position.copy(THUD); thud.scale.setScalar(0.5 + th * 1.6); thud.material.opacity = (1 - th) * 0.8;
        pawns.forEach((p, i) => {
          p.visible = t > T.unaware - 0.1; p.scale.setScalar(pop(t, T.unaware - 0.1 + i * 0.15, 0.45));
          p.position.y = Math.abs(Math.sin(t * 2.2 + i * 1.3)) * 0.06;
        });
        const boardK = pop(t, T.unaware + 0.4, 0.5); board.visible = t > T.unaware + 0.35; board.scale.setScalar(boardK);
        row1.r.scale.setScalar(pop(t, T.remind - 0.2, 0.45)); row2.r.scale.setScalar(pop(t, T.train - 0.1, 0.45));
        // toggle 1 stays OFF (a little shiver at "默认是关的"); toggle 2 flips ON at "默认是开的"
        const shiver = window01(t, T.off, T.off + 0.6, 0.1) * Math.sin(t * 40) * 0.025;
        row1.knob.position.x = 0.68 + shiver;
        row1.trackMat.emissiveIntensity = 0;
        const flip = outBack(ramp(t, T.on, 0.4));
        row2.knob.position.x = lerp(0.68, 1.16, flip);
        row2.trackMat.color.setHex(C.themLight).lerp(new THREE.Color(C.signal), clamp(flip));
        row2.trackMat.emissiveIntensity = clamp(flip) * (0.45 + 0.2 * Math.sin(t * 5));

        // ---- tags ----
        tags.y25.place(L(-5.3, 1.2, -0.4), window01(t, T.y25 + 0.2, T.open + 1.6), { dx: -270, dy: -150 });
        tags.key.place(() => W(key.position), ramp(t, T.key, 0.3) * (1 - ramp(t, T.users - 0.4, 0.3)), { dx: 50, dy: -50 });
        tags.users.place(W(cardEnd[4]), ramp(t, T.users + 1.4, 0.35) * (1 - ramp(t, T.y26 + 0.4, 0.4)), { dx: 40, dy: -40 });
        tags.y26.place(L(-1.1, 1.9, -0.85), window01(t, T.y26 + 0.2, T.link + 0.2), { dx: -120, dy: -150 });
        tags.wire.place(() => W(cable.userData.mid || PORT), ramp(t, T.wire, 0.3) * (1 - ramp(t, T.trouble + 0.3, 0.4)), { dx: -100, dy: 30 });
        tags.suit.place(W(THUD), window01(t, T.suit + 0.1, T.remind - 0.3), { dx: -60, dy: -170 });
        tags.unaware.place(W(pawns[1].position.clone().add(P(0, 0.95, 0))), window01(t, T.unaware + 0.2, T.train - 0.3), { dx: -250, dy: -70 });
        G.updateMatrixWorld(true);
        tags.off.place(row1.r.localToWorld(P(0.92, 0, 0.2)), ramp(t, T.off, 0.3), { dx: 120, dy: -30 });
        tags.on.place(row2.r.localToWorld(P(0.92, 0, 0.2)), ramp(t, T.on + 0.15, 0.3), { dx: 120, dy: -30, scale: 1 + 0.08 * Math.max(0, Math.sin((t - T.on) * 4)) * (1 - ramp(t, T.on + 1.5, 0.5)) });
      },
    };
    function inOutQ(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  },
};
