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
- Job input comes from a selected Discovery job or an external opportunity entered with exactly three fields: job title, company name and pasted job description. CV Studio does not fetch job URLs, scrape adverts, or request external-job location fields. Job context is never candidate evidence.
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
- Define the job-context input contract: selected Discovery job or external job title, company name and pasted description. URL fetching, advert scraping and external-job location fields are out of scope.
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

**Status:** In review — authenticated Discovery-job resolution and pasted-description validation are connected to the candidate-facing screen. The external-job form is limited to title, company name and pasted description; URL fetching and advert scraping are deliberately excluded.

**Goal:** safely obtain enough job information for tailoring.

**Work**

- Resolve selected Discovery jobs through existing job contracts and preserve their stable reference.
- Support external job context through the job title, company name and pasted job description fields.
- Do not fetch, scrape or resolve external job URLs from CV Studio. The candidate supplies the description directly.
- Do not bypass authentication or access controls on job sites.
- Preserve the source URL and distinguish retrieved text from user-pasted text.
- Validate content length and quality before analysis.

**Exit criteria**

- Supported job-context inputs produce a validated, traceable job context.
- External job input validates the title, company name and description length before analysis.
- Incomplete job details are clearly identified; no unsupported requirements are fabricated.
- Security and extraction verification evidence is recorded.

### M4-C05 — CV recommendation and suitability decision

**Status:** In progress — exact prior-version matching and an explicit exact-context reuse action are implemented. Semantic AI suitability assessment remains blocked pending provider selection.

**Implemented**

- Authenticated `POST /api/cv-studio/suitability` verifies the current master CV belongs to the signed-in user and matches the current confirmed Profile version.
- Finds accepted tailored versions for the same candidate and Profile version using the stable Discovery job ID or exact pasted-description fingerprint.
- Returns matching version metadata and recommends review/reuse or preparing a new draft. It never silently selects a version.
- Explicitly reports semantic assessment as unavailable. No title/keyword heuristic is presented as AI suitability.

**Candidate-facing UI now implemented**

- CV Studio displays the exact-match result, explanation and matching accepted version metadata returned by the endpoint.
- It explicitly explains that this is an exact-context lookup, not a semantic suitability score.
- The candidate can explicitly choose **Use saved CV for this job**. The accepted content is retrieved through the owner-scoped reuse endpoint and shown in the PDF preview. Reuse requires the same Discovery job ID or exact pasted-description fingerprint and the current confirmed Profile version.

**Outstanding**

- Semantic comparison of the master CV and job description using the approved AI capability.
- Evidence-backed explanation of relevant confirmed candidate facts, transferable skills and material gaps.
- Include relevant accepted versions where their relevance can be supported beyond an exact context match.
- Semantic reuse of similar-but-not-identical opportunities, only when supported by evidence-backed assessment.

No tests, build, browser checks or live Supabase verification were run. C05 is not accepted.

### M4-C06 — AI-assisted tailoring

**Status:** Blocked — AI provider selection is intentionally deferred; no provider or generated suggestions are enabled.

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

**Status:** In progress — manual draft editing, live A4 PDF preview, draft saving and explicit acceptance are implemented in source; runtime verification remains outstanding.

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

**Status:** In progress — candidate-facing history UI remains removed by product decision. Exact-context accepted-version reuse, draft deduplication, immutable acceptance and on-demand PDF export are implemented in source; M5 snapshot integration and runtime verification remain outstanding.

**Goal:** save and retrieve the version the candidate actually chooses.

**Work**

- Save accepted tailored versions with job association, source Profile version and template/version metadata.
- Keep master, working drafts and accepted tailored versions distinct. Internal version records support the workflow; CV Studio must not expose a candidate-facing history/library or historical-version browser.
- Support exact-context reuse and detect stale versions after Profile changes. Exact job reuse is implemented for accepted versions based on the current Profile version; stale versions are rejected by the server. Candidate-facing stale-draft recovery and clearer stale explanations remain to be reviewed.
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

**Status:** In progress — manual editing, live A4 preview, draft saving and explicit acceptance are implemented in source; AI suggestion review, full editing coverage and runtime verification remain outstanding.

**Implemented partially**

- An owned tailored draft can be created from the current master CV and validated job context.
- Draft creation enforces the confirmed Profile gate, current master version and owner scope.
- Candidates can edit contact details, headline, summary, skills, experience descriptions/achievements, project descriptions and languages.
- Draft changes and the selected accent colour are validated and saved separately from the master CV and Profile.
- AI suggestion controls remain inactive; no synthetic suggestions are displayed.

**Outstanding**

- Evidence-backed AI suggestions with individual accept/reject decisions after provider selection.
- Complete editing coverage for all structured CV fields and a clear stale-Profile recovery path.
- Runtime verification of draft save/accept, live preview and PDF export.

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

## M4 continuation update — 2026-11-24

This update supersedes earlier checkpoint notes that described a candidate-facing CV history screen or claimed that reuse, editing and acceptance were unavailable.

### M4-C05 — Exact accepted-version reuse

- Added `POST /api/cv-studio/reuse`. It requires the signed-in owner, a complete confirmed current Profile, an accepted tailored CV and an exact Discovery job ID or exact pasted-description fingerprint match.
- The endpoint rejects versions based on an older Profile version and refuses fuzzy/title-only matches.
- The selected-job UI now offers an explicit **Use this CV** action. The returned accepted content is previewed with its stored accent colour; the candidate can return to the master CV.
- Semantic suitability remains unavailable and is not simulated.

### M4-C06 — AI-assisted tailoring

- Remains **Blocked** until the AI provider is selected. No provider was installed or invoked and no AI-generated suggestions are presented.

### M4-C07 — Manual review and acceptance

- The manual editor is now connected to the selected-job workflow.
- It supports edits to candidate-facing contact details, headline, summary, links, skills, experience descriptions/achievements, project descriptions, languages and accent colour. Confirmed Profile facts and the master CV are not mutated.
- The editor displays a live A4 PDF preview of the current draft.
- Draft saving remains owner-scoped and Profile-version guarded.
- Added an explicit acceptance endpoint. It accepts only an owned tailored draft based on the current confirmed Profile version. Acceptance stores `accepted_at`; the existing database trigger prevents later mutation of accepted content.
- The tailored draft's PDF download remains disabled until acceptance. The master CV remains independently exportable.

### M4-C08 — Reuse, persistence and export

- Draft creation now reopens a matching working draft for the same current Profile version and exact job context instead of inserting another duplicate.
- Accepted tailored versions can be reused only for an exact job reference/description match and the same current Profile version.
- PDF export remains on-demand. The accepted structured content is the source for its export; PDFs are not persisted.
- M5's immutable application snapshot/reference contract is not yet implemented. M4 acceptance does not create an application record.

### Verification and limitations

- Source files and commits were fetched from the `dev` branch after changes.
- No build, lint, unit/integration tests, browser checks, live database checks or migrations were run.
- PDF.js rendering, acceptance against the deployed schema/trigger, exact reuse and draft deduplication require runtime verification.
- M4-C09 remains not started. M4 is not accepted.

## M4 mobile-responsiveness prerequisite — 2026-11-24

This is a focused responsive pass within the existing M4 UI work, not a new checkpoint and not a change to the checkpoint IDs or order.

- **Status:** In review — responsive source changes are committed; user runtime review remains outstanding.
- **Scope:** CV Studio workspace scrolling, selected-job header and description panel, editor actions, PDF toolbar and viewer sizing.
- **Changes:** The CV Studio page now owns a bounded vertical scroll area with mobile bottom safe-area padding. The selected-job header stacks on narrow screens and the description panel uses a mobile-safe height range. Draft editor actions can wrap and stack. PDF controls wrap, the viewer uses smaller mobile padding/minimum height, and fit-to-width uses the measured content box. Desktop two-column layout remains behind the existing large-screen Tailwind breakpoints.
- **Not changed:** External job entry remains exactly job title, company name and pasted job description. No location field, URL fetching or advert scraping was added. Existing job selection, exact-job CV reuse, explicit tailoring action, Profile ownership and M5 boundary remain unchanged.
- **Verification:** Current dev source and relevant workspace shell styles were inspected. No build, lint, automated tests, browser automation, live runtime checks or database migration was run.
- **Acceptance condition:** User verifies at narrow mobile widths (including 320px and 360px), a typical phone width, tablet and desktop. Check page scrolling, job-description scrolling, close action, PDF fit/zoom/download, editor actions, external job form, mobile navigation clearance and desktop two-column regression.
- **Next action:** User pulls dev, tests the responsive experience locally and reports any concrete viewport-specific defects. M4-C09 remains responsible for final milestone verification and acceptance.

## Repository-grounded M4 gap review — 2026-11-24

The following is the current source-level picture, not a claim of runtime acceptance:

1. **Master CV:** confirmed-Profile mapping, source IDs and Profile-version-aware master creation are implemented. Accuracy and migration/runtime behaviour still need user verification.
2. **Job context:** Discovery job resolution and the three-field external job form are implemented. External URL fetching/scraping is intentionally not part of this workflow.
3. **Exact reuse:** accepted tailored versions can be reused for the exact same Discovery job ID or pasted-description fingerprint, provided they use the current Profile version. Semantic similarity is not implemented and must not be claimed.
4. **AI tailoring and evidence:** M4-C06 remains blocked pending an explicit AI-provider decision. No evidence-backed generated proposals or individual AI accept/reject controls are active.
5. **Manual editing and preview:** draft creation, saving, manual edits, live A4 PDF preview and explicit acceptance exist in source. Education/certification and several source-identity fields are currently displayed read-only in the editor; full editing coverage still needs review.
6. **Comparison:** a dedicated comparison of master versus tailored CV content is not evident in the current CV Studio UI.
7. **Export:** on-demand PDF generation/download exists for the master CV and accepted tailored CV. Draft downloads are disabled. PDF.js rendering and export parity have not been runtime-verified.
8. **Version/stale handling:** master CV refresh is Profile-version-aware; draft save/accept and reuse reject stale Profile versions. A clear candidate-facing stale-draft recovery path and explicit stale explanation still need review. No candidate-facing CV history/library is permitted.
9. **M5 boundary:** CV records retain structured content and job/Profile metadata, but the immutable application snapshot/reference integration remains for M5. CV Studio must not create applications.
10. **Persistence and failures:** owner-scoped routes and the cv_versions migration exist in source. The migration has not been applied/verified in this work session; runtime ownership/RLS, persistence, concurrency and failure states remain unverified.

**Recommended remaining sequence:** (a) resolve the AI-provider decision and complete C06's evidence-backed tailoring contract; (b) finish C07 suggestion review, editing coverage, stale-draft recovery and acceptance UX; (c) finish C08 comparison, exact reuse/version lifecycle, export verification and the M5 snapshot handoff contract; (d) complete C09 with user-run runtime, security, responsive and regression review. Matching availability must not prevent master CV generation or a user-directed manual CV workflow.

**Important:** M4 is not Accepted. Source presence and commits do not establish runtime correctness.

## 2026-11-24 — Shared AI provider integration started

**Status: In progress. This is an initial implementation increment, not checkpoint acceptance.**

### Provider audit

- The shared server-side AI boundary exists at `src/lib/ai/`. Its configured providers are `ollama-local`, `gemini`, and `groq`; `ollama-cloud` is listed in the public type but is not supported by the current router.
- Provider activation requires both the `AI_ENABLED_PROVIDERS` allow-list and the provider-specific enable flag. `AI_PROVIDER` (or `AI_DEFAULT_PROVIDER`) selects the primary; the order in `AI_ENABLED_PROVIDERS` determines fallback order.
- The routing plan is global, not task-specific. A retryable provider failure can move to the next enabled provider; configuration, authentication, invalid-response, and non-retryable errors do not automatically fail over.
- Gemini uses its structured response schema support. Groq converts the shared schema to strict OpenAI JSON Schema. Ollama currently sends JSON mode only; application-side schema and evidence validation remains mandatory.
- Model IDs are read from `GEMINI_MODEL`, `GROQ_MODEL`, and `OLLAMA_LOCAL_MODEL`. Ollama also reads `OLLAMA_LOCAL_BASE_URL`. The actual environment values and live provider availability were not inspected.

### Initial M4 implementation

- Registered the feature-owned `cv-tailoring` task on the existing provider-neutral completion contract. No new provider SDK or router was introduced.
- Added a CV Studio tailoring schema that constrains output to supplied evidence IDs and approved editable text paths.
- Added evidence preparation that treats the current master CV as the candidate-fact authority. Current draft wording is passed separately as an editable target, never as candidate evidence.
- Added a CV tailoring service that reuses the versioned M3 job-understanding cache for the exact job context, then requests evidence-grounded suggestions and unsupported-requirement gaps through the shared provider router.
- Added an authenticated tailoring endpoint. It checks user ownership, confirmed/current Profile version, draft status, exact job snapshot, and the linked current master CV before invoking AI.
- Connected the CV editor to generate, review, accept, or reject individual suggestions. Accepting a suggestion updates only the draft. Stale suggestions are rejected rather than overwriting subsequent manual edits. Suggestions are persisted when the user saves the draft.
- Added focused unit tests for evidence boundaries, allowed target paths, and safe suggestion application.

### Remaining verification and limitations

- No Vitest, type-check, lint, build, live provider call, Supabase query, migration, or browser workflow was run during this remote implementation.
- M3's job-understanding cache depends on the M3 Supabase migrations. Those migrations were previously recorded as not applied; the new endpoint cannot be considered operational until the required M3 schema is applied and verified.
- Provider model IDs, structured-output quality, fallback behaviour, and actual Groq/Gemini/Ollama availability still require runtime tests.
- CV tailoring gaps are returned for the current review session; only suggestion decisions/content are persisted in the existing draft structure. Durable gap history is not part of this increment.
- The provider router uses one global primary/fallback plan. Per-task routing is not implemented and should not be added without measured need.
- M4-C06 and M4-C07 remain In progress. This increment does not accept either checkpoint or M4.

## CV Studio mobile interaction follow-up — 2026-11-26

**Status:** In review — responsive source changes are committed; automated and browser verification have not been run.

This follow-up extends the existing mobile-responsiveness prerequisite. It does not create a new M4 checkpoint or change the M4 scope.

**Changes**

- The mobile tailoring workspace now gives its Edit CV / Preview CV navigation a fixed place above a flexible content area. The content panel fills the remaining available height instead of adding a full-height grid below the navigation.
- The mobile PDF preview keeps the document fitted to the available content width by default. Switching to a different CV document resets zoom to fit width. Desktop zoom controls remain available at the existing small-screen breakpoint and above.
- Added application-level two-pointer pinch handling for the PDF viewer. Zoom is clamped to the existing 50–200% range and rounded to 5% increments.
- Zoomed canvases can exceed the viewer width and use the viewer's horizontal overflow rather than being constrained back to phone width.
- Added a mobile “Pinch to zoom” hint and unit coverage for pinch zoom calculation.

**Verification**

- Source was inspected on the live `dev` branch before changes.
- Focused pinch-zoom unit tests were added but **not run**.
- Lint, TypeScript, formatting, production build, browser/device testing, and regression checks were **not run** in this remote change.
- No database, API, CV content, Profile, or Job Tracking behaviour was changed.

**Acceptance condition**

- Verify on real touch input or mobile-device emulation at 320px, 360px and a typical phone width: the editor fills the available viewport below its tabs; users can switch between Edit CV and Preview CV; PDF pages fit the phone width initially; pinch-in and pinch-out change document zoom; enlarged pages can be panned horizontally and vertically; download remains accessible; multiple pages scroll naturally.
- Verify tablet and desktop layouts, including the existing desktop zoom toolbar and two-panel tailoring workspace.
- Run the focused unit test, then the repository lint, type-check, format check, unit suite and production build. Record actual results before treating this work as verified.
- M4-C09 remains responsible for full milestone verification and user acceptance. M4 remains In progress.
