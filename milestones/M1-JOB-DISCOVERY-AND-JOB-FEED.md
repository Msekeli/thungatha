# M1 — Job Discovery and Job Feed

**Status:** In progress — C04 scoped database path verified; C05 decision open; C06 cloud/RLS acceptance gates outstanding; C07 UI in review; C08 implementation and user-tested application reminder in review; C09 audit in progress  
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

**Goal:** persist discovery decisions, capture external application-link activity, and let users explicitly record an application without mistaking a click for a submission.

**Work**

- Implement save/dismiss and undo according to the approved UX.
- Replace the persistent undo notice with an accessible bottom snackbar that disappears after 10 seconds; Undo restores the exact prior saved/dismissed state.
- Ensure private actions and activity are isolated per user and survive refresh.
- Record the timestamp when a user opens an external application destination. Opening the link is evidence of a visit only, never evidence of submission.
- When a role whose application link was previously opened appears again and has no applied confirmation, show a compact, non-blocking prompt: “Did you apply for this role?”
- “Yes, I applied” records an explicit, persisted applied confirmation for that user and job; it must be idempotent and must not create duplicate records. “No, not yet” dismisses the prompt for that occurrence only; the prompt may appear again if the role reappears later.
- Do not prompt again once the role is confirmed applied. Keep the application confirmation distinct from saved/dismissed discovery state.
- Preserve state if a listing later becomes unavailable.
- M5 extends this minimal job-linked confirmation into the full application record, submitted-material snapshot, lifecycle/status history and follow-up workflow.

**Exit criteria**

- Save/dismiss state, application-link-open activity and applied confirmation persist per user and survive refresh.
- External-link opening alone never marks a job applied.
- Repeat-visit prompt behaviour and both user choices are tested, including duplicate prevention and per-user isolation.
- Undo appears at the bottom for 10 seconds, then disappears; it restores the exact previous state when used in time.
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
- **Filter follow-up (2026-10-16):** Investigated the reported filter failure after live jobs loaded. The API used `.or()` for keyword matching and could call `.or()` again for employment-type aliases; PostgREST query builders can overwrite the same `or` parameter, causing combined filters to interfere. Employment-type filtering now normalizes human-readable separators such as `Full-time` to provider values such as `full_time`, without a second `.or()` call. The API test assertion was updated. This is a targeted fix, not yet locally executed or verified against the hosted database.
- **Outstanding dependency:** C06 authenticated Supabase smoke testing and cross-user/RLS isolation checks remain outstanding.
- **Next action:** Pull `origin/dev` into the local checkout without discarding local work, inspect the diff, run type-check/lint/unit tests/production build and responsive keyboard/browser checks, resolve any observed issues, then request user review. Do not merge to `main` or mark C07 Accepted without evidence and explicit user acceptance.


## C07 implementation follow-up — filter audit (2026-10-16)

**Status: In review — targeted code changes committed; local and hosted verification still required.**

### Audit findings

- The UI submits the documented filter parameters and resets pagination when filters are applied or cleared.
- The feed endpoint validates supported parameters and applies filters before ordering and pagination.
- Keyword matching uses a PostgREST OR expression across title and employer. User-provided punctuation was not fully constrained for this expression, so a query could be interpreted as filter grammar rather than plain text.
- Location filtering similarly used a limited punctuation replacement. Employment type is normalized from human-readable separators to provider-style underscores; the underscore in SQL ILIKE is a single-character wildcard, so it can match common hyphen/underscore variants, but actual stored values still need to be confirmed.
- Existing route tests use a mocked fluent query builder. They verify query-method calls, not the behaviour of a real PostgREST/Supabase query. The UI tests mock the API and therefore do not prove filters produce the correct records.
- Feed loading/error/empty/retry, pagination, details, source-vs-application links, and mobile detail state have basic component coverage. Browser/responsive/keyboard checks and a real authenticated Supabase test remain outstanding.
- The local production build failure reported by the user points at src/styles/components.css, but the committed dev copy inspected during this audit has balanced opening/closing braces. The precise local PostCSS failure remains unresolved; shared CSS was not changed.

### Changes made on dev

- Added plain-text sanitization for keyword, location, and employment-type filter values before constructing Supabase filters. Unicode letters and numbers are preserved, while PostgREST syntax punctuation is removed.
- Added an API route test for punctuation in keyword and location values.
- Fixed the Button mock in the component tests so the block styling prop is not forwarded to a native HTML button, addressing the React warning in the test output.
- No database permissions, RLS policies, authentication checks, shared CSS, or main branch changes were made.

### Next verification steps

1. Pull origin/dev without discarding local changes; inspect the diff.
2. Run the targeted API and component tests, then the complete test suite, type-check, lint, and production build.
3. Verify combined filters and result counts against a controlled set of actual Supabase records, including full-time aliases, zero matches, and page boundaries.
4. Run browser checks for filter application/clear, selection changes, detail retries, keyboard navigation, and narrow viewport behaviour.
5. Resolve the local CSS build error by comparing the local file with the committed file and locating the exact PostCSS parse failure; do not edit shared styles without a proven defect.
6. Keep C07 In review until the evidence is recorded and user review is complete.


### Follow-up hardening

- The feed client now validates page, page size, total, total-pages consistency, and minimum job identity fields before rendering an API response. Malformed responses produce the existing retryable service error rather than being trusted as valid feed data.
- Added component coverage for inconsistent feed pagination metadata.
- The API sanitization test and component test mock fix are committed. These changes have not yet been run in a local checkout during this session. GitHub returned no status checks for the latest commit, so there is no CI result to treat as a pass.


### C07 external destination hardening — 2026-10-16

- Job Discovery now accepts external source/application destinations only when the URL parses as HTTP or HTTPS. Invalid or non-web schemes are shown as unavailable and cannot be opened through the detail action.
- Added a component regression test for `javascript:` and `data:` destinations.
- This is client-side presentation hardening, not a replacement for validating URLs at ingestion and does not change RLS or API access controls.
- Verification remains pending: the remote GitHub editing tools do not execute the repository's test/build workflow, and no workflow run was reported for the follow-up commit. Keep C07 in review until the local quality suite and browser acceptance checks pass.


### C07 publication recency filter — 2026-10-16

- Added a required publication-age filter to the job feed: last 24 hours, 7 days, 14 days, or 30 days (default and maximum window).
- The API filters on `job_sources.published_at` and excludes listings with missing publication dates, so a refreshed old listing cannot qualify as recent merely because its database record was updated. The parent feed is deterministically ordered by `jobs.updated_at`; the embedded source records are ordered by publication date. Fully ordering parent jobs by a related source publication timestamp may require a database view/RPC or denormalized sort field, and remains a verification/design limitation.
- Added UI and API regression assertions for the selected date range and publication-date query.
- Save/dismiss/undo remain out of C07 and are not being added to this screen; those actions stay in C08.
- **Verification remains pending.** The changes were committed to `dev` through the remote repository workflow; automated tests, type-check, lint, build, and browser checks have not been run in this session. Confirm the Supabase relation filter/order behaviour with the repository's installed Supabase client and a controlled authenticated data set before accepting C07.


### C07 final implementation review — 2026-10-16

- Added a validated `publishedWithin` API parameter (`24h`, `7d`, `14d`, `30d`; default `30d`) and a matching UI selector. The 30-day default is also used when clearing filters.
- The query excludes null publication timestamps and applies the date cutoff before pagination. The route test now rejects unsupported date-window values and asserts the date cutoff plus deterministic ordering calls; the UI test asserts the selected date window is submitted and reset correctly.
- Added a deterministic parent ordering by `jobs.updated_at`; related source rows are ordered by `published_at`. This does **not** prove parent rows are globally sorted by related publication timestamp. If that exact ordering is required, use a view/RPC or denormalized publication-sort field after checking the database relationship and schema.
- Clarified the employment type placeholder so it no longer implies comma-separated multi-value search.
- C08 save/dismiss/undo is intentionally excluded.
- **C07 remains In review.** Remote file edits are not a substitute for running the repository. No tests, type-check, lint, production build, or browser tests were run in this session. Before user testing, run the full quality suite locally and verify the nested relation filter against an authenticated Supabase dataset; investigate any remaining local CSS parse error without changing shared CSS speculatively.


### C07 local verification update — 2026-10-16

**Status: In review — local quality checks passed; acceptance gates remain open.**

The user ran the quality checks locally on `dev` after the test assertion fix:

- `npx tsc --noEmit`: passed with no TypeScript errors.
- `npm run lint`: 0 errors and 3 warnings for unused destructured props (`_variant`, `_size`, `_block`) in `src/components/jobs/jobs-discovery.test.tsx`.
- `npm test`: passed — 14 test files, 94 tests.
- `npm run build`: passed — production build completed.
- `npm run test:e2e`: passed — 2 Playwright tests.

The earlier unit-test failure was caused by `getByText("Greenhouse")` matching both the card source label and the details-panel label. The assertion was changed to allow multiple matches. This was a test-only correction; no application behaviour changed. Fix commit on `dev`: `6fef2c038bd90537b955286ba20ffed249bee843`.

**Verification limits and remaining actions**

1. Confirm that GitHub Actions for the fix commit is green; the prior workflow run failed on the now-corrected assertion, and a green run for the fix commit has not yet been confirmed.
2. Complete the outstanding browser/responsive and keyboard/accessibility checks.
3. Verify combined filters, publication-age filtering, result counts, and pagination against a controlled authenticated Supabase dataset. Mocked unit tests alone do not prove real PostgREST behaviour.
4. Complete C06 authenticated feed/detail smoke tests and cross-user/RLS isolation checks.
5. Record user review and explicit acceptance before changing C07 to **Accepted**.

C07 remains **In review**. These local results are meaningful quality evidence, but they do not complete the cloud, browser, security, or user-acceptance gates. C08 save/dismiss/undo remains separate and out of C07 scope.


---

## M1-C08 implementation record — 2026-10-17

**Status: In review — the expanded C08 implementation is committed to `dev` and GitHub Actions quality checks passed; migration application, local browser checks, authenticated Supabase/RLS verification, and user review remain outstanding.**

### Changes made

- Replaced the disabled Save and Dismiss controls with authenticated API actions using the existing `PUT /api/jobs/{id}/state` and `DELETE /api/jobs/{id}/state` contracts.
- Save and dismissal state are reflected in the selected details and feed cards. The feed refreshes after a successful change, so the Saved, New, and Dismissed categories reflect server-persisted state.
- Added an Undo notice that remains available while switching feed categories. Undo restores the exact previous state, including replacing a previous Saved state after a dismissal. This original notice is to be replaced by the agreed 10-second bottom snackbar.
- Added visible, accessible status and error feedback, busy-state protection, and a way to close the undo notice.
- Follow-up scope approved and implemented on `dev` on 2026-10-17: persist application-link-open timestamps in `user_job_activity`; show a non-blocking “Did you apply for this role?” prompt when a previously opened role is revisited; persist explicit confirmation in `applied_at`; let “No, not yet” dismiss only the current visit's prompt; and automatically remove the bottom Undo snackbar after 10 seconds.
- Added authenticated `GET/POST /api/jobs/{id}/activity` handling and migration `20261017000100_job_application_activity.sql`, with per-user RLS policies. The existing saved/dismissed state API remains separate. The “I applied” action is an idempotent, minimal job-linked confirmation; M5 will expand it into the full application lifecycle.
- Added component tests for saving and undoing, and for keeping dismissal undo available across category navigation.
- No schema or migration change was needed. Existing state writes remain scoped to the authenticated server-resolved user; the state API still accepts only `saved` or `dismissed`.

### Verification actually run

GitHub Actions Quality checks for commit `26a08df58614c27ef83c6d0d83e0fd548870b9b1` passed: TypeScript check, lint, unit tests (14 test files, 96 tests), and production build. Run: https://github.com/Msekeli/thungatha/actions/runs/38986812290

### Remaining limitations and next actions

- The external-link visit and explicit applied-confirmation workflow is now part of C08, not deferred wholesale to M5. M5 remains responsible for the full application lifecycle and submitted materials.
- The new migration has been committed but has not been applied or verified against the hosted Supabase project in this work session.
- Component tests were added for link-open tracking, the repeat-visit prompt, explicit confirmation, and dismissing/reopening the prompt. GitHub Actions Quality checks passed for commit `580253a9e7d383ae6e87213b9750d8f2339c25ef`: TypeScript check, lint, unit tests (15 files, 103 tests), and production build. Run: https://github.com/Msekeli/thungatha/actions/runs/38989215975. These automated checks do not replace authenticated Supabase/RLS and browser acceptance checks.
- Verify Save, Dismiss, the 10-second bottom Undo snackbar, exact prior-state restoration, external-link-open timestamps, the repeat-visit prompt, Yes/No behaviour, refresh persistence, duplicate prevention, and per-user isolation. Apply the migration through the project's normal migration workflow and test with isolated users/data.
- C08 remains **In review**, not Accepted, until migration, automated/local verification, authenticated RLS checks, and user review are complete.


---

## M1-C08 execution record — 2026-10-17

**Status: In review — the application reminder is user-verified; the full C08 acceptance criteria are not yet evidenced.**

### Changes and evidence

- Added `public.user_job_activity` through migration `supabase/migrations/20261017000100_job_application_activity.sql`, with per-user row ownership enforced by RLS. The user ran the linked migration workflow: the dry run listed only this migration, then the migration was applied to hosted Supabase. The user confirmed the reminder works correctly after the migration.
- Added authenticated `GET/POST /api/jobs/[id]/activity` handlers for loading per-user application activity, recording an external application-link visit, and persisting explicit applied confirmation. A link visit does not itself mark a job applied.
- Updated Job Discovery to restore pending reminders from persisted activity and support the source-listing fallback when no separate application URL is available.
- Added/updated activity API and component tests. These use mocked Supabase/query responses and do not prove live RLS enforcement or cross-user isolation.
- Files changed for the application reminder work: `src/components/jobs/jobs-discovery.tsx`, `src/components/jobs/jobs-discovery.test.tsx`, `src/app/api/jobs/[id]/activity/route.ts`, `src/app/api/jobs/[id]/activity/route.test.ts`, and `supabase/migrations/20261017000100_job_application_activity.sql`.

### Automated verification actually observed

GitHub Actions Quality run [38994227871](https://github.com/Msekeli/thungatha/actions/runs/38994227871) passed on commit `1687578a69734aaa85ed626ed5077cb7fef2fbfe`:
- `npx tsc --noEmit`: passed.
- `npm run lint`: passed.
- `npm test`: passed — 15 test files, 105 tests.
- `npm run build`: passed.

The workflow does not run `npm run test:e2e`. The current Playwright tests cover the home page and protected-route redirects, not the complete Job Discovery journey.

### Remaining C08/C09 verification

- Run an authenticated smoke test against hosted Supabase for activity GET/POST and save/dismiss/undo.
- Verify per-user isolation with two authenticated users and the actual RLS policies; mocked route tests are insufficient evidence.
- Exercise the application reminder, source-listing fallback, explicit applied confirmation, and saved/dismissed undo flow in a browser, including refresh and return navigation.
- Verify the 10-second Undo snackbar and restoration of the exact prior state.
- Keep C08 **In review** until the above evidence and user review are recorded.

**User review:** The user confirmed the application reminder works after the migration was applied. Full C08 acceptance: pending.

---

## M1-C09 audit record — 2026-10-17

**Status: In review — repository/CI audit completed; end-to-end and hosted acceptance remain open.**

### Repository and CI findings

- Audited `dev` at `1687578a69734aaa85ed626ed5077cb7fef2fbfe`; `main` was not changed.
- The latest Quality workflow passed TypeScript, lint, 15 unit-test files / 105 tests, and production build.
- Playwright currently has two tests: the landing page and protected-route authentication redirects. It does not test the Job Discovery user journey.
- Existing API and ingestion tests cover many deterministic contracts, malformed data, provider failure, state writes, and activity actions. Their mocked database clients do not establish real hosted PostgREST filtering behaviour or actual RLS isolation.

### Outstanding acceptance gates

1. **C03/source approval:** Adzuna is implemented but the decision log explicitly excludes it from the approved integration plan unless the user reopens that decision. Jooble and Greenhouse are also present in the provider registry, but the repository does not contain complete source-specific approval evidence for terms, intended use, attribution, quotas/costs, and operational limits. Do not treat the current adapters as approved production sources solely because they work technically.
2. **C05/AI boundary:** Current adapters consume structured JSON and use deterministic normalization. No concrete M1 AI-extraction requirement is evidenced in the current implementation. Record a decision to omit AI extraction from M1 unless a permitted source audit demonstrates a specific gap; C05 is not marked accepted by this audit alone.
3. **C06/cloud security:** Authenticated feed/detail/state/activity behaviour against hosted records, plus cross-user RLS isolation, remains unverified in the recorded evidence.
4. **C07/browser/data:** Verify combined filters, publication-age filtering, pagination and result counts against controlled hosted data. Complete responsive, keyboard and browser-console checks.
5. **C08/browser lifecycle:** The user verified that the application reminder works after applying the migration. The complete save/dismiss/undo and activity journeys, cross-user isolation, and 10-second Undo behaviour still need recorded acceptance evidence.
6. **C09 final review:** Record the above results, document approved source limitations, and obtain the user's explicit M1 acceptance only after critical gates pass.

### Audit decision

The repository and latest CI run are in a better state, but **M1 is not accepted**. No deployment or merge to `main` was performed. The next action is to resolve source approval and the C05 decision, then complete the hosted-data/RLS and browser checks with evidence.