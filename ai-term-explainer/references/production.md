# 制作手册

先读 `/hyperframes` skill（合约、检查、渲染），再按下面做。CLI 固定 `npx hyperframes@0.8.206`。

## 视频

**写场景之前先写镜头表**：`SHOTLIST.md`，写法和 lint 见 `references/shotlist.md`。

**项目结构**（new_term.py 生成）
- `SCRIPT.md` → `tools/build_vo.py` 生成 `assets/vo/voiceover.wav` + `assets/vo/timeline.js`（`window.__VO`，每句的起止时间）
- `compositions/<scene>.html`：每个场景一个文件，用 `SK.cue(N, id)`（某句开始）和 `SK.cueChar(N, id, "字")`（某句里某个字 / 英文词的位置）卡点。`tools/head.css` 是共用样式，写场景时贴进 `/*HEAD*/`
- `compositions/chain.html`：顶部进度链，改 `ORDER` 成本期的场景列表
- `compositions/captions.html`：字幕自动从 timeline 生成，不用手写
- `tools/build_sfx.py`：改场景列表和几个"啪"的卡点字
- `tools/build_index.py`：把场景写进 index.html。**改完 SCRIPT 或场景都要重跑**

**手绘工具（assets/sketch.js）**：`SK.draw`（线条画出来）、`SK.write`（字写出来）、`SK.stamp` / `SK.stampBox`（盖章）、`SK.highlight`（荧光笔）、`SK.dot`、`SK.cross`、`SK.boxed`、`SK.arrow`、`SK.curveArrow`、`SK.page`、`SK.cylinder`。用法看 `templates/video-examples/`。

**道具库（assets/props.js）**：画成本来样子的物，一句话画出来，如 `SK.robot(tl, svg, x, y, at, {s: 0.8})`。目录、尺寸和新增道具的做法见 `references/props.md`。

**配音**
- **先占位，后定稿**（Janet 2026-11-10）：改稿阶段一律加 `--draft`（`build_vo_mm.py --draft`，Mac 自带 say 占位，免费）；Janet 确认稿子不再改，才去掉 `--draft` 跑付费声音，然后重新 build、抽帧复查、渲染。`assets/vo/chunks/` 留到成片确认后再清。
- 中文：`~/.cache/mlx-audio-venv/bin/python tools/build_vo_mm.py --voice male|female`（MiniMax speech-2.8-hd；男 Gentleman / 女 Warm_Bestie）。按场景整段生成，本地 Qwen3-ForcedAligner 切回每句和每个字的时间，写 `assets/vo/timeline.js` + `timeline.json`。台词改过的段会自动重配；只想重配某段就删 `assets/vo/chunks/<场景>-<n>-<指纹>-*.wav`。换声音会全部重配。停顿用 `<#0.5#>`，单字读音用 `处(chu3)理`。
  - 旧方案（不再默认）：`tools/build_vo.py`，Qwen3-TTS 克隆 ref-r5.wav，逐句生成。
- 英文：同样 `~/.cache/mlx-audio-venv/bin/python tools/build_vo_mm.py --voice male|female`（男 English_Gentle-voiced_man / 女 English_CalmWoman）。SCRIPT.md 是 `id | English` 时自动识别成英文，timeline 每句给 `text` 和每个词的时间 `words`。
  - 备用（没网或没额度）：`~/.cache/hf-kokoro-venv/bin/python tools/build_vo.py`（Kokoro am_michael，速度 1.1，逐句生成）。
- 读音不对：改 `TTS_SUB`，只影响配音。
- 检查：`~/.cache/mlx-audio-venv/bin/python <skill>/scripts/asr_check.py <项目> zh|en`。被标记的句子删掉 raw 重配，直到 `flagged 0`。ASR 会把同音字写错（"按字找"→"暗自找"、token→"偷啃"），这种不算错。

**检查和渲染**
1. `python3 tools/build_index.py`
2. `npx hyperframes@0.8.206 check --json`：0 error
3. **每写完一个场景就截帧自查，不等整片渲染**（2026-10-30 加，借 Gamma 的逐页视觉检查：AI 写代码时看不见画面，要给它眼睛）：
   - `npx hyperframes@0.8.206 snapshot . --composition <场景的 data-composition-id> --frames 6 -o 审片/scene-<场景名>`，用 Read 工具真的打开 contact sheet 看，不要只看命令跑成功没有。看不清的地方加 `--zoom "<选择器>"` 放大。
   - 逐张查：①字出框、被裁成半截、压线 ②标签、箭头、屏幕互相叠住 ③字和纸面颜色太近看不清 ④一边挤满、另一边空着 ⑤品牌（蓝色、第三种强调色、加粗）⑥这个场景对应的 SHOTLIST 行，画面上有没有那个「物」在做那件事。
   - 有问题改完再截一次，同一场景最多 3 轮；第 3 轮还不对，记进 REVIEW.md 接着做下一场景，别卡住。全部场景过完再整片渲染。
4. `npx hyperframes@0.8.206 render -o renders/<name>.mp4`（5 分钟约 10 分钟，放后台），复制到 `~/AI-Terms/成片/`（命名 `<NN>-<术语>-中文.mp4`）
5. 机检 + 独立审片（`references/review.md`）：`uv run <skill>/scripts/film_check.py renders/<name>.mp4 --project . --sheets`，红灯先改；再派独立 agent 审片，结论在 `审片/`。都处理完再给 Janet。

**横屏 A+C（新一期默认，先读 `references/visual-direction.md`）**
1. 场景先按竖版写好（左栏内容），再跑 `templates/wide/to_wide.py` 转横屏；`templates/wide/README.md` 有每个文件放哪。
2. 跑真实演示数据（下一节），`export_real_data.py` 生成 `assets/real-data.js`。
3. 写 `assets/real-blocks.js`（哪句台词出哪个屏幕）和 `compositions/screens.html`（屏幕内容）；`build_holds.py` 的 `HOLDS` 给这些台词加 2–2.5 秒停顿，然后跑它生成 index.html。
4. 一手证据截图（价格页、技术博客）：Chrome 无头 2 倍截图存 `assets/real/`，在 `screens.html` 里用 `cam({x,y,w})` 定镜头起止、`.hl` 框住要看的那一行。截图后自己看一遍：高亮框真的框住了结论里说的那个数字。
5. 公司 logo：官网 press kit / brand 页下载，存 `assets/logos/`，来源记进 BRIEF.md。
6. 小红书：另做 3:4 竖版封面；需要竖屏包装版时，横屏多渲染一份不带字幕的，再套 1080×1920 纸面外框（上标题、下放大字幕）。

**第 3 期（RAG）踩到的坑，下一期照做**
- 横屏字幕：`captions.html` 的中文分段上限从竖版的 13/16 字改成 24/28 字，并把「、」算进断句标点，否则会出现以「、」开头的字幕（`~/AI-Terms/ai-rag-ep3/compositions/captions.html`）。
- 圆体字幕要把字体文件放进项目：从 `/System/Library/AssetsV2/.../Yuanti.ttc` 导出 `Yuanti SC Regular` 成 `assets/fonts/yuanti-sc-regular.woff2`，在 head.css 和 captions.html 里写 `@font-face`；只写字体名，check 会报错（渲染机找不到本机字体）。
- 场景名不能叫 `chain`（和进度链 overlay 重名），商业链条那一节叫 `biz`。
- 改 SCRIPT 时拆句或插句（d3 → d3 + d4），后面所有句子的 id 都会变：场景里 `q("d6")`、`qc("d7", …)` 要一起改，不然那几句什么都不画（机检会报十几秒没变化）。
- 纸上屏幕里的东西要跟着台词出现：屏幕脚本里用 `cc(id, "字")` 按台词里的字卡点（`~/AI-Terms/ai-rag-ep3/compositions/screens.html`），别全挤在屏幕出现后的前 3 秒；一块屏幕只证明一件事，两件就拆成两个镜头（订单号：先「只按意思找 → 查不到」，再「加上按字找 → 答对」）。
- 审片说「几分钟没有证据屏」时，优先补公司官方页面的截图（Harvey 博客框住 91%），手绘数字条可以删掉。
- 官方页面截长图找位置：在内置浏览器里用 JS 找到那一行的 `getBoundingClientRect().top + scrollY`，再用无头 Chrome 截同宽长图、ffmpeg 按 2 倍坐标裁。

**真实演示数据（scripts/real-demo/）**
- 用这期的场景例子真的跑一次，结果全部来自 API，不手写数字。第 1 期：8 份客服文档 + 顾客那句话 → 按字搜 0 条、按意思搜排名、12 句话的坐标（PCA 压到 2 维）、Claude 根据前两份文档回答。
- 文件：复制 `scripts/real-demo/` 到 `<项目>/real-demo/`，改 `data/docs.json`（参考 `docs.example.json`）→ `zsh -ic 'python3 build_data.py'`（Embedding：Voyage `voyage-3.5`，key 在 `VOYAGE_API_KEY`，Janet 的 key 走 MongoDB 入口 `https://ai.mongodb.com/v1/embeddings`）→ `answer.py`（Claude，key 在 `ANTHROPIC_API_KEY`；第一次先 `python3 -m venv .venv && .venv/bin/pip install anthropic`，再 `zsh -ic '.venv/bin/python answer.py'`）→ `export_real_data.py <real-demo> <项目>`。
- `index.html` + `shots.sh` 能把结果出成静态截图，给 Janet 先看数据对不对。
- key 只放环境变量（`~/.zshrc`），不要让 Janet 贴进对话；录屏和截图里不能出现 key。
- 别的术语换成对应的"真跑一次"：例如 RAG 就真的检索 + 回答，Tokenizer 就真的切一句话，Fine-tuning 就放训练前后同一个问题的真实回答。

**英文版**：`new_term.py <slug> <N> en <board>` 另建项目，把中文场景复制过去，所有中文标签换英文、`qc()` 卡点换成英文台词里的词（必须是台词里真有的词）。英文比中文宽，`.tg` / `.st` 这类小框字号要调小，用快照检查。

## HTML 讲解页
- **跟视频同一套背景和字体**（Janet 2026-10-31）：#FAF4E8 纸面噪点、标题 HanziPen SC（翩翩体）、正文 Yuanti SC（圆体）、墨色 #2E2E33，深色模式也保持浅色纸面。做完跑 `python3 ~/AI-Terms/_tools/restyle_pages.py "<页面.html>"` 套上。

- 模板：`templates/page/page-zh.html`、`page-en.html`（第 1 期成品）。保留结构：英雄区一句话 + 10 步跳转（分技术篇 / 商业篇 / 风险篇）、每步一节（编号竖线）、一个"动手试试"的交互、一个计算器、可搜索术语表、资料来源。
- 交互要贴着这期的比喻做（Embedding 是"按字找 vs 按意思找"的意义地图）。
- 字体 ZCOOL KuaiLe（Janet 喜欢这版），不放音标。
- 发布：`Artifact` 私人页面 → 告诉 Janet 公开要她自己在 Share 菜单点。
- 存 Obsidian：`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/AI行业/概念/<术语>.html` + 同名 `.md`（frontmatter：type 概念、date、source=artifact 链接、attachment），并在 `AI行业 索引.md` 的「概念」下加一行。

## 小红书封面

- 模板 `templates/page/cover.html`（1080×1440，rough.js 手绘）。换：期数、标题、钩子句、中间那张小图（画这期的比喻）、底部要点。
- 出图：`"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --allow-file-access-from-files --force-device-scale-factor=1 --window-size=1080,1440 --virtual-time-budget=3000 --screenshot=<out.png> file://<cover.html>`
- 看一眼：印章、标签不要压字。
- 底色要是米黄纸面 #FAF4E8，不是白色：背景里的 data URI 要把 `100%` 写成 `100%25`，否则整条 background 失效变白（第 3 期两张封面都是白底，2026-11-01 才发现）。出图后取一个角落像素看是不是 (250,244,232)。
- **横屏视频要配 4:3 横版封面（1440×1080）**，存 `<NN>-<术语>-封面-横版.png`；3:4 竖版只给图文笔记用。第 3 期 3:4 封面配横屏视频发出去被裁成中间一条（2026-10-30）。横版内容放在 x 180–1260 内（方形裁切也能读），右上角（播放键）和右下角（时长）留空。模板 `~/AI-Terms/ai-rag-ep3/cover/cover-4x3.html`。

## 文案

- **小红书** `XHS-POST.md`：3 个标题备选 + 正文（场景钩子两句 + 「我讲一个 AI 术语的框架（10 步）」列表 + 一句"技术、商业、风险一起看懂"）+ 来源一句 + 标签。**不放时间戳**。
- **X** `X-POST.md`（英文）：角度是"I've been using Claude to break down AI jargon"，列 3 点（是什么 / 商业链 / 难在哪 + 案例公司），来源链接放回复里不放主帖。

## 改了配音之后（2026-10-31 踩坑）
- `assets/camera-keys.js` 用的是**全片绝对时间**。加句、删句、重配任何一句后，都要按顺序重跑：删 `assets/vo/*.v1.*` → `tools/build_film.py` → `zsh tools/dump_strokes.sh` → `tools/build_camera.py`。不重跑的话，后面所有镜头推近都会错位（第 3 期就提前了 25 秒）。
- 场景 HTML 会被自动加上 `data-hf-id` 属性。脚本里用正则找元素时，要容许标签里有别的属性（`<div [^>]*?class=...`），否则匹配不到，会重复插入。
