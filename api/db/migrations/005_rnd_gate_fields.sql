-- 005_rnd_gate_fields.sql
-- v1.2 prep: gate metadata on rnd_projects, stage history, approvals

-- Add gate/scoring columns to rnd_projects
ALTER TABLE rnd_projects ADD COLUMN gate_outcome TEXT;
ALTER TABLE rnd_projects ADD COLUMN confidence_level TEXT;
ALTER TABLE rnd_projects ADD COLUMN current_score NUMERIC;

-- Stage transition log
CREATE TABLE IF NOT EXISTS rnd_stage_history (
  id TEXT PRIMARY KEY,
  rnd_project_id TEXT NOT NULL REFERENCES rnd_projects(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_by TEXT,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rnd_stage_history_project ON rnd_stage_history(rnd_project_id);

-- Approval records per stage gate
CREATE TABLE IF NOT EXISTS rnd_approvals (
  id TEXT PRIMARY KEY,
  rnd_project_id TEXT NOT NULL REFERENCES rnd_projects(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  approver TEXT,
  decision TEXT,
  comment TEXT,
  decided_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rnd_approvals_project ON rnd_approvals(rnd_project_id);
