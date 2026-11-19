"""Build the voiceover from SCRIPT.md: one Kokoro clip per line, trimmed,
laid end to end with fixed gaps. Writes assets/vo/voiceover.wav and
assets/vo/timeline.js (window.__VO) so scenes, captions and the chain all
cue from the real speech times. Re-run after any SCRIPT.md change."""
import asyncio, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# ENGINE "kokoro": local kokoro-onnx, run with ~/.cache/hf-kokoro-venv/bin/python
KOKORO_DIR = os.path.expanduser("~/.cache/hyperframes/tts")
VOICE, SPEED = "am_michael", 1.1
_kok = None
# spoken-only respellings: the caption shows the script text, the voice reads this
TTS_SUB = {"Qwen": "Chwen", "Zhipu": "Jee-poo", "Tengyu Ma": "Tung-yoo Mah",
           "E5": "E-five", "Jina": "Jeena", "Milvus": "Mil-vus", "word2vec": "word-to-vec"}
GAP, HEAD, TAIL = 0.22, 0.35, 0.5
FIRST_HEAD, LAST_TAIL = 0.15, 1.8
SR = 48000

def parse():
    scenes, cur = [], None
    for ln in open(os.path.join(ROOT, "SCRIPT.md"), encoding="utf-8"):
        m = re.match(r"^## (\w+)", ln)
        if m:
            cur = {"name": m.group(1), "lines": []}; scenes.append(cur); continue
        m = re.match(r"^(\w\d+) \| (.+)$", ln.strip())
        if m and cur:
            cur["lines"].append({"id": m.group(1), "text": m.group(2)})
    return scenes

def kokoro_tts(text, out):
    global _kok
    import soundfile as sf
    from kokoro_onnx import Kokoro
    for k, v in TTS_SUB.items():
        text = text.replace(k, v)
    if _kok is None:
        _kok = Kokoro(os.path.join(KOKORO_DIR, "models", "kokoro-v1.0.onnx"), os.path.join(KOKORO_DIR, "voices", "voices-v1.0.bin"))
    a, sr = _kok.create(text, voice=VOICE, speed=SPEED, lang="en-us")
    sf.write(out, a, sr)

def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)

def dur(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).stdout)

def main():
    scenes = parse()
    ext = ".wav"
    d = os.path.join(ROOT, "assets", "vo", "lines"); os.makedirs(d, exist_ok=True)
    for s in scenes:
        for l in s["lines"]:
            raw, wav = os.path.join(d, l["id"] + ".raw" + ext), os.path.join(d, l["id"] + ".wav")
            if not os.path.exists(raw) or "--force" in sys.argv:
                kokoro_tts(l["text"], raw)
                print(l["id"], flush=True)
            # trim silence both ends, mono 48k
            af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
                  "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse")
            run(["ffmpeg", "-y", "-v", "error", "-i", raw, "-af", af, "-ar", str(SR), "-ac", "1", wav])
            l["dur"] = round(dur(wav), 3); l["wav"] = wav
    # lay out
    t, parts, out = 0.0, [], {"scenes": {}, "lines": {}}
    def sil(sec):
        p = os.path.join(d, "sil_%d.wav" % int(sec * 1000))
        if not os.path.exists(p):
            run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i", "anullsrc=r=%d:cl=mono" % SR, "-t", str(sec), p])
        return p
    for si, s in enumerate(scenes):
        s0 = t
        head = FIRST_HEAD if si == 0 else HEAD
        parts.append(sil(head)); t += head
        for li, l in enumerate(s["lines"]):
            if li: parts.append(sil(GAP)); t += GAP
            out["lines"][l["id"]] = {"scene": s["name"], "start": round(t, 3), "end": round(t + l["dur"], 3), "text": l["text"]}
            parts.append(l["wav"]); t += l["dur"]
        tail = LAST_TAIL if si == len(scenes) - 1 else TAIL
        parts.append(sil(tail)); t += tail
        out["scenes"][s["name"]] = {"start": round(s0, 3), "end": round(t, 3), "lines": [l["id"] for l in s["lines"]]}
    out["total"] = round(t, 3)
    lst = os.path.join(d, "concat.txt")
    open(lst, "w").write("".join("file '%s'\n" % p for p in parts))
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst, "-ar", str(SR), "-ac", "1",
         os.path.join(ROOT, "assets", "vo", "voiceover_raw.wav")])
    run(["ffmpeg", "-y", "-v", "error", "-i", os.path.join(ROOT, "assets", "vo", "voiceover_raw.wav"),
         "-af", "loudnorm=I=-15:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "1",
         os.path.join(ROOT, "assets", "vo", "voiceover.wav")])
    js = "window.__VO = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n"
    open(os.path.join(ROOT, "assets", "vo", "timeline.js"), "w", encoding="utf-8").write(js)
    for n, s in out["scenes"].items():
        print("%-10s %6.2f → %6.2f  (%.2fs)" % (n, s["start"], s["end"], s["end"] - s["start"]))
    print("total", out["total"])

main()
