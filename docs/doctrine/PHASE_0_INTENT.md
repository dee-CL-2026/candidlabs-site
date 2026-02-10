# Phase 0 Intent – Candidlabs Hub

## Platform Vision

**What is the Candidlabs Hub?**  
An internal operating system for Candidlabs that centralizes access, tool execution, and audit records.

**Who is it for?**  
Internal Candidlabs users (founder, admin, sales, finance roles) under a configured allowed email domain.

**What problems does it solve?**  
It replaces disconnected tool entrypoints with a single role-gated hub and standardized run lifecycle records.

**What does success look like?**  
A deployable, auditable control plane where tool runs are submitted, tracked, and approved/rejected with deterministic state transitions.

---

## Roles & Access

- **Founders**  
  Can view the hub, run all tools, and approve all tools.

- **Admin**  
  Can view the hub, run all tools, and approve all tools.

- **Sales**  
  Can view the hub and run `kaa` and `sales-assets`.

- **Finance**  
  Can view the hub and run `reports` and `budget`; can approve `reports` and `budget`.

- **Future Roles**  
  UNKNOWN. Confirm in `src/config/env.ts` and `src/auth/rbac.ts` if new roles are introduced.

---

## Data Sensitivity & Risk

- Sensitive operational and financial tool inputs can be submitted through tool run APIs.
- Access is session-gated and role-gated in server code.
- Run and approval records persist to D1 tables (`tool_runs`, `approvals`).
- Session records are stored in KV when bound, otherwise in-memory fallback.

---

## Constraints & Non-Goals

**Non-goals**
- Not a public consumer product.
- Not a direct browser-to-GAS integration.
- Not a replacement of existing GAS runtime logic in this phase.

**Technology constraints**
- Server entrypoint is Cloudflare Pages Functions (`functions/[[path]].ts`) forwarding to `src/index.ts`.
- Cloudflare bindings/vars are configured in `wrangler.toml`.
- Tool execution in this repo is lifecycle scaffolding; it does not call external GAS endpoints.

---

## Must-Not-Change Invariants

- **No-Strings Mandate**  
  IDs, secrets, and environment-specific values must come from config/bindings.

- **Determinism Over Convenience**  
  The same request envelope should produce deterministic run lifecycle transitions.

- **AI Taxonomy**  
  AI may assist documentation and implementation but does not replace explicit human approval decisions.

- **No Public Data or Platforms**  
  This hub is internal and role-gated.

## 6. Integration Expectations

- Conceptual connection: the hub is the control plane; execution spokes can remain external runtimes.
- Auth and access control: session and RBAC checks are enforced in hub server routes.
- Future expansion: UNKNOWN. Confirm future integration design in a versioned architecture doc before implementation.
