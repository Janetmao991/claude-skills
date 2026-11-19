#!/usr/bin/env python3
"""Batch voiceover: build/vo/sNN.txt -> assets/audio/sNN.mp3 (+ words) and build/timeline.json.
timeline.json: per scene {id, start, dur, audioDur, cues:[[text, s, e] local], beats:{kw: local s}}.
Usage: <venv>/bin/python build/voice.py [sNN ...]   (no args = all scenes; existing mp3s are reused unless named)"""
import asyncio, glob, json, os, subprocess, sys
import edge_tts
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE, RATE = "zh-CN-XiaoxiaoNeural", "+0%"
LEAD, TAIL = 0.5, 0.9          # silence before speech starts / after it ends, per scene

async def tts(sid, text):
    words, audio = [], bytearray()
    async for c in edge_tts.Communicate(text, VOICE, rate=RATE, boundary="WordBoundary").stream():
        if c["type"] == "audio": audio += c["data"]
        elif c["type"] == "WordBoundary":
            s = c["offset"] / 1e7; words.append({"text": c["text"], "start": s, "end": s + c["duration"] / 1e7})
    open(f"{ROOT}/assets/audio/{sid}.mp3", "wb").write(audio)
    json.dump(words, open(f"{ROOT}/build/vo/{sid}.words.json", "w"), ensure_ascii=False)

def cues_for(text, words):
    cs, ce, pos = [None] * len(text), [None] * len(text), 0
    for w in words:
        i = text.find(w["text"], pos)
        if i < 0: continue
        n = len(w["text"])
        for k in range(n):
            cs[i + k] = w["start"] + (w["end"] - w["start"]) * k / n
            ce[i + k] = w["start"] + (w["end"] - w["start"]) * (k + 1) / n
        pos = i + n
    # fill gaps (punctuation / unmatched) with neighbours
    last = 0.0
    for i in range(len(text)):
        if cs[i] is None: cs[i] = ce[i] = last
        last = ce[i]
    cues, cur, s0 = [], "", None
    for i, c in enumerate(text):
        if c in "。，？：；！":
            if cur.strip(): cues.append([cur.strip(), round(s0 + LEAD, 2), round(ce[i - 1] + LEAD, 2)])
            cur, s0 = "", None
            continue
        cur += c
        if s0 is None and c.strip(): s0 = cs[i]
    if cur.strip(): cues.append([cur.strip(), round(s0 + LEAD, 2), round(ce[-1] + LEAD, 2)])
    for a, b in zip(cues, cues[1:]): a[2] = b[1]
    return cues, [round(x + LEAD, 3) for x in cs]

def dur(path):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]))

ids = sorted(os.path.basename(p)[:-4] for p in glob.glob(f"{ROOT}/build/vo/s??.txt"))
redo = set(sys.argv[1:])
for sid in ids:
    if sid in redo or not os.path.exists(f"{ROOT}/assets/audio/{sid}.mp3"):
        asyncio.run(tts(sid, open(f"{ROOT}/build/vo/{sid}.txt").read().strip())); print("tts", sid)
tl, t = [], 0.0
for sid in ids:
    text = open(f"{ROOT}/build/vo/{sid}.txt").read().strip()
    words = json.load(open(f"{ROOT}/build/vo/{sid}.words.json"))
    cues, chars = cues_for(text, words)
    ad = dur(f"{ROOT}/assets/audio/{sid}.mp3")
    d = round(LEAD + ad + TAIL, 2)
    cues[-1][2] = round(d - 0.3, 2)
    tl.append({"id": sid, "start": round(t, 2), "dur": d, "audioDur": round(ad, 2), "text": text, "cues": cues, "chars": chars})
    t += d
json.dump({"total": round(t, 2), "lead": LEAD, "scenes": tl}, open(f"{ROOT}/build/timeline.json", "w"), ensure_ascii=False, indent=1)
for s in tl: print(s["id"], "start", s["start"], "dur", s["dur"])
print("total", round(t, 2), "s")
