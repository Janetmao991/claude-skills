"""把访谈和官方视频剪成静音的画面素材，放到 remotion/public/broll/<名字>.mp4。

broll.json（项目根目录）：{"名字": {"src": "sources/broll/x.mp4", "ss": 12.0, "dur": 5, "zoom": 1.2, "focus": [0.5, 0.4]}}
sources/podcast/ 里每段窗口自动生成一个 v_<key>，从第 auto_ss 秒（默认 1）开始。
素材只取需要的几秒：拉长常会带进主持人或无关内容；镜头比素材长时播放端会循环。
用法：python3 tools/broll.py [--force]
"""
import glob, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "remotion/public/broll")
cfg_f = os.path.join(ROOT, "broll.json")
SHOTS = json.load(open(cfg_f, encoding="utf-8")) if os.path.exists(cfg_f) else {}
for f in sorted(glob.glob(os.path.join(ROOT, "sources/podcast/*.mp4"))):
    k = os.path.basename(f)[:-4]
    SHOTS.setdefault("v_" + k, {"src": f"sources/podcast/{k}.mp4", "ss": 1.0, "dur": 5})


def cut(name, c):
    out = os.path.join(OUT, f"{name}.mp4")
    if os.path.exists(out) and "--force" not in sys.argv:
        return
    z, (fx, fy) = c.get("zoom", 1.0), c.get("focus", [0.5, 0.5])
    vf = "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080"
    if z > 1:
        w, h = int(1920 / z) // 2 * 2, int(1080 / z) // 2 * 2
        x, y = max(0, min(1920 - w, int(1920 * fx - w / 2))), max(0, min(1080 - h, int(1080 * fy - h / 2)))
        vf += f",crop={w}:{h}:{x}:{y},scale=1920:1080:flags=lanczos"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(c["ss"]), "-t", str(c["dur"]), "-i", os.path.join(ROOT, c["src"]),
                    "-vf", vf + ",fps=30", "-an", "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p", out], check=True)
    print("cut", name)


os.makedirs(OUT, exist_ok=True)
for k, v in SHOTS.items():
    cut(k, v)
