#!/usr/bin/env python3
"""discover.py — 系统化发现关于某公司/赛道的 podcast episode(三路并扫 + 覆盖报告)。

用法:
  python3 discover.py "Granola" --alias "Chris Pedregal" --alias "Pedregal" \
      [--since 2023-01-01] [--pool <podcast-pool.json>] [--out candidates.json] [--no-rss] [--no-yt]

三条发现通道(互为补充,缺一不可):
  1. iTunes 全库 episode 搜索(entity=podcastEpisode,US + CN 两个 store)——覆盖「不在名单上的节目」
  2. 名单节目 RSS 全文扫描(references/sources.json)——覆盖「iTunes 搜索漏掉的老集 / 中文节目」
  3. YouTube 搜索(yt-dlp ytsearch,无需 key)——覆盖「只在 YouTube 上的访谈、会议演讲」

每个候选带:节目 / 名单层级 / 语言 / 标题 / 日期 / 时长 / 命中方式(title|desc|sponsor) / mp3 / feed / youtube / 已在 pool。
命中方式说明:title=标题命中(强);desc=仅描述命中(需人工看是否只是顺带一提);sponsor=赞助商口播(默认排除)。
结尾打印覆盖报告:扫了哪些通道、多少节目 RSS、哪些失败——写进索引文件让用户知道覆盖面。
不做排序打分——排序交给 SKILL.md 的评分规则(需要判断嘉宾身份与访谈焦点)。
"""
import argparse, json, re, html, sys, time, subprocess, os, urllib.request, urllib.parse
import concurrent.futures as cf
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SOURCES = os.path.join(HERE, "..", "references", "sources.json")
UA = {"User-Agent": "Mozilla/5.0 (podcast-dig)"}
CTX = None  # set in main from --context
DEFAULT_CONTEXT = ["ai", "startup", "founder", "ceo", "cto", "co-founder", "cofounder", "vc", "venture", "product", "software", "saas", "app", "agent", "llm", "model", "series", "raises", "valuation", "yc", "y combinator", "tech", "build", "building", "scale", "growth", "pmf", "arr"]
SPONSOR_RE = re.compile(r"(sponsor|brought to you by|presented by|thanks to our|thank you to|promo ?code|use code|discount|% off|free trial|get started at|sign up at|try .{0,30} for free|visit .{0,40}\.com|/lenny|partner(s|ed) with|is supported by|this episode is)", re.I)


def log(*a):
    print(*a, file=sys.stderr)


def get(url, timeout=30, retries=5):
    for i in range(retries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout).read()
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                time.sleep(8 * (i + 1)); continue
            raise
        except Exception:
            if i == retries - 1: raise
            time.sleep(2)
    raise RuntimeError(f"gave up: {url}")


def norm(s):
    return re.sub(r"[^a-z0-9一-鿿]+", " ", (s or "").lower()).strip()


def context_count(ctx_terms, *fields):
    blob = " ".join(f or "" for f in fields).lower()
    return sum(1 for c in ctx_terms if re.search(r"(?<![a-z])" + re.escape(c) + r"(?![a-z])", blob))


def has_context(ctx_terms, *fields, need=1):
    return context_count(ctx_terms, *fields) >= need


def match_kind(terms, title, desc, ctx_terms=None, extra_blob="", need=1):
    """title | desc | sponsor | weak | None
    terms[0] 是公司名(可能有歧义,如 Granola/Cursor/Notion),其余是创始人全名(强信号)。
    公司名命中标题但标题+描述+频道里没有任何语境词 → weak(默认丢弃,防麦片/乐队)。"""
    t, d = title or "", desc or ""
    ctx_terms = ctx_terms or DEFAULT_CONTEXT
    for term in terms[1:]:
        if re.search(re.escape(term), t, re.I):
            # 创始人全名也可能撞名(Sam Stephenson 牧师),要求至少一个语境词
            return "title" if has_context(ctx_terms, t, d, extra_blob, need=1) else "weak"
    if re.search(re.escape(terms[0]), t, re.I):
        if norm(extra_blob) == norm(terms[0]):  # 公司自己的频道/节目
            return "title"
        if has_context(ctx_terms, t, d, extra_blob, need=need) or any(re.search(re.escape(x), d, re.I) for x in terms[1:]):
            return "title"
        return "weak"
    # 描述命中:先排除赞助段(往前看 600 字,赞助商列表常很长),再要求"不只是顺带一提":
    #   创始人全名出现 / 公司名出现 ≥2 次 / 公司名出现在描述前 300 字(正文摘要区,而非尾部链接堆)
    clean_hits = []
    for term in terms:
        for m in re.finditer(re.escape(term), d, re.I):
            ctx = d[max(0, m.start() - 600): m.end() + 200]
            if SPONSOR_RE.search(ctx):
                continue
            if re.match(r"\s*[:—–-]\s*https?://", d[m.end(): m.end() + 14]):  # "Granola: https://…" 链接堆/推荐清单
                continue
            if m.start() > 0.6 * len(d) and term == terms[0]:  # 描述尾部的提及几乎都是链接/鸣谢
                continue
            clean_hits.append((term, m.start()))
    if not clean_hits:
        return "sponsor" if any(re.search(re.escape(t), d, re.I) for t in terms) else None
    if any(t != terms[0] for t, _ in clean_hits): return "desc"
    if sum(1 for t, _ in clean_hits if t == terms[0]) >= 2: return "desc"
    if any(pos < 300 for _, pos in clean_hits): return "desc"
    return "weak"


# ---------- 通道 1: iTunes episode 搜索 ----------
def itunes_episodes(terms, since, countries=("us", "cn")):
    out, calls = [], 0
    for term in terms:
        for country in countries:
            q = urllib.parse.urlencode({"term": term, "entity": "podcastEpisode", "limit": 200, "country": country})
            try:
                d = json.loads(get("https://itunes.apple.com/search?" + q, timeout=25))
                calls += 1
            except Exception as e:
                log(f"  itunes[{country}] '{term}' failed: {e}"); continue
            for r in d.get("results", []):
                date = (r.get("releaseDate") or "")[:10]
                if since and date and date < since: continue
                desc = html.unescape(re.sub(r"<[^>]+>", " ", r.get("description") or ""))
                kind = match_kind(terms, r.get("trackName"), desc, CTX, r.get("collectionName"), need=2)  # 名单外节目要两个语境词;名单内在合并后由 tier 补救
                if not kind: continue
                out.append({
                    "show": r.get("collectionName"), "collection_id": r.get("collectionId"),
                    "title": r.get("trackName"), "date": date,
                    "duration_min": round((r.get("trackTimeMillis") or 0) / 60000),
                    "match": kind, "desc": desc[:400],
                    "audio_url": r.get("episodeUrl"), "feed_url": r.get("feedUrl"),
                    "apple_url": r.get("trackViewUrl"), "image_url": r.get("artworkUrl600"),
                    "youtube_url": None, "channels": ["itunes"], "lang": "zh" if country == "cn" and re.search(r"[一-鿿]", r.get("collectionName") or "") else "en",
                })
            time.sleep(1.5)  # iTunes 并发/高频会 403/429,必须串行限速
    return out, calls


# ---------- 通道 2: 名单 RSS 扫描 ----------
def scan_feed(show, terms, since):
    url = show.get("feed_url")
    if not url: return show["name"], [], "no feed"
    try:
        data = get(url, timeout=45).decode("utf-8", "ignore")
    except Exception as e:
        return show["name"], [], f"fetch failed: {e}"
    items = re.findall(r"<item>(.*?)</item>", data, re.S)
    found = []
    for it in items:
        def tag(name):
            m = re.search(rf"<{name}[^>]*>(.*?)</{name}>", it, re.S)
            return html.unescape(re.sub(r"<!\[CDATA\[|\]\]>", "", m.group(1))).strip() if m else ""
        title = tag("title")
        desc = re.sub(r"<[^>]+>", " ", tag("description") or tag("content:encoded") or tag("itunes:summary"))
        kind = match_kind(terms, title, desc, CTX, show["name"])
        if not kind: continue
        pub = tag("pubDate")
        date = ""
        for fmt in ("%a, %d %b %Y %H:%M:%S %z", "%a, %d %b %Y %H:%M:%S %Z", "%Y-%m-%dT%H:%M:%S%z"):
            try: date = datetime.strptime(pub.strip(), fmt).strftime("%Y-%m-%d"); break
            except Exception: pass
        if since and date and date < since: continue
        enc = re.search(r'<enclosure[^>]*url="([^"]+)"', it)
        dur = tag("itunes:duration")
        mins = 0
        if dur:
            p = dur.split(":")
            try: mins = round((int(p[0]) * 3600 + int(p[1]) * 60 + int(p[2])) / 60) if len(p) == 3 else (round((int(p[0]) * 60 + int(p[1])) / 60) if len(p) == 2 else round(int(p[0]) / 60))
            except Exception: mins = 0
        link = tag("link")
        found.append({
            "show": show["name"], "collection_id": show.get("apple_id"), "title": title, "date": date,
            "duration_min": mins, "match": kind, "desc": desc[:400],
            "audio_url": enc.group(1) if enc else None, "feed_url": url, "apple_url": None, "image_url": None,
            "source_page": link, "youtube_url": None, "channels": ["rss"],
            "tier": show.get("tier"), "lang": show.get("lang", "en"), "rigor": show.get("rigor"),
            "transcript": show.get("transcript"), "ir_of": show.get("ir_of"),
        })
    return show["name"], found, f"ok ({len(items)} items)"


def rss_scan(sources, terms, since):
    out, report = [], {}
    with cf.ThreadPoolExecutor(6) as ex:
        for name, found, status in ex.map(lambda s: scan_feed(s, terms, since), sources):
            report[name] = status
            out.extend(found)
    return out, report


# ---------- 通道 3: YouTube ----------
def yt_search(terms, n=25):
    out = []
    if not shutil_which("yt-dlp"):
        log("  yt-dlp not found, skipping YouTube"); return out, "yt-dlp missing"
    queries = [f'"{terms[0]}" podcast'] + [f'"{t}" interview' for t in terms[:3]]
    for q in queries:
        try:
            res = subprocess.run(["yt-dlp", f"ytsearch{n}:{q}", "--flat-playlist", "--print",
                                  "%(id)s\t%(title)s\t%(channel)s\t%(duration)s\t%(view_count)s"],
                                 capture_output=True, text=True, timeout=120)
        except Exception as e:
            log(f"  yt '{q}' failed: {e}"); continue
        for ln in res.stdout.splitlines():
            p = ln.split("\t")
            if len(p) < 5: continue
            vid, title, ch, dur, views = p
            try: mins = round(float(dur) / 60)
            except Exception: mins = 0
            if mins and mins < 12: continue  # 短视频/剪辑不收
            kind = match_kind(terms, title, "", CTX, ch, need=2)  # YouTube 无描述,名单外频道要两个语境词
            if not kind: continue
            out.append({"show": ch, "collection_id": None, "title": title, "date": "", "duration_min": mins,
                        "match": kind, "desc": "", "audio_url": None, "feed_url": None, "apple_url": None, "image_url": None,
                        "youtube_url": f"https://www.youtube.com/watch?v={vid}", "views": views, "channels": ["youtube"], "lang": "en"})
    return out, f"{len(queries)} queries"


def shutil_which(x):
    from shutil import which; return which(x)


# ---------- 合并 ----------
def tokens(s):
    return set(w for w in norm(s).split() if len(w) > 2)


def similar(a, b):
    ta, tb = tokens(a), tokens(b)
    if not ta or not tb: return 0
    return len(ta & tb) / min(len(ta), len(tb))


def merge(cands):
    merged = []
    for c in cands:
        hit = None
        for m in merged:
            same_show = norm(m["show"] or "") == norm(c["show"] or "") or (m.get("collection_id") and m.get("collection_id") == c.get("collection_id"))
            if same_show and similar(m["title"], c["title"]) >= 0.7:
                hit = m; break
            if "youtube" in c["channels"] and similar(m["title"], c["title"]) >= 0.75 and abs((m["duration_min"] or 0) - (c["duration_min"] or 0)) <= 6:
                hit = m; break
        if hit:
            for k, v in c.items():
                if k == "channels": hit["channels"] = sorted(set(hit["channels"] + v))
                elif not hit.get(k) and v: hit[k] = v
            if c["match"] == "title": hit["match"] = "title"
        else:
            merged.append(dict(c))
    return merged


def load_pool_keys(path):
    if not path or not os.path.exists(path): return []
    d = json.load(open(path))
    return [(norm(e.get("show")), norm(e.get("episode_title")), e.get("status")) for e in d.get("episodes", [])]


def in_pool(pool, show, title):
    ns, nt = norm(show), norm(title)
    for ps, pt, st in pool:
        if not pt: continue
        same_show = ps == ns or ps in ns or ns in ps
        if same_show and (pt in nt or nt in pt or similar(pt, nt) >= 0.7):
            return st or "listed"
    return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("query")
    ap.add_argument("--alias", action="append", default=[])
    ap.add_argument("--since", default=None)
    ap.add_argument("--sources", default=DEFAULT_SOURCES)
    ap.add_argument("--pool", default=None)
    ap.add_argument("--out", default=None)
    ap.add_argument("--no-rss", action="store_true")
    ap.add_argument("--no-yt", action="store_true")
    ap.add_argument("--no-itunes", action="store_true")
    ap.add_argument("--keep-sponsor", action="store_true")
    ap.add_argument("--keep-weak", action="store_true", help="保留无语境词的公司名命中(公司名无歧义时可开)")
    ap.add_argument("--context", action="append", default=[], help="追加语境词(如公司所在领域: fintech, meeting notes)")
    ap.add_argument("--yt-dates", action="store_true", default=True)
    a = ap.parse_args()
    terms = [a.query] + [x for x in a.alias if x]
    global CTX
    CTX = DEFAULT_CONTEXT + [c.lower() for c in a.context]
    for x in terms[1:]:
        if len(x.split()) < 2:
            log(f"  警告: 别名 '{x}' 只有一个词,会带来大量噪音——请用创始人全名")
    sources = json.load(open(a.sources)) if os.path.exists(a.sources) else []
    by_name = {norm(s["name"]): s for s in sources}
    for s in sources:
        for al in s.get("aliases", []): by_name[norm(al)] = s

    cands, coverage = [], {"terms": terms, "since": a.since}
    if not a.no_itunes:
        log("[1/3] iTunes episode search …"); r, n = itunes_episodes(terms, a.since); cands += r; coverage["itunes_calls"] = n; coverage["itunes_hits"] = len(r)
    if not a.no_rss:
        log(f"[2/3] RSS scan of {len(sources)} roster shows …"); r, rep = rss_scan(sources, terms, a.since); cands += r
        coverage["rss_scanned"] = sum(1 for v in rep.values() if v.startswith("ok")); coverage["rss_failed"] = {k: v for k, v in rep.items() if not v.startswith("ok")}; coverage["rss_hits"] = len(r)
    if not a.no_yt:
        log("[3/3] YouTube search …"); r, st = yt_search(terms); cands += r; coverage["youtube"] = st; coverage["youtube_hits"] = len(r)

    merged = merge(cands)
    # 用名单信息补全 iTunes/YouTube 来的条目
    for m in merged:
        s = by_name.get(norm(m["show"] or ""))
        if s:
            for k in ("tier", "lang", "rigor", "transcript", "ir_of"):
                if not m.get(k): m[k] = s.get(k)
        m.setdefault("tier", None)
    dropped_weak = sum(1 for m in merged if m["match"] == "weak")
    if not a.keep_sponsor:
        merged = [m for m in merged if m["match"] != "sponsor"]
    if not a.keep_weak:
        merged = [m for m in merged if m["match"] != "weak"]
    coverage["dropped_weak_no_context"] = dropped_weak
    # YouTube 上传日期补全(flat 搜索拿不到日期;只对保留下来的条目做)
    if a.yt_dates and not a.no_yt:
        for m in merged:
            if m.get("youtube_url") and not m.get("date"):
                try:
                    r = subprocess.run(["yt-dlp", "--skip-download", "--print", "%(upload_date)s", m["youtube_url"]], capture_output=True, text=True, timeout=40)
                    d = r.stdout.strip()
                    if re.fullmatch(r"\d{8}", d): m["date"] = f"{d[:4]}-{d[4:6]}-{d[6:]}"
                except Exception: pass
        if a.since:
            merged = [m for m in merged if not (m.get("date") and m["date"] < a.since)]
    pool = load_pool_keys(a.pool)
    for m in merged:
        m["in_pool"] = in_pool(pool, m["show"], m["title"])
    order = {"title": 0, "desc": 1, "sponsor": 2, "weak": 3}
    tier_order = {"S": 0, "A": 1, "B": 2, "C": 3, None: 4}
    merged = sorted(merged, key=lambda m: (order[m["match"]], tier_order.get(m.get("tier"), 4), -(int((m["date"] or "0").replace("-", "") or 0))))

    if a.out:
        json.dump({"coverage": coverage, "candidates": merged}, open(a.out, "w"), ensure_ascii=False, indent=1)
    print(f"| # | 节目 [层级/语] | Episode | 日期 | 分钟 | 命中 | 通道 | mp3 | YT | pool |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for i, m in enumerate(merged, 1):
        tier = f"{m.get('tier') or '–'}/{m.get('lang','en')}"
        print(f"| {i} | {m['show']} [{tier}] | {m['title'][:90]} | {m['date'] or '?'} | {m['duration_min'] or '?'} | {m['match']} | {'+'.join(m['channels'])} | {'✓' if m.get('audio_url') else '–'} | {'✓' if m.get('youtube_url') else '–'} | {('已抓' if m['in_pool']=='fetched' else '已列') if m['in_pool'] else ''} |")
    print()
    print(f"覆盖报告: 检索词={terms}; iTunes 调用 {coverage.get('itunes_calls','跳过')} 次命中 {coverage.get('itunes_hits','–')}; "
          f"RSS 扫描 {coverage.get('rss_scanned','跳过')}/{len(sources)} 个名单节目命中 {coverage.get('rss_hits','–')}"
          f"{' 失败: ' + ', '.join(coverage['rss_failed']) if coverage.get('rss_failed') else ''}; "
          f"YouTube {coverage.get('youtube','跳过')} 命中 {coverage.get('youtube_hits','–')}; 无语境词丢弃 {dropped_weak}; 合并后 {len(merged)} 条候选。")


if __name__ == "__main__":
    main()
