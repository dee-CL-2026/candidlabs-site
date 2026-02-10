# Phase 1 Foundation Scope – Candidlabs Hub

Status: Active  
Applies to branch: `feature/foundation-build`

---

## Purpose

Phase 1 establishes a deployable control plane for role-gated tool run lifecycle management.
It standardizes hub routes, auth/session scaffolding, RBAC checks, and D1 run/approval persistence.

---

## In Scope (Implemented or Directly Scaffolded)

### Routing and Deployment Foundation

- Cloudflare Pages deployment with Pages Functions catch-all entrypoint.
- Catch-all function forwards requests to the application router in `src/index.ts`.
- `wrangler.toml` configured for Pages via `pages_build_output_dir` plus bindings/vars.

### Auth and Session Foundation

- Login page and mock login endpoint.
- Allowed-domain enforcement.
- Signed session cookie handling.
- Session lookup middleware for protected routes.

### RBAC and Governance Foundation

- Role model: `founder | admin | sales | finance`.
- Route/action checks for run and approve operations.
- Approval records persisted in D1.

### Data Foundation

- D1 schema for users, tool_runs, approvals.
- Deterministic run status transitions and idempotent run creation by key.

### Tool Surface Foundation

- `/tools` index page.
- Tool pages: `/tools/kaa`, `/tools/sales-assets`, `/tools/reports`, `/tools/budget`.
- API endpoints for run/status/approve lifecycle.

---

## Out of Scope (Not Implemented in This Phase)

- Direct Worker-to-GAS or Pages-to-GAS execution wiring.
- Real OAuth/OIDC provider integration.
- Tool-specific business logic execution and artifact generation.
- Scheduler/cron orchestration.
- UI polish beyond functional scaffold.

---

## Architectural Constraints

- Server requests must enter through Pages Functions (`/functions/[[path]].ts`).
- Configuration must remain binding/var driven.
- Status and envelope behavior must remain contract-consistent.
- Documentation claims must map to current code paths.

---

## Phase Exit Criteria

Phase 1 is complete when:

- Pages deploy validation passes for `wrangler.toml`.
- Hub/tool/API routes are accessible with session and RBAC checks.
- Tool run lifecycle (run/status/approve) persists deterministic records in D1.
- Approvals are explicitly recorded.

