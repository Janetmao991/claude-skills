# Layer maps — how to slice a company's stack into 4–7 "layers"

Slice along the path one request / one piece of data travels. Each layer = one place where an engineering choice was made.

| Company type | Typical layers (example) |
|---|---|
| AI app on the desktop (Granola) | client shell → OS capture → ASR → LLM generation → retrieval/memory → backend + platform (API/MCP) |
| AI SaaS in the browser (Clay, Harvey) | data ingestion/connectors → enrichment/agents → LLM orchestration + evals → workflow/table engine → integrations/API → infra |
| Dev-infra / platform (Temporal, WorkOS) | SDK/client libs → API surface → core engine (state machine, durability, auth protocol) → storage/consistency → multi-tenant cloud → security/compliance |
| Fintech (Ramp) | card issuing/processor → ledger → data ingestion (receipts, ERP) → ML/LLM (categorization, policy) → integrations → compliance/risk |
| Hardware + AI | sensor/device → on-device model → sync → cloud model → app |

Always add the cross-cutting sections after the layers: **security incidents** (explained from the architecture), **unit cost per user/request**, **which layer is actually built in-house**.
