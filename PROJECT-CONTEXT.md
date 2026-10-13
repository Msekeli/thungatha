# Thungatha — Project Context

**Purpose:** A compact context file for AI-assisted development. For the complete product requirements, see `THUNGATHA-MASTER-PRODUCT-SPECIFICATION.md`.

## What we are building

Thungatha is an AI-assisted personal job-search and application-management product. Its five main destinations are Jobs, Profile, CV Studio, Applications, and Preferences & Settings. Authentication/onboarding comes before these destinations.

The product helps a user:
- Discover and review jobs, including manually added jobs.
- Understand job requirements against confirmed professional evidence.
- Import and review profile information without silently confirming uncertain fields.
- Create accurate master and tailored CVs with traceable, reviewable changes.
- Track application status and history while preserving the exact materials used for each application.

The supplied `Thungatha – Final Product.html` is a visual reference for the intended light/dark desktop and mobile screens. Treat its displayed records and match scores as mock data, not live integrations or approved business logic. Consult relevant screens when implementing them.

## Non-negotiable principles

1. Confirmed profile data is authoritative.
2. The user controls confirmation, edits, and submissions.
3. AI interprets; deterministic code enforces rules.
4. Evidence must support assessments and proposed CV changes.
5. Unknown remains unknown.
6. Preserve history and submitted-material snapshots.
7. Deliver connected, tested vertical milestones.
8. One repository, one deployable modular monolith.
9. Build for the MVP; do not add speculative infrastructure.
10. Report status honestly.

## Architecture and stack

- Full-stack Next.js App Router application, React, strict TypeScript.
- Vercel hosting.
- MUI as the reusable component library; Tailwind CSS v4 for layout and utility styling, with an intentional styling boundary.
- Clerk authentication.
- Supabase PostgreSQL, with version-controlled repeatable migrations.
- Zod for runtime validation.
- Vitest and React Testing Library for unit/component tests; Playwright for browser journeys are proposed baselines.
- AI and job-source integrations must sit behind replaceable boundaries where justified.
- Docker is optional, not a setup prerequisite.
- No ORM by default. Add dependencies only when a demonstrated need and compatibility check justify them.

Exact versions, provider limits, plan compatibility, and unresolved integration choices must be verified rather than guessed. See `DECISIONS.md` and the detailed stack/architecture reference files when relevant.

## Product milestones

- **M0 — Product & Engineering Foundation:** repository conventions, local setup, environment handling, auth, database connection/migrations, user ownership, tests, error handling, module boundaries, responsive app shell/design tokens.
- **M1 — Job Discovery & Job Feed:** usable job feed, details, search/filters, save/dismiss/undo, manual job entry, normalization/deduplication, source validation, and availability/error handling. Manual entry must remain useful even without an external provider.
- **M2 — Professional Profile & CV Import**
- **M3 — Job Matching & Fit Analysis**
- **M4 — CV Studio**
- **M5 — Application Management**
- **M6 — Preferences, Hardening & Release**

Do not implement later-milestone functionality early merely because it appears in the design reference. The full specification defines milestone scope and acceptance criteria.

## Document authority

1. `THUNGATHA-MASTER-PRODUCT-SPECIFICATION.md` — product purpose, scope, business rules, milestone strategy, and design direction.
2. `DECISIONS.md` — explicit approved decisions and open/provisional choices; it records decisions but cannot silently override product requirements.
3. `IMPLEMENTATION-PLAN.md` — current milestone/checkpoint status and verified outcomes.
4. `PROJECT-CONTEXT.md` — concise working summary.
5. `README.md` — repository overview and setup instructions.
6. `AGENTS.md` — required coding-agent workflow and safeguards.
7. `TECH-STACK.md` and `ARCHITECTURE.md` — detailed technical references; use only when relevant.

If documents conflict, stop and identify the conflict. Do not silently resolve product-scope conflicts in favour of a lower-authority document. Update companion documents when a decision is approved.
