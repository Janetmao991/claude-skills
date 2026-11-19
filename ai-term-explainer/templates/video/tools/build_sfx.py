"""Write tools/audio_tracks.html: SFX clips placed from the voice timeline so
each peak lands one frame after its picture. Mirrors SK.cueChar in sketch.js."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
raw = open(os.path.join(ROOT, "assets/vo/timeline.js"), encoding="utf-8").read()
VO = json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
L, S = VO["lines"], VO["scenes"]
DUR = {"whoosh": 0.574, "pop": 0.72, "impact-bass-1": 2.115}
PEAK = {"whoosh": 0.162, "pop": 0.12, "impact-bass-1": 0.073}
FRAME = 1 / 30

def char(lid, ch):
    l = L[lid]; i = l["zh"].find(ch)
    return l["start"] + (max(i, 0) / len(l["zh"])) * (l["end"] - l["start"])

hits = []
for n in ["scene", "problem", "map", "steps", "api", "goal", "biz", "moat", "tiers", "voyage", "recap"]:
    hits.append(("whoosh", S[n]["start"], 0.13))  # Janet 2026-10-31: scene-change whoosh at half volume
hits += [
    ("pop", char("h1", "到"), 0.5),                       # ? stamp
    ("pop", char("p3", "对"), 0.55),                      # ✗ no match
    ("pop", char("b4", "两"), 0.5),                       # price stamp
    ("pop", char("t4", "几"), 0.55),                      # × 几亿次
    ("impact-bass-1", char("x3", "收"), 0.5),             # 收藏起来！
]
out = ""
for i, (f, t, vol) in enumerate(hits):
    start = max(0, round(t + FRAME - PEAK[f], 3))
    out += ('      <audio id="sfx-%d" class="clip" src="assets/sfx/%s.mp3" data-start="%s" data-duration="%s" '
            'data-track-index="%d" data-volume="%s"></audio>\n') % (i, f, start, DUR[f], 11 + (i % 2), vol)
open(os.path.join(ROOT, "tools/audio_tracks.html"), "w").write(out)
print(len(hits), "sfx placed")
