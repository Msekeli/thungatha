# M5 — Job Tracking

**Status:** Not started  
**Outcome:** A complete, user-owned record of actual job applications and their lifecycle.  
**Design references:** `Job Tracking · Light.png` and `Record an application · Dark.png`  
**Dependencies:** M1 for optional Discovery links, M2 for Profile context and M4 for CV-version references.

## Purpose and scope

Implement the supplied Job Tracking screen and external-application recording form. Job Tracking owns the application lifecycle, including applications for jobs found in Thungatha and jobs found elsewhere.

A record is created when the user confirms they submitted an application or explicitly records an existing application. Discovery, save, dismiss and opening an external link are not equivalent to application submission.

The experience must support quick recall: where the opportunity came from, what was submitted, what happened and what action is next.

## Checkpoint status rules

Use only: **Not started**, **In progress**, **Blocked**, **In review**, **Accepted**. Record actual verification and user review for every checkpoint.

## Checkpoints

### M5-C01 — Application lifecycle and workflow
**Goal:** define application statuses, transitions and user actions.

**Work**
- Define the application lifecycle from planned/recorded submission through response, interviews, rejection, offer and final outcome.
- Define valid transitions, status history and how corrections are represented.
- Define how users record applications made outside Thungatha.
- Define follow-up dates, next actions and overdue indicators without implying that a reminder was sent unless implemented.

**Exit criteria**
- Lifecycle, transitions and record-creation rules are documented and reviewed.
- Opening an external job page cannot automatically create a submitted application.
- Discovery state and application state are clearly separated.

### M5-C02 — Application data model and persistence
**Goal:** store an accurate, durable record of each application.

**Work**
- Model company, role, source/discovery reference, external URL, application date, current status and status history.
- Store a reference or immutable snapshot of the CV/material actually submitted, where available.
- Model recruiter/contact details, interviews, notes, follow-ups and outcomes as justified.
- Enforce per-user ownership and database policies.
- Preserve records when a Discovery listing disappears or changes.

**Exit criteria**
- Migrations and persistence tests pass.
- User data is isolated.
- Submitted-material references do not silently change when a later CV draft is edited.

### M5-C03 — Record an external application
**Goal:** implement the supplied dark “Record an application” form.

**Work**
- Allow the user to record an application found outside Thungatha.
- Capture the employer, role, application destination/source, submission date, status and relevant notes/material reference.
- Validate required fields and URLs while allowing legitimate unknown details.
- Provide save, cancel, validation, success and failure states.
- Avoid requiring a Discovery record.

**Exit criteria**
- External applications can be recorded independently of Job Discovery.
- Validation and authorization are tested.
- The saved application appears in Job Tracking and can be reopened.

### M5-C04 — Link Discovery and CV Studio
**Goal:** connect related records without merging ownership boundaries.

**Work**
- Link an application to a Discovery listing when there is a reliable match.
- Link the actual CV Studio version/material used at submission.
- Support applications that have no Thungatha listing or tailored CV.
- Define what happens if a linked job becomes unavailable or a CV version is removed.

**Exit criteria**
- Links are correct and optional where appropriate.
- A Discovery “I applied” flow requires explicit user confirmation before creating/updating an application.
- Quick recall uses the submitted version/reference, not simply the latest CV.

### M5-C05 — Application list, detail and statuses
**Goal:** implement the supplied Job Tracking overview.

**Work**
- Provide a list of applications and their current status.
- Support useful status/date/company/role filtering where appropriate.
- Provide an application detail view with source, materials, status history and next action.
- Keep empty, loading, error and no-results states clear.
- Ensure direct route access works.

**Exit criteria**
- Users can locate and inspect their applications.
- Status displayed in the list agrees with the detailed record.
- Filters and pagination, if used, are deterministic and tested.

### M5-C06 — Status history and outcomes
**Goal:** preserve what happened over the application's lifecycle.

**Work**
- Record meaningful status changes with timestamps and actor/source where available.
- Support interview stages, rejection, offers and outcomes.
- Allow corrections without erasing the prior history silently.
- Keep dates and unknown outcomes honest.

**Exit criteria**
- Status history is ordered and durable.
- Invalid transitions are rejected or require explicit correction.
- Repeated updates do not create misleading duplicate events.

### M5-C07 — Quick recall and submitted materials
**Goal:** answer “where did I apply, what did I submit, what happened, and what next?”

**Work**
- Present source, role/company, submission date, CV/material reference, status/outcome and next action.
- Link to the exact accepted CV version or snapshot used when available.
- Clearly show unavailable materials instead of substituting a different version.
- Provide notes and relevant contact/interview details.

**Exit criteria**
- Quick recall information is traceable to the application record and submission materials.
- Editing the master CV later does not rewrite the historical submission.
- Missing historical material is clearly disclosed.

### M5-C08 — Interviews, notes and follow-ups
**Goal:** manage the practical follow-through associated with applications.

**Work**
- Record recruiter contacts, interviews, interview dates/details, notes and follow-up dates.
- Allow users to update or cancel planned follow-ups.
- Distinguish a recorded follow-up intention from an actually sent message or notification.
- Handle time zones and date-only values consistently.

**Exit criteria**
- Follow-up and interview information persists and is associated with the correct application.
- No notification is claimed unless a notification feature is actually implemented and verified.
- User data remains private.

### M5-C09 — End-to-end verification and acceptance
**Goal:** demonstrate the complete application lifecycle.

**Work**
- Test external application entry, Discovery linking, CV version linking, status history, interview/follow-up records and quick recall.
- Test validation, authorization, missing links, deleted/unavailable source jobs and data isolation.
- Review keyboard access, responsive behaviour, privacy and failure states.
- Record actual test/build results and known limitations.

**Acceptance criteria**
- Users can track applications regardless of where the job was discovered.
- Submitted materials and lifecycle history remain reliable.
- No false claim of application submission is made.
- Evidence is recorded and the user explicitly accepts M5.
