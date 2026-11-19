"""One-off: turn the vertical paper scenes into the 16:9 layout.

Titles move to the top-left; everything else goes into #stage, the old 1080×1920 board scaled
into the left column (the right column is kept for the real screens, see compositions/screens.html).
A few elements that sat low on the vertical board are moved to the right column in stage coords.
Run once: python3 tools/to_wide.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCENES = ["hook", "scene", "problem", "map", "steps", "api", "goal"]
S, TX, TY = 0.9333, 16, -193.5  # stage (90,620) lands at (100,385)

TITLE_CSS = {
    "t-en": '.t-en { position: absolute; left: 120px; top: 130px; font-size: 112px; font-weight: 700; line-height: 1; letter-spacing: -0.01em; white-space: nowrap; }',
    "t-zh": '.t-zh { position: absolute; left: 120px; top: 254px; font-size: 52px; font-weight: 700; line-height: 1; z-index: 1; isolation: isolate; white-space: nowrap; }',
    "hl": '.t-zh .hl { position: absolute; left: -10px; right: -10px; top: 24px; height: 32px; background: rgba(255, 212, 59, 0.75); border-radius: 6px; z-index: -1; }',
    "t-sub": '.t-sub { position: absolute; left: 122px; top: 322px; font-family: "Inter", sans-serif; font-size: 28px; color: #5a5a63; white-space: nowrap; }',
}
STAGE_CSS = ("    #stage { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; "
             f"transform: translate({TX}px, {TY}px) scale({S}); }}\n")
# moved to the right column (stage coords: x 1060–1900, y 620–1140)
MOVES = {
    "map": [('id="mp-s1" style="left:96px; top:1320px;', 'id="mp-s1" style="left:1080px; top:700px;'),
            ('id="mp-s2" style="left:96px; top:1390px;', 'id="mp-s2" style="left:1080px; top:780px;')],
    "goal": [('id="gl-nt" style="left:96px; top:1330px;', 'id="gl-nt" style="left:1080px; top:660px;'),
             ('id="gl-pts" style="left:96px; top:1490px;', 'id="gl-pts" style="left:1080px; top:960px;'),
             ('[["#gl-m1", 96, "图片"], ["#gl-m2", 314, "声音"], ["#gl-m3", 512, "商品"], ["#gl-m4", 740, "用户"]].forEach(function (m) {\n        SK.boxed(tl, svg, m[0], m[1], 1380, 190, 76, qc("g5", m[2]));',
              '[["#gl-m1", 1080, 730, "图片"], ["#gl-m2", 1310, 730, "声音"], ["#gl-m3", 1080, 840, "商品"], ["#gl-m4", 1310, 840, "用户"]].forEach(function (m) {\n        document.querySelector(m[0]).style.left = (m[1] + 40) + "px"; document.querySelector(m[0]).style.top = (m[2] + 14) + "px";\n        SK.boxed(tl, svg, m[0], m[1], m[2], 190, 76, qc("g5", m[3]));')],
    "hook": [('#hook-q { position: absolute; left: 820px; top: 300px; font-size: 200px;', '#hook-q { position: absolute; left: 700px; top: 96px; font-size: 170px;')],
}

for name in SCENES:
    p = ROOT / "compositions" / f"{name}.html"
    s = p.read_text()
    if 'id="stage"' in s:
        continue
    for k, css in TITLE_CSS.items():
        pat = r"\.t-zh \.hl \{[^}]*\}" if k == "hl" else r"\." + k + r" \{[^}]*\}"
        s = re.sub(pat, css, s, count=1)
    s = s.replace("#root > svg {", "#stage > svg {")
    s = s.replace("  </style>", STAGE_CSS + "  </style>", 1)
    s = s.replace('data-width="1080" data-height="1920">', 'data-width="1920" data-height="1080">', 1)
    for a, b in MOVES.get(name, []):
        assert a in s, (name, a)
        s = s.replace(a, b)
    # wrap the board (everything in #root except the title lines) in #stage
    m = re.search(r'(  <div id="root"[^\n]*\n)(.*?)(\n  </div>\n  <script>)', s, re.S)
    lines = m.group(2).split("\n")
    keep = [l for l in lines if re.search(r'class="t-(en|zh|sub)"|id="hook-q"', l)]
    board = [l for l in lines if l not in keep]
    body = "\n".join(keep) + '\n    <div id="stage">\n' + "\n".join("  " + l if l.strip() else l for l in board) + "\n    </div>"
    s = s[:m.start(2)] + body + s[m.end(2):]
    p.write_text(s)
    print("wide:", name)
