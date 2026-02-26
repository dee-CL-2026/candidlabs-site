# Xero Integration Plan v1.0

> Generated 2026-02-26.
> Sources: Deep analysis of GAS Xero consumption (cleanReceivables.js, cleanPayables.js, ARAPSnapshot.js, Costing_Engine.js, Xero transformer.js) + Xero API research.
>
> Purpose: Replace manual Xero → Google Sheets paste workflow with automated API sync into D1.

---

## 1. Current State: What Xero Data We Use

All Xero data is currently **pasted manually** into Google Sheets, then processed by GAS pipeline functions.

### 1.1 Sales Invoices (Receivables)

**GAS files:** `cleanReceivables.js`, `buildRevenueMaster.js`, `Xero transformer.js`, `margin.js`

**Raw Sheet:** `RECEIVABLE_DETAIL_RAW` — 18 columns from Xero export:

| Col | Xero Field | Type | Notes |
|-----|-----------|------|-------|
| A | Invoice Number | String | Or Contact name (header row) |
| B | Invoice Date | Date | dd/MM/yyyy |
| C | Source (Currency) | String | e.g. "IDR" |
| D | Reference | String | PO reference |
| E | Item Code | String | Xero product code |
| F | Description | String | Line item description |
| G | Quantity | Number | |
| H | Unit Price (Source) | Number | In original currency |
| I | Discount (Source) | Number | |
| J | Tax (Source) | Number | |
| K | Gross (Source) | Number | Line total |
| L | Invoice Total (Source) | Number | |
| M | Unit Price (IDR) | Number | Converted |
| N | Discount (IDR) | Number | |
| O | Tax (IDR) | Number | |
| P | Gross (IDR) | Number | |
| Q | Invoice Total (IDR) | Number | |
| R | Status | String | AUTHORISED, VOIDED, DRAFT, etc. |

**Special structure:** Raw data includes contact header rows (only column A filled, rest blank). Line items follow after each contact header. "Total" rows and VOIDED/DELETED/DRAFT invoices are excluded during processing.

**Clean output:** `RECEIVABLE_DETAIL_CLEAN` — 19 columns:
```
Invoice_Date, Customer_Name, Invoice_Number, Line_Description, Item_Code,
Quantity, Unit_Price_Source, Discount_Source, Tax_Source, Gross_Source,
Invoice_Total_Source, Currency, FX_Rate, Unit_Price_IDR, Discount_IDR,
Tax_IDR, Gross_IDR, Invoice_Total_IDR, Status
```

**Downstream consumers:**
- `buildRevenueMaster.js` → joins with CONFIG_MAPPING → SALES_REVENUE_MASTER
- `Xero transformer.js` → aggregates by month → DECK_METRICS.Total_Revenue
- `margin.js` → reads SALES_REVENUE_MASTER + SKU_COSTING_MASTER → gross margin %

---

### 1.2 Purchase Invoices (Payables)

**GAS files:** `cleanPayables.js`, `Costing_Engine.js`, `build_batch_cogs.js`

**Raw Sheet:** `PAYABLE_DETAIL_RAW` — dynamic column mapping, expected Xero fields:

| Xero Field | Type | Notes |
|-----------|------|-------|
| Invoice Date | Date | dd/MM/yyyy |
| Reference | String | Invoice/PO number |
| Description | String | Line item description |
| Item Code | String | Xero product code |
| Quantity | Number | |
| Unit Price (ex) (Source) | Number | Exclusive of tax |
| Tax (Source) | Number | |
| Gross (Source) | Number | Line total |
| Invoice Total (Source) | Number | |
| Unit Price (ex) (IDR) | Number | |
| Tax (IDR) | Number | |
| Gross (IDR) | Number | |
| Invoice Total (IDR) | Number | |
| Status | String | VOIDED entries excluded |

**Special structure:** Same as receivables — supplier header rows (first column only), then line items.

**Clean output:** `PAYABLE_DETAIL_CLEAN` — 18 columns:
```
Invoice_Date, Supplier_Name, Invoice_Number, Line_Description, Item_Code,
Quantity, Unit_Price_Source, Tax_Source, Gross_Source, Invoice_Total_Source,
Currency, FX_Rate, Unit_Price_IDR, Tax_IDR, Gross_IDR, Invoice_Total_IDR,
Cost_Category, Notes
```

**Downstream consumers:**
- `Costing_Engine.js` → WAC (weighted average cost) from actual POs → SKU_COSTING_MASTER
- `build_batch_cogs.js` → per-batch COGS from component cost history
- `buildPurchaseSummary.js` → purchase aggregation

---

### 1.3 Aged Receivables & Payables

**GAS file:** `ARAPSnapshot.js`

**Raw Sheets:** `AGED_RECEIVABLES_RAW`, `AGED_PAYABLES_RAW` — 8 columns:

| Col | Field | Type |
|-----|-------|------|
| A | Contact Name | String |
| B | Current | Number |
| C | < 1 Month | Number |
| D | 1 Month | Number |
| E | 2 Months | Number |
| F | 3 Months | Number |
| G | Older | Number |
| H | Total | Number |

**Number handling:** Thousands separators stripped, parentheses = negative. Xero footer rows skipped ("Total", "Total Aged Payables", "Percentage of Total"). All-zero rows skipped.

**Output:** `AR_AP_SUMMARY` — 11 columns:
```
Snapshot_Date, Metric_Type (AR/AP), Contact_Name,
Bucket_Current, Bucket_LT_1_Month, Bucket_1_Month,
Bucket_2_Months, Bucket_3_Months, Bucket_Older, Total, Notes
```

---

### 1.4 Items / Product Catalog

**GAS file:** `Costing_Engine.js`

**Sheet:** `CONFIG_XERO_ITEMS` — 3 columns:

| Col | Field | Type |
|-----|-------|------|
| A | Code | String (trimmed) |
| B | Name | String |
| C | Cost Price | Number (commas stripped) |

**Usage:** Tier 2 of the 3-tier costing waterfall:
1. Actual POs (WAC from payables) — highest priority
2. **Standard Cost (CONFIG_XERO_ITEMS)** — fallback
3. BOM estimate (static CSV) — last resort

---

### 1.5 Summary: Current Data Flow

```
MANUAL PASTE (monthly):
  Xero UI → Export CSV → Paste into Google Sheet

PROCESSING (GAS pipelines):
  Receivables: RAW → cleanReceivables → buildRevenueMaster → margin → deck metrics
  Payables:    RAW → cleanPayables → costingEngine → batchCOGS
  Aged:        RAW → ARAPSnapshot → AR_AP_SUMMARY
  Items:       Xero product list → CONFIG_XERO_ITEMS → costingEngine tier 2
```

---

## 2. Xero API: What's Available

### 2.1 Authentication

Xero uses **OAuth 2.0 Authorization Code flow**.

| Step | Detail |
|------|--------|
| Authorize | Redirect to `https://login.xero.com/identity/connect/authorize` |
| Token exchange | POST `https://identity.xero.com/connect/token` |
| Access token | Valid **30 minutes** |
| Refresh token | Valid **60 days** of inactivity. Rotates on each use (old token invalidated, new one returned). 30-min grace period for retries. |
| Tenant ID | Required header (`Xero-tenant-id`) — get from `GET /connections` after auth |

**Scopes needed:**

| Scope | Grants access to |
|-------|-----------------|
| `offline_access` | Refresh tokens (required for background sync) |
| `accounting.transactions.read` | Invoices (sales + purchase), credit notes, bank transactions |
| `accounting.contacts.read` | Customer and supplier contacts |
| `accounting.reports.read` | Aged receivables/payables, P&L, Balance Sheet |
| `accounting.settings.read` | Tax rates, accounts, tracking categories |

**Granular scopes transition:** Apps created after March 2, 2026 must use granular scopes. `accounting.transactions` splits into `accounting.invoices` + `accounting.payments`. Plan accordingly.

**Cloudflare Workers compatibility:** OAuth 2.0 is pure HTTP (redirects + `fetch()` POST calls). Works perfectly in Workers. Store tokens in D1.

---

### 2.2 Key Endpoints

Base URL: `https://api.xro/2.0/`

| Endpoint | Maps to | Notes |
|----------|---------|-------|
| `GET /Invoices?where=Type=="ACCREC"` | Sales invoices (receivables) | Filter by date, status. Includes LineItems with ItemCode, Quantity, UnitAmount, TaxAmount, LineAmount |
| `GET /Invoices?where=Type=="ACCPAY"` | Purchase invoices (payables) | Same structure, different Type |
| `GET /Items` | Product catalog + costs | Returns Code, Name, PurchaseDetails.UnitPrice (= standard cost), SalesDetails.UnitPrice |
| `GET /Contacts` | Customers + suppliers | Name, Type (CUSTOMER/VENDOR), ContactStatus |
| `GET /BankTransactions` | Bank transactions | For future cash flow features |
| `GET /Reports/ProfitAndLoss` | P&L report | Rows/cells format — needs parsing |
| `GET /Reports/BalanceSheet` | Balance sheet | Same rows/cells format |

**Aged reports — DO NOT USE the per-contact API.** `GET /Reports/AgedReceivablesByContact?contactID={id}` only returns one contact at a time. With hundreds of contacts, you'd burn the entire daily quota. **Calculate aging buckets from invoice data instead** — the logic already exists in `ARAPSnapshot.js`.

---

### 2.3 Invoice Response Structure

```json
{
  "Invoices": [
    {
      "InvoiceID": "a1b2c3d4-...",
      "InvoiceNumber": "INV-0001",
      "Type": "ACCREC",
      "Status": "AUTHORISED",
      "Contact": {
        "ContactID": "x1y2z3...",
        "Name": "PT Sari Rasa"
      },
      "Date": "2025-06-15",
      "DueDate": "2025-07-15",
      "CurrencyCode": "IDR",
      "SubTotal": 1000000,
      "TotalTax": 110000,
      "Total": 1110000,
      "AmountDue": 1110000,
      "AmountPaid": 0,
      "Reference": "PO-12345",
      "LineItems": [
        {
          "Description": "Candid Club Soda 250ml x24",
          "Quantity": 24.0,
          "UnitAmount": 25000,
          "ItemCode": "CS_250_CAN",
          "TaxType": "OUTPUT2",
          "TaxAmount": 66000,
          "LineAmount": 600000,
          "DiscountRate": 0.0,
          "Tracking": [
            { "Name": "Channel", "Option": "Distributor" }
          ]
        }
      ],
      "UpdatedDateUTC": "2025-06-15T10:30:00"
    }
  ]
}
```

**Key mappings to current GAS fields:**

| Xero API field | Current GAS column | D1 column |
|---------------|-------------------|-----------|
| `InvoiceNumber` | Invoice Number | invoice_number |
| `Date` | Invoice Date | invoice_date |
| `Contact.Name` | Customer_Name / Supplier_Name | contact_name |
| `CurrencyCode` | Currency | currency |
| `Reference` | Reference | reference |
| `LineItems[].ItemCode` | Item Code | item_code |
| `LineItems[].Description` | Description | description |
| `LineItems[].Quantity` | Quantity | quantity |
| `LineItems[].UnitAmount` | Unit Price | unit_amount |
| `LineItems[].TaxAmount` | Tax | tax_amount |
| `LineItems[].LineAmount` | Gross | line_amount |
| `Total` | Invoice Total | total |
| `Status` | Status | status |
| `AmountDue` | (not used yet) | amount_due |
| `AmountPaid` | (not used yet) | amount_paid |
| `LineItems[].Tracking` | (not used yet) | tracking (JSON) |

---

### 2.4 Rate Limits

| Limit | Value |
|-------|-------|
| Per-minute | 60 calls/min per org per app |
| Daily | 5,000 calls/day per org per app |
| Concurrent | 5 simultaneous calls |
| App-wide | 10,000 calls/min across all orgs |

**Implication:** Daily incremental sync easily fits within limits. A full initial pull of all historical invoices might need throttling.

---

### 2.5 Pagination

- Page-based: `?page=1&pageSize=1000` (max 1000 per page)
- Keep incrementing page until empty result
- For date-range pulls: `?where=Date >= DateTime(2025,01,01) AND Date <= DateTime(2025,12,31)&page=1&pageSize=1000`

---

### 2.6 Incremental Sync

Use `If-Modified-Since` header with ISO 8601 timestamp. Returns only records created or modified after that date. **This is the most efficient approach for daily sync.**

---

### 2.7 Webhooks

| Aspect | Detail |
|--------|--------|
| Supported events | Invoices (created/updated), Contacts (created/updated) |
| NOT supported | Bank transactions, payments, items, reports |
| Payload | Contains only IDs — you must fetch the full record via API |
| Response requirement | 200 OK within 5 seconds |
| Security | HMAC-SHA256 signature in `x-xero-signature` header |
| Workers fit | Excellent — HTTP POST handler with Web Crypto API for HMAC verification |

**Use webhooks for near-real-time invoice updates between daily syncs.**

---

### 2.8 SDK Considerations

The official `xero-node` SDK uses axios (Node.js HTTP). **Not compatible with Cloudflare Workers** without shims.

**Recommendation: Build a thin `fetch()` client.** The Xero API is straightforward REST/JSON — only ~10 endpoints needed. No SDK overhead, no compatibility issues.

---

## 3. Target Architecture

### 3.1 System Diagram

```
┌──────────────────────────────────────────────────┐
│  Xero (Cloud)                                     │
│  - Invoices (ACCREC + ACCPAY)                     │
│  - Items (product catalog + costs)                │
│  - Contacts (customers + suppliers)               │
│  - Reports (P&L, Balance Sheet)                   │
│  - Webhooks → push invoice/contact changes        │
└───────────────────────┬──────────────────────────┘
                        │
              fetch() + Bearer token
              Xero-tenant-id header
                        │
┌───────────────────────▼──────────────────────────┐
│  Cloudflare Worker                                │
│                                                   │
│  XERO AUTH ROUTES:                                │
│  POST /api/xero/connect         OAuth start       │
│  GET  /api/xero/callback        OAuth callback    │
│  GET  /api/xero/status          Connection status │
│                                                   │
│  SYNC ROUTES:                                     │
│  POST /api/xero/sync/invoices   Pull invoices     │
│  POST /api/xero/sync/items      Pull items        │
│  POST /api/xero/sync/contacts   Pull contacts     │
│  POST /api/xero/sync/all        Full sync         │
│                                                   │
│  WEBHOOK ROUTE:                                   │
│  POST /api/xero/webhook         Receive push      │
│                                                   │
│  CRON TRIGGER:                                    │
│  Daily at 06:00 WIB → incremental sync            │
│                                                   │
│  PROCESSING (replaces GAS pipelines):             │
│  POST /api/xero/process/receivables  (clean)      │
│  POST /api/xero/process/payables     (clean)      │
│  POST /api/xero/process/arap         (snapshot)   │
│  POST /api/xero/process/costing      (waterfall)  │
└───────────────────────┬──────────────────────────┘
                        │
              Parsed, transformed, stored
                        │
┌───────────────────────▼──────────────────────────┐
│  D1 Database                                      │
│                                                   │
│  RAW XERO TABLES (API mirror):                    │
│  ├─ xero_tokens        (OAuth tokens)             │
│  ├─ xero_invoices      (invoice headers)          │
│  ├─ xero_line_items    (invoice line items)       │
│  ├─ xero_contacts      (customers + suppliers)    │
│  ├─ xero_items         (product catalog)          │
│  └─ xero_sync_log      (sync audit trail)         │
│                                                   │
│  PROCESSED TABLES (from migration Waves 2-3):     │
│  ├─ revenue_transactions  (from receivables)      │
│  ├─ payables              (from payables)          │
│  ├─ sku_costing           (from costing engine)   │
│  ├─ arap_snapshots        (from invoice aging)    │
│  ├─ deck_metrics          (from revenue agg)      │
│  └─ account_mapping       (venue hierarchy)       │
└──────────────────────────────────────────────────┘
```

### 3.2 Proposed D1 Tables (Xero Layer)

```sql
-- OAuth token storage (single row per Xero org connection)
CREATE TABLE xero_tokens (
  id              TEXT PRIMARY KEY DEFAULT 'default',
  tenant_id       TEXT NOT NULL,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  token_type      TEXT DEFAULT 'Bearer',
  expires_at      TEXT NOT NULL,
  scopes          TEXT,
  connected_at    TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- Raw invoice headers (both ACCREC and ACCPAY)
CREATE TABLE xero_invoices (
  id              TEXT PRIMARY KEY,
  xero_invoice_id TEXT UNIQUE NOT NULL,
  invoice_number  TEXT,
  type            TEXT NOT NULL,
  status          TEXT NOT NULL,
  contact_name    TEXT,
  xero_contact_id TEXT,
  invoice_date    TEXT,
  due_date        TEXT,
  currency_code   TEXT DEFAULT 'IDR',
  sub_total       REAL,
  total_tax       REAL,
  total           REAL,
  amount_due      REAL,
  amount_paid     REAL,
  reference       TEXT,
  updated_date_utc TEXT,
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_xero_inv_type ON xero_invoices(type);
CREATE INDEX idx_xero_inv_status ON xero_invoices(status);
CREATE INDEX idx_xero_inv_date ON xero_invoices(invoice_date);
CREATE INDEX idx_xero_inv_contact ON xero_invoices(contact_name);
CREATE INDEX idx_xero_inv_xero_id ON xero_invoices(xero_invoice_id);

-- Raw line items (one per invoice line)
CREATE TABLE xero_line_items (
  id              TEXT PRIMARY KEY,
  xero_invoice_id TEXT NOT NULL,
  item_code       TEXT,
  description     TEXT,
  quantity        REAL,
  unit_amount     REAL,
  tax_amount      REAL,
  line_amount     REAL,
  discount_rate   REAL DEFAULT 0,
  account_code    TEXT,
  tax_type        TEXT,
  tracking        TEXT DEFAULT '[]',
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (xero_invoice_id) REFERENCES xero_invoices(xero_invoice_id) ON DELETE CASCADE
);
CREATE INDEX idx_xero_li_invoice ON xero_line_items(xero_invoice_id);
CREATE INDEX idx_xero_li_item ON xero_line_items(item_code);

-- Contacts (customers + suppliers)
CREATE TABLE xero_contacts (
  id              TEXT PRIMARY KEY,
  xero_contact_id TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  contact_type    TEXT,
  email           TEXT,
  phone           TEXT,
  tax_number      TEXT,
  contact_status  TEXT,
  is_customer     INTEGER DEFAULT 0,
  is_supplier     INTEGER DEFAULT 0,
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_xero_contact_name ON xero_contacts(name);
CREATE INDEX idx_xero_contact_type ON xero_contacts(contact_type);

-- Items / product catalog
CREATE TABLE xero_items (
  id              TEXT PRIMARY KEY,
  xero_item_id    TEXT UNIQUE NOT NULL,
  code            TEXT UNIQUE,
  name            TEXT,
  description     TEXT,
  purchase_cost   REAL,
  sales_price     REAL,
  is_tracked      INTEGER DEFAULT 0,
  is_sold         INTEGER DEFAULT 1,
  is_purchased    INTEGER DEFAULT 1,
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_xero_item_code ON xero_items(code);

-- Sync audit log
CREATE TABLE xero_sync_log (
  id              TEXT PRIMARY KEY,
  sync_type       TEXT NOT NULL,
  started_at      TEXT DEFAULT (datetime('now')),
  finished_at     TEXT,
  records_fetched INTEGER DEFAULT 0,
  records_upserted INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'running',
  error           TEXT,
  meta            TEXT DEFAULT '{}'
);
CREATE INDEX idx_xero_sync_type ON xero_sync_log(sync_type);
```

---

## 4. Sync Strategy

### 4.1 Initial Load (one-time)

Pull all historical data within rate limits:

| Data | Estimated volume | API calls needed | Time |
|------|-----------------|-----------------|------|
| Sales invoices (2 years) | ~2,000 invoices | 2 pages × 1 call | ~2 calls |
| Purchase invoices (2 years) | ~1,000 invoices | 1 page | ~1 call |
| Items | ~50 items | 1 call | ~1 call |
| Contacts | ~500 contacts | 1 page | ~1 call |
| **Total** | | **~5 calls** | **< 1 minute** |

Small volume — initial load is trivial.

### 4.2 Daily Incremental Sync (cron)

```
Schedule: 0 23 * * * (06:00 WIB = 23:00 UTC previous day)

Steps:
1. Refresh OAuth token if expired
2. GET /Invoices?where=Type=="ACCREC" with If-Modified-Since header → upsert xero_invoices + xero_line_items
3. GET /Invoices?where=Type=="ACCPAY" with If-Modified-Since header → upsert
4. GET /Items with If-Modified-Since → upsert xero_items
5. Log to xero_sync_log

Estimated daily calls: 3-5 (well within 5,000/day limit)
```

### 4.3 Webhook (near-real-time)

```
POST /api/xero/webhook
1. Verify HMAC-SHA256 signature
2. Parse event (invoice created/updated)
3. GET /Invoices/{InvoiceID} to fetch full record
4. Upsert into xero_invoices + xero_line_items
5. Return 200 OK within 5 seconds

Estimated calls per event: 1 (fetch full record)
```

### 4.4 Processing Pipeline (replaces GAS)

After sync, run processing to populate business tables:

```
POST /api/xero/process/all
1. Clean receivables:
   xero_invoices (ACCREC) + xero_line_items → revenue_transactions
   (replaces cleanReceivables.js + buildRevenueMaster.js)

2. Clean payables:
   xero_invoices (ACCPAY) + xero_line_items → payables
   (replaces cleanPayables.js)

3. ARAP snapshot:
   xero_invoices (AmountDue > 0, grouped by age buckets) → arap_snapshots
   (replaces ARAPSnapshot.js — calculated from invoice data, no per-contact API)

4. Costing refresh:
   xero_items.purchase_cost + payables WAC + bom_components → sku_costing
   (replaces Costing_Engine.js 3-tier waterfall)

5. Metrics refresh:
   revenue_transactions aggregated by month → deck_metrics
   (replaces Xero transformer.js + deck_metrics_builder.js)
```

---

## 5. ARAP Aging: Calculated from Invoice Data

Instead of using Xero's per-contact aged reports API (which costs 1 API call per contact), calculate aging buckets directly from `xero_invoices`:

```sql
-- Example: Aged receivables as of today
SELECT
  contact_name,
  SUM(CASE WHEN julianday('now') - julianday(due_date) <= 0 THEN amount_due ELSE 0 END) AS bucket_current,
  SUM(CASE WHEN julianday('now') - julianday(due_date) BETWEEN 1 AND 30 THEN amount_due ELSE 0 END) AS bucket_lt_1mo,
  SUM(CASE WHEN julianday('now') - julianday(due_date) BETWEEN 31 AND 60 THEN amount_due ELSE 0 END) AS bucket_1mo,
  SUM(CASE WHEN julianday('now') - julianday(due_date) BETWEEN 61 AND 90 THEN amount_due ELSE 0 END) AS bucket_2mo,
  SUM(CASE WHEN julianday('now') - julianday(due_date) BETWEEN 91 AND 120 THEN amount_due ELSE 0 END) AS bucket_3mo,
  SUM(CASE WHEN julianday('now') - julianday(due_date) > 120 THEN amount_due ELSE 0 END) AS bucket_older,
  SUM(amount_due) AS total
FROM xero_invoices
WHERE type = 'ACCREC'
  AND status IN ('AUTHORISED', 'SUBMITTED')
  AND amount_due > 0
GROUP BY contact_name
ORDER BY total DESC;
```

**Zero API calls. Instant. Always up to date.**

---

## 6. Phased Rollout

### Phase A: Xero Sync Layer (build now — before GAS migration)

Build as a standalone addition to the Worker. No GAS changes needed.

| Deliverable | Description |
|------------|-------------|
| D1 migration `007_xero.sql` | xero_tokens, xero_invoices, xero_line_items, xero_contacts, xero_items, xero_sync_log |
| Xero auth module | OAuth connect/callback/refresh using `fetch()` |
| Sync module | Pull invoices, items, contacts with incremental sync |
| Webhook handler | HMAC verification + invoice/contact upsert |
| Cron trigger | Daily sync at 06:00 WIB |
| Admin UI | `/admin/xero.html` — connection status, sync history, manual trigger |

**This runs alongside existing GAS.** Data flows into D1 in parallel — no disruption.

### Phase B: Wire Migrated Pipelines (during Waves 2–3)

When sales-master and production-master functions migrate to Worker, point them at `xero_invoices` / `xero_line_items` / `xero_items` in D1 instead of Google Sheets.

| GAS function | Reads from (current) | Reads from (migrated) |
|-------------|---------------------|----------------------|
| cleanReceivables | RECEIVABLE_DETAIL_RAW sheet | xero_invoices + xero_line_items (ACCREC) |
| buildRevenueMaster | RECEIVABLE_DETAIL_CLEAN sheet | revenue_transactions (processed from xero data) |
| cleanPayables | PAYABLE_DETAIL_RAW sheet | xero_invoices + xero_line_items (ACCPAY) |
| Costing_Engine (tier 2) | CONFIG_XERO_ITEMS sheet | xero_items.purchase_cost |
| ARAPSnapshot | AGED_*_RAW sheets | Calculated from xero_invoices (SQL query) |
| Xero transformer | RECEIVABLE_DETAIL_RAW sheet | xero_invoices aggregated by month |

### Phase C: Predictive Features (post-migration)

With live Xero data in D1, new capabilities become possible:

| Feature | Data source | Logic |
|---------|------------|-------|
| Stock depletion forecast | production_runs + revenue_transactions (sales velocity) | Days of stock = current_stock / avg_daily_sales |
| Margin trend alerts | sku_costing + revenue_transactions | Flag when GM drops below threshold |
| Cash flow projection | xero_invoices (AmountDue + DueDate) | Project inflows/outflows by week |
| Auto deck metrics | xero data + D1 processing | Daily refresh instead of monthly manual |
| Supplier cost tracking | xero_invoices (ACCPAY) over time | Component cost trends, WAC history |
| Revenue forecasting | revenue_transactions time series | Simple trend extrapolation |

---

## 7. Migration Number Update

With Xero sync as Phase A (pre-migration), the D1 migration numbering shifts:

| Migration | Tables | Context |
|-----------|--------|---------|
| 007_xero.sql | xero_tokens, xero_invoices, xero_line_items, xero_contacts, xero_items, xero_sync_log | **Phase A (now)** |
| 008_agreements.sql | agreements | Wave 1 (KAA) |
| 009_jobs.sql | jobs, job_logs | Wave 1 (infrastructure) |
| 010_sales.sql | revenue_transactions, account_mapping, account_status, deck_metrics | Wave 2 |
| 011_production.sql | production_runs, bom_components, component_costs, sku_costing, batch_cogs, payables, arap_snapshots | Wave 3 |
| 012_loans.sql | lenders, loan_transactions, loan_ledger | Wave 4 |
| 013_pricing.sql | pricing | Wave 5 |

**Projected total after all waves: 36 D1 tables (12 existing + 6 Xero + 18 migration)**

---

## 8. Implementation Notes

### No Xero SDK
The official `xero-node` uses axios (Node.js-only). Build a thin `fetch()` client instead — the API is ~10 endpoints of straightforward REST/JSON.

### Token Storage Safety
Refresh tokens rotate on each use. If you lose a new refresh token (network failure), Xero allows retry with the old token for 30 minutes. Store tokens atomically in D1 with a transaction.

### FX Handling
Current GAS code hardcodes FX_Rate = 1 and Currency = "IDR". The Xero API returns `CurrencyCode` per invoice. For now, maintain the same assumption. Future enhancement: real FX conversion using Xero's `CurrencyRate` field on invoices.

### Status Filtering
Current GAS code excludes VOIDED, DELETED, DRAFT invoices. When syncing from API, store all statuses in `xero_invoices` but filter during processing:
```sql
WHERE status IN ('AUTHORISED', 'SUBMITTED', 'PAID')
```

### Date Formats
Xero API returns ISO 8601 dates (`2025-06-15`). Current GAS code expects `dd/MM/yyyy`. The D1 layer stores ISO format; formatting happens at the UI/export layer only.

---

## Appendix: Open Questions

1. **Xero org credentials** — Who has admin access to the Xero Developer Portal to create an OAuth app?
2. **Historical depth** — How far back should the initial load go? (All time? Last 2 years?)
3. **Multi-currency** — Any invoices in non-IDR currencies? If so, what FX source to use?
4. **Tracking categories** — Are Xero tracking categories (Channel, Region) used? The API returns them on line items.
5. **Bank transactions** — Pull now for future cash flow features, or defer?
