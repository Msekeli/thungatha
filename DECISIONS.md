# Thungatha — Decision Log

This file records decisions and unresolved questions so neither people nor coding agents silently turn assumptions into requirements.

## Status labels

- **Confirmed** — agreed project direction.
- **Proposed** — recommended, not yet fully validated.
- **Provisional** — usable as a working direction but requires validation before production reliance.
- **Open** — no decision has been made.
- **Rejected** — considered and explicitly not selected.

When a decision changes, add a new dated entry or update the entry with a clear change history. Do not erase meaningful rationale.

## Confirmed direction

| ID | Decision | Rationale / constraints | Status |
|---|---|---|---|
| D-001 | One repository, one deployable Next.js application, modular monolith | Keeps MVP delivery and operations manageable; milestones are delivery boundaries, not separate services | Confirmed |
| D-002 | Next.js App Router, React, strict TypeScript, hosted on Vercel | Agreed application and hosting direction | Confirmed |
| D-003 | Clerk is the authentication baseline | Identity must be resolved server-side; authentication alone does not enforce record ownership | Confirmed baseline |
| D-004 | Supabase PostgreSQL is the primary relational database | Schema changes must be repeatable and version-controlled | Confirmed baseline |
| D-005 | MUI for reusable components and Tailwind CSS v4 for layout/utilities | Styling ownership and CSS-layer integration must be explicit | Confirmed |
| D-006 | Docker is optional and not a prerequisite | Local development and deployment should not require a local Docker daemon | Confirmed |
| D-007 | Do not add an ORM by default | Start with the Supabase JS client and SQL/migrations; reconsider only with documented need | Confirmed direction |
| D-008 | The confirmed professional profile is the source of truth | Imports and AI output remain drafts until user review/confirmation | Confirmed product rule |
| D-009 | AI interprets; code enforces deterministic rules | Authorization, ownership, transitions, filters, calculations, and snapshot creation must not depend on AI discretion | Confirmed product rule |
| D-010 | Keep checkpoint history in `IMPLEMENTATION-PLAN.md` | Avoid a separate document for every small task while retaining milestone-by-milestone traceability | Confirmed workflow |

## Open and provisional decisions

| ID | Question | What is needed before deciding | Status |
|---|---|---|---|
| D-011 | Which job source should be used for the MVP? Adzuna is a candidate, not yet approved | Validate South African job coverage, quality, terms, quotas, freshness, and costs; record evidence | Open |
| D-012 | Which AI provider/model will be used in production? | Compare quality, cost, privacy, availability, rate limits, and structured-output reliability; keep provider configurable | Open |
| D-013 | Exact supported versions of Next.js, React, MUI, Tailwind CSS v4, Clerk, Supabase and related libraries | Check official compatibility guidance at implementation time; lock compatible versions | Open |
| D-014 | Exact Clerk–Supabase authorization and Row Level Security design | Verify supported integration and token/connection model; test cross-user isolation | Open |
| D-015 | CV/document storage, access, retention, export, deletion and backup policy | Select compatible object storage and define access/lifecycle requirements | Open |
| D-016 | How job refresh/scheduled work will run within provider and Vercel limits | Validate source terms, idempotency, refresh needs, quotas, and current plan/runtime limits | Open |
| D-017 | Match score weights, badge thresholds, and visual bands | Approve a documented rubric and representative test cases before production use | Open |
| D-018 | Evidence required to label an employer application destination as verified | Define the verification rules and failure/uncertain states | Open |
| D-019 | Whether to add an ORM, advanced table library, monitoring service, or background-work service | Demonstrate a concrete need and compare compatibility, cost, privacy, and operational burden | Open |
| D-020 | Production operational thresholds, recovery, and alerting | Define before release based on observed usage and failure impact | Open |
| D-021 | Thungatha name/domain/trademark clearance | Perform separate checks; working name does not imply legal clearance | Open |

## Decision-entry template

### D-XXX — Short decision title

- **Date:** YYYY-MM-DD
- **Status:** Proposed / Confirmed / Provisional / Open / Rejected
- **Context:** What prompted this decision?
- **Options considered:** List realistic alternatives.
- **Decision:** State the choice, or state that it remains open.
- **Rationale:** Explain the trade-offs.
- **Evidence/validation:** Link tests, official docs, or measurements when available.
- **Consequences:** Implementation, security, cost, maintenance, or product impact.
- **Review trigger:** What would cause this to be reconsidered?

## Change control

If a new task depends on an Open or Provisional decision, surface the dependency before making an irreversible or expensive choice. Update this log when a decision is approved, and update related implementation/reference documents so they remain consistent.
