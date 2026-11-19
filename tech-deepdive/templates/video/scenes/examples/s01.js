// 开场 — a finished meeting note, a $1.5B company, and the machine taken apart into six layers.
export default {
  id: "s01",
  eyebrow: "",
  headline: "Granola 是怎么做出来的？",
  build(ctx) {
    const { kit, THREE, group, camera, tag, panel, at } = ctx;
    const { P, M, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    const T = {
      zoom: at("Zoom"), note: at("写好了一份笔记"), val: at("十五亿美元"), again: at("可这份笔记"),
      how: at("到底"), take: at("拆一台"), six: at("拆成六层"), down: at("一层一层往下看"),
    };

    // ---------- the desk diorama ----------
    const world = new THREE.Group(); group.add(world);
    kit.desk(world);
    const lap = kit.laptop(kit.callScreenTexture()); lap.group.position.set(-0.5, 0, 0.1); world.add(lap.group);
    const [lapBase, lapKeys] = lap.group.children;
    const mug = new THREE.Group(); mug.position.set(-3.4, 0, 1.3); world.add(mug);
    const mugBody = kit.cyl(0.36, 0.32, 0.72, M.white); mugBody.position.y = 0.36; mug.add(mugBody);
    const mugHandle = kit.torus(0.18, 0.06, M.white); mugHandle.position.set(0.38, 0.4, 0); mug.add(mugHandle);
    const coffee = kit.cyl(0.31, 0.31, 0.02, kit.clay(0x6B4A33, 0.4)); coffee.position.y = 0.68; mug.add(coffee);
    group.updateMatrixWorld(true);
    const screenPos = lap.screen.getWorldPosition(new THREE.Vector3());

    // ---------- the meeting note that comes out of the laptop ----------
    const noteG = new THREE.Group(); group.add(noteG);
    const note = kit.card(1.9, 2.3, noteTexture(THREE), { depth: 0.06 }); noteG.add(note);
    const notePos = P(2.5, 2.9, -1.2);

    // ---------- the six-layer stack ----------
    const stack = buildStack(kit, THREE, group); stack.root.position.set(0, 0, 0);
    const layerY = (i) => stack.layers[i].baseY + stack.HS / 2;

    const val = panel(`<div class="num">$1.5B</div><div class="lab">2026 年估值</div>`, "card", { x: 1500, y: 250 });
    const tags = {
      note: tag("会议笔记<small>自动写好</small>", "me"),
    };

    return {
      render(t) {
        const topY = layerY(0), botY = layerY(5);
        kit.camKeys(camera, t, [
          [0, 3.8, P(-0.4, 1.1, 0.2)], [T.note + 0.4, 4.3, P(0.5, 1.5, 0.3)], [T.val, 4.5, P(0.3, 1.5, 0.3)],
          [T.take, 4.1, P(-0.3, 1.3, 0.2)], [T.six + 0.15, 4.6, P(-0.6, 1.8, 0.5)], [T.six + 1.3, 5.4, P(-1.3, 3.2, 1.1)],
          [T.down + 0.75, 5.7, P(-1.6, (topY + botY) / 2 + 0.5, 1.4)], [ctx.dur - 0.15, 5.0, P(-1.7, (topY + botY) / 2 - 0.4, 1.5)],
        ]);
        camera.updateMatrixWorld();

        // the desk: laptop opens, then it gets taken apart, then everything sinks away
        const sink = smooth(ramp(t, T.six - 0.05, 0.9));
        world.visible = sink < 1;
        world.scale.setScalar(Math.max(0.0001, 1 - sink));
        world.position.y = -2.2 * sink;
        lap.hinge.rotation.x = lerp(1.42, -0.22, outCubic(ramp(t, 0.15, 0.9)));
        lap.screen.material.color.setScalar(0.35 + 0.65 * ramp(t, 0.7, 0.4));
        const ex = smooth(ramp(t, T.take, 0.8));
        const jitter = ex * Math.sin(t * 9) * 0.02;
        lapKeys.position.y = 0.155 + 0.45 * ex + jitter;
        lap.hinge.position.y = 0.14 + 0.95 * ex - jitter;
        lapBase.position.y = 0.07 - jitter;
        lap.group.scale.setScalar(1 + 0.03 * window01(t, T.zoom, T.zoom + 0.4, 0.2));
        coffee.position.y = 0.68 + 0.01 * Math.sin(t * 2);

        // the note slides out of the screen and floats
        const nk = outCubic(ramp(t, T.note - 0.15, 1.15));
        noteG.visible = t > T.note - 0.15 && sink < 1;
        noteG.position.lerpVectors(screenPos, notePos, nk);
        noteG.position.y += Math.sin(Math.PI * nk) * 0.7 + Math.sin(t * 1.7) * 0.06 * nk - 2.2 * sink;
        noteG.rotation.set(lerp(-0.22, -0.12, nk), lerp(0, 0.62, nk) + 0.35 * Math.sin(Math.PI * 2 * smooth(ramp(t, T.how, 1.8))), lerp(0, -0.05, nk));
        const bump = 1 + 0.1 * window01(t, T.again, T.again + 0.5, 0.25);
        noteG.scale.setScalar(Math.max(0.0001, lerp(0.3, 1, nk) * bump * (1 - sink)));

        // six platforms rise, bottom first, then the camera walks down them
        stack.layers.forEach((L, i) => {
          const j = 5 - i, s = T.six + 0.2 + j * 0.13;
          const k = ramp(t, s, 0.75);
          L.g.visible = t > s;
          L.g.position.y = L.baseY - 1.4 * (1 - outCubic(k));
          L.g.scale.setScalar(Math.max(0.0001, outBack(k)));
          L.glass.opacity = 0.56 * smooth(k);
          const pass = T.down + 0.8 + i * 0.36;
          L.glass.emissiveIntensity = 0.55 * window01(t, pass, pass + 0.55, 0.2) + 0.08 * Math.sin(t * 2 + i);
          L.bob(t);
        });

        val.show(window01(t, T.val, T.take - 0.3, 0.4));
        tags.note.place(() => noteG.position.clone().add(P(0, 1.3, 0)), ramp(t, T.note + 0.9, 0.35) * (1 - ramp(t, T.val - 0.3, 0.4)), { dx: -80, dy: -100 });
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
