-- 020_margin_results.sql — Margin results per SKU per channel per period

CREATE TABLE IF NOT EXISTS margin_results (
  id                  TEXT PRIMARY KEY,
  item_code           TEXT NOT NULL,
  item_name           TEXT,
  channel             TEXT,                -- distributor/contact name
  period              TEXT NOT NULL,       -- YYYY-MM
  selling_price       REAL,               -- avg selling price per unit
  unit_cost           REAL,               -- from cogs_results
  gross_margin        REAL,               -- selling_price - unit_cost
  gross_margin_pct    REAL,               -- (gross_margin / selling_price) * 100
  contribution_margin REAL,               -- v1 = gross_margin (no overhead allocation yet)
  total_revenue       REAL DEFAULT 0,
  total_quantity      REAL DEFAULT 0,
  created_at          TEXT DEFAULT (datetime('now')),
  updated_at          TEXT DEFAULT (datetime('now')),
  UNIQUE(item_code, channel, period)
);
CREATE INDEX IF NOT EXISTS idx_mr_item ON margin_results(item_code);
CREATE INDEX IF NOT EXISTS idx_mr_channel ON margin_results(channel);
CREATE INDEX IF NOT EXISTS idx_mr_period ON margin_results(period);
