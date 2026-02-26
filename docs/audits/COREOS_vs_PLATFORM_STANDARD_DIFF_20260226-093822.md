# CoreOS Pack vs Platform Standard Diff Report

Generated: 20260226-093822  
Repo: candidlabs-site  
Compared:
- Implementation pack: `docs/coreos/`
- Standard rules: `platform-standard/docs/_standard/`
- Template baseline: `platform-standard/docs/implementation-template/`

---

## A. Summary (high level)

This report checks:
1) File/folder drift vs template  
2) YAML metadata compliance (required header fields)  
3) Parse validity of YAML files  
4) Unified diffs where names overlap

---

## B. File Trees

### B1. CoreOS pack tree
```
./ARCHITECTURE.md
./DATA_DICTIONARY.yml
./DECISIONS/ADR-0001-coreos-doc-pack.md
./INTEGRATIONS.yml
./MODULES.yml
./QUALITY_GATES.md
./README.md
./ROADMAP.yml
./RUNBOOKS/RUNBOOK_DEPLOY.md
./RUNBOOKS/RUNBOOK_XERO_CONNECT.md
```

### B2. Standard template tree
```
./ARCHITECTURE.md
./DATA_DICTIONARY.yml
./DECISIONS/ADR-0001-initial-architecture.md
./INTEGRATIONS.yml
./MODULES.yml
./README.md
./ROADMAP.yml
./RUNBOOKS/RUNBOOK_DEPLOY.md
```

## C. Template Compliance (Implementation Template)

### C1. Missing from CoreOS (present in template, absent in CoreOS)
```
./DECISIONS/ADR-0001-initial-architecture.md
```

### C2. Extra in CoreOS (present in CoreOS, absent in template)
```
./DECISIONS/ADR-0001-coreos-doc-pack.md
./QUALITY_GATES.md
./RUNBOOKS/RUNBOOK_XERO_CONNECT.md
```


## D. YAML Compliance & Validity


### D1. CoreOS YAML files

- **DATA_DICTIONARY.yml**
  - Missing header fields: platform_name, platform_version, primary_domain, primary_data_store, primary_auth_method, primary_accounting_system
  - Parse heuristic: OK
- **INTEGRATIONS.yml**
  - Missing header fields: platform_name, platform_version, primary_domain, primary_data_store, primary_auth_method, primary_accounting_system
  - Parse heuristic: OK
- **MODULES.yml**
  - Missing header fields: platform_name, platform_version, primary_domain, primary_data_store, primary_auth_method, primary_accounting_system
  - Parse heuristic: OK
- **ROADMAP.yml**
  - Missing header fields: platform_name, platform_version, primary_domain, primary_data_store, primary_auth_method, primary_accounting_system
  - Parse heuristic: OK

### D2. Template YAML files

- **DATA_DICTIONARY.yml**
  - Header fields: OK
  - Parse heuristic: OK
- **INTEGRATIONS.yml**
  - Header fields: OK
  - Parse heuristic: OK
- **MODULES.yml**
  - Header fields: OK
  - Parse heuristic: OK
- **ROADMAP.yml**
  - Header fields: OK
  - Parse heuristic: OK
## E. Unified Diffs (where names overlap template)

### E../ARCHITECTURE.md
```diff
--- platform-standard/docs/implementation-template/./ARCHITECTURE.md	2026-02-26 09:15:22
+++ docs/coreos/./ARCHITECTURE.md	2026-02-26 08:58:21
@@ -1,60 +1,88 @@
-# Architecture
+# CoreOS Architecture
 
-> One-page overview of the platform stack.
+> One-page overview of the Candid CoreOS platform stack.
 
 ## System Diagram
 
 ```
 ┌─────────────────────────────────────────────────────────────┐
-│  CLIENT LAYER                                                │
+│  BROWSER                                                     │
+│  Static HTML/CSS/JS served by Cloudflare Pages               │
 │                                                              │
-│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
-│  │ Module A │  │ Module B │  │ Module C │  │ Module D │   │
-│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
-│       └──────────────┴──────────────┴──────────────┘         │
+│  ┌──────┐ ┌────────────┐ ┌────────┐ ┌─────┐ ┌───────────┐  │
+│  │ CRM  │ │Prospecting │ │Projects│ │ R&D │ │Reports/etc│  │
+│  └──┬───┘ └─────┬──────┘ └───┬────┘ └──┬──┘ └─────┬─────┘  │
+│     │           │            │         │           │         │
+│     └───────────┴────────────┴─────────┴───────────┘         │
 │                          │                                    │
-│                    API Client Layer                           │
+│                   data-adapter.js                             │
+│                   fetch("/api/...")                           │
 └──────────────────────────┬──────────────────────────────────┘
                            │ HTTPS
 ┌──────────────────────────▼──────────────────────────────────┐
-│  API LAYER                                                    │
+│  CLOUDFLARE WORKER  (api/src/index.js)                       │
 │                                                              │
 │  Routes:                                                     │
-│    CRUD     /api/{collection}[/{id}]                         │
-│    Import   /api/{collection}/import                         │
-│    Health   /api/health                                      │
+│    GET/POST/PUT/DELETE /api/{collection}[/{id}]              │
+│    POST               /api/{collection}/import               │
+│    GET                 /api/overview/{module}                 │
+│    GET                 /api/comments                          │
+│    POST                /api/comments                          │
+│    DELETE              /api/comments/{id}                     │
+│    GET                 /api/health                            │
 │                                                              │
-│  Auth: <PRIMARY_AUTH_METHOD>                                  │
+│  Collections: contacts, companies, deals, projects, tasks,   │
+│    rnd_projects, rnd_documents, rnd_trial_entries,           │
+│    rnd_stage_history, rnd_approvals, skus, comments          │
+│                                                              │
+│  Auth: CF Access headers (Cf-Access-Jwt-Assertion)           │
+│  Validated client-side via script.js roster                  │
 └──────────────────────────┬──────────────────────────────────┘
-                           │ Database binding
+                           │ D1 binding (env.DB)
 ┌──────────────────────────▼──────────────────────────────────┐
-│  DATA LAYER                                                   │
+│  CLOUDFLARE D1  (SQLite)                                     │
 │                                                              │
-│  <PRIMARY_DATA_STORE>                                         │
-│  Schema: <SCHEMA_LOCATION>                                    │
-│  Migrations: <MIGRATIONS_LOCATION>                            │
+│  12 live tables (schema.sql + migrations 001–006)            │
+│  24 planned tables (migrations 007–013)                      │
+│                                                              │
+│  Schema: api/db/schema.sql                                   │
+│  Migrations: api/db/migrations/001–006_*.sql                 │
 └─────────────────────────────────────────────────────────────┘
 
 ┌─────────────────────────────────────────────────────────────┐
-│  EXTERNAL INTEGRATIONS  (if applicable)                      │
+│  GAS ADAPTERS  (planned, post-migration)                     │
 │                                                              │
-│  <Describe external system connections here>                  │
+│  Thin Google Apps Script webapps for Google-native ops only: │
+│    - Doc generation    (DocumentApp, DriveApp)               │
+│    - Email sending     (GmailApp)                            │
+│    - Slides generation (SlidesApp, DriveApp)                 │
+│                                                              │
+│  Protocol: Worker POST → GAS doPost (JSON payload)           │
+│  Auth: API key in X-Api-Key header                           │
 └─────────────────────────────────────────────────────────────┘
+
+┌─────────────────────────────────────────────────────────────┐
+│  XERO  (planned, Phase A)                                    │
+│                                                              │
+│  OAuth 2.0 → Worker fetches invoices, items, contacts        │
+│  Daily cron sync + webhook push                              │
+│  Raw data → xero_* D1 tables → processing pipelines          │
+└─────────────────────────────────────────────────────────────┘
 ```
 
 ## Components
 
 | Layer | Technology | Notes |
 |-------|-----------|-------|
-| Frontend | `<FRAMEWORK_OR_APPROACH>` | `<DEPLOYMENT_METHOD>` |
-| API | `<API_TECHNOLOGY>` | `<ROUTING_PATTERN>` |
-| Database | `<DATABASE_TYPE>` | `<KEY_CONVENTIONS>` |
-| Auth | `<AUTH_PROVIDER>` | `<AUTH_MECHANISM>` |
-| Deploy | `<DEPLOY_PLATFORM>` | `<DEPLOY_TRIGGER>` |
+| Frontend | Static HTML + CSS + vanilla JS | Cloudflare Pages. No framework. Per-module JS. |
+| API | Cloudflare Worker | Single `index.js`. Convention-based CRUD via COLLECTIONS config. |
+| Database | Cloudflare D1 (SQLite) | TEXT PKs (prefixed IDs), `meta` JSON column, ISO timestamps. |
+| Auth | Cloudflare Access | OTP email login. Role roster hardcoded in `script.js`. Roles: admin, partner, team, viewer. |
+| CDN/Deploy | Cloudflare Pages | Git-push deploys from `main`. Preview deploys on branches. |
 
-## Key Conventions
+## Key conventions
 
-- `<Describe API routing convention>`
-- `<Describe how new tables/collections are added>`
-- `<Describe build/deploy process>`
-- Worker validates JWT presence; role enforcement is client-side for UI gating only. `<Adjust to match actual auth architecture.>`
+- **One Worker, one D1 binding.** All API routes live in `api/src/index.js`.
+- **COLLECTIONS config drives CRUD.** Adding a table = adding a COLLECTIONS entry + D1 migration.
+- **No build step for frontend.** HTML files are served as-is. CSS per module.
+- **Worker validates JWT presence; role enforcement is client-side for UI gating only.** `script.js` reads CF Access JWT, maps email to role, hides elements via `data-auth-role`.
```

### E../DATA_DICTIONARY.yml
```diff
--- platform-standard/docs/implementation-template/./DATA_DICTIONARY.yml	2026-02-26 09:15:36
+++ docs/coreos/./DATA_DICTIONARY.yml	2026-02-26 08:58:15
@@ -1,31 +1,373 @@
-# Data Dictionary
-# Source of truth: platform manifest (if one exists)
-# For each table: purpose, key columns, owner module, retention.
+# CoreOS Data Dictionary v1.0
+# Source of truth: docs/COREOS_MANIFEST.md → Data Spine
+# For each D1 table: purpose, key columns, owner module, retention.
 
 version: "1.0"
-generated: "<DATE>"
-platform_name: "<PLATFORM_NAME>"
-platform_version: "<PLATFORM_VERSION>"
-primary_domain: "<DOMAIN>"
-primary_data_store: "<DATABASE_TYPE>"
-primary_auth_method: "<AUTH_METHOD>"
-primary_accounting_system: "<ACCOUNTING_SYSTEM>"
+generated: "2026-02-26"
+d1_database: candidlabs-db
+schema_location: api/db/schema.sql
+migrations_location: api/db/migrations/
 
-# Database-specific metadata
-database_name: "<DATABASE_NAME>"
-schema_location: "<PATH_TO_SCHEMA_FILE>"
-migrations_location: "<PATH_TO_MIGRATIONS_DIRECTORY>"
-
 tables:
 
-  # ── Example Table (remove and replace with real tables) ──
+  # ── Live (schema.sql + migrations 001–006) ──
 
-  - table: examples
-    status: live             # live | planned | deprecated
-    module: Example Module
-    purpose: Placeholder table demonstrating the required data dictionary format.
+  - table: companies
+    status: live
+    module: CRM
+    purpose: Customer and supplier companies (distributors, venues, partners).
+    primary_key: id (TEXT, prefix CMP)
+    key_columns: [name, type, parent_id, market, channel, status, meta]
+    migration: schema.sql + 002
+    retention: Indefinite. Soft-delete via status field.
+
+  - table: contacts
+    status: live
+    module: CRM
+    purpose: Individual people linked to companies.
+    primary_key: id (TEXT, prefix CON)
+    key_columns: [first_name, last_name, name, email, phone, role, company_id, meta]
+    migration: schema.sql + 003
+    retention: Indefinite.
+
+  - table: deals
+    status: live
+    module: CRM
+    purpose: Sales opportunities through pipeline stages.
+    primary_key: id (TEXT, prefix DL)
+    key_columns: [title, company_id, contact_id, value, stage, channel_type, meta]
+    migration: schema.sql + 002
+    retention: Indefinite.
+
+  - table: comments
+    status: live
+    module: Shared
+    purpose: Polymorphic comments on contacts, companies, or deals.
     primary_key: id (TEXT)
-    key_columns: [name, status, created_at, updated_at, meta]
-    migration: "001"
-    wave: null               # null for initial tables, or wave/phase identifier
-    retention: indefinite    # indefinite | <N> days | append-only | overwrite
+    key_columns: [record_type, record_id, author_email, author_name, body]
+    migration: schema.sql
+    retention: Indefinite.
+
+  - table: projects
+    status: live
+    module: Projects
+    purpose: Internal projects and initiatives.
+    primary_key: id (TEXT, prefix PRJ)
+    key_columns: [name, owner, status, project_type, owner_team, visibility_mode, meta]
+    migration: schema.sql
+    retention: Indefinite.
+
+  - table: tasks
+    status: live
+    module: Projects
+    purpose: Tasks within projects.
+    primary_key: id (TEXT, prefix TSK)
+    key_columns: [project_id, title, assignee, status, priority, due_date, meta]
+    migration: schema.sql
+    retention: Indefinite. Cascade-deleted with parent project.
+
+  - table: rnd_projects
+    status: live
+    module: R&D
+    purpose: R&D product development pipeline items.
+    primary_key: id (TEXT, prefix RND)
+    key_columns: [name, stage, owner, product_category, priority, gate_outcome, confidence_level, current_score, gate_rationale, meta]
+    migration: 004 + 005 + 006
+    retention: Indefinite.
+
+  - table: rnd_documents
+    status: live
+    module: R&D
+    purpose: Structured documents (briefs, specs, reports) linked to R&D projects.
+    primary_key: id (TEXT, prefix DOC)
+    key_columns: [project_id, title, doc_type, status, content, meta]
+    migration: "004"
+    retention: Indefinite.
+
+  - table: rnd_trial_entries
+    status: live
+    module: R&D
+    purpose: Trial/experiment log entries for R&D projects.
+    primary_key: id (TEXT, prefix TRL)
+    key_columns: [project_id, trial_date, batch_id, tasting_score, tasting_notes, meta]
+    migration: "004"
+    retention: Indefinite.
+
+  - table: rnd_stage_history
+    status: live
+    module: R&D
+    purpose: Audit trail of R&D project stage transitions.
+    primary_key: id (TEXT, prefix STH)
+    key_columns: [project_id, from_stage, to_stage, changed_by, changed_at, meta]
+    migration: "005"
+    retention: Indefinite. Append-only audit log.
+
+  - table: rnd_approvals
+    status: live
+    module: R&D
+    purpose: Gate approval decisions for R&D projects.
+    primary_key: id (TEXT, prefix APR)
+    key_columns: [project_id, gate_stage, decision, decided_by, decided_at, meta]
+    migration: "005"
+    retention: Indefinite. Append-only.
+
+  - table: skus
+    status: live
+    module: R&D
+    purpose: SKU catalog (product codes, names, specs).
+    primary_key: id (TEXT, prefix SKU)
+    key_columns: [code, name, category, status, meta]
+    migration: "004"
+    retention: Indefinite.
+
+  # ── Planned: Xero Sync (Phase A, migration 007) ──
+
+  - table: xero_tokens
+    status: planned
+    module: Xero
+    purpose: OAuth 2.0 token storage (single row per org connection).
+    primary_key: id (TEXT, default 'default')
+    key_columns: [tenant_id, access_token, refresh_token, expires_at, scopes]
+    migration: "007"
+    wave: Phase A
+    retention: Overwritten on each token refresh. One active row.
+
+  - table: xero_invoices
+    status: planned
+    module: Xero
+    purpose: Raw invoice headers (both ACCREC sales and ACCPAY purchase).
+    primary_key: id (TEXT)
+    key_columns: [xero_invoice_id, invoice_number, type, status, contact_name, invoice_date, currency_code, total, amount_due]
+    migration: "007"
+    wave: Phase A
+    retention: Indefinite. Upserted on sync.
+
+  - table: xero_line_items
+    status: planned
+    module: Xero
+    purpose: Invoice line items (one per line per invoice).
+    primary_key: id (TEXT)
+    key_columns: [xero_invoice_id, item_code, description, quantity, unit_amount, line_amount]
+    migration: "007"
+    wave: Phase A
+    retention: Cascade with parent invoice.
+
+  - table: xero_contacts
+    status: planned
+    module: Xero
+    purpose: Xero customer and supplier contacts.
+    primary_key: id (TEXT)
+    key_columns: [xero_contact_id, name, contact_type, is_customer, is_supplier]
+    migration: "007"
+    wave: Phase A
+    retention: Indefinite. Upserted on sync.
+
+  - table: xero_items
+    status: planned
+    module: Xero
+    purpose: Xero product catalog with standard costs.
+    primary_key: id (TEXT)
+    key_columns: [xero_item_id, code, name, purchase_cost, sales_price]
+    migration: "007"
+    wave: Phase A
+    retention: Indefinite. Upserted on sync.
+
+  - table: xero_sync_log
+    status: planned
+    module: Xero
+    purpose: Audit trail for every sync operation.
+    primary_key: id (TEXT)
+    key_columns: [sync_type, started_at, finished_at, records_fetched, records_upserted, status, error]
+    migration: "007"
+    wave: Phase A
+    retention: 90 days recommended. Prunable.
+
+  # ── Planned: Wave 1 (KAA, migrations 008–009) ──
+
+  - table: agreements
+    status: planned
+    module: Agreements
+    purpose: Key account agreements (canonical rows from Google Form intake).
+    primary_key: id (TEXT)
+    key_columns: [agreement_key, account_name, agreement_date, status, meta]
+    migration: "008"
+    wave: 1
+    retention: Indefinite.
+
+  - table: jobs
+    status: planned
+    module: Infrastructure
+    purpose: Async job queue (adapter calls, pipeline runs).
+    primary_key: id (TEXT)
+    key_columns: [job_type, status, payload, result, created_at, finished_at]
+    migration: "009"
+    wave: 1
+    retention: 30 days recommended. Prunable.
+
+  - table: job_logs
+    status: planned
+    module: Infrastructure
+    purpose: Per-step log entries within a job.
+    primary_key: id (TEXT)
+    key_columns: [job_id, step, status, message, created_at]
+    migration: "009"
+    wave: 1
+    retention: 30 days recommended. Prunable.
+
+  # ── Planned: Wave 2 (Sales, migration 010) ──
+
+  - table: revenue_transactions
+    status: planned
+    module: Sales
+    purpose: Revenue fact table (from Xero receivables + account mapping).
+    primary_key: id (TEXT)
+    key_columns: [transaction_id, invoice_date, invoice_number, venue_name, account_id, sku_code, revenue_idr, market, channel]
+    migration: "010"
+    wave: 2
+    retention: Indefinite.
+
+  - table: account_mapping
+    status: planned
+    module: Sales
+    purpose: Venue hierarchy mapping (raw Xero name → internal venue, market, channel).
+    primary_key: id (TEXT)
+    key_columns: [raw_value, internal_venue_name, account_id, group_name, market, city, channel]
+    migration: "010"
+    wave: 2
+    retention: Indefinite.
+
+  - table: account_status
+    status: planned
+    module: Sales
+    purpose: Point-in-time account health snapshots (active/dormant/churned).
+    primary_key: id (TEXT)
+    key_columns: [snapshot_date, venue_name, account_id, days_since_last, status]
+    migration: "010"
+    wave: 2
+    retention: Indefinite. Append-only snapshots.
+
+  - table: deck_metrics
+    status: planned
+    module: Sales
+    purpose: Monthly aggregated metrics for partner deck generation.
+    primary_key: id (TEXT)
+    key_columns: [month_key, total_revenue_idr, gross_margin_pct, dq_flag, headline]
+    migration: "010"
+    wave: 2
+    retention: Indefinite.
+
+  # ── Planned: Wave 3 (Production, migration 011) ──
+
+  - table: production_runs
+    status: planned
+    module: Production
+    purpose: KMI production batch records.
+    primary_key: id (TEXT)
+    key_columns: [batch_id, production_date, sku_code, cases_produced, cans_produced]
+    migration: "011"
+    wave: 3
+    retention: Indefinite.
+
+  - table: bom_components
+    status: planned
+    module: Production
+    purpose: Bill of materials — component quantities per SKU.
+    primary_key: id (TEXT)
+    key_columns: [sku_code, component_code, quantity_per_can, uom]
+    migration: "011"
+    wave: 3
+    retention: Indefinite. Updated on BOM changes.
+
+  - table: component_costs
+    status: planned
+    module: Production
+    purpose: Historical component pricing by month.
+    primary_key: id (TEXT)
+    key_columns: [month_key, component_code, cumulative_avg_idr, source]
+    migration: "011"
+    wave: 3
+    retention: Indefinite.
+
+  - table: sku_costing
+    status: planned
+    module: Production
+    purpose: Per-SKU cost output from 3-tier costing waterfall.
+    primary_key: id (TEXT)
+    key_columns: [sku_code, raw_cogs_idr, cost_method, effective_date]
+    migration: "011"
+    wave: 3
+    retention: Indefinite.
+
+  - table: batch_cogs
+    status: planned
+    module: Production
+    purpose: COGS breakdown per production batch.
+    primary_key: id (TEXT)
+    key_columns: [batch_id, sku_code, cans_produced, total_cogs_per_can, can_cost, filling_cost]
+    migration: "011"
+    wave: 3
+    retention: Indefinite.
+
+  - table: payables
+    status: planned
+    module: Production
+    purpose: Cleaned purchase invoice line items (from Xero payables).
+    primary_key: id (TEXT)
+    key_columns: [invoice_date, supplier_name, item_code, quantity, gross_idr, cost_category]
+    migration: "011"
+    wave: 3
+    retention: Indefinite.
+
+  - table: arap_snapshots
+    status: planned
+    module: Production
+    purpose: Aged receivables/payables snapshots by contact.
+    primary_key: id (TEXT)
+    key_columns: [snapshot_date, metric_type, contact_name, bucket_current, bucket_1mo, total]
+    migration: "011"
+    wave: 3
+    retention: Indefinite. Append-only snapshots.
+
+  # ── Planned: Wave 4 (Loans, migration 012) ──
+
+  - table: lenders
+    status: planned
+    module: Loans
+    purpose: Lender profiles (agreement terms, novation details).
+    primary_key: id (TEXT)
+    key_columns: [name, agreement_date, original_loan_sgd, novated_principal_sgd, template_doc_id]
+    migration: "012"
+    wave: 4
+    retention: Indefinite.
+
+  - table: loan_transactions
+    status: planned
+    module: Loans
+    purpose: Raw loan transaction log (disbursements, repayments).
+    primary_key: id (TEXT)
+    key_columns: [lender_id, transaction_date, type, amount]
+    migration: "012"
+    wave: 4
+    retention: Indefinite. Append-only audit log.
+
+  - table: loan_ledger
+    status: planned
+    module: Loans
+    purpose: Computed ledger entries (opening/closing balance, interest accrued).
+    primary_key: id (TEXT)
+    key_columns: [lender_id, entry_date, opening_balance, principal_payment, interest_accrued, closing_balance]
+    migration: "012"
+    wave: 4
+    retention: Indefinite.
+
+  # ── Planned: Wave 5 (Sales Tool, migration 013) ──
+
+  - table: pricing
+    status: planned
+    module: Sales Tool
+    purpose: Pricing tiers by location, channel, and tier.
+    primary_key: id (TEXT)
+    key_columns: [location, channel, tier, soda, imperial, ginger]
+    migration: "013"
+    wave: 5
+    retention: Indefinite.
```

### E../INTEGRATIONS.yml
```diff
--- platform-standard/docs/implementation-template/./INTEGRATIONS.yml	2026-02-26 09:15:41
+++ docs/coreos/./INTEGRATIONS.yml	2026-02-26 08:58:17
@@ -1,30 +1,136 @@
-# Integration Registry
-# Source of truth: platform manifest (if one exists)
+# CoreOS Integration Registry v1.0
+# Source of truth: docs/COREOS_MANIFEST.md → Integration Registry
 
 version: "1.0"
-generated: "<DATE>"
-platform_name: "<PLATFORM_NAME>"
-platform_version: "<PLATFORM_VERSION>"
-primary_domain: "<DOMAIN>"
-primary_data_store: "<DATABASE_TYPE>"
-primary_auth_method: "<AUTH_METHOD>"
-primary_accounting_system: "<ACCOUNTING_SYSTEM>"
+generated: "2026-02-26"
 
 integrations:
 
-  # ── Example Integration (remove and replace with real integrations) ──
+  - name: Cloudflare Access
+    type: auth
+    status: live
+    auth_method: OTP email (CF Access JWT)
+    scopes: N/A
+    retry: N/A (client-side)
+    backoff: N/A
+    logging: Client-side (script.js reads JWT claims)
+    secrets_location: Cloudflare dashboard → Access → Application
+    notes: |
+      Role roster hardcoded in script.js. Roles: admin, partner, team, viewer.
+      JWT header: Cf-Access-Jwt-Assertion.
 
-  - name: Example Auth Provider
-    type: auth               # auth | database | hosting | external_api | adapter
-    status: live             # live | planned | deprecated
-    auth_method: "<AUTH_MECHANISM>"
-    scopes: "N/A"
-    data_direction: inbound  # inbound | outbound | bidirectional
-    sync_frequency: "N/A"    # real-time | scheduled | on-demand | N/A
-    retry: "N/A"
-    backoff: "N/A"
-    logging: "<WHERE_OPERATIONS_ARE_LOGGED>"
-    secrets_location: "<WHERE_SECRETS_ARE_STORED>"
+  - name: Cloudflare D1
+    type: database
+    status: live
+    auth_method: Worker binding (env.DB)
+    scopes: N/A
+    retry: N/A (local binding, no network)
+    backoff: N/A
+    logging: Worker console.error on API errors
+    secrets_location: wrangler.toml → d1_databases binding
     notes: |
-      Replace this with a real integration description.
-      Document auth method, scopes, retry policy, and logging strategy.
+      12 live tables. Single D1 database.
+      Schema: api/db/schema.sql. Migrations: api/db/migrations/.
+
+  - name: Cloudflare Pages
+    type: hosting
+    status: live
+    auth_method: Git push (GitHub → CF Pages)
+    scopes: N/A
+    retry: Automatic redeploy on push
+    backoff: N/A
+    logging: Cloudflare Pages dashboard → Deployments
+    secrets_location: Cloudflare dashboard → Pages → Settings
+    notes: |
+      Static site served from repo root. Worker served from api/.
+      Preview deploys on non-main branches.
+
+  - name: Xero Accounting
+    type: external_api
+    status: planned
+    wave: Phase A
+    auth_method: OAuth 2.0 Authorization Code flow
+    scopes:
+      - offline_access
+      - accounting.transactions.read
+      - accounting.contacts.read
+      - accounting.reports.read
+      - accounting.settings.read
+    retry: |
+      Token refresh: retry once with old refresh_token (30-min grace).
+      API calls: retry on 429 (rate limit) with exponential backoff.
+    backoff: |
+      Rate limit: 60 calls/min, 5000 calls/day per org.
+      On 429: wait Retry-After header seconds, then retry.
+      Max 3 retries per call.
+    logging: xero_sync_log D1 table (per-sync audit trail)
+    secrets_location: |
+      D1 table xero_tokens (access_token, refresh_token).
+      Worker env vars: XERO_CLIENT_ID, XERO_CLIENT_SECRET (Cloudflare dashboard → Workers → Settings → Variables).
+    notes: |
+      No SDK — raw fetch() client.
+      Webhook HMAC verification via Web Crypto API.
+      Daily cron: 0 23 * * * (06:00 WIB).
+      Granular scopes required for apps created after 2026-03-02.
+
+  # ── GAS Adapters (planned) ──
+
+  - name: KAA Doc Generator
+    type: gas_adapter
+    status: planned
+    wave: 1
+    auth_method: API key in X-Api-Key header
+    scopes: N/A (GAS runs as deploying user)
+    retry: Worker retries once on 5xx. Logs failure to jobs table.
+    backoff: 5s fixed delay before retry.
+    logging: jobs + job_logs D1 tables
+    secrets_location: Worker env var GAS_API_KEY + GAS webapp URL
+    google_apis: [DocumentApp, DriveApp]
+    notes: |
+      Protocol: Worker POST → GAS doPost (JSON payload with templateDocId, placeholders).
+      Response: { docId, docUrl }.
+
+  - name: KAA Email Sender
+    type: gas_adapter
+    status: planned
+    wave: 1
+    auth_method: API key in X-Api-Key header
+    scopes: N/A
+    retry: Worker retries once on 5xx.
+    backoff: 5s fixed delay.
+    logging: jobs + job_logs D1 tables
+    secrets_location: Worker env var GAS_API_KEY + GAS webapp URL
+    google_apis: [GmailApp]
+    notes: |
+      Protocol: Worker POST → GAS doPost (JSON with to, cc, subject, htmlBody).
+      Response: { sent, messageId }.
+
+  - name: Slides Deck Generator
+    type: gas_adapter
+    status: planned
+    wave: 2
+    auth_method: API key in X-Api-Key header
+    scopes: N/A
+    retry: Worker retries once on 5xx.
+    backoff: 5s fixed delay.
+    logging: jobs + job_logs D1 tables
+    secrets_location: Worker env var GAS_API_KEY + GAS webapp URL
+    google_apis: [SlidesApp, DriveApp]
+    notes: |
+      Protocol: Worker POST → GAS doPost (JSON with templatePresentationId, placeholders — 22 fields).
+      Response: { presentationId, presentationUrl }.
+
+  - name: Loan Statement Generator
+    type: gas_adapter
+    status: planned
+    wave: 4
+    auth_method: API key in X-Api-Key header
+    scopes: N/A
+    retry: Worker retries once on 5xx.
+    backoff: 5s fixed delay.
+    logging: jobs + job_logs D1 tables
+    secrets_location: Worker env var GAS_API_KEY + GAS webapp URL
+    google_apis: [DocumentApp, DriveApp, UrlFetchApp]
+    notes: |
+      Protocol: Worker POST → GAS doPost (JSON with templateDocId, placeholders, exportPdf flag).
+      Response: { docId, docUrl, pdfUrl }.
```

### E../MODULES.yml
```diff
--- platform-standard/docs/implementation-template/./MODULES.yml	2026-02-26 09:15:31
+++ docs/coreos/./MODULES.yml	2026-02-26 08:58:49
@@ -1,35 +1,226 @@
-# Module Registry
-# Source of truth: platform manifest (if one exists)
+# CoreOS Module Registry v1.0
+# Source of truth: docs/COREOS_MANIFEST.md → Active Modules
 # Update this file when adding or modifying modules.
 
 version: "1.0"
-generated: "<DATE>"
-platform_name: "<PLATFORM_NAME>"
-platform_version: "<PLATFORM_VERSION>"
-primary_domain: "<DOMAIN>"
-primary_data_store: "<DATABASE_TYPE>"
-primary_auth_method: "<AUTH_METHOD>"
-primary_accounting_system: "<ACCOUNTING_SYSTEM>"
+generated: "2026-02-26"
 
-# ui_type allowed values:
-#   static  — No backend data store. Client-side rendering only. No API calls.
-#   dynamic — Backed by a data store. CRUD operations via API. Server-rendered or client-fetched.
-#   hybrid  — Mix of static content and dynamic data. Some sections are API-driven, others are not.
-
 modules:
 
-  # ── Example Module (remove and replace with real modules) ──
+  # ── Live ──
 
-  - name: Example Module
-    path: /example/
-    status: live            # live | wip | planned | deprecated
-    ui_type: dynamic        # static | dynamic | hybrid
-    auth_role: null          # null = all authenticated users, or a specific role name
-    d1_tables: [examples]
+  - name: CRM
+    path: /crm/
+    status: live
+    ui_type: dynamic
+    auth_role: null  # all authenticated users
+    d1_tables: [companies, contacts, deals, comments]
     api_routes:
-      - GET/POST /api/examples
-      - GET/PUT/DELETE /api/examples/{id}
-      - POST /api/examples/import
+      - GET/POST /api/contacts
+      - GET/PUT/DELETE /api/contacts/{id}
+      - POST /api/contacts/import
+      - GET/POST /api/companies
+      - GET/PUT/DELETE /api/companies/{id}
+      - POST /api/companies/import
+      - GET/POST /api/deals
+      - GET/PUT/DELETE /api/deals/{id}
+      - POST /api/deals/import
+      - GET/POST /api/comments
+      - DELETE /api/comments/{id}
+      - GET /api/overview/crm
     owner: platform-team
-    wave: null               # null for initial modules, or wave/phase identifier
-    notes: Replace this with a real module description.
+    notes: Contact, company, and deal pipeline management.
+
+  - name: Prospecting
+    path: /prospecting/
+    status: wip
+    ui_type: static
+    auth_role: null
+    d1_tables: []
+    api_routes: []
+    owner: platform-team
+    notes: Client-side filtering on static seed data. No D1 backend yet.
+
+  - name: Projects
+    path: /projects/
+    status: live
+    ui_type: dynamic
+    auth_role: partner
+    d1_tables: [projects, tasks]
+    api_routes:
+      - GET/POST /api/projects
+      - GET/PUT/DELETE /api/projects/{id}
+      - POST /api/projects/import
+      - GET/POST /api/tasks
+      - GET/PUT/DELETE /api/tasks/{id}
+      - POST /api/tasks/import
+      - GET /api/overview/projects
+    owner: platform-team
+    notes: null
+
+  - name: R&D
+    path: /rnd/
+    status: live
+    ui_type: dynamic
+    auth_role: partner
+    d1_tables: [rnd_projects, rnd_documents, rnd_trial_entries, rnd_stage_history, rnd_approvals, skus]
+    api_routes:
+      - GET/POST /api/rnd_projects
+      - GET/PUT/DELETE /api/rnd_projects/{id}
+      - POST /api/rnd_projects/import
+      - GET/POST /api/rnd_documents
+      - GET/PUT/DELETE /api/rnd_documents/{id}
+      - POST /api/rnd_documents/import
+      - GET/POST /api/rnd_trial_entries
+      - GET/PUT/DELETE /api/rnd_trial_entries/{id}
+      - POST /api/rnd_trial_entries/import
+      - GET/POST /api/rnd_stage_history
+      - POST /api/rnd_stage_history/import
+      - GET/POST /api/rnd_approvals
+      - POST /api/rnd_approvals/import
+      - GET/POST /api/skus
+      - GET/PUT/DELETE /api/skus/{id}
+      - POST /api/skus/import
+    owner: platform-team
+    notes: Product development pipeline, documents, trials, SKU catalog.
+
+  - name: Reports
+    path: /reports.html
+    status: live
+    ui_type: static
+    auth_role: null
+    d1_tables: []
+    api_routes: []
+    owner: platform-team
+    notes: Reports and analytics page.
+
+  - name: Budget
+    path: /budget.html
+    status: live
+    ui_type: static
+    auth_role: null
+    d1_tables: []
+    api_routes: []
+    owner: platform-team
+    notes: Client-only budget tool. No API, no D1.
+
+  - name: Dashboard
+    path: /dashboard.html
+    status: live
+    ui_type: static
+    auth_role: null
+    d1_tables: []
+    api_routes: []
+    owner: platform-team
+    notes: Management overview with embedded analytics.
+
+  - name: Admin
+    path: /admin/users.html
+    status: live
+    ui_type: static
+    auth_role: admin
+    d1_tables: []
+    api_routes: []
+    owner: platform-team
+    notes: User management. Role roster hardcoded in script.js.
+
+  - name: Tools
+    path: /tools.html
+    status: live
+    ui_type: static
+    auth_role: null
+    d1_tables: []
+    api_routes: []
+    owner: platform-team
+    notes: External links — KAA Form, Quote Generator, Submit Expenses.
+
+  # ── Planned ──
+
+  - name: Xero Sync
+    path: /admin/xero.html
+    status: planned
+    ui_type: dynamic
+    auth_role: admin
+    d1_tables: [xero_tokens, xero_invoices, xero_line_items, xero_contacts, xero_items, xero_sync_log]
+    api_routes:
+      - POST /api/xero/connect
+      - GET /api/xero/callback
+      - GET /api/xero/status
+      - POST /api/xero/sync/invoices
+      - POST /api/xero/sync/items
+      - POST /api/xero/sync/contacts
+      - POST /api/xero/sync/all
+      - POST /api/xero/webhook
+    owner: platform-team
+    wave: Phase A
+    notes: OAuth connect, incremental sync, webhook handler, daily cron.
+
+  - name: Agreements (KAA)
+    path: /agreements/
+    status: planned
+    ui_type: dynamic
+    auth_role: null  # TODO confirm role requirement
+    d1_tables: [agreements, jobs, job_logs]
+    api_routes: []  # TODO define during Wave 1 implementation
+    owner: platform-team
+    wave: 1
+    notes: Key Account Agreement management. Migrated from GAS.
+
+  - name: Sales Pipeline
+    path: /sales/
+    status: planned
+    ui_type: dynamic
+    auth_role: null  # TODO confirm role requirement
+    d1_tables: [revenue_transactions, account_mapping, account_status, deck_metrics]
+    api_routes:
+      - POST /api/sales/import-receivables
+      - POST /api/sales/refresh-margins
+      - POST /api/sales/refresh-deck-metrics
+      - POST /api/sales/rebuild-account-status
+      - POST /api/sales/sync-mapping
+    owner: platform-team
+    wave: 2
+    notes: Revenue pipeline, margin calculation, account health.
+
+  - name: Production
+    path: /production/
+    status: planned
+    ui_type: dynamic
+    auth_role: null  # TODO confirm role requirement
+    d1_tables: [production_runs, bom_components, component_costs, sku_costing, batch_cogs, payables, arap_snapshots]
+    api_routes:
+      - POST /api/production/import-payables
+      - POST /api/production/import-kmi-packaging
+      - POST /api/production/run-costing-engine
+      - POST /api/production/build-batch-cogs
+      - POST /api/production/snapshot-arap
+      - POST /api/production/run-all
+    owner: platform-team
+    wave: 3
+    notes: Production costing, BOM, COGS, payables, ARAP.
+
+  - name: Loans
+    path: /loans/
+    status: planned
+    ui_type: dynamic
+    auth_role: null  # TODO confirm role requirement
+    d1_tables: [lenders, loan_transactions, loan_ledger]
+    api_routes:
+      - POST /api/loans/transactions
+      - POST /api/loans/bulk-apply
+      - POST /api/loans/accrue-interest
+      - POST /api/loans/rebuild-ledger
+    owner: platform-team
+    wave: 4
+    notes: Loan ledger, interest accrual (cron), statement generation.
+
+  - name: Sales Tool
+    path: /sales-tool/
+    status: planned
+    ui_type: dynamic
+    auth_role: null
+    d1_tables: [pricing]
+    api_routes: []  # TODO define during Wave 5 implementation
+    owner: platform-team
+    wave: 5
+    notes: Pricing CRUD, PDF generation.
```

### E../README.md
```diff
--- platform-standard/docs/implementation-template/./README.md	2026-02-26 09:15:09
+++ docs/coreos/./README.md	2026-02-26 08:58:24
@@ -1,42 +1,42 @@
-# Platform Documentation Pack
+# CoreOS Documentation Standard Pack v1.0
 
-> Canonical, machine-readable documentation for this platform.
+> Canonical, machine-readable documentation for Candid CoreOS.
 
 ## What this pack is
 
-A set of structured files describing the platform — its architecture, modules, data, integrations, roadmap, quality gates, runbooks, and architectural decisions.
+A set of structured files describing the Candid CoreOS platform — its architecture, modules, data, integrations, roadmap, quality gates, runbooks, and architectural decisions.
 
 Every file in this pack is **append-friendly**. Data grows by adding new entries, never by rewriting existing ones.
 
-This pack is governed by the Platform Documentation Standard. Standard rules override implementation-specific rules in case of conflict.
-
 ## File index
 
 | File | Purpose | Format |
 |------|---------|--------|
-| `ARCHITECTURE.md` | System diagram and component summary | Markdown + ASCII |
-| `MODULES.yml` | Module registry (name, path, status, type, tables, routes) | YAML |
-| `DATA_DICTIONARY.yml` | Table definitions (columns, purpose, retention) | YAML |
+| `ARCHITECTURE.md` | System diagram + component summary | Markdown + ASCII |
+| `MODULES.yml` | Module registry (name, path, status, tables, routes) | YAML |
+| `DATA_DICTIONARY.yml` | D1 table definitions (columns, purpose, owner) | YAML |
 | `INTEGRATIONS.yml` | External system connections (auth, scopes, retry) | YAML |
 | `ROADMAP.yml` | Ordered milestones with dependencies | YAML |
-| `RUNBOOKS/RUNBOOK_DEPLOY.md` | Deploy procedure | Markdown |
-| `DECISIONS/ADR-0001-*.md` | Architectural decision records | ADR format |
+| `QUALITY_GATES.md` | Pre-deploy checklist | Markdown |
+| `RUNBOOKS/RUNBOOK_DEPLOY.md` | Deploy process + rollback | Markdown |
+| `RUNBOOKS/RUNBOOK_XERO_CONNECT.md` | Xero OAuth setup end-to-end | Markdown |
+| `DECISIONS/ADR-0001-coreos-doc-pack.md` | Why this pack exists | ADR format |
 
 ## How to update
 
-1. **Adding a module** — Add entry to `MODULES.yml`. If the module has tables, add them to `DATA_DICTIONARY.yml`.
-2. **Adding a table** — Add entry to `DATA_DICTIONARY.yml`. Include retention policy.
-3. **Adding an integration** — Add entry to `INTEGRATIONS.yml`. Document auth, retry, and logging.
-4. **Recording a decision** — Create `DECISIONS/ADR-NNNN-slug.md` using the ADR template.
-5. **Updating roadmap** — Append to `ROADMAP.yml` milestones. Never delete completed milestones; mark them `status: done`.
-6. **Adding a runbook** — Create `RUNBOOKS/RUNBOOK_<NAME>.md`.
+1. **Adding a module** — add entry to `MODULES.yml` and `DATA_DICTIONARY.yml`, update `../COREOS_MANIFEST.md` data spine.
+2. **Adding a table** — add entry to `DATA_DICTIONARY.yml`, update `../COREOS_MANIFEST.md` data spine.
+3. **Adding an integration** — add entry to `INTEGRATIONS.yml`, update `../COREOS_MANIFEST.md` integration registry.
+4. **Recording a decision** — create `DECISIONS/ADR-NNNN-slug.md`.
+5. **Updating roadmap** — append to `ROADMAP.yml` milestones. Never delete completed milestones; mark them `status: done`.
 
 ## Rules
 
-- **No deletions without ADR.** Removing any planned scope, table, module, or integration requires a new ADR in `DECISIONS/` explaining why.
-- **YAML must be valid.** All `.yml` files must parse without errors. Missing metadata header fields are validation failures.
-- **Append-friendly.** Data grows by adding entries. Existing entries are updated in place, never removed.
+- **No deletions without ADR.** Removing any planned scope, table, module, or integration from this pack requires a new ADR in `DECISIONS/` explaining why.
+- **Manifest is upstream.** `../COREOS_MANIFEST.md` is the single source of truth. This pack elaborates on it but must not contradict it.
+- **YAML must be valid.** All `.yml` files must parse without errors. Agents should validate before committing.
 
 ## Drift Prevention
 
-If a table, module, or integration is changed in code but not reflected in this pack, the change is considered incomplete. Documentation is part of the system.
+If a table, module, or integration is changed in code but not reflected in this pack,
+the change is considered incomplete. Documentation is part of the system.
```

### E../ROADMAP.yml
```diff
--- platform-standard/docs/implementation-template/./ROADMAP.yml	2026-02-26 09:15:45
+++ docs/coreos/./ROADMAP.yml	2026-02-26 08:58:20
@@ -1,26 +1,166 @@
-# Roadmap
-# Ordered milestones with dependencies.
+# CoreOS Roadmap v1.0
+# Ordered milestones: quick wins first, then dependency-ordered waves.
+# Top priority: make Xero data readable for non-finance users.
 
 version: "1.0"
-generated: "<DATE>"
-platform_name: "<PLATFORM_NAME>"
-platform_version: "<PLATFORM_VERSION>"
-primary_domain: "<DOMAIN>"
-primary_data_store: "<DATABASE_TYPE>"
-primary_auth_method: "<AUTH_METHOD>"
-primary_accounting_system: "<ACCOUNTING_SYSTEM>"
+generated: "2026-02-26"
 
 milestones:
 
-  # ── Example Milestone (remove and replace with real milestones) ──
+  # ── Quick Wins (no migration, no infra) ──
 
-  - id: M-1
-    name: Example milestone
-    status: pending          # pending | in-progress | done | cancelled
-    priority: medium         # quick-win | high | medium | low
+  - id: QW-1
+    name: Prospecting → D1 backend
+    status: pending
+    priority: quick-win
+    description: Wire prospecting module to D1 (add COLLECTIONS entry, create migration). Currently client-side only.
+    dependencies: []
+    estimated_tables: 1
+
+  - id: QW-2
+    name: Admin role roster → D1
+    status: pending
+    priority: quick-win
+    description: Move hardcoded user/role roster from script.js into a D1 table with admin UI for management.
+    dependencies: []
+    estimated_tables: 1
+
+  # ── Phase A: Xero Sync (TOP PRIORITY) ──
+  # Goal: make Xero data readable for non-finance users.
+
+  - id: PA-1
+    name: Xero OAuth connect
+    status: pending
+    priority: high
     description: |
-      Replace this with a real milestone description.
-      Include: what tables, modules, or integrations are involved.
-    dependencies: []          # list of milestone IDs that must complete first
-    migration: null           # migration file name, or null
-    notes: null
+      Build OAuth 2.0 flow in Worker: /api/xero/connect, /api/xero/callback, /api/xero/status.
+      Store tokens in xero_tokens table. Admin UI at /admin/xero.html.
+    dependencies: []
+    migration: 007_xero.sql
+    notes: |
+      Accounting hygiene issue: current Xero data has inconsistent naming, missing item codes,
+      and mixed currencies. The sync layer stores raw data as-is; a normalisation layer will be
+      needed before data is surfaced to non-finance users. See PA-4.
+
+  - id: PA-2
+    name: Xero invoice + item sync
+    status: pending
+    priority: high
+    description: |
+      Pull invoices (ACCREC + ACCPAY), line items, items, contacts into xero_* tables.
+      Incremental sync using If-Modified-Since header.
+    dependencies: [PA-1]
+
+  - id: PA-3
+    name: Xero daily cron + webhooks
+    status: pending
+    priority: high
+    description: |
+      Daily cron trigger (06:00 WIB) for incremental sync.
+      Webhook endpoint for near-real-time invoice/contact updates.
+      HMAC-SHA256 verification.
+    dependencies: [PA-2]
+
+  - id: PA-4
+    name: Xero data normalisation layer
+    status: pending
+    priority: high
+    description: |
+      Transform raw xero_invoices + xero_line_items into human-readable views.
+      Handle: inconsistent contact names, missing item codes, IDR-only assumption,
+      VOIDED/DRAFT filtering, contact header row parsing.
+      Goal: non-finance users can browse revenue and payables in the platform UI.
+    dependencies: [PA-2]
+    notes: This is the critical enabler for "reporting is a product".
+
+  # ── Wave 1: KAA + Foundation ──
+
+  - id: W1-1
+    name: Agreements table + CRUD
+    status: pending
+    priority: medium
+    description: D1 migration 008, COLLECTIONS entry, /agreements/ UI module.
+    dependencies: []
+    migration: 008_agreements.sql
+
+  - id: W1-2
+    name: Jobs infrastructure
+    status: pending
+    priority: medium
+    description: D1 migration 009 (jobs + job_logs tables). Async job runner for adapter calls.
+    dependencies: []
+    migration: 009_jobs.sql
+
+  - id: W1-3
+    name: GAS adapter pattern (doc gen + email)
+    status: pending
+    priority: medium
+    description: |
+      Deploy KAA doc generator and email sender as GAS webapps.
+      API key auth. Worker → GAS doPost protocol.
+      Proves the adapter pattern for all subsequent waves.
+    dependencies: [W1-2]
+
+  # ── Wave 2: Sales Data Pipeline ──
+
+  - id: W2-1
+    name: Sales tables + import endpoints
+    status: pending
+    priority: medium
+    description: |
+      D1 migration 010 (revenue_transactions, account_mapping, account_status, deck_metrics).
+      Import endpoints for receivables, margins, deck metrics, account status, mapping sync.
+    dependencies: [PA-2]
+    migration: 010_sales.sql
+
+  - id: W2-2
+    name: Slides deck adapter
+    status: pending
+    priority: medium
+    description: GAS webapp for Slides template fill. 22 placeholders.
+    dependencies: [W2-1, W1-3]
+
+  # ── Wave 3: Production Costing ──
+
+  - id: W3-1
+    name: Production tables + pipeline endpoints
+    status: pending
+    priority: medium
+    description: |
+      D1 migration 011 (7 tables). Import endpoints for payables, KMI packaging,
+      costing engine, batch COGS, ARAP snapshots.
+    dependencies: [W2-1]
+    migration: 011_production.sql
+
+  # ── Wave 4: Loan Tracker ──
+
+  - id: W4-1
+    name: Loan tables + transaction endpoints
+    status: pending
+    priority: medium
+    description: |
+      D1 migration 012 (lenders, loan_transactions, loan_ledger).
+      Transaction form, interest accrual cron, statement gen adapter.
+    dependencies: []
+    migration: 012_loans.sql
+
+  # ── Wave 5: Sales Tool ──
+
+  - id: W5-1
+    name: Pricing table + PDF generation
+    status: pending
+    priority: low
+    description: D1 migration 013 (pricing). PDF gen via Worker or GAS adapter.
+    dependencies: []
+    migration: 013_pricing.sql
+
+  # ── Wave 6: Cleanup ──
+
+  - id: W6-1
+    name: Decommission GAS estate
+    status: pending
+    priority: low
+    description: |
+      Archive candid-labs repo. Decommission 26–30 GAS scriptIds.
+      Remove QUARANTINE mirrors. Only thin adapters remain.
+    dependencies: [W1-3, W2-2, W3-1, W4-1, W5-1]
```

### E../RUNBOOKS/RUNBOOK_DEPLOY.md
```diff
--- platform-standard/docs/implementation-template/./RUNBOOKS/RUNBOOK_DEPLOY.md	2026-02-26 09:15:52
+++ docs/coreos/./RUNBOOKS/RUNBOOK_DEPLOY.md	2026-02-26 08:49:05
@@ -1,51 +1,70 @@
 # Runbook: Deploy to Production
 
-> Step-by-step procedure for deploying changes to the production environment.
-
 ## Overview
 
-`<Describe the deployment architecture: what deploys where, and how.>`
+Candidlabs deploys via Cloudflare Pages (static site) and Cloudflare Workers (API). Both deploy on push to `main`.
 
-## Prerequisites
-
-- `<Access requirements>`
-- `<Tools required>`
-- `<Environment setup>`
-
 ## Branching
 
-1. Create a feature branch from the primary branch.
+1. Create a feature branch from `main`:
+   ```
+   git checkout -b feature/your-change
+   ```
 2. Make changes, commit, push to remote.
-3. `<Describe preview/staging deploy process if applicable.>`
-4. Test the preview deployment.
+3. Cloudflare Pages automatically creates a **preview deploy** on the branch.
+4. Test the preview URL (shown in Cloudflare dashboard or GitHub PR checks).
 
+## Preview Testing
+
+- Preview URL format: `https://<branch-slug>.candidlabs.pages.dev`
+- Verify: page loads, nav works, API health check responds.
+- If the change includes a D1 migration: the preview uses the **same D1 database** as production. Migrations are safe (additive only) but be aware of this.
+
 ## Production Deploy
 
-1. Merge feature branch to primary branch.
-2. `<Describe auto-deploy or manual deploy steps.>`
-3. Verify production.
+1. Merge feature branch to `main` (via PR or direct push).
+2. Cloudflare Pages auto-deploys within ~60 seconds.
+3. Verify production: `https://candidlabs.pages.dev`
 
-## Database Migration Deploy
+## D1 Migration Deploy
 
-`<Describe how migrations are applied — automatically or manually.>`
+Migrations are **not auto-applied**. After merging:
 
-1. Run the migration.
-2. Verify via API or direct query.
+1. Run the migration manually:
+   ```
+   cd api/
+   npx wrangler d1 execute candidlabs-db --file=db/migrations/NNN_name.sql
+   ```
+2. Verify via API: create and read a record in the new collection.
 
-## Rollback
+## Worker Deploy
 
-### Application Rollback
+If `api/src/index.js` changed:
 
-`<Describe how to roll back a bad deploy.>`
+```
+cd api/
+npx wrangler deploy
+```
 
-### Database Rollback
+## Rollback
 
-`<Describe how to handle a bad migration. Note: many databases do not support automatic rollback of DDL.>`
+### Static site rollback
+- Cloudflare Pages → Deployments → click a previous deployment → "Rollback to this deploy".
+- Instant. No downtime.
 
+### Worker rollback
+- Cloudflare dashboard → Workers → candidlabs-api → Deployments → rollback.
+- Or: `git revert <commit>` → push to `main`.
+
+### D1 rollback
+- D1 migrations are **not reversible** via Cloudflare tooling.
+- Write a new corrective migration (e.g., `DROP TABLE IF EXISTS` or `ALTER TABLE DROP COLUMN`).
+- Never delete or modify existing migration files.
+
 ## Checklist
 
-- [ ] Preview/staging deploy tested
-- [ ] Database migration applied (if applicable)
-- [ ] API redeployed (if applicable)
+- [ ] Preview deploy tested
+- [ ] D1 migration applied (if applicable)
+- [ ] Worker redeployed (if `api/src/index.js` changed)
 - [ ] Production smoke test passed
-- [ ] Documentation updated
+- [ ] Release log updated in `docs/COREOS_MANIFEST.md`
```

## F. Governance Checks (basic flags)

- CoreOS pack has CHANGELOG?  **NO**
- CoreOS pack has DECISIONS/ADR-*?  **1** found
- CoreOS pack has RUNBOOKS/?  **YES**

