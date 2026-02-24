-- Migration 001: Add meta column to main tables
-- Purpose: JSON catch-all for future fields that don't yet warrant their own column.
-- New typed columns can always be added later via ALTER TABLE ADD COLUMN (SQLite/D1 supports this).
-- Usage in Worker: read/write via record.meta (JSON string). Frontend parses as needed.

ALTER TABLE companies  ADD COLUMN meta TEXT DEFAULT '{}';
ALTER TABLE contacts   ADD COLUMN meta TEXT DEFAULT '{}';
ALTER TABLE deals      ADD COLUMN meta TEXT DEFAULT '{}';
ALTER TABLE projects   ADD COLUMN meta TEXT DEFAULT '{}';
ALTER TABLE tasks      ADD COLUMN meta TEXT DEFAULT '{}';
