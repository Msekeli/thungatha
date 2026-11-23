# AI infrastructure

This directory contains shared, server-side AI infrastructure used by multiple Thungatha features.

## Provider configuration

Provider activation is fail-closed and uses the environment variables already defined by the application:

- `AI_ENABLED_PROVIDERS`: comma-separated allow-list of providers.
- `AI_PROVIDER`: selected primary provider.
- `AI_DEFAULT_PROVIDER`: default provider when `AI_PROVIDER` is not set.
- `OLLAMA_LOCAL_ENABLED`, `GEMINI_ENABLED`, `GROQ_ENABLED`: provider-specific enable flags. A provider is eligible only when it appears in the allow-list and its own flag is exactly `true`.

The selected primary must be eligible. The other eligible providers, in the order listed in `AI_ENABLED_PROVIDERS`, are the only possible transient-failure fallbacks. Credentials alone never enable a provider. A disabled provider is never contacted.

For the current configuration `AI_ENABLED_PROVIDERS=gemini`, `AI_PROVIDER=gemini`, and `GEMINI_ENABLED=true`, Gemini is the only eligible provider and there is no fallback. A Gemini 503 is retried once inline; if it remains unavailable, the durable AI task queue retains the task for a later retry. To permit Groq failover, Groq must be deliberately enabled in both the allow-list and its provider flag, and its credentials/model must be configured.

## Boundaries

- Keep provider-neutral contracts and shared error types here.
- Keep each provider's HTTP/API implementation in its own adapter under `providers/`.
- Keep provider selection, timeouts, and bounded retry policy in shared AI infrastructure.
- Keep task-specific prompts, Zod schemas, input preparation, and business decisions in the owning feature.
- Treat AI as a source-grounded transformation tool, not an independent source of facts. Factual claims must be supported by task input.
- Do not invent candidate or job facts. Preserve unknown or missing information as unknown.
- Reuse valid task results when input and task version have not changed.
- Validate every AI response against the owning feature's schema and verify factual output against supplied evidence.
- Keep credentials server-side. Never log prompts, raw CVs, personal profile data, or full job descriptions.

## Current providers

- `ollama-local`: local development adapter.
- `gemini`: hosted provider adapter.
- `groq`: hosted provider adapter.

The router never silently switches to a provider that is not explicitly enabled. Fallback results pass through the same feature-level schema and evidence validation as primary-provider results.

## Retry and recovery

Transient provider errors (such as HTTP 429 and 503) receive one bounded inline retry. Longer Retry-After windows are deferred to the durable task queue. If all eligible providers are unavailable, the error is returned so the queue can retain and retry the task. Authentication, configuration, and invalid-response errors do not trigger provider failover.

## Ollama Local setup

1. Start Ollama and confirm its local API is reachable at `http://127.0.0.1:11434`.
2. Run `ollama list` and set `OLLAMA_LOCAL_MODEL` to an installed model tag exactly as listed.
3. Set `OLLAMA_LOCAL_BASE_URL` only when Ollama listens on a different local address.
4. Keep all values server-side; do not prefix secrets with `NEXT_PUBLIC_`.
