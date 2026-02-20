CANDIDLABS — CRM + PROJECTS
SMOKE TEST & QA SCRIPT v0.1
Updated: 2026-02-21
Role: Chief Tester

Instructions:
- Follow steps exactly in order.
- Do not skip.
- Record PASS / FAIL for each section.
- Screenshot anything unexpected.

============================================================
PREREQS — Local Dev Setup

1) D1 database created:
   npx wrangler d1 create candidlabs
   → Update api/wrangler.toml with the returned database_id

2) Schema applied:
   npx wrangler d1 execute candidlabs --local --file=api/db/schema.sql

3) Seed data loaded:
   npx wrangler d1 execute candidlabs --local --file=api/db/seed.sql

4) Worker running:
   cd api && npx wrangler dev
   → Confirm http://localhost:8787/api/health returns { "ok": true }

5) Frontend served:
   npx wrangler pages dev . --port 8788
   → Or any static file server

Record:
PASS / FAIL
Notes:

============================================================
SECTION A — API HEALTH (curl)

1) GET /api/health
   curl http://localhost:8787/api/health
   → { "ok": true, "timestamp": "..." }

2) GET /api/contacts
   curl http://localhost:8787/api/contacts
   → { "ok": true, "data": [...], "meta": { "count": 3 } }

3) GET /api/companies
   → Returns 3 seed companies

4) GET /api/deals
   → Returns 3 seed deals

5) GET /api/projects
   → Returns 3 seed projects

6) GET /api/tasks
   → Returns 10 seed tasks

7) GET /api/overview/crm
   → Returns KPI summary with contacts, companies, deals, pipelineValue

8) GET /api/overview/projects
   → Returns KPI summary with activeProjects, totalTasks, completed, overdue

9) Search:
   curl "http://localhost:8787/api/contacts?search=SK"
   → Returns filtered results

Record:
PASS / FAIL
Notes:

============================================================
SECTION B — API CRUD (curl)

1) POST /api/contacts
   curl -X POST http://localhost:8787/api/contacts \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Contact","email":"test@example.com"}'
   → Returns created record with generated ID

2) GET /api/contacts/{id}
   → Returns the contact just created

3) PUT /api/contacts/{id}
   curl -X PUT http://localhost:8787/api/contacts/{id} \
     -H "Content-Type: application/json" \
     -d '{"email":"updated@example.com"}'
   → Returns updated record

4) DELETE /api/contacts/{id}
   → Returns { "ok": true }

5) GET /api/contacts/{id}
   → Returns 404 NOT_FOUND

Record:
PASS / FAIL
Notes:

============================================================
SECTION C — REFERENTIAL INTEGRITY (curl)

1) Try DELETE /api/companies/comp-001 (has linked contacts)
   → 409 CONFLICT, error message mentions linked records

2) Try DELETE /api/contacts/cont-001 (has linked deals)
   → 409 CONFLICT

3) DELETE /api/projects/proj-001 (has linked tasks)
   → 200 OK, cascades to delete linked tasks

4) Confirm tasks with project_id=proj-001 are gone:
   curl "http://localhost:8787/api/tasks?filter=proj-001&filterCol=project_id"
   → Empty array

Record:
PASS / FAIL
Notes:

============================================================
SECTION D — PROJECTS UI

1) Open Projects page in browser.
2) Verify Overview loads with stats from D1 (not zeros).
3) Switch between Overview, Projects, Tasks tabs.
4) Create a new Project (status = active).
5) Confirm project appears in Projects table.
6) Confirm Overview stats update.
7) Create a Task linked to that Project.
8) Confirm Task appears in Tasks table.
9) Filter tasks by status (To Do, In Progress, Done, Blocked).
10) Filter tasks by project dropdown.
11) Search for the task by title.
12) Edit the task (change status, assignee).
13) Delete the task.
14) Delete the project.
15) Refresh page — confirm deleted items stay deleted.

Record:
PASS / FAIL
Notes:

============================================================
SECTION E — CRM UI

1) Open CRM page in browser.
2) Verify Overview loads with stats from D1.
3) Switch between Overview, Contacts, Companies, Deals tabs.
4) Create a Company.
5) Create a Contact linked to the Company.
6) Create a Deal linked to Company + Contact.
7) Attempt to delete the Contact → should be blocked (linked deal).
8) Attempt to delete the Company → should be blocked (linked contacts/deals).
9) Delete the Deal.
10) Delete the Contact.
11) Delete the Company.
12) Refresh page — confirm deleted items stay deleted.

Record:
PASS / FAIL
Notes:

============================================================
SECTION F — MULTI-USER

1) Open the site in two separate browsers (or one regular + one incognito).
2) In Browser A, create a new Contact.
3) In Browser B, refresh the CRM page.
4) Confirm the new Contact appears in Browser B.
5) In Browser B, edit the Contact (change email).
6) In Browser A, refresh — confirm the edit is visible.
7) In Browser A, delete the Contact.
8) In Browser B, refresh — confirm deletion.

Record:
PASS / FAIL
Notes:

============================================================
SECTION G — AUTH & VISIBILITY

1) Open site without logging in.
   → Login button visible, admin-only nav items hidden.
2) Log in as admin user.
   → Admin nav items appear (Admin link).
3) Log in as team-role user.
   → Roadmap link visible, Admin link hidden.
4) Verify role-based elements show/hide correctly on Projects page.
5) Verify role-based elements show/hide correctly on CRM page.

Record:
PASS / FAIL
Notes:

============================================================
SECTION H — LOCALSTORAGE FALLBACK

1) Stop the Worker (kill wrangler dev).
2) Refresh the site.
3) Confirm data still loads from localStorage (or shows empty state).
4) Create a record — confirm it saves to localStorage.
5) Restart the Worker.
6) Confirm the site switches back to API mode.

Record:
PASS / FAIL
Notes:

============================================================
SECTION I — GENERAL CHECKS

1) No console errors on any page.
2) No broken layout (desktop + mobile).
3) Theme toggle works (light/dark).
4) Mobile menu works.
5) All nav links resolve (no broken hrefs).
6) Search works on both CRM and Projects.
7) Status badge colors render correctly.

Record:
PASS / FAIL
Notes:

============================================================
SECTION J — AGENT API (OpenClaw)

1) Test with agent auth headers:
   curl http://localhost:8787/api/projects \
     -H "Authorization: Bearer <test-api-key>" \
     -H "X-Agent-Id: candid-ops"
   → Returns project list (when agent auth is implemented)

2) Agent creates a task:
   curl -X POST http://localhost:8787/api/tasks \
     -H "Authorization: Bearer <test-api-key>" \
     -H "X-Agent-Id: candid-ops" \
     -H "Content-Type: application/json" \
     -d '{"title":"Agent-created task","project_id":"proj-002","status":"to-do"}'
   → Returns created task

3) Agent updates task status:
   curl -X PUT http://localhost:8787/api/tasks/{id} \
     -H "Authorization: Bearer <test-api-key>" \
     -H "X-Agent-Id: candid-ops" \
     -H "Content-Type: application/json" \
     -d '{"status":"in-progress"}'
   → Returns updated task

Note: Agent auth validation is not yet implemented in the Worker.
These tests verify the API shape is correct for future agent integration.

Record:
PASS / FAIL
Notes:

============================================================
FINAL RESULT

Overall: PASS / FAIL
Tester:
Date:
