# M4 — CV Studio

**Status:** Not started  
**Outcome:** A complete workflow for choosing, tailoring, reviewing, versioning and exporting a CV for a specific job.  
**Design references:** `CV Studio · Add the job · Light.png` and `CV Studio · Recommendation and tailoring · Dark.png`  
**Dependencies:** M2 Profile/CV Import, M3 Matching, and M1 for Discovery-job selection.

## Purpose and scope

Implement the supplied CV Studio flow. The experience must be independently accessible at `/cv-studio`; users should not have to visit Job Discovery first. It should work with a selected Discovery job, a pasted job URL, a pasted job description, or a supported uploaded CV when no master CV exists.

The recommendation screen presents three choices: use the master CV, reuse an existing tailored CV, or create a new tailored version. The user reviews and accepts/rejects recommendations. The app must preserve the master CV and confirmed Profile facts.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Record actual changes, test results, evidence, open issues, next action and user review.

## Checkpoints

### M4-C01 — Workflow and interface contracts

**Goal:** define the end-to-end CV Studio states and boundaries before building the flow.

**Work**

- Document entry paths: selected Discovery job, pasted URL, pasted description, and no master CV.
- Define loading, invalid input, unreadable URL, missing job details, no Profile, no existing tailored version and AI failure states.
- Define the recommendation contract and accept/reject behaviour.
- Define how a chosen CV version can later be referenced by Job Tracking.

**Exit criteria**

- Workflow and state transitions are documented against both supplied CV Studio screens.
- CV Studio can be opened directly and handles missing upstream data gracefully.
- No action silently creates an application record.

### M4-C02 — CV data model and version management

**Goal:** define safe storage for the master CV and job-specific versions.

**Work**

- Reuse M2 master CV and Profile contracts.
- Model tailored versions, source job/reference, creation metadata and revision history as justified.
- Preserve original/master content and distinguish drafts from accepted versions.
- Define ownership, retention and deletion/update rules.

**Exit criteria**

- Version relationships and ownership are documented and tested.
- A tailored draft cannot overwrite the master CV.
- Job/version links remain clear if a source listing later becomes unavailable.

### M4-C03 — Master CV and job input screen

**Goal:** implement the supplied light CV Studio input screen.

**Work**

- Show the master CV from Profile when available.
- Offer CV upload if the user has no master CV.
- Accept a job URL, pasted description or job selected from Discovery.
- Validate input and present clear loading, validation and failure states.
- Keep the input workflow accessible by direct route.

**Exit criteria**

- Each input path is usable and tested.
- Existing Profile/CV data is not overwritten by merely opening the screen.
- The UI follows the supplied layout and existing Thungatha design system.

### M4-C04 — Job-description acquisition and validation

**Goal:** safely obtain enough job information for tailoring.

**Work**

- Fetch a pasted URL only through a controlled server-side mechanism with protections against SSRF, private/internal addresses, unsafe redirects, oversized responses and unsupported content.
- Do not bypass authentication or access controls on job sites.
- If the URL is unreadable or blocked, ask the user to paste the description.
- Preserve the source URL and distinguish retrieved text from user-pasted text.
- Validate length and content before analysis.

**Exit criteria**

- Safe URLs are handled within limits.
- Unsafe, blocked and unreadable URLs fail safely and show the paste-description fallback.
- Tests cover SSRF/redirect protections, invalid URLs, oversized responses and extraction failures.

### M4-C05 — Three-way CV recommendation

**Goal:** recommend the appropriate next step based on job requirements and available CV versions.

**Work**

- Evaluate whether the master CV is sufficient, an existing tailored CV is suitable, or a new tailored version is warranted.
- Present the three recommendation choices in the supplied dark recommendation design.
- Explain recommendations with evidence; allow the user to accept or reject.
- Handle unavailable matching results or missing CV data without inventing certainty.

**Exit criteria**

- Recommendation outputs are validated and explainable.
- Users can review and reject recommendations.
- No recommendation silently selects or submits a CV on the user's behalf.

### M4-C06 — AI-assisted tailoring

**Goal:** generate a job-specific draft without inventing user facts.

**Work**

- Use a provider-independent AI boundary and validated structured output.
- Tailor wording and emphasis to relevant job requirements while preserving factual meaning.
- Do not invent credentials, employment, dates, achievements, tools or experience.
- Flag unsupported requirements rather than fabricating evidence.
- Keep provider failure recoverable and avoid exposing sensitive data unnecessarily.

**Exit criteria**

- Tailored output can be traced to source CV content or clearly marked user edits.
- Invalid output and provider outages are handled safely.
- AI cannot silently overwrite the master CV or confirmed Profile.

### M4-C07 — Review and live preview

**Goal:** let the user inspect and edit the proposed CV before accepting it.

**Work**

- Implement a live preview and reviewable edits consistent with the supplied recommendation/tailoring design.
- Make changed sections understandable where feasible.
- Support accept, reject and return-to-edit actions.
- Provide validation for required CV sections and avoid losing edits on recoverable failures.

**Exit criteria**

- Preview reflects the current draft.
- User review is required before a version is accepted.
- Cancel/reject does not corrupt the master CV or an existing version.

### M4-C08 — Version management, comparison and export

**Goal:** save and retrieve the version the user actually chooses.

**Work**

- Save accepted tailored versions with job association and clear version metadata.
- Support viewing/reusing existing tailored versions and comparing against the master or another version.
- Implement an agreed export format and verify output integrity.
- Expose a stable version reference for M5 to record the CV used for an application.

**Exit criteria**

- Saved versions survive refresh and remain correctly associated.
- Exported content matches the accepted version.
- Job Tracking can identify the chosen version without depending on a mutable current draft.

### M4-C09 — Quality and acceptance

**Goal:** demonstrate the complete CV Studio workflow.

**Work**

- Test all entry paths, recommendations, URL fallback, tailoring, edits, versioning and export.
- Test no Profile/no master CV, malformed AI output, provider outage and cancellation.
- Review privacy, file security, keyboard access, responsive layout and data ownership.
- Record limitations and verification evidence.

**Acceptance criteria**

- Both supplied CV Studio screens' core workflows are implemented.
- Users retain control of the master CV and confirmed facts.
- Direct route access and fallback states work.
- Evidence is recorded and the user explicitly accepts M4.
