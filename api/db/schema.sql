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
