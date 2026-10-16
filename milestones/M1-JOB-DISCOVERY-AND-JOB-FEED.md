# M1 — Job Discovery and Job Feed

**Status:** In progress — C04 scoped database path verified; C05 under investigation; C06 locally verified; C07 UI in review  
**Outcome:** A reliable Job Discovery experience backed by persisted listings from approved sources.  
**Design reference:** `Job Discovery · Dark.png`  
**Dependency:** M0 — Foundation and Authentication (Accepted)

## Purpose and scope

Deliver the first primary Thungatha experience: users can browse and inspect job opportunities, search and filter listings, save or dismiss jobs, and open the appropriate external application destination. Prioritise South African opportunities and remote roles that explicitly accept applicants in South Africa.

The supplied Job Discovery screen is the UX reference: job cards show role/employer/location and relevant metadata, a match percentage only when M3 matching is available, and an applied state/link when a corresponding application exists in Job Tracking. The details panel must distinguish discovery source from application destination and support the actions shown in the design, including **Tailor my CV**, **Save**, **Dismiss**, **Open job page**, and **I applied** where applicable.

**Important product boundary:** Do not add a manual “Add job” feature to Job Discovery. Manually recording an application found outside Thungatha belongs to M5 Job Tracking. Discovering, saving, or dismissing a listing does not create an application record. Opening an external application page is not submission.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Each checkpoint record must include changes made, commands/tests actually run, observed evidence, unresolved issues, next action, and user review status. Code written alone does not qualify as acceptance.

## Checkpoints

### M1-C01 — Repository audit and scope lock

**Goal:** establish the actual starting point and reconcile the existing application with the approved product scope.

**Work**

- Inspect routes, components, auth, database/migrations, tests, scripts, environment configuration, and existing dashboard code before deciding what to reuse.
- Record what is already implemented and what is missing; preserve the accepted M0 foundation.
- Confirm the no-manual-job-entry boundary for Discovery and identify all stale document references or scope conflicts.
- Review candidate job sources and document access method, terms, attribution, quotas, costs, geography and approval status. Candidate research is not source approval.
- Confirm local quality-gate commands and record a baseline.

**Exit criteria**

- Repository-grounded gap report and source-validation register exist.
- No application code or schema is changed as part of the audit unless explicitly approved.
- Product boundaries and unresolved decisions are recorded and reviewed.

### M1-C02 — Job data model and persistence

**Goal:** define a durable normalized listing model and user-owned discovery state.

**Work**

- Model normalized job details, source/provider identifiers, discovery source, application destination, source publication date when known, first-seen/last-checked timestamps, and availability state.
- Define deduplication keys and indexes based on verified source payloads.
- Model per-user saved/dismissed state with server-side ownership and database RLS where applicable.
- Add migrations and repository/data-access functions using existing project conventions; do not introduce a second ORM or speculative abstractions.

**Exit criteria**

- Migrations apply cleanly and constraints/indexes support expected queries.
- Publication date, first-seen date and last-checked date remain distinct.
- Cross-user access boundaries and core persistence behaviours are tested.
- Existing M0/profile behaviour is not regressed.

### M1-C03 — First approved job source

**Goal:** ingest at least one source whose intended use has been validated.

**Work**

- Select a source only after checking actual access and display/use terms.
- Implement a source adapter behind a stable internal contract.
- Preserve source identifiers, attribution, original source URL and application destination.
- Record geographic eligibility, source limits, configuration, approval evidence and operational constraints.
- Never bypass authentication, access controls, or source restrictions.

**Exit criteria**

- A permitted source returns usable listings in the supported geography, or a documented limitation is explicitly reviewed and approved before substituting another approach.
- Source attribution and destination links are accurate.
- Secrets remain server-side and source errors are observable.

**Changes made:**

- Defined the shared `JobProvider` contract.
- Implemented Adzuna and Jooble aggregator adapters.
- Implemented the Greenhouse ATS adapter.
- Added environment-based provider configuration.
- Added the server-side job search service and authenticated jobs API route.
- Added API route tests; verification is pending.

**Verification commands/tests actually run:**

- Provider API access was previously checked and recorded in the working source-validation report.
- Automated tests and build checks for the current implementation have not yet been run.

**Observed results/evidence:**

- The adapters and API route are present in the repository.
- Provider access was demonstrated during earlier source validation.
- Technical access does not establish permission for ongoing production use.

**Open issues or decisions:**

- Confirm ongoing-use permission, licensing, attribution and operational limits for the selected source.
- Review application-link quality and source data completeness.
- Complete automated verification and inspect the final diff.

**Reviewed/accepted by user:** Yes

### M1-C04 — Normalization, deduplication and refresh reliability

**Goal:** make repeated ingestion safe and preserve useful history.

**Implementation record (remote changes on dev; verification pending)**

- Added migration `20261016000100_job_ingestion_reliability.sql` with an ingestion-run ledger and service-role-only RPCs for starting runs, persisting batches, and recording terminal outcomes.
- Added `src/lib/jobs/ingestion.ts` to validate provider records, isolate provider failures, persist bounded batches, and report per-provider counts.
- Added `src/lib/jobs/ingestion.test.ts` covering success, provider outage, malformed records, and no configured providers.
- The database write path preserves existing known fields when incoming data is null/unknown, keeps user save/dismiss state separate, and only reactivates a source when it is observed again. A failed provider does not mark stored listings unavailable.
- Secondary deduplication is conservative: exact source URL plus normalized title, employer, and location.
- **Tests actually run:** none from the remote GitHub connector. Local unit tests, typecheck, lint, build, and migration execution remain pending.
- **User review:** pending local pull and verification.


**Work**

- Normalize fields without inventing unknown values.
- Deduplicate using source IDs and justified secondary signals.
- Make ingestion idempotent and retries safe.
- Record run outcomes, errors and counts.
- Preserve stored jobs when a source is temporarily unavailable; mark listings unavailable only under an explicit, evidence-based rule.

**Exit criteria**

- Repeated ingestion does not create duplicate records.
- Updated listings refresh without erasing user state or useful history.
- Outages do not incorrectly mark all listings unavailable.
- Duplicate, retry, update and outage behaviour is tested.

### M1-C05 — Optional AI boundary for job content

**Status: Under investigation — implementation decision pending.**

**Goal:** use AI only if the source audit shows a concrete need.

**Work**

- Decide whether unstructured job-content extraction actually requires AI; document the decision.
- If needed, use a provider-independent server-side contract with schema-validated output and bounded failure handling.
- Keep provider credentials private and minimise personal data sent.
- Keep feed, ingestion, search, save and dismiss functional when AI is disabled.

**Exit criteria**

- The AI task is justified and tested, or explicitly documented as unnecessary for M1.
- Invalid output, quota failures and provider outages are handled safely.
- No future matching score or CV tailoring is pulled into M1.

### M1-C06 — Discovery query and action contracts

**Next active checkpoint.** C05 remains open while the AI-extraction decision is investigated. C06 may proceed because its documented API/data-operation scope does not require AI extraction; do not treat this sequencing decision as C05 acceptance.

**Goal:** provide safe data operations for the Discovery UI without adding manual job creation.

**Work**

- Implement/extend project-standard server endpoints or server actions for feed pagination, search, filters, details, save and dismiss.
- Validate inputs and URL handling; return consistent, bounded responses and safe errors.
- Enforce authentication and user ownership for private actions.
- Define the contract for “I applied” so it leads to an explicit confirmation and M5 application record, rather than treating a link click as submission.

**Exit criteria**

- API/data-operation tests cover valid and invalid input, access control, pagination, filters and failure states.
- There is no Discovery “Add job” path.
- External navigation alone never creates or confirms an application.


**Implementation status: In progress (backend/API only).** Feed, detail, and user-state API handlers are implemented on `dev`. The authenticated routes call Next.js `connection()` so Clerk/request-header access occurs at request time under Cache Components. Route unit tests mock `connection()` because they invoke handlers outside Next's request context. C06 is not accepted until authenticated cloud behaviour and the remaining data-access checks are verified.

Initial API contract:
- `GET /api/jobs`: persisted catalogue feed with validated query, location, country, work-mode and employment-type filters; page/pageSize pagination; active source records; optional `state=all|saved|dismissed`. The default feed excludes dismissed jobs.
- `GET /api/jobs/{id}`: retrieve an active persisted listing and the signed-in user's state.
- `PUT /api/jobs/{id}/state`: set only `saved` or `dismissed`, using server-resolved identity. Updates are limited to active listings.
- `DELETE /api/jobs/{id}/state`: clear only the signed-in user's state for that job.

Security and lifecycle boundaries:
- Handlers require configured Clerk authentication and use the authenticated Supabase client. User-state queries/writes are scoped by the server-derived user ID and subject to database RLS.
- The state API rejects `applied`; opening an external application URL is not an application submission. Creating an M5 application record is not included because the M5 application-tracking contract is not yet available.
- Added endpoint tests for successful feed responses, pagination/filter query construction, per-user state, detail success/not-found/error cases, save/dismiss persistence, invalid JSON/state, inactive listings, and user-scoped deletion.
- **Quality evidence:** GitHub Actions run `38900111432` passed type-check, lint, unit tests, and production build for PR #5. Local verification previously reported 82 tests passing, with type-check, lint, and build completing; the prerender warning was the reason for the `connection()` follow-up.
- PR #5 was squash-merged into `dev` as `bb48c42fafd09f09fad0b3850db978c8efc469c3`. `main` was not changed.
- Still required before acceptance: verify authenticated feed/detail behaviour against stored Supabase records, confirm RLS/cross-user isolation and pagination/filter behaviour against Supabase, and record user review. Do not perform save/dismiss/delete against live user data without an isolated test strategy.

### M1-C07 — Job Discovery feed, search, filters and details

**Goal:** implement the supplied Discovery experience using persisted listings.

**Work**

- Build the feed from persisted data, not hard-coded demonstration jobs.
- Provide deterministic search and filters supported by available data.
- Present role, employer, location/work mode, source and relevant dates when known.
- Implement the detail panel and actions shown in the supplied design.
- Display a match score only when M3 produces a valid score; otherwise do not fabricate a score.
- Show applied status only when linked to an actual M5 application.
- Provide loading, empty, error, retry, unavailable and responsive states.

**Exit criteria**

- Users can browse, search, filter and inspect persisted listings.
- Unknown fields and source/application destinations are presented honestly.
- UI actions match their real outcomes and keyboard/accessibility checks pass.

### M1-C08 — Save, dismiss, undo and application-state integration

**Goal:** persist discovery decisions and prevent misleading application status.

**Work**

- Implement save/dismiss and undo according to the approved UX.
- Ensure private actions are isolated per user and survive refresh.
- Define feed resurfacing rules for saved, dismissed, previously seen and applied jobs.
- Link to M5 records when an application exists; do not duplicate the application lifecycle in M1.
- Preserve state if a listing later becomes unavailable.

**Exit criteria**

- State transitions and undo are tested.
- Cross-user isolation is verified.
- Applied indicators link to the correct application record.
- Source disappearance does not destroy the user's history.

### M1-C09 — End-to-end verification and acceptance

**Goal:** demonstrate a dependable Discovery workflow.

**Work**

- Run relevant format, lint, type-check, unit/integration, build and browser tests; record actual results.
- Test source outages, duplicate ingestion, malformed provider data, empty/error/retry states, save/dismiss/undo, URL handling and user isolation.
- Review accessibility, responsive layout, privacy, logs, source terms, attribution and enabled-service costs.
- Update documentation and record known limitations.

**Acceptance criteria**

- The agreed Discovery journey works with persisted listings from an approved source.
- Core feed behaviour does not depend on AI availability.
- No manual job entry is present in Discovery.
- No critical security, data-loss or core-journey defect remains.
- Evidence is recorded and the user explicitly accepts M1.


---

## M1-C04 completion record — 2026-10-16

**Outcome: PASS for the tested database-side ingestion path.**

- Applied production migration: `20261016000100_job_ingestion_reliability.sql`.
- Local and remote migration histories matched.
- Supabase schema lint completed with no schema errors.
- Smoke-test result: `PASS`; run status `succeeded`; received 1; inserted 1; updated 0; skipped 0; job count 1; source count 1.
- The test transaction was rolled back, and follow-up counts for the smoke-test provider were both 0.

This is evidence for the tested RPC/database path, not a claim that every live provider or the complete scheduled application pipeline has been end-to-end verified. Treat C04 as complete for its scoped database reliability work and avoid repeating checks absent a concrete failure.

**Next checkpoint: M1-C05 — AI boundary and optional extraction.** Keep AI extraction optional; deterministic validation, normalization, deduplication, and persistence remain authoritative.


## C05 investigation and sequencing decision — 2026-10-16

C05 is explicitly **under investigation**, not accepted. The remaining decision is whether the source/content audit reveals a concrete extraction gap that warrants optional AI. No AI feature should be added speculatively. If no concrete need is established, document the rationale and complete the C05 exit criteria accordingly.

Proceed with C06 — Discovery query and action contracts — as the next active checkpoint. Keep C05 open and preserve the requirement that feed, ingestion, search, save and dismiss continue to work with AI disabled. C06 must not add a Discovery “Add job” path or treat opening an external application page as an application submission.


---

## M1-C07 — Job Discovery UI (2026-10-16)

- **Status:** In review — implementation committed to `dev`; local test/build verification and user review remain outstanding. Remote tree inspection confirms the intended six-file diff; `main` remains unchanged.
- **Outcome / scope:** Replace the `/jobs` placeholder with a responsive, persisted-data feed, supported query filters, pagination, selected job details, and honest discovery-source/application-destination links.
- **Reused implementation:** C06 `GET /api/jobs` and `GET /api/jobs/[id]`; existing shared `Button` component and design tokens. Feed contract: `{ jobs, page, pageSize, total, totalPages }`; details contract: `{ job }`. Filter parameters are `query`, `location`, `countryCode`, `workMode`, `employmentType`, `page`, `pageSize`, and `state`.
- **Files changed:** `src/app/jobs/page.tsx`, `src/components/jobs/jobs-discovery.tsx`, `src/components/jobs/jobs-discovery.test.tsx`, `src/styles/components.css`.
- **Verification:** Remote GitHub tree/compare checks confirmed the intended files and current `dev` head. These checks do not execute the application. The component test file has been added but has not been executed in a local checkout. `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, and Playwright/browser checks were not run in the connected remote-edit workflow.
- **Limitations:** `Job Discovery · Dark.png` is referenced by this specification but is absent from the live `dev` tree. C07 does not add manual job creation, matching scores, M5 application status, or save/dismiss mutations. Missing source/destination URLs are labelled unavailable.
- **Outstanding dependency:** C06 authenticated Supabase smoke testing and cross-user/RLS isolation checks remain outstanding.
- **Next action:** Pull `origin/dev` into the local checkout without discarding local work, inspect the diff, run type-check/lint/unit tests/production build and responsive keyboard/browser checks, resolve any observed issues, then request user review. Do not merge to `main` or mark C07 Accepted without evidence and explicit user acceptance.
