# Early-Stage Valuation Methods (Pre-seed / Seed / Series A)

Four methods, run all of them. They answer different questions and their disagreement is signal:
- Comparable Rounds — "what is the market actually paying right now" (primary anchor)
- Scorecard — "how does this team/market/product compare to the median deal"
- Berkus — "how much risk has actually been retired"
- VC Method — "what price can an investor pay and still make venture returns" (ceiling check)

All benchmark numbers below are anchors as of mid-2026. Have the Comps Researcher verify current medians with live search each run; if live data contradicts these anchors, trust live data and note the drift.

## 1. Comparable Rounds (primary anchor)

Take the 5–10 comparable deals from the Comps Researcher (same sector, same stage, US, last 18 months). Then:

1. Compute median and interquartile range of pre-money.
2. Adjust the subject company against the median on 3 axes, each ±0–40%:
   - Team pedigree vs. typical funded team in the comp set
   - Traction vs. typical traction at that stage in the comp set
   - Heat of the specific niche (a hot niche re-rates everything in it)
3. State each adjustment and its justification in the assumptions table.

Sanity anchors (US AI startups, mid-2026; verify live):
- Pre-seed: $8–15M post typical; hot AI teams (ex-frontier-lab) $15–30M+
- Seed: median pre ~$15–25M for AI; hot deals $40–80M; round size $3–6M
- Series A: median pre ~$50–100M for AI with real revenue; $23M+ median round size
- Post-money ≈ 4–6x round size is the structural norm (implies 15–25% dilution); a big deviation from this ratio is itself a signal worth flagging.

## 2. Scorecard Method (Bill Payne)

Start from the median pre-money seed valuation for the region/sector (use the comp-set median from method 1, not a stale national number). Multiply by the weighted factor sum:

| Factor | Weight | Range |
|---|---|---|
| Strength of team | 30% | 0.5x–1.5x |
| Size of opportunity | 25% | 0.5x–1.5x |
| Product / technology | 15% | 0.5x–1.5x |
| Competitive environment | 10% | 0.5x–1.5x |
| Marketing / partnerships / channels | 10% | 0.5x–1.5x |
| Need for additional funding | 5% | 0.5x–1.5x |
| Other (location, timing, etc.) | 5% | 0.5x–1.5x |

For each factor write one line of justification tied to a fact from the research. A factor with no supporting fact scores 1.0x (neutral), never higher.

AI-era note: "Product / technology" should ask "is there anything the next model release doesn't commoditize" — thin wrappers score ≤0.8x here regardless of polish.

## 3. Berkus Method (modernized)

Original Berkus caps ($500K per factor) are decades stale. Calibrate: cap per factor = comp-set median pre-money ÷ 5. Five factors, each 0 to cap:

1. Sound idea (basic value) — is the need real and the wedge sensible
2. Prototype (technology risk retired) — working product in real users' hands
3. Quality management team (execution risk retired) — founder-market fit with evidence
4. Strategic relationships (market risk retired) — design partners, distribution deals, marquee customers
5. Product rollout / early sales (production risk retired) — actual revenue or usage growth

Berkus is deliberately crude. Its job is to expose "this company has retired almost no risk yet is priced like it has" — when Berkus lands far below Comparable Rounds, say so explicitly; that gap is the hype premium, priced in dollars.

## 4. VC Method (ceiling check)

Work backwards from exit:

1. Exit value: estimate plausible exit revenue in year 5–7 × exit multiple (use public comps' EV/Revenue for the mature version of this business, typically 5–10x for software at exit; not today's frothiest private multiple).
2. Target return: seed 10–30x, Series A 8–15x (reflects portfolio math — most seed checks return 0).
3. Max post-money today = exit value ÷ target multiple, then haircut for expected dilution between now and exit (2–3 more rounds ≈ 40–60% cumulative dilution → multiply by 0.4–0.6).
4. Run bear/base/bull exit scenarios with rough probabilities; also show probability-weighted version.

This produces the price ceiling a disciplined investor can pay. When the current market (method 1) is above the VC-method ceiling, the market is pricing in either (a) faster/larger outcomes than your exit assumptions, or (b) greater-fool dynamics. Name which one you believe and why.

## Cross-method synthesis rules

- Football field: list all four ranges side by side in one table.
- Weighting default: Comparable Rounds 40%, VC Method 25%, Scorecard 20%, Berkus 15%. Deviate freely but state why.
- When methods disagree by >2x, do not average silently — the divergence is the headline finding. Diagnose it (hype premium, data gap, or genuine optionality) before giving the working range.
- Working range should be a range, not a point. Width reflects data quality: clean data → ±25%; mostly proxies → ±50% or wider, and say so.

## Round terms assessment (when the user provides terms)

- Implied dilution = raise ÷ post. Below 10%: founder-favorable, ask why investors accepted. Above 25%: heavy for early stage, flags weak leverage or a party round.
- Step-up vs. last round: annualized. 2–3x/year is strong; >5x/year needs extraordinary traction to justify; <1.5x over 2+ years signals a struggling company (or an earlier overprice).
- Verdict scale: Overpriced (>30% above working range), Fair (within), Attractive (below). Always add "what would have to be true" for the ask price to be fair.
