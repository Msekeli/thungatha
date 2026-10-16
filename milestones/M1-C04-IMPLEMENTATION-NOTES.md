# M1-C04 implementation notes

Added to dev: a service-role-only ingestion run ledger, bounded provider ingestion, normalized record validation, idempotent source identity writes, conservative secondary deduplication, and per-provider outcomes.

The database update preserves known catalogue fields when providers omit values. Existing saved/dismissed state remains in its separate table and is not touched by ingestion. Failed provider requests do not mark any listing unavailable; a listing is refreshed/reactivated only when it is observed again.

Limitations: one page of up to 100 records per provider per invocation; no scheduler or stale-listing reconciliation is added. The migration must be applied to Supabase before running the service. Tests and SQL have not been executed by the remote edit and must be verified locally after pulling dev.
