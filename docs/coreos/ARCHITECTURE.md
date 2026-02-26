# CoreOS Architecture

> One-page overview of the Candid CoreOS platform stack.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  BROWSER                                                     │
│  Static HTML/CSS/JS served by Cloudflare Pages               │
│                                                              │
│  ┌──────┐ ┌────────────┐ ┌────────┐ ┌─────┐ ┌───────────┐  │
│  │ CRM  │ │Prospecting │ │Projects│ │ R&D │ │Reports/etc│  │
│  └──┬───┘ └─────┬──────┘ └───┬────┘ └──┬──┘ └─────┬─────┘  │
│     │           │            │         │           │         │
│     └───────────┴────────────┴─────────┴───────────┘         │
│                          │                                    │
│                   data-adapter.js                             │
│                   fetch("/api/...")                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│  CLOUDFLARE WORKER  (api/src/index.js)                       │
│                                                              │
│  Routes:                                                     │
│    GET/POST/PUT/DELETE /api/{collection}[/{id}]              │
│    POST               /api/{collection}/import               │
│    GET                 /api/overview/{module}                 │
│    GET                 /api/comments                          │
│    POST                /api/comments                          │
│    DELETE              /api/comments/{id}                     │
│    GET                 /api/health                            │
│                                                              │
│  Collections: contacts, companies, deals, projects, tasks,   │
│    rnd_projects, rnd_documents, rnd_trial_entries,           │
│    rnd_stage_history, rnd_approvals, skus, comments          │
│                                                              │
│  Auth: CF Access headers (Cf-Access-Jwt-Assertion)           │
│  Validated client-side via script.js roster                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ D1 binding (env.DB)
┌──────────────────────────▼──────────────────────────────────┐
│  CLOUDFLARE D1  (SQLite)                                     │
│                                                              │
│  12 live tables (schema.sql + migrations 001–006)            │
│  24 planned tables (migrations 007–013)                      │
│                                                              │
│  Schema: api/db/schema.sql                                   │
│  Migrations: api/db/migrations/001–006_*.sql                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  GAS ADAPTERS  (planned, post-migration)                     │
│                                                              │
│  Thin Google Apps Script webapps for Google-native ops only: │
│    - Doc generation    (DocumentApp, DriveApp)               │
│    - Email sending     (GmailApp)                            │
│    - Slides generation (SlidesApp, DriveApp)                 │
│                                                              │
│  Protocol: Worker POST → GAS doPost (JSON payload)           │
│  Auth: API key in X-Api-Key header                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  XERO  (planned, Phase A)                                    │
│                                                              │
│  OAuth 2.0 → Worker fetches invoices, items, contacts        │
│  Daily cron sync + webhook push                              │
│  Raw data → xero_* D1 tables → processing pipelines          │
└─────────────────────────────────────────────────────────────┘
```

## Components

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | Static HTML + CSS + vanilla JS | Cloudflare Pages. No framework. Per-module JS. |
| API | Cloudflare Worker | Single `index.js`. Convention-based CRUD via COLLECTIONS config. |
| Database | Cloudflare D1 (SQLite) | TEXT PKs (prefixed IDs), `meta` JSON column, ISO timestamps. |
| Auth | Cloudflare Access | OTP email login. Role roster hardcoded in `script.js`. Roles: admin, partner, team, viewer. |
| CDN/Deploy | Cloudflare Pages | Git-push deploys from `main`. Preview deploys on branches. |

## Key conventions

- **One Worker, one D1 binding.** All API routes live in `api/src/index.js`.
- **COLLECTIONS config drives CRUD.** Adding a table = adding a COLLECTIONS entry + D1 migration.
- **No build step for frontend.** HTML files are served as-is. CSS per module.
- **Worker validates JWT presence; role enforcement is client-side for UI gating only.** `script.js` reads CF Access JWT, maps email to role, hides elements via `data-auth-role`.
