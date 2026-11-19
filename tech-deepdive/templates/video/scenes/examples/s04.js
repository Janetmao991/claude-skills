// 第 3 层 · 转写 — two pipes feed a rented transcription factory; temp pass, real key at home, text kept, audio tossed, a tiny local factory.
export default {
  id: "s04",
  eyebrow: "第 3 层 · 转写",
  headline: "把声音变成文字",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;
    const FACE = Math.atan2(1, 1.15);   // yaw that turns a +z card toward the camera

    // beats, from the narration
    const T = {
      deep: at("Deepgram") - 0.2, asm: at("AssemblyAI") - 0.2,
      flip: at("随时可以切换") + 0.3, back: at("边说边出字") - 0.5,
      strips: at("边说边出字"), ticket: at("临时通行证") - 0.6, clock: at("有时效"), expire: at("过期作废"),
      key: at("真正的钥匙"), server: at("服务器"), belt: at("传送带") - 0.3,
      voice: at("声音呢"), toss: at("直接扔掉"), noArc: at("不存档"),
      lap: at("电脑里") - 0.2, mini: at("小工厂"), mb: at("两百多兆"), offline: at("离线"),
    };
    const lev = (t) => smooth(ramp(t, T.flip - 0.2, 0.35)) * (1 - smooth(ramp(t, T.back - 0.2, 0.35)));   // 0 = 主力, 1 = 备用
    const toBackup = (t) => t > T.flip && t < T.back;

    kit.desk(group);

    // ---------- a little factory: body, sawtooth roof, chimney, lit windows ----------
    function factory(w, h, d, bodyMat, roofMat, teeth) {
      const g = new THREE.Group();
      const body = kit.rbox(w, h, d, 0.1, bodyMat); body.position.y = h / 2; g.add(body);
      const s = w / teeth, rh = Math.min(0.55, s * 0.62), shape = new THREE.Shape();
      shape.moveTo(-w / 2, 0);
      for (let i = 0; i < teeth; i++) { shape.lineTo(-w / 2 + i * s, rh); shape.lineTo(-w / 2 + (i + 1) * s, 0); }
      shape.lineTo(-w / 2, 0);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d * 0.94, bevelEnabled: false }); geo.translate(0, 0, -d * 0.47);
      const roof = kit.shadowed(new THREE.Mesh(geo, roofMat)); roof.position.y = h - 0.01; g.add(roof);
      const chim = kit.cyl(0.13 * w / 2.6 + 0.06, 0.16 * w / 2.6 + 0.08, h * 0.75, M.mid, 24); chim.position.set(w * 0.3, h + h * 0.37, -d * 0.25); g.add(chim);
      const band = kit.torus(0.13 * w / 2.6 + 0.07, 0.03, M.signal); band.rotation.x = Math.PI / 2; band.position.set(w * 0.3, h + h * 0.62, -d * 0.25); g.add(band);
      const winMat = kit.clay(0xFFF3C4, 0.5, { emissive: 0xF3DE7A, emissiveIntensity: 0 });
      const nw = Math.max(2, Math.floor(w / 0.55)), ww = Math.min(0.34, w / nw * 0.6);
      for (let i = 0; i < nw; i++) {
        const x = -w / 2 + (i + 0.5) * (w / nw);
        if (Math.abs(x - (-w * 0.2)) < ww * 0.9) continue;             // leave room for the door
        const win = kit.rbox(ww, ww * 0.9, 0.04, 0.03, winMat); win.position.set(x, h * 0.62, d / 2 + 0.01); g.add(win);
      }
      const door = kit.rbox(w * 0.17, h * 0.45, 0.05, 0.03, M.dark); door.position.set(-w * 0.2, h * 0.225, d / 2 + 0.01); g.add(door);
      const sideWin = kit.rbox(0.04, ww * 0.9, ww, 0.03, winMat); sideWin.position.set(w / 2 + 0.01, h * 0.62, -d * 0.25); g.add(sideWin);
      return { g, winMat, top: P(w * 0.3, h + h * 0.75, -d * 0.25) };
    }
    function puffs(n, r) {
      const g = new THREE.Group(); group.add(g);
      for (let i = 0; i < n; i++) g.add(kit.sphere(r, M.white));
      g.render = (t, origin, amp, speed = 0.45) => g.children.forEach((p, i) => {
        const a = ((t * speed + i / n) % 1 + 1) % 1;
        p.position.set(origin.x + a * 0.35, origin.y + a * 1.3, origin.z - a * 0.15);
        p.scale.setScalar(Math.max(0.0001, Math.sin(Math.PI * a) * (0.5 + a) * amp));
      });
      return g;
    }

    // Deepgram (主力) and AssemblyAI (备用)
    const main = factory(2.6, 1.5, 2.2, M.white, M.dark, 4); main.g.position.set(-0.1, 0, -0.2); group.add(main.g);
    const spare = factory(1.7, 1.0, 1.4, kit.clay(C.alu, 0.6), M.mid, 3); spare.g.position.set(1.6, 0, -2.5); group.add(spare.g);
    const MAIN = (v) => v.clone().add(main.g.position), SPARE = (v) => v.clone().add(spare.g.position);
    const mainPuff = puffs(6, 0.2), sparePuff = puffs(5, 0.14);

    // ---------- pipes: Them / Me in from the left (continuity with s03), valve, two branches ----------
    const themGlass = kit.glass(0xA9B3AD), meGlass = kit.glass(0x5FB36E), brGlass = kit.glass(0xBFC9C2, 0.38), brGlass2 = kit.glass(0xBFC9C2, 0.38);
    const themIn = kit.pipe(group, [P(-5.3, 1.3, 2.7), P(-4.7, 1.25, 1.7), P(-3.95, 1.08, 0.75), P(-3.3, 1.0, 0.32)], themGlass);
    const meIn = kit.pipe(group, [P(-4.5, 1.3, 3.4), P(-4.0, 1.25, 2.4), P(-3.55, 1.08, 1.3), P(-3.3, 1.0, 0.6)], meGlass);
    const mainBr = kit.pipe(group, [P(-2.75, 1.0, 0.42), P(-2.2, 0.95, 0.2), P(-1.75, 0.9, 0.0), P(-1.3, 0.9, -0.05)], brGlass, 0.2);
    const spareBr = kit.pipe(group, [P(-3.0, 1.25, 0.05), P(-3.05, 1.75, -0.9), P(-2.0, 1.95, -2.2), P(-0.5, 1.55, -2.55), P(0.82, 0.6, -2.5)], brGlass2, 0.2);
    const themBeads = kit.beads(group, 12, M.themDot), meBeads = kit.beads(group, 12, M.meDot);
    function mixed(n, r = 0.12) {
      const g = new THREE.Group(); group.add(g);
      for (let i = 0; i < n; i++) g.add(new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), i % 2 ? M.meDot : M.themDot));
      // a bead on this branch was let in when it entered: visible only if the valve pointed here at that moment
      g.flow = (curve, t, start, speed, open) => g.children.forEach((b, i) => {
        const ph = (((t - start) * speed + i / n) % 1 + 1) % 1, entered = t - ph / speed;
        b.visible = entered > start && open(entered);
        curve.getPointAt(ph, b.position);
        b.scale.setScalar(0.85 + 0.15 * Math.sin(i * 1.7 + t * 6));
      });
      return g;
    }
    const mainBeads = mixed(6), spareBeads = mixed(14);
    const valve = new THREE.Group(); valve.position.set(-3.0, 1.0, 0.45); group.add(valve);
    valve.add(kit.rbox(0.7, 0.7, 0.9, 0.14, M.dark));
    const lever = new THREE.Group(); lever.position.y = 0.33; valve.add(lever);
    const stick = kit.cyl(0.045, 0.045, 0.75, M.alu, 12); stick.position.y = 0.37; lever.add(stick);
    const knob = kit.sphere(0.13, M.signal); knob.position.y = 0.78; lever.add(knob);
    const pivot = kit.cyl(0.12, 0.12, 0.5, M.mid, 20); pivot.rotation.z = Math.PI / 2; pivot.position.y = 0.33; valve.add(pivot);

    // ---------- gate: guard booth + barrier, the temporary pass ----------
    const booth = new THREE.Group(); booth.position.set(-2.15, 0, 2.05); booth.rotation.y = 0.3; group.add(booth);
    const hut = kit.rbox(0.8, 1.05, 0.8, 0.1, M.white); hut.position.y = 0.525; booth.add(hut);
    const hutRoof = kit.rbox(1.0, 0.14, 1.0, 0.06, M.dark); hutRoof.position.y = 1.12; booth.add(hutRoof);
    const hutWin = kit.rbox(0.5, 0.36, 0.04, 0.04, M.darker); hutWin.position.set(0, 0.7, 0.41); booth.add(hutWin);
    const hutLamp = kit.sphere(0.09, kit.clay(C.signal, 0.4, { emissive: C.signal, emissiveIntensity: 0.2 })); hutLamp.position.y = 1.26; booth.add(hutLamp);
    const post = kit.cyl(0.08, 0.1, 0.65, M.dark, 16); post.position.set(-1.55, 0.325, 1.62); group.add(post);
    const arm = new THREE.Group(); arm.position.set(-1.55, 0.6, 1.62); group.add(arm);
    for (let i = 0; i < 5; i++) { const seg = kit.rbox(0.34, 0.1, 0.1, 0.03, i % 2 ? M.white : M.signal); seg.position.x = 0.2 + i * 0.34; arm.add(seg); }

    const passTex = kit.textTexture([{ text: "临时通行证", size: 66, weight: 900 }, { text: "有时效 · 用完就换", size: 34, weight: 500, color: "#5E6963" }], { w: 640, h: 256, pad: 40 });
    const pass = new THREE.Group(); group.add(pass);
    const passMat = kit.clay(C.paperCard, 0.85);
    const passCard = kit.card(2.0, 0.8, passTex, { depth: 0.05, mat: passMat }); pass.add(passCard);
    const passFace = passCard.children[1].material;
    const clock = new THREE.Group(); clock.position.set(0.62, 0, 0.04); pass.add(clock);
    const clockFace = new THREE.Mesh(new THREE.CircleGeometry(0.26, 40), kit.clay(0xFFFFFF, 0.6)); clock.add(clockFace);
    const clockRim = kit.torus(0.26, 0.03, M.dark); clock.add(clockRim);
    const hand = new THREE.Group(); hand.position.z = 0.02; clock.add(hand);
    const handBar = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.02), kit.flat(C.signal)); handBar.position.y = 0.09; hand.add(handBar);
    const hand2 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.13, 0.02), kit.flat(C.ink)); hand2.position.y = 0.06; hand2.rotation.z = -2.1; clock.add(hand2);
    const stampTex = kit.textTexture([{ text: "已过期", size: 70, weight: 900, color: "#C2410C" }], { w: 300, h: 124, bg: null, pad: 22, align: "center", border: "#C2410C" });
    const stamp = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.39), kit.flat(0xffffff, { map: stampTex, transparent: true, depthWrite: false })); stamp.position.set(-0.3, -0.04, 0.06); stamp.rotation.z = 0.22; pass.add(stamp);

    // ---------- Granola server with the real key in a safe ----------
    const server = new THREE.Group(); server.position.set(3.95, 0, -2.3); group.add(server);
    const rack = kit.rbox(1.2, 2.4, 1.1, 0.1, M.dark); rack.position.y = 1.2; server.add(rack);
    const ledOn = kit.flat(0x6CE07E), ledOff = kit.flat(0x55615A), leds = [];
    [2.05, 1.77, 1.49].forEach((y) => {
      const bay = kit.rbox(0.92, 0.2, 0.04, 0.03, M.darker); bay.position.set(0, y, 0.56); server.add(bay);
      for (let k = 0; k < 3; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.02), ledOff); l.position.set(0.24 + k * 0.1, y, 0.585); server.add(l); leds.push(l); }
    });
    const vault = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.84), kit.flat(0x161C19)); vault.position.set(0, 0.62, 0.553); server.add(vault);
    const door = new THREE.Group(); door.position.set(-0.43, 0.62, 0.6); server.add(door);
    const doorSlab = kit.rbox(0.86, 0.86, 0.08, 0.04, M.aluDark); doorSlab.position.x = 0.43; door.add(doorSlab);
    const dial = kit.torus(0.13, 0.035, M.mid); dial.position.set(0.48, 0, 0.05); door.add(dial);
    const dialKnob = kit.cyl(0.06, 0.06, 0.06, M.dark, 16); dialKnob.rotation.x = Math.PI / 2; dialKnob.position.set(0.48, 0, 0.06); door.add(dialKnob);
    const goldMat = kit.clay(0xE2B33C, 0.35, { emissive: 0x8A5A00, emissiveIntensity: 0.25 });
    const key = new THREE.Group(); key.position.set(0, 0.62, 0.66); server.add(key);
    const bow = kit.torus(0.13, 0.045, goldMat); bow.position.x = -0.24; key.add(bow);
    const shaft = kit.cyl(0.035, 0.035, 0.42, goldMat, 12); shaft.rotation.z = Math.PI / 2; shaft.position.x = 0.07; key.add(shaft);
    [0.17, 0.26].forEach((x, i) => { const tooth = kit.rbox(0.05, 0.11 - i * 0.03, 0.05, 0.015, goldMat); tooth.position.set(x, -0.07, 0); key.add(tooth); });
    server.updateMatrixWorld(true);

    // ---------- conveyor belt carrying text strips out to a tray ----------
    const BX0 = 1.25, BX1 = 4.75, BZ = -0.2, BY = 0.56;
    const belt = new THREE.Group(); belt.position.set(BX0, 0, BZ); group.add(belt);
    const frame = kit.rbox(BX1 - BX0, 0.16, 0.8, 0.06, M.dark); frame.position.set((BX1 - BX0) / 2, BY - 0.1, 0); belt.add(frame);
    [0.3, BX1 - BX0 - 0.3].forEach((x) => [-0.32, 0.32].forEach((z) => { const leg = kit.cyl(0.05, 0.05, BY - 0.15, M.mid, 10); leg.position.set(x, (BY - 0.15) / 2, z); belt.add(leg); }));
    [0.05, BX1 - BX0 - 0.05].forEach((x) => { const r = kit.cyl(0.11, 0.11, 0.82, M.mid, 20); r.rotation.x = Math.PI / 2; r.position.set(x, BY - 0.07, 0); belt.add(r); });
    const slats = []; for (let i = 0; i < 10; i++) { const s = kit.rbox(0.07, 0.025, 0.7, 0.01, M.mid); belt.add(s); slats.push(s); }
    const slot = kit.rbox(0.06, 0.14, 0.72, 0.02, M.darker); slot.position.set(1.21, 0.64, BZ); group.add(slot);
    const tray = new THREE.Group(); tray.position.set(5.08, 0, BZ); group.add(tray);
    const trayBase = kit.rbox(0.72, 0.1, 0.9, 0.04, M.wood); trayBase.position.y = 0.05; tray.add(trayBase);
    const stack = kit.rbox(0.62, 1, 0.74, 0.02, M.card); tray.add(stack);
    const BELT_V = 0.62;   // units / s

    function stripTex(labCol, lab) {
      const c = document.createElement("canvas"); c.width = 320; c.height = 96; const g = c.getContext("2d");
      g.fillStyle = "#FBFCF8"; g.beginPath(); g.roundRect(0, 0, 320, 96, 14); g.fill();
      g.fillStyle = labCol; g.beginPath(); g.roundRect(14, 26, 70, 44, 10); g.fill();
      g.fillStyle = "#FFFFFF"; g.font = '700 26px "Clay Sans", sans-serif'; g.textBaseline = "middle"; g.textAlign = "center"; g.fillText(lab, 49, 49);
      g.fillStyle = "#AEB6B1"; [[98, 30, 190], [98, 56, 130]].forEach(([x, y, w]) => { g.beginPath(); g.roundRect(x, y, w, 12, 6); g.fill(); });
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    }
    const stripTexs = [stripTex("#2F7A3C", "Me"), stripTex("#5E6963", "Them")];
    const NS = 9, strips = [];
    for (let i = 0; i < NS; i++) { const s = kit.card(0.92, 0.28, stripTexs[i % 2]); s.rotation.x = -Math.PI / 2; group.add(s); strips.push(s); }

    // ---------- audio goes to the bin ----------
    const bin = new THREE.Group(); bin.position.set(1.75, 0, 2.35); group.add(bin);
    const binMat = kit.clay(C.themLight, 0.6, { side: THREE.DoubleSide });
    const binWall = kit.shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.42, 0.9, 32, 1, true), binMat)); binWall.position.y = 0.45; bin.add(binWall);
    const binFloor = kit.cyl(0.42, 0.42, 0.04, M.darker, 32); binFloor.position.y = 0.04; bin.add(binFloor);
    const binRim = kit.torus(0.52, 0.045, M.dark); binRim.rotation.x = Math.PI / 2; binRim.position.y = 0.9; bin.add(binRim);
    const chute = kit.rbox(0.5, 0.14, 0.08, 0.04, M.darker); chute.position.set(0.55, 0.8, 0.93); group.add(chute);
    const toss = new THREE.CatmullRomCurve3([P(0.55, 0.8, 0.98), P(1.05, 1.35, 1.55), P(1.7, 1.45, 2.25), P(1.75, 0.3, 2.35)]);
    const tossBeads = mixed(10, 0.11);

    // ---------- the tiny local factory on your laptop ----------
    const lapTex = (() => {
      const c = document.createElement("canvas"); c.width = 640; c.height = 400; const g = c.getContext("2d");
      g.fillStyle = "#1E2622"; g.fillRect(0, 0, 640, 400);
      g.fillStyle = "#4DB860"; for (let i = 0; i < 26; i++) { const h = 16 + 70 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)); g.beginPath(); g.roundRect(60 + i * 20, 150 - h / 2, 11, h, 5); g.fill(); }
      g.fillStyle = "#F4F7F2"; g.font = '700 46px "Clay Sans", sans-serif'; g.textBaseline = "top"; g.fillText("本地转写", 60, 240);
      g.fillStyle = "#8D9791"; g.font = '500 34px "Clay Sans", sans-serif'; g.fillText("无网络 · 照样出字", 60, 306);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const lap = kit.laptop(lapTex, { w: 2.4, d: 1.6 }); lap.group.position.set(-3.45, 0, 2.6); lap.group.rotation.y = 0.55; group.add(lap.group);
    const mini = factory(0.95, 0.42, 0.5, M.white, M.meDeep, 3); mini.g.position.set(0.05, 0.16, 0.45); lap.group.add(mini.g);
    const miniPuff = puffs(3, 0.05);
    const miniStrip = kit.card(0.3, 0.09, stripTexs[0]); miniStrip.rotation.x = -Math.PI / 2; lap.group.add(miniStrip);
    lap.group.updateMatrixWorld(true);

    const tags = {
      deep: tag("Deepgram<small>主力</small>", "dark"),
      spare: tag("AssemblyAI<small>备用</small>", "them"),
      swap: tag("随时切换", "signal"),
      live: tag("边说边出字", "me"),
      server: tag("Granola 服务器<small>真钥匙锁在这</small>", "dark"),
      text: tag("文字<small>留下</small>", "me"),
      bin: tag("不存档<small>声音直接扔掉</small>", "signal"),
      local: tag("本地模型<small>233MB · 离线</small>", "me"),
    };
    const _v = new THREE.Vector3();

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 3.9, P(-2.7, 1.1, 0.5)], [T.deep - 0.6, 4.2, P(-1.9, 1.1, 0.1)], [T.asm + 0.4, 4.6, P(-0.6, 1.2, -0.8)],
          [T.strips, 4.4, P(0.1, 1.0, -0.4)], [T.ticket + 0.3, 3.7, P(-1.7, 1.2, 1.1)], [T.expire + 0.6, 3.8, P(-1.4, 1.2, 1.0)],
          [T.key + 0.4, 4.2, P(2.5, 1.3, -1.4)], [T.belt + 1.0, 4.4, P(2.7, 0.9, -0.4)],
          [T.toss, 4.4, P(2.0, 0.9, 0.6)], [T.lap + 0.9, 3.4, P(-3.2, 1.0, 2.3)], [ctx.dur, 2.9, P(-3.3, 0.9, 2.5)],
        ]);
        const L = lev(t);

        // pipes arrive from the left, beads keep flowing (continuity with s03)
        themIn.grow(smooth(ramp(t, 0.05, 1.3))); meIn.grow(smooth(ramp(t, 0.25, 1.3)));
        themBeads.flow(themIn.curve, t, 0.3, 1.4, 0.36); meBeads.flow(meIn.curve, t, 0.5, 1.4, 0.36);
        valve.scale.setScalar(pop(t, 0.9, 0.5));
        lever.rotation.x = lerp(0.55, -0.55, L);
        knob.scale.setScalar(1 + 0.3 * window01(t, T.flip - 0.3, T.back + 0.2, 0.25) * (0.6 + 0.4 * Math.sin(t * 9)));

        // factories
        main.g.scale.setScalar(pop(t, T.deep, 0.6));
        spare.g.scale.setScalar(pop(t, T.asm, 0.6));
        mainBr.grow(smooth(ramp(t, T.deep + 0.2, 0.7)));
        spareBr.grow(smooth(ramp(t, T.asm + 0.2, 1.0)));
        mainBeads.flow(mainBr.curve, t, T.deep + 0.6, 0.62, (e) => !toBackup(e));
        spareBeads.flow(spareBr.curve, t, T.asm + 0.9, 0.3, (e) => toBackup(e));
        const mainOn = ramp(t, T.deep + 1.0, 0.5) * (1 - L), spareOn = ramp(t, T.flip + 0.9, 0.5) * (1 - smooth(ramp(t, T.back + 1.2, 0.5)));
        main.winMat.emissiveIntensity = 0.1 + 0.75 * mainOn * (0.85 + 0.15 * Math.sin(t * 5));
        spare.winMat.emissiveIntensity = 0.1 + 0.75 * spareOn;
        mainPuff.render(t, MAIN(main.top), main.g.scale.x * (0.35 + 0.65 * mainOn));
        sparePuff.render(t + 0.3, SPARE(spare.top), spare.g.scale.x * (0.25 + 0.75 * spareOn), 0.6);
        main.g.position.y = 0.02 * mainOn * Math.max(0, Math.sin(t * 13));

        // gate: pass slides to the booth, clock ticks, expires, crumbles
        const passIn = outCubic(ramp(t, T.ticket, 1.0)), crumble = smooth(ramp(t, T.expire + 0.75, 0.8));
        pass.visible = t > T.ticket && crumble < 1;
        pass.position.set(lerp(-5.2, -2.7, passIn), 2.25 - crumble * 0.9, lerp(3.0, 2.4, passIn));
        pass.rotation.set(-0.12 + crumble * 0.6, FACE + 0.08, crumble * 0.5);
        pass.scale.set(Math.max(0.0001, 1.3 * (1 - crumble)), Math.max(0.0001, 1.3 * (1 - crumble * 1.15)), 1.3);
        hand.rotation.z = -Math.max(0, Math.min(t, T.expire) - T.clock) * 3.4;
        const grey = smooth(ramp(t, T.expire + 0.25, 0.4));
        passMat.color.setHex(C.paperCard).lerp(new THREE.Color(0xA7AFAA), grey);
        passFace.color.setHex(0xffffff).lerp(new THREE.Color(0x9AA29D), grey);
        stamp.visible = t > T.expire; stamp.scale.setScalar(Math.max(0.0001, outBack(ramp(t, T.expire, 0.3)) * (1 + 0.6 * (1 - ramp(t, T.expire, 0.15)))));
        const open = smooth(ramp(t, T.ticket + 1.0, 0.5)) * (1 - smooth(ramp(t, T.expire + 0.5, 0.5)));
        arm.rotation.z = open * 1.35;
        hutLamp.material.emissiveIntensity = 0.2 + 0.8 * window01(t, T.ticket + 0.8, T.expire + 0.6, 0.2) * (0.5 + 0.5 * Math.sin(t * 12));
        const gone = 1 - smooth(ramp(t, T.lap - 0.7, 0.6));
        booth.scale.setScalar(pop(t, T.ticket - 0.4, 0.5) * gone + 0.0001); post.scale.setScalar(pop(t, T.ticket - 0.3, 0.5) * gone + 0.0001); arm.scale.setScalar(pop(t, T.ticket - 0.2, 0.5) * gone + 0.0001);

        // server + safe + the real key
        server.scale.setScalar(pop(t, T.key - 0.3, 0.6));
        const doorOpen = smooth(ramp(t, T.key + 0.5, 0.6)) * (1 - smooth(ramp(t, T.belt - 0.3, 0.6)));
        door.rotation.y = -1.75 * doorOpen;
        key.scale.setScalar(Math.max(0.0001, outBack(ramp(t, T.key + 0.8, 0.5)) * (1 + 0.25 * doorOpen)));
        key.position.z = 0.66 + 0.25 * doorOpen; key.rotation.y = FACE - 0.4 + Math.sin(t * 1.6) * 0.3;
        key.position.y = 0.62 + 0.04 * Math.sin(t * 2.4);
        goldMat.emissiveIntensity = 0.25 + 0.45 * doorOpen * (0.6 + 0.4 * Math.sin(t * 5));
        leds.forEach((l, i) => { l.material = Math.sin(t * (3 + i * 0.7) + i * 2.1) > 0.1 ? ledOn : ledOff; });

        // text strips: first popping out of the slot, then riding the belt
        const beltK = smooth(ramp(t, T.belt, 0.8));
        belt.scale.set(Math.max(0.0001, beltK), 1, 1); belt.visible = t > T.belt;
        slats.forEach((s, i) => { const x = ((t * BELT_V + i * 0.35) % 3.5 + 3.5) % 3.5; s.position.set(x, BY - 0.005, 0); });
        tray.scale.setScalar(pop(t, T.belt + 0.4, 0.5));
        const onTray = clamp((t - T.belt - 5.5) / 14);
        stack.scale.set(1, Math.max(0.0001, 0.03 + 0.4 * onTray), 1); stack.position.y = 0.1 + (0.03 + 0.4 * onTray) / 2;
        slot.scale.setScalar(pop(t, T.deep, 0.6));
        const SP = 0.17;
        strips.forEach((s, i) => {
          const ph = (((t - T.strips) * SP + i / NS) % 1 + 1) % 1, u = ph / SP, e = t - u;
          if (e < T.strips) { s.visible = false; return; }
          s.visible = true;
          if (e < T.belt + 0.6) {               // pop out and land, then vanish
            const k = clamp(u / 0.9);
            s.position.set(1.3 + 1.1 * k + (i % 3) * 0.08, 0.62 + 0.75 * Math.sin(Math.PI * k) - 0.58 * k, BZ + ((i * 0.37) % 0.6) - 0.3);
            s.rotation.set(-Math.PI / 2, 0, (1 - k) * 2.2 + i);
            s.scale.setScalar(Math.max(0.0001, pop(u, 0, 0.3) * (1 - ramp(u, 1.4, 0.4))));
            if (u > 1.8) s.visible = false;
          } else {                               // ride the belt, then drop onto the tray
            const x = 1.3 + u * BELT_V, drop = clamp((x - 4.75) / 0.35);
            s.position.set(Math.min(x, 5.08), BY + 0.04 + 0.25 * Math.sin(Math.PI * drop) - drop * (BY - 0.3 - 0.4 * onTray), BZ);
            s.rotation.set(-Math.PI / 2, 0, 0);
            s.scale.setScalar(Math.max(0.0001, pop(u, 0, 0.3) * (1 - ramp(x, 5.0, 0.15))));
            if (x > 5.2) s.visible = false;
          }
        });

        // audio -> bin
        bin.scale.setScalar(pop(t, T.voice - 0.2, 0.5) * (1 - smooth(ramp(t, T.lap, 0.6))) + 0.0001);
        bin.rotation.z = 0.05 * Math.sin(t * 14) * window01(t, T.toss, T.lap - 0.5, 0.3);
        chute.scale.setScalar(pop(t, T.voice - 0.1, 0.4) * (1 - smooth(ramp(t, T.lap, 0.6))) + 0.0001);
        tossBeads.flow(toss, t, T.voice + 0.3, 0.55, (e) => e < T.lap - 0.6);

        // tiny factory in your laptop
        lap.group.scale.setScalar(pop(t, T.lap, 0.6));
        mini.g.scale.setScalar(pop(t, T.mini - 0.2, 0.55)); lap.group.updateMatrixWorld(true);
        mini.winMat.emissiveIntensity = 0.7 * ramp(t, T.offline, 0.4) * (0.75 + 0.25 * Math.sin(t * 6)) + 0.15;
        miniPuff.render(t, lap.group.localToWorld(_v.copy(mini.g.position).add(mini.top.clone().multiplyScalar(mini.g.scale.x))), mini.g.scale.x * 0.9, 0.7);
        const mk = ((t - T.mini) * 0.8 % 1 + 1) % 1;
        miniStrip.visible = t > T.mini + 0.4;
        miniStrip.position.set(0.55 + mk * 0.45, 0.32 + 0.3 * Math.sin(Math.PI * mk), 0.45);
        miniStrip.scale.setScalar(Math.max(0.0001, Math.sin(Math.PI * mk) * 1.2));

        // tags
        tags.deep.place(MAIN(P(0.2, 2.3, 0.4)), ramp(t, T.deep + 0.3, 0.3) * (1 - ramp(t, T.ticket, 0.4)), { dx: -60, dy: -80 });
        tags.spare.place(SPARE(P(0.0, 1.7, 0.0)), ramp(t, T.asm + 0.3, 0.3) * (1 - ramp(t, T.ticket, 0.4)), { dx: 30, dy: -60 });
        tags.swap.place(P(-3.0, 2.3, 0.45), window01(t, T.flip - 0.3, T.back + 0.6, 0.3), { dx: -70, dy: -70 });
        tags.live.place(P(2.2, 1.4, -0.2), ramp(t, T.strips + 0.3, 0.3) * (1 - ramp(t, T.ticket + 0.4, 0.4)), { dx: 10, dy: -50 });
        tags.server.place(P(3.95, 2.6, -2.0), ramp(t, T.key + 0.6, 0.3) * (1 - ramp(t, T.voice, 0.4)), { dx: -150, dy: -70 });
        tags.text.place(P(5.08, 0.7, BZ), ramp(t, T.belt + 1.6, 0.3) * (1 - ramp(t, T.lap, 0.4)), { dx: 30, dy: -20 });
        tags.bin.place(P(1.75, 1.0, 2.35), ramp(t, T.toss, 0.3) * (1 - ramp(t, T.lap, 0.4)), { dx: -360, dy: -10 });
        tags.local.place(lap.group.localToWorld(P(1.1, 1.7, -0.6)), ramp(t, T.mb - 0.3, 0.35), { dx: 10, dy: -40 });
      },
    };
  },
};
