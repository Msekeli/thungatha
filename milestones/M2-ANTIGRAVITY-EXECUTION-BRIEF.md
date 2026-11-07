# M2 — Antigravity Execution Brief

**Working branch:** `dev`  
**Status:** In progress — C02/C03 accepted; C04 implementation prepared on 2026-10-24 and awaiting user review. Continue one approved checkpoint at a time.

## Read first

Read `AGENTS.md`, `milestones/M2-PROFILE-AND-CV-IMPORT.md`, `Project Documentation/PRODUCT-SPECIFICATION.md`, `Project Documentation/ARCHITECTURE.md`, and `Project Documentation/FOLDER-NAMING-AND-API-ROUTE-MAP.md`.

Approved visual reference: **Thungatha M2 — Profile & CV Import Mockups.pdf** (10 pages). Claude artifact: https://claude.ai/artifact/Dj3quS5CuzDY2bB2zkeu1g . If the PDF is not available in the checked-out repository, report that; do not claim to have inspected a local copy. Use the reference for visual appearance and states, not as proof of backend behaviour.

## Starting condition: backend does not exist yet

Treat this as a new backend capability. Do not assume a functional Profile API, database schema, migrations, repository/data-access layer, CV storage, or extraction service exists. Inspect the actual branch and verify each item. Existing UI or scaffolding is not proof of a working backend. Start with backend/data readiness and the contract; do not start by wiring the mockup to an assumed API.

Preserve the established Clerk/Supabase architecture where confirmed by the actual repository. Agree on the data contract, server-derived identity and ownership, database/migration approach, API shape, file storage, retention and privacy rules before implementing them. Do not create parallel systems or invent a contract silently.

## Approved visual requirements

Keep the **existing Thungatha workspace layouts**. Inspect and reuse the actual desktop workspace/sidebar and mobile workspace/navigation. The mobile bottom tab bar shown in the mockup is only a placeholder; do not replace existing navigation or create a separate shell. Implement the states within the existing Profile route/feature, not as ten separate routes.

The reference defines six mobile states and four desktop artboards:

1. Mobile empty profile: short explanation, primary `Upload your CV`, secondary `Enter details manually`, and the note that nothing is saved until confirmation.
2. Mobile upload: drag/drop, `Choose file`, filename and size, `Remove / Choose another file`, `Import CV`, `Cancel`.
3. Review: all seven groups—Personal Details, Professional Summary, Work Experience, Education, Skills, Certifications, Projects—with applicable Edit/Remove/Add actions. Missing Phone and Location use a dashed amber outline and the exact `Not found in CV` tag, not error styling. Include the review-before-save banner. Show source CV context.
4. Saved profile: `Confirmed`, `Edit profile`, current Master CV card and `Replace CV`.
5. Extracting: progress bar, step list and `Cancel import`.
6. Extraction failure: explanation, `Try again`, `Choose another file`, manual-entry fallback.
7. Desktop empty/upload: existing sidebar and workspace shell, dropzone, upload action and manual-entry alternative.
8. Desktop review: two-column layout, form on left and source CV/review progress/save actions on the right; Personal Details in two columns; Certifications and Projects side by side.
9. Desktop saved profile: confirmed summary and Master CV card with replacement action.
10. Desktop important states: extracting, extraction failure, partial extraction, save failure, confirm-replace-CV and confirm-remove-entry panels.

These are responsive compositions and UI states, not separate routes. Match the mockups closely; do not invent a new visual concept.

### Design constraints

- Mobile reference width is **390px**; desktop artboards are **1440px**.
- Dark theme only for this design pass. Use the exact existing dark tokens/semantic classes. Cyan is for actions and active states; amber is for the specified missing-field treatment and relevant warning/confirmation states.
- Fictional sample data (Lerato Naidoo, example.com) is visual-only; never seed it as a real user profile.
- PDF/DOCX and the 5 MB limit are mockup assumptions until approved in the upload contract. Do not silently make them production limits.
- Inspect feature-owned components first, then shared/global components. Reuse or extend suitable controls; never import another feature's private components directly.
- Do not add custom CSS files/selectors, local design tokens, or dependencies without explaining the gap and receiving approval.
- Handwritten source files must be no more than 100 physical lines; warn at 80. Refactor by cohesive responsibility, not code compression or artificial fragmentation.
- Extracted data is a proposal until the user explicitly confirms it. Never fabricate missing fields or silently overwrite confirmed facts.
- Begin with conventional text extraction and deterministic parsing. AI is optional; propose it only if representative CV testing shows a meaningful quality gap, then obtain approval for provider, privacy/consent, cost and adapter design.
- Do not implement CV tailoring or Matching as part of M2.

## Local workflow and remote safety

The user-approved workflow as of 2026-10-24 is to commit each approved C01+ checkpoint directly to the existing remote `dev` branch. The user pulls those commits into the local checkout and runs the requested verification there. Before each remote write, inspect the current `dev` state and use an expected-head/lease check so concurrent changes are not overwritten. Do not create branches or PRs, force-push, deploy, or write to production data. Do not commit a checkpoint without the user's explicit approval. C00 remains audit-only and must not change application code or create a commit.

## Checkpoint and commit rules

**C00 is audit/planning only.** No application-code changes, migrations, dependency installs, API changes, or implementation commit. Inspect and report; wait for approval.

**C01 onward must each deliver a meaningful, reviewable increment that can be committed.** A test run, inspection, or verification alone is not an implementation checkpoint. Tests are evidence attached to the relevant code increment.

After each code checkpoint, commit the coherent changes to remote `dev` and report the commit hash, changed files, actual test commands/results, unresolved issues and next checkpoint. The user pulls and tests locally. Do not deploy or continue to the next checkpoint without explicit user approval.

## Execution order

### C00 — Repository and backend readiness audit (no application-code changes)

Inspect the real branch and working tree, current routes and feature folders, auth, database configuration, migrations, environment examples, data-access code, tests, theme tokens, shared controls, desktop workspace shell and mobile navigation.

Return a concise report separating:
- working functionality from placeholders/scaffolding;
- existing versus absent API/database/migration/storage capability;
- auth and data-access patterns actually present;
- Profile route and shell components to reuse;
- relevant design tokens and shared controls;
- open data, security, privacy and upload decisions;
- a proposed backend-first C01 plan and checkpoint dependencies.

Do not implement or commit. Wait for approval.

### C01 — Profile data contract and backend foundation (commit required)

After C00 approval, define and implement the minimum agreed backend for user-owned professional profile data: schema, validation, server-derived identity/ownership, migrations, data access and API contract. Do not add upload/extraction or unrelated features.

Exit evidence: setup/migration instructions, validation and persistence tests, ownership/access-control tests where feasible, API contract documentation and a focused commit. Do not claim isolation unless tested.

### C02 — Profile view and manual editing (accepted 2026-10-24)

The user reviewed the local result and confirmed it was satisfactory. The increment is committed on `dev` as `e3534b3948a69e2a10cbea6fd962745b85ac29f2` (`feat(profile): extend manual profile editing`). It includes residential-area fields, languages and personal attributes, work achievements entry, and saved-profile display updates. ChatGPT did not run tests, lint, builds or browser checks, per the user's standing instruction. Do not claim these checks passed. C02 is accepted by the user; proceed to C03 only after upload/storage decisions are agreed.

### C03 — CV upload and private storage (commit required)

Approved by the user on 2026-10-24: PDF and DOCX only; maximum 5 MB; retain the current master CV until the user removes or replaces it; keep the existing CV until a new upload succeeds and the user confirms replacement. The implementation uses a private Supabase Storage bucket, Clerk-subject-scoped storage policies, authenticated upload endpoint, file validation, and selected-file/upload states only. Uploads are staged under a unique user-owned path and do not change `profiles.master_cv`; no extraction, public URL, or service-role key is used. The user must apply the migration to the linked Supabase project. Do not run tests, lint, builds, browser checks or Vercel operations unless the user changes that instruction.

Exit evidence: user review of valid/invalid upload states, private ownership/access policy review, failure handling and a focused commit. The user has explicitly paused automated checks and browser checks, so do not run them. Document that security isolation has not been tested.

### C04 — Deterministic extraction and progress/failure states (commit required)

Implement conventional text extraction and deterministic parsing for agreed formats. Add truthful progress/stage states, cancellation where supported, retry, failure and partial-extraction handling. Never fake numeric progress if the implementation cannot measure it.

Exit evidence: representative test CVs, malformed/scanned/empty file handling, partial/failure tests and a focused commit.

### C05 — Review and confirmation (commit required)

Implement the seven grouped sections and applicable Edit/Remove/Add actions. Apply the exact missing Phone/Location treatment. Keep extracted fields unconfirmed until explicit save; support partial profiles and preserve confirmed data on partial extraction/cancellation.

Exit evidence: review/correction/omission/confirmation tests, no silent overwrite, mobile/desktop visual comparison and a focused commit.

### C06 — Master CV lifecycle (commit required)

Implement approved current-file display, view/download if approved, replacement confirmation and removal semantics. Replacing a file must not silently overwrite confirmed profile facts; handle old file references under the approved retention policy.

Exit evidence: replace/cancel/remove tests, stable read contract for CV Studio, safe old-reference handling and a focused commit.

### C07 — End-to-end acceptance and closeout (commit required)

Verify the full journeys, responsive layouts, keyboard/focus/accessibility, authorization, personal-data handling, file access and recovery states. Compare all approved mobile/desktop references. Record limitations and evidence; fix acceptance defects in focused commits and request explicit user acceptance.

Exit evidence: actual test results, visual comparison evidence, security/privacy checklist, known issues and user acceptance.

## Required first response from Antigravity

Perform **C00 only**. Return the audit and proposed C01 implementation plan. Do not edit application code, create migrations, change API contracts, install dependencies, or commit until the user approves C00.


## M2-C04 implementation record — 2026-10-24

C04 adds server-side text extraction for staged PDF/DOCX files using `pdf-parse@2.4.5` and `mammoth@1.13.0`. Deterministic parsing returns candidate fields only; it does not write to confirmed Profile or master-CV data. The UI provides an explicit extraction action, busy state, retry, partial/failure messaging and warnings for unreadable/scanned PDFs. Scanned PDFs require OCR and are not supported by this checkpoint.

The extraction endpoint derives identity on the server, validates that the staged storage path is under that user's prefix, downloads through the authenticated Supabase client and limits the object to 5 MB. No AI API is called.

No tests, lint, build, browser checks or Vercel operations were run, per the user's standing instruction. Synchronize local `package.json` and `package-lock.json` changes with the remote checkpoint before a clean install.
