"""Reskin a term-video project with one of the saved boards.
usage: python3 apply_board.py <project-dir> <board>   (whiteboard | chalk | notebook | kraft | blueprint)

The template is written in whiteboard colours and the Hannotate SC font. This swaps
every whiteboard colour token for the board's (compositions, captions, head.css,
sketch.js, index template), swaps the font family and file, replaces the paper
texture, and makes sure the board's font file is in assets/fonts/.
Run it on a fresh project (from new_term.py) or one still on whiteboard."""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
BOARDS = os.path.join(HERE, "..", "boards", "boards.js")


def boards():
    s = open(BOARDS, encoding="utf-8").read()
    return json.loads(s[s.index("{"): s.rindex("}") + 1])


SYSTEM_FONTS = "/System/Library/AssetsV2"


def ensure_font(proj, b):
    out = os.path.join(proj, "assets", "fonts", b["fontFile"])
    if os.path.exists(out):
        return
    os.makedirs(os.path.dirname(out), exist_ok=True)
    kind, *rest = b["fontSource"].split(":")
    if kind == "system":
        ttc, family, style = rest
        found = subprocess.run(["find", SYSTEM_FONTS, "-name", ttc], capture_output=True, text=True).stdout.split()
        if not found:
            sys.exit(f"system font {ttc} not found; open Font Book and download '{family}' first")
        from fontTools.ttLib import TTCollection
        for f in TTCollection(found[0]).fonts:
            if f["name"].getDebugName(1) == family and f["name"].getDebugName(2) == style:
                f.flavor = "woff2"; f.save(out); print("font:", out); return
        sys.exit(f"{family} {style} not inside {ttc}")
    # google: fetch the css2 file, then the woff2 files it lists (one per unicode range), and merge
    family = rest[0]; weight = rest[1] if len(rest) > 1 else "400"
    sys.exit(f"Google font '{family}' ({weight}) is not in assets/fonts yet. Ask Janet before downloading, then:\n"
             f"  python3 {os.path.join(HERE, 'fetch_google_font.py')} '{family}' {weight} {out}")


def main():
    proj, name = sys.argv[1], sys.argv[2]
    B = boards(); w, b = B["whiteboard"], B[name]
    ensure_font(proj, b)
    pairs = [(w[k], b[k]) for k in ("ground", "ink", "muted", "grey", "line", "a1", "a2", "yellow", "hl", "dots")]
    files = [os.path.join(proj, "tools", f) for f in ("head.css", "index.template.html")]
    files += [os.path.join(proj, "assets", "sketch.js")]
    files += [os.path.join(proj, "compositions", f) for f in os.listdir(os.path.join(proj, "compositions")) if f.endswith(".html")]
    for p in files:
        if not os.path.isfile(p):
            continue
        s = orig = open(p, encoding="utf-8").read()
        for a, c in pairs:
            s = re.sub(re.escape(a), c, s, flags=re.I)
        s = s.replace('"Hannotate SC"', '"%s"' % b["font"]).replace("hannotate-sc-bold.woff2", b["fontFile"])
        if p.endswith("index.template.html"):
            s = re.sub(r"background-image:[^;]+;\s*background-size:[^;]+;\s*background-position:[^;]+;",
                       "background: %s, %s;" % (b["texture"], b["ground"]), s)
        if p.endswith("sketch.js"):
            s = re.sub(r"(roughness:\s*)[\d.]+", lambda m: m.group(1) + str(b["rough"]), s, count=1)
        if s != orig:
            open(p, "w", encoding="utf-8").write(s); print("reskinned", os.path.relpath(p, proj))
    json.dump({"board": name}, open(os.path.join(proj, "board.json"), "w"))
    print("board:", b["name"], "- rebuild index (tools/build_index.py) and snapshot before rendering")


main()
