"""tidy_project.py —— 一期做完后清理项目文件夹：先列出会删什么、能腾多少空间，确认后放进废纸篓（可恢复）。

用法：
  python3 <skill>/scripts/tidy_project.py <项目> [<项目> ...]            # 只列清单，不动文件
  python3 <skill>/scripts/tidy_project.py <项目> --apply                 # 放进废纸篓
  python3 <skill>/scripts/tidy_project.py <项目> --drop-lines --apply    # 连逐句配音 assets/vo/lines/ 一起清

默认清（都是能重新生成、或已有副本的）：
  - renders/ 里的视频：只清在 ~/AI-Terms/成片/ 有一模一样副本的；没副本的列出来、不动
  - 配音中间产物：voiceover_raw.wav（每次 build_vo 重新生成）
  - assets/vo/lines/ 里旧引擎留下的 .mp3（build_vo.py 用 Qwen、同名 .wav 在的时候）
  - 预览缓存：.thumbnails/、.waveform-cache/、.hyperframes/artifacts/
  - voice-samples/（试音样本）、审片/sheets/（film_check --sheets 随时能重出）
--drop-lines：再清 assets/vo/lines/（每句单独的配音）。清了以后改一句就得全部重配，而且 Qwen 每次配出来会有点不一样，
              只对已经发布、不再改的期数用。
永远不动：SCRIPT / SHOTLIST / BRIEF / REVIEW、compositions/、tools/、assets/real*、logos、fonts、voiceover.wav、timeline.js、voiceover.v1.wav / .base.wav（build_holds 插停顿的原版）、cover/。
"""
from __future__ import annotations

import argparse
import hashlib
import os
import subprocess
import sys

EXPORTS = os.path.expanduser("~/AI-Terms/成片")
VIDEO = (".mp4", ".mov", ".webm")


def size(p):
    if isinstance(p, list):
        return sum(size(x) for x in p)
    if os.path.isfile(p):
        return os.path.getsize(p)
    return sum(os.path.getsize(os.path.join(r, f)) for r, _, fs in os.walk(p) for f in fs)


def human(n):
    for u in ("B", "KB", "MB", "GB"):
        if n < 1024 or u == "GB":
            return f"{n:.0f} {u}" if u in ("B", "KB") else f"{n:.1f} {u}"
        n /= 1024


def md5(p, cache={}):
    if p not in cache:
        h = hashlib.md5()
        with open(p, "rb") as f:
            for b in iter(lambda: f.read(1 << 20), b""):
                h.update(b)
        cache[p] = h.hexdigest()
    return cache[p]


def export_index():
    """exports 里的视频：按大小分组，真要比的时候再算 md5。"""
    idx = {}
    if os.path.isdir(EXPORTS):
        for f in os.listdir(EXPORTS):
            p = os.path.join(EXPORTS, f)
            if f.lower().endswith(VIDEO) and os.path.isfile(p):
                idx.setdefault(os.path.getsize(p), []).append(p)
    return idx


def plan(proj, drop_lines, idx):
    """返回 [(路径, 原因)] 和 [(路径, 为什么留着)]。"""
    go, keep = [], []
    j = lambda *a: os.path.join(proj, *a)
    rd = j("renders")
    if os.path.isdir(rd):
        for f in sorted(os.listdir(rd)):
            p = os.path.join(rd, f)
            if not f.lower().endswith(VIDEO):
                continue
            twin = next((e for e in idx.get(os.path.getsize(p), []) if md5(e) == md5(p)), None)
            if twin:
                go.append((p, f"exports 里有副本：{os.path.basename(twin)}"))
            else:
                keep.append((p, "exports 里没有副本，要删先复制过去或自己删"))
    vo = j("assets", "vo")
    if os.path.isdir(vo):
        for f in sorted(os.listdir(vo)):
            # 只清 voiceover_raw.wav。voiceover.v1.wav / .base.wav 不是旧版本：build_holds 每次都从它们重新插停顿，
            # 删了下次会把已插过停顿的配音当原版，停顿插两遍
            if f == "voiceover_raw.wav":
                go.append((os.path.join(vo, f), "配音拼接中间产物，build_vo 每次重新生成"))
        lines = os.path.join(vo, "lines")
        if os.path.isdir(lines):
            if drop_lines:
                go.append((lines, "逐句配音（--drop-lines）：之后改一句要全部重配"))
            else:
                bv = j("tools", "build_vo.py")
                qwen = os.path.exists(bv) and 'ENGINE = "qwen"' in open(bv, encoding="utf-8").read()
                names = set(os.listdir(lines))
                mp3 = [os.path.join(lines, f) for f in sorted(names) if f.endswith(".mp3") and f[:-4] + ".wav" in names]
                if qwen and mp3:  # 现在用 Qwen 出 wav，mp3 是旧引擎（edge-tts）留下的
                    go.append((mp3, f"assets/vo/lines/ 里 {len(mp3)} 个旧配音引擎的 mp3（现在用 Qwen 的 wav）"))
    for d, why in ((".thumbnails", "预览缩略图缓存"), (".waveform-cache", "波形缓存"),
                   (os.path.join(".hyperframes", "artifacts"), "HyperFrames 预览缓存"),
                   ("voice-samples", "试音样本"), (os.path.join("审片", "sheets"), "审片缩略图，film_check --sheets 能重出")):
        if os.path.exists(j(d)):
            go.append((j(d), why))
    return [(p, w) for p, w in go if size(p) > 0], keep


def trash(p):
    if isinstance(p, list):
        for x in p:
            trash(x)
        return
    # Finder 的「移到废纸篓」：可以在废纸篓里「放回原处」
    a = os.path.abspath(p).replace("\\", "\\\\").replace('"', '\\"')
    subprocess.run(["osascript", "-e", f'tell application "Finder" to delete POSIX file "{a}"'],
                   check=True, capture_output=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("projects", nargs="+")
    ap.add_argument("--apply", action="store_true", help="真的放进废纸篓（不加只列清单）")
    ap.add_argument("--drop-lines", action="store_true", help="连 assets/vo/lines/ 一起清")
    a = ap.parse_args()
    idx = export_index()
    total, todo = 0, []
    for proj in a.projects:
        proj = os.path.abspath(os.path.expanduser(proj))
        if not os.path.isfile(os.path.join(proj, "SCRIPT.md")) and not os.path.isdir(os.path.join(proj, "compositions")):
            print(f"跳过 {proj}：不像讲解视频项目（没有 SCRIPT.md 或 compositions/）")
            continue
        go, keep = plan(proj, a.drop_lines, idx)
        sub = sum(size(p) for p, _ in go)
        total += sub
        print(f"\n== {proj}（现在 {human(size(proj))}，可腾出 {human(sub)}）")
        for p, why in go:
            print(f"  删  {human(size(p)):>9}  {'' if isinstance(p, list) else os.path.relpath(p, proj)}  —— {why}")
        for p, why in keep:
            print(f"  留  {human(size(p)):>9}  {os.path.relpath(p, proj)}  —— {why}")
        todo += go
    print(f"\n合计可腾出 {human(total)}。")
    if not a.apply:
        print("这次只列了清单，没动文件。确认后加 --apply 放进废纸篓。")
        return
    for p, _ in todo:
        trash(p)
    print(f"已放进废纸篓 {len(todo)} 组。要找回：打开废纸篓，右键「放回原处」。")


if __name__ == "__main__":
    sys.exit(main())
