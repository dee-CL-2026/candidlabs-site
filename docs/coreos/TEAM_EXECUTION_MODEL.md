# Team Execution Model v1.0

> Operational contract for the CoreOS platform migration agent team.
> Derived from: PLATFORM_MIGRATION_MAP_v2.md, ADR-0002, ROADMAP.yml.
> Generated: 2026-02-26.

---

## 1. Governance Hierarchy

| Level | Document | Scope | Authority |
|-------|----------|-------|-----------|
| 1 | ADR-0002 | Programme sequence | Frozen wave order (Preflight → W1 → W2 → W3 → W4 → W5 → W6). Any deviation requires a new ADR. |
| 2 | PLATFORM_MIGRATION_MAP_v2 | Node-level specs | Function classification, data flows, table schemas, GAS adapter specifications. |
| 3 | ROADMAP.yml | Operational backlog | Milestone IDs, dependency arrays, status tracking. |
| 4 | Per-wave ADRs | Local decisions | Scoped to individual wave design choices (e.g., ingestion pattern, PDF approach). |

**ADR-0002 scope confirmation:** ADR-0002 is programme-wide, not Wave 1 specific.

- Title: "Freeze Migration Execution Sequence" — covers the entire programme.
- Decision section defines canonical execution order listing all 6 waves.
- Stop conditions are defined for every wave (W1–W6).
- Consequences: "Execution sequence is frozen. No more sequencing debate."
- Deviation clause: "Any deviation from this sequence requires a new ADR explaining context and consequences."

---

## 2. Capability Lanes

Six lanes derived from the migration map's project domains (Section 2.2) and platform gaps (Section 4).

### Lane 1: Platform Core

- **Description:** Cross-cutting foundation infrastructure shared by all domain lanes.
- **Map source:** Section 4 "Platform Gaps", cross-cutting infra items in every wave scope.
- **Rationale:** D1 schema management, Worker routing, auth middleware, jobs infrastructure, cron triggers, and env var management are shared concerns that no single domain owns. Every wave scope references foundation items (migrations, COLLECTIONS, auth). Grouping these prevents domain agents from conflicting on shared platform code.
- **Nodes:** W1-SCHEMA, W1-JOBS, W1-COLLECTIONS, W1-AUTH, W1-WEBHOOK, W1-ENV, W2-SCHEMA, W3-SCHEMA, W4-SCHEMA, W4-CRON, W5-SCHEMA.

### Lane 2: Agreements (KAA)

- **Description:** Key Account Agreement domain — form intake, validation, document generation, email notifications.
- **Map source:** Section 3.1 "KAA" (project P1, 25 files, medium complexity), Wave 1 scope.
- **Rationale:** Self-contained project with clear boundaries. Its data flow (Form → mapping → D1 → doc gen → email) is fully internal. No other domain reads from or writes to agreements data.
- **Nodes:** W1-KAA-LOGIC, W1-KAA-UI, W1-ADAPTER-DOC, W1-ADAPTER-EMAIL.

### Lane 3: Sales & Revenue

- **Description:** Revenue pipeline, margin calculation, account management, deck generation, and pricing tool.
- **Map source:** Section 3.2 "Sales Master" (project P2, 44 files, very high complexity) + Section 3.5 "Sales Tool" (project P5, 21 files, low complexity), Wave 2 + Wave 5 scope.
- **Rationale:** P2 and P5 share the sales domain. P2 produces revenue/margin data; P5 consumes pricing data from the same domain. Sales Tool's 1-table scope does not justify a separate lane. All sales-related transforms (cleanReceivables, buildRevenueMaster, margin.js, account_status, mapping_sync, CRM bridge, deck metrics) belong to one pipeline.
- **Nodes:** W2-IMPORT-RECV, W2-MARGIN, W2-DECK-METRICS, W2-ACCOUNT-STATUS, W2-MAPPING-SYNC, W2-CRM-BRIDGE, W2-SALES-UI, W2-ADAPTER-SLIDES, W2-PIPELINE, W5-PRICING-CRUD, W5-PDF, W5-SALES-TOOL-UI, W5-ASSETS.

### Lane 4: Production & Costing

- **Description:** Production costing engine, BOM management, batch COGS, payables processing, KMI data parsing.
- **Map source:** Section 3.3 "Production Master" (project P3, 41 files, very high complexity), Wave 3 scope.
- **Rationale:** Self-contained costing domain. The 3-tier cost waterfall (actual PO → Xero standard → BOM estimate), batch COGS calculation, and payables processing form a tightly coupled pipeline. Cross-wave coupling exists only at the `sku_costing` output boundary (consumed by sales-agent for margin calculation).
- **Nodes:** W3-IMPORT-PAYABLES, W3-IMPORT-KMI, W3-COSTING-ENGINE, W3-BATCH-COGS, W3-ARAP, W3-PIPELINE, W3-BOM-ADMIN, W3-PRODUCTION-UI, W3-MARGIN-UPDATE.

### Lane 5: Loans & Finance

- **Description:** Loan ledger, transaction processing, interest accrual, statement generation.
- **Map source:** Section 3.4 "Loan Tracker" (project P4, 25 files, medium complexity), Wave 4 scope.
- **Rationale:** Self-contained financial domain. Ledger state machine (opening balance → transactions → interest → closing balance) is fully internal. Only external dependency is the GAS adapter for statement PDF generation.
- **Nodes:** W4-TRANSACTION, W4-BULK-APPLY, W4-INTEREST-CRON, W4-REBUILD-LEDGER, W4-LOANS-UI, W4-ADAPTER-STATEMENT.

### Lane 6: Decommission

- **Description:** Preflight gates, GAS estate cleanup, repo archival, mirror removal.
- **Map source:** Section 3.6 "Projects That Retire" (P6–P8), Wave 6 scope, Appendix C open dependencies.
- **Rationale:** Cleanup activities span all retired projects and cannot be assigned to a single domain lane. Preflight gates (scriptId confirmation, STAGING classification, LEGACY trigger audit) are prerequisites for accurate Wave 6 scoping. This lane activates first (preflight) and last (decommission).
- **Nodes:** PF-1, PF-2, PF-3, W6-CONFIG, W6-DECOM-LEGACY, W6-DECOM-QUARANTINE, W6-DECOM-ADMIN, W6-DECOM-STAGING, W6-ARCHIVE, W6-MIRROR.

---

## 3. Agent Team Structure

### Agent: core-infra

- **Lane:** Platform Core
- **Responsibilities:**
  - Author and apply D1 migration files (numbering, schema, indexes)
  - Maintain Worker COLLECTIONS config and CRUD route regex
  - Build and maintain auth middleware (adapter API key validation)
  - Build adapter invoke route (`POST /api/adapters/:type/invoke`)
  - Build webhook receiver endpoints (`/api/webhook/*`) for GAS adapter callbacks
  - Configure cron triggers in `wrangler.toml`
  - Manage Worker env vars (GAS URLs, API keys, template IDs)
- **Allowed scope:** `api/src/index.js`, `api/db/migrations/`, `wrangler.toml`, shared JS files (`data-adapter.js`, `auth.js`, `script.js`, `import-export.js`), nav HTML shell
- **Prohibited scope:** Domain-specific business logic, domain UI module files, GAS adapter source code
- **Primary inputs:** Table design specs from domain agents, COLLECTIONS config proposals from domain agents
- **Primary outputs:** Applied migrations, updated route regex, auth middleware, adapter invoke protocol
- **Collaboration dependencies:** Receives table schemas from all domain agents. Provides migration pattern, COLLECTIONS template, and auth middleware to all domain agents.

### Agent: kaa-agent

- **Lane:** Agreements (KAA)
- **Responsibilities:**
  - Port KAA business logic to Worker (mapping, validation, dedup, search, backfill)
  - Build `/agreements/` UI module (form, list, detail, status management)
  - Integrate doc generator and email sender GAS adapters via adapter invoke protocol
  - Define agreements table schema (provided to core-infra)
- **Allowed scope:** `agreements/` directory, KAA-specific Worker endpoints, GAS adapter doPost code for doc gen and email
- **Prohibited scope:** Shared platform files (index.js routing, auth, nav shell, shared JS), other domain modules
- **Primary inputs:** Adapter invoke protocol (from core-infra), existing KAA GAS source (Section 3.1)
- **Primary outputs:** `/agreements/` UI module, agreements CRUD endpoints, doc gen + email adapter integration
- **Collaboration dependencies:** Depends on core-infra for migration application, COLLECTIONS registration, auth middleware, adapter invoke route.

### Agent: sales-agent

- **Lane:** Sales & Revenue
- **Responsibilities:**
  - Port sales pipeline transforms to Worker (cleanReceivables, buildRevenueMaster, margin.js, account_status, mapping_sync, tracking_enrichment, CRM bridge, deck metrics orchestration)
  - Build `/sales/` UI module (revenue dashboard, margin view, account health)
  - Build `/sales-tool/` UI module (pricing form, PDF download)
  - Integrate slides deck generator GAS adapter
  - Define sales + pricing table schemas (provided to core-infra)
- **Allowed scope:** `sales/` directory, `sales-tool/` directory, sales-specific Worker endpoints, GAS adapter doPost code for slides
- **Prohibited scope:** Shared platform files, other domain modules, production costing logic
- **Primary inputs:** reporting_v0 dataset (from Phase A), `sku_costing` D1 table (from production-agent, Wave 3), adapter invoke protocol (from core-infra)
- **Primary outputs:** Revenue pipeline endpoints, margin calculation, deck metrics, slides adapter, pricing CRUD, PDF generation
- **Collaboration dependencies:** Depends on core-infra for migrations + COLLECTIONS. Depends on production-agent for `sku_costing` table (Wave 3 cross-wave dependency).

### Agent: production-agent

- **Lane:** Production & Costing
- **Responsibilities:**
  - Port production pipeline to Worker (cleanPayables, buildProductionRuns, kmiFgParser, Costing_Engine 3-tier waterfall, build_batch_cogs, ARAPSnapshot, Pipelines.js orchestration)
  - Build `/production/` UI module (costing dashboard, production runs, BOM editor, payables view)
  - Build BOM management admin endpoints
  - Update Wave 2 margin calculation to read `sku_costing` from D1
  - Define production table schemas (provided to core-infra)
- **Allowed scope:** `production/` directory, production-specific Worker endpoints, Wave 2 margin calc update (W3-MARGIN-UPDATE)
- **Prohibited scope:** Shared platform files, other domain modules (except margin calc cross-wave update)
- **Primary inputs:** Xero payables data (from Phase A), KMI packaging data, existing production GAS source (Section 3.3), adapter invoke protocol (from core-infra)
- **Primary outputs:** Costing engine endpoints, batch COGS, `sku_costing` table (consumed by sales-agent), ARAP snapshots, BOM management
- **Collaboration dependencies:** Depends on core-infra for migrations + COLLECTIONS. Produces `sku_costing` consumed by sales-agent. W3-MARGIN-UPDATE touches sales-agent scope (requires coordination).

### Agent: loans-agent

- **Lane:** Loans & Finance
- **Responsibilities:**
  - Port loan logic to Worker (saveTransaction state machine, BulkFromTransactions, InterestAccrual, RebuildLoanInterest)
  - Build `/loans/` UI module (ledger view, transaction form, statement trigger)
  - Integrate statement generator GAS adapter
  - Define loan table schemas (provided to core-infra)
- **Allowed scope:** `loans/` directory, loan-specific Worker endpoints, GAS adapter doPost code for statement generator
- **Prohibited scope:** Shared platform files, other domain modules
- **Primary inputs:** Existing loan tracker GAS source (Section 3.4), adapter invoke protocol (from core-infra)
- **Primary outputs:** Ledger endpoints, transaction processing, interest accrual job, statement adapter integration
- **Collaboration dependencies:** Depends on core-infra for migrations + COLLECTIONS + cron config. No cross-domain data dependencies.

### Agent: cleanup-agent

- **Lane:** Decommission
- **Responsibilities:**
  - Execute preflight gates (scriptId confirmation, STAGING classification, LEGACY trigger audit)
  - Extract CoreOS.CONFIG values to Worker env vars
  - Decommission GAS scriptIds (LEGACY, QUARANTINE, admin tools, STAGING)
  - Archive `candid-labs` repo
  - Remove QUARANTINE mirror copies
- **Allowed scope:** GAS project metadata, Apps Script console operations, `candid-labs` repo, QUARANTINE directories
- **Prohibited scope:** Platform source code (candidlabs-site), domain business logic, D1 schema
- **Primary inputs:** GAS project inventory (Section 2.2), STAGING project list (Appendix C), LEGACY scriptId list
- **Primary outputs:** Preflight gate confirmations (scriptId registry, STAGING classification, LEGACY status), decommissioned scriptIds, archived repos
- **Collaboration dependencies:** Preflight outputs inform Wave 6 scope. No runtime dependencies on other agents.

### Shared-Surface Change Protocol

**Shared surfaces** (owned by core-infra):

| Surface | File(s) | What it controls |
|---------|---------|-----------------|
| Route config | `api/src/index.js` — route regex, COLLECTIONS config | Which API endpoints exist and how CRUD behaves |
| Auth middleware | `api/src/index.js` — adapter API key validation | How adapter calls are authenticated |
| Adapter invoke route | `api/src/index.js` — `POST /api/adapters/:type/invoke` | How domain agents call GAS adapters |
| Nav shell | HTML nav structure across all pages | Navigation menu items and dropdowns |
| Shared UI/store | `data-adapter.js`, `auth.js`, `script.js`, `import-export.js` | Client-side data access, auth, and import/export |

**Protocol for domain agent changes to shared surfaces:**

1. Domain agent proposes change via isolated commit on a feature branch.
2. Commit must be small and scoped to a single concern (e.g., "add agreements to CRUD route regex").
3. core-infra reviews for:
   - Conflict with other domain agents' pending changes
   - Convention compliance (COLLECTIONS field order, route regex format, nav ordering)
   - No regression to existing collections or routes
4. core-infra approves or requests revision.
5. On approval, core-infra merges into shared surface on the programme branch.

**Conflict resolution:**

- If two domain agents propose overlapping changes to the same shared surface, core-infra batches them into a single commit.
- Convention enforcement: core-infra maintains a checklist (COLLECTIONS field order, route regex format, nav dropdown ordering) and rejects non-conforming proposals.
- Deadlock: if core-infra cannot resolve a conflict, escalate to team lead for sequencing decision.

---

## 4. Node Registry

Structure: node_id, wave, description, lane owner, dependencies (source), deliverable artifact.

Dependencies reference only ROADMAP.yml dependency arrays or explicit migration map statements. No invented dependencies.

### Preflight

| Node ID | Description | Lane Owner | Dependencies | Deliverable |
|---------|-------------|------------|--------------|-------------|
| PF-1 | Confirm live deployed scriptIds for 8 PLATFORM projects | cleanup-agent | None (Appendix C) | ScriptId registry document |
| PF-2 | Classify 15 STAGING projects (in-use vs archive) | cleanup-agent | None (Appendix C) | STAGING classification list |
| PF-3 | Confirm LEGACY triggers (any still firing) | cleanup-agent | None (Appendix C) | LEGACY trigger status report |

**Preflight stop condition (ADR-0002):** Each PLATFORM project has a confirmed live scriptId + clasp folder. STAGING/LEGACY are classified as safe to ignore or flagged for action.

### Wave 1 — KAA + Foundation

| Node ID | Description | Lane Owner | Dependencies | Deliverable |
|---------|-------------|------------|--------------|-------------|
| W1-SCHEMA | D1 migration 008_agreements.sql (agreements table) | core-infra | None (ROADMAP W1-1 `dependencies: []`) | `api/db/migrations/008_agreements.sql` |
| W1-JOBS | D1 migration 009_jobs.sql (jobs + job_logs tables) | core-infra | None (ROADMAP W1-2 `dependencies: []`) | `api/db/migrations/009_jobs.sql` |
| W1-COLLECTIONS | Add agreements, jobs, job_logs to Worker COLLECTIONS + route regex | core-infra | W1-SCHEMA, W1-JOBS (tables must exist) | Updated `api/src/index.js` |
| W1-AUTH | API key auth middleware for adapter endpoints | core-infra | None | Auth middleware in `api/src/index.js` |
| W1-WEBHOOK | Webhook receiver endpoints (`/api/webhook/*`) for GAS adapter callbacks | core-infra | W1-AUTH (needs API key validation) | Webhook route handler in `api/src/index.js` |
| W1-ENV | Worker env vars (GAS URLs, API keys, template/folder IDs) | core-infra | None | `wrangler.toml` or CF dashboard config |
| W1-KAA-LOGIC | Port KAA mapping, validation, dedup, search, backfill to Worker | kaa-agent | W1-COLLECTIONS (needs CRUD routes) | Worker endpoint logic for agreements |
| W1-KAA-UI | Build `/agreements/` UI module (form, list, detail) | kaa-agent | W1-COLLECTIONS (needs API) | `agreements/index.html`, `agreements/agreements.js` |
| W1-ADAPTER-DOC | GAS doc generator webapp (doPost) | kaa-agent | W1-JOBS, W1-AUTH, W1-ENV (ROADMAP W1-3 deps: [W1-2]) | GAS webapp deployment + adapter invoke integration |
| W1-ADAPTER-EMAIL | GAS email sender webapp (doPost) | kaa-agent | W1-JOBS, W1-AUTH, W1-ENV (ROADMAP W1-3 deps: [W1-2]) | GAS webapp deployment + adapter invoke integration |

**Wave 1 stop condition (ADR-0002):** End-to-end vertical slice — create agreement in platform UI → generate doc via GAS adapter → log to jobs/job_logs → send email via GAS adapter. Old KAA sheet becomes read-only archive. One agreement flows through the entire pipeline.

### Wave 2 — Sales Pipeline

| Node ID | Description | Lane Owner | Dependencies | Deliverable |
|---------|-------------|------------|--------------|-------------|
| W2-SCHEMA | D1 migration 010_sales.sql (revenue_transactions, account_mapping, account_status, deck_metrics) | core-infra | PA-2 complete (ROADMAP W2-1 deps: [PA-2]) | `api/db/migrations/010_sales.sql` |
| W2-IMPORT-RECV | `POST /api/sales/import-receivables` — replaces cleanReceivables + buildRevenueMaster | sales-agent | W2-SCHEMA | Worker import endpoint |
| W2-MARGIN | `POST /api/sales/refresh-margins` — replaces margin.js DQ-gated calculation | sales-agent | W2-SCHEMA, W2-IMPORT-RECV | Worker computation endpoint |
| W2-DECK-METRICS | `POST /api/sales/refresh-deck-metrics` — replaces Deck_Metrics_Wrapper orchestration | sales-agent | W2-MARGIN | Worker pipeline endpoint |
| W2-ACCOUNT-STATUS | `POST /api/sales/rebuild-account-status` — replaces account_status.js | sales-agent | W2-SCHEMA | Worker computation endpoint |
| W2-MAPPING-SYNC | `POST /api/sales/sync-mapping` — replaces mapping_sync.js + tracking_enrichment.js | sales-agent | W2-SCHEMA | Worker sync endpoint |
| W2-CRM-BRIDGE | Bridge CRM.js functions into existing platform CRM module | sales-agent | W2-MAPPING-SYNC | Updated CRM module logic |
| W2-SALES-UI | Build `/sales/` UI module (revenue dashboard, margin, account health) | sales-agent | W2-IMPORT-RECV, W2-MARGIN | `sales/index.html`, `sales/sales.js` |
| W2-ADAPTER-SLIDES | GAS slides deck generator webapp (doPost, 22 placeholders) | sales-agent | W2-SCHEMA, W2-DECK-METRICS, W1-ADAPTER-DOC (ROADMAP W2-2 deps: [W2-1, W1-3]) | GAS webapp deployment |
| W2-PIPELINE | Pipeline orchestration endpoint (chains import → margin → deck metrics) | sales-agent | W2-IMPORT-RECV, W2-MARGIN, W2-DECK-METRICS | Worker orchestration endpoint |

**Wave 2 stop condition (ADR-0002):** Upload Xero data → compute revenue + margin → generate monthly deck from platform. Ingestion endpoint consumes reporting_v0 dataset. Slides deck adapter operational.

### Wave 3 — Production Costing

| Node ID | Description | Lane Owner | Dependencies | Deliverable |
|---------|-------------|------------|--------------|-------------|
| W3-SCHEMA | D1 migration 011_production.sql (production_runs, bom_components, component_costs, sku_costing, batch_cogs, payables, arap_snapshots) | core-infra | W2-SCHEMA (ROADMAP W3-1 deps: [W2-1]) | `api/db/migrations/011_production.sql` |
| W3-IMPORT-PAYABLES | `POST /api/production/import-payables` — replaces cleanPayables | production-agent | W3-SCHEMA | Worker import endpoint |
| W3-IMPORT-KMI | `POST /api/production/import-kmi-packaging` — replaces buildProductionRuns + kmiFgParser | production-agent | W3-SCHEMA | Worker import endpoint |
| W3-COSTING-ENGINE | `POST /api/production/run-costing-engine` — replaces Costing_Engine 3-tier waterfall | production-agent | W3-IMPORT-PAYABLES | Worker computation endpoint |
| W3-BATCH-COGS | `POST /api/production/build-batch-cogs` — replaces build_batch_cogs | production-agent | W3-IMPORT-KMI, W3-COSTING-ENGINE | Worker computation endpoint |
| W3-ARAP | `POST /api/production/snapshot-arap` — replaces ARAPSnapshot | production-agent | W3-SCHEMA | Worker snapshot endpoint |
| W3-PIPELINE | `POST /api/production/run-all` — replaces Pipelines.js orchestration | production-agent | W3-IMPORT-PAYABLES, W3-IMPORT-KMI, W3-COSTING-ENGINE, W3-BATCH-COGS | Worker orchestration endpoint |
| W3-BOM-ADMIN | BOM management endpoints (import, edit) | production-agent | W3-SCHEMA | Worker admin endpoints |
| W3-PRODUCTION-UI | Build `/production/` UI module (costing dashboard, production runs, BOM editor, payables) | production-agent | W3-IMPORT-PAYABLES, W3-COSTING-ENGINE | `production/index.html`, `production/production.js` |
| W3-MARGIN-UPDATE | Update Wave 2 margin calc to read `sku_costing` from D1 (removes cross-sheet coupling) | production-agent | W3-COSTING-ENGINE, W2-MARGIN (Map Section 3.3 Wave 3: "Wave 2 margin calc updated to read sku_costing from D1") | Updated margin endpoint in sales domain |

**Wave 3 stop condition (ADR-0002):** SKU costing produced in D1. Sales margin reads it from D1. Payables import + KMI import endpoints operational. Costing engine + batch COGS ported to Worker.

### Wave 4 — Loan Tracker

| Node ID | Description | Lane Owner | Dependencies | Deliverable |
|---------|-------------|------------|--------------|-------------|
| W4-SCHEMA | D1 migration 012_loans.sql (lenders, loan_transactions, loan_ledger) | core-infra | None (ROADMAP W4-1 `dependencies: []`) — ADR-locked until Wave 3 complete | `api/db/migrations/012_loans.sql` |
| W4-TRANSACTION | `POST /api/loans/transactions` — replaces saveTransaction state machine | loans-agent | W4-SCHEMA | Worker transaction endpoint |
| W4-BULK-APPLY | `POST /api/loans/bulk-apply` — replaces BulkFromTransactions | loans-agent | W4-SCHEMA | Worker bulk endpoint |
| W4-INTEREST-CRON | Interest accrual scheduled job — replaces InterestAccrual (daily rate: 5% p.a.) | loans-agent | W4-SCHEMA, W4-CRON | Worker cron handler |
| W4-REBUILD-LEDGER | `POST /api/loans/rebuild-ledger` — replaces RebuildLoanInterest | loans-agent | W4-SCHEMA | Worker admin endpoint |
| W4-LOANS-UI | Build `/loans/` UI module (ledger view, transaction form, statement trigger) | loans-agent | W4-TRANSACTION | `loans/index.html`, `loans/loans.js` |
| W4-ADAPTER-STATEMENT | GAS statement generator webapp (doPost — Doc + PDF export) | loans-agent | W4-REBUILD-LEDGER, W1-AUTH | GAS webapp deployment |
| W4-CRON | Add monthly interest accrual cron to `wrangler.toml` | core-infra | W4-SCHEMA | Updated `wrangler.toml` |

**Wave 4 stop condition (ADR-0002):** Ledger + interest accrual runs via cron. Statement generation via GAS adapter. Ledger operational, statements generated.

### Wave 5 — Sales Tool

| Node ID | Description | Lane Owner | Dependencies | Deliverable |
|---------|-------------|------------|--------------|-------------|
| W5-SCHEMA | D1 migration 013_pricing.sql (pricing table) | core-infra | None (ROADMAP W5-1 `dependencies: []`) — ADR-locked until Wave 4 complete | `api/db/migrations/013_pricing.sql` |
| W5-PRICING-CRUD | Pricing CRUD endpoints via Worker COLLECTIONS | sales-agent | W5-SCHEMA | Worker pricing endpoints |
| W5-PDF | PDF generation (Worker Browser Rendering API or GAS adapter) | sales-agent | W5-PRICING-CRUD | PDF generation endpoint |
| W5-SALES-TOOL-UI | Build `/sales-tool/` UI module (pricing form, PDF download) | sales-agent | W5-PRICING-CRUD | `sales-tool/index.html`, `sales-tool/sales-tool.js` |
| W5-ASSETS | Migrate static assets (background image, logos) to R2 or static hosting | sales-agent | None | Asset files in hosting |

**Wave 5 stop condition (ADR-0002):** Pricing CRUD in D1. PDF generation operational. Pricing tool functional in platform.

### Wave 6 — GAS Decommission

| Node ID | Description | Lane Owner | Dependencies | Deliverable |
|---------|-------------|------------|--------------|-------------|
| W6-CONFIG | Extract all CoreOS.CONFIG values into Worker env vars | cleanup-agent | All waves complete (ROADMAP W6-1 deps: [W1-3, W2-2, W3-1, W4-1, W5-1]) | Env var configuration |
| W6-DECOM-LEGACY | Decommission 5 LEGACY scriptIds | cleanup-agent | PF-3 (trigger status confirmed) | Archived scriptIds |
| W6-DECOM-QUARANTINE | Decommission QUARANTINE scriptId (surgical-strike) | cleanup-agent | W6-CONFIG | Archived scriptId |
| W6-DECOM-ADMIN | Decommission core-os, platform, discovery-engine scriptIds | cleanup-agent | W6-CONFIG | Archived scriptIds |
| W6-DECOM-STAGING | Decommission STAGING projects (per PF-2 classification) | cleanup-agent | PF-2 (classification complete) | Archived/retired scriptIds |
| W6-ARCHIVE | Archive `candid-labs` repo | cleanup-agent | W6-DECOM-LEGACY, W6-DECOM-QUARANTINE, W6-DECOM-ADMIN | Archived repository |
| W6-MIRROR | Remove QUARANTINE mirror copies (98_QUARANTINE) | cleanup-agent | W6-DECOM-QUARANTINE | Removed directories |

**Wave 6 stop condition (ADR-0002):** All PLATFORM scriptIds archived. QUARANTINE mirrors removed. Only thin adapters remain (doc gen, email, slides, statement gen). No GAS script runs business logic.

### Node Summary

| Wave | Node Count | Lane Distribution |
|------|-----------|-------------------|
| Preflight | 3 | cleanup-agent: 3 |
| Wave 1 | 10 | core-infra: 6, kaa-agent: 4 |
| Wave 2 | 10 | core-infra: 1, sales-agent: 9 |
| Wave 3 | 10 | core-infra: 1, production-agent: 9 |
| Wave 4 | 8 | core-infra: 2, loans-agent: 6 |
| Wave 5 | 5 | core-infra: 1, sales-agent: 4 |
| Wave 6 | 7 | cleanup-agent: 7 |
| **Total** | **53** | |

---

## 5. Interface Registry

Cross-lane dependencies only. Each interface is traceable to a specific migration map section or ADR-0002 statement.

| # | Producer | Consumer | Artifact | Contract | Source Reference |
|---|----------|----------|----------|----------|-----------------|
| I-1 | core-infra | ALL domain agents | D1 migration pattern | `CREATE TABLE IF NOT EXISTS` with TEXT PK, meta, timestamps, indexes. Domain agents provide schema; core-infra provides migration file. | Map Section 4 "Platform Gaps", every wave scope |
| I-2 | core-infra | ALL domain agents | COLLECTIONS config template | `{ table, prefix, required, columns, searchable, orderBy }`. Domain agents propose; core-infra registers. | Map Section 4, existing `api/src/index.js` pattern |
| I-3 | core-infra | ALL domain agents | Adapter invoke protocol | `POST /api/adapters/:type/invoke` with `X-Api-Key` header. Creates job record, logs steps, returns `{ ok, job_id, result }`. | Map Section 4 "GAS↔Worker auth", Appendix B adapter specs |
| I-4 | core-infra | ALL domain agents | Auth middleware | API key validation for adapter endpoints. JWT presence check for platform routes. | Map Section 4 "GAS↔Worker auth" |
| I-5 | production-agent | sales-agent | `sku_costing` table (D1 read) | sales-agent reads `sku_costing.raw_cogs_idr` by `sku_code` for margin calculation. Replaces cross-sheet lookup to Production DB Google Sheet. | Map Section 3.2 margin.js cross-sheet ref; ADR-0002 Wave 3 "margin calc updated to read sku_costing from D1" |
| I-6 | Phase A (external) | sales-agent | reporting_v0 dataset | Snapshot DB (SQLite, 709 KB) + 11 CSV files. 5 scopes, 5 endpoints, 6 tables, 5 views. Sales-agent ingests via import endpoint. | ADR-0002 "Phase A → Wave 2 integration gap" |
| I-7 | Phase A (external) | production-agent | Xero payables data | Raw payables export (ACCPAY invoices + line items). Production-agent ingests via import-payables endpoint. | Map Section 3.3 "Xero payables export → paste into PAYABLE_DETAIL_RAW" |
| I-8 | cleanup-agent | ALL | Preflight gate confirmations | ScriptId registry, STAGING classification, LEGACY trigger status. Informs Wave 6 scope. | Map Appendix C open dependencies |

---

## 6. Execution Ready Queue

### ADR-Gating Rule

Only Preflight nodes and nodes in the **current active wave** may be marked Ready, regardless of ROADMAP.yml dependency arrays. ADR-0002's frozen sequence (Preflight → W1 → W2 → W3 → W4 → W5 → W6) is the gating authority. A wave becomes "current" only when all stop conditions of the preceding wave are met.

### Current State

| Item | Status | Source |
|------|--------|--------|
| Phase A (Xero Sync) | **Complete** | ADR-0002 |
| Preflight gates | Not confirmed complete | Appendix C open actions |
| Current active wave | Preflight + Wave 1 | Wave 1 has no prerequisite wave |
| Wave 2–6 | ADR-locked | Cannot start until prior wave stop condition met |

### Ready Nodes (Preflight + Wave 1)

| Node ID | Description | Owning Agent | Rationale |
|---------|-------------|-------------|-----------|
| PF-1 | Confirm PLATFORM scriptIds | cleanup-agent | No dependencies (Appendix C) |
| PF-2 | Classify STAGING projects | cleanup-agent | No dependencies (Appendix C) |
| PF-3 | Confirm LEGACY triggers | cleanup-agent | No dependencies (Appendix C) |
| W1-SCHEMA | D1 migration 008_agreements.sql | core-infra | ROADMAP W1-1 `dependencies: []` |
| W1-JOBS | D1 migration 009_jobs.sql | core-infra | ROADMAP W1-2 `dependencies: []` |
| W1-AUTH | API key auth middleware | core-infra | No stated dependency |
| W1-ENV | Worker env vars setup | core-infra | No stated dependency |

**Suggested execution order within lanes:**

- **core-infra:** W1-SCHEMA ∥ W1-JOBS ∥ W1-ENV → W1-COLLECTIONS → W1-AUTH → W1-WEBHOOK (schema + jobs first, then routes, then auth, then webhook)
- **kaa-agent:** Blocked until W1-COLLECTIONS + W1-JOBS + W1-AUTH complete. Then: W1-KAA-LOGIC ∥ W1-KAA-UI → W1-ADAPTER-DOC ∥ W1-ADAPTER-EMAIL
- **cleanup-agent:** PF-1 ∥ PF-2 ∥ PF-3 (all independent, run in parallel)

### Technically Independent (ADR-Locked)

These nodes have empty dependency arrays in ROADMAP.yml but are locked behind ADR-0002's frozen wave sequence. They may NOT be marked Ready without an ADR amendment explicitly permitting out-of-sequence work.

| Node ID | Wave | ROADMAP Dependencies | ADR Lock |
|---------|------|---------------------|----------|
| W4-SCHEMA | 4 | `dependencies: []` | Locked until Wave 3 stop condition met |
| W5-SCHEMA | 5 | `dependencies: []` | Locked until Wave 4 stop condition met |

---

## 7. Branching and Rollback Model

### Programme Branch

- **Long-lived branch:** `migration/platform-v2`
- Created from `main` at programme start.
- All migration work integrates here before reaching `main`.
- Kept up-to-date with `main` via periodic merges (not rebases).

### Feature Branch Pattern

- **Per-node branches:** `migration/<lane>/<node-id>`
- Examples:
  - `migration/core/W1-SCHEMA`
  - `migration/kaa/W1-KAA-LOGIC`
  - `migration/sales/W2-MARGIN`
  - `migration/production/W3-COSTING-ENGINE`
  - `migration/loans/W4-TRANSACTION`
  - `migration/cleanup/PF-1`
- Domain agents work exclusively on their lane's feature branches.
- core-infra works on `migration/core/<node-id>` for infrastructure nodes.

### Merge Gating (Feature → Programme)

A feature branch may merge into `migration/platform-v2` only when ALL conditions are met:

1. **Stop condition:** Node deliverable meets its definition (per ADR-0002 wave stop condition or node-level spec).
2. **Artifact presence:** Deliverable file or endpoint exists and is functional.
3. **Shared-surface approval:** If the node includes changes to any shared surface, core-infra has approved the change.
4. **No merge conflicts:** Feature branch merges cleanly into programme branch.

### Rollback — Two Levels

| Level | Scope | Mechanism | When to Use |
|-------|-------|-----------|-------------|
| **Node rollback** | Single node | `git revert <merge-commit>` on `migration/platform-v2` | Node artifact fails validation or causes regression after merge |
| **Wave rollback** | Entire wave | Reset `migration/platform-v2` to prior wave boundary tag | Systemic failure requiring wave-level redo |

### Wave Boundary Tags

- Tag `migration/platform-v2` at each wave completion: `wave-N-complete` (e.g., `wave-1-complete`).
- Tags are immutable reference points for rollback.
- Wave rollback = reset programme branch to prior wave tag, then re-apply surviving nodes selectively.

### Deployment Policy

- Production deploys ONLY from `main`.
- `migration/platform-v2` merges to `main` only after the current wave's stop condition is fully met (per ADR-0002).
- No partial-wave deploys to production.
- Sequence: feature branches → `migration/platform-v2` (continuous) → `main` (wave boundary only).

---

## 8. Team Operating Model

### Work Claiming

1. Agent checks TaskList for available nodes (status: pending, no owner, not blocked).
2. Agent claims node using TaskUpdate (set `owner` to agent name).
3. Prefer nodes in ID order (lowest ID first) when multiple are available.
4. Only claim nodes in the current active wave or Preflight (ADR-gating rule).

### Completion Signaling

1. Agent marks task completed via TaskUpdate (status: completed).
2. Agent provides artifact path or endpoint in task update.
3. System automatically notifies team lead and unblocks dependent nodes.

### Artifact Publishing

1. All artifacts committed to repo on feature branch (`migration/<lane>/<node-id>`).
2. Feature branch merged to programme branch (`migration/platform-v2`) after merge gating checks pass.
3. Merged artifact becomes available for dependent nodes.

### Ready Node Discovery

1. After completing a task, agent calls TaskList to find newly unblocked work.
2. Agent checks if the current wave has remaining unclaimed nodes.
3. If no nodes available in current wave, agent goes idle until next wave activates.

### Cross-Lane Coordination

1. When a producer node completes, the producing agent sends a message to the consuming agent via SendMessage.
2. Message includes: artifact path, contract confirmation, any caveats.
3. Consumer agent validates artifact against interface contract (Section 5) before starting dependent work.

### Failure Escalation

1. Agent encounters failure → keeps task status as `in_progress`.
2. Agent creates a new blocking task describing the issue.
3. Agent notifies team lead via SendMessage with failure summary.
4. Team lead decides: fix forward, reassign, or escalate to user.
5. If failure affects a shared surface, core-infra is notified immediately.

### Wave Transition

1. Team lead verifies all wave stop conditions are met (per ADR-0002).
2. Team lead tags programme branch: `wave-N-complete`.
3. Team lead merges programme branch to `main` for production deploy.
4. Team lead activates next wave by creating tasks for its nodes.
5. Agents check TaskList and claim newly available work.
