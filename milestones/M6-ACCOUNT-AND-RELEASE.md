# M6 — Account, Integration and Release Readiness

**Status:** Not started  
**Outcome:** A coherent, secure, accessible and release-ready product across the agreed Thungatha experiences.  
**Design references:** The supplied Job Discovery, CV Studio, Job Tracking and record-application screens; landing-page design to be defined in its own review.  
**Dependencies:** M1–M5 accepted, with M0 foundation preserved.

## Purpose and scope

Finish Account settings, public landing-page/navigation work and cross-feature integration. M6 is an integration and release milestone, not a substitute for unfinished mandatory functionality in earlier milestones.

The product remains one Next.js modular monolith initially. The three primary experiences—Job Discovery, CV Studio and Job Tracking—must be directly accessible through their own routes and must gracefully handle missing upstream data. Profile and Account remain supporting experiences.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Record actual verification evidence and user review for each checkpoint.

## Checkpoints

### M6-C01 — Account and preferences requirements
**Goal:** define the account-level settings needed for the initial product.

**Work**
- Identify required user preferences, appearance settings, notification/follow-up preferences if implemented, privacy controls and account actions.
- Separate account settings from professional Profile information.
- Define which preferences are local UI settings versus persisted user settings.
- Avoid adding speculative settings with no supported user workflow.

**Exit criteria**
- Account scope and data ownership are documented and approved.
- Account is distinct from Profile and does not duplicate professional data.

### M6-C02 — Account settings implementation
**Goal:** provide the agreed account preferences and controls.

**Work**
- Implement the Account route using the established design system.
- Persist settings that are intended to follow the user across sessions/devices.
- Provide validation, save/cancel, loading, success and error states.
- Ensure appearance preferences integrate with existing theme infrastructure.

**Exit criteria**
- Settings persist according to the agreed contract.
- Users can distinguish saved preferences from unsaved changes.
- Access control and UI states are tested.

### M6-C03 — Authentication and access-control audit
**Goal:** verify that the integrated product preserves secure identity and data ownership.

**Work**
- Review Clerk integration, route protection, server-side identity, Supabase access and RLS.
- Check all private routes, API handlers, server actions, file storage and background jobs.
- Verify that client-provided user IDs are never trusted as authorization.
- Review secret handling, environment configuration, session expiry and account deletion implications.

**Exit criteria**
- Cross-user access tests pass for every private data area.
- No critical authorization, secret-exposure or data-isolation issue remains.
- Exceptions are documented and explicitly reviewed.

### M6-C04 — Landing page and navigation
**Goal:** introduce Thungatha clearly and route users to the right experience.

**Work**
- Design/update the public landing page to explain Job Discovery, CV Studio and Job Tracking.
- Provide clear entry points and appropriate sign-in/sign-up actions.
- Define public versus authenticated actions; private user data must remain protected.
- Add authenticated workspace navigation with the three primary experiences and supporting Profile/Account navigation.
- Keep the supplied screen designs consistent with the established visual system.

**Exit criteria**
- Public visitors understand the product and can reach authentication.
- Authenticated users can navigate directly to all primary routes.
- The landing page does not imply features that are not implemented.

### M6-C05 — Cross-feature integration
**Goal:** verify the three primary experiences operate as one coherent product.

**Work**
- Connect Discovery jobs to CV Studio inputs and to Job Tracking records where applicable.
- Connect Profile/master CV data to Matching and CV Studio.
- Connect match assessments to Discovery and tailoring recommendations without blocking core experiences on AI.
- Connect accepted CV versions to the actual application record.
- Verify empty/missing upstream data paths and direct route entry for each experience.

**Exit criteria**
- Cross-feature links resolve to the correct records.
- A user can start in any primary experience without being forced through another first.
- Missing Profile, missing job data, unavailable AI and removed listings have graceful behaviours.

### M6-C06 — Security, privacy and data integrity review
**Goal:** review end-to-end handling of user and application data.

**Work**
- Review personal-data minimisation, CV/job-description transmission to AI providers, retention and deletion.
- Check external URL fetching, SSRF protections, file handling, logs and error messages.
- Verify submitted CV snapshots/references are not silently changed.
- Review database constraints, migrations and destructive-operation safeguards.
- Confirm external integrations comply with approved terms and attribution.

**Exit criteria**
- No critical security or data-loss issue remains.
- Sensitive data is not unnecessarily logged or sent to providers.
- Data retention and unresolved privacy limitations are documented.

### M6-C07 — Accessibility, responsiveness and performance
**Goal:** verify the product is usable across supported screen sizes and input methods.

**Work**
- Test keyboard navigation, visible focus, labels, contrast and semantic structure.
- Test supplied light/dark screen designs at supported breakpoints.
- Review loading states, long job descriptions, empty lists and validation errors.
- Measure key performance behaviour and address regressions that materially affect core journeys.

**Exit criteria**
- Core workflows are operable by keyboard and screen layouts remain usable at supported sizes.
- Critical accessibility or performance defects are resolved or explicitly accepted as limitations.
- Evidence is recorded.

### M6-C08 — Production and operational readiness
**Goal:** ensure the app can be configured, deployed and operated responsibly.

**Work**
- Verify required environment variables and safe configuration defaults.
- Document deployment, database migrations, secrets, external providers, quotas and cost risks.
- Confirm logs and operational errors are useful without exposing secrets or personal data.
- Document backup/recovery expectations, failure handling and known limitations appropriate to the chosen hosting setup.
- Verify production build and deployment smoke checks.

**Exit criteria**
- Deployment and migration instructions are reproducible.
- Required integrations and their costs/limits are documented.
- No unapproved service or ongoing cost is required for core functionality.

### M6-C09 — Full regression and final acceptance
**Goal:** demonstrate the complete integrated product and obtain explicit release approval.

**Work**
- Run all relevant format, lint, type-check, unit, integration, API, browser, build and smoke checks; record actual results.
- Walk through Job Discovery, Profile/CV Import, Matching, CV Studio, external application recording, Job Tracking and Account.
- Test source/AI outages, authorization boundaries, missing data and recovery paths.
- Review documentation, known limitations and release configuration.
- Demonstrate the product and obtain explicit user acceptance.

**Acceptance criteria**
- All prior milestones are accepted and integrated.
- Core workflows work end to end with truthful state and no fabricated data.
- No known critical security, data-loss or core-journey defect remains.
- Verification evidence and remaining limitations are documented.
- The user explicitly accepts the final release.
