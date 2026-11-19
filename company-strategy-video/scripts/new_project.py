#!/usr/bin/env python3
"""新建一期视频工程：复制 template，安装依赖，检查工具是否就绪。
用法：python3 new_project.py <目标 video 文件夹> [--no-install]
"""
import importlib.util
import os, re, shutil, subprocess, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args:
    sys.exit(__doc__)
dst = os.path.abspath(os.path.expanduser(args[0]))
if os.path.exists(dst) and os.listdir(dst):
    sys.exit(f"目标已存在且不为空：{dst}")
shutil.copytree(os.path.join(HERE, "template"), dst, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules"))
print("已创建", dst)
if "--no-install" not in sys.argv:
    subprocess.run(["npm", "install", "--no-audit", "--no-fund", "--loglevel=error"], cwd=os.path.join(dst, "remotion"), check=True)
    print("依赖已安装")

H = os.path.expanduser
zshrc = open(H("~/.zshrc"), encoding="utf-8").read() if os.path.exists(H("~/.zshrc")) else ""
checks = {
    "ffmpeg": shutil.which("ffmpeg"),
    "Pillow（审片包）": importlib.util.find_spec("PIL"),
    "yt-dlp（下载访谈）": shutil.which("yt-dlp"),
    "whisper-cli（原声逐词）": shutil.which("whisper-cli"),
    "whisper 模型": os.path.exists(H("~/.cache/hyperframes/whisper/models/ggml-small.en.bin")),
    "配音环境 mlx-audio": os.path.exists(H("~/.cache/mlx-audio-venv/bin/python")),
    "MINIMAX_API_KEY": os.environ.get("MINIMAX_API_KEY") or re.search(r"export MINIMAX_API_KEY=", zshrc),
    "截图浏览器": os.path.exists(H("~/Library/Caches/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-mac-arm64/chrome-headless-shell")),
    "生图 mflux": os.path.exists(H("~/.venvs/mflux/bin/mflux-generate")),
}
missing = 0
for k, v in checks.items():
    print(("  ok  " if v else "  缺  ") + k)
    missing += 0 if v else 1
print("工具都就绪" if not missing else f"缺 {missing} 项，先补齐对应工具")
