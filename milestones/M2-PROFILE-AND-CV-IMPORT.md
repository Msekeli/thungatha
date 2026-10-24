# M2 — Profile and CV Import

**Status:** In progress — C02 accepted; C03 implemented and awaiting user review.
**Planning note:** M2-C00 was approved; C01 backend foundation was implemented and C02 manual profile editing has now been accepted by the user.
**Outcome:** A user-controlled Profile containing confirmed professional information and a reviewable master CV.
**Design references:** Approved 10-page Profile and CV Import mockups. See `milestones/M2-ANTIGRAVITY-EXECUTION-BRIEF.md` for the exact screen/state requirements and Claude artifact reference.
**Dependency:** M0; integrates with M1 without requiring users to enter Discovery first.

## Purpose and scope

Build the Profile foundation used by Matching and CV Studio. The user must be able to maintain professional details and import a CV without allowing extraction or AI to silently change confirmed information.

The CV Studio design expects the master CV to load from Profile when one exists. If not, the user can upload a CV there or in the CV Studio workflow. Profile information is the source of truth for confirmed professional facts.

## M2 start plan and engineering constraints

C01 implemented the profile data contract and backend foundation, including bounded repeatable sections, server-maintained profile version history, residential-area fields (suburb, city/town, province and optional postal code; no street address), languages, personal attributes and work achievements. C02 implemented the user-facing manual profile editing increment. The extension is profession-neutral and remains optional where appropriate.

### Required execution order

1. **C00 — Repository and backend readiness audit:** inspect the actual repository, identify existing functionality versus scaffolding, review auth, database configuration, routes, tests, theme tokens, shared controls and existing workspace layouts. No application-code changes.
2. **C01 — Profile data contract and backend foundation:** agree on the profile schema, trust states, validation, identity/ownership, migrations, data access and API contract; implement the approved minimum backend increment.
3. **C02 — Profile view and manual editing:** implement the approved empty/saved views and manual editing inside the existing workspace shells.
4. **C03 — CV upload and private storage:** agree on format/size, storage, retention and file-access rules, then implement upload without extraction.
5. **C04 — Deterministic extraction and progress/failure states:** use conventional text extraction first; AI is optional and requires evidence plus approval.
6. **C05 — Review and confirmation:** implement the seven grouped sections, missing-field treatment and explicit user confirmation.
7. **C06 — Master CV lifecycle:** implement safe view/download/replacement/removal semantics without silently overwriting confirmed profile facts.
8. **C07 — End-to-end acceptance and closeout:** verify the journeys, visual references, accessibility, security/privacy and documented limitations.

C00 is a planning/audit checkpoint and does not require an application-code commit. Every checkpoint from C01 onward must deliver a meaningful, reviewable increment that can be committed. Tests and verification are evidence for a code checkpoint, not standalone implementation checkpoints. After each code checkpoint, report the focused commit hash, changed files, actual test results and remaining issues; wait for approval before proceeding to the next checkpoint.

See [M2 Antigravity Execution Brief](M2-ANTIGRAVITY-EXECUTION-BRIEF.md) for the detailed agent instructions and acceptance evidence.

### UI and component rules for M2

- Do not set component-local colors, typography, font sizes/families, shadows, radii, borders, or theme palettes. Use existing semantic token classes and shared theme tokens so light/dark theming stays consistent.
- Prefer Tailwind CSS v4, shadcn/ui patterns, and existing Base UI/shared controls. Do not recreate existing controls or add a UI dependency without a demonstrated need.
- Before adding a CSS file or custom selector, explain why tokens, shared controls, and Tailwind cannot meet the requirement and get the user's agreement. Add CSS only when necessary; keep it minimal and scoped.
- Keep every handwritten component at or below 100 physical lines, warning at 80. Apply the repository's 100-line limit to other maintained handwritten source files too. Refactor by cohesive responsibility, not by compressing code or fragmenting files.
- Before and after each meaningful code change, inspect line counts, run relevant checks, and record actual results. Do not claim tests or visual acceptance that were not performed.

## UI design brief — Profile and CV import

The intended experience is deliberately simple: upload an existing CV, extract what can be read, review the prefilled information, correct gaps, and save. Do not make AI chat the centre of this workflow or make AI a prerequisite for a successful import.

### Screen 1 — Profile overview / first-time empty state

Purpose: explain what Profile stores and give the user one obvious next action.

- Page title: **Your professional profile**.
- Short explanation: the profile stores confirmed experience and qualifications used by Job Matching and CV Studio.
- Primary action: **Upload your CV**.
- Secondary action: **Enter details manually** (available if the user has no CV or prefers not to upload one).
- If a profile/master CV already exists, show a compact profile summary and the current CV file card instead of the first-time empty state.
- Show a useful empty state without implying the user must finish every field before using the rest of Thungatha.

### Screen 2 — CV upload

Include:
- Drag-and-drop target and a **Choose file** button.
- Clearly list the formats and maximum file size only after those limits are confirmed in C01/C04; do not invent unsupported formats in the design.
- Selected-file row with file name, type/size, and **Remove** or **Choose another file**.
- Primary action: **Import CV**.
- Secondary action: **Cancel**.
- Uploading/extracting progress, disabled duplicate submissions, and understandable error/retry states for unsupported, malformed, empty, too-large, failed, or interrupted uploads.
- Privacy reassurance: the CV is private and used to populate this user's profile. Do not make unreviewed claims about retention or provider processing; show those details only after policy is decided.

### Screen 3 — Review extracted details

After extraction, show a review form with prefilled values where detected. Group information into readable sections, not one long undifferentiated form:

1. **Personal and contact details:** full name, email, phone, location (city/region and country). Do not force optional fields.
2. **Professional summary:** short profile/about statement.
3. **Work experience:** repeatable entries with job title, employer, location (optional), start/end dates, current-role toggle, and responsibilities/achievements text.
4. **Education:** repeatable entries with qualification, institution, field of study (optional), start/end or completion date.
5. **Skills:** editable list or tags; allow adding and removing individual skills.
6. **Certifications and licences:** repeatable entries with name, issuing organisation (optional), issue/expiry dates (optional).
7. **Projects:** repeatable entries with project name, description, role/contribution and link (optional), where present in the CV.
8. **Master CV file:** show the uploaded filename and import state.

Only include sections that fit the agreed Profile data contract. Do not invent values or create speculative fields merely to fill space. Missing sections should be visibly empty/optional, not filled with generated content.

Each section must support **Edit**, and repeatable sections must support **Add**, **Remove**, and where appropriate **Add another**. Keep field labels explicit and include inline validation. Preserve dates and wording as extracted unless the user edits them.

Show clear review status for extracted content: extracted values are **Needs review** until confirmed. If extraction is uncertain or a field is empty, mark it for user attention without pretending the information is false or absent from the original CV.

Primary action: **Review and save profile** (or equivalent wording that makes confirmation explicit).
Secondary actions: **Back**, **Cancel import**, and **Try extraction again** when extraction failed or can be retried.
Do not use a single ambiguous **Done** button. Explain that saving confirms the reviewed fields. Users must be able to save a partial profile without fabricating missing information.

### Screen 4 — Saved Profile

Show:
- A readable summary of confirmed profile sections.
- A **Profile completeness** indicator only if it is based on agreed useful fields; avoid arbitrary percentages.
- The current master CV file name and available actions, such as **View/download**, **Replace CV**, and **Remove CV**, subject to the confirmed storage/retention policy.
- A clear **Edit profile** action.
- A confirmation message after saving, and a recoverable error state if persistence fails.
- When replacing a CV, distinguish replacing the file from overwriting confirmed profile facts. Ask the user to review new extracted information before applying it.

### Required interaction and visual states

Design for:
- First-time empty profile.
- Existing profile and existing master CV.
- File selected and validation failure.
- Uploading/extracting progress.
- Extraction success with all, some, or very few fields found.
- Extraction failure with retry and manual-entry fallback.
- Review form with missing/uncertain fields.
- Save in progress, save success, and save failure.
- Existing confirmed data that conflicts with a newly imported CV.
- Replace/cancel/remove confirmation where data could be lost.
- Mobile and desktop layouts, keyboard navigation, visible focus, accessible labels, and clear loading/empty/error states.

### UI implementation constraints

Follow the repository's existing design system and component reuse rule: inspect components in the Profile feature first, then the global/shared library. Do not import private components from another feature. Create a new component only if neither level contains a suitable fit. Use shared theme tokens and Tailwind CSS v4/shadcn/ui patterns; do not define local design tokens or custom CSS without discussing the need and receiving approval. Keep each handwritten component at or below 100 physical lines, with a warning at 80.

### Extraction strategy — no mandatory AI

The first implementation should attempt conventional text extraction and deterministic parsing for the agreed supported file formats. CV formats are inconsistent, so the design must handle partial extraction and offer manual editing. AI is optional, not required for the core journey. Only propose adding AI after representative CV tests demonstrate a meaningful quality gap that deterministic parsing cannot reasonably address. If later introduced, it must be an optional server-side adapter, return schema-validated candidate fields, respect privacy/consent requirements, and never auto-confirm or silently overwrite existing confirmed data.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Record actual changes, tests, evidence, unresolved issues, next action and user review for each checkpoint.

Checkpoint meanings, commit expectations, local-only agent workflow, detailed exit evidence and first-task instruction are maintained in [M2 Antigravity Execution Brief](M2-ANTIGRAVITY-EXECUTION-BRIEF.md).

## Checkpoints

- **M2-C00 — Repository and backend readiness audit:** Accepted / planning baseline; no application-code changes and no implementation commit required.
- **M2-C01 — Profile data contract and backend foundation:** implemented in source; user applied migrations. Automated verification and security isolation evidence were not run in this ChatGPT session; do not overstate test coverage.
- **M2-C02 — Profile view and manual editing:** **Accepted by user (2026-10-24)**. The user reviewed the local result and confirmed that all is well. Implementation includes the existing empty/saved profile states, manual editing, residential-area fields, languages/personal attributes and work achievements. Focused code commit: `e3534b3948a69e2a10cbea6fd962745b85ac29f2`. No tests, lint, builds or browser checks were run by ChatGPT, per user instruction; acceptance is based on the user's review.
- **M2-C03 — CV upload and private storage:** **In review** — PDF/DOCX, 5 MB limit, private Supabase Storage, user-scoped access, keep-current-until-confirmed replacement, and retention until user removal/replacement approved on 2026-10-24. Implementation commit and user verification pending.
- **M2-C04 — Deterministic extraction and progress/failure states:** Not started.
- **M2-C05 — Review and confirmation workflow:** Not started.
- **M2-C06 — Master CV lifecycle and replacement safety:** Not started.
- **M2-C07 — End-to-end acceptance and closeout:** Not started.

## M2-C02 execution record — 2026-10-24

- **Status:** Accepted by user.
- **Changes made:** Improved manual profile editing for profession-neutral use; added residential-area fields, language and personal-attribute lists, and work-experience description/achievements entry; updated saved profile details display.
- **Commit:** `e3534b3948a69e2a10cbea6fd962745b85ac29f2` — `feat(profile): extend manual profile editing`.
- **Files changed:** `src/thungatha-features/user-profile/ui/profile-personal-details-form.tsx`, `src/thungatha-features/user-profile/ui/profile-language-attributes-editor.tsx` (new), `src/thungatha-features/user-profile/ui/profile-editor-view.tsx`, `src/thungatha-features/user-profile/ui/profile-saved-details-card.tsx`, `src/thungatha-features/user-profile/ui/profile-experience-editor.tsx`.
- **Verification evidence:** User reported that the local result was all well and explicitly asked to close C02. ChatGPT did not run tests, lint, build or browser checks, per the user's standing instruction.
- **Remaining scope:** Education, certification and project editor enhancements may be addressed if a concrete gap appears during later review; C02 is accepted by user and is not reopened by default.
- **Next action:** Start C03 only after the user approves the upload/storage decisions and implementation plan.
- **Reviewed/accepted by user:** Yes, 2026-10-24.


## M2-C03 execution record — 2026-10-24

- **Status:** In review; implementation prepared for user review.
- **Approved decisions:** PDF and DOCX only; 5 MB maximum; retain the current master CV until the user removes or replaces it; keep the existing CV until a replacement upload succeeds and the user confirms replacement.
- **Implemented scope:** private `profile-cvs` Supabase Storage bucket; storage policies scoped to the authenticated Clerk subject and per-user staged path; authenticated upload endpoint with extension/MIME, size, empty-file and basic file-signature validation; responsive file-selection, drag/drop, remove-selection, upload, retryable error and staged-success UI on empty and saved profile views.
- **Safety boundary:** uploaded objects are staged under a unique per-user path. This checkpoint does not update `profiles.master_cv`, replace/delete an existing master CV, or extract CV contents. No public URLs or service-role key are used.
- **Verification:** no tests, lint, build, browser checks, or Vercel operations were run, per user instruction. The migration has not been applied by ChatGPT; the user must apply it to the linked Supabase project before storage works.
- **Known limitation:** staged upload state is returned to the client and is not yet promoted to master-CV metadata. Extraction/review and safe promotion belong to later checkpoints. Staged-object cleanup policy needs to be addressed before lifecycle closeout.
- **Next action:** user pulls/reviews the focused commit, applies the migration, and reports acceptance or defects. Do not begin C04 until C03 is accepted.
