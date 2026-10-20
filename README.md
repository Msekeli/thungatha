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

Thungatha uses a single-repository modular-monolith architecture with feature-based organization. Next.js routes and HTTP Route Handlers stay under `src/app/`; feature-owned code is organized under `src/features/`; generic shared UI stays under `src/components/`; and existing shared helpers/infrastructure remain under `src/lib/` unless a concrete, reviewed refactor warrants moving them. The agreed target is documented in [`folder-structure.txt`](folder-structure.txt) and [`Project Documentation/ARCHITECTURE.md`](<Project Documentation/ARCHITECTURE.md>). This target is being adopted incrementally; it does not imply all files have already moved.

For Jobs, public discovery at `/` and authenticated discovery at `/jobs` remain separate experiences over the same job catalogue. We will extract only code that is genuinely shared and preserve existing behavior and API contracts. Job Tracking is authenticated; CV Studio can expose public introductory content while authoring remains authenticated. Application code enforces business rules, data ownership, validation, and state transitions. AI assists with interpretation and recommendations but does not replace deterministic application logic or silently modify confirmed user information.

## Getting Started

**Requirements:** Node.js 20.19+ (or 22.12+) and npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Configure the required environment variables in `.env.local` before using authenticated features. If `.env.local` already exists, preserve it and add only missing variables from `.env.example`. Never commit secrets.

### Job ingestion (current implementation)

The current protected ingestion endpoint and provider adapters are legacy implementation details under review. The agreed direction is to remove Adzuna and Jooble from active vacancy ingestion and replace aggregator-fed listings with direct employer-careers and permitted employer-authorized ATS sources. Do not add new aggregator configuration or treat aggregator listings as eligible jobs.

The target pipeline and implementation sequence are documented in [Employer Discovery and Job Ingestion Pipeline](<Project Documentation/EMPLOYER-DISCOVERY-PIPELINE.md>). The replacement is not considered implemented merely because the design is documented. Until migration is complete and verified, inspect the current code and configuration before running ingestion; do not assume the legacy setup matches the target design.

See [Local Development](#local-development) below for the database and verification commands.

### Local Development (using the cloud Supabase project)

Thungatha uses the configured cloud Supabase project for this workflow; you do not need to start a local Supabase stack or Docker.

1. Install dependencies and configure `.env.local` using `.env.example`. Keep your existing Clerk and Supabase values; never commit secrets.
2. Sign in to the Supabase CLI and link this repository to the same project referenced by `NEXT_PUBLIC_SUPABASE_URL`:

   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
   ```

   The project ref is the identifier in your Supabase dashboard URL: `https://supabase.com/dashboard/project/YOUR_SUPABASE_PROJECT_REF`.

3. Check migration history and preview pending changes before applying anything:

   ```bash
   npx supabase migration list --linked
   npx supabase db push --dry-run
   ```

   Confirm the preview targets the intended project and includes the new `20261017000100_job_application_activity.sql` migration. If it lists unrelated pending migrations, review them before proceeding. Then apply the reviewed pending migrations:

   ```bash
   npx supabase db push
   ```

4. Run the app and checks:

   ```bash
   npm run dev
   npm test
   npm run lint
   npm run build
   ```

Open [http://localhost:3000](http://localhost:3000), sign in through Clerk, and test with a job that has an active application URL. The activity API uses the signed-in user's Clerk token and Supabase RLS; do not substitute a service-role key for normal user requests.

If the migration preview or application fails, stop and inspect the error rather than manually changing the hosted schema.

## Project Status

Development follows six planned milestones, from job discovery through profile and CV import, job-fit analysis, CV Studio, application tracking, and account/release readiness. Milestone completion is based on verified acceptance criteria, not mockups alone.

## Documentation

- **[Folder Structure](folder-structure.txt):** Agreed target structure and incremental migration boundaries.
- **[Product Specification](<Project Documentation/PRODUCT-SPECIFICATION.md>):** Authoritative product requirements, workflows, and rules.
- **[Architecture](<Project Documentation/ARCHITECTURE.md>):** Application structure, module boundaries, request flows, authentication, and data access.
- **[Folder Naming and API Route Map](<Project Documentation/FOLDER-NAMING-AND-API-ROUTE-MAP.md>):** Naming conventions, current API inventory, and URL-preserving route organisation.
- **[Public Job Discovery Plan](<Project Documentation/PUBLIC-JOB-DISCOVERY-IMPLEMENTATION-PLAN.md>):** Existing public discovery implementation scope and verification record.
- **[Employer Discovery and Job Ingestion Pipeline](<Project Documentation/EMPLOYER-DISCOVERY-PIPELINE.md>):** Agreed target for six-month employer discovery, five Azure Functions, temporary processing storage, AI-assisted checks, and human approval.
- **[Technical Decisions](DECISIONS.md):** Confirmed decisions, provisional choices, and unresolved questions.
- **[Implementation Plan](IMPLEMENTATION-PLAN.md):** Milestones, checkpoints, acceptance criteria, and progress.
- **[Agent Instructions](AGENTS.md):** Development rules and guidance for AI coding assistants.

For milestone-specific requirements, see the relevant document under `milestones/`.

## Development Workflow

Work through one meaningful checkpoint at a time. Verify its acceptance criteria before marking it complete. Do not commit, push, or deploy without explicit approval.
