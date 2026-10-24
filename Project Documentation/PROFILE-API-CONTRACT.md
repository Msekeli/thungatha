# Profile API Contract

**Checkpoint:** M2-C01
**Status:** Implemented in source; local/database verification pending
**Endpoint:** `/api/profile`

## Ownership and security

- `GET` and `PATCH` require an authenticated Clerk identity resolved on the server.
- The server derives `user_id`; clients must not send or select an owner ID.
- Supabase requests use the authenticated session token. PostgreSQL RLS compares the JWT subject with `profiles.user_id`.
- Profile snapshots are written by a database trigger. Users may read only their own snapshots; the trigger function is not exposed as a client operation.
- `masterCv` is metadata only; private file storage is a later checkpoint.

## GET /api/profile

Success: `200`

~~~json
{
  "profile": {
    "displayName": null,
    "personalDetails": {
      "fullName": null,
      "email": null,
      "phone": null,
      "location": null,
      "country": null,
      "residentialSuburb": null,
      "residentialCity": null,
      "residentialProvince": null,
      "residentialPostalCode": null,
      "linkedinUrl": null,
      "portfolioUrl": null
    },
    "summary": null,
    "workExperience": [],
    "education": [],
    "skills": [],
    "certifications": [],
    "projects": [],
    "languages": [],
    "personalAttributes": [],
    "masterCv": null,
    "confirmedAt": null,
    "profileVersion": 1
  }
}
~~~

The response may also include `createdAt` and `updatedAt` when a row exists. An authenticated user without a profile receives an empty DTO; a row is created on the first successful save.

## PATCH /api/profile

The body is a strict, partial update object. Unknown properties—including `userId` and `profileVersion`—are rejected. Omitted properties are left unchanged; provided array properties replace that section's array. The server-owned profile version is not accepted from the client.

Supported properties:
- `displayName`
- `personalDetails`: `fullName`, `email`, `phone`, legacy `location`, `country`, optional `residentialSuburb`, `residentialCity`, `residentialProvince`, `residentialPostalCode`, `linkedinUrl`, `portfolioUrl`
- `summary`
- `workExperience`: entries with `id`, `jobTitle`, `employer`, optional `location`, `startDate`, optional `endDate`, `isCurrent`, optional `description`
- `education`: entries with `id`, `qualification`, `institution`, optional `fieldOfStudy`, `startDate`, `endDate`
- `skills`: strings
- `certifications`: entries with `id`, `name`, optional `issuer`, `issueDate`, `expiryDate`
- `projects`: entries with `id`, `name`, optional `description`, `role`, `url`
- `masterCv`: metadata object or `null`
- `confirmedAt`: timestamp or `null`

Each repeatable section is limited to 100 entries. Missing information remains null/omitted; the API does not infer values.

## Error responses

- `400`: malformed JSON or schema validation failure.
- `401`: authentication required.
- `503`: authentication or Supabase configuration unavailable.
- `500`: unexpected failure; response contains a safe message and request ID.

## Persistence and versioning

Migrations `20261024000400_add_profile_country_and_version_history.sql` and `20261024000500_add_profile_residential_location_and_languages.sql` add country, server-maintained `profile_version`, version snapshots, residential-area fields (no street address/house number), languages and personal attributes. Work achievements are stored within each JSON work-experience entry. Snapshots retain structured profile data and CV metadata, not file bytes.

Apply migrations through the project's normal Supabase migration workflow before exercising the API. This checkpoint has not been tested against a live database in this session.
