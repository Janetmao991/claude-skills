// 第 4 层 · 写笔记 — everything goes into one pot (the prompt); your few typed lines are the skeleton, the transcript fills in the flesh.
export default {
  id: "s05",
  eyebrow: "第 4 层 · 写笔记",
  headline: "你写骨架，AI 补血肉",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;
    const FACE = Math.atan2(1, 1.15);

    const T = {
      lid: at("同一口锅") - 0.6, pot: at("同一口锅"),
      ing: [at("转写的文字"), at("参会人"), at("你是谁"), at("笔记模板")],
      key: at("最关键"), sticky: at("随手打的那几行字"), hour: at("一小时"), chat: at("寒暄和重复"),
      ai: at("AI 最难"), judge: at("判断"), care: at("这个我在意"), around: at("围绕"),
      fill: at("从转写里"), bone: at("骨架"), flesh: at("血肉"),
    };

    kit.desk(group);
    const R = P(Math.cos(FACE), 0, -Math.sin(FACE)), D = P(Math.sin(FACE), 0, Math.cos(FACE));   // screen-right / toward-viewer on the desk
    const texOf = (w, h, draw) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    };
    const rr = (g, x, y, w, h, r, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
    const font = (g, w, s) => { g.font = `${w} ${s}px "Clay Sans", sans-serif`; g.textBaseline = "middle"; };

    // ---------- the pot (= the prompt) ----------
    const POT = P(-1.9, 0, 0.45);
    const pot = new THREE.Group(); pot.position.copy(POT); group.add(pot);
    const burner = kit.cyl(1.15, 1.25, 0.14, M.darker); burner.position.y = 0.07; pot.add(burner);
    const coilMat = kit.clay(C.signal, 0.5, { emissive: C.signal, emissiveIntensity: 0.5 });
    const coil = kit.torus(0.95, 0.045, coilMat); coil.rotation.x = Math.PI / 2; coil.position.y = 0.16; pot.add(coil);
    const potMat = kit.clay(C.dark, 0.55);
    const body = kit.cyl(1.3, 1.12, 1.25, potMat, 48); body.position.y = 0.77; pot.add(body);
    const rim = kit.torus(1.3, 0.08, M.mid); rim.rotation.x = Math.PI / 2; rim.position.y = 1.4; pot.add(rim);
    const brothMat = kit.clay(0xE6D08A, 0.6, { emissive: 0x6b5a1a, emissiveIntensity: 0.15 });
    const broth = kit.cyl(1.22, 1.22, 0.04, brothMat, 48); broth.position.y = 1.27; pot.add(broth);
    [-1, 1].forEach((s) => { const h = kit.torus(0.22, 0.06, M.mid); h.position.set(s * 1.38, 1.12, 0); pot.add(h); });
    const lid = new THREE.Group(); group.add(lid);
    lid.add(kit.cyl(1.34, 1.34, 0.1, M.mid, 48));
    const lidKnob = kit.sphere(0.15, M.dark); lidKnob.position.y = 0.13; lid.add(lidKnob);
    const ripple = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.035, 10, 64), kit.flat(0xFFFFFF, { transparent: true, depthWrite: false }));
    ripple.rotation.x = Math.PI / 2; ripple.position.set(POT.x, 1.31, POT.z); group.add(ripple);
    const steam = []; for (let i = 0; i < 5; i++) { const s = kit.sphere(0.2, M.white); group.add(s); steam.push(s); }

    // ---------- ingredients (each drops into the pot when named) ----------
    const stripTex = (lab, col, text) => texOf(720, 144, (g, w, h) => {
      rr(g, 0, 0, w, h, 18, "#FBFCF8");
      rr(g, 22, 34, 120, 76, 14, col); font(g, 700, 38); g.fillStyle = "#FFFFFF"; g.textAlign = "center"; g.fillText(lab, 82, 73);
      g.textAlign = "left";
      if (text) { font(g, 900, 60); g.fillStyle = "#17221C"; g.fillText(text, 170, 74); }
      else { rr(g, 170, 42, 420, 22, 11, "#B5BDB8"); rr(g, 170, 80, 300, 22, 11, "#B5BDB8"); }
    });
    const ingTranscript = new THREE.Group();
    [["Them", "#5E6963", "转写的文字"], ["Me", "#2F7A3C", null], ["Them", "#5E6963", null]].forEach(([l, c, x], i) => {
      const s = kit.card(1.9, 0.38, stripTex(l, c, x)); s.position.set(i * 0.12, -i * 0.46, -i * 0.02); ingTranscript.add(s);
    });
    const calTex = texOf(512, 416, (g, w, h) => {
      rr(g, 0, 0, w, h, 26, "#FBFCF8"); g.fillStyle = "#C2410C"; g.beginPath(); g.roundRect(0, 0, w, 116, [26, 26, 0, 0]); g.fill();
      font(g, 900, 58); g.fillStyle = "#FFFFFF"; g.textAlign = "left"; g.fillText("参会人", 36, 60);
      ["#2F7A3C", "#8D9791", "#C9B59A", "#4DB860"].forEach((c, i) => {
        const x = 78 + i * 118; g.fillStyle = c; g.beginPath(); g.arc(x, 220, 44, 0, Math.PI * 2); g.fill();
        g.fillStyle = "#FFFFFF"; g.beginPath(); g.arc(x, 208, 15, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(x, 246, 24, 14, 0, Math.PI, 0); g.fill();
        rr(g, x - 40, 290, 80, 18, 9, "#C9D0CB"); rr(g, x - 28, 322, 56, 14, 7, "#DDE2DE");
      });
    });
    const ingCal = kit.card(1.7, 1.38, calTex);
    const badgeTex = texOf(384, 512, (g, w, h) => {
      rr(g, 0, 0, w, h, 30, "#FBFCF8"); rr(g, 142, 26, 100, 22, 11, "#C9D0CB");
      g.fillStyle = "#2F7A3C"; g.beginPath(); g.arc(192, 160, 70, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#F4F7F2"; g.beginPath(); g.arc(192, 140, 26, 0, Math.PI * 2); g.fill(); g.beginPath(); g.ellipse(192, 205, 44, 26, 0, Math.PI, 0); g.fill();
      g.textAlign = "center"; font(g, 900, 62); g.fillStyle = "#17221C"; g.fillText("你是谁", 192, 290);
      font(g, 500, 36); g.fillStyle = "#5E6963"; g.fillText("做什么工作", 192, 360);
      rr(g, 0, 430, w, 82, [0, 0, 30, 30], "#2F7A3C");
    });
    const ingBadge = new THREE.Group();
    ingBadge.add(kit.card(1.05, 1.4, badgeTex));
    const lanyard = kit.rbox(0.08, 0.6, 0.03, 0.02, M.me); lanyard.position.set(0, 0.95, -0.02); ingBadge.add(lanyard);
    const tmplTex = texOf(448, 512, (g, w, h) => {
      rr(g, 0, 0, w, h, 26, "#FBFCF8");
      font(g, 900, 56); g.fillStyle = "#17221C"; g.textAlign = "left"; g.fillText("笔记模板", 34, 62);
      [["· 决定", 160], ["· 待办", 280], ["· 下一步", 400]].forEach(([s, y]) => {
        font(g, 700, 40); g.fillStyle = "#2F7A3C"; g.fillText(s, 34, y);
        rr(g, 56, y + 34, 300, 16, 8, "#DDE2DE"); rr(g, 56, y + 60, 220, 16, 8, "#DDE2DE");
      });
    });
    const ingTmpl = kit.card(1.4, 1.6, tmplTex);
    const ings = [ingTranscript, ingCal, ingBadge, ingTmpl];
    ings.forEach((o) => { o.rotation.order = "YXZ"; group.add(o); });
    const HOV = P(POT.x, 3.15, POT.z);
    const ingWin = T.ing.map((a, i) => {
      const end = i < 3 ? Math.min(T.ing[i + 1] - 0.15, a + 1.8) : Math.min(a + 1.5, T.key - 0.2);
      return [a - 0.25, end];
    });

    // ---------- the notebook: your typed lines (sticky notes) ----------
    const nb = new THREE.Group(); nb.position.set(2.35, 0, -0.55); nb.rotation.y = FACE; group.add(nb);
    const tilt = new THREE.Group(); tilt.position.set(0, 0.12, 0.3); tilt.rotation.x = -0.26; nb.add(tilt);
    const cover = kit.rbox(3.35, 4.05, 0.12, 0.08, M.dark); cover.position.set(0, 1.97, -0.1); tilt.add(cover);
    const ruled = texOf(620, 740, (g, w, h) => {
      rr(g, 0, 0, w, h, 14, "#FBFCF8");
      g.strokeStyle = "#E1E7E2"; g.lineWidth = 3; for (let y = 60; y < h; y += 46) { g.beginPath(); g.moveTo(24, y); g.lineTo(w - 24, y); g.stroke(); }
      g.strokeStyle = "#E9C7B8"; g.beginPath(); g.moveTo(40, 0); g.lineTo(40, h); g.stroke();
    });
    const page = kit.card(3.15, 3.85, ruled, { depth: 0.05 }); page.position.set(0, 1.97, 0); tilt.add(page);
    for (let i = 0; i < 7; i++) { const ring = kit.torus(0.1, 0.025, M.alu); ring.rotation.y = Math.PI / 2; ring.position.set(-1.35 + i * 0.45, 3.92, -0.02); tilt.add(ring); }
    const leg = kit.rbox(0.16, 2.5, 0.16, 0.05, M.dark); leg.position.set(0, 1.15, -1.3); leg.rotation.x = 0.5; nb.add(leg);

    const SY = [3.15, 2.0, 0.85], SX = -0.82;
    const stickyText = ["定价太高？", "Q3 上线", "跟进 Sarah"];
    const stickies = stickyText.map((txt, i) => {
      const g = new THREE.Group(); tilt.add(g);
      const mat = kit.clay(C.sticky, 0.8, { emissive: C.meLight, emissiveIntensity: 0 });
      const tex = kit.textTexture([{ text: txt, size: 60, weight: 900 }], { w: 400, h: 200, bg: "#F3DE7A", pad: 66, radius: 10 });
      const card = kit.card(1.3, 0.65, tex, { depth: 0.03, mat }); g.add(card);
      const glowMat = kit.clay(C.meLight, 0.4, { emissive: C.meLight, emissiveIntensity: 0.9 });
      const glow = kit.rbox(1.46, 0.81, 0.02, 0.06, glowMat); glow.position.z = -0.02; g.add(glow);
      return { g, mat, glow, glowMat, x: SX, y: SY[i], tz: [-0.05, 0.035, -0.025][i] };
    });

    // ---------- detail lines: they wait in the transcript pile, then fly under each sticky ----------
    const detail = [["客户嫌年费贵，想要月付", "竞品便宜 20%"], ["工程说 9 月中能交付", "先给 5 家客户试用"], ["周五前发报价单", "约下周再演示一次"]];
    const lineTex = (s) => texOf(1000, 68, (g, w, h) => { rr(g, 0, 0, w, h, 10, "#F1F4F0"); font(g, 700, 42); g.fillStyle = "#5E6963"; g.textAlign = "left"; g.fillText(s, 22, 36); });
    nb.updateMatrixWorld(true);
    const tq = new THREE.Quaternion(); tilt.getWorldQuaternion(tq);
    const PILE = P(0.45, 0, 2.2);
    const rnd = kit.rng(7);
    const lines = [];
    detail.forEach((pair, si) => pair.forEach((s, k) => {
      const m = kit.card(2.5, 0.17, lineTex(s), { depth: 0.02 }); group.add(m);
      const target = tilt.localToWorld(P(SX - 0.65 + 1.25, SY[si] - 0.48 - k * 0.21, 0.05));
      const j = lines.length;
      const home = PILE.clone().addScaledVector(R, -0.9 + (j % 3) * 0.75 + rnd() * 0.2).addScaledVector(D, 0.35 + Math.floor(j / 3) * 0.32);
      home.y = 0.03 + j * 0.012;
      const hq = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, FACE - 0.25 + rnd() * 0.5));
      lines.push({ m, target, home, hq, at: T.fill + 0.15 + j * 0.3 });
    }));
    const chatTex = (s) => texOf(500, 200, (g, w, h) => { rr(g, 0, 0, w, h, 22, "#EEF1EC"); font(g, 900, 84); g.fillStyle = "#5E6963"; g.textAlign = "center"; g.fillText(s, w / 2, h / 2 + 4); });
    const chatter = ["哈哈", "嗯嗯", "能听到吗？", "那个…"].map((s, i) => {
      const mat = kit.clay(0xEEF1EC, 0.85);
      const c = kit.card(1.25, 0.5, chatTex(s), { mat }); c.rotation.order = "YXZ"; group.add(c);
      const pos = PILE.clone().addScaledVector(R, -1.05 + i * 0.7).addScaledVector(D, -0.25 - (i % 2) * 0.28); pos.y = 0.3 + (i % 2) * 0.12;
      return { c, mat, face: c.children[1].material, pos, rz: [0.12, -0.08, 0.05, -0.14][i], ry: FACE + [0.1, -0.05, 0.08, -0.1][i], at: T.hour + 0.15 + i * 0.18 };
    });

    // ---------- the AI, unsure what matters ----------
    const bot = kit.robot(); bot.position.set(2.05, 0, 1.8); group.add(bot);
    const qTex = kit.textTexture([{ text: "?", size: 120, weight: 900, color: "#C2410C" }], { w: 160, h: 160, align: "center", pad: 12, radius: 80 });
    const eTex = kit.textTexture([{ text: "!", size: 120, weight: 900, color: "#FFFFFF" }], { w: 160, h: 160, align: "center", pad: 12, radius: 80, bg: "#2F7A3C" });
    const qMark = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), kit.flat(0xffffff, { map: qTex, transparent: true })); group.add(qMark);
    const eMark = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.55), kit.flat(0xffffff, { map: eTex, transparent: true })); group.add(eMark);

    const tags = {
      pot: tag("一口锅<small>= 发给 AI 的提示词</small>", "dark"),
      key: tag("最关键<small>你随手打的字</small>", "signal"),
      chat: tag("寒暄和重复<small>占了大半</small>", "them"),
      care: tag("这个我在意", "me"),
      bone: tag("骨架", "me big"),
      flesh: tag("血肉<small>AI 从转写里补</small>", "them"),
    };
    const sw = (t) => tilt.localToWorld(P(SX, SY[0], 0.1));
    const _q = new THREE.Quaternion();

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 4.3, P(-1.4, 1.4, 0.4)], [T.lid, 4.1, P(-1.7, 1.7, 0.4)], [T.ing[0], 3.5, P(-1.8, 2.3, 0.4)], [T.ing[3] + 0.8, 3.6, P(-1.7, 2.3, 0.4)],
          [T.sticky, 4.3, P(1.5, 1.9, -0.3)], [T.chat, 4.8, P(0.7, 1.4, 0.5)], [T.care, 4.4, P(1.4, 1.7, 0.0)],
          [T.fill + 0.6, 4.7, P(1.2, 1.5, 0.3)], [ctx.dur, 4.3, P(1.8, 1.65, -0.1)],
        ]);

        // pot: lid off, things splash in, steam rises
        const lidK = smooth(ramp(t, T.lid, 1.1));
        lid.position.set(lerp(POT.x, -4.0, lidK), 1.47 + Math.sin(Math.PI * lidK) * 1.1 - lidK * 1.41, lerp(POT.z, -1.2, lidK));
        lid.rotation.z = 0.25 * Math.sin(Math.PI * lidK);
        coilMat.emissiveIntensity = 0.45 + 0.25 * Math.sin(t * 3);
        const steamK = ramp(t, T.lid + 0.6, 0.8);
        steam.forEach((s, i) => {
          const a = ((t * 0.32 + i / 5) % 1 + 1) % 1;
          s.position.set(POT.x + Math.sin(i * 2.3 + t) * 0.35 + a * 0.3, 1.45 + a * 1.6, POT.z + Math.cos(i * 1.7) * 0.3);
          s.scale.setScalar(Math.max(0.0001, Math.sin(Math.PI * a) * (0.6 + a) * steamK * (1 - 0.6 * window01(t, T.ing[0] - 0.4, T.ing[3] + 1.6))));
        });
        let splash = 0;
        ings.forEach((o, i) => {
          const [a, b] = ingWin[i], inK = outBack(ramp(t, a, 0.45)), dropK = clamp((t - b) / 0.45);
          o.visible = t > a && dropK < 1;
          const bob = 0.05 * Math.sin(t * 2.5 + i);
          o.position.set(HOV.x, lerp(HOV.y + 0.6 * (1 - inK), 1.35, dropK * dropK) + bob, HOV.z);
          o.rotation.set(-0.12 + dropK * 0.9, FACE + 0.05, dropK * 0.6 * (i % 2 ? 1 : -1));
          o.scale.setScalar(Math.max(0.0001, 1.35 * inK * (1 - 0.75 * dropK)));
          splash = Math.max(splash, window01(t, b + 0.4, b + 0.75, 0.12));
        });
        const lastDrop = ingWin.map(([, b]) => b + 0.45).filter((x) => x < t).pop();
        const rk = lastDrop === undefined ? 1 : clamp((t - lastDrop) / 0.9);
        ripple.visible = lastDrop !== undefined && rk < 1; ripple.scale.setScalar(0.4 + rk * 2.0); ripple.material.opacity = (1 - rk) * 0.8;
        broth.position.y = 1.27 + 0.02 * ings.filter((o, i) => t > ingWin[i][1] + 0.45).length + 0.03 * splash;
        pot.scale.set(1 + 0.04 * splash, 1 - 0.03 * splash, 1 + 0.04 * splash);

        // notebook + sticky notes
        nb.scale.setScalar(pop(t, T.key, 0.6)); nb.updateMatrixWorld(true);
        stickies.forEach((s, i) => {
          const a = T.sticky + 0.1 + i * 0.55, k = outBack(ramp(t, a, 0.5));
          s.g.visible = t > a;
          s.g.position.set(s.x + 0.45 * (1 - k), s.y + 0.4 * (1 - k), 0.05 + 1.5 * (1 - clamp(k)));
          s.g.rotation.z = s.tz + 0.5 * (1 - k);
          const careK = ramp(t, T.care + i * 0.12, 0.3);
          const pulse = 0.5 + 0.5 * Math.sin((t - T.care) * 7 - i);
          s.mat.emissiveIntensity = careK * (0.18 + 0.22 * pulse) * (1 - 0.6 * ramp(t, T.fill + 1.5, 1));
          s.glow.visible = careK > 0; s.glow.scale.setScalar(Math.max(0.0001, careK * (1 + 0.05 * pulse)));
          s.glowMat.emissiveIntensity = 0.4 + 0.6 * pulse;
          s.g.scale.setScalar(1 + 0.08 * window01(t, T.care + i * 0.12, T.care + 0.5 + i * 0.12, 0.2));
        });

        // the transcript pile: chatter greys out and sinks; the useful lines fly to the notebook
        chatter.forEach((c, i) => {
          const k = outBack(ramp(t, c.at, 0.45)), g = smooth(ramp(t, T.chat + 0.2 + i * 0.12, 0.45)), sink = smooth(ramp(t, T.chat + 1.2 + i * 0.15, 1.1));
          c.c.visible = t > c.at && sink < 1;
          c.c.position.copy(c.pos); c.c.position.y += -0.55 * sink + 0.04 * Math.sin(t * 3 + i) * (1 - g);
          c.c.rotation.set(-0.55, c.ry, c.rz);
          c.c.scale.setScalar(Math.max(0.0001, k * (1 - 0.6 * sink)));
          c.mat.color.setHex(0xEEF1EC).lerp(new THREE.Color(0x9AA29D), g);
          c.face.color.setHex(0xffffff).lerp(new THREE.Color(0x8F9893), g);
        });
        lines.forEach((l, j) => {
          const appear = pop(t, T.hour + 0.4 + j * 0.1, 0.4), f = clamp((t - l.at) / 0.7), fk = inOutQ(f);
          l.m.visible = t > T.hour + 0.4 + j * 0.1;
          l.m.position.lerpVectors(l.home, l.target, fk); l.m.position.y += Math.sin(Math.PI * f) * 1.6;
          l.m.quaternion.slerpQuaternions(l.hq, tq, fk);
          const snap = f >= 1 ? 1 + 0.12 * (1 - ramp(t, l.at + 0.7, 0.3)) : 1;
          l.m.scale.setScalar(appear * snap);
        });

        // the AI looks back and forth, unsure, until your lines tell it what matters
        bot.scale.setScalar(pop(t, T.ai - 0.2, 0.5) * 1.05);
        const look = t < T.care ? Math.sin((t - T.ai) * 2.2) * 0.9 : lerp(Math.sin((T.care - T.ai) * 2.2) * 0.9, 1.5, smooth(ramp(t, T.care, 0.5)));
        bot.userData.head.rotation.y = look; bot.rotation.y = 0.15;
        const busy = window01(t, T.fill, T.bone, 0.3);
        bot.userData.arms.forEach((a, i) => { a.rotation.x = -busy * (1.2 + 0.4 * Math.sin(t * 9 + i * Math.PI)); });
        bot.position.y = 0.06 * busy * Math.abs(Math.sin(t * 8));
        const qk = window01(t, T.judge - 0.2, T.care, 0.3), ek = window01(t, T.care + 0.1, T.fill + 1.2, 0.3);
        [[qMark, qk], [eMark, ek]].forEach(([m, k]) => {
          m.visible = k > 0.001; m.position.set(bot.position.x, 2.2 + 0.06 * Math.sin(t * 4), bot.position.z);
          camera.getWorldQuaternion(_q); m.quaternion.copy(_q); m.scale.setScalar(Math.max(0.0001, outBack(k)));
        });

        // tags
        tags.pot.place(P(POT.x, 1.5, POT.z + 1.3), ramp(t, T.pot, 0.3) * (1 - ramp(t, T.key - 0.2, 0.4)), { dx: -140, dy: 30 });
        tags.key.place(tilt.localToWorld(P(0.2, 3.95, 0)), ramp(t, T.sticky + 1.4, 0.3) * (1 - ramp(t, T.chat, 0.4)), { dx: -80, dy: -80 });
        tags.chat.place(PILE.clone().add(P(0, 0.9, 0)), ramp(t, T.chat + 0.2, 0.3) * (1 - ramp(t, T.care - 0.4, 0.4)), { dx: -150, dy: -80 });
        tags.care.place(tilt.localToWorld(P(1.55, 3.3, 0)), ramp(t, T.care, 0.3) * (1 - ramp(t, T.fill + 0.4, 0.4)), { dx: 20, dy: -30 });
        tags.bone.place(sw(), ramp(t, T.bone, 0.3), { dx: -190, dy: -40 });
        tags.flesh.place(tilt.localToWorld(P(1.2, 1.3, 0.05)), ramp(t, T.flesh, 0.3), { dx: 40, dy: -10 });
      },
    };
    function inOutQ(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  },
};
