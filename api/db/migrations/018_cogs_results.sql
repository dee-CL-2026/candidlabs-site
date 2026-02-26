-- 018_cogs_results.sql — CoGS results per SKU per period

CREATE TABLE IF NOT EXISTS cogs_results (
  id              TEXT PRIMARY KEY,
  item_code       TEXT NOT NULL,
  item_name       TEXT,
  period          TEXT NOT NULL,           -- YYYY-MM
  rm_cost         REAL DEFAULT 0,          -- Raw Materials total
  rp_cost         REAL DEFAULT 0,          -- Raw Packaging total
  prod_cost       REAL DEFAULT 0,          -- Production total
  total_cost      REAL DEFAULT 0,          -- rm + rp + prod
  units           REAL DEFAULT 0,          -- units produced/sold
  unit_cost       REAL,                    -- total_cost / units (NULL if units=0)
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(item_code, period)
);
CREATE INDEX IF NOT EXISTS idx_cogs_item ON cogs_results(item_code);
CREATE INDEX IF NOT EXISTS idx_cogs_period ON cogs_results(period);
