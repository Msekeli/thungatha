# Job Tracking

Feature boundary for actual job application records, application status, history, follow-ups, next actions, and submitted-material references.

## Current UI implementation

- `ui/job-tracking-dashboard.tsx` — Job Tracking overview and application pipeline shell.
- `ui/application-stat-card.tsx` — reusable application summary card.
- `ui/application-status-badge.tsx` — reusable lifecycle status badge.
- `ui/application-filters.tsx` — search and status filter controls.
- `ui/application-empty-state.tsx` — no-application state.
- `ui/record-application-dialog.tsx` — record-application form layout.

The current screen is intentionally UI-only. It uses zero-state summary values and does not call an application API, write records, or persist form input. The form displays an explicit notice when submitted. Do not interpret this screen as an implemented application workflow.

## Planned ownership

- `ui/` — application lists, detail views, status updates, interviews and follow-up workflows.
- `server/` — application-record validation, ownership checks, persistence, retention and lifecycle operations.

Do not treat a saved or opened job listing as an application, and do not claim an application was submitted unless the user confirms it.
