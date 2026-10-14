# B2B Evaluation Framework + Jargon Glossary

Two jobs: (1) give the analysis a complete framework for judging to-B companies — the user's background is not enterprise software, so the framework must be explicit, not assumed; (2) define the jargon so the explainer file (00-explainer.md) can gloss every term.

## Part 1 — How to judge a B2B startup

### 1. Who actually buys — the three-role split
In consumer products, user = buyer. In B2B they split into: the **user** (works in the product daily), the **champion** (the insider who wants it and sells it internally), and the **economic buyer** (owns the budget and signs). A B2B product can be loved by users and still die because no budget owner signs, or be bought top-down and hated by users (churns at renewal). Always identify all three roles for the company under evaluation, and which role the product wins first.

### 2. The GTM motion — and whether it matches the price point
| Motion | How it works | Typical ACV | Sales cycle |
|---|---|---|---|
| Self-serve / PLG | Users adopt free/cheap, company converts teams later | $0–10K | Days |
| Inside sales | Reps close deals over Zoom | $10–100K | Weeks–months |
| Enterprise (field) sales | Reps + solution engineers, procurement, security review, legal | $100K–$1M+ | 3–12 months |

The killer structural error: **ACV too low for the motion** — a $20K product that needs 6-month enterprise sales never covers its cost of selling. Check: does the deal size pay for the way it is sold? And does the founding team's DNA match the motion (technical founders default to PLG; enterprise sales needs someone who has carried a quota)?

### 3. Land and expand
The dominant modern B2B pattern: land small (one team, one use case, maybe a pilot), then expand (more seats, more departments, more products). Judge: is there a natural expansion path, and is there evidence of expansion actually happening (NDR > 110%, seat growth stories, "started with X team, now company-wide" case studies)? A product that lands but never expands is a tool, not a company.

### 4. Revenue quality checklist (Gurley's lens, B2B edition)
- Recurring subscription vs one-time projects/services — what fraction is truly recurring?
- NDR: below 100% = the installed base is shrinking; 110%+ = healthy; 130%+ = elite
- Logo churn vs revenue churn: losing many small logos may matter less than one big one
- Customer concentration: top-2 customers > 30% of revenue = fragile
- Pilots vs production: POCs and pilots are NOT revenue quality — how many pilots convert to annual contracts?
- Services mix: implementation/consulting revenue scales like a services firm, not software

### 5. Mission-critical test (B2B version)
Where does the product sit: **system of record** (holds the data everything else depends on — hardest to rip out), **workflow tool** (used daily but replaceable), or **nice-to-have analytics/reporting** (first budget cut in a downturn)? Whose budget pays — a revenue-generating department (sales, production) or a cost center? Products tied to revenue survive budget cuts; cost-center tools get squeezed.

### 6. B2B-specific moats
- Integration depth: wired into the customer's stack (SSO, ERP, data pipelines) = high switching cost
- Workflow lock-in: teams trained on it, processes built around it
- Compliance/security clearance: SOC 2, HIPAA, FedRAMP etc. are 6–18 month gates competitors must also pass
- Data accumulation: customer's historical data lives inside (system-of-record gravity)
- NOT moats: "our UI is nicer", a features list, being first

### 7. B2B red flags
- Revenue = a few pilots dressed up as ARR ("$1M ARR" that is 10 unconverted POCs)
- Founder-led sales that never hands off (can the product be sold by someone who isn't the founder?)
- Mismatch between logos on the website and actual paid production use
- "Enterprise-ready" claimed but no SOC 2, no security page, no procurement experience on the team
- Selling to startups only (startups churn and die; the segment feels easy but compounds badly)

## Part 2 — Glossary (gloss every term the reports use)

The explainer agent copies relevant rows into 00-explainer.md and adds company-specific examples. 中文注释 is part of the format — the user is learning the vocabulary.

| Term | Plain English | 中文一句话 |
|---|---|---|
| ARR / MRR | Annual/Monthly Recurring Revenue — subscription revenue annualized; excludes one-time fees | 年/月度经常性收入,只算订阅 |
| ACV | Annual Contract Value — average yearly value of one customer contract | 单个客户合同的年均价值 |
| TCV | Total Contract Value — full value across the contract's life (a 3-yr deal ≫ its ACV) | 合同全周期总价值 |
| NDR / NRR | Net Dollar/Revenue Retention — this year's revenue from last year's customers ÷ last year's; >100% means existing customers spend more over time | 老客户收入留存率,>100% 说明老客户越买越多 |
| Churn | Customers (logo churn) or revenue (revenue churn) lost per period | 流失率,分客户数口径和收入口径 |
| CAC / CAC payback | Customer Acquisition Cost; payback = months of gross profit to earn CAC back (<12 good, >24 flag) | 获客成本;回本月数 <12 优秀 |
| LTV | Lifetime Value — total gross profit expected from one customer | 单客户生命周期总毛利 |
| GTM | Go-To-Market — the whole strategy for how a product gets sold | 进入市场方式/销售打法 |
| PLG | Product-Led Growth — the product itself is the salesperson (Figma, Slack pattern) | 产品驱动增长,先用后买 |
| Sales-led / top-down | Sales team sells to executives first, users get it assigned | 销售驱动,自上而下签单 |
| AE / SDR | Account Executive (closes deals) / Sales Development Rep (books meetings) | 销售岗位:AE 签单,SDR 约会议 |
| Quota | The revenue target a salesperson must hit | 销售背的业绩指标 |
| POC / pilot | Proof of Concept — a paid or free trial before a real contract | 正式签约前的试点验证 |
| Design partner | Early customer who shapes the product in exchange for early access/pricing | 深度共创的早期客户 |
| Land and expand | Enter with a small deal, grow the account over time | 小单切入,逐步扩大 |
| Seat-based / usage-based | Pricing per user vs per consumption (API calls, hours) | 按人头 vs 按用量计费 |
| System of record | The database of truth for a business function (Salesforce for customers) | 某业务的"唯一事实源"系统,最难被替换 |
| SMB / mid-market / enterprise | Customer size tiers: <100 / 100–1000 / 1000+ employees (roughly) | 客户规模分层 |
| SOC 2 | The standard security audit enterprises require from vendors | 企业采购要求的安全合规认证 |
| SSO | Single Sign-On — company-wide login integration; an enterprise checklist item | 企业统一登录集成 |
| Procurement | The customer's internal purchasing process (security review, legal, negotiation) | 客户内部采购流程,企业单的主要耗时 |
| Champion | The person inside the customer who fights to buy your product | 客户内部替你推动采购的人 |
| Economic buyer | The person who owns the budget and signs | 掌预算、有签字权的人 |
| Logo | A customer company (as in "they have 50 logos") | 一个客户公司 |
| Burn multiple | Net cash burned ÷ net new ARR (<1.5 excellent, >3 flag) | 每新增 1 元 ARR 烧掉多少现金 |
| Runway | Months of cash left at current burn | 现金还能烧几个月 |
