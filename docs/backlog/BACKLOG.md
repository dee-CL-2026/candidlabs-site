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
