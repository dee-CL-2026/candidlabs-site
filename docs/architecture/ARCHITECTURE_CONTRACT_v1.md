# Architecture Contract v1 – Candidlabs Hub

Status: Active (Foundation branch)  
Date: 2026-02-10  
Applies to: `feature/foundation-build`

---

## 1. Canonical Architecture

Candidlabs Hub in this repository uses Cloudflare Pages with a Pages Functions server router.

### Control Plane (Implemented Here)

- Cloudflare Pages project for deploy target and static asset hosting.
- Pages Functions catch-all route: `functions/[[path]].ts`.
- Application router implementation: `src/index.ts`.
- D1 binding (`DB`) for users/tool runs/approvals.
- KV binding (`SESSION_KV`, optional) for session persistence.

### Execution Plane (Current in This Repo)

- Tool run lifecycle is simulated/stubbed in API routes (`src/api/tools.ts`).
- No direct outbound call to GAS is implemented in this repo.

### Execution Plane (External Repos)

- Existing GAS tool implementations are external and not executed directly by this codebase.

---

## 2. Authentication Model (Current)

- Login form is served at `GET /login`.
- Mock login endpoint: `POST /auth/mock-login`.
- Domain restriction check enforced using configured `ALLOWED_DOMAIN`.
- Session cookie is signed (HMAC) using `SESSION_SECRET`.
- Session data stores in KV when configured; otherwise in-memory fallback.

---

## 3. RBAC Model (Current)

Roles: `founder`, `admin`, `sales`, `finance`

| Capability | Founder | Admin | Sales | Finance |
|---------|---------|-------|-------|---------|
| View Hub | yes | yes | yes | yes |
| Run `kaa` | yes | yes | yes | no |
| Run `sales-assets` | yes | yes | yes | no |
| Run `reports` | yes | yes | no | yes |
| Run `budget` | no | yes | no | yes |
| Approve `kaa` | yes | yes | no | no |
| Approve `sales-assets` | yes | yes | no | no |
| Approve `reports` | yes | yes | no | yes |
| Approve `budget` | no | yes | no | yes |

Source of truth: `src/auth/rbac.ts`

---

## 4. Standard Tool API Contract (Current)

### API Surface

- `POST /api/tools/{tool}/run`
- `GET /api/tools/{tool}/runs/{runId}`
- `POST /api/tools/{tool}/runs/{runId}/approve`

`GET /api/tools/{tool}/runs/{runId}/artifact/{artifactId}` is not implemented in current server routes.

### Status Model

`queued | running | completed | failed | needs_approval | approved | rejected`

### Request Envelope (`run`)

```json
{
  "idempotencyKey": "uuid-or-stable-key",
  "input": {},
  "options": { "dryRun": false }
}
```

### Response Envelope (`run`, `status`, `approve`)

```json
{
  "runId": "run_...",
  "status": "queued",
  "submittedAt": "ISO-8601"
}
```

### Approval Workflow Rules (Current)

- `kaa` and `reports` runs transition from `queued` to `needs_approval`.
- `sales-assets` and `budget` runs transition from `queued` to `completed`.

Source of truth: `src/api/tools.ts`
