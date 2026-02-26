-- 019_pricing_inputs.sql — Pricing inputs: selling prices per SKU per channel

CREATE TABLE IF NOT EXISTS pricing_inputs (
  id              TEXT PRIMARY KEY,
  item_code       TEXT NOT NULL,
  channel         TEXT,                    -- distributor/contact name
  distributor     TEXT,                    -- xero contact name
  selling_price   REAL,                    -- average unit price from ACCREC invoices
  effective_date  TEXT,                    -- latest invoice date for this price point
  period          TEXT,                    -- YYYY-MM
  currency_code   TEXT DEFAULT 'IDR',
  total_revenue   REAL DEFAULT 0,          -- total line_total for this SKU/channel/period
  total_quantity  REAL DEFAULT 0,          -- total quantity for averaging
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(item_code, channel, period)
);
CREATE INDEX IF NOT EXISTS idx_pi_item ON pricing_inputs(item_code);
CREATE INDEX IF NOT EXISTS idx_pi_channel ON pricing_inputs(channel);
CREATE INDEX IF NOT EXISTS idx_pi_period ON pricing_inputs(period);
