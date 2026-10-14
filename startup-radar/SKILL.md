---
name: startup-radar
description: 评估一家 AI startup 并建档。用户给出公司名或官网 URL(可附遇见场合)时触发,如 "/startup-radar Granola" 或 "评估一下这家 startup"。流程:搜集公开信息(产品与需求、unique、市场机会、创始团队、融资、竞品)→ 以 YC / a16z / Sequoia 三个 VC persona 逐维度走各自框架、展示完整分析过程并交叉辩论 → 综合 takeaway 与可当面追问创始人的问题 → 写入 Obsidian vault 的 Startup Radar 文件夹(内容英文为主,排版全素)。Notion 仅在用户明确要求时才同步。档案以"分析过程"为核心,帮助用户培养自己评判 startup 的 insight。
---

# Startup Radar:三方 VC 框架评估 + Obsidian 建档

**产品目标**:用户通过反复阅读"三家 VC 如何逐维度分析一家公司"来培养自己的投资判断。因此档案的核心是**分析过程**,verdict 只是过程的自然结果。宁可过程长,不可过程省。

**存储规则(2026-10-08 用户裁定)**:Obsidian 是主存储,新档案直接写进 vault,默认不写 Notion;只有用户说"也放 Notion / 同步到 Notion"时才执行 Step 3.6。

**语言规则**:档案内容一律用**英文**写(个别关键提醒可留一句中文);和用户的对话用用户当前使用的语言(通常是中文)。

## 输入
- 必需:公司名或官网 URL。
- 可选:遇见场合(哪个 event)、用户已知的补充信息(demo 见闻、创始人聊天内容)——这些一手信息优先级高于网上搜到的。
- 一次给多家公司时,逐家完整跑完再跑下一家。
- **扫 Inbox 模式**:用户说"扫一下 inbox / 处理收集箱"之类时,查询 "Inbox — Agent OS" 数据库(data_source_id `44696f2e-8afc-4f9f-8731-c781d7eb4ba8`,URL: https://app.notion.com/p/499c5697aa8a4e9a92173c5fa74f1dbf)中 Status="Pending" 且 Type="Startup"(或内容明显是 startup)的条目,逐条按本流程评估;Notes 字段是用户现场记的一手信息。完成后回填:Status="Done"、Result=新档案的 Obsidian 路径(vault 内相对路径);失败则 Status="Failed" 并在 Notes 追加原因(英文)。

## Event 准备模式(跨技能)
用户说"我周X去 XX event / 帮我准备 XX 活动"时:
1. 搜索该活动的 speaker、demo 公司、主办方名单(活动官网、Luma/Eventbrite 页、往届报道)。
2. 与 vault 里的 `Startup Radar/` 文件夹(先读 `_Radar Index.md`;2026-08-18 前的旧档案若 vault 内缺失,再查 Notion Startup Radar 数据库 data source `879e37d6-75ce-4396-8781-7dcebe9b6e08`)交叉比对:已有档案的公司列出你的既有观点(Overall + 关键分歧)和档案链接;陌生但值得聊的公司做 30 秒硬信号定性(轮次间隔、融资、一句话产品)。
3. 产出"社交弹药清单":每家公司 1–2 个可当面问创始人的问题。写成 vault 里的新笔记 `Startup Radar/<活动名> — YYYY-MM-DD.md`(英文,同档案的全素排版),并在对话中给中文摘要。

## 跨技能调用
- **→ equity-research**:分析中出现的竞对/在位者是美股上市公司时,调用 equity-research skill 的快照(`cd ~/equity-research && python3 cli/research.py <TICKER>`)拉真实收入/估值/增长,替代模糊表述("~$700M-ish"→ 精确数字),在档案中标注 "(equity-research pull, <date>)"。每家公司最多拉 2 个 ticker,注意 API 限额。
- **← 公司发现源(2026-10-04 加)**:想主动找"值得评估且在招人"的公司时,来源清单在 job-radar/job_sources.yaml 与 job-search/pipeline.md Source 7–9:Breakout List(投资人精选 92 家)、Ramp vendor data(支出增速,可直接当 traction 数据点引用并标月份)、Cosign(a16z 背书网络)、Founders You Should Know(SF 月度 showcase 路演名单)、a16z Jobs newsletter。每日 job digest 摘要末尾的 "radar 候选" 即出自这些源,用户点名后再建档。
- **→ job pipeline**:若被评估公司同时出现在 job-search/jobs.json(用户可能投它),在对话摘要中加一句提醒:"这家公司在你的求职 pipeline 里,本档案的判断可作为雇主质量参考"。

## Step 1 — 信息收集
用 WebFetch(官网)+ WebSearch 收集,搜索预算每家 4–8 次。信息不足不要编造,档案里明确标注 information gaps。**开始前先查用户的 brain**:`grep -i "<赛道/主题关键词>" "/Users/janetmao/Library/Mobile Documents/com~apple~CloudDocs/Claude-cowork/brain/index.md"`,命中则读对应 `brain/wiki/<concept>.md` 概念页,在分析中引用("Janet's brain: 你的 current view 认为…")。收集目标:

1. **产品与需求**:主要产品(形态、核心功能、给谁用、怎么收费);解决什么需求(谁的痛、有多痛、painkiller 还是 vitamin、现在怎么解决、现有解法缺陷)。
2. **Unique 之处**:官网声称的差异化 vs 你独立判断的真实差异化,分开记。
3. **市场机会**:引用第三方 TAM(标来源)即可;市场增长与结构性拐点;竞品格局(直接竞品 2–4 家、在位巨头、本公司的位置)。**不做估值测算(用户 2026-09-03 裁定)**:radar 不再做 bottom-up TAM 建模、估值合理性/倍数分析——深度定量工作归 startup-deepdive;融资表中的估值数字仅作事实记录,轮次间隔信号照常分析。
4. **创始团队**:每位创始人单独小传(教育、职业轨迹、上一段经历、founder-market fit 具体证据);团队完整性(技术/产品/分销三种能力是否配齐)。
5. **融资历史**:轮次、金额、投资方、时间;**重点看轮次间隔**(拉长=红旗,压缩=资本市场强共识)。
6. **Traction 信号**:用户数、增长率、知名客户、收入量级(找不到标 unverified)。

## Step 2 — 三方分析(过程重于结论)
读取本 skill 目录下的框架文档:
- `frameworks/yc.md`、`frameworks/a16z.md`、`frameworks/sequoia.md` — 三个 persona 的评估宪法(各含"AI 时代补充原则"段,评估 AI 公司时必须叠加使用)
- `frameworks/debate-protocol.md` — 辩论流程
- `frameworks/shared-resources.md` — 跨框架共享工具(NFX 网络效应分级、BVP 基准、SaaStr 等);[Framework] 段可引用以加强论证,须标注来源机构,verdict 仍从各家清单得出

**关键要求**:每个 persona 必须逐条走完自己框架中的评估清单(YC 6 项、a16z 7 项、Sequoia 9 项),每一项写三段式推理(英文):
- **[Facts]** 本公司对应的具体事实(来自 Step 1,没有就写 unknown)
- **[Framework]** 该 persona 框架里适用的原则
- **[Judgment]** Strong / Medium / Weak / Unknown,加一句为什么

verdict(Positive/Skeptical/Negative)必须从逐项判断中自然得出,并附总评说明哪几项权重最大。禁止跳过清单直接给结论。然后按 debate-protocol 执行交叉反驳与回应。

**引用规则(必须执行)**:
1. 分析开始前,先搜一次 `"<公司名>" YC OR a16z OR Sequoia`,检查三家是否真的公开评论过、投资过或收录过这家公司(如 YC batch 页面、a16z 投资公告)。有 → 必须引用原链接并在分析中明确区分"该机构的真实观点"与"persona 的框架推演";无 → 在 Section 2 开头放一条 Sourcing note:说明三家均无公开评论/投资(若竞对轮次由谁领投,顺带注明),以下观点为各家公开框架的应用。
2. **[Facts] 中来自公开来源的事实必须带 inline markdown 链接**(新闻报道、App Store、Crunchbase/Tracxn、市场报告、公司官网/博客)。
3. **[Framework] 引用的原则链接到框架原文**(各 frameworks/*.md 文末有 canonical source URL 列表)。
4. 用户提供的一手信息(现场见闻)不需要链接,但标注 "(user's first-hand note)"。


## Step 3 — 写入 Obsidian(默认,主档案;2026-08-18 起 vault 为正本,2026-10-08 确认 Obsidian 为主存储)
把完整档案写成 markdown 文件放进 vault:
- 路径:`/Users/janetmao/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/Startup Radar/<公司名>.md`
- **语言(用户 2026-08-03 裁定):英文为主,中文只做少量辅助**(她要练英文)——含 求职相关/联系人 等小节;个别关键提醒可留一句中文。
- **定位(用户 2026-08-03 最终裁定):内容完整、排版全素。** 分析内容必须完整(三方逐维度打分、辩论、判断点都要);她要的"简单"只指**排版**。
- **格式红线**:不要 YAML frontmatter;不要 emoji(🟢🟧 等全部不要,打分直接写字 Strong/Medium/Weak/Unknown);不要斜体;不要 callout/columns/折叠块;加粗基本不用。只用:`#` 大标题、开头一段 `>` 引言、纯 `##` 章节、`-` 列表、`1.` 编号、表格、辩论用普通 `>` 引用。观感对齐 CPG finance primer。
- 结构模板(参照现有 7 份,如 Confido.md):
  1. `# <公司名> — Startup Radar (YYYY-MM-DD)`
  2. `>` 引言两行:one-line product description in English;`Verdict: X. YC ... · a16z ... · Sequoia ....`(若已同步 Notion,行末加 `[Notion](url)`)
  3. `TL;DR:` 普通段落
  4. `## 1. Company overview`(product/unique/signals 表格/team/funding/gaps)
  5. `## 2. Three-firm analysis`(每家:维度 bullet "维度 — Strong/Medium/Weak. 一句理由" + "Verdict: ..." 收尾行)
  6. `## 3. Debate transcript`(`>` 引用)
  7. `## 4. Synthesis & insight`(Consensus/Key disagreement/Overall/判断点编号列表)
  8. `## 5. Questions to ask the founders`
  9. (Overall ≥ Worth following 时)`## 6. Networking plan`(见 Step 3.7:Events 表 + People 表,英文,注明检索日期)
  10. (如适用)`## 7. Job-hunt notes`(英文为主:application status / talking points / cautions;关键提醒可留一句中文)
  11. (如已查到)`## 联系人`(创始人/高管表格:人/职位/邮箱/置信度/LinkedIn;来源 Hunter.io 或公开搜索,推测邮箱必须明确标注;同时在 `_Radar Index.md` 的「联系人总表」加行)
  12. `## 8. 动态`(follow-up 时间线,无则"(暂无)")
- 提及其他已建档公司时用 `[[wikilink]]`(实用,不算花哨)。
- **子页面约定(2026-08-03)**:公司只有主档案时,md 平铺在 `Startup Radar/` 根目录;一旦产生附属材料(面试预习 primer、深挖笔记等),建 `Startup Radar/<公司名>/` 文件夹,把主档案和附属材料一起移进去(Obsidian wikilink 按文件名解析,移动不断链)。现有示例:`Confido/`(Confido.md + CPG finance primer.md)。
- 同步更新 `_Radar Index.md`:表格加一行 + 如有新的跨档案模式补进"跨档案模式"区。
- Follow-up log 更新(见维护)也要双写到镜像文件。
- **Obsidian 是唯一事实源**。写完后核对文件已落盘并告诉用户路径;若同时按 Step 3.6 同步了 Notion,两边不一致以 Obsidian 为准。
- 原 Notion 属性对应:Overall / Stage / Sector / Met at / Added / Status 不再作为属性字段,体现在 `_Radar Index.md` 的表格行(结论、阶段、一句话)和档案开头的 Verdict 引言;Overall 为 Strong interest 或 Worth following 时在索引里标注"Follow up"。

## Step 3.6 — 同步 Notion(可选:仅当用户明确要求"也放 Notion"时执行;默认跳过)
以 Step 3 的 Obsidian 档案为内容来源,转成 Notion Markdown 后写入:
用 notion-create-pages 写入,parent 为 data_source_id `879e37d6-75ce-4396-8781-7dcebe9b6e08`(Startup Radar 数据库,URL: https://app.notion.com/p/f21c1039d9a542eca37ec379e5044298)。**页面属性值和正文全部用英文。不给页面设置 icon(用户偏好:页面/数据库一律无图标,保持列表整洁;正文内的 emoji 小节图标保留)。**

属性(严格用这些字段名):
- `Name`:公司名
- `Website`:URL
- `One-liner`:一句话说清产品(business-card test 的答案)
- `Sector`:JSON 数组,选项 AI apps / AI infra / Fintech / Legal / Healthcare / Consumer / Enterprise SaaS / Dev tools(可新增)
- `YC` / `a16z` / `Sequoia`:Positive / Skeptical / Negative
- `Overall`:Strong interest / Worth following / Watch / Pass
- `Status`:默认 Evaluated;Overall 为 Strong interest 或 Worth following 时设为 Follow up
- `Stage`:Pre-seed / Seed / Series A / Series B+ / Unknown
- `Met at`:遇见场合(英文)
- `date:Added:start`:今天,ISO 格式

页面正文结构(Notion Markdown,英文)。**排版要求:像网页一样"先扫后钻"**。以下高级语法已实测可用,严格照抄格式(写错会渲染成字面文本):
- **Callout**:`<callout icon="📌">` + 内容(独立成行,可多行)+ `</callout>`。标签必须独占块级位置,不能内联在文字后面;color 属性会被忽略,靠 icon 传达语义。
- **折叠块**:`▶ 标题文字` 一行,后续内容行以两个空格缩进;内部可放多行文本和表格。不支持标题级折叠(`## ▶` 无效)。
- **三分栏**:`<columns>` / `<column>` 各自独占一行,栏内容独立成行。
- **彩色文字**:`<span color="blue">text</span>` 可用,谨慎使用。
- 其余照常:表格(带 Source 列)、`---` 分隔、`>` 引用块、emoji 小节图标、红绿灯 🟢 Strong / 🟡 Medium / 🔴 Weak / ⚪ Unknown / 🔶 Medium-weak。

```
<callout icon="📌">TL;DR — one-liner · **Overall: <rating>** · 三方 verdict · 一句话点出核心争议</callout>
(如有同名歧义,再加 <callout icon="⚠️">Identity check</callout>)

## ⚖️ Verdict scorecard
<columns> 三栏,每栏:**🟧 YC — <emoji> Verdict** + 斜体一句定调 </columns>
---
## 🏢 1. Company overview
### 📦 Product & the need it serves
### ✨ What's unique        (claimed vs. independent judgment)
### 🌍 Market opportunity   (数据表:Signal | Number | Source;第三方 TAM 引用即可,不做 bottom-up 建模)
### 👥 Founding team
### 💰 Funding history & traction   (轮次表:Round | Amount·valuation | When | Lead | Source;注明轮次间隔)
### 🕳️ Information gaps
---
## 🧠 2. Three-firm analysis
<callout icon="📚">Sourcing note(见引用规则)+ 红绿灯图例</callout>
### 🟧 YC Partner — walking the 6-item checklist
每项一个折叠块:`▶ N. Dimension — <红绿灯> Judgment`,内部缩进三行 **[Facts]**(带链接)/ **[Framework]**(带原文链接)/ **[Judgment]**
<callout icon="<verdict红绿灯>">**Verdict: X** — weighting summary</callout>
### 🟪 a16z GP — 7 项,同上
### 🟩 Sequoia Partner — 9 项,同上
---
## 🥊 3. Debate transcript   (每条发言一个 > 引用块,标注发言方和轮次)
---
## 💡 4. Synthesis & insight
Consensus / Key disagreement
<callout icon="🏁">**Overall: <rating>** — reason</callout>
**🎯 Decisive judgment points**(2–3 条,同类公司先查什么)
**📚 Takeaways**(2–3 条)
---
## ❓ 5. Questions to ask the founders next time
## 🤝 6. Networking plan   (仅 Overall ≥ Worth following 的公司;见 Step 3.7。Events 表 + People 表)
## 📝 Follow-up log
```



## Step 3.7 — Networking 行动包(2026-09-03 用户新增)
**背景**:用户裁定"光参加 event 没有目标已经不行了",networking 必须带着"认识这家公司的人"的目的。
**触发条件**:Overall 为 Strong interest 或 Worth following 时必做;其他评级跳过(用户点名要时例外)。

1. **公司相关湾区活动**:搜索该公司未来 ~6 周在湾区(SF 优先)出现的线下活动——公司主办的 meetup/launch party、创始人/高管的演讲(conference speaker 页、播客线下场)、公司赞助或 demo 的活动。渠道:Luma(luma.com,搜公司名/创始人名)、Eventbrite、公司官网/blog、公司与创始人的 X / LinkedIn 动态、行业会议 agenda 页。每条记:活动名 / 日期 / 地点 / 该公司谁会出现 / 报名链接。查不到就明说,并给替代路径(该公司常出没的社区或赛道高频活动),不要硬凑。
2. **LinkedIn coffee-chat 名单**:用 WebSearch(`site:linkedin.com/in "<公司名>"` 及变体)找 3–6 个可约 coffee chat 的人。优先级:USC/Marshall 校友 > 与用户目标岗位相邻的人(BizOps / Strategy / Finance / GTM)> 早期员工;公司越早期越直接列 founder 本人。每人记:姓名 / 职位 / LinkedIn URL / 为什么是好切入点 / 一句破冰开场(引用本档案的具体分析观点,体现做过功课)。只用公开搜索结果;不登录、不抓取、不代发消息。
3. **写入**:Obsidian 档案加 `## 6. Networking plan` 段(英文,events 表 + people 表,注明检索日期;若已同步 Notion 则同步更新);对话摘要给中文精简版。后续用户说"更新 XX 的 networking"时重跑本步并更新该段。
4. **与 sf-ai-events 协同**:发现的 SF 市内活动值得去时,提示用户可加入 sf-ai-events 的周扫描关注。

## Step 4 — 回复用户
在对话里给出摘要(用用户的语言),结构:一句话产品 → 三方各自的**核心推理链**(每家 2–3 句,讲清"从哪个事实、按哪条原则、推出什么",不是只报 verdict)→ 综合评级 → 本案决定性判断点 → networking 行动包精简版(如触发了 Step 3.7:最近的活动 + 最值得约的 1–2 人)→ Obsidian 档案路径。

## 维护
- 用户说"更新 XX 的 follow up"时:搜该公司最新动态,以 `**YYYY-MM-DD**: <summary + source link>`(英文)追加到 Obsidian 档案的 `## 8. 动态` 段(若已同步 Notion,同步追加到其 "Follow-up log"),并更新 `_Radar Index.md` 里该公司的行。
- 用户对某个 persona 的判断风格不满时,直接修改对应 frameworks/*.md——框架文档就是配置。
