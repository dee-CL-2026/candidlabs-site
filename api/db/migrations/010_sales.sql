-- 010_sales.sql
-- Wave 2: Sales pipeline tables (revenue, accounts, metrics)

-- revenue_transactions — Revenue fact table (replaces SALES_REVENUE_MASTER sheet)
CREATE TABLE IF NOT EXISTS revenue_transactions (
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
CREATE INDEX IF NOT EXISTS idx_rev_txn_date ON revenue_transactions(invoice_date);
CREATE INDEX IF NOT EXISTS idx_rev_txn_account ON revenue_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_rev_txn_sku ON revenue_transactions(sku_code);

-- account_mapping — Venue-to-account hierarchy (replaces CONFIG_MAPPING sheet)
CREATE TABLE IF NOT EXISTS account_mapping (
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
CREATE INDEX IF NOT EXISTS idx_acct_map_raw ON account_mapping(raw_value);
CREATE INDEX IF NOT EXISTS idx_acct_map_account ON account_mapping(account_id);

-- account_status — Account health snapshots (replaces ACCOUNT_STATUS sheet)
CREATE TABLE IF NOT EXISTS account_status (
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
CREATE INDEX IF NOT EXISTS idx_acct_status_snap ON account_status(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_acct_status_account ON account_status(account_id);

-- deck_metrics — Monthly deck KPI snapshots (replaces DECK_METRICS sheet)
CREATE TABLE IF NOT EXISTS deck_metrics (
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
CREATE INDEX IF NOT EXISTS idx_deck_month ON deck_metrics(month_key);
