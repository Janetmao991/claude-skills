# 横屏 A+C 模板（来自第 1 期 `~/Adal/ai-embedding-ep1-wide/`）

| 文件 | 放到项目里 | 作用 |
|---|---|---|
| `to_wide.py` | `tools/` | 一次性把竖版场景改成横屏：标题挪左上，其余内容放进左栏 `#stage`（缩放 0.933）。`MOVES` 里写要挪到右栏的元素（每期不同） |
| `build_holds.py` | `tools/` | 在真实镜头那句台词后插静音（`HOLDS`），重写 timeline.js 和 voiceover.wav，再生成 index.html（横屏尺寸、场景、`screens` 层、字幕、音效）。改 `SCENES`（这次做到哪一章）。可重复跑（从 `.v1` 备份开始） |
| `real-blocks.js` | `assets/` | 每个纸上屏幕在哪句台词出现、里面有几个镜头（`REAL_BLOCKS`）。index.html 在 timeline.js 之后加载它 |
| `screens.html` | `compositions/` | 右栏纸上屏幕：手绘框 + 胶带 + 手写结论 + 9 种镜头（search / curl / proj / grid / rank / api / openai / chat / airbnb）。新一期复制后改镜头内容；数据从 `window.REAL`（`scripts/real-demo/export_real_data.py` 生成）读 |

字幕 `captions.html`：位置改成中文 top 926 / 英文 top 992、宽 1680；进度链 `chain.html`：Y 92、X0 1170、DX 70、D 28。
截图检查用 `npx hyperframes snapshot`；终端类镜头注意 `white-space: pre` 只加在每一行上，加在容器上会把源码换行也渲染出来。

**手绘质感（默认开启，做法见 `references/visual-direction.md`「默认开启的三样」）**

| 文件 | 放到项目里 | 作用 |
|---|---|---|
| `fx.js` | `assets/`（index.html 里紧跟 sketch.js 加载） | 笔尖跟着画、镜头 `SK.camera`、把每一笔记进 `window.__SKLOG` 和页面里的 `<script id="sklog">` |
| `dump_strokes.sh` | `tools/` | 开预览 → 无头 Chrome 读出全片笔画 → `tools/strokes.json` |
| `build_camera.py` | `tools/` | 按笔画位置生成 `assets/camera-keys.js`（index.html 里在 real-blocks.js 之后加载） |
| `build_drawsfx.py` | `tools/` | 按笔画合成 `assets/sfx/drawing.wav`（需要 numpy + soundfile） |
