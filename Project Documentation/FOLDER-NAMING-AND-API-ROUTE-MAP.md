# Folder Naming and API Route Map

**Branch audited:** `dev`  
**Audit base:** `94ec359b3b1681f1db563694b69dc464cb06ec82`  
**Status:** Feature-owned UI/server modules migrated on `dev`; proposed App Router route-group layout is not yet implemented  
**Purpose:** Make code discoverable while preserving established URLs and API contracts.

## 1. Folder naming standard

Feature-owned folders use explicit lowercase kebab-case names:

| Responsibility | Target feature folder | Boundary |
|---|---|---|
| Searching, filtering, viewing, saving, and dismissing catalogue listings | `src/thungatha-features/job-discovery/` | Owns discovery experiences and job-listing catalogue behaviour |
| Sign-in, sign-up, sign-out and authentication UI | `src/thungatha-features/authentication/` | Authentication integration and UI; identity still resolved server-side |
| Confirmed professional background | `src/thungatha-features/user-profile/` | Professional facts and profile workflows |
| Account preferences, privacy and data controls | `src/thungatha-features/user-account/` | Account-level settings; not a collection of multiple user accounts |
| CV creation and tailored versions | `src/thungatha-features/cv-studio/` | CV authoring and versioning when implemented |
| Actual submitted job applications and lifecycle | `src/thungatha-features/job-tracking/` | Application records, statuses, follow-ups and submitted-material references |

A **job listing** is a catalogue/domain record owned by **Job Discovery**. It is not the same thing as a job application. A user saving or dismissing a listing is not creating an application record.

Use clear names for feature boundaries. Do not use `jobs`, `profile`, or `account` as top-level feature names in the target architecture. Technical buckets such as `app`, `api`, `components`, `lib`, and a scoped `ui` folder may remain where they express a framework or technical convention. Do not add a second generic `server`/infrastructure home just to satisfy a diagram; keep existing `src/lib` helpers until a tested extraction is justified.

## 2. Next.js route folders versus URLs

Next.js App Router folder names normally contribute to the URL. Renaming `app/profile` to `app/user-profile` would change `/profile` to `/user-profile`. That is not an acceptable side effect of a structural cleanup.

Route groups use parentheses and do not add a URL segment. They let the physical tree identify a feature while preserving an existing URL. These are **proposed target paths**, not yet implemented:

| Proposed physical path | URL preserved |
|---|---|
| `src/app/(authentication)/sign-in/[[...sign-in]]/page.tsx` | `/sign-in` |
| `src/app/(authentication)/sign-up/[[...sign-up]]/page.tsx` | `/sign-up` |
| `src/app/(job-discovery)/page.tsx` | `/` |
| `src/app/(job-discovery)/jobs/page.tsx` | `/jobs` |
| `src/app/(user-profile)/profile/page.tsx` | `/profile` |
| `src/app/(user-account)/account/page.tsx` | `/account` |
| `src/app/cv-studio/page.tsx` | `/cv-studio` |
| `src/app/(job-tracking)/applications/page.tsx` | `/applications` (current URL; see discrepancy below) |

Route groups must not introduce duplicate URL paths. After moving a route, verify the generated route table/build and run direct-entry tests for the affected URLs.

## 3. API inventory verified on `dev`

The following endpoints exist in the inspected source tree. The route-group paths below are a **proposed physical organization only**; the public HTTP paths and methods remain unchanged.

| HTTP method | Current API path | Current responsibility | Authentication / access | Proposed physical route path |
|---|---|---|---|---|
| GET | `/api/jobs` | Search/filter/paginate active job listings; optionally joins the signed-in user's saved/dismissed state | Public catalogue reads; user state is scoped to server-resolved identity; saved/dismissed filtering requires identity | `src/app/api/(job-listings)/jobs/route.ts` |
| GET | `/api/jobs/[id]` | Read one active listing and optionally include the signed-in user's state | Public read; user state is scoped to identity | `src/app/api/(job-listings)/jobs/[id]/route.ts` |
| PUT | `/api/jobs/[id]/state` | Save or dismiss a listing | Authentication required; server-resolved user ID | `src/app/api/(job-listings)/jobs/[id]/state/route.ts` |
| DELETE | `/api/jobs/[id]/state` | Clear the signed-in user's saved/dismissed state | Authentication required; deletes only the caller's state | `src/app/api/(job-listings)/jobs/[id]/state/route.ts` |
| GET | `/api/jobs/[id]/activity` | Read the caller's application-link-opened and applied-at activity timestamps | Authentication required; user-scoped activity | `src/app/api/(job-listings)/jobs/[id]/activity/route.ts` |
| POST | `/api/jobs/[id]/activity` | Record `opened_application` or `confirm_applied` activity | Authentication required; user-scoped activity | `src/app/api/(job-listings)/jobs/[id]/activity/route.ts` |
| POST | `/api/internal/jobs/ingest` | Trigger server-side job ingestion | Bearer secret from `INGESTION_CRON_SECRET` or `CRON_SECRET`; server-side only | `src/app/api/(job-ingestion)/internal/jobs/ingest/route.ts` |
| GET | `/api/profile` | Read the authenticated user's current display name | Authentication required | `src/app/api/(user-profile)/profile/route.ts` |
| PATCH | `/api/profile` | Validate and save the authenticated user's display name | Authentication required; rejects client-supplied user identity | `src/app/api/(user-profile)/profile/route.ts` |

The API folder named `jobs` is currently part of the public contract (`/api/jobs`). Do not rename it to `/api/job-listings` as a folder cleanup. A route group such as `(job-listings)` can provide clearer physical ownership without changing the endpoint.

## 4. API findings and gaps

- **No account settings API is present** in the inspected source tree. The current `/account` page is a placeholder, and the product's account feature is planned for a later milestone.
- **No CV Studio API is present** in the inspected source tree. The current CV Studio page is a placeholder.
- **No full Job Tracking application-record API is present** in the inspected source tree. The current placeholder page is at `/applications`; architecture/product documentation names `/job-tracking`. This is a product/URL discrepancy and must be resolved separately before implementing or moving that page.
- The existing `/api/jobs/[id]/activity` endpoint writes discovery activity timestamps, including an `applied_at` timestamp for `confirm_applied`. This is not a full application record with a lifecycle, submitted-material snapshot, and follow-up data. Before implementing Job Tracking, reconcile this activity meaning with the product rule that actual applications belong to Job Tracking.
- The current `/api/profile` endpoint only reads/writes `displayName`; it is not yet an API for the complete professional profile (skills, experience, qualifications, or CV-import confirmation).
- The authenticated Job Discovery UI links to `/tracking`, but there is no matching `src/app/tracking` route in the inspected tree. Treat this as a stale navigation link to review during the route cleanup; do not assume the route exists or silently redirect it as part of a folder-only change.
- Existing job Route Handlers currently contain validation, Supabase queries, and orchestration. Keep endpoint contracts stable. Extract use cases/repositories only where a focused change, clear boundary, and tests justify it.

## 5. Required pre-migration audit

Before any route or feature folder is moved:

1. Search all imports and links, including dynamic route references and navigation configuration.
2. Record each HTTP method, request schema, response shape, status/error behavior, authentication rule, ownership predicate, and database table affected.
3. Read and retain the relevant route tests; add tests if a structural move exposes an uncovered contract.
4. Preserve all existing URL paths and API response shapes during structural-only changes.
5. Use Next.js route groups only when the resulting URL is unique and unchanged.
6. Move one coherent feature boundary at a time; update imports and both architecture maps in the same change.
7. Run the actual package scripts available in `package.json`: at minimum relevant Vitest tests, ESLint, and a production build when the local environment supports them. Record what was and was not run.
8. Do not mark a migration verified based only on a successful text edit or GitHub commit.


## 6. File naming conventions

Use a filename that identifies the responsibility, not merely the framework role or a broad technical category.

### General rules

- Use lowercase kebab-case for new TypeScript, TSX, CSS, and documentation filenames: `job-listing-card.tsx`, `job-search-filters.tsx`, `job-listings.css`, `user-profile-schema.ts`.
- Name components after the UI responsibility they render; name utilities after the operation they perform; name schemas after the data they validate; name API service functions after the operation and resource.
- Keep implementation and test names paired and searchable. For example, `job-listing-query.ts` and `job-listing-query.test.ts`; `job-listing-card.tsx` and `job-listing-card.test.tsx`.
- Avoid ambiguous names such as `helpers.ts`, `utils.ts`, `common.ts`, `data.ts`, `manager.ts`, `service.ts`, or `index.ts` unless the folder context makes the responsibility genuinely obvious and the file is only a small barrel.
- Do not rename a file solely because its name is repeated elsewhere. A repeated basename can be correct when a framework requires it or when files are scoped to clearly named directories.
- Avoid overly broad files that combine unrelated responsibilities. Split by cohesive behaviour. The project line limit is 100 physical lines per handwritten source file, with a warning at 80; this applies to components, CSS, tests, configuration, and other maintained code. Generated files, dependency lockfiles, and vendored code are excluded. Do not compress code to game the limit or create meaningless one-file-per-function fragmentation.
- Before and after meaningful implementation work, count changed source-file lines. Warn at 80 lines, split cohesive responsibilities before 100 where practical, and report any file over the limit. Until automated local/CI enforcement is implemented and verified, this check is manual.
- Prefer descriptive exported names as well as descriptive filenames. File and symbol names should reinforce each other.
- Keep file naming consistent within a feature. Do not introduce a new convention in one folder while leaving the rest unexplained.

### UI styling priority

- Follow D-035: use Tailwind CSS v4 and shadcn/ui patterns for redesigned components, reusing existing shared controls where suitable. MUI remains in areas not yet migrated.
- Use Tailwind CSS v4 utilities for layout and straightforward styling.
- Add scoped CSS only when Tailwind cannot reasonably meet the requirement or a component needs a complex visual treatment.
- Keep custom CSS small and scoped to the owning component/feature; do not create CSS files by default.

### Next.js reserved/conventional filenames

These filenames are intentionally repeated and should remain where Next.js expects them:

- `page.tsx`: route page entry point.
- `route.ts`: HTTP Route Handler entry point.
- `layout.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`: framework route/layout/error conventions.

Make these files thin. Put substantial UI in a descriptively named page component and put API operations in descriptively named modules. Example:

```text
src/app/api/(job-listings)/jobs/route.ts
src/thungatha-features/job-discovery/server/get-job-listings.ts
src/thungatha-features/job-discovery/server/get-job-listing-by-id.ts
src/thungatha-features/job-discovery/server/update-job-listing-state.ts
src/thungatha-features/job-discovery/server/get-job-listing-activity.ts
src/thungatha-features/job-discovery/server/record-job-listing-activity.ts
```

These are naming examples, not claims that these modules exist today. Do not move business logic merely to match the diagram. Extract it only after auditing imports, auth, data ownership, response shapes, and tests.

### Current filename and file-size findings

The scan of the current `dev` tree found 81 files under `src/` before the feature-folder migration. Repeated basenames include:

- `page.tsx` (8), `route.ts` (6), `route.test.ts` (6): mostly legitimate Next.js conventions, but they require descriptively named parent directories and thin entry-point files.
- `loading.tsx` (2): legitimate Next.js convention.
- `index.ts` (2): inspect whether each is a useful public export barrel or an unnecessary indirection.
- `schema.ts` (2): technically valid but less discoverable across feature boundaries; consider names such as `job-listing-schema.ts` and `user-profile-schema.ts` when those files are migrated.
- `theme.ts` (2): inspect and resolve overlapping responsibilities before renaming or consolidating; do not merge them based on filename alone.

Largest source files identified by the scan:

| Current file | Approximate size | Initial recommendation |
|---|---:|---|
| `src/thungatha-features/job-discovery/ui/jobs-discovery.tsx` | 1,378 lines | Split page orchestration, job results/list, job details, filter controls, and API/state operations into cohesive modules after dependency review |
| `src/thungatha-features/job-discovery/ui/jobs-discovery.css` | 3,445 lines | Split styles by stable UI section/component, keeping feature scoping and responsive behaviour intact |
| `src/thungatha-features/job-discovery/ui/public-job-discovery.css` | 3,216 lines | Split by public discovery sections, preserving selector scope and media-query behaviour |
| `src/thungatha-features/job-discovery/ui/public-job-discovery.tsx` | 56 physical lines, about 23 KB | Reformat first; many statements are compressed onto single lines. Then assess component boundaries |
| `src/styles/components.css` | 487 lines, about 12 KB | Inspect ownership and group shared styles by component only where it improves discovery |

Sizes are a prioritisation signal, not a mandate to split every large file. CSS splitting can change cascade order, and React splitting can change state/effect behaviour; both require targeted tests and visual verification.

### Additional code-level findings from the route/file inspection

- `src/app/api/jobs/route.ts` is about 193 lines and includes a filter-sanitising helper alongside the GET handler. Review whether query parsing/filter validation and listing retrieval can be moved into named Job Discovery modules without changing the endpoint contract.
- `src/app/api/jobs/[id]/state/route.ts` (about 102 lines) and `src/app/api/jobs/[id]/activity/route.ts` (about 146 lines) each resolve identity and handle user-owned state/activity. Review a shared identity helper only if the existing authentication contract and error handling can remain identical.
- `src/app/api/profile/route.ts` (about 107 lines) resolves identity and handles GET/PATCH validation and persistence. It should delegate to named profile operations where this improves clarity, without pretending the current display-name API is a full professional-profile API.
- `src/app/api/jobs/[id]/route.ts` (about 63 lines) and `src/app/api/internal/jobs/ingest/route.ts` (about 60 lines) are smaller; keep them focused rather than splitting them automatically.
- `src/thungatha-features/job-discovery/server/providers/aggregators/index.ts` and `src/thungatha-features/job-discovery/server/providers/ats/index.ts` are tiny files with no exports in the inspected source. Verify whether they are needed; if not imported, remove them as part of a reference-checked cleanup rather than keeping meaningless files.
- `src/lib/theme.ts` and `src/theme/theme.ts` are not duplicates: the first defines the app's theme preference/bootstrap script, while the second creates a Material UI theme from tokens. Keep them separate or rename them to distinguish those responsibilities; do not merge based on the basename.
- The current public discovery TSX file is compressed into only 56 physical lines despite being about 23 KB. Reformat it before evaluating its true complexity; formatting should be a behaviour-neutral change.

### Migration order

1. Establish the naming rules before renaming source files.
2. Fix the physical feature boundaries and route groups while preserving public URLs.
3. For each API Route Handler, document methods, request/response shapes, authentication/ownership rules, and persistence effects. Keep `route.ts` as the entry point; extract well-named operations only when justified.
4. Decompose the large Job Discovery components into named, cohesive UI and behaviour modules. Preserve public and authenticated discovery as distinct experiences.
5. Reorganise CSS in small sections and verify responsive layouts after each change.
6. Review duplicate `index.ts`, `schema.ts`, and `theme.ts` names in context; do not perform blind global renames.
7. Update imports, paired tests, architecture docs, and `folder-structure.txt` in the same coherent change.
8. Run the relevant tests, lint, and production build where available. Record exactly what ran; do not call a text-only rename verified.

