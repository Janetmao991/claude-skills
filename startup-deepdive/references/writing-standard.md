# Say What It Means — the analysis standard

User decision 2026-10-04, after a Granola report paragraph was rejected: "我要你干的不只是找资料、贴报告,而是你要问自己,你表达的深层是什么…这里基本就是浮于表面,你没有表达出任何意思". Applies to every dimension file and to the synthesis report. It does not conflict with the Contrary-style voice rule: the judgment is still stated once and calmly — but it has to be there, and it has to be about something.

## The failure this standard exists to prevent

A paragraph that arranges quotes under an "awareness" frame — "the founders have thought about this", "management is focused on X", "experts are divided" — reports that words were spoken. It makes no claim. Test: delete the quotes and read what is left. If nothing is left, the paragraph said nothing.

## Five things every analytical paragraph must do

1. **Define the load-bearing word.** Quotes run on vague words — "better", "moat", "sticky", "context", "AI-native", "platform". Say what the word means *mechanically* for this company: which component, which cost line, which user behaviour. If the source never defines it, reconstruct the definition from what else they said and did, and say you are reconstructing.

2. **Carry the context of every quote** (上下文清晰 — hard requirement). A quote may only be used with these three things known and, where they change the meaning, stated:
   - **The question it answered.** "What scares you most?" and "What's your edge?" produce the same sentence with opposite weight.
   - **What sat immediately before and after.** Hedges, admissions ("I don't have great answers"), qualifiers ("a little bit better", "trust that people will pay") are usually the most informative words and are the first to be cut. Do not cut them.
   - **Date and situation.** Before or after which funding round, which competitor launch, which model release. A sentence from Series A and one from Series C are not the same evidence.
   podcast-dig's `highlights.json` carries `question`, `paragraph`, `next` and `date` for every row — read them, not just `quote`. For anything else, open the transcript or article and read the window yourself. Never merge two quotes from different questions into one "principle" without saying they came from different questions.

3. **Say what kind of claim it is and where it breaks.** Necessary or sufficient? True of this company only, or of every competitor too? What is the counter-case — who else satisfies the same condition (the lab's own app also "gets better when the model gets better")? A founder's sentence is a claim; say what the evidence makes of it.

4. **Compare across time when you can.** The same speaker describing the company twelve months apart is the cheapest strategic evidence there is. If the wording moved, say from what to what, and what happened in between. Source: `65-positioning.md`.

5. **End on something observable.** What would confirm or break the reading in the next 6–12 months — a metric, a launch, a pricing change. If nothing observable follows, it was a mood, not an analysis.

Keep source and inference apart: what the person said (verbatim, linked), versus what you conclude (plainly marked as your reading).

## Worked example (Granola, §7)

**Rejected.** *The founders have thought about this longer than their critics have. "I've worried about this since day one…" Stephenson said, before stating the test he holds the company to: "If Granola doesn't get better when the next version of Claude or GPT comes out, then I think over time we're cooked." Pedregal's version is a rule about where to aim: "build for the world a year from now," and "the main failure mode is not to invest enough in building for the world of tomorrow."*

What is wrong with it: "get better" is never defined. The question was "what scares you most" and the sentence just before the quote was "I don't have great answers" — the paragraph turned an admission into a confident test and dropped "just be a little bit better than them… and trust that people will pay". The two Pedregal lines answer different questions (36:40 roadmap prioritisation under enterprise pull; 44:36 why they run full-context queries at a loss) and were fused into one rule. No claim, no counter-case, nothing to watch.

**What the same material supports.** "Better" has three mechanical meanings at Granola: (a) quality pass-through — no in-house models, "use the best model on the market as quickly as possible", so a model swap is a product upgrade; (b) cost pass-through — they refuse retrieval and load full context because the valuable queries fail with retrieval, which is uneconomic today and is what "build for a year from now" actually refers to; (c) asset appreciation — the product is "a Trojan horse to collect your context", and stored meetings yield more as models improve. The condition is necessary, not sufficient: ChatGPT also improves with each model, so the real test is whether Granola's gain on the meeting job exceeds the general assistant's — which is why Stephenson says "a little bit better" and "trust". The margin rests on capture (already entered by Notion, OpenAI, Zoom by Pedregal's own account in July 2026) and on accumulated context (Lightspeed's lock-in thesis; a habit, not a technical barrier). Across time the ambition narrowed: August 2025 "a tool for thought to do all kinds of work"; July 2026 "best in the world at anything meeting-adjacent, and the best way to capture context to power any agents you have". Watch: whether cross-meeting answers visibly improve at the next model release, whether seat pricing survives until inference costs fall, and how much context is pulled out through the MCP/API by other agents.
