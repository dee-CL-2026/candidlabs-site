-- Migration 002: Company hierarchy + deal channel type
-- type:        distributor | branch | group | venue | individual | manufacturer | partner | investor
-- parent_id:   self-referencing FK (branch → distributor HQ, venue → group)
-- channel_type on deals: 'distributor' (default) | 'direct'

ALTER TABLE companies ADD COLUMN type        TEXT DEFAULT 'venue';
ALTER TABLE companies ADD COLUMN parent_id   TEXT REFERENCES companies(id);

ALTER TABLE deals     ADD COLUMN channel_type TEXT DEFAULT 'distributor';

CREATE INDEX IF NOT EXISTS idx_companies_parent  ON companies(parent_id);
CREATE INDEX IF NOT EXISTS idx_companies_type    ON companies(type);
CREATE INDEX IF NOT EXISTS idx_deals_channel     ON deals(channel_type);
