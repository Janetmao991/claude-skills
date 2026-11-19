"""shotlist_lint.py —— 查 SHOTLIST.md（镜头表）。写场景代码之前跑，红灯没清不开工。

用法：
  python3 <skill>/scripts/shotlist_lint.py <项目>/SHOTLIST.md [--project <项目>]

--project：屏上字里的数字要在 SCRIPT.md 或 assets/real-data.js 里找得到（不要编数字）。
写法见 references/shotlist.md。思路借自 huashu-art-motion 的 storyboard_lint，规则换成 Janet 的。
退出码：有红灯 1，否则 0。
"""
from __future__ import annotations

import argparse
import os
import re
import sys

BOARDS = {"whiteboard", "chalk", "notebook", "kraft", "blueprint", "白板", "黑板", "方格本", "牛皮纸", "蓝图"}
LAYOUT_WORDS = ["标题", "要点", "文字", "列表", "字幕", "卡片", "背景", "画面", "图标", "金句", "空镜", "纯色", "黑场"]
WEAK_VERBS = ["出现", "显示", "展示", "淡入", "逐条", "呈现"]
CAMERA = {"停", "轻推", "推", "拉回", "转右栏", "切"}
BRAND = {"#e5466e", "#2e2e33", "#FAF4E8", "#fffdf7", "#5f594d"}


def hue_is_blue(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    mx, mn = max(r, g, b), min(r, g, b)
    if mx == mn or (mx - mn) / mx < 0.3:
        return False
    h = (60 * ((g - b) / (mx - mn)) % 360 if mx == r else 60 * ((b - r) / (mx - mn)) + 120 if mx == g
         else 60 * ((r - g) / (mx - mn)) + 240)
    return 190 <= h <= 300


def secs(s):
    s = s.strip()
    if ":" in s:
        m, x = s.split(":")
        return int(m) * 60 + float(x)
    return float(s)


def parse(path):
    head, rows, cols = {}, [], None
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        m = re.match(r"^\s*(画板|强调色|角色)\s*[:：]\s*(.*)$", line)
        if m:
            head[m.group(1)] = m.group(2).strip()
            continue
        if line.strip().startswith("|"):
            cells = [c.strip() for c in line.strip().strip("|").split("|")]
            if all(re.fullmatch(r":?-+:?", c) for c in cells if c):
                continue
            if cols is None:
                cols = cells
                continue
            rows.append(dict(zip(cols, cells + [""] * (len(cols) - len(cells)))))
    return head, cols or [], rows


def nums(s):
    return [n.replace(",", "") for n in re.findall(r"\d[\d,]*\.?\d*", s)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("shotlist")
    ap.add_argument("--project")
    a = ap.parse_args()
    head, cols, rows = parse(a.shotlist)
    out, red = [], False

    def say(light, where, msg):
        nonlocal red
        red |= light == "红"
        out.append(f"[{light}] {where}：{msg}")

    # 表前三行
    b = head.get("画板", "")
    if not b:
        say("红", "画板", "没写。写 whiteboard / chalk / notebook / kraft / blueprint 之一；和上一期不同")
    elif not any(k in b for k in BOARDS):
        say("黄", "画板", f"「{b}」不是现有 5 套之一；新画板要先出预览给 Janet 看")
    acc = head.get("强调色", "")
    if not acc:
        say("红", "强调色", "没写。默认：粉 #E5466E + 黄荧光")
    for hx in re.findall(r"#[0-9a-fA-F]{6}", acc):
        if hue_is_blue(hx):
            say("红", "强调色", f"{hx} 是蓝色，蓝色已退役")
        elif hx.lower() not in BRAND:
            say("黄", "强调色", f"{hx} 不在品牌色里；全片最多两种强调色（粉 + 黄荧光）")
    role = head.get("角色", "")
    if not role:
        say("红", "角色", "没写。默认「无」")
    elif re.search(r"吉祥物|机器人|小人|角色|mascot", role) and not re.search(r"^无", role):
        say("红", "角色", f"「{role}」：这个系列不要角色 / 吉祥物")

    need = ["时间段", "画面里的物", "它在做什么", "镜头", "屏上字"]
    miss = [c for c in need if c not in cols]
    if miss:
        say("红", "表头", f"缺列：{'、'.join(miss)}（见 references/shotlist.md）")
        print("\n".join(out))
        sys.exit(1)

    source = ""
    if a.project:
        for f in ("SCRIPT.md", "assets/real-data.js"):
            p = os.path.join(a.project, f)
            if os.path.exists(p):
                source += open(p, encoding="utf-8").read().replace(",", "")

    total, texty, pushes, run = 0.0, 0, 0, 0
    prev = None
    for i, r in enumerate(rows, 1):
        where = f"第 {i} 行 {r['时间段']}"
        try:
            t0, t1 = (secs(x) for x in re.split(r"[–—-]", r["时间段"]))
            d = t1 - t0
        except ValueError:
            say("红", where, "时间段写成 0–5 或 1:20–1:26")
            continue
        total = max(total, t1)
        thing, act, cam, txt, right = r["画面里的物"], r["它在做什么"], r["镜头"], r["屏上字"], r.get("右栏", "")
        if d > 12:
            say("红", where, f"{d:g} 秒，太长。拆开：每 3–5 秒画面要有新东西")
        elif d > 8:
            say("黄", where, f"{d:g} 秒。这一行里要有第二个动作，不然拆开")
        if not thing:
            say("红", where, "画面里的物是空的。写一个能指着说「就是它」的东西")
        elif any(w in thing for w in LAYOUT_WORDS) and len(thing) <= 6:
            say("红" if i == 1 else "黄", where, f"「{thing}」是版面词，不是物。换成具体的东西（一页文档、一个坐标点、顾客那句话）")
        if not act:
            say("红", where, "它在做什么是空的")
        elif any(w in act for w in WEAK_VERBS) and len(act) <= 8:
            say("黄", where, f"「{act}」不是动作。写它自己在干什么：被画出来、裂开、滑进去、被圈住")
        if cam not in CAMERA:
            say("黄", where, f"镜头「{cam}」：写 停 / 轻推 / 拉回 / 转右栏 / 切")
        n = len(re.sub(r"\s", "", txt))
        if n > 20:
            say("红", where, f"屏上字 {n} 个，太多；口播交给字幕")
        is_screen = "屏幕" in right
        if is_screen and not re.search(r"\d", txt):
            say("黄", where, "纸上屏幕的手写结论要带一个真数字（「按字搜 0 条结果」）")
        if a.project:
            for x in nums(txt):
                if x not in source:
                    say("红", where, f"屏上的数字 {x} 在 SCRIPT.md / real-data.js 里找不到。不要编数字")
        if n > 12 or re.search(r"金句|标题|大字", thing):
            texty += 1
            if i == 1:
                say("红", where, "第一镜不能是标题或大字：开头是一个真实场景里的东西在动")
        if cam in ("轻推", "推"):
            pushes += 1
            run += 1
            if run == 3:
                say("黄", where, "连着三次往里推，中间没拉回。有推就要有拉")
        elif cam in ("拉回", "停", "切"):
            run = 0
        if prev and prev[0] == thing and prev[1] == cam:
            say("黄", where, "和上一行同一个物、同一个镜头，构图没变；换个景别或换个物")
        prev = (thing, cam)

    if rows:
        share = texty / len(rows)
        if share > 0.3:
            say("红", "整表", f"文字主导的行占 {share:.0%}（>30%）。把字换成画出来的东西")
        pm = pushes / max(total / 60, 1e-6)
        if pm > 6:
            say("黄", "整表", f"推镜 {pushes} 次，{pm:.1f} 次/分钟（>6）。观众在读字时镜头停住；只在换想法时推")
    good = [l for l in out if l.startswith("[红]") or l.startswith("[黄]")]
    print("\n".join(good) if good else "没有问题。")
    print(f"\n整表：{len(rows)} 行，{total:g} 秒。" + ("红灯：先改镜头表，红灯清掉再写场景。" if red else "可以开工。"))
    print("机器查不了、自己对的：全片是不是一个例子贯穿；纸上屏幕是不是一个镜头只证明一件事；画板是不是和上一期不同。")
    sys.exit(1 if red else 0)


if __name__ == "__main__":
    main()
