---
name: startup-deepdive
description: 对一家 startup 做深度评估(multi-agent 尽调,非估值)。触发:用户说 "/startup-deepdive <公司>"、"深入研究/好好研究一下 XX"、"给 XX 做个深评/尽调/deep dive"、"这家公司到底怎么样(要详细分析)"。与 startup-radar 分工:radar 是 event 场景的快评建档(三 persona 辩论),本 skill 是对重点公司的完整研究——团队、产品详解(解决什么问题/目标客户)、uniqueness、市场 TAM、竞品分析、ARR 等全部公开数据、VC 与行业大咖的真实观点(文章+视频转录)、大模型进化下的 sustainability 压力测试、一句话总结。每个维度一个专职 agent 并行研究,成果落地为本地文件夹里的分维度文件 + 综合报告(英文 + 中文版,范例 Clay);Kami deck 只在用户开口要时做;用户开口要时再做小红书图文版「拆解周刊」。用户要"深入/详细/完整"研究某家公司时用本 skill,不要用 radar 也不要裸答。用户说"做一期拆解周刊 / 把 XX 做成周刊 / 小红书图文"时也用本 skill(公司已有深评则直接从 Step 3.6 开始)。
---

# Startup Deep Dive:多 agent 深度评估

**产品目标**:帮用户对真正感兴趣的公司建立完整、可追溯的研究档案,并通过阅读逐维度的分析过程培养投资 insight。分析过程比结论重要,来源比断言重要。

**与 startup-radar 的关系**:radar 管"该不该关注"(快评);本 skill 管"值得关注之后的完整研究"。radar 已有档案时复用其事实,不重复劳动。本 skill 不做估值(估值模块暂存于 `references/valuation/`,当前流程不使用)。

**语言规则**:所有落地文件用英文;和用户对话用用户当前语言(通常中文)。

## 输入
- 必需:公司名或官网 URL。
- 可选:用户的一手信息(demo 见闻、创始人交流内容)——优先级高于公开信息,标注 "(user's first-hand note)"。

## 工作文件夹(核心机制)
每家公司一个文件夹,直接落在 Obsidian vault(用户 2026-08-26 裁定,iCloud 同步、手机可看):
`/Users/janetmao/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/Startup Deepdive/<公司名>/`

每个研究 agent **直接把完整成果写成该文件夹里的一个文件**,只向编排者返回 ≤10 行的要点摘要。这样做的原因:单个 agent 的上下文塞满全部维度的搜索结果后推理质量会退化;文件落地让每个 agent 只装自己那一摊,编排者保持轻量,中间稿可检查、可手改、可单独重跑。

**Vault 排版(所有文件,写进每个 agent 的 prompt)**:英文为主(小白解析的中文术语注释保留)。**排版要好读,鼓励善用 Obsidian 语法**(用户 2026-08-26 明确:排版丰富是好事;radar 镜像的"全素"裁定不适用于本管线):目标是"先扫后钻"的网页感——文件开头用 Obsidian callout 放 TL;DR(如 `> [!tip] TL;DR`,callout 类型:tip/warning/danger/quote 等);红绿灯 🟢🟡🔴、红旗 🚩 等 emoji 信号照常用;数据表带 Source 列;关键数字加粗;公司间互链用 `[[wikilink]]`。不用 YAML frontmatter(保持文件开头即正文)。

```
startup-deepdive/<公司名>/
├── 00-explainer.md   (小白解析:先读这个)
├── 10-team.md            ├── 50-data.md
├── 20-product.md         ├── 60-expert-views.md
├── 30-market.md          ├── 70-sustainability.md
├── 40-competition.md     ├── 65-positioning.md  (战略定位时间线)
│                         ├── 80-risks.md
└── <公司名> — Deep Dive.md   (综合报告)
```

## Step 0 — 准备
1. 建工作文件夹(已存在则视为更新研究,保留旧文件,新文件覆盖写)。
2. 查 radar 档案:Notion "Startup Radar" 数据库(data_source_id `879e37d6-75ce-4396-8781-7dcebe9b6e08`)有该公司则读取,把已确认事实写进各 agent 的 prompt(标注 "from radar profile, <date>"),让它们做增量而非重复搜索。
3. 查 brain:`grep -i "<赛道关键词>" "/Users/janetmao/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/Brain/index.md"`(brain 正本在 Obsidian vault 的 Brain 文件夹,概念页在同目录 `wiki/`),命中读概念页,用户已有观点带入综合阶段。
4. **查 podcast-dig 素材**(用户 2026-10-03 要求两个 skill 打通):看 `/Users/janetmao/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/Podcast Research/<Company>/_<Company> highlights.json` 是否存在(也查 `赛道 - <Topic>` 文件夹)。存在 → 把路径写进 team-researcher / product-analyst / data-hound / expert-scout 的 prompt,要求它们**先读它再搜**,引用格式 `"<原话>" — <speaker>, <show>, <date>, [mm:ss](<link>)`,数字类 ★ 进 50-data 的公开数据表(置信度标"创始人自述"),反共识/判断类进 60-expert-views,决策类进 10-team / 20-product。不存在且公司是重点对象 → 先跑 `/podcast-dig <公司>`(默认预算即可)再开 wave 1;用户赶时间则跳过并在报告"Sources worked"里注明未挖播客。

## Step 1 — 第一波:6 个研究 agent 并行
用 Agent tool 在**同一条消息**里发出全部 6 个 general-purpose agent,**必须 `run_in_background: false`**(前台并行,结果一起返回)。绝不用后台模式——后台等待会让编排流程卡壳,这是实测教训。

先读 `references/dd-checklists.md`(各 agent 的详细核查清单,源自 Wall Street Prep / 主流 VC DD 框架的四大维度:团队/产品/商业模式/风险)。每个 agent 的 prompt 统一包含:公司名+官网、Step 0 已知事实、**该 agent 在 dd-checklists.md 中的整段 checklist(原文贴入)**、**`references/sources-playbook.md` 的路径(让它自己读,并按文件里标注的 owner 走自己负责的 source tier)**、输出文件的完整路径,以及通用纪律:****`references/writing-standard.md` 的路径(让它自己读——"把话说透"标准,用户 2026-10-04 定为最重要的规则之一:每个分析段落要定义关键词、每条引语要带上下文三件套(回答的是什么问题 / 前后一句说了什么 / 说话时公司处在什么阶段)、要说清这是必要还是充分条件以及反例、结尾落在可观察的指标上)**;全部英文;逐条走 checklist,查不到的条目明确写 unknown 绝不编造也绝不跳过;每条公开事实带 inline markdown 链接;文件末尾附 "Sources worked" 列表(试过哪些 tier、哪些空手);写完文件后只返回 ≤10 行要点摘要**。

**早期公司的信源纪律(用户 2026-10-02 提出,是报告的核心)**:公司越早,新闻搜索越没用。seed / A 轮公司的信息在 sources-playbook 的 Tier 1–4——Form D / Companies House、Wayback 上的定价与 logo 变化、招聘岗位、GitHub 与包下载量、Launch HN 与 Reddit 的真实用户声音、G2 评论、创始人播客——而不是 TechCrunch 和 Crunchbase。编排者在 spawn 前要提醒 agent 这一点;一份只引用新闻和数据库的早期公司报告视为没做研究。

| Agent | 写入 | 核心职责(细则见 dd-checklists.md) |
|---|---|---|
| team-researcher | 10-team.md | 创始人小传、领域专长、长期愿景一致性、技术+商业能力组合、团队凝聚力(共事历史/早期流失) |
| product-analyst | 20-product.md | 问题与目标客户、PMF 信号(organic 增长/口碑)、价值主张验证(mission-critical vs nice-to-have,用留存/churn 证据)、产品级护城河盘点(claimed vs real)、定价 |
| market-analyst | 30-market.md | 自底向上 TAM 与第三方口径分开、SAM/SOM、why-now 与市场 readiness 证据、venture-scale 测试 |
| competition-analyst | 40-competition.md | 竞品逐家对比、**同一套 moat 维度给本公司和竞品打分**(差异化不许真空断言)、在位者动作、替代方案、格局定位 |
| data-hound | 50-data.md | 全部公开数据(置信度分级)+ unit economics:毛利/LTV-CAC 线索、留存/NDR、经营杠杆(headcount vs 收入、人均收入) |
| expert-scout | 60-expert-views.md | 大咖对这家公司/赛道的真实观点(文章+视频转录),刻意找批评声音,没有就如实写明 |

## Step 2 — 第二波:4 个 agent 并行
第一波全部返回后,**同一条消息**前台并行 spawn 4 个 agent,prompt 附上第一波文件的**路径让它们自己读**:

1. **sustainability-analyst** → 70-sustainability.md:读 20/40/60,按 `references/model-evolution-test.md`(全文贴进 prompt)做"大模型持续进化下这个产品还成不成立"的压力测试。这是用户最关心的判断维度,必须给出明确结论而非两边下注。
2. **risk-analyst** → 80-risks.md:读全部第一波文件,按 dd-checklists.md 中 risk-analyst 段(原文贴入)盘点 timing / execution / product / regulatory / financing 五类风险,每条给 likelihood + severity + mitigants + 预警信号,并指出"哪一条风险落地会直接杀死公司"。模型进化风险归 sustainability,引用不重复。
3. **explainer-writer** → 00-explainer.md:**小白解析**(用户点名的标配产出)。读 20/30/40/50,按 dd-checklists.md 中 explainer-writer 段(原文贴入)+ `references/b2b-primer.md`(路径给它自己读)写成。口吻是"在对话里把一个不熟 to-B 的聪明朋友讲懂":逐层展开、每个术语首次出现即给中文注释、具体到"某公司 500 人 fintech 的合规经理为什么掏钱"这种场景、结尾给"只记三句话"。公司是 to-C 时本文件同样要写,只是术语层换成该赛道的行话。
4. **positioning-historian** → 65-positioning.md:**战略定位时间线**(用户 2026-10-04 点名的标配产出:"我没有那么多时间去一一听并且做对比…可以看出随着时间的迁移、大环境的变化,公司的战略定位发生了什么变化")。读 10/20/40/50/60 + podcast-dig 的 `_<Company> highlights.json`(按 `date` 排序,`type: 定位` 的行优先,连同 `question` / `paragraph` 上下文一起读),按 dd-checklists.md 中 positioning-historian 段(原文贴入)写成:一张按时期排的表(外部环境 | 公司怎么说自己,原话+日期+链接 | 目标用户 | 明说不做什么 | 相对上一期的变化 | 变化的可能原因 | 这次转向是落了地还是只是说法),加一段"这条弧线说明什么"——在收窄还是扩张、是主动还是被动(转向发生在外部事件之前还是之后)、环境下一步会逼出什么转向。没有播客素材时用 Wayback 的官网首页标语、融资稿自述、招聘 JD 重建,并注明证据薄。**时间线豁免两年归档规则**(用户 2026-10-04):`archived: true` 的 `[定位]` 行可以用作弧线起点,表里注明"归档",但不得从中引用数字或当前事实;报告其余部分仍不引用归档集。

## Step 3 — 综合报告(主循环自己写)
读齐 9 份维度文件 + `references/expert-frameworks.md`(大咖评估框架库,用其中的 lens 检视本案),写 `<公司名> — Deep Dive.md`,结构严格照 `references/report-template.md`(2026-10-02 用户确认的合并版:Contrary 11 段骨架 + 海外独角兽的 thesis-first 开头与 why-now/玩家分类 + Acquired 的 7 Powers 竞争打分 + Sacra 的数字纪律)。要求:
- **文风(用户 2026-10-02 裁定,优先级最高)**:综合报告是一篇 Contrary Research 式的公司 story,娓娓道来的散文体——事实本身带出判断,判断只在该出现的地方说一次。**不用 🟢🟡🔴🚩、不写行内置信度标签、不在正文点名框架("Helmer lens""Sacra discipline")、全文最多两张表(7 Powers 表 + 一张关键数字表)**,其余包括风险图和 bull/bear 都写成句子。第一版 Granola 报告因为"处处都是评判的痕迹、读不下去"被打回,第二版(2026-10-02 rev 2)是第一个过关的范例。维度文件不受此限,可以继续密集、带标签。
- **图表(用户 2026-10-02):数字能画的要画。** 融资与估值步进、份额/traction 随时间 vs 竞品、人数序列(创始人口径 vs LinkedIn 口径)、ARR 未披露时的三法估算区间带,必要时 TAM/定价时间线——用 Kami 风格 SVG(宣纸底、墨蓝单强调色、衬线标注、确认数据实线/估算虚线、图内带来源行)生成到公司文件夹 `<company>-fig-<topic>.svg`,在正文讨论该数字处用 `![[...]]` 嵌入;先渲染成 PNG 目检再嵌入;deck 复用同一组 SVG。
- **创始人原声(用户 2026-10-02):必须大量引用 podcast-dig 素材。** 读 `Podcast Research/<Company>/_<Company> highlights.json`(★ 优先),至少在四处让创始人自己说话:怎么定义公司和 vision、第一批用户怎么来的、关于成本和数字的自述、面对挑战(在位者/大模型实验室/隐私/定价)的回应——原话 + 节目 + 日期 + 时间戳链接。创始人的话是 claim 不是 fact,引完要说证据怎么看。transcript 里常有网页搜不到的人(Granola 的 VP Sales 和 CTO 只出现在播客里),team-researcher 要用。
- **把话说透(用户 2026-10-04,与文风规则同级)**:照 `references/writing-standard.md`。综合报告里每一段带引语或带判断的话,落笔前先问"我到底在说什么":关键词(better / moat / sticky / context)在这家公司身上机械地指什么;这句引语回答的是什么问题、前后一句是什么、当时公司在什么阶段(读 highlights.json 的 `question` / `paragraph` / `next` / `date`,不要只读 `quote`;创始人的迟疑和限定语——"I don't have great answers""a little bit better"——不许删);这是必要条件还是充分条件、反例是谁;最后落在未来 6–12 个月能观察到的东西上。只排列引语、用"创始人早就想过这个问题"收尾的段落视为没写。写完全文后做一遍自检:逐段把引语遮住,看剩下的话有没有主张。文风规则不变——判断仍然只说一次、平静地说,但必须有,而且要有所指。
- **战略定位的变迁(用户 2026-10-04)**:§2b 用 65-positioning.md 写成一段叙事 + 一张时间线图(`<company>-fig-positioning.svg`,横轴时间,上方是外部事件:模型发布/对手动作/融资,下方是公司每个时期的一句自述原话),让读者不用听完所有播客也能看出定位怎么随环境变。§0 的 bet 和 §7 的 verdict 必须和这条弧线对得上:如果公司的野心在收窄,bet 要说清楚我们押的是收窄后的版本还是原来的版本。
- 开头就是**一句话总结公司业务**(business-card test),紧接着 **§0 The bet**:3–4 段散文,每段一个判断——我们相信什么、靠什么证据、什么会让我们改主意——最后一段是 kill risk 和概率;先下注,再给证据;§9 末尾用一段话回看 §0,说明哪几条被证据加强或削弱;
- §3 市场先讲 why now 和玩家分类再给 TAM;§4 竞争必须有 7 Powers 打分表(本公司 + 前两名对手,每格 has/building/none + 证据);
- 每个维度不是复制粘贴分维度文件,而是提炼+交叉(比如 data 里的 ARR 增速要放到 competition 的格局里解读);
- bull / bear 写成等行数的双栏表,bear 栏要像一个想 pass 这个 deal 的人写的,不是 bull 的补充说明;列出 information gaps(含哪些 source tier 没打通)、下次见创始人要问的问题;
- 用户 brain 里有相关观点时引用("Janet's brain: ...")并指出一致或冲突。

## Step 3.4 — 中文版商业分析(标配产出,用户 2026-11-12 裁定)
综合报告写完后,译写一份 `<公司名> — Deep Dive（中文）.md`,范例是 Clay 文件夹的同名文件:同样的章节(0 核心判断 → 11 给创始人的问题)、同样的 SVG 图、同样的引语链接;术语首次出现给中文注释;英文原话保留原文并附中文翻译;用 humanizer-zh 扫一遍去 AI 味。这是用户现在最想要的产出——"像 Clay 那样的商业分析"。

## Step 3.5 — Kami 展示 deck(**默认不做**,只在用户开口要时做;用户 2026-11-12 取消标配)
用户要 deck 时,调用 **kami skill**(slides-weasy-en 路径)把报告排版成 ~12 页展示 deck,落地为同文件夹的 `<公司名> — Deck.pdf` + `.html`。首个范例见 Temporal 文件夹的 `temporal-deep-dive-kami.*`,照它的结构做:封面 → 评分表(GREEN/AMBER 等宽标签,不用 emoji)→ 团队时间线 → 指标网格 → 2–4 张数据图 → 风险矩阵表 → Bull/Bear 双栏 → information gaps → 结论页。要点:
- 标题全部走 assertion(ghost deck test);数字类内容(融资节奏、TAM、竞品评分、估值分解)重绘为 Kami 风格 SVG——宣纸底、墨蓝 #1B365D 单强调色、暖灰配角、无渐变、衬线标注;传闻/未确认数据用灰色虚线区分。
- 跑完 kami 的检查链(placeholders / density / check-visual)并逐页目检;`.co` 结论行注意别压页脚(必要时 bottom 提到 17mm,Temporal 版已踩过这个坑)。
- 环境:WeasyPrint 走 Homebrew python3(pango 已装,2026-09-14 配好);PDF 渲染命令 `python3 -m weasyprint in.html out.pdf`。

## Step 3.6 — 拆解周刊：小红书图文（**只在用户开口要时做**，用户 2026-11-07 裁定）
深评流程默认不做这一步，跑完 Step 3.5 直接到 Step 4。用户说"做成周刊 / 小红书图文"时，把深评做成一期中文图文轮播（1080×1440，12–14 页），落地到 `~/Startup Business Analysis/<NN>-<company>/`。**这是全流程里唯一的中文落地文件**，语言规则对它豁免。
- 先读 `references/weekly-guide.md`（格式、页序、事实纪律、组件、检查清单、发布文案，全部是用户逐条定下的），再复制范例母版 `assets/weekly/example-clay/issue.html` 改内容；`~/Startup Business Analysis/render.sh` 不存在就从 `assets/weekly/render.sh` 复制。
- 封面用被拆公司的品牌风格，内页用 Atlantic 风格；第 2 页先讲公司做什么；必须有客户增长曲线和对手对比表。
- 事实只从本文件夹的维度文件和 podcast highlights 取，引语用原文；定稿前用 **humanizer-zh** 全篇扫一遍，再跑一遍逐条事实核对。
- 导出后拼联系表目检全部页，最后写 `post.md`。只保留最终版本。
- 定稿后复制一份进 Obsidian：`Startup Deepdive/<公司>/拆解周刊/`（PNG + post.md + 一篇按顺序嵌入全部图片的 `<公司> — 拆解周刊.md`），手机上能看。
- 用户只要周刊、不要重跑研究时（公司文件夹已存在），直接从这一步开始。

## Step 4 — 回复用户
中文摘要:一句话业务 → 各维度最重要的 1 个发现(不是全部复述)→ 战略定位这几年怎么变的(一两句:从什么到什么、被什么逼的)→ sustainability 压力测试结论 → bull/bear → 最值得追问创始人的 2–3 个问题 → 文件夹路径,并告诉用户中文版报告的路径(做了 deck 才发 PDF)。最后一句提一下:需要的话可以把这期做成小红书图文版「拆解周刊」。公司是 to-B 时,摘要本身也用小白讲法(参照当年 David AI 的对话式解析:逐层讲清"卖什么、谁掏钱、为什么"),并提醒:"完整小白解析在 00-explainer.md,建议先读它再读报告"。

## 维护与扩展
- 框架即配置:要加新的评估框架/大咖清单/攻击维度,改 `references/` 下对应文件即可,编排不用动。`references/expert-frameworks.md` 是持续生长的库——用户读到好的评估方法论时会让你补进去(也可经 brain skill 摄入后引用)。
- 用户说"更新 XX 的深评"时:只重跑有变化的维度 agent(通常 data-hound 和 expert-scout),其余文件保留,综合报告重写并在文末 `## Revision log` 记录。
- 上市竞对需要精确财务数据时,可由 competition-analyst 调用 equity-research CLI(`cd ~/equity-research && python3 cli/research.py <TICKER>`),仅限它调用,最多 2 个 ticker。
