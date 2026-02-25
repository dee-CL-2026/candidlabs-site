-- 003_contact_names.sql — Split contacts.name into first_name + last_name
-- Run via: wrangler d1 execute candidlabs-db --file api/db/migrations/003_contact_names.sql

ALTER TABLE contacts ADD COLUMN first_name TEXT;
ALTER TABLE contacts ADD COLUMN last_name TEXT;

-- Backfill: split existing name on first space
UPDATE contacts SET
  first_name = CASE WHEN instr(name, ' ') > 0 THEN substr(name, 1, instr(name, ' ') - 1) ELSE name END,
  last_name  = CASE WHEN instr(name, ' ') > 0 THEN substr(name, instr(name, ' ') + 1) ELSE '' END
WHERE name IS NOT NULL;
