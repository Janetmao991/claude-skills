#!/bin/bash
# 全片渲染：画面分段（每段一个新进程，避免 Chrome 内存耗尽）+ 音频单独渲染 → 拼接 + 限幅 + 检查
# 用法：tools/render_full.sh <输出名>；中断后重跑会沿用已渲染的分段，改过画面要换输出名或删 renders/_parts_<输出名>
set -euo pipefail
NAME="$1"; ROOT="$(cd "$(dirname "$0")/.." && pwd)"; R="$ROOT/remotion"; OUT="$ROOT/renders"; TMP="$OUT/_parts_$NAME"
mkdir -p "$TMP"; cd "$R"
TOTAL=$(python3 -c "import json,math;print(math.ceil(json.load(open('src/data/timeline.json'))['total']*30))")
CHUNK=4500; i=0; a=0; : > "$TMP/list.txt"
while [ "$a" -lt "$TOTAL" ]; do
  b=$((a + CHUNK - 1)); [ "$b" -ge "$TOTAL" ] && b=$((TOTAL - 1))
  f="$TMP/p$i.mp4"
  [ -s "$f" ] || npx remotion render src/index.ts Episode "$f" --frames=$a-$b --muted --concurrency=6 --crf=20 --log=error
  echo "file '$f'" >> "$TMP/list.txt"; echo "part $i done ($a-$b)"
  a=$((b + 1)); i=$((i + 1))
done
[ -s "$TMP/audio.wav" ] || npx remotion render src/index.ts Episode "$TMP/audio.wav" --codec=wav --concurrency=4 --log=error
ffmpeg -v error -y -f concat -safe 0 -i "$TMP/list.txt" -i "$TMP/audio.wav" -map 0:v -map 1:a -c:v copy -af "alimiter=limit=0.84:level=false" -c:a aac -b:a 192k -shortest "$OUT/$NAME.mp4"
ffmpeg -i "$OUT/$NAME.mp4" -af volumedetect -vn -f null - 2>&1 | grep -E "mean_vol|max_vol"
ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$NAME.mp4"
echo "超过 1.5 秒的静止段（秒(时长)），逐个核对是不是素材问题："
ffmpeg -i "$OUT/$NAME.mp4" -vf "freezedetect=n=0.003:d=1.5" -map 0:v -f null - 2>&1 | grep -E "freeze_(start|duration)" | sed 's/.*freeze_//' | paste - - | awk '{printf "%s(%.1fs) ",$2,$4}'; echo
