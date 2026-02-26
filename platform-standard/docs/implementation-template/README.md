# Platform Documentation Pack

> Canonical, machine-readable documentation for this platform.

## What this pack is

A set of structured files describing the platform — its architecture, modules, data, integrations, roadmap, quality gates, runbooks, and architectural decisions.

Every file in this pack is **append-friendly**. Data grows by adding new entries, never by rewriting existing ones.

This pack is governed by the Platform Documentation Standard. Standard rules override implementation-specific rules in case of conflict.

## File index

| File | Purpose | Format |
|------|---------|--------|
| `ARCHITECTURE.md` | System diagram and component summary | Markdown + ASCII |
| `MODULES.yml` | Module registry (name, path, status, type, tables, routes) | YAML |
| `DATA_DICTIONARY.yml` | Table definitions (columns, purpose, retention) | YAML |
| `INTEGRATIONS.yml` | External system connections (auth, scopes, retry) | YAML |
| `ROADMAP.yml` | Ordered milestones with dependencies | YAML |
| `RUNBOOKS/RUNBOOK_DEPLOY.md` | Deploy procedure | Markdown |
| `DECISIONS/ADR-0001-*.md` | Architectural decision records | ADR format |

## How to update

1. **Adding a module** — Add entry to `MODULES.yml`. If the module has tables, add them to `DATA_DICTIONARY.yml`.
2. **Adding a table** — Add entry to `DATA_DICTIONARY.yml`. Include retention policy.
3. **Adding an integration** — Add entry to `INTEGRATIONS.yml`. Document auth, retry, and logging.
4. **Recording a decision** — Create `DECISIONS/ADR-NNNN-slug.md` using the ADR template.
5. **Updating roadmap** — Append to `ROADMAP.yml` milestones. Never delete completed milestones; mark them `status: done`.
6. **Adding a runbook** — Create `RUNBOOKS/RUNBOOK_<NAME>.md`.

## Rules

- **No deletions without ADR.** Removing any planned scope, table, module, or integration requires a new ADR in `DECISIONS/` explaining why.
- **YAML must be valid.** All `.yml` files must parse without errors. Missing metadata header fields are validation failures.
- **Append-friendly.** Data grows by adding entries. Existing entries are updated in place, never removed.

## Drift Prevention

If a table, module, or integration is changed in code but not reflected in this pack, the change is considered incomplete. Documentation is part of the system.
