---
name: podcast-dig
description: 挖掘 podcast 里关于某家 startup 或某个赛道的采访/分析素材,提取完整 transcript 落入 Obsidian vault 供用户自己阅读。触发:"/podcast-dig <公司|赛道>"、"帮我挖 X 的播客"、"podcast 里搜一下 X"。产出不是 summary——是按信息密度排好序的 episode 清单 + 清洗后的全文 transcript(带时间戳) + 荧光笔式 highlight(观点/数字/反共识,带 ★ 要害条目),按公司建 folder 管理。与 startup-deepdive 分工:本 skill 是素材供给层,deepdive 可引用其产出。
---

# Podcast Dig:播客素材挖掘 → Obsidian

**产品目标**:用户要**自己阅读**创始人和 VC 的原话——语气、迟疑、脱口而出的数字都是信息。因此**绝对不做 summary**,只做四件事:**找全** episode、**排好序**告诉用户先读哪集为什么、给出可读的全文 transcript、用荧光笔**精准**标出值得注意的句子。

**核心路径**(硬编码,勿询问):

- Vault:`/Users/janetmao/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain`
- 素材根目录:`<vault>/Podcast Research/`
- 数据池:`<vault>/Podcast Research/podcast-pool.json`(Obsidian 插件 podcast-dig 与本 skill 共用;写入前先读,合并勿覆盖)
- 脚本:`~/.claude/skills/podcast-dig/scripts/`——`discover.py`(三路发现)、`hl_audit.py`(荧光笔审计)、`vtt_to_md.py`(字幕转换)
- 节目名单:`~/.claude/skills/podcast-dig/references/sources.md`(人读)+ `sources.json`(脚本读)。名单不是"搜索范围",是"必须逐个扫描的保底集合";名单外的节目靠 iTunes 全库搜索和 YouTube 兜住。

## 流程

### 0. 订阅集补抓模式

用户说"抓这集 transcript:<节目> — <集标题>"(通常从插件里复制来的)时,走精简流程:该集**已在 pool.json 里**(status: listed,带 audio_url)——按节目+标题定位它,跳过 Discovery 与排序,直接:获取 transcript(优先 YouTube 搜同名视频抓字幕,或节目官网)→ 清洗 → highlight → 审计 → 写文件到 `Podcast Research/<节目名,去掉 |#^[] 等非法字符>/<YYYY-MM> <节目简称> - <嘉宾>.md` → **原地更新**该 episode 的 transcript_file / transcript_source / status="fetched" / guest / content_start_sec / density,不要新建 folder 或重复条目。

### 1. Discovery:三路并扫,给覆盖报告

**目标是"找全",不是"找到几集"。** 靠记忆列节目名去 WebSearch 会系统性漏掉名单外的中小节目(Granola 一例:记忆式搜索找到 3 集,iTunes 全库一次搜出 10+ 集)。所以:

1. 先读 pool.json,已 fetched 的 episode 跳过(脚本会标"已有")。
2. 确定检索词:公司名 + **创始人全名**(两个词以上;单姓会引来噪音,如 "Pedregal" → 墨西哥乐队)+ 如公司名有歧义(Granola / Cursor / Notion / Linear)则补 `--context` 领域词(如 `meeting notes`、`fintech`)。
3. 跑脚本(在 scratchpad 里):
   ```bash
   python3 ~/.claude/skills/podcast-dig/scripts/discover.py "<公司>" --alias "<创始人全名>" [--alias "<联创全名>"] [--context "<领域词>"] --since <成立年-01-01> --pool "<vault>/Podcast Research/podcast-pool.json" --out candidates.json
   ```
   三条通道:**iTunes 全库 episode 搜索**(US+CN store,覆盖名单外节目,自带 mp3/feed/描述/时长)→ **名单节目 RSS 全文扫描**(覆盖 iTunes 搜不到的老集、中文节目、描述里才提到公司的集)→ **YouTube 搜索**(只在 YouTube 的访谈、会议演讲、公司自己的 fireside)。脚本已排除赞助商口播(Lenny's 的 "Granola" 命中 13 条里 12 条是广告)和无语境词的歧义命中。iTunes 限速严格,脚本串行慢跑,整个过程 2–4 分钟,等它。
4. 脚本输出的覆盖报告(扫了几个通道、名单 N 个节目 RSS 扫了几个、哪些失败、丢弃多少歧义命中)**原样写进聊天回报和索引文件尾部**——用户要知道"没找到"是"扫过没有"还是"没扫"。RSS 失败的节目要么重试要么在报告里点名。
5. WebSearch 只做脚本够不着的补充:公司官网/博客里的 podcast 出镜列表("<公司> podcast appearances")、创始人 X/LinkedIn 置顶、会议演讲(AI Engineer、Stripe Sessions、YC、Sequoia Ascent)、中文节目在小宇宙的集(张小珺 / 硅谷101 / OnBoard! / 42章经——iTunes 对中文节目覆盖不稳,名单里有 feed 的靠 RSS,没有的手搜小宇宙)、以及**文字端对冲**(The Information / Platformer / Newcomer 的独立报道,索引里单列,不进 pool)。
6. 每个候选记录:节目、嘉宾、日期、时长、YouTube 链接、原始页链接、mp3、**IR 标记**(节目属于这家公司的投资方 → `ir_flag: true`;名单 `ir_of` 字段 + 融资信息判断)。
7. **名单维护**:发现一个名单外的节目有 S/A 级的集(见排序),在回报里提一句"建议加入名单",用户点头就在 sources.md + sources.json 各加一行(name / apple_id / feed_url / tier / lang / rigor / transcript / ir_of)。
8. **赛道降级**:公司名直接命中 <2 集时(Seed/A 轮常见),自动切换赛道模式——以"赛道关键词 + 该公司投资人姓名/机构"再跑一次脚本,folder 命名 `赛道 - <Topic>`,索引里注明"公司本身无直接素材,以下为赛道与投资人观点"。

### 2. 排序:抓取前打分分层,抓取后按密度重排

**用户的时间是最稀缺资源。候选清单必须回答"先读哪集、为什么、哪些可跳"**,而不是把所有集平铺。

**抓取前评分(score_pre,0–10,靠元数据+描述)**:

| 维度 | 分 | 判据 |
|---|---|---|
| 嘉宾身份 | 0–3 | 公司创始人/CEO/CTO 3;其他高管或早期员工 2;投资人或直接竞品创始人谈这家公司 1.5;记者/分析师/旁观者 1;无嘉宾的新闻播报 0 |
| 访谈焦点 | 0–3 | 整集专访(标题含公司或创始人)3;一个 ≥15 分钟的 segment 2;顺带提到(仅描述命中)≤1 |
| 主持人追问力 | 0–2 | 名单 `rigor` 值(2=会追问数字、会反驳;1=常规;0.5=捧场/IR 口吻);名单外默认 1 |
| 形式时长 | 0–1 | 1:1 长谈 ≥45 分钟 1;25–45 分钟 0.5;<20 分钟或多人新闻圆桌 0 |
| 时效 | 0–1 | 距最近一轮融资/关键产品发布 12 个月内 1;更早 0.5;pivot 之前的旧叙事 0 |
| 扣分 | −1 各 | IR 渠道(投资方自家节目)−1;**press tour 重复**(同一嘉宾同月上多档节目讲同一套)只保留时长最长/追问最强的一集满分,其余 −1 并注明"重复,只看 ★" |

**名单分级必须实测,不许凭名气(用户 2026-10-04 的教训:The Logan Bartlett Show 被列为 S 级并当面推荐为"查 AI 公司大概率命中",实际已停更 387 天、163 集里纯 AI 原生创始人只有 6 位——用户差点、且已经在小红书把它当"最常听"推荐出去)**:
- 向用户**介绍或推荐**任何一档节目、或回答"这档节目采访过谁/好在哪"之前,先拉它的 RSS(sources.json 的 `feed_url`)看实际节目单:最近一集日期、近 12 个月集数、嘉宾构成。只说得出"印象"时要明说是印象。
- **停更超过 6 个月的节目不得在 S/A**;近 12 个月 0 集 → 降到 B 并在备注写明停更日期和实测日期(sources.json 加 `last_episode` / `verified`)。
- S 级的"覆盖宽"必须有证据:近 24 个月里目标类型嘉宾(如 AI 创业公司创始人)的集数占比。占比低的节目即使主持人追问力强,也只能进 A/B,并在备注写清它真正适合什么(例:"规模化公司 CEO 的经营与低谷,不是早期 AI startup")。
- 每次运行 discover.py 时顺带看覆盖报告里各节目的最新集日期,发现停更就当场改名单并在回报里告诉用户。

**时效硬规则(用户 2026-10-03:"podcast 两年甚至以上的就不用显示了,信息早已过时,除非信息密度真的特别大")**:发布日期早于"今天 − 24 个月"的集**默认不显示**——不抓、不进阅读计划、★ 不进汇总、deepdive 不引用;只在索引末尾「归档(超过两年)」表里留一行(集名/日期/为什么不保留)。已抓的旧集不删文件,frontmatter 改 `read_depth: 跳过` + `archived: true`,pool.json 同步 `archived: true`。**例外(必须写明理由才能保留为"只读★")**:score_post ≥ 9,或含有别处找不到的公司专属数字/创始决策(例如唯一一次讲清早期 cohort、pivot 经过),且这些内容没有被之后的集覆盖。"投资人投资前的闲聊""被后来的集讲得更完整"都不算例外。满 22 个月的集在索引里标"将于 YYYY-MM 满两年"。

**定位时间线豁免本规则(用户 2026-10-04 裁定)**:归档针对的是"过时的事实"(数字、产品状态、竞争格局),而定位时间线看的是"当时公司怎么说自己"——旧自述是弧线的起点,越早越有用。所以:归档集里的 `[定位]` 条目**照常标注、照常进定位时间线和 highlights.json**(行上带 `archived: true`,时间线里注明"归档集,仅用于时间线"),deepdive 的 positioning-historian 可以引用;但它们仍然不进 ★ 汇总、不进阅读计划、不作为当前事实被其他维度引用。归档集若是投资方渠道(如领投方合伙人自己的节目),时间线里要写明是谁在说。

**必读入口(用户 2026-10-03 问"必听的星标在哪里")**:索引文件第 2 节之前必须有一屏「★ 必读星标」——从全部 ★ 里再挑 **15–20 条**,按「怎么定义公司/vision → 用户怎么来 → 数字 → 怎么回应挑战 → 其他高管」分组,每条带可点时间戳。这是用户打开 folder 第一眼要看到的东西;全量 ★ 汇总放它后面。每次新抓/补抓后**必须重写索引**——索引过期(抓了 8 集索引只列 3 集)等于星标不存在。

分层:**S ≥8 / A 6–7.9 / B 4–5.9 / C <4**。默认抓 S+A(上限 5 集,超出按分数截);B 列出不抓;C 不进清单(回报里给一句"另有 N 条低价值命中已过滤")。每个 S/A 候选附**一句理由**("唯一一集 CEO 谈留存数字"、"投资方节目但有 cohort 数据")——理由比分数重要。

**抓取后重排(score_post)**:transcript 到手后按真实信息密度重排——有效 highlight 数/千词、公司专属数字个数、反共识/自我修正次数、**新增信息量**(这集的 ★ 条目有几条是别的集没有的)。索引文件里给**阅读顺序**:`1. <集> — 理由`,并把"重复度高、只读 ★"的集排到后面。pool.json 写 `rank`(S/A/B/C)、`score_pre`、`score_post`、`density`。

**阅读预算(用户 2026-10-03 提出:人的精力有限,Granola 一家就 20 集 / 12 小时音频)**:抓取对 agent 很便宜,瓶颈是用户的阅读时间,所以**抓取范围和阅读深度分开定**:

- 抓取:S+A 全抓,但**单次运行抓取上限 8 集**(含已抓;每集一个 subagent 清洗 1–1.5 万词,超出就慢且贵),超出的 A 级按分数列为"只读★ 待抓",用户说一声再补。B 抓不抓看预算富余(默认不抓)。
- 阅读深度三档,写进每集 frontmatter `read_depth` 与索引:**精读**(全文)/ **只读★**(只看 5–8 条要害)/ **跳过**(列出不抓或抓了也不推荐读)。
- 预算输入:`/podcast-dig <公司> --budget 3h` 或口头"我只有两小时"。精读按每集 45 分钟折算,从 score_post 最高往下装满预算,装不下的降为只读★;**没给预算默认 3 小时 ≈ 4 集精读**。
- **press tour 去重要狠**:同一嘉宾同一叙事时期(以融资轮/大版本为界)的多集只留一集精读,其余一律只读★,索引注明"与 <集> 同期重复"。不同嘉宾(联创/高管/投资人)算不同声音,各自可精读。
- **★ 跨集去重**:汇总时同一事实/同一数字只保留最早或最完整的一处,其余集的 ★ 换成该集独有的内容。

**呈现**:聊天里给表格(排名/分/节目/嘉宾/日期/时长/IR/阅读深度/一句理由),让用户挑。用户说"全要"或事先授权("直接抓")则按排名顺序抓 S+A 不等待。

### 3. 获取 transcript(优先级从高到低)

1. **官方全文页**:Invest Like the Best → joincolossus.com;Acquired → acquired.fm / podcasts.happyscribe.com/acquired;Sequoia Training Data → sequoiacap.com episode 页;Latent Space → latent.space;MAD → mattturck.com;AI & I → every.to;Lenny's → GitHub repo `LennysNewsletter/lennys-newsletterpodcastdata`;其余见 sources.md 的 `transcript` 列。官方 transcript 有标点和说话人,质量最高。
2. **LexiAI 语料库(已转写过的直接用,同一集绝不转两次)**:LexiAI 的 "Heard in podcasts" 用本地 Whisper 转写了大量 RSS 音频(`~/lexiai/podcast/data/corpus.db`),逐句时间戳与 pool 里的 `audio_url` 完全对齐。
   `python3 scripts/from_lexiai.py lookup --show "<show>" --title "<episode_title>" --audio-url "<audio_url>" > raw.md`——exit 0 即得 `[mm:ss]` 段落(与 vtt_to_md.py 同格式),exit 2 = 没有。`transcript_source: whisper-local`。批量抓之前可先跑 `python3 scripts/from_lexiai.py scan --pool "<vault>/Podcast Research/podcast-pool.json"` 看哪些 listed 的集 LexiAI 已经有了。
3. **YouTube 人工字幕**:`yt-dlp --skip-download --write-subs --sub-langs en <url>`
4. **LexiAI 本地 Whisper 转写(有 `audio_url` 时优先于 YouTube 自动字幕)**:`python3 scripts/from_lexiai.py transcribe --show "<show>" --title "<episode_title>" --audio-url "<audio_url>" > raw.md`——约 2 分钟/小时音频,有标点、时间戳对齐插件播放的音频(YouTube 字幕的时间戳是视频的,和 RSS 音频常因广告差几十秒);转完同时进入 LexiAI 语料库。`transcript_source: whisper-local`。
5. **YouTube 自动字幕**(没有 `audio_url` 时的兜底):`yt-dlp --skip-download --write-auto-subs --sub-langs en <url>`,然后 `python3 scripts/vtt_to_md.py <vtt> > raw.md` 得到带时间戳的段落。注意 20VC 官网只有 highlights 没有全文,有 `audio_url` 就走第 4 步,否则走 YouTube。
6. 都失败(如 Core Memory 无字幕又无音频直链、官方页无 transcript):**不要用片段冒充全文**——把该集留在 listed,索引里注明"无可用 transcript,建议听音频 + 只记 show notes",不要生成 1500 词配 60 条 highlight 的假文件。

### 4. 清洗(整理不改写)

- 自动字幕:合并碎句为自然段、恢复标点、尽力标注说话人(`**Host:**` / `**<Guest>:**`);**只排版,一个词都不许替换或删减**。
- **时间戳规则(播放跟随的精度取决于此)**:每个段落开头必须有 `[mm:ss]`,取该段第一句在原始字幕里的 cue 时间;**每次说话人切换必开新段并带新时间戳**;同一说话人的长发言按 ≤30 秒切段,各段用各自的真实 cue 时间——绝不允许相邻段落共用同一个时间戳(审计脚本会数)。
- 官方 transcript 基本无需清洗,保留原说话人标签。
- whisper-local(LexiAI)已有标点,无说话人标签:按内容尽力标注说话人并在说话人切换处开新段,时间戳取该段第一句的时间(raw.md 段内句子本就按真实时间排列);文件头注明"本地 whisper large-v3-turbo 转录"。
- **正文起点标记(插件"⏩ Skip intro"按钮靠它跳转)**:找到主持人与嘉宾**开始实质对话的第一段**——冷开场金句拼贴(Lenny's 式 teaser)、节目片头、赞助商口播、主持人介绍嘉宾履历的独白、"欢迎来到节目"之前的寒暄,全部算 intro。在该段**前一行**单独写 `<!-- content-start -->`(上下各留空行),并把该段的时间戳写进 frontmatter `content_start: "mm:ss"` 与 pool.json `content_start_sec`(整数秒)。官方 transcript 没有时间戳时只放标记,`content_start: null`。一集只放一个标记;中途插播的广告不标(靠 highlight 稀疏自然略过)。正文从第一段就开始(无片头)的集,标记放在第一段前,若音频本身也无片头则两者都省略。

### 5. Highlight:荧光笔要切中要害,不是摘金句

用 Obsidian 语法 `==...==`。**每一条都必须通过 payload 测试,否则不划**:

**Payload 测试**——这句话里至少有一样"换一家公司就不成立"的东西:
- **数字带指代**:ARR/增速/留存/客户数/团队规模/融资/定价/转化,且划进去的子句要包含**指代对象和时间**("we were at $2M ARR last March",不是光划 "two million")。
- **专有名词**:具体客户、竞品、模型、人名、事件("my Twitter DMs became a support channel for CEOs of big tech companies")。
- **可证伪的判断**:有主语有谓语有方向("X will/won't…"、"the mistake everyone makes is…"、"it's not A, it's B")。
- **决策与转折**:做过的选择、杀掉的东西、pivot 的时点("we spent six months on the wrong thing until…"、"we decided not to store audio")。
- **反共识 / 自我修正**:推翻自己、反驳主持人、承认失败、"everyone laughed at us"。
- **定位自述**(类型标签 `[定位]`,用户 2026-10-04 要求——deepdive 要靠它画战略定位时间线):说话人定义"公司是什么 / 为谁做 / 要去哪 / 明确不做什么 / 怎么看对手和大模型厂商"的句子("Granola is not about meeting notes, it's a tool for thought"、"be best in the world at anything meeting-adjacent")。**每集凡有定位自述必须划到并标 `[定位]`,不受预算挤压**——单看一条可能像口号,但跨时间排起来就是公司战略怎么变的证据。投资人、主持人对公司的定位描述同样标 `[定位]`(speaker 字段会区分是谁说的)。

**不划的**:寒暄、履历背景、产品功能罗列、主持人的提问(例外:主持人自己给出数据或反驳)、**普适金句**("moats are discovered not designed"、"build what people want"——换家公司照样成立 → 不划;嘉宾的标志性框架且是本集论点的,最多作为一条 ★)。

**最小跨度**:只划承载 payload 的子句,典型 ≤25 词,硬上限 30 词;一条 highlight 不跨句号超过一次;绝不划整段。

**预算**:正文每千词 2–4 条(60 分钟访谈 ≈ 25–45 条),上限 5/千词。两遍法:第一遍标候选,第二遍对每条问"**删掉这条,读者会漏掉哪个事实?**"——答不出来就删。密度均匀不是目标,信息密集的 10 分钟可以密,闲聊的 10 分钟可以零。

**★ 要害条目**:从通过预算的 highlight 里挑 **5–8 条**标 ★——标准是"只读这几条,也能说出本集关于这家公司的核心事实与最锋利的判断"。★ 优先给:公司专属数字、创始人推翻外界叙事的话、决策转折点。

**数字兜底检查**:grep 正文里所有数字,凡与这家公司直接相关的(收入/用户/团队/融资/定价/留存/时间线)必须都已划到——漏一个数字比多划三条金句更糟。

**审计门槛(必跑)**:
```bash
python3 ~/.claude/skills/podcast-dig/scripts/hl_audit.py "<vault>/Podcast Research/<folder>/<file>.md"
```
FAIL 必须修到 PASS/WARN 才算完成;WARN 里"空心疑似"列出的每条逐一处理(保留要能说出 payload,否则删);"★ 缺失 / 相邻段同时间戳 / 索引无时间戳"全部修掉。审计结果(密度、条数、★ 数)写进回报。

### 5.5 解析音频源(供 Obsidian 插件播放)

discover.py 的 iTunes/RSS 通道已自带 `audio_url`(mp3 直链)、`feed_url`、`duration_min`、`image_url`(封面)、描述——直接写入 pool.json(`audio_url` / `feed_url` / `duration_sec` / `image_url` / `summary`(取描述前 300 字))。只对 YouTube-only 的候选做手动解析:

1. iTunes Lookup 拿节目 RSS:`curl -s "https://itunes.apple.com/lookup?id=<Apple Podcast 节目 id>"` 取 `feedUrl`(或 `itunes.apple.com/search?term=<节目名>&entity=podcast`;**串行,间隔 ≥1.5s,否则 403**)。
2. 抓 RSS,按标题匹配该集 `<item>`,取 `<enclosure url>` 与 `<itunes:duration>`。
3. 拿不到就留 null(插件会回退到 YouTube iframe 或纯阅读)。

### 6. 写入 vault

**目录**:每家公司一个 folder:`Podcast Research/<Company>/`;赛道模式:`Podcast Research/赛道 - <Topic>/`。

**单集文件**:`<YYYY-MM> <节目简称> - <嘉宾>.md`,结构:

```markdown
---
show: Invest Like the Best
episode: "<集标题>"
guest: <嘉宾 (头衔, 公司)>
date: YYYY-MM-DD
company: <公司>
youtube: <url 或 null>
audio: <podcast enclosure url 或 null>
source_page: <官方页 url>
transcript_source: official | youtube-manual | youtube-auto
content_start: "01:34"   # 正文第一段的时间戳;无时间戳的官方稿写 null
rank: S            # S/A/B/C(抓取后重排的层级)
read_depth: 精读    # 精读 | 只读★ | 跳过
score_pre: 8.5
score_post: 9
density: 3.1       # highlight / 千词
ir_flag: false
added_by: claude-search
tags: [podcast, <company-slug>]
---

# <集标题>

> [!info] <节目> · <日期> · <嘉宾> · 排名 <S/A> · 密度 <n>/千词 · ★<n>(IR 标记则加一行警示:本节目属投资方渠道,多头立场;press tour 重复集加一行:与 <集> 重复度高,建议只读 ★)

## 观点索引
<!-- 每条 = 文中某个 highlight 的原文摘句(可截短),按出现顺序,前缀时间戳(必须是 [mm:ss],不是章节名)。★ 条目加 ★ 前缀并在列表最上方重复一次。类型标签:[数字] [判断] [反共识] [决策] [专名] [定位]。这是荧光笔目录,不是 summary -->
### ★ 要害(只读这几条)
- ★ [12:34] [数字] ==原文摘句…==
- ★ [31:02] [反共识] ==原文摘句…==
- ★ [44:10] [定位] ==原文摘句…==

### 全部
- [03:09] [判断] ==原文摘句…==
- [12:34] [数字] ==原文摘句…==
- …

## Transcript
<!-- 完整正文,含 ==highlight== -->
[00:00] **Host:** (冷开场 / 片头 / 赞助商口播……)

<!-- content-start -->

[01:34] **Host:** Hey Chris, welcome.(实质对话第一段)
```

**索引文件**:`_<Company> 索引.md`——

1. 一段公司现状(融资/估值/投资方,用于判断 IR 与时效)。
2. **阅读计划**:先写预算与折算("预算 3h → 精读 4 集 + 只读★ 5 集 + 跳过 6 集"),再按 score_post 列 `1. [[文件]] — 精读/只读★ — 理由(这集独有什么;若同期重复则写与谁重复)`。
3. **★ 汇总(按时间线)**:`export_highlights.py` 输出的 ★ 列表原样贴入——所有集的要害合在一页(30–50 行),每行带说话人、节目、日期、可点的时间戳链接、所在文件。这是用户和 deepdive 的第一入口。
4. **定位时间线**(用户 2026-10-04:没时间逐集听和对比,要一眼看出"随着时间和大环境变化,公司的战略定位怎么变"):按时期分行的表——时期 | 外部环境(融资 / 对手与大模型厂商的动作 / 模型能力变化,尽量用 transcript 里出现的事实,靠记忆补的要注明未核实)| 公司怎么说自己([定位] 原话 + 说话人 + 可点时间戳)| 相对上一期的变化。表后写三句:什么始终没变、在扩张还是收窄、每次转向发生在外部事件之前还是之后。素材用 `export_highlights.py "<folder>" --positioning-md` 导出。只有一集素材时写"单点,无法成线"。
5. 已抓取 ✅ 表:集/节目/日期/时长/来源/排名/分/密度/★数/highlight 数/阅读深度。
6. 仅列出 📋 表(B 级与用户未选的 A 级):集/节目/日期/链接/分/一句理由;IR ⚠️ 标记。
7. 文字端补充(非 podcast,对冲创始人自述偏差)。
8. 尾部:生成时间、检索词、**覆盖报告原文**(通道/名单扫描数/失败/过滤数)、"另有 N 条 C 级命中已过滤"。

**导出(写完单集文件后必跑)**:
```bash
python3 ~/.claude/skills/podcast-dig/scripts/export_highlights.py "<vault>/Podcast Research/<Company>"
```
生成 `_<Company> highlights.json`(机器可读,见下节契约),stdout 的 ★ 汇总 markdown 贴进索引第 3 节。

**pool.json**:读取→合并→写回。schema:

```json
{
  "version": 1,
  "folders": [{"id": "granola", "name": "Granola", "type": "company|track", "created": "YYYY-MM-DD"}],
  "subscriptions": [],
  "episodes": [{
    "id": "<show-slug>-<yyyymmdd>-<guest-slug>", "folder": "granola",
    "show": "…", "episode_title": "…", "guest": "…", "date": "…",
    "audio_url": null, "feed_url": null, "duration_sec": null, "image_url": null, "summary": "…",
    "youtube_url": "…", "source_page": "…",
    "added_by": "claude-search|manual", "ir_flag": false,
    "transcript_file": "Podcast Research/Granola/….md",
    "transcript_source": "official|youtube-manual|youtube-auto",
    "content_start_sec": 94,
    "rank": "S|A|B|C", "score_pre": 8.5, "score_post": 9, "density": 3.1,
    "status": "fetched|listed"
  }]
}
```

插件只读它认识的字段(id/show/episode_title/guest/date/audio_url/feed_url/duration_sec/image_url/summary/youtube_url/source_page/transcript_file/content_start_sec/status/folder/folders/ir_flag),rank/score/density 是本 skill 自用,安全。`subscriptions` 字段留给插件(用户手动订阅的节目 RSS),本 skill 只追加不删改。

**多归属(插件 ≥0.9.8)**:`folder` 是主归属,`folders: [...]` 补充其余归属,插件在每个 folder 视图里都显示该集。赛道/公司模式下若某集来自已订阅的节目(pool 里 `type: subscription` 且 `name` 与 `show` 相同),**必须**把该订阅的 folder id 写进 `folders`,让它同时留在原节目栏下——不要只改 `folder` 把它从订阅里"搬走"。

### 7. 并行化

多集抓取时每集派一个 subagent(fetch → 清洗 → highlight → **跑 hl_audit.py 修到非 FAIL** → 直接 Write 进 vault,回报密度/条数/★ 数/content_start),主会话做抓取后重排、写索引与 pool。单集 transcript 约 1–1.5 万词,agent 输出预算要留足。subagent 的 prompt 里必须原文带上第 5 节的 payload 测试、预算与 ★ 规则——这是最容易退化成"均匀撒 60 条金句"的环节。

## 交接给 startup-deepdive(用户 2026-10-03 要求:挖出来的数据要能给 deep dive 深度分析用)

契约文件:`<vault>/Podcast Research/<Company>/_<Company> highlights.json`。deepdive 在 Step 0 检查它是否存在,存在就把路径塞进 team / product / data-hound / expert-scout 的 prompt,让它们**先读这个再去搜**。字段:

- `episodes[]`:file / show / guest / date / rank / score_post / density / youtube / audio / ir_flag / transcript_source / read_depth
- `highlights[]`:quote(原话)/ star / type([数字][判断][反共识][决策][专名][定位])/ ts / sec / speaker / **question(这句话在回答什么——引语前最近一段别人的话,通常是主持人提问)/ paragraph(引语所在整段,限定语和迟疑都在里面)/ next(紧随其后的一段)** / show / guest / date / file / link(YouTube 带 &t= 的可点链接)

**上下文是契约的一部分**(用户 2026-10-04:引用必须"上下文清晰")。一句"if we don't get better we're cooked"在"你最怕什么"和"你的优势是什么"两个问题下分量完全相反;紧挨着的"I don't have great answers""a little bit better"往往比被引的那句更有信息量。下游(deepdive 的 writing-standard.md)被要求读 question / paragraph / next / date 而不是只读 quote,所以清洗时**主持人的提问必须完整保留并正确标注说话人**——说话人标错,question 字段就会取错。`type: 定位` 的行按 date 排序即是 positioning-historian 的主素材。

下游引用格式:`"<原话>" — <speaker>, <show>, <date>, [mm:ss](<link>)`。数字类 ★ 直接进 data-hound 的公开数据表(置信度 = 创始人自述);反共识/判断类进 expert-scout;决策类进 team / product。deepdive 若发现该公司没有 highlights.json,且公司是重点研究对象,先跑 `/podcast-dig <公司>` 再开 wave 1——不要让 expert-scout 自己零散抓字幕重复劳动。

## 语言规则

Transcript 保持英文原文(一个词不改);frontmatter 值、索引表头、警示语、理由用中文;与用户对话用中文。

## 收尾

回报格式:覆盖报告一行(通道/名单扫描数/失败)→ 排名表(抓了哪几集、各自排名与一句理由)→ 每集 highlight 数、★ 数、密度、正文起点时间、审计状态 → vault 内路径 → 哪些候选仅列出未抓(含分数,用户可追加)→ 建议加入名单的节目(如有)。不在聊天里复述 transcript 内容。
