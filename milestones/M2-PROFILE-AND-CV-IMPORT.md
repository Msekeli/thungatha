# M2 — Profile and CV Import

**Status:** Not started  
**Planning note:** Plan updated 2026-10-24; ready to begin at M2-C01.  
**Outcome:** A user-controlled Profile containing confirmed professional information and a reviewable master CV.  
**Design references:** Approved 10-page Profile and CV Import mockups. See `milestones/M2-ANTIGRAVITY-EXECUTION-BRIEF.md` for the exact screen/state requirements and Claude artifact reference.  
**Dependency:** M0; integrates with M1 without requiring users to enter Discovery first.

## Purpose and scope

Build the Profile foundation used by Matching and CV Studio. The user must be able to maintain professional details and import a CV without allowing extraction or AI to silently change confirmed information.

The CV Studio design expects the master CV to load from Profile when one exists. If not, the user can upload a CV there or in the CV Studio workflow. Profile information is the source of truth for confirmed professional facts.

## M2 start plan and engineering constraints

M2 is planned and implementation has not started. Do not assume a functional backend, Profile API, database schema, migrations, data-access layer, CV storage, or extraction service exists. Inspect the checked-out branch and verify what is real, placeholder, or absent. Existing Profile UI/scaffolding is not evidence of a working backend. Start with M2-C00 (audit only), then build the agreed backend/data foundation before connecting the designed UI. Preserve the established Clerk/Supabase architecture where confirmed, but do not invent or assume a pre-existing API/database contract.

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

- **Component reuse before creation:** Before building a UI component, inspect the current feature's existing components first, then the global/shared component library. Reuse or extend a suitable component at either level. Create a new component only if neither level has a suitable fit.
- **Respect feature boundaries:** Do not use another feature's private component as a shortcut. If multiple features need the same capability, consider whether a generic component belongs in the global/shared library. Keep feature-specific components inside their owning feature.
- **Explain genuine gaps:** If neither level has a suitable component, briefly identify what was checked and why the available options do not fit. Do not force-fit components or introduce abstractions just because two UI elements look alike.

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

Checkpoint meanings, commit expectations, detailed exit evidence and Antigravity's first-task instruction are maintained in [M2 Antigravity Execution Brief](M2-ANTIGRAVITY-EXECUTION-BRIEF.md).

## Checkpoints

- **M2-C00 — Repository and backend readiness audit:** audit only; no application-code changes and no implementation commit required.
- **M2-C01 — Profile data contract and backend foundation:** meaningful backend/data-contract increment; commit required.
- **M2-C02 — Profile view and manual editing:** meaningful user-facing profile increment; commit required.
- **M2-C03 — CV upload and private storage:** upload/storage increment; commit required.
- **M2-C04 — Deterministic extraction and progress/failure states:** extraction increment; commit required.
- **M2-C05 — Review and confirmation workflow:** reviewed, user-confirmed profile data increment; commit required.
- **M2-C06 — Master CV lifecycle and replacement safety:** file lifecycle increment; commit required.
- **M2-C07 — End-to-end acceptance and closeout:** completed acceptance evidence and any meaningful fixes/final documentation; commit changes where applicable and obtain explicit user acceptance.

