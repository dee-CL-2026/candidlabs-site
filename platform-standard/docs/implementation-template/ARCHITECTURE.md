# Architecture

> One-page overview of the platform stack.

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Module A │  │ Module B │  │ Module C │  │ Module D │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └──────────────┴──────────────┴──────────────┘         │
│                          │                                    │
│                    API Client Layer                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│  API LAYER                                                    │
│                                                              │
│  Routes:                                                     │
│    CRUD     /api/{collection}[/{id}]                         │
│    Import   /api/{collection}/import                         │
│    Health   /api/health                                      │
│                                                              │
│  Auth: <PRIMARY_AUTH_METHOD>                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ Database binding
┌──────────────────────────▼──────────────────────────────────┐
│  DATA LAYER                                                   │
│                                                              │
│  <PRIMARY_DATA_STORE>                                         │
│  Schema: <SCHEMA_LOCATION>                                    │
│  Migrations: <MIGRATIONS_LOCATION>                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EXTERNAL INTEGRATIONS  (if applicable)                      │
│                                                              │
│  <Describe external system connections here>                  │
└─────────────────────────────────────────────────────────────┘
```

## Components

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | `<FRAMEWORK_OR_APPROACH>` | `<DEPLOYMENT_METHOD>` |
| API | `<API_TECHNOLOGY>` | `<ROUTING_PATTERN>` |
| Database | `<DATABASE_TYPE>` | `<KEY_CONVENTIONS>` |
| Auth | `<AUTH_PROVIDER>` | `<AUTH_MECHANISM>` |
| Deploy | `<DEPLOY_PLATFORM>` | `<DEPLOY_TRIGGER>` |

## Key Conventions

- `<Describe API routing convention>`
- `<Describe how new tables/collections are added>`
- `<Describe build/deploy process>`
- Worker validates JWT presence; role enforcement is client-side for UI gating only. `<Adjust to match actual auth architecture.>`
