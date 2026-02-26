# Quality Gates

> Generic pre-deploy checklist. Every change must pass applicable gates before merging to the primary branch.

## Schema Gates

- [ ] New migration file is sequentially numbered
- [ ] Migration file uses safe DDL (`CREATE TABLE IF NOT EXISTS`, `ALTER TABLE`)
- [ ] No existing migration files were modified
- [ ] All new tables follow platform conventions (primary key type, timestamps, metadata column)
- [ ] New tables registered in `DATA_DICTIONARY.yml`
- [ ] New tables registered in platform manifest (if one exists)

## Integration Gates

- [ ] New integration documented in `INTEGRATIONS.yml`
- [ ] Auth method, scopes, retry policy, and logging strategy defined
- [ ] Secrets stored in platform secret manager (not in code, not in docs)
- [ ] Integration contract (request/response schema) documented or referenced

## Auth Gates

- [ ] No auth changes without an ADR
- [ ] Role/permission changes reflected in `MODULES.yml` auth fields
- [ ] Auth token lifecycle documented (expiry, refresh, revocation)

## Data Retention Gates

- [ ] Every new table has a defined retention policy in `DATA_DICTIONARY.yml`
- [ ] No data deletion without a documented retention policy
- [ ] Audit-sensitive tables marked as append-only where applicable

## Documentation Gates

- [ ] `MODULES.yml` reflects any new or changed modules
- [ ] `INTEGRATIONS.yml` reflects any new or changed integrations
- [ ] `DATA_DICTIONARY.yml` reflects any new or changed tables
- [ ] `ROADMAP.yml` milestone status updated (if applicable)
- [ ] Platform manifest updated (if one exists)

## Version Gates

- [ ] YAML metadata `version` field bumped if structure changed
- [ ] Standard version bump recorded in `CHANGELOG.md` (if Standard files changed)
- [ ] ADR created for any scope removal or architectural change

## Scope Removal Gate

- [ ] Removing any planned scope requires an ADR in `DECISIONS/`
- [ ] ADR explains context, decision, consequences, and version impact
