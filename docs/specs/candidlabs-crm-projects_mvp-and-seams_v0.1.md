CANDIDLABS CRM + PROJECTS — INTERNAL MVP THIS WEEK (FUTURE-PROOF SEAMS) — v0.1
Repo: this repository
Modules:
- CRM:      /crm/index.html + /crm/crm.js
- Projects: /projects/index.html + /projects/projects.js
Auth: ignore for now (may redirect). Focus on feature audit + data model seams.

GOAL (THIS WEEK)
1) Confirm what capabilities exist (CRUD, filters, persistence, UI flows).
2) Fix any runtime blockers so modules can run in “internal admin mode”.
3) Add minimal future-proof seams (schema fields + adapter boundaries) WITHOUT planning the full platform.

NON-GOALS (THIS WEEK)
- No backend / D1 / Workers implementation
- No Google auth wiring
- No multi-user sync
- No major UI redesign / refactor
- No external portal

============================================================
A) WHAT EXISTS NOW — REQUIRED AUDIT OUTPUT
Deliver as a short report with:
1) CRM feature map
   - Views (tabs)
   - Entities (contacts/companies/deals)
   - CRUD completeness (create/read/update/delete per entity)
   - Search/filter/sort
   - Any computed KPIs
2) Projects feature map
   - Views (overview/projects/tasks)
   - CRUD completeness (projects/tasks)
   - Filters (status tabs, project filter, etc.)
   - KPIs/progress cards
3) Persistence
   - localStorage keys used
   - load/seed behavior
   - refresh survival confirmation
4) Runtime issues
   - Console errors (P0)
   - Missing functions, missing imports, 404s
5) Launch readiness
   - “Usable internal MVP” checklist pass/fail
   - P0/P1 backlog with acceptance criteria

============================================================
B) P0 STABILITY (MUST FIX BEFORE INTERNAL LAUNCH)
1) Fix any module-crashing ReferenceErrors (example already seen: pmApplyAuthVisibility undefined).
Acceptance:
- Opening /crm/index.html and /projects/index.html produces NO uncaught exceptions.
- User can navigate within module views without module JS halting.

2) Ensure local dev routing works with simple static server
- Links in nav must target explicit files:
  - crm/index.html
  - projects/index.html
Acceptance:
- Clicking CRM/Projects from nav loads the module page (even if auth later redirects).

============================================================
C) FUTURE-PROOF “SEAMS” (MINIMAL, NO BIG REWRITE)
Add ONLY these seams if they are low-impact:
1) Data Adapter Layer (boundary)
Goal: stop hard-coding localStorage everywhere.
Implement a tiny wrapper per module:
- crmStore.{load,save} for contacts/companies/deals
- pmStore.{load,save} for projects/tasks
Acceptance:
- All existing behavior unchanged.
- Swapping adapter later is possible without changing UI code paths.

2) Canonical Metadata Fields (add now, defaulted)
Rationale: future external visibility + internal team scoping, without changing UI structure.

TEAM ENUM (v1)
- leadership, sales, ops, rnd, tech, finance, va, marketing_partner

PROJECT TYPE ENUM (v1)
- commercial, rnd, tech, operations, people, marketing

PROJECT FIELDS (v1)
Required:
- projectType
- ownerTeam
- visibleToRoles[]        (keep simple now; default ["admin"] or ["admin","staff"])
- visibleToTeams[]        (default [ownerTeam])
- visibilityMode          ("internal_only" | "partner_readonly")
Commercial-only optional:
- orgId                   (e.g., "skd")
- branchId                (e.g., "skd_bali")
- externalOrgId           (e.g., "pnb" OR "twomc")
Rule:
- If projectType != commercial:
  orgId="candid"; branchId=null; externalOrgId=null

TASK FIELDS (v1)
- ownerTeam
- visibleToRoles[]
- visibleToTeams[]
- projectId nullable (tasks can be standalone)
Inheritance (if task.projectId != null):
- task org/branch/external should default-inherit from project (unless explicitly overridden later)

3) Visibility Functions (pure, reusable)
Implement as pure functions (even if auth is stubbed):
- canSee(user, entity)
- filterForUser(user, entities)
Acceptance:
- No functional change for “admin” user now.
- Ready to be enforced server-side later.

============================================================
D) INTERNAL MVP LAUNCH CHECKLIST (THIS WEEK)
CRM:
- Contacts/Companies/Deals CRUD end-to-end
- Search works
- Data persists after refresh
Projects:
- Projects/Tasks CRUD end-to-end
- Filters work
- Data persists after refresh
Cross-cutting:
- No uncaught console errors
- No broken nav links on localhost server

============================================================
E) IMPLEMENTATION ORDER (STRICT)
1) Audit report (A) — NO CODE CHANGES
2) P0 stability fixes (B) — minimal patch set
3) Adapter wrapper + schema defaults (C) — minimal changes, preserve behavior
4) Quick smoke test (D) — record pass/fail and remaining backlog

============================================================
F) HANDOFF TOOLS: PROMPTS (USE VERBATIM)
For Codex (analysis-only):
- “Read crm/index.html + crm/crm.js and produce section A(1)-(5) exactly.”
- “Read projects/index.html + projects/projects.js and produce section A(1)-(5) exactly.”
- “List any uncaught exceptions and the exact line numbers; propose smallest fix.”

For Claude (implementation):
- “Apply section B P0 fixes with smallest diff.”
- “Implement section C seams with minimal edits; do not refactor UI; preserve behavior.”
- “After changes, run smoke tests in section D and report pass/fail.”

============================================================
G) NOTES
- Auth redirects are allowed during development; do not fix auth now.
- Focus is MVP stability + future-proof seams only.
- Keep diffs small and reviewable (one concern per commit).
