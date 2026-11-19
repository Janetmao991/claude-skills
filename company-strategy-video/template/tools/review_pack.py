"""把成片整理成审片 agent 能看的材料（agent 看不了动态，也听不到声音）。

输出到指定文件夹：
  timeline.md   每句台词的时间、中英文、画面类型（含原声翻译）
  narration.md  只有观众听到的中文，按顺序，给"新观众"审片用
  sheet-*.jpg   每 2 秒一帧的拼图，每格标时间
  cuts-*.jpg    每个切点前后的帧（左 = 切点前，右 = 切点后），用来看卡帧和闪帧
  shots-*.jpg   每个镜头取中间一帧，按播放顺序，每格标时间和素材（给风格审片员 C）
  shots-phone.jpg  同一组镜头缩到手机大小
  ref-*.jpg     参考帧：--ref 指定的每个视频均匀抽 12 帧（Janet 的参考片、公司官方片），给风格审片员 C 做比较
  tech.md       时长、音量、静止段、配音听写报告

用法：python3 tools/review_pack.py renders/xxx.mp4 review/round-1 [--root <video 文件夹>] [--ref 参考视频.mp4 ...]
"""
import json, os, re, shutil, subprocess, sys, tempfile

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    sys.exit("缺少 Pillow，先运行：python3 -m pip install pillow")

REFS = [sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == "--ref" and i + 1 < len(sys.argv)]
args = [a for i, a in enumerate(sys.argv[1:]) if a not in ("--root", "--ref") and sys.argv[i] not in ("--root", "--ref")]
ROOT = sys.argv[sys.argv.index("--root") + 1] if "--root" in sys.argv else os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
video, out = os.path.abspath(args[0]), os.path.abspath(args[1])
os.makedirs(out, exist_ok=True)
R = os.path.join(ROOT, "remotion")
vo = json.load(open(os.path.join(R, "src/data/vo.json"), encoding="utf-8"))
sf = os.path.join(R, "src/episode/shots.json")
shots = json.load(open(sf, encoding="utf-8")) if os.path.exists(sf) else []
L = vo["lines"]
cf = os.path.join(R, "src/data/clips.json")
CL = json.load(open(cf, encoding="utf-8")) if os.path.exists(cf) else {}


def clip_text(key):
    c = CL.get(key, {})
    words = c.get("words", [])
    en = [" ".join(w["w"] for w in words[a:b + 1]) for a, b in c.get("segs", [])]
    who = "，".join(x for x in (c.get("speaker"), c.get("role")) if x)
    return who, "".join(c.get("zhs", [])), " ".join(en)
FONT = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 24)
_CJK = [f for f in ("/System/Library/Fonts/Hiragino Sans GB.ttc", "/System/Library/Fonts/STHeiti Medium.ttc", "/System/Library/Fonts/PingFang.ttc") if os.path.exists(f)]
FONT_ZH = ImageFont.truetype(_CJK[0], 20) if _CJK else FONT  # 镜头标签里有中文


def run(*a):
    subprocess.run(a, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def duration():
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]).decode())


def stamp(sec):
    return f"{int(sec // 60)}:{sec % 60:04.1f}"


def media_name(m):
    if "v" in m: return f"视频 {os.path.basename(m['v'])}"
    if "img" in m: return f"图片 {os.path.basename(m['img'])}"
    if "post" in m: return "帖子卡"
    if "kit" in m: return f"HTML:{m['kit']}"
    if "scene" in m: return f"自定义:{m['scene']}"
    return "?"


def frame(t, path, label=None, w=480, font=None):
    h = w * 9 // 16
    run("ffmpeg", "-v", "error", "-y", "-ss", f"{max(0, t):.3f}", "-i", video, "-frames:v", "1", "-vf", f"scale={w}:{h}", "-q:v", "3", path)
    # 这台机器的 ffmpeg 没有 drawtext，时间标记用 Pillow 写
    im = Image.open(path).convert("RGB")
    d = ImageDraw.Draw(im)
    text = label or stamp(t)
    if label != "":
        fnt = font or FONT
        box = d.textbbox((8, 6), text, font=fnt)
        d.rectangle((box[0] - 5, box[1] - 4, box[2] + 5, box[3] + 4), fill=(0, 0, 0))
        d.text((8, 6), text, font=fnt, fill=(255, 255, 255))
    im.save(path, quality=88)


def tile(paths, dst, cols, w=480, h=270):
    args2 = ["ffmpeg", "-v", "error", "-y"]
    for p in paths:
        args2 += ["-i", p]
    if len(paths) == 1:
        shutil.copy(paths[0], dst)
        return
    layout = "|".join(f"{(i % cols) * w}_{(i // cols) * h}" for i in range(len(paths)))
    fc = "".join(f"[{i}:v]" for i in range(len(paths))) + f"xstack=inputs={len(paths)}:layout={layout}:fill=black"
    run(*args2, "-filter_complex", fc, "-q:v", "4", dst)


D = duration()
tmp = tempfile.mkdtemp()

# ---- 每 2 秒一帧 ----
ts = [i * 2.0 + 1 for i in range(int(D // 2))]
index = []
for n, start in enumerate(range(0, len(ts), 20)):
    chunk = ts[start:start + 20]
    ps = []
    for t in chunk:
        p = os.path.join(tmp, f"s{int(t * 10)}.jpg"); frame(t, p); ps.append(p)
    tile(ps, os.path.join(out, f"sheet-{n + 1:02d}.jpg"), 4)
    index.append(f"- sheet-{n + 1:02d}.jpg：{stamp(chunk[0])} – {stamp(chunk[-1])}，每行 4 格，每格间隔 2 秒，从左到右、从上到下")

# ---- 切点前后 ----
tok = {k: v["chars"] for k, v in L.items()}


def cue_time(k, line):
    if isinstance(k, (int, float)):
        return L[line]["start"] + k
    lid, w = (line, k) if isinstance(k, str) else k
    chars = tok.get(lid, [])
    for i in range(len(chars)):
        if "".join(c[0] for c in chars[i:]).startswith(w):
            return chars[i][1]
    return None


segs = []
for s in sorted([x for x in shots if x["at"] in L], key=lambda x: L[x["at"]]["start"]):
    t0 = max(0.0, L[s["at"]]["start"] - 0.15)
    segs.append((t0, s["at"], s["m"], s.get("tag")))
    for c in s.get("cuts", []):
        t = cue_time(c["k"], s["at"])
        if t is not None:
            segs.append((t, s["at"], c["m"], c.get("tag")))
segs.sort(key=lambda x: x[0])
cuts = sorted({round(s[0], 2) for s in segs if s[0] > 0.5} | {round(c["start"], 2) for c in vo["clips"]} | {round(c["start"] + c["dur"], 2) for c in vo["clips"]})
cuts = [t for t in cuts if t < D - 0.2]  # 太靠近片尾的切点没有"切点后"那一帧
cut_index = []
for n, start in enumerate(range(0, len(cuts), 10)):
    chunk = cuts[start:start + 10]
    ps = []
    for t in chunk:
        a, b = os.path.join(tmp, f"a{t}.jpg"), os.path.join(tmp, f"b{t}.jpg")
        frame(t - 0.12, a, f"before {stamp(t)}"); frame(t + 0.12, b, f"after {stamp(t)}"); ps += [a, b]
    tile(ps, os.path.join(out, f"cuts-{n + 1:02d}.jpg"), 4)
    cut_index.append(f"- cuts-{n + 1:02d}.jpg：切点 " + "、".join(stamp(t) for t in chunk) + "（每两格一组：切点前、切点后）")

# ---- 每个镜头一帧（风格审片员 C 的主材料）----
ev = [(t, media_name(m)) for t, _, m, _ in segs] + [(c["start"], "原声 " + c["key"]) for c in vo["clips"]]
for c in vo["clips"]:  # 原声结束后回到原声前的镜头
    before = [x for x in segs if x[0] <= c["start"]]
    if before: ev.append((c["start"] + c["dur"], media_name(before[-1][2])))
ev = sorted(ev) + [(D, None)]
mids = [((a[0] + b[0]) / 2, a[1]) for a, b in zip(ev, ev[1:]) if b[0] - a[0] >= 0.6]
shot_index, phone = [], []
for n, start in enumerate(range(0, len(mids), 20)):
    ps = []
    for t, name in mids[start:start + 20]:
        p = os.path.join(tmp, f"m{int(t * 100)}.jpg"); frame(t, p, f"{stamp(t)} {name}", font=FONT_ZH); ps.append(p)
    tile(ps, os.path.join(out, f"shots-{n + 1:02d}.jpg"), 4)
    shot_index.append(f"- shots-{n + 1:02d}.jpg：{stamp(mids[start][0])} – {stamp(mids[min(start + 19, len(mids) - 1)][0])}，每个镜头的中间帧，每行 4 格")
for t, _ in mids:
    p = os.path.join(tmp, f"p{int(t * 100)}.jpg"); frame(t, p, "", w=160); phone.append(p)
if phone:
    tile(phone, os.path.join(out, "shots-phone.jpg"), 8, 160, 90)
    shot_index.append("- shots-phone.jpg：同一组镜头缩到手机大小，每行 8 格，按播放顺序")

# ---- 参考帧（风格审片员 C 用来比较）----
for n, ref in enumerate(REFS):
    rd = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", ref]).decode())
    ps = []
    for j in range(12):
        t = rd * (j + 0.5) / 12
        q = os.path.join(tmp, f"r{n}_{j}.jpg")
        run("ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", ref, "-frames:v", "1", "-vf", "scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2", "-q:v", "3", q)
        ps.append(q)
    tile(ps, os.path.join(out, f"ref-{n + 1:02d}.jpg"), 4)
    shot_index.append(f"- ref-{n + 1:02d}.jpg：参考帧，{os.path.basename(ref)}，均匀抽 12 帧")


rows = ["# 时间线", "", "| 时间 | id | 中文 | English | 画面 |", "|---|---|---|---|---|"]
# narration.md：观众实际听到/看到的中文，按顺序，不带画面和英文，给"新观众"审片用
nar = ["# 旁白和原声字幕（按播放顺序）", ""]
items = [("line", v["start"], k) for k, v in L.items()] + [("clip", c["start"], c) for c in vo["clips"]]
for kind, t, x in sorted(items, key=lambda i: i[1]):
    if kind == "clip":
        who, zh, en = clip_text(x["key"])
        rows.append(f"| {stamp(t)} | @{x['key']} | 【原声·{who or '受访者'}】{zh or '（缺翻译）'} | {en} | 原声画框 |")
        nar.append(f"{stamp(t)}　【播客原声 · {who or '受访者'}】{zh or '（缺翻译）'}")
    else:
        nar.append(f"{stamp(t)}　{L[x]['zh']}")
        e = L[x]["end"]
        vis = [media_name(m) + (f"（{tg}）" if tg else "") for s0, _, m, tg in segs if t - 0.3 <= s0 < e]
        rows.append(f"| {stamp(t)} | {x} | {L[x]['zh']} | {L[x]['en']} | {'；'.join(vis) or '沿用上一个镜头'} |")
rows += ["", "## 图片索引", ""] + index + cut_index + shot_index
open(os.path.join(out, "timeline.md"), "w", encoding="utf-8").write("\n".join(rows) + "\n")
open(os.path.join(out, "narration.md"), "w", encoding="utf-8").write("\n".join(nar) + "\n")

# ---- tech ----
vol = subprocess.run(["ffmpeg", "-i", video, "-af", "volumedetect", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
freeze = subprocess.run(["ffmpeg", "-i", video, "-vf", "freezedetect=n=0.003:d=1.5", "-map", "0:v", "-f", "null", "-"], capture_output=True, text=True).stderr
st = re.findall(r"freeze_start: ([\d.]+)", freeze); du = re.findall(r"freeze_duration: ([\d.]+)", freeze)
rep = os.path.join(ROOT, "assets/vo/chunks/report.txt")
tech = [f"# 技术报告", "", f"- 时长：{D:.1f} 秒（{stamp(D)}）"] + ["- " + m for m in re.findall(r"(mean_volume: [-\d.]+ dB|max_volume: [-\d.]+ dB)", vol)]
tech += ["", "## 超过 1.5 秒的静止段", ""] + ([f"- {stamp(float(a))}，{float(b):.1f} 秒" for a, b in zip(st, du)] or ["无"])
tech += ["", "（SlowPush 会一直缩放，素材冻结时检测不到，请同时看 sheet 里连续格子是否完全同一帧。）"]
if os.path.exists(rep):
    tech += ["", "## 配音听写低分段（< 0.9）", ""] + [b for b in open(rep, encoding="utf-8").read().split("\n") if "<<<" in b][:20]
open(os.path.join(out, "tech.md"), "w", encoding="utf-8").write("\n".join(tech) + "\n")
shutil.rmtree(tmp, ignore_errors=True)
print(f"{out}：{len(index)} 张帧拼图，{len(cut_index)} 张切点拼图，{len(cuts)} 个切点，{len(mids)} 个镜头")
