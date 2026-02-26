-- 009_jobs.sql
-- Wave 1: Async job queue and per-step log entries

-- jobs — Async job queue (adapter calls, pipeline runs)
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  job_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  payload TEXT DEFAULT '{}',
  result TEXT DEFAULT '{}',
  error TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  started_at TEXT,
  finished_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);

-- job_logs — Per-step log entries within a job
CREATE TABLE IF NOT EXISTS job_logs (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL,
  step TEXT NOT NULL,
  status TEXT DEFAULT 'info',
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_job_logs_job_id ON job_logs(job_id);
