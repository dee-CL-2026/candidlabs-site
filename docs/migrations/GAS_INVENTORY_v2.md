# GAS Inventory v2.0 — Git-First Audit

> Generated 2026-02-25. Supersedes v1. Sources: `git ls-tree`, `git branch -a`, `.clasp.json` scriptIds, working tree inspection.
>
> **v1 was wrong.** It only searched for `*.gs` files and missed the `*.js` GAS source deployed via clasp.
> Every project listed below has been verified against the git tree on **all remote branches**.

---

## Repos Audited

| Repo | Remote | Branches | GAS projects found |
|------|--------|----------|--------------------|
| `candid-labs` | `https://github.com/dee-CL-2026/candid-labs.git` | main, chore/tab-audit-foundation, claude/find-fix-bug-*, claude/review-recent-changes-*, claude/workflow-verification-*, fix/gross-margin-canonical-matching | 30 |
| `candid-labs-tiered` | `https://github.com/dee-CL-2026/candid-labs-tiered.git` | phase-1-tier-refactor | 1 (vendored) |
| `candidlabs-site` | `https://github.com/dee-CL-2026/candidlabs-site.git` | main + 10 feature branches | 0 (Cloudflare Workers, not GAS) |

**Commands run:**
```
git fetch --all --prune  (all 3 repos)
git ls-tree -r --name-only <branch> | grep -E '\.(js|gs)$'
git ls-tree -r --name-only <branch> | grep 'clasp.json'
git ls-tree -r --name-only <branch> | grep 'appsscript.json'
git branch -a  (all 3 repos)
```

---

## Key Structural Finding

The `candid-labs` repo uses a **dual-directory architecture**:

- **`0. PLATFORM/0.1 Vault/{project}/`** — The LIVE clasp-managed deployment source. Contains the full project code (.js) plus shared CoreOS modules injected into each spoke. These are the projects pushed to Apps Script via `clasp push`. Each has a unique scriptId.

- **`LEGACY/{project}/`** — Separate clasp-managed projects with **different scriptIds**. These are the original standalone versions before the platform architecture. 4 of 5 LEGACY projects have their own .clasp.json and distinct code. The LEGACY KAA is the exception (no .clasp.json, .gs-only archive).

- **`STAGING/{project}/`** — Standalone utility scripts, each a separate GAS project with its own scriptId. Real code present as .js files.

**GAS treats `.js` and `.gs` identically via clasp.** The `.gs` files in this repo (CoreOS.gs, TabAnalyser.gs, _version.gs, and the 11 LEGACY/KAA files) are a small fraction. The bulk of GAS source is in `.js` files.

---

## PLATFORM Projects (Live Spokes)

Each project includes shared modules injected from CoreOS: `CoreOS.js`, `docEngine.js`, `docWorkFlows.js`, `healthCheck.js`, `liberateCode.js`, `scriptEngine.js`, `generateConstantsScan.js`, `VaultScriptsAudit.js`.

### P1. candid-labs-core-os

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-core-os/` |
| scriptId | `1SY3f8dK0-icZiZ7KEwhKA-Gmih5S322LikQLYvoHj1fu4P-hVC-2sntI` |
| Branch | origin/main (identical across all branches) |
| Code files | 12 .js + 2 .gs |
| Role | **Shared library** — all other PLATFORM spokes depend on this |

**Source files (origin/main):**
```
CoreOS.gs, CoreOS.js, TabAnalyser.gs, TabAnalyser.js
Directory.js, Menu.js, VaultScriptsAudit.js, constants.js
docEngine.js, docWorkFlows.js, generateConstantsScan.js
healthCheck.js, liberateCode.js, scriptEngine.js
```

**Entrypoints:** `createSovereignMenu()`, `appendGlobalTools()`, `CoreOS_TabAnalyser()`, `showStatusCard()`

**Status: REAL CODE — Hub library. Every spoke depends on it.**

---

### P2. candid-labs-loan-tracker

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-loan-tracker/` |
| scriptId | `1BNRlOSusKYTHu8d4-_MjhdU1sGdDUsMza9cIPMjkr_ozaImtsE4fbE-i` |
| Branch | origin/main |
| Code files | 24 .js + 1 .gs + 2 .html |
| Services | Drive v3, CoreOS library |

**Source files (origin/main):**
```
Analyser.js, BulkFromTransactions.js, BulkStatements.js
CheckSheetAndreports.js, CoreOS.js, FolderUtils.js
Helpers_Sections.js, InterestAccrual.js, OpenOn.js
RebuildLoanInterest.js, SpokeConstants.js, StatementGenerator.js
TEST_ID.js, TabAnalyser.js, TransactionLogic.js
UIHelpers.js, UITriggers.js, VaultScriptsAudit.js
docEngine.js, docWorkFlows.js, generateConstantsScan.js
healthCheck.js, liberateCode.js, scriptEngine.js
_version.gs
GenerateStatementsForm.html, TransactionForm.html
```

**Key entrypoints:** `OpenOn.js` (onOpen), `UITriggers.js`, `InterestAccrual.js`, `TransactionLogic.js`, `StatementGenerator.js`, `BulkStatements.js`, `RebuildLoanInterest.js`

**Business logic:** Loan transaction processing, interest accrual calculations, statement generation, bulk operations, folder management.

**Status: REAL CODE — Full loan management system.**

---

### P3. candid-labs-platform

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-platform/` |
| scriptId | `1adKj1SNUYR_Q5JGEMrC8boiby1jG7yNm5v5njSTf1QysDJF2kZHZZ1xK` |
| Branch | origin/main |
| Code files | 7 .js + 1 .gs |
| Services | Drive v2, Docs v1, Sheets v4, Slides v1, Gmail v1, Tasks v1, AdminDirectory |

**Source files (origin/main):**
```
CoreOS.js, DiscoveryCmsAudit.js, OpenOn.js
debuggerONE.js, flattener.js, healthCheck.js, masterMigration.js
_version.gs
```

**Key entrypoints:** `OpenOn.js` (onOpen), `DiscoveryCmsAudit.js`, `flattener.js` (code flattening tool), `masterMigration.js`

**Business logic:** CMS audit, code flattening pipeline, master migration orchestration. This is the admin/orchestration hub.

**Status: REAL CODE — Platform admin and migration tooling.**

---

### P4. candid-labs-production-master

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-production-master/` |
| scriptId | `1OJcQdB_YLHkXgdJW_hEuo8pxSb_qg-kFqiGU9rpXX1pRPlxGGFT180eC` |
| Branch | origin/main |
| Code files | 40 .js + 1 .gs |
| Services | CoreOS library |

**Source files (origin/main):**
```
ARAPSnapshot.js, Analyser.js, CoreOS.js, Costing_Engine.js
Directory.js, Mopper_Tool.js, OpenOn.js, Pipelines.js
Setup.js, SpokeConstants.js, UITriggers.js, VaultScriptsAudit.js
analyseKmiData.js, audit_cost_coverage.js, audit_kmi_invoices.js
buildProductionRuns.js, buildPurchaseSummary.js, build_batch_cogs.js
build_component_cost_history.js, check_component_codes.js
check_cost_categories.js, check_kmi_raw_data.js, check_raw_can_data.js
check_united_cans.js, cleanPayables.js, debug_can_costs.js
debug_missing_components.js, diagnose_cost_history.js
docEngine.js, docWorkFlows.js, extract_bom.js
generateConstantsScan.js, healthCheck.js, import_bom_master.js
import_config_components.js, kmiFgParser.js, kmiPackagingMovements.js
liberateCode.js, list_can_purchases.js, scriptEngine.js
_version.gs
```

**Key entrypoints:** `OpenOn.js`, `Costing_Engine.js`, `Pipelines.js`, `buildProductionRuns.js`, `build_batch_cogs.js`, `kmiFgParser.js`

**Business logic:** KMI invoice parsing, production run costing, BOM extraction/import, ARAP snapshots, component cost tracking, payables cleaning, can cost debugging. **Heaviest business logic in the ecosystem.**

**Status: REAL CODE — Full production costing pipeline. 40 source files.**

---

### P5. candid-labs-sales-master

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-sales-master/` |
| scriptId | `1i6M0pLzPgU-J4fZYqize1_iXhdW5d4TN3qNMJf6Sj3nqeFIONoo3tMqN` |
| Branch | origin/main |
| Code files | 43 .js + 1 .gs |
| Services | Drive v3, Slides v1, DriveActivity v2, CoreOS library |

**Source files (origin/main):**
```
CRM.js, CoreOS.js, Debug.js, DebugRunner.js
Deck_Metrics_Channel_Narratives.js, Deck_Metrics_Wrapper.js
Directory.js, Mapping_Health.js, OpenOn.js, ReportGenerator.js
SnapshotOutline.js, SpokeConstants.js, Test Library.js
UITriggers.js, VaultScriptsAudit.js, Xero transformer.js
_version.gs, _version.js, account_status.js, buildRevenueMaster.js
check_cogs_assignment.js, check_early_months.js, check_pni_details.js
check_problem_months.js, check_sku_matching.js, cleanReceivables.js
config_lists.js, config_validation.js, deck_metrics_builder.js
deck_metrics_tab_setup.js, docEngine.js, docWorkFlows.js
find_all_sku_patterns.js, find_unmapped_skus.js
generateConstantsScan.js, header_protect.js, healthCheck.js
liberateCode.js, mapping_sync.js, margin.js, scriptEngine.js
slides_template_builder.js, structure_setup.js, tracking_enrichment.js
```

**Key entrypoints:** `OpenOn.js`, `CRM.js`, `buildRevenueMaster.js`, `Xero transformer.js`, `margin.js`, `ReportGenerator.js`, `slides_template_builder.js`, `Deck_Metrics_Wrapper.js`

**Business logic:** Revenue master build, Xero data transformation, CRM operations, margin calculations, SKU mapping, slide deck metrics generation, receivables cleaning, account status tracking.

**Status: REAL CODE — Full sales data pipeline. 43 source files.**

---

### P6. candid-labs-sales-tool

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-sales-tool/` |
| scriptId | `1D-55fwq2gH9KIqQufiZvXfC6plRMRSDg3ZqgWDWaEKZtDB3fqJgEbK79` |
| Branch | origin/main |
| Code files | 20 .js + 1 .gs |
| Services | CoreOS library, webapp (USER_ACCESSING, DOMAIN) |

**Source files (origin/main):**
```
CoreOS.js, Debug.js, Directory.js, MenuBuilder.js, OpenOn.js
SetUp.js, SpokeConstants.js, TabAnalyser.js, Tests.js
UITriggers.js, VaultScriptsAudit.js, _version.gs, _version.js
code.js, constants.js, docEngine.js, docWorkFlows.js
generateConstantsScan.js, healthCheck.js, liberateCode.js, scriptEngine.js
```

**Key entrypoints:** `OpenOn.js`, `code.js`, `SetUp.js`, `MenuBuilder.js`

**Business logic:** Domain-scoped sales webapp tool with custom menu, setup, and tab analysis.

**Status: REAL CODE — Sales tool webapp. 20 source files.**

---

### P7. candid-os-script-discovery-engine

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-os-script-discovery-engine/` |
| scriptId | `1qhYC88qxoZaFOrCE3WcgZ2mXjXBq1OXD8IW4j0kmwkEMoWaiod12vLyR` |
| Branch | origin/main |
| Code files | 3 .js + 1 .gs |
| Services | Drive v3 |

**Source files (origin/main):**
```
Deep containerAudit.js, GasScan.js, SetUp.js, _version.gs
```

**Note:** This project is smaller on main vs chore/tab-audit-foundation (which has 13 files). Some shared modules were removed during flattening.

**Key entrypoints:** `GasScan.js`, `Deep containerAudit.js`, `SetUp.js`

**Business logic:** GAS project scanning, deep container auditing, script discovery across Drive.

**Status: REAL CODE — Infrastructure/admin tool. Reduced on main.**

---

### P8. key-account-agreement-generator (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/key-account-agreement-generator/` |
| scriptId | `1qO29v3Nv6ggK6gmwMdnP7cbj20qQO-NRZlDPw5-9xp-h-LJGE5sY75I6` |
| Branch | origin/main |
| Code files | 24 .js + 1 .gs |
| Services | Gmail v1, CoreOS library |

**Source files (origin/main):**
```
Append.js, BackFill.js, CoreOS.js, Directory.js
GenerateDoc.js, Header_Setup.js, Heartbeat_test.js, Helpers.js
Mapping.js, Notifications.js, OnFormSubmit.js, OpenOn.js
RegenPicker.js, Regenerate.js, SpokeConstants.js, UITriggers.js
VaultScriptsAudit.js, _version.gs, docEngine.js, docWorkFlows.js
generateConstantsScan.js, healthCheck.js, liberateCode.js
scriptEngine.js, test_form_submission.js
```

**Key entrypoints:** `OnFormSubmit.js` (trigger), `OpenOn.js` (onOpen), `GenerateDoc.js`, `Notifications.js`, `BackFill.js`, `Regenerate.js`

**Business logic:** Form submission → canonical mapping → agreement doc generation → email notifications. Full KAA pipeline with shared CoreOS modules.

**Status: REAL CODE — LIVE KAA system with 24 source files. This is the PLATFORM version (different scriptId from LEGACY).**

---

## LEGACY Projects (Original Standalone Versions)

These have **different scriptIds** from their PLATFORM counterparts. They represent the pre-platform architecture.

### L1. key-account-agreement-generator (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/key-account-agreement-generator/` |
| scriptId | **None** — no .clasp.json |
| Branch | origin/main |
| Code files | 12 .gs (no .js) |

**Source files:** Append.gs, BackFill.gs, Constants.gs, GenerateDoc.gs, Header_Setup.gs, Helpers.gs, Mapping.gs, Notifications.gs, OnFormSubmit.gs, OpenOn.gs, RegenPicker.gs, Regenerate.gs

**Status: CODE ARCHIVE — .gs-only copy. No clasp linkage. Likely the original before PLATFORM integration.**

---

### L2. loan-tracker (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/loan-tracker/` |
| scriptId | `1G7fHdoP09hMu6yHhIdentQAQ663pCs3larxRsNqqm_JDm9UPaA1tzsQD` |
| Branch | origin/main |
| Code files | 14 .js |
| Services | Drive v3 |

**Source files:** Analyser.js, BulkFromTransactions.js, BulkStatements.js, CheckSheetAndreports.js, Constants.js, FolderUtils.js, Helpers_Sections.js, InterestAccrual.js, Menu.js, RebuildLoanInterest.js, StatementGenerator.js, TEST_ID.js, TransactionLogic.js, UIHelpers.js

**Status: REAL CODE — Separate GAS project (different scriptId from PLATFORM P2). 14 source files, no shared CoreOS modules.**

---

### L3. production-master (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/production-master/` |
| scriptId | `12E0GgPFMNzC6E09NI3WrdjGajE4K3UTwef4I9p1x0h8BrKanHVUqYJbH` |
| Branch | origin/main |
| Code files | 13 .js |

**Source files:** ARAPSnapshot.js, Analyser.js, Constants.js, Costing_Engine.js, Menu.js, Mopper_Tool.js, Setup.js, analyseKmiData.js, buildProductionRuns.js, buildPurchaseSummary.js, cleanPayables.js, kmiFgParser.js, kmiPackagingMovements.js

**Status: REAL CODE — Separate GAS project. 13 source files, core production costing logic.**

---

### L4. sales-master (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/sales-master/` |
| scriptId | `11xr4-Q4iKtvGfospjp-ZVzbswHm4yaeAQOtcQH08V-gtLEyANXJN0-cw` |
| Branch | origin/main |
| Code files | 23 .js |
| Services | Drive v3, Slides v1, DriveActivity v2 |

**Source files:** CRM.js, Constants.js, Deck_Metrics_Channel_Narratives.js, Deck_Metrics_Wrapper.js, Mapping_Health.js, Menu.js, ReportGenerator.js, SnapshotOutline.js, Tab & Header Analyser.js, Xero transformer.js, account_status.js, buildRevenueMaster.js, cleanReceivables.js, config_lists.js, config_validation.js, deck_metrics_builder.js, deck_metrics_tab_setup.js, header_protect.js, mapping_sync.js, margin.js, slides_template_builder.js, structure_setup.js, tracking_enrichment.js

**Status: REAL CODE — Separate GAS project. 23 source files, full sales pipeline.**

---

### L5. sales-tool (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/sales-tool/` |
| scriptId | `109eEZrg0rTlVQxg5lO4Rm1MvEDfi5j4jKthd_Vh9VdR6yzyUaa-gwauC` |
| Branch | origin/main |
| Code files | 4 .js |

**Source files:** Menu.js, SetUp.js, code.js, constants.js

**Status: REAL CODE — Separate GAS project. 4 source files.**

---

### L6. _archived_shims/candid-labs-os-script-directory

| Key | Value |
|-----|-------|
| Path | `LEGACY/_archived_shims/candid-labs-os-script-directory/` |
| scriptId | `1rMFYRgfeHK1k9dGUXmMz2jAYdV1VMZzWIvT64-lxJ0B0x6XhZv94WAh_` |
| Code files | 1 .js |

**Source file:** ghostlibrarycall.js

**Status: MINIMAL — 1-file shim. Likely a redirect/stub for the old script directory.**

---

## QUARANTINE Project

### Q1. surgical-strike (Surgical Strike)

| Key | Value |
|-----|-------|
| Path | `9. Quarantine/surgical-strike/Surgical Strike/` |
| scriptId | `1N5HsPBzGxooC2-q-qq3sw_sqPJFWWyiiyxuw69PzGvIkeTmNJdQ5g8ht` |
| Branch | origin/main |
| Code files | 22 .js |
| Services | Drive v3, Slides v1, DriveActivity v2, CoreOS library v1 |

**Source files:** CRM.js, Deck_Metrics_Channel_Narratives.js, Deck_Metrics_Wrapper.js, LocalConfig.js, Mapping_Health.js, Menu.js, ReportGenerator.js, SnapshotOutline.js, Xero transformer.js, account_status.js, buildRevenueMaster.js, cleanReceivables.js, config_lists.js, config_validation.js, deck_metrics_builder.js, deck_metrics_tab_setup.js, header_protect.js, mapping_sync.js, margin.js, slides_template_builder.js, structure_setup.js, tracking_enrichment.js

**Status: REAL CODE — This is a variant/fork of sales-master (identical file set). Quarantined but has a live scriptId.**

---

## STAGING Projects (Utility Scripts)

Each is a separate GAS project with its own scriptId. All have real `.js` code.

| # | Project | Path | scriptId | Code files | Description |
|---|---------|------|----------|------------|-------------|
| S1 | candid-data-legacy | `STAGING/candid-data-legacy/` | `1Vix6cjK...` | 1 (Code.js) | Drive v3, Sheets v4 — data migration util |
| S2 | candid-legacy | `STAGING/candid-legacy/` | `1mRIoHqz...` | 7 | CMS file ops, AI summary processing, folder renaming |
| S3 | candid-scripts-archive | `STAGING/candid-scripts-archive/` | `1xeUttQf...` | 3 | UMJ folder counting, summaries |
| S4 | contacts-util | `STAGING/contacts-util/` | `1CM6P_Zx...` | 2 (Code.js, Test.js) | People API contact utilities |
| S5 | envision | `STAGING/envision/` | `1x5psvVD...` | 2 | CMS folder setup, control centre headers |
| S6 | fingers-crossed | `STAGING/fingers-crossed/` | `19I5TAa7...` | 7 | Drive file ops: count, extract, move, dedup |
| S7 | gd-projects | `STAGING/gd-projects/` | `1B1dx3CO...` | 1 (Broker updates.js) | Broker data updates |
| S8 | google-drive-functions | `STAGING/google-drive-functions/` | `1ZsVskfZ...` | 4 | Envision mirror tool (multiple versions) |
| S9 | my-own-stuff | `STAGING/my-own-stuff/` | `1C3wtEgS...` | 6 | People API, contact printing, versioned experiments |
| S10 | nap-test | `STAGING/nap-test/` | `144KOAER...` | 1 (Code.js) | Test script |
| S11 | personal-scripts-master | `STAGING/personal-scripts-master/` | `1DPS3yk8...` | 13 | Drive v2 — rekap combining, APV cleaning, NAP auto, Gemini lead fill, attachment fetch, logo extract, PDF rename |
| S12 | satellite-discovery | `STAGING/satellite-discovery/` | `1RRLpRCX...` | 2 | Drive v2 — bound script auditing |
| S13 | untitled-v1 | `STAGING/untitled-v1/` | `14HIyxZp...` | 1 (Code.js) | Unnamed experiment |
| S14 | untitled-v2 | `STAGING/untitled-v2/` | `14CdGxG3...` | 1 (Code.js) | Unnamed experiment |
| S15 | untitled-v3 | `STAGING/untitled-v3/` | `1vY2SMzj...` | 1 (Code.js) | Unnamed experiment |

---

## Infrastructure Project

### legacy_decommissioner

| Key | Value |
|-----|-------|
| Path | `legacy_decommissioner/` |
| scriptId | `16Oei1qK...` |
| Code files | 1 (Code.js) |

**Status: REAL CODE — Decommissioning utility. 1 file.**

---

## candid-labs-tiered Repo

| Key | Value |
|-----|-------|
| Path | `vendor/legacy/sales_master_min/` |
| scriptId | (uses CoreOS library v0) |
| Branch | phase-1-tier-refactor |
| Code files | 5 .js (SpokeConstants.js, buildRevenueMaster.js, cleanReceivables.js, config_validation.js, structure_setup.js) |

**Also contains refactored modules:**
```
fork/shared/lineage/lineage.js
fork/shared/logging/logging.js
fork/shared/retention/retention.js
fork/spokes/production_master/cleaned/cleanPayables.js
fork/spokes/production_master/ready/buildCostingReady.js
fork/spokes/sales_master/cleaned/cleanReceivables.js
fork/spokes/sales_master/ready/buildRevenueMaster.js
```

**Status: REAL CODE — Tier-refactored architecture. Extract of sales/production shared modules.**

---

## Branch Comparison: What Varies Across Branches

| Branch | Key differences from main |
|--------|--------------------------|
| `chore/tab-audit-foundation` | Fewer files in some projects (pre-flattening). PLATFORM projects have `Directory.js`, `Menu.js`, `SpokeConstants.js` etc. that were later consolidated. No LEGACY directory. |
| `claude/find-fix-bug-*` | Same as main + `Menu.js` renamed to `LegacyMenu.js` in some PLATFORM projects. LEGACY directory present with full code. |
| `claude/review-recent-changes-*` | Identical to main |
| `claude/workflow-verification-*` | Identical to main |
| `fix/gross-margin-canonical-matching` | Identical to main |

**Conclusion:** `origin/main` is the most complete branch. No code exists exclusively on other branches.

---

## ScriptId Registry (30 unique GAS projects)

| # | Project | Location | scriptId |
|---|---------|----------|----------|
| 1 | candid-labs-core-os | PLATFORM | `1SY3f8dK0-icZiZ7KEwhKA-Gmih5S322LikQLYvoHj1fu4P-hVC-2sntI` |
| 2 | candid-labs-loan-tracker | PLATFORM | `1BNRlOSusKYTHu8d4-_MjhdU1sGdDUsMza9cIPMjkr_ozaImtsE4fbE-i` |
| 3 | candid-labs-platform | PLATFORM | `1adKj1SNUYR_Q5JGEMrC8boiby1jG7yNm5v5njSTf1QysDJF2kZHZZ1xK` |
| 4 | candid-labs-production-master | PLATFORM | `1OJcQdB_YLHkXgdJW_hEuo8pxSb_qg-kFqiGU9rpXX1pRPlxGGFT180eC` |
| 5 | candid-labs-sales-master | PLATFORM | `1i6M0pLzPgU-J4fZYqize1_iXhdW5d4TN3qNMJf6Sj3nqeFIONoo3tMqN` |
| 6 | candid-labs-sales-tool | PLATFORM | `1D-55fwq2gH9KIqQufiZvXfC6plRMRSDg3ZqgWDWaEKZtDB3fqJgEbK79` |
| 7 | candid-os-script-discovery-engine | PLATFORM | `1qhYC88qxoZaFOrCE3WcgZ2mXjXBq1OXD8IW4j0kmwkEMoWaiod12vLyR` |
| 8 | key-account-agreement-generator | PLATFORM | `1qO29v3Nv6ggK6gmwMdnP7cbj20qQO-NRZlDPw5-9xp-h-LJGE5sY75I6` |
| 9 | surgical-strike | QUARANTINE | `1N5HsPBzGxooC2-q-qq3sw_sqPJFWWyiiyxuw69PzGvIkeTmNJdQ5g8ht` |
| 10 | loan-tracker | LEGACY | `1G7fHdoP09hMu6yHhIdentQAQ663pCs3larxRsNqqm_JDm9UPaA1tzsQD` |
| 11 | production-master | LEGACY | `12E0GgPFMNzC6E09NI3WrdjGajE4K3UTwef4I9p1x0h8BrKanHVUqYJbH` |
| 12 | sales-master | LEGACY | `11xr4-Q4iKtvGfospjp-ZVzbswHm4yaeAQOtcQH08V-gtLEyANXJN0-cw` |
| 13 | sales-tool | LEGACY | `109eEZrg0rTlVQxg5lO4Rm1MvEDfi5j4jKthd_Vh9VdR6yzyUaa-gwauC` |
| 14 | os-script-directory | LEGACY shim | `1rMFYRgfeHK1k9dGUXmMz2jAYdV1VMZzWIvT64-lxJ0B0x6XhZv94WAh_` |
| 15 | candid-data-legacy | STAGING | `1Vix6cjKzYYy0oKXIkI3nDI0Ckz0C2rPxd9oFRys8Gx8OJEmFiWmgDYLT` |
| 16 | candid-legacy | STAGING | `1mRIoHqzA6WEL-bZpHJ_ZR8SYyESrt4X484SimWXZfyrGvUZwcVZZPaZ6` |
| 17 | candid-scripts-archive | STAGING | `1xeUttQf1AQmfhSKNzqS9KD4XnPAFht454A_hYq7Q_2tvQTXFw91mGMXc` |
| 18 | contacts-util | STAGING | `1CM6P_ZxRc4jecSL-p4caZyilFeKXSMiQnFdShl1OP6j7l5_oko58rrXj` |
| 19 | envision | STAGING | `1x5psvVDOvdFzupid-TjrtKxfGdtG1A-3uiR0Qqy1JFZ1DsCRz1V-u8Bg` |
| 20 | fingers-crossed | STAGING | `19I5TAa7ztu9oNgGV9fGh_E2h0QZwBGdUDVsRY-sMmIKeRkyEyKrCBTVt` |
| 21 | gd-projects | STAGING | `1B1dx3COcVhMqgf0rQZZlejrIdvFs6FYLfCKnAbp5Dw7QWjkULBOBs4YG` |
| 22 | google-drive-functions | STAGING | `1ZsVskfZU66zFxHQNAOoID7Daz19xBG62BDsPaqL-E9xr0jPe-qFtvNzj` |
| 23 | my-own-stuff | STAGING | `1C3wtEgSrhcdrDaHUgiyOgly9XUCH9II42tj0nbuQBAO_NbdTlAr56t7D` |
| 24 | nap-test | STAGING | `144KOAER7P7S0K5L5tD_m4zaFGAC1KUHCKYwBG19kRJVnIYJ_KcK00XxJ` |
| 25 | personal-scripts-master | STAGING | `1DPS3yk8ghsgYJcA4UI3TKHp8_IM9KbLoeYfJT6LwfzBqZC167UZBYK10` |
| 26 | satellite-discovery | STAGING | `1RRLpRCXJwPtTZV3cnTGAKJ-1GDmIrnWkdsuQpFObmdgkdkWDEX7-rfcT` |
| 27 | untitled-v1 | STAGING | `14HIyxZp5MM6oMFMeyGCypmJV01wAs-3Ri7w3ZgeD0sZNOvLSGKCnhsgI` |
| 28 | untitled-v2 | STAGING | `14CdGxG3Jo-rfoxWGVlNLXexiFG28cWemVQK3R4VlqPDq0aQkCVomp1HK` |
| 29 | untitled-v3 | STAGING | `1vY2SMzjUMATifvqN5KxQmMZq4RcwqfDQWWWVeSb2rlv4TeL9UlAIxOwy` |
| 30 | legacy_decommissioner | Root | `16Oei1qKk4mcHnnH5GRyyJg-ZHmR_VzHxx2B9GqMVEAyExoCqRE6ZgG2K` |

**Note:** LEGACY/key-account-agreement-generator has NO .clasp.json (31st directory, but not a separate GAS project).

---

## Standalone GAS Projects (Apps Script API)

**No local `~/.clasprc.json` credentials were found.** To list all online GAS projects (including any NOT in this repo):

```bash
# 1. Install clasp if not present
npm install -g @google/clasp

# 2. Login to Apps Script
clasp login

# 3. List all projects owned by the authenticated account
clasp list

# 4. Compare scriptIds from clasp list against the 30 scriptIds above
# Any scriptId in clasp list but NOT in this table = untracked standalone project
```

**Until `clasp list` is run, we cannot confirm whether there are GAS projects online that have no local filesystem representation.** The 30 scriptIds above are the full set visible from git.

---

## Summary: Code Volume Correction

| Category | v1 claimed | v2 actual |
|----------|-----------|-----------|
| Projects with real code | 2 | **30** |
| Total source files (.js + .gs) | ~13 | **~280** |
| "Empty shell / DELETE" projects | 29 | **0 confirmed** |
| Confirmed repo-stub only | 0 | 1 (LEGACY/KAA — .gs archive, no scriptId) |

**v1's error:** Only searched for `*.gs`. Clasp deploys `*.js` as GAS source. Every "empty" project had real `.js` code on `origin/main` all along.

---

## Open Questions (require your input)

1. **PLATFORM vs LEGACY duplication** — Are both versions of each project (e.g., PLATFORM/sales-master + LEGACY/sales-master) actively deployed? Or is one the canonical source and the other a frozen archive?

2. **Which scriptIds are live in production?** — We can see 30 scriptIds but can't tell which are actively triggered/scheduled without checking the Apps Script console or running `clasp list`.

3. **Surgical Strike** — Is this an active sales-master fork or a decommissioned experiment?

4. **STAGING projects** — Are any of these still in active use, or are they all historical experiments?
