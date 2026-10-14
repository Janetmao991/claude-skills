# DD Checklists per Agent

Source frameworks: Wall Street Prep DD framework + mainstream VC due-diligence checklists (four pillars: Team / Product / Business Model / Risk), merged with the skill's original research dimensions.

The orchestrator MUST paste the relevant section of this file verbatim into each agent's prompt. Agents work through their checklist item by item; an item with no findable evidence gets an explicit "unknown" line, never silence. Every claim needs a source link or a stated proxy.

**Sources:** every wave-1 agent also receives the path to `references/sources-playbook.md` and must work the tiers relevant to its dimension (the playbook names which tiers each agent owns). For early-stage companies with thin press coverage this is where the information actually comes from — Form D, Launch HN threads, job posts, GitHub, G2, Wayback diffs, founder podcasts — not news search. Each agent ends its file with a short "Sources worked" list: which tiers were tried, which yielded nothing.

---

## team-researcher (10-team.md)

- Founder bios: education, career trajectory, previous venture/exit, what they did immediately before this
- Domain expertise: years spent inside this exact problem space; did they live the pain themselves
- Long-term vision: what the founders say the company becomes in 10 years (interviews, essays, podcasts); is the framing consistent over time or does it pivot with each hype cycle
- Capability mix: technical + commercial coverage across the founding team — who builds, who sells; is either side missing
- Cohesion: how the co-founders met and how long they have worked together; prior collaborations; any co-founder departures or early key-employee turnover (LinkedIn checks)
- Key hires and gaps: notable senior hires (what their joining signals), and which critical roles are visibly unfilled
- Founder-market fit: concrete evidence, not vibes

## product-analyst (20-product.md)

- The problem: whose pain, how acute, painkiller vs vitamin; how it is solved today and what is wrong with that
- Target customer: specific persona/segment, not "everyone who..."
- Product: form factor, core workflows, how it is actually used
- PMF signals: organic/unpaid growth evidence, unprompted word-of-mouth (community chatter, social mentions, waitlists), usage intensity (DAU/WAU hints, session depth)
- Value proposition test: mission-critical or nice-to-have — verify with retention/churn evidence or proxies (renewals, seat expansion, "ripped out after pilot" stories); apply the disappears-tomorrow test: who would scream, and how loudly
- Product-level moat inventory, claimed vs independently judged, item by item: network effects / scale economies / proprietary tech / switching costs / brand — evidence for each
- Pricing and business model: how they charge, and whether pricing matches where the value lands
- B2B companies: additionally apply references/b2b-primer.md Part 1 — identify user vs champion vs economic buyer for this product, classify the GTM motion and check it matches the ACV, and place the product on the mission-critical spectrum (system of record / workflow tool / nice-to-have)

## market-analyst (30-market.md)

- Bottom-up TAM: target customer count × achievable ACV, every assumption on its own line — kept separate from third-party TAM reports
- SAM/SOM: what is realistically serviceable and winnable in 3–5 years
- Why now / timing: what changed (technology, cost curve, regulation, behavior) that makes this possible today; evidence the market is actually ready (adoption data, budget line items existing) vs the company being 3 years early
- Player taxonomy (海外独角兽 lens): split the category into 3–4 kinds of players (e.g. incumbents adding a feature / point-solution startups / in-house builds / horizontal platforms), one line each with 1–2 named examples, then state which kind the subject is and what that kind structurally wins and loses on
- Market growth rate and structural inflection points
- Venture-scale test: can this market plausibly produce a $1B+ revenue company

## competition-analyst (40-competition.md)

- Direct competitors (3–6): product, pricing, funding (who led), team size, observable traction — one row each
- Relative moat scoring — use Hamilton Helmer's 7 Powers as the grid (see expert-frameworks.md entry): scale economies / network effects / counter-positioning / switching costs / branding / cornered resource / process power. Score the subject AND the top 2 competitors on every row as **has / building / none**, with one line of evidence per cell. A row with no evidence is "none", not blank. Differentiation claims face comparison, not vacuum
- Playbook read (Acquired lens): what repeatable moves got the company here (distribution hack, pricing move, wedge-then-expand) and whether rivals can copy them
- Incumbents: what the big players in the adjacent space are shipping and whether it collides
- Substitutes: including "do nothing" and in-house builds
- Position verdict: where the subject actually sits in the landscape and on what axis it wins, if any
- Public-company competitors: may pull real financials via equity-research CLI (`cd ~/equity-research && python3 cli/research.py <TICKER>`), max 2 tickers

## data-hound (50-data.md)

- If a podcast-dig `_<Company> highlights.json` path was provided, harvest every `type: 数字` row into the public-data table first (confidence: founder self-reported; cite speaker/show/date + timestamp link), then reconcile against filings/third-party numbers.
- Revenue/ARR: every figure findable, each tagged confirmed / reported / rumored / estimated, with date and source
- Growth: YoY or sequential, or best proxy (round-interval compression, headcount growth, disclosed milestones)
- Funding history: round / amount / valuation / lead / date; round spacing called out (stretching = flag, compressing = strong market consensus)
- Users/customers: counts, named logos, expansion stories
- Unit economics: gross margin (reported or estimated — AI products: infer model-inference cost burden), LTV/CAC if any inputs exist, CAC payback hints
- Retention: churn/NDR figures or proxies (renewal announcements, cohort hints, seat expansion)
- Operating leverage: headcount over time vs revenue trajectory — revenue per employee, and whether the cost base looks fixed or scales with usage
- B2B companies: additionally apply the revenue-quality checklist in references/b2b-primer.md Part 1 §4 — recurring vs one-time mix, pilots-dressed-as-ARR check, NDR, logo vs revenue churn, concentration, services mix
- Everything in one table: metric | value | as-of date | source link | confidence
- Sacra discipline: a number without BOTH a date and a source does not go in the table. When two sources disagree, list both rows and say which you trust and why. Triangulate ARR from at least two independent signals (e.g. The Information leak + headcount × revenue/employee norm + pricing × customer count) before tagging anything above "reported"

## expert-scout (60-expert-views.md)

- If the orchestrator gave you a podcast-dig `_<Company> highlights.json` path, read it FIRST: every `star: true` row is a pre-vetted quote with speaker/show/date/timestamp link — cite them verbatim, then spend your search budget on what it lacks (critics, written views, Chinese coverage). Do not re-download subtitles for episodes already in that file.
- Named views on THIS company: investor memos, blog posts, podcasts, tweets, interviews — who said it (one-line identity), what they said, link
- Named views on the SECTOR: same discipline, clearly separated from company-specific views
- Videos: pull subtitles via `yt-dlp --write-auto-subs --skip-download <url>`, distill, link with timestamp if possible
- Contrarian/critical voices deliberately sought, not just cheerleaders — Hacker News launch/funding threads and Reddit are the fastest route to informed skeptics
- Chinese-language coverage: check 海外独角兽 via its mirrors (Foresight News column https://foresightnews.pro/column/detail/101, ChainCatcher https://www.chaincatcher.com/specialt/52 — WeChat itself is not searchable; a web-search miss does NOT mean they have not covered the company), plus 晚点 LatePost / 极客公园 / Founder Park / 42章经 / 硅谷101 / OnBoard! podcasts; cite as named views like any other source
- If no notable expert has commented: say so plainly; do not pad

## positioning-historian (65-positioning.md) — wave 2

Purpose: let a reader who has not listened to a single interview see how the company's strategic positioning moved over time and what in the environment moved it.

- Build the evidence list first, in date order. Primary: podcast-dig `_<Company> highlights.json` — rows with `type: 定位` (self-descriptions: what the company is, who it is for, where it is going, what it will not do), each read WITH its `question` / `paragraph` / `next` context. Secondary: Wayback Machine snapshots of the homepage hero line, `<title>`, pricing page and "about" at each funding round; funding-announcement self-descriptions; launch posts; job posts (what roles appear when); investor memos.
- Split the history into periods at real breakpoints: launch, each funding round, each major product launch, each incumbent/lab launch into the category, each model generation that changed what was possible.
- One table, one row per period: period | external environment (model releases, competitor moves, funding, regulation — dated, linked) | how the company described itself (verbatim, speaker, date, link with timestamp) | target user | what they said they would NOT do | change vs previous period | likely cause (your inference, marked as such) | did the shift land (shipped product, hires, pricing change) or is it only narrative so far.
- Cross-check voices in the same period: CEO vs co-founder vs sales/GTM lead vs investors. Where they describe the company differently, say so — it usually marks an unresolved internal question.
- Then the arc, in prose: (1) widening or narrowing — is the ambition growing or being cut to what is defensible; (2) proactive or reactive — did each shift come before or after the external event that would explain it; (3) what stayed constant through every period (that is the real identity); (4) what the current environment implies the next shift will be.
- If evidence for a period is thin (no interviews, only a homepage snapshot), say so in the row. Do not interpolate a narrative.
- **Archive exemption (user decision 2026-10-04):** podcast-dig hides episodes older than 24 months everywhere else because their *facts* are stale. This file is exempt — an old self-description is the starting point of the arc. Use `archived: true` rows that are typed 定位, mark them as archived in the table, and never lift a number or a current-state claim from them. If the archived source is an investor's own channel, say whose voice it is.
- Follow `references/writing-standard.md`: a shift in wording is evidence only when the context (question asked, date, stage) is carried with it.

## sustainability-analyst (70-sustainability.md) — wave 2

- Follow `references/model-evolution-test.md` end to end: classify (Wrapper/Workflow/System/Model company), run the four tests, deliver one verdict: Rides the wave / Race against the roadmap / Living on borrowed time
- Reads 20-product.md, 40-competition.md, 60-expert-views.md first; define "gets better with the model" mechanically for this company before using it (see model-evolution-test.md Step 2 test 1), and quote founders with the question and the hedges intact (writing-standard.md)

## explainer-writer (00-explainer.md) — wave 2

Audience: the user — smart, finance-literate, but NOT from an enterprise-software background. Voice: exactly like patiently walking a friend through it in conversation — build from zero, one layer at a time, anticipate the "但是为什么会有人为这个掏钱?" question at every step. Reads 20-product.md, 30-market.md, 40-competition.md, 50-data.md first. English body; every jargon term gets a 中文 gloss on first use (pull rows from references/b2b-primer.md Part 2 and add company-specific examples).

- What this company actually sells, in words a non-technical friend would understand — no category labels ("AI-powered workflow platform") without immediately unpacking them
- What the product is NOT: name the single most likely misconception a smart newcomer would form (e.g. mistaking reliability infra for a bug-finding tool) and correct it with a one-line analogy — learned from real user questions, this is where understanding actually breaks
- Why the underlying problem physically happens at all: don't just assert the pain ("servers crash"), enumerate its everyday causes so the reader feels it is routine, not rare — the frequency of the problem IS the size of the business
- For infrastructure companies: the build-vs-buy logic — why customers don't just build it themselves (difficulty, maintenance, economics), who the exceptions are, and how those exceptions connect to the risk file
- Who exactly pays: walk through a concrete named-role scenario ("a compliance manager at a 500-person fintech...") — user vs champion vs economic buyer for THIS product
- A day in the life, before vs after: what the buyer's team did without the product, what changes with it, where the saved time/money/risk actually shows up
- Why now / industry context: what is happening in this niche that a newcomer wouldn't know (incumbent tools, the standard workflow, what broke)
- How the money works for THIS company: pricing model, deal size, how a sale actually happens (self-serve? pilot then contract? enterprise procurement?) — each concept glossed
- Glossary: every term of art used anywhere in this deep dive, one table, English explanation + 中文一句话 + a this-company example where possible
- End with "the three things to remember": if the user retains only three sentences about this company, which three

## risk-analyst (80-risks.md) — wave 2

Reads all wave-1 files first. For each risk: likelihood (Low/Med/High) + severity + evidence + mitigants the company has + the early-warning signal to watch.

- Timing risk: is the market actually ready (pull from 30-market.md and stress it — what if adoption is 3 years slower)
- Execution risk: roadmap ambition vs team size and shipping velocity; GTM complexity (bottom-up vs enterprise sales motion vs the team's DNA); hiring pace vs plan
- Product risk: technical feasibility of the roadmap; dependency concentration (single model provider, platform/API dependence, key partnership); quality/reliability complaints in the wild — model-evolution risk itself belongs to 70-sustainability.md, reference it, don't duplicate it
- Regulatory risk: data privacy (GDPR/CCPA), sector-specific regulation (finance/health/legal), AI-specific regulation exposure (EU AI Act etc.), IP/copyright exposure of training data or outputs
- Financing risk: runway estimate (last raise + burn proxy), and whether the next round depends on milestones the data suggests are at risk
- Rank the top 3 risks and state which single risk kills the company if it lands
