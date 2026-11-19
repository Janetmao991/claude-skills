# 检查场景代码里每个 cue(场景, "词") 都能在那一章的旁白里找到。改完台词或重配音后跑一遍。
import json, re, glob, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "remotion"))
t = json.load(open("src/data/timeline.json", encoding="utf-8"))
clean = lambda w: re.sub(r"[^\w$%]", "", w.lower()).replace("_", "")
words = {s["id"]: [[clean(w["w"]) for w in g["words"]] for g in s["segments"] if g["type"] == "vo"] for s in t["scenes"]}


def found(segs, phrase):
    target = clean(re.sub(r"\s+", "", phrase))
    for ws in segs:
        for i in range(len(ws)):
            if not ws[i]:
                continue
            acc = ""
            for w in ws[i:]:
                acc += w
                if not target.startswith(acc):
                    break
                if acc == target:
                    return True
    return False


bad = 0
for f in glob.glob("src/scenes/*.tsx"):
    src = open(f, encoding="utf-8").read()
    consts = dict(re.findall(r'const (\w+) = "(\w+)";', src))
    for c, phrase in re.findall(r'cue\((\w+), "([^"]+)"', src):
        sc = consts.get(c)
        if not found(words.get(sc, []), phrase):
            bad += 1; print(f"找不到 {os.path.basename(f)} {sc}: {phrase}")
print("找不到的卡点：", bad)
