-- 013_xero_payments.sql — Xero payments mirror

CREATE TABLE IF NOT EXISTS xero_payments (
  id              TEXT PRIMARY KEY,
  xero_payment_id TEXT UNIQUE NOT NULL,
  xero_invoice_id TEXT,
  invoice_number  TEXT,
  payment_type    TEXT,
  status          TEXT,
  date            TEXT,
  amount          REAL,
  currency_code   TEXT DEFAULT 'IDR',
  reference       TEXT,
  is_reconciled   INTEGER DEFAULT 0,
  account_code    TEXT,
  account_name    TEXT,
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_xero_pay_invoice ON xero_payments(xero_invoice_id);
CREATE INDEX IF NOT EXISTS idx_xero_pay_date ON xero_payments(date);
CREATE INDEX IF NOT EXISTS idx_xero_pay_status ON xero_payments(status);
