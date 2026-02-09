# Phase 0 Intent – Candidlabs Hub

## Platform Vision

**What is the Candidlabs Hub?**  
An internal business operating system (Candid OS) providing the foundational structure for documentation, operational automation, reporting, and governance.

**Who is it for?**  
Primarily for internal use by the Candid team to ensure operational rigor. Future expansion includes internal and external portals for staff, partners, distributors, and investors.

**What problems does it solve?**  
It eliminates fragmented knowledge, prevents speculative refactors, and provides a deterministic, auditable framework for decision traceability and reporting.

**What does success look like?**  
A system that is operable, auditable, and credible at scale. Success is defined by a foundation build that establishes durable invariants and architectural primitives allowing the system to evolve without rework.

---

## Roles & Access

- **Founders**  
  Full view and approval authority. Responsible for strategic narrative and final review of executive reporting.

- **Admin**  
  Full access to view, create, run, and approve all system components. Maintains the executable truth and manages manual migration protocols.

- **Sales**  
  Can run specific tools such as the KAA Generator and Sales Asset Generator. Can create mapping entries via forms but has no access to core database logic.

- **Finance**  
  Owns the financial system of record (Xero). Views financial consistency checks and runs month-end refresh pipelines.

- **Future Roles**  
  External users (partners, investors) with permissioned view-only access to derived artefacts.

---

## Data Sensitivity & Risk

- Sensitive data includes financial records of truth, cost drivers (COGS), SKU-level profitability, receivables/payables, and runway estimates.
- No part of the platform is public-facing.
- All data must be traceable to a raw source.
- Derived artefacts are disposable; doctrine and executable truth must always be reviewable and auditable.

---

## Constraints & Non-Goals

**Non-goals**
- Not a consumer-facing product.
- Not a greenfield experiment.
- Not an AI-governed system.
- Not a collection of ad-hoc scripts.

**Technology constraints**
- Current execution logic lives in Google Apps Script (Hub-and-Spoke architecture).
- Documentation must be compatible with NotebookLM knowledge synthesis.

---

## Must-Not-Change Invariants

- **No-Strings Mandate**  
  No hardcoded identifiers or magic values.

- **Determinism Over Convenience**  
  Predictable, repeatable behaviour is preferred over shortcuts.

- **AI Taxonomy**  
  AI is assistive (reasoning and synthesis) and has no authority to decide architecture or execute system changes.

6. Integration Expectations
• Conceptual Connection: Tools are isolated "Spokes" (execution contexts) that depend on a centralised "Hub" of pure logic and configuration.
• Auth & Access Control: Authentication resides within the Candid Google Account (System of Record). Release safety is enforced via mechanical guardrails (e.g., .clasp.json bindings).
• Future Expansion: Designed to eventually integrate directly with APIs (Unleashed/Xero) and support automated distributor reporting via external portals
- **No Public Data or Platforms**  
  The system is internal-first and private by design.
