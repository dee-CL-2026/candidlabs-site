-- 011_xero.sql — Xero OAuth + sync layer

CREATE TABLE IF NOT EXISTS xero_tokens (
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

CREATE TABLE IF NOT EXISTS xero_invoices (
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
CREATE INDEX IF NOT EXISTS idx_xero_inv_type ON xero_invoices(type);
CREATE INDEX IF NOT EXISTS idx_xero_inv_date ON xero_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_xero_inv_contact ON xero_invoices(contact_name);

CREATE TABLE IF NOT EXISTS xero_line_items (
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
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_xero_li_invoice ON xero_line_items(xero_invoice_id);
CREATE INDEX IF NOT EXISTS idx_xero_li_item ON xero_line_items(item_code);

CREATE TABLE IF NOT EXISTS xero_items (
  id              TEXT PRIMARY KEY,
  xero_item_id    TEXT UNIQUE NOT NULL,
  code            TEXT UNIQUE,
  name            TEXT,
  purchase_cost   REAL,
  sales_price     REAL,
  is_tracked      INTEGER DEFAULT 0,
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_xero_item_code ON xero_items(code);

CREATE TABLE IF NOT EXISTS xero_contacts (
  id              TEXT PRIMARY KEY,
  xero_contact_id TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  email           TEXT,
  phone           TEXT,
  is_customer     INTEGER DEFAULT 0,
  is_supplier     INTEGER DEFAULT 0,
  contact_status  TEXT,
  meta            TEXT DEFAULT '{}',
  synced_at       TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_xero_contact_name ON xero_contacts(name);

CREATE TABLE IF NOT EXISTS sync_runs (
  id              TEXT PRIMARY KEY,
  sync_type       TEXT NOT NULL,
  month_key       TEXT,
  started_at      TEXT DEFAULT (datetime('now')),
  finished_at     TEXT,
  records_fetched INTEGER DEFAULT 0,
  records_upserted INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'running',
  error           TEXT,
  meta            TEXT DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_sync_type ON sync_runs(sync_type);
CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_runs(status);
