-- 015_normalised_documents.sql — Normalised financial document model

CREATE TABLE IF NOT EXISTS normalised_documents (
  id              TEXT PRIMARY KEY,
  entity_type     TEXT NOT NULL,          -- 'revenue' (ACCREC) or 'expense' (ACCPAY)
  xero_invoice_id TEXT NOT NULL,
  invoice_number  TEXT,
  contact_name    TEXT,
  xero_contact_id TEXT,
  invoice_date    TEXT,
  due_date        TEXT,
  currency_code   TEXT DEFAULT 'IDR',
  sub_total       REAL,
  total_tax       REAL,
  total           REAL,
  status          TEXT,
  period          TEXT,                   -- YYYY-MM derived from invoice_date
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(xero_invoice_id)
);
CREATE INDEX IF NOT EXISTS idx_nd_entity_type ON normalised_documents(entity_type);
CREATE INDEX IF NOT EXISTS idx_nd_period ON normalised_documents(period);
CREATE INDEX IF NOT EXISTS idx_nd_contact ON normalised_documents(contact_name);
