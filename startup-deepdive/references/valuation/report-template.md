# Obsidian Valuation Report Template

File: `Startup Radar/<Company>/<Company> valuation.md`. All English. Plain formatting only: `#` title, one `>` intro block, `##` sections, lists, tables, `>` quotes for the challenge dialogue. No frontmatter, no emoji, no italics, no callouts/toggles/columns, bold almost never.

Replace everything in angle brackets. Keep every assumptions table — the analysis process is the product.

```markdown
# <Company> — Valuation (YYYY-MM-DD)

> <One-line product description.>
> Working range: $X–YM <pre/post>-money. Confidence: <High/Medium/Low>. <If terms given: "Ask: $ZM — Overpriced/Fair/Attractive."> Radar profile: [[<Company>]] <or "(no radar profile)">

## 1. Situation

- Stage: <round, date, amount, lead> — methods used: <early-stage set / growth-stage set>
- What we know vs. what we assume: <2–3 lines on data quality; list proxies used>
- <If terms given: the ask, implied step-up, implied dilution>

## 2. Inputs

### Company fact pack
<Condensed from Fact Pack Analyst: business model, pricing, team size, funding history table (Round | Amount | Valuation | Date | Lead | Source), traction signals. Every public fact linked.>

### Market
<Bottom-up TAM math with each assumption on its own line, vs. third-party TAM figures, clearly separated. Venture-scale test: can this market produce a $1B+ revenue company.>

### Comparable transactions
<Table: Company | Round | Amount | Valuation | Date | Multiple-if-known | Source. Median and IQR called out. Public comps table if used, marked "(equity-research pull, date)".>

## 3. Valuation by method

<One subsection per method. Each MUST contain: an assumptions table (Assumption | Value | Source or reasoning), the computation in visible steps, and the resulting range. Example subsection:>

### Method 1: Comparable rounds

| Assumption | Value | Source / reasoning |
|---|---|---|
| Comp-set median pre-money | $XM | <link or table above> |
| Team adjustment | +N% | <one line why> |
| ... | ... | ... |

Computation: <median × adjustments = range>
Range: $X–YM

<...remaining methods...>

### Football field

| Method | Low | High | Weight | Note |
|---|---|---|---|---|
| Comparable rounds | | | | |
| ... | | | | |

Pre-revision working range: $X–YM. <If methods diverge >2x: name the divergence and diagnose it here — hype premium / data gap / genuine optionality.>

## 4. Devil's advocate

<The challenge round, verbatim, as alternating quotes:>

> DA: <attack on assumption 1 — why it is fragile, which direction and how much the number moves if wrong>

> Response: <accept and revise, or rebut with reasoning>

<3–5 exchanges. End with:>

Revisions accepted: <list, with effect on range>. Rebutted: <list, with grounds>.

## 5. Verdict

- Final range: $X–YM <pre/post>. Confidence: <level> — <one line on why>.
- <If terms given: "Ask $ZM is <Overpriced/Fair/Attractive>: <reasoning vs. working range>. It becomes fair if <condition>.">
- Cross-check vs. radar: <qualitative verdict vs. this quantitative one; name the tension if any>

## 6. What would change the number

1. <Fact to verify> — if <X>, range moves <±Y%>. Ask the founder: "<question>"
2. ...
3. ...

## Revision log

- YYYY-MM-DD: initial valuation, working range $X–YM.
```

Notes for the writer:
- Section 4 is the most educationally valuable part; never compress it to a summary.
- Section 6 doubles as the founder-question list — write the questions so they can be asked verbatim at an event.
- On re-runs (new round raised), append to Revision log and keep the old range visible; comparing past ranges to realized rounds is the user's calibration practice.
