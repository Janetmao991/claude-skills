#!/bin/zsh
# Render each 1080x1440 page of an issue to PNG with headless Chrome.
# Usage: ./render.sh 01-clay 1 2 3      (page numbers; default all)
set -e
cd "$(dirname "$0")"
issue=$1; shift
file=${FILE:-issue.html}
n=$(grep -c "<section class=\"page" "$issue/$file")
pages=(${@:-$(seq 1 $n)})
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$issue/out"
for n in $pages; do
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1080,1440 --virtual-time-budget=8000 \
    --screenshot="$PWD/$issue/out/${file%.html}-p$(printf %02d $n).png" \
    "file://$PWD/$issue/$file?p=$n" 2>/dev/null
  echo "rendered p$n"
done
