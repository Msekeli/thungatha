# Thungatha — Implementation Plan and Checkpoint History

This is the single cumulative tracker for milestone status and meaningful implementation checkpoints. Keep the history in this file; do not create a separate file for every small task. Add a separate record only if a checkpoint is unusually complex and needs substantial evidence.

## Status definitions

- **Not started** — work has not begun.
- **In progress** — active implementation.
- **Blocked** — cannot proceed without resolving a named dependency or decision.
- **In review** — implementation is ready for verification or user review.
- **Accepted** — all agreed exit criteria were verified and the result was reviewed.

A green build alone does not mean a checkpoint or milestone is Accepted.

## Delivery rules

Each checkpoint must state:
- ID and milestone
- intended outcome and scope
- implementation summary
- verification performed and actual result
- files/areas affected when useful
- blockers, limitations, and decisions
- acceptance status and next step

Group related small edits into one testable checkpoint. Do not log every command. Never claim checks that were not run. Update this document after meaningful progress, not just at the end of a milestone.

For each milestone, deliver a complete vertical slice: database/schema and migrations where needed, domain/application behaviour, verified APIs, connected UI, automated tests, browser/responsive verification, regression checks, and updated documentation.

## Milestone tracker

| Milestone | Scope | Status | Exit condition |
|---|---|---|---|
| M0 — Product & Engineering Foundation | Repo conventions, documented local setup, environment handling, Clerk auth, Supabase PostgreSQL, repeatable migrations, server-side user scoping, tests, module boundaries, API/error handling, responsive app shell and design tokens | Not started | Setup is reproducible; auth and ownership are tested; migrations and checks are repeatable; app shell works; conventions and blockers are documented |
| M1 — Job Discovery & Job Feed | Searchable/filterable feed, job details, save/dismiss/undo, manual entry, normalization/deduplication, source validation, availability history, provider error/retry handling | Not started | Users can complete the job-discovery journey with real persisted behaviour; manual entry works without external-source availability; source and failure behaviour are tested |
| M2 — Professional Profile & CV Import | Profile sections/versioning, CV import draft, uncertainty handling, review and confirmation | Not started | Imported data remains a draft until user review; confirmed profile data and version history are persisted and tested |
| M3 — Job Matching & Fit Analysis | Requirement extraction/classification, evidence-backed assessments, deterministic scoring, explainability, stale-state handling | Not started | Assessments are traceable to confirmed evidence and job requirements; unknown/partial states and stale scores behave as specified |
| M4 — CV Studio | Master/tailored CVs, proposed edits, accept/reject, evidence traceability, comparison and export | Not started | User-controlled, traceable CV changes and export work; generated content does not invent experience |
| M5 — Application Management | Application records, status/event history, follow-ups/notes, submitted-material snapshots | Not started | User can track applications and history; status changes are controlled; submitted CV snapshot is immutable |
| M6 — Preferences, Hardening & Release | Preferences/filter rules, data export/deletion, security, accessibility, performance, operational readiness and release | Not started | Critical journeys, ownership, data controls, responsive/accessibility behaviour, monitoring and release checks meet agreed criteria |

## Checkpoint history

Append new entries below. Keep older entries intact. The first entry should be added only after repository inspection and actual work begins.

### Checkpoint template

**Checkpoint ID:** `M0-C01`  
**Milestone:** M0 — Product & Engineering Foundation  
**Outcome:**  
**Status:** Not started / In progress / Blocked / In review / Accepted  
**Changes:**  
**Verification:**  
**Result/evidence:**  
**Open issues or decisions:**  
**Next checkpoint:**  

---

## Milestone acceptance review

At the end of each milestone, record:
- acceptance criteria and pass/fail status
- automated test/build/lint results actually observed
- browser journey and responsive states verified
- regression tests performed
- known limitations and deferred work
- documentation and decision-log updates
- user review outcome

Do not mark a milestone Accepted while a required criterion is unverified or failing. Record exceptions explicitly and obtain approval before changing the agreed scope.

### Checkpoint record — M0-C02: Database foundation

**Status:** In review  
**Scope:** Add the local Supabase CLI and project configuration; document the SQL migration workflow without inventing application tables.  
**Implemented so far:** Supabase CLI `2.120.0` installed as a development dependency; `supabase/config.toml` generated; migration directory guidance and local database instructions added; seeding is disabled with `enabled = false` and `sql_paths = []`; no placeholder migration exists.  
**Verification:** `npx supabase --version`, lint, TypeScript checking, formatting, production build, and the E2E suite completed successfully. The E2E suite ran one test and passed. Full local database migration execution has not been verified; it requires the local Supabase stack.  
**Security note:** `npm audit` reports five high-severity findings in the existing ESLint/Next.js lint dependency tree. The suggested automatic fix downgrades `eslint-config-next` to `14.2.35`; that downgrade was not applied.  
**Acceptance still required:** Review the diff, run project checks, and verify local database migration execution when Docker is available. Do not mark this checkpoint Accepted until verification is complete and the user has committed it through VS Code Source Control.

### Checkpoint record — M0-C03: Starter asset cleanup

**Status:** In review  
**Scope:** Remove unused Next.js starter assets and integrate the supplied Thungatha brand assets into the app shell and browser icon.  
**Changes:** Replaced the default starter page with a branded Thungatha shell using `public/brand/thungatha-logo.svg`; added `src/app/icon.svg` for the App Router favicon convention; removed the conflicting default `src/app/favicon.ico` and unused `public/next.svg`, `public/vercel.svg`, `public/globe.svg`, and `public/file.svg`. The remaining `public/window.svg` has no references but was not removed because it is not a standard Next.js starter asset and its ownership is not established.  
**Verification:** Confirmed no application or source references remain to the removed assets or `favicon.ico`. Lint, TypeScript checking, formatting, production build, and the E2E suite passed. The E2E suite ran one test and passed.  
**Open issues or decisions:** The E2E dev server still reports the existing Next.js cross-origin HMR warning for `127.0.0.1`; it does not fail the test.  
**Next checkpoint:** User review of the M0-C03 diff.
