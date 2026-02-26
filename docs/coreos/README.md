# CoreOS Documentation Standard Pack v1.0

> Canonical, machine-readable documentation for Candid CoreOS.

## What this pack is

A set of structured files describing the Candid CoreOS platform — its architecture, modules, data, integrations, roadmap, quality gates, runbooks, and architectural decisions.

Every file in this pack is **append-friendly**. Data grows by adding new entries, never by rewriting existing ones.

## File index

| File | Purpose | Format |
|------|---------|--------|
| `ARCHITECTURE.md` | System diagram + component summary | Markdown + ASCII |
| `MODULES.yml` | Module registry (name, path, status, tables, routes) | YAML |
| `DATA_DICTIONARY.yml` | D1 table definitions (columns, purpose, owner) | YAML |
| `INTEGRATIONS.yml` | External system connections (auth, scopes, retry) | YAML |
| `ROADMAP.yml` | Ordered milestones with dependencies | YAML |
| `QUALITY_GATES.md` | Pre-deploy checklist | Markdown |
| `RUNBOOKS/RUNBOOK_DEPLOY.md` | Deploy process + rollback | Markdown |
| `RUNBOOKS/RUNBOOK_XERO_CONNECT.md` | Xero OAuth setup end-to-end | Markdown |
| `DECISIONS/ADR-0001-coreos-doc-pack.md` | Why this pack exists | ADR format |

## How to update

1. **Adding a module** — add entry to `MODULES.yml` and `DATA_DICTIONARY.yml`, update `../COREOS_MANIFEST.md` data spine.
2. **Adding a table** — add entry to `DATA_DICTIONARY.yml`, update `../COREOS_MANIFEST.md` data spine.
3. **Adding an integration** — add entry to `INTEGRATIONS.yml`, update `../COREOS_MANIFEST.md` integration registry.
4. **Recording a decision** — create `DECISIONS/ADR-NNNN-slug.md`.
5. **Updating roadmap** — append to `ROADMAP.yml` milestones. Never delete completed milestones; mark them `status: done`.

## Rules

- **No deletions without ADR.** Removing any planned scope, table, module, or integration from this pack requires a new ADR in `DECISIONS/` explaining why.
- **Manifest is upstream.** `../COREOS_MANIFEST.md` is the single source of truth. This pack elaborates on it but must not contradict it.
- **YAML must be valid.** All `.yml` files must parse without errors. Agents should validate before committing.

## Drift Prevention

If a table, module, or integration is changed in code but not reflected in this pack,
the change is considered incomplete. Documentation is part of the system.
