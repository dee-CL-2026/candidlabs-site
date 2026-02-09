# Architecture Contract v1 – Candidlabs Hub

Status: Draft  
Date: 2026-02-09

---

## 1. Canonical Architecture

Candidlabs Hub = **Control Plane + Execution Plane**

### Control Plane (Cloudflare)

- Cloudflare Pages – UI
- Cloudflare Worker – API gateway and orchestration
- Cloudflare D1 – users, roles, tool runs, approvals
- Cloudflare KV – sessions and short-lived run status cache

### Execution Plane (Current)

- Key Account Agreement (KAA) Generator – Google Apps Script
- Sales Asset Generator – Google Apps Script
- Report Generator – Google Apps Script
- Budget Planner – UI-only (site), backend optional

**Invariant:**  
The Worker is the only public entrypoint. No browser-to-GAS calls are permitted.

---

## 2. Authentication Model

- Google Workspace OAuth (domain-restricted)
- Login via Google OIDC
- Worker issues secure, httpOnly session cookie
- User identity key = email
- Domain restriction enforced via configuration

---

## 3. RBAC Model

Roles: Founder, Admin, Sales, Finance

| Capability | Founder | Admin | Sales | Finance |
|---------|---------|-------|-------|---------|
| View Hub | ✓ | ✓ | ✓ | ✓ |
| Manage users / roles | ✓ | ✓ | ✗ | ✗ |
| Run KAA Generator | ✓ | ✓ | ✓ | ✗ |
| Approve KAA Draft | ✓ | ✓ | ✗ | ✗ |
| Run Sales Asset Generator | ✓ | ✓ | ✓ | ✗ |
| Run Report Generator | ✓ | ✓ | ✗ | ✓ |
| Approve monthly pack | ✓ | ✓ | ✗ | ✓ |
| Budget view | ✓ | ✓ | ✗ | ✓ |
| Budget edit | ✗ | ✓ | ✗ | ✓ |

Approval is explicit and human-reviewed. Draft → Approved transitions must be represented in-system.

---

## 4. Standard Tool Contract

Uniform interface for all tools.

### API Surface

- POST `/api/tools/{tool}/run`
- GET `/api/tools/{tool}/runs/{runId}`
- POST `/api/tools/{tool}/runs/{runId}/approve`
- GET `/api/tools/{tool}/runs/{runId}/artifact/{artifactId}`

### Run Status Model

`queued | running | completed | failed | needs_approval | approved | rejected`

### Request Envelope

```json
{
  "idempotencyKey": "uuid",
  "input": {},
  "options": { "dryRun": false }
}
