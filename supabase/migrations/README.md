# Database migrations

Store ordered, timestamped SQL migration files in this directory.

Create a migration with:

```bash
npx supabase migration new descriptive_change
```

Review each generated SQL file before applying it. Once the local Supabase database is running, use `npx supabase migration up` to apply pending migrations and `npx supabase migration list` to inspect migration history.

Do not add placeholder migrations. The first application schema migration belongs here once its domain and ownership requirements have been agreed.
