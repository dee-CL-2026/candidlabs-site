# Overnight Report — Waves 4–8

## Wave 4 — Canonical Financial Ingestion

### What Changed
- Created `012_xero_accounts.sql` — Xero chart of accounts mirror table
- Created `013_xero_payments.sql` — Xero payments mirror table
- Created `014_sync_entity_type.sql` — extends sync_runs with entity_type column
- Created `000_base_schema.sql` — bootstrap for fresh local D1 (worktree needs it)
- Added sync handlers: `xeroSyncAccounts()`, `xeroSyncPayments()`
- Added `xeroFullBackfill()` — POST /api/xero/backfill — syncs all entities (ACCREC+ACCPAY invoices, contacts, items, accounts, payments)
- Added `xeroSyncMonthAll()` — extended month sync fetching both ACCREC and ACCPAY invoice types
- Added `xeroSyncIncremental()` — POST /api/xero/sync-incremental — delta sync using If-Modified-Since
- Added `xeroSyncStatus()` — GET /api/xero/sync-status — entity counts + recent runs
- Admin sync-status UI panel: `admin/sync-status.html` + `admin/sync-status.js`
- COLLECTIONS entries added for `xero_accounts` and `xero_payments`
- CRUD route regex updated to include new collections

### Commits
- `6460789` wave-4: canonical financial ingestion

### How to Test
```bash
cd api
npx wrangler d1 migrations apply candidlabs --local
npx wrangler dev --local
# Then:
# POST /api/xero/sync-accounts
# POST /api/xero/sync-payments
# POST /api/xero/backfill?from=2024-01&to=2026-02
# POST /api/xero/sync-incremental
# GET  /api/xero/sync-status
# Open admin/sync-status.html in browser
```

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/xero/sync-accounts | Sync Xero chart of accounts |
| POST | /api/xero/sync-payments | Sync Xero payments |
| POST | /api/xero/backfill?from=YYYY-MM&to=YYYY-MM | Full historical pull all entities |
| POST | /api/xero/sync-incremental | Delta sync using If-Modified-Since |
| GET  | /api/xero/sync-status | Entity counts + recent sync runs |

---

## Wave 5 — Financial Normalisation

### What Changed
- Created `015_normalised_documents.sql` — normalised document model (revenue/expense)
- Created `016_normalised_line_items.sql` — canonical line items with cost_bucket
- Created `017_cost_bucket_mappings.sql` — account_code → cost_bucket table-driven mapping
- `seedCostBuckets()` — heuristic classification from xero_accounts (name patterns + type)
- `normaliseRevenue()` — ACCREC invoices → normalised_documents + line_items
- `normaliseExpenses()` — ACCPAY invoices → normalised_documents + line_items (bucket = 'Other' when no mapping)
- `normaliseAll()` — full pipeline: seed → revenue → expenses
- All handlers idempotent via ON CONFLICT upserts

### Commits
- `ef30a28` wave-5: financial normalisation

### How to Test
```bash
cd api
npx wrangler d1 migrations apply candidlabs --local
npx wrangler dev --local
# Then:
# POST /api/normalise/seed-buckets
# POST /api/normalise/revenue
# POST /api/normalise/expenses
# POST /api/normalise/all (runs all three)
# SELECT COUNT(*) FROM normalised_documents;
# Re-run /api/normalise/all → row count stable (idempotency)
```

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/normalise/seed-buckets | Seed cost bucket mappings from xero_accounts |
| POST | /api/normalise/revenue | Normalise ACCREC invoices |
| POST | /api/normalise/expenses | Normalise ACCPAY invoices |
| POST | /api/normalise/all | Full normalisation pipeline |

---

## Wave 6 — CoGS Engine v1

### What Changed
- Created `018_cogs_results.sql` — CoGS results per SKU per period (rm/rp/prod/total/units/unit_cost)
- `cogsCompute()` — filters normalised_line_items by RM/RP/Production, aggregates per item_code per month
- Units derived from ACCREC revenue line quantities per SKU per period (documented assumption)
- unit_cost = total_cost / units; NULL when units = 0
- `cogsQuery()` — GET with optional ?sku= and ?period= filters

### Commits
- `df82d7d` wave-6: CoGS engine v1

### How to Test
```bash
cd api && npx wrangler dev --local
# POST /api/cogs/compute
# GET  /api/cogs/query
# GET  /api/cogs/query?sku=ABC&period=2025-12
# SELECT * FROM cogs_results LIMIT 10;
# Verify: rm_cost + rp_cost + prod_cost = total_cost
```

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/cogs/compute | Run CoGS computation pipeline |
| GET  | /api/cogs/query | Query CoGS results (optional: ?sku=, ?period=) |

---

## Wave 7 — Pricing Engine v1

### What Changed
- Created `019_pricing_inputs.sql` — selling prices per SKU per channel per period
- Created `020_margin_results.sql` — margin results with gross/contribution margins
- `priceExtract()` — avg selling price from ACCREC line items per SKU/contact/period
- `marginCompute()` — joins pricing_inputs with cogs_results, computes gross + contribution margin
- `marginByChannel()` — aggregated margin by distributor/channel
- `marginQuery()` — detailed margin results with filters
- Where unit_cost is NULL (no CoGS), margin is NULL (not fabricated)
- Contribution margin v1 = gross margin (no overhead allocation yet)

### Commits
- `c760eb1` wave-7: pricing engine v1

### How to Test
```bash
cd api && npx wrangler dev --local
# POST /api/pricing/extract
# POST /api/pricing/compute-margins
# GET  /api/pricing/margin-by-channel
# GET  /api/pricing/margin-query?sku=ABC&period=2025-12
# Verify: gross_margin = selling_price - unit_cost
# Verify: gross_margin_pct = (gross_margin / selling_price) * 100
```

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/pricing/extract | Extract selling prices from ACCREC invoices |
| POST | /api/pricing/compute-margins | Compute margins (join pricing + CoGS) |
| GET  | /api/pricing/margin-by-channel | Margin aggregated by channel/period |
| GET  | /api/pricing/margin-query | Query margin results (optional: ?sku=, ?channel=, ?period=) |

---

## Wave 8 — Reporting Wiring

### What Changed
- `reportIngestion()` — entity counts + recent syncs + Xero connection status
- `reportFinancials()` — revenue vs expense by period, pivoted format
- `reportCogs()` — CoGS results with optional period filter
- `reportMargin()` — margin results with channel summary + item detail
- `checkReportRole()` — role gating helper (admin vs partner via X-User-Role header)
- All report routes role-gated: ingestion/financials/cogs = admin, margin = partner+
- `reports.html` rewritten — tabbed interface (Financial Summary, CoGS by SKU, Margin Analysis, Ingestion Status, Monthly Deck) wired to real API endpoints
- `index.html` updated — Admin dropdown in desktop nav + mobile menu (admin-only, data-auth-role="admin")
- Sales UI verified clean — no misplaced report/dashboard elements
- Admin UI verified clean — sync-status and users remain ops-only

### Commits
- `1957f03` wave-8: reporting wiring

### How to Test
```bash
cd api && npx wrangler dev --local
# GET  /api/reports/ingestion   (requires X-User-Role: admin)
# GET  /api/reports/financials  (requires X-User-Role: admin)
# GET  /api/reports/cogs        (requires X-User-Role: admin)
# GET  /api/reports/margin      (requires X-User-Role: partner or admin)
# Open reports.html — tabs should load data from endpoints
# Open index.html — Admin dropdown visible only for admin role
# Mobile menu — Admin section visible only for admin role
```

### Endpoints
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/reports/ingestion | Entity counts + sync status (admin) |
| GET | /api/reports/financials | Revenue vs expense by period (admin) |
| GET | /api/reports/cogs | CoGS by SKU with optional ?period= (admin) |
| GET | /api/reports/margin | Margin results + channel summary (partner+) |
