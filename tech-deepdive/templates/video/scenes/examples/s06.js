// 第 4 层 · 大模型 — the note machine has a swappable engine; new engines sit an exam, the winner goes in; no forging your own, the floor rises by itself.
export default {
  id: "s06",
  eyebrow: "第 4 层 · 大模型",
  headline: "考试合格，就换发动机",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;
    const FACE = Math.atan2(1, 1.15);

    const T = {
      model: at("写笔记的大模型") + 0.3, openai: at("OpenAI"), anth: at("Anthropic"), churn: at("一直在换"),
      fresh: at("新模型"), exam: at("考一遍试"), meet: at("真实的会议"), answer: at("标准答案"), score: at("分数高了"),
      swap: at("发动机换上去"), forge: at("不自己训练模型"), noForge: at("不自己训练模型") + 1.0, fast: at("进步太快"),
      wheel: at("造轮子"), lift: at("等平台变强"),
    };
    const texOf = (w, h, draw) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    };
    const rr = (g, x, y, w, h, r, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
    const font = (g, w, s) => { g.font = `${w} ${s}px "Clay Sans", sans-serif`; g.textBaseline = "middle"; };
    const check = (g, x, y, s, col) => { g.strokeStyle = col; g.lineWidth = s * 0.22; g.lineCap = "round"; g.lineJoin = "round"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + s * 0.38, y + s * 0.38); g.lineTo(x + s, y - s * 0.45); g.stroke(); };

    kit.desk(group);

    // ---------- elevator platform + the note machine ----------
    const M0 = P(-0.1, 0, -0.35);
    const base = kit.rbox(3.7, 0.08, 2.9, 0.04, M.dark); base.position.set(M0.x, 0.04, M0.z); group.add(base);
    const lift = new THREE.Group(); lift.position.copy(M0); group.add(lift);
    const deck = kit.rbox(3.7, 0.22, 2.9, 0.08, M.mid); lift.add(deck);
    const scissors = [];
    [-1.3, 1.3].forEach((z) => [1, -1].forEach((s) => { const b = kit.rbox(2.6, 0.09, 0.09, 0.03, M.aluDark); b.position.set(M0.x, 0, M0.z + z); b.userData.s = s; group.add(b); scissors.push(b); }));
    const machine = new THREE.Group(); lift.add(machine);
    const body = kit.rbox(2.6, 1.6, 1.8, 0.18, M.white); body.position.y = 0.8; machine.add(body);
    const screenTex = texOf(600, 300, (g, w, h) => {
      rr(g, 0, 0, w, h, 22, "#1E2622"); font(g, 900, 46); g.fillStyle = "#F4F7F2"; g.textAlign = "left"; g.fillText("会议笔记", 36, 58);
      [[110, 380, "#4DB860"], [160, 470, "#8D9791"], [210, 300, "#8D9791"], [255, 420, "#8D9791"]].forEach(([y, wd, c]) => rr(g, 36, y - 10, wd, 20, 10, c));
    });
    const screen = kit.card(1.5, 0.75, screenTex, { depth: 0.05, mat: M.darker }); screen.position.set(-0.35, 0.95, 0.91); machine.add(screen);
    const ledMats = [0, 1, 2].map(() => kit.clay(0x55615A, 0.4, { emissive: 0x000000, emissiveIntensity: 1 }));
    ledMats.forEach((m, i) => { const l = kit.sphere(0.08, m); l.scale.z = 0.5; l.position.set(0.62 + i * 0.22, 0.38, 0.91); machine.add(l); });
    const lampMat = kit.clay(0xD8DDD9, 0.35, { emissive: 0xF3DE7A, emissiveIntensity: 0.5 });
    const lamp = kit.sphere(0.16, lampMat); lamp.position.set(-0.95, 1.72, 0.55); machine.add(lamp);
    const lampBase = kit.cyl(0.14, 0.17, 0.1, M.dark, 20); lampBase.position.set(-0.95, 1.62, 0.55); machine.add(lampBase);
    const slotTop = kit.rbox(1.25, 0.08, 0.72, 0.03, M.darker); slotTop.position.set(0.25, 1.6, 0); machine.add(slotTop);
    const outSlot = kit.rbox(0.05, 0.12, 1.0, 0.02, M.darker); outSlot.position.set(1.31, 0.55, 0); machine.add(outSlot);
    const tray = kit.rbox(0.9, 0.08, 1.1, 0.04, M.wood); tray.position.set(1.85, 0.04 + 0.11, 0); lift.add(tray);
    const noteTex = texOf(256, 192, (g, w, h) => { rr(g, 0, 0, w, h, 14, "#FBFCF8"); rr(g, 20, 26, 120, 20, 10, "#2F7A3C"); [70, 106, 142].forEach((y, i) => rr(g, 20, y, [200, 170, 120][i], 14, 7, "#B5BDB8")); });
    const notes = []; for (let i = 0; i < 6; i++) { const n = kit.card(0.62, 0.46, noteTex, { depth: 0.02 }); n.rotation.x = -Math.PI / 2; lift.add(n); notes.push(n); }
    const DECK_Y = 0.11;   // deck centre above the lift origin
    const liftH = (t) => 1.25 * smooth(ramp(t, T.lift + 0.1, 1.8));

    // ---------- engine cartridges ----------
    function cart(label, bodyMat, color = "#17221C", bg = "#FBFCF8") {
      const g = new THREE.Group();
      const b = kit.rbox(1.0, 1.15, 0.56, 0.1, bodyMat); b.position.y = 0.575; g.add(b);
      const grip = kit.rbox(0.6, 0.1, 0.3, 0.04, M.dark); grip.position.y = 1.17; g.add(grip);
      const lab = kit.card(0.88, 0.42, kit.textTexture([{ text: label, size: label.length > 4 ? 58 : 70, weight: 900, color }], { w: 400, h: 190, align: "center", pad: label.length > 4 ? 62 : 56, bg, radius: 16 }), { depth: 0.02 });
      lab.position.set(0, 0.74, 0.29); g.add(lab);
      const pins = kit.rbox(0.7, 0.08, 0.3, 0.02, M.alu); pins.position.y = 0.0; g.add(pins);
      group.add(g); return g;
    }
    const cOpen = cart("OpenAI", kit.clay(C.themLight, 0.6));
    const cAnth = cart("Anthropic", kit.clay(C.wood, 0.7));
    const cNew = cart("新模型", M.me, "#FFFFFF", "#2F7A3C");
    const SLOT = (t) => P(M0.x + 0.25, DECK_Y + liftH(t) + 1.6 - 0.42, M0.z);
    const SPOT_A = P(-2.95, 0.0, -1.05), SPOT_B = P(-2.3, 0.0, -2.55);
    const PAD = P(-2.75, 0, 1.35);
    const arc = (a, b, k, hump = 1.3) => P(lerp(a.x, b.x, k), lerp(a.y, b.y, k) + Math.sin(Math.PI * k) * hump, lerp(a.z, b.z, k));
    // a cartridge going into the slot rises high first, then drops straight in
    const intoSlot = (a, s, k) => { const up = s.clone(); up.y += 1.1; return k < 0.75 ? arc(a, up, k / 0.75, 0.9) : P(s.x, lerp(up.y, s.y, (k - 0.75) / 0.25), s.z); };
    const outOfSlot = (s, b, k) => { const up = s.clone(); up.y += 1.1; return k < 0.25 ? P(s.x, lerp(s.y, up.y, k / 0.25), s.z) : arc(up, b, (k - 0.25) / 0.75, 0.6); };

    // ---------- the exam: real meetings + the answer key + the score ----------
    const pad = kit.cyl(0.72, 0.78, 0.12, M.dark, 40); pad.position.set(PAD.x, 0.06, PAD.z); group.add(pad);
    const padRingMat = kit.clay(C.meLight, 0.4, { emissive: C.meLight, emissiveIntensity: 0.3 });
    const padRing = kit.torus(0.7, 0.04, padRingMat); padRing.rotation.x = Math.PI / 2; padRing.position.set(PAD.x, 0.13, PAD.z); group.add(padRing);
    const STACK = P(-4.35, 0, 0.55);
    const stackG = new THREE.Group(); stackG.position.copy(STACK); group.add(stackG);
    for (let i = 0; i < 6; i++) { const s = kit.rbox(0.95, 0.045, 0.72, 0.015, M.card); s.position.set(((i * 37) % 7 - 3) * 0.012, 0.03 + i * 0.05, 0); s.rotation.y = ((i * 53) % 9 - 4) * 0.02; stackG.add(s); }
    const meetTex = (n) => texOf(320, 240, (g, w, h) => {
      rr(g, 0, 0, w, h, 16, "#FBFCF8"); font(g, 900, 40); g.fillStyle = "#17221C"; g.textAlign = "left"; g.fillText("会议 " + n, 24, 42);
      [92, 130, 168, 206].forEach((y, i) => rr(g, 24, y - 8, [250, 200, 230, 150][i], 16, 8, "#C9D0CB"));
    });
    const sheets = [12, 37, 58].map((n) => { const s = kit.card(1.0, 0.75, meetTex(n)); s.rotation.order = "YXZ"; group.add(s); return s; });
    const ansTex = texOf(400, 400, (g, w, h) => {
      rr(g, 0, 0, w, h, 24, "#FBFCF8"); rr(g, 0, 0, w, 96, [24, 24, 0, 0], "#2F7A3C");
      font(g, 900, 56); g.fillStyle = "#FFFFFF"; g.textAlign = "center"; g.fillText("标准答案", w / 2, 50);
      [150, 230, 310].forEach((y) => { check(g, 40, y, 44, "#2F7A3C"); rr(g, 110, y - 12, 240, 22, 11, "#C9D0CB"); });
    });
    const answer = kit.card(1.15, 1.15, ansTex); answer.rotation.order = "YXZ"; group.add(answer);
    const scoreTex = texOf(560, 300, (g, w, h) => {
      rr(g, 0, 0, w, h, 28, "#FFFFFF");
      g.textAlign = "left"; font(g, 900, 56); g.fillStyle = "#2F7A3C"; g.fillText("新", 34, 92); font(g, 900, 112); g.fillText("92", 100, 92);
      font(g, 900, 56); g.fillStyle = "#8D9791"; g.fillText("旧", 294, 92); font(g, 900, 112); g.fillText("85", 360, 92);
      rr(g, 40, 190, 440, 30, 15, "#E3E8E4"); rr(g, 40, 190, 440 * 0.92, 30, 15, "#4DB860");
      rr(g, 40, 240, 440, 30, 15, "#E3E8E4"); rr(g, 40, 240, 440 * 0.85, 30, 15, "#8D9791");
    });
    const score = kit.card(1.9, 1.02, scoreTex, { depth: 0.05 }); score.rotation.order = "YXZ"; group.add(score);

    // ---------- the forge you don't build ----------
    const FORGE = P(-2.45, 0, 1.75);
    const forge = new THREE.Group(); forge.position.copy(FORGE); forge.rotation.y = 0.35; group.add(forge);
    const aBase = kit.rbox(0.7, 0.3, 0.55, 0.06, M.dark); aBase.position.y = 0.15; forge.add(aBase);
    const aWaist = kit.rbox(0.36, 0.3, 0.34, 0.04, M.dark); aWaist.position.y = 0.45; forge.add(aWaist);
    const aTop = kit.rbox(1.1, 0.24, 0.52, 0.06, M.dark); aTop.position.y = 0.7; forge.add(aTop);
    const horn = kit.shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.5, 20), M.dark)); horn.rotation.z = Math.PI / 2; horn.position.set(-0.78, 0.72, 0); forge.add(horn);
    const wheel = new THREE.Group(); wheel.position.set(0.1, 1.12, 0); forge.add(wheel);
    wheel.add(kit.torus(0.3, 0.06, M.wood));
    for (let i = 0; i < 4; i++) { const sp = kit.rbox(0.56, 0.04, 0.04, 0.01, M.wood); sp.rotation.z = i * Math.PI / 4; wheel.add(sp); }
    const hub = kit.cyl(0.07, 0.07, 0.1, M.mid, 16); hub.rotation.x = Math.PI / 2; wheel.add(hub);
    const hammer = new THREE.Group(); hammer.position.set(0.75, 0.85, 0.15); forge.add(hammer);
    const handle = kit.cyl(0.035, 0.035, 0.75, M.wood, 10); handle.position.set(-0.25, 0.25, 0); handle.rotation.z = 1.0; hammer.add(handle);
    const head = kit.rbox(0.18, 0.28, 0.16, 0.03, M.mid); head.position.set(-0.55, 0.45, 0); head.rotation.z = 1.0; hammer.add(head);
    const furnace = kit.rbox(0.7, 0.75, 0.6, 0.1, kit.clay(C.wood, 0.85)); furnace.position.set(-1.3, 0.375, -0.55); forge.add(furnace);
    const fireMat = kit.clay(C.signal, 0.4, { emissive: C.signal, emissiveIntensity: 0.9 });
    const fire = kit.rbox(0.34, 0.22, 0.04, 0.05, fireMat); fire.position.set(-1.3, 0.3, -0.24); forge.add(fire);
    const noSign = new THREE.Group(); group.add(noSign);
    const noMat = kit.flat(C.signal);
    const noBar = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.16, 0.05), noMat); noBar.rotation.z = -Math.PI / 4;
    noSign.add(new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 12, 64), noMat), noBar);

    const tags = {
      engine: tag("大模型<small>= 发动机</small>", "dark"),
      forge: tag("自己训练", "them"),
      rise: tag("等平台变强", "me big"),
    };
    const _q = new THREE.Quaternion();
    const swapK = (t) => smooth(ramp(t, T.swap, 1.6));

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 3.5, P(-0.1, 1.6, -0.3)], [T.anth, 3.8, P(-0.9, 1.6, -0.9)], [T.fresh + 0.4, 4.1, P(-1.4, 1.5, 0.0)],
          [T.exam + 0.3, 3.6, P(-2.6, 1.5, 0.9)], [T.score + 0.4, 3.7, P(-2.4, 1.9, 0.8)], [T.swap + 0.8, 4.0, P(-1.0, 1.9, 0.0)],
          [T.forge + 0.8, 4.0, P(-1.6, 1.4, 0.5)], [T.wheel, 3.9, P(-1.6, 1.4, 0.6)], [T.lift + 0.6, 4.3, P(-0.3, 2.1, 0.0)], [ctx.dur, 4.1, P(-0.2, 2.4, -0.1)],
        ]);
        const H = liftH(t), on = swapK(t);

        // the lift (flat until the platform gets stronger)
        lift.position.y = DECK_Y + H;
        scissors.forEach((b) => { const ang = Math.atan2(H + 0.05, 2.5); b.rotation.z = b.userData.s * ang; b.scale.x = Math.sqrt(2.5 * 2.5 + (H + 0.05) ** 2) / 2.5; b.position.y = 0.09 + (H + 0.05) / 2; b.visible = H > 0.02; });
        machine.scale.setScalar(1 + 0.012 * Math.max(0, Math.sin(t * (on > 0.5 ? 16 : 11))));

        // notes come out of the machine, a bit faster with the new engine
        const ph0 = t * 0.42 + Math.max(0, t - T.swap - 1.6) * 0.25;
        notes.forEach((n, i) => {
          const a = ((ph0 + i / notes.length) % 1 + 1) % 1, k = clamp(a / 0.45);
          n.visible = t > 0.4 && !(t > T.swap && t < T.swap + 1.4);
          n.position.set(1.32 + 0.55 * k, 0.55 - 0.36 * k * k + 0.03 + i * 0.004 * (k >= 1), lerp(0, ((i * 0.31) % 0.4) - 0.2, k));
          n.rotation.set(-Math.PI / 2, 0, (1 - k) * 0.3 + (i - 2.5) * 0.08 * k);
          n.scale.setScalar(Math.max(0.0001, pop(a * 2.4, 0, 0.3) * (1 - ramp(a, 0.85, 0.15))));
        });

        // engines: OpenAI in the slot, Anthropic waiting; they trade places; later the new one wins
        const churn = smooth(ramp(t, T.churn, 1.5));
        const outK = smooth(ramp(t, T.swap, 1.0)), inK = smooth(ramp(t, T.swap + 0.7, 1.1));
        cOpen.position.copy(churn < 1 ? outOfSlot(SLOT(t), SPOT_B, churn) : SPOT_B);
        cOpen.scale.setScalar(1 + 0.12 * window01(t, T.openai, T.openai + 0.6, 0.2));
        cAnth.visible = t > T.anth - 0.05;
        const anthPos = churn < 1 ? (churn > 0 ? intoSlot(SPOT_A, SLOT(t), churn) : SPOT_A) : SLOT(t);
        cAnth.position.copy(outK > 0 ? outOfSlot(SLOT(t), SPOT_A, outK) : anthPos);
        cAnth.scale.setScalar(pop(t, T.anth, 0.5) * (1 + 0.12 * window01(t, T.anth + 0.2, T.anth + 0.8, 0.2)));
        cNew.visible = t > T.fresh - 0.05;
        const padTop = P(PAD.x, 0.12, PAD.z);
        cNew.position.copy(inK > 0 ? intoSlot(padTop, SLOT(t), inK) : padTop);
        if (inK >= 1) cNew.position.copy(SLOT(t));
        cNew.scale.setScalar(pop(t, T.fresh, 0.55) * (1 + 0.06 * window01(t, T.meet, T.score, 0.3) * Math.sin(t * 8)));
        [cOpen, cAnth, cNew].forEach((c) => { c.rotation.y = 0.25; });

        // machine status: amber -> green when the new engine seats
        const seated = smooth(ramp(t, T.swap + 1.6, 0.3));
        lampMat.emissive.setHex(0xF3DE7A).lerp(new THREE.Color(0x4DB860), seated); lampMat.color.setHex(0xD8DDD9).lerp(new THREE.Color(0x8FE09B), seated);
        lampMat.emissiveIntensity = 0.5 + 0.6 * seated * (0.6 + 0.4 * Math.sin(t * 6)) + 0.6 * window01(t, T.swap + 1.6, T.swap + 2.1, 0.15);
        ledMats.forEach((m, i) => { const lit = seated * (Math.sin(t * 5 - i * 1.2) > -0.3 ? 1 : 0.35); m.color.setHex(0x55615A).lerp(new THREE.Color(0x4DB860), seated); m.emissive.setHex(0x2F7A3C); m.emissiveIntensity = lit * 0.9; });

        // the exam station
        const examK = pop(t, T.exam - 0.2, 0.5);
        pad.scale.setScalar(pop(t, T.fresh - 0.2, 0.5)); padRing.scale.setScalar(pad.scale.x);
        padRingMat.emissiveIntensity = 0.3 + 0.7 * window01(t, T.meet, T.swap, 0.3) * (0.5 + 0.5 * Math.sin(t * 8));
        stackG.scale.setScalar(examK);
        camera.getWorldQuaternion(_q);
        sheets.forEach((s, i) => {
          const a = T.meet + 0.1 + i * 0.45, k = clamp((t - a) / 1.1);
          s.visible = t > a && t < T.swap + 0.5;
          const from = P(STACK.x, 0.4, STACK.z), over = P(PAD.x - 0.15 + i * 0.12, 2.0 + i * 0.05, PAD.z - 0.2);
          s.position.copy(arc(from, over, outCubic(clamp(k * 1.3)), 0.6));
          s.rotation.set(-0.15, FACE + 0.1, (i - 1) * 0.08);
          s.scale.setScalar(Math.max(0.0001, outBack(clamp(k * 2)) * (1 - smooth(ramp(t, T.score - 0.1 + i * 0.1, 0.4)) * 0.0) * (1 - smooth(ramp(t, T.swap, 0.4)))));
        });
        answer.visible = t > T.answer - 0.05;
        answer.position.set(PAD.x - 1.45, 0.6 + 0.03 * Math.sin(t * 2), PAD.z + 1.25); answer.rotation.set(-0.12, FACE, 0);
        const examOut = smooth(ramp(t, T.swap + 1.5, 0.5));
        answer.scale.setScalar(Math.max(0.0001, pop(t, T.answer, 0.5) * (1 - examOut)));
        stackG.scale.setScalar(examK * (1 - examOut) + 0.0001);
        pad.scale.multiplyScalar(1 - examOut); pad.scale.addScalar(0.0001); padRing.scale.copy(pad.scale);
        score.visible = t > T.score - 0.05;
        score.position.set(PAD.x + 0.25, 3.35 + 0.04 * Math.sin(t * 2.2), PAD.z - 0.1); score.rotation.set(-0.1, FACE, 0);
        score.scale.setScalar(Math.max(0.0001, pop(t, T.score, 0.5) * (1 - smooth(ramp(t, T.swap + 1.2, 0.5)))));

        // the forge: crossed out, then put away
        const fk = pop(t, T.forge - 0.1, 0.55) * (1 - smooth(ramp(t, T.lift - 0.4, 0.6)));
        forge.scale.setScalar(fk + 0.0001);
        hammer.rotation.z = -0.5 * Math.max(0, Math.sin((t - T.forge) * 6)) * (1 - ramp(t, T.noForge, 0.3)) + 0.5 * window01(t, T.wheel, T.wheel + 1.2, 0.2) * Math.max(0, Math.sin(t * 9));
        wheel.rotation.z = -(t - T.forge) * 0.8;
        fireMat.emissiveIntensity = 0.7 + 0.3 * Math.sin(t * 13) * Math.sin(t * 5.3);
        const nk = outBack(ramp(t, T.noForge, 0.35));
        noSign.visible = t > T.noForge && fk > 0.01;
        noSign.position.set(FORGE.x + 0.3, 1.25, FORGE.z + 0.6); noSign.quaternion.copy(_q);
        noSign.scale.setScalar(Math.max(0.0001, 1.05 * nk * fk * (1 + 0.08 * window01(t, T.wheel, T.wheel + 0.6, 0.15))));

        // tags
        tags.engine.place(SLOT(t).add(P(0, 1.35, 0)), ramp(t, T.model, 0.3) * (1 - ramp(t, T.anth - 0.2, 0.4)), { dx: -110, dy: -70 });
        tags.forge.place(P(FORGE.x, 1.9, FORGE.z), ramp(t, T.forge + 0.3, 0.3) * (1 - ramp(t, T.lift - 0.4, 0.4)), { dx: 70, dy: -70 });
        tags.rise.place(P(M0.x + 1.85, 0.3 + H, M0.z + 1.45), ramp(t, T.lift + 0.2, 0.3), { dx: 20, dy: -10 });
      },
    };
  },
};
