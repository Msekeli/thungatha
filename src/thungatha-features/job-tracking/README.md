# Job Tracking

Feature boundary for actual job application records, application status, history, follow-ups, next actions, and submitted-material references.

## Route

- Canonical route: `/job-tracking`.
- The legacy `/applications` route redirects to `/job-tracking`.
- Workspace navigation uses the canonical route.

## Current UI implementation

- `ui/job-tracking-dashboard.tsx` — dashboard, summary cards, search/status filtering, list and detail preview.
- `ui/application-list.tsx` — responsive application list.
- `ui/application-stat-card.tsx` — reusable application summary card.
- `ui/application-status-badge.tsx` — reusable lifecycle status badge.
- `ui/application-filters.tsx` — search and lifecycle status filter controls.
- `ui/application-empty-state.tsx` — no-application state.
- `ui/record-application-dialog.tsx` — interactive record-application form.
- `types/application.ts` — frontend-only application types and lifecycle status values.

The current screen is a client-side UI prototype. Records are held in React page state only and disappear when the page session is reset. No application API, database persistence, server validation, ownership enforcement, status history, or reminders are implemented.

The status values mirror the approved lifecycle: Draft, Submitted, Under review, Interview, Offer, Accepted, Rejected and Withdrawn. Users must explicitly choose Submitted; opening or saving a job does not imply an application was sent.

## Planned ownership

- `ui/` — application lists, detail views, status updates, interviews and follow-up workflows.
- `types/` — frontend feature types only; these are not a database schema.
- `server/` — application-record validation, ownership checks, persistence, retention and lifecycle operations.

Do not treat a saved or opened job listing as an application, and do not claim an application was submitted unless the user confirms it.
