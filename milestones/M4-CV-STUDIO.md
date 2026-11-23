# M4 — CV Studio

**Status:** In progress  
**Outcome:** A complete workflow for creating a Profile-backed master CV, tailoring it to a selected job, reviewing every proposed change, versioning accepted CVs and exporting them.  
**Design references:** `CV Studio · Add the job · Light.png` and `CV Studio · Recommendation and tailoring · Dark.png`  
**Dependencies:** M2 Profile/CV Import, M3 Matching, and M1 Job Discovery.

## Product decisions and boundaries

These decisions govern every M4 checkpoint:

- The candidate's confirmed Profile is the source of truth. The master CV is generated from sufficiently complete, confirmed Profile data.
- A candidate must complete the Profile gate before creating a master CV or tailoring a CV. CV Studio must not provide an independent CV-creation route, an uploaded-CV bypass, or a way to bypass missing Profile facts.
- CV Studio is accessible directly at `/cv-studio` and can also receive a job selected from Job Discovery. Browsing jobs does not require a complete Profile; tailoring does.
- Job input may include a selected Discovery job, a pasted job URL, or a pasted job description where supported. These are job-context inputs, not alternative sources for candidate facts.
- There is one official, ATS-friendly, single-column A4 CV template. There is no template/layout selector, two-column layout, drag-and-drop layout editor or font marketplace. Candidates may choose from a small predefined set of accent colours; that preference persists across tailored CVs.
- Tailoring changes content emphasis, wording and ordering within the same template. It must not redesign the layout or alter the meaning of verified facts.
- AI may select, reorder, emphasise and rephrase confirmed facts. It must not invent or infer employers, job titles, dates, skills, qualifications, responsibilities, achievements, metrics, projects or experience.
- Every AI proposal must be traceable to supporting Profile/master-CV evidence, individually reviewable and individually accept/reject-able. Unsupported job requirements are identified as gaps, not filled with invented claims.
- CV Studio never submits a job application. The candidate downloads the CV and applies on the employer's own website. Opening a job URL or downloading a CV is not proof of application.
- A PDF is generated on demand for export. Persist structured CV content and version metadata, not a permanent PDF copy. An application may later reference an immutable structured snapshot only after the candidate confirms that they applied.
- CV Studio must not silently create an application record. M5 owns application tracking and the candidate's explicit application confirmation.
- Reuse the existing provider-independent AI boundary. Do not select or install an AI provider as part of M4 until that decision is made separately.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Record actual changes, verification performed, evidence, open issues, next action and user review. Do not claim tests or browser verification that were not run.

## Checkpoints

### M4-C01 — Workflow and interface contracts

**Goal:** establish the end-to-end CV Studio workflow, states, boundaries and integration contracts before feature implementation.

**Work**

- Define direct-route and Discovery-selected-job entry paths.
- Define the Profile completion gate and the master-CV-from-Profile rule.
- Define the job-context input contract: selected Discovery job, pasted URL, or pasted description where supported.
- Define workflow states: Profile required/incomplete, master CV absent/available/stale, job context missing/invalid/unreadable, tailoring pending/failed, draft ready, review in progress, accepted version, and export failure.
- Define the transitions and candidate actions for loading, validation, empty, cancellation and recoverable failure states.
- Define the single-template and accent-colour contract.
- Define evidence-backed AI suggestion and individual accept/reject contracts.
- Define the boundary with M5: CV Studio exports a CV; M5 records an application only after candidate confirmation and references an immutable accepted CV snapshot.
- Keep the existing checkpoint IDs and order unchanged.

**Exit criteria**

- Workflow, state transitions and interface boundaries are documented.
- Profile remains the only source of candidate facts; incomplete Profile blocks CV creation/tailoring.
- No upload or independent-CV path bypasses Profile.
- The single-template and accent-colour decisions are explicit.
- No action silently creates or confirms an application.

### M4-C02 — CV data model and version management

**Status:** In review — structured schema and migration committed; database application and runtime verification pending.

**Goal:** define safe storage for the master CV and job-specific versions.

**Work**

- Reuse M2 Profile and confirmed-candidate-facts contracts.
- Model structured master and tailored CV content, source Profile version, source job reference, template version, accent-colour preference, creation metadata and revision history as justified.
- Persist structured AI suggestions with evidence references and individual review decisions.
- Distinguish working drafts from accepted versions.
- Define ownership, isolation, retention and deletion/update rules.
- Define an immutable structured snapshot/reference suitable for M5 after candidate-confirmed application.

**Exit criteria**

- Version relationships, ownership and lifecycle are documented and implemented.
- A tailored draft cannot overwrite the master CV or confirmed Profile.
- Accepted versions retain their source Profile/job/template metadata.
- Job/version links remain understandable if a source listing later becomes unavailable.

### M4-C03 — Master CV and job input screen

**Status:** In review — Profile gate, master CV generation API/preview, Discovery job handoff and pasted-description form are committed. Runtime verification remains pending.

**Goal:** implement the CV Studio starting screen and Profile gate.

**Work**

- Read the confirmed Profile using existing Profile server contracts.
- Enforce the Profile completion gate and show a clear route to complete missing Profile information.
- Generate and display the master CV from confirmed Profile data when the gate is satisfied.
- Allow the candidate to select a job from Discovery or proceed to supported job-context input. **Implemented:** the Discovery detail action links to `/cv-studio?jobId=...`; CV Studio resolves that job after the master CV is available. The screen also provides a pasted-description form.
- Do not offer CV upload as a substitute for a missing master CV or incomplete Profile.
- Present clear loading, empty, validation and failure states while keeping the route directly accessible.

**Exit criteria**

- The Profile gate is enforced by the server boundary, not only hidden/disabled UI.
- A master CV is derived only from sufficiently complete confirmed Profile data.
- Job input is available without mutating Profile data.
- The UI follows the supplied layout and existing Thungatha design system.

### M4-C04 — Job-description acquisition and validation

**Status:** In review — authenticated Discovery-job resolution and pasted-description validation are connected to the candidate-facing screen. URL-only requests fail safely to a paste-description fallback; automatic SSRF-safe URL retrieval remains outstanding.

**Goal:** safely obtain enough job information for tailoring.

**Work**

- Resolve selected Discovery jobs through existing job contracts and preserve their stable reference.
- Support pasted descriptions and, if enabled in the agreed UI, pasted URLs as job-context sources.
- Fetch a pasted URL only through a controlled server-side mechanism with protections against SSRF, private/internal addresses, unsafe redirects, oversized responses and unsupported content.
- Do not bypass authentication or access controls on job sites.
- If a URL is unreadable or blocked, ask the candidate to paste the description.
- Preserve the source URL and distinguish retrieved text from user-pasted text.
- Validate content length and quality before analysis.

**Exit criteria**

- Supported job-context inputs produce a validated, traceable job context.
- Unsafe, blocked and unreadable URLs fail safely and show a paste-description fallback.
- Incomplete job details are clearly identified; no unsupported requirements are fabricated.
- Security and extraction verification evidence is recorded.

### M4-C05 — CV recommendation and suitability decision

**Status:** In review — exact prior-version matching and a candidate-controlled reuse recommendation are implemented. Semantic AI suitability assessment remains outstanding.

**Implemented**

- Authenticated `POST /api/cv-studio/suitability` verifies the current master CV belongs to the signed-in user and matches the current confirmed Profile version.
- Finds accepted tailored versions for the same candidate and Profile version using the stable Discovery job ID or exact pasted-description fingerprint.
- Returns matching version metadata and recommends review/reuse or preparing a new draft. It never silently selects a version.
- Explicitly reports semantic assessment as unavailable. No title/keyword heuristic is presented as AI suitability.

**Candidate-facing UI now implemented**

- CV Studio displays the exact-match result, explanation and matching accepted version metadata returned by the endpoint.
- It explicitly explains that this is an exact-context lookup, not a semantic suitability score.
- The UI does not yet retrieve or open a saved tailored CV. It therefore does not claim that reuse is available.

**Outstanding**

- Semantic comparison of the master CV and job description using the approved AI capability.
- Evidence-backed explanation of relevant confirmed candidate facts, transferable skills and material gaps.
- Include relevant accepted versions where their relevance can be supported beyond an exact context match.
- Candidate-facing saved-version retrieval/reuse and the candidate decision to proceed with a new draft. (The exact-match recommendation UI is connected, but no tailoring action is available yet.)

No tests, build, browser checks or live Supabase verification were run. C05 is not accepted.

### M4-C06 — AI-assisted tailoring

**Goal:** generate a job-specific draft without inventing candidate facts.

**Work**

- Use the provider-independent AI boundary and validated structured output.
- Use confirmed Profile facts, master CV content and validated job context.
- Suggest changes to wording, emphasis and ordering within the fixed template.
- Attach supporting evidence/source references to each proposed change.
- Identify unsupported job requirements as gaps.
- Reject or safely handle unsupported AI output, provider failures and malformed responses.
- Do not expose sensitive data unnecessarily or allow AI to overwrite Profile/master CV.

**Exit criteria**

- Every AI-proposed factual claim is traceable to confirmed source evidence.
- Suggestions are individually reviewable and can be accepted or rejected independently.
- Invalid output and provider outages are recoverable.
- The master CV and Profile remain unchanged by tailoring.

### M4-C07 — Review and live preview

**Goal:** let the candidate inspect and edit the proposed CV before accepting it.

**Work**

- Implement a live preview using the one official ATS-friendly single-column A4 template.
- Show proposed changes and their reasons/evidence; support individual accept/reject decisions.
- Support candidate edits without converting unverified edits into confirmed Profile facts.
- Provide the predefined accent-colour choices and persist the preference across tailored CVs.
- Support accept, reject and return-to-edit actions.
- Validate required CV sections and preserve edits through recoverable failures.

**Exit criteria**

- Preview reflects the current structured draft and selected accent colour.
- Candidate review is required before a tailored version is accepted.
- Rejected/cancelled work does not corrupt the master CV or existing accepted versions.

### M4-C08 — Version management, comparison and export

**Status:** In progress — owner-scoped version-history/read APIs and a read-only historical preview are committed. Reuse, editing, acceptance and export remain outstanding.

**Goal:** save and retrieve the version the candidate actually chooses.

**Work**

- Save accepted tailored versions with job association, source Profile version and template/version metadata.
- Keep master, working drafts and accepted tailored versions distinct. **Implemented partially:** CV Studio now lists saved versions and opens one historical version in a read-only preview, including recorded suggestion decisions.
- Support viewing/reusing relevant existing versions and detecting when a version is stale after Profile changes. **Implemented partially:** viewing saved versions is available; copying/reusing one as a new working draft and explicit stale indicators in the history list remain outstanding.
- Generate PDF on demand from the accepted structured content; do not permanently store exported PDFs.
- Ensure exported content matches the accepted structured version.
- Expose a stable immutable structured snapshot/reference for M5 to associate with an application after candidate confirmation.

**Exit criteria**

- Accepted versions survive refresh and remain correctly associated.
- Exported content matches the accepted structured version.
- M5 can identify the exact CV snapshot used without depending on a mutable current draft.
- Downloading/exporting does not create or imply an application.

### M4-C09 — Quality and acceptance

**Goal:** review the complete CV Studio workflow against the agreed contracts.

**Work**

- Verify Profile gating, master generation, job-context validation, suitability, evidence-backed tailoring, individual review, preview, versioning and export.
- Review ownership, privacy, file/network security, keyboard access and responsive layout.
- Record actual verification performed, limitations and outstanding issues.
- Obtain explicit user review and acceptance for M4.

**Acceptance criteria**

- The agreed CV Studio workflow is implemented without bypassing Profile.
- Users retain control of the master CV, confirmed facts and every AI suggestion.
- One consistent ATS-friendly template is used throughout.
- CV export is separate from application submission.
- Verification evidence and limitations are recorded and the user explicitly accepts M4.


### M4-C07 — Review and live preview

**Status:** In progress — manual editing and persistent draft saving are now partially implemented; AI suggestion review and final live CV preview remain outstanding.

**Implemented partially**
- An owned tailored draft can be created from the current master CV and validated job context.
- Draft creation enforces the confirmed Profile gate, current master version and owner scope.
- Candidates can edit contact details, headline, summary, skills, experience descriptions/achievements, project descriptions and languages.
- Draft changes and the selected accent colour are validated and saved separately from the master CV and Profile.
- AI suggestion controls remain inactive; no synthetic suggestions are displayed.

**Outstanding**
- Evidence-backed AI suggestions with individual accept/reject decisions after provider selection.
- Full live A4 preview using the selected accent colour.
- Editing coverage for all structured CV fields, explicit acceptance/rejection lifecycle, and stale Profile handling.
- PDF export and end-to-end verification.

No tests, build, browser checks or live Supabase verification were run. The migration remains unapplied.


#### M4-C03 integration correction — 2026-11-24

**Status:** In progress — automatic Profile-to-master-CV generation is implemented in source; local database/runtime verification pending.

- `GET /api/cv-studio` now reads the signed-in user's M2 Profile using the existing Profile repository and mapper.
- The server requires both the existing M2 completion contract and a non-null Profile confirmation timestamp.
- When no current master CV exists, the endpoint creates it automatically from the confirmed Profile. The first-time UI no longer requires a manual Generate action.
- When the Profile version has advanced, the previous current master is marked superseded and a new master is created from the latest confirmed Profile. Tailored and accepted historical versions are not rewritten.
- Repeated requests reuse the current master for the same Profile version. A concurrent unique-index conflict triggers a reread before failing.
- If the `cv_versions` table is missing, the API now returns an actionable M4 migration setup message.
- **Not verified:** local migration state, Supabase connectivity, API execution, browser behaviour, race behaviour and generated document contents. No tests, lint, build or browser checks were run. The M4 migration remains unapplied in this work session.
- **Next action:** apply the committed M4 migration to the local Supabase project, reload CV Studio and report the resulting screen/API error if any. Confirm that the master CV content reflects the Profile sections before proceeding with further editor work.


### Product correction — CV reuse and no history UI (2026-11-24)

The previous interpretation of M4-C08 as a candidate-facing CV version-history feature is withdrawn.

**Agreed product rules**
- M2 Profile is the only source of candidate facts. The master CV is generated from the current confirmed Profile.
- Every tailored CV starts from the current master CV. Additional candidate facts must be added to Profile and confirmed there.
- CV Studio has no CV history/library screen, no historical-version browser and no history refresh action.
- Keep only the current master and the most recent/accepted reusable tailored output required for job matching and export. Do not generate a new CV just because CV Studio is opened or a job is selected.
- Before generating a tailored CV, check whether an existing accepted tailored output can be reused for the selected job.
- Exact same Discovery job ID or exact pasted-description fingerprint can be matched deterministically. Similar-but-not-identical job suitability must wait for evidence-backed AI assessment; do not infer equivalence from title alone.
- M5 Job Tracking owns application history and stores the exact immutable CV content/reference used when the candidate confirms an application.
- Internal persistence is retained only where required for the current master, reusable tailored output and M5 application snapshot. It is not a user-facing history feature.

**Code correction completed**
- Removed the CV history/library panel and its associated client state and fetch calls from CV Studio.
- Deleted GET /api/cv-studio/versions and GET /api/cv-studio/versions/[id].
- Existing cv_versions database rows and migration are not deleted. They are currently still used by the master/tailored workflow and suitability lookup; data deletion requires a separate migration decision and must not be done blindly.
- The current exact-match lookup remains a technical first step, not a semantic recommendation. It does not yet open/reuse the matching CV or prevent every duplicate draft.
- No tests, lint, build, browser checks, runtime checks or database migrations were run.
