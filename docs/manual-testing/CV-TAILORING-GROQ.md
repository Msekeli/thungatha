# CV Tailoring — Local Groq Manual Test

This development-only endpoint exercises the real CV-tailoring prompt, evidence builder, response schema, mapper, and Groq adapter without requiring a signed-in user, Supabase data, a Profile, a saved master CV, or the M3 job-understanding cache.

It uses a small fictional candidate and job advert. It does not persist a CV or any test data.

## Run locally

1. Ensure the local environment has Groq enabled:
   - `AI_ENABLED_PROVIDERS` includes `groq`
   - `GROQ_ENABLED=true`
   - `GROQ_API_KEY` is set
   - `GROQ_MODEL` is set
2. Start the Next.js development server:

   ```bash
   npm run dev
   ```

3. In another terminal, call the test endpoint:

   ```bash
   curl -sS -X POST http://localhost:3000/api/dev/ai/cv-tailoring | jq
   ```

The endpoint invokes Groq directly. It does not silently fall back to Gemini or Ollama. A successful response includes the provider, model, task version, evidence-backed suggestions, and requirement gaps.

## Expected behavior

- `provider` is `groq`.
- `model` is the model configured in `GROQ_MODEL`.
- Each suggestion includes profile and job evidence excerpts.
- The response is validated against the same dynamic Zod schema used by the production tailoring flow.
- No database writes occur.

The endpoint returns 404 outside `NODE_ENV=development`. It is a local integration test, not a production API or a substitute for testing the authenticated CV Studio workflow.
