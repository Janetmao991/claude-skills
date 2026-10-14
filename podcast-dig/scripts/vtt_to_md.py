#!/usr/bin/env python3
"""vtt_to_md.py — YouTube VTT 字幕 → 带时间戳的段落 Markdown。

用法: python3 vtt_to_md.py input.vtt [--para-secs 60] > raw.md

处理 yt-dlp 的自动字幕(滚动窗口重复行)和人工字幕。
输出: 每段前缀 [mm:ss](或 [h:mm:ss]),段落按 --para-secs 切分。
自动字幕无标点,输出仅供后续"整理不改写"清洗层使用。
"""
import argparse
import re
import sys

CUE_RE = re.compile(r"(\d{2}:\d{2}:\d{2})\.(\d{3})\s+-->\s+\d{2}:\d{2}:\d{2}\.\d{3}")
TAG_RE = re.compile(r"<[^>]+>")


def parse_ts(hms: str) -> int:
    h, m, s = hms.split(":")
    return int(h) * 3600 + int(m) * 60 + int(s)


def fmt_ts(sec: int) -> str:
    h, m, s = sec // 3600, (sec % 3600) // 60, sec % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("vtt")
    ap.add_argument("--para-secs", type=int, default=30)
    args = ap.parse_args()

    with open(args.vtt, encoding="utf-8") as f:
        lines = f.read().splitlines()

    # 收集 (start_sec, text_line),按行去重(滚动字幕每行会出现两次)
    entries = []
    last_line = None
    cur_start = None
    for ln in lines:
        m = CUE_RE.search(ln)
        if m:
            cur_start = parse_ts(m.group(1))
            continue
        if cur_start is None:
            continue
        text = TAG_RE.sub("", ln).strip()
        if not text or text == last_line:
            continue
        entries.append((cur_start, text))
        last_line = text

    if not entries:
        sys.exit("no cues parsed — is this a valid VTT file?")

    # 按时间窗聚段
    paras = []
    buf = []
    para_start = entries[0][0]
    for start, text in entries:
        if buf and start - para_start >= args.para_secs:
            paras.append((para_start, " ".join(buf)))
            buf, para_start = [], start
        buf.append(text)
    if buf:
        paras.append((para_start, " ".join(buf)))

    for start, text in paras:
        print(f"[{fmt_ts(start)}] {text}\n")


if __name__ == "__main__":
    main()
