# Research agent briefs (templates)

Spawn both in ONE message, background. Replace <...>. Output files go to the session scratchpad; copy them into `<Company>/research/` afterwards.

## Agent A — client / capture / data-entry layer
Research the TECHNICAL IMPLEMENTATION of <Company> (<url>, <one-line what it does>) — specifically the **<client + data entry layers from the layer map>**. Today is <date>.
Questions (each with source links; "unknown" if not findable, never invent; label every claim CONFIRMED / INFERRED / ASSUMPTION):
1. Client tech (native vs Electron/Tauri/web; mobile). Evidence: app bundle (if installed locally: inspect file names, Info.plist, entitlements, strings — NEVER read user data), job posts, HN "who is hiring", engineering blog, reverse-engineering posts.
2. How the core input is captured/ingested (<e.g. audio capture, connectors, card network>), and which OS/vendor APIs.
3. The first processing step (<e.g. ASR, OCR, enrichment>): vendors, streaming vs batch, auth pattern (tokens), what is stored vs discarded.
4. Mobile / other surfaces.
5. Latency and per-unit cost at public list prices.
Sources: official docs, security/trust page and SUBPROCESSOR LIST, privacy policy, job posts, founder podcasts (grep local transcripts in the deepdive Resources folder first), HN, GitHub tools built on the product.
Write full English findings to <scratchpad>/research-a.md with inline links, short founder quotes with context, and a "Sources worked" list. Return ≤10 lines.

## Agent B — AI / backend / platform / security / economics
Research the TECHNICAL IMPLEMENTATION of <Company> — the **AI/LLM layer, backend, data, APIs, security, unit economics**. Same labelling rules.
1. Model providers, routing (free vs paid), how the core AI output is produced (prompting approach, templates), evals, why they do/don't fine-tune or train; what user data trains what.
2. Retrieval / memory across documents (long context vs RAG vs agentic search; vector DB vendor).
3. Backend: cloud, DB, languages, IaC, observability (subprocessor list + job posts).
4. Platform: public API, webhooks, MCP server — what's exposed, auth.
5. Security & compliance: certifications, encryption, retention, every published vulnerability (who/when/endpoint/fix), lawsuits with technical allegations.
6. Unit economics: per-request and per-user cost at list prices vs price; founder statements on cost drivers.
Write to <scratchpad>/research-b.md. Return ≤10 lines.

After both return: diff their overlapping claims; where they conflict, read the primary source yourself before writing.
