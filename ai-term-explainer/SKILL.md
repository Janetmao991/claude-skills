---
name: ai-term-explainer
description: 用 Janet 的 10 步框架把一个 AI / 科技专业术语讲透，并做成整套内容：手绘画板风 HyperFrames 讲解视频（默认横屏 1920×1080，"纸上类比 + 纸上屏幕"：手绘讲类比，真实 API 结果 / 官方页面 / 公司 logo 贴在纸上作证据；中英文都用 MiniMax，男声或女声可选）、可交互 HTML 讲解页（存 Obsidian 词库）、小红书封面、小红书 + X 发布文案。触发："讲讲 / 解释一下 XX 这个术语"、"做一期 AI 术语白话"、"/ai-term-explainer <术语>"、"把 XX 做成术语讲解视频"、"下一期术语"。系列主文件夹 ~/AI-Terms（成片集中在 ~/AI-Terms/成片）。
---

# AI 术语白话（ai-term-explainer）

Janet 是自学的 AI builder。这个系列用一个**真实场景**把一个术语讲懂，再讲**谁靠它赚钱、难在哪**。讲解比结论重要，全部用白话；英文术语保留，第一次出现时解释。

**文件放哪（2026-10-28 定）**：系列主文件夹 `~/AI-Terms/`。每期项目 `~/AI-Terms/ai-<slug>-ep<N>/`；**所有定稿成片和封面集中放 `~/AI-Terms/成片/`**，命名 `<两位期号>-<术语>-中文.mp4` / `-English.mp4` / `-封面.png`（如 `03-RAG-中文.mp4`），Janet 不用去别的文件夹找。不再放 `~/Adal`，也不再放 `~/HyperFrames Video/exports`（试验片、对比片可以留 exports）。

已出：01 Embedding、02 向量数据库、03 RAG（`~/AI-Terms/ai-rag-ep3`，横屏方格本，第一期按新目录做的）（第 1、2 期中英文 2026-10-31 已按第 3 期格式改成横屏，项目在 `~/AI-Terms/ai-embedding-ep1(-en)`、`~/AI-Terms/ai-vector-db-ep2(-en)`；旧竖版改横屏的脚本在 `~/AI-Terms/_tools/`）。早期样板文件夹（ep1 中文、wide、fx）已清掉，写法以 `templates/wide/`、`templates/video-examples/` 为准。HTML 页样板 https://claude.ai/artifact/WHDrUPTSxZ5QNKzisR3nrZ

**视觉方向先读 `references/visual-direction.md`**：纸上类比（左栏）+ 纸上屏幕（右栏，真实结果带操作动效）、真实图片和 logo 放哪、手绘质感的巧思、不要做的事。

**可选高光镜头：纸模型 3D（`references/paper-3d.md`，模板 `templates/paper-3d/`）**：写分镜时主动找本身有空间感的机制（位置 / 距离、东西来回传、分层 / 堆高、整期全图），每期最多 1–2 个，在 SHOTLIST 里标「纸模型 3D」并告诉 Janet 用在了哪。商业篇、风险篇、纸上屏幕不用。

**每期开场都是一个 hook：这期能学到什么（Janet 2026-11-05 定）**：片子最前面先说「这一期你会弄懂 N 件事」，画面同时亮出这期的全图（优先纸模型 3D），念到哪件亮哪块；然后再讲模型能 / 不能做什么、点出术语，不放长例子。写脚本前先定好这期的全图，开场预告和正片全图共用。台词和画面的细则见 `references/framework.md`「开场白」。

## 产出清单（一期 = 7 件）

| # | 产出 | 位置 |
|---|---|---|
| 1 | `SCRIPT.md` 定稿脚本（先给 Janet 看） | `~/AI-Terms/ai-<slug>-ep<N>/` |
| 2 | 中文视频，默认横屏 1920×1080（X、小红书都发；小红书可加竖屏包装版） | `~/AI-Terms/成片/<NN>-<术语>-中文.mp4` |
| 3 | 英文版视频（Janet 要发 X 时） | `~/AI-Terms/成片/<NN>-<术语>-English.mp4` |
| 4 | 中文 HTML 讲解页 → 私人 Artifact | 存 Obsidian `AI行业/概念/<术语>.html` + 同名 `.md` |
| 5 | 英文 HTML 页（同上，文件名加 `(English)`） | 同上 |
| 6 | 小红书封面 1080×1440 | `~/AI-Terms/成片/<NN>-<术语>-封面.png` |
| 7 | `XHS-POST.md` / `X-POST.md` 文案 | 项目文件夹 |

不是每次都要全做：先问 Janet 这期要哪几件，默认 1→2→4→6→7。

## 流程

1. **研究 + 写脚本**：先读 `~/AI-Terms/CLAUDE.md`「Janet 看片时卡住的地方」，逐条对照写；按 `references/framework.md` 的 10 步写 `SCRIPT.md`，每个数字都要有出处（官方博客、论文、可靠报道）。案例公司只写公开资料能讲清的部分，**不编训练配方**。**写完或大改之后，先派一个没参与写稿的 agent 扮外行观众过稿（只读中文台词，不给背景；找没解释的词、缺的一步、比喻对不上、点名没下文，并让它用自己的话复述要点），改完再交（Janet 2026-11-11）。比喻只在引入时用一次，之后台词一律说真实名称。** 脚本先给 Janet 看，定稿再配音。
2. **画板**：默认 A 白板，跟前几期一样的米白底 #FAF4E8，不用每期问（Janet 2026-11-04：系列要统一，不要每期换画板）。只有 Janet 主动要换风格时，才看下表和 `boards/previews/boards-sheet.png`。
3. **建项目**：`python3 scripts/new_term.py <slug> <N> zh <board>`（英文版把 `zh` 换成 `en`）。它复制模板、接好配音和字幕、套上画板。
4. **真实演示数据**：用这期的场景例子真的跑一次 API（`scripts/real-demo/`），再列出要截的一手页面（价格页、技术博客、排行榜）和要用的公司 logo。先给 Janet 看数据截图。
5. **镜头表**：写场景代码之前，按 `references/shotlist.md` 写 `SHOTLIST.md`（一行一个画面事件：什么东西在做什么、右栏、镜头、屏上字），跑 `python3 scripts/shotlist_lint.py <项目>/SHOTLIST.md --project <项目>`，**红灯清掉再写场景**。
6. **配音 → 场景 → 纸上屏幕 → 渲染**：见 `references/production.md`（横屏 A+C 一节）。**这一步先用本地免费声音占位，付费声音等定稿再配**（见下面硬规则第一条）。**每写完一个场景就截帧、自己看图挑毛病、改**（production.md「检查和渲染」第 3 步），全部过了再整片渲染。场景参考 `templates/video-examples/`，横屏和屏幕参考 `templates/wide/`。
7. **出片前机检 + 独立审片**：给 Janet 看之前，按 `references/review.md`：`uv run scripts/film_check.py <成片> --project <项目> --sheets`（红灯先改），再派一个没参与制作的 agent 只看成片审片，问题改完要抽帧复查，最多 3 轮再交。
8. **HTML 页、封面、文案**：见 `references/production.md` 后半部分。
9. **收尾清理（必做，不用再问，Janet 2026-11-09）**：只留最后的成片，前面的版本和无关的工具及时删掉，不然文件太多她找不到定稿。
   - **制作中**：新渲染出来、确认能播，上一版就放进废纸篓，不攒 v1 / v2 / v3。Janet 正在对比的两版先留着，她选完再删落选的。
   - **Janet 确认成片后**：跑 `python3 scripts/tidy_project.py <项目> --apply`（已复制到 ~/AI-Terms/成片 的渲染、配音中间产物、预览缓存、试音样本）；付费配音的 `assets/vo/chunks/` 也是这时候才清，制作中不要清，再手动清脚本管不到的：旧版和样片 mp4、审片截图和抽帧、这一期临时写的一次性脚本、试过没用上的工具和素材、scratch 备份。
   - **一律保留**：`成片/` 里的定稿、SCRIPT.md、SHOTLIST.md、场景代码、真实演示数据、logo 和截图素材、skill 自带的脚本。
   - 用 Finder 放进废纸篓（可恢复），不要 `rm`、不清空废纸篓。清完告诉她清了什么、多大。
   - 提醒 Janet 更新项目 CLAUDE.md 的 Current status，下一期开新会话。

## 10 步框架（详细写法见 references/framework.md）

技术篇：①解决什么问题（场景 → 老办法卡在哪）②它是什么（比喻 + 名字由来）③怎么用、自己做还是买
商业篇：④链条（谁卖谁存谁买）⑤商业模式 ⑥玩家（大厂 + 创业公司）⑦门槛 ⑧横向还是纵向 ⑨拆一家
风险篇：⑩风险与趋势（被大模型吃掉 / 商品化 / 被平台整合 / 被替代 / 合规）
收尾：一句话记住

## 画板（boards/boards.js 是唯一来源）

| 画板 | 字体 | 适合 |
|---|---|---|
| A 白板 whiteboard（默认） | Hannotate SC | 什么都行 |
| B 黑板 chalk | ZCOOL KuaiLe | 原理、算法类 |
| C 方格本 notebook | HanziPen SC | 入门概念、对比类 |
| D 牛皮纸便利贴 kraft | Baoli SC | 商业、生态、玩家格局 |
| E 蓝图 blueprint | Noto Sans SC + JetBrains Mono | 硬件、基础设施 |

- `scripts/apply_board.py <项目> <画板>`：把模板里的白板颜色、字体、纸面纹理整体换掉，自动从 macOS 系统字体导出 woff2。B 和 E 用 Google 字体，**第一次用之前问 Janet 能不能下载**，再跑 `scripts/fetch_google_font.py`。
- D 牛皮纸的标签最好做成便利贴（彩色方块 + 胶带），换色脚本做不到这一步，写场景时手动加（预览页 `boards/preview.html?b=kraft` 有写法）。
- 想新增画板：在 `boards.js` 加一项，用 `boards/preview.html?b=<名字>` 出预览图，**存之前给 Janet 看**。

## 硬规则（踩过的坑）

- **脚本交给 Janet 之前，必须先让外行 agent 过稿（Janet 2026-11-11 定，固定步骤，不能跳）**。每次写完或大改 `SCRIPT.md`，派一个没参与写稿的 agent 扮不懂技术的观众：只读中文台词、不给背景资料；让它列出没解释就用的词、上下句缺的一步、比喻对不上真实东西、点了名没下文、只有结论没理由、一句太密，再用自己的话复述这期要讲清的几个问题。它答不上来的地方就是没讲明白的地方。改完才发给 Janet，并在交稿时说明过稿改了什么。SCRIPT.md 的 status 行写上「已过外行稿」；没有这几个字就不能交。

- **付费配音只在定稿时用（Janet 2026-11-10：几乎每天做视频，量大）**。花钱的不是渲染（渲染只是复用已有的音频），是「台词改了重新生成」。所以：
  - **改稿、对时间、看画面的阶段用免费占位声音**：`tools/build_vo_mm.py --draft`（中文默认用本地 Qwen3-TTS 克隆第 1–4 期的男声，免费离线，参考样本 `assets/vo/ref-r5.wav`；英文或没装 mlx-audio 时退回 Mac say，加 `--say` 也可强制用 say。Janet 2026-11-11：say 太难听，影响看片，试听也要用 Qwen）。给 Janet 看样片时说明这是占位声音。
  - **Janet 确认稿子不再改了**，才用付费声音配一次（中文 MiniMax，英文 ElevenLabs），重新 build、抽帧检查、渲染最终版。换声音后每句的时间会变，画面必须跟着新 timeline 重新生成并复查，不能只换音轨。
  - **`assets/vo/chunks/`（按台词指纹缓存的付费分段）在 Janet 确认成片之前不要清**，这样定稿后的小改动只重新生成改的那一段。只有成片确认后才清。
  - 试新声音只生成一小段样片（一两句），不配整片。
- **中文配音用 MiniMax `speech-2.8-hd`**（Janet 2026-11-06 盲听选定，`tools/build_vo_mm.py`）：男声 `Chinese (Mandarin)_Gentleman`（`--voice male`，默认），女声 `Chinese (Mandarin)_Warm_Bestie`（`--voice female`）。旧的 Qwen R5 在盲听里排最后，不再用。**男声女声哪个在社交媒体上效果好，靠数据定**：开工前问 Janet 这期用哪个，发布后把声音、平台、完播率、点赞、收藏记进 `~/AI-Terms/配音AB记录.md`。API key 在 `~/.zshrc` 的 `MINIMAX_API_KEY`，脚本会自己读，不要把 key 写进项目或聊天。英文版同一个脚本（SCRIPT.md 是 `id | English` 格式时自动走英文）：男声 MiniMax `English_Gentle-voiced_man`（默认）；**女声用 Janet 自己在 ElevenLabs Voice Library 挑的声音 `rSZFtT0J8GtnLqoDoFAp`**（2026-11-10 最后定的，命令里把下面的 voice id 换成它，其余参数一样；Emily 是备选）。经过（MiniMax 的英文女声她都觉得差一点；ElevenLabs 的 Jessica 等十来个默认声音她嫌「太高亢」，只有 Emily 调平稳后可以）：`--voice female --eleven LcfcDJNUP1GQjkzn1xUU --speed 1.0 --eleven-stability 0.8`（不要加速，加速会更冲），key 在 `~/.zshrc` 的 `ELEVENLABS_API_KEY`（2026-11-10 升到 Creator 档，脚本已改成 192k 输出；key 只开了生成语音的权限）。**2026-11-10 晚 Janet 听 8 条样片后改选（以这条为准）：英文男声 ElevenLabs Robert `BtWabtumIemAotTjP5sk`（她说很喜欢），英文女声 Jessica Anne Bogart `g6xIsTj2HwM6VR4iXFCw`；都是 `--eleven <id> --speed 1.0 --eleven-stability 0.8`。她只听过 10 秒样片，整片听感待确认；`rSZFtT0J8GtnLqoDoFAp` 和 Emily 退为备选**。中文不换 ElevenLabs（2026-11-10 盲听她仍选 MiniMax Warm_Bestie）。Kokoro `am_michael` 在英文盲听里落选，`build_vo.py`（Kokoro）只留作没网或没额度时的备用。
- （旧 Qwen 方案才有的坑）Qwen3-TTS 会吞最后一个字，`build_vo.py` 在每句后面加垫底句「就这样。」再剪掉。MiniMax 不吞字，`build_vo_mm.py` 不需要。不管用哪个，渲染前都要看 `assets/vo/chunks/report.txt` 的 ASR 分数，低于 0.9 的段要听。
- **RAG 读成一个词「rag」**（Janet 2026-10-28 定，`TTS_SUB` 里 `"RAG": "rag"`）。同一个缩写全片只用一种读法。
- 英文词读错时，用 `TTS_SUB` 只改配音模型看到的拼写，字幕不变（Embedding → `im-bedding`；Qwen → `Chwen`；缩写直接写原样（BGE、MTEB），Kokoro 会逐个字母读；**不要加逗号拆字母**，每个逗号都是一次停顿，听起来很慢）。
- 中文 5 分钟在小红书偏长；X 普通账号上限 2:20，超过要 Premium。这是平台信息，不是目标：不要为压时长删解释，成片时长告诉 Janet 让她决定。
- **视频风格（2026-10-28 定）**：不要角色 / 吉祥物；不要切到全屏深色"真实世界"；真实画面只以"纸上屏幕"出场，配纸面配色；每个真实镜头后配音停 2–2.5 秒；屏幕上的数字只来自真实运行结果或一手来源。
- **品牌规范**：纸底 #FAF4E8、线条深灰、强调色只有粉 + 黄荧光（不用蓝）、字幕和正文用圆体 Yuanti SC 常规 + 英文 SF Pro、强调用手绘圈 / 下划线不靠加粗；默认开启镜头跟随；**换幕的"唰"一声音量减半（whoosh 0.13，Janet 2026-10-31）**；**默认关掉画画的沙沙声**（Janet 2026-10-28：太大声，`build_film.py` 里 `DRAW_SOUND = False`）；**默认不画笔**（Janet 2026-10-28：笔会分散注意力，要笔时 `SK.SHOW_PEN = true`）（详见 `references/visual-direction.md`）。
- **公司用真实 logo**（官网 press kit），原样使用、只用来指认公司；拿不到就手写公司名，不用仿制图标。
- 写入 Obsidian 要遵守 `AI行业/AI行业 索引.md` 的归档规则：原件 + 同名 `.md` 笔记，并在索引的「概念」下加一行。
