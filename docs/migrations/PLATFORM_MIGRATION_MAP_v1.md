# Platform Migration Map v1.0

> Generated 2026-02-25 from code scan of `candidlabs-site` (Worker + D1 + UI).
> Cross-referenced with GAS_INVENTORY_v1.md.

---

## 1. Existing Platform Modules

### 1.1 CRM Module

**UI:** `/crm/index.html` + `crm/crm.js` (1,259 lines)
**Panels:** Overview, Contacts, Companies, Deals (list + Kanban)

**D1 Tables:**

| Table | Columns | Indexes |
|-------|---------|---------|
| `companies` | id, name, type, parent_id, market, channel, status, notes, meta, created_at, updated_at | idx_companies_parent, idx_companies_type |
| `contacts` | id, name, first_name, last_name, email, phone, role, company_id (FK), notes, meta, created_at, updated_at | idx_contacts_company |
| `deals` | id, title, company_id (FK), contact_id (FK), value, stage, channel_type, notes, meta, created_at, updated_at | idx_deals_company, idx_deals_contact, idx_deals_stage, idx_deals_channel |
| `comments` | id, record_type, record_id, author_email, author_name, body, created_at, updated_at | idx_comments_record |

**API Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/contacts` | List/search contacts |
| GET/POST/PUT/DELETE | `/api/contacts[/:id]` | CRUD |
| GET | `/api/companies` | List/search companies |
| GET/POST/PUT/DELETE | `/api/companies[/:id]` | CRUD |
| GET | `/api/deals` | List/search deals |
| GET/POST/PUT/DELETE | `/api/deals[/:id]` | CRUD |
| GET | `/api/overview/crm` | KPIs: contact count, company count, deal count, pipeline value |
| POST | `/api/{collection}/import` | Bulk import (max 500) |
| GET/POST/DELETE | `/api/comments[/:id]` | Comments on any record |

**Enums:** Company types (distributor, branch, group, venue, individual, manufacturer, partner, investor), Deal stages (prospecting, proposal, negotiation, closed-won, closed-lost), Channel types (distributor, direct)

---

### 1.2 Projects Module

**UI:** `/projects/index.html` + `projects/projects.js` (~600 lines)
**Panels:** Overview, Projects, Tasks

**D1 Tables:**

| Table | Columns | Indexes |
|-------|---------|---------|
| `projects` | id, name, description, owner, status, start_date, due_date, project_type, owner_team, visible_to_roles, visible_to_teams, visibility_mode, org_id, branch_id, external_org_id, meta, created_at, updated_at | idx_projects_status |
| `tasks` | id, project_id (FK, CASCADE), title, assignee, status, priority, due_date, blocker_note, owner_team, visible_to_roles, visible_to_teams, meta, created_at, updated_at | idx_tasks_project, idx_tasks_status |

**API Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST/PUT/DELETE | `/api/projects[/:id]` | CRUD (cascade deletes tasks) |
| GET/POST/PUT/DELETE | `/api/tasks[/:id]` | CRUD |
| GET | `/api/overview/projects` | KPIs: active projects, total/completed/overdue tasks |

**Enums:** Project types (commercial, rnd, tech, operations, people, marketing), Task status (to-do, in-progress, done), Priority (low, medium, high), Teams (leadership, sales, ops, rnd, tech, finance, va, marketing_partner)

---

### 1.3 R&D Module

**UI:** `/rnd/index.html` + `rnd/rnd.js` (1,522 lines)
**Panels:** Overview, Pipeline (Kanban/list), Documents, SKUs, Gates

**D1 Tables:**

| Table | Columns | Indexes |
|-------|---------|---------|
| `rnd_projects` | id, name, stage, owner, target_market, product_category, priority, start_date, target_launch, gate_outcome, confidence_level, current_score, gate_rationale, notes, meta, created_at, updated_at | idx_rnd_projects_stage |
| `rnd_documents` | id, rnd_project_id (FK), doc_type, title, content (JSON), status, author, notes, meta, created_at, updated_at | idx_rnd_docs_project, idx_rnd_docs_type |
| `rnd_trial_entries` | id, rnd_document_id (FK), trial_number, date, recipe, result, tasting_notes, adjustments, meta, created_at, updated_at | idx_rnd_trials_doc |
| `rnd_stage_history` | id, rnd_project_id (FK), from_stage, to_stage, changed_by, note, created_at | idx_rnd_stage_history_project |
| `rnd_approvals` | id, rnd_project_id (FK), stage, approver, decision, comment, decided_at | idx_rnd_approvals_project |
| `skus` | id, sku_code (UNIQUE), product_name, variant, pack_size, status, rnd_project_id (FK), notes, meta, created_at, updated_at | idx_skus_status |

**API Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST/PUT/DELETE | `/api/rnd_projects[/:id]` | CRUD (cascade: docs, trials, unlink SKUs) |
| GET/POST/PUT/DELETE | `/api/rnd_documents[/:id]` | CRUD (cascade: trials) |
| GET/POST/PUT/DELETE | `/api/rnd_trial_entries[/:id]` | CRUD |
| GET/POST/PUT/DELETE | `/api/rnd_stage_history[/:id]` | CRUD |
| GET/POST/PUT/DELETE | `/api/rnd_approvals[/:id]` | CRUD |
| GET/POST/PUT/DELETE | `/api/skus[/:id]` | CRUD |

**Gate Criteria (client-side in rnd.js):**
- idea → feasibility: concept_brief doc exists, market_size filled, product_category filled, target_market filled, feasibility doc exists
- feasibility → trials: feasibility doc exists + key fields filled, trial_log doc exists
- trials → pre-launch: trial entries exist, pdp doc exists + key fields filled, gtm doc exists
- pre-launch → archived: approval_exists for pre-launch stage, all gate criteria evaluated

**Document Schemas:** concept_brief, feasibility, trial_log, pdp, gtm — each with typed field definitions stored as JSON in `rnd_documents.content`.

---

### 1.4 Prospecting Module

**UI:** `/prospecting/index.html` + `prospecting/prospecting.js` (1,018 lines)
**Status:** Work-in-progress. Sales pipeline management.

---

### 1.5 Budget Module

**UI:** `/budget.html` + `budget.js` (~800 lines) + `budget-data.js` + `budget-data-2026.js`
**Status:** Standalone client-side tool. No D1 tables. No API calls.
**Data:** Hardcoded FY2024/FY2025 actuals. Scenario engine with assumptions (revenue growth %, COGS %, OpEx growth %).

---

### 1.6 Auth & Admin

**Auth:** `auth.js` (CandidAuth module) + `functions/api/me.js` (CF Pages Function)
**Admin:** `admin/users.html` + `admin/users.js`
**Identity:** Cloudflare Access (Google Workspace SSO)
**Roles:** admin, partner, team, viewer
**Roster:** Hardcoded in `functions/api/me.js` (5 users)

---

### 1.7 Infrastructure

**Worker:** `api/src/index.js` — generic CRUD for 11 collections
**D1 Database:** `candidlabs` (ID: `ab4a73ca-5285-4aac-93c2-c45209ef0db2`)
**Data Adapter:** `data-adapter.js` (CandidStore) — API-first with localStorage fallback, camelCase↔snake_case conversion
**ID Generation:** `{PREFIX}-{Date.now().toString(16).slice(-6)}`

---

## 2. Legacy GAS → Platform Replacement Map

### 2.1 Key Account Agreement Generator (KAA)

This is the **only GAS project with active business logic** (11 .gs files, 40+ functions).

#### Current GAS Architecture

```
Google Form → "Form Responses 1" sheet
  → onFormSubmit(e) trigger
    → mapRawToCanonical_()        [pure logic]
    → appendCanonicalRow_()       [Sheet IO]
    → generateAgreementDocFromRow() [Drive/Docs IO]
    → kaa_sendNotificationsForAgreementRow_() [Gmail IO]
```

#### Proposed Platform Replacement

| Legacy Component | Current Location | Target | New Location |
|-----------------|-----------------|--------|--------------|
| **Form intake** | Google Form → Sheet trigger | Platform UI form | `/agreements/index.html` (new) |
| **Raw → Canonical mapping** | `Mapping.gs` mapRawToCanonical_() | Worker validation | `api/src/index.js` — POST `/api/agreements` |
| **Agreement key generation** | `Helpers.gs` buildAgreementKey_() | Worker logic | `api/src/index.js` — ID generation |
| **Date/enum normalization** | `Helpers.gs` normalize*() | Worker validation | `api/src/index.js` — input sanitization |
| **Deduplication** | `BackFill.gs` kaa_existingAgreementKeys_() | D1 UNIQUE constraint | `agreements.agreement_key UNIQUE` |
| **Backfill orchestration** | `BackFill.gs` kaa_backfill*() | Worker endpoint | POST `/api/agreements/backfill` |
| **Agreement data storage** | "Agreements" Google Sheet | D1 table | `agreements` table (see schema below) |
| **Search/filter** | `RegenPicker.gs` kaa_pickerSearchAgreements_() | Worker list endpoint | GET `/api/agreements?search=...` |
| **Regeneration** | `Regenerate.gs` kaa_regenerateRow_() | Worker endpoint + GAS adapter | POST `/api/agreements/:id/regenerate` |
| **Status tracking** | STATUS column in Sheet | D1 column | `agreements.status` |
| **Error logging** | ERROR_MESSAGE column in Sheet | D1 + job_logs | `agreements.error_message` + `job_logs` |
| **Doc generation** | `GenerateDoc.gs` → DriveApp + DocumentApp | **GAS thin adapter** | GAS polls Worker, generates Doc, POSTs back URL |
| **Email notifications** | `Notifications.gs` → GmailApp | **GAS thin adapter** | GAS receives instruction from Worker, sends email |
| **Spreadsheet menu** | `OpenOn.gs` onOpen() | Platform UI | Dashboard buttons in `/agreements/` |
| **Constants/config** | `Constants.gs` (hardcoded) | D1 config table or Worker env | `wrangler.toml` [vars] or `config` table |

#### Proposed D1 Schema: `agreements` table

```sql
CREATE TABLE agreements (
  id              TEXT PRIMARY KEY,
  agreement_key   TEXT UNIQUE NOT NULL,
  version         TEXT DEFAULT '1.0',
  parent_id       TEXT,
  status          TEXT DEFAULT 'draft',

  -- Submission
  submitted_at          TEXT,
  submitted_by_email    TEXT,
  generated_at          TEXT,
  generated_by_email    TEXT,
  change_note           TEXT,
  error_message         TEXT,

  -- Key Account (Legal)
  key_account_legal_name TEXT NOT NULL,
  key_account_address    TEXT,
  npwp_file_url          TEXT,
  signing_method         TEXT,
  signatory_name         TEXT,
  signatory_title        TEXT,
  signatory_email        TEXT,
  op_pic_different       TEXT DEFAULT 'NO',
  op_pic_name            TEXT,
  op_pic_email           TEXT,
  op_pic_phone           TEXT,
  pic_email              TEXT,
  pic_phone              TEXT,
  term_start_date        TEXT,
  term_end_date          TEXT,

  -- Rebate & Pricing
  rebate_type            TEXT,
  rebate_rate            TEXT,
  rebate_frequency       TEXT DEFAULT 'QUARTERLY',
  min_volume_agreed      TEXT DEFAULT 'NO',
  min_quarterly_volume_cases TEXT,
  same_flavour_price     TEXT DEFAULT 'NO',
  price_soda_per_can     TEXT,
  price_flavour_per_can  TEXT,
  price_imperial_per_can TEXT,
  price_ginger_per_can   TEXT,

  -- Venues
  venue_list             TEXT,

  -- Generated outputs
  template_doc_id        TEXT,
  generated_doc_id       TEXT,
  generated_doc_url      TEXT,

  -- Meta
  meta        TEXT DEFAULT '{}',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_agreements_key ON agreements(agreement_key);
CREATE INDEX idx_agreements_status ON agreements(status);
CREATE INDEX idx_agreements_account ON agreements(key_account_legal_name);
```

#### Proposed D1 Schema: `jobs` + `job_logs` tables (shared infrastructure)

```sql
CREATE TABLE jobs (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  ref_id      TEXT,
  status      TEXT DEFAULT 'pending',
  started_at  TEXT,
  finished_at TEXT,
  error       TEXT,
  meta        TEXT DEFAULT '{}',
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE job_logs (
  id          TEXT PRIMARY KEY,
  job_id      TEXT NOT NULL,
  level       TEXT DEFAULT 'info',
  message     TEXT,
  payload_ref TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

CREATE INDEX idx_jobs_type ON jobs(type);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_job_logs_job ON job_logs(job_id);
```

#### GAS Thin Adapters (post-migration)

**Adapter 1: Doc Generator**
```
Worker calls GAS webapp (doPost):
  → receives: agreement_id, template_doc_id, output_folder_id, placeholder_data
  → GAS: copies template, fills placeholders, returns { docId, docUrl }
  → Worker: updates agreements.generated_doc_id/url
```

**Adapter 2: Email Sender**
```
Worker calls GAS webapp (doPost):
  → receives: to, cc, subject, body, from_alias
  → GAS: sends via GmailApp
  → returns: { sent: true }
```

---

### 2.2 CoreOS Library

| Component | Action |
|-----------|--------|
| `createSovereignMenu()` | KEEP — still useful for any remaining GAS-bound sheets |
| `appendGlobalTools()` | KEEP — diagnostic menu |
| `CoreOS_TabAnalyser()` | KEEP — sheet structure auditing |
| `showStatusCard()` | KEEP — UI feedback |
| `CoreOS.CONFIG.DRIVE.*` | EXTRACT values, then hardcode in GAS adapters or Worker env vars |

**Post-migration:** CoreOS becomes optional. If no GAS consumers remain, retire it.

---

### 2.3 Flattened / Config-Only Projects (29 projects)

| Action | Projects |
|--------|----------|
| **DELETE from GAS console** | candid-labs-platform, candid-labs-loan-tracker, candid-labs-production-master, candid-labs-sales-master, candid-labs-sales-tool, candid-os-script-discovery-engine, key-account-agreement-generator (PLATFORM copy) |
| **DELETE from GAS console** | loan-tracker (LEGACY), production-master (LEGACY), sales-master (LEGACY), sales-tool (LEGACY), os-script-directory (shim), surgical-strike, legacy_decommissioner |
| **DELETE from GAS console** | All 13 STAGING projects, sales_master_min (tiered) |
| **DELETE from repos** | Remove corresponding directories from `candid-labs` and `candid-labs-tiered` repos |

These contain no code — only `appsscript.json` manifests with `_version.gs` stubs marked `FLATTENED`.

---

## 3. Modules Not Yet on Platform (identified from GAS scopes/services)

These capabilities existed in GAS (evidenced by oauth scopes and advanced service configs in the now-empty shells) but have **no code** in the repo. They represent future platform modules if the business need resurfaces.

| Capability | Evidence | Platform Module (if needed) |
|-----------|----------|---------------------------|
| Production tracking | `candid-labs-production-master` had scopes | New `production` collection in Worker + D1 |
| Loan tracking | `candid-labs-loan-tracker` had Drive v3 scope | New `loans` collection or extend `deals` |
| Slide deck generation | sales-master had Slides v1 | GAS adapter (Slides API is Google-only) |
| Drive activity monitoring | Multiple projects had DriveActivity v2 | GAS adapter or Cloudflare cron + Drive API |
| Contact sync (People API) | STAGING contacts-util, my-own-stuff | Platform CRM already handles contacts |
| Admin directory lookup | candid-labs-platform had AdminDirectory | Not needed if CF Access handles identity |

---

## 4. Platform Gaps (needed for migration)

| Gap | Current State | Required For |
|-----|---------------|-------------|
| **`agreements` collection** | Does not exist in Worker or D1 | KAA migration |
| **`jobs` / `job_logs` tables** | Do not exist | Audit trail for any GAS adapter calls |
| **GAS → Worker auth** | No auth on API endpoints (all public) | Securing adapter POST calls |
| **Webhook receiver** | No `/api/webhook/*` routes | GAS adapters calling back with results |
| **Cron triggers** | None configured in `wrangler.toml` | Scheduled jobs (backfill, nightly summaries) |
| **Worker env vars** | None for KAA config | Template Doc ID, Output Folder ID, email config |

---

## 5. Top 3 Migration Waves

### Wave 1: KAA Agreement Logic → Platform

**Justification:** Only active GAS script with business logic. Form-triggered, high-visibility (legal agreements), and the orchestration + validation logic is entirely portable.

**Scope:**
- Add `agreements` collection to Worker COLLECTIONS
- Create D1 migration `007_agreements.sql`
- Build `/agreements/` UI (form + list + detail view)
- Port: Constants.gs, Mapping.gs, Helpers.gs, BackFill.gs, RegenPicker.gs, Regenerate.gs → Worker modules
- Keep: GenerateDoc.gs and Notifications.gs as thin GAS webapps (doPost)
- Wire: Worker POST `/api/agreements` → calls GAS adapter for doc gen → GAS POSTs back URL

**Outcome:** Agreements sheet becomes read-only archive. D1 is source of truth. Form intake moves to platform UI.

---

### Wave 2: Jobs Infrastructure + GAS Adapter Auth

**Justification:** Required foundation before any additional GAS adapters are built. Without job tracking and auth, adapters operate blind and unsecured.

**Scope:**
- Create D1 migration `008_jobs.sql` (jobs + job_logs tables)
- Add `jobs` and `job_logs` to Worker COLLECTIONS
- Add API key auth middleware for `/api/import_*` and `/api/webhook/*` routes
- Add `/api/jobs` dashboard endpoint
- Build `/admin/jobs.html` UI for monitoring
- Add cron trigger stub in `wrangler.toml`

**Outcome:** Every GAS adapter call is logged, authenticated, and trackable. Foundation for all future adapters.

---

### Wave 3: GAS Project Cleanup + CoreOS Retirement

**Justification:** 29 of 31 GAS projects are empty shells. Deleting them reduces confusion, eliminates stale OAuth grants, and simplifies the GAS console.

**Scope:**
- Extract `CoreOS.CONFIG.DRIVE.*` values into Worker env vars or a `config` D1 table
- Delete 29 empty GAS projects from Apps Script console
- Remove corresponding directories from `candid-labs` repo
- Update KAA GAS adapter to hardcode Drive IDs instead of referencing CoreOS library
- If no GAS consumers of CoreOS remain, archive the library

**Outcome:** GAS console contains only 2 projects: CoreOS (optional diagnostic) and KAA adapters (thin doc-gen + email).

---

## Appendix A: Full D1 Table Inventory (current)

| Table | Module | Migration |
|-------|--------|-----------|
| companies | CRM | schema.sql + 002 |
| contacts | CRM | schema.sql + 003 |
| deals | CRM | schema.sql + 002 |
| projects | PM | schema.sql |
| tasks | PM | schema.sql |
| comments | Shared | schema.sql |
| rnd_projects | R&D | 004 + 005 + 006 |
| rnd_documents | R&D | 004 |
| rnd_trial_entries | R&D | 004 |
| rnd_stage_history | R&D | 005 |
| rnd_approvals | R&D | 005 |
| skus | R&D | 004 |

**Total:** 12 tables, 6 migrations applied.

## Appendix B: API Route Map (current)

```
GET    /api/health
GET    /api/me                          (CF Pages Function)

GET    /api/overview/crm
GET    /api/overview/projects

GET    /api/{collection}                (11 collections)
GET    /api/{collection}/:id
POST   /api/{collection}
PUT    /api/{collection}/:id
DELETE /api/{collection}/:id
POST   /api/{collection}/import

GET    /api/comments?recordType=&recordId=
POST   /api/comments
DELETE /api/comments/:id
```

**Collections:** contacts, companies, deals, projects, tasks, rnd_projects, rnd_documents, rnd_trial_entries, rnd_stage_history, rnd_approvals, skus

## Appendix C: File Paths Quick Reference

```
candidlabs-site/
  api/
    src/index.js              ← Worker (all routes)
    wrangler.toml             ← D1 binding: candidlabs
    db/schema.sql             ← Base tables
    db/migrations/001-006     ← Applied migrations
  functions/api/me.js         ← CF Access identity
  auth.js                     ← CandidAuth module
  data-adapter.js             ← CandidStore (API + localStorage)
  crm/                        ← CRM module (contacts, companies, deals)
  projects/                   ← PM module (projects, tasks)
  rnd/                        ← R&D module (pipeline, docs, trials, SKUs, gates)
  prospecting/                ← Sales pipeline (WIP)
  admin/                      ← User role management
  budget.js + budget-data*.js ← Budget planner (client-only)
  docs/migrations/            ← This document

candid-labs/
  0. PLATFORM/0.1 Vault/
    candid-labs-core-os/      ← CoreOS library (KEEP)
    (7 other dirs)            ← All empty/flattened (DELETE)
  LEGACY/
    key-account-agreement-generator/  ← KAA active code (MIGRATE)
    (4 other dirs)            ← All empty (DELETE)
  STAGING/                    ← 13 empty projects (DELETE)
  9. Quarantine/              ← 1 empty project (DELETE)
```
