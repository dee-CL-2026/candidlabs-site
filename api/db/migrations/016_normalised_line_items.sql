-- 016_normalised_line_items.sql — Normalised line items with cost bucket

CREATE TABLE IF NOT EXISTS normalised_line_items (
  id              TEXT PRIMARY KEY,
  entity_type     TEXT NOT NULL,          -- 'revenue' or 'expense'
  document_id     TEXT NOT NULL,          -- FK to normalised_documents.id
  xero_invoice_id TEXT NOT NULL,
  line_id         TEXT,                   -- original xero line item id
  item_code       TEXT,
  description     TEXT,
  quantity        REAL,
  unit_amount     REAL,
  line_total      REAL,
  account_code    TEXT,
  tax_type        TEXT,
  cost_bucket     TEXT,                   -- RM, RP, Production, Freight, Marketing, Other, NULL
  period          TEXT,                   -- YYYY-MM
  created_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(xero_invoice_id, line_id)
);
CREATE INDEX IF NOT EXISTS idx_nli_entity ON normalised_line_items(entity_type);
CREATE INDEX IF NOT EXISTS idx_nli_document ON normalised_line_items(document_id);
CREATE INDEX IF NOT EXISTS idx_nli_item_code ON normalised_line_items(item_code);
CREATE INDEX IF NOT EXISTS idx_nli_cost_bucket ON normalised_line_items(cost_bucket);
CREATE INDEX IF NOT EXISTS idx_nli_period ON normalised_line_items(period);
CREATE INDEX IF NOT EXISTS idx_nli_account ON normalised_line_items(account_code);
