# Model-Evolution Sustainability Stress Test

The single question: as foundation models keep improving (longer context, better reasoning, native memory, computer use, cheaper tokens), does this product get stronger, weaker, or dead? Answer with a verdict, not a hedge.

## Step 1 — Classify the product's relationship to the model

| Type | Description | Prior |
|---|---|---|
| Wrapper | Thin UI/prompting over a frontier model; core value = the model's own capability | Default skeptical: the next model release or a ChatGPT/Claude feature ships it |
| Workflow | Model + deep integration into a specific workflow, data source, or compliance context | Survivable if the workflow lock-in is real |
| System | Orchestration, proprietary data loops, multi-model routing, infra the labs won't build | Strongest position, but verify the "labs won't build this" claim |
| Model company | Trains or fine-tunes its own models | Judged on data/talent/capital, different test |

State which type this company is and why. Most companies claim System while being Wrapper — judge by what breaks if you swap the underlying model, not by the architecture diagram.

## Step 2 — Run the four tests

1. **Better-model test**: if the underlying models get 10x better tomorrow, does this product become 10x better (it rides the wave) or unnecessary (the wave was the product)? Cite what the product actually adds beyond the model today. **Define "better" mechanically before answering** — which of these applies, with evidence: (a) quality pass-through (thin model layer, a model swap is a product upgrade); (b) cost pass-through (a feature that is uneconomic today becomes economic); (c) asset appreciation (data the company holds yields more as models improve). Then apply the **relative** test: the lab's own assistant also improves with every model, so the question is whether this product's gain *on its specific job* exceeds the general assistant's gain on the same job, and what — other than intelligence, which both sides rent from the same place — produces that gap (who holds the context, who owns the moment of capture, whose UI is in the workflow). "We get better when the model gets better" is a necessary condition, never a sufficient one.
2. **Lab-roadmap collision test**: is this on the visible roadmap of OpenAI/Anthropic/Google (native memory, agents, computer use, code execution, search)? If a lab shipped a good-enough version free inside ChatGPT/Claude, what fraction of this product's users would churn? Look for evidence it already happened to a competitor.
3. **Moat inventory**: which of these does the company actually have (evidence, not claims) — proprietary data loop that improves with usage; workflow/system-of-record lock-in; distribution advantage (installed base, channel); network effects; regulatory/compliance depth; switching costs. "Our prompts/agents are better" is not a moat.
4. **Cost-curve test**: does falling token cost help margins (they resell intelligence at fixed price) or destroy the pricing model (they charge for what becomes free)?

## Step 3 — Verdict

One of: **Rides the wave** / **Race against the roadmap** (viable but must build moat faster than labs ship) / **Living on borrowed time**. Give the reasoning chain, the single strongest counter-argument, and what evidence in the next 6–12 months would change the verdict.

Canonical cautionary references: Jasper (wrapper compressed by ChatGPT), Perplexity vs Google/SearchGPT squeeze, coding assistants vs Claude Code/Codex. Canonical positive references: companies whose usage data compounds (the product gets better with each customer in ways a lab can't replicate).
