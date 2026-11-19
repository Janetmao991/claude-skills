"""播客片段：whisper 逐词 + ffmpeg 裁切（结果按裁切点缓存）。"""
import json, os, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WHISPER = os.path.expanduser("~/.cache/hyperframes/whisper/models/ggml-small.en.bin")


def sh(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def words(media, cache):
    """whisper 逐词时间 -> [(开始, 结束, 词)]"""
    if not os.path.exists(cache):
        wav = cache + ".16k.wav"
        sh("ffmpeg", "-y", "-i", media, "-ar", "16000", "-ac", "1", wav)
        sh("whisper-cli", "-m", WHISPER, "-f", wav, "-ml", "1", "-sow", "-oj", "-of", cache[:-5], "-np")
        os.remove(wav)
    return [(s["offsets"]["from"] / 1000, s["offsets"]["to"] / 1000, s["text"].strip()) for s in json.load(open(cache))["transcription"] if s["text"].strip()]


def build_clip(key, meta):
    """按 clips.json 的 in/out（窗口内秒数）裁切，返回 (时长, 词表)。"""
    src = os.path.join(ROOT, "sources/podcast", f"{key}.mp4")
    wh = words(src, os.path.join(ROOT, "sources/podcast", f"{key}.json"))
    a, b = meta["in"], meta["out"]
    out = os.path.join(ROOT, "remotion/public/podcast", f"{key}.mp4")
    stamp = f"{a}-{b}"
    if not (os.path.exists(out) and os.path.exists(out + ".cut") and open(out + ".cut").read() == stamp):
        sh("ffmpeg", "-y", "-ss", str(a), "-to", str(b), "-i", src,
           "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30",
           "-af", f"loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:d=0.08,afade=t=out:st={b-a-0.15:.2f}:d=0.15",
           "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-ar", "48000", out)
        open(out + ".cut", "w").write(stamp)
    return round(b - a, 3), [{"w": w[2], "s": round(w[0] - a, 3), "e": round(w[1] - a, 3)} for w in wh if w[0] >= a - 0.05 and w[1] <= b + 0.05]
