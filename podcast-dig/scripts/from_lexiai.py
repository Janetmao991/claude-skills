#!/usr/bin/env python3
"""from_lexiai.py — 与 LexiAI 播客语料库共用 Whisper 转写,同一集不转两次。

LexiAI(~/lexiai/podcast/data/corpus.db)用本地 whisper large-v3-turbo 转写 RSS 音频,
逐句时间戳与 pool.json 的 audio_url 完全对齐(YouTube 字幕的时间戳对不上 RSS 音频)。

用法:
  from_lexiai.py lookup --show S --title T [--audio-url U] [--para-secs 30] > raw.md
      语料库里有这一集 → 输出 [mm:ss] 段落(同 vtt_to_md.py 格式),exit 0;没有 → exit 2。
  from_lexiai.py transcribe --show S --title T --audio-url U [--para-secs 30] > raw.md
      没有就用 LexiAI 的 ingest.py 本地转写(约 2 分钟/小时音频,同时进入 LexiAI 语料库),再输出。
  from_lexiai.py scan --pool <podcast-pool.json>
      列出 pool 里还没有 transcript、但 LexiAI 已经转写过的集。
"""
import argparse
import json
import os
import re
import sqlite3
import subprocess
import sys

LEXI = os.path.expanduser("~/lexiai/podcast")
CORPUS = os.path.join(LEXI, "data", "corpus.db")


def title_key(t):
    return re.sub(r"[^a-z0-9]", "", (t or "").lower())[:60]


def show_key(s):
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())[:8]


def find_episode(con, show, title, audio_url=None):
    if audio_url:
        row = con.execute("SELECT id FROM episodes WHERE audio_url = ?", (audio_url,)).fetchone()
        if row:
            return row[0]
    for eid, s, t in con.execute("SELECT id, show, title FROM episodes"):
        if title_key(t) == title_key(title) and show_key(s) == show_key(show):
            return eid
    return None


def fmt_ts(sec):
    sec = int(sec)
    h, m, s = sec // 3600, (sec % 3600) // 60, sec % 60
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


def print_paragraphs(con, eid, para_secs):
    rows = con.execute("SELECT start, text FROM sentences WHERE episode_id = ? ORDER BY start", (eid,)).fetchall()
    buf, para_start = [], None
    for start, text in rows:
        if buf and start - para_start >= para_secs:
            print(f"[{fmt_ts(para_start)}] {' '.join(buf)}\n")
            buf = []
        if not buf:
            para_start = start
        buf.append(text)
    if buf:
        print(f"[{fmt_ts(para_start)}] {' '.join(buf)}\n")


def main():
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name in ("lookup", "transcribe"):
        p = sub.add_parser(name)
        p.add_argument("--show", required=True)
        p.add_argument("--title", required=True)
        p.add_argument("--audio-url", required=(name == "transcribe"))
        p.add_argument("--para-secs", type=int, default=30)
    sp = sub.add_parser("scan")
    sp.add_argument("--pool", required=True)
    args = ap.parse_args()

    if not os.path.exists(CORPUS):
        sys.exit(f"LexiAI corpus not found at {CORPUS}")
    con = sqlite3.connect(CORPUS)

    if args.cmd == "scan":
        eps = json.load(open(args.pool)).get("episodes", [])
        hits = [e for e in eps if not e.get("transcript_file")
                and find_episode(con, e.get("show"), e.get("episode_title"), e.get("audio_url"))]
        for e in hits:
            print(f"{e.get('id')}\t{e.get('show')}\t{e.get('episode_title')}")
        print(f"{len(hits)} pool episodes already transcribed by LexiAI", file=sys.stderr)
        return

    eid = find_episode(con, args.show, args.title, args.audio_url)
    if eid is None and args.cmd == "transcribe":
        print("transcribing with LexiAI's local Whisper…", file=sys.stderr)
        subprocess.run([sys.executable, os.path.join(LEXI, "ingest.py"), "--audio-url", args.audio_url,
                        "--title", args.title, "--show-name", args.show, "--kind", "work"],
                       check=True, stdout=sys.stderr)
        con = sqlite3.connect(CORPUS)
        eid = find_episode(con, args.show, args.title, args.audio_url)
    if eid is None:
        sys.exit(2)
    print_paragraphs(con, eid, args.para_secs)


if __name__ == "__main__":
    main()
