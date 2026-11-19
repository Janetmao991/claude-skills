// 第 2 层 · 抓音频 — reference scene for the kit (ported from the approved sample).
export default {
  id: "s03",
  eyebrow: "第 2 层 · 抓音频",
  headline: "不进会议，怎么听到声音？",
  build(ctx) {
    const { kit, THREE, group, camera, tag, at } = ctx;
    const { P, M, clamp, ramp, smooth, outCubic, outBack, lerp, pop, window01 } = kit;

    // beats, from the narration
    const T = {
      botIn: at("机器人") - 0.5, botNo: at("什么都不派"), botOut: at("什么都不派") + 0.8,
      waves: at("别人的声音"), speakerHit: at("扬声器"),
      themPipe: at("出口接"), themTag: at("Them"),
      mePipe: at("再接"), meTag: at("Me"),
      split: at("物理上"), splitOut: at("不用 AI") + 1.6,
      leak: at("中间还有") , filter: at("滤网") - 0.2, aecTag: at("回声"),
    };

    kit.desk(group);
    // laptop with a video call
    const lap = kit.laptop(kit.callScreenTexture()); lap.group.position.set(-0.9, 0, 0.1); group.add(lap.group);
    // speaker, turned toward camera
    const speaker = new THREE.Group(); speaker.position.set(2.3, 0, 0.7); speaker.rotation.y = 0.62; group.add(speaker);
    const spkBody = kit.rbox(1.15, 1.7, 1.0, 0.12, M.dark); spkBody.position.y = 0.85; speaker.add(spkBody);
    const cone = kit.cyl(0.34, 0.2, 0.06, M.darker); cone.rotation.x = Math.PI / 2; cone.position.set(0, 0.62, 0.51); speaker.add(cone);
    const coneRing = kit.torus(0.34, 0.05, M.mid); coneRing.position.set(0, 0.62, 0.52); speaker.add(coneRing);
    const tweeter = kit.sphere(0.13, M.mid); tweeter.scale.z = 0.4; tweeter.position.set(0, 1.28, 0.5); speaker.add(tweeter);
    speaker.updateMatrixWorld(true);
    const SPK = (x, y, z) => speaker.localToWorld(new THREE.Vector3(x, y, z));
    // microphone
    const mic = new THREE.Group(); mic.position.set(-3.9, 0, 1.5); group.add(mic);
    const micBase = kit.cyl(0.5, 0.56, 0.12, M.dark); micBase.position.y = 0.06; mic.add(micBase);
    const stem = kit.cyl(0.06, 0.06, 1.2, M.dark, 16); stem.position.y = 0.7; mic.add(stem);
    const capsule = kit.shadowed(new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.45, 8, 24), M.mid)); capsule.position.y = 1.55; mic.add(capsule);
    const micBand = kit.torus(0.31, 0.04, M.me); micBand.rotation.x = Math.PI / 2; micBand.position.y = 1.32; mic.add(micBand);
    // the Granola jar
    const jar = new THREE.Group(); jar.position.set(3.3, 0, -2.3); group.add(jar);
    const jarBody = kit.cyl(0.85, 0.85, 1.5, M.meDeep, 48); jarBody.position.y = 0.75; jar.add(jarBody);
    const jarLid = kit.cyl(0.92, 0.92, 0.22, M.white, 48); jarLid.position.y = 1.6; jar.add(jarLid);
    const inT = kit.cyl(0.2, 0.2, 0.18, M.them, 24); inT.position.set(-0.35, 1.78, 0.15); jar.add(inT);
    const inM = kit.cyl(0.2, 0.2, 0.18, M.me, 24); inM.position.set(0.35, 1.78, 0.15); jar.add(inM);
    const J = (x, y, z) => P(jar.position.x + x, y, jar.position.z + z);

    // glass pipes + beads
    const themGlass = kit.glass(0xA9B3AD), meGlass = kit.glass(0x5FB36E);
    const them = kit.pipe(group, [SPK(0, 0.62, 0.62), SPK(0, 0.62, 1.15), SPK(0.15, 1.9, 1.35), SPK(0.4, 2.85, 0.6), P(3.4, 3.1, -1.3), J(-0.35, 1.9, 0.15)], themGlass);
    const me = kit.pipe(group, [P(-3.9, 1.95, 1.5), P(-3.9, 2.9, 1.3), P(-2.5, 3.7, -0.1), P(0.6, 3.9, -1.6), P(2.8, 3.4, -2.2), J(0.35, 1.9, 0.15)], meGlass);
    const collar = kit.torus(0.42, 0.09, M.them); collar.position.copy(SPK(0, 0.62, 0.6)); collar.quaternion.copy(speaker.quaternion); group.add(collar);
    const themBeads = kit.beads(group, 18, M.themDot), meBeads = kit.beads(group, 18, M.meDot);
    const rings = kit.waves(group);

    // echo leak and the sieve
    const leak = new THREE.CatmullRomCurve3([SPK(-0.2, 0.7, 0.9), P(0.9, 1.7, 2.7), P(-1.6, 1.8, 2.8), P(-3.6, 1.6, 1.7)]);
    const echoMat = kit.clay(0x9AA49E, 0.5);
    const echo = kit.beads(group, 9, echoMat, 0.14);
    const sieveTex = (() => {
      const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
      g.strokeStyle = "rgba(194,65,12,0.95)"; g.lineWidth = 6;
      for (let i = 16; i < 256; i += 26) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const filter = new THREE.Group(); filter.position.copy(leak.getPointAt(0.8)); group.add(filter);
    const sieve = new THREE.Mesh(new THREE.CircleGeometry(0.62, 48), kit.flat(0xffffff, { map: sieveTex, transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    filter.add(sieve, kit.torus(0.64, 0.07, M.signal));
    filter.lookAt(filter.position.clone().add(leak.getTangentAt(0.8)));

    // the bot that gets turned away
    const bot = kit.robot(); group.add(bot);
    const noSign = new THREE.Group(); group.add(noSign);
    const noMat = kit.flat(0xC2410C);
    const noBar = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.16, 0.05), noMat); noBar.rotation.z = -Math.PI / 4;
    noSign.add(new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.09, 12, 64), noMat), noBar);

    const tags = {
      bot: tag("会议机器人<small>拒绝入内</small>", "them"),
      them: tag("Them<small>系统声音</small>", "them"),
      me: tag("Me<small>麦克风</small>", "me"),
      box: tag("Granola", "brand"),
      split: tag("两路音频 · 物理分开", "big"),
      aec: tag("回声消除 AEC", "signal"),
    };

    return {
      render(t) {
        kit.camKeys(camera, t, [
          [0, 4.9, P(0.3, 1.3, 1.0)], [T.botOut, 4.3, P(1.6, 1.4, 0.8)], [T.themPipe - 0.5, 4.6, P(1.8, 1.8, 0.2)],
          [T.mePipe, 5.4, P(0, 2.0, -0.2)], [T.split, 5.6, P(0, 2.1, -0.4)], [T.leak, 4.4, P(-1.6, 1.5, 1.6)], [ctx.dur, 3.8, P(-2.4, 1.5, 1.7)],
        ]);
        // bot hops in, gets stamped, sinks away
        const inK = outCubic(ramp(t, T.botIn, 1.4)), outK = smooth(ramp(t, T.botOut, 0.7));
        bot.visible = t > T.botIn - 0.05 && outK < 1;
        const hop = Math.abs(Math.sin((t - T.botIn) * 7)) * 0.35 * (1 - ramp(t, T.botIn + 1.2, 0.3));
        bot.position.set(lerp(3.4, 0.4, inK), hop - outK * 1.2, lerp(4.6, 2.9, inK));
        bot.rotation.y = lerp(-0.9, -0.35, inK) + outK * 0.8;
        bot.scale.setScalar((1 - outK) * 1.6 + 0.0001);
        noSign.visible = t > T.botNo && outK < 1;
        noSign.position.set(bot.position.x, 1.5 + bot.position.y, bot.position.z + 0.7);
        noSign.quaternion.copy(camera.quaternion);
        noSign.scale.setScalar(Math.max(0.0001, 1.5 * outBack(ramp(t, T.botNo, 0.35)) * (1 - outK)));

        // speaker pulse + waves, swallowed once the pipe clamps on
        const talking = t > T.waves;
        const pulse = talking ? 1 + 0.06 * Math.max(0, Math.sin(t * 22)) * (0.6 + 0.4 * Math.sin(t * 3.1)) : 1;
        cone.scale.set(pulse, 1, pulse); coneRing.scale.setScalar(pulse);
        spkBody.scale.setScalar(1 + 0.05 * window01(t, T.speakerHit, T.speakerHit + 0.3, 0.25));
        const pipeK = smooth(ramp(t, T.themPipe, 1.4));
        rings.render(t, T.waves, SPK(0, 0.62, 0.6), speaker.quaternion, { spread: 1 - pipeK, opacity: 0.55 * (0.35 + 0.65 * (1 - pipeK)) });

        them.grow(pipeK); collar.scale.setScalar(pop(t, T.themPipe - 0.1, 0.4));
        me.grow(smooth(ramp(t, T.mePipe, 1.4)));
        themBeads.flow(them.curve, t, T.themPipe + 0.4);
        meBeads.flow(me.curve, t, T.mePipe + 0.4);

        const sp = window01(t, T.split, T.splitOut, 0.45);
        meGlass.emissive.setHex(0x2F7A3C); meGlass.emissiveIntensity = 0.6 * sp; meGlass.opacity = 0.42 + 0.25 * sp;
        themGlass.emissive.setHex(0x5E6963); themGlass.emissiveIntensity = 0.5 * sp; themGlass.opacity = 0.42 + 0.25 * sp;
        jar.scale.setScalar(1 + 0.04 * Math.max(0, Math.sin((t - T.themPipe) * 4)) * ramp(t, T.themPipe + 1.6, 0.5));

        const filterK = outBack(ramp(t, T.filter, 0.5));
        filter.visible = t > T.filter; filter.scale.setScalar(Math.max(0.0001, filterK));
        sieve.rotation.z = t * 0.6;
        echo.children.forEach((b, i) => {
          const u = (((t - T.leak) * 0.42 + i / 9) % 1 + 1) % 1;
          b.visible = t > T.leak && !(filterK > 0.6 && u > 0.78);
          leak.getPointAt(clamp(u), b.position);
          b.scale.setScalar(clamp((t - T.leak) / 0.5) * (0.4 + 0.6 * (filterK > 0.6 ? clamp((0.78 - u) / 0.08) : 1)));
        });
        micBand.scale.setScalar(1 + 0.12 * (t > T.leak + 1.4 && filterK < 0.6 ? Math.max(0, Math.sin(t * 10)) : 0));

        tags.bot.place(P(0.4, 3.4, 2.9), ramp(t, T.botNo + 0.1, 0.3) * (1 - ramp(t, T.botOut + 0.2, 0.4)), { dx: -130, dy: -70 });
        tags.them.place(them.curve.getPointAt(0.34), ramp(t, T.themTag, 0.3) * (1 - ramp(t, T.leak, 0.4)), { dx: 40, dy: -40, scale: 1 + 0.12 * sp });
        tags.me.place(me.curve.getPointAt(0.12), ramp(t, T.meTag, 0.3), { dx: -230, dy: -40, scale: 1 + 0.12 * sp });
        tags.box.place(J(0.9, 1.0, 0.3), ramp(t, T.themPipe + 1.6, 0.4) * (1 - ramp(t, T.leak, 0.4)), { dx: 30, dy: -30 });
        tags.split.place(P(0, 4.6, -1.0), sp, { dx: -170, dy: -40 });
        tags.aec.place(filter.position.clone().add(P(0, -0.9, 0)), ramp(t, T.aecTag, 0.3), { dx: -110, dy: 20 });
      },
    };
  },
};
