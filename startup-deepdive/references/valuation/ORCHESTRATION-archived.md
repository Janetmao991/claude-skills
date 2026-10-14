---
name: startup-valuation
description: VC 视角给一家 startup 做完整估值(multi-agent deal team)。触发:用户说 "/startup-valuation <公司>"、"这家值多少钱"、"给 XX 做个估值"、"XX 按 $NB 融资贵不贵"、"这轮 terms 合理吗",或在 startup-radar 建档后想进一步量化。流程:判断公司阶段 → 并行派出研究 agent(公司事实包 / 市场规模 / 可比交易)→ 估值建模(早期用 Scorecard·Berkus·VC Method·可比轮次,成长期用 ARR 倍数·公开 comps·退出情景)→ Devil's Advocate 攻击假设并修订 → 合伙人视角综合出估值区间与 round terms 判断 → 写入 Obsidian 报告(英文、排版全素)。凡涉及"多少钱/贵不贵/估值/valuation/pricing a round"的 startup 问题都用本 skill,不要裸答。
---

# Startup Valuation:Deal Team 多 agent 估值

**定位**:startup-radar 回答"该不该聊/该不该关注"(定性),本 skill 回答"值多少钱、这轮贵不贵"(定量)。两者共享情报,互为补充。

**产品目标**:和 radar 一样,用户要通过反复阅读**分析过程**来培养投资 insight。所以每种估值方法都必须展示完整的假设表和推理链——数字怎么来的比数字本身重要。宁可过程长,不可过程省。

**语言规则**:Obsidian 报告一律英文;和用户对话用用户当前语言(通常中文)。

## 输入
- 必需:公司名或官网 URL。
- 可选:本轮 terms(在募多少、pre/post 报价)——有 terms 时最终要给出"贵/合理/便宜"的明确判断;没有 terms 时给出"如果现在融资,合理区间是多少"。
- 可选:用户的一手信息(demo 见闻、创始人透露的 ARR/增长等)。一手信息优先级高于网上搜到的,但在报告中标注 "(user's first-hand note)" 且默认 unverified。

## Step 0 — 情报复用与阶段判断
1. **查 radar 档案**:查询 Notion "Startup Radar" 数据库(data_source_id `879e37d6-75ce-4396-8781-7dcebe9b6e08`)是否已有该公司档案。有 → 读取,团队/产品/融资历史等定性事实直接复用,不重复搜索;在报告开头链接该档案。
2. **查 brain**:`grep -i "<赛道关键词>" "/Users/janetmao/Library/Mobile Documents/com~apple~CloudDocs/Claude-cowork/brain/index.md"`,命中则读对应概念页,把用户已有观点带入分析。
3. **判断阶段**(决定用哪套方法,读对应 reference):
   - Pre-seed / Seed / Series A → `references/early-stage-methods.md`
   - Series B 及以后、或 ARR 明显 >$10M → `references/growth-stage-methods.md`
   - 阶段模糊(如 A 轮但 ARR 已 $20M+)→ 两套都读,以收入法为主、早期法做交叉验证。

## Step 1 — 并行研究(3 个 agent 同时派出)
用 Agent tool 在**同一条消息里**并行 spawn 三个 general-purpose subagent(若环境没有 Agent tool,则按同样分工顺序执行)。每个 agent 的 prompt 必须包含:公司名与官网、Step 0 已知事实(避免重复搜索)、下述职责、以及统一要求——**所有公开事实必须附 inline markdown 链接,找不到的写 unknown 不要编造,返回结构化英文 markdown**。

1. **Fact Pack Analyst(公司事实包)**:产品与商业模式、定价、团队规模(LinkedIn/招聘页人数可作收入 proxy)、融资历史(轮次/金额/估值/投资方/时间,重点标注轮次间隔与 step-up)、traction 信号(用户数、ARR 传闻、知名客户、增速)。radar 档案已覆盖的部分只做增量更新(重点补最新一轮和收入信号)。
2. **Market Analyst(市场规模)**:自底向上 TAM(目标客户数 × 客单价,写出每个假设及来源)与第三方 TAM 报告分开列;SAM/SOM;市场增速与结构性拐点;该市场能否支撑 venture-scale 结局($1B+ 收入可能性)。
3. **Comps Researcher(可比交易)**:
   - 私募可比轮次:同赛道、同阶段、近 18 个月的 5–10 笔融资(公司/轮次/金额/估值/时间/领投方),算出中位数与区间;
   - 公开市场可比:找 2–3 家最接近的美股上市公司。**该公司是美股上市公司时,调用 equity-research 拉真实数据**:`cd ~/equity-research && python3 cli/research.py <TICKER>`,取 EV/Revenue、增速,标注 "(equity-research pull, <date>)";最多拉 2 个 ticker,注意 API 限额;
   - 若有已知的 M&A 或二级市场交易价,一并列出。

## Step 2 — Valuation Modeler(建模 agent)
三个研究 agent 返回后,spawn 一个 Modeler subagent,prompt 中喂入:三份研究输出全文 + 阶段判断 + 对应 reference 文件的完整内容(把文件内容贴进 prompt,subagent 看不到本 skill 目录)。要求:

- 早期公司跑齐 4 法:Comparable Rounds(主锚)、Scorecard、Berkus(现代化校准版)、VC Method;成长期跑齐 3 法:ARR/Revenue Multiple(主锚)、Public Comps 折价、Exit Scenario(bear/base/bull 概率加权)。
- **每种方法必须输出假设表**(assumption | value | source/reasoning),再给出该方法的估值区间。禁止只给结果。
- 汇总成 football field:各方法区间并排 + 加权后的 working range,说明权重理由。
- 有 round terms 时:计算 implied step-up、稀释比例、对照 working range 给初步判断。
- 数据缺口明确列出,并说明用了什么 proxy(如 headcount → 收入估算)及其误差方向。

## Step 3 — Devil's Advocate(对抗审查)
再 spawn 一个 subagent,喂入 Modeler 全部输出,角色设定:"你是投委会里专门否决 deal 的合伙人,你的绩效来自找出模型里最脆弱的假设"。要求它:
1. 找出 3–5 个最脆弱的假设,逐个说明:为什么可疑、如果错了估值往哪个方向偏多少;
2. 给出自己的 bear case 区间;
3. 指出模型里任何"为了凑出漂亮数字"的痕迹(如 TAM 取大、倍数取高、概率拍脑袋)。

主循环收到攻击后,**代表 Modeler 逐条回应**:接受的修订进 working range,不接受的写明反驳理由。这段攻防对话原文保留进报告(是全报告最有教育价值的部分)。

## Step 4 — 合伙人综合
主循环以 GP 视角收束,必须包含:
1. **Final range**(修订后)+ confidence(High/Medium/Low,取决于数据质量);
2. 有 terms → 明确判断:Overpriced / Fair / Attractive,以及"什么条件下这个价可以接受"(如 milestone、pro-rata 权利);
3. **What would change the number**:2–3 个最关键的待验证事实,每个写清"如果 X 则估值 ±Y%"——这是下次见创始人该问的问题;
4. 与 radar 档案定性结论的交叉验证:定性看好但定量贵(或反之)时,明确指出张力所在。

## Step 5 — Obsidian 报告
写入路径:`/Users/janetmao/Library/Mobile Documents/iCloud~md~obsidian/Documents/Janet's brain/Janet's AI Brain/Startup Radar/`

- 若 `Startup Radar/<公司名>.md` 或 `Startup Radar/<公司名>/` 已存在 → 用(或建)`Startup Radar/<公司名>/` 文件夹,把主档案移进去(wikilink 按文件名解析,移动不断链),估值报告存为 `<公司名>/<公司名> valuation.md`;
- 否则直接建 `Startup Radar/<公司名>/<公司名> valuation.md`;
- `_Radar Index.md` 中该公司行(有则)追加 `[[<公司名> valuation]]` 链接;无则不加行(index 归 radar 管)。

**格式红线(用户裁定,必须遵守)**:全英文;不要 YAML frontmatter;不要 emoji;不要斜体;不要 callout/折叠/分栏;加粗基本不用。只用 `#` 大标题、开头 `>` 引言、`##` 章节、列表、表格、攻防对话用 `>` 引用。报告结构严格照 `references/report-template.md`。

## Step 6 — 回复用户
对话中给中文摘要:一句话结论(区间 + terms 判断)→ 各方法的数字及**为什么不一样**(方法间分歧是信息,不是噪音)→ Devil's Advocate 最狠的一击及其后果 → what would change the number → 报告文件路径。

## 维护
- 用户对某种方法的参数不满(如"seed 中位数过时了")→ 直接改对应 references/*.md,reference 就是配置。
- 公司融了新一轮时,用户说"更新 XX 估值"→ 重跑 Step 1 的 Fact Pack 增量 + Step 2 起全流程,报告文末追加 `## Revision log`,保留旧 working range 供对照(预测复盘是最好的校准练习)。
