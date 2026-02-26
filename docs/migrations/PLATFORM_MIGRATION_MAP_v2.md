# Platform Migration Map v2.0

> Generated 2026-02-26. Supersedes v1.0.
> Sources: GAS_INVENTORY_v2.md, GAS_RECONCILIATION_v1.md, deep code analysis of all 8 PLATFORM projects.
>
> **v1 was wrong.** It assumed 29 empty shells and only analyzed KAA. This version accounts for ~280 real source files across 30 GAS projects, with per-project data flow analysis and realistic migration waves.

---

## 1. Existing Platform Modules (candidlabs-site)

> Unchanged from v1.0 — see PLATFORM_MIGRATION_MAP_v1.md sections 1.1–1.7 for full detail.

| Module | D1 Tables | API Collections | Status |
|--------|-----------|-----------------|--------|
| CRM | companies, contacts, deals, comments | 4 | Live |
| Projects | projects, tasks | 2 | Live |
| R&D | rnd_projects, rnd_documents, rnd_trial_entries, rnd_stage_history, rnd_approvals, skus | 6 | Live |
| Prospecting | — | — | WIP |
| Budget | — | — | Client-only |
| Auth/Admin | — | — | Live (CF Access + hardcoded roster) |

**Current totals:** 12 D1 tables, 11 API collections, 6 applied migrations.

---

## 2. GAS Estate Overview (what actually needs migrating)

### 2.1 Project Classification

| Category | Projects | Total source files | Migration action |
|----------|----------|-------------------|------------------|
| **PLATFORM (live spokes)** | 8 | ~200 | Migrate per-project (see below) |
| **LEGACY (archived subsets)** | 5 | ~67 | Archive in repo, decommission scriptIds |
| **QUARANTINE (fork)** | 1 (surgical-strike) | 22 | Archive, decommission scriptId |
| **STAGING (standalone utils)** | 15 | ~55 | **Pending user input** — classify per-project |
| **Infrastructure** | 1 (legacy_decommissioner) | 1 | Keep until cleanup complete, then retire |

### 2.2 The 8 PLATFORM Projects — Migration Priority

| # | Project | Files | Domain | Complexity | Wave |
|---|---------|-------|--------|------------|------|
| P1 | **KAA** (key-account-agreement-generator) | 25 | Legal agreements | Medium | 1 |
| P2 | **sales-master** | 44 | Sales pipeline, revenue, margin, deck | Very High | 2 |
| P3 | **production-master** | 41 | Production costing, BOM, COGS, stock | Very High | 3 |
| P4 | **loan-tracker** | 25 | Loan ledger, interest, statements | Medium | 4 |
| P5 | **sales-tool** | 21 | PDF pricing webapp | Low | 5 |
| P6 | **core-os** | 14 | Shared library (menu, health, config) | — | 6 (retire) |
| P7 | **platform** | 8 | Admin/migration tooling | — | 6 (retire) |
| P8 | **discovery-engine** | 4 | GAS project scanning | — | 6 (retire) |

---

## 3. Per-Project Migration Analysis

### 3.1 KAA — Key Account Agreement Generator

> Detailed in PLATFORM_MIGRATION_MAP_v1.md section 2.1. Summary preserved here; v1 analysis was accurate for this project.

**Data flow:**
```
Google Form → "Form Responses 1" sheet
  → onFormSubmit(e) trigger
    → mapRawToCanonical_()        [pure logic — MIGRATE]
    → appendCanonicalRow_()       [Sheet IO — REPLACE with D1]
    → generateAgreementDocFromRow() [Drive/Docs — GAS ADAPTER]
    → kaa_sendNotifications...()  [Gmail — GAS ADAPTER]
```

**Migration target:**
- **MIGRATE to Worker + D1:** Form intake, mapping, validation, dedup, search, status tracking, backfill
- **GAS ADAPTER:** Doc generation (DocumentApp), email notifications (GmailApp)
- **NEW D1 tables:** `agreements`, `jobs`, `job_logs`
- **NEW UI:** `/agreements/` module

See v1 section 2.1 for proposed `agreements` schema (unchanged).

---

### 3.2 Sales Master (44 files)

**Central hub:** One Google Sheet (ID via `CoreOS.getGlobalConfig().SPOKES.SALES_MASTER.ID`)

#### Data Flow Map

```
EXTERNAL INPUT:
  Xero receivables export → paste into RECEIVABLE_DETAIL_RAW

PIPELINE (sequential, menu-triggered):
  ┌─ cleanReceivables.js ──────────────────────────────────────────┐
  │  RECEIVABLE_DETAIL_RAW → RECEIVABLE_DETAIL_CLEAN              │
  │  (parse customer headers, normalize numerics, FX conversion)  │
  └────────────────────────────────────────────────────────────────┘
           │
  ┌────────▼───────────────────────────────────────────────────────┐
  │  buildRevenueMaster.js                                         │
  │  RECEIVABLE_DETAIL_CLEAN + CONFIG_MAPPING → SALES_REVENUE_MASTER│
  │  (join invoice lines with venue hierarchy, calc Revenue_IDR)   │
  └────────────────────────────────────────────────────────────────┘
           │
  ┌────────▼───────────────────────────────────────────────────────┐
  │  margin.js (~700 lines)                                        │
  │  SALES_REVENUE_MASTER + SKU_COSTING_MASTER (cross-sheet)       │
  │  → DECK_METRICS.Gross_Margin_Pct + COGS_EXCEPTIONS            │
  │  (DQ gating at 98% coverage, fuzzy SKU matching)              │
  └────────────────────────────────────────────────────────────────┘
           │
  ┌────────▼───────────────────────────────────────────────────────┐
  │  Xero transformer.js                                           │
  │  RECEIVABLE_DETAIL_RAW → DECK_METRICS.Total_Revenue           │
  │  (aggregate by month)                                          │
  └────────────────────────────────────────────────────────────────┘
           │
  ┌────────▼───────────────────────────────────────────────────────┐
  │  Deck_Metrics_Wrapper.js (orchestrator)                        │
  │  Chains: rebuildDeckMetrics → updateGrossMargin →              │
  │          updateHeadlineMoM → updateSalesPerformance →          │
  │          updateChannelPerformanceMoM                           │
  └────────────────────────────────────────────────────────────────┘
           │
  ┌────────▼───────────────────────────────────────────────────────┐
  │  ReportGenerator.js                                            │
  │  DECK_METRICS row → copy Slides template → replace 22         │
  │  placeholders → save to Drive                                  │
  └────────────────────────────────────────────────────────────────┘

SUPPORTING PIPELINES:
  mapping_sync.js:         ACCOUNT_TRACKING ↔ CONFIG_MAPPING (venue sync + Account_ID gen)
  tracking_enrichment.js:  CONFIG_MAPPING → ACCOUNT_TRACKING (enrich txns with hierarchy)
  account_status.js:       ACCOUNT_TRACKING → ACCOUNT_STATUS + DORMANT_ACCOUNTS
  CRM.js:                  CONFIG_MAPPING → CRM_CONTACTS + CRM_CONTACT_HEALTH
```

#### Function Classification

| Function | Category | Target |
|----------|----------|--------|
| `cleanReceivableDetailRaw()` | Pure data transform | **Worker** |
| `rebuildSalesRevenueMasterFromReceivables()` | Pure join + calc | **Worker** |
| `updateGrossMarginMetrics()` | Pure computation (cost waterfall) | **Worker** |
| `verifyGrossMarginEngine()` | Diagnostic | **Worker** (admin endpoint) |
| `uiPromptUpdateDeckMetricsFromXero()` | Aggregation + UI | **Worker** (import endpoint) |
| `refreshDeckMetricsAll()` | Orchestration | **Worker** (pipeline endpoint) |
| `syncCrmFromConfigMapping()` | Data sync | **Worker** (already have CRM in platform) |
| `rebuildAccountStatus()` | Pure computation (day-band) | **Worker** |
| `syncVenueMappingFromAccountTracking()` | Data sync + MD5 | **Worker** |
| `populateAccountIDs()` | Data enrichment | **Worker** |
| `uiPromptForReport()` | Slides generation | **GAS ADAPTER** |
| `generateMonthlyDeckForMonth()` | Slides template fill | **GAS ADAPTER** |
| `buildMonthlyDeckTemplateSlides()` | One-time setup | **RETIRE** |
| Debug/check/find_* (10 files) | Diagnostics | **RETIRE** |

#### Proposed D1 Tables

```sql
-- Revenue fact table (replaces SALES_REVENUE_MASTER sheet)
CREATE TABLE revenue_transactions (
  id                  TEXT PRIMARY KEY,
  transaction_id      TEXT UNIQUE NOT NULL,
  invoice_date        TEXT NOT NULL,
  invoice_number      TEXT,
  distributor_name    TEXT,
  venue_name          TEXT,
  account_id          TEXT,
  sku_code            TEXT,
  sku_name            TEXT,
  quantity_cases      REAL,
  quantity_cans       INTEGER,
  invoice_value_idr   REAL,
  revenue_idr         REAL,
  market              TEXT,
  city                TEXT,
  channel             TEXT,
  group_name          TEXT,
  source              TEXT DEFAULT 'xero',
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_rev_txn_date ON revenue_transactions(invoice_date);
CREATE INDEX idx_rev_txn_account ON revenue_transactions(account_id);
CREATE INDEX idx_rev_txn_sku ON revenue_transactions(sku_code);

-- Account mapping (replaces CONFIG_MAPPING sheet)
CREATE TABLE account_mapping (
  id                  TEXT PRIMARY KEY,
  raw_value           TEXT UNIQUE NOT NULL,
  internal_venue_name TEXT,
  account_id          TEXT,
  group_name          TEXT,
  market              TEXT,
  city                TEXT,
  channel             TEXT,
  active_flag         TEXT DEFAULT 'Active',
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_acct_map_raw ON account_mapping(raw_value);

-- Account status snapshots (replaces ACCOUNT_STATUS sheet)
CREATE TABLE account_status (
  id                  TEXT PRIMARY KEY,
  snapshot_date       TEXT NOT NULL,
  venue_name          TEXT NOT NULL,
  account_id          TEXT,
  first_order_date    TEXT,
  latest_order_date   TEXT,
  days_since_last     INTEGER,
  status              TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_acct_status_snap ON account_status(snapshot_date);

-- Deck metrics (replaces DECK_METRICS sheet)
CREATE TABLE deck_metrics (
  id                  TEXT PRIMARY KEY,
  month_key           TEXT UNIQUE NOT NULL,
  month_label         TEXT,
  total_revenue_idr   REAL,
  gross_margin_pct    REAL,
  gross_margin_vs_prev TEXT,
  dq_flag             TEXT,
  headline            TEXT,
  sales_performance   TEXT,
  channel_performance TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);
```

#### GAS Adapter: Slides Deck Generator

Post-migration, a thin GAS webapp handles only the Google Slides API call:

```
Worker POST /api/deck-metrics/:monthKey/generate-deck
  → Worker reads deck_metrics row, formats all 22 placeholder values
  → Worker calls GAS webapp (doPost) with { templateId, folderId, placeholders }
  → GAS: DriveApp.makeCopy(template), SlidesApp.replaceAllText(placeholders)
  → GAS returns: { presentationId, presentationUrl }
  → Worker stores URL in deck_metrics.meta
```

---

### 3.3 Production Master (41 files)

**Central hub:** One Google Sheet (ID via `CoreOS.getGlobalConfig().SPOKES.PRODUCTION_MASTER.ID`)

#### Data Flow Map

```
EXTERNAL INPUT:
  Xero payables export   → paste into PAYABLE_DETAIL_RAW
  Xero aged reports      → paste into AGED_RECEIVABLES_RAW, AGED_PAYABLES_RAW
  KMI daily packaging    → paste into KMI_PACKAGING_RAW
  KMI FG tabs (3 SKUs)   → paste into KMI_TAB-CLUB-RAW, KMI_TAB-IMPERIAL-RAW, KMI_TAB-GINGER-RAW

CONFIGURATION TABLES (mostly static):
  CONFIG_BOM_UNLEASHED    (imported BOM CSV)
  CONFIG_BOM_MASTER       (hardcoded via import_bom_master.js)
  CONFIG_XERO_ITEMS       (Xero product list)
  COMPONENT_COST_HISTORY  (historical component prices)

PIPELINE (orchestrated by Pipelines.js):
  Step 1: Xero Month-End Refresh
    cleanPayables.js:     PAYABLE_DETAIL_RAW → PAYABLE_DETAIL_CLEAN
    ARAPSnapshot.js:      AGED_*_RAW → AR_AP_SUMMARY

  Step 2: KMI Production Parsing
    buildProductionRuns.js:  KMI_PACKAGING_RAW → PRODUCTION_RUNS_KMI
    kmiFgParser.js:          KMI_TAB-*-RAW → KMI_FG_BATCH_CLEAN
                                            → KMI_FG_SHIPMENTS_RAW/CLEAN
                                            → KMI_FG_STOCK_SUMMARY

  Step 3: Costing
    Costing_Engine.js:    CONFIG_BOM_UNLEASHED + PAYABLE_DETAIL_CLEAN
                          + CONFIG_XERO_ITEMS → SKU_COSTING_MASTER
                          (3-tier waterfall: actual PO → Xero standard → BOM estimate)

    build_batch_cogs.js:  CONFIG_BOM_MASTER + PRODUCTION_RUNS_KMI
                          + COMPONENT_COST_HISTORY → BATCH_COGS_MASTER

  Step 4: Stock
    (stock movements and summary builders)
```

#### Function Classification

| Function | Category | Target |
|----------|----------|--------|
| `cleanPayableDetailRaw()` | Pure data transform | **Worker** |
| `snapshotArApFromRaw()` | Pure aggregation (minus UI prompt) | **Worker** |
| `buildProductionRunsClean()` | Pure grouping + date parsing | **Worker** |
| `runAllKmiFgParsers()` | Orchestration | **Worker** (pipeline endpoint) |
| `buildKmiFgBatchClean()` | Pure parsing | **Worker** |
| `buildKmiFgShipmentsRaw/Clean()` | Pure transform | **Worker** |
| `buildKmiFgStockSummary()` | Pure aggregation | **Worker** |
| `runCostingEngine()` | Pure cost waterfall | **Worker** |
| `buildBatchCOGS()` | Pure COGS calc | **Worker** |
| `runAllProductionPipelines()` | Orchestration | **Worker** (pipeline endpoint) |
| `importBOMMaster()` | One-time config seed | **Worker** (admin endpoint) |
| audit_*/check_*/debug_*/diagnose_* (12 files) | Diagnostics | **RETIRE** |

#### Proposed D1 Tables

```sql
-- Production runs (replaces PRODUCTION_RUNS_KMI sheet)
CREATE TABLE production_runs (
  id                  TEXT PRIMARY KEY,
  batch_id            TEXT UNIQUE NOT NULL,
  production_date     TEXT NOT NULL,
  sku_code            TEXT NOT NULL,
  sku_name            TEXT,
  plant_name          TEXT DEFAULT 'KMI',
  batch_size_unit     TEXT DEFAULT 'CANS',
  batch_size_qty      INTEGER,
  cases_produced      REAL,
  cans_produced       INTEGER,
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_prod_runs_date ON production_runs(production_date);
CREATE INDEX idx_prod_runs_sku ON production_runs(sku_code);

-- BOM components (replaces CONFIG_BOM_MASTER sheet)
CREATE TABLE bom_components (
  id                  TEXT PRIMARY KEY,
  sku_code            TEXT NOT NULL,
  component_code      TEXT NOT NULL,
  quantity_per_can    REAL NOT NULL,
  uom                 TEXT,
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now')),
  UNIQUE(sku_code, component_code)
);

-- Component cost history (replaces COMPONENT_COST_HISTORY sheet)
CREATE TABLE component_costs (
  id                  TEXT PRIMARY KEY,
  month_key           TEXT NOT NULL,
  component_code      TEXT NOT NULL,
  cumulative_avg_idr  REAL,
  source              TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  UNIQUE(month_key, component_code)
);

-- SKU costing output (replaces SKU_COSTING_MASTER sheet)
CREATE TABLE sku_costing (
  id                  TEXT PRIMARY KEY,
  sku_code            TEXT NOT NULL,
  sku_name            TEXT,
  raw_cogs_idr        REAL,
  cost_method         TEXT,
  notes               TEXT,
  effective_date      TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_sku_costing_code ON sku_costing(sku_code);

-- Batch COGS (replaces BATCH_COGS_MASTER sheet)
CREATE TABLE batch_cogs (
  id                  TEXT PRIMARY KEY,
  batch_id            TEXT NOT NULL,
  production_date     TEXT,
  sku_code            TEXT NOT NULL,
  cans_produced       INTEGER,
  cases_produced      REAL,
  total_cogs_per_can  REAL,
  can_cost            REAL,
  box_cost            REAL,
  filling_cost        REAL,
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now'))
);

-- Payables (replaces PAYABLE_DETAIL_CLEAN sheet)
CREATE TABLE payables (
  id                  TEXT PRIMARY KEY,
  invoice_date        TEXT,
  supplier_name       TEXT,
  invoice_number      TEXT,
  line_description    TEXT,
  item_code           TEXT,
  quantity            REAL,
  unit_price_idr      REAL,
  tax_idr             REAL,
  gross_idr           REAL,
  invoice_total_idr   REAL,
  currency            TEXT DEFAULT 'IDR',
  cost_category       TEXT,
  status              TEXT,
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_payables_date ON payables(invoice_date);
CREATE INDEX idx_payables_item ON payables(item_code);

-- AR/AP snapshots (replaces AR_AP_SUMMARY sheet)
CREATE TABLE arap_snapshots (
  id                  TEXT PRIMARY KEY,
  snapshot_date       TEXT NOT NULL,
  metric_type         TEXT NOT NULL,
  contact_name        TEXT,
  bucket_current      REAL DEFAULT 0,
  bucket_lt_1mo       REAL DEFAULT 0,
  bucket_1mo          REAL DEFAULT 0,
  bucket_2mo          REAL DEFAULT 0,
  bucket_3mo          REAL DEFAULT 0,
  bucket_older        REAL DEFAULT 0,
  total               REAL DEFAULT 0,
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_arap_date ON arap_snapshots(snapshot_date);
CREATE INDEX idx_arap_type ON arap_snapshots(metric_type);
```

---

### 3.4 Loan Tracker (25 files)

**Central hub:** One Google Sheet (ID via `CoreOS.getGlobalConfig().DRIVE.DATA_BASES.LOAN_TRACKER`)

#### Data Flow Map

```
INPUT:
  HTML form (TransactionForm.html) → saveTransaction()

CORE SHEETS:
  Loan Transactions    (raw audit log: Date, Lender, Type, Amount, Notes)
  Loan Data            (structured ledger: Opening Balance, Principal, Interest, Closing Balance)
  Lender Profiles      (static: Agreement Date, Original Loan SGD, Novation details)

PIPELINES:
  TransactionLogic.js:       Form → Loan Transactions + Loan Data (single entry)
  BulkFromTransactions.js:   Loan Transactions → Loan Data (bulk backfill)
  InterestAccrual.js:        Loan Data → Loan Data + interest rows (daily rate: 5% p.a.)
  RebuildLoanInterest.js:    Rebuild entire Loan Data with recalculated interest

OUTPUT:
  StatementGenerator.js:     Loan Data + Lender Profiles + Doc template → Google Doc + PDF
  BulkStatements.js:         Loops StatementGenerator for all months
```

#### Function Classification

| Function | Category | Target |
|----------|----------|--------|
| `saveTransaction()` | State machine + Sheet IO | **Worker** (POST /api/loans/transactions) |
| `applyTransactionsFromLoanTransactions()` | Pure state machine | **Worker** |
| `accrueMonthlyInterest()` | Pure computation (daily interest) | **Worker** (scheduled job) |
| `rebuildLoanDataWithInterest()` | Pure rebuild | **Worker** (admin endpoint) |
| `generateStatements()` | Doc template + PDF export | **GAS ADAPTER** |
| `bulkGenerateStatementsForLender()` | Orchestration over generateStatements | **GAS ADAPTER** |
| Folder management (FolderUtils.js) | Drive API | **GAS ADAPTER** |
| UI helpers (UIHelpers.js, Helpers_Sections.js) | Google UI | **RETIRE** (platform UI replaces) |

#### Proposed D1 Tables

```sql
-- Lender profiles (replaces Lender Profiles sheet)
CREATE TABLE lenders (
  id                  TEXT PRIMARY KEY,
  name                TEXT UNIQUE NOT NULL,
  agreement_date      TEXT,
  original_loan_sgd   REAL,
  pre_novation_repaid_sgd REAL,
  novation_date       TEXT,
  novated_principal_sgd REAL,
  novation_fx_rate    REAL,
  template_doc_id     TEXT,
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now'))
);

-- Loan transactions (replaces Loan Transactions sheet)
CREATE TABLE loan_transactions (
  id                  TEXT PRIMARY KEY,
  lender_id           TEXT NOT NULL,
  transaction_date    TEXT NOT NULL,
  type                TEXT NOT NULL,
  amount              REAL NOT NULL,
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lender_id) REFERENCES lenders(id)
);
CREATE INDEX idx_loan_txn_lender ON loan_transactions(lender_id);
CREATE INDEX idx_loan_txn_date ON loan_transactions(transaction_date);

-- Loan ledger (replaces Loan Data sheet)
CREATE TABLE loan_ledger (
  id                  TEXT PRIMARY KEY,
  lender_id           TEXT NOT NULL,
  entry_date          TEXT NOT NULL,
  opening_balance     REAL,
  principal_payment   REAL DEFAULT 0,
  interest_accrued    REAL DEFAULT 0,
  closing_balance     REAL,
  entry_type          TEXT DEFAULT 'principal',
  notes               TEXT,
  meta                TEXT DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lender_id) REFERENCES lenders(id)
);
CREATE INDEX idx_ledger_lender ON loan_ledger(lender_id);
CREATE INDEX idx_ledger_date ON loan_ledger(entry_date);
```

#### GAS Adapter: Statement Generator

```
Worker POST /api/loans/lenders/:id/generate-statement?month=2025-10
  → Worker reads loan_ledger rows for lender+month, lender profile
  → Worker formats all placeholder values (<<LENDER>>, <<STATEMENT_MONTH>>, etc.)
  → Worker calls GAS webapp (doPost) with { templateDocId, folderId, placeholders }
  → GAS: DriveApp.makeCopy(), DocumentApp.replaceText(), UrlFetchApp PDF export
  → GAS returns: { docId, docUrl, pdfUrl }
  → Worker stores URLs in loan_ledger.meta or dedicated statements table
```

---

### 3.5 Sales Tool (21 files)

**Architecture:** GAS webapp (doGet serves Form.html UI, generatePDF server-side)

#### Data Flow Map

```
User opens webapp → Form.html (channel, location, tier, account, custom prices)
  → generatePDF(formData)
    → getPricingFromSheet(location, channel, tier)  [read pricing sheet]
    → loadImageBase64(masterBackgroundId)            [read Drive image]
    → HtmlService.createTemplateFromFile('Template') [render HTML]
    → htmlOutput.getBlob().getAs('application/pdf')  [convert to PDF]
    → DriveApp.getFolderById(backupFolder).createFile(blob)
    → logAction(formData, fileUrl)
  → return { filename, base64 } to client for download
```

#### Function Classification

| Function | Category | Target |
|----------|----------|--------|
| `generatePDF()` | HTML→PDF + Drive backup | **Worker** (or keep as GAS webapp) |
| `getPricingFromSheet()` | Sheet lookup | **Worker** (D1 lookup) |
| `loadImageBase64()` | Drive file fetch | **Worker** (R2 or static asset) |
| `logAction()` | Audit log | **Worker** (D1 log table) |
| `getActiveUserIdentity()` | User lookup | **Worker** (CF Access identity) |
| Template rendering | HTML template | **Worker** (HTML response) |

**Migration note:** This webapp could migrate entirely to the platform as a Worker-served page. PDF generation in Workers requires a library (e.g., `@vercel/og` or headless Chrome via Browser Rendering API), or the HTML→PDF step could remain as a thin GAS adapter.

#### Proposed D1 Table

```sql
-- Pricing tiers (replaces pricing sheet)
CREATE TABLE pricing (
  id          TEXT PRIMARY KEY,
  location    TEXT NOT NULL,
  channel     TEXT NOT NULL,
  tier        TEXT NOT NULL,
  soda        REAL,
  imperial    REAL,
  ginger      REAL,
  meta        TEXT DEFAULT '{}',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now')),
  UNIQUE(location, channel, tier)
);
```

---

### 3.6 Projects That Retire (no migration)

| Project | Reason |
|---------|--------|
| **core-os** | Shared library consumed by spokes. Once all spokes migrate, no consumers remain. Config values extracted to Worker env vars. |
| **platform** | Admin/migration tooling (CMS audit, code flattening). Purpose fulfilled after migration. |
| **discovery-engine** | GAS project scanning utility. Not needed once GAS estate is decommissioned. |

---

## 4. Platform Gaps (needed for migration)

| Gap | Current State | Required For | Wave |
|-----|---------------|-------------|------|
| **`agreements` collection** | Does not exist | KAA migration | 1 |
| **`jobs` / `job_logs` tables** | Do not exist | Adapter audit trail | 1 |
| **GAS ↔ Worker auth** | No API auth | Securing adapter calls | 1 |
| **Webhook receiver** | No `/api/webhook/*` routes | GAS adapter callbacks | 1 |
| **Cron triggers** | None in `wrangler.toml` | Scheduled jobs (interest accrual, nightly refreshes) | 2 |
| **Worker env vars** | None for GAS config | Template IDs, Folder IDs, email config | 1 |
| **Import endpoints** | Generic POST only | Xero/KMI data intake (CSV/JSON upload) | 2–3 |
| **Revenue/sales tables** | Do not exist | Sales pipeline migration | 2 |
| **Production tables** | Do not exist | Production costing migration | 3 |
| **Loan tables** | Do not exist | Loan tracker migration | 4 |
| **Pricing table** | Does not exist | Sales tool migration | 5 |
| **Pipeline orchestration** | No async job runner | Multi-step data pipelines | 2 |

---

## 5. Migration Waves

### Wave 1: KAA + Foundation Infrastructure

**Justification:** Self-contained project with clear boundaries. Establishes GAS adapter pattern, jobs infrastructure, and auth — all required by subsequent waves.

**Scope:**
- D1 migration `007_agreements.sql` (agreements table)
- D1 migration `008_jobs.sql` (jobs + job_logs tables)
- Add `agreements`, `jobs`, `job_logs` to Worker COLLECTIONS
- API key auth middleware for adapter endpoints
- Build `/agreements/` UI module (form + list + detail)
- Port: Mapping.js, Helpers.js, BackFill.js, RegenPicker.js → Worker modules
- GAS adapters: Doc generator (doPost), Email sender (doPost)
- Worker env vars for Drive IDs, template IDs

**New D1 tables:** 3 (agreements, jobs, job_logs)
**GAS adapters:** 2 (doc gen, email)
**Outcome:** Agreements sheet becomes read-only archive. Platform UI is source of truth. GAS adapter pattern proven.

---

### Wave 2: Sales Data Pipeline

**Justification:** Highest business impact — revenue, margin, CRM, and monthly reporting all flow through sales-master. The platform already has CRM tables (contacts, companies, deals) that can absorb the account management functions.

**Scope:**
- D1 migration `009_sales.sql` (revenue_transactions, account_mapping, account_status, deck_metrics)
- Port data pipelines to Worker:
  - `POST /api/sales/import-receivables` — replaces cleanReceivables + buildRevenueMaster
  - `POST /api/sales/refresh-margins` — replaces margin.js DQ-gated calculation
  - `POST /api/sales/refresh-deck-metrics` — replaces Deck_Metrics_Wrapper orchestration
  - `POST /api/sales/rebuild-account-status` — replaces account_status.js
  - `POST /api/sales/sync-mapping` — replaces mapping_sync.js + tracking_enrichment.js
- Bridge CRM.js functions into existing platform CRM module
- Build `/sales/` UI module (revenue dashboard, margin, account health)
- GAS adapter: Slides deck generator (doPost — receives formatted placeholders, returns presentation URL)

**New D1 tables:** 4 (revenue_transactions, account_mapping, account_status, deck_metrics)
**GAS adapters:** 1 (slides)
**Migrated functions:** ~15 (cleanReceivables, buildRevenueMaster, margin calc, account status, mapping sync, tracking enrichment, CRM sync, deck metrics orchestration)
**Retired functions:** ~10 (Debug.js, DebugRunner.js, check_*.js, find_*.js, Test Library.js)

**Data intake pattern:** User uploads Xero CSV via platform UI → Worker parses and runs pipeline → results in D1. Replaces paste-into-Sheet workflow.

---

### Wave 3: Production Costing Pipeline

**Justification:** Second highest complexity. Depends on Wave 2 (margin.js reads SKU_COSTING_MASTER from production-master). Shares Xero import pattern established in Wave 2.

**Scope:**
- D1 migration `010_production.sql` (production_runs, bom_components, component_costs, sku_costing, batch_cogs, payables, arap_snapshots)
- Port data pipelines to Worker:
  - `POST /api/production/import-payables` — replaces cleanPayables
  - `POST /api/production/import-kmi-packaging` — replaces buildProductionRuns + kmiFgParser
  - `POST /api/production/run-costing-engine` — replaces Costing_Engine (3-tier waterfall)
  - `POST /api/production/build-batch-cogs` — replaces build_batch_cogs
  - `POST /api/production/snapshot-arap` — replaces ARAPSnapshot
  - `POST /api/production/run-all` — replaces Pipelines.js orchestration
- Admin endpoints for BOM management (import, edit)
- Build `/production/` UI module (costing dashboard, production runs, BOM editor, payables)

**New D1 tables:** 7 (production_runs, bom_components, component_costs, sku_costing, batch_cogs, payables, arap_snapshots)
**GAS adapters:** 0 (no Google-native operations)
**Migrated functions:** ~12 (all pipeline and costing functions)
**Retired functions:** ~12 (audit_*, check_*, debug_*, diagnose_*, extract_bom, import_bom_master)

**Cross-wave dependency:** Once sku_costing is in D1, update Wave 2's margin calculation to read from D1 instead of cross-sheet lookup.

---

### Wave 4: Loan Tracker

**Justification:** Self-contained domain, medium complexity. Statement generation requires Doc template manipulation (GAS adapter).

**Scope:**
- D1 migration `011_loans.sql` (lenders, loan_transactions, loan_ledger)
- Port logic to Worker:
  - `POST /api/loans/transactions` — replaces saveTransaction
  - `POST /api/loans/bulk-apply` — replaces BulkFromTransactions
  - `POST /api/loans/accrue-interest` — replaces InterestAccrual (+ add as cron job)
  - `POST /api/loans/rebuild-ledger` — replaces RebuildLoanInterest
- Build `/loans/` UI module (ledger view, transaction form, statement generation trigger)
- GAS adapter: Statement generator (doPost — receives placeholders, returns Doc + PDF URLs)

**New D1 tables:** 3 (lenders, loan_transactions, loan_ledger)
**GAS adapters:** 1 (statement generator)
**Migrated functions:** ~6 (transaction logic, interest accrual, bulk apply, rebuild)
**Retired functions:** ~4 (UI helpers, HTML forms — replaced by platform UI)

**Cron addition:** Monthly interest accrual job in `wrangler.toml`.

---

### Wave 5: Sales Tool

**Justification:** Smallest scope. Self-contained webapp. Can potentially run entirely on platform (no Google-native deps if PDF gen moves to Worker).

**Scope:**
- D1 migration `012_pricing.sql` (pricing table)
- Port to platform:
  - Pricing CRUD via existing Worker pattern
  - PDF generation: either Worker with Browser Rendering API, or thin GAS adapter
- Build `/sales-tool/` UI module (pricing form + PDF download)
- Migrate static assets (background image, logos) to R2 or static hosting

**New D1 tables:** 1 (pricing)
**GAS adapters:** 0–1 (depending on PDF approach)

---

### Wave 6: Cleanup & Decommission

**Justification:** All business logic migrated. Remaining GAS projects serve no purpose.

**Scope:**
- Extract all CoreOS.CONFIG values into Worker env vars or `config` D1 table
- Decommission GAS projects from Apps Script console:
  - 5 LEGACY scriptIds (confirmed subsets — see GAS_RECONCILIATION_v1.md)
  - 1 QUARANTINE scriptId (surgical-strike)
  - 1 LEGACY shim (os-script-directory)
  - 3 PLATFORM admin tools (core-os, platform, discovery-engine)
  - STAGING projects (per user decision from reconciliation open action #2)
  - legacy_decommissioner
- Remove corresponding directories from `candid-labs` repo
- Archive `candid-labs-tiered` repo (vendored snapshot superseded)
- Remove 98_QUARANTINE mirror copies (confirmed as duplicates)

**GAS projects remaining after Wave 6:** Only the thin adapters:
- KAA doc generator + email sender (Wave 1)
- Slides deck generator (Wave 2)
- Loan statement generator (Wave 4)
- Sales tool PDF generator (Wave 5, if GAS approach chosen)

---

## 6. Summary: Before & After

### GAS Estate (before)

| Category | Projects | Source files | Google Sheet tabs |
|----------|----------|-------------|-------------------|
| PLATFORM spokes | 8 | ~200 | ~50+ across 4 master sheets |
| LEGACY/QUARANTINE | 6 | ~89 | (share same sheets or dormant) |
| STAGING | 15 | ~55 | (standalone) |
| TOTAL | 30 | ~345 | |

### Platform (after all 6 waves)

| Component | Count |
|-----------|-------|
| D1 tables (existing) | 12 |
| D1 tables (new, Waves 1–5) | 18 |
| **D1 tables total** | **30** |
| Worker pipeline endpoints (new) | ~20 |
| Platform UI modules (new) | 5 (agreements, sales, production, loans, sales-tool) |
| GAS thin adapters (remaining) | 3–4 (doc gen, email, slides, optional PDF) |
| GAS projects decommissioned | 26–30 |

### Migration Metrics

| Wave | New D1 Tables | Functions Migrated | Functions Retired | GAS Adapters |
|------|--------------|-------------------|-------------------|--------------|
| 1 — KAA + Foundation | 3 | ~8 | 0 | 2 |
| 2 — Sales Pipeline | 4 | ~15 | ~10 | 1 |
| 3 — Production Costing | 7 | ~12 | ~12 | 0 |
| 4 — Loan Tracker | 3 | ~6 | ~4 | 1 |
| 5 — Sales Tool | 1 | ~5 | 0 | 0–1 |
| 6 — Cleanup | 0 | 0 | ~50 (bulk decommission) | 0 |
| **TOTAL** | **18** | **~46** | **~76** | **3–4** |

---

## Appendix A: D1 Table Inventory (projected after all waves)

| Table | Module | Migration | Wave |
|-------|--------|-----------|------|
| companies | CRM | schema.sql + 002 | existing |
| contacts | CRM | schema.sql + 003 | existing |
| deals | CRM | schema.sql + 002 | existing |
| projects | PM | schema.sql | existing |
| tasks | PM | schema.sql | existing |
| comments | Shared | schema.sql | existing |
| rnd_projects | R&D | 004 + 005 + 006 | existing |
| rnd_documents | R&D | 004 | existing |
| rnd_trial_entries | R&D | 004 | existing |
| rnd_stage_history | R&D | 005 | existing |
| rnd_approvals | R&D | 005 | existing |
| skus | R&D | 004 | existing |
| agreements | KAA | 007 | Wave 1 |
| jobs | Infrastructure | 008 | Wave 1 |
| job_logs | Infrastructure | 008 | Wave 1 |
| revenue_transactions | Sales | 009 | Wave 2 |
| account_mapping | Sales | 009 | Wave 2 |
| account_status | Sales | 009 | Wave 2 |
| deck_metrics | Sales | 009 | Wave 2 |
| production_runs | Production | 010 | Wave 3 |
| bom_components | Production | 010 | Wave 3 |
| component_costs | Production | 010 | Wave 3 |
| sku_costing | Production | 010 | Wave 3 |
| batch_cogs | Production | 010 | Wave 3 |
| payables | Production | 010 | Wave 3 |
| arap_snapshots | Production | 010 | Wave 3 |
| lenders | Loans | 011 | Wave 4 |
| loan_transactions | Loans | 011 | Wave 4 |
| loan_ledger | Loans | 011 | Wave 4 |
| pricing | Sales Tool | 012 | Wave 5 |

**Total: 30 tables (12 existing + 18 new)**

---

## Appendix B: GAS Adapter Specifications

### Adapter 1: Doc Generator (KAA — Wave 1)

```
Deployed as: Web App (doPost), execute as: me, access: anyone with URL
Auth: API key in X-Api-Key header (validated against Worker-issued key)

POST payload:
{
  "templateDocId": "...",
  "outputFolderId": "...",
  "outputFileName": "KAA_AccountName_2025.docx",
  "placeholders": {
    "<<ACCOUNT_NAME>>": "PT Sari Rasa",
    "<<AGREEMENT_DATE>>": "15 October 2025",
    ...
  }
}

Response:
{ "docId": "...", "docUrl": "https://docs.google.com/..." }
```

### Adapter 2: Email Sender (KAA — Wave 1)

```
POST payload:
{
  "to": "account@example.com",
  "cc": ["internal@candidmixers.com"],
  "subject": "Your Candid Agreement",
  "htmlBody": "<html>...</html>",
  "fromAlias": "Candid Sales"
}

Response:
{ "sent": true, "messageId": "..." }
```

### Adapter 3: Slides Deck Generator (Sales — Wave 2)

```
POST payload:
{
  "templatePresentationId": "...",
  "outputFolderId": "...",
  "outputFileName": "Partner Deck - October 2025",
  "placeholders": {
    "{{Month_Label}}": "October 2025",
    "{{Total_Revenue}}": "IDR 167,107,200",
    "{{Gross_Margin_Pct}}": "45.7%",
    ...  // 22 total
  }
}

Response:
{ "presentationId": "...", "presentationUrl": "https://docs.google.com/presentation/..." }
```

### Adapter 4: Loan Statement Generator (Loans — Wave 4)

```
POST payload:
{
  "templateDocId": "...",
  "lenderFolderId": "...",
  "outputFileName": "Loan Statement - Unisoda - October 2025",
  "placeholders": {
    "<<LENDER>>": "Unisoda PTE",
    "<<STATEMENT_MONTH>>": "October 2025",
    "<<CURRENT_DATE>>": "2025-11-05",
    "<<AGREEMENT_DATE>>": "2024-01-15",
    ...
  },
  "exportPdf": true,
  "pdfFolderId": "..."
}

Response:
{ "docId": "...", "docUrl": "...", "pdfUrl": "..." }
```

---

## Appendix C: Open Dependencies (from GAS_RECONCILIATION_v1.md)

These must be resolved before migration begins:

1. **Confirm PLATFORM scriptIds are the live deployed versions** — run `clasp list`
2. **STAGING projects** — which of the 15 are still in use?
3. **LEGACY scriptIds** — are any still receiving triggers?

Until these are confirmed, Wave 6 (cleanup) scope is approximate.
