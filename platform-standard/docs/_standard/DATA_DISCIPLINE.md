# Data Discipline

> Principles governing database design, schema versioning, migration control, integration contracts, and data retention.

## Database-First Design

The database schema is the foundation of the platform. All other layers (API, UI, integrations) derive from it.

- Every persistent entity must have a corresponding table in the primary data store.
- Tables must be documented in `DATA_DICTIONARY.yml` before or at the time of creation.
- No table may exist in production without a data dictionary entry.
- Application code must not define data structures that bypass the schema.

## Schema Versioning

Schema changes are controlled via numbered, append-only migration files.

- Migration files are sequentially numbered (e.g., `001_initial.sql`, `002_add_contacts.sql`).
- Migration files are **immutable** after deployment. Corrections go in a new numbered migration.
- Every migration file must use safe DDL (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE`).
- The migration history is the authoritative record of schema evolution.

## Migration Wave Discipline

Large-scale schema changes are organised into ordered waves with explicit dependencies.

- Each wave has a defined scope (tables, modules, integrations).
- Wave dependencies are enforced — a wave cannot begin until its dependencies are complete.
- Waves are documented in `ROADMAP.yml` as milestones with dependency lists.
- Skipping a wave or reordering dependencies requires an ADR.

## Raw vs Normalised Data Separation

External data ingested from integrations must pass through two distinct layers:

### Raw Layer

- Stores data exactly as received from the external system.
- No transformation, no filtering, no business logic.
- Tables in this layer are prefixed or namespaced to indicate their source (e.g., `ext_invoices`, `sync_contacts`).
- Purpose: auditability, replay capability, debugging sync issues.

### Normalised / Reporting Layer

- Transforms raw data into human-readable, business-useful structures.
- Applies: name normalisation, status filtering, currency handling, deduplication, mapping.
- This layer serves the UI and reporting consumers.
- Transformations are documented and versioned.

**Rule:** Raw external data must never be surfaced directly to end users. A normalisation step is always required, even if initially trivial.

## Integration Contract Requirements

Every external integration must define:

1. **Auth method** — How the platform authenticates to the external system.
2. **Data direction** — Inbound (pull), outbound (push), or bidirectional.
3. **Sync frequency** — Real-time (webhook), scheduled (cron), on-demand (manual trigger).
4. **Retry policy** — How failures are handled (retry count, backoff strategy, dead-letter).
5. **Payload schema** — Request and response shapes (or reference to external API docs).
6. **Logging** — Where sync operations are recorded (audit table, log file, external service).

These are documented in `INTEGRATIONS.yml`.

## Sync Reliability Rules

- Every sync operation must be logged with: start time, end time, records processed, status, error (if any).
- Failed syncs must not corrupt existing data. Use atomic transactions or upsert patterns.
- Token/credential refresh failures must not silently degrade — they must surface as errors in the sync log.
- Rate limits imposed by external systems must be respected. Document known limits in `INTEGRATIONS.yml`.

## Retention Policy Requirement

Every table in `DATA_DICTIONARY.yml` must have a defined retention policy:

| Policy | Meaning |
|--------|---------|
| `indefinite` | Data is kept permanently. No automated deletion. |
| `<N> days` | Data older than N days may be pruned. |
| `append-only` | Rows are never updated or deleted. Historical audit trail. |
| `overwrite` | Only the most recent record is kept (e.g., token storage). |

Tables without a retention policy are non-compliant.
