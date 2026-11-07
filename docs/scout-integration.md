# Scout vacancy integration

Thungatha consumes the published Scout vacancy export. Scout owns extraction, publication validation, description sanitisation and the export response contract.

## Scout API configuration

Set these server-only environment variables:

- `SCOUT_API_BASE_URL`: Scout API base URL, including `/api/v1` (for local development: `http://localhost:8000/api/v1`).
- `SCOUT_EXPORT_API_KEY`: optional when Scout is running with `APP_ENV=development` or `APP_ENV=test` and no export key is configured. If Scout has a key configured (including production), set the matching value here; Thungatha sends it as `X-Scout-Export-Key`.
- `SCOUT_LOCATION_SCOPE`: `cape_town`, `western_cape`, `south_africa` or `all`.
- `SUPABASE_SECRET_KEY`: Thungatha's server-only Supabase secret key.
- `SCOUT_SYNC_SECRET`: a separate secret used only to protect manual sync requests.

Scout export requests use `GET /vacancies/export`, query parameters `limit`, `offset` and `location_scope`, and the `X-Scout-Export-Key` header.

## Synchronisation

The public job feed may trigger a server-side refresh when Scout connection variables are configured. Successful refreshes are throttled for 60 seconds per running server process. The sync client retrieves every page from Scout with GET, then POSTs each page to Thungatha's protected `/api/internal/scout/vacancies/import` endpoint. That endpoint validates the payload, maps Scout fields to Thungatha columns and upserts into Thungatha's own `public.jobs` table by `scout_vacancy_id`. The sync client does not write to Supabase directly.

For a forced manual refresh:

```bash
curl -X POST http://localhost:3000/api/internal/scout/sync \
  -H "Authorization: Bearer $SCOUT_SYNC_SECRET"
```

The manual sync endpoint never exposes Scout credentials to the browser. Do not prefix Scout or Supabase secret values with `NEXT_PUBLIC_`.

## Mapping

Scout's response remains unchanged. Thungatha maps:

| Scout export field | Thungatha column |
|---|---|
| `scout_vacancy_id` | `scout_vacancy_id` |
| `title` | `title` |
| `employer_name` | `employer_name` |
| `logo_url` | `company_logo_url` |
| `location_text` | `location_text` |
| `description` | `description` |
| `application_url` | `application_url` |
| `published_at` | `published_at` |
| `source_updated_at` | `source_updated_at` |

`first_seen_at` is Scout discovery metadata and is deliberately not substituted for an employer publication or update date.

Scout may return a null location, logo, publication date or source update date. The Thungatha catalogue and presentation must preserve those nulls. The description is stored unchanged because Scout sanitises it before export; the applicant UI renders the permitted HTML structure.
\n\nThe import endpoint accepts the published Scout export page JSON and requires `Authorization: Bearer <SCOUT_SYNC_SECRET>`. It is an internal server-to-server boundary; never call it from the browser.\n