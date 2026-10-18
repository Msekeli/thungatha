# Thungatha — Master Implementation Plan

**Document status:** Draft for review  
**Purpose:** Master roadmap, milestone scope, dependencies, progress and acceptance tracking  
**Product:** Thungatha  
**Architecture:** Next.js modular monolith  
**Milestones:** M0–M6

---

## 1. Purpose of This Document

This document defines the implementation roadmap for Thungatha, from the completed application foundation through the integrated, production-ready product.

It is the authoritative source for:

- Overall milestone sequence and scope.
- Milestone dependencies and progress.
- High-level outcomes and completion criteria.
- Cross-milestone risks, decisions and blockers.
- Final product acceptance and release readiness.

Detailed checkpoint definitions, implementation tasks, test plans, evidence and checkpoint-level acceptance criteria belong in the corresponding milestone documents.

**Change control:** The agreed milestone sequence and scope must not be changed casually. If a genuine technical constraint requires a change, document the reason and obtain approval before changing the roadmap.

## 2. Product Overview

Thungatha helps job seekers discover relevant opportunities, understand how their experience fits those opportunities, prepare appropriate CVs, and manage their applications through to their outcomes.

The product is organised around three primary experiences:

1. **Job Discovery** — find, inspect, search, filter, save and dismiss job opportunities.
2. **CV Studio** — manage a master CV, assess existing CV versions and create tailored versions for specific opportunities.
3. **Job Tracking** — record applications, preserve submitted materials, track progress and outcomes, and manage follow-ups.

Supporting capabilities include Profile, Matching and Account.

The application will initially remain one Next.js application with a modular architecture, shared authentication and shared data infrastructure. The primary experiences must be accessible directly through their own routes without requiring the user to navigate through another experience first.

The product specification and architecture document will define these experiences and their technical boundaries in detail.

## 3. Overall Project Status

| Milestone | Name | Status |
|---|---|---|
| M0 | Foundation and Authentication | **Accepted — complete** |
| M1 | Job Discovery and Job Feed | In progress — C05 decision open; C06 cloud/RLS gates outstanding; C07/C08 in review; C09 audit underway |
| M2 | Profile and CV Import | Not started |
| M3 | Job Matching and Fit Analysis | Not started |
| M4 | CV Studio | Not started |
| M5 | Job Tracking | Not started |
| M6 | Account, Integration and Release Readiness | Not started |

### M0 — Official completion record

**Status: Accepted — complete.**

The user has confirmed that the foundation is fully working and complete. M0 is closed and must not be reopened because an older document contains an outdated status.

The existing authentication and database foundation, including Clerk and Supabase, is the starting point for subsequent milestones. Future work must preserve the working foundation and avoid unnecessary rewrites.

M0 completion does not automatically mean that later milestones, the integrated product or production release have been accepted.

### Current focus

M1 remains in progress. C04's database-side ingestion reliability path passed its scoped smoke test (see the dated record below). C05 remains open: the current provider adapters consume structured provider responses and normalize deterministically, and the repository does not yet establish a concrete need for AI extraction in M1. Record an explicit decision to omit AI extraction from M1 unless testing a permitted source reveals a specific gap. C06 authenticated Supabase smoke tests and real cross-user/RLS isolation are not evidenced. C07 remains in review pending hosted-data filter/pagination validation, responsive and keyboard/browser review, and user acceptance.

C08's application-activity migration `20261017000100_job_application_activity.sql` was applied by the user to hosted Supabase after a dry run showed only that migration pending. The user confirmed the persisted application reminder now works. GitHub Actions passed on `1687578a69734aaa85ed626ed5077cb7fef2fbfe`: TypeScript check, lint, 15 unit-test files / 105 tests, and production build. The workflow does not run Playwright. The current Playwright suite covers the landing page and authentication redirects, not the end-to-end Job Discovery journey.

Source approval remains unresolved. The decision log says Adzuna is excluded unless the user explicitly reopens that decision; the repository does not yet evidence final source-term and operational approval for the enabled Jooble/Greenhouse integrations. C09 audit is in progress. Do not accept M1 until the remaining source, cloud/RLS, browser, and user-review gates are resolved.

No future milestone or checkpoint may be marked complete without the required verification evidence and review.

## Architecture and Jobs refactor (separate from milestone acceptance)

The feature-based target structure is recorded in `docs/ARCHITECTURE.md` and `folder-structure.txt`, with the decision in `DECISIONS.md` (D-035). This documentation update does not change M1 scope, checkpoint status, or acceptance criteria and does not move application code.

The first structural work should focus on the Jobs feature only:
1. audit the public `/` and authenticated `/jobs` experiences, current API contracts, and tests;
2. identify shared types and pure utilities before extracting components;
3. preserve two separate discovery experiences and their different authentication capabilities;
4. migrate in small steps, preserving existing routes, response shapes, filtering, saved/dismissed state and activity behavior;
5. run the available quality gates and record actual evidence before proceeding.

This refactor is an implementation/maintainability task, not evidence that M1 is accepted. Do not mark any milestone checkpoint complete solely because files were reorganized.

## 4. Milestone Roadmap

### M0 — Foundation and Authentication

**Status: Accepted — complete**

**Outcome:** A functioning application foundation that supports authenticated users and shared data infrastructure.

Scope included the initial application setup, authentication integration, database foundation, initial profile persistence, and baseline development and verification conventions.

**Completion condition:** The user confirmed that the foundation is fully working and complete. This milestone is closed.

### M1 — Job Discovery and Job Feed

**Status: In progress**

**Outcome:** A usable, tested Job Discovery experience that presents real, persisted opportunities from approved sources.

Scope includes:

- Validating suitable job sources and their access terms.
- Establishing a normalized job data model and persistence.
- Building reliable source ingestion, refresh and deduplication.
- Providing job feeds, details, search and filters.
- Supporting save and dismiss actions with appropriate persistence and a short-lived, bottom-positioned Undo snackbar.
- Recording when a user opens an external application destination without treating the click as submission.
- Prompting users to confirm whether they applied when a previously opened role reappears, and persisting their explicit confirmation.
- Distinguishing the discovery source from the destination where a user applies.
- Handling unavailable sources, incomplete listings and errors honestly.
- Verifying security, reliability, accessibility and the end-to-end experience.

M1 does not include Profile-dependent match scores, CV tailoring or the complete application lifecycle. It does include a minimal explicit applied confirmation for roles opened from Discovery, so a user can record an application without returning from the external site. Opening an external application page must never itself imply submission.

**Dependency:** M0.

**Completion condition:** The agreed M1 scope works against persisted job records, required verification passes, limitations are documented, and the user explicitly accepts the milestone.

Detailed scope and checkpoint records belong in the M1 milestone document.

### M2 — Profile and CV Import

**Status: Not started**

**Outcome:** A reliable Profile containing confirmed professional information and an imported, reviewable master CV.

Scope includes:

- Defining the profile data contract and persistence.
- Allowing users to review and edit professional information.
- Importing CV files and extracting supported information.
- Presenting extracted information for user confirmation.
- Distinguishing confirmed information from unverified extraction.
- Handling incomplete profiles, import failures and corrections.
- Maintaining appropriate data ownership and privacy.

Profile becomes the source of truth for confirmed professional information used by downstream features. AI-extracted information must not silently overwrite confirmed data.

**Dependency:** M0. The existing foundation must remain intact.

**Completion condition:** Profile editing and CV import work reliably, extracted information is reviewable, and security, data integrity and acceptance checks pass.

Detailed checkpoints belong in the M2 milestone document.

### M3 — Job Matching and Fit Analysis

**Status: Not started**

**Outcome:** An explainable assessment of how a user's confirmed professional evidence aligns with a job's requirements.

Scope includes:

- Extracting and structuring job requirements.
- Mapping requirements to evidence in the user's Profile and CV.
- Calculating a deterministic, explainable fit estimate.
- Showing matched, partially supported, missing and unverifiable requirements.
- Explaining the evidence behind the assessment.
- Distinguishing confirmed information from inferred information.
- Integrating fit analysis into Job Discovery where appropriate.
- Testing scoring behaviour, edge cases and stale data.

The score is an estimate of fit, not a probability of being hired. Missing evidence must not automatically be treated as proof that the user lacks a qualification. Requirements that cannot be verified must be clearly distinguished from requirements with no supporting evidence.

**Dependencies:** M1 and M2.

**Completion condition:** Matching produces explainable, tested results based on available evidence and handles uncertainty honestly.

Detailed checkpoints belong in the M3 milestone document.

### M4 — CV Studio

**Status: Not started**

**Outcome:** A complete workflow for assessing, tailoring, reviewing, managing and exporting CV versions for specific opportunities.

Scope includes:

- Loading the master CV from Profile when available.
- Supporting CV upload when a master CV is not yet available.
- Accepting a job URL, pasted job description or a job selected from Discovery.
- Handling unreadable job URLs by asking the user to paste the description.
- Recommending whether to use the master CV, reuse an existing tailored version or create a new version.
- Allowing users to review and accept or reject recommendations.
- Supporting AI-assisted tailoring and a live preview.
- Managing versions and providing appropriate comparison and export workflows.
- Preserving the master CV and confirmed Profile information.

AI must not invent qualifications, credentials, employment history or experience. It must not silently overwrite the master CV or confirmed Profile data.

**Dependencies:** M2 and M3, with M1 providing the Discovery integration.

**Completion condition:** Users can prepare and review a job-specific CV, manage versions and export the chosen version without losing the integrity of their original information.

Detailed checkpoints belong in the M4 milestone document.

### M5 — Job Tracking

**Status: Not started**

**Outcome:** A reliable record of actual job applications and their complete lifecycle, from submission through the final outcome.

Scope includes:

- Recording applications to jobs found through Thungatha or externally.
- Capturing the employer, role, application date and source where known.
- Linking the CV version and submitted materials to the application.
- Tracking statuses and status history.
- Recording recruiter contacts, interviews, notes, follow-ups, rejections and offers.
- Providing application lists and detailed records.
- Providing a quick-recall view of what was submitted, what happened and what action is next.
- Linking relevant Discovery jobs and CV Studio versions without confusing discovery with application submission.

An application record is created when the user confirms a submission or explicitly records an application they already made. Discovering, saving or dismissing a job does not itself create an application record.

**Dependencies:** M1 for Discovery integration and M4 for CV version integration. M2 supplies confirmed Profile information where needed.

**Completion condition:** Users can reliably record applications, preserve the materials associated with them, update progress and review their outcomes.

Detailed checkpoints belong in the M5 milestone document.

### M6 — Account, Integration and Release Readiness

**Status: Not started**

**Outcome:** A coherent, secure, accessible and release-ready Thungatha experience across all implemented milestones.

Scope includes:

- Completing Account preferences and settings.
- Finalising the public landing page and overall navigation.
- Integrating Job Discovery, Profile, Matching, CV Studio and Job Tracking.
- Verifying authentication, authorisation and data isolation across the product.
- Reviewing privacy, data integrity and external-service configuration.
- Checking responsive behaviour, accessibility and performance.
- Completing cross-feature regression and production-readiness checks.
- Documenting deployment, configuration, known limitations and operational requirements.
- Demonstrating the integrated product for final user review.

This milestone integrates and verifies earlier work; it must not be used to conceal unfinished mandatory functionality from previous milestones.

**Dependencies:** M1, M2, M3, M4 and M5.

**Completion condition:** The integrated product passes its required release checks, remaining limitations are disclosed, and the user explicitly accepts the release.

Detailed checkpoints belong in the M6 milestone document.

## 5. Milestone Dependencies and Execution Order

The intended milestone sequence is:

**M0 → M1 → M2 → M3 → M4 → M5 → M6**

The main functional dependencies are:

- M1 establishes Job Discovery.
- M2 provides confirmed Profile information and the master CV.
- M3 uses job requirements and Profile evidence to calculate fit.
- M4 uses the master CV and job information to manage tailored CV versions.
- M5 links actual applications to relevant jobs and submitted CV versions.
- M6 verifies the integrated product and release readiness.

The sequence is the planning baseline. Dependencies must be respected, and any proposed change to milestone order or scope requires explicit review and approval.

## 6. Cross-Milestone Engineering Requirements

Every milestone must preserve the following requirements:

- **Preserve working functionality:** extend the existing application rather than replacing it without an approved reason.
- **Security:** enforce authentication, authorisation and user data isolation on the server and in the database where applicable.
- **Data integrity:** validate inputs, preserve meaningful history and avoid destructive updates without user intent.
- **AI boundaries:** validate AI output, protect credentials and personal information, and provide appropriate failure handling.
- **Accessibility and responsiveness:** verify keyboard use, focus, labels, layout and relevant screen sizes.
- **Testing:** run relevant unit, integration, API and end-to-end checks as appropriate to the milestone.
- **Evidence:** record commands actually run, results, known failures and unresolved limitations.
- **Documentation:** update the relevant architecture, decisions, setup and milestone records when implementation changes them.
- **User acceptance:** do not treat code completion alone as milestone acceptance.

## 7. Progress and Acceptance Rules

Use only these status values:

- **Not started**
- **In progress**
- **Blocked**
- **In review**
- **Accepted**

A checkpoint is accepted only when its required work, verification evidence and review are complete. A milestone is accepted only when all mandatory checkpoints and acceptance criteria are satisfied, or any exception has been explicitly approved and documented.

Update the detailed milestone document first when a checkpoint changes. Then update this master plan's milestone status, evidence summary and next action.

Never fabricate verification evidence, silently change agreed scope, or mark work complete because it is planned or partially implemented.

## 8. Final Product Acceptance

Thungatha is ready for final release only when:

- All mandatory milestones are accepted.
- The three primary experiences work together as agreed.
- Profile and Account capabilities work as specified.
- Authentication, authorisation and user data isolation have been verified.
- Core workflows have passed their required tests.
- AI and external-service failures are handled appropriately.
- Accessibility, responsiveness, performance and privacy have been reviewed.
- Setup, configuration, deployment and known limitations are documented.
- The integrated product has been demonstrated and explicitly accepted by the user.

**M0 is already complete.** Final product acceptance remains a separate decision that depends on completing and verifying the remaining milestones.

---

## 9. Document Ownership

| Document | Responsibility |
|---|---|
| `IMPLEMENTATION-PLAN.md` | Overall roadmap, milestone summaries, dependencies and status |
| `docs/PRODUCT-SPECIFICATION.md` | Product behaviour, features and user workflows |
| `docs/ARCHITECTURE.md` | Application structure, technology choices, security and data access |
| `DECISIONS.md` | Approved decisions and their rationale |
| `AGENTS.md` | Instructions for AI coding agents |
| `milestones/Mx-.../` | Detailed milestone scope, checkpoints, evidence and acceptance |
| `README.md` | Project introduction, setup and development commands |

This document governs the overall roadmap. It does not replace the detailed milestone specifications.

## M1-C07 — Job Discovery local verification update (2026-10-16)

**Status: In review — local quality checks passed; checkpoint not yet accepted.**

The user ran the local quality suite on branch `dev` after pulling the latest changes:

- `npx tsc --noEmit`: passed (no TypeScript errors).
- `npm run lint`: passed with 0 errors and 3 warnings for unused destructured props in the component-test button mock.
- `npm test`: passed — 14 test files and 94 tests.
- `npm run build`: passed — optimized Next.js production build completed.
- `npm run test:e2e`: passed — 2 Playwright tests.

The first test run before the latest assertion correction had one failure because the word “Greenhouse” appears in both the job card and selected details panel. The test now allows multiple matching source labels; no application code was changed for this correction. The latest fix was committed to `dev` as `6fef2c038bd90537b955286ba20ffed249bee843`.

**Remaining evidence before C07 acceptance:** confirm GitHub Actions is green for the latest commit; complete the required browser/responsive and keyboard checks; verify combined filters, counts and publication-date behaviour against a controlled authenticated Supabase dataset; record explicit user review. C06's authenticated cloud checks and cross-user/RLS isolation also remain outstanding. Do not mark C07 or M1 Accepted based only on the local suite.

## M1-C04 — Job ingestion reliability checkpoint (2026-10-16)

**Status: database-side checkpoint verified.** The production Supabase migration `20261016000100_job_ingestion_reliability.sql` was applied successfully. Local and remote migration history matched, and `supabase db lint --linked --schema public` reported no schema errors.

The SQL smoke test returned `PASS`: one record received, one job inserted, one source record created, zero updates, zero skipped records, and the ingestion run status was `succeeded`. The test transaction ended with `ROLLBACK`; a follow-up count confirmed zero retained smoke-test runs and source records.

**Scope of evidence:** this verifies the tested database RPC path only. It does not establish that every provider integration, scheduled execution, or the full application ingestion pipeline has been end-to-end verified. Do not repeat C04 checks unless a concrete failure appears.

**C05 status:** Under investigation — no AI extraction implementation is approved yet. The decision is deferred until the source/content audit establishes a concrete need. Do not mark C05 accepted or imply that investigation is complete.

**Next active checkpoint:** M1-C06 — Discovery query and action contracts. Backend/API implementation has started on `dev`; see the detailed milestone record for endpoint scope and verification status. C05 remains open and must be resolved before M1 acceptance.


## M1-C05 status update — 2026-10-16

**Status: Under investigation; implementation decision pending.** The checkpoint will determine whether any concrete job-content extraction gap justifies AI. No AI extraction feature is approved or claimed complete. Deterministic validation, normalization, deduplication and persistence remain authoritative, and Discovery must remain usable with AI disabled.

**Sequencing decision:** proceed with M1-C06 — Discovery query and action contracts, because its documented scope is API/data-operation work and does not require AI extraction. C05 remains open; this does not change the M1 checkpoint requirements or constitute C05 acceptance.

## M1-C06 status update — 2026-10-16

**Status: In progress — local verification passed; cloud acceptance gates outstanding.** The C06 API implementation is on `dev` at `cbeb21dc06a2a44e402c4f4712caf5f00fb235ea`. The local working tree was clean and aligned with `origin/dev`.

**Local verification completed by the user:**
- `npx tsc --noEmit` — passed.
- `npm run lint` — passed.
- `npm test` — 13 test files passed; 82 tests passed. Expected stderr from tests simulating Clerk/database failures did not fail the suite.
- `npm run build` — passed on Next.js 16.4.0; the previous API prerender warning did not recur.

The implementation covers the persisted jobs feed, query filtering and pagination, job details, saved/dismissed state transitions, malformed inputs, inactive listings and user-scoped state deletion. State changes are restricted to active listings. The API routes defer request-dependent work until request time. C06 remains API-only; the Discovery UI belongs to C07.

**Outstanding acceptance gates:** an authenticated cloud smoke test of feed and detail reads, plus cross-user/RLS isolation verification for user-specific state. These have not been performed, so do not describe C06 as fully accepted or claim cloud security verification. Do not write to production user state merely to complete this checkpoint; use an approved isolated test-data strategy for state mutations.

No provider ingestion was re-run and no production database changes were made during this C06 code work. Do not repeat the successful local checks unless a concrete code change or failure warrants it.


## M1-C07 — Job Discovery UI (2026-10-16)

**Status:** In review — UI implementation committed to `dev`; local verification and user review pending. Remote commit chain on `dev` contains 11 checkpoint edits after the C06 baseline; `main` is unchanged.

**Implemented:** The `/jobs` placeholder now uses C06's persisted feed/detail API. The UI provides keyword/employer, location, country, work-mode and employment-type filters; paginated results; selected-job details; loading, empty, error, retry and missing-detail states; keyboard-operable selectable cards; responsive small-screen detail navigation; and distinct original discovery-source and application-destination links.

**Reused:** `GET /api/jobs`, `GET /api/jobs/[id]`, shared `Button`, and the existing CSS design tokens. No new dependencies, endpoint, or database schema were added. No mock job data, matching percentages, M5 application state, manual job entry, or save/dismiss state writes were added.

**Files changed:** `src/app/jobs/page.tsx`, `src/components/jobs/jobs-discovery.tsx`, `src/components/jobs/jobs-discovery.test.tsx`, `src/styles/components.css`, `milestones/M1-JOB-DISCOVERY-AND-JOB-FEED.md`, `IMPLEMENTATION-PLAN.md`.

**Verification:** Remote file/diff inspection confirms the six intended files are present on `dev`. This is repository inspection only, not a code execution check. A component test suite was added but has not been executed in a local checkout. `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`, and browser tests were not run through the remote-edit workflow. C06 authenticated Supabase smoke and cross-user isolation checks remain outstanding.

**Next action:** Pull latest `origin/dev` locally without discarding work, inspect the diff, run all quality gates and responsive/keyboard browser checks, fix any observed defects, and return for user review. Do not merge to `main` or mark C07 Accepted without verification and explicit acceptance.
