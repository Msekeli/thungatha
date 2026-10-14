# M1 — Job Discovery & Job Feed

**Document type:** Milestone specification and checkpoint plan  
**Status:** Planned — specification/checkpoints require user review  
**Milestone outcome:** A usable, tested Jobs experience with persisted real job records and reliable manual entry.  
**Checkpoint model:** Nine sequential checkpoints, all tracked in this document.

## 1. Purpose

Deliver Thungatha's first complete user-facing workflow: users can discover, inspect, search, filter, save, dismiss, and organize job opportunities. The Jobs experience must remain useful when external sources or AI providers are unavailable.

M1 is about job discovery, not profile-based job matching, CV generation, or automatic application submission.

## 2. Scope

### Included

- Inspect the current repository and existing M0 foundation before implementation decisions are finalized.
- Validate and integrate suitable job sources, subject to their actual access, API limits, licensing, attribution, and terms.
- Normalize job data and retain source identifiers, discovery source, application destination, relevant dates, and availability history.
- Deduplicate listings and safely refresh them without losing history.
- Support manual job entry even when external providers are unavailable.
- Provide the Jobs feed, search, basic deterministic filters, job details, and source information.
- Support save, dismiss, and undo, with appropriate persistence and user ownership.
- Show honest official-site verification states based on available evidence.
- Handle loading, empty, error, retry, and responsive states.
- Use Gemini API and Groq as the initial AI provider options for tasks that genuinely benefit from AI. Keep provider integration behind a shared internal interface.
- Keep Camber optional for experiments and Ollama optional for local testing; neither is required for the M1 user journey.
- Add automated tests, operational visibility, documentation, and a demonstrable end-to-end browser journey.

### Excluded from M1

- Profile import and CV parsing into a confirmed profile.
- Profile-dependent job fit scores or personalized matching.
- CV generation or tailoring.
- Automatic job application submission or browser automation.
- Mandatory paid AI or job-source services.
- A requirement that every possible job board be integrated before the first release.

## 3. Product and engineering rules

1. **Repository reality first:** inspect the current implementation, database, routes, tests, and M0 status before deciding what to add or replace.
2. **One application:** retain the existing modular-monolith approach. Do not introduce microservices or infrastructure without a demonstrated need.
3. **Source terms matter:** a source is not approved just because an endpoint is technically reachable. Record access method, usage restrictions, attribution, quotas, and any approval required.
4. **South African relevance:** prioritize South African roles and remote roles whose eligibility explicitly includes applicants in South Africa. Do not infer worldwide eligibility from “remote”.
5. **Free for job seekers:** do not make core discovery dependent on a paid user subscription or on a service with unapproved ongoing costs.
6. **AI is optional to discovery:** the feed, source ingestion, and manual entry must remain functional when Gemini/Groq is unavailable, over quota, or returns invalid output.
7. **Deterministic enforcement:** use application code for validation, deduplication, access control, persistence, and state transitions. Treat AI output as untrusted and validate it.
8. **No invented facts:** preserve the difference between source publication date, first discovery date, and last checked date. Unknown values remain unknown.
9. **Preserve history:** source disappearance or a temporary provider outage must not delete a previously stored job or falsely mark all jobs unavailable.
10. **Truthful verification:** do not label a company/application URL “official” without sufficient evidence. Keep discovery source distinct from application destination.
11. **User ownership:** saved/dismissed state and any private user actions must be scoped to the authenticated user on the server.
12. **No premature acceptance:** a checkpoint is not accepted merely because code was written. Record actual verification evidence and await user review.

## 4. Job-source strategy

Use a source-agnostic provider interface and a registry of candidate sources. Integrate only sources whose access and terms have been checked.

Candidates previously considered include employer ATS/public board endpoints such as Greenhouse, Lever, Ashby, Teamtailor, Recruitee, Dayforce and other employer-specific career pages; public remote-job feeds where their terms permit the intended display; and aggregators such as Adzuna, JSearch, Jooble, or Careerjet only after their access, commercial/research restrictions, quotas, and attribution requirements are confirmed.

This is a candidate inventory, not a claim that all sources are approved or already working. Do not scrape behind authentication, bypass controls, or redistribute listings contrary to source terms. Adzuna is not approved for ongoing use until the required permission/licensing position is resolved. Use an initial source that passes validation; expand coverage only when justified.

For each source, record at least:
- source identifier and provider type
- access method and configuration requirements
- terms, attribution, quota, and approval status
- eligible geography and remote-work coverage
- last successful run and last error
- retrieved, added, updated, duplicate, rejected, and unavailable counts
- evidence for ongoing use approval where applicable

## 5. AI provider strategy

Initial providers:
- **Gemini API:** primary option for supported structured extraction and interpretation tasks.
- **Groq:** alternative provider for supported models/tasks and fallback experiments.
- **Camber:** optional experimentation environment; not assumed to be a drop-in inference API.
- **Ollama:** optional local experimentation only; not a default runtime dependency.

Implement a provider-independent internal boundary. Keep provider keys server-side, validate structured outputs (for example with the project's existing Zod conventions), apply timeouts and bounded retries only to transient failures, and record useful failure metadata without logging secrets or unnecessary personal data.

AI may assist with extraction of unstructured job content when deterministic parsing is insufficient. It must not be required for ordinary provider ingestion, feed rendering, manual entry, deduplication, or user actions. Profile-based matching belongs to M3, not M1.

Before sending any personal or sensitive data to an AI provider, review the actual task, data sent, provider terms, and user-consent/privacy implications. M1 should avoid sending CVs or unnecessary personal information to AI providers.

## 6. Checkpoint status vocabulary

Use only:
- **Not started**
- **In progress**
- **Blocked**
- **In review**
- **Accepted**

Every checkpoint record must include: status, changes made, verification commands/tests actually run, observed results/evidence, open issues/decisions, and next action. Never fabricate evidence or mark a checkpoint accepted without review.

---

## 7. Checkpoint plan

The sequence below defines the required delivery path. Later checkpoint details may be refined after C01's repository audit, but the ninth checkpoint remains the full M1 acceptance and release-readiness review.

### M1-C01 — Repository audit and scope decisions

**Purpose:** establish the real starting point before changing code.

**Work**
- Inspect repository structure, current branches/status, package scripts, routes, UI, API handlers, authentication, database schema/migrations, tests, environment setup, and project instructions.
- Identify what already exists and what is missing; avoid rebuilding working foundation components.
- Review M0's outstanding work without forcing M0 to be marked accepted prematurely.
- Record decisions/blockers for job-source approval, source scope, data ownership, and AI use.
- Confirm the local development and verification commands.

**Exit criteria**
- A repository-grounded gap list exists.
- Existing code and migrations have been inspected before any new schema or architecture is prescribed.
- Candidate source restrictions and unresolved approvals are recorded.
- The C02 design can be based on the actual repo rather than assumptions.

**Required evidence:** concise audit findings, relevant paths, baseline command results actually observed, and decision list.

**Initial status:** In review — audit findings recorded below; awaiting user review. C01 is not Accepted.

#### C01 execution record — 2026-10-14

- **Status:** In review.
- **Changes made:** Added this audit record only. No application code, schema, migration, API, UI, provider, or deployment configuration was changed. The M1 specification was already untracked when the audit began; it remains untracked.
- **Verified repository facts:** The app is a Next.js App Router / React / strict TypeScript modular monolith (`src/app`, `src/components`, `src/lib`); dependencies include Clerk, Supabase JS, MUI, Tailwind CSS v4, and Zod. Authentication resolves the Clerk identity server-side (`src/lib/auth/identity.ts`, `src/proxy.ts`); the profile API validates input and derives the owner from that identity (`src/app/api/profile/route.ts`, `src/lib/profile/schema.ts`, `src/lib/profile/repository.ts`). The only migration is `supabase/migrations/20261014000100_create_profiles.sql`, with owner-scoped RLS. Existing tests cover the profile form, repository, profile API, and the home page E2E (`src/components/profile/profile-form.test.tsx`, `src/lib/profile/repository.test.ts`, `src/app/api/profile/route.test.ts`, `e2e/home.spec.ts`). There is no job-domain code, job API, job table, source adapter, AI adapter, or M1 provider environment variable in the repository. The dashboard says Jobs are for a later milestone (`src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`).
- **User-confirmed working functionality:** M0 is complete; Clerk authentication and Supabase database setup are working. These statements supersede stale roadmap language for this audit. Separate landing-page, sign-in, and sign-up UI is not an M1 blocker.
- **Baseline observed:** Node `v24.21.0`, npm `11.19.0`. `npm run lint` completed without reported errors; `npx tsc --noEmit` completed without reported errors. `npm run format:check` failed because Prettier reported six files: this M1 spec, `scripts/generate-tokens.mjs`, `src/styles/components.css`, `src/theme/clerk-appearance.ts`, `src/theme/theme.ts`, and `src/theme/tokens.json`. Tests, build, live auth/database journeys, and migration reset were not run as part of this audit.
- **Architecture and deployment constraints:** Project docs specify one Next.js modular monolith hosted on Vercel, no default ORM, SQL migrations, server-derived identity, and per-user ownership. README documents local Supabase CLI setup, Docker as optional for local database use, and Clerk/Supabase environment configuration. No Vercel deployment configuration or job/AI secrets configuration is present in the repository. C02 should follow the existing SQL migration and server-side ownership conventions; no new architecture is indicated by this audit.
- **Decisions found:** The M1 spec records Gemini API as the primary initial AI option, Groq as an alternative, Camber as optional experimentation, and Ollama as optional local experimentation. It requires server-side keys and validation, timeouts, and bounded retries. Preserve these decisions. The M1 spec also requires source access, terms, attribution, quotas, and approval to be checked and recorded, and says checkpoint evidence and user review are required before acceptance.
- **Unrecorded or unresolved requirements:** The exact previously agreed/approved job-source list and source-specific access method, credentials/account prerequisites, attribution wording, quotas, and approval evidence are not recorded. `DECISIONS.md` D-011 still marks the MVP source Open; the M1 spec's Greenhouse, Lever, Ashby, Teamtailor, Recruitee, Dayforce, public feeds, Adzuna, JSearch, Jooble, and Careerjet are explicitly candidates, not approved sources. Do not treat that inventory as the agreed list or choose a source from it without recording the existing agreement. `DECISIONS.md` D-012 also calls production AI provider/model open; this conflicts in status with the M1 spec's initial provider options. The options are preserved here; exact production model, credentials/configuration names, provider account access, and any terms/consent requirements remain unspecified. Source-specific access and approval therefore remain external prerequisites for C03. The M1 spec documents user review for checkpoint acceptance; this C01 record awaits review, and C02 must wait for explicit approval to proceed.
- **Document contradictions / gaps:** `IMPLEMENTATION-PLAN.md` says M0 is In progress, not accepted, and says not to start M1 until M0 work and review are complete. This conflicts with the user's current confirmation that M0 is complete and Clerk/Supabase are working; treat that tracker statement as stale for this audit and do not reopen M0. The root README and `PROJECT-CONTEXT.md` reference `THUNGATHA-MASTER-PRODUCT-SPECIFICATION.md`, but that file is absent. `ARCHITECTURE.md` and `TECH-STACK.md` are also absent despite being referenced. This M1 specification exists at `milestones/M1-JOB-DISCOVERY-AND-JOB-FEED.md`; no second M1 spec was found. Its checkpoint sequence and AI options are available, but it does not capture the exact agreed source list or all source-specific access and configuration details.
- **Gaps relevant to M1:** There are no job persistence/domain behaviors, ingestion, source validation, manual entry, feed/search/details, save/dismiss state, availability history, or job-focused automated tests yet. Existing profile components and profile persistence are the reusable examples; no Jobs UI component was found. The separate landing, sign-in, and sign-up surfaces are not counted as gaps or blockers.
- **Recommendations for C02:** Before schema implementation, carry forward the existing Clerk-derived owner identity, Supabase RLS, SQL migration, Zod validation, and server-side repository conventions. Keep the design within the documented modular monolith and define only data needed for normalized jobs, source and application destinations, dates/availability, and per-user actions as justified by the agreed M1 scope. C01 does not approve a job source or resolve source-specific access/terms. The minimal documentation correction for the missing master specification is to restore the authoritative file or update references only after its intended replacement is confirmed; do not reconstruct or invent its contents during C01.
- **Next action:** User reviews this audit and approves or corrects the recorded findings. Do not start C02 until that review/approval is received.
- **Reviewed/accepted by user:** No.

### M1-C02 — Job data model, ownership, and persistence

**Purpose:** establish a durable job record that supports ingestion and the user-facing journey.

**Work**
- Design and implement only the schema required by M1, following existing repository conventions.
- Represent normalized job details, source-specific identifiers/records, discovery and application URLs, date semantics, active/unavailable state, and refresh history as justified by the audited design.
- Model user-specific saved/dismissed state with server-enforced ownership.
- Add constraints and indexes supporting idempotency, lookups, and deduplication.
- Add and test migrations; avoid speculative tables or a second ORM/data-access pattern.

**Exit criteria**
- Migrations run using the documented workflow.
- Constraints and ownership boundaries are tested.
- Publication date, first-seen date, last-checked date, and unavailable state are not conflated.
- Existing foundation behaviour is not regressed.

**Required evidence:** migration/test results, schema summary, and any trade-offs/decisions.

### M1-C03 — First approved job source and ingestion adapter

**Purpose:** obtain genuine, relevant job listings from at least one source whose usage is permitted.

**Work**
- Select the first source only after reviewing its coverage, freshness, fields, application links, authentication, quotas, terms, attribution, and approval requirements.
- Implement the provider adapter behind the shared source contract.
- Normalize provider responses at the boundary and preserve source IDs and original links.
- Keep credentials server-side and out of source control.
- Provide bounded requests, pagination/batching where supported, timeouts, and explicit error classification.

**Exit criteria**
- At least one permitted source returns genuine listings relevant to the target geography or eligible remote roles.
- Invalid/missing fields are handled safely.
- Source restrictions and attribution are implemented.
- No unapproved ongoing source usage is treated as production-ready.

**Required evidence:** sanitized sample result, tests, source approval/terms notes, and observed integration outcome.

### M1-C04 — Normalization, deduplication, refresh, and source failure handling

**Purpose:** keep the catalogue reliable over repeated ingestion runs.

**Work**
- Normalize common fields consistently while preserving source-specific details where needed.
- Use multiple signals for deduplication (for example source ID, employer, title, location, and destination URL); do not rely on one fragile field.
- Make ingestion idempotent and safe to retry.
- Record run outcomes and source errors.
- Preserve stored jobs when a source temporarily fails or a listing disappears; mark a job unavailable only with sufficient evidence and an agreed policy.
- Avoid resurfacing jobs a user has already seen, saved, dismissed, or applied to as new duplicates where that state exists in the current design.

**Exit criteria**
- Reprocessing the same listing does not create duplicate jobs.
- Updated listings refresh appropriate fields without erasing history.
- Provider outage does not mass-expire jobs.
- Unavailability and new/updated states are deterministic and tested.

**Required evidence:** idempotency, update, duplicate, outage, and unavailable-state test results.

### M1-C05 — AI boundary and optional job-content extraction

**Purpose:** integrate AI only where it adds measurable value without coupling the feed to an AI vendor.

**Work**
- Implement a shared server-side AI provider contract and adapters for Gemini API and Groq for the supported task(s).
- Select the exact task based on the C01 audit and actual source payloads; do not add generic agent frameworks or speculative abstractions.
- Validate all structured output against schemas; reject malformed or unsupported fields.
- Add bounded timeout/retry/fallback behaviour for transient errors and quota/provider failures.
- Keep API keys private; avoid logging secrets or unnecessary personal data.
- Ensure a failed AI call leaves the original job record available and retryable.
- Keep Camber and Ollama optional, outside the critical path.

**Exit criteria**
- At least one concrete, tested job-related task uses the AI boundary if the audited source needs it; otherwise document why extraction is unnecessary for M1.
- Gemini/Groq can be changed or disabled without rewriting job-domain logic.
- Invalid output and provider failure are handled safely.
- Ordinary feed and manual-entry paths pass with AI disabled.

**Required evidence:** adapter/schema tests, provider configuration documentation, failure-path tests, and rationale for the chosen AI task.

### M1-C06 — Job API and manual entry

**Purpose:** make stored jobs available to the frontend and preserve usefulness without source availability.

**Work**
- Implement or extend server endpoints/actions using existing project conventions.
- Support listing/search/filter parameters, job detail retrieval, and manual job creation.
- Validate user input and URLs; identify manually entered records accurately and do not pretend they came from a verified provider.
- Enforce authentication and ownership where applicable.
- Return consistent errors and bounded pagination; do not expose provider credentials or internal errors.
- Ensure manual entry works when every external source and AI provider is unavailable.

**Exit criteria**
- API-level tests cover valid/invalid input, access control, pagination/filter validation, and failure states.
- Manual jobs persist and appear in the feed.
- Manual entry remains functional with source ingestion and AI disabled.

**Required evidence:** API tests/results and a documented example request/response or equivalent project-standard evidence.

### M1-C07 — Jobs feed, search, filters, and job details

**Purpose:** deliver the main user-visible discovery experience.

**Work**
- Build the Jobs feed against persisted API data, not hard-coded mock listings.
- Provide basic non-AI search and filters supported by available data (for example title/keyword, location, work mode, and source).
- Provide a detail view with employer, title, location/work mode where known, description, relevant dates, source label, and application destination.
- Clearly distinguish where a job was discovered from where the user applies.
- Include loading, empty, error, retry, and responsive states.
- Do not block rendering on AI enrichment or future match scores.

**Exit criteria**
- The user can find and inspect persisted real and manually entered jobs.
- Search/filter behaviour is deterministic and tested.
- Incomplete/unknown fields are presented honestly.
- The feed remains usable when AI or an external source is down.

**Required evidence:** UI tests and browser walkthrough covering populated, empty, error, retry, and responsive states.

### M1-C08 — Save, dismiss, undo, and truthful source/application status

**Purpose:** let users organize opportunities and prevent noisy rediscovery.

**Work**
- Implement persistent save and dismiss actions plus undo where specified by the UI flow.
- Enforce per-user isolation for user actions.
- Ensure saved/dismissed/applied/previously seen items follow agreed feed rules and do not reappear as new duplicates.
- Show official-site verification states such as Checking, Official site found, and Official site not found only when supported by evidence; otherwise retain an honest unknown/pending state.
- Keep the discovery source and application destination distinct.
- Handle stale, missing, and unavailable listings without destroying user history.

**Exit criteria**
- Save/dismiss/undo survive refresh and are isolated between users.
- State transitions and feed resurfacing rules have tests.
- No unsupported official-site claim is displayed.
- Opening an application link is never represented as submitting an application.

**Required evidence:** state-transition/API tests and browser tests for save/dismiss/undo, multi-user isolation, and source status.

### M1-C09 — End-to-end verification, hardening, documentation, and acceptance

**Purpose:** finish M1 in a demonstrably good state, not merely finish coding.

**Work**
- Run the full project quality gates available in the repository: formatting, lint, type checking, unit/integration tests, production build, and end-to-end tests. Record actual commands and results.
- Test the complete browser journey: discover or manually add a job → search/filter → open details → inspect source/application destination → save → dismiss → undo.
- Test source and AI outage paths, malformed provider data, duplicate ingestion, retry behaviour, empty state, and unavailable listings.
- Review server-side authorization, cross-user data isolation, secrets, input validation, URL handling, logs, and privacy.
- Review keyboard usability, accessible labels/focus, responsive layout, and major browser console/network errors.
- Verify source terms/attribution and all costs/quotas/approvals for enabled integrations.
- Update root `IMPLEMENTATION-PLAN.md`, this document's checkpoint records, relevant architecture/decision documents, and setup instructions.
- Document remaining limitations, deferred integrations, and any known defects.
- Demonstrate the complete user journey and submit the result for user review.

**M1 final acceptance criteria**
- A real, permitted source works, or a clearly documented source limitation is explicitly approved by the user; manual entry works regardless.
- Jobs persist and are normalized, deduplicated, refreshable, and retain meaningful history.
- The feed, search, filters, and details work with real persisted records.
- Save, dismiss, and undo work reliably and respect user ownership.
- Discovery source, application destination, and official-site verification are presented truthfully.
- Source/AI failures do not break manual entry or the core feed.
- Required tests and build checks pass, with actual evidence recorded; any unavailable checks are explicitly disclosed.
- No known critical security, data-loss, or core-journey defect remains open.
- Documentation reflects what was actually implemented and any limitations.
- The user has reviewed the demo/evidence and explicitly accepts M1.

**Exit deliverable:** a usable, maintainable, tested Jobs experience ready to serve as the foundation for M2.

**Initial status:** Not started.

---

## 8. Checkpoint execution record

Update this table and the detailed record after each checkpoint. Do not pre-mark future checkpoints as passed.

| Checkpoint | Status | Evidence / notes |
|---|---|---|
| M1-C01 — Repository audit and scope decisions | In review | Audit evidence recorded in the C01 execution record (2026-10-14); awaiting user review; not Accepted. |
| M1-C02 — Job data model and persistence | Not started | Blocked on C01 findings and approved schema decisions. |
| M1-C03 — First approved source | Not started | Requires source access/terms validation. |
| M1-C04 — Normalization and ingestion reliability | Not started | Depends on C02–C03. |
| M1-C05 — AI boundary and optional extraction | Not started | Decide task after examining source payloads in C01–C03. |
| M1-C06 — API and manual entry | Not started | Depends on C02; manual entry must not depend on providers. |
| M1-C07 — Feed, search, filters, details | Not started | Depends on usable API and persisted data. |
| M1-C08 — Save/dismiss/undo and truthful status | Not started | Depends on job identity and user ownership design. |
| M1-C09 — End-to-end verification and acceptance | Not started | Requires all required M1 work and user review. |

### Checkpoint record template

Copy this structure into the relevant checkpoint section or replace the checkpoint's evidence fields as work progresses:

- **Status:**
- **Changes made:**
- **Verification commands/tests actually run:**
- **Observed results/evidence:**
- **Open issues or decisions:**
- **Next action:**
- **Reviewed/accepted by user:** Yes / No

## 9. Relationship to IMPLEMENTATION-PLAN.md

`IMPLEMENTATION-PLAN.md` remains the cross-milestone roadmap and high-level status summary. This document is the detailed M1 specification and the single source of truth for M1's nine checkpoints and their evidence.

When checkpoint status changes:
1. Update the detailed record here first.
2. Update the M1 summary/status and next action in `IMPLEMENTATION-PLAN.md`.
3. Keep both documents consistent.
4. Do not close M0 just because M1 work begins; record M0 and M1 statuses independently.

## 10. Final release rule

M1 is **Accepted** only when C01–C09 have appropriate evidence, all mandatory acceptance criteria pass or explicitly approved exceptions are documented, no critical defect remains, and the user has reviewed and approved the result. Code completion alone is not acceptance.
