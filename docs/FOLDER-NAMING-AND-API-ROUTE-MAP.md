# Folder Naming and API Route Map

**Branch audited:** `dev`  
**Audit base:** `94ec359b3b1681f1db563694b69dc464cb06ec82`  
**Status:** Naming principle confirmed; proposed route-group layout is not yet implemented  
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
