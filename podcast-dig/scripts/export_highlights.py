#!/usr/bin/env python3
"""export_highlights.py — 把一个公司 folder 里所有 transcript 的 highlight 导出为机器可读 JSON(给 startup-deepdive 等下游用)并生成 ★ 汇总 markdown。

用法:
  python3 export_highlights.py "<vault>/Podcast Research/<Company>"            # 写 _<Company> highlights.json,stdout 打印 ★ 汇总 markdown
  python3 export_highlights.py "<folder>" --all-md                                # stdout 改为打印全部 highlight(不只 ★)

  python3 export_highlights.py "<folder>" --positioning-md                        # stdout 改为按时间打印 [定位] 条目(定位时间线素材)

JSON 契约(下游只依赖这些字段):
  episodes[]: file, show, guest, date, rank, score_post, density, youtube, audio, ir_flag, transcript_source, read_depth
  highlights[]: quote, star, type, ts, sec, speaker, question, paragraph, next, show, guest, date, file, link
question = 引语之前最近一段"别人说的话"(通常是主持人的提问)——下游必须知道这句话在回答什么;
paragraph = 引语所在整段(限定语、迟疑都在里面);next = 紧随其后的一段。
link = youtube&t=<sec>(有 YouTube 时),否则 null。speaker 取该段落的 **Name:** 标签。
"""
import sys, os, re, json, glob
from datetime import date

TS_RE = re.compile(r"\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]")
IDX_RE = re.compile(r"^- (★ ?)?\[([^\]]+)\]\s*(?:\[([^\]]+)\])?\s*==(.+?)==", re.M)


def fm(text):
    m = re.match(r"---\n(.*?)\n---", text, re.S)
    out = {}
    if not m: return out
    for ln in m.group(1).splitlines():
        if ":" in ln:
            k, v = ln.split(":", 1); v = v.split("#")[0].strip().strip('"')
            out[k.strip()] = None if v in ("null", "") else v
    return out


def to_sec(ts):
    m = TS_RE.match("[" + ts + "]")
    if not m: return None
    h, mm, ss = m.groups()
    return (int(h) * 3600 + int(mm) * 60 + int(ss)) if ss else (int(h) * 60 + int(mm))


def _clean(p):
    p = re.sub(r"==|<!--.*?-->", "", p)
    p = re.sub(r"\*\*[^*]+?:\*\*|\[\d{1,2}:\d{2}(?::\d{2})?\]", "", p)  # 去掉说话人标签与时间戳
    return re.sub(r"\s+", " ", p).strip()


def _spk(p):
    m = re.search(r"\*\*([^*]+?):\*\*", p)
    return m.group(1).strip() if m else None


def context_of(body, quote):
    """返回 (speaker, question, paragraph, next)。
    question = 往前找到的最近一段"别人说的话"(通常是主持人的提问),让下游知道这句话在回答什么;
    paragraph = 引语所在整段(含引语前后的限定语/迟疑);next = 紧随其后的一段。"""
    frag = re.sub(r"\s+", " ", quote).strip("… .")[:40].lower()
    paras = [p for p in body.split("\n\n") if p.strip() and not p.strip().startswith("<!--")]
    for i, p in enumerate(paras):
        if frag in re.sub(r"\s+", " ", p.replace("==", "")).lower():
            sp = _spk(p)
            q = None
            for j in range(i - 1, max(-1, i - 12), -1):
                sj = _spk(paras[j])
                if sj and sp and sj != sp:
                    # 把同一提问者连续的几段拼起来(提问常被切成两三段)
                    k = j; chunk = [paras[j]]
                    while k - 1 >= 0 and _spk(paras[k - 1]) == sj and len(chunk) < 5:
                        k -= 1; chunk.insert(0, paras[k])
                    q = " ".join(_clean(c) for c in chunk)
                    if len(q) > 900:  # 长提问:问题本身通常在开头或结尾,两头都留
                        q = q[:450] + " […] " + q[-400:]
                    break
            prev = _clean(paras[i - 1])[-400:] if i > 0 and _spk(paras[i - 1]) == sp else None
            nxt = _clean(paras[i + 1])[:400] if i + 1 < len(paras) else None
            return sp, q, ((prev + " ⏎ ") if prev else "") + _clean(p), nxt
    return None, None, None, None


def speaker_of(body, quote):
    return context_of(body, quote)[0]


def main():
    folder = sys.argv[1].rstrip("/")
    all_md = "--all-md" in sys.argv
    pos_md = "--positioning-md" in sys.argv
    company = os.path.basename(folder).replace("赛道 - ", "")
    episodes, highlights = [], []
    for f in sorted(glob.glob(os.path.join(folder, "*.md"))):
        name = os.path.basename(f)
        if name.startswith("_"): continue
        t = open(f, encoding="utf-8").read()
        meta = fm(t)
        body = t.split("## Transcript", 1)[1] if "## Transcript" in t else ""
        idx = t.split("## 观点索引", 1)[1].split("## Transcript", 1)[0] if "## 观点索引" in t else ""
        yt = meta.get("youtube")
        # 时效硬规则(2026-10-03):frontmatter archived: true,或发布日早于今天 24 个月且未显式 archived: false → 归档
        archived = str(meta.get("archived", "")).split("#")[0].strip().lower() == "true"
        if not archived and str(meta.get("archived", "")).split("#")[0].strip().lower() != "false":
            try:
                d = date.fromisoformat(str(meta.get("date"))[:10])
                today = date.today()
                archived = (today.year - d.year) * 12 + (today.month - d.month) - (today.day < d.day) >= 24
            except ValueError:
                pass
        seen = set(); n_star = 0
        for star, ts, typ, quote in IDX_RE.findall(idx):
            key = re.sub(r"\s+", " ", quote).lower()
            if key in seen: continue
            seen.add(key)
            sec = to_sec(ts)
            is_star = bool(star)
            n_star += is_star
            sp, q, para, nxt = context_of(body, quote)
            highlights.append({"quote": quote.strip(), "star": is_star, "type": typ or None, "ts": ts, "sec": sec,
                               "speaker": sp, "question": q, "paragraph": para, "next": nxt,
                               "show": meta.get("show"), "guest": meta.get("guest"),
                               "date": meta.get("date"), "file": name, "archived": archived,
                               "link": f"{yt}&t={sec}" if (yt and sec is not None) else (yt or None)})
        episodes.append({"file": name, "show": meta.get("show"), "guest": meta.get("guest"), "date": meta.get("date"),
                         "rank": meta.get("rank"), "score_post": meta.get("score_post"), "density": meta.get("density"),
                         "youtube": yt, "audio": meta.get("audio"), "ir_flag": meta.get("ir_flag") == "true",
                         "transcript_source": meta.get("transcript_source"), "read_depth": meta.get("read_depth"),
                         "archived": archived, "highlights": len(seen), "stars": n_star})
    out = {"company": company, "generated": date.today().isoformat(), "folder": folder, "episodes": episodes, "highlights": highlights}
    jp = os.path.join(folder, f"_{company} highlights.json")
    json.dump(out, open(jp, "w"), ensure_ascii=False, indent=1)
    print(f"wrote {jp}: {len(episodes)} episodes, {len(highlights)} highlights, {sum(1 for h in highlights if h['star'])} ★", file=sys.stderr)
    n_arch = sum(1 for e in episodes if e["archived"])
    if n_arch:
        print(f"archived (>24 months, excluded from ★ summary; pass --include-archived to show): "
              f"{', '.join(e['file'] for e in episodes if e['archived'])}", file=sys.stderr)
    keep_arch = "--include-archived" in sys.argv
    # --positioning-md:只出 [定位] 条目(定位时间线素材)。**定位时间线豁免 24 个月归档规则**(用户 2026-10-04):
    # 归档是因为旧集里的"事实"已过时;时间线看的是"当时怎么说",旧自述正是弧线的起点。归档集的条目会带 (归档) 标记。
    rows = [h for h in highlights if (h["type"] == "定位" if pos_md else ((h["star"] or all_md) and (keep_arch or not h["archived"])))]
    rows.sort(key=lambda h: ((h["date"] or "0000"), h["sec"] if h["sec"] is not None else 0))
    for h in rows:
        who = h["speaker"] or (h["guest"] or "").split("(")[0].strip()
        src = f"{h['show']} · {h['date']}" + (f" · [{h['ts']}]({h['link']})" if h["link"] else f" · {h['ts']}")
        tag = f"[{h['type']}] " if h["type"] else ""
        arch = "(归档,仅用于时间线)" if h.get("archived") else ""
        print(f"- {'★ ' if h['star'] else ''}{tag}=={h['quote']}== — {who},{src}{arch},[[{h['file'][:-3]}]]")


if __name__ == "__main__":
    main()
