"""Build the voiceover from SCRIPT.md: one edge-tts clip per line, trimmed,
laid end to end with fixed gaps. Writes assets/vo/voiceover.wav and
assets/vo/timeline.js (window.__VO) so scenes, captions and the chain all
cue from the real speech times. Re-run after any SCRIPT.md change."""
import asyncio, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE, RATE = "zh-CN-XiaoxiaoNeural", "+16%"
# ENGINE "qwen": local Qwen3-TTS (mlx-audio) cloning the R5 voice sample.
# Run with ~/.cache/mlx-audio-venv/bin/python. "edge": edge-tts, run with ~/.cache/edge-tts-venv/bin/python.
ENGINE = "qwen"
QWEN_MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-Base-bf16"
REF_WAV = os.path.join(ROOT, "assets", "vo", "ref-r5.wav")
REF_TEXT = ("Embedding，向量嵌入，到底是什么？从一个客服机器人讲起。假设你给公司做了一个客服机器人。"
            "公司有500份文档：退款流程、发货规则、会员说明。有个顾客问：我买的东西不想要了，钱能要回来吗？"
            "机器人得先从500份里，找到能回答的那一份。")  # what ref-r5.wav says (ep1 hook + scene), fixed for every episode
_qwen = None
# spoken-only respellings: the caption shows the script text, the voice reads this
TTS_SUB = {"Embedding": "im-bedding", "embedding": "im-bedding"}  # Janet picked sample E
GAP, HEAD, TAIL = 0.22, 0.35, 0.5
FIRST_HEAD, LAST_TAIL = 0.15, 1.8
SR = 48000

def parse():
    scenes, cur = [], None
    for ln in open(os.path.join(ROOT, "SCRIPT.md"), encoding="utf-8"):
        m = re.match(r"^## (\w+)", ln)
        if m:
            cur = {"name": m.group(1), "lines": []}; scenes.append(cur); continue
        m = re.match(r"^(\w\d+) \| (.+?) \| (.+)$", ln.strip())
        if m and cur:
            cur["lines"].append({"id": m.group(1), "zh": m.group(2), "en": m.group(3)})
    return scenes

FILLER = "就这样。"  # sacrificial tail: Qwen3-TTS stops before the last syllable finishes,
                   # so we let it swallow the filler instead and cut at the pause before it.

def _cut_filler(a, sr):
    import numpy as np
    F = int(0.02 * sr)
    e = np.array([20 * np.log10(np.sqrt(np.mean(a[i:i + F] ** 2)) + 1e-9) for i in range(0, len(a) - F, F)])
    quiet, n, best, i = e < -42, len(e), None, 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if j - i >= 6 and i * F < len(a) - 0.25 * sr: best = (i, j)
            i = j
        else:
            i += 1
    # the gap must sit right before the filler (within the last 1.4 s), not at a comma inside the line
    if not best or best[0] * F < len(a) - 1.4 * sr: return None
    b = a[:(best[0] + 3) * F].copy()
    fl = int(0.03 * sr); b[-fl:] *= np.linspace(1, 0, fl)
    return b

def qwen_tts(text, out):
    global _qwen
    for k, v in TTS_SUB.items():
        text = text.replace(k, v)
    import numpy as np, soundfile as sf
    from mlx_audio.tts.utils import load_model
    if _qwen is None:
        _qwen = load_model(QWEN_MODEL)
    for attempt in range(4):
        res = list(_qwen.generate(text=text + FILLER, ref_audio=REF_WAV, ref_text=REF_TEXT, lang_code="chinese"))
        b = _cut_filler(np.concatenate([np.array(r.audio) for r in res]), _qwen.sample_rate)
        if b is not None: break
        print("  retry (no clean pause before filler)", flush=True)
    else:
        raise SystemExit("could not cut filler for: " + text)
    sf.write(out, b, _qwen.sample_rate)

async def tts(text, out):
    import edge_tts
    await edge_tts.Communicate(text, VOICE, rate=RATE).save(out)

def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)

def dur(p):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p]).stdout)

def main():
    scenes = parse()
    ext = ".wav" if ENGINE == "qwen" else ".mp3"
    d = os.path.join(ROOT, "assets", "vo", "lines"); os.makedirs(d, exist_ok=True)
    for s in scenes:
        for l in s["lines"]:
            raw, wav = os.path.join(d, l["id"] + ".raw" + ext), os.path.join(d, l["id"] + ".wav")
            if not os.path.exists(raw) or "--force" in sys.argv:
                if ENGINE == "qwen":
                    qwen_tts(l["zh"], raw)
                else:
                    asyncio.run(tts(l["zh"], raw))
                print(l["id"], flush=True)
            # trim silence both ends, mono 48k
            af = ("silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02,"
                  "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,areverse")
            if ENGINE == "qwen":
                af = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02"
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
            out["lines"][l["id"]] = {"scene": s["name"], "start": round(t, 3), "end": round(t + l["dur"], 3), "zh": l["zh"], "en": l["en"]}
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
