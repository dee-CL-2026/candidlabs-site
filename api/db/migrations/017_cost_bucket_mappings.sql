-- 017_cost_bucket_mappings.sql — Account code to cost bucket mapping (table-driven)

CREATE TABLE IF NOT EXISTS cost_bucket_mappings (
  id              TEXT PRIMARY KEY,
  account_code    TEXT NOT NULL,
  account_name    TEXT,
  cost_bucket     TEXT NOT NULL,          -- RM, RP, Production, Freight, Marketing, Other
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(account_code)
);
CREATE INDEX IF NOT EXISTS idx_cbm_bucket ON cost_bucket_mappings(cost_bucket);
