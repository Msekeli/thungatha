# CV Tailoring — Local Groq Manual Test

This development-only endpoint exercises the real CV-tailoring prompt, evidence builder, response schema, mapper, and Groq adapter without requiring a signed-in user, Supabase data, a Profile, a saved master CV, or the M3 job-understanding cache.

It uses a small fictional candidate and two fixed job scenarios. It does not persist a CV or any test data.

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

3. Run the baseline scenario:

   ```bash
   curl -sS -X POST 'http://localhost:3000/api/dev/ai/cv-tailoring' 
   ```

4. Run the unsupported-claims scenario:

   ```bash
   curl -sS -X POST 'http://localhost:3000/api/dev/ai/cv-tailoring?scenario=unsupported'
   ```

The endpoint invokes Groq directly. It does not silently fall back to Gemini or Ollama. Omit the query parameter or use `scenario=baseline` for the original scenario. Use `scenario=unsupported` for the negative factual-integrity scenario. Unknown scenario names return HTTP 400.

## Scenario expectations

### Baseline

The fictional CV supports React, TypeScript, responsive web development, and REST API integration. The job also asks for code-review experience, which is absent from the CV.

Expected:
- Supported experience may be rephrased with accurate profile and job evidence.
- Code-review experience should be reported as a gap.
- No new candidate facts should be introduced.

### Unsupported claims

The job asks for React/TypeScript, AWS infrastructure, Kubernetes, team leadership, and at least five years of professional experience. The fictional CV only supports the frontend experience described in the baseline scenario.

Expected:
- AWS, Kubernetes, team leadership, and five years of experience should be identified as unsupported gaps.
- No suggestion should claim Alex has any of those skills or experiences.
- React/TypeScript may still be tailored where a truthful improvement is justified.
- Every suggestion must include profile and job evidence references.

## What this test verifies

- `provider` is `groq`.
- `model` is the model configured in `GROQ_MODEL`.
- Each suggestion includes profile and job evidence excerpts.
- The response is validated against the same dynamic Zod schema used by the production tailoring flow.
- No database writes occur.

This is a model-behavior test, not a formal proof that all generated wording is factually safe. Review every proposed sentence against its cited profile evidence. The endpoint returns 404 outside `NODE_ENV=development`; it is not a production API or a substitute for testing the authenticated CV Studio workflow.
