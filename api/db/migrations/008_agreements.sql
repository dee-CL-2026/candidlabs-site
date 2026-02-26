-- 008_agreements.sql
-- Wave 1: Key Account Agreements table (canonical rows from Google Form intake)

CREATE TABLE IF NOT EXISTS agreements (
  id TEXT PRIMARY KEY,
  agreement_key TEXT,
  account_name TEXT NOT NULL,
  contact_name TEXT,
  company_id TEXT,
  agreement_date TEXT,
  start_date TEXT,
  end_date TEXT,
  agreement_type TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'draft',
  terms TEXT,
  notes TEXT,
  meta TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_agreements_company_id ON agreements(company_id);
CREATE INDEX IF NOT EXISTS idx_agreements_status ON agreements(status);
