CANDIDLABS — CRM + PROJECTS INTERNAL MVP (THIS WEEK) — WORK PLAN v0.1
Repo: /Users/dieterwerwath/experiments/repos/candidlabs-site
Canonical context:
- docs/specs/candidlabs-crm-projects_mvp-and-seams_v0.1.md
- CANDIDLABS_AGENT_GUIDE.md

PRINCIPLE
- Work from this list only.
- One concern per commit.
- Keep diffs minimal.
- Auth ignored for now.

============================================================
PHASE 0 — SETUP (10 min)
[ ] 0.1 Confirm clean working tree + on main
    - git status
[ ] 0.2 Create a new working branch for MVP fixes
    - git checkout -b candidlabs-crm-pm-mvp-v0.1

============================================================
PHASE 1 — AUDIT (NO CODE CHANGES) (45–60 min)
[ ] 1.1 CRM audit report (features, CRUD, persistence, errors)
[ ] 1.2 Projects audit report (features, CRUD, persistence, errors)
[ ] 1.3 Confirm localStorage keys + seed behavior
[ ] 1.4 Confirm nav routes for crm/projects are correct on localhost
Deliverable:
- docs/runbooks/crm-projects_audit_report_v0.1.md

============================================================
PHASE 2 — P0 STABILITY FIXES (30–60 min)
[ ] 2.1 Fix any uncaught exceptions in Projects (e.g., pmApplyAuthVisibility undefined)
[ ] 2.2 Fix any uncaught exceptions in CRM (if any)
[ ] 2.3 Smoke test: open CRM + Projects, switch views, CRUD one item each
Acceptance:
- No uncaught console errors
- CRUD still works
- Refresh retains data

============================================================
PHASE 3 — MVP HARDENING (P1) (60–120 min)
[ ] 3.1 Add JSON.parse guards for all localStorage loads (CRM + Projects)
[ ] 3.2 Ensure role-visibility (data-auth-role) is re-applied after re-render (where relevant)
[ ] 3.3 Define delete integrity rules (block deletes that would orphan links OR implement safe cascade)
Acceptance:
- Corrupt storage does not brick module (fallback works)
- Non-admin destructive actions stay hidden after filtering/search
- No silent orphaned references

============================================================
PHASE 4 — FUTURE-PROOF SEAMS (LIGHT) (60–180 min)
[ ] 4.1 Add minimal data adapter wrappers (crmStore / pmStore)
      - Replace direct localStorage calls behind wrappers
[ ] 4.2 Add schema defaults (projectType, ownerTeam, visibleToRoles, visibleToTeams, visibilityMode)
      - Only default + store; minimal/no UI changes this week
[ ] 4.3 Add pure visibility helper functions (canSee / filterForUser)
      - Stub user as admin for now
Acceptance:
- No behavior regression
- UI unchanged (except any minimal required fields)
- Clear seam for D1/Workers later

============================================================
PHASE 5 — LAUNCH CHECKLIST + TAG (30 min)
[ ] 5.1 Create docs/runbooks/crm-projects_internal_mvp_launch_checklist_v0.1.md
[ ] 5.2 Final smoke test: CRUD + refresh + filters
[ ] 5.3 Merge to main (or PR) and tag release
    - git tag candidlabs-internal-mvp-v0.1
    - git push --tags

============================================================
COMMANDS (REFERENCE)
Create branch:
- git checkout -b candidlabs-crm-pm-mvp-v0.1

Local server:
- python3 -m http.server 8000
Open:
- http://localhost:8000/index.html
- http://localhost:8000/crm/index.html
- http://localhost:8000/projects/index.html

COMMIT DISCIPLINE
- One concern per commit, examples:
  - "fix(projects): guard missing pmApplyAuthVisibility to prevent crash"
  - "fix(storage): add safe JSON parse fallback for pm_* keys"
  - "docs: add CRM/Projects audit report v0.1"
