# Phase 1 Foundation Scope – Candidlabs Hub

Status: Draft  
Applies to branch: feature/foundation-build

---

## Purpose

Phase 1 establishes the **durable foundation primitives** of the Candidlabs Hub.
This phase exists to create a stable control plane that future tool integrations
can plug into without rework.

Phase 1 is explicitly **not** about business logic, automation depth, or GAS refactors.

---

## Phase 1 Objectives (What We ARE Building)

### Control Plane Foundations

- A framework-based frontend for `candidlabs-site` suitable for Cloudflare Pages.
- A Cloudflare Worker acting as the single public API gateway.
- A clear `/api/*` routing structure (even if handlers are stubbed).
- Deterministic request/response behaviour aligned to the Phase 0 contract.

### Authentication & Identity (Scaffold Only)

- Login flow scaffolding compatible with Google Workspace OAuth.
- Domain-restricted identity model (email as primary key).
- Session creation and validation primitives (can be mocked initially).

### RBAC & Governance Primitives

- Role model: `founder | admin | sales | finance`.
- RBAC middleware enforcing route- and action-level permissions.
- Approval-state representation (draft / needs_approval / approved / rejected).
- No UI polish required; functional placeholders are sufficient.

### Data Layer Foundations

- Cloudflare D1 schema for:
  - users
  - tool_runs
  - approvals
- Minimal data access layer (DAL) with deterministic behaviour.
- No optimisations, caching strategies, or performance tuning.

### Tool UI Placeholders

- `/tools` index page.
- Placeholder pages for:
  - `/tools/kaa`
  - `/tools/sales-assets`
  - `/tools/reports`
  - `/tools/budget`
- Pages may show “Coming soon” or stub run actions.

### API Stubs

- `/api/tools/{tool}/run`
- `/api/tools/{tool}/runs/{runId}`
- `/api/tools/{tool}/runs/{runId}/approve`

All endpoints may return **mock data**, but must conform exactly to
`contracts/tool-run.envelope.v1.json`.

---

## Explicit Non-Goals (What We ARE NOT Building)

- No real tool execution.
- No calls to Google Apps Script.
- No GAS code changes.
- No business logic porting.
- No budget calculations or financial logic.
- No PDF generation.
- No report generation.
- No Looker integration.
- No scheduler / cron jobs.
- No background workers beyond request handling.
- No UI design polish or branding work.

---

## Architectural Constraints (Must Be Respected)

- The Worker is the **only** public entrypoint.
- No browser-to-GAS calls.
- No hardcoded IDs, secrets, or magic values.
- Configuration must be environment-driven.
- Behaviour must be deterministic and auditable.
- Phase 0 contracts and intent documents are authoritative.

---

## Phase Exit Criteria

Phase 1 is considered complete when:

- The site deploys successfully to Cloudflare Pages.
- Auth and RBAC middleware exist and can gate routes.
- Tool run lifecycle can be simulated end-to-end with mock data.
- Run records and approvals are persisted in D1.
- The system can demonstrate:
  User → Login → Tool Run (stub) → Approval → Status View

No real-world output is required.

---

## Handoff to Phase 2

Once Phase 1 is complete:

- Phase 2 may wire **real authentication** (OAuth fully enabled).
- Phase 2 may add role management UI.
- Phase 2 may introduce HMAC signing Worker → GAS.
- Phase 2 may refine approval workflows.

Phase 1 must remain stable and unchanged once exited.

