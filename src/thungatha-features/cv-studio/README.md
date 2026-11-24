# CV Studio

CV Studio creates a master CV from the candidate's confirmed Profile, tailors it for a selected job, and exports accepted versions. This feature must not become a second source of candidate facts.

## Workflow contract (M4-C01)

1. The candidate can open `/cv-studio` directly or arrive with a job selected from Job Discovery.
2. Job browsing and discovery remain available even when the Profile is incomplete. Creating a master CV or tailoring a CV requires a sufficiently complete, confirmed Profile.
3. If the Profile gate fails, show which Profile information needs attention and link to Profile completion. Do not offer CV upload or independent CV creation as a bypass.
4. When the gate passes, derive the master CV from confirmed Profile facts. The master CV is a presentation of Profile data, not an editable replacement for it.
5. The candidate supplies job context by selecting a Discovery job, pasting a job description, or using a supported job URL flow. Job context must never be treated as evidence of candidate experience.
6. Assess the master CV and any relevant accepted tailored versions against the job. Explain the recommendation; do not force a fixed three-way choice screen.
7. Generate a tailored draft through the existing provider-independent AI boundary. Every proposed factual change must point to confirmed source evidence.
8. The candidate reviews each suggestion independently, accepts or rejects it, and can make manual edits. These edits affect the CV draft only and do not update Profile.
9. Preview and export use one official ATS-friendly, single-column A4 template. There is no layout/template selector. A small predefined accent-colour preference may be changed and is retained across tailored CVs.
10. Save accepted structured versions with their source Profile version, job reference and template metadata. Generate PDF on demand; do not persist the PDF as the canonical CV.
11. CV Studio does not apply for jobs or create application records. The candidate applies on the employer's website. M5 may associate an immutable accepted CV snapshot with an application only after the candidate explicitly confirms that they applied.

## Master CV starting screen (M4-C03)

The route /cv-studio loads the authenticated Profile through the existing Profile repository and exposes a server-side Profile completion/confirmation gate. The screen now also accepts a Discovery job ID from the query string, resolves that job through the job-context API, and presents the same job-context workflow when the candidate pastes a description.

- GET /api/cv-studio reports the Profile gate and missing required fields, or returns the current master CV when it matches the current Profile version.
- POST /api/cv-studio creates a structured master CV from confirmed Profile facts. It reuses an existing current master CV for the same Profile version and supersedes a stale current master before creating a refreshed version.
- The master CV mapper uses only Profile fields. Source IDs are retained for work experience, education, certifications and projects.
- The screen shows the missing Profile information and links to /profile when the gate fails. It never offers CV upload or an independent candidate-fact entry route.
- A generated master CV is previewed in a single-column layout. Job Discovery remains accessible through the Browse jobs action.
- A Discovery job selected from the shared job detail view can hand off to `/cv-studio?jobId=<job-id>`. CV Studio resolves the selected job and passes its context to the suitability endpoint.
- Candidates can also enter a job title, optional company/location/source URL and paste the full job description. The screen enforces the server's 200-character minimum and clearly states that URL auto-import is not enabled.
- The screen displays exact prior-version matches and the server explanation. It does not offer a reuse action because retrieving and rendering a saved tailored version is not implemented yet.
- A Profile change makes the existing master CV stale; the candidate must explicitly generate the refreshed master version.

This screen and API are committed. No tests, build, browser checks or live Supabase migration execution were performed in this session.

## Job-context validation (M4-C04)

The authenticated endpoint `POST /api/cv-studio/job-context` accepts either a Discovery job ID or a pasted job description with title and optional company, location and source URL.

- Discovery input is resolved from the persisted `jobs` catalogue using the authenticated Supabase client. The response preserves the job ID, title, employer, location, application URL and stored description.
- Pasted descriptions are validated for minimum useful content and a maximum request size. Source URL is metadata only; it is not fetched.
- Every accepted job context receives a SHA-256 description fingerprint and retrieval timestamp so later AI work can identify the exact description version.
- The endpoint enforces the confirmed Profile gate before accepting job context for CV tailoring.
- A URL-only request is deliberately not fetched. It returns a clear 422 response asking the candidate to paste the description. Automatic URL retrieval remains blocked until a dedicated SSRF-safe fetcher can enforce DNS/IP checks, redirect validation, response limits, timeouts and content-type restrictions.
- Invalid, missing, too-short and unavailable job inputs return explicit errors. Job content is untrusted context and never candidate evidence.

The API and validation contracts are committed. No tests, build, browser checks or live Supabase verification were run.

## CV suitability and version reuse (M4-C05)

The authenticated endpoint `POST /api/cv-studio/suitability` validates the selected current master CV against the authenticated candidate's current Profile version and searches that candidate's accepted tailored versions for an exact prior job-context match.

- Discovery contexts match by stable job ID. Pasted contexts match by the SHA-256 description fingerprint.
- Only accepted tailored versions created from the current Profile version are surfaced as reuse candidates.
- An exact prior match is a prompt to review that saved version, not an automatic selection or application.
- If no exact match exists, the endpoint indicates that a new draft may be prepared.
- The response explicitly marks semantic suitability as unavailable. It does not claim that the master CV is suitable or unsuitable and does not substitute keyword rules for AI assessment.
- No AI provider is selected for CV Studio yet. Semantic comparison of master CV evidence with job requirements, and explaining transferable skills or gaps, remains outstanding until the provider decision and C05 integration are completed.

The endpoint and schemas are committed. No tests, build, browser checks or live Supabase verification were run.

## Data model contract (M4-C02)

The canonical record is a structured CV version in `public.cv_versions`. The migration is `supabase/migrations/20261124000100_cv_studio_versions.sql`.

- A version records its owner, monotonically assigned version number, kind (`master` or `tailored`), lifecycle status, parent version, source Profile version, optional Discovery job ID, preserved job snapshot, structured content, suggestion decisions, template version, accent colour and timestamps.
- The database links each version to an existing `profile_versions(user_id, version)` record. The source Profile version is therefore explicit and cannot be silently replaced with the latest Profile.
- A tailored version retains a job snapshot even if the referenced job row is later removed. The optional job foreign key uses `ON DELETE SET NULL`; the snapshot remains.
- The structured content schema is defined in `server/cv-studio-schema.ts`. It keeps content separate from rendering/layout and preserves source IDs on Profile-derived work, education, certification and project entries.
- Suggestions contain a stable ID, target path, original/proposed text, reason, evidence references and an individual pending/accepted/rejected decision.
- Master versions are `current` or `superseded`. Tailored versions are `draft`, `accepted` or `superseded`. Accepted tailored versions require `acceptedAt` and are immutable on update.
- Accent colours are constrained to the agreed finite palette. Template version is stored so future rendering changes do not silently alter historical CV meaning.
- PDF bytes are not stored. Export is generated from the selected structured version.
- RLS scopes read/create/update/delete to the authenticated Clerk subject carried in the Supabase JWT. Server operations must still validate that parent versions belong to the same user and that the supplied Profile/job references are valid.
- Deletion is owner-scoped for data-removal requests. Accepted versions cannot be edited, but a user may delete their own records.

The migration has been committed but has **not** been applied to Supabase in this session. Runtime RLS and database behaviour remain unverified.

## State and transition contract

| State | Meaning | Allowed next action |
|---|---|---|
| `profile_required` | No sufficiently complete, confirmed Profile | Complete Profile; return to CV Studio |
| `master_cv_ready` | Profile gate passed and master CV is available | Select/provide job context |
| `job_context_required` | No usable job context is attached | Select Discovery job or provide supported job input |
| `job_context_invalid` | Job input is incomplete, invalid or unreadable | Correct input or paste job description |
| `suitability_ready` | Job context and available CV versions have been assessed | Review explanation; choose whether to tailor or reuse |
| `tailoring_pending` | A tailored draft is being prepared | Wait or cancel safely |
| `tailoring_failed` | AI/provider or validation failed | Retry or return without losing saved work |
| `draft_review` | Structured draft and evidence-backed suggestions are ready | Accept/reject suggestions, edit, preview |
| `version_accepted` | Candidate explicitly accepted the structured CV version | View history or export |
| `export_failed` | On-demand PDF generation failed | Retry export; accepted structured version remains intact |

Transitions must be explicit. A route load, job selection, URL visit or PDF download must not imply that the candidate applied or that a CV version was accepted.

## Data and trust boundaries

- Candidate facts originate from the confirmed Profile/candidate-facts contracts.
- Job descriptions describe employer requirements; they are never evidence that the candidate has a skill or qualification.
- AI output is untrusted until schema-validated and reconciled to source evidence.
- Manual CV edits do not silently write back to Profile.
- Drafts cannot overwrite the master CV or accepted versions.
- M4 exports a CV; M5 owns application records and candidate-confirmed application events.
- Use the existing AI provider abstraction. Do not couple CV Studio to a specific provider.

## Implementation boundaries

- `ui/` — CV Studio screens, editor, review, preview and version history.
- `server/` — Profile/job-context orchestration, validation, persistence and export orchestration.
- Reuse existing Profile, Discovery, matching, authentication and AI contracts. Keep shared capabilities outside CV Studio when they are not feature-specific.
- Keep the M4 checkpoint IDs and order in `milestones/M4-CV-STUDIO.md`; clarify scope within those checkpoints rather than creating or renumbering checkpoints.

**Current implementation status:** M4-C01 through M4-C05 have committed contracts and/or implementation. C03 now includes the master CV preview, Discovery job handoff, and pasted-description form. C04 connects Discovery and pasted job context to its validation endpoint. C05 displays exact-match recommendation results, but semantic suitability and saved-version retrieval/reuse remain outstanding. C06-C07 remain outstanding. C08 now has owner-scoped version-history and single-version read APIs plus a read-only history/review panel; editing, acceptance workflow and PDF export remain outstanding. C09 remains outstanding. The migration is not applied and runtime verification has not been performed.


## Version history UI (M4-C08 — partial)

- Added authenticated, owner-scoped GET endpoints at `/api/cv-studio/versions` and `/api/cv-studio/versions/[id]`.
- The history endpoint returns metadata only; the detail endpoint returns the structured content and suggestion decisions for one version after validating the UUID and owner scope.
- CV Studio lists master and tailored versions with status, version number, source Profile version and job title where available.
- Candidates can open a saved version in a read-only historical preview and inspect saved suggestion decisions.
- This is not yet a reuse action: a selected saved version is not copied into a new draft or made current. Editing, explicit acceptance and PDF export remain unimplemented.
- The database migration remains unapplied; API and UI runtime behaviour is unverified.


## Editable working drafts (M4-C07 — partial)

- Added authenticated, owner-scoped draft creation at `POST /api/cv-studio/drafts`. It verifies the confirmed Profile gate, current master ownership/version and validated job context, then copies the master content into a separate tailored draft.
- Added `PUT /api/cv-studio/drafts` to save validated structured content, suggestion decisions and accent colour. Only owned, unaccepted tailored drafts tied to the current Profile version can be updated.
- Added a candidate-facing manual editor for the headline, contact details, summary, skills, experience descriptions/achievements, project descriptions, languages and accent colour.
- AI suggestions remain empty and clearly inactive. No generated content or fabricated suggestion is shown. Individual suggestion review awaits the AI provider decision and evidence-backed generation.
- Draft acceptance, live styled preview, stale-draft recovery, PDF export and runtime verification remain outstanding.


## Profile-to-master-CV integration correction (2026-11-24)

- Opening `GET /api/cv-studio` now reads the authenticated user's existing M2 Profile through the Profile repository and mapper, verifies the Profile completion contract and explicit confirmation, then automatically creates a master CV when no current version exists.
- If the current master CV references an older Profile version, the endpoint supersedes it and creates a new master from the latest confirmed Profile. Historical and tailored versions are not rewritten.
- The operation is idempotent for repeated requests and handles a concurrent insert conflict by rereading the current master.
- `POST /api/cv-studio` uses the same operation for explicit refresh/recovery. The first-time UI no longer asks the candidate to click Generate.
- A missing `cv_versions` relation now returns a specific database-setup message instructing the developer to apply the M4 migration instead of the generic request failure.
- This is a source-level implementation. The migration has not been applied or checked against the user's local database in this session; runtime behaviour remains unverified.


## Product correction — no CV history UI (2026-11-24)

- CV Studio must not expose a CV library, version-history list, historical preview browser or refresh-history action. Those have been removed.
- The confirmed Profile is the single source of candidate facts. The master CV is its structured presentation. New tailored CVs must always originate from the current master CV; candidate facts are changed in Profile, not by creating independent CVs.
- Keep only the current master CV and the most recent/accepted reusable tailored output needed by the workflow. Do not create a new tailored CV merely because the candidate opens CV Studio or selects a job.
- Before tailoring, check whether an existing accepted tailored output is suitable for the selected job. An exact job-reference/description match can be detected deterministically now. Similar-job semantic suitability is not implemented and must not be guessed; it requires the approved AI assessment.
- Reusable tailored outputs are internal working artefacts, not a user-facing CV history. M5 Job Tracking owns the application record and the immutable CV snapshot/reference actually used when the candidate confirms an application.
- The M4 persistence layer may retain the minimum structured records needed for current master, reusable tailored output and immutable M5 submission references. This does not authorize a CV history screen or unbounded generation of versions.
- Removed the two CV Studio version-history GET endpoints and their UI. Existing database rows are not deleted by this code change.

## A4 PDF preview and export correction (2026-11-24)

- Replaced the CSS-simulated A4 HTML sheet with a real paginated PDF document rendered by the already-installed `@react-pdf/renderer` package.
- The document uses A4 page dimensions, fixed page margins, natural text flow, automatic page breaks and a page-number footer. Content is allowed to flow between pages; individual work/project/education entries are not forcibly kept on one page.
- Added an embedded PDF viewer. Its native PDF toolbar provides zoom controls, page navigation, fit/scale controls where supported by the browser PDF viewer, and print. A dedicated Download PDF action is also provided.
- The PDF preview is loaded client-side only to avoid invoking the PDF renderer during Next.js server rendering.
- The same structured Profile-derived CV content feeds both preview and download. The PDF is generated on demand and is not stored as a canonical file.
- The PDF is a clean white document with dark text; the surrounding preview controls use the active Thungatha theme. The document's section accent is kept separate from the application theme.
- The former repeating-gradient A4 simulation and HTML page-break CSS have been removed.
- This implementation has been committed to `dev`, but build, lint, PDF rendering, download, print and browser behaviour have not been tested in this session. Page count and visual fit must be checked against real CV data before acceptance.

## CV Studio PDF controls and layout refinement (2026-11-24)

- The embedded browser PDF toolbar is hidden. CV Studio owns the visible controls: zoom out, zoom in, fit width, reset to 100%, and Download PDF.
- Controls use the shared Thungatha shadcn-based `Button` component and theme tokens. Do not add feature-specific CSS for these controls.
- The PDF document remains A4 and is generated from the structured Profile-derived CV. Zoom changes the viewer fragment only; it does not alter PDF page dimensions, typography, margins or pagination.
- Removed the redundant "Master CV preview", Profile version heading and "Regenerate from Profile" action from the preview area. Profile confirmation remains the source of truth; refresh/reconciliation is handled by the CV Studio data workflow rather than a misleading preview button.
- The job source selector remains above the document. The PDF preview uses the available content width beneath it. When a job is selected, job details and assessment precede the full-width PDF preview.
- This update is source-committed only. PDF viewer fragment zoom behaviour, browser download and page rendering still require local browser verification.

## PDF viewer and desktop layout correction (2026-11-24)

- Replaced the browser-native PDF iframe viewer with a PDF.js canvas renderer. The browser's internal grey PDF toolbar/background is no longer part of the CV Studio surface.
- PDF pages render on white canvases inside the themed Thungatha `bg-panel-2` viewer surface. The actual exported PDF remains white A4.
- Zoom and fit-width controls rerender the canvas pages at the requested scale. Download still uses the exact generated PDF blob.
- PDF.js is declared directly in package dependencies; its existing lockfile package entry is reused.
- Restored the desktop two-column layout in both states: job source/details on the left and the CV preview on the right. Smaller viewports collapse to one column.
- Uses shared shadcn Button components and Tailwind theme utilities; no new feature-specific CSS was added.
- Source changes are committed and fetched from `dev`; local build and browser rendering remain unverified.

## M4 continuation — manual review, exact reuse and acceptance (2026-11-24)

- Added an owner-scoped exact-context reuse endpoint. It only returns an accepted tailored CV when its source Discovery job ID or pasted-description fingerprint exactly matches the selected job and its source Profile version is still current.
- Connected the candidate-controlled **Use this CV** action to that endpoint. Reused content is displayed with the saved accent colour; no duplicate CV is generated.
- Draft creation now searches for an existing working draft for the same owner, current Profile version and exact job context before inserting. A matching draft is reopened rather than duplicated.
- Connected the manual editor to the selected-job workflow. It provides a live A4 PDF preview and editing for contact details, headline, summary, profile links, skills, experience descriptions/achievements, project descriptions, languages and accent colour. Source identity fields such as employer, role and dates remain sourced from Profile.
- Added an explicit acceptance endpoint. It checks ownership, current confirmed Profile version and draft status. The editor saves the latest edits before accepting. Accepted versions are protected by the existing immutability trigger.
- Download of a tailored working draft is disabled until acceptance. Accepted tailored CVs and the master CV can be exported on demand.
- The accepted version ID and structured content are available for the future M5 application snapshot flow. M4 does not create application records.
- AI tailoring and semantic suitability remain blocked until an AI provider is selected.
- No CV history UI has been reintroduced.
- No tests, lint, build, browser checks, database checks or migrations were run. Runtime verification is still required.

## CV Studio entry screen and external job input (2026-11-24)

- CV Studio does not provide a second job-search or Discovery interface. Job Discovery remains the only place to browse Thungatha listings.
- When a candidate opens CV Studio without a selected job, the left panel explains the two supported entry paths: return to Job Discovery and select **Tailor my CV**, or add an external opportunity. The right panel continues to show the master CV.
- The external-job form is deliberately limited to three required fields: job title, company name and pasted job description. Location and advert URL are not requested. No URL fetch or advert extraction is performed.
- The external form submits the same authenticated job-context endpoint and converges on the same job-specific CV workflow as a Discovery handoff.
- When a job is selected, its description is shown in an independently scrollable panel using a 55vh target height (60vh maximum). The generic AI-not-active warning has been removed from the job assessment panel; exact-match reuse information remains available.
- The external form enforces the existing 200-character minimum and 30,000-character maximum for the pasted description.
- The UI uses shared shadcn Button/Input/Textarea components and Tailwind theme tokens. No feature-specific CSS was introduced.
- Source changes are committed to `dev`; no build, lint, tests, browser checks or live database verification were run.
