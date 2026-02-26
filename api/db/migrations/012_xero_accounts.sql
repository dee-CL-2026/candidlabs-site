-- 012_xero_accounts.sql — Xero chart of accounts mirror

CREATE TABLE IF NOT EXISTS xero_accounts (
  id              TEXT PRIMARY KEY,
  xero_account_id TEXT UNIQUE NOT NULL,
  code            TEXT,
  name            TEXT NOT NULL,
  type            TEXT,
  bank_account_type TEXT,
  status          TEXT,
  description     TEXT,
  currency_code   TEXT DEFAULT 'IDR',
  tax_type        TEXT,
  enable_payments INTEGER DEFAULT 0,
  class           TEXT,
  system_account  TEXT,
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_xero_acct_code ON xero_accounts(code);
CREATE INDEX IF NOT EXISTS idx_xero_acct_type ON xero_accounts(type);
CREATE INDEX IF NOT EXISTS idx_xero_acct_class ON xero_accounts(class);
