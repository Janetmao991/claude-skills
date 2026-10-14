# Sources Playbook — where the information actually comes from

Purpose: the framework decides what questions to ask; this file decides where the answers live. Built 2026-10-02 after the user's question "for early-stage companies with little press, what sources exist beyond podcasts and VC posts?" Ordered by **how early a company can be and still leave this trace** — Tier 1 exists from day one, Tier 6 only once the company is famous. For a seed/Series A company, spend most effort in Tiers 1–4; Tier 6 is where news search lives and is the *least* useful for early companies.

Each wave-1 agent owns the tiers marked with its name. Agents log a "Sources worked" footer: tier tried → yielded / nothing / paywalled.

Legend: 🆓 free · 💲 paid or gated · 🇨🇳 Chinese-language

---

## Tier 1 — The company's own exhaust (exists from day one)
Owner: product-analyst (product/pricing), data-hound (hiring/customers), team-researcher (people)

| Source | What it tells you | How |
|---|---|---|
| 🆓 Website over time — **Wayback Machine** (web.archive.org) | Positioning pivots, pricing changes, logo additions/removals, headcount on the team page | Diff homepage + /pricing + /customers at 3–6 month intervals; a dropped logo is a churn signal |
| 🆓 Docs / changelog / release notes | Shipping velocity, where the roadmap is actually going (vs. the deck) | Count releases per month; note when "enterprise" features (SSO, audit logs, SOC2) appear = GTM moving upmarket |
| 🆓 Pricing page | Business model, ACV band, who the buyer is | Seat vs usage vs outcome pricing; presence of "Contact sales" tier = enterprise motion |
| 🆓 Careers page + LinkedIn Jobs + Wellfound + Ashby/Greenhouse/Lever boards | Headcount plan, GTM motion (first AE / SDR / solutions engineer hire = sales-led; DevRel = bottom-up), tech stack, geography, comp bands (where disclosed) | Snapshot roles weekly if updating; a sudden stop in hiring is a runway signal |
| 🆓 Customer case studies / logos page | Who champions it, which vertical, deployment scale | Named logos → check whether the customer's own blog/engineering post confirms it |
| 🆓 Status page / uptime, API docs, SDK repos | Infra maturity, whether it is mission-critical to anyone | Public incident history = real production customers |
| 🆓 Trademark (USPTO TESS), patents (Google Patents), domain WHOIS history | Product names in the pipeline, technical bets, founding date | Trademark filings often precede launches by 3–6 months |
| 🆓 **SEC Form D** (EDGAR full-text search) | US raises: amount offered/sold, date, sometimes investor count — before any press release | Search company legal name on efts.sec.gov; also catches unannounced rounds |
| 🆓 **UK Companies House** / EU registries / Canadian & Australian filings | For non-US companies: full cap table changes, share classes, director appointments, annual accounts | Companies House is the single richest free source for UK startups — SH01 forms show every share issuance |
| 🆓 App Store / Play Store listings + rankings (data.ai / Sensor Tower free tiers, Appfigures) | Consumer traction, review sentiment, release cadence | Rating trend + review complaints = product risk file |
| 🆓 SimilarWeb (free tier) / Semrush traffic estimates | Web traffic trend, geography, referral sources | Treat as ±30%; direction matters more than level |
| 🆓 BuiltWith / Wappalyzer | What the product is built on; which model providers (Anthropic/OpenAI endpoints) | Dependency concentration input for 80-risks |

## Tier 2 — Technical footprint (for anything with a developer surface)
Owner: product-analyst, sustainability-analyst (reads)

| Source | What it tells you | How |
|---|---|---|
| 🆓 **GitHub** org & repos | Stars velocity (star-history.com), contributors (employees vs community), issue response time, commit cadence, who the external contributors work for (= early adopters) | Issues tab is unfiltered customer feedback; closed-won deals show up as enterprise-flavored feature requests |
| 🆓 Package registries — PyPI (pypistats.org), npm (npmtrends), Docker Hub pulls, Hugging Face downloads | Actual developer adoption, not stars | Weekly downloads trend; compare to competitors on the same chart |
| 🆓 OpenRouter rankings, LMArena, Artificial Analysis | For model companies: real token share and quality position | Token share by app on OpenRouter also reveals which *apps* are growing |
| 🆓 arXiv / Google Scholar / Semantic Scholar | Team's research lineage, whether the "proprietary tech" is published (and therefore copyable) | Search founder names; citation counts of their key papers |
| 🆓 Conference talks — AI Engineer World's Fair, KubeCon, Data+AI Summit, NeurIPS workshops, Latent Space pod | Technical depth of the team in their own words; what customers they name on stage | YouTube → `yt-dlp --write-auto-subs --skip-download` |

## Tier 3 — Founders in their own words (bypasses PR)
Owner: team-researcher, expert-scout

| Source | What it tells you | How |
|---|---|---|
| 🆓 **Launch HN / Show HN** thread (news.ycombinator.com) | Founders' own framing + the sharpest critical questions they get, answered in public | Search `site:news.ycombinator.com "<company>"`; also the funding-news threads — best free contrarian source that exists |
| 🆓 YC company page + Demo Day coverage (Bookface is private; TechCrunch/YC blog cover the batch) | Original one-liner, batch, what they pivoted from | Compare launch one-liner to current homepage = pivot history |
| 🆓 Product Hunt launch + comments | Early positioning, who upvoted (investors/operators as signal) | Maker comments reveal roadmap |
| 🆓 Founder blog / Substack / personal site / X (Twitter) / LinkedIn posts | Vision consistency over time, how they think, hiring pitches | X advanced search: `from:<founder> since:<date>`; read the *replies* too |
| 🆓 **Podcasts** — 20VC, Lenny's, Invest Like the Best, Acquired, a16z, No Priors, BG2, Latent Space, Unsupervised Learning (Redpoint), Cheeky Pint (Stripe), Lightcone (YC), Logan Bartlett, Sourcery, Turpentine, Grit (Kleiner) | Long-form founder reasoning, numbers they let slip (ARR, growth, headcount), customer names | Transcripts via the podcast-dig skill or Podscribe / Snipd / ListenNotes search; pull timestamps |
| 🆓 Fireside chats at Stanford / Berkeley / MIT / Sequoia Arc / a16z Speedrun recordings | Usually more candid than press | YouTube search `<founder> fireside` |
| 🇨🇳🆓 Founder Park · 42章经 · 硅谷101 · OnBoard! · What's Next 科技早知道 · 乱翻书 · Z Potentials 访谈 | Chinese-language founder interviews, often with Chinese-founder companies not covered in English | Especially for 华人创始人 companies |

## Tier 4 — Customers and users talking to each other (unfiltered demand signal)
Owner: product-analyst (PMF), data-hound (retention proxies)

| Source | What it tells you | How |
|---|---|---|
| 🆓 **G2 / Capterra / TrustRadius / Gartner Peer Insights** | B2B review volume trend (proxy for customer count), reviewer company size, pros/cons patterns, "switched from" mentions | Sort by recent; reviewer titles reveal the real buyer persona |
| 🆓 Reddit — r/SaaS, r/startups, vertical subs (r/legaltech, r/devops, r/ExperiencedDevs, r/LocalLLaMA…) | Honest comparisons, churn stories, pricing complaints | Search `<company> vs`, `<company> alternative`, `cancelled <company>` |
| 🆓 Hacker News (non-launch threads), Lobsters, dev.to | Technical users' verdicts | `hn.algolia.com` full-text search |
| 🆓 X/Twitter searches | "switched to", "ripped out", "love", screenshots of usage | Queries: `"<company>" (switched OR migrated OR replaced)`; `"<company>" (cancel OR churn OR refund)` |
| 🆓 Product's own Discord / Slack / community forum | Activity level, response times, feature-request volume, power users by name | Member count over time (Wayback on the invite page sometimes shows it) |
| 🆓 LinkedIn posts by customers ("we adopted…") and by employees ("thrilled to join…") | Logo confirmation, hiring pace, who is leaving (and to where) | LinkedIn search `"<company>"` filtered to Posts, past month |
| 🆓 Glassdoor / **Blind** / Comparably | Employee sentiment, attrition signals, internal drama (Blind is brutal and often early) | Blind requires an employer email to post but is readable with a free account |
| 🆓 Customer engineering blogs | "How we use X at Y" posts = the best PMF evidence that exists | Search `"<company>" site:medium.com OR site:substack.com OR "engineering blog"` |
| 🆓 Partner marketplaces — AWS/Azure/GCP Marketplace, Salesforce AppExchange, Slack/Shopify app stores, Stripe customer stories | Enterprise readiness, install counts, co-sell status | Marketplace listing with private offers = selling to enterprise procurement |

## Tier 5 — Investor and analyst output (frameworks + numbers, with bias)
Owner: expert-scout (views), data-hound (numbers)

| Source | What it tells you | Bias to correct for |
|---|---|---|
| 🆓 "Why we invested" posts — a16z, Sequoia, Benchmark, Index, Lightspeed, Greylock, Redpoint, Felicis, Conviction, Theory (Tunguz), Elad Gil, Founders Fund, Kleiner, General Catalyst, Insight, Accel | The investor's thesis, which is often the clearest statement of the bet; occasionally real numbers | Written by the people who most need it to be true — treat as the bull case's best lawyer |
| 🆓 Published investment memos — Bessemer Memos archive (Shopify, Twilio, Pinterest, LinkedIn…), Sequoia's YouTube/WhatsApp memos, First Round Review | How a memo is actually structured; comparables for how early-stage bets were argued | Historical, not about the subject — use for pattern-matching |
| 🆓 **Contrary Research** (research.contrary.com) | Free 11-section company reports on hundreds of private cos — the first stop for any company > Series A | Encyclopedic; thesis is mild; check dates, reports go stale |
| 💲 **Sacra** (sacra.com) | Revenue estimates, growth, comparables, vs-pages; free 1-pagers, paid deep dives and interviews | Estimates are triangulated, not confirmed — tag as "estimated" |
| 💲 **The Information** | Most leaked ARR / valuation / term-sheet numbers originate here; "The Briefing", org charts, AI Agenda | Scoops are "reported" tier; cross-check with a second signal |
| 🆓/💲 Newcomer, Axios Pro Rata, Fortune Term Sheet, StrictlyVC, Bloomberg/Reuters deal reporting | Round confirmations, lead investor, valuation ranges | Often sourced from the company's side |
| 🆓 Sector reports with company data — Menlo "State of GenAI", a16z Enterprise CIO survey & Top 100 GenAI apps, ICONIQ Growth AI report, Bessemer State of the Cloud / Cloud 100, Battery OpenCloud, Coatue EMW, Ramp AI Index (card-spend market share by AI vendor), Vendr/Tropic price benchmarks | Where the company sits in adoption/spend rankings; price benchmarks; category growth | Ramp AI Index is the closest thing to a free, real-spend adoption dataset — use it |
| 💲 Expert-call transcripts — AlphaSense (acquired Tegus), Third Bridge Forum, In Practise, Stream (Mosaic), Guidepoint | Former employees and customers on record about pricing, win rates, churn | Expensive; In Practise and Sacra interviews are the affordable subset; cite the interviewee's role |
| 🆓 Newsletters that do single-company work — The Generalist, Stratechery, Not Boring, Clouded Judgement, Mostly Metrics, Kyle Harrison (Investing 101), Tanay Jaipuria, SemiAnalysis (for infra), Benedict Evans | Framework-level analysis of famous companies; read for the *question* they ask, then answer it for your subject | Mostly cover companies past Series B |
| 🆓 Podcasts that do single-company breakdowns — Acquired, Business Breakdowns (Colossus), Invest Like the Best | Moat/playbook vocabulary; occasionally the subject itself | Same late-stage bias |
| 🇨🇳 **海外独角兽 / 拾象** — via mirrors Foresight News (foresightnews.pro/column/detail/101) and ChainCatcher (chaincatcher.com/specialt/52); WeChat `unicornobserver` | Thesis-first deep dives with investor-grade data; the best Chinese-language analysis source | Not web-searchable — a search miss is not evidence of no coverage; check the mirrors by company name |
| 🇨🇳 晚点 LatePost · 极客公园 · 机器之心 · 硅星人 · 投资实习所 · 有新 Newin · Z Potentials | 晚点 = best Chinese reporting (one-sourced scoops on Chinese-linked companies); others = interviews and translations | Mostly reporting, not analysis — treat as Tier 6 unless it contains an interview |

## Tier 6 — Press and databases (last, not first)
Owner: data-hound

| Source | Use |
|---|---|
| 🆓/💲 Crunchbase, PitchBook (💲, most complete), Tracxn, Dealroom, CB Insights | Round history skeleton; verify every round against Form D / press / investor post because databases lag and mis-tag |
| 🆓 TechCrunch, Fortune, Forbes, Bloomberg, WSJ, FT | Round announcements, profiles; founder quotes are PR-approved |
| 🆓 Harmonic.ai (free tier), Live Data Technologies, LinkedIn Premium Insights | Headcount over time, hiring/attrition, senior departures |
| 🆓 Google Alerts + Feedly + X lists | Set up when the user says a company is a long-term watch; feeds the "update deep dive" path |

---

## Working rules

1. **Early company = Tiers 1–4 first.** If a seed-stage report cites only TechCrunch and Crunchbase, it was not researched.
2. **Triangulate every number.** ARR from (a) a leak, (b) headcount × revenue-per-head norm for the stage, (c) pricing × plausible customer count. If only (a) exists, confidence is "reported", never "confirmed".
3. **Date everything.** Wayback snapshots, review dates, job-post dates. A fact without a date cannot be trended, and trends are what the report is for.
4. **Critics are found, not stumbled on.** Launch HN, Reddit "alternative" threads, Blind, and the replies under founder tweets are mandatory stops for expert-scout and product-analyst.
5. **Paywalled ≠ unknowable.** The Information scoops get re-reported within 48h by free outlets; Sacra and Contrary free tiers carry the headline numbers; expert-call insights leak into Substacks. Say "paywalled, headline via <mirror>" rather than "unknown".
6. **Chinese sources count as named views.** Cite 海外独角兽 / 晚点 the way you would cite The Generalist / The Information — with author, date and link to the mirror.
7. **Log what you tried.** The "Sources worked" footer in each dimension file is how the user judges whether an "unknown" is real.
