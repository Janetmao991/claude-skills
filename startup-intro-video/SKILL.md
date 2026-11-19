---
name: startup-intro-video
description: 把一家 startup 从头到尾介绍清楚，做成讲解视频（Remotion，公司品牌风画面 + 创始人播客原声，MiniMax 中英文男女声可选，时长不设上限，Clay 那期 23 分钟是范例）。固定章节：开场问题 → 它解决什么问题 → 是什么 → 起源 → 产品 → 最特别的一件事 → 护城河 → 定位 → 商业模式 → 风险 → 结论，让没听过这家公司的人也能看懂。用户说"做一期 XX 的介绍视频 / startup 分析视频 / 公司分析视频""把 XX 这家公司讲清楚做成视频""像 Clay 那期一样做一期 XX""startup intro / startup analysis video"，或手上有某公司的 startup-deepdive、podcast-dig 资料想做成整体介绍视频时，都用这个 skill，即使没有明说"介绍"。只拆一个策略问题（GTM、增长、定价怎么做）用 company-strategy-video；讲技术架构用 tech-deepdive；讲 AI 术语用 ai-term-explainer；只要文字报告用 startup-deepdive。
---

# Startup 介绍视频

把一家 startup 完整讲一遍：它解决什么问题、怎么起来的、产品怎么运作、凭什么值这个价、可能死在哪。观众看完应该能向别人复述这家公司。

范例是 Clay 那期（2026-11，英文，23 分钟）。它的脚本、原声表和全部场景代码在 `examples/clay/`，新一期的质量向它对齐。

这类片子好不好，取决于三件事：

1. **新观众能跟上。** 观众没听过这家公司，也不懂行业术语。每个术语第一次出现就用一句白话解释（CRM、seat、run-rate、MCP 都算）。Janet 说过两次：不设时长上限，讲清楚优先，不要为了压时长删解释。
2. **整片有一条线。** 开场抛一个让人想知道答案的问题（Clay：一家没有数据的公司，凭什么比卖数据的贵五倍？），每一章都往这个答案走一步，结尾回答它。没有这条线，十一章就是一份念出来的报告。
3. **画面是这家公司的世界。** 颜色、字体、图标都取自公司官网，关键判断让创始人自己说（播客原声嵌在品牌色画框里）。不是套一个通用模板换 logo。

和 `company-strategy-video` 的区别：那个全片只回答一个策略问题，无关内容一律砍掉；这个要覆盖整家公司。做的时候别把那边"只留和问题有关的"原则搬过来。

## 文件放哪

- 项目：`~/Technical Analysis/<公司>-Intro/`，视频工程在里面的 `video/`
- 定稿：**`~/Technical Analysis/成片-公司介绍/`**，放成片、竖版封面、发布文案，文件名都以 `<公司>-` 开头（Janet 2026-11-09：每个视频 skill 一个固定的成片文件夹，所有公司的定稿都放这一个地方，不要散在各项目里；这个文件夹里的东西不删不移）
- 素材库在 Obsidian vault：`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/`

## 流程

标了 **【给 Janet 看】** 的步骤，停下来等她确认再往下做。Clay 那期改了五版，大改都出在脚本上，脚本定稿之前不要铺画面。

### 1. 开工前问清三件事

- **语言**：英文还是中文。
- **声音**：男声还是女声（四个选定的声音见 `references/production.md`「配音」）。哪个在社交媒体上效果好靠数据定，每期用了哪个记到 `~/AI-Terms/配音AB记录.md`。
- **资料**：vault 里有没有这家公司的 `Startup Deepdive/<公司>/` 和 `Podcast Research/<公司>/`。

其他能自己判断的不要问。

### 2. 取材

1. 先读 two-pager（`Startup Deepdive/<公司>/<公司> — Two-Page Brief.html`）和播客转写，deep dive 的分维度文件只用来补缺口。资料多，用子 agent 读。
2. 缺资料时告诉 Janet，运行 `startup-deepdive` 或 `podcast-dig` 补齐。
3. 把要用的每条事实连同**原话和出处**写进 `<项目>/research/`。数字和引语以研究文件夹里的原文为准，不从别的视频稿转抄，转述会走样。
4. 一边读一边挑创始人原声：哪句话由本人说出来比旁白转述更有力，记下节目和大概位置。播客时间戳以 YouTube 字幕为准，vault 里的可能偏差十几分钟。

### 3. 框架 【给 Janet 看】

读 `references/framework.md`。写 `<项目>/<公司> — Framework.md`：开场问题和一句话答案、每章要讲的两三个点、每章打算用的原声、要解释的术语表。

### 4. 脚本 【给 Janet 看】

先建工程（脚本是工程里的 `script.json`）：

```bash
python3 ~/.claude/skills/startup-intro-video/scripts/new_project.py "<项目路径>/video"
```

按 `references/framework.md` 写 `video/script.json`。给 Janet 看的时候，把旁白按章导成一份好读的文稿发给她，别让她读 JSON。

### 5. 品牌和素材

读 `references/visual-style.md`：从官网取品牌色、logo 和图标（改 `remotion/src/brand.ts`），下载原声，定每章的画面。

### 6. 开头样片 【给 Janet 看】

先做开场和下一章（一分钟左右，至少含一段原声）的成片。画风、声音、语速在这里确认，不要跳过直接做全片。

### 7. 全片

读 `references/production.md`，依次做：配音（**先用 `--draft` 占位，定稿再用付费声音**，见 production.md「配音」）→ 原声 → `build.py` → 逐章写场景 → 每章抽帧自己看 → `check_cues.py` → `render_full.sh`。

修改很多轮时只重做受影响的章。

### 8. 独立审片，修改，跑两轮

读 `references/review.md`。全片渲染后，每一轮同时派两个全新的子 agent：A 综合审片（事实、术语、画面、故障），B "新观众"只拿到旁白和原声字幕，专查能不能一路跟上。核实两份发现，修改后重新渲染。固定两轮。

### 9. 审片 【给 Janet 看】

把成片、文稿和两轮审片的简要说明发给她：修了什么、哪些没改、哪些需要她拍板。审片 agent 听不到声音，配音语气和节奏要提醒她自己听。她的修改意见里凡是以后每期都适用的，更新到这个 skill 的 references（她追问的问题加进 `framework.md` 的必答清单）。

### 10. 发布物料

按 `~/.claude/skills/company-strategy-video/references/publish.md` 做：成片移到 `~/Technical Analysis/成片-公司介绍/`（封面命令里的输出路径也改成这里），做竖版封面（`video/cover/cover-3x4.html`）和发布文案。文件名用 `<公司>-介绍-<中文|English>.mp4`，文案重点写"看完能了解这家公司的什么"。

### 11. 收尾清理（必做，不用再问）

Janet 2026-11-09：只留最后的成片，前面的版本和无关的工具及时删掉，不然文件太多她找不到定稿。

- **制作中**：新渲染出来、确认能播，上一版就放进废纸篓，不攒 v1 / v2 / v3。脚本也不留 `script.v2.json` 这类备份。Janet 正在对比的两版先留着，她选完再删落选的。
- **成片移到 `~/Technical Analysis/成片-公司介绍/` 之后**：清掉旧版和样片 mp4、`renders/_parts_*`、`sources/vo_chunks_mm/`（付费配音的缓存，成片确认前不要清）、`review/` 里的抽帧和审片包、这一期临时写的一次性脚本、试过没用上的素材。
- **一律保留**：`~/Technical Analysis/成片-公司介绍/` 里的成片、封面和文案，Framework、`script.json`、`clips.json`、`research/`、`remotion/src/` 工程代码、最终用到的素材（`sources/podcast/` 的原声窗口、`remotion/public/web/`）。
- 用 Finder 放进废纸篓（可恢复），不要 `rm`、不清空废纸篓。清完告诉她清了什么、多大。

完成时提醒 Janet 更新项目 CLAUDE.md 的 Current status 并开新会话。

## 参考文件

| 文件 | 什么时候读 |
|---|---|
| `references/framework.md` | 写框架和脚本时：十一章各讲什么、必答清单、新观众规则 |
| `references/visual-style.md` | 定品牌、取素材、写场景时 |
| `references/production.md` | 动手制作时：配音、原声、命令、踩过的坑、交付清单 |
| `references/review.md` | 全片渲染后的两轮独立审片：流程和任务书 |
| `examples/clay/` | 想看一章该做到什么程度时：`script.json`、`clips.json`、`scenes/*.tsx` |

`template/` 是可运行的工程模板，`scripts/new_project.py` 负责复制它。
