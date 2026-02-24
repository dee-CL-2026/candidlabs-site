CANDIDLABS — FULL SITE QA SCRIPT v0.2
Updated: 2026-02-24
Role: Chief Tester
Scope: Current live site (CF Access auth + localStorage + Worker API)

Instructions:
- Follow sections in order.
- Record PASS / FAIL + notes for each item.
- Screenshot anything unexpected.
- Sections marked [FUTURE] cover planned backend features — skip or mark N/A.

============================================================
PREREQS

1) Open site: https://candidlabs-hub.pages.dev
2) Confirm you are signed in as admin (Dee).
3) Have a second browser or incognito window ready for Section F.
4) Open DevTools → Console tab. Keep it open throughout.

Record:
PASS / FAIL
Notes:

============================================================
SECTION A — GLOBAL / NAV

1) Theme toggle (☽ icon) switches between dark and light.
   → Page re-renders cleanly in both modes. No FOUC.

2) Mobile: resize to <768px.
   → Hamburger menu appears. Tap → nav slides open.
   → All nav links visible and tappable.
   → Tap outside or press Escape → menu closes.

3) Desktop nav links — verify each resolves without 404:
   a) Home (candidlabs logo)
   b) Reports / Dashboard
   c) Tools (dropdown) → Budget, KAA Form, Quote Generator, Xero
   d) CRM
   e) Projects
   f) Admin (admin-only — should show for Dee)

4) No broken links in nav (no href="#" or empty hrefs).

5) User menu (top right) shows Dee's name/avatar.
   → Clicking "Sign Out" redirects to CF Access logout.

6) Console: zero errors on all nav pages.

Record:
PASS / FAIL
Notes:

============================================================
SECTION B — AUTH & ROLE VISIBILITY

1) Sign out. Confirm:
   → Login prompt / CF Access gate shown.
   → Admin nav item hidden.
   → CRM + Projects still accessible? (or gated?)
   → If gated: confirm redirect to login.

2) Sign back in as admin (Dee, @candidmixers.com).
   → Role shown as "admin" in /api/me response (check Network tab).
   → Admin nav link visible.
   → Admin-only buttons (Delete) visible in Projects + CRM tables.

3) [FUTURE — pending CL-CORE-0001] Team-role user:
   → Log in as @candidmixers.com non-admin.
   → Admin link hidden.
   → Delete buttons hidden.
   → Roadmap visible.
   → Mark N/A if no team account available.

4) data-auth-role and data-auth-hide attributes working:
   → Inspect DOM in Projects table — verify delete buttons have data-auth-role="admin"
     and are hidden when not admin.

Record:
PASS / FAIL
Notes:

============================================================
SECTION C — HOMEPAGE

1) Signed-in state:
   → KPI stat cards load with live data (not all zeros).
   → Pipeline/Deals stat card is a clickable link → navigates to CRM.
   → Projects/Tasks stat card is a clickable link → navigates to Projects.

2) Signed-out state (open incognito):
   → "What is Candidlabs?" intro section visible.
   → 4 capability tiles shown.
   → Login button visible.

3) No console errors on homepage.

Record:
PASS / FAIL
Notes:

============================================================
SECTION D — PROJECTS: OVERVIEW TAB

1) Open Projects page → Overview tab loads by default.

2) 4 KPI stat cards show non-zero values:
   → Active Projects, Total Tasks, Completed, Overdue.

3) Project cards grid renders:
   → Each card shows: name, owner, status badge, progress bar, due date.
   → Click a project card → Project Drawer slides in from the right.

4) Project Drawer (from card click):
   → Drawer header shows project name + status badge.
   → Description shown (if set).
   → Metrics row: % Complete, Open, Done, Overdue — all correct.
   → Progress bar fills correctly (matches % Complete).
   → Owner + date range shown in meta row.
   → TASKS section: lists tasks linked to this project.
   → NOTES section: shows existing notes (or empty state).
   → Edit Project button opens edit modal.
   → × button closes drawer.
   → Clicking overlay (left of drawer) closes drawer.
   → Pressing Escape closes drawer.
   → Drawer does NOT overlap the sticky navbar (header visible below nav).
   → No bleed / blur artifact below the navbar line.

Record:
PASS / FAIL
Notes:

============================================================
SECTION E — PROJECTS: PROJECTS TAB

1) Switch to Projects tab.
   → Table renders with columns: Name, Owner, Status, Progress, Due Date, Actions.

2) Search bar:
   → Type a project name fragment → table filters in real time.
   → Clear search → all projects return.

3) Click a project name (link/button in Name column) → drawer opens.
   → Same drawer checks as Section D, step 4.

4) Add Project:
   → Click "+ Add Project".
   → Modal opens with fields: Name, Description, Owner, Status, Start Date, Due Date.
   → Fill all fields. Click Save.
   → Modal closes.
   → New project appears in table.
   → Overview stats update (Active Projects count increments).

5) Edit Project:
   → Click Edit on any project.
   → Modal opens pre-filled with existing values.
   → Change a field. Save.
   → Table row updates.
   → If drawer is open for this project: drawer refreshes automatically.

6) Delete Project (admin):
   → Click Delete on a project.
   → Confirm prompt (if any).
   → Row removed from table.
   → Overview stats update.
   → Linked tasks removed (cascade).

7) Progress bar in table is proportional to task completion.

Record:
PASS / FAIL
Notes:

============================================================
SECTION F — PROJECTS: TASKS TAB

1) Switch to Tasks tab. Default view: List.

2) List view — filters:
   → Filter tabs: All / To Do / In Progress / Blocked / Done.
     Each filter tab shows only matching tasks.
   → Project dropdown: select a project → only its tasks shown.
   → Assignee dropdown: filter by assignee.
   → Search bar: type a word from a task title → filters correctly.
   → Clear all filters → full list returns.

3) Sort:
   → Click column headers (Title, Project, Assignee, Status, Priority, Due Date).
   → Table re-sorts. Click again → reverses sort.

4) Kanban view:
   → Toggle List ↔ Kanban.
   → 4 columns: To Do, In Progress, Blocked, Done.
   → Cards show: priority colour bar, title, project, assignee, due date.
   → Project filter dropdown works on Kanban view.
   → Click a card → edit modal opens.

5) Add Task:
   → Click "+ Add Task".
   → Modal: Title, Project, Assignee, Status, Priority, Due Date, Blocker Note.
   → Set Status = Blocked → Blocker Note field appears.
   → Fill and save.
   → Task appears in list + Kanban.
   → Linked project's drawer metrics update.

6) Edit Task:
   → Change status to "Done". Save.
   → Completed count in Overview increments.

7) Reassign:
   → Click the assignee name in the table → Reassign modal opens.
   → Change assignee. Save. Table updates.

8) Delete Task:
   → Delete a task. Confirm it's removed from list and Kanban.

9) Blocked task badge:
   → A blocked task shows "Blocked" status badge.
   → Blocker note visible on edit.

Record:
PASS / FAIL
Notes:

============================================================
SECTION G — PROJECTS: DRAWER — TASK QUICK-EDIT

1) Open a project drawer with at least 2 tasks.

2) In the TASKS section of the drawer, change a task's status
   using the inline dropdown (no Save button — auto-saves on change).
   → Dropdown colour updates to match new status.
   → Drawer metrics update (Open / Done counts change).
   → Background table (Tasks tab) reflects change if visible.

3) Click "+ Add Task" button inside drawer.
   → Add Task modal opens with project pre-selected.
   → Save → task appears in drawer task list.
   → Metrics update.

4) Click Edit icon on a drawer task → Edit Task modal opens.

Record:
PASS / FAIL
Notes:

============================================================
SECTION H — PROJECTS: DRAWER — NOTES

1) Open a project drawer.

2) In the NOTES section, type a note and click "Add Note".
   → Note appears at top of list (newest first).
   → Note shows timestamp (day month + HH:MM).
   → Notes count badge in section header updates.

3) Add a second note.
   → Both notes visible, ordered newest → oldest.

4) Close drawer. Reopen same project.
   → Notes persist (stored in pm_notes localStorage).

Record:
PASS / FAIL
Notes:

============================================================
SECTION I — CRM: OVERVIEW TAB

1) Open CRM page → Overview tab.

2) 4 KPI stat cards show values:
   → Contacts, Companies, Deals, Pipeline Value (IDR).

3) Values are live (not zeros unless genuinely empty).

Record:
PASS / FAIL
Notes:

============================================================
SECTION J — CRM: CONTACTS

1) Switch to Contacts tab.
   → Table: Name, Company, Role, Email, Phone, Actions.

2) Search bar filters in real time.

3) Company filter dropdown shows companies; filters contacts by company.

4) Add Contact:
   → "+ Add Contact" → modal opens.
   → Fields: Name, Email, Phone, Role, Company (dropdown), Notes.
   → Company dropdown has "+ Create New Company" option — test inline creation.
   → Save → contact appears in table.
   → Overview Contacts count increments.

5) Edit Contact → pre-filled modal → change a field → save → table updates.

6) Click contact name → Detail Drawer opens:
   → Shows all fields, linked company, dates, notes.
   → Comments section (API-dependent — mark N/A if API offline).
   → Edit button in drawer opens edit modal.

7) Delete Contact (admin):
   → If contact has linked deals → deletion blocked with error message (referential integrity).
   → Unlinked contact → deleted successfully.

Record:
PASS / FAIL
Notes:

============================================================
SECTION K — CRM: COMPANIES

1) Switch to Companies tab.
   → Table: Name, Market, Channel, Status, Contact Count, Actions.

2) Search bar filters in real time.

3) Type filter dropdown works.

4) Add Company → modal → save → appears in table.

5) Edit Company → works.

6) Click company name → Detail Drawer opens with all fields.

7) Delete Company:
   → With linked contacts → blocked (referential integrity error shown).
   → Unlinked company → deleted.

8) KAA button → opens Google Form in new tab.

Record:
PASS / FAIL
Notes:

============================================================
SECTION L — CRM: DEALS

1) Switch to Deals tab. Default: List view.

2) List view:
   → Table: Title, Company, Value (IDR), Stage, Created, Actions.
   → Filter tabs: All, Prospecting, Proposal, Negotiation, Closed Won, Closed Lost.
   → Search bar works.

3) Kanban (Board) view:
   → Toggle → 5 columns (one per stage).
   → Card count + pipeline value shown per column.
   → Cards: title, company, value.
   → Click card → Detail Drawer.
   → Click Edit on card → Edit modal.
   → Search bar filters across all columns.

4) Add Deal:
   → Modal: Title, Company (dropdown), Contact (filtered by selected company),
     Value (number, IDR), Stage dropdown, Notes.
   → Save → appears in list and board.
   → Pipeline Value in Overview updates.

5) Edit Deal → change stage → board updates (card moves column).

6) Delete Deal:
   → Removes deal.
   → Previously blocked Contact (linked to this deal) can now be deleted.

Record:
PASS / FAIL
Notes:

============================================================
SECTION M — LOCALSTORAGE PERSISTENCE

1) Create a project, a task, a CRM contact, and a deal.

2) Close the browser tab entirely. Reopen.
   → All created records still present (localStorage survived session).

3) Hard refresh (Ctrl+Shift+R / Cmd+Shift+R).
   → All records still present.

4) Theme preference persists across refresh (dark stays dark, light stays light).

Record:
PASS / FAIL
Notes:

============================================================
SECTION N — API LAYER (CandidStore)

Note: The Worker API at candidlabs-api.dieterwerwath.workers.dev
      handles CRM data. Projects data is localStorage-only.

1) Check API health:
   curl https://candidlabs-api.dieterwerwath.workers.dev/api/health
   → { "ok": true }

2) CRM data routes (with CF Access cookie or public if open):
   GET /api/contacts  → returns contacts
   GET /api/companies → returns companies
   GET /api/deals     → returns deals

3) If API is reachable:
   → CRM page should load live data from API.
   → If API is down: CRM falls back to localStorage (verify records still show).

4) Comments (API-only):
   → Open a CRM detail drawer.
   → Add a comment → appears with author + timestamp.
   → Delete own comment → removed.
   → Comment persists on page refresh (API-stored, not localStorage).

Record:
PASS / FAIL
Notes:

============================================================
SECTION O — GENERAL UI CHECKS

1) No console errors on any page during normal use.

2) No broken layout on desktop (1280px+) or mobile (<768px).

3) Status badge colours render correctly:
   → Projects: active (green), planned (blue), in-progress (orange), blocked (red), done (grey).
   → Tasks: to-do (grey), in-progress (blue), blocked (red), done (green).
   → Deals: prospecting, proposal, negotiation, closed-won, closed-lost — each distinct colour.

4) All modals:
   → Open on button click.
   → Close on Escape key.
   → Close on overlay click.
   → Form validation: required fields show error if empty on save.

5) Drawers (Projects + CRM):
   → Slide in smoothly (no jank).
   → Header fully visible below sticky navbar (not hidden behind it).
   → No blur/bleed artifact at top edge.
   → Scrollable body for long content.
   → Close on Escape.
   → Close on overlay click.

6) Dark mode: all elements themed correctly — no white boxes or
   hard-coded light colours visible.

7) All nav links and internal links resolve (no 404s).

Record:
PASS / FAIL
Notes:

============================================================
[FUTURE] SECTION P — MULTI-USER (post-backend)

Not applicable until D1-backed sessions are implemented.

1) Browser A creates a contact.
2) Browser B refreshes → contact visible.
3) Browser B edits → Browser A refreshes → edit visible.
4) Browser A deletes → Browser B refreshes → record gone.

Record:
N/A — post D1 backend
Notes:

============================================================
[FUTURE] SECTION Q — AGENT API (OpenClaw / post-backend)

Not applicable until agent auth is implemented.

1) GET /api/projects with Authorization + X-Agent-Id headers.
2) POST /api/tasks via agent headers.
3) PUT /api/tasks/{id} status update.

Record:
N/A — post backend + agent auth
Notes:

============================================================
FINAL RESULT

Overall: PASS / FAIL
Tester:
Date:
Build / commit:
Notes:
