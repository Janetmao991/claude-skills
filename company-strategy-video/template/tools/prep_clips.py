"""把 SCRIPT.md 里用到的原声（单独一行 @key）裁好，写 remotion/src/data/clips.json。

clips.json（项目根目录）每段：yt, win(HH:MM:SS), in, out, speaker, role, show, date,
zhs（逐段中文翻译，段数要和英文分段一致，运行时会打印英文分段），fix（可选的听写纠错，{"错词": "正确"}）。
先跑 ./dl_clips.sh 下载 65 秒窗口。用法：python3 tools/prep_clips.py
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from clips_lib import ROOT, build_clip  # noqa: E402
from clipseg import segments  # noqa: E402

os.chdir(ROOT)
used = list(dict.fromkeys(m.group(1) for m in re.finditer(r"^@(\w+)", open("SCRIPT.md", encoding="utf-8").read(), re.M)))
used = [k for k in used if not os.environ.get("ONLY") or k in os.environ["ONLY"].split(",")]  # 样片阶段只裁部分原声
clips, out, bad = json.load(open("clips.json", encoding="utf-8")), {}, 0
for key in used:
    c = clips[key]
    d, words = build_clip(key, c)
    for w in words:
        core = w["w"].rstrip(",.?!")
        w["w"] = c.get("fix", {}).get(core, core) + w["w"][len(core):]
    if c.get("drop_tail"): words = words[:-c["drop_tail"]]  # 听写在切点处多出来的词
    segs, zhs = segments([w["w"] for w in words]), c.get("zhs", [])
    if len(segs) != len(zhs):
        bad += 1
        print(f"!! {key}: 英文 {len(segs)} 段，zhs 有 {len(zhs)} 句")
        for i, (a, b) in enumerate(segs):
            print(f"   {i}: {' '.join(x['w'] for x in words[a:b + 1])}")
    out[key] = {"src": f"podcast/{key}.mp4", "dur": d, "words": words, "segs": segs, "zhs": zhs, "zh": zhs, **{k: c.get(k, "") for k in ("speaker", "role", "show", "date", "yt", "still")}, "in": c["in"], "out": c["out"]}
json.dump(out, open("remotion/src/data/clips.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(f"{len(out)} clips, {bad} 段缺翻译")
