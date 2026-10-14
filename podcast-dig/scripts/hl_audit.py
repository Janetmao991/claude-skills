#!/usr/bin/env python3
"""hl_audit.py — 审计 transcript 文件的荧光笔质量与结构。退出码 1 = FAIL(必须修)。

用法: python3 hl_audit.py <file.md> [more.md …] [--json]

检查项(对应 SKILL.md 的 highlight 规则):
  密度   highlight 数 / 每千词正文。目标 2–4,>5 WARN,>6 或 <1 FAIL(短稿 <2000 词单独判)。
  长度   单条 >30 词 WARN(应只划到含 payload 的最小子句),<4 词 WARN。
  载荷   无数字、无专有名词、无判断/转折标记的条目 → 疑似"金句但空心",列出供人工复核。
  位置   划在主持人发言里的条目 → 列出(主持人提问几乎不该划)。
  索引   观点索引每条须有 [mm:ss] 前缀;条目数应 == highlight 数或为其 ★ 子集;索引文本须能在正文 highlight 中找到。
  结构   每段须有时间戳;相邻段不得同时间戳;须有 <!-- content-start --> 标记。
"""
import re, sys, json

JUDGE_RE = re.compile(r"\b(i think|i believe|i('d| would) bet|wrong|mistake|never|always|should|shouldn't|will|won't|actually|turns out|the real|the problem|because|the reason|nobody|everyone|no one|doesn't work|does not work|we killed|we stopped|we pivoted|we decided|we chose|we learned|we were wrong|i was wrong|disagree|contrary|instead of|rather than|not .{1,20} but|the only|the biggest|the hardest|underrated|overrated|decision|decided|conscious|chose|choice|bet on|unlock|surprising|surprised|crazy|counterintuitive|turned out|realized|lesson|regret|if i were|would have|killed|shut down|scrapped|laughed at)\b", re.I)
NUM_RE = re.compile(r"\d|\b(million|billion|thousand|percent|half|double|triple|tenx|10x|arr|mrr|nps|churn|retention|margin)\b", re.I)
HOST_RE = re.compile(r"^\s*\[[\d:]+\]\s*\*\*(host|主持人|[^*]{0,40}\(host\))[^*]*:\*\*", re.I)


def proper_nouns(s):
    words = re.findall(r"[A-Za-z][A-Za-z0-9'\-]+", s)
    return [w for i, w in enumerate(words) if w[0].isupper() and i > 0 and w.lower() not in ("i", "i'm", "i've", "i'd", "i'll")]


def audit(path):
    text = open(path, encoding="utf-8").read()
    rep = {"file": path, "warn": [], "fail": [], "info": {}}
    body = text.split("## Transcript", 1)[1] if "## Transcript" in text else text
    idx = text.split("## 观点索引", 1)[1].split("## Transcript", 1)[0] if "## 观点索引" in text else ""
    paras = [p for p in body.split("\n\n") if p.strip() and not p.strip().startswith("<!--")]
    words = len(re.sub(r"==|\*\*", "", body).split())
    hls = [(m.start(), m.group(1)) for m in re.finditer(r"==(.+?)==", body, re.S)]
    rep["info"]["transcript_words"] = words
    rep["info"]["highlights"] = len(hls)
    dens = len(hls) / max(1, words) * 1000
    rep["info"]["density_per_1000w"] = round(dens, 2)

    if words < 1500:
        rep["warn"].append(f"正文仅 {words} 词——这不是完整 transcript(可能只抓到片段/字幕失败),请核对来源")
    if dens > 6 or (dens < 1 and words >= 2000):
        rep["fail"].append(f"密度 {dens:.1f}/千词(目标 2–4):{'荧光笔泛滥' if dens > 6 else '几乎没划,检查是否漏做'}")
    elif dens > 5:
        rep["warn"].append(f"密度 {dens:.1f}/千词偏高,按'只划 payload 最小子句、金句不划'再剪一轮")

    long_ = [(h[:70] + "…") for _, h in hls if len(h.split()) > 30]
    short = [h for _, h in hls if len(h.split()) < 4]
    if long_: rep["warn"].append(f"{len(long_)} 条 >30 词(只划含 payload 的子句):" + " | ".join(long_[:5]))
    if short: rep["warn"].append(f"{len(short)} 条 <4 词:" + " | ".join(short[:5]))

    hollow = []
    for _, h in hls:
        if NUM_RE.search(h) or proper_nouns(h) or JUDGE_RE.search(h): continue
        hollow.append(h[:80])
    rep["info"]["hollow_candidates"] = len(hollow)
    if hollow:
        rep["warn"].append(f"{len(hollow)} 条无数字/专名/判断标记,疑似空心金句,逐条问'换家公司这句还成立吗':" + " | ".join(hollow[:8]))

    in_host = []
    for p in paras:
        if HOST_RE.search(p) and "==" in p:
            in_host.append(re.search(r"==(.+?)==", p, re.S).group(1)[:60])
    if in_host: rep["warn"].append(f"{len(in_host)} 条划在主持人发言里(提问不是信息,除非主持人给出数据/反驳):" + " | ".join(in_host[:5]))

    # 索引
    idx_lines = [l for l in idx.splitlines() if l.strip().startswith("- ")]
    rep["info"]["index_entries"] = len({re.sub(r"\s+", " ", l).strip() for l in idx_lines})
    no_ts = [l for l in idx_lines if not re.match(r"- (★ ?)?\[\d{1,2}:\d{2}(:\d{2})?\]", l.strip())]
    body_has_ts = bool(re.search(r"^\s*\[\d{1,2}:\d{2}", body, re.M))
    if idx_lines and no_ts:
        (rep["fail"] if body_has_ts else rep["warn"]).append(f"观点索引 {len(no_ts)} 条没有 [mm:ss] 时间戳前缀" + ("(用了章节名?)" if body_has_ts else "(官方稿无时间戳,章节名可接受)") + f":{no_ts[0][:60]}")
    if not idx_lines: rep["fail"].append("缺少观点索引")
    hl_texts = [re.sub(r"\s+", " ", h).lower() for _, h in hls]
    drift = 0
    for l in idx_lines:
        m = re.search(r"==(.+?)==", l)
        if not m: continue
        frag = re.sub(r"\s+", " ", m.group(1)).lower().strip("… .")[:40]
        if frag and not any(frag in t for t in hl_texts): drift += 1
    if drift: rep["warn"].append(f"观点索引 {drift} 条在正文 highlight 里找不到对应原文(索引改写了原话?)")
    stars = len({re.sub(r"\s+", " ", l).strip() for l in idx_lines if "★" in l})  # ★ 区与全部区重复列出只算一次
    rep["info"]["star_entries"] = stars
    if idx_lines and stars == 0: rep["warn"].append("观点索引没有 ★ 标记的 top 条目(应标 5–8 条'只读这几条也能抓住本集要害')")
    if stars > 10: rep["warn"].append(f"★ 条目 {stars} 条过多(5–8 条)")

    # 结构
    ts = []
    no_ts_paras = 0
    for p in paras:
        m = re.match(r"\s*\[(\d{1,2}:\d{2}(?::\d{2})?)\]", p)
        if m: ts.append(m.group(1))
        elif not p.strip().startswith("#") and not p.strip().startswith(">"): no_ts_paras += 1
    dup = sum(1 for i in range(1, len(ts)) if ts[i] == ts[i - 1])
    rep["info"]["paragraphs"] = len(paras)
    if no_ts_paras > 2 and ts: rep["warn"].append(f"{no_ts_paras} 段缺时间戳")
    if dup: rep["warn"].append(f"{dup} 对相邻段落共用同一时间戳(播放跟随会失准)")
    if "<!-- content-start -->" not in text: rep["warn"].append("缺 <!-- content-start --> 正文起点标记")
    if "transcript_source:" not in text: rep["warn"].append("frontmatter 缺 transcript_source")
    rep["status"] = "FAIL" if rep["fail"] else ("WARN" if rep["warn"] else "PASS")
    return rep


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv
    reps = [audit(p) for p in args]
    if as_json:
        print(json.dumps(reps, ensure_ascii=False, indent=1))
    else:
        for r in reps:
            i = r["info"]
            print(f"[{r['status']}] {r['file']}\n  词数 {i['transcript_words']} | highlight {i['highlights']} | 密度 {i['density_per_1000w']}/千词 | 索引 {i['index_entries']} 条 (★{i['star_entries']}) | 空心疑似 {i['hollow_candidates']}")
            for f in r["fail"]: print("  ✗", f)
            for w in r["warn"]: print("  ⚠", w)
    sys.exit(1 if any(r["status"] == "FAIL" for r in reps) else 0)


if __name__ == "__main__":
    main()
