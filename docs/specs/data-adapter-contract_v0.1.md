CANDIDLABS DATA ADAPTER CONTRACT v0.1

PURPOSE
This contract defines the shared API surface between:
1. Browser-side CandidStore (data-adapter.js, localStorage fallback)
2. Cloudflare Worker API (api/src/index.js, D1 backend)
3. OpenClaw agents (via HTTP to the Worker)

ENDPOINTS

GET    /api/{collection}              List all (optional ?search=&filter=&filterCol=)
GET    /api/{collection}/{id}         Get one record
POST   /api/{collection}              Create (body = JSON record)
PUT    /api/{collection}/{id}         Update (body = JSON partial fields)
DELETE /api/{collection}/{id}         Delete

GET    /api/overview/crm              CRM KPIs (contacts, companies, deals, pipelineValue)
GET    /api/overview/projects         Projects KPIs (activeProjects, totalTasks, completed, overdue)
GET    /api/health                    Service health check

Collections: contacts, companies, deals, projects, tasks

FIELD NAMING
- D1 / API uses snake_case (company_id, created_at)
- Browser JS uses camelCase (companyId, createdAt)
- data-adapter.js translates automatically

AUTH

Browser users:
  Authorization: Bearer <google-id-token>
  Worker validates JWT, extracts email, maps to role (admin/team/viewer)

OpenClaw agents:
  Authorization: Bearer <api-key>
  X-Agent-Id: <agent-name>
  Worker validates API key against env vars, returns agent-scoped permissions

RESPONSE FORMAT

Success:
  { "ok": true, "data": <record or array>, "meta": { "count": N } }

Error:
  { "ok": false, "error": { "code": "NOT_FOUND", "message": "..." } }

Error codes: VALIDATION, NOT_FOUND, CONFLICT, METHOD_NOT_ALLOWED, INTERNAL

REFERENTIAL INTEGRITY
- Cannot delete company with linked contacts or deals (409 CONFLICT)
- Cannot delete contact with linked deals (409 CONFLICT)
- Deleting a project cascades to its tasks

VISIBILITY ENFORCEMENT (future)
Worker will apply canSee(user, entity) before returning data.
Agent requests use scoped permissions defined in Worker env config.

SCHEMA METADATA (projects + tasks)
Projects include: project_type, owner_team, visible_to_roles, visible_to_teams,
  visibility_mode, org_id, branch_id, external_org_id
Tasks include: owner_team, visible_to_roles, visible_to_teams
Defaults applied on create if fields are missing.
