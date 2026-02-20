-- Candidlabs Seed Data
-- Mirrors the JS seed data from crm.js getDefaultData() and projects.js getPMDefaultData()

-- CRM: Companies
INSERT OR IGNORE INTO companies (id, name, market, channel, status, notes, created_at) VALUES
  ('CMP-001', 'SK Distribution', 'Jakarta', 'Distributor', 'active', 'Primary Jakarta distributor', '2025-09-01'),
  ('CMP-002', 'PT Mandiri Beverages', 'Bali', 'Distributor', 'active', 'Bali & NTB coverage', '2025-10-15'),
  ('CMP-003', 'Grand Hotel Group', 'Jakarta', 'Horeca', 'lead', '12 properties across Java', '2026-01-08');

-- CRM: Contacts
INSERT OR IGNORE INTO contacts (id, name, email, phone, role, company_id, notes, created_at) VALUES
  ('CON-001', 'Sarah Chen', 'sarah@skdistribution.com', '+62 812 3456 7890', 'Account Manager', 'CMP-001', 'Primary contact for all Jakarta orders', '2025-09-15'),
  ('CON-002', 'Budi Santoso', 'budi@ptmandiri.co.id', '+62 813 9876 5432', 'Procurement Lead', 'CMP-002', 'Handles Bali distribution contracts', '2025-11-02'),
  ('CON-003', 'Lisa Wong', 'lisa@grandhotels.com', '+62 821 5555 1234', 'F&B Director', 'CMP-003', 'Decision maker for hotel group', '2026-01-10');

-- CRM: Deals (value stored as integer IDR, not cents)
INSERT OR IGNORE INTO deals (id, title, company_id, contact_id, value, stage, notes, created_at) VALUES
  ('DL-001', 'SK Distribution Q1 2026 Order', 'CMP-001', 'CON-001', 450000000, 'negotiation', 'Quarterly bulk order for Jakarta region', '2026-01-20'),
  ('DL-002', 'Grand Hotel Trial Program', 'CMP-003', 'CON-003', 85000000, 'proposal', 'Trial across 3 flagship properties', '2026-02-01'),
  ('DL-003', 'Mandiri Bali Expansion', 'CMP-002', 'CON-002', 275000000, 'prospecting', 'Expand coverage to Lombok & Flores', '2026-02-10');

-- Projects (with metadata fields)
INSERT OR IGNORE INTO projects (id, name, description, owner, status, start_date, due_date, project_type, owner_team, visible_to_roles, visible_to_teams, visibility_mode, org_id, created_at) VALUES
  ('PRJ-001', 'Looker Dashboard Rollout', 'Build and deploy Looker dashboards for exec, sales, ops, and finance views.', 'Dieter', 'active', '2026-01-15', '2026-04-30', 'tech', 'tech', '["admin","team"]', '["tech","leadership"]', 'internal_only', 'candid', '2026-01-10'),
  ('PRJ-002', 'candidlabs Platform Build', 'Build the internal candidlabs web platform with tools, CRM, PM, and dashboards.', 'Dieter', 'active', '2026-02-01', '2026-06-30', 'tech', 'tech', '["admin","team"]', '["tech","leadership"]', 'internal_only', 'candid', '2026-02-01'),
  ('PRJ-003', 'Q1 2026 Sales Push', 'Expand Jakarta and Bali distribution with 5 new accounts targeted.', 'Sales Team', 'active', '2026-01-01', '2026-03-31', 'commercial', 'sales', '["admin","team"]', '["sales","leadership"]', 'internal_only', 'candid', '2025-12-20');

-- Tasks (with metadata fields)
INSERT OR IGNORE INTO tasks (id, project_id, title, assignee, status, priority, due_date, owner_team, visible_to_roles, visible_to_teams, created_at) VALUES
  ('TSK-001', 'PRJ-001', 'Define exec dashboard KPIs', 'Dieter', 'done', 'high', '2026-02-01', 'tech', '["admin","team"]', '["tech"]', '2026-01-10'),
  ('TSK-002', 'PRJ-001', 'Build Sales_Looker data source', 'Dieter', 'in-progress', 'high', '2026-02-28', 'tech', '["admin","team"]', '["tech"]', '2026-01-15'),
  ('TSK-003', 'PRJ-001', 'Build Finance_Looker data source', 'Dieter', 'to-do', 'medium', '2026-03-15', 'tech', '["admin","team"]', '["tech"]', '2026-01-15'),
  ('TSK-004', 'PRJ-001', 'Deploy Production_Looker views', 'Dieter', 'to-do', 'medium', '2026-03-31', 'tech', '["admin","team"]', '["tech"]', '2026-01-15'),
  ('TSK-005', 'PRJ-002', 'Build CRM module', 'Dieter', 'done', 'high', '2026-02-17', 'tech', '["admin","team"]', '["tech"]', '2026-02-01'),
  ('TSK-006', 'PRJ-002', 'Build PM module', 'Dieter', 'in-progress', 'high', '2026-02-17', 'tech', '["admin","team"]', '["tech"]', '2026-02-01'),
  ('TSK-007', 'PRJ-002', 'Implement auth system', 'Dieter', 'in-progress', 'high', '2026-02-28', 'tech', '["admin","team"]', '["tech"]', '2026-02-01'),
  ('TSK-008', 'PRJ-002', 'Wire dashboard with live data', 'Dieter', 'to-do', 'medium', '2026-03-15', 'tech', '["admin","team"]', '["tech"]', '2026-02-01'),
  ('TSK-009', 'PRJ-003', 'Onboard 3 new Jakarta accounts', 'Sales Team', 'in-progress', 'high', '2026-02-28', 'sales', '["admin","team"]', '["sales"]', '2025-12-20'),
  ('TSK-010', 'PRJ-003', 'Launch Bali hotel trial program', 'Sales Team', 'to-do', 'medium', '2026-03-15', 'sales', '["admin","team"]', '["sales"]', '2025-12-20');
