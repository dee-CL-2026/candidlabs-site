# Governance

> Rules governing how the Platform Documentation Standard and its implementations evolve.

## Version Bump Rules

The Standard follows semantic versioning. Changes to the Standard require a version bump in `CHANGELOG.md`.

| Change Type | Version Impact | Examples |
|-------------|---------------|----------|
| **MAJOR** | Breaking structural change | Adding/removing required files, changing metadata schema fields, restructuring folder layout |
| **MINOR** | Additive governance change | New required section in an existing file, new governance rule, new quality gate |
| **PATCH** | Non-structural clarification | Wording improvements, typo fixes, additional examples |

## ADR Requirements

An Architectural Decision Record (ADR) is required when:

- Removing any planned scope (module, table, integration, milestone)
- Changing authentication or authorisation architecture
- Introducing a new external integration
- Altering the data layer (new database, new sync pattern)
- Deviating from any rule in this Standard

ADRs must follow the template in `ADR_TEMPLATE.md`. ADRs are append-only — they are never edited after acceptance. Superseded ADRs are marked with status `Superseded by ADR-NNNN`.

## Scope Removal Discipline

No planned module, table, integration, or milestone may be removed from an implementation's documentation without an ADR that explains:

1. What is being removed
2. Why it is no longer needed
3. What (if anything) replaces it
4. Impact on dependent milestones or modules

## Documentation Drift Prevention

If a table, module, or integration is changed in code but not reflected in the documentation pack, the change is considered **incomplete**. Documentation is part of the system.

Specifically:
- Schema changes require a corresponding update to `DATA_DICTIONARY.yml` and the platform manifest (if one exists).
- New modules require entries in `MODULES.yml`.
- New integrations require entries in `INTEGRATIONS.yml`.
- Milestone completions require status updates in `ROADMAP.yml`.

## Structural Change Protocol

Changes to the Standard's required file list, metadata schema, or folder structure:

1. Draft an ADR explaining the change.
2. Update the Standard files.
3. Bump the Standard version (MAJOR for structural, MINOR for additive).
4. Update `CHANGELOG.md`.
5. All active implementations must update to comply within one release cycle.

## Standard Authority

- Standard documents (`docs/_standard/`) override Implementation documents in case of conflict.
- Implementation packs must not weaken, relax, or contradict Standard rules.
- Implementations may **extend** the Standard (add fields, add gates, add stricter rules) but never reduce its requirements.
