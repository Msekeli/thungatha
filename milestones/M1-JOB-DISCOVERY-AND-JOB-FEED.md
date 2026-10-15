# M1 — Job Discovery and Job Feed

**Status:** In progress — C01 in review; confirm against the live repository before updating  
**Outcome:** A reliable Job Discovery experience backed by persisted listings from approved sources.  
**Design reference:** `Job Discovery · Dark.png`  
**Dependency:** M0 — Foundation and Authentication (Accepted)

## Purpose and scope

Deliver the first primary Thungatha experience: users can browse and inspect job opportunities, search and filter listings, save or dismiss jobs, and open the appropriate external application destination. Prioritise South African opportunities and remote roles that explicitly accept applicants in South Africa.

The supplied Job Discovery screen is the UX reference: job cards show role/employer/location and relevant metadata, a match percentage only when M3 matching is available, and an applied state/link when a corresponding application exists in Job Tracking. The details panel must distinguish discovery source from application destination and support the actions shown in the design, including **Tailor my CV**, **Save**, **Dismiss**, **Open job page**, and **I applied** where applicable.

**Important product boundary:** Do not add a manual “Add job” feature to Job Discovery. Manually recording an application found outside Thungatha belongs to M5 Job Tracking. Discovering, saving, or dismissing a listing does not create an application record. Opening an external application page is not submission.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Each checkpoint record must include changes made, commands/tests actually run, observed evidence, unresolved issues, next action, and user review status. Code written alone does not qualify as acceptance.

## Checkpoints

### M1-C01 — Repository audit and scope lock

**Goal:** establish the actual starting point and reconcile the existing application with the approved product scope.

**Work**

- Inspect routes, components, auth, database/migrations, tests, scripts, environment configuration, and existing dashboard code before deciding what to reuse.
- Record what is already implemented and what is missing; preserve the accepted M0 foundation.
- Confirm the no-manual-job-entry boundary for Discovery and identify all stale document references or scope conflicts.
- Review candidate job sources and document access method, terms, attribution, quotas, costs, geography and approval status. Candidate research is not source approval.
- Confirm local quality-gate commands and record a baseline.

**Exit criteria**

- Repository-grounded gap report and source-validation register exist.
- No application code or schema is changed as part of the audit unless explicitly approved.
- Product boundaries and unresolved decisions are recorded and reviewed.

### M1-C02 — Job data model and persistence

**Goal:** define a durable normalized listing model and user-owned discovery state.

**Work**

- Model normalized job details, source/provider identifiers, discovery source, application destination, source publication date when known, first-seen/last-checked timestamps, and availability state.
- Define deduplication keys and indexes based on verified source payloads.
- Model per-user saved/dismissed state with server-side ownership and database RLS where applicable.
- Add migrations and repository/data-access functions using existing project conventions; do not introduce a second ORM or speculative abstractions.

**Exit criteria**

- Migrations apply cleanly and constraints/indexes support expected queries.
- Publication date, first-seen date and last-checked date remain distinct.
- Cross-user access boundaries and core persistence behaviours are tested.
- Existing M0/profile behaviour is not regressed.

### M1-C03 — First approved job source

**Goal:** ingest at least one source whose intended use has been validated.

**Work**

- Select a source only after checking actual access and display/use terms.
- Implement a source adapter behind a stable internal contract.
- Preserve source identifiers, attribution, original source URL and application destination.
- Record geographic eligibility, source limits, configuration, approval evidence and operational constraints.
- Never bypass authentication, access controls, or source restrictions.

**Exit criteria**

- A permitted source returns usable listings in the supported geography, or a documented limitation is explicitly reviewed and approved before substituting another approach.
- Source attribution and destination links are accurate.
- Secrets remain server-side and source errors are observable.

**Changes made:**

- Defined the shared `JobProvider` contract.
- Implemented Adzuna and Jooble aggregator adapters.
- Implemented the Greenhouse ATS adapter.
- Added environment-based provider configuration.
- Added the server-side job search service and authenticated jobs API route.
- Added API route tests; verification is pending.

**Verification commands/tests actually run:**

- Provider API access was previously checked and recorded in the working source-validation report.
- Automated tests and build checks for the current implementation have not yet been run.

**Observed results/evidence:**

- The adapters and API route are present in the repository.
- Provider access was demonstrated during earlier source validation.
- Technical access does not establish permission for ongoing production use.

**Open issues or decisions:**

- Confirm ongoing-use permission, licensing, attribution and operational limits for the selected source.
- Review application-link quality and source data completeness.
- Complete automated verification and inspect the final diff.

**Reviewed/accepted by user:** Yes

### M1-C04 — Normalization, deduplication and refresh reliability

**Goal:** make repeated ingestion safe and preserve useful history.

**Work**

- Normalize fields without inventing unknown values.
- Deduplicate using source IDs and justified secondary signals.
- Make ingestion idempotent and retries safe.
- Record run outcomes, errors and counts.
- Preserve stored jobs when a source is temporarily unavailable; mark listings unavailable only under an explicit, evidence-based rule.

**Exit criteria**

- Repeated ingestion does not create duplicate records.
- Updated listings refresh without erasing user state or useful history.
- Outages do not incorrectly mark all listings unavailable.
- Duplicate, retry, update and outage behaviour is tested.

### M1-C05 — Optional AI boundary for job content

**Goal:** use AI only if the source audit shows a concrete need.

**Work**

- Decide whether unstructured job-content extraction actually requires AI; document the decision.
- If needed, use a provider-independent server-side contract with schema-validated output and bounded failure handling.
- Keep provider credentials private and minimise personal data sent.
- Keep feed, ingestion, search, save and dismiss functional when AI is disabled.

**Exit criteria**

- The AI task is justified and tested, or explicitly documented as unnecessary for M1.
- Invalid output, quota failures and provider outages are handled safely.
- No future matching score or CV tailoring is pulled into M1.

### M1-C06 — Discovery query and action contracts

**Goal:** provide safe data operations for the Discovery UI without adding manual job creation.

**Work**

- Implement/extend project-standard server endpoints or server actions for feed pagination, search, filters, details, save and dismiss.
- Validate inputs and URL handling; return consistent, bounded responses and safe errors.
- Enforce authentication and user ownership for private actions.
- Define the contract for “I applied” so it leads to an explicit confirmation and M5 application record, rather than treating a link click as submission.

**Exit criteria**

- API/data-operation tests cover valid and invalid input, access control, pagination, filters and failure states.
- There is no Discovery “Add job” path.
- External navigation alone never creates or confirms an application.

### M1-C07 — Job Discovery feed, search, filters and details

**Goal:** implement the supplied Discovery experience using persisted listings.

**Work**

- Build the feed from persisted data, not hard-coded demonstration jobs.
- Provide deterministic search and filters supported by available data.
- Present role, employer, location/work mode, source and relevant dates when known.
- Implement the detail panel and actions shown in the supplied design.
- Display a match score only when M3 produces a valid score; otherwise do not fabricate a score.
- Show applied status only when linked to an actual M5 application.
- Provide loading, empty, error, retry, unavailable and responsive states.

**Exit criteria**

- Users can browse, search, filter and inspect persisted listings.
- Unknown fields and source/application destinations are presented honestly.
- UI actions match their real outcomes and keyboard/accessibility checks pass.

### M1-C08 — Save, dismiss, undo and application-state integration

**Goal:** persist discovery decisions and prevent misleading application status.

**Work**

- Implement save/dismiss and undo according to the approved UX.
- Ensure private actions are isolated per user and survive refresh.
- Define feed resurfacing rules for saved, dismissed, previously seen and applied jobs.
- Link to M5 records when an application exists; do not duplicate the application lifecycle in M1.
- Preserve state if a listing later becomes unavailable.

**Exit criteria**

- State transitions and undo are tested.
- Cross-user isolation is verified.
- Applied indicators link to the correct application record.
- Source disappearance does not destroy the user's history.

### M1-C09 — End-to-end verification and acceptance

**Goal:** demonstrate a dependable Discovery workflow.

**Work**

- Run relevant format, lint, type-check, unit/integration, build and browser tests; record actual results.
- Test source outages, duplicate ingestion, malformed provider data, empty/error/retry states, save/dismiss/undo, URL handling and user isolation.
- Review accessibility, responsive layout, privacy, logs, source terms, attribution and enabled-service costs.
- Update documentation and record known limitations.

**Acceptance criteria**

- The agreed Discovery journey works with persisted listings from an approved source.
- Core feed behaviour does not depend on AI availability.
- No manual job entry is present in Discovery.
- No critical security, data-loss or core-journey defect remains.
- Evidence is recorded and the user explicitly accepts M1.
