#!/bin/zsh
# Export each demo screen as a 2x PNG into shots/
cd "${0:A:h}"; mkdir -p shots
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for s in api dims store search map answer; do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size=1200,900 --screenshot="shots/$s.png" "file://$PWD/index.html#$s" 2>/dev/null
done
ls shots
