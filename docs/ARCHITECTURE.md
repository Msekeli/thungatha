# Thungatha — Architecture

**Document status:** Working architecture authority for review  
**Version:** 1.0  
**Last updated:** 15 October 2026

## 1. Purpose and architectural direction

Thungatha is one full-stack Next.js App Router application, in one repository and one deployment, using a **modular monolith**. Job Discovery, CV Studio, and Job Tracking are separate product experiences with direct routes, not separate applications or microservices.

The architecture must deliver the approved product specification and milestones without creating speculative layers or infrastructure. Prefer the current project's established conventions and extend them only when a real feature requires it.

### Architectural rules

1. Product rules and ownership checks are enforced by server-side application code, not by the UI or AI.
2. Confirmed Profile data is authoritative; imported and AI-produced content remains unconfirmed until reviewed.
3. Unknown data stays unknown; don't turn missing evidence into a negative conclusion.
4. User-owned reads and writes must use server-derived identity and enforce ownership.
5. External providers and AI models are replaceable adapters, not sources of authority.
6. Keep one deployable application. Do not add microservices, a mandatory queue, or a generic agent framework without an approved, evidenced need.
7. Preserve the approved milestone sequence. Architecture supports the plan; it does not redefine it.
8. Distinguish current files from planned structure. A folder in the target map is not evidence that the feature has already been implemented.

## 2. Runtime and deployment

- **Application:** Next.js App Router, React, strict TypeScript.
- **Hosting:** Vercel, using supported Next.js server rendering, Route Handlers, and server-side execution.
- **Authentication:** Clerk; resolve the authenticated identity on the server.
- **Database:** PostgreSQL through Supabase, with version-controlled SQL migrations.
- **Database access:** Supabase JavaScript client and SQL/migrations following the existing repository pattern. Do not introduce Prisma or Drizzle by default.
- **Validation:** Zod for untrusted requests and structured external/AI output, consistent with existing code.
- **UI:** Material UI plus Tailwind CSS v4, following the existing theme and CSS-layer conventions.
- **Testing:** existing Vitest/React Testing Library and Playwright conventions, where present.
- **File storage:** Supabase Storage or another approved object-storage service when CV uploads/generated files are implemented. Do not depend on Vercel function local disk for durable files.
- **Local development:** Docker is optional, not a prerequisite.
- **Scheduled ingestion:** only add a Vercel-compatible scheduled invocation or another approved execution mechanism after source refresh needs, plan limits, and idempotency are defined.

Verify current platform limits and integration guidance before relying on function duration, scheduling, payload size, database connection, or provider quotas. Keep local, preview, and production secrets separate.

## 3. System context and trust boundaries

```mermaid
flowchart TD
    User[Job seeker browser] --> Web[Next.js application on Vercel]
    Web --> Clerk[Clerk authentication]
    Web --> UseCases[Server-side application logic]
    UseCases --> DB[(Supabase PostgreSQL)]
    UseCases --> Storage[Object storage for CV files when introduced]
    UseCases --> Sources[Approved job-source adapters]
    Sources --> Providers[External job sources]
    UseCases --> AIAdapter[AI provider boundary]
    AIAdapter --> AIProviders[Gemini / Groq; optional experiments]
```

Trust boundaries:
- Browser input, URL parameters, IDs, profile data, and requested state changes are untrusted.
- External job data and AI responses are untrusted until normalized and validated.
- Authentication establishes identity; it does not by itself authorize access to every record.
- Privileged database credentials and provider keys remain server-side.
- Logs must not contain secrets, raw CVs, full job descriptions, or unnecessary personal information.

## 4. Logical layers and dependency rules

The app can organize code by feature and responsibility inside the existing `src/` tree. Do not create a separate package/class/folder for every box in a diagram.

- **Route and presentation layer:** App Router pages/layouts, route handlers, and React components. Compose screens and handle user interaction.
- **Application/use-case layer:** coordinates use cases, validation, authorization, persistence, provider calls, and state transitions.
- **Domain rules:** deterministic rules such as deduplication, matching classification, CV version rules, and application status transitions. Domain logic should not depend on Next.js, Clerk SDKs, database clients, or AI SDKs.
- **Infrastructure:** SQL/repository functions, Clerk identity integration, storage, job-source adapters, and AI-provider adapters.
- **Shared cross-cutting utilities:** authentication helpers, response/error conventions, schemas, environment validation, and logging. Do not turn `src/lib` into a catch-all for feature business logic.

Dependency rules:
1. UI components do not query PostgreSQL directly.
2. Route handlers validate requests, resolve the authenticated actor, call application logic, and translate outcomes into responses. Keep substantial business logic out of route handlers.
3. User IDs must be derived from the authenticated server identity, not accepted from the browser as authority.
4. Provider SDK imports stay inside the relevant adapter or explicitly approved integration boundary.
5. Keep module dependencies directional and avoid circular dependencies.
6. Reuse existing code after inspection; do not rebuild working authentication/profile foundation code just to fit a theoretical structure.

## 5. Agreed repository structure

This is the **agreed documentation and milestone structure**, with the existing application code retained under `src/`. Milestone folders should be created even before their work begins; use `.gitkeep` in an otherwise-empty folder so Git tracks it. Do not create speculative feature implementation files merely to populate a tree.

```text
thungatha/
├── README.md
├── AGENTS.md
├── IMPLEMENTATION-PLAN.md
├── DECISIONS.md
├── PROJECT-CONTEXT.md                 # fate to be reviewed; don't delete silently
├── docs/
│   ├── PRODUCT-SPECIFICATION.md
│   └── ARCHITECTURE.md
├── milestones/
│   ├── M1-job-discovery-and-job-feed/
│   │   └── M1-JOB-DISCOVERY-AND-JOB-FEED.md
│   ├── M2-profile-and-cv-import/
│   │   └── M2-PROFILE-AND-CV-IMPORT.md
│   ├── M3-job-matching-and-fit-analysis/
│   │   └── M3-JOB-MATCHING-AND-FIT-ANALYSIS.md
│   ├── M4-cv-studio/
│   │   └── M4-CV-STUDIO.md
│   ├── M5-job-tracking/
│   │   └── M5-JOB-TRACKING.md
│   └── M6-account-and-release/
│       └── M6-ACCOUNT-AND-RELEASE.md
├── public/
│   └── brand/
├── scripts/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # public landing page
│   │   ├── layout.tsx                # root layout/providers
│   │   ├── globals.css               # global styles and CSS layers
│   │   ├── sign-in/                  # Clerk sign-in route
│   │   ├── sign-up/                  # Clerk sign-up route
│   │   ├── jobs/                     # planned Job Discovery route
│   │   ├── profile/                  # Profile route
│   │   ├── cv-studio/                # planned CV Studio route
│   │   ├── job-tracking/             # planned Job Tracking route
│   │   ├── account/                  # planned Account route
│   │   └── api/
│   │       └── profile/              # existing profile API
│   ├── components/
│   │   ├── auth/
│   │   ├── landing/
│   │   ├── profile/
│   │   ├── theme/
│   │   └── ui/
│   ├── lib/
│   │   ├── auth/                     # server-derived identity helpers
│   │   ├── http/                     # API response conventions
│   │   ├── profile/                  # existing profile schema/repository
│   │   └── supabase/                 # Supabase server client
│   ├── styles/                       # shared component styles
│   └── theme/                        # tokens and theme integration
├── supabase/
│   └── migrations/                   # version-controlled SQL schema changes
├── e2e/                              # Playwright end-to-end tests
├── vitest.config.mts
├── playwright.config.ts
├── package.json
└── tsconfig.json
```

### Structure interpretation

- The tree combines the **agreed target structure** with known current paths to make the repository navigable. Labels such as “planned” mean the route or feature may not exist yet.
- The supplied milestone ZIP defines the detailed milestone filenames. Keep the master plan at repository root; do not move it into `milestones/`.
- `PROJECT-CONTEXT.md` currently exists. Review whether its useful content should be retained, merged, or replaced after the new documents are installed; do not delete it as part of this package.
- Existing `/dashboard` code and `src/components/auth/auth-page-shell copy.tsx` need a reference/use audit before deciding whether to retain, repurpose, redirect, or remove them.
- Existing `src/app/sign-in/[[...sign-in]]/page.tsx` and `src/app/sign-up/[[...sign-up]]/page.tsx` are nested routes; the abbreviated tree above shows their parent route only.
- Tests may live beside implementation or in `e2e/`, according to the existing conventions. Do not relocate tests solely to make the tree match the diagram.
- Empty milestone folders should contain `.gitkeep` until their milestone document is placed there.
- Do not create every future feature folder under `src/` in advance. Create implementation directories when their milestone needs them.

## 6. File and folder guide

### Root documents

| Path | Responsibility |
|---|---|
| `README.md` | How to install, configure, run, test, and build the project; links to authoritative docs |
| `AGENTS.md` | Persistent instructions for AI coding agents: inspect first, respect scope, test, report evidence |
| `IMPLEMENTATION-PLAN.md` | Cross-milestone sequence, dependencies, status, and overall acceptance |
| `DECISIONS.md` | Decision log, rationale, status, and unresolved decisions |
| `PROJECT-CONTEXT.md` | Existing project context; review its role before merging or removing it |
| `docs/PRODUCT-SPECIFICATION.md` | Product capabilities, business rules, and expected user behaviour |
| `docs/ARCHITECTURE.md` | Technical design, boundaries, folder map, data flow, security, and implementation conventions |

### Existing app paths

| Path | Responsibility |
|---|---|
| `src/app/page.tsx` | Public landing page |
| `src/app/layout.tsx` | Root layout, providers, and global application shell |
| `src/app/globals.css` | Global CSS, imports, and CSS-layer ordering |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | Clerk sign-in page |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | Clerk sign-up page |
| `src/app/api/profile/route.ts` | Profile API route; follow its server-side identity and validation pattern |
| `src/components/auth/` | Authentication-related UI |
| `src/components/landing/` | Landing-page UI and preview components |
| `src/components/profile/` | Profile UI, including form and tests |
| `src/components/theme/` | Theme controls |
| `src/components/ui/` | Reusable UI primitives |
| `src/lib/auth/identity.ts` | Server-side authenticated identity resolution |
| `src/lib/http/api-response.ts` | Consistent API response helpers |
| `src/lib/profile/schema.ts` | Runtime profile validation schema |
| `src/lib/profile/repository.ts` | Profile persistence logic |
| `src/lib/supabase/server.ts` | Supabase server client setup |
| `src/proxy.ts` | Existing request/auth proxy logic; inspect before changing |
| `src/theme/tokens.json` | Source of design-token values |
| `src/theme/theme.ts` | MUI theme configuration |
| `src/theme/clerk-appearance.ts` | Clerk theme integration |
| `src/styles/tokens.css` | Generated design-token CSS; do not hand-edit if generated by script |
| `src/styles/components.css` | Shared styled patterns |
| `scripts/generate-tokens.mjs` | Regenerates token CSS from the token source |
| `supabase/migrations/` | Version-controlled database schema changes |
| `e2e/` | Playwright browser journey tests |
| `src/**/*.test.ts(x)` | Unit/component/API tests alongside their related code |

### Where new feature code belongs

Use the existing conventions first. For a new feature:
- Route composition goes under `src/app/<route>/`.
- Feature-specific React components go under `src/components/<feature>/` when that matches the existing pattern.
- Server-side business logic, schema validation, and repository functions should be organized in feature-focused modules under `src/lib/<feature>/` or an explicitly agreed `src/modules/<feature>/` structure.
- Shared authentication, HTTP, theme, and database utilities remain cross-cutting; feature-specific business rules should not be placed there.
- SQL schema changes belong in a new migration under `supabase/migrations/`.
- Add tests beside implementation for unit/API/component tests and in `e2e/` for browser journeys.

Do not introduce both `src/lib/<feature>/` and `src/modules/<feature>/` for the same concern without a documented reason. Choose and record a convention during the relevant checkpoint, based on the repository and scope.

## 7. Product module boundaries

| Module/experience | Owns | Does not own |
|---|---|---|
| Job Discovery | Normalized job catalogue, source provenance, search/filter/detail, save/dismiss, availability status | Application lifecycle, CV versions, Profile-based scoring in M1 |
| Profile | Confirmed professional facts, import drafts, confirmation, profile history | Silent AI-driven edits |
| Matching | Requirement extraction, evidence mapping, deterministic scoring, explanation and stale-state | Owning job listings or CV versions |
| CV Studio | Master CV and tailored versions, recommendation, review, preview, comparison, export | Editing Profile silently; application status history |
| Job Tracking | Actual application records, statuses/history, submitted-material reference, contacts, interviews, notes, follow-ups | Job-source catalogue ownership or CV authoring |
| Account | User preferences and account-level settings defined in M6 | Duplicating Clerk identity or feature data |

Job Tracking links to the exact CV version or submitted-material snapshot used for an application. CV Studio remains the owner of CV versions. A user can record an externally sourced application in Job Tracking without first creating a Job Discovery catalogue record.

## 8. Data access, authentication, and ownership

- Resolve the authenticated user on the server through Clerk integration.
- Treat identity and record authorization as separate checks.
- Never accept a client-provided `userId` as proof of ownership.
- Apply ownership constraints to every user-owned read and write.
- Use Supabase/PostgreSQL Row Level Security where appropriate to the chosen connection and authorization pattern.
- Keep privileged credentials server-only. Never serialize them into client props or client bundles.
- Validate requests at runtime using Zod or the established project schema pattern.
- Keep migrations version-controlled and avoid untracked manual production schema changes.
- Test cross-user isolation and unauthorized access for each new user-owned resource.

The existing profile API/repository/migration provide a starting example. Inspect their implementation before copying the pattern to other features.

## 9. Job-source integrations

Each approved job source should sit behind a small server-side adapter with a normalized internal output. Source adapters should:
- preserve source-specific identifiers and original discovery/application URLs;
- validate and normalize provider responses;
- respect terms, attribution, quotas, and approved access methods;
- use bounded requests, timeouts, and explicit error handling;
- be safe to retry and idempotent where ingestion is repeated;
- avoid mass-marking listings unavailable because a provider temporarily failed;
- retain useful provenance and refresh history.

A source list found in research is not automatically approved. Confirm source-specific requirements during the appropriate M1 checkpoint. Do not add an unapproved source simply because it is technically convenient.

## 10. AI provider boundary

Use a provider-independent server-side interface only for concrete tasks that need AI. Gemini is the initial primary option; Groq is an alternative for supported tasks. Camber and Ollama remain optional experiments, not required runtime dependencies.

- Validate all structured output.
- Apply timeouts and bounded retries only for transient failures.
- Treat output as a suggestion and never as authorization or unquestioned truth.
- Keep keys server-side.
- Avoid sending CVs or unnecessary personal data during M1.
- Ensure ingestion, deterministic filtering, persistence, and user actions still work when AI is disabled.
- Do not build a generic agent framework for the MVP.

## 11. CV files and storage

When CV upload and export are implemented, use durable object storage approved for the project, such as Supabase Storage if suitable. Decide file type/size limits, access policies, signed URLs, retention, deletion, and privacy behaviour before release. Do not rely on the function's local filesystem for durable storage.

## 12. UI and navigation architecture

- `/` is the public landing page.
- `/jobs`, `/cv-studio`, and `/job-tracking` are the three primary authenticated experiences.
- `/profile` and `/account` are supporting areas.
- `/sign-in` and `/sign-up` provide authentication.
- Each primary experience must handle direct entry and missing prerequisites gracefully.
- Use the current shared theme and design tokens rather than creating feature-specific competing design systems.
- Keep only one dominant glow/high-emphasis action per screen, consistent with the supplied design direction.
- Use the existing MUI + Tailwind v4 approach consistently; do not introduce a second component system without approval.
- Inspect existing dashboard/auth-shell references before removal or migration.

## 13. Testing and operational visibility

For each checkpoint, select tests that prove the changed behaviour:
- unit tests for deterministic rules and state transitions;
- API/integration tests for validation, persistence, provider failures, and ownership;
- component tests for loading/empty/error/validation and accessible interactions;
- Playwright for critical end-to-end user journeys and responsive behaviour.

At release, run the available formatting, lint, type-check, test, build, browser, accessibility, privacy/security, and performance checks. Record actual results; never fabricate a passing check. Avoid adding telemetry that records raw CV content or unnecessary personal information.

## 14. How to change this architecture

Change the architecture when there is a demonstrated technical need, a product requirement that cannot be met with the current design, or an external constraint that invalidates an assumption.

Before making a structural change:
1. identify the requirement or evidence;
2. describe the alternatives and trade-offs;
3. identify effects on approved milestone scope and acceptance criteria;
4. update `DECISIONS.md` where appropriate;
5. obtain user approval before changing a locked scope or sequence.

Routine implementation details can evolve within these boundaries, but do not silently alter the approved roadmap or convert an open decision into a settled one.

## 15. Relationship to other documents

- `docs/PRODUCT-SPECIFICATION.md` defines what the product must do and the user-facing rules.
- `IMPLEMENTATION-PLAN.md` defines the cross-milestone sequence, dependencies, progress, and overall acceptance.
- `milestones/<folder>/<file>.md` defines detailed work, checkpoints, tests, evidence, and milestone acceptance.
- `DECISIONS.md` records rationale, status, and open decisions.
- `AGENTS.md` tells AI coding agents how to work safely and consistently.
- `README.md` explains setup, environment configuration, commands, and how to navigate project documentation.

When a conflict appears, identify it and ask for review instead of guessing. This architecture is a working proposal for review; placing it in the repository does not itself approve unresolved product or source-provider decisions.
