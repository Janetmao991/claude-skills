// 第 5 层 · 跨会议问答 — a librarian robot: skim the note spines first, open the thick transcripts only when needed.
export default {
  id: "s07",
  eyebrow: "第 5 层 · 跨会议问答",
  headline: "像图书管理员一样搜索",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, C, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    // beats, from the narration
    const T = {
      ask: at("过去三个月"), scatter: at("散在几十场会里"), cram: at("一股脑"), spill: at("又贵"),
      now: at("现在"), lib: at("图书管理员"), scan: at("扫一遍"), spine: at("书脊"), pick: at("挑出"),
      open: at("打开原始转写"), read: at("细读"), loop: at("再搜一轮"),
      cmp: at("转写的字数"), ten: at("十倍"), notesFirst: at("所以先读"), more: at("十倍", 2),
    };
    T.clear = T.now + 0.2;
    T.scanEnd = T.pick - 0.05;
    T.toTable = T.pick + 0.9;

    kit.desk(group);
    const dummy = new THREE.Object3D(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3();
    const white = new THREE.Color(0xffffff);

    // ---------- the robot (the agent) ----------
    const bot = kit.robot(); group.add(bot);
    const [armL, armR] = bot.userData.arms, head = bot.userData.head;

    // ---------- the question bubble ----------
    const bubble = new THREE.Group(); group.add(bubble);
    const qTex = kit.textTexture([{ text: "过去三个月，", size: 56, weight: 900 }, { text: "客户提过哪些 bug？", size: 56, weight: 900, color: "#C2410C" }],
      { w: 640, h: 210, pad: 34, lineGap: 1.3 });
    const qCard = kit.card(2.9, 0.95, qTex, { depth: 0.08 }); bubble.add(qCard); qCard.traverse((o) => { o.castShadow = false; });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 4), M.card); tail.rotation.z = Math.PI; tail.position.set(-0.75, -0.6, 0); bubble.add(tail); tail.castShadow = false;

    // ---------- dozens of meeting boxes (instanced) ----------
    const NB = 30;
    const boxGeo = new kit.RoundedBoxGeometry(0.62, 0.3, 0.46, 3, 0.06);
    const boxes = kit.shadowed(new THREE.InstancedMesh(boxGeo, kit.clay(0xffffff, 0.8), NB)); group.add(boxes);
    const boxCols = [0xFBFCF8, 0xF3DE7A, 0xC9D0CB, 0xE9EDEA, 0xCFE3CF];
    const r1 = kit.rng(7);
    const B = [];
    for (let i = 0; i < NB; i++) {
      // scattered spot on the desk, avoiding the robot in the middle
      let x, z;
      do { x = -4.6 + r1() * 9.2; z = -2.7 + r1() * 5.9; } while (Math.abs(x) < 1.0 && Math.abs(z - 0.6) < 1.0);
      const col = i % 3, row = Math.floor(i / 3);
      B.push({
        s: P(x, 0.15, z), ry: r1() * Math.PI,
        pile: P((col - 1) * 0.6 + (r1() - 0.5) * 0.08, 0.2 + row * 0.3, 0), pry: (r1() - 0.5) * 0.35,
        spill: row >= 6 ? P((col - 1) * 1.2 + (r1() - 0.5) * 1.6, 0.15, 1.3 + r1() * 1.6) : null, sry: r1() * 3,
        delay: r1() * 0.9,
      });
      boxes.setColorAt(i, new THREE.Color(boxCols[i % boxCols.length]));
    }
    boxes.instanceColor.needsUpdate = true;
    const BOT0 = P(0, 0, 0.7);

    // ---------- the library: a shelf of thin books over thick transcript boxes ----------
    const shelf = new THREE.Group(); shelf.position.set(-0.35, 0, -2.4); group.add(shelf);
    const SW = 6.4;
    const back = kit.rbox(SW + 0.3, 2.45, 0.14, 0.05, M.wood); back.position.set(0, 1.22, -0.42); shelf.add(back);
    const woodDark = kit.clay(0xB09C80, 0.8);
    [0.05, 1.12, 2.38].forEach((y) => { const b = kit.rbox(SW + 0.3, 0.1, 0.92, 0.04, woodDark); b.position.set(0, y, 0); shelf.add(b); });
    [-1, 1].forEach((s) => { const p = kit.rbox(0.14, 2.45, 0.92, 0.04, woodDark); p.position.set(s * (SW / 2 + 0.08), 1.22, 0); shelf.add(p); });

    const NBK = 46, bookCols = [C.me, C.meLight, C.sticky, C.sky, C.plum, C.themLight, C.wood, C.signal, 0x7FA88A, C.white];
    const bookGeo = new kit.RoundedBoxGeometry(1, 1, 1, 2, 0.08);
    const books = kit.shadowed(new THREE.InstancedMesh(bookGeo, kit.clay(0xffffff, 0.7), NBK)); shelf.add(books);
    const r2 = kit.rng(42);
    const K = []; let bx = -SW / 2 + 0.12;
    for (let i = 0; i < NBK; i++) {
      const w = 0.09 + r2() * 0.035, h = 0.72 + r2() * 0.3, c = bookCols[Math.floor(r2() * bookCols.length)];
      K.push({ x: bx + w / 2, w, h, c, tilt: i === NBK - 1 ? -0.18 : 0 }); bx += w + 0.012;
      books.setColorAt(i, new THREE.Color(c));
    }
    books.instanceColor.needsUpdate = true;
    const shelfX = (i) => shelf.position.x + K[i].x;   // world x of a spine

    // three picked books (real meshes so they can fly to the table)
    const PICK = [9, 24, 36];
    const picked = PICK.map((i) => { const m = kit.shadowed(new THREE.Mesh(bookGeo, kit.clay(K[i].c, 0.6))); m.scale.set(K[i].w, K[i].h, 0.62); group.add(m); return m; });

    // lower shelf: thick grey transcript boxes, one of which gets opened
    const NT = 6, tW = 0.92, tGeo = new kit.RoundedBoxGeometry(tW, 0.82, 0.7, 3, 0.07);
    const trans = []; const tMat = kit.clay(C.themLight, 0.65), tLabel = kit.clay(C.paperCard, 0.85);
    const labGeo = new THREE.BoxGeometry(0.46, 0.18, 0.02);
    for (let i = 0; i < NT; i++) {
      if (i === 3) continue;
      const g = new THREE.Group(); g.position.set(-SW / 2 + 0.6 + i * 1.03, 0.52, 0.02); shelf.add(g);
      g.add(kit.shadowed(new THREE.Mesh(tGeo, tMat)));
      const lab = new THREE.Mesh(labGeo, tLabel); lab.position.set(0, 0.12, 0.36); g.add(lab);
      trans.push(g);
    }
    const OPEN_X = -SW / 2 + 0.6 + 3 * 1.03;
    // the opened transcript: body + hinged lid + a page of dense text
    const tbox = new THREE.Group(); group.add(tbox);
    const tBody = kit.rbox(tW, 0.66, 0.7, 0.06, tMat); tBody.position.y = 0.33; tbox.add(tBody);
    const tLab = new THREE.Mesh(labGeo, tLabel); tLab.position.set(0, 0.42, 0.36); tbox.add(tLab);
    const lidHinge = new THREE.Group(); lidHinge.position.set(0, 0.66, -0.35); tbox.add(lidHinge);
    const tLid = kit.rbox(tW + 0.04, 0.16, 0.74, 0.06, kit.clay(C.them, 0.6)); tLid.position.set(0, 0.08, 0.36); lidHinge.add(tLid);
    const pageTex = (() => {
      const c = document.createElement("canvas"); c.width = 256; c.height = 192; const g = c.getContext("2d");
      g.fillStyle = "#FBFCF8"; g.fillRect(0, 0, 256, 192); g.fillStyle = "#8D9791";
      const r = kit.rng(5); for (let y = 14; y < 184; y += 12) { let x = 12; while (x < 240) { const w = 10 + r() * 34; g.fillRect(x, y, Math.min(w, 244 - x), 5); x += w + 6; } }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const page = new THREE.Mesh(new THREE.PlaneGeometry(tW * 0.84, 0.58), kit.flat(0xffffff, { map: pageTex })); page.rotation.x = -Math.PI / 2; page.position.y = 0.665; tbox.add(page);

    // the scan beam (a soft light cone from the robot's eye to the spines)
    const beamMat = kit.flat(0xFFF1B0, { transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1, 24, 1, true), beamMat); group.add(beam);
    beam.geometry.translate(0, -0.5, 0);    // tip at origin, opens toward -y
    const spot = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), kit.flat(0xFFF1B0, { transparent: true, opacity: 0.5, depthWrite: false })); group.add(spot);

    // reading table
    const table = new THREE.Group(); table.position.set(3.9, 0, 0.35); group.add(table);
    const tTop = kit.rbox(2.0, 0.12, 1.3, 0.05, M.wood); tTop.position.y = 0.76; table.add(tTop);
    [[-0.85, -0.5], [0.85, -0.5], [-0.85, 0.5], [0.85, 0.5]].forEach(([x, z]) => { const l = kit.cyl(0.06, 0.06, 0.72, woodDark, 12); l.position.set(x, 0.36, z); table.add(l); });
    const TT = 0.82; // table-top height
    const READ = P(2.55, 0, 0.45);

    // the "search again" ring: four arrows chasing each other around the robot
    const ring = new THREE.Group(); group.add(ring);
    const ringMat = kit.clay(C.meLight, 0.45, { emissive: 0x1d5a27, emissiveIntensity: 0.4 });
    for (let k = 0; k < 4; k++) {
      const seg = new THREE.Group(); seg.rotation.y = (k * Math.PI) / 2; ring.add(seg);
      const arc = kit.shadowed(new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.06, 10, 40, 1.15), ringMat)); arc.rotation.x = Math.PI / 2; seg.add(arc);
      const head2 = kit.shadowed(new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.32, 16), ringMat));
      head2.position.set(1.15, 0, 0); head2.rotation.x = Math.PI; seg.add(head2);  // points along -z at angle 0 → leading end of the arc
    }

    // size comparison: one transcript = ten notes
    const cmp = new THREE.Group(); cmp.position.set(-1.6, 0, 2.15); group.add(cmp);
    const bigBox = new THREE.Group(); bigBox.position.set(-1.0, 0, 0); cmp.add(bigBox);
    const bb = kit.rbox(1.3, 1.3, 0.9, 0.08, tMat); bb.position.y = 0.65; bigBox.add(bb);
    const bbLab = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.26, 0.02), tLabel); bbLab.position.set(0, 0.95, 0.46); bigBox.add(bbLab);
    const ten = [];
    const tenCols = [C.me, C.sticky, C.sky, C.meLight, C.plum, C.wood, C.signal, 0x7FA88A, C.sticky, C.me];
    for (let i = 0; i < 10; i++) {
      const m = kit.shadowed(new THREE.Mesh(bookGeo, kit.clay(tenCols[i], 0.6))); m.scale.set(0.115, 1.3, 0.9);
      m.position.set(0.55 + i * 0.13, 0.65, 0); cmp.add(m); ten.push(m);
    }
    const eq = new THREE.Group(); eq.position.set(-0.17, 0.65, 0.2); cmp.add(eq);
    const eqMat = kit.clay(C.ink, 0.6);
    [0.09, -0.09].forEach((y) => { const b = kit.rbox(0.36, 0.08, 0.08, 0.03, eqMat); b.position.y = y; eq.add(b); });

    const tags = {
      meet: tag("几十场会议<small>答案散落各处</small>", "them"),
      cost: tag("又贵又装不下", "signal"),
      lib: tag("图书管理员<small>检索 agent</small>", "dark"),
      spine: tag("先看书脊<small>100 份笔记</small>", "me"),
      raw: tag("原始转写<small>再细读</small>", "them"),
      loop: tag("搜索 → 筛选 → 细读 → 再搜", "me"),
      ten: tag("转写 = 笔记的 10 倍", "big"),
      more: tag("同样的钱<small>多看 10 倍会议</small>", "me"),
    };

    // robot path: centre → shelf start → scan along spines → reading table
    const SCAN_A = shelfX(2) + 0.2, SCAN_B = shelfX(NBK - 4);
    const botPos = (t) => {
      if (t < T.lib) return BOT0.clone();
      const k1 = smooth(ramp(t, T.lib, T.scan - T.lib));
      const start = P(SCAN_A, 0, -0.6);
      if (t < T.scan) return new THREE.Vector3().lerpVectors(BOT0, start, k1);
      if (t < T.scanEnd) return P(lerp(SCAN_A, SCAN_B, ramp(t, T.scan, T.scanEnd - T.scan)), 0, -0.6);
      return new THREE.Vector3().lerpVectors(P(SCAN_B, 0, -0.6), READ, smooth(ramp(t, T.toTable, 1.3)));
    };
    const walking = (t) => (t > T.lib && t < T.scan) || (t > T.scan && t < T.scanEnd) || (t > T.toTable && t < T.toTable + 1.3);

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 4.3, P(0.2, 1.5, 0.8)], [T.scatter, 5.0, P(0, 1.1, 0.4)], [T.cram + 0.3, 4.7, P(0.2, 1.7, 0.8)],
          [T.now + 0.6, 5.0, P(0.0, 1.5, -0.4)], [T.spine, 4.7, P(-0.1, 1.7, -0.6)], [T.open, 4.7, P(1.3, 1.6, -0.3)],
          [T.loop + 0.6, 4.8, P(1.3, 1.5, 0.0)], [T.cmp + 0.8, 5.1, P(0.5, 1.4, 0.6)], [ctx.dur, 5.0, P(0.4, 1.4, 0.7)],
        ]);

        // ---- robot ----
        const bp = botPos(t), wk = walking(t);
        bot.position.copy(bp); bot.position.y = wk ? Math.abs(Math.sin(t * 9)) * 0.08 : 0.02 * Math.sin(t * 2.4);
        let ry = 0.55;
        if (t > T.lib) ry = lerp(0.55, Math.PI - 0.55, smooth(ramp(t, T.lib, 0.8)));            // turn to the shelf
        if (t > T.toTable) ry = lerp(Math.PI - 0.55, Math.PI / 2, smooth(ramp(t, T.toTable, 0.8))); // face the table
        bot.rotation.y = ry;
        bot.scale.setScalar(1.15);
        // arms: hold the pile out front, otherwise swing
        const hold = window01(t, T.cram - 0.2, T.clear, 0.4);
        const swing = wk ? Math.sin(t * 9) * 0.5 : 0;
        armL.rotation.x = -hold * 1.35 + swing; armR.rotation.x = -hold * 1.35 - swing;
        const reading = window01(t, T.read - 0.4, T.loop + 1.5, 0.4);
        head.rotation.x = 0.28 * reading + 0.05 * Math.sin(t * 3) * reading;
        head.rotation.z = 0.06 * Math.sin(t * 1.7);

        // ---- question bubble ----
        const bk = pop(t, T.ask - 0.15, 0.5) * (1 - smooth(ramp(t, T.cram, 0.5)));
        bubble.visible = bk > 0.01;
        bubble.position.set(-1.6, 3.1 + 0.06 * Math.sin(t * 2), 0.9); bubble.quaternion.copy(camera.quaternion);
        bubble.scale.setScalar(Math.max(0.0001, bk));

        // ---- meeting boxes: scatter → crammed onto the robot → wobble & spill → cleared ----
        const pileK = (i) => smooth(ramp(t, T.cram + B[i].delay * 0.8, 0.7));
        const wob = ramp(t, T.cram + 0.9, 0.8) * (0.06 + 0.05 * Math.sin(t * 2.1));
        const sway = Math.sin(t * 5.2) * wob;
        const clearK = smooth(ramp(t, T.clear, 0.6));
        for (let i = 0; i < NB; i++) {
          const b = B[i];
          const inK = outBack(ramp(t, T.scatter + b.delay, 0.45));
          // pile position: in front of the robot, swaying from its base
          const lp = b.pile.clone(); lp.applyAxisAngle(new THREE.Vector3(0, 0, 1), sway);
          const pileW = P(BOT0.x + lp.x, 0.55 + lp.y, BOT0.z + 0.62 + lp.z);
          const drop = P(b.s.x, 0.15 + Math.abs(Math.sin((t - T.scatter - b.delay) * 3)) * 0.0, b.s.z);
          const pk = pileK(i);
          v.lerpVectors(drop, pileW, pk); v.y += Math.sin(pk * Math.PI) * 1.4;
          let rotY = lerp(b.ry, b.pry, pk), rotX = 0, rotZ = sway * pk;
          if (b.spill) {
            const sk = ramp(t, T.spill + 0.25 + b.delay * 0.4, 0.8);
            if (sk > 0) {
              const tgt = P(BOT0.x + b.spill.x, 0.15, BOT0.z + b.spill.z);
              const from = v.clone();
              v.lerpVectors(from, tgt, outCubic(sk)); v.y = lerp(from.y, 0.15, sk * sk) + Math.sin(sk * Math.PI) * 0.6;
              rotX = sk * (2 + b.sry); rotZ = sk * b.sry * 0.6; rotY += sk * 0.8;
            }
          }
          v.y -= clearK * 0.6;
          const s = Math.max(0.0001, inK * (1 - clearK));
          e.set(rotX, rotY, rotZ); q.setFromEuler(e);
          dummy.position.copy(v); dummy.quaternion.copy(q); dummy.scale.setScalar(s); dummy.updateMatrix();
          boxes.setMatrixAt(i, dummy.matrix);
        }
        boxes.instanceMatrix.needsUpdate = true;
        boxes.visible = t > T.scatter - 0.05 && clearK < 1;

        // ---- library rises ----
        const libK = outBack(ramp(t, T.now + 0.3, 0.7));
        shelf.visible = t > T.now + 0.25;
        shelf.scale.set(1, Math.max(0.0001, libK), 1);
        const beamOn = window01(t, T.scan, T.scanEnd + 0.1, 0.3);
        const beamX = bp.x + 0.3;
        for (let i = 0; i < NBK; i++) {
          const k = K[i];
          const inK = outBack(ramp(t, T.now + 0.6 + i * 0.012, 0.35));
          const near = beamOn * clamp(1 - Math.abs(shelfX(i) - beamX) / 0.45);
          const isPick = PICK.indexOf(i);
          const gone = isPick >= 0 && t > T.pick + isPick * 0.18;
          const marked = isPick >= 0 && t > T.scan && beamX > shelfX(i) ? 1 : 0;
          dummy.position.set(k.x, 1.17 + k.h / 2 + near * 0.08 + marked * 0.04, 0.05 + near * 0.12 + marked * 0.1);
          dummy.rotation.set(0, 0, k.tilt);
          dummy.scale.set(k.w, k.h * Math.max(0.0001, inK), 0.62);
          if (gone) dummy.scale.setScalar(0.0001);
          dummy.updateMatrix(); books.setMatrixAt(i, dummy.matrix);
        }
        books.instanceMatrix.needsUpdate = true;
        trans.forEach((g, i) => { g.scale.setScalar(pop(t, T.now + 0.9 + i * 0.06, 0.4)); });

        // beam from the robot's eye to the spine in front of it
        beam.visible = spot.visible = beamOn > 0.01;
        if (beam.visible) {
          const eye = P(bp.x, 1.12 * 1.15 + bot.position.y, bp.z - 0.2);
          const tgt = P(beamX, 1.65, shelf.position.z + 0.36);
          const dir = tgt.clone().sub(eye), len = dir.length();
          beam.position.copy(eye); beam.scale.set(1, len, 1);
          beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir.normalize());
          beamMat.opacity = 0.5 * beamOn;
          spot.position.copy(tgt); spot.material.opacity = 0.75 * beamOn;
          spot.scale.setScalar(1 + 0.08 * Math.sin(t * 8));
        }

        // picked books: pop forward, then fly in an arc to the table and lie down in a stack
        picked.forEach((m, j) => {
          const i = PICK[j], k = K[i];
          const tp = T.pick + j * 0.18;
          m.visible = t > tp;
          const fwd = outBack(ramp(t, tp, 0.4));
          const from = P(shelfX(i), 1.17 + k.h / 2 + 0.04, shelf.position.z + 0.15 + fwd * 0.7);
          const fk = inOutK(ramp(t, tp + 0.55, 0.9));
          const to = P(3.35 + j * 0.06, TT + 0.07 + j * 0.13, 0.25 + j * 0.05);
          m.position.lerpVectors(from, to, fk); m.position.y += Math.sin(fk * Math.PI) * 1.6;
          m.rotation.set(0, lerp(0, 0.25 * (j - 1), fk), lerp(0, Math.PI / 2, fk));
          const gl = 1 + 0.15 * Math.max(0, Math.sin((t - tp) * 6)) * (1 - ramp(t, tp + 1.6, 0.4));
          m.scale.set(k.w * gl, k.h * gl, 0.62 * gl);
        });

        // transcript: slide out of the lower shelf, fly to the table, open
        const tStart = T.open - 0.3;
        tbox.visible = t > T.now + 0.9;
        const outK = smooth(ramp(t, tStart, 0.4)), flyK = inOutK(ramp(t, tStart + 0.4, 0.9));
        const tFrom = P(shelf.position.x + OPEN_X, 0.11 * libK, shelf.position.z + 0.02 + outK * 0.8);
        const tTo = P(4.35, TT, 0.4);
        tbox.position.lerpVectors(tFrom, tTo, flyK); tbox.position.y += Math.sin(flyK * Math.PI) * 1.3;
        tbox.rotation.y = lerp(0, -0.35, flyK);
        tbox.scale.set(1, t < T.now + 0.9 ? 0.0001 : Math.max(0.0001, pop(t, T.now + 1.1, 0.4)), 1);
        lidHinge.rotation.x = -1.9 * outBack(ramp(t, tStart + 1.35, 0.5));
        page.visible = t > tStart + 1.3;

        // search-again ring
        const rk = window01(t, T.loop - 0.1, T.cmp + 0.4, 0.45);
        ring.visible = rk > 0.01;
        ring.position.set(READ.x, 0.75, READ.z); ring.scale.setScalar(Math.max(0.0001, outBack(clamp(rk))));
        ring.rotation.y = -t * 2.2;

        // comparison: a thick transcript next to ten thin notes
        bigBox.scale.setScalar(pop(t, T.cmp, 0.5));
        table.scale.setScalar(pop(t, T.now + 1.0, 0.45));
        ten.forEach((m, i) => {
          const s = pop(t, T.cmp + 0.6 + i * 0.07, 0.35);
          const ripple = t > T.notesFirst ? Math.max(0, Math.sin((t - T.notesFirst) * 4 - i * 0.6)) * 0.1 : 0;
          m.position.y = 0.65 + ripple; m.scale.set(0.115 * s, 1.3 * s, 0.9 * s);
        });
        eq.scale.setScalar(pop(t, T.ten - 0.1, 0.4));
        bb.scale.setScalar(1 + 0.04 * Math.max(0, Math.sin((t - T.ten) * 5)) * window01(t, T.ten, T.notesFirst, 0.3));

        // ---- tags ----
        tags.meet.place(P(3.2, 1.0, 2.3), window01(t, T.scatter + 0.4, T.cram, 0.35), { dx: -40, dy: -10 });
        tags.cost.place(P(0, 4.3, 1.3), window01(t, T.spill, T.clear, 0.3), { dx: 60, dy: -30 });
        tags.lib.place(() => bot.position.clone().add(P(0, 1.9, 0)), window01(t, T.lib + 0.2, T.spine - 0.3, 0.3), { dx: -330, dy: -60 });
        tags.spine.place(() => P(bot.position.x + 0.3, 2.7, -2.4), window01(t, T.spine, T.open, 0.3), { dx: -90, dy: -60 });
        tags.raw.place(P(4.35, 1.6, 0.4), window01(t, T.open + 0.9, T.loop + 0.6, 0.3), { dx: 40, dy: -40 });
        tags.loop.place(P(READ.x, 2.3, READ.z), window01(t, T.loop + 0.2, T.cmp + 0.3, 0.3), { dx: -260, dy: -80 });
        tags.ten.place(P(-1.6, 1.5, 2.2), window01(t, T.ten - 0.3, ctx.dur + 1, 0.35), { dx: -170, dy: -110 });
        tags.more.place(P(-1.0, 0.0, 2.7), window01(t, T.more - 1.0, ctx.dur + 1, 0.35), { dx: -60, dy: 30 });
      },
    };
    function inOutK(x) { return kit.inOut(x); }
  },
};
