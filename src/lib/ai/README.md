# AI infrastructure

## Provider configuration

Provider activation is fail-closed:

- `AI_ENABLED_PROVIDERS`: comma-separated allow-list; its order determines fallback order.
- `AI_PROVIDER`: selected primary provider.
- `AI_DEFAULT_PROVIDER`: used only when `AI_PROVIDER` is empty.
- `OLLAMA_LOCAL_ENABLED`, `GEMINI_ENABLED`, `GROQ_ENABLED`: a provider is eligible only when listed and its flag is exactly `true`.

The selected primary must be eligible. Only other eligible providers in the allow-list order may be used as fallbacks. Credentials alone never enable a provider. Unsupported providers are rejected.

### Hosted routing target

```env
AI_ENABLED_PROVIDERS=groq,gemini
AI_PROVIDER=groq
AI_DEFAULT_PROVIDER=groq
GROQ_ENABLED=true
GEMINI_ENABLED=true
OLLAMA_LOCAL_ENABLED=false
```

Groq is primary; Gemini is the first and only fallback. On a retryable Groq outage, the router retries Groq once, then tries Gemini. If Gemini also fails, the durable queue retains the task for a later retry. No Ollama or other provider is contacted.

### Gemini-only routing

With `AI_ENABLED_PROVIDERS=gemini`, `AI_PROVIDER=gemini`, and `GEMINI_ENABLED=true`, Gemini is the only eligible provider. There is no fallback.

## Boundaries

- Keep provider-neutral contracts and shared error types here; provider HTTP/API code belongs in adapters.
- Keep task-specific prompts, schemas, input preparation, and business decisions in the owning feature.
- Treat AI as a source-grounded transformation tool. Do not invent candidate or job facts; preserve unknown information as unknown.
- Reuse valid task results when inputs and task versions have not changed.
- Validate every response against feature schemas and verify factual output against supplied evidence.
- Keep credentials server-side. Never log prompts, raw CVs, personal profile data, or full job descriptions.

## Retry and recovery

Transient provider errors such as HTTP 429 and 503 receive one bounded inline retry. Longer Retry-After windows are deferred to the durable queue. If all eligible providers are unavailable, the error returns so the queue can retain and retry the task. Authentication, configuration, and invalid-response errors do not trigger failover. Fallback responses pass through the same feature-level validation as primary responses.

## Ollama Local

Use `OLLAMA_LOCAL_BASE_URL` and `OLLAMA_LOCAL_MODEL` for local setup. Keep values server-side; do not prefix secrets with `NEXT_PUBLIC_`.
