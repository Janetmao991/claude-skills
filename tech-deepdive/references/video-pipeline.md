# Video pipeline — skeuomorphic isometric explainer (HyperFrames + Three.js)

Plugin install: HyperFrames lives at ~/.claude/plugins/cache/hyperframes/hyperframes/<ver>; run the CLI via
`node <PLUGIN_ROOT>/skills/hyperframes/scripts/plugin-cli.mjs <cmd>` for init, and `npx --yes hyperframes@<pinned> <cmd>` inside the project.
Read /hyperframes, /hyperframes-core and hyperframes-animation/adapters/three.md before changing the harness.

1. **Scaffold**: `init "<Company>/video" --non-interactive --example=blank --skill=general-video`; copy `templates/video/*` into it (build/, scenes/, SCENE_GUIDE.md). Write BRIEF.md (workflow general-video, flow automation, aspect 1920x1080, language zh).
2. **Script**: one file per scene in `build/vo/sNN.txt`. s01 open (hook + "拆成 N 层"), one scene per layer (split a big layer into two), security, cost, close ("哪一层是自己造的？"). Decide the physical metaphor for each scene BEFORE writing its words; write words that name the objects ("接一根管子", "临时通行证").
3. **Voice**: `python3 -m venv <scratch>/tts-venv && <venv>/bin/pip install edge-tts`; `<venv>/bin/python build/voice.py` (voice zh-CN-XiaoxiaoNeural). Re-voice one scene: `build/voice.py s05`. Produces assets/audio/sNN.mp3, build/timeline.json (starts, cues, per-char times).
4. **Fonts**: download NotoSansSC[wght].ttf (google/fonts, OFL) to the scratchpad; set SRC in build/font.sh; run it after any new Chinese text.
5. **Assemble**: `python3 build/assemble.py` → index.html (one <audio> per scene), scenes/timeline.js, scenes/registry.js, placeholder scenes. Never hand-edit index.html.
6. **Reference scene**: build one scene yourself on the kit (all 11 Granola scenes are in templates/video/scenes/examples; s03 is the reference), snapshot, iterate until it looks right. For a new company show the user a 15–25 s sample first.
7. **Dispatch**: update SCENE_GUIDE.md if the kit changed; spawn 3–4 general-purpose agents in ONE message, 2–3 scenes each, with per-scene visual briefs (beats tied to narration keywords, objects, tags, global start/dur) and a unique `-o snapshots/agentX`.
8. **Review**: `snapshot --at <midpoints and key beats> --no-end -o snapshots/review` per scene; Read contact sheets; fix clipping, tag collisions, unlit meshes, early pop-ins, density mismatches between scenes.
9. **Ship**: `npx hyperframes check`, then `render -o renders/<slug>.mp4` (≈ 15 s render per 30 s video on Apple GPU), ffprobe both streams, grab 2 frames to confirm WebGL rendered, SendUserFile.

Gotchas learned on Granola:
- Root needs `data-no-timeline` (no GSAP) or every render waits 45 s.
- A speaker/screen facing +z looks side-on in the iso camera: rotate objects ~0.6 rad toward the camera.
- Beads inside opaque pipes are invisible → pipes are `kit.glass`.
- Orthographic half-height ~4–5.6 fills the frame; 7+ leaves the diorama tiny.
- English voices reading Chinese sound foreign → always a native zh voice.
- Things entering from the desk's back-left (−x, −z) project into the top-left title box → bring pipes/props in from front-left (+z).
- Large scenes can snapshot blank with the default 5 s init timeout → `snapshot --timeout 15000`.
- kit.setIso already calls camera.updateMatrixWorld() (tags projected with a stale camera were ~500 px off in seek snapshots).
- Full 6-min render ≈ 3 min, ≈ 180 MB at 1080p.
