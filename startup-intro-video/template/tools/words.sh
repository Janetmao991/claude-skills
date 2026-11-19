#!/bin/zsh
# word-level timings for a media file -> <file>.words.txt  ("start end word")
M=~/.cache/hyperframes/whisper/models/ggml-small.en.bin
for f in "$@"; do
  w="${f%.*}.16k.wav"; ffmpeg -v error -y -i "$f" -ar 16000 -ac 1 "$w"
  whisper-cli -m $M -f "$w" -ml 1 -sow -oj -of "${f%.*}" -np >/dev/null 2>&1
  python3 -c "
import json,sys
d=json.load(open(sys.argv[1]))
for s in d['transcription']:
  t=s['text'].strip()
  if t: print(f\"{s['offsets']['from']/1000:.2f} {s['offsets']['to']/1000:.2f} {t}\")
" "${f%.*}.json" > "${f%.*}.words.txt"; rm -f "$w"
done
