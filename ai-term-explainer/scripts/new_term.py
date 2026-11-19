"""Scaffold a new AI-term video project from the skill template.
usage: python3 new_term.py <slug> <episode> [zh|en] [board]
  e.g. python3 new_term.py rag 2 zh chalk   ->  ~/AI-Terms/ai-rag-ep2/
       python3 new_term.py rag 2 en chalk   ->  ~/AI-Terms/ai-rag-ep2-en/
Copies templates/video, wires the zh or en voice/captions, copies the default font,
then applies the board. Write SCRIPT.md and the scene compositions next."""
import datetime, json, os, shutil, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
TPL = os.path.join(HERE, "..", "templates", "video")
slug, ep = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else "zh"
board = sys.argv[4] if len(sys.argv) > 4 else "whiteboard"
name = "ai-%s-ep%s%s" % (slug, ep, "-en" if lang == "en" else "")
dst = os.path.expanduser("~/AI-Terms/" + name)
if os.path.exists(dst):
    sys.exit(dst + " already exists")
shutil.copytree(TPL, dst)
t = os.path.join(dst, "tools"); c = os.path.join(dst, "compositions")
if lang == "en":
    shutil.move(os.path.join(t, "build_vo_en.py"), os.path.join(t, "build_vo.py"))
    shutil.move(os.path.join(c, "captions-en.html"), os.path.join(c, "captions.html"))
    os.remove(os.path.join(dst, "assets", "vo", "ref-r5.wav"))
else:
    os.remove(os.path.join(t, "build_vo_en.py")); os.remove(os.path.join(c, "captions-en.html"))
for f in ("SCRIPT.example.md", "SCRIPT.example-en.md"):
    if (lang == "en") != f.endswith("-en.md"):
        os.remove(os.path.join(dst, f))
json.dump({"id": name, "name": name, "createdAt": datetime.datetime.utcnow().isoformat() + "Z"},
          open(os.path.join(dst, "meta.json"), "w"), indent=2)
# the default font: reuse an existing copy, else extract it from macOS
fonts = os.path.join(dst, "assets", "fonts"); os.makedirs(fonts, exist_ok=True)
have = os.path.expanduser("~/Adal/ai-embedding-ep1-en-full/assets/fonts/hannotate-sc-bold.woff2")
if os.path.exists(have):
    shutil.copy(have, fonts)
subprocess.run([sys.executable, os.path.join(HERE, "apply_board.py"), dst, board], check=True)
print("created", dst)
