"""Check every voice line: ASR text vs script, last characters, and tail loudness.
usage: ~/.cache/mlx-audio-venv/bin/python asr_check.py <project-dir> [zh|en]
Flags a line when similarity < 0.9, the ending doesn't match, or the last 20 ms is
louder than -35 dB (Qwen3-TTS cut the last syllable = 吞字)."""
import json, re, sys, difflib, numpy as np, soundfile as sf
from mlx_audio.stt.utils import load_model
ROOT, LANG = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "zh")
r = open(ROOT + "/assets/vo/timeline.js").read(); V = json.loads(r[r.index("{"): r.rindex("}") + 1])
m = load_model("mlx-community/Qwen3-ASR-1.7B-8bit")
norm = lambda t: re.sub(r"[^\w]", "", t).lower()
bad = 0
for k, l in V["lines"].items():
    p = f"{ROOT}/assets/vo/lines/{k}.wav"
    a, sr = sf.read(p); F = int(0.02 * sr)
    tail = 20 * np.log10(np.sqrt(np.mean(a[-F:] ** 2)) + 1e-9)
    got = m.generate(p).text.strip()
    want, have = norm(l.get("zh") or l.get("text")), norm(got)
    s = difflib.SequenceMatcher(None, want, have).ratio()
    n = 1 if LANG == "zh" else 4
    endok = have[-n:] == want[-n:]
    flag = "" if (endok and s >= 0.9 and tail < -35) else "  <<< CHECK"
    if flag: bad += 1
    print(f"{k} sim {s:.2f} end {'ok' if endok else 'MISS'} tail {tail:.0f}dB | {got}{flag}", flush=True)
print("flagged", bad)
