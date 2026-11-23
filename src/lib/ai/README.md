# AI infrastructure

This directory contains shared, server-side AI infrastructure used by multiple Thungatha features.

## Boundaries

- Keep provider-neutral contracts and shared error types here.
- Keep each provider's HTTP/API implementation in its own adapter under `providers/`.
- Keep explicit provider activation, task-aware selection, timeouts, and bounded retry policy in shared AI infrastructure.
- Keep task-specific prompts, Zod schemas, input preparation, and business decisions in the owning feature.
- Treat AI as a source-grounded transformation tool, not an independent source of facts. It may extract, organise, summarise, or improve wording, but factual claims must be supported by the task input.
- Do not invent qualifications, credentials, employers, job titles, dates, responsibilities, skills, achievements, or other personal/job facts. Preserve unknown or missing information as unknown; do not fill gaps with plausible guesses.
- Reuse valid task results when the input and task version have not changed; do not repeat unnecessary requests.
- Validate every AI response against the owning feature's schema and verify factual output against supplied evidence before using or persisting it.
- Keep credentials server-side. Never log prompts, raw CVs, personal profile data, or full job descriptions.

## Provider activation by environment

Provider activation is explicit and server-side. The presence of credentials alone must never enable a provider.

| Environment | Enabled provider(s) | Disabled provider(s) |
|---|---|---|
| Local development | Ollama Local only | Gemini, Groq |
| Hosted production | Gemini, Groq | Ollama Local unless separately configured and explicitly approved |

Gemini and Groq may be present in local configuration, but they must remain disabled during local development and must not receive requests. Their hosted credentials and activation settings are configured in the hosting environment. Moving from local development to hosted production must require configuration changes only; feature code must never name providers or branch on the environment.

Ollama Cloud is not part of the current provider plan.

## Current providers

- `ollama-local`: the only enabled provider during local development.
- `gemini`: supported for hosted production, subject to current free-tier eligibility and limits.
- `groq`: supported for hosted production, subject to current free-tier eligibility and limits.

Adapters normalize provider-specific APIs and response formats. The router must select only providers enabled in the current environment and permitted by the task's capability, privacy, and fallback policy. Never silently switch to paid usage or contact a disabled provider.

### Explicit transient-failure fallback

A fallback is opt-in and must be explicitly configured. Set `AI_PROVIDER_FALLBACKS` to a comma-separated ordered list of already approved providers, for example `AI_PROVIDER=gemini` and `AI_PROVIDER_FALLBACKS=groq` in a hosted environment where both providers are enabled and their credentials are configured.

The router tries the primary provider first. If it fails with a retryable provider error (for example HTTP 429 or 503), it performs the bounded primary retry and then tries configured fallbacks in order. Authentication, configuration, invalid-response, and other non-retryable errors do not trigger failover. If all configured providers are temporarily unavailable, the error returns to the durable job queue; the task remains pending for a later retry. A fallback result is still validated by the owning feature's schema and evidence checks. Groq's JSON mode does not replace application-side schema validation.

No provider is contacted merely because its credentials exist. Do not configure a fallback unless that provider is approved for the environment and task.

## Reasoning and efficient AI use

- Reasoning/thinking is configured per task and provider capability. Context-heavy semantic job understanding and candidate-to-job comparison must be allowed sufficient interpretation; simple extraction or wording tasks may use direct generation where evaluation supports it.
- The Ollama Local adapter must honour task-level reasoning configuration rather than hard-code `think: false` for every request. Do not globally disable model capabilities required by an approved core feature.
- Disabling model thinking is a latency/control setting, not a factuality guarantee. Source-grounding must come from task-specific prompts, minimal evidence inputs, strict schemas, and application-side evidence validation.
- Prefer deterministic application logic for filtering, sorting, evidence validation, authorization, persistence, freshness, and state transitions. Do not replace semantic job matching with deterministic keyword, title, role-family, or fixed-dictionary rules.
- Call AI only when it adds value; avoid duplicate calls and reuse valid prior results.
- Send only the information required for the task.
- Preserve task progress when all enabled providers are temporarily unavailable. Do not discard work or bypass provider limits.
- Do not build a separate usage-monitoring or internal quota-budget subsystem for the MVP. Keep basic diagnostics only: success/failure, latency, token usage when returned, and provider rate-limit/retry details. Diagnostics are for troubleshooting, not arbitrary internal usage caps.

Provider free-tier availability and limits can change. Respect provider responses and terms; do not assume a quota reset schedule or promise uninterrupted free access.

## Ollama Local setup

1. Start Ollama on the development machine and confirm its local API is reachable at `http://127.0.0.1:11434`.
2. Run `ollama list` and set `OLLAMA_LOCAL_MODEL` to an installed model tag exactly as listed.
3. Set `OLLAMA_LOCAL_BASE_URL` only when Ollama listens on a different local address.
4. Keep these values server-side. Do not prefix them with `NEXT_PUBLIC_`.

The adapter uses Ollama's non-streaming `POST /api/chat` endpoint and applies the task's configured reasoning preference where supported. JSON requests ask Ollama for JSON-formatted output; the owning feature must still parse and validate that content with its own Zod schema.

## Implementation order

1. Maintain provider-neutral contracts and error types.
2. Complete and test the Ollama Local adapter for local development.
3. Add Gemini and Groq adapters as hosted-production capabilities, but keep them disabled locally.
4. Add explicit environment-based provider activation and task-aware routing.
5. Integrate AI into a feature only after its prompt, schema, privacy boundary, and acceptance tests are defined.
