# Tools Current State (Hub Inventory)

Date: 2026-02-10  
Scope: Current behavior in `candidlabs-site` codebase.

## KAA (`kaa`)

- Entrypoints:
  - UI: `GET /tools/kaa`
  - Run: `POST /api/tools/kaa/run`
  - Status: `GET /api/tools/kaa/runs/{runId}`
  - Approve: `POST /api/tools/kaa/runs/{runId}/approve`
- Data dependencies:
  - D1 `tool_runs`
  - D1 `approvals`
  - session context (cookie + KV/in-memory)
  - Tool-specific business input schema: UNKNOWN (confirm in future execution adapter file)
- Outputs:
  - API envelope `{ runId, status, submittedAt }`
  - D1 run row + optional approval row
- Run method:
  - Hub-side stub lifecycle in `src/api/tools.ts`.
  - No GAS invocation in this repository.
- Approval requirement:
  - Run transitions to `needs_approval`.

## Sales Assets (`sales-assets`)

- Entrypoints:
  - UI: `GET /tools/sales-assets`
  - Run: `POST /api/tools/sales-assets/run`
  - Status: `GET /api/tools/sales-assets/runs/{runId}`
  - Approve: `POST /api/tools/sales-assets/runs/{runId}/approve`
- Data dependencies:
  - D1 `tool_runs`
  - D1 `approvals`
  - session context (cookie + KV/in-memory)
  - Tool-specific business input schema: UNKNOWN (confirm in future execution adapter file)
- Outputs:
  - API envelope `{ runId, status, submittedAt }`
  - D1 run row + optional approval row
- Run method:
  - Hub-side stub lifecycle in `src/api/tools.ts`.
  - No GAS invocation in this repository.
- Approval requirement:
  - Run transitions to `completed` (no `needs_approval` step).

## Reports (`reports`)

- Entrypoints:
  - UI: `GET /tools/reports`
  - Run: `POST /api/tools/reports/run`
  - Status: `GET /api/tools/reports/runs/{runId}`
  - Approve: `POST /api/tools/reports/runs/{runId}/approve`
- Data dependencies:
  - D1 `tool_runs`
  - D1 `approvals`
  - session context (cookie + KV/in-memory)
  - Tool-specific business input schema: UNKNOWN (confirm in future execution adapter file)
- Outputs:
  - API envelope `{ runId, status, submittedAt }`
  - D1 run row + optional approval row
- Run method:
  - Hub-side stub lifecycle in `src/api/tools.ts`.
  - No GAS invocation in this repository.
- Approval requirement:
  - Run transitions to `needs_approval`.

## Budget (`budget`)

- Entrypoints:
  - UI: `GET /tools/budget`
  - Run: `POST /api/tools/budget/run`
  - Status: `GET /api/tools/budget/runs/{runId}`
  - Approve: `POST /api/tools/budget/runs/{runId}/approve`
- Data dependencies:
  - D1 `tool_runs`
  - D1 `approvals`
  - session context (cookie + KV/in-memory)
  - Tool-specific business input schema: UNKNOWN (confirm in future execution adapter file)
- Outputs:
  - API envelope `{ runId, status, submittedAt }`
  - D1 run row + optional approval row
- Run method:
  - Hub-side stub lifecycle in `src/api/tools.ts`.
  - No GAS invocation in this repository.
- Approval requirement:
  - Run transitions to `completed` (no `needs_approval` step).

## Evidence Files

- `src/config/env.ts`
- `src/api/tools.ts`
- `src/ui/routes/tools.ts`
- `src/auth/rbac.ts`
- `src/db/schema.sql`
