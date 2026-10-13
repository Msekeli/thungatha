# Thungatha

Thungatha is an AI-assisted personal job-search and application-management product. It helps job seekers discover opportunities, assess fit against confirmed professional experience, prepare accurate CVs, and manage applications.

## Product rules

- The confirmed professional profile is the source of truth.
- AI may interpret and propose; application code enforces ownership, state transitions, deterministic filters, calculations, and other business rules.
- Users review imported information, accept or reject CV changes, and control application submissions.
- Match assessments and proposed CV edits must be traceable to evidence.
- Missing information remains unknown; it must not be silently treated as positive or negative.
- Preserve relevant history, including profile versions, job availability, application status, and submitted CV snapshots.
- Deliver complete, tested milestones rather than disconnected mockups.

## Technology direction

- Next.js App Router, React, strict TypeScript
- Vercel deployment; one repository and one modular-monolith application
- MUI for reusable components and Tailwind CSS v4 for layout/utilities
- Clerk authentication
- Supabase PostgreSQL and version-controlled migrations
- Zod validation
- Vitest, React Testing Library, and Playwright are the proposed testing baseline

See `PROJECT-CONTEXT.md` for the concise working context and `THUNGATHA-MASTER-PRODUCT-SPECIFICATION.md` for the authoritative product specification. Technology choices and their status are recorded in `DECISIONS.md`; detailed technical reference documents may be consulted when relevant.

## Getting started

Setup commands and required environment variables must be added after the repository's actual package configuration and service integrations are confirmed. Do not invent credentials or assume an integration is configured.

When setup is documented, include:
1. Supported runtime and package-manager versions.
2. Install and local-run commands.
3. Required environment variable names (never secret values).
4. Database migration and test commands.
5. Troubleshooting for common setup failures.

## Delivery workflow

Work one milestone and one meaningful checkpoint at a time. Each checkpoint must have a defined outcome, verification steps, and an explicit status in `IMPLEMENTATION-PLAN.md`. Do not claim a checkpoint or milestone is complete until its acceptance criteria have been verified.

Do not commit, push, or deploy without the user's explicit approval.

## Local database tooling

Supabase CLI is installed as a development dependency. The project configuration lives in `supabase/config.toml`, and reviewed, ordered SQL migrations belong in `supabase/migrations/`.

- Check the CLI: `npx supabase --version`
- Initialize a new local Supabase project only if one does not already exist: `npx supabase init`
- Create a migration: `npx supabase migration new descriptive_change`
- Start the local Supabase stack when Docker is available: `npx supabase start`
- Apply pending migrations to the running local database: `npx supabase migration up`
- Inspect migration history: `npx supabase migration list`

Starting the local stack requires Docker. Do not commit secrets or environment-specific credentials. No application schema migration is defined yet; add one after the initial domain and user-ownership requirements are agreed.
