# Growth-Stage Valuation Methods (Series B+ / ARR > ~$10M)

Three methods, run all of them:
- ARR / Revenue Multiple — "what are private buyers paying per dollar of revenue" (primary anchor)
- Public Comps with discount — "what does the liquid market say the mature version is worth"
- Exit Scenario Analysis — "what do you have to believe for this price to work"

Benchmark numbers are anchors as of mid-2026 — verify with live search each run.

## 1. ARR / Revenue Multiple (primary anchor)

1. Establish ARR. Priority: disclosed figure (link it) > credible press reporting > estimate from proxies. Proxy chain when estimating: headcount × $200–350K revenue/employee for efficient AI companies (state which end and why), or customers × estimated ACV. Always show the proxy math and its error direction.
2. Growth rate matters more than ARR level. Establish YoY growth (or best proxy: round-interval compression, headcount growth, reported milestones).
3. Pick the multiple from the private comp set (Comps Researcher's recent same-sector rounds: valuation ÷ reported ARR at time of round). Anchors, mid-2026:
   - AI infra / foundation-model-adjacent, growing >150%: 30–60x forward ARR at peak heat (verify — this tier moves fast)
   - AI apps growing 100%+: 20–40x
   - AI apps growing 50–100%: 10–20x
   - Growth <50%: 5–10x — at this point the company is priced like software, not like AI
4. Growth-adjust: a company growing 3x/year at 40x ARR is cheaper than one growing 1.5x/year at 25x. Show multiple ÷ growth-rate comparison across the comp set (a private-market analog of growth-adjusted multiples).

## 2. Public Comps with discount

1. Take the 2–3 closest listed names from the Comps Researcher (pulled via equity-research CLI when possible — real EV/Revenue and growth, not vibes).
2. Map the subject onto the public regression line: given its growth rate, what EV/Revenue would the public market assign?
3. Apply adjustments and show each: illiquidity/scale discount 20–30%; premium for structurally higher growth than any public comp (cap it — public markets already pay for growth); note if the closest public comp is itself AI-inflated.
4. This method usually lands below method 1. The gap = what private investors pay for optionality and access. Quantify the gap; it is the "how much hype am I buying" number.

## 3. Exit Scenario Analysis (probability-weighted)

Build bear / base / bull, each with: exit type (IPO, strategic M&A, stall/down-exit), exit-year revenue, exit multiple, resulting exit value, probability. Rules:

- Probabilities must sum to 1 and include a real bear case (down round, acqui-hire, zero). Base rates: even at Series B+, a large minority of companies never return capital.
- Discount to present: required IRR 25–35% for growth-stage venture, over 4–6 years to exit. Or equivalently: target 3–5x multiple on this round.
- Cumulative dilution from here to exit: 1–2 more rounds ≈ 15–35%; haircut proceeds accordingly.
- Output: probability-weighted present value, plus the single sentence "for this round price to earn 3x, the company must reach $X revenue by year Y and exit at Zx" — the believe-it-or-not test.

## Cross-method synthesis rules

- Weighting default: ARR Multiple 45%, Exit Scenarios 30%, Public Comps 25%. Deviate with justification.
- ARR estimate quality dominates everything: when ARR is a proxy estimate, widen the working range and say the single most valuable diligence item is confirming revenue.
- When method 1 (private market) >> method 2 (public-anchored), state the hype premium in dollars and per cent. That is often the report's most useful number.

## Round terms assessment (when the user provides terms)

- Step-up from last round, annualized; compare against ARR growth over the same period. Valuation growing faster than revenue = multiple expansion — the buyer is paying for a story upgrade; say which story.
- Implied forward multiple at the ask price vs. comp set: cheap/fair/rich.
- Burn multiple if estimable (net burn ÷ net new ARR): <1.5 excellent, >3 flag.
- Verdict scale: Overpriced / Fair / Attractive, plus "what would have to be true" — e.g. "fair only if ARR is really $200M+ and growth holds >100% for two more years".
