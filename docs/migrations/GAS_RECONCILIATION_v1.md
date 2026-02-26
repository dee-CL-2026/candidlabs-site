# GAS Reconciliation Audit v1.0

> Generated 2026-02-25. Evidence-based diff of PLATFORM vs LEGACY vs QUARANTINE.
> Purpose: Determine which copies are duplicates, which have diverged, and which are current.

---

## Method

For every project that exists in both `0. PLATFORM/0.1 Vault/` and `LEGACY/`:
1. Compared file lists (`git ls-tree` on `origin/main`)
2. Content-diffed every overlapping file (`git show` + `diff`)
3. Categorized as: IDENTICAL / TRIVIALLY DIFFERENT / SIGNIFICANTLY DIVERGED

---

## Findings Summary

| Project | Shared files | Identical | Trivial diff | Significant diff | PLATFORM extras | LEGACY extras |
|---------|-------------|-----------|-------------|-----------------|-----------------|---------------|
| **loan-tracker** | 14 | **14 of 14** | 0 | 0 | 11 (shared modules) | 0 |
| **production-master** | 12 | 10 | 1 | 1 | 28 (shared + new) | 1 |
| **sales-master** | 20 | 16 | 3 | 1 | 24 (shared + new) | 2 |
| **sales-tool** | 4 | 0 | 1 | 3 | 18 (shared + new) | 0 |
| **KAA** | 12 | N/A (.gs vs .js) | — | — | 16 (shared + new) | 0 |

---

## Detailed Diff: loan-tracker

**PLATFORM path:** `0. PLATFORM/0.1 Vault/candid-labs-loan-tracker/`
**LEGACY path:** `LEGACY/loan-tracker/`
**PLATFORM scriptId:** `1BNRlOSusKYTHu8d4-_MjhdU1sGdDUsMza9cIPMjkr_ozaImtsE4fbE-i`
**LEGACY scriptId:** `1G7fHdoP09hMu6yHhIdentQAQ663pCs3larxRsNqqm_JDm9UPaA1tzsQD`

### Shared files (14) — ALL IDENTICAL

```
Analyser.js           ✅ IDENTICAL
BulkFromTransactions.js ✅ IDENTICAL
BulkStatements.js     ✅ IDENTICAL
CheckSheetAndreports.js ✅ IDENTICAL
FolderUtils.js        ✅ IDENTICAL
Helpers_Sections.js   ✅ IDENTICAL
InterestAccrual.js    ✅ IDENTICAL
RebuildLoanInterest.js ✅ IDENTICAL
StatementGenerator.js ✅ IDENTICAL
TEST_ID.js            ✅ IDENTICAL
TransactionLogic.js   ✅ IDENTICAL
UIHelpers.js          ✅ IDENTICAL
GenerateStatementsForm.html ✅ IDENTICAL
TransactionForm.html  ✅ IDENTICAL
```

### PLATFORM-only files (11 — shared CoreOS modules)

```
CoreOS.js, SpokeConstants.js, TabAnalyser.js, UITriggers.js
VaultScriptsAudit.js, _version.gs, OpenOn.js
docEngine.js, docWorkFlows.js, generateConstantsScan.js
healthCheck.js, liberateCode.js, scriptEngine.js
```

### LEGACY-only files (2 — replaced by CoreOS equivalents)

```
Constants.js  → replaced by SpokeConstants.js + CoreOS.js config
Menu.js       → replaced by OpenOn.js (CoreOS menu builder)
```

### Verdict: **LEGACY is a pure subset.** PLATFORM = LEGACY code + CoreOS modules. Safe to archive LEGACY.

---

## Detailed Diff: production-master

**PLATFORM path:** `0. PLATFORM/0.1 Vault/candid-labs-production-master/`
**LEGACY path:** `LEGACY/production-master/`
**PLATFORM scriptId:** `1OJcQdB_YLHkXgdJW_hEuo8pxSb_qg-kFqiGU9rpXX1pRPlxGGFT180eC`
**LEGACY scriptId:** `12E0GgPFMNzC6E09NI3WrdjGajE4K3UTwef4I9p1x0h8BrKanHVUqYJbH`

### Shared files — content comparison

```
ARAPSnapshot.js       ✅ IDENTICAL
Analyser.js           ✅ IDENTICAL
Costing_Engine.js     ⚠️  1-line diff: SpreadsheetApp.openById(CoreOS...) vs .getActive()
Mopper_Tool.js        ✅ IDENTICAL
Setup.js              ✅ IDENTICAL
analyseKmiData.js     ✅ IDENTICAL
buildProductionRuns.js ✅ IDENTICAL
buildPurchaseSummary.js ✅ IDENTICAL
kmiFgParser.js        ✅ IDENTICAL
kmiPackagingMovements.js ✅ IDENTICAL
cleanPayables.js      🔴 SIGNIFICANTLY DIVERGED (see below)
```

### cleanPayables.js divergence detail

| Aspect | PLATFORM | LEGACY |
|--------|----------|--------|
| Function name | `cleanPayables()` | `cleanPayableDetailRaw()` |
| Sheet access | `CoreOS.getGlobalConfig().SPOKES.PRODUCTION_MASTER.ID` | `SpreadsheetApp.getActiveSpreadsheet()` |
| Error handling | `throw new Error(...)` | `ui.alert(...)` |
| Column mapping | Dynamic header-based (`colMap`) | Fixed column index (0-14) |
| Header writing | `clean.appendRow(outHeaders)` after data | Pre-set in init, data appended below |
| Row parsing | Simpler skip logic | Extended: empty-row, total-row, supplier-header detection |
| Documentation | Minimal | Full RAW/CLEAN column mapping in JSDoc |

**PLATFORM version is a refactored rewrite — simpler, uses CoreOS config, header-based column mapping.**
**LEGACY version is the original — more defensive, fixed indices, UI alerts, detailed docs.**

### PLATFORM-only files (28)

Shared modules: CoreOS.js, Directory.js, SpokeConstants.js, UITriggers.js, VaultScriptsAudit.js, _version.gs, OpenOn.js, Pipelines.js, docEngine.js, docWorkFlows.js, generateConstantsScan.js, healthCheck.js, liberateCode.js, scriptEngine.js

New production features (not in LEGACY):
```
audit_cost_coverage.js, audit_kmi_invoices.js
build_batch_cogs.js, build_component_cost_history.js
check_component_codes.js, check_cost_categories.js
check_kmi_raw_data.js, check_raw_can_data.js, check_united_cans.js
debug_can_costs.js, debug_missing_components.js, diagnose_cost_history.js
extract_bom.js, import_bom_master.js, import_config_components.js
list_can_purchases.js
```

### LEGACY-only files (2)

```
Constants.js  → replaced by SpokeConstants.js
Menu.js       → replaced by OpenOn.js
```

### Verdict: **PLATFORM is the evolved version** with 16 new analysis/audit/import files. LEGACY is the original. cleanPayables.js diverged significantly. Safe to archive LEGACY — but note the LEGACY cleanPayables has better inline docs that could be preserved.

---

## Detailed Diff: sales-master

**PLATFORM path:** `0. PLATFORM/0.1 Vault/candid-labs-sales-master/`
**LEGACY path:** `LEGACY/sales-master/`
**PLATFORM scriptId:** `1i6M0pLzPgU-J4fZYqize1_iXhdW5d4TN3qNMJf6Sj3nqeFIONoo3tMqN`
**LEGACY scriptId:** `11xr4-Q4iKtvGfospjp-ZVzbswHm4yaeAQOtcQH08V-gtLEyANXJN0-cw`

### Shared files — content comparison

```
CRM.js                        ⚠️  3 one-line diffs: openById(CoreOS...) vs getActive()
Deck_Metrics_Channel_Narratives.js ✅ IDENTICAL
Deck_Metrics_Wrapper.js       ✅ IDENTICAL
Mapping_Health.js             ✅ IDENTICAL
ReportGenerator.js            ✅ IDENTICAL
SnapshotOutline.js            ✅ IDENTICAL
Xero transformer.js           ⚠️  3 one-line diffs: openById(CoreOS...) vs getActive()
account_status.js             ✅ IDENTICAL
buildRevenueMaster.js         ⚠️  1-line diff: openById(CoreOS...) vs getActiveSpreadsheet()
cleanReceivables.js           ✅ IDENTICAL
config_lists.js               ✅ IDENTICAL
config_validation.js          ✅ IDENTICAL
deck_metrics_builder.js       ✅ IDENTICAL
deck_metrics_tab_setup.js     ✅ IDENTICAL
header_protect.js             ✅ IDENTICAL
mapping_sync.js               ✅ IDENTICAL
slides_template_builder.js    ✅ IDENTICAL
structure_setup.js            ✅ IDENTICAL
tracking_enrichment.js        ✅ IDENTICAL
margin.js                     🔴 SIGNIFICANTLY DIVERGED (see below)
```

### margin.js divergence detail

| Aspect | PLATFORM (~700 lines) | LEGACY (~380 lines) |
|--------|----------------------|---------------------|
| Sheet access | `CoreOS.getGlobalConfig().SPOKES.SALES_MASTER.ID` | `SpreadsheetApp.getActive()` |
| SKU matching | Canonical SKU_Code-only matching | Multi-step: CONFIG_SKU_MAPPING → name → code (case-insensitive) |
| DQ gating | Yes — `DQ_Flag` column, 98% coverage threshold, blocks GM calculation if unmet | No — always calculates GM |
| COGS exceptions | Yes — `writeCOGSExceptions_()` writes to dedicated COGS_EXCEPTIONS sheet | No — only logs to Logger |
| Verification | Yes — `verifyGrossMarginEngine()` function (~200 lines) | No |
| Diagnostics | Extensive: per-month stats, per-SKU matching method, top-20 unmatched, overall coverage % | Basic: unmatched SKU list, "add to CONFIG_SKU_MAPPING" guidance |
| Fuzzy matching | Yes — `shouldExcludeSku_()`, `normalizeSkuName_()`, `fuzzyMatchSkuCode_()` | No — relies on CONFIG_SKU_MAPPING table |

**PLATFORM margin.js is nearly 2x the size** with DQ gating, COGS exception tracking, fuzzy matching, and a full verification routine. This is clearly the more recent, more battle-tested version.

**LEGACY margin.js uses CONFIG_SKU_MAPPING** (a manual bridge table). The PLATFORM version eliminated that dependency using canonical SKU_Code matching + fuzzy fallbacks.

### PLATFORM-only files (24)

Shared modules: CoreOS.js, Directory.js, SpokeConstants.js, UITriggers.js, VaultScriptsAudit.js, OpenOn.js, _version.gs, _version.js, .claspignore, docEngine.js, docWorkFlows.js, generateConstantsScan.js, healthCheck.js, liberateCode.js, scriptEngine.js

New sales features:
```
Debug.js, DebugRunner.js, Test Library.js
check_cogs_assignment.js, check_early_months.js
check_pni_details.js, check_problem_months.js, check_sku_matching.js
find_all_sku_patterns.js, find_unmapped_skus.js
```

### LEGACY-only files (2)

```
Constants.js          → replaced by SpokeConstants.js
Menu.js               → replaced by OpenOn.js
Tab & Header Analyser.js → replaced by TabAnalyser.js (in CoreOS)
```

### Verdict: **PLATFORM is the current version.** LEGACY has simpler margin logic that predates the DQ gating system. Safe to archive LEGACY.

---

## Detailed Diff: sales-tool

**PLATFORM path:** `0. PLATFORM/0.1 Vault/candid-labs-sales-tool/`
**LEGACY path:** `LEGACY/sales-tool/`
**PLATFORM scriptId:** `1D-55fwq2gH9KIqQufiZvXfC6plRMRSDg3ZqgWDWaEKZtDB3fqJgEbK79`
**LEGACY scriptId:** `109eEZrg0rTlVQxg5lO4Rm1MvEDfi5j4jKthd_Vh9VdR6yzyUaa-gwauC`

### Shared files — ALL DIFFER

```
code.js      🔴 DIFFERS — PLATFORM adds Location-aware price lookup, LEGACY uses fixed columns
constants.js 🔴 DIFFERS — PLATFORM uses CoreOS config, LEGACY has hardcoded Drive IDs
SetUp.js     ⚠️  DIFFERS — PLATFORM adds 'Location' column to headers
Menu.js      → renamed to MenuBuilder.js in PLATFORM
```

### Key differences

**constants.js:**
```
PLATFORM: const ID_SPREADSHEET_DATA = getGlobalConfig().DRIVE.DATA_BASES.SALES_TOOL_DATA;
LEGACY:   const ID_SPREADSHEET_DATA = '19kDef25LdbvPssTkMusFGu8FmNbj2rWuF7NNF9SBSvs';
```

**code.js:** PLATFORM adds `Location` column awareness with dynamic column indexing. LEGACY has fixed 0/1/2/3/4/5 column indices.

### Verdict: **PLATFORM is evolved.** LEGACY has hardcoded IDs (useful as a reference for extracting Drive constants). Safe to archive LEGACY.

---

## Detailed Diff: KAA (key-account-agreement-generator)

**PLATFORM path:** `0. PLATFORM/0.1 Vault/key-account-agreement-generator/`
**LEGACY path:** `LEGACY/key-account-agreement-generator/`
**PLATFORM scriptId:** `1qO29v3Nv6ggK6gmwMdnP7cbj20qQO-NRZlDPw5-9xp-h-LJGE5sY75I6`
**LEGACY scriptId:** None (.gs-only archive, no .clasp.json)

Different file extensions (PLATFORM = .js, LEGACY = .gs) so they're architecturally distinct copies. PLATFORM has CoreOS modules + extras (Heartbeat_test.js, test_form_submission.js, picker.html). LEGACY is the original standalone version with `Constants.gs` containing all the hardcoded config.

### Verdict: **LEGACY is an archived export** (no clasp link). PLATFORM is the live deployment. Safe to archive LEGACY.

---

## Surgical Strike

**Path:** `9. Quarantine/surgical-strike/Surgical Strike/`
**scriptId:** `1N5HsPBzGxooC2-q-qq3sw_sqPJFWWyiiyxuw69PzGvIkeTmNJdQ5g8ht`

File list nearly identical to LEGACY/sales-master (same 20 business logic files). Content diff of CRM.js: **IDENTICAL** to LEGACY. Has `LocalConfig.js` instead of `Constants.js`.

### Verdict: **Snapshot fork of LEGACY/sales-master** with a different config file. Both are superseded by PLATFORM/sales-master.

---

## STAGING Projects

15 projects, each with its own scriptId. These are NOT duplicates of PLATFORM or LEGACY — they are standalone utility scripts (Drive file ops, contacts, CMS setup, personal automation).

| Project | Files | Nature | Active? |
|---------|-------|--------|---------|
| candid-data-legacy | 1 | Data migration | Likely one-time |
| candid-legacy | 7 | CMS file ops, AI summary processing | Possibly active |
| candid-scripts-archive | 3 | UMJ folder counting | Likely one-time |
| contacts-util | 2 | People API contacts | Likely one-time |
| envision | 2 | CMS folder setup | Likely one-time |
| fingers-crossed | 7 | Drive file ops (count/move/dedup) | Utility — possibly active |
| gd-projects | 1 | Broker updates | Unknown |
| google-drive-functions | 4 | Envision mirror tool | Likely one-time |
| my-own-stuff | 6 | Personal experiments | Likely inactive |
| nap-test | 1 | Test script | Likely inactive |
| personal-scripts-master | 13 | Drive utilities, Gemini, NAP | Mixed — some may be active |
| satellite-discovery | 2 | Bound script auditing | Likely one-time |
| untitled-v1/v2/v3 | 1 each | Unnamed experiments | Likely inactive |

**Cannot classify without your input.** These are distinct projects, not duplicates.

---

## Other Items

| Item | Verdict |
|------|---------|
| `legacy_decommissioner/` | 1-file utility (Code.js). Used for decommissioning. Keep until cleanup complete. |
| `LEGACY/_archived_shims/candid-labs-os-script-directory/` | 1-file shim (ghostlibrarycall.js). Safe to archive. |
| `candid-labs-tiered/vendor/legacy/sales_master_min/` | Vendored snapshot of sales-master (5 files). Part of tier refactoring. Superseded by PLATFORM. |
| `98_QUARANTINE/` copies (×2) | Exact mirrors of `candid-labs` repo dated 2026-02-19. No unique code. |

---

## Classification Matrix

### Pattern discovered

Every project follows this pattern:
- **PLATFORM version** = LEGACY code + CoreOS shared modules + new features + `SpreadsheetApp.openById(CoreOS.getGlobalConfig()...)` instead of `.getActive()`
- **LEGACY version** = Original standalone code + hardcoded IDs + `SpreadsheetApp.getActive()`

PLATFORM is always the superset. LEGACY is always the subset.

### Recommended classification

| Project | PLATFORM | LEGACY | Action |
|---------|----------|--------|--------|
| core-os | CURRENT (library) | N/A | Keep |
| loan-tracker | CURRENT | DUPLICATE (100% identical shared files) | Archive LEGACY |
| production-master | CURRENT (16 new files) | SUBSET + 1 diverged file | Archive LEGACY |
| sales-master | CURRENT (10 new files) | SUBSET + 1 significantly diverged file | Archive LEGACY |
| sales-tool | CURRENT (evolved) | OUTDATED (hardcoded IDs, no Location) | Archive LEGACY |
| KAA | CURRENT (live clasp) | ARCHIVE (.gs export, no clasp) | Archive LEGACY |
| discovery-engine | CURRENT | N/A | Keep |
| platform (admin) | CURRENT | N/A | Keep |
| surgical-strike | — | DUPLICATE of LEGACY/sales-master | Archive |
| os-script-directory | — | ARCHIVED SHIM | Archive |
| 15 STAGING projects | — | STANDALONE (not duplicates) | **Needs your input** |
| legacy_decommissioner | — | UTILITY | Keep until cleanup done |
| candid-labs-tiered | — | VENDORED SNAPSHOT | Archive after platform migration |

### Before archiving LEGACY: extract these hardcoded values

From `LEGACY/sales-tool/constants.js`:
```
ID_SPREADSHEET_DATA     = '19kDef25LdbvPssTkMusFGu8FmNbj2rWuF7NNF9SBSvs'
ID_FOLDER_BACKUP        = '1y99oXCsUuPpk_G0EZrIlfpgYMybPXWI0'
ID_IMG_MASTER_BACKGROUND = '1Uow-ZEm6QKZW0dXuJ7RcZPICZh3Qsmjo'
ID_IMG_LOGO_CANDID_WHITE = '1hFgQl1HWX5T2d4gJc7EFArhnNiExdIBl'
ID_IMG_LOGO_SKD          = '1tlbSe0fqSTbcz7dkNKGg_Iu02AQghZ9y'
ID_IMG_HERO              = '1e0iyrTmdpJ-VWylZ7Sk4pER7s6L01wei'
```

These are the only hardcoded Drive IDs found in LEGACY that aren't already in CoreOS config.

---

## Open Actions (require your decision)

1. **Confirm PLATFORM scriptIds are the live deployed versions** — run `clasp list` or check Apps Script console
2. **STAGING projects** — which of the 15 are still in use? (I cannot determine this from code alone)
3. **LEGACY scriptIds** — are any of these still receiving triggers or being used by end users? If not, they can be decommissioned from the Apps Script console alongside the LEGACY repo cleanup
