"""画面不能停：逐秒检查成片里"声音和字幕在走、画面停着"的地方（Janet 2026-11-16 定的硬规则）。

做法：每 0.5 秒取一帧（缩成 320×180 灰度），比较每一帧和 1 秒后那一帧的平均像素差（0–255）。
连续 ≥ MIN_SPAN 秒都小于阈值，就算一段"停住"。字幕区（画面最下面 22%）不算，因为字幕一直在换，会掩盖画面本身没动。
慢推、光团漂移这类很轻的运动差值大约 0.3–1，人眼看起来就是停着的；真正在动的镜头一般在 2 以上。

用法：python3 tools/motion_check.py renders/xxx.mp4 [--thr 1.5] [--min 2.0]
有停住的段就以非零退出码结束，并列出时间、时长、那段对应的台词 id。
"""
import json, os, subprocess, sys

import numpy as np

video = sys.argv[1]
THR = float(sys.argv[sys.argv.index("--thr") + 1]) if "--thr" in sys.argv else 1.5
MIN_SPAN = float(sys.argv[sys.argv.index("--min") + 1]) if "--min" in sys.argv else 2.0
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, STEP = 320, 180, 0.5

raw = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"fps={1 / STEP},scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W).astype(np.float32)[:, : int(H * 0.78), :]
lag = int(round(1 / STEP))
diffs = [float(np.abs(frames[i + lag] - frames[i]).mean()) for i in range(len(frames) - lag)]

vo = json.load(open(os.path.join(ROOT, "remotion/src/data/vo.json"), encoding="utf-8"))
CLIPS = [(c["start"], c["start"] + c["dur"]) for c in vo["clips"]]
def in_clip(t0, t1):  # 原声段是人在说话，不算停住
    return any(a - 0.5 <= t0 and t1 <= b + 0.8 for a, b in CLIPS)
def line_at(t):
    best = None
    for k, l in vo["lines"].items():
        if l["start"] - 0.3 <= t <= l["end"] + 0.6:
            best = k
    for c in vo["clips"]:
        if c["start"] <= t <= c["start"] + c["dur"]:
            best = "@" + c["key"]
    return best or "-"

spans, start = [], None
for i, d in enumerate(diffs + [99]):
    if d < THR and start is None:
        start = i
    elif d >= THR and start is not None:
        dur = (i - start) * STEP + 1  # 每个差值覆盖 1 秒
        if dur >= MIN_SPAN and not in_clip(start * STEP, start * STEP + dur):
            spans.append((start * STEP, dur, min(diffs[start:i])))
        start = None

total = len(frames) * STEP
still = sum(s[1] for s in spans)
print(f"画面不能停检查：阈值 {THR}，最短 {MIN_SPAN} 秒；全片 {total:.0f} 秒，停住 {len(spans)} 段共 {still:.0f} 秒（{100 * still / max(1, total):.0f}%）")
for t, d, m in spans:
    print(f"  {int(t // 60)}:{t % 60:04.1f}  停 {d:.1f} 秒  最小差 {m:.2f}  台词 {line_at(t + d / 2)}")
sys.exit(1 if spans else 0)
