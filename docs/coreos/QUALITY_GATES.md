# CoreOS Quality Gates

> Pre-deploy checklist. Every change must pass applicable gates before merging to `main`.

## Schema Migration Gates

- [ ] New migration file is sequentially numbered (e.g., `007_*.sql` follows `006_*.sql`)
- [ ] Migration file uses `CREATE TABLE IF NOT EXISTS` or `ALTER TABLE`
- [ ] No existing migration files were modified
- [ ] All new tables have: TEXT PRIMARY KEY, `meta TEXT DEFAULT '{}'`, `created_at TEXT`, `updated_at TEXT`
- [ ] New tables added to `COLLECTIONS` in `api/src/index.js`
- [ ] New tables added to `docs/COREOS_MANIFEST.md` data spine
- [ ] New tables added to `docs/coreos/DATA_DICTIONARY.yml`

## Manifest Sync Gates

- [ ] `docs/COREOS_MANIFEST.md` data spine matches actual D1 tables
- [ ] `docs/coreos/MODULES.yml` reflects any new or changed modules
- [ ] `docs/coreos/INTEGRATIONS.yml` reflects any new integrations
- [ ] Release log row added to `docs/COREOS_MANIFEST.md`

## Adapter Contract Gates (for GAS adapters)

- [ ] Adapter accepts JSON POST with documented payload shape
- [ ] Adapter validates X-Api-Key header before processing
- [ ] Adapter returns JSON response matching documented schema
- [ ] Worker logs adapter call to `jobs` table (when available)
- [ ] Worker handles adapter 5xx with single retry + 5s backoff

## Minimal QA

- [ ] Page loads without console errors
- [ ] Nav dropdowns (Sales, Workspace, Tools) open and close correctly
- [ ] Auth-gated elements hidden for lower roles (test with team role)
- [ ] Mobile menu displays grouped items with section labels
- [ ] API health check returns 200: `GET /api/health`
- [ ] CRUD smoke test: create, read, update, delete one record in affected collection
- [ ] Preview deploy tested before merging to `main`

## Scope Removal Gate

- [ ] Removing any planned scope requires an ADR in `docs/coreos/DECISIONS/`
- [ ] ADR explains context, decision, and consequences
