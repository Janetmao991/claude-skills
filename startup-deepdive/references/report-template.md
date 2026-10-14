# Deep Dive Report Template

File: `Startup Deepdive/<Company>/<Company> — Deep Dive.md` (in the Obsidian vault). All English. No YAML frontmatter. `[[wikilinks]]` to dimension files at the end of sections.

**Voice (user decision 2026-10-02, overrides the earlier "rich formatting" guidance for THIS file):** the synthesis report is a company story in the voice of a Contrary Research report — flowing prose that 娓娓道来, where the facts carry the judgment. The first draft written to this template was rejected as "生硬… 处处都是评判的痕迹" because every section was a scored list. Rules for the synthesis report only (dimension files may stay dense and tagged):
- Prose paragraphs, not bullet checklists. A verdict is stated once, calmly, where it belongs — not re-asserted in every line.
- **No emoji signals (🟢🟡🔴🚩) and no inline confidence tags** in this file. Confidence lives in the one numbers table and in [[50-data]].
- No framework name-dropping in the body ("Helmer lens", "Gurley checklist", "Sacra discipline"). Apply the frameworks silently; name them once in the revision log.
- **At most two tables**: the 7 Powers grid (§4) and one compact key-numbers table (§5). Everything else, including the risk map and bull/bear, is written as sentences.
- Numbers go inside sentences with their date and source woven in ("Ramp's data, updated the day this was written, shows…").
- Open §1 with the founding story told as a story; §2 describes the product as a user experiences it before any assessment.
- Model: Contrary Research company reports; first passing example is Granola — Deep Dive.md, revision 2 (2026-10-02).

**Say what it means (user decision 2026-10-04, same rank as Voice):** see `writing-standard.md`. Calm prose is not permission to be empty. Every paragraph that carries a quote or a judgment must define its load-bearing word, carry the quote's context (the question it answered, the hedge next to it, the date and stage), say whether the claim is necessary or sufficient and who the counter-case is, and land on something observable. Self-check before finishing: cover the quotes and see whether the remaining sentences assert anything.

**Figures (user decision 2026-10-02: "数字能用图表直观展示的，要用图表"):** the prose carries the argument, but every quantitative claim a reader would want to *see* gets a chart. Standard set, generated as SVG files in the company folder named `<company>-fig-<topic>.svg` and embedded with `![[<file>.svg]]` at the point in the prose where the number is discussed (Obsidian renders them inline):
- funding & valuation step-ups (mark which rounds have a primary filing behind them);
- traction / share over time vs named rivals (Ramp, Yipit, G2 counts — whatever the dimension files produced);
- headcount series (founder-stated vs tracker-derived when they disagree);
- revenue estimate bands when ARR is undisclosed (each method a bar, the overlap highlighted);
- the positioning timeline for §2b (external events above the axis, the company's dated one-line self-descriptions below);
- optionally TAM/SAM/SOM, pricing timeline, retention cohort.
Style = Kami: paper background `#f5f4ed`, one accent ink-blue `#1B365D` (+ `#4a6285`), warm greys, no gradients, serif labels (Charter/Georgia), mono eyebrow caption; confirmed data solid, estimated/unconfirmed dashed or grey; a one-line source note inside the figure. Render each SVG to PNG and look at it before embedding — labels collide more often than you expect. The Kami deck reuses the same SVGs.

**Founders' voice (user decision 2026-10-02: podcast-dig material is "很重要的"):** the report must let the founders speak, verbatim, in at least these four places — how they *define* the company and its vision (§0/§2/§3), how the first users came and why (§1/§2), what they say about costs and numbers (§5), and how they answer the challenges put to them — incumbents, the labs, privacy, pricing (§4/§7/§8). Source = the podcast-dig corpus `Podcast Research/<Company>/_<Company> highlights.json` (starred rows first), cited as `"<quote>" ([<show>, <Mon YYYY>, <mm:ss>](<youtube link with &t=>))`. **Recency:** do not quote episodes older than 24 months (user rule 2026-10-03 — "信息早已过时"); podcast-dig archives them and keeps them out of the ★ summary. The only exception is an archived episode the index explicitly keeps for a stated reason; always give the date next to a quote so staleness is visible. Founder statements are claims, not facts: quote them, then say what the evidence does with them. Investor-host episodes (Lightspeed's Generative Now, Spark's Hallway Chat) count as the investor's thesis. Read the podcast transcripts for people the web search missed — Granola's VP Sales and CTO only existed in the transcripts.

The report SYNTHESIZES the dimension files — it cross-references them, it does not copy them. Anyone wanting raw detail opens the numbered files in the same folder. The section skeleton below is the required *content*; the sketch inside each section describes what to cover, not how to format it.

**Lineage (user decision 2026-10-02):** skeleton = Contrary Research's 11-section company report (nothing ever missing); head = 海外独角兽/拾象's thesis-first "投资逻辑" + "why now / player taxonomy"; competition = Acquired's 7 Powers scoring; numbers = Sacra's source-and-date discipline. Sections 7 (sustainability) and 6 (smart money) are this skill's own additions — keep them.

```markdown
# <Company> — Deep Dive (YYYY-MM-DD)

> <One-line business summary — the business-card test. One sentence, no adjectives you cannot defend.>
> New to this space? Read [[00-explainer]] first — plain-language walkthrough of what this company sells, who pays, and every term used below.

## 0. The bet
<The investment thesis, written BEFORE the evidence, 海外独角兽-style — but as 3–4 flowing paragraphs, one belief each: what we believe, the evidence it rests on, and what would change our mind, all in sentences. The last paragraph is the single kill risk, stated calmly with a probability. Rule: if a belief could appear in any competitor's report unchanged, it is not a thesis — rewrite it.>

## 1. Team
<Condensed from 10-team.md: founder trajectories, founder-market fit evidence, capability gaps. Link the file for detail.>

## 2. Product
<From 20-product.md: the problem and whose pain it is, target customer, what the product actually does, pricing. Name the ONE design choice that defines the product (the way Granola = "AI augments human notes, not replaces them"). End with the claimed-vs-real uniqueness verdict.>

## 2b. How the positioning has moved
<From 65-positioning.md: the company's own description of itself, period by period, set against what was happening outside — model generations, incumbents and labs entering, funding. Told as a short narrative with the verbatim lines dated, plus one timeline figure (`<company>-fig-positioning.svg`: external events above the axis, the company's one-line self-description per period below). Say whether the ambition is widening or narrowing, whether each shift preceded or followed the event that explains it, what never changed, and what the environment implies comes next. §0 and §7 must be consistent with this arc.>

## 3. Market — why now, and who else is here
<From 30-market.md, in this order:
(a) Why now: what changed (tech / cost curve / regulation / behavior) that reopened this category now, with evidence the market is ready vs the company being early.
(b) Player taxonomy: 3–4 categories of players (e.g. incumbents-with-a-feature / point-solution startups / in-house builds / platforms), one line each, and where THIS company sits.
(c) TAM: bottom-up math (assumptions visible) vs third-party figures, venture-scale test result.>

## 4. Competition — 7 Powers scorecard
<From 40-competition.md: the landscape table (3–6 rivals: funding, ARR, team size, positioning), then the Hamilton Helmer 7 Powers scorecard — subject AND top 2 rivals scored on the same grid:

| Power | <Company> | Rival A | Rival B | Evidence |
|---|---|---|---|---|
| Scale economies | has / building / none | | | |
| Network effects | | | | |
| Counter-positioning | | | | |
| Switching costs | | | | |
| Branding | | | | |
| Cornered resource | | | | |
| Process power | | | | |

Then the position verdict: on which axis does it win, if any, and what are incumbents shipping that collides.>

## 5. The numbers
<From 50-data.md: the key figures table — metric | value | as-of date | source link | confidence (confirmed/reported/rumored/estimated). Sacra discipline: no number without a date and a source. Interpret, don't just list: growth in context of competition and round history; round-spacing read; revenue per head.>

## 6. What the smart money says
<From 60-expert-views.md: named views on this company vs on the sector, each sourced. Where experts disagree, show the disagreement — it usually marks the real question.>

## 7. Sustainability under model evolution
<From 70-sustainability.md: product type classification, the four test results, and the verdict — Rides the wave / Race against the roadmap / Living on borrowed time. This section must take a position.>

## 8. Risk map
<From 80-risks.md: the five risk categories (timing / execution / product / regulatory / financing) as a table — risk | likelihood | severity | mitigants | early-warning signal — then the top-3 ranking. The kill risk is already stated in §0; reference it, don't restate.>

## 9. Two ways to read the same company
<Two short essays of equal weight — "the optimist's <Company>…" and "the sceptic's <Company>…" — each touching the same five points in the same order, the sceptic written by someone who wants to pass on the deal, not as caveats to the bull. Then one paragraph revisiting §0: which beliefs the evidence strengthened, which it weakened, and by how much. If the user's brain has a relevant view, weave it in here. Frameworks used are named in the revision log, not here.>

## 10. Information gaps
<What could not be verified, what proxies were used, which gaps matter most. Note which source tiers from sources-playbook.md were exhausted and which were not reachable (paywalled / no mirror).>

## 11. Questions for the founders
1. <Askable verbatim at an event; aimed at the biggest open question, not small talk>
2. ...
3. ...

## Revision log
- YYYY-MM-DD: initial deep dive.
```

Notes:
- §0, §7 and the one-line summary are what the user reads first — never let them be vague.
- §0 is written first and re-checked last (§9 thesis check). A report whose thesis never changed between the two is suspicious — either the evidence was ignored or the thesis was too safe.
- Keep the report under ~2,800 words; depth lives in the dimension files.
