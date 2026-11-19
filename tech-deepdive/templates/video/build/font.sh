#!/bin/zsh
# Subset Noto Sans SC to every glyph used in narration (build/vo/*.txt) and scene code (scenes/*.js), weights 500/700/900.
set -e
SRC=/private/tmp/claude-501/-Users-janetmao-Technical-Analysis/6421343a-f0fc-4dca-93b1-05fdb37d7918/scratchpad/fontsrc/NotoSansSC.ttf
cd "${0:A:h}/.."
{ cat build/vo/s*.txt scenes/*.js; echo "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ·:/-—()（）、。，？！%$+×→←↑↓✓✕…“”‘’《》【】"; } > build/chars.txt
for w in 500 700 900; do
  [ -f /tmp/hf-noto-$w.ttf ] || python3 -m fontTools.varLib.instancer "$SRC" wght=$w -o /tmp/hf-noto-$w.ttf -q
  pyftsubset /tmp/hf-noto-$w.ttf --text-file=build/chars.txt --flavor=woff2 --output-file=assets/fonts/sans-$w.woff2
done
echo "fonts subset: $(ls -la assets/fonts | wc -l) files"
