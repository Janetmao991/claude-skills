"""Download one Google Fonts family as a single woff2 for HyperFrames (needs network; ask Janet first).
usage: python3 fetch_google_font.py "ZCOOL KuaiLe" 400 <out.woff2>
An old user agent makes the css2 API return one whole TTF instead of unicode-range slices."""
import io, re, sys, urllib.request
from fontTools.ttLib import TTFont
family, weight, out = sys.argv[1], sys.argv[2], sys.argv[3]
url = "https://fonts.googleapis.com/css2?family=%s:wght@%s" % (family.replace(" ", "+"), weight)
css = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/4.0"})).read().decode()
src = re.search(r"url\((https://fonts\.gstatic\.com/[^)]+)\)", css).group(1)
f = TTFont(io.BytesIO(urllib.request.urlopen(src).read()))
f.flavor = "woff2"; f.save(out); print("font:", out)
