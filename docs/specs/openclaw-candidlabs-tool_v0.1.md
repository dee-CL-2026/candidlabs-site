OPENCLAW TOOL: candidlabs-data
VERSION: 0.1

DESCRIPTION
Allows OpenClaw agents to read and write Candid Labs CRM and Projects
data via the candidlabs-api Cloudflare Worker.

PREREQUISITES
1. candidlabs-api Worker deployed with D1 database
2. API key generated and stored in Worker env as AGENT_KEY_{AGENT_NAME}
3. Agent credential stored at ~/.openclaw/credentials/candidlabs.json

CREDENTIAL FILE FORMAT
{
  "apiBase": "https://candidlabs.com/api",
  "apiKey": "<agent-specific-key>",
  "agentId": "candid-ops"
}

OPERATIONS

list(collection, search?, filter?, filterCol?)
  GET /api/{collection}?search=&filter=&filterCol=
  Returns array of records

get(collection, id)
  GET /api/{collection}/{id}
  Returns single record

create(collection, record)
  POST /api/{collection}
  Body: JSON record (snake_case fields)
  Returns created record with generated ID

update(collection, id, fields)
  PUT /api/{collection}/{id}
  Body: JSON partial fields to update
  Returns updated record

delete(collection, id)
  DELETE /api/{collection}/{id}
  Returns { ok: true }

overview(module)
  GET /api/overview/{crm|projects}
  Returns KPI summary

HEADERS
Authorization: Bearer <apiKey>
X-Agent-Id: <agentId>
Content-Type: application/json

AGENT PERMISSION SCOPES (configured per-agent in Worker env)

candid-ops:
  - READ: projects, tasks
  - CREATE: tasks
  - UPDATE: tasks (status, assignee only)
  - No access to CRM data

secretary:
  - READ: contacts, companies
  - No write access

admin-agent:
  - Full CRUD on all collections

USE CASES
1. candid-ops creates tasks when production thresholds are breached
2. candid-ops updates task status as ops milestones complete
3. secretary queries contacts for meeting prep and briefing notes
4. Any agent reads project overview KPIs for status reporting

INTEGRATION PATH
1. Deploy candidlabs-api Worker with D1 schema and seed data
2. Generate agent-specific API keys via wrangler secret
3. Create ~/.openclaw/credentials/candidlabs.json with key
4. Add candidlabs-data tool definition to agent's TOOLS.md
5. Agent calls Worker API endpoints via fetch() with auth headers
