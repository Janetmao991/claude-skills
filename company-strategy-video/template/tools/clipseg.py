"""播客原声字幕分段：句末断开；超过 11 个词遇到逗号断开；最多 16 个词；不超过 3 个词的尾巴并回上一段。
prep_clips.py 和翻译都用这一个规则，保证中文翻译（clips.json 里的 zhs）和英文分段一一对应。"""
import re

def segments(words):
    out = [[]]
    for i, w in enumerate(words):
        out[-1].append(i)
        n = len(out[-1])
        if re.search(r"[.?!]$", w) or (n >= 11 and re.search(r",$", w)) or n >= 16:
            out.append([])
    out = [x for x in out if x]
    merged = []
    for seg in out:
        if merged and len(seg) <= 3:
            merged[-1] += seg
        else:
            merged.append(seg)
    return [(s[0], s[-1]) for s in merged]
