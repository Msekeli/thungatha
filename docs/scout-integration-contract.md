# Scout integration contract

Thungatha receives approved vacancies from Thungatha Scout through:

`POST /api/internal/scout/vacancies`

The endpoint accepts a JSON array of vacancy records. Each record must contain exactly these nine fields:

| Field | Required | Rule |
|---|---|---|
| `scoutVacancyId` | Yes | Valid UUID; stable Scout vacancy identity |
| `jobTitle` | Yes | Meaningful job title |
| `companyName` | Yes | Employer name |
| `companyLogoUrl` | No | HTTP(S) URL or `null` |
| `location` | Yes | Verified job location |
| `description` | Yes | Meaningful, sanitised HTML from Scout |
| `applicationUrl` | Yes | Direct HTTP(S) application URL |
| `publishedAt` | No | Original employer publication timestamp or `null` |
| `updatedAt` | No | Employer-reported update timestamp or `null` |

The optional fields must still be present in the record; use `null` when the source does not provide a value. Do not add salary, currency, work mode, employment type, source URL, provider metadata, collection dates or any other fields.

## Example request

```http
POST /api/internal/scout/vacancies
Authorization: Bearer <SCOUT_INGESTION_SECRET>
Content-Type: application/json
```

```json
[
  {
    "scoutVacancyId": "123e4567-e89b-42d3-a456-426614174000",
    "jobTitle": "Software Engineer",
    "companyName": "Example Technologies",
    "companyLogoUrl": null,
    "location": "Cape Town, South Africa",
    "description": "<h2>About the role</h2><p>Build and maintain software applications with the engineering team.</p><ul><li>Use React and TypeScript.</li></ul>",
    "applicationUrl": "https://careers.example.com/jobs/123",
    "publishedAt": null,
    "updatedAt": null
  }
]
```

## Responsibility boundary

- Scout retrieves the employer's original description and sanitises its HTML with its allowlist before sending the vacancy.
- Thungatha validates the receiving contract and authenticates the Scout request. It does not run a second HTML sanitiser.
- Thungatha persists the description string unchanged and renders the sanitised HTML structure for applicants.
- The receiver uses the stable Scout vacancy UUID for idempotent upserts.
- A batch may contain between 1 and 100 vacancies. A duplicate Scout ID inside one batch is rejected.
- The endpoint requires the same `SCOUT_INGESTION_SECRET` configured in both systems. The Supabase service key remains server-only.

The database retains Thungatha's own job ID and user-specific saved/dismissed/application activity. Those internal fields are not part of the Scout payload.

Archive, deletion and company-deletion reconciliation are intentionally outside this receiving-contract implementation.
