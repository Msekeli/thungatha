# Thungatha

Thungatha is an AI-assisted personal job-search and application-management platform. It helps job seekers discover opportunities, assess job fit against verified professional experience, prepare accurate CVs, and manage applications.

## Core Features

- **Job Discovery:** Find and explore relevant job opportunities, prioritising South African applicants and eligible remote roles.
- **Professional Profile:** Maintain a confirmed source of truth for professional experience, skills, and qualifications.
- **Job Fit Analysis:** Assess job requirements against profile evidence, distinguishing confirmed, inferred, missing, and unverifiable information.
- **CV Studio:** Create and tailor CVs while keeping proposed changes reviewable and traceable.
- **Application Tracking:** Manage applications and preserve relevant status history and submitted CV snapshots.

These capabilities are delivered incrementally through the project's milestone plan.

## Technology Stack

- **Frontend:** Next.js App Router, React, TypeScript
- **UI:** Material UI (MUI) and Tailwind CSS v4
- **Authentication:** Clerk
- **Database:** Supabase PostgreSQL with version-controlled SQL migrations
- **Validation:** Zod
- **Testing:** Vitest, React Testing Library, and Playwright
- **Deployment:** Vercel

## Architecture Overview

Thungatha uses a single-repository modular-monolith architecture. Application code enforces business rules, data ownership, validation, and state transitions. AI assists with interpretation and recommendations but does not replace deterministic application logic or silently modify confirmed user information.

## Getting Started

**Requirements:** Node.js 20.19+ (or 22.12+) and npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Configure the required environment variables in `.env.local` before using authenticated features. If `.env.local` already exists, preserve it and add only missing variables from `.env.example`. Never commit secrets.

For local job-feed testing while the Clerk/Supabase integration is being resolved, set `THUNGATHA_AUTH_BYPASS=true` in `.env.local` and restart the dev server. This bypass is ignored in production. In bypass mode, the public jobs feed works without a session; saved/dismissed filters and per-user state are unavailable. Apply the migration `20261016000100_allow_public_job_discovery.sql` to the Supabase project first. Keep profile, CV, and application endpoints authenticated, and set the bypass back to `false` before deployment.

### Job ingestion

The job catalogue is populated by a protected server-side runner; visiting the feed does not trigger provider calls. Configure at least one provider (Adzuna or Jooble), `NEXT_PUBLIC_SUPABASE_URL`, and the server-only `SUPABASE_SECRET_KEY` (or legacy `SUPABASE_SERVICE_ROLE_KEY`). Also set `INGESTION_CRON_SECRET` to a long random secret. Do not expose the Supabase secret key to the browser or commit it.

With the app running locally, trigger one ingestion run from a trusted terminal:

```bash
curl -X POST http://localhost:3000/api/internal/jobs/ingest \
  -H "Authorization: Bearer $INGESTION_CRON_SECRET"
```

The endpoint returns per-provider received/inserted/updated/skipped counts. HTTP 207 indicates that at least one provider reported a failure; inspect the response before treating the run as successful. A missing server key or missing provider configuration returns HTTP 503. For production, schedule this endpoint using a server-side scheduler and store the same secret in its protected configuration.

See [Local Development](#local-development) below for the database and verification commands.

### Local Development

Start the local Supabase stack and apply migrations with Docker running:

```bash
npx supabase start
npx supabase db reset
```

Run the application in another terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Run the project's checks with the commands documented in the development guide. See the [README's development instructions](#local-development) and the implementation plan for the current verification requirements.

## Project Status

Development follows six planned milestones, from job discovery through profile and CV import, job-fit analysis, CV Studio, application tracking, and account/release readiness. Milestone completion is based on verified acceptance criteria, not mockups alone.

## Documentation

- **[Project Context](PROJECT-CONTEXT.md):** Concise working context, conventions, and current implementation state.
- **[Master Product Specification](THUNGATHA-MASTER-PRODUCT-SPECIFICATION.md):** Authoritative product requirements, workflows, and rules.
- **[Architecture](docs/ARCHITECTURE.md):** Application structure, module boundaries, request flows, authentication, and data access.
- **[Technical Decisions](DECISIONS.md):** Confirmed decisions, provisional choices, and unresolved questions.
- **[Implementation Plan](IMPLEMENTATION-PLAN.md):** Milestones, checkpoints, acceptance criteria, and progress.
- **[Agent Instructions](AGENTS.md):** Development rules and guidance for AI coding assistants.

For milestone-specific requirements, see the relevant document under `milestones/`.

## Development Workflow

Work through one meaningful checkpoint at a time. Verify its acceptance criteria before marking it complete. Do not commit, push, or deploy without explicit approval.
