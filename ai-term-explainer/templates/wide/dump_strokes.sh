#!/bin/zsh
# Read every pen stroke (time, duration, kind, position) the compositions logged, into tools/strokes.json.
# Starts the HyperFrames preview, loads the film headless, reads <script id="sklog">, stops the preview.
cd "${0:A:h}/.."
ID=$(python3 -c "import json;print(json.load(open('meta.json'))['id'])")
npx hyperframes preview --background --no-open >/dev/null 2>&1
LOG=$(npx hyperframes preview --status 2>&1 | grep -o '/[^ ]*\.log' | head -1)
BASE=$(grep -o 'http://localhost:[0-9]*' "$LOG" | head -1)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --virtual-time-budget=20000 --dump-dom "$BASE/api/projects/$ID/preview" 2>/dev/null > /tmp/hf-dom.$$.html
npx hyperframes preview --stop >/dev/null 2>&1
python3 - /tmp/hf-dom.$$.html <<'EOF'
import json, re, sys
s = open(sys.argv[1]).read()
m = re.search(r'<script type="application/json" id="sklog">(.*?)</script>', s, re.S)
if not m:
    sys.exit("no stroke log in the page (did fx.js load?)")
L = sorted({(d["t"], d["d"], d["kind"], d["x"], d["y"]) for d in json.loads(m.group(1))})
json.dump([list(x) for x in L], open("tools/strokes.json", "w"))
print(len(L), "strokes →", "tools/strokes.json")
EOF
rm -f /tmp/hf-dom.$$.html
