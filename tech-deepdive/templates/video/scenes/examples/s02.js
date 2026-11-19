// 第 1 层 · 桌面 App — a web page in an Electron glass shell, plus native "robot arms" for the low-level stuff.
export default {
  id: "s02",
  eyebrow: "第 1 层 · 桌面 App",
  headline: "网页外壳 + 原生插件",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    const T = {
      lap: 0.2, electron: at("Electron"), wrap: at("网页包装"),
      slack: at("Slack"), notion: at("Notion"), cursor: at("Cursor"),
      code: at("一套代码"), os: at("Mac 和 Windows"), fast: at("迭代快"),
      wall: at("碰不到电脑的底层"), plugins: at("原生小插件"), hands: at("机械手"),
      mic: at("拿麦克风"), cal: at("读日历"), zoom: at("盯着 Zoom 窗口"), live: at("看会议"),
      face: at("脸和大脑"), feet: at("手和脚"),
    };
    const LAP = P(-0.4, 0, -1.4);

    kit.desk(group);
    // the laptop running the Granola app
    const lap = kit.laptop(appScreenTexture(THREE)); lap.group.position.copy(LAP); group.add(lap.group);
    group.updateMatrixWorld(true);

    // ---------- Electron: a glass browser shell over the screen ----------
    const anchor = new THREE.Object3D(); anchor.position.set(0, 3.2 * 0.325, 0.16); lap.hinge.add(anchor);
    group.updateMatrixWorld(true);
    const shellRest = anchor.getWorldPosition(new THREE.Vector3()), shellQ = anchor.getWorldQuaternion(new THREE.Quaternion());
    const shell = new THREE.Group(); group.add(shell);
    const shellGlass = kit.glass(0xA8D8B4, 0.42); shellGlass.emissive.setHex(0x2F7A3C);
    const pane = kit.rbox(3.08, 1.98, 0.07, 0.06, shellGlass); pane.castShadow = false; shell.add(pane);
    const bar = kit.rbox(3.08, 0.26, 0.12, 0.06, M.white); bar.position.set(0, 1.1, 0); shell.add(bar);
    [C.signal, C.sticky, C.meLight].forEach((c, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), kit.clay(c, 0.5)); d.position.set(-1.36 + i * 0.17, 1.1, 0.065); shell.add(d); });
    [[-1.5, 0, 0.07, 1.98], [1.5, 0, 0.07, 1.98], [0, -0.96, 3.08, 0.07]].forEach(([x, y, w, h]) => { const f = kit.rbox(w, h, 0.1, 0.03, M.white); f.position.set(x, y, 0); shell.add(f); });
    const addr = kit.rbox(1.5, 0.12, 0.04, 0.05, kit.clay(0xE4EAE3, 0.8)); addr.position.set(0.2, 1.1, 0.065); shell.add(addr);
    const HIT = P(-0.4, 1.25, -0.42);

    // ---------- other Electron apps: generic lettered blocks ----------
    const apps = [["S", C.plum, "#FFFFFF", P(2.3, 0, -2.0), T.slack], ["N", C.white, "#17221C", P(3.5, 0, -2.6), T.notion], ["C", C.dark, "#FFFFFF", P(4.7, 0, -3.1), T.cursor]].map(([ch, col, ink, pos, when]) => {
      const g = new THREE.Group(); g.position.copy(pos); group.add(g);
      const cube = kit.rbox(0.9, 0.9, 0.9, 0.2, kit.clay(col, 0.6)); cube.position.y = 0.45; g.add(cube);
      const strip = kit.rbox(0.9, 0.12, 0.9, 0.05, M.white); strip.position.y = 0.96; g.add(strip);
      const tex = kit.textTexture([{ text: ch, size: 190, weight: 900, color: ink }], { w: 256, h: 256, bg: null, pad: 22, align: "center" });
      [[0, 0.46, 0.452, 0], [0.452, 0.46, 0, Math.PI / 2]].forEach(([x, y, z, ry]) => { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.66), kit.flat(0xffffff, { map: tex, transparent: true })); f.position.set(x, y, z); f.rotation.y = ry; g.add(f); });
      return { g, pos, when };
    });

    // ---------- one codebase → Mac and Windows ----------
    const codeCard = kit.card(1.5, 0.95, kit.textTexture([{ text: "</>", size: 110, weight: 900, color: "#2F7A3C" }, { text: "一套代码", size: 66 }], { w: 480, h: 304, align: "center", pad: 26 }), { depth: 0.05 });
    codeCard.position.set(-3.9, 2.6, 1.0); codeCard.rotation.y = 0.72; group.add(codeCard);
    const appTexSmall = appScreenTexture(THREE);
    const plinths = [["Mac", P(-4.3, 0, 1.2)], ["Windows", P(-2.1, 0, 2.5)]].map(([name, pos], i) => {
      const g = new THREE.Group(); g.position.copy(pos); group.add(g);
      const body = kit.cyl(0.72, 0.8, 0.5, M.white); body.position.y = 0.25; g.add(body);
      const rim = kit.cyl(0.74, 0.74, 0.05, M.alu); rim.position.y = 0.52; g.add(rim);
      const lab = kit.card(1.3, 0.38, kit.textTexture([{ text: name, size: 70, weight: 900 }], { w: 440, h: 128, align: "center", pad: 24 }), { depth: 0.03 });
      lab.position.set(0.55, 0.26, 0.62); lab.rotation.y = 0.72; g.add(lab);
      const mini = new THREE.Group(); group.add(mini);
      const scr = kit.card(1.4, 0.88, appTexSmall, { depth: 0.04 }); mini.add(scr);
      const mbar = kit.rbox(1.4, 0.15, 0.07, 0.04, M.white); mbar.position.y = 0.51; mini.add(mbar);
      return { g, pos, mini, when: T.os + 0.35 + i * 0.35 };
    });

    // ---------- the system layer the web can't reach ----------
    const sys = new THREE.Group(); group.add(sys);
    const slab = kit.rbox(7.6, 0.24, 2.7, 0.1, M.darker); slab.position.set(-0.2, 0.12, 1.75); sys.add(slab);
    const wallGlass = kit.glass(0xE7B79F, 0.35); wallGlass.emissive.setHex(0xC2410C);
    const wall = kit.rbox(7.6, 0.72, 0.08, 0.03, wallGlass); wall.castShadow = false; wall.position.set(-0.2, 0.36, 0.22); sys.add(wall);
    const rail = kit.rbox(7.6, 0.07, 0.13, 0.03, M.signal); rail.position.set(-0.2, 0.74, 0.22); sys.add(rail);
    const SY = 0.24;
    // microphone, calendar card, Zoom window (all living on the system layer)
    const mic = new THREE.Group(); group.add(mic);
    const micBase = kit.cyl(0.32, 0.36, 0.1, M.dark); micBase.position.y = 0.05; mic.add(micBase);
    const micStem = kit.cyl(0.05, 0.05, 0.8, M.dark, 12); micStem.position.y = 0.45; mic.add(micStem);
    const micCap = kit.shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.32, 8, 20), M.mid)); micCap.position.y = 1.05; mic.add(micCap);
    const micBand = kit.torus(0.23, 0.035, M.me); micBand.rotation.x = Math.PI / 2; micBand.position.y = 0.88; mic.add(micBand);
    const MIC0 = P(-2.9, SY, 1.5);
    const cal = kit.card(1.15, 1.15, calendarTexture(THREE), { depth: 0.05 }); group.add(cal);
    const CAL0 = P(-0.5, SY + 0.03, 1.9);
    const win = kit.card(1.7, 1.06, kit.callScreenTexture(), { depth: 0.06, mat: M.darker }); group.add(win);
    const WIN = P(2.0, 1.25, 1.75);
    const liveDot = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 10), M.meDot); win.add(liveDot); liveDot.position.set(0.68, 0.38, 0.06);

    // ---------- native plugins: jointed robot arms ----------
    const L1 = 1.55, L2 = 1.45, SH = 0.42;
    const makeArm = (x) => {
      const g = new THREE.Group(); g.position.set(x, 0, -0.08); group.add(g);
      const base = kit.cyl(0.24, 0.3, 0.18, M.darker); base.position.y = 0.09; g.add(base);
      const yaw = new THREE.Group(); yaw.position.y = SH; g.add(yaw);
      yaw.add(kit.sphere(0.17, M.me));
      const p1 = new THREE.Group(); yaw.add(p1);
      const s1 = kit.rbox(L1, 0.17, 0.17, 0.07, M.dark); s1.position.x = L1 / 2; p1.add(s1);
      const p2 = new THREE.Group(); p2.position.x = L1; p1.add(p2);
      p2.add(kit.sphere(0.14, M.me));
      const s2 = kit.rbox(L2, 0.14, 0.14, 0.06, M.dark); s2.position.x = L2 / 2; p2.add(s2);
      const wr = new THREE.Group(); wr.position.x = L2; p2.add(wr);
      wr.add(kit.sphere(0.1, M.me));
      const f1 = kit.rbox(0.26, 0.05, 0.05, 0.02, M.me), f2 = f1.clone(); wr.add(f1, f2);
      const S = P(x, SH, -0.08);
      return {
        g, yaw, p1, p2, wr, f1, f2,
        reach(tip, grip = 0) {
          const dx = tip.x - S.x, dy = tip.y - S.y, dz = tip.z - S.z, r = Math.hypot(dx, dz);
          yaw.rotation.y = Math.atan2(-dz, dx);
          const d = clamp(Math.hypot(r, dy), 0.4, L1 + L2 - 0.02);
          const th2 = Math.acos(clamp((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1));
          const a1 = Math.atan2(dy, r) + Math.atan2(L2 * Math.sin(th2), L1 + L2 * Math.cos(th2));
          p1.rotation.z = a1; p2.rotation.z = -th2; wr.rotation.z = -(a1 - th2);
          const open = 0.1 - 0.05 * grip;
          f1.position.set(0.12, 0, open); f2.position.set(0.12, 0, -open);
        },
      };
    };
    const arms = [-1.7, -0.45, 0.9].map(makeArm);
    // a magnifying glass for the third arm
    const mag = new THREE.Group(); group.add(mag);
    const magRing = kit.torus(0.36, 0.06, M.dark); magRing.position.y = 0.62; mag.add(magRing);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.34, 40), kit.glass(0xDFF2E3, 0.35)); lens.position.y = 0.62; mag.add(lens);
    const handle = kit.cyl(0.05, 0.05, 0.36, M.me, 12); handle.position.y = 0.12; mag.add(handle);

    const tags = {
      electron: tag("Electron<small>网页包装成软件</small>", "me"),
      fast: tag("迭代快", "brand"),
      wall: tag("网页碰不到底层", "signal"),
      sys: tag("系统底层<small>麦克风 · 日历 · 窗口</small>", "dark"),
      plugins: tag("原生小插件<small>十几个</small>", "dark"),
      live: tag("会议开始了？", "them"),
      face: tag("网页 = 脸和大脑", "me"),
      feet: tag("插件 = 手和脚", "dark"),
    };
    const _v = new THREE.Vector3(), camUp = new THREE.Vector3(), camFwd = new THREE.Vector3(), qFlat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0.5, "YXZ"));

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 3.7, P(-0.3, 1.5, -2.0)], [T.electron, 3.6, P(-0.3, 1.6, -2.1)], [T.slack - 0.3, 4.6, P(1.5, 1.2, -2.2)],
          [T.os - 0.4, 5.0, P(-1.0, 1.0, -0.6)], [T.wall, 5.1, P(-0.3, 0.9, 0.4)], [T.mic - 0.4, 4.7, P(-0.9, 1.1, 0.7)],
          [T.zoom, 4.7, P(0.2, 1.1, 0.6)], [T.face, 5.2, P(-0.2, 1.2, 0.1)], [ctx.dur, 5.3, P(-0.2, 1.2, 0.1)],
        ]);
        camera.updateMatrixWorld();
        camUp.set(0, 1, 0).applyQuaternion(camera.quaternion); camFwd.set(0, 0, 1).applyQuaternion(camera.quaternion);

        // laptop
        lap.group.scale.setScalar(pop(t, T.lap, 0.55));
        lap.hinge.rotation.x = lerp(1.42, -0.22, outCubic(ramp(t, T.lap + 0.3, 0.8)));

        // glass shell: drops onto the screen, later tries to reach down and bumps the wall
        const sk = outBack(ramp(t, T.electron - 0.1, 0.8));
        shell.visible = t > T.electron - 0.1;
        const fwd = smooth(ramp(t, T.wall + 0.2, 0.7)) * (1 - smooth(ramp(t, T.wall + 2.4, 0.9)));
        const hitT = T.wall + 0.9, shake = t > hitT ? Math.sin((t - hitT) * 32) * Math.exp(-(t - hitT) * 4) * 0.09 : 0;
        shell.position.copy(shellRest).lerp(HIT, fwd); shell.position.y += 2.6 * (1 - sk); shell.position.z -= shake;
        shell.quaternion.copy(shellQ);
        shell.scale.setScalar(Math.max(0.0001, lerp(1.15, 1, sk) * clamp(sk * 2) * (1 - 0.12 * fwd)));
        const faceGlow = window01(t, T.face, ctx.dur + 1, 0.4);
        shellGlass.emissiveIntensity = 0.12 + 0.45 * window01(t, T.wrap, T.wrap + 1.2, 0.3) + 0.4 * faceGlow * (0.7 + 0.3 * Math.sin(t * 4));
        shellGlass.opacity = 0.42 + 0.12 * faceGlow;

        // other Electron apps hop in
        const appsOut = smooth(ramp(t, T.wall - 0.6, 0.6));
        apps.forEach((a, i) => {
          const k = ramp(t, a.when - 0.1, 0.55);
          a.g.visible = t > a.when - 0.1 && appsOut < 1;
          a.g.position.set(a.pos.x, (1 - outCubic(k)) * 1.6 + Math.abs(Math.sin((t - a.when) * 3 + i)) * 0.08 * k, a.pos.z);
          a.g.scale.setScalar(Math.max(0.0001, outBack(k) * (1 - appsOut)));
        });

        // one codebase, two plinths, same app on both; spins = fast iteration
        const osOut = smooth(ramp(t, T.wall - 0.5, 0.6));
        codeCard.visible = t > T.code && osOut < 1;
        codeCard.scale.setScalar(Math.max(0.0001, pop(t, T.code, 0.45) * (1 - osOut)));
        codeCard.position.y = 2.6 + 0.06 * Math.sin(t * 2);
        plinths.forEach((p, i) => {
          const k = ramp(t, T.os - 0.1 + i * 0.25, 0.6);
          p.g.visible = t > T.os - 0.1 && osOut < 1;
          p.g.scale.setScalar(Math.max(0.0001, outBack(k) * (1 - osOut)));
          const mk = outCubic(ramp(t, p.when, 0.7));
          p.mini.visible = t > p.when && osOut < 1;
          p.mini.position.lerpVectors(codeCard.position, P(p.pos.x, 1.35, p.pos.z), mk);
          p.mini.position.y += Math.sin(Math.PI * mk) * 0.5 + 0.04 * Math.sin(t * 2.2 + i) * mk;
          const spin = Math.PI * 2 * (smooth(ramp(t, T.fast + i * 0.15, 0.55)) + smooth(ramp(t, T.fast + 0.75 + i * 0.15, 0.55)));
          p.mini.rotation.set(-0.08, 0.72 + spin, 0);
          p.mini.scale.setScalar(Math.max(0.0001, lerp(0.4, 1, mk) * (1 - osOut)));
        });

        // the system layer + wall
        const sysK = ramp(t, T.wall - 0.1, 0.6);
        sys.visible = t > T.wall - 0.1;
        sys.scale.set(1, Math.max(0.0001, outBack(sysK)), 1);
        const hit = window01(t, hitT - 0.05, hitT + 0.5, 0.15);
        wallGlass.emissiveIntensity = 0.9 * hit; wallGlass.opacity = lerp(0.35, 0.18, ramp(t, T.plugins, 0.8)) + 0.3 * hit;
        rail.scale.y = 1 + 0.6 * hit;

        // arms: unfold, then each one reaches for its thing
        const armIn = (i) => outBack(ramp(t, T.plugins + 0.2 + i * 0.25, 0.6));
        const lift = (a, b, k) => _v.lerpVectors(a, b, k).clone();
        arms.forEach((A, i) => { A.g.visible = t > T.plugins + 0.2 + i * 0.25; A.g.scale.setScalar(Math.max(0.0001, armIn(i))); });
        const rest = (x) => P(x + 0.2, 1.75 + 0.06 * Math.sin(t * 2 + x), 0.4);
        const sway = (i) => P(0.05 * Math.sin(t * 1.7 + i), 0.05 * Math.sin(t * 2.3 + i * 2), 0);
        // arm 1 → microphone
        const m1 = outCubic(ramp(t, T.mic - 0.5, 0.8)), m1l = smooth(ramp(t, T.mic + 0.45, 0.8));
        const micGrab = MIC0.clone().add(P(0.1, 1.05, -0.28)), micUp = P(-2.5, 2.15, 0.9);
        const tip1 = lift(rest(-1.7), micGrab, m1); tip1.lerp(micUp, m1l).add(sway(0).multiplyScalar(m1l));
        arms[0].reach(tip1, ramp(t, T.mic + 0.25, 0.2));
        mic.position.copy(MIC0).lerp(micUp.clone().sub(P(0.1, 1.05, -0.28)), m1l).add(sway(0).multiplyScalar(m1l));
        mic.visible = t > T.wall + 0.1; mic.scale.setScalar(pop(t, T.wall + 0.1, 0.45));
        micBand.scale.setScalar(1 + 0.15 * m1l * Math.max(0, Math.sin(t * 9)));
        // arm 2 → calendar
        const c1 = outCubic(ramp(t, T.cal - 0.5, 0.8)), c1l = smooth(ramp(t, T.cal + 0.4, 0.8));
        const calGrab = CAL0.clone().add(P(0, 0.12, -0.45)), calUp = P(-0.35, 2.55, 1.1);
        const tip2 = lift(rest(-0.45), calGrab, c1); tip2.lerp(calUp, c1l).add(sway(1).multiplyScalar(c1l));
        arms[1].reach(tip2, ramp(t, T.cal + 0.2, 0.2));
        cal.visible = t > T.wall + 0.3; cal.scale.setScalar(pop(t, T.wall + 0.3, 0.45));
        cal.quaternion.slerpQuaternions(qFlat, camera.quaternion, c1l);
        cal.position.copy(CAL0).lerp(tip2.clone().addScaledVector(camUp, -0.62).addScaledVector(camFwd, 0.05), c1l);
        // arm 3 → magnifier over the Zoom window
        const z1 = outCubic(ramp(t, T.zoom - 0.5, 0.9));
        win.visible = t > T.wall + 0.5; win.scale.setScalar(pop(t, T.wall + 0.5, 0.45));
        win.position.copy(WIN); win.position.y += 0.05 * Math.sin(t * 1.6);
        win.quaternion.copy(camera.quaternion);
        const scan = 0.32 * Math.sin((t - T.zoom) * 1.8) * ramp(t, T.zoom + 0.4, 0.5);
        const lensAt = WIN.clone().addScaledVector(camFwd, 0.55).add(P(scan * 0.75, 0.05, -scan * 0.65));
        const magTip = lensAt.clone().addScaledVector(camUp, -0.62);
        const tip3 = lift(rest(0.9), magTip, z1);
        arms[2].reach(tip3, z1 > 0.6 ? 1 : 0);
        mag.visible = t > T.zoom - 0.5; mag.scale.setScalar(Math.max(0.0001, outBack(ramp(t, T.zoom - 0.3, 0.5))));
        mag.position.copy(tip3); mag.quaternion.copy(camera.quaternion);
        liveDot.visible = t > T.live; liveDot.scale.setScalar(pop(t, T.live, 0.35) * (1 + 0.25 * Math.max(0, Math.sin(t * 6))));
        // "hands and feet": arms flex together
        const flex = window01(t, T.feet, ctx.dur + 1, 0.3);
        arms.forEach((A) => A.p1.children[0].scale.set(1, 1 + 0.15 * flex * Math.max(0, Math.sin(t * 5)), 1 + 0.15 * flex * Math.max(0, Math.sin(t * 5))));

        // tags
        tags.electron.place(shell.position.clone().add(P(0, 1.45, 0)), ramp(t, T.electron + 0.5, 0.35) * (1 - ramp(t, T.code - 0.3, 0.4)), { dx: -150, dy: -60 });
        tags.fast.place(P(-2.1, 1.8, 2.5), ramp(t, T.fast, 0.3) * (1 - ramp(t, T.wall - 0.6, 0.4)), { dx: 90, dy: -30 });
        tags.wall.place(() => shell.position.clone().add(P(0.9, 1.2, 0)), ramp(t, T.wall + 0.9, 0.3) * (1 - ramp(t, T.plugins + 0.4, 0.4)), { dx: 20, dy: -60 });
        tags.sys.place(P(-0.2, 0.24, 3.1), ramp(t, T.wall + 0.6, 0.3) * (1 - ramp(t, T.hands, 0.4)), { dx: -170, dy: 6 });
        tags.plugins.place(P(-0.45, 2.2, 0.4), ramp(t, T.plugins + 0.6, 0.3) * (1 - ramp(t, T.mic - 0.3, 0.4)), { dx: -120, dy: -90 });
        tags.live.place(WIN.clone().add(P(0, 0.75, 0)), ramp(t, T.live + 0.2, 0.3) * (1 - ramp(t, T.face - 0.3, 0.4)), { dx: -40, dy: -70 });
        tags.face.place(shell.position.clone().add(P(0, 1.4, 0)), ramp(t, T.face, 0.35), { dx: -140, dy: -70 });
        tags.feet.place(P(-1.3, 2.4, 0.6), ramp(t, T.feet, 0.35), { dx: -330, dy: -10 });
      },
    };
  },
};

// the Granola app as a web page: sidebar + note
function appScreenTexture(THREE) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 640; const g = c.getContext("2d");
  g.fillStyle = "#FBFCF8"; g.fillRect(0, 0, 1024, 640);
  g.fillStyle = "#E3EBE1"; g.fillRect(0, 0, 250, 640);
  g.fillStyle = "#2F7A3C"; g.beginPath(); g.roundRect(28, 30, 60, 60, 16); g.fill();
  [0.8, 0.6, 0.7, 0.5, 0.65].forEach((w, i) => { g.fillStyle = i === 1 ? "#4DB860" : "#B4BFB8"; g.beginPath(); g.roundRect(28, 130 + i * 64, 190 * w, 26, 13); g.fill(); });
  g.fillStyle = "#17221C"; g.font = '900 56px "Clay Sans", sans-serif'; g.textBaseline = "top"; g.fillText("周会笔记", 300, 46);
  g.fillStyle = "#2F7A3C"; g.beginPath(); g.roundRect(300, 130, 150, 34, 17); g.fill();
  [[0.9, 1], [0.7, 0], [0.8, 1], [0.55, 0], [0.75, 1], [0.6, 0]].forEach(([w, dot], i) => {
    const y = 200 + i * 66;
    if (dot) { g.fillStyle = "#4DB860"; g.beginPath(); g.arc(312, y + 14, 10, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = dot ? "#8D9791" : "#C2CBC5"; g.beginPath(); g.roundRect(340, y, 620 * w, 28, 14); g.fill();
  });
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
// a little month calendar
function calendarTexture(THREE) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 512; const g = c.getContext("2d");
  g.fillStyle = "#FBFCF8"; g.beginPath(); g.roundRect(0, 0, 512, 512, 36); g.fill();
  g.fillStyle = "#C2410C"; g.beginPath(); g.roundRect(0, 0, 512, 120, [36, 36, 0, 0]); g.fill();
  g.fillStyle = "#FFFFFF"; g.font = '900 64px "Clay Sans", sans-serif'; g.textBaseline = "middle"; g.textAlign = "center"; g.fillText("日历", 256, 64);
  for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) {
    const x = 30 + k * 66, y = 150 + r * 70, hot = r === 2 && k === 3;
    g.fillStyle = hot ? "#2F7A3C" : "#DDE4DC"; g.beginPath(); g.roundRect(x, y, 56, 56, 12); g.fill();
    if (hot) { g.fillStyle = "#FFFFFF"; g.font = '900 34px "Clay Sans", sans-serif'; g.fillText("17", x + 28, y + 30); }
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
