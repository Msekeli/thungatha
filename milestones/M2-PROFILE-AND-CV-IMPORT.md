# M2 — Profile and CV Import

**Status:** Not started  
**Outcome:** A user-controlled Profile containing confirmed professional information and a reviewable master CV.  
**Design references:** The Profile experience implied by the supplied CV Studio input screen; no dedicated Profile screenshot was supplied.  
**Dependency:** M0; integrates with M1 without requiring users to enter Discovery first.

## Purpose and scope

Build the Profile foundation used by Matching and CV Studio. The user must be able to maintain professional details and import a CV without allowing extraction or AI to silently change confirmed information.

The CV Studio design expects the master CV to load from Profile when one exists. If not, the user can upload a CV there or in the CV Studio workflow. Profile information is the source of truth for confirmed professional facts.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Record actual changes, tests, evidence, unresolved issues, next action and user review for each checkpoint.

## Checkpoints

### M2-C01 — Profile requirements and data contract
**Goal:** agree on the professional information Thungatha needs and how its trust status is represented.

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
