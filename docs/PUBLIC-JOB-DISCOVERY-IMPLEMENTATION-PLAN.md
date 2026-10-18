# Public Job Discovery Landing Page — Implementation Plan

**Target branch:** `dev`  
**Status:** In progress  
**Product decision:** Replace the public root landing page with public Job Discovery. Preserve the existing authenticated workspace and preserve the existing landing page's background, palette, gradients, theme tokens, and brand identity.

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
- [ ] Read remaining project instructions, product specification, architecture, decision log, and relevant milestone acceptance criteria.
- [ ] Commit this plan and checklist to `dev`.

### Stage 2 — Public landing and visual design
- [ ] Replace the root landing experience with the approved Job Discovery design.
- [ ] Preserve the existing hero background, colour palette, gradients, theme tokens, typography and brand assets.
- [ ] Add prominent job search, location/search filters, job results, selected-job details and responsive layouts.
- [ ] Keep CV Studio, Job Tracking and Saved Jobs visible as feature navigation/calls to action.
- [ ] Use small, focused components and existing design-system primitives.
- [ ] Preserve current theme-toggle behaviour and accessible contrast.

### Stage 3 — Anonymous job discovery
- [ ] Permit unauthenticated GET access to the public jobs feed and job details.
- [ ] Reuse existing filtering, validation, provenance and active-listing logic.
- [ ] Ensure anonymous responses contain only public job/listing fields; never user state or activity.
- [ ] Keep save/dismiss, activity, profile and all personal-data endpoints authenticated.
- [ ] Verify Supabase grants and RLS policies support public reads safely; make no unsafe policy changes.
- [ ] Update API tests for anonymous, authenticated, invalid and failure cases.

### Stage 4 — Feature promotion and authentication
- [ ] Add a non-blocking, dismissible promotion for account features.
- [ ] Prompt sign-in/sign-up when a logged-out visitor chooses a restricted action.
- [ ] Preserve the intended feature/job destination through authentication.
- [ ] Ensure authentication prompts are not shown for public browsing or employer application links.
- [ ] Do not present not-yet-implemented features as operational; label unavailable capabilities accurately.

### Stage 5 — Preserve the authenticated workspace
- [ ] Verify the authenticated Job Discovery screen retains its current layout and behaviour.
- [ ] Verify authenticated navigation and return destinations.
- [ ] Verify Apply remains usable for logged-out visitors and does not falsely mark a user as having applied.
- [ ] Check public and authenticated routes do not create duplicate job systems.

### Stage 6 — Verification and final review
- [ ] Run lint.
- [ ] Run unit tests.
- [ ] Run production build.
- [ ] Run relevant Playwright/e2e checks where environment support allows.
- [ ] Review GitHub Actions results and inspect failures rather than assuming success.
- [ ] Test desktop/mobile layouts, dark/light themes, keyboard access, loading/empty/error states and scroll behaviour.
- [ ] Record final commits, test evidence, remaining issues and deployment notes.

## Execution log

| Stage | Status | Evidence / notes |
|---|---|---|
| 1. Repository baseline and plan | In progress | Confirmed public repository and `dev` branch. Inspected root page, jobs page, feed/detail/state/activity API routes, Clerk identity helper, theme setup and package scripts. |
| 2. Public landing and visual design | Not started | |
| 3. Anonymous job discovery | Not started | |
| 4. Feature promotion and authentication | Not started | |
| 5. Preserve authenticated workspace | Not started | |
| 6. Verification and final review | Not started | |

## Completion policy

A checklist item is only marked complete after the relevant implementation has been inspected and the appropriate validation evidence has been collected. If a test cannot be run in the available environment, record that limitation explicitly. Do not mark a whole stage complete while an acceptance criterion remains unverified.
