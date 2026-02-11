-- Migration 0001: Baseline schema (existing tables)
-- This captures the initial schema that was applied via schema.sql

CREATE TABLE IF NOT EXISTS users (
  email TEXT PRIMARY KEY,
  name TEXT,
  role TEXT NOT NULL CHECK (role IN ('founder', 'admin', 'sales', 'finance')),
  disabled INTEGER NOT NULL DEFAULT 0 CHECK (disabled IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  last_login_at TEXT
);

CREATE TABLE IF NOT EXISTS tool_runs (
  run_id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL,
  tool TEXT NOT NULL,
  requested_by_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed', 'needs_approval', 'approved', 'rejected')),
  input_json TEXT NOT NULL,
  output_json TEXT,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (requested_by_email) REFERENCES users(email)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tool_runs_idempotency
  ON tool_runs (tool, requested_by_email, idempotency_key);

CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  tool TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  decided_by_email TEXT NOT NULL,
  notes TEXT,
  decided_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP),
  FOREIGN KEY (run_id) REFERENCES tool_runs(run_id),
  FOREIGN KEY (decided_by_email) REFERENCES users(email)
);
