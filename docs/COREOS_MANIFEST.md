# Candid CoreOS — Platform Manifest

> **Canonical, machine-readable platform manifest.**
> Living document. Every agent must read before doing work. Every feature must update it.
>
> Last updated: 2026-02-26
> Sources: GAS_FUNCTION_REGISTRY_v1.md, PLATFORM_MIGRATION_MAP_v2.md, XERO_INTEGRATION_PLAN_v1.md

---

## Platform Identity

```yaml
name: Candid CoreOS
codename: candidlabs
domain: candidlabs.pages.dev
hosting: Cloudflare Pages (static) + Cloudflare Workers (API)
database: Cloudflare D1
auth: Cloudflare Access + hardcoded roster (OTP login)
repo: dee-CL-2026/candidlabs-site
primary_currency: IDR
timezone: Asia/Jakarta (WIB, UTC+7)
```

---

## Core Principles

```yaml
principles:
  - id: P1
    name: Data spine owns truth
    rule: Every business entity has one canonical D1 table. No duplicates across modules.
  - id: P2
    name: GAS adapters are thin
    rule: Google Apps Script only for Google-native ops (Docs, Slides, Gmail, Drive). All business logic lives in Workers.
  - id: P3
    name: No SDK dependencies
    rule: External APIs (Xero, Google) use raw fetch(). No axios, no xero-node, no googleapis.
  - id: P4
    name: Static-first frontend
    rule: HTML pages served by Cloudflare Pages. No SPA framework. JS loaded per-module.
  - id: P5
    name: Convention over config
    rule: All D1 tables use TEXT PRIMARY KEY (UUID), TEXT DEFAULT '{}' meta column, TEXT created_at/updated_at.
  - id: P6
    name: Append-friendly migrations
    rule: D1 schema changes are numbered sequential .sql files. Never alter existing migrations.
```

---

## Data Spine

Authoritative entities and their owning modules.

```yaml
data_spine:
  # --- Live (existing) ---
  - entity: Company
    table: companies
    module: CRM
    status: live
    migration: schema.sql + 002
  - entity: Contact
    table: contacts
    module: CRM
    status: live
    migration: schema.sql + 003
  - entity: Deal
    table: deals
    module: CRM
    status: live
    migration: schema.sql + 002
  - entity: Comment
    table: comments
    module: Shared
    status: live
    migration: schema.sql
  - entity: Project
    table: projects
    module: Projects
    status: live
    migration: schema.sql
  - entity: Task
    table: tasks
    module: Projects
    status: live
    migration: schema.sql
  - entity: R&D Project
    table: rnd_projects
    module: R&D
    status: live
    migration: "004 + 005 + 006"
  - entity: R&D Document
    table: rnd_documents
    module: R&D
    status: live
    migration: "004"
  - entity: R&D Trial Entry
    table: rnd_trial_entries
    module: R&D
    status: live
    migration: "004"
  - entity: R&D Stage History
    table: rnd_stage_history
    module: R&D
    status: live
    migration: "005"
  - entity: R&D Approval
    table: rnd_approvals
    module: R&D
    status: live
    migration: "005"
  - entity: SKU
    table: skus
    module: R&D
    status: live
    migration: "004"

  # --- Planned (Xero sync layer) ---
  - entity: Xero Token
    table: xero_tokens
    module: Xero
    status: planned
    migration: "007"
    wave: Phase A
  - entity: Xero Invoice
    table: xero_invoices
    module: Xero
    status: planned
    migration: "007"
    wave: Phase A
  - entity: Xero Line Item
    table: xero_line_items
    module: Xero
    status: planned
    migration: "007"
    wave: Phase A
  - entity: Xero Contact
    table: xero_contacts
    module: Xero
    status: planned
    migration: "007"
    wave: Phase A
  - entity: Xero Item
    table: xero_items
    module: Xero
    status: planned
    migration: "007"
    wave: Phase A
  - entity: Xero Sync Log
    table: xero_sync_log
    module: Xero
    status: planned
    migration: "007"
    wave: Phase A

  # --- Planned (Wave 1: KAA) ---
  - entity: Agreement
    table: agreements
    module: Agreements
    status: planned
    migration: "008"
    wave: 1
  - entity: Job
    table: jobs
    module: Infrastructure
    status: planned
    migration: "009"
    wave: 1
  - entity: Job Log
    table: job_logs
    module: Infrastructure
    status: planned
    migration: "009"
    wave: 1

  # --- Planned (Wave 2: Sales) ---
  - entity: Revenue Transaction
    table: revenue_transactions
    module: Sales
    status: planned
    migration: "010"
    wave: 2
  - entity: Account Mapping
    table: account_mapping
    module: Sales
    status: planned
    migration: "010"
    wave: 2
  - entity: Account Status
    table: account_status
    module: Sales
    status: planned
    migration: "010"
    wave: 2
  - entity: Deck Metrics
    table: deck_metrics
    module: Sales
    status: planned
    migration: "010"
    wave: 2

  # --- Planned (Wave 3: Production) ---
  - entity: Production Run
    table: production_runs
    module: Production
    status: planned
    migration: "011"
    wave: 3
  - entity: BOM Component
    table: bom_components
    module: Production
    status: planned
    migration: "011"
    wave: 3
  - entity: Component Cost
    table: component_costs
    module: Production
    status: planned
    migration: "011"
    wave: 3
  - entity: SKU Costing
    table: sku_costing
    module: Production
    status: planned
    migration: "011"
    wave: 3
  - entity: Batch COGS
    table: batch_cogs
    module: Production
    status: planned
    migration: "011"
    wave: 3
  - entity: Payable
    table: payables
    module: Production
    status: planned
    migration: "011"
    wave: 3
  - entity: ARAP Snapshot
    table: arap_snapshots
    module: Production
    status: planned
    migration: "011"
    wave: 3

  # --- Planned (Wave 4: Loans) ---
  - entity: Lender
    table: lenders
    module: Loans
    status: planned
    migration: "012"
    wave: 4
  - entity: Loan Transaction
    table: loan_transactions
    module: Loans
    status: planned
    migration: "012"
    wave: 4
  - entity: Loan Ledger Entry
    table: loan_ledger
    module: Loans
    status: planned
    migration: "012"
    wave: 4

  # --- Planned (Wave 5: Sales Tool) ---
  - entity: Pricing Tier
    table: pricing
    module: Sales Tool
    status: planned
    migration: "013"
    wave: 5
```

---

## Active Modules

```yaml
modules:
  - name: CRM
    path: /crm/
    status: live
    d1_tables: [companies, contacts, deals, comments]
    api_collections: 4
    auth_role: null  # visible to all authenticated users
    nav_group: Sales
  - name: Prospecting
    path: /prospecting/
    status: wip
    d1_tables: []
    api_collections: 0
    auth_role: null
    nav_group: Sales
    notes: Client-side filtering on static seed data
  - name: Projects
    path: /projects/
    status: live
    d1_tables: [projects, tasks]
    api_collections: 2
    auth_role: partner
    nav_group: Workspace
  - name: R&D
    path: /rnd/
    status: live
    d1_tables: [rnd_projects, rnd_documents, rnd_trial_entries, rnd_stage_history, rnd_approvals, skus]
    api_collections: 6
    auth_role: partner
    nav_group: Workspace
  - name: Reports
    path: /reports.html
    status: live
    d1_tables: []
    api_collections: 0
    auth_role: null
    nav_group: null  # top-level
  - name: Budget
    path: /budget.html
    status: live
    d1_tables: []
    api_collections: 0
    auth_role: null
    nav_group: null
    notes: Client-only (no API, no D1)
  - name: Dashboard
    path: /dashboard.html
    status: live
    d1_tables: []
    api_collections: 0
    auth_role: null
    nav_group: null
    notes: Management overview with embedded analytics
  - name: Admin
    path: /admin/users.html
    status: live
    d1_tables: []
    api_collections: 0
    auth_role: admin
    nav_group: null
  - name: Tools
    path: /tools.html
    status: live
    d1_tables: []
    api_collections: 0
    auth_role: null
    nav_group: Tools
    notes: External links (KAA Form, Quote Generator, Submit Expenses)

  # --- Planned modules ---
  - name: Agreements (KAA)
    path: /agreements/
    status: planned
    d1_tables: [agreements, jobs, job_logs]
    wave: 1
  - name: Sales Pipeline
    path: /sales/
    status: planned
    d1_tables: [revenue_transactions, account_mapping, account_status, deck_metrics]
    wave: 2
  - name: Production
    path: /production/
    status: planned
    d1_tables: [production_runs, bom_components, component_costs, sku_costing, batch_cogs, payables, arap_snapshots]
    wave: 3
  - name: Loans
    path: /loans/
    status: planned
    d1_tables: [lenders, loan_transactions, loan_ledger]
    wave: 4
  - name: Sales Tool
    path: /sales-tool/
    status: planned
    d1_tables: [pricing]
    wave: 5
  - name: Xero Sync
    path: /admin/xero.html
    status: planned
    d1_tables: [xero_tokens, xero_invoices, xero_line_items, xero_contacts, xero_items, xero_sync_log]
    wave: Phase A
```

---

## Integration Registry

```yaml
integrations:
  - name: Cloudflare Access
    type: auth
    status: live
    notes: OTP login, hardcoded roster in script.js
  - name: Cloudflare D1
    type: database
    status: live
    binding: DB
    tables_live: 12
    tables_planned: 24
  - name: Xero Accounting
    type: external_api
    status: planned
    auth: OAuth 2.0 (Authorization Code)
    scopes: [offline_access, accounting.transactions.read, accounting.contacts.read, accounting.reports.read, accounting.settings.read]
    sync: Daily cron (06:00 WIB) + webhooks
    wave: Phase A
    notes: No SDK — raw fetch() client. Token stored in xero_tokens table.

  # --- GAS Adapters (post-migration) ---
  - name: KAA Doc Generator
    type: gas_adapter
    status: planned
    wave: 1
    trigger: Worker POST → GAS doPost
    google_apis: [DocumentApp, DriveApp]
    auth: API key in X-Api-Key header
  - name: KAA Email Sender
    type: gas_adapter
    status: planned
    wave: 1
    trigger: Worker POST → GAS doPost
    google_apis: [GmailApp]
    auth: API key in X-Api-Key header
  - name: Slides Deck Generator
    type: gas_adapter
    status: planned
    wave: 2
    trigger: Worker POST → GAS doPost
    google_apis: [SlidesApp, DriveApp]
    auth: API key in X-Api-Key header
  - name: Loan Statement Generator
    type: gas_adapter
    status: planned
    wave: 4
    trigger: Worker POST → GAS doPost
    google_apis: [DocumentApp, DriveApp, UrlFetchApp]
    auth: API key in X-Api-Key header
```

---

## Migration Ledger

```yaml
waves:
  - id: existing
    name: Platform Foundation
    status: complete
    d1_tables_added: 12
    migrations: [schema.sql, 001, 002, 003, 004, 005, 006]
    modules_shipped: [CRM, Projects, R&D, Prospecting (WIP), Budget, Reports, Admin, Dashboard]

  - id: phase_a
    name: Xero Sync Layer
    status: planned
    d1_tables_added: 6
    migration: "007_xero.sql"
    scope: OAuth connect, invoice/item/contact sync, webhook handler, daily cron, admin UI
    dependencies: []
    notes: Runs alongside existing GAS — no disruption. Data flows into D1 in parallel.

  - id: wave_1
    name: KAA + Foundation Infrastructure
    status: planned
    d1_tables_added: 3
    migrations: ["008_agreements.sql", "009_jobs.sql"]
    gas_functions_migrated: ~8
    gas_adapters_created: 2
    scope: Agreements CRUD, form intake, mapping, validation, dedup, search, backfill. Doc gen + email as GAS adapters. Jobs infrastructure.
    dependencies: []

  - id: wave_2
    name: Sales Data Pipeline
    status: planned
    d1_tables_added: 4
    migration: "010_sales.sql"
    gas_functions_migrated: ~15
    gas_functions_retired: ~10
    gas_adapters_created: 1
    scope: Revenue pipeline, margin calc, account status, mapping sync, deck metrics. Slides adapter.
    dependencies: [phase_a]
    gas_source: candid-labs-sales-master (44 files, 62 MIGRATE + 3 ADAPTER + 28 RETIRE)

  - id: wave_3
    name: Production Costing Pipeline
    status: planned
    d1_tables_added: 7
    migration: "011_production.sql"
    gas_functions_migrated: ~12
    gas_functions_retired: ~12
    gas_adapters_created: 0
    scope: Payables, BOM, costing engine, batch COGS, ARAP snapshots, production runs.
    dependencies: [wave_2]
    gas_source: candid-labs-production-master (41 files, 41 MIGRATE + 19 RETIRE)

  - id: wave_4
    name: Loan Tracker
    status: planned
    d1_tables_added: 3
    migration: "012_loans.sql"
    gas_functions_migrated: ~6
    gas_functions_retired: ~4
    gas_adapters_created: 1
    scope: Loan ledger, transaction form, interest accrual (cron), statement gen adapter.
    dependencies: []
    gas_source: candid-labs-loan-tracker (25 files, 7 MIGRATE + 5 ADAPTER + 7 RETIRE)

  - id: wave_5
    name: Sales Tool
    status: planned
    d1_tables_added: 1
    migration: "013_pricing.sql"
    gas_functions_migrated: ~5
    gas_adapters_created: 0
    scope: Pricing CRUD, PDF generation (Worker or GAS), static asset migration.
    dependencies: []
    gas_source: candid-labs-sales-tool (21 files, 8 MIGRATE + 4 RETIRE)

  - id: wave_6
    name: Cleanup & Decommission
    status: planned
    d1_tables_added: 0
    gas_functions_retired: ~50
    scope: Decommission all non-adapter GAS projects. Archive candid-labs repo. Remove QUARANTINE mirrors.
    dependencies: [wave_1, wave_2, wave_3, wave_4, wave_5]
    projects_decommissioned:
      - candid-labs-core-os (shared library — no consumers remain)
      - candid-labs-platform (admin/migration tooling — purpose fulfilled)
      - candid-os-script-discovery-engine (GAS scanning — not needed)
      - 5 LEGACY scriptIds
      - 1 QUARANTINE scriptId (surgical-strike)
      - 15 STAGING projects (pending user classification)
```

---

## Release Log

| Date | Change | Migration | Module | Author |
|------|--------|-----------|--------|--------|
| 2026-02-19 | Initial platform: CRM, Projects, Budget, Reports, Tools | schema.sql | Multiple | Claude |
| 2026-02-19 | Meta columns for all tables | 001 | Shared | Claude |
| 2026-02-19 | Company hierarchy + deal fields | 002 | CRM | Claude |
| 2026-02-19 | Contact first/last name split | 003 | CRM | Claude |
| 2026-02-24 | R&D Workspace: pipeline, docs, trials, SKUs | 004 | R&D | Claude |
| 2026-02-25 | R&D gate fields + stage history + approvals | 005 | R&D | Claude |
| 2026-02-26 | R&D gate_rationale column | 006 | R&D | Claude |
| 2026-02-26 | Nav restructure: Sales ▾ + Workspace ▾ dropdowns | — | Nav | Claude |
| 2026-02-26 | Prospecting module (client-side, WIP) | — | Prospecting | Claude |
| 2026-02-26 | Platform migration docs (v2), GAS function registry, Xero integration plan | — | Docs | Claude |

---

## Governance Rules

```yaml
governance:
  - rule: G1
    name: Manifest is source of truth
    description: This file is the authoritative description of platform architecture. If code and manifest disagree, update the one that is wrong.
  - rule: G2
    name: Every D1 table appears in data_spine
    description: No table may exist in production without a corresponding data_spine entry.
  - rule: G3
    name: Every module appears in modules list
    description: No routable page may exist without a modules entry.
  - rule: G4
    name: Migrations are append-only
    description: Never edit or delete a shipped migration file. Corrections go in a new numbered migration.
  - rule: G5
    name: Wave dependencies are enforced
    description: A wave cannot begin until all listed dependencies are complete.
  - rule: G6
    name: GAS adapters require API key auth
    description: No unauthenticated calls between Workers and GAS adapters.
  - rule: G7
    name: Release log updated on every deploy
    description: Every commit that changes D1 schema, adds a module, or modifies integrations must add a release log row.
  - rule: G8
    name: Proposed entities marked explicitly
    description: Any entity not yet in production D1 must have status "planned". Agents must not assume planned entities exist.
```

---

## GAS Estate Summary

```yaml
gas_estate:
  total_projects: 30
  total_source_files: ~345
  total_unique_functions: ~248

  classification:
    migrate: 140  # 56% — all business logic
    adapter: 12   # 5% — Google-native ops (Docs, Slides, Gmail, Drive)
    keep: 11      # 4% — menu/trigger stubs needed during transition
    retire: 85    # 34% — debug, diagnostic, test, setup, migration tooling
    shared: 25    # CoreOS copies × 8 spokes (retire with CoreOS in Wave 6)

  platform_projects:
    - name: candid-labs-core-os
      files: 14
      migrate: 0
      retire_wave: 6
    - name: candid-labs-loan-tracker
      files: 25
      migrate: 7
      adapter: 5
      wave: 4
    - name: candid-labs-platform
      files: 8
      migrate: 0
      retire_wave: 6
    - name: candid-labs-production-master
      files: 41
      migrate: 41
      wave: 3
    - name: candid-labs-sales-master
      files: 44
      migrate: 62
      adapter: 3
      wave: 2
    - name: candid-labs-sales-tool
      files: 21
      migrate: 8
      wave: 5
    - name: candid-os-script-discovery-engine
      files: 4
      migrate: 0
      retire_wave: 6
    - name: key-account-agreement-generator
      files: 25
      migrate: 22
      adapter: 4
      wave: 1
```

---

## File Map (platform repo)

```yaml
file_map:
  root_pages:
    - index.html        # Home / module cards
    - dashboard.html    # Management overview
    - reports.html      # Reports & analytics
    - about.html        # About page (public)
    - budget.html       # Budget tool (client-only)
    - roadmap.html      # Tool roadmap
    - testing.html      # Testing / dev sandbox
    - tools.html        # External tool links
    - login.html        # OTP login page
  subdirectory_modules:
    - crm/index.html
    - prospecting/index.html
    - projects/index.html
    - rnd/index.html
    - admin/users.html
  api:
    - api/src/index.js          # Cloudflare Worker (all API routes)
    - api/db/schema.sql         # Initial D1 schema
    - api/db/migrations/        # Numbered migration files (001–006)
  styles:
    - styles.css                # Global styles
    - crm/crm.css
    - projects/projects.css
    - rnd/rnd.css
    - import-export.css
  scripts:
    - script.js                 # Global JS (auth, nav dropdowns, theme)
    - data-adapter.js           # D1 API client
    - crm/crm.js
    - projects/projects.js
    - rnd/rnd.js
  docs:
    - docs/COREOS_MANIFEST.md   # This file
    - docs/migrations/          # Migration analysis documents
    - docs/runbooks/            # QA and partner guides
```
