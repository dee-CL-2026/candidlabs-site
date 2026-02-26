# Structure

> Required documentation files, metadata schema, naming conventions, and folder layout for any implementation.

## Required Files

Every implementation pack must contain at minimum:

| File | Format | Purpose |
|------|--------|---------|
| `README.md` | Markdown | Pack index, update procedures, rules |
| `ARCHITECTURE.md` | Markdown | System diagram, component summary, key conventions |
| `MODULES.yml` | YAML | Module registry with status, auth, tables, routes |
| `DATA_DICTIONARY.yml` | YAML | Table definitions with columns, purpose, retention |
| `INTEGRATIONS.yml` | YAML | External system connections with auth, retry, logging |
| `ROADMAP.yml` | YAML | Ordered milestones with dependencies |
| `RUNBOOKS/` | Directory | At least one operational runbook (deploy procedure) |
| `DECISIONS/` | Directory | At least one ADR (initial architecture decision) |

Implementations may add additional files but must not omit any required file.

## Required YAML Metadata Schema

Every `.yml` file in an implementation pack **must** begin with the following metadata header. This is the canonical schema — all fields are mandatory.

```yaml
# Required metadata header — all fields mandatory
version: "<IMPLEMENTATION_VERSION>"    # Semver string, e.g. "1.0"
generated: "<DATE>"                    # ISO 8601 date, e.g. "2026-02-26"
platform_name: "<PLATFORM_NAME>"       # Human-readable platform name
platform_version: "<VERSION>"          # Current platform release version
primary_domain: "<DOMAIN>"             # Business domain, e.g. "logistics", "fintech"
primary_data_store: "<DATABASE_TYPE>"   # e.g. "PostgreSQL", "SQLite", "DynamoDB"
primary_auth_method: "<AUTH_METHOD>"    # e.g. "OAuth 2.0", "JWT", "API Key"
primary_accounting_system: "<SYSTEM>"  # e.g. "External ERP", "Built-in", "N/A"
```

### Validation Rules

- **All 8 fields are required.** A missing field is a validation failure.
- **No empty values.** Use `"N/A"` if a field does not apply. An empty string (`""`) is a validation failure.
- **Values must be quoted strings.** Unquoted values risk YAML type coercion.
- **`version` must be a valid semver string** (MAJOR.MINOR or MAJOR.MINOR.PATCH).
- **`generated` must be a valid ISO 8601 date.**

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| YAML files | UPPER_SNAKE_CASE.yml | `DATA_DICTIONARY.yml` |
| Markdown files | UPPER_SNAKE_CASE.md | `QUALITY_GATES.md` |
| Runbooks | `RUNBOOK_<NAME>.md` | `RUNBOOK_DEPLOY.md` |
| ADRs | `ADR-NNNN-<slug>.md` | `ADR-0001-initial-architecture.md` |
| Folders | UPPER_SNAKE_CASE or lowercase | `RUNBOOKS/`, `DECISIONS/` |

## Folder Structure

```
<implementation-root>/
├── README.md
├── ARCHITECTURE.md
├── MODULES.yml
├── DATA_DICTIONARY.yml
├── INTEGRATIONS.yml
├── ROADMAP.yml
├── RUNBOOKS/
│   └── RUNBOOK_DEPLOY.md
└── DECISIONS/
    └── ADR-0001-*.md
```

Implementations may add subdirectories (e.g., `RUNBOOKS/RUNBOOK_BACKUP.md`) but must not restructure the top-level layout.

## Standard vs Implementation Separation

- **Standard files** (`_standard/`) define governance. They are versioned independently and must not contain platform-specific content.
- **Implementation files** contain platform-specific content. They are governed by the Standard but versioned independently.
- Standard files are never modified by implementation work. If a governance change is needed, it goes through the Structural Change Protocol defined in `GOVERNANCE.md`.
