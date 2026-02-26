# ADR-0002: Freeze Migration Execution Sequence

## Status

Accepted — 2026-02-26

## Context

The Platform Migration Map v2.0 defines 6 waves plus Phase A (Xero Sync). Phase A was identified as the top-priority cross-cutting dependency, with Wave 2 (Sales) and Wave 3 (Production) both depending on Xero data availability.

As of 2026-02-26, Phase A is operationally complete:

| Phase A Item | Status |
|---|---|
| PA-1: Xero OAuth connect | Done |
| PA-2: Invoice + item sync | Done |
| Extended dataset (reports, bank transactions) | Done |
| Snapshot pipeline (reporting_v0: SQLite DB + CSV) | Done |

A working `reporting_v0` pipeline produces structured Xero data via 5 scopes across 5 endpoints (Accounts, Bank Transactions, Invoices, P&L Reports, Organisation). Output: 709 KB snapshot DB, 6 tables, 5 views, 11 CSV files.

With Phase A resolved, the sequencing debate (parallel vs serial, Xero-first vs CSV-interim) is eliminated. The only remaining gap is a D1 ingestion endpoint that loads the reporting_v0 dataset into platform tables — an integration step, not an infrastructure gap.

## Decision

### Canonical execution order

```
Preflight Gates
    ↓
Wave 1: KAA + Foundation (prove adapter pattern)
    ↓
Wave 2: Sales Pipeline (map reporting_v0 → D1)
    ↓
Wave 3: Production Costing (sku_costing into D1, remove cross-sheet dependency)
    ↓
Wave 4: Loan Tracker
    ↓
Wave 5: Sales Tool
    ↓
Wave 6: GAS Decommission
```

### Phase A is no longer a gate

Phase A completion is acknowledged. It does not block Wave 2 or any subsequent wave. The CSV import path remains available as fallback/debug but is no longer the primary ingestion method.

### Preflight gates (do once, then stop)

1. Confirm live deployed scriptIds for the 8 PLATFORM spokes.
2. Classify the 15 STAGING projects (in-use vs archive).
3. Confirm LEGACY triggers (any still firing).

Stop condition: each PLATFORM project has a confirmed live scriptId + clasp folder. STAGING/LEGACY are classified as safe to ignore or flagged for action.

### Wave stop conditions

**Wave 1 — KAA + Foundation**
- D1 tables: `agreements`, `jobs`, `job_logs`
- Worker adapter auth pattern proven (API key in X-Api-Key header)
- End-to-end vertical slice: create agreement in platform UI → generate doc via GAS adapter → log to jobs/job_logs → send email via GAS adapter
- Old KAA sheet becomes read-only archive
- Stop condition: one agreement flows through the entire pipeline.

**Wave 2 — Sales Pipeline**
- D1 tables: `revenue_transactions`, `account_mapping`, `account_status`, `deck_metrics`
- Ingestion endpoint consumes reporting_v0 dataset (snapshot or incremental — decided during Wave 2 design)
- Margin calculation ported to Worker (replaces margin.js cross-sheet logic)
- Slides deck adapter operational (22 placeholders)
- Stop condition: upload Xero data → compute revenue + margin → generate monthly deck from platform.

**Wave 3 — Production Costing**
- D1 tables: `production_runs`, `bom_components`, `component_costs`, `sku_costing`, `batch_cogs`, `payables`, `arap_snapshots`
- Payables import + KMI import endpoints
- Costing engine + batch COGS ported to Worker
- Wave 2 margin calc updated to read `sku_costing` from D1 (removes cross-sheet coupling to Production DB Google Sheet)
- Stop condition: SKU costing produced in D1; Sales margin reads it from D1.

**Wave 4 — Loan Tracker**
- Ledger + interest accrual runs via cron
- Statement generation via GAS adapter
- Stop condition: ledger operational, statements generated.

**Wave 5 — Sales Tool**
- Pricing CRUD in D1
- PDF generation (Worker or adapter)
- Stop condition: pricing tool functional in platform.

**Wave 6 — GAS Decommission**
- All PLATFORM scriptIds archived
- QUARANTINE mirrors removed
- Only thin adapters remain (doc gen, email, slides, statement gen)
- Stop condition: no GAS script runs business logic.

### Phase A → Wave 2 integration gap

The reporting_v0 pipeline outputs a snapshot database. Wave 2 must define:
1. Snapshot vs incremental ingestion pattern
2. Canonical D1 accounting tables (mapped from reporting_v0 schema)
3. Ingestion endpoint contract (POST /api/sales/import-receivables or equivalent)
4. Scheduling strategy (manual trigger, cron, webhook)

This design work happens after Wave 1 proves the adapter pattern, not before.

## Consequences

### Positive

- Execution sequence is frozen. No more sequencing debate.
- Stop conditions are explicit. Each wave has a testable completion criterion.
- Phase A completion is formally recorded. It cannot re-emerge as a blocker.
- Wave 2 design is deferred until Wave 1 proves the architecture. Reduces rework risk.

### Negative

- Rigidity. If an unexpected dependency surfaces mid-wave, this ADR must be amended (not silently overridden).
- Wave 3 is scoped narrowly (sku_costing in D1). Full production module capabilities (stock tracking, FIFO, inventory valuation) are deferred.

### Mitigation

- Any deviation from this sequence requires a new ADR explaining context and consequences.
- Wave 3 scope can be expanded in a future ADR once the foundation is proven.

## Version Impact

- [ ] Standard version bump — N/A
- [x] Implementation version bump — ROADMAP.yml milestone statuses will be updated as waves complete
- [ ] No version impact
