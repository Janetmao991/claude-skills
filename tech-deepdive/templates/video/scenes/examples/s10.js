// 成本 — a balance scale: per-user monthly cost (transcription tower + tiny LLM stack) vs the $14 subscription.
export default {
  id: "s10",
  eyebrow: "成本",
  headline: "最贵的是转写",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    const T = {
      user: at("那一个用户"), hour: at("一小时会议"), price: at("转写就要"), notes: at("写笔记"),
      founder: at("创始人"), expensive: at("最贵的是转写"), notLLM: at("不是大模型"),
      near: at("接近"), fourteen: at("十四美元"), factory: at("小工厂"), piece: at("最贵的那一块"), zero: at("变成零"),
    };
    const YAW = Math.atan2(1, 1.15);   // local x → screen right, local z → camera
    const canvasTex = (w, h, draw) => {
      const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); draw(g, w, h);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
    };

    kit.desk(group);

    // ---------- the balance scale ----------
    const S = new THREE.Group(); S.position.set(0.5, 0, -0.5); S.rotation.y = YAW; group.add(S);
    const base = kit.rbox(1.9, 0.28, 1.3, 0.12, M.dark); base.position.y = 0.14;
    const base2 = kit.rbox(1.2, 0.18, 0.8, 0.08, M.darker); base2.position.y = 0.37;
    const pillar = kit.cyl(0.11, 0.16, 2.95, M.alu, 24); pillar.position.y = 1.9;
    const PIV = 3.35, ARM = 2.35, HANG = 1.55;
    const cap = kit.sphere(0.2, M.aluDark); cap.position.y = PIV;
    S.add(base, base2, pillar, cap);
    // dial: fixed half-disc with a level tick, the needle turns with the beam
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.62, 40, 0, Math.PI), kit.clay(C.white, 0.8)); dial.position.set(0, PIV + 0.05, -0.14); S.add(dial);
    const tick = kit.rbox(0.05, 0.2, 0.03, 0.01, M.signal); tick.position.set(0, PIV + 0.58, -0.11); S.add(tick);
    const beam = new THREE.Group(); beam.position.y = PIV; S.add(beam);
    const beamBar = kit.rbox(ARM * 2 + 0.2, 0.14, 0.2, 0.06, M.alu); beam.add(beamBar);
    const needle = kit.rbox(0.06, 0.55, 0.04, 0.02, M.darker); needle.position.set(0, 0.3, 0.06); beam.add(needle);
    [-ARM, ARM].forEach((x) => { const h = kit.sphere(0.1, M.aluDark); h.position.x = x; beam.add(h); });

    const panMat = kit.clay(0xD5DBD7, 0.5), strMat = kit.clay(0x7C8780, 0.6);
    const makePan = () => {
      const g = new THREE.Group(); S.add(g);
      const dish = kit.cyl(0.98, 0.78, 0.12, panMat, 48); dish.position.y = -HANG; g.add(dish);
      [0, 1, 2].forEach((i) => {
        const a = i * Math.PI * 2 / 3 + 0.4, end = P(Math.cos(a) * 0.86, -HANG + 0.06, Math.sin(a) * 0.86);
        const s = kit.cyl(0.015, 0.015, end.length(), strMat, 6); s.position.copy(end).multiplyScalar(0.5);
        s.quaternion.setFromUnitVectors(P(0, 1, 0), end.clone().normalize().negate()); g.add(s);
      });
      return g;
    };
    const panL = makePan(), panR = makePan();
    const PAN_TOP = -HANG + 0.06;

    // coins
    const coinGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 36);
    const goldTower = kit.clay(0xE2B13C, 0.4, { metalness: 0.25, emissive: C.signal, emissiveIntensity: 0 });
    const gold = kit.clay(0xE2B13C, 0.4, { metalness: 0.25 });
    const NT = 14, CH = 0.105;
    const tower = []; for (let i = 0; i < NT; i++) { const c = kit.shadowed(new THREE.Mesh(coinGeo, goldTower)); panL.add(c); tower.push(c); }
    const notes = []; for (let i = 0; i < 2; i++) { const c = kit.shadowed(new THREE.Mesh(coinGeo, gold)); c.scale.set(0.62, 1, 0.62); panL.add(c); notes.push(c); }
    const TX = -0.28, NX = 0.5;
    // the big $14 coin, standing upright facing the camera
    const big = new THREE.Group(); panR.add(big);
    const bigBody = kit.cyl(0.68, 0.68, 0.18, gold, 56); bigBody.rotation.x = Math.PI / 2; big.add(bigBody);
    const bigTex = canvasTex(400, 400, (g, w, h) => {
      g.fillStyle = "#E9BF55"; g.beginPath(); g.arc(200, 200, 196, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#B8862A"; g.lineWidth = 10; g.beginPath(); g.arc(200, 200, 168, 0, Math.PI * 2); g.stroke();
      g.fillStyle = "#6E4E12"; g.textAlign = "center"; g.textBaseline = "middle";
      g.font = `900 150px "Clay Sans", sans-serif`; g.fillText("$14", 200, 186);
      g.font = `700 46px "Clay Sans", sans-serif`; g.fillText("每月", 200, 290);
    });
    const bigFace = new THREE.Mesh(new THREE.CircleGeometry(0.66, 56), kit.flat(0xffffff, { map: bigTex })); bigFace.position.z = 0.092; big.add(bigFace);
    const BIG_REST = PAN_TOP + 0.68;

    // ---------- one user ----------
    const user = new THREE.Group(); user.position.set(2.5, 0, 1.75); S.add(user);
    const ub = kit.cyl(0.18, 0.28, 0.6, M.me, 24); ub.position.y = 0.3;
    const uh = kit.sphere(0.22, M.me); uh.position.y = 0.8;
    user.add(ub, uh);

    // ---------- the little local factory on a laptop ----------
    const scrTex = canvasTex(512, 320, (g, w, h) => {
      g.fillStyle = "#1E2622"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#4DB860"; [0, 1, 2, 3, 4].forEach((i) => { g.fillRect(40, 50 + i * 48, 120 + ((i * 97) % 230), 18); });
    });
    const lap = kit.laptop(scrTex, { w: 2.0, d: 1.45 }); lap.group.position.set(-2.75, 0, 1.75); lap.group.rotation.y = 0.3; S.add(lap.group);
    const fac = new THREE.Group(); fac.position.set(0, 0.17, 0.12); lap.group.add(fac);
    const facBody = kit.rbox(1.05, 0.48, 0.62, 0.06, M.me); facBody.position.y = 0.24; fac.add(facBody);
    [-0.26, 0.26].forEach((x) => { const r = kit.rbox(0.5, 0.08, 0.66, 0.03, M.meDeep); r.position.set(x, 0.53, 0); r.rotation.z = 0.32; fac.add(r); });
    const win = kit.rbox(0.8, 0.12, 0.02, 0.02, kit.clay(C.sticky, 0.5, { emissive: 0xB89A2A, emissiveIntensity: 0.5 })); win.position.set(0, 0.26, 0.315); fac.add(win);
    const chim = kit.cyl(0.08, 0.1, 0.6, M.dark, 16); chim.position.set(0.36, 0.72, -0.12); fac.add(chim);
    const smokeMat = kit.clay(0xF6F8F4, 0.9, { transparent: true, opacity: 0.85 });
    const smoke = [0, 1, 2].map(() => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 10), smokeMat.clone()); fac.add(s); return s; });

    const tags = {
      user: tag("每位用户<small>每个月</small>", "me"),
      tr: tag("转写<small>$0.30–0.92 / 小时</small>", ""),
      notes: tag("写笔记<small>几美分</small>", "them"),
      sub: tag("$14 订阅<small>每月</small>", "dark"),
      fac: tag("电脑里的小工厂", "brand"),
      zero: tag("最贵的一块 → 0", "me big"),
    };
    const wob = (t, e, amp) => (t > e ? amp * Math.exp(-(t - e) * 2.2) * Math.sin((t - e) * 7) : 0);
    const _v = new THREE.Vector3();

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 4.7, P(0.4, 2.0, -0.3)], [T.hour - 0.2, 4.5, P(0.3, 2.0, -0.2)],
          [T.notes + 1.0, 3.9, P(-0.6, 2.3, 0.4)], [T.notLLM + 0.5, 4.0, P(-0.4, 2.2, 0.3)],
          [T.fourteen + 1.0, 4.4, P(0.4, 2.1, -0.2)], [T.factory + 0.8, 4.7, P(0.0, 1.8, 0.4)], [ctx.dur, 4.5, P(0.0, 1.85, 0.4)],
        ]);
        camera.updateMatrixWorld();   // tags project with this frame's camera, not the last one
        const sK = pop(t, 0.25, 0.6); S.scale.setScalar(sK * 1.08);

        // coins land one by one on the left pan
        const coinT = (i) => T.hour + 0.15 + i * 0.2;
        const zeroK = (i) => smooth(ramp(t, T.zero + 0.1 + (NT - 1 - i) * 0.07, 0.35));   // tower melts from the top down
        let landed = 0;
        tower.forEach((c, i) => {
          const k = ramp(t, coinT(i), 0.32), z = zeroK(i);
          c.visible = t > coinT(i) && z < 1;
          const fall = 1 - outBack(k);
          c.position.set(TX + Math.sin(i * 2.1) * 0.02, PAN_TOP + 0.05 + i * CH + fall * 1.4, Math.cos(i * 1.7) * 0.02);
          c.scale.setScalar(Math.max(0.0001, (1 - z) * clamp(k * 3)));
          landed += clamp(k * 1.5) * (1 - z);
        });
        notes.forEach((c, i) => {
          const a = T.notes + 0.25 + i * 0.25, k = ramp(t, a, 0.32);
          c.visible = t > a;
          const bounce = window01(t, T.notLLM, T.notLLM + 0.4, 0.15) * 0.12 * (i + 1);
          c.position.set(NX, PAN_TOP + 0.05 + i * CH + (1 - outBack(k)) * 1.2 + bounce, 0.15);
          c.scale.set(0.62 * clamp(k * 3) + 0.0001, 1, 0.62 * clamp(k * 3) + 0.0001);
        });
        // tower glows signal orange at "最贵的是转写"
        const glow = ramp(t, T.expensive, 0.4) * (1 - ramp(t, T.zero, 0.6));
        goldTower.color.setHex(0xE2B13C).lerp(new THREE.Color(C.signal), glow * 0.8);
        goldTower.emissiveIntensity = glow * (0.35 + 0.2 * Math.sin(t * 6));
        // the $14 coin drops onto the right pan
        const bK = ramp(t, T.fourteen - 0.15, 0.45);
        big.visible = t > T.fourteen - 0.15;
        big.position.set(0, BIG_REST + (1 - outBack(bK)) * 1.8, 0);
        big.scale.setScalar(Math.max(0.0001, clamp(bK * 2.5)));
        big.rotation.y = Math.sin(t * 1.4) * 0.12;

        // beam angle: positive = left pan down
        const coinFrac = landed / NT;
        let ang = 0.24 * coinFrac + 0.03 * ramp(t, T.notes + 0.25, 0.6);
        ang = lerp(ang, -0.03 - 0.27 * (1 - coinFrac), smooth(ramp(t, T.fourteen + 0.15, 1.3)));
        ang += wob(t, 0.25, 0.18) + wob(t, T.fourteen + 0.25, 0.07) + wob(t, T.zero + 1.4, 0.05) + Math.sin(t * 1.9) * 0.006;
        beam.rotation.z = ang;
        panL.position.set(-ARM * Math.cos(ang), PIV - ARM * Math.sin(ang), 0);
        panR.position.set(ARM * Math.cos(ang), PIV + ARM * Math.sin(ang), 0);

        // the user, the factory
        user.visible = t > T.user - 0.1; user.scale.setScalar(pop(t, T.user - 0.1, 0.5));
        user.position.y = Math.abs(Math.sin(t * 2.4)) * 0.08 * (1 - ramp(t, T.hour + 1, 0.5));
        const fK = pop(t, T.factory - 0.2, 0.55); lap.group.visible = t > T.factory - 0.25; lap.group.scale.setScalar(fK);
        lap.hinge.rotation.x = lerp(1.1, -0.25, smooth(ramp(t, T.factory - 0.1, 0.7)));
        fac.scale.setScalar(pop(t, T.factory + 0.35, 0.5));
        smoke.forEach((s, i) => {
          const ph = (((t - T.factory) * 0.55 + i / 3) % 1 + 1) % 1;
          s.visible = t > T.factory + 0.6;
          s.position.set(0.36 + ph * 0.25, 1.05 + ph * 0.75, -0.12 - ph * 0.1);
          s.scale.setScalar(0.8 + ph * 1.6); s.material.opacity = 0.95 * (1 - ph) * ramp(t, T.factory + 0.6, 0.5);
        });
        win.material.emissiveIntensity = 0.4 + 0.3 * Math.sin(t * 4) * ramp(t, T.zero, 0.5);

        // tags
        S.updateMatrixWorld(true);
        const towerTop = panL.localToWorld(_v.set(TX, PAN_TOP + NT * CH, 0)).clone();
        tags.user.place(S.localToWorld(P(2.5, 1.1, 1.75)), window01(t, T.user + 0.1, T.hour + 0.6), { dx: 30, dy: -60 });
        tags.tr.place(towerTop, ramp(t, T.price, 0.3) * (1 - ramp(t, T.zero, 0.3)), { dx: -330, dy: -80, scale: 1 + 0.12 * glow });
        tags.notes.place(panL.localToWorld(P(NX, PAN_TOP, 0.15)), ramp(t, T.notes + 0.3, 0.3) * (1 - ramp(t, T.factory, 0.4)), { dx: -20, dy: 70 });
        tags.sub.place(panR.localToWorld(P(0, BIG_REST + 0.7, 0)), ramp(t, T.fourteen + 0.25, 0.3), { dx: 10, dy: -80 });
        tags.fac.place(lap.group.localToWorld(P(-0.6, 1.75, 0)), ramp(t, T.factory + 0.4, 0.3) * (1 - ramp(t, T.zero - 0.2, 0.3)), { dx: -300, dy: -60 });
        tags.zero.place(panL.localToWorld(P(TX, PAN_TOP + 0.4, 0)), ramp(t, T.zero + 0.5, 0.35), { dx: -330, dy: -110 });
      },
    };
  },
};
