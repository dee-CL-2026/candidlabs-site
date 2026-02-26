-- Candidlabs D1 Schema
-- Tables for CRM (contacts, companies, deals) and Projects (projects, tasks)

-- CRM: Companies
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  market TEXT,
  channel TEXT,
  status TEXT DEFAULT 'lead',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- CRM: Contacts
CREATE TABLE IF NOT EXISTS contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT,
  company_id TEXT REFERENCES companies(id),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- CRM: Deals
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company_id TEXT REFERENCES companies(id),
  contact_id TEXT REFERENCES contacts(id),
  value INTEGER DEFAULT 0,
  stage TEXT DEFAULT 'prospecting',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner TEXT,
  status TEXT DEFAULT 'planning',
  start_date TEXT,
  due_date TEXT,
  project_type TEXT DEFAULT 'operations',
  owner_team TEXT DEFAULT 'leadership',
  visible_to_roles TEXT DEFAULT '["admin"]',
  visible_to_teams TEXT DEFAULT '[]',
  visibility_mode TEXT DEFAULT 'internal_only',
  org_id TEXT DEFAULT 'candid',
  branch_id TEXT,
  external_org_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assignee TEXT,
  status TEXT DEFAULT 'to-do',
  priority TEXT DEFAULT 'medium',
  due_date TEXT,
  owner_team TEXT DEFAULT 'leadership',
  visible_to_roles TEXT DEFAULT '["admin"]',
  visible_to_teams TEXT DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- CRM: Comments (on contacts, companies, or deals)
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  record_type TEXT NOT NULL,   -- 'contact' | 'company' | 'deal'
  record_id TEXT NOT NULL,
  author_email TEXT NOT NULL,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_comments_record ON comments(record_type, record_id);

-- ============================================================
-- Wave 4: Xero Accounts + Payments
-- ============================================================

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

-- ============================================================
-- Wave 5: Normalised Financial Model
-- ============================================================

CREATE TABLE IF NOT EXISTS normalised_documents (
  id              TEXT PRIMARY KEY,
  entity_type     TEXT NOT NULL,
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
  period          TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(xero_invoice_id)
);
CREATE INDEX IF NOT EXISTS idx_nd_entity_type ON normalised_documents(entity_type);
CREATE INDEX IF NOT EXISTS idx_nd_period ON normalised_documents(period);

CREATE TABLE IF NOT EXISTS normalised_line_items (
  id              TEXT PRIMARY KEY,
  entity_type     TEXT NOT NULL,
  document_id     TEXT NOT NULL,
  xero_invoice_id TEXT NOT NULL,
  line_id         TEXT,
  item_code       TEXT,
  description     TEXT,
  quantity        REAL,
  unit_amount     REAL,
  line_total      REAL,
  account_code    TEXT,
  tax_type        TEXT,
  cost_bucket     TEXT,
  period          TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(xero_invoice_id, line_id)
);
CREATE INDEX IF NOT EXISTS idx_nli_entity ON normalised_line_items(entity_type);
CREATE INDEX IF NOT EXISTS idx_nli_cost_bucket ON normalised_line_items(cost_bucket);
CREATE INDEX IF NOT EXISTS idx_nli_period ON normalised_line_items(period);

CREATE TABLE IF NOT EXISTS cost_bucket_mappings (
  id              TEXT PRIMARY KEY,
  account_code    TEXT NOT NULL,
  account_name    TEXT,
  cost_bucket     TEXT NOT NULL,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now')),
  UNIQUE(account_code)
);
