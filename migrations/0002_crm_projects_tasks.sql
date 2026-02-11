-- Migration 0002: CRM + Projects + Tasks
-- Adds accounts, contacts, projects, tasks, task dependencies, and activity log.

-- ============================================================
-- ACCOUNTS (companies / venues / clients)
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  account_id TEXT PRIMARY KEY,
  legal_name TEXT,
  display_name TEXT NOT NULL,
  channel TEXT CHECK (channel IN ('hwg', 'big_chains', 'modern_trade', 'hotels', 'distributor', 'direct', 'other')),
  market TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'at_risk', 'dormant', 'lost', 'prospect')),
  first_order_date TEXT,
  latest_order_date TEXT,
  owner_email TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (owner_email) REFERENCES users(email)
);

CREATE INDEX IF NOT EXISTS idx_accounts_status ON accounts(status);
CREATE INDEX IF NOT EXISTS idx_accounts_channel ON accounts(channel);
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON accounts(owner_email);

-- ============================================================
-- CONTACTS (people at accounts)
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  contact_id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK (role IN ('signatory', 'operational_pic', 'buyer', 'finance', 'management', 'other')),
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0 CHECK (is_primary IN (0, 1)),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (account_id) REFERENCES accounts(account_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_account ON contacts(account_id);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  project_id TEXT PRIMARY KEY,
  account_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'internal' CHECK (type IN ('client', 'internal', 'rnd')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'paused', 'completed', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  owner_email TEXT,
  start_date TEXT,
  target_date TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  FOREIGN KEY (owner_email) REFERENCES users(email)
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(type);
CREATE INDEX IF NOT EXISTS idx_projects_account ON projects(account_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_email);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  task_id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  parent_task_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'backlog' CHECK (status IN ('backlog', 'ready', 'in_progress', 'blocked', 'done', 'archived')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to TEXT,
  start_date TEXT,
  due_date TEXT,
  estimated_hours REAL,
  actual_hours REAL,
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (project_id) REFERENCES projects(project_id),
  FOREIGN KEY (parent_task_id) REFERENCES tasks(task_id),
  FOREIGN KEY (assigned_to) REFERENCES users(email),
  FOREIGN KEY (created_by) REFERENCES users(email)
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_parent ON tasks(parent_task_id);

-- ============================================================
-- TASK DEPENDENCIES (blocking relationships)
-- ============================================================
CREATE TABLE IF NOT EXISTS task_dependencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  blocked_by_task_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (task_id) REFERENCES tasks(task_id),
  FOREIGN KEY (blocked_by_task_id) REFERENCES tasks(task_id),
  UNIQUE(task_id, blocked_by_task_id)
);

-- ============================================================
-- ACTIVITIES (shared audit log for all entities)
-- ============================================================
CREATE TABLE IF NOT EXISTS activities (
  activity_id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('account', 'contact', 'project', 'task')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'commented', 'assigned', 'deleted')),
  actor_email TEXT NOT NULL,
  details_json TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (actor_email) REFERENCES users(email)
);

CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_actor ON activities(actor_email);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at);
