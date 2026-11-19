"""镜头表体检：每句台词都有画面、卡点词能对上台词、素材文件存在、卡点词不带空格。
用法：python3 tools/check_plan.py（配音生成后跑，渲染前跑）。退出码非 0 表示有问题。
"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
R = os.path.join(ROOT, "remotion")
vo = json.load(open(os.path.join(R, "src/data/vo.json"), encoding="utf-8"))
shots = json.load(open(os.path.join(R, "src/episode/shots.json"), encoding="utf-8"))
L = vo["lines"]
tok = {k: "".join(c[0] for c in v["chars"]) for k, v in L.items()}
problems, covered = [], set()
pub = os.path.join(R, "public")


def media(m, where):
    for key in ("v", "img"):
        if key in m and not os.path.exists(os.path.join(pub, m[key])):
            problems.append(f"{where}: 找不到素材 {m[key]}")
    if "post" in m and m["post"].get("bg") and not os.path.exists(os.path.join(pub, m["post"]["bg"])):
        problems.append(f"{where}: 找不到帖子背景 {m['post']['bg']}")
    if "post" in m and m["post"].get("hl") and m["post"]["hl"] not in m["post"]["text"]:
        problems.append(f"{where}: 高亮文字不在帖子原文里")


def cue(k, line, where):
    if isinstance(k, (int, float)):
        return
    lid, w = (line, k) if isinstance(k, str) else k
    if " " in w:
        problems.append(f"{where}: 卡点词「{w}」带空格，对不上")
    elif lid in tok and w not in tok[lid]:
        problems.append(f"{where}: 卡点词「{w}」不在 {lid} 的台词里")


def walk(o, line, where):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == "at" and isinstance(v, (str, list, int, float)):
                cue(v, line, where)
            elif k in ("mergeAt", "rightAt", "fastAt", "from", "to", "footAt") and not isinstance(v, dict):
                cue(v, line, where)
            else:
                walk(v, line, where)
    elif isinstance(o, list):
        for v in o:
            walk(v, line, where)


for s in shots:
    at = s["at"]
    if at not in L:
        problems.append(f"镜头 {at}: 台词里没有这个 id")
        continue
    covered.add(at)
    media(s["m"], at)
    if "kit" in s["m"]:
        walk(s["m"].get("props", {}), at, at)
    for c in s.get("cuts", []):
        cue(c["k"], at, f"{at} 的切点")
        media(c["m"], at)
        if "kit" in c["m"]:
            walk(c["m"].get("props", {}), at, at)

# 没挂镜头的句子会沿用上一个镜头，这本身允许；连续太久才提醒
order = sorted(L, key=lambda k: L[k]["start"])
run, last = 0.0, None
for k in order:
    if k in covered:
        run = L[k]["end"] - L[k]["start"]
    else:
        run += L[k]["end"] - L[k]["start"]
        if run > 15:
            problems.append(f"{k}: 同一镜头已连续约 {run:.0f} 秒，考虑加切点")
for p in problems:
    print("!!", p)
print(f"{len(shots)} 个镜头，{len(L)} 句台词，{len(problems)} 个问题")
sys.exit(1 if problems else 0)
