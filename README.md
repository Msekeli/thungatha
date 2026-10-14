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

## Local development

### Prerequisites

- Node.js 20.19 or newer (or Node.js 22.12 or newer) and npm 10 or newer.
- A Clerk application. Clerk provides sign-in, sign-up, and session tokens.
- Docker Desktop only when running the local Supabase database. The app itself does not require Docker.
- A Supabase project for a hosted database, or the Supabase CLI local stack for development.

### Install and configure

```bash
npm ci
if [ ! -f .env.local ]; then cp .env.example .env.local; fi
```

If `.env.local` already exists, keep it and add only missing variables. Fill in the Clerk and Supabase values listed in `.env.example`; never commit `.env.local` or put a service-role key in it. The application uses only Supabase's publishable key and sends the signed-in Clerk session token to Supabase.

In Clerk, create an application and configure its Supabase integration. Register Clerk as a third-party auth provider for the Supabase project, and make sure Clerk session tokens include the `authenticated` role claim required by Supabase. For local Supabase, set `CLERK_DOMAIN` to the Clerk instance domain so the CLI can verify those JWTs. The Supabase project URL and publishable key are available in the project API settings.

For the local stack, use the API URL and publishable/anon key shown by `npx supabase status` in `.env.local`. For a hosted database, use the values from that Supabase project's API settings.

### Start the local database and app

With Docker running, apply the versioned schema from an empty local database:

```bash
npx supabase start
npx supabase db reset
```

`db reset` recreates the local database and applies every migration. To apply only pending migrations to a running local database, use `npx supabase migration up`; inspect applied migrations with `npx supabase migration list`.

Start Next.js in another terminal:

```bash
npm run dev
```

Open `http://localhost:3000`. The landing page remains public. Sign-in, sign-up, and `/dashboard` require Clerk configuration. The profile endpoint returns only the current Clerk user's profile and enforces ownership in both the server repository and database RLS policies.

### Checks

```bash
npm run lint
npx tsc --noEmit
npm run format:check
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm audit
```

Playwright starts the Next.js dev server itself. If the local environment prevents binding to port 3000, the E2E suite cannot run there. `npm audit` needs access to the npm registry. For a clean migration check, use `npx supabase db reset` with Docker running.

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
