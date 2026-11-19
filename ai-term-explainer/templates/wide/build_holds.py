"""Pilot (first two minutes): give each real shot time to be read, then rebuild index.html.

Inserts silence into the voiceover right after each line a real shot illustrates and
shifts every later cue. Reads untouched v1 copies (made on first run), so re-running is safe:
  assets/vo/timeline.v1.js, assets/vo/voiceover.v1.wav
Writes assets/vo/timeline.js (+ "holds"), assets/vo/voiceover.wav and index.html.

Run: python3 tools/build_pilot.py
"""
import json, re, shutil, wave
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# seconds of silence after each line that a real shot illustrates
HOLDS = {"p3": 2.5, "n1": 2.0, "m5": 1.5, "m6": 2.0, "k4": 2.5, "a4": 2.5, "g2": 2.5, "g3": 2.0}
GAP = 0.05
SCENES = ["hook", "scene", "problem", "map", "steps", "api", "goal"]


def backup(p, name):
    b = p.with_name(name)
    if not b.exists():
        shutil.copy(p, b)
    return b


def holds():
    tl_js, wav = ROOT / "assets/vo/timeline.js", ROOT / "assets/vo/voiceover.wav"
    src = backup(tl_js, "timeline.v1.js").read_text()
    V = json.loads(src[src.index("{"): src.rindex("}") + 1])
    points = sorted((V["lines"][k]["end"] + GAP, h) for k, h in HOLDS.items())
    shift = lambda t: round(t + sum(h for p, h in points if t >= p), 3)
    for l in V["lines"].values():
        l["start"], l["end"] = shift(l["start"]), shift(l["end"])
    for s in V["scenes"].values():
        s["start"], s["end"] = shift(s["start"]), shift(s["end"])
    V["total"], V["holds"] = shift(V["total"]), HOLDS
    tl_js.write_text("window.__VO = " + json.dumps(V, ensure_ascii=False, indent=1) + ";\n")
    with wave.open(str(backup(wav, "voiceover.v1.wav"))) as r:
        prm, rate, data = r.getparams(), r.getframerate(), r.readframes(r.getnframes())
    fb, out, last = prm.sampwidth * prm.nchannels, bytearray(), 0
    for p, h in points:
        cut = int(round(p * rate)) * fb
        out += data[last:cut] + b"\x00" * (int(round(h * rate)) * fb)
        last = cut
    out += data[last:]
    with wave.open(str(wav), "wb") as w:
        w.setparams(prm)
        w.writeframes(bytes(out))
    return V


def index(V):
    END = V["scenes"]["goal"]["end"]
    host = lambda cid, st, du, tr, kind, z=None, src=None: (
        f'      <div id="{cid}" data-composition-id="{src or cid}" data-composition-src="compositions/{src or cid}.html" '
        f'data-start="{round(st, 3)}" data-duration="{round(du, 3)}" data-track-index="{tr}" data-track-kind="{kind}" '
        f'data-width="1920" data-height="1080"' + (f' style="z-index: {z}"' if z else "") + "></div>\n")
    body = "".join(host(n, V["scenes"][n]["start"], V["scenes"][n]["end"] - V["scenes"][n]["start"], 1, "graphics") for n in SCENES)
    body += host("chain", 0, END, 2, "graphics", 5)
    body += host("screens", 0, END, 5, "graphics", 6)
    body += host("captions", 0, END, 3, "captions", 7)
    body += (f'      <audio id="vo" class="clip" src="assets/vo/voiceover.wav" data-start="0" data-duration="{END}" '
             'data-track-index="10" data-volume="1"></audio>\n')
    sfx = [("whoosh", V["scenes"][n]["start"] - 0.129, 0.574, 0.13) for n in SCENES[1:]]
    sfx += [("pop", 2.045, 0.72, 0.5)]
    for i, (name, st, du, vol) in enumerate(sfx):
        body += (f'      <audio id="sfx-{i}" class="clip" src="assets/sfx/{name}.mp3" data-start="{round(st, 3)}" '
                 f'data-duration="{du}" data-track-index="{11 + i % 2}" data-volume="{vol}"></audio>\n')
    p = ROOT / "index.html"
    html = p.read_text()
    html = re.sub(r'(<div id="root" data-composition-id="main" data-start="0" data-duration=")[^"]+(")', rf"\g<1>{END}\2", html)
    html = re.sub(r"(<div id=\"board\"></div>\n)(.*?)(    </div>\n    <script>)", lambda m: m.group(1) + body + m.group(3), html, flags=re.S)
    p.write_text(html)
    return END


if __name__ == "__main__":
    V = holds()
    end = index(V)
    for n in SCENES:
        s = V["scenes"][n]
        print(f"{n:<8} {s['start']:7.2f} → {s['end']:7.2f}")
    print("film", end)
