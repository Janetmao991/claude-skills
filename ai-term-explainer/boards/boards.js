window.BOARDS = {
  "whiteboard": {
    "name": "A · 白板 Whiteboard（默认）",
    "fit": "默认；什么术语都行",
    "ground": "#FAF4E8", "ink": "#1E1E24", "muted": "#5A5A63", "grey": "#9A9AA3", "line": "#E4E4E8",
    "a1": "#F2557A", "a2": "#2E7CF6", "yellow": "#FFD43B", "hl": "rgba(255, 212, 59, 0.75)",
    "dots": "rgba(30, 30, 36, 0.11)",
    "texture": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .42  0 0 0 0 .35  0 0 0 0 .25  0 0 0 .14 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)'/%3E%3C/svg%3E\") 0 0 / 512px 512px, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.004' numOctaves='3' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .30  0 0 0 .10 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23b)'/%3E%3C/svg%3E\") 0 0 / 1200px 1200px",
    "font": "Hannotate SC", "fontFile": "hannotate-sc-bold.woff2", "fontSource": "system:Hannotate.ttc:Hannotate SC:Bold",
    "titleFont": "Hannotate SC", "rough": 1.4, "fill": "hachure"
  },
  "chalk": {
    "name": "B · 黑板 Chalkboard",
    "fit": "原理、算法类（Transformer、注意力、反向传播）",
    "ground": "#24372D", "ink": "#F2EFE4", "muted": "#C9D3CC", "grey": "#A9B8AE", "line": "#3A5144",
    "a1": "#FF9DB5", "a2": "#8FD3F5", "yellow": "#F6D55C", "hl": "rgba(246, 213, 92, 0.45)",
    "dots": "rgba(255, 255, 255, 0.05)",
    "texture": "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,.07), transparent 60%), radial-gradient(ellipse at 80% 90%, rgba(255,255,255,.05), transparent 55%)",
    "font": "ZCOOL KuaiLe", "fontFile": "zcool-kuaile.woff2", "fontSource": "google:ZCOOL KuaiLe",
    "titleFont": "ZCOOL KuaiLe", "rough": 2.2, "fill": "zigzag", "chalky": true
  },
  "notebook": {
    "name": "C · 方格本 Notebook",
    "fit": "手写笔记感（浅米黄纸纹，不画格子）；入门概念、对比类、流程类（推理 vs 训练、微调 vs RAG）",
    "ground": "#FAF4E8", "ink": "#2E2E33", "muted": "#5C5A60", "grey": "#8F8C93", "line": "#ECE2CF",
    "a1": "#E5466E", "a2": "#C23A63", "yellow": "#FFD43B", "hl": "rgba(255, 212, 59, 0.7)",
    "dots": "rgba(46, 42, 38, 0.08)",
    "texture": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .42  0 0 0 0 .35  0 0 0 0 .25  0 0 0 .14 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)'/%3E%3C/svg%3E\") 0 0 / 512px 512px, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.004' numOctaves='3' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .30  0 0 0 .10 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23b)'/%3E%3C/svg%3E\") 0 0 / 1200px 1200px",
    "font": "HanziPen SC", "fontFile": "hanzipen-sc-bold.woff2", "fontSource": "system:Hanzipen.ttc:HanziPen SC:Bold",
    "titleFont": "HanziPen SC", "rough": 0.9, "fill": "cross-hatch"
  },
  "kraft": {
    "name": "D · 牛皮纸便利贴 Kraft & sticky notes",
    "fit": "商业、生态、玩家格局类（谁卖谁买、赛道地图）",
    "ground": "#FAF4E8", "ink": "#16130F", "muted": "#4A3E2E", "grey": "#6B5A43", "line": "#C2A374",
    "a1": "#D6336C", "a2": "#1C6DD0", "yellow": "#FFE873", "hl": "#FFE873",
    "dots": "rgba(120, 80, 30, 0.05)",
    "texture": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .42  0 0 0 0 .35  0 0 0 0 .25  0 0 0 .14 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23n)'/%3E%3C/svg%3E\") 0 0 / 512px 512px, url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='1200'%3E%3Cfilter id='b'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.004' numOctaves='3' seed='7' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .55  0 0 0 0 .45  0 0 0 0 .30  0 0 0 .10 0'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23b)'/%3E%3C/svg%3E\") 0 0 / 1200px 1200px",
    "font": "Baoli SC", "fontFile": "baoli-sc.woff2", "fontSource": "system:Baoli.ttc:Baoli SC:Regular",
    "titleFont": "Baoli SC", "rough": 1.6, "fill": "solid", "notes": ["#FFE873", "#FFB3C7", "#A8D8FF"]
  },
  "blueprint": {
    "name": "E · 蓝图 Blueprint",
    "fit": "硬件、基础设施类（GPU、推理引擎、数据中心、芯片）",
    "ground": "#1B4C86", "ink": "#F2F7FF", "muted": "#BBD0EE", "grey": "#9FBBE0", "line": "#3A6AA3",
    "a1": "#FFC857", "a2": "#7FE3FF", "yellow": "#FFC857", "hl": "rgba(255, 200, 87, 0.35)",
    "dots": "rgba(255, 255, 255, 0.08)",
    "texture": "linear-gradient(rgba(255,255,255,.08) 2px, transparent 2px) 0 0 / 48px 48px, linear-gradient(90deg, rgba(255,255,255,.08) 2px, transparent 2px) 0 0 / 48px 48px",
    "font": "Noto Sans SC", "fontFile": "noto-sans-sc-bold.woff2", "fontSource": "google:Noto Sans SC:700",
    "titleFont": "JetBrains Mono", "rough": 0.35, "fill": "hachure", "dash": true
  }
};
