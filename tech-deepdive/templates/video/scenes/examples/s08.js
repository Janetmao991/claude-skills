// 第 6 层 · 后端 + MCP — notes live in the cloud; the back door is locked, a front door (API / MCP) opens for AI assistants.
export default {
  id: "s08",
  eyebrow: "第 6 层 · 后端 + MCP",
  headline: "从笔记本到公司记忆",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    const T = {
      notes: at("所有笔记"), aws: at("亚马逊云"), cache: at("本地缓存"), lock: at("锁上"), back: at("后门"), dead: at("全部失效"),
      front: at("正门"), api: at("API"), mcp: at("MCP"), usb: at("USB 接口"),
      claude: at("Claude"), gpt: at("ChatGPT"), cursor: at("Cursor"), plug: at("插上去"), call: at("直接调用"),
      notebook: at("笔记本"), memory: at("会议记忆"), company: at("整个公司"),
    };

    kit.desk(group);

    // ---------- the laptop and its little back-door cache ----------
    const noteTex = kit.textTexture([{ text: "会议笔记", size: 64, weight: 900 }, { text: "· 客户反馈", size: 44, color: "#5E6963" }, { text: "· 下一步", size: 44, color: "#5E6963" }, { text: "· 决定", size: 44, color: "#2F7A3C" }],
      { w: 640, h: 400, pad: 40 });
    const lap = kit.laptop(noteTex, { w: 2.6, d: 1.8 }); lap.group.position.set(-3.3, 0, -0.9); lap.group.rotation.y = 0.35; group.add(lap.group);
    const cacheG = new THREE.Group(); cacheG.position.set(-4.35, 0, 1.15); cacheG.rotation.y = 0.25; group.add(cacheG);
    const cacheBox = kit.rbox(1.1, 0.95, 0.9, 0.1, M.sticky); cacheBox.position.y = 0.475; cacheG.add(cacheBox);
    const doorHinge = new THREE.Group(); doorHinge.position.set(-0.26, 0.42, 0.46); cacheG.add(doorHinge);
    const door = kit.rbox(0.52, 0.66, 0.06, 0.04, kit.clay(C.wood, 0.7)); door.position.set(0.26, 0, 0); doorHinge.add(door);
    const knob = kit.sphere(0.045, M.dark); knob.position.set(0.44, 0, 0.05); doorHinge.add(knob);
    // a short cable from the cache to the laptop
    const cacheLink = kit.pipe(group, [P(-4.1, 0.25, 0.75), P(-3.8, 0.12, 0.2), P(-3.5, 0.12, -0.2)], M.dark, 0.05);
    // padlock
    const lock = new THREE.Group(); group.add(lock);
    const lockBody = kit.rbox(0.36, 0.3, 0.14, 0.05, M.signal); lock.add(lockBody);
    const shackle = kit.torus(0.12, 0.035, M.alu); shackle.geometry = new THREE.TorusGeometry(0.12, 0.035, 10, 32, Math.PI); shackle.position.y = 0.15; lock.add(shackle);
    const keyhole = new THREE.Mesh(new THREE.CircleGeometry(0.04, 16), kit.flat(C.darker)); keyhole.position.z = 0.072; lock.add(keyhole);
    cacheG.updateMatrixWorld(true);
    const DOOR_W = cacheG.localToWorld(P(0, 0.45, 0.55));

    // little community tools (small robots) that used to sneak in through the back door
    const minis = [0, 1, 2].map((i) => { const r = kit.robot({ body: [0xC9D0CB, 0xD7C9A8, 0xB9C8B5][i] }); group.add(r); return r; });
    const MINI = [P(-3.0, 0, 3.0), P(-4.5, 0, 3.2), P(-3.8, 0, 3.4)];

    // ---------- the cloud tower ----------
    const tower = new THREE.Group(); tower.position.set(0.6, 0, -0.9); group.add(tower);
    const TW = 1.9, TD = 1.6, TH = 3.0;
    const tBody = kit.rbox(TW, TH, TD, 0.14, M.dark); tBody.position.y = TH / 2; tower.add(tBody);
    // rack units with blinking LEDs
    const leds = [];
    const ledGeo = new THREE.SphereGeometry(0.045, 10, 8);
    const ledOn = kit.flat(0x7BE08C), ledOff = kit.flat(0x3C4A42), ledAmber = kit.flat(0xF3DE7A);
    for (let u = 0; u < 3; u++) {
      const unit = kit.rbox(TW - 0.24, 0.22, 0.06, 0.04, M.darker); unit.position.set(0, 2.2 + u * 0.27, TD / 2 + 0.01); tower.add(unit);
      for (let k = 0; k < 4; k++) { const l = new THREE.Mesh(ledGeo, ledOff); l.position.set(0.45 + k * 0.13, 2.2 + u * 0.27, TD / 2 + 0.05); tower.add(l); leds.push(l); }
    }
    // AWS plate
    const awsTex = kit.textTexture([{ text: "AWS", size: 92, weight: 900, color: "#F6F8F4" }], { w: 256, h: 128, bg: "#222A26", pad: 18, align: "center" });
    const awsPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), kit.flat(0xffffff, { map: awsTex })); awsPlate.position.set(-0.5, 2.47, TD / 2 + 0.05); tower.add(awsPlate);
    // glass window with note cards filed inside
    const win = kit.rbox(TW - 0.3, 0.2, 0.08, 0.04, M.darker); win.position.set(0, 1.68, TD / 2 + 0.02); tower.add(win);
    const fileCards = [];
    const cardGeo = new kit.RoundedBoxGeometry(0.1, 0.42, 0.36, 2, 0.03);
    const cardCols = [M.card, M.sticky, M.card, kit.clay(0xCFE3CF, 0.8), M.card, M.sticky, M.card, kit.clay(0xCFE3CF, 0.8), M.card, M.sticky];
    for (let i = 0; i < 10; i++) { const m = kit.shadowed(new THREE.Mesh(cardGeo, cardCols[i])); m.position.set(-0.68 + i * 0.15, 1.86, TD / 2 + 0.02); m.rotation.z = (i % 3 - 1) * 0.06; tower.add(m); fileCards.push(m); }
    // front gate: frame + two leaves
    const gateFrame = kit.rbox(1.25, 1.12, 0.08, 0.05, M.mid); gateFrame.position.set(0, 0.6, TD / 2 + 0.02); tower.add(gateFrame);
    const gateDark = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.98), kit.flat(0xFBFCF8)); gateDark.position.set(0, 0.56, TD / 2 + 0.065); tower.add(gateDark);
    const leafMat = kit.clay(C.me, 0.55);
    const leaves = [-1, 1].map((s) => {
      const h = new THREE.Group(); h.position.set(s * 0.525, 0.56, TD / 2 + 0.1); tower.add(h);
      const l = kit.rbox(0.52, 0.96, 0.06, 0.03, leafMat); l.position.x = -s * 0.26; h.add(l);
      const hd = kit.sphere(0.04, M.white); hd.position.set(-s * 0.44, 0, 0.04); h.add(hd);
      return h;
    });
    const sign = (txt, col) => kit.card(0.8, 0.36, kit.textTexture([{ text: txt, size: 84, weight: 900, color: col }], { w: 256, h: 118, pad: 16, align: "center" }), { depth: 0.05 });
    const apiSign = sign("API", "#2F7A3C"), mcpSign = sign("MCP", "#2F7A3C"); apiSign.scale.setScalar(1);
    const signPost = (sg, x) => { const g = new THREE.Group(); g.position.set(x, 1.36, TD / 2 + 0.08); tower.add(g); g.add(sg); return g; };
    const apiG = signPost(apiSign, -0.45), mcpG = signPost(mcpSign, 0.45);

    // USB hub on the tower's right side, three ports facing +x
    const hub = new THREE.Group(); hub.position.set(TW / 2 + 0.28, 1.0, 0.1); tower.add(hub);
    const hubBody = kit.rbox(0.5, 0.9, 1.3, 0.12, M.white); hub.add(hubBody);
    const hubBand = kit.rbox(0.52, 0.12, 1.32, 0.05, M.me); hubBand.position.y = 0.36; hub.add(hubBand);
    const portMat = kit.flat(C.darker), ports = [];
    for (let k = 0; k < 3; k++) {
      const p = kit.rbox(0.06, 0.13, 0.28, 0.03, M.aluDark); p.position.set(0.25, -0.05, -0.38 + k * 0.38); hub.add(p);
      const hole = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.06), portMat); hole.rotation.y = Math.PI / 2; hole.position.set(0.285, -0.05, -0.38 + k * 0.38); hub.add(hole);
      ports.push(p);
    }

    // extra floors that turn the tower into a building
    const floors = [];
    const winTex = (() => {
      const c = document.createElement("canvas"); c.width = 256; c.height = 128; const g = c.getContext("2d");
      g.fillStyle = "#36413B"; g.fillRect(0, 0, 256, 128);
      for (let i = 0; i < 5; i++) { g.fillStyle = i % 2 ? "#F3DE7A" : "#CFE3CF"; g.beginPath(); g.roundRect(14 + i * 48, 30, 36, 68, 6); g.fill(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    for (let f = 0; f < 3; f++) {
      const fl = new THREE.Group(); fl.position.y = TH + f * 0.82; tower.add(fl);
      const fb = kit.rbox(TW - 0.12 * (f + 1), 0.78, TD - 0.1 * (f + 1), 0.1, f % 2 ? M.dark : M.mid); fb.position.y = 0.4; fl.add(fb);
      const fw = new THREE.Mesh(new THREE.PlaneGeometry(TW - 0.4 - 0.12 * f, 0.5), kit.flat(0xffffff, { map: winTex })); fw.position.set(0, 0.4, (TD - 0.1 * (f + 1)) / 2 + 0.005); fl.add(fw);
      const fs = new THREE.Mesh(new THREE.PlaneGeometry(TD - 0.4 - 0.1 * f, 0.5), kit.flat(0xffffff, { map: winTex })); fs.rotation.y = Math.PI / 2; fs.position.set((TW - 0.12 * (f + 1)) / 2 + 0.005, 0.4, 0); fl.add(fs);
      floors.push(fl);
    }
    const roof = kit.cyl(0.05, 0.05, 0.7, M.alu, 12); tower.add(roof);
    const roofBall = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), kit.flat(0x7BE08C)); tower.add(roofBall);

    // notes flying from the laptop into the tower
    const upCurve = new THREE.CatmullRomCurve3([P(-3.2, 1.6, -1.0), P(-2.0, 3.3, -1.4), P(-0.2, 3.7, -1.2), P(0.6, 3.25, -0.9)]);
    const flyMat = M.card;
    const flyers = []; for (let i = 0; i < 5; i++) { const m = kit.shadowed(new THREE.Mesh(new kit.RoundedBoxGeometry(0.42, 0.04, 0.3, 2, 0.015), i % 2 ? M.sticky : flyMat)); group.add(m); flyers.push(m); }

    // ---------- the three AI assistants ----------
    const screenTex = (name) => kit.textTexture([{ text: name, size: 84, weight: 900, color: "#F6F8F4" }], { w: 400, h: 256, bg: "#222A26", pad: 82, align: "center", radius: 18 });
    const PCS = [["Claude", P(3.85, 0, -2.15)], ["ChatGPT", P(4.55, 0, -0.35)], ["Cursor", P(4.35, 0, 1.55)]];
    const pcs = PCS.map(([name, pos]) => {
      const g = new THREE.Group(); g.position.copy(pos); g.rotation.y = 0.35; group.add(g);
      const base = kit.rbox(0.6, 0.06, 0.45, 0.03, M.alu); base.position.y = 0.03; g.add(base);
      const neck = kit.rbox(0.1, 0.5, 0.08, 0.03, M.alu); neck.position.set(0, 0.28, -0.08); g.add(neck);
      const sc = kit.card(1.4, 0.9, screenTex(name), { depth: 0.1, mat: M.aluDark }); sc.position.set(0, 0.88, 0); g.add(sc);
      return g;
    });
    hub.updateMatrixWorld(true); tower.updateMatrixWorld(true);
    const portW = (k) => hub.localToWorld(P(0.3, -0.05, -0.38 + k * 0.38));
    const cables = PCS.map(([, pos], k) => {
      const p0 = portW(k);
      const pts = [p0, p0.clone().add(P(0.5, 0, 0)), P(lerp(p0.x + 0.5, pos.x, 0.5), 0.22, lerp(p0.z, pos.z, 0.5)), P(pos.x - 0.45, 0.18, pos.z - 0.1), P(pos.x - 0.05, 0.5, pos.z - 0.2)];
      return kit.pipe(group, pts, kit.glass(0x5FB36E, 0.5), 0.07);
    });
    const plugs = cables.map(() => { const m = kit.rbox(0.18, 0.12, 0.2, 0.03, M.white); group.add(m); return m; });
    const cardBeadGeo = new kit.RoundedBoxGeometry(0.2, 0.03, 0.14, 2, 0.012);
    const beadSets = cables.map(() => { const arr = []; for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(cardBeadGeo, i % 2 ? M.sticky : M.card); group.add(m); arr.push(m); } return arr; });

    const tags = {
      aws: tag("亚马逊云<small>AWS</small>", "dark"),
      cache: tag("本地缓存<small>后门</small>", "them"),
      dead: tag("社区小工具<small>全部失效</small>", "signal"),
      gate: tag("正门<small>API · MCP</small>", "me"),
      usb: tag("MCP = AI 助手的 USB 接口", "me"),
      call: tag("直接调用会议记录", "them"),
      memory: tag("整个公司的会议记忆", "big"),
    };
    const SHOW_PC = [T.claude, T.gpt, T.cursor];

    return {
      render(t) {
        const growK = smooth(ramp(t, T.notebook + 0.5, 1.8));
        kit.camKeys(camera, t, [
          [0, 4.6, P(-1.0, 1.2, -0.3)], [T.aws, 4.8, P(-0.6, 1.6, -0.6)], [T.cache - 0.3, 4.2, P(-2.6, 1.0, 0.9)],
          [T.dead + 0.6, 4.2, P(-2.5, 0.9, 1.3)], [T.front + 0.4, 4.3, P(0.4, 1.4, 0.0)], [T.usb + 0.5, 4.7, P(1.8, 1.4, 0.0)],
          [T.call + 1.0, 5.0, P(1.8, 1.4, 0.2)], [T.memory + 0.4, 5.6, P(0.6, 2.4, 0.0)], [ctx.dur, 5.6, P(0.5, 2.5, 0.0)],
        ]);

        // laptop + notes into the cloud
        lap.screen.scale.setScalar(1 + 0.025 * Math.max(0, Math.sin(t * 4)) * window01(t, T.notes - 0.2, T.cache, 0.4));
        const tk = pop(t, T.aws - 0.35, 0.6);
        tower.scale.set(1, 1, 1); tower.visible = t > T.aws - 0.4;
        tBody.scale.set(clamp(tk * 2), tk, clamp(tk * 2)); tBody.position.y = TH / 2 * tk;
        const tIn = (a) => pop(t, T.aws + a, 0.4);
        tower.children.forEach((c) => { if (c !== tBody && !floors.includes(c) && c !== hub && c !== roof && c !== roofBall && !leaves.some((l) => l === c) && c !== apiG && c !== mcpG) c.scale.setScalar(tIn(0.3)); });
        fileCards.forEach((m, i) => { const s = pop(t, T.aws + 0.9 + i * 0.22, 0.3); m.scale.set(s, s, s); m.position.y = 1.86 + 0.03 * Math.sin(t * 3 + i); });
        leds.forEach((l, i) => { const on = Math.sin(t * (3 + (i % 5)) + i * 2.3) > 0.2; l.material = t < T.aws + 0.3 ? ledOff : on ? (i % 7 === 3 ? ledAmber : ledOn) : ledOff; });
        flyers.forEach((m, i) => {
          const raw = (t - T.aws) * 0.45 - i / 5, u = ((raw % 1) + 1) % 1;
          m.visible = raw >= 0 && t < T.cache + 0.5;
          upCurve.getPointAt(clamp(u), m.position);
          m.rotation.set(0.3 * Math.sin(u * 6), u * 3, 0.2);
          m.scale.setScalar(Math.max(0.0001, Math.sin(u * Math.PI) * 1.1 * (1 - ramp(t, T.cache, 0.5))));
        });

        // cache box with a back door → padlock
        const ck = pop(t, T.cache - 0.1, 0.45);
        cacheG.scale.setScalar(ck); cacheG.visible = t > T.cache - 0.15;
        cacheLink.grow(smooth(ramp(t, T.cache + 0.2, 0.6)));
        doorHinge.rotation.y = -0.9 * window01(t, T.cache + 0.3, T.lock - 0.1, 0.3) * (0.8 + 0.2 * Math.sin(t * 6));
        const lk = ramp(t, T.lock, 0.45);
        lock.visible = t > T.lock;
        lock.position.set(DOOR_W.x + 0.02, DOOR_W.y + (1 - outCubic(lk)) * 1.6 + 0.02 * Math.sin(t * 2), DOOR_W.z + 0.08);
        lock.rotation.set(0, cacheG.rotation.y, (1 - lk) * 0.6);
        const snap = 1 + 0.25 * window01(t, T.lock + 0.4, T.lock + 0.55, 0.1);
        lock.scale.setScalar(Math.max(0.0001, outBack(clamp(lk * 1.5)) * snap * 1.35));
        shackle.position.y = 0.15 + 0.08 * (1 - ramp(t, T.lock + 0.35, 0.1));

        // little robots run at the locked door, bounce, fall over
        minis.forEach((r, i) => {
          const a = T.back + i * 0.35, hit = T.back + 1.1 + i * 0.3, fall = T.dead + i * 0.15;
          r.visible = t > a - 0.05 && t < T.front + 1.5;
          const run = smooth(ramp(t, a, hit - a));
          const tgt = DOOR_W.clone().add(P((i - 1) * 0.42, -DOOR_W.y, 0.55));
          const pos = new THREE.Vector3().lerpVectors(MINI[i], tgt, run);
          const bounce = outCubic(ramp(t, hit, 0.6));
          pos.addScaledVector(P(0.25 * (i - 1), 0, 1), bounce * 0.75);
          pos.y = (t < hit ? Math.abs(Math.sin((t - a) * 11)) * 0.12 : Math.sin(bounce * Math.PI) * 0.35);
          r.position.copy(pos);
          r.rotation.set(-Math.PI / 2 * outBack(ramp(t, fall, 0.45)) * 0.98, Math.PI + 0.2 + (i - 1) * 0.3, 0);
          const out = 1 - smooth(ramp(t, T.front + 0.9, 0.5));
          r.scale.setScalar(Math.max(0.0001, 0.55 * pop(t, a, 0.35) * out));
        });

        // front gate opens, signs
        leaves.forEach((h, j) => { h.rotation.y = (j ? 1 : -1) * 1.45 * outBack(ramp(t, T.front + 0.1, 0.8)); h.scale.setScalar(tIn(0.3)); });
        apiG.scale.setScalar(pop(t, T.api - 0.1, 0.45)); mcpG.scale.setScalar(pop(t, T.mcp - 0.1, 0.45));
        apiSign.rotation.z = 0.03 * Math.sin(t * 2); mcpSign.rotation.z = -0.03 * Math.sin(t * 2.2);
        gateDark.material.color.setHex(t > T.front ? 0xFBFCF8 : 0x222A26);

        // USB hub
        const hk = pop(t, T.usb - 0.1, 0.5);
        hub.scale.setScalar(hk * (1 + 0.03 * Math.sin(t * 4) * ramp(t, T.usb + 0.6, 0.3)));
        ports.forEach((p, k) => { p.scale.setScalar(1 + 0.15 * Math.max(0, Math.sin(t * 5 - k)) * window01(t, T.usb + 0.5, T.claude, 0.3)); });

        // computers + cables + note-card beads
        pcs.forEach((g, k) => { g.scale.setScalar(pop(t, SHOW_PC[k] - 0.1, 0.45)); g.position.y = 0; });
        cables.forEach((c, k) => {
          const gs = T.plug - 0.1 + k * 0.25;
          const gk = smooth(ramp(t, gs, 1.0));
          c.grow(gk);
          const pl = plugs[k]; pl.visible = gk > 0.02; c.curve.getPointAt(clamp(gk), pl.position);
          pl.scale.setScalar(gk > 0.98 ? 0.0001 : 1);
          pl.lookAt(pl.position.clone().add(c.curve.getTangentAt(clamp(gk))));
          beadSets[k].forEach((m, i) => {
            const start = gs + 1.0 + 0.2;
            const u = ((((t - start) * 0.4 + i / 6) % 1) + 1) % 1;
            m.visible = t > start;
            c.curve.getPointAt(u, m.position); m.position.y += 0.1;
            m.rotation.y = t * 2 + i; m.scale.setScalar(clamp((t - start) / 0.5) * Math.min(1, Math.sin(u * Math.PI) * 3));
          });
          // screen lights up as notes arrive
          pcs[k].children[2].children[0].scale.setScalar(1 + 0.04 * Math.max(0, Math.sin(t * 6 + k)) * ramp(t, gs + 1.4, 0.3));
        });

        // the tower grows into the company's memory building
        floors.forEach((fl, f) => {
          const fk = outBack(ramp(t, T.notebook + 0.5 + f * 0.45, 0.55));
          fl.visible = fk > 0.001; fl.scale.set(1, Math.max(0.0001, fk), 1);
        });
        const topY = TH + 3 * 0.82 * growK;
        roof.position.set(0.4, topY + 0.35, 0); roofBall.position.set(0.4, topY + 0.72, 0);
        roof.visible = roofBall.visible = growK > 0.02;
        roofBall.scale.setScalar(1 + 0.3 * Math.max(0, Math.sin(t * 5)));

        // tags
        tags.aws.place(P(0.6 - 1.0, TH + 0.3, -0.9), window01(t, T.aws + 0.3, T.cache - 0.2, 0.35), { dx: -60, dy: -70 });
        tags.cache.place(P(-4.35, 1.2, 1.15), window01(t, T.cache + 0.2, T.dead - 0.2, 0.3), { dx: -150, dy: -90 });
        tags.dead.place(P(-3.4, 0.8, 2.6), window01(t, T.dead + 0.3, T.front + 0.6, 0.3), { dx: 30, dy: 10 });
        tags.gate.place(P(0.6, 0, -0.9 + TD / 2 + 0.9), window01(t, T.front + 0.4, T.usb - 0.2, 0.3), { dx: -90, dy: 30 });
        tags.usb.place(P(0.6 + TW / 2 + 0.3, 1.8, 0.0), window01(t, T.usb + 0.2, T.notebook, 0.35), { dx: -40, dy: -110 });
        tags.call.place(P(4.55, 1.0, -0.35), window01(t, T.call + 0.2, T.notebook + 0.3, 0.3), { dx: 110, dy: -30 });
        tags.memory.place(P(0.6, TH + 3 * 0.82 + 0.9, -0.9), ramp(t, T.memory - 0.4, 0.4), { dx: 60, dy: -40 });
      },
    };
  },
};
