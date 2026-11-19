"""Write index.html's scene hosts from assets/vo/timeline.js (run after build_vo.py)."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = open(os.path.join(ROOT, "assets/vo/timeline.js"), encoding="utf-8").read()
VO = json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
T = round(VO["total"], 3)

def host(cid, start, dur, track, kind, z=None):
    style = ' style="z-index: %d"' % z if z else ""
    return ('      <div id="%s" data-composition-id="%s" data-composition-src="compositions/%s.html" '
            'data-start="%s" data-duration="%s" data-track-index="%d" data-track-kind="%s" '
            'data-width="1080" data-height="1920"%s></div>\n') % (cid, cid, cid, start, dur, track, kind, style)

scenes = "".join(host(n, s["start"], round(s["end"] - s["start"], 3), 1, "graphics")
                 for n, s in VO["scenes"].items())
overlays = host("chain", 0, T, 2, "graphics", 5) + host("captions", 0, T, 3, "captions", 6)
audio = ('      <audio id="vo" class="clip" src="assets/vo/voiceover.wav" data-start="0" data-duration="%s" '
         'data-track-index="10" data-volume="1"></audio>\n') % T
extra_path = os.path.join(ROOT, "tools/audio_tracks.html")
extra = open(extra_path, encoding="utf-8").read() if os.path.exists(extra_path) else ""

html = open(os.path.join(ROOT, "tools/index.template.html"), encoding="utf-8").read()
html = (html.replace("{{TOTAL}}", str(T)).replace("{{SCENES}}", scenes)
        .replace("{{OVERLAYS}}", overlays).replace("{{AUDIO}}", audio + extra))
open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8").write(html)
print("index.html written, total", T)
