# Database migrations

Store ordered, timestamped SQL migration files in this directory. Migration files are the source of truth for schema changes; do not make undocumented manual schema edits in the Supabase dashboard.

Create a migration with:

```bash
npx supabase migration new descriptive_change
```

Review each generated SQL file before applying it.

## Apply to the linked cloud project

This project uses its cloud Supabase database for this workflow; do not start local Supabase or Docker just to test a migration.

```bash
npx supabase login
npx supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
npx supabase migration list --linked
npx supabase db push --dry-run
```

Confirm the linked project is correct and review every pending migration shown by the dry run. If unrelated migrations are pending, inspect them before applying. Apply only after reviewing the preview:

```bash
npx supabase db push
```

Do not use a service-role key for normal user-scoped application requests. Keep credentials out of source control. If the preview or push fails, stop and resolve the migration-history issue instead of making manual schema changes.
