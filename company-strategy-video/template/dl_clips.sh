#!/bin/zsh
# Download a 65s window per clip in clips.json (skips existing). Trimming happens in tools/build.py.
cd "$(dirname $0)"
python3 -c "
import json
for k,v in json.load(open('clips.json')).items(): print(k, v['yt'], v['win'])
" | while read name id s; do
  [ -f "sources/podcast/$name.mp4" ] && continue
  e=$(python3 -c "import sys;h,m,s=map(int,sys.argv[1].split(':'));t=h*3600+m*60+s+65;print(f'{t//3600:02d}:{t%3600//60:02d}:{t%60:02d}')" $s)
  yt-dlp -q --no-warnings -f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]" --merge-output-format mp4 \
    --download-sections "*$s-$e" --force-keyframes-at-cuts -o "sources/podcast/$name.%(ext)s" "https://www.youtube.com/watch?v=$id" || echo "FAIL $name"
done
ls sources/podcast/*.mp4
