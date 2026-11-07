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
- **UI:** Tailwind CSS v4, shadcn/ui patterns, and Base UI primitives
- **Authentication:** Clerk
- **Database:** Supabase PostgreSQL with version-controlled SQL migrations
- **Validation:** Zod
- **Testing:** Vitest, React Testing Library, and Playwright
- **Deployment:** Vercel

## Architecture Overview

Thungatha uses a single-repository modular-monolith architecture with feature-based organization. Next.js routes and HTTP Route Handlers stay under `src/app/`; feature-owned code is organized under `src/thungatha-features/`; generic shared UI stays under `src/components/`; and shared helpers/infrastructure remain under `src/lib/`.

For Jobs, public discovery at `/` and authenticated discovery at `/jobs` remain separate experiences over the same job catalogue. Thungatha receives approved vacancy records from the separate **Thungatha Scout** extraction system. Scout owns employer-source retrieval, vacancy validation and sanitisation of employer-supplied description HTML. Thungatha owns the authenticated receiving endpoint, persistence, job discovery, job details, saved/dismissed state and application tracking. Thungatha does not run independent job-board or ATS provider adapters.

Application code enforces business rules, data ownership, validation, and state transitions. AI assists with interpretation and recommendations but does not replace deterministic application logic or silently modify confirmed user information.

## Getting Started

**Requirements:** Node.js 20.19+ (or 22.12+) and npm 10+.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Configure the required environment variables in `.env.local` before using authenticated features. If `.env.local` already exists, preserve it and add only missing variables from `.env.example`. Never commit secrets.

## Scout vacancy integration

The job catalogue is populated by **Thungatha Scout** through the protected receiver:

`POST /api/internal/scout/vacancies`

Configure `SCOUT_INGESTION_SECRET` in Thungatha and the matching secret in Scout. The receiver requires an `Authorization: Bearer` header and a JSON array containing up to 100 vacancy records. Each record must contain exactly the nine fields documented in [the Scout integration contract](docs/scout-integration-contract.md). The receiver rejects additional payload fields, validates required values and upserts by `scoutVacancyId`.

Scout remains responsible for retrieving and sanitising the original employer description. Thungatha stores that sanitised HTML string unchanged and renders its permitted structure. A missing company logo or employer publication/update date is accepted as `null`; Thungatha does not substitute its collection or database timestamp for an unknown publication date.

The Supabase service key is server-only and is used only by the receiving endpoint. It must never be exposed to the browser.

## Local Development (using the cloud Supabase project)

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

   Confirm the preview targets the intended project and includes `20261107000100_switch_to_scout_vacancies.sql`. Review any other pending migrations before applying:

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

Open [http://localhost:3000](http://localhost:3000), sign in through Clerk, and test discovery, saving, dismissing and application tracking with Scout vacancies. The activity API uses the signed-in user's Clerk token and Supabase RLS; do not substitute a service-role key for normal user requests.

If the migration preview or application fails, stop and inspect the error rather than manually changing the hosted schema.

## Project Status

**Milestone 1 — Job Discovery and Job Feed: Accepted, complete, and closed (2026-10-24).** The user has confirmed implementation testing is complete and accepted all nine M1 checkpoints. The Scout receiving contract is being implemented separately on the feature branch.

Development continues with M2 — Profile and CV Import, followed by job-fit analysis, CV Studio, application tracking, and account/release readiness. Milestone status and acceptance evidence are tracked in IMPLEMENTATION-PLAN.md and the relevant document under milestones/.

## Documentation

- **[Folder Structure](folder-structure.txt):** Agreed target structure and incremental migration boundaries.
- **[Product Specification](<Project Documentation/PRODUCT-SPECIFICATION.md>):** Authoritative product requirements, workflows, and rules.
- **[Architecture](<Project Documentation/ARCHITECTURE.md>):** Application structure, module boundaries, request flows, authentication, and data access.
- **[Scout Integration Contract](docs/scout-integration-contract.md):** Exact payload, validation rules, authentication and receiving endpoint.
- **[Folder Naming and API Route Map](<Project Documentation/FOLDER-NAMING-AND-API-ROUTE-MAP.md>):** Naming conventions, current API inventory, and URL-preserving route organisation.
- **[Technical Decisions](DECISIONS.md):** Confirmed decisions, provisional choices, and unresolved questions.
- **[Implementation Plan](IMPLEMENTATION-PLAN.md):** Milestones, checkpoints, acceptance criteria, and progress.
- **[Agent Instructions](AGENTS.md):** Development rules and guidance for AI coding assistants.

For milestone-specific requirements, see the relevant document under `milestones/`.

## UI and component standards

- Use shared theme tokens for colors, typography and other design-system values; do not define these locally in components.
- Prefer Tailwind CSS v4, shadcn/ui patterns, and existing Base UI/shared controls.
- Discuss and justify new CSS before adding it; introduce CSS only when necessary and keep it minimal and scoped.
- Keep handwritten components at or below 100 lines; warn at 80 and split by cohesive responsibility.

## Development Workflow

Work through one meaningful checkpoint at a time. Verify its acceptance criteria before marking it complete. Do not commit, push, or deploy without explicit approval.
