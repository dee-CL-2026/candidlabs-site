-- 004_rnd_workspace.sql
-- R&D Workspace module: projects, documents, trial entries, SKU catalog

-- rnd_projects — One row per R&D product/concept
CREATE TABLE IF NOT EXISTS rnd_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  stage TEXT DEFAULT 'idea',
  owner TEXT,
  target_market TEXT,
  product_category TEXT,
  priority TEXT DEFAULT 'medium',
  start_date TEXT,
  target_launch TEXT,
  notes TEXT,
  meta TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rnd_projects_stage ON rnd_projects(stage);

-- rnd_documents — Structured docs linked to an R&D project
CREATE TABLE IF NOT EXISTS rnd_documents (
  id TEXT PRIMARY KEY,
  rnd_project_id TEXT NOT NULL REFERENCES rnd_projects(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  author TEXT,
  notes TEXT,
  meta TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rnd_docs_project ON rnd_documents(rnd_project_id);
CREATE INDEX IF NOT EXISTS idx_rnd_docs_type ON rnd_documents(doc_type);

-- rnd_trial_entries — Individual trial rows within a Trial Log doc
CREATE TABLE IF NOT EXISTS rnd_trial_entries (
  id TEXT PRIMARY KEY,
  rnd_document_id TEXT NOT NULL REFERENCES rnd_documents(id) ON DELETE CASCADE,
  trial_number INTEGER,
  date TEXT,
  recipe TEXT,
  result TEXT,
  tasting_notes TEXT,
  adjustments TEXT,
  meta TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rnd_trials_doc ON rnd_trial_entries(rnd_document_id);

-- skus — Lightweight SKU catalog
CREATE TABLE IF NOT EXISTS skus (
  id TEXT PRIMARY KEY,
  sku_code TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  variant TEXT,
  pack_size TEXT,
  status TEXT DEFAULT 'active',
  rnd_project_id TEXT REFERENCES rnd_projects(id),
  notes TEXT,
  meta TEXT DEFAULT '{}',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_skus_status ON skus(status);
