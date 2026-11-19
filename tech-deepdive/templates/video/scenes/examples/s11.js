// 总结 — the six layers return; almost every one is bought. The moat is the pile of meeting notes.
export default {
  id: "s11",
  eyebrow: "总结",
  headline: "哪一层是自己造的？",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    const T = {
      back: at("回头看"), items: ["软件外壳", "系统接口", "转写", "大模型", "向量数据库", "云服务"].map((w) => at(w)),
      bought: at("买来的"), craft: at("功夫"), tap: at("拼装和打磨"), hard: at("真正难"), notTech: at("不是技术"),
      grow: at("越积越多"), notes: at("会议记录"), next: at("下次"), which: at("哪一层"), own: at("自己造的"),
    };
    const SRC = ["Electron", "Apple 系统接口", "Deepgram", "OpenAI / Anthropic", "Turbopuffer", "AWS"];

    kit.desk(group, 10, 6.8);
    const stack = buildStack(kit, THREE, group); stack.root.position.set(-0.3, 0.02, -0.9); stack.root.scale.setScalar(0.82);
    const { W, D, HS } = stack;
    // bought parts: loosely stacked until Granola fits them together
    const rnd = kit.rng(11);
    const off = stack.layers.map(() => ({ x: (rnd() - 0.5) * 0.7, z: (rnd() - 0.5) * 0.5, r: (rnd() - 0.5) * 0.16 }));

    // grey "买来的" stamps
    const stampTex = kit.textTexture([{ text: "买来的", size: 76, weight: 900, color: "#FFFFFF" }], { w: 320, h: 128, bg: "#7C8780", pad: 22, radius: 22, align: "center", border: "#E7EDE4" });
    const qz = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -0.12);
    const stamps = stack.layers.map(() => { const s = kit.card(0.95, 0.38, stampTex, { depth: 0.03, mat: kit.clay(0x7C8780, 0.7) }); group.add(s); return s; });

    // the little fixer robot with a wrench
    const bot = kit.robot(); bot.rotation.y = Math.PI / 2 - 0.25; group.add(bot);
    bot.userData.arms[0].visible = false;
    const shoulder = new THREE.Group(); shoulder.position.set(-0.5, 0.68, 0); bot.add(shoulder);
    const botMat = bot.userData.arms[0].material;
    const arm = kit.rbox(0.14, 0.5, 0.14, 0.06, botMat); arm.position.y = -0.22; shoulder.add(arm);
    const wrench = new THREE.Group(); wrench.position.set(0, -0.5, 0); shoulder.add(wrench);
    const wHandle = kit.rbox(0.11, 0.55, 0.11, 0.04, M.dark); wHandle.position.y = -0.22; wrench.add(wHandle);
    const wHead = kit.torus(0.16, 0.06, M.signal); wHead.position.y = -0.52; wrench.add(wHead);
    const BOT = P(-4.1, 0, 0.1);

    // the pile of meeting notes
    const pileTex = noteTexture(THREE);
    const pileMat = kit.clay(0xFBFCF8, 0.85, { emissive: 0x2F7A3C, emissiveIntensity: 0 });
    const PILE = P(3.5, 0, -1.9);
    const NP = 18;
    const pile = Array.from({ length: NP }, (_, i) => {
      const c = kit.card(1.25, 1.45, pileTex, { depth: 0.05, mat: pileMat }); group.add(c);
      return { c, x: (rnd() - 0.5) * 0.24, z: (rnd() - 0.5) * 0.24, r: (rnd() - 0.5) * 0.9, when: T.grow - 0.3 + i * 0.15 };
    });
    const halo = new THREE.Mesh(new THREE.CircleGeometry(1.25, 48), kit.flat(0x4DB860, { transparent: true, opacity: 0, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2; halo.position.set(PILE.x, 0.012, PILE.z); group.add(halo);

    const srcTags = SRC.map((s) => tag(s, "them"));
    const tags = {
      craft: tag("拼装 + 打磨", "me"),
      moat: tag("真正的护城河<small>越积越多的会议记录</small>", "me"),
      ask: tag("哪一层，是你自己造的？", "big dark"),
    };
    const layerPt = (i, x, y, z) => stack.layers[i].g.localToWorld(P(x, y, z));

    return {
      render(t) {
        const stTop = (stack.layers[0].baseY + 1) * 0.82;
        kit.camKeys(camera, t, [
          [0, 5.0, P(-1.3, 2.7, 0.5)], [T.items[0] - 0.3, 5.1, P(-0.2, 2.7, -0.1)], [T.craft - 0.4, 5.1, P(-1.0, 2.5, 0.3)],
          [T.hard, 5.0, P(0.2, 2.3, 0.0)], [T.notes, 5.0, P(1.2, 2.6, -0.6)], [T.which, 5.3, P(0.0, 2.6, 0.1)],
          [ctx.dur - 1.1, 5.9, P(0.0, 2.6, 0.1)], [ctx.dur, 5.92, P(0.0, 2.6, 0.1)],
        ]);
        camera.updateMatrixWorld();

        // stack returns, then snaps into alignment when the robot taps it
        const dim = 1 - 0.35 * smooth(ramp(t, T.hard, 0.8));
        stack.layers.forEach((L, i) => {
          const j = 5 - i, s = T.back - 0.4 + j * 0.12, k = ramp(t, s, 0.7);
          L.g.visible = t > s;
          const snap = outBack(ramp(t, T.tap + 0.15 + j * 0.06, 0.4));
          const o = off[i], loose = 1 - snap;
          L.g.position.set(o.x * loose, L.baseY - 1.4 * (1 - outCubic(k)) - 0.06 * window01(t, T.tap + 0.15 + j * 0.06, T.tap + 0.3 + j * 0.06, 0.08), o.z * loose);
          L.g.rotation.y = o.r * loose;
          L.g.scale.setScalar(Math.max(0.0001, outBack(k)));
          const named = T.items[i], polish = T.tap + 0.9 + i * 0.09;
          L.glass.opacity = 0.56 * smooth(k) * dim;
          L.glass.emissiveIntensity = 0.6 * window01(t, named, named + 0.6, 0.2) + 0.5 * window01(t, polish, polish + 0.3, 0.12) + 0.06 * Math.sin(t * 2 + i);
          L.bob(t);
        });
        stack.root.updateMatrixWorld(true);

        // stamps pop on one by one; all thump together at "买来的"
        stamps.forEach((s, i) => {
          const at0 = T.items[i] + 0.35;
          s.visible = t > at0;
          s.position.copy(layerPt(i, W / 2 - 0.85, HS / 2 + 0.05, D / 2 + 0.25));
          s.quaternion.copy(camera.quaternion).multiply(qz);
          const slam = lerp(1.8, 1, outCubic(ramp(t, at0, 0.25)));
          s.scale.setScalar(Math.max(0.0001, slam * clamp((t - at0) / 0.12) * (1 + 0.12 * window01(t, T.bought + i * 0.05, T.bought + 0.3 + i * 0.05, 0.12))));
        });

        // robot hops in, taps twice with the wrench, then steps aside
        const inK = outCubic(ramp(t, T.craft - 0.6, 1.0)), outK = smooth(ramp(t, T.hard + 0.6, 0.7));
        bot.visible = t > T.craft - 0.6 && outK < 1;
        const hop = Math.abs(Math.sin((t - T.craft) * 7)) * 0.3 * (1 - ramp(t, T.craft + 0.3, 0.2));
        bot.position.set(lerp(-5.6, BOT.x, inK), hop - outK * 0.8, BOT.z);
        bot.scale.setScalar(Math.max(0.0001, 1.4 * clamp(inK * 3) * (1 - outK)));
        const swing = (a) => Math.exp(-Math.pow((t - a) / 0.11, 2));
        const strike = swing(T.tap) + swing(T.tap + 0.7), raise = ramp(t, T.tap - 0.5, 0.3) * (1 - ramp(t, T.tap + 1.2, 0.3));
        shoulder.rotation.x = lerp(-0.3, -1.4, smooth(ramp(t, T.craft + 0.3, 0.4))) - 0.8 * raise * (1 - strike);
        bot.userData.head.rotation.z = 0.08 * Math.sin(t * 3);

        // meeting notes pile up at the base and glow
        pile.forEach((p, i) => {
          const k = ramp(t, p.when, 0.45);
          p.c.visible = t > p.when;
          p.c.position.set(PILE.x + p.x, 0.03 + i * 0.062 + (1 - outCubic(k)) * 1.6, PILE.z + p.z);
          p.c.rotation.set(-Math.PI / 2, 0, p.r + (1 - k) * 0.6);
          p.c.scale.setScalar(Math.max(0.0001, clamp(k * 3)));
        });
        const glow = smooth(ramp(t, T.notes, 0.8));
        pileMat.emissiveIntensity = 0.35 * glow * (0.75 + 0.25 * Math.sin(t * 3));
        halo.material.opacity = 0.32 * glow * (0.8 + 0.2 * Math.sin(t * 3));
        halo.scale.setScalar(0.85 + 0.25 * glow + 0.05 * Math.sin(t * 3));

        // tags
        srcTags.forEach((tg, i) => tg.place(() => layerPt(i, W / 2, HS / 2, D / 2), ramp(t, T.items[i] + 0.1, 0.3) * (1 - ramp(t, T.hard, 0.5)), { dx: 16, dy: -26 }));
        tags.craft.place(P(BOT.x, 2.6, BOT.z), ramp(t, T.tap, 0.3) * (1 - ramp(t, T.hard + 0.3, 0.4)), { dx: -120, dy: -40 });
        tags.moat.place(P(PILE.x, 1.4, PILE.z), ramp(t, T.notes, 0.35) * (1 - ramp(t, T.which - 0.2, 0.4)), { dx: -40, dy: -90 });
        tags.ask.place(P(-0.3, stTop + 0.2, -0.9), ramp(t, T.which, 0.4), { dx: -250, dy: -90 });
      },
    };
  },
};

// ---------- a meeting-note texture (green header strip + text lines) ----------
function noteTexture(THREE) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 620; const g = c.getContext("2d");
  g.fillStyle = "#FBFCF8"; g.beginPath(); g.roundRect(0, 0, 512, 620, 30); g.fill();
  g.fillStyle = "#2F7A3C"; g.beginPath(); g.roundRect(0, 0, 512, 120, [30, 30, 0, 0]); g.fill();
  g.fillStyle = "#FFFFFF"; g.font = '900 54px "Clay Sans", sans-serif'; g.textBaseline = "middle"; g.fillText("会议笔记", 36, 62);
  g.fillStyle = "#17221C"; g.font = '700 38px "Clay Sans", sans-serif'; g.fillText("周会 · 产品进度", 36, 182);
  [[0.82, 1], [0.64, 0], [0.74, 1], [0.5, 0], [0.7, 1], [0.42, 0]].forEach(([w, dot], i) => {
    const y = 250 + i * 58;
    if (dot) { g.fillStyle = "#4DB860"; g.beginPath(); g.arc(46, y + 11, 9, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = dot ? "#8D9791" : "#C2CBC5"; g.beginPath(); g.roundRect(dot ? 72 : 72, y, 400 * w, 22, 11); g.fill();
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}

// ---------- the six-layer stack (shared with s11 — keep the two copies in sync) ----------
function buildStack(kit, THREE, parent) {
  const { M } = kit;
  const W = 5.0, D = 3.2, HS = 0.66, PITCH = 1.14;
  const names = [["01", "桌面 App"], ["02", "抓音频"], ["03", "转写"], ["04", "写笔记"], ["05", "跨会议问答"], ["06", "后端 + MCP"]];
  const root = new THREE.Group(); parent.add(root);
  const floorMat = kit.clay(0xF2F5F0, 0.8), screenMat = kit.flat(0x4DB860), paperTex = smallNoteTex(THREE);
  const layers = names.map(([num, name], i) => {
    const g = new THREE.Group(); const baseY = (5 - i) * PITCH; g.position.y = baseY; root.add(g);
    const glass = kit.glass(0x6FB47D, 0.5); glass.emissive.setHex(0x2F7A3C);
    const slab = kit.rbox(W, HS, D, 0.12, glass); slab.position.y = HS / 2; slab.castShadow = false; g.add(slab);
    const floor = kit.rbox(W - 0.16, 0.14, D - 0.16, 0.05, floorMat); floor.position.y = 0.08; g.add(floor);
    const label = kit.card(2.7, 0.52, labelTex(THREE, num, name), { depth: 0.03 }); label.position.set(-W / 2 + 1.5, HS / 2, D / 2 + 0.02); g.add(label);
    const icon = new THREE.Group(); icon.position.set(1.2, 0.15, -0.1); g.add(icon);
    const add = (m, x, y, z) => { m.position.set(x, y, z); icon.add(m); return m; };
    if (i === 0) {           // desktop app: a tiny laptop
      add(kit.rbox(0.8, 0.05, 0.56, 0.02, M.alu), 0, 0.03, 0.1);
      const lid = add(kit.rbox(0.8, 0.46, 0.04, 0.02, M.aluDark), 0, 0.27, -0.2); lid.rotation.x = -0.18;
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.38), screenMat); scr.position.z = 0.025; lid.add(scr);
    } else if (i === 1) {    // audio: mic + speaker
      add(kit.cyl(0.14, 0.16, 0.04, M.dark), -0.3, 0.02, 0); add(kit.cyl(0.03, 0.03, 0.26, M.dark, 10), -0.3, 0.16, 0);
      const cap = add(kit.sphere(0.1, M.mid), -0.3, 0.36, 0); cap.scale.y = 1.35;
      add(kit.rbox(0.36, 0.44, 0.3, 0.06, M.dark), 0.4, 0.22, 0);
    } else if (i === 2) {    // transcription: a waveform turning into text
      [0.14, 0.32, 0.22, 0.42, 0.18].forEach((h, k) => add(kit.rbox(0.09, h, 0.09, 0.03, M.me), -0.55 + k * 0.17, h / 2, 0));
      const p = add(kit.card(0.5, 0.36, paperTex, { depth: 0.02 }), 0.55, 0.2, 0); p.rotation.y = -0.2;
    } else if (i === 3) {    // notes: two note cards
      const a = add(kit.card(0.5, 0.4, paperTex, { depth: 0.02 }), -0.2, 0.22, -0.1); a.rotation.y = 0.15;
      const b = add(kit.card(0.5, 0.4, paperTex, { depth: 0.02 }), 0.35, 0.2, 0.1); b.rotation.y = -0.2;
    } else if (i === 4) {    // cross-meeting Q&A: two chat bubbles
      add(kit.rbox(0.62, 0.34, 0.12, 0.12, M.white), -0.3, 0.3, 0);
      const q = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), kit.flat(0xffffff, { map: kit.textTexture([{ text: "?", size: 200, weight: 900, color: "#2F7A3C" }], { w: 256, h: 256, bg: null, pad: 10, align: "center" }), transparent: true }));
      q.position.set(-0.3, 0.3, 0.065); icon.add(q);
      add(kit.rbox(0.62, 0.34, 0.12, 0.12, M.me), 0.4, 0.2, 0.18);
    } else {                 // backend: three servers
      [-0.55, 0, 0.55].forEach((x) => { add(kit.rbox(0.4, 0.44, 0.4, 0.06, M.dark), x, 0.22, 0); add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), M.meDot), x - 0.1, 0.32, 0.205); });
    }
    return { g, glass, baseY, icon, bob: (t) => { icon.position.y = 0.15 + 0.02 * Math.sin(t * 2.4 + i * 1.3); } };
  });
  return { root, layers, W, D, HS, PITCH };
}
function labelTex(THREE, num, name) {
  const c = document.createElement("canvas"); c.width = 1040; c.height = 200; const g = c.getContext("2d");
  g.fillStyle = "#FBFCF8"; g.beginPath(); g.roundRect(0, 0, 1040, 200, 36); g.fill();
  g.fillStyle = "#2F7A3C"; g.beginPath(); g.roundRect(18, 18, 164, 164, 30); g.fill();
  g.textBaseline = "middle"; g.textAlign = "center"; g.fillStyle = "#FFFFFF"; g.font = '900 92px "Clay Sans", sans-serif'; g.fillText(num, 100, 104);
  g.textAlign = "left"; g.fillStyle = "#17221C"; g.font = '900 104px "Clay Sans", sans-serif'; g.fillText(name, 214, 106);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function smallNoteTex(THREE) {
  const c = document.createElement("canvas"); c.width = 256; c.height = 200; const g = c.getContext("2d");
  g.fillStyle = "#FBFCF8"; g.beginPath(); g.roundRect(0, 0, 256, 200, 18); g.fill();
  g.fillStyle = "#2F7A3C"; g.beginPath(); g.roundRect(0, 0, 256, 46, [18, 18, 0, 0]); g.fill();
  g.fillStyle = "#A9B3AD"; [0.8, 0.6, 0.7].forEach((w, k) => { g.beginPath(); g.roundRect(22, 72 + k * 40, 210 * w, 16, 8); g.fill(); });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
