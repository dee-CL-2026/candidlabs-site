# Platform Documentation Standard v1.0

> A reusable governance and documentation framework for structured web platform projects.

## What This Is

The Platform Documentation Standard defines the **structure, governance rules, data discipline, and quality gates** that any database-backed web platform should follow. It is not a specific platform implementation — it is the framework that implementations are built on.

## Standard vs Implementation

| Layer | Location | Purpose | Mutability |
|-------|----------|---------|------------|
| **Standard** | `docs/_standard/` | Governance rules, structure requirements, quality gates | Immutable per version. Changes require a version bump. |
| **Implementation** | Forked from `docs/implementation-template/` | Platform-specific architecture, modules, data, integrations, roadmap | Mutable. Append-friendly. Governed by the Standard. |

The Standard layer defines **what documentation must exist and how it must behave**. The Implementation layer defines **what a specific platform actually does**.

An Implementation may extend the Standard (add fields, add gates, add rules) but must never weaken or contradict it.

## How to Fork for a New Platform

1. Copy `docs/implementation-template/` into your project as `docs/<your-platform>/`.
2. Replace all `<PLACEHOLDER>` tokens in YAML headers with real values.
3. Fill in architecture, modules, data dictionary, integrations, and roadmap.
4. Copy `docs/_standard/` alongside it (or reference it as a submodule).
5. Create your first ADR in `DECISIONS/ADR-0001-initial-architecture.md`.
6. Begin development. Documentation is part of the system — not an afterthought.

## Versioning Philosophy

This standard tracks three independent version numbers:

### 1. Standard Version (this repo)

Tracks changes to the governance framework itself. Follows semantic versioning:

- **MAJOR** — Structural changes to required files or metadata schema.
- **MINOR** — New required sections, governance rules, or quality gates.
- **PATCH** — Clarifications, wording improvements, typo fixes.

Current: **v1.0.0**

### 2. Implementation Version (per platform)

Tracks changes to a specific platform's documentation pack. Each implementation maintains its own `version` field in YAML headers. Implementation versions are independent of the Standard version.

### 3. Runtime Application Version

Tracks the deployed software itself (releases, builds, tags). Managed by the platform team via their own versioning scheme (semver, date-based, etc.). Not governed by this standard.

## File Index

```
platform-standard/
├── README.md                          # This file
├── CHANGELOG.md                       # Standard version history
└── docs/
    ├── _standard/                     # Immutable governance layer
    │   ├── GOVERNANCE.md              # Version rules, ADR policy, drift prevention
    │   ├── STRUCTURE.md               # Required files, YAML schema, naming
    │   ├── QUALITY_GATES.md           # Pre-deploy checklist (generic)
    │   ├── ADR_TEMPLATE.md            # Decision record template
    │   └── DATA_DISCIPLINE.md         # Database-first principles, migration control
    └── implementation-template/       # Fork this for new platforms
        ├── README.md                  # Pack index and update procedures
        ├── ARCHITECTURE.md            # System diagram and stack overview
        ├── MODULES.yml                # Module registry
        ├── DATA_DICTIONARY.yml        # Table definitions
        ├── INTEGRATIONS.yml           # External system connections
        ├── ROADMAP.yml                # Ordered milestones
        ├── RUNBOOKS/
        │   └── RUNBOOK_DEPLOY.md      # Deploy procedure skeleton
        └── DECISIONS/
            └── ADR-0001-initial-architecture.md
```
