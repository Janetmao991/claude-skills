#!/usr/bin/env python3
"""roster.py — 维护节目名单 (references/sources.json + sources.md)。

  python3 roster.py build                       # 从 roster_seed.json(人工判断字段)+ 已有 sources.json(ID/feed)重建两份文件;缺 ID 的节目去 iTunes 串行查
  python3 roster.py add "<节目名>" --tier A --lang en --rigor 1.5 --transcript youtube [--ir-of Redpoint] [--note …] [--lookup "<检索词>"]
  python3 roster.py verify                      # 逐个 feed 抓一次,报失败的

iTunes 查询串行 + 1.5s 间隔 + 403/429 退避,别并发。
"""
import json, os, sys, time, argparse, urllib.request, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
REF = os.path.join(HERE, "..", "references")
SEED, SRC, MD = (os.path.join(REF, f) for f in ("roster_seed.json", "sources.json", "sources.md"))
UA = {"User-Agent": "Mozilla/5.0 (podcast-dig)"}


def itunes_podcast(term):
    u = "https://itunes.apple.com/search?" + urllib.parse.urlencode({"term": term, "entity": "podcast", "limit": 3})
    for i in range(2):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=25))
            r = d.get("results") or []
            return [{"apple_name": x["collectionName"], "apple_id": x["collectionId"], "feed_url": x.get("feedUrl"), "episodes": x.get("trackCount")} for x in r]
        except urllib.error.HTTPError as e:
            if e.code in (403, 429):
                if i == 0: time.sleep(15); continue
                raise SystemExit("iTunes 正在限流(403/429)——等 30 分钟再跑 build;已查到的不会丢")
            raise
        except Exception:
            time.sleep(3)
    return []


def load(p, default):
    return json.load(open(p)) if os.path.exists(p) else default


def build(lookup_missing=True):
    seed = load(SEED, {"shows": []})["shows"]
    old = {s["name"]: s for s in load(SRC, [])}
    out = []
    for s in seed:
        rec = dict(old.get(s["name"], {}))
        rec.update({k: v for k, v in s.items() if k != "lookup"})
        if lookup_missing and not rec.get("feed_url"):
            res = itunes_podcast(s.get("lookup") or s["name"])
            time.sleep(1.5)
            if res:
                rec.update(res[0]); print(f"  {s['name']:40s} -> {res[0]['apple_name'][:50]} ({res[0]['episodes']} eps)", file=sys.stderr)
            else:
                print(f"  {s['name']:40s} -> NOT FOUND (加 --lookup 换检索词,或手填 feed_url)", file=sys.stderr)
        out.append(rec)
    json.dump(out, open(SRC, "w"), ensure_ascii=False, indent=1)
    write_md(out)
    print(f"sources.json: {len(out)} shows, {sum(1 for r in out if r.get('feed_url'))} with feed", file=sys.stderr)


def write_md(rows):
    tiers = {"S": "S — 每次必扫,创始人长谈为主", "A": "A — 高质量但覆盖窄 / IR 渠道", "B": "B — 补充", "C": "C — 新闻/泛谈,只看标题命中"}
    L = ["# Podcast 名单(discover.py 的 RSS 扫描保底集合)", "",
         "维护:改 `roster_seed.json`(判断字段)→ `python3 scripts/roster.py build`。本文件自动生成,勿手改。",
         "",
         "字段:**rigor** 主持人追问力 0.5–2;**transcript** 全文来源;**IR** 节目所属机构(其 portfolio 上节目时 ir_flag=true)。", ""]
    for t in "SABC":
        L += [f"## {tiers[t]}", "", "| 节目 | 语 | rigor | transcript | IR | 备注 | Apple ID | 集数 |", "|---|---|---|---|---|---|---|---|"]
        for r in rows:
            if r.get("tier") != t: continue
            L.append(f"| {r['name']} | {r.get('lang','en')} | {r.get('rigor','')} | {r.get('transcript','')} | {r.get('ir_of') or ''} | {r.get('note','')} | {r.get('apple_id') or '—'} | {r.get('episodes') or '—'} |")
        L.append("")
    missing = [r["name"] for r in rows if not r.get("feed_url")]
    if missing:
        L += ["## feed 待补(iTunes 查询被限流时留下的;`python3 scripts/roster.py build` 会补查,中文节目可手填 小宇宙/Apple 的 feed_url 到 sources.json)", "", "- " + "、".join(missing), ""]
    L += ["## 名单外的兜底", "", "- iTunes 全库 episode 搜索(US + CN store)——discover.py 通道 1", "- YouTube 搜索(yt-dlp)——通道 3", "- 公司官网 podcast 出镜页 / 创始人 X 置顶 / 会议演讲 / 小宇宙手搜(中文节目 iTunes 覆盖不稳)——WebSearch 补充", ""]
    open(MD, "w").write("\n".join(L))


def add(a):
    seed = load(SEED, {"shows": []})
    if any(s["name"] == a.name for s in seed["shows"]):
        sys.exit("already in roster")
    rec = {"name": a.name, "lookup": a.lookup or a.name, "tier": a.tier, "lang": a.lang, "rigor": a.rigor, "transcript": a.transcript, "ir_of": a.ir_of, "note": a.note or ""}
    seed["shows"].append(rec)
    json.dump(seed, open(SEED, "w"), ensure_ascii=False, indent=1)
    build()


def verify():
    rows = load(SRC, [])
    bad = []
    for r in rows:
        u = r.get("feed_url")
        if not u: bad.append((r["name"], "no feed")); continue
        try:
            urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30).read(2000)
        except Exception as e:
            bad.append((r["name"], str(e)[:60]))
    for n, e in bad: print(f"  ✗ {n}: {e}")
    print(f"{len(rows) - len(bad)}/{len(rows)} feeds ok")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(); sub = ap.add_subparsers(dest="cmd")
    sub.add_parser("build").add_argument("--no-lookup", action="store_true")
    p = sub.add_parser("add"); p.add_argument("name"); p.add_argument("--tier", required=True, choices="SABC"); p.add_argument("--lang", default="en"); p.add_argument("--rigor", type=float, default=1); p.add_argument("--transcript", default="youtube"); p.add_argument("--ir-of", default=None); p.add_argument("--note", default=""); p.add_argument("--lookup", default=None)
    sub.add_parser("verify")
    a = ap.parse_args()
    {"build": lambda: build(not getattr(a, "no_lookup", False)), "add": lambda: add(a), "verify": verify}[a.cmd or "build"]()
