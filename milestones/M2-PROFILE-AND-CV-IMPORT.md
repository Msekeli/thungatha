# M2 — Profile and CV Import

**Status:** Not started  
**Planning note:** Plan updated 2026-10-24; ready to begin at M2-C01.  
**Outcome:** A user-controlled Profile containing confirmed professional information and a reviewable master CV.  
**Design references:** The Profile experience implied by the supplied CV Studio input screen; no dedicated Profile screenshot was supplied.  
**Dependency:** M0; integrates with M1 without requiring users to enter Discovery first.

## Purpose and scope

Build the Profile foundation used by Matching and CV Studio. The user must be able to maintain professional details and import a CV without allowing extraction or AI to silently change confirmed information.

The CV Studio design expects the master CV to load from Profile when one exists. If not, the user can upload a CV there or in the CV Studio workflow. Profile information is the source of truth for confirmed professional facts.

## M2 start plan and engineering constraints

M2 is planned but implementation has not started. Begin with M2-C01 and an audit of the existing Profile foundation before changing routes, persistence, or UI. The repository already contains Profile UI/server/persistence scaffolding and `/api/profile`; inspect and extend those files instead of building a parallel implementation. Preserve the Clerk/Supabase foundation and established route/API contracts unless a verified gap requires an approved change.

### Required execution order

1. **C01 — Audit and contract:** inspect the current Profile page, feature folder, API handler, validation, repository/data access, migrations, theme tokens, and tests. Agree on profile fields, trust states, supported CV formats, storage/retention, and import/review flow before schema or UI work.
2. **C02 — Persistence and ownership:** implement only the confirmed data contract. Use server-derived Clerk identity, existing Supabase patterns, migrations, and user-scoped access. Verify cross-user isolation with controlled test data.
3. **C03 — Profile editing:** build on existing Profile code and shared controls. Validate create/edit/save/cancel/reload and accessible responsive states.
4. **C04 — Upload and extraction:** agree on file types, size limits, storage, retention and extraction strategy before implementation. Keep raw files private; reject malformed/unsupported files safely. AI is optional and must be justified, adapter-based, and schema-validated.
5. **C05 — Review and confirmation:** extracted facts remain proposals until the user confirms them. Preserve confirmed data when extraction is partial, wrong, or cancelled.
6. **C06 — Master CV lifecycle:** define replacement/version/reference semantics and provide a stable read contract for CV Studio. Do not build CV tailoring or Matching in M2.
7. **C07 — Acceptance:** run and record relevant checks, privacy/security review, responsive and keyboard/browser checks, and explicit user review.

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

## Checkpoints

### M2-C01 — Existing Profile audit and data contract

**Goal:** audit and reuse the existing Profile foundation, then agree on the professional information contract.

**Initial audit:** inspect the current `/profile` page, `src/thungatha-features/user-profile/`, `/api/profile`, validation, persistence, migrations, tests, and theme-token usage. Record current behaviour and gaps before changing code.

**Work**

- Define profile sections and required/optional fields based on product needs.
- Distinguish user-confirmed facts, imported candidates, inferred values and missing information.
- Define master CV ownership, supported import types, and what constitutes a confirmed update.
- Define edit, save, cancel and validation behaviour.

**Exit criteria**

- Profile schema and user workflows are documented and reviewed.
- No fields are added merely speculatively.
- Imported data cannot silently become confirmed data.

### M2-C02 — Profile persistence and access control

**Goal:** persist profile data safely using existing database conventions.

**Work**

- Define migrations, validation schemas, repository operations and indexes as needed.
- Enforce per-user ownership server-side and through database policies where applicable.
- Preserve the working Clerk/Supabase foundation and existing profile functionality.
- Define safe update semantics and handling for partial profiles.

**Exit criteria**

- Migrations and persistence tests pass.
- Users cannot read or alter another user's profile.
- Partial profile records are supported without fabricated defaults.

### M2-C03 — Profile view and editing

**Goal:** allow users to inspect and update confirmed professional information.

**Work**

- Implement the Profile route and editable sections using the established design system.
- Provide clear validation, saving, success and failure states.
- Distinguish confirmed data from imported suggestions where both are visible.
- Ensure CV Studio can read the current master CV/profile through a stable contract.

**Exit criteria**

- Profile information can be created, edited and reloaded.
- Validation and authorization are tested.
- Responsive, keyboard and accessibility checks pass.

### M2-C04 — CV upload and extraction

**Goal:** accept supported CV files and extract candidate information safely.

**Work**

- Confirm supported file formats, size limits, storage strategy and retention rules before implementation.
- Validate file type/content and handle malformed, empty or unsupported files.
- Extract text and candidate structured fields using the least complex reliable approach.
- If AI is used, isolate it behind an adapter, validate its output and minimise sensitive data sent.
- Protect uploaded files and avoid exposing private storage URLs.

**Exit criteria**

- Supported files can be imported; unsupported or malformed files receive useful errors.
- Extraction failures do not damage the existing master CV or Profile.
- File security, privacy and failure paths are tested.

### M2-C05 — Review and confirmation

**Goal:** keep the user in control of information extracted from a CV.

**Work**

- Present extracted facts for review before they become confirmed Profile data.
- Allow users to correct, omit or reject extracted information.
- Identify uncertain or missing values instead of inventing them.
- Preserve the original uploaded document or its reference according to the approved retention policy.

**Exit criteria**

- No extracted field silently overwrites a confirmed fact.
- Review, correction and confirmation paths are tested.
- The user can complete import even when some fields cannot be extracted.

### M2-C06 — Master CV lifecycle and completeness

**Goal:** make the master CV usable as the source for CV Studio.

**Work**

- Define master CV creation, replacement, version/reference and update behaviour.
- Define profile completeness indicators based on useful required information, not arbitrary percentages.
- Make the current master CV available to CV Studio when present.
- Handle users with no Profile or no master CV gracefully.

**Exit criteria**

- Master CV state is clear and retrievable.
- Replacing a CV does not silently discard unrelated confirmed profile data.
- CV Studio can distinguish “no master CV” from loading or retrieval failure.

### M2-C07 — Security, testing and acceptance

**Goal:** verify Profile and import are dependable and user-controlled.

**Work**

- Run relevant unit, integration, file-import, access-control and end-to-end tests.
- Test large/invalid files, partial extraction, repeated import, cancellation and provider failure.
- Review personal-data handling, retention, logging, storage access and deletion/update semantics.
- Document supported formats, limitations and setup requirements.

**Acceptance criteria**

- Profile editing and supported CV import work end to end.
- Confirmed information remains under user control.
- Cross-user access is prevented.
- Evidence is recorded and the user explicitly accepts M2.
