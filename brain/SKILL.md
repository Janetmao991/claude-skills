---
name: brain
description: Janet 的 AI 知识库(exocortex,Karpathy LLM Wiki 架构)。触发:①摄入——用户发文章 URL(可附评语)、说"收藏/save/记到 brain",或口述想留存的观点;②回忆——"我 brain 里关于 X 有什么"、"我之前读过关于 X 的东西吗";③其他 skill 主动查询(startup-radar/equity-research 分析时引用)。核心是编译不是检索:每次摄入都更新概念页(wiki 层),回忆时给编译好的综合答案而非文件列表。
---

# Brain:Karpathy LLM Wiki 架构的 exocortex

**位置**:`/Users/janetmao/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/Brain/`(2026-08-03 迁入 Obsidian vault,成为唯一正本;旧路径 `/Users/janetmao/Library/Mobile Documents/com~apple~CloudDocs/Claude-cowork/brain` 留有 symlink 指向新址,两个路径等价)。**一切规范以 `brain/SCHEMA.md` 为准——执行任何操作前先读它**(它是这个大脑的 CLAUDE.md,布局、命名、格式、红线都在里面)。

## 输入自由原则(对用户的承诺)
用户**永远不需要任何格式**:半句感悟、一个链接、一张 slide 照片、一份 PDF、丢进 brain/inbox/ 的任何文件,都是合法输入。Markdown 是大脑的内部格式,生产它是 agent 的职责。**判断规则:凡是"想留下的认知",无论形态,都走 Ingest。**

## 三个操作

### Ingest(摄入)——按输入形态分流
- **感悟/自己的想法**(无 URL 的观点性文字):存 `thoughts/YYYY-MM-DD-<slug>.md`,**原话逐字保留**+context;然后照常编译进 wiki(权重规则:她自己的想法在 Current view 中高于外部来源)。
- **文章 URL**:读全文(WebFetch;失败则 WebSearch 找可读版)→ 存 `raw/<slug>.md` → sources/ 消化。
- **照片**(Telegram 发来,tg-inbox.py pull 会给 media 路径):用 Read 工具直接读图(slide、书页、白板均可),提取内容 → sources/ 消化,raw 记录图片路径。
- **PDF/文档**(Telegram document 或 brain/inbox/ 里的文件):用 PDF 工具/Read 读取 → sources/ 消化;处理完把 inbox/ 里的原件移入 raw/。
- **语音**(voice):暂不支持转写——回复用户"语音转写还没接,发文字或者等我装 whisper",文件保留在 tg-media 不丢。
2. 写 `sources/<slug>.md` 消化文档(格式见 SCHEMA;janet's take = 用户评语原话,神圣不可改写)。
3. **编译(核心步,漏做 = 摄入失败)**:判断触及哪些概念(通常 1–4 个)→ 更新/新建 `wiki/<concept>.md`:整合新 claims 进 "Current view"、加 `[[source-slug]]` 引用、**矛盾写进 ## Tensions,绝不静默覆盖**、维护 ## Related 背链。
4. 更新 `index.md`(概念行 + 来源行),`log.md` 追加一行。
5. **Notion 镜像(可选;2026-10-08 用户裁定 Obsidian 为主存储,默认跳过本步,仅当用户明确说"也同步到 Notion"时执行;此前"漏更新 = 摄入失败"的要求随之取消,Obsidian 的 wiki/index/log 才是摄入完成的判据)**。执行时分两层:
   a. **条目层**:"Library — External Brain"(data source `7d5b4f37-ffc3-4008-a438-2e2c23a440ae`,URL 属性用 `userDefined:URL`,不设 icon)建页——平铺书架。
   b. **概念层**:"Brain" 目录页(page_id `39cd38bb-afd5-811e-af8b-f830a9f5daf4`,结构 Domain→Concept→Items)——被本次摄入更新的每个概念,同步其 Notion 镜像子页(callout 内 Current view + Key points + Tensions + Feeding items 链接);新概念则新建子页并把 `<page url>` 排进主页对应 Domain 段(现有 Domain:AI · working with it / Investing · business / Career;需要时可加新 Domain 段)。(仅在用户要求同步时才维护 Brain 目录页。)
6. 回复(必须体现编译):确认 + 最核心 claim + **更新了哪些概念页、和既有认知的关系**("修正了你对 X 的 current view"/"与 [某源] 矛盾,已记入 Tensions"/"开了新概念页")+ 新建/更新的 Obsidian 文件路径(若按要求同步了 Notion,再附 Notion 链接)。

### Recall(回忆 + 按需综合,NotebookLM 式)
- **问答**:"brain 里关于 X":grep `index.md` → 读命中的 `wiki/` 概念页(答案已预编译)→ 必要时下钻 `sources/` 和 `thoughts/`。给综合答案:current view + 支撑来源(带 janet's take)+ Tensions 里的矛盾。禁止只回文件列表。
- **按需综合产物**:用户说"给我做一份 X 的 study guide / briefing / 总结我对 X 的认知演变"→ 基于 wiki+sources+thoughts 生成结构化文档(默认存 Obsidian `Brain/` 或 `Notes/`;用户要求时才另存 Notion)。
- **认知对照**:"我对 X 的想法和主流观点差在哪"→ thoughts vs sources 对照分析。
`log.md` 记一行 recall。

### Lint(整理,用户说"整理一下 brain"或约每月)
按 SCHEMA 的 lint 规范:合并重复概念、修死链、刷新过期 "as of"、向用户 surface 久未引用的 claims("还信吗?")。`log.md` 记录。

## 主动想起(已接线)
startup-radar、equity-research(Palm)、event 准备:工作前 `grep -i <主题> brain/index.md`,命中读概念页并在产出中引用("Janet's brain: …")。用户既有认知优先于同主题的新搜索结果。
