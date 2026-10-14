# Thungatha — Implementation Plan and Checkpoint History

This is the single, cumulative implementation tracker for Thungatha. Keep milestone scope, current status, checkpoint history, verification evidence, open blockers, and the next action here. Do not create separate planning, checkpoint, or review documents by default. Keep entries concise; add detail only when it helps someone continue work without repeating investigation.

The master product specification defines product scope and milestone strategy. The architecture and tech-stack references provide supporting constraints. This plan records delivery progress and evidence; it must not claim implementation or acceptance based on plans alone.

## Status and completion rules

### Milestone status

- **Not started** — no implementation work has begun for the milestone.
- **In progress** — implementation or required verification remains.
- **Blocked** — progress depends on a named unresolved issue or decision. State the owner/action needed to unblock it.
- **In review** — all planned milestone work is believed complete and the evidence is ready for final acceptance review, but acceptance has not been granted.
- **Accepted** — all exit criteria have been demonstrated with evidence, known exceptions have been explicitly approved, and the user has reviewed the result.

### Checkpoint status

- **Not started** — checkpoint has not begun.
- **In progress** — work is underway.
- **Blocked** — a named dependency prevents progress.
- **In review** — implementation is ready for the stated verification/review, or a required verification is still outstanding and is explicitly listed.
- **Accepted** — the checkpoint outcome and its stated acceptance criteria have been verified; evidence and remaining limitations are recorded.

A checkpoint being committed, a screen rendering, or a green build does not by itself mean the checkpoint or milestone is Accepted. A checkpoint may be Accepted while its wider milestone remains In progress. Milestone acceptance is a separate decision against the complete milestone exit criteria.

## Working rules

1. Work in meaningful, independently verifiable checkpoints. Do not create a checkpoint for every command or tiny edit.
2. Before a checkpoint, state its outcome, scope, and acceptance checks. Inspect existing implementation and current project state before changing anything.
3. After work, record what actually changed, the checks actually run and their results, unresolved issues, and one explicit next action. Never claim a check that was not performed.
4. Preserve earlier checkpoint history. Update statuses and append concise evidence; do not replace the history with a new summary.
5. If a checkpoint reveals additional work, either add it to the current checkpoint if it is part of the same coherent outcome or define the next checkpoint. Do not silently expand scope.
6. Keep decisions provisional/open when the project references leave them unresolved. Ask before making consequential product, security, privacy, architecture, cost, or dependency decisions.
7. The user performs Git operations in VS Code Source Control. Do not commit, push, or deploy as part of a checkpoint unless the user explicitly authorizes that operation.
8. Use this file as the single progress tracker. Update it after meaningful progress and at every checkpoint/milestone review. Do not create duplicate tracker, checkpoint, or review files.

## What makes a checkpoint complete?

A checkpoint is ready to be **Accepted** only when all acceptance checks defined for that checkpoint have a recorded result. Record the actual evidence briefly—for example, the command/test and pass/fail result, a tested browser journey, a verified migration run, or the relevant review outcome. If any required check is unverified or failing, keep the checkpoint In progress, Blocked, or In review as appropriate and list the exact remaining action.

Every checkpoint record must include:
- **ID and milestone**
- **Outcome / scope**
- **Status**
- **Changes**
- **Verification and result** (distinguish passed, failed, and not run)
- **Open issues / decisions**
- **Next action** (a concrete task, or “None — checkpoint accepted”)

A checkpoint must never end with a vague instruction such as “continue”, “review later”, or “finish testing”. Name what must be checked, by whom when relevant, and what result will close it.

## What makes a milestone complete?

A milestone is Accepted only after the full agreed user journey and its exit criteria have been demonstrated. As applicable, the review must cover:

- Requirements and scope remain aligned with the master product specification.
- Required schema changes and migrations run repeatably from a clean state.
- Domain/application behaviour and APIs work, including validation, authorization, and failure cases.
- The UI is connected to real behaviour rather than only mock data and covers loading, error, empty, success, and confirmation states where relevant.
- Automated tests cover important rules and failure paths; browser/E2E tests exercise the actual journey at relevant responsive sizes.
- Relevant regression checks pass.
- Security, ownership, privacy, and data-integrity requirements for the milestone are verified.
- This plan records the evidence, known limitations, deferred work, and the next milestone or follow-up.
- The user has reviewed the demonstrated result.

If any required criterion is not verified, the milestone remains In progress, Blocked, or In review with the outstanding item listed. Do not use Accepted as a target date or as a synonym for “mostly done”.

## Milestone tracker

| Milestone | Scope | Status | Exit condition |
|---|---|---|---|
| **M0 — Product & Engineering Foundation** | Repository conventions, reproducible local setup and environment handling, Clerk authentication, Supabase PostgreSQL, repeatable migrations, server-side user scoping, tests, module boundaries, API/error handling, responsive app shell and design tokens | **In progress** | App runs from documented setup; authentication and server-side ownership checks are tested; migrations and checks are repeatable; core architecture/workflow is documented in the retained project docs; user reviews the demonstrated foundation. |
| **M1 — Job Discovery & Job Feed** | Search/filter feed, job details, save/dismiss/undo, manual entry, normalization/deduplication, source validation, availability history, provider errors/retries | Not started | Users complete the job-discovery journey with persisted behaviour; manual entry works independently of external-source availability; source, deduplication, history, and failure behaviour are tested. |
| **M2 — Professional Profile & CV Import** | Structured profile and versioning, CV import draft, uncertainty handling, review and confirmation | Not started | Imported information stays a draft until review; confirmed profile data and version history are persisted and tested. |
| **M3 — Job Matching & Fit Analysis** | Requirement extraction/classification, evidence-backed assessments, deterministic scoring/rules, explainability, stale-state handling | Not started | Assessments are traceable to confirmed evidence and job requirements; unknown/partial states and stale scores behave as specified; scoring is deterministic and tested. |
| **M4 — CV Studio** | Master/tailored CVs, proposed edits, accept/reject, evidence traceability, comparison and export | Not started | User-controlled, traceable CV changes and export work; generated content does not invent experience. |
| **M5 — Application Management** | Application records, status/event history, follow-ups/notes, submitted-material snapshots | Not started | Users track applications and history; status changes are controlled; submitted CV/job-context snapshots remain immutable. |
| **M6 — Preferences, Hardening & Release** | Preferences/filter rules, export/deletion, security, accessibility, performance, operational readiness and release | Not started | Critical journeys, ownership/data controls, responsive/accessibility behaviour, monitoring, recovery and release checks meet the agreed release criteria. |

**Current milestone:** M0 — Product & Engineering Foundation. M0 is not accepted. Complete the outstanding verification and acceptance work recorded below before starting M1 feature implementation.

## Checkpoint history

Keep the records below in chronological order. For historical work where the full evidence was not recorded at the time, say so explicitly; do not reconstruct test results from assumption.

### M0-C01 — Initial repository/application foundation

- **Outcome / scope:** Establish the initial Thungatha application foundation.
- **Status:** In review — historical checkpoint; the available plan history says the checkpoint was committed, but this record does not contain enough verification evidence to mark it Accepted.
- **Changes:** Initial foundation checkpoint was recorded in project history. Detailed file/change summary is not available in this tracker entry.
- **Verification and result:** Historical verification evidence is not recorded here. Do not infer that current build/test results prove every original C01 criterion.
- **Open issues / decisions:** Confirm the foundation still satisfies the M0 requirements during the M0 acceptance review.
- **Next action:** Include repository setup, package scripts, test configuration, app structure, and any foundation conventions in the M0-C04 acceptance audit. Update this record with observed evidence; accept C01 if its own outcome is verified, or explicitly supersede it with the later checkpoint evidence.

### M0-C02 — Database foundation

- **Outcome / scope:** Add local Supabase CLI/project configuration and document the migration workflow without inventing application tables before domain and ownership requirements are agreed.
- **Status:** In review.
- **Changes:** Supabase CLI `2.120.0` added as a development dependency; `supabase/config.toml` added; migration workflow and directory guidance documented; seeding disabled (`enabled = false`, `sql_paths = []`); no placeholder application migration added.
- **Verification and result:** `npx supabase --version`, lint, TypeScript checking, formatting, production build, and E2E suite were reported as passing; E2E ran one test. A full local database migration run has **not** been verified because the local Supabase stack was not started.
- **Open issues / decisions:** Confirm database version/configuration against the eventual Supabase environment. `npm audit` reported five high-severity findings in the development ESLint/Next lint dependency tree; the suggested automatic fix would downgrade `eslint-config-next` to `14.2.35` and was not applied. Production-only audit was reported clean. Do not perform a major-version downgrade without a deliberate compatibility review.
- **Next action:** During M0-C04, start the local Supabase stack if available and verify migration tooling against a clean local database. If Docker or required credentials are unavailable, record that blocker and the exact alternative evidence needed; do not claim migrations passed.

### M0-C03 — Thungatha branding and starter-asset cleanup

- **Outcome / scope:** Replace the default starter landing page with the supplied Thungatha brand treatment and use the supplied icon for the App Router browser icon.
- **Status:** In review.
- **Changes:** Branded landing page uses `public/brand/thungatha-logo.svg`; `src/app/icon.svg` supplies the App Router icon; default starter assets and conflicting `src/app/favicon.ico` were reported removed.
- **Verification and result:** Local browser inspection confirmed page title “Thungatha”, visible logo at `/brand/thungatha-logo.svg`, icon link `/icon.svg`, and an HTTP 200 `image/svg+xml` response for `/icon.svg`. Lint, TypeScript checking, formatting, production build, and E2E suite were reported as passing; E2E ran one test. A hydration mismatch was traced to a browser extension injecting attributes into `<html>` and disappeared when that extension was disabled; do not suppress application hydration warnings to mask that external cause. An earlier cleanup command failed, although a later inspection reported the starter assets absent; verify current tree before asserting removal.
- **Open issues / decisions:** The one-test E2E suite does not prove all M0 criteria. Check whether the final page meets the agreed app-shell/responsive requirements; the current landing-page render alone is not sufficient evidence for all responsive states.
- **Next action:** During M0-C04, inspect the current working tree and verify the branded shell at agreed viewport sizes. Record the actual results and accept C03 only when its stated scope is verified.

### M0-C04 — M0 acceptance gap audit and closure

- **Outcome / scope:** Verify the remaining M0 exit criteria and close or explicitly block each gap before M1 begins. This is a verification-led checkpoint: inspect current implementation first, then implement only the missing work needed to meet the agreed foundation criteria.
- **Status:** In review — implementation and local checks are complete; external auth configuration and live database verification remain.
- **Required checks:**
  1. Reproduce documented local setup from a clean/reliable starting state and record commands/results.
  2. Verify Clerk sign-in/session handling and server-side identity resolution in protected paths.
  3. Verify user-owned reads/writes are scoped server-side and add/run cross-user isolation tests before user data features are built.
  4. Run Supabase migration tooling against a clean local database and verify repeatability; do not invent placeholder schema migrations.
  5. Verify API/request validation and safe error-handling conventions, and identify any missing M0 module boundaries.
  6. Verify app shell and design tokens at relevant responsive sizes.
  7. Run available lint, type, formatting, unit/component, build, and E2E checks; record unavailable checks separately from passing checks. Investigate the existing empty Vitest test-suite issue if still present rather than suppressing it or adding a meaningless test.
  8. Review dependency audit findings without applying incompatible automatic major-version changes.
- **Acceptance condition:** Every M0 exit criterion in the tracker has a pass result or an explicitly approved exception. Outstanding failures or unverified security/database criteria prevent M0 acceptance.
- **Changes:** Completed the M0 foundation in the existing app. Added Clerk App Router sign-in/sign-up routes, sign-out control, protected dashboard route, server-side Clerk identity resolution, and configuration notices. Added a responsive workspace shell with the existing Thungatha logo and tokens; future-milestone destinations are visibly unavailable. Added a private profile API with strict Zod input validation, safe errors, server-derived owner IDs, and a Supabase server client that passes the Clerk session token. Added the `profiles` migration with owner grants, primary key, RLS read/insert/update policies using Clerk JWT `sub`, and an `updated_at` trigger. Added setup documentation and `.env.example`; the existing `.env*` ignore rule covers local secrets. Switched from build-time Google Font downloads to a system font stack so builds do not depend on external font access.
- **Integration path selected:** Supabase's first-party Clerk third-party authentication with Clerk session JWTs and PostgreSQL RLS. The server uses the Clerk SDK token provider and only a Supabase publishable key. The local CLI config enables Clerk JWT verification through `CLERK_DOMAIN`. Clerk Dashboard integration and the `authenticated` role claim still require external setup. `DECISIONS.md` D-014 remains marked Open because this checkpoint updates only the implementation tracker; synchronize that record when decision-log changes are next in scope.
- **Verification and result:**
  - Passed: `npm run lint`, `npx tsc --noEmit`, `npm run format:check`, and `npm test` (3 files, 10 tests).
  - Passed: `npm run build -- --webpack` under Node 24.21.0. The normal `npm run build` (default Turbopack) failed because the environment denied a worker process port bind (`EPERM`); the Webpack build completed successfully.
  - Passed: `npm run test:e2e` against the production build with local network access (2 Chromium tests: branded public landing page and unauthenticated dashboard redirect/setup state). Clerk sign-in and signed-in browser flows were not tested because no Clerk keys were configured.
  - Passed: `npm audit --omit=dev --json` reported zero production vulnerabilities. `npm audit --json` reported five high-severity development-tree findings through `eslint-config-next` / `@next/eslint-plugin-next` / `fast-glob` / `micromatch` / `braces`; npm's suggested fix downgrades `eslint-config-next` to 14.2.35, a major-version change, and was not applied.
  - Not run: clean Supabase migration/reset. `docker info` confirmed no Docker daemon at `/Users/admin/.docker/run/docker.sock`. The Supabase CLI also could not write its telemetry file under `/Users/admin/.supabase` in the restricted run. No local database was started or reset.
  - Runtime: the default Node executable is 20.17.0, below the new declared minimum. The available Node 24.21.0 runtime was used for checks. Current dependency engine warnings also require at least Node 20.19 or 22.12 for this project dependency set.
- **Open issues / decisions:** Configure Clerk keys and its Supabase integration, including the `authenticated` JWT role claim and correct Clerk domain; configure a Supabase URL and publishable key; run the migration against a clean local database; test live RLS isolation and signed-in browser journeys. M0-C01 to C03 remain in review; M0 remains In progress. Do not start M1 until those M0 checks and user review are complete. The development dependency audit findings need a compatibility-safe resolution; do not apply npm's major downgrade automatically.
- **Next action:** Add the real Clerk and Supabase settings to the developer's local environment, enable Clerk third-party auth with the `authenticated` role claim, then run `npx supabase start` and `npx supabase db reset` with Docker available and verify Alice/Bob cross-user isolation against the live RLS policies. Do not mark M0 Accepted until those results and user review are recorded.

#### Follow-up verification — 2026-10-14

- **Code inspection:** `src/lib/auth/identity.ts` obtains `userId` and `getToken` from Clerk's server `auth()` call. `src/lib/supabase/server.ts` passes that token callback as Supabase's `accessToken` and uses only the publishable key. `src/lib/profile/repository.ts` filters reads by the server-resolved Clerk ID and writes that same ID. `src/app/api/profile/route.ts` returns 401 before repository access when there is no identity and validates PATCH input. The migration grants table operations only to `authenticated`, enables RLS, and checks `auth.jwt()->>'sub'` against `user_id` for select, insert, and update. These are code-inspection findings; they do not verify a live Clerk token or database policy execution.
- **Current local setup attempt:** Node 24.21.0 and npm 11.19.0 are available and meet `package.json` engine constraints. `.env.local` is absent, and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_DOMAIN`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are all missing from the process environment. `npm ci` was attempted but stalled without completing; it was interrupted. A subsequent offline `npm ci` also did not complete and was interrupted. The lockfile remains present; no application or dependency manifest changes were made.
- **Checks in this follow-up:** `npm run lint`, `npm run format:check`, and `npm test` each exited 127 because their local executables (`eslint`, `prettier`, `vitest`) were unavailable after the incomplete install. `npx tsc --noEmit` produced no result and was interrupted while waiting for dependencies. Build and E2E were not run in this follow-up because dependencies were unavailable. The passing checks recorded above are historical results from the prior checkpoint run, not results of this follow-up.
- **Live integration blockers:** `docker info` failed to connect to `/Users/admin/.docker/run/docker.sock`. With Docker unavailable, no fresh local database was started and no migration was applied. Clerk and Supabase credentials are absent, so no actual Clerk JWT claims, authenticated profile reads/updates, unauthenticated live request, or Alice/Bob cross-user request could be exercised. Existing Vitest route and repository tests are mocked unit tests; they are not live integration evidence.
- **Status:** Remains In review; M0 remains In progress. No M0 checkpoint is Accepted. No application code, dependency manifest, or other document was changed during this follow-up.
- **Next action:** Restore dependencies with `npm ci` under Node 24.21.0 (the attempt here did not complete), then configure the five required environment variables and Clerk's native Supabase integration with the `authenticated` role claim. Start Docker, apply the migration to a fresh local Supabase database, and run real Alice/Bob and unauthenticated profile requests before recording any acceptance decision.

## Milestone acceptance record

For each milestone, add a short acceptance record here only when the milestone reaches final review. Keep it in this file; do not create a separate review document by default.

**Milestone:** M0 — Product & Engineering Foundation  
**Status:** In progress — not yet accepted  
**Exit-criteria summary:** Local setup/app shell and basic branding have been demonstrated; several development checks were reported passing. Authentication and server-side ownership testing, clean-database migration repeatability, complete responsive verification, and full acceptance review are not yet evidenced in this tracker.  
**Known limitations:** See M0-C02 and M0-C03. Historical test results need confirmation if the code or dependencies have changed.  
**Acceptance decision:** Pending.  
**Next action:** Complete M0-C04, update checkpoint statuses based on evidence, demonstrate the foundation, and record the user's review before changing M0 to Accepted.

---

## Reusable checkpoint template

Use this compact structure for future records; remove unused prompts only when the information is genuinely not applicable.

### Mx-Cxx — Short outcome

- **Outcome / scope:**
- **Status:** Not started / In progress / Blocked / In review / Accepted
- **Changes:**
- **Verification and result:** List passed, failed, and not-run checks separately.
- **Open issues / decisions:**
- **Acceptance condition:** Observable condition that closes this checkpoint.
- **Next action:** One concrete task, or “None — checkpoint accepted”.

## Reusable milestone acceptance template

**Milestone:**  
**Status:** In review / Accepted / Blocked / In progress  
**Exit criteria:** Pass/fail/unverified against each agreed criterion.  
**Checks and browser journey:** Commands, results, viewport coverage, and regression evidence.  
**Security/data integrity:** Relevant authorization, ownership, privacy, and history checks.  
**Known limitations / approved exceptions:**  
**User review outcome:**  
**Acceptance decision:**  
**Next milestone or follow-up:**
