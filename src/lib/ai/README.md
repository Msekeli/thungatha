# AI infrastructure

This directory contains shared, server-side AI infrastructure used by multiple Thungatha features.

## Boundaries

- Keep provider-neutral contracts and shared error types here.
- Keep each provider's HTTP/API implementation in its own adapter under `providers/`.
- Keep provider selection, quota-aware routing, timeouts, and bounded retry policy in shared AI infrastructure.
- Keep task-specific prompts, Zod schemas, input preparation, and business decisions in the owning feature (for example, Job Discovery or User Profile).
- Call AI only for tasks that benefit from interpretation, extraction, reasoning, or generated assistance. Keep deterministic application operations in ordinary TypeScript.
- Validate every AI response against the owning feature's schema before using or persisting it.
- Keep credentials server-side. Never log prompts, raw CVs, personal profile data, or full job descriptions.
- Use Ollama Local as the development default. Cloud providers are explicit alternatives and must use their free API allowances only; never silently switch to paid usage.

## Initial providers

- `ollama-local`: existing developer machine installation.
- `gemini`: Google Gemini Developer API free tier, subject to model/account quotas and data-use policy.
- `groq`: Groq API free tier, subject to model/account rate limits.
- `ollama-cloud`: Ollama Cloud starter allowance, subject to its current usage and model limits.

Free-tier availability and limits are provider-controlled and can change. Do not encode assumed monthly reset behaviour; configure and enforce the actual provider/model limits.

## Implementation order

1. Establish provider-neutral contracts and error types.
2. Add and test one adapter at a time.
3. Add task-aware routing and quota controls.
4. Integrate AI into a feature only after its prompt, schema, privacy boundary, and acceptance tests are defined.
