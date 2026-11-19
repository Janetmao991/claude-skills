---
name: tech-deepdive
description: 拆解一家公司的技术实现,并用白话教会用户——产出技术报告(Obsidian)+ 可交互 HTML 讲解页 + 拟物 3D 讲解视频(等距微缩世界画风,中文配音+字幕)。触发:"/tech-deepdive <公司>"、"讲讲 XX 的技术实现"、"XX 技术上是怎么做的"、"给 XX 做技术拆解/技术 deep dive"、"XX 的技术架构做成视频"。与 startup-deepdive 分工:deepdive 管团队/产品/市场/竞争/风险(商业尽调),本 skill 专管"它是怎么造出来的"——每一层用了什么、为什么这么选、代价是什么、护城河在哪层;优先复用 deepdive 文件夹已有资料。用户是自学 AI builder,目标是借公司案例学技术,所以讲解比结论重要。
---

# Tech Deep Dive:把一家公司的技术实现讲透

**产品目标**:用户分析完一家公司的产品和战略后,技术实现这块是盲区。本 skill 以公司为切入口,把它的技术栈按"一场请求/一份数据在系统里走过的路"拆成若干层,每层用白话讲清楚,最后落到投资判断(技术护城河在哪层)和可迁移的架构模式。

**首个范例**:Granola(2026-10-16/17)。全部产出在 `/Users/janetmao/Technical Analysis/Granola/`,报告镜像在 vault `Startup Deepdive/Granola/90-tech.md`。新公司照它的结构做,质量对齐它。

**语言规则**:报告、HTML、视频都用中文白话,英文术语保留并在首次出现时注释(用户以后读英文资料会碰到)。

## 产出与路径
每家公司一个文件夹 `/Users/janetmao/Technical Analysis/<公司>/`:
- `<公司> — Tech Deep Dive.md` —— 主报告;同时复制到 vault `Startup Deepdive/<公司>/90-tech.md`(该文件夹存在时)
- `research/` —— 研究 agent 的英文底稿(带证据标签)
- `<slug>-tech.html` —— 交互讲解页,发布为私人 Artifact
- `video/` —— HyperFrames 项目;**定稿成片放 `~/Technical Analysis/成片-技术拆解/<公司>-技术拆解-中文.mp4`**（Janet 2026-11-09：每个视频 skill 一个固定的成片文件夹，所有公司的定稿都放这一个地方，不要散在各项目里；这个文件夹里的东西不删不移）

## Step 0 — 复用已有资料
1. 看 vault `Startup Deepdive/<公司>/` 是否存在:读 `20-product.md`、`70-sustainability.md` 里技术相关段落(grep 关键词,不要整读),`Resources/` 里的播客转写 grep 技术词(transcri/model/infra/latency/API/stack/eval 等)。
2. 没有 deepdive 时先问用户要不要先跑 `/startup-deepdive`;用户说不用就直接做,产品背景自己补一段。
3. **先定"层"**:根据公司类型画出数据流(Granola 是:客户端→采集→转写→LLM 生成→检索→平台)。不同类型参考 `references/layer-maps.md`。层数 4–7。

## Step 1 — 并行研究(2 个 agent,后台)
按 `references/research-briefs.md` 的两份模板派 agent:**A = 客户端/采集/数据入口层**,**B = AI/后端/平台/安全/成本层**。要求:每条结论标 confirmed / inferred / assumption,带链接,写英文底稿到 scratchpad,只回 ≤10 行摘要。高价值来源:官方 security/trust 页的 **subprocessor 列表**(直接点名供应商)、docs、招聘帖(技术栈)、创始人播客、HN、安全公告/漏洞披露、逆向工程博客;用户电脑装了该 App 时可以检查安装包(只看文件名/配置/字符串,**绝不读用户数据**)。
**两份底稿有冲突时,回原始出处核对再写**(Granola 案例:一个 agent 把创始人"最贵的是转写"读反了)。

## Step 2 — 写报告
结构见 `references/report-template.md`:TL;DR(一句话判断)→ 全景数据流图 → 每层固定四段式【要解决的问题 → 怎么做的 → 白话解释关键概念 → 为什么这么选/代价】→ 安全事件(从架构解释成因)→ 单位成本估算 → 每层可复制性表(回到投资视角,呼应 deepdive 的 moat 判断)→ 可带走的通用架构模式 → 术语表 → 未知项 → Sources。证据标签 ✅/🔍/❓。

## Step 3 — HTML 讲解页
以 `templates/granola-tech.html` 为蓝本(先 Artifact quickstart,遵守 artifact 页面规范):可点击的分层流水线图、每层四段式卡片、至少一个"让概念动起来"的交互(Granola 是笔记补全切换 + 双声道波形)、成本计算器(带"关键开关"看成本变化)、可搜索术语表。发布为私人 artifact,把链接给用户。

## Step 4 — 拟物讲解视频(重头戏)
用户明确要求:**拟物讲解**——用现实物体比喻技术机制(管子、工厂、通行证、图书管理员、USB…),不是把 HTML 画成视频。画风已定:**等距微缩世界**(Three.js 正交等距相机、陶土质感、柔光阴影)。配音:**微软 edge-tts `zh-CN-XiaoxiaoNeural`**(用户否掉了 ElevenLabs 英语声音读中文的口音,要纯正普通话)。完整流水线见 `references/video-pipeline.md`,模板代码在 `templates/video/`。要点:
1. 每层一段旁白 `build/vo/sNN.txt`(开场 + 各层 + 安全 + 成本 + 结尾,总长 5–7 分钟,约 5.2 字/秒),每段先想好**拟物比喻**再写词。
2. `build/voice.py` 批量配音 + 逐词时间戳 → `timeline.json`;`build/assemble.py` 生成 index.html / 注册表;`build/font.sh` 子集化字体(新增中文必须重跑)。
3. 先自己做一个参考场景定画风(新公司先做 15–25 秒样片给用户确认,用户点头再铺开),然后写 SCENE_GUIDE + 每场景视觉 brief,**同一条消息并行派 3–4 个 agent**,每个 2–3 场景,各用独立 snapshot 目录。
4. 收回后逐场看 contact sheet,统一修;`npx hyperframes check` → 渲染 → ffprobe 验音视频轨 → SendUserFile。

**配音花钱的规则(Janet 2026-11-10)**:这个 skill 用的 edge-tts 是免费的,改稿阶段可以随便重配。如果以后换成付费声音(MiniMax / ElevenLabs),按 ai-term-explainer `SKILL.md` 硬规则第一条:改稿阶段用免费占位声音,用户确认稿子不再改才用付费声音配一次,付费配音的缓存留到成片确认后再清。

## Step 4.5 — 收尾清理(必做,不用再问)
Janet 2026-11-09:只留最后的成片,前面的版本和无关的工具及时删掉,不然文件太多她找不到定稿。
- **制作中**:新渲染出来、确认能播,上一版就放进废纸篓,不攒 v1/v2/v3。用户正在对比的两版先留着,选完再删落选的。
- **用户确认成片后**:把最终成片移到 `~/Technical Analysis/成片-技术拆解/`,`video/renders/` 清空;清掉样片、旧版 mp4、各 agent 的 snapshot 目录、contact sheet、配音中间产物、预览缓存、这一期临时写的一次性脚本、试过没用上的工具和素材、scratch 备份。
- **一律保留**:最终成片、主报告、`research/` 底稿、HTML 讲解页、旁白稿 `build/vo/*.txt`、场景代码和 `build/` 里的流水线脚本。
- 用 Finder 放进废纸篓(可恢复),不要 `rm`、不清空废纸篓。清完告诉用户清了什么、多大。

## Step 5 — 回复用户
中文:一句话技术判断 → 每层最关键的一个发现 → 护城河在哪层 → 3 条可带走的模式 → 文件路径 + artifact 链接 + 视频。提醒用户更新项目 CLAUDE.md 的 Current status 并开新会话。

## 维护
- 用户对画风/声音/结构的新裁定写进本文件对应步骤(带日期)。
- 模板改进(kit.js 新零件等)回写到 `templates/video/`,下一家公司直接受益。
