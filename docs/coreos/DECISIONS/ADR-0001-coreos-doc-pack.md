# ADR-0001: Establish CoreOS Documentation Standard Pack

## Status

Accepted — 2026-02-26

## Context

The Candid CoreOS platform has grown from a simple CRM to a multi-module platform with 12 D1 tables, planned Xero integration, and a 6-wave GAS migration roadmap. Documentation existed as a single manifest file (`COREOS_MANIFEST.md`) and detailed migration analysis docs in `docs/migrations/`.

Problems:
- The manifest was becoming a monolith — architecture, modules, data, integrations, roadmap all in one file.
- No structured format for module and table metadata (everything embedded in YAML blocks within markdown).
- No runbooks for operational procedures (deploy, Xero setup).
- No decision log for architectural choices.
- No quality gates — no checklist to verify before deploying.
- Difficult for agents and new contributors to know where to find or add information.

## Decision

Create a **CoreOS Documentation Standard Pack** as a set of focused, machine-readable files in `docs/coreos/`:

- `README.md` — index and update rules
- `ARCHITECTURE.md` — system diagram and stack overview
- `MODULES.yml` — module registry
- `DATA_DICTIONARY.yml` — table definitions
- `INTEGRATIONS.yml` — external system connections
- `ROADMAP.yml` — ordered milestones
- `QUALITY_GATES.md` — pre-deploy checklist
- `RUNBOOKS/` — operational procedures
- `DECISIONS/` — architectural decision records (this file)

Rules:
1. `COREOS_MANIFEST.md` remains the upstream source of truth.
2. The doc pack elaborates on the manifest but must not contradict it.
3. All files are append-friendly. No deletions without a new ADR.
4. YAML files must be valid and parseable.

## Consequences

- **Positive:** Clear structure for adding new modules, tables, integrations. Agents can read specific files instead of parsing the entire manifest. Runbooks reduce operational risk. ADR log creates institutional memory.
- **Positive:** Standardisable across other builds — the pack structure is project-agnostic.
- **Negative:** More files to maintain. Risk of drift between manifest and pack files.
- **Mitigation:** Quality gates include a "manifest sync" check. Pack README documents update procedures.
