-- 014_sync_entity_type.sql — Extend sync_runs with entity_type for per-entity tracking

ALTER TABLE sync_runs ADD COLUMN entity_type TEXT DEFAULT NULL;
CREATE INDEX IF NOT EXISTS idx_sync_entity_type ON sync_runs(entity_type);
