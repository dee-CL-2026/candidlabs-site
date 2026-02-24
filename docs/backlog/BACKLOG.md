# CandidLabs Backlog (Canonical)

Rules:
- This is the ONLY file intended for future daemon/agent backlog ingestion.
- Backlog items must be added as "Backlog Cards" using the template below.
- Do not scatter backlog items across other docs.

Template:
## [ID] Title
- Area:
- Priority:
- Status:
- Owner:
- Source:
- Summary:
- Acceptance Criteria:
- Notes:

## [CL-CORE-0001] Role-based visibility — management-only views + collaborator tagging
- Area: Auth / Access Control
- Priority: High (discuss before implementing)
- Status: Open
- Owner: TBD
- Source: Chat — 2026-02-24
- Summary: Certain modules (Projects, Reports, possibly others) should only be visible to management-level users OR to users explicitly tagged as collaborators on a specific project. Requires a decision on the access model before implementation.
- Acceptance Criteria:
  - Management-only pages (Reports, full Projects view) restricted by role.
  - Team members can only see projects they are tagged as collaborators on.
  - Collaborator tagging UI in project edit form.
  - Auth layer enforces visibility at page load and on data fetch.
- Notes:
  - Needs design discussion: is "collaborator" a separate role or a per-project tag?
  - Could be implemented as a `collaborators: []` array on the project record.
  - Interacts with CL-PM-0001 (KPI bucketing) and drawer task list filtering.

## [CL-CORE-0002] @mentions in notes and tasks
- Area: Projects / Comments
- Priority: Medium (discuss)
- Status: Open
- Owner: TBD
- Source: Chat — 2026-02-24
- Summary: Allow @mention syntax in task descriptions, notes, and future comments. Mentioned users should be notified (linked to CL-CORE-0003 email notifications).
- Acceptance Criteria:
  - @name syntax parsed in note/comment text and rendered as highlighted chip.
  - Mentioned user receives notification (email or in-app, TBD).
  - Autocomplete dropdown on @-key press showing team members.
- Notes:
  - Requires team member list (could pull from auth TEAM config or a dedicated contacts store).
  - Notification delivery depends on CL-CORE-0003 implementation.

## [CL-CORE-0003] Email notifications — daily digests and scheduled task reminders
- Area: Notifications / Email
- Priority: Medium (discuss)
- Status: Open
- Owner: TBD
- Source: Chat — 2026-02-24
- Summary: Send automated email updates for tasks: configurable daily digest summarising open/overdue tasks per user, and scheduled reminders for due-date approaching tasks.
- Acceptance Criteria:
  - Daily digest email listing each user's open and overdue tasks.
  - Configurable reminder schedule (e.g. 3 days before due date).
  - User-level opt-in/opt-out preference.
  - Delivery via Cloudflare Workers (Cron Trigger) + email provider (SendGrid / Resend / Postmark TBD).
- Notes:
  - Cloudflare Pages has no native cron; requires a Cloudflare Worker with Cron Trigger separate from the Pages project, or an external scheduler (e.g. GitHub Actions).
  - Email provider choice TBD — discuss cost and deliverability.
  - Linked to @mention notifications (CL-CORE-0002).

## [CL-CORE-0004] Chat / comments capability on tasks and projects
- Area: Projects / Collaboration
- Priority: Medium (discuss)
- Status: Open
- Owner: TBD
- Source: Chat — 2026-02-24
- Summary: Threaded comments/chat on individual tasks and projects. Related to the Notes section added in the project drawer, but as a more structured, multi-user conversation thread rather than a simple log.
- Acceptance Criteria:
  - Comment thread per task and per project, with author + timestamp.
  - Edit and delete own comments.
  - @mentions within comments (links to CL-CORE-0002).
  - Thread visible in project drawer (Notes section) and task detail view.
- Notes:
  - Current Notes section in project drawer is a stepping stone toward this.
  - Backend persistence: localStorage is insufficient for multi-user; requires a real data store (Cloudflare D1 or KV, or a BaaS).
  - Discuss scope — is this a real-time chat (WebSockets) or async comment threads?
  - Could start with async threads and evolve toward real-time.

## [CL-PM-0001] Projects Overview — Status KPI Buckets
- Area: Projects
- Priority: Deferred
- Status: Open
- Owner: TBD (future agent/daemon eligible)
- Source: docs/runbooks/crm-projects_internal_mvp_workplan_v0.1.md (Deferred section); projects/index.html (KPI DOM ids stat-projects/stat-tasks/stat-completed/stat-overdue)
- Summary: Replace single “Active Projects” KPI with bucketed counts by project status (active/planned/in-progress/blocked/done/archived).
- Acceptance Criteria:
  - Overview displays counts per status bucket (labels + numbers).
  - Counts derive from pm_projects only (no hardcoded stats).
  - Updates on init/load and after create/edit/delete/status changes.
- Notes:
  - Current KPI label is “Active Projects” (id stat-projects). Keep as-is until this item is implemented.
