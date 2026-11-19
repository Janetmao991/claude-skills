# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy", "pillow"]
# ///
"""film_check.py —— 出片前的机检：只看成片 mp4（加项目文件夹时再读镜头关键帧），按 Janet 的规矩亮红黄绿。

用法：
  uv run <skill>/scripts/film_check.py 成片.mp4 [--project <项目>] [--sheets]

查四样（思路借自 huashu-art-motion 的 film_gate / qa，阈值按 Janet 自己的片子重新定）：
  1. 最长「画面没变化」：屏蔽字幕带后，连续多少秒画面一点没动。品牌规范「每 3–5 秒画面要有新东西」。
     标定：Embedding 横屏前两分钟，无质感版 8.9 秒（Janet 嫌闷），手绘质感版 3.3 秒（Janet 保留）。
     >5 秒黄、>8 秒红，给出时间码。
  2. 空白帧：片中（去掉首尾 0.5 秒）整帧几乎没有线条和字，连续 ≥0.3 秒红。
  3. 蓝色：品牌规范蓝色已退役。一帧里蓝色像素 >0.08% 记一次（细箭头、手写字也要抓到），只报黄 + 时间码（公司真 logo 可以是蓝的，自己看一眼）。
  4. 镜头推近（要 --project，读 assets/camera-keys.js）：每分钟推近次数 >6 黄、>12 红；
     连续 4 次以上停在推近状态、不拉回全景，黄。标定：Embedding 第 1 期 10 次/分钟、最长连推 7 次，Janet 说偏多。
     借自花叔的镜头规矩：镜头是标点，有推就要有拉，观众在读字时镜头停住。

--sheets：每 2 秒抽一帧，20 帧一张拼成 contact sheet（带时间码），存到 <项目>/审片/sheets/（没给项目就存在 mp4 旁边），
         给独立审片 agent 看（references/review.md）。
有 --project 时把结果写进 <项目>/审片/机检.md。退出码：有红灯 2，否则 0。
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys

import numpy as np

FPS, W = 4, 320          # 量静止和空白：每秒 4 帧、320 宽
SUB_BAND = 0.16          # 字幕在 y 926–1030 / 1080，屏蔽底部 16%
CHANGE_PIX = 12          # 一个像素灰度变化 ≥12 算变了
CHANGE_FRAC = 0.0015     # 变了的像素 ≥0.15% 算「画面有新东西」


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=width,height:format=duration", "-of", "json", path],
                         capture_output=True, text=True, check=True).stdout
    j = json.loads(out)
    return j["streams"][0]["width"], j["streams"][0]["height"], float(j["format"]["duration"])


def frames(path, fmt, w, h, ch):
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={w}:{h}",
                          "-f", "rawvideo", "-pix_fmt", fmt, "-"], stdout=subprocess.PIPE)
    n = w * h * ch
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        yield np.frombuffer(b, np.uint8).reshape(h, w, ch) if ch > 1 else np.frombuffer(b, np.uint8).reshape(h, w)


def tc(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def runs(flags, min_len):
    """连续为 True 的段 → [(起秒, 止秒)]，只留长度 ≥min_len 的。"""
    out, s = [], None
    for i, f in enumerate(list(flags) + [False]):
        if f and s is None:
            s = i
        if not f and s is not None:
            if (i - s) / FPS >= min_len:
                out.append((s / FPS, i / FPS))
            s = None
    return out


def measure_video(path):
    vw, vh, dur = probe(path)
    h = round(W * vh / vw)
    cut = int(h * (1 - SUB_BAND))
    still, blank, blue = [], [], []
    prev = None
    for fr in frames(path, "rgb24", W, h, 3):
        a = fr[:cut].astype(np.float32)
        g = a @ np.array([0.299, 0.587, 0.114], np.float32)
        if prev is not None:
            still.append(np.mean(np.abs(g - prev) >= CHANGE_PIX) < CHANGE_FRAC)
        prev = g
        gy, gx = np.abs(np.diff(g, axis=0))[:, :-1], np.abs(np.diff(g, axis=1))[:-1]
        blank.append(np.mean(np.maximum(gx, gy) > 24) < 0.002)
        mx, mn = a.max(2), a.min(2)
        sat = (mx - mn) / np.maximum(mx, 1)
        r, gg, b = a[..., 0], a[..., 1], a[..., 2]
        blue.append(np.mean((b == mx) & (b - np.maximum(r, gg) > 25) & (sat > 0.35) & (mx > 40)) > 0.0008)
    n = len(blank)
    edge = int(0.5 * FPS)
    mid_blank = [f if edge <= i < n - edge else False for i, f in enumerate(blank)]
    still_runs = sorted(runs(still, 3.0), key=lambda r: r[1] - r[0], reverse=True)
    return dict(duration=dur, still_runs=still_runs, blank_runs=runs(mid_blank, 0.3),
                blue_runs=runs(blue, 0.25))


def measure_camera(project, dur):
    p = os.path.join(project, "assets", "camera-keys.js")
    if not os.path.exists(p):
        return None
    s = open(p, encoding="utf-8").read()
    K = json.loads(s[s.index("["): s.rindex("]") + 1])
    pushes = [k for k in K if k.get("s", 1) > 1.0]
    run = best = 0
    best_at = None
    for k in K:
        run = run + 1 if k.get("s", 1) > 1.0 else 0
        if run > best:
            best, best_at = run, k["t"]
    return dict(keys=len(K), pushes=len(pushes), per_min=len(pushes) / max(dur / 60, 1e-6),
                max_run=best, max_run_at=best_at)


def grade(v, cam):
    rows = []  # (灯, 项, 说明)
    longest = (v["still_runs"][0][1] - v["still_runs"][0][0]) if v["still_runs"] else 0.0
    light = "红" if longest > 8 else "黄" if longest > 5 else "绿"
    spots = "，".join(f"{tc(a)}–{tc(b)}（{b - a:.1f}s）" for a, b in v["still_runs"][:5] if b - a > 5)
    rows.append((light, "最长画面没变化", f"{longest:.1f} 秒" + (f"；超过 5 秒的：{spots}。在这里补一个动作（画一笔、荧光笔、屏幕里的操作）" if spots else "")))
    if v["blank_runs"]:
        rows.append(("红", "空白帧", "，".join(f"{tc(a)}–{tc(b)}" for a, b in v["blank_runs"]) + "：整帧几乎没有线条和字"))
    else:
        rows.append(("绿", "空白帧", "没有"))
    if v["blue_runs"]:
        rows.append(("黄", "蓝色", "，".join(f"{tc(a)}–{tc(b)}" for a, b in v["blue_runs"][:8]) + "：蓝色已退役，看一眼是不是公司真 logo；不是就改成深灰或粉"))
    else:
        rows.append(("绿", "蓝色", "没有"))
    if cam:
        pm = cam["per_min"]
        light = "红" if pm > 12 else "黄" if pm > 6 else "绿"
        rows.append((light, "镜头推近", f"{cam['pushes']} 次，{pm:.1f} 次/分钟（>6 黄，>12 红）。太密就调大 build_camera.py 的 MIN_SHIFT，或只在换想法时推"))
        light = "黄" if cam["max_run"] >= 4 else "绿"
        rows.append((light, "连推不拉回", f"最长连续 {cam['max_run']} 次停在推近状态（{tc(cam['max_run_at'] or 0)} 前后）；有推就要有拉，换段落拉回全景"))
    return rows


def sheets(path, out_dir, dur, step=2.0, cols=5, rows=4):
    """每 step 秒抽一帧，cols×rows 一张，左上角写时间码。"""
    from PIL import Image, ImageDraw, ImageFont
    os.makedirs(out_dir, exist_ok=True)
    for f in os.listdir(out_dir):
        if f.startswith("sheet_"):
            os.remove(os.path.join(out_dir, f))
    vw, vh, _ = probe(path)
    w, h = 480, round(480 * vh / vw)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={1 / step},scale={w}:{h}",
                          "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 26)
    except OSError:
        font = ImageFont.load_default()
    imgs, i = [], 0
    while True:
        b = p.stdout.read(w * h * 3)
        if len(b) < w * h * 3:
            break
        im = Image.frombytes("RGB", (w, h), b)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, 92, 34], fill=(0, 0, 0))
        d.text((8, 3), tc(i * step)[:-2], font=font, fill=(255, 255, 255))
        imgs.append(im)
        i += 1
    names, per, pad = [], cols * rows, 6
    for k in range(0, len(imgs), per):
        sheet = Image.new("RGB", (cols * (w + pad) + pad, rows * (h + pad) + pad), "white")
        for j, im in enumerate(imgs[k:k + per]):
            sheet.paste(im, (pad + (j % cols) * (w + pad), pad + (j // cols) * (h + pad)))
        name = f"sheet_{k // per + 1:02d}.png"
        sheet.save(os.path.join(out_dir, name))
        names.append(name)
    return names


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--project")
    ap.add_argument("--sheets", action="store_true")
    a = ap.parse_args()
    v = measure_video(a.video)
    cam = measure_camera(a.project, v["duration"]) if a.project else None
    rows = grade(v, cam)
    lines = [f"# 机检：{os.path.basename(a.video)}（{tc(v['duration'])}）", ""]
    lines += [f"- [{l}] {k}：{d}" for l, k, d in rows]
    red = any(l == "红" for l, _, _ in rows)
    lines += ["", "结论：" + ("有红灯，先改再交付。" if red else "没有红灯。黄灯逐条看一眼，写进 REVIEW.md。"),
              "机检查不了的（字出框、标签重叠、高亮框没框住数字、字幕把英文词切开、数字和来源对不上）交给独立审片，见 references/review.md。"]
    if a.sheets:
        d = os.path.join(a.project, "审片", "sheets") if a.project else os.path.splitext(a.video)[0] + "_sheets"
        fs = sheets(a.video, d, v["duration"])
        lines.append(f"\ncontact sheets：{d}（{len(fs)} 张，每 2 秒一帧）")
    text = "\n".join(lines)
    print(text)
    if a.project:
        os.makedirs(os.path.join(a.project, "审片"), exist_ok=True)
        open(os.path.join(a.project, "审片", "机检.md"), "w", encoding="utf-8").write(text + "\n")
    sys.exit(2 if red else 0)


if __name__ == "__main__":
    main()
