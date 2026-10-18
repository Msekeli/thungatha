# Public Job Discovery Landing Page — Implementation Plan

**Target branch:** `dev`  
**Status:** Implementation in review; CI and local verification outstanding  
**Product decision:** Replace the public root landing page with public Job Discovery. Preserve the existing authenticated workspace and preserve the existing landing page's background, palette, gradients, theme tokens, and brand identity.

## Follow-up architecture note — Jobs feature organization

The current file paths listed in this document describe the implementation at the time it was written. The agreed target is now feature-based: `src/features/jobs/` will own the public and authenticated discovery experiences and genuinely shared client/types/utils code, while Next.js routes and API Route Handlers remain under `src/app/`. The existing source paths must not be moved until a separate, incremental refactor is started.

The public page at `/` and authenticated page at `/jobs` remain distinct experiences. Share only proven common behavior; preserve user-specific state and activity behind server-side authentication and authorization. This note does not change the plan's acceptance criteria or imply that pending verification has passed.

## Non-negotiable boundaries

- The root route becomes the public Job Discovery experience; do not maintain two competing landing pages.
- Logged-out visitors can search, filter, inspect full job descriptions, and follow a valid employer application destination without signing in.
- CV Studio, Saved Jobs, Job Tracking, profile and other account-specific capabilities remain visible as product value propositions. Restricted actions prompt authentication.
- Use the existing job catalogue, search rules, source provenance, components and APIs where suitable. Do not introduce a second job data source.
- Keep all user-specific mutations and records protected by Clerk identity and Supabase row-level security. Never expose service-role credentials or user activity through public routes.
- Preserve the current authenticated workspace's layout and behaviour. Only make changes required for public access, routing, and authentication boundaries.
- Marketing prompts must be dismissible and must not block scrolling or cover critical job actions.
- Preserve sign-in return destinations for restricted feature links.
- Do not claim checks passed without recorded command/CI evidence.

## Checkpoints and acceptance criteria

### Stage 1 — Repository baseline and plan

- [x] Confirm repository and target branch.
- [x] Inspect the current root landing page, Job Discovery route, feed/detail/state/activity APIs, auth identity helper, theme setup and package scripts.
- [x] Add this implementation plan and checklist to `dev`.
- [ ] Read remaining project instructions, architecture decision log, and relevant milestone acceptance criteria.

**Status:** In review — plan committed at `b8bf065c19e2da036e4441759d0817720cf7e80e`; baseline review also used product specification, architecture, decision log and M1 milestone documentation.

### Stage 2 — Public landing and visual design

- [x] Replace the root landing experience with the approved Job Discovery design.
- [x] Reuse existing theme tokens, brand mark and `.th-hero-bg` landing background treatment.
- [x] Align discovery page spacing, header sizing, left-aligned hero and panel treatment with the original landing page's design language.
- [x] Add job search, location search, work-arrangement filter, job results and selected-job details.
- [x] Add feature cards for CV Studio, Job Tracking and Saved Jobs.
- [x] Add responsive layouts and a dismissible, session-persisted account promotion.
- [ ] Verify desktop/mobile layouts, theme contrast, keyboard access and scrolling in a running browser.

**Files:** `src/app/page.tsx`, `src/components/jobs/public-job-discovery.tsx`, `src/components/jobs/public-job-discovery.css`  
**Status:** In review — implementation committed; visual/browser verification pending.

### Stage 3 — Anonymous job discovery

- [x] Allow unauthenticated GET access to the public jobs feed and job details at the API layer.
- [x] Use a Supabase publishable-key client for anonymous reads; no service-role key is used.
- [x] Keep user-specific state reads conditional on a verified Clerk identity.
- [x] Add a migration granting anonymous SELECT only for jobs with active sources and active source rows.
- [x] Leave save/dismiss and activity mutations protected by existing authenticated handlers.
- [x] Update feed and detail API tests to cover anonymous reads.
- [ ] Run API tests and verify the migration against the target Supabase environment.
- [ ] Confirm production RLS behaviour and public response fields with live integration checks.

**Files:** `src/lib/supabase/server.ts`, `src/app/api/jobs/route.ts`, `src/app/api/jobs/[id]/route.ts`, `supabase/migrations/20261018000100_public_job_discovery_reads.sql`, related API tests.  
**Status:** In review — code and migration committed; tests and database migration have not yet been confirmed successful/applied.

### Stage 4 — Feature promotion and authentication

- [x] Keep CV Studio, Job Tracking and Saved Jobs visible to visitors.
- [x] Add a dismissible, non-blocking promotion; dismissal persists for the current browser session.
- [x] Add a sign-in path for saving a job and feature links that route into protected areas.
- [ ] Verify intended destination is preserved consistently through sign-in/sign-up and after Clerk redirects.
- [ ] Ensure not-yet-implemented capabilities are not presented as operational.
- [ ] Test configured and unconfigured Clerk states.

**Status:** In progress — basic UI and access paths exist; full redirect behaviour needs verification.

### Stage 5 — Preserve the authenticated workspace

- [x] Keep the existing `/jobs` authenticated workspace route and its component intact.
- [x] Keep the current route protection for `/jobs`, CV Studio, Job Tracking, Profile and Account.
- [ ] Verify authenticated Job Discovery retains its existing layout and behaviour in a running app.
- [ ] Verify Apply remains usable to logged-out visitors and does not falsely mark a user as having applied.
- [ ] Verify public and authenticated routes do not create duplicate job systems.

**Status:** In review — no workspace component redesign was made; runtime regression checks remain.

### Stage 6 — Verification and final review

- [x] Add end-to-end assertions for the new public landing page.
- [ ] Run lint.
- [ ] Run unit tests.
- [ ] Run production build.
- [ ] Run relevant Playwright/e2e checks where environment support allows.
- [ ] Review GitHub Actions results and inspect failures rather than assuming success.
- [ ] Test desktop/mobile layouts, dark/light themes, keyboard access, loading/empty/error states and scroll behaviour.
- [ ] Record final commits, test evidence, remaining issues and deployment notes.

**Status:** In progress — GitHub Actions was observed running after the API-test commit; final result has not yet been confirmed.

## Execution log

| Stage                                   | Status      | Evidence / notes                                                                                                                                                                                                                                                                                   |
| --------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Repository baseline and plan         | In review   | Plan committed; inspected routes, APIs, auth helper, theme tokens, product spec, architecture and M1 milestone.                                                                                                                                                                                    |
| 2. Public landing and visual design     | In review   | Root page renders public discovery using existing tokens/background. Follow-up CSS commit `bd9529bbbfbacd33655645877169664a24d0c75e` restores the original landing page's left-aligned hero, content width, header spacing and restrained panel styling; browser verification remains outstanding. |
| 3. Anonymous job discovery              | In review   | Feed/detail endpoints support anonymous reads via publishable key; RLS migration and tests added. Database migration and test outcomes are not yet confirmed.                                                                                                                                      |
| 4. Feature promotion and authentication | In progress | Feature links, save-job sign-in path and dismissible promotion implemented; redirect behaviour still needs verification.                                                                                                                                                                           |
| 5. Preserve authenticated workspace     | In review   | Existing `/jobs` route and workspace component were not redesigned; runtime verification outstanding.                                                                                                                                                                                              |
| 6. Verification and final review        | In progress | E2E assertions added; CI result and test suite still need checking.                                                                                                                                                                                                                                |

## Commits created on `dev`

- `b8bf065c19e2da036e4441759d0817720cf7e80e` — implementation plan.
- `6307b239570d07a0e7b6bd2673bdb0f6e8caf193` — public Supabase read client.
- `54f5e6c8c7c38f5d0816ed40148c488065081070` — anonymous job feed reads.
- `c2b3fb6da0de4cf20d711c606c3b465122e30446` — anonymous job detail reads.
- `a2cc20a914b2801b9487a6756da602fc45e98047` — public read RLS migration.
- `6c2df2f9a3332a8f396b08a4e18feb1f8ce0200c` — public Job Discovery component.
- `27957f6c067dee4388c39be6999613434738783a` — public Job Discovery styling.
- `0d13b018ecd51e374ba56287b899319522298382` — root landing page replacement.
- `3a3a98fc9b0f2f357b353fa021b085a6678dea2d` — anonymous feed API tests.
- `b5462768069d2ac6c0fada0fe41a15b095d970e3` — anonymous detail API tests.
- `d409a3913261854bc748c749597eee9699f98922` — qualify public RLS policy correlation.
- `553d24aa537d48caa910ec0ced63e1d765ca8546` — public landing E2E assertions.
- `bd9529bbbfbacd33655645877169664a24d0c75e` — align public discovery styling with the original landing page design language.

## Completion policy

A checklist item is only marked complete after the relevant implementation has been inspected and the appropriate validation evidence has been collected. If a test cannot be run in the available environment, record that limitation explicitly. Do not mark a whole stage complete while an acceptance criterion remains unverified.
