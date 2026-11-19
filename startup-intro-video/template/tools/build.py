"""把 script.json + clips.json 排成 Remotion 时间轴。（中英文通用，语言看 script.json 的 "lang"）

Steps (each cached):
  1. VO wavs (sources/vo_raw, from tts.py) -> loudnorm -> remotion/public/vo/*.wav + word timings
  2. Podcast windows (sources/podcast) -> find quote / trim -> 1080p, loudnorm -> remotion/public/podcast/*.mp4
  3. Lay everything end to end -> remotion/src/data/timeline.json

Run:  python3 tools/build.py            (from the video folder)
"""
import difflib, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clipseg import segments  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
PUB = "remotion/public"
WHISPER = os.path.expanduser("~/.cache/hyperframes/whisper/models/ggml-small.en.bin")
GAP_SEG, GAP_SCENE, LEAD_IN, TAIL = 0.6, 1.4, 0.6, 4.0
LANG, BAD = "en", []


def sh(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def dur(f):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).decode())


def words(media, cache):
    """whisper word timings -> [(start, end, text)]"""
    if not os.path.exists(cache):
        wav = cache + ".16k.wav"
        sh("ffmpeg", "-y", "-i", media, "-ar", "16000", "-ac", "1", wav)
        sh("whisper-cli", "-m", WHISPER, "-f", wav, "-ml", "1", "-sow", "-oj", "-of", cache[:-5], "-np")
        os.remove(wav)
    d = json.load(open(cache, encoding="utf-8"))
    out = []
    for s in d["transcription"]:
        t = s["text"].strip()
        if t:
            out.append((s["offsets"]["from"] / 1000, s["offsets"]["to"] / 1000, t))
    return out


norm = lambda w: re.sub(r"[^a-z0-9$%]", "", w.lower())


def align(script_text, wh):
    """Give each script word the time of its matching whisper word (interpolate the rest)."""
    sw = script_text.split()
    a, b = [norm(w) for w in sw], [norm(w[2]) for w in wh]
    times = [None] * len(sw)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            times[blk.a + k] = (wh[blk.b + k][0], wh[blk.b + k][1])
    end = wh[-1][1] if wh else 0
    for i in range(len(sw)):  # fill gaps linearly between known neighbours
        if times[i] is None:
            prev = next((times[j][1] for j in range(i - 1, -1, -1) if times[j]), 0.0)
            nxt_i = next((j for j in range(i + 1, len(sw)) if times[j]), None)
            nxt = times[nxt_i][0] if nxt_i is not None else end
            n = (nxt_i if nxt_i is not None else len(sw)) - i + 1
            step = (nxt - prev) / n
            times[i] = (prev + step * 0.5, prev + step)
    out = [{"w": w, "s": round(t[0], 3), "e": round(t[1], 3)} for w, t in zip(sw, times)]
    merged = []  # "N D R" -> "NDR" for captions (only runs of single capital letters)
    for x in out:
        single = re.fullmatch(r"[A-Z][,.]?", x["w"]) is not None
        if single and merged and merged[-1].get("_sl") and not merged[-1]["w"][-1] in ",.":
            merged[-1].update(w=merged[-1]["w"] + x["w"], e=x["e"])
        else:
            merged.append(dict(x, _sl=single))
    for m in merged:
        m.pop("_sl")
    return merged


def build_vo(key, text):
    raw = f"sources/vo_raw/{key}.wav"
    out = f"{PUB}/vo/{key}.wav"
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(raw):
        sh("ffmpeg", "-y", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", out)
        for c in (f"sources/vo_raw/{key}.json",):
            if os.path.exists(c):
                os.remove(c)
    side = f"sources/vo_raw/{key}.words.json"
    if os.path.exists(side):  # 中文：tts_minimax.py 已经用强制对齐配好每个字的时间
        return dur(out), json.load(open(side, encoding="utf-8"))
    wh = words(raw, f"sources/vo_raw/{key}.json")
    return dur(out), align(text, wh)


def build_clip(key, meta):
    src = f"sources/podcast/{key}.mp4"
    wh = words(src, f"sources/podcast/{key}.json")
    if "in" not in meta:  # locate the quote by phrase
        target = meta["find"].lower().split()
        toks = [norm(w[2]) for w in wh]
        hit = next(i for i in range(len(toks)) if toks[i : i + len(target)] == [norm(t) for t in target])
        # back up to the start of the sentence
        i = hit
        while i > 0 and not re.search(r"[.?!]$", wh[i - 1][2]) and hit - i < 25:
            i -= 1
        j = hit + len(target)
        while j < len(wh) - 1 and not re.search(r"[.?!]$", wh[j][2]) and j - hit < 40:
            j += 1
        meta["in"], meta["out"] = round(wh[i][0] - 0.15, 2), round(wh[j][1] + 0.35, 2)
    a, b = meta["in"], meta["out"]
    out = f"{PUB}/podcast/{key}.mp4"
    stamp = f"{a}-{b}"
    fresh = os.path.exists(out) and os.path.exists(out + ".cut") and open(out + ".cut").read() == stamp
    if not fresh:
        sh("ffmpeg", "-y", "-ss", str(a), "-to", str(b), "-i", src,
           "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30",
           "-af", f"loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.08,afade=t=out:st={b-a-0.15:.2f}:d=0.15",
           "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out)
        open(out + ".cut", "w").write(stamp)
    cw = [{"w": w[2], "s": round(w[0] - a, 3), "e": round(w[1] - a, 3)} for w in wh if w[0] >= a - 0.05 and w[1] <= b + 0.05]
    fixes = meta.get("fix", {})  # whisper 听错的词：{"claim": "Clay"}
    for x in cw:
        core = x["w"].rstrip(",.?!")
        x["w"] = fixes.get(core, core) + x["w"][len(core):]
    cw = [x for x in cw if x["w"]]
    subs = None
    if LANG == "zh":  # 中文版：原声只出中文翻译字幕，一段英文对一句中文
        segs, zh = segments([x["w"] for x in cw]), meta.get("zh", [])
        if len(segs) != len(zh):
            BAD.append(key)
            print(f"!! {key}: 英文 {len(segs)} 段，clips.json 里 zh 有 {len(zh)} 句。按下面的分段逐段翻译：")
            for i, (p, q) in enumerate(segs):
                print(f"   {i}: {' '.join(x['w'] for x in cw[p:q + 1])}")
        subs = [{"s": cw[p]["s"], "e": cw[q]["e"], "t": zh[i] if i < len(zh) else ""} for i, (p, q) in enumerate(segs)]
    return round(b - a, 3), cw, meta, subs



def main():
    os.makedirs(f"{PUB}/vo", exist_ok=True)
    os.makedirs(f"{PUB}/podcast", exist_ok=True)
    global LANG
    script = json.load(open("script.json", encoding="utf-8"))
    clips = json.load(open("clips.json", encoding="utf-8"))
    LANG = script.get("lang", "en")
    t = LEAD_IN
    scenes = []
    for sc in script["scenes"]:
        start = t
        segs = []
        for i, seg in enumerate(sc["segments"]):
            if "vo" in seg:
                key = f"{sc['id']}_{i}"
                d, w = build_vo(key, seg["vo"])
                segs.append({"type": "vo", "key": key, "src": f"vo/{key}.wav", "start": round(t, 3), "dur": round(d, 3), "words": w})
            else:
                key = seg["clip"]
                d, w, meta, subs = build_clip(key, dict(clips[key]))
                seg_out = {"type": "clip", "key": key, "src": f"podcast/{key}.mp4", "start": round(t, 3), "dur": d, "words": w,
                           "meta": {k: meta.get(k, "") for k in ("speaker", "role", "show", "date", "sticker", "icon", "yt", "in", "out")}}
                seg_out["meta"]["stickerAt"] = meta.get("stickerAt", 1.0)
                if subs is not None:
                    seg_out["subs"] = subs
                segs.append(seg_out)
                print(f"  clip {key}: {meta['in']}–{meta['out']}  “{' '.join(x['w'] for x in w)[:110]}”")
            t += d + GAP_SEG
        t += GAP_SCENE - GAP_SEG
        scenes.append({"id": sc["id"], "title": sc["title"], "start": round(start, 3), "end": round(t, 3), "segments": segs})
    total = round(t + TAIL, 3)
    json.dump({"total": total, "lang": LANG, "scenes": scenes}, open("remotion/src/data/timeline.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    for s in scenes:
        print(f"{s['id']:9s} {s['start']:7.1f} → {s['end']:7.1f}  ({s['end']-s['start']:.1f}s)")
    print(f"TOTAL {total:.1f}s = {int(total//60)}:{int(total%60):02d}")
    if BAD:
        print(f"{len(BAD)} 段原声缺中文翻译：{', '.join(BAD)}")


if __name__ == "__main__":
    main()
