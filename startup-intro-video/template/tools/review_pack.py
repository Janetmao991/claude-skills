"""把成片整理成审片 agent 能看的材料（agent 看不了动态，也听不到声音）。

输出到指定文件夹：
  timeline.md   每章每段的时间、文字、是旁白还是原声
  narration.md  只有观众听到 / 读到的文字，按顺序，给"新观众"审片用
  sheet-*.jpg   帧拼图，每格标时间（默认每 3 秒一帧；片子短可以 --step 2）
  cuts-*.jpg    每个切点（换章、进出原声）前后的帧，用来看卡帧、闪帧、黑帧
  tech.md       时长、音量、静止段、没写完的章、配音听写低分段

用法：python3 tools/review_pack.py renders/xxx.mp4 review/round-1 [--step 3]
"""
import json, os, re, shutil, subprocess, sys, tempfile

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("缺少 Pillow，先运行：python3 -m pip install pillow")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STEP = float(sys.argv[sys.argv.index("--step") + 1]) if "--step" in sys.argv else 3.0
args = [a for i, a in enumerate(sys.argv[1:], 1) if a != "--step" and sys.argv[i - 1] != "--step"]
if len(args) < 2:
    sys.exit(__doc__)
video, out = os.path.abspath(args[0]), os.path.abspath(args[1])
os.makedirs(out, exist_ok=True)
TL = json.load(open(os.path.join(ROOT, "remotion/src/data/timeline.json"), encoding="utf-8"))
ZH = TL.get("lang") == "zh"
FONT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 24)


def run(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def stamp(sec):
    return f"{int(sec // 60)}:{sec % 60:04.1f}"


def text_of(seg):
    """观众读到的字幕：中文版原声是翻译，其余是逐词拼起来。"""
    if seg.get("subs") is not None:
        return "".join(x["t"] for x in seg["subs"]) or "（缺翻译）"
    out = ""
    for w in seg["words"]:
        a, b = out[-1:], w["w"][:1]
        cjk = lambda c: "　" <= c <= "鿿" or "＀" <= c <= "￯"
        out += (" " if a and b and not cjk(a) and not cjk(b) else "") + w["w"]
    return out


def frame(t, path, label=None, w=480):
    run("ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, t):.3f}", "-i", video, "-frames:v", "1", "-vf", f"scale={w}:{w * 9 // 16}", "-q:v", "3", path)
    im = Image.open(path).convert("RGB")  # 这台机器的 ffmpeg 没有 drawtext，时间用 Pillow 写
    d = ImageDraw.Draw(im)
    text = label or stamp(t)
    box = d.textbbox((8, 6), text, font=FONT)
    d.rectangle((box[0] - 5, box[1] - 4, box[2] + 5, box[3] + 4), fill=(0, 0, 0))
    d.text((8, 6), text, font=FONT, fill=(255, 255, 255))
    im.save(path, quality=88)


def tile(paths, dst, cols=4):
    if len(paths) == 1:
        shutil.copy(paths[0], dst); return
    a = ["ffmpeg", "-v", "error", "-y"]
    for p in paths:
        a += ["-i", p]
    layout = "|".join(f"{(i % cols) * 480}_{(i // cols) * 270}" for i in range(len(paths)))
    run(*a, "-filter_complex", "".join(f"[{i}:v]" for i in range(len(paths))) + f"xstack=inputs={len(paths)}:layout={layout}:fill=black", "-q:v", "4", dst)


D = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).decode())
tmp = tempfile.mkdtemp()

# ---- 帧拼图 ----
ts = [i * STEP + 1 for i in range(int((D - 1) // STEP) + 1)]
index = []
for n, start in enumerate(range(0, len(ts), 20)):
    part, ps = ts[start:start + 20], []
    for t in part:
        p = os.path.join(tmp, f"s{int(t * 10)}.jpg"); frame(t, p); ps.append(p)
    tile(ps, os.path.join(out, f"sheet-{n + 1:02d}.jpg"))
    index.append(f"- sheet-{n + 1:02d}.jpg：{stamp(part[0])} – {stamp(part[-1])}，每行 4 格，每格间隔 {STEP:g} 秒，从左到右、从上到下")

# ---- 切点前后：换章、进出原声 ----
cuts = set()
for sc in TL["scenes"]:
    cuts.add(round(sc["start"], 2))
    for g in sc["segments"]:
        if g["type"] == "clip":
            cuts |= {round(g["start"], 2), round(g["start"] + g["dur"], 2)}
cuts = sorted(t for t in cuts if 0.5 < t < D - 0.2)
cut_index = []
for n, start in enumerate(range(0, len(cuts), 10)):
    part, ps = cuts[start:start + 10], []
    for t in part:
        a, b = os.path.join(tmp, f"a{t}.jpg"), os.path.join(tmp, f"b{t}.jpg")
        frame(t - 0.12, a, f"before {stamp(t)}"); frame(t + 0.12, b, f"after {stamp(t)}"); ps += [a, b]
    tile(ps, os.path.join(out, f"cuts-{n + 1:02d}.jpg"))
    cut_index.append(f"- cuts-{n + 1:02d}.jpg：切点 " + "、".join(stamp(t) for t in part) + "（每两格一组：切点前、切点后）")

# ---- timeline / narration ----
rows = ["# 时间线", ""]
nar = ["# 旁白和原声字幕（按播放顺序）", ""]
for sc in TL["scenes"]:
    rows += [f"## {sc['id']} — {sc['title']}（{stamp(sc['start'])} – {stamp(sc['end'])}，{sc['end'] - sc['start']:.0f} 秒）", "", "| 时间 | 段 | 类型 | 文字 |", "|---|---|---|---|"]
    for g in sc["segments"]:
        txt = text_of(g)
        if g["type"] == "clip":
            m = g.get("meta", {})
            who = "，".join(x for x in (m.get("speaker"), m.get("role")) if x) or "受访者"
            rows.append(f"| {stamp(g['start'])} | {g['key']} | 原声 · {who} · {m.get('show', '')} {m.get('date', '')} · 贴纸「{m.get('sticker', '')}」 | {txt} |")
            nar.append(f"{stamp(g['start'])}　【{'播客原声' if ZH else 'Podcast clip'} · {who}】{txt}")
        else:
            rows.append(f"| {stamp(g['start'])} | {g['key']} | 旁白 | {txt} |")
            nar.append(f"{stamp(g['start'])}　{txt}")
    rows.append(""); nar.append("")
rows += ["## 图片索引", ""] + index + cut_index
open(os.path.join(out, "timeline.md"), "w", encoding="utf-8").write("\n".join(rows) + "\n")
open(os.path.join(out, "narration.md"), "w", encoding="utf-8").write("\n".join(nar) + "\n")

# ---- tech ----
vol = subprocess.run(["ffmpeg", "-i", video, "-af", "volumedetect", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
freeze = subprocess.run(["ffmpeg", "-i", video, "-vf", "freezedetect=n=0.003:d=1.5", "-map", "0:v", "-f", "null", "-"], capture_output=True, text=True).stderr
st, du = re.findall(r"freeze_start: ([\d.]+)", freeze), re.findall(r"freeze_duration: ([\d.]+)", freeze)
tech = ["# 技术报告", "", f"- 时长：{D:.1f} 秒（{stamp(D)}），时间轴 {TL['total']:.1f} 秒"] + ["- " + m for m in re.findall(r"(mean_volume: [-\d.]+ dB|max_volume: [-\d.]+ dB)", vol)]
idx = os.path.join(ROOT, "remotion/src/scenes/index.ts")
if os.path.exists(idx):
    a = re.search(r"WRITTEN[^{]*\{(.*?)\n\};", open(idx, encoding="utf-8").read(), re.S)
    written = set(re.findall(r"^\s*(\w+)\s*:", a.group(1), re.M)) if a else set()
    todo = [s["id"] for s in TL["scenes"] if s["id"] not in written]
    tech += ["", "## 还在用占位画面的章", "", "、".join(todo) if todo else "无"]
tech += ["", "## 超过 1.5 秒的静止段", ""] + ([f"- {stamp(float(a))}，{float(b):.1f} 秒" for a, b in zip(st, du)] or ["无"])
rep = os.path.join(ROOT, "sources/vo_chunks_mm/report.txt")
if os.path.exists(rep):
    lines = open(rep, encoding="utf-8").read().split("\n")
    low = [l + ("\n" + lines[i + 1] if i + 1 < len(lines) and lines[i + 1].startswith(" ") else "") for i, l in enumerate(lines) if l[:1].isdigit() and float(l[:5]) < 0.9]
    tech += ["", "## 配音听写低分段（< 0.9，要听）", ""] + (low[-20:] or ["无"])
open(os.path.join(out, "tech.md"), "w", encoding="utf-8").write("\n".join(tech) + "\n")
shutil.rmtree(tmp, ignore_errors=True)
print(f"{out}：{len(index)} 张帧拼图，{len(cut_index)} 张切点拼图，{len(cuts)} 个切点")
