# Preflight Gates Report

> Generated 2026-02-26 by cleanup-agent.
> Sources: PLATFORM_MIGRATION_MAP_v2.md, GAS_INVENTORY_v2.md, GAS_RECONCILIATION_v1.md, STANDALONE_GAS_PROJECTS_v1.md, GAS_FUNCTION_REGISTRY_v1.md.

---

## PF-1: PLATFORM ScriptId Registry (8 Live Spokes)

### Objective

Confirm live deployed scriptIds for the 8 PLATFORM GAS projects. Each entry must have a confirmed scriptId and clasp folder path.

### Registry

All 8 PLATFORM scriptIds were extracted from `.clasp.json` files in the `candid-labs` repo (`origin/main`). Each maps to a unique Apps Script project in `0. PLATFORM/0.1 Vault/`.

| # | Project Name | scriptId | Clasp Folder (in `candid-labs` repo) | Files | Role |
|---|-------------|----------|--------------------------------------|-------|------|
| P1 | **KAA** (key-account-agreement-generator) | `1qO29v3Nv6ggK6gmwMdnP7cbj20qQO-NRZlDPw5-9xp-h-LJGE5sY75I6` | `0. PLATFORM/0.1 Vault/key-account-agreement-generator/` | 24 .js + 1 .gs | Legal agreements (form trigger) |
| P2 | **sales-master** | `1i6M0pLzPgU-J4fZYqize1_iXhdW5d4TN3qNMJf6Sj3nqeFIONoo3tMqN` | `0. PLATFORM/0.1 Vault/candid-labs-sales-master/` | 43 .js + 1 .gs | Sales pipeline, revenue, margin, deck |
| P3 | **production-master** | `1OJcQdB_YLHkXgdJW_hEuo8pxSb_qg-kFqiGU9rpXX1pRPlxGGFT180eC` | `0. PLATFORM/0.1 Vault/candid-labs-production-master/` | 40 .js + 1 .gs | Production costing, BOM, COGS, stock |
| P4 | **loan-tracker** | `1BNRlOSusKYTHu8d4-_MjhdU1sGdDUsMza9cIPMjkr_ozaImtsE4fbE-i` | `0. PLATFORM/0.1 Vault/candid-labs-loan-tracker/` | 24 .js + 1 .gs + 2 .html | Loan ledger, interest, statements |
| P5 | **sales-tool** | `1D-55fwq2gH9KIqQufiZvXfC6plRMRSDg3ZqgWDWaEKZtDB3fqJgEbK79` | `0. PLATFORM/0.1 Vault/candid-labs-sales-tool/` | 20 .js + 1 .gs | PDF pricing webapp |
| P6 | **core-os** | `1SY3f8dK0-icZiZ7KEwhKA-Gmih5S322LikQLYvoHj1fu4P-hVC-2sntI` | `0. PLATFORM/0.1 Vault/candid-labs-core-os/` | 12 .js + 2 .gs | Shared library hub |
| P7 | **platform** | `1adKj1SNUYR_Q5JGEMrC8boiby1jG7yNm5v5njSTf1QysDJF2kZHZZ1xK` | `0. PLATFORM/0.1 Vault/candid-labs-platform/` | 7 .js + 1 .gs | Admin/migration tooling |
| P8 | **discovery-engine** | `1qhYC88qxoZaFOrCE3WcgZ2mXjXBq1OXD8IW4j0kmwkEMoWaiod12vLyR` | `0. PLATFORM/0.1 Vault/candid-os-script-discovery-engine/` | 3 .js + 1 .gs | GAS project scanning |

### Verification Status

- **Filesystem confirmed:** All 8 projects have `.clasp.json` files with scriptIds in the `candid-labs` repo on `origin/main`. Each directory contains real source code (.js files deployed via clasp).
- **Git-verified:** GAS_INVENTORY_v2.md was generated from `git ls-tree` on all remote branches. `origin/main` is the superset (no code exists exclusively on other branches).
- **No `.clasp.json` or clasp files exist in the `candidlabs-site` repo** (this repo). All GAS project source lives in the separate `candid-labs` repo at `https://github.com/dee-CL-2026/candid-labs.git`.

### Gap: Live Deployment Confirmation

The scriptIds above are confirmed from filesystem `.clasp.json` files, but **we cannot confirm they are the currently live/deployed versions** without running:

```bash
clasp login   # authenticate with candidmixers.com account
clasp list    # list all online GAS projects
```

**CLASP is not currently authenticated** (`~/.clasprc.json` not found). Until `clasp list` is run, there is a residual risk that:
1. A scriptId in the repo may have been superseded by a different online version.
2. Additional GAS projects may exist online (sheet-bound scripts, shared projects) that are not tracked in git.

**Recommendation:** Run `clasp login` + `clasp list` and cross-reference the output against this registry to close the gap.

### PF-1 Verdict: CONDITIONAL PASS

All 8 PLATFORM scriptIds are documented and filesystem-verified. Full confirmation requires `clasp list` validation against the live Apps Script console.

---

## PF-2: STAGING Project Classification (15 Projects)

### Objective

Classify the 15 STAGING GAS projects as in-use or archive to determine Wave 6 decommission scope.

### Classification

Based on analysis of code content, file count, project names, and description from GAS_INVENTORY_v2.md and GAS_RECONCILIATION_v1.md. **No live usage data is available** -- classification is based on code analysis and project purpose.

| # | Project | scriptId | Files | Nature | Classification | Rationale |
|---|---------|----------|-------|--------|---------------|-----------|
| S1 | **candid-data-legacy** | `1Vix6cjK...` | 1 | Data migration utility | ARCHIVE | Single Code.js file. One-time data migration. Name contains "legacy". |
| S2 | **candid-legacy** | `1mRIoHqz...` | 7 | CMS file ops, AI summary processing | REVIEW | 7 files with AI summary processing suggests possible ongoing use. Name contains "legacy" but has non-trivial code. |
| S3 | **candid-scripts-archive** | `1xeUttQf...` | 3 | UMJ folder counting, summaries | ARCHIVE | Name literally contains "archive". 3 files for folder counting. |
| S4 | **contacts-util** | `1CM6P_Zx...` | 2 | People API contact utilities | ARCHIVE | 2-file utility (Code.js + Test.js). One-time contact operation. |
| S5 | **envision** | `1x5psvVD...` | 2 | CMS folder setup, control centre headers | ARCHIVE | 2-file CMS folder setup. One-time infrastructure. |
| S6 | **fingers-crossed** | `19I5TAa7...` | 7 | Drive file ops: count, extract, move, dedup | REVIEW | 7 files with Drive utilities (count/move/dedup). Could still be used ad-hoc for Drive maintenance. |
| S7 | **gd-projects** | `1B1dx3CO...` | 1 | Broker data updates | ARCHIVE | Single file "Broker updates.js". Likely one-time broker data operation. |
| S8 | **google-drive-functions** | `1ZsVskfZ...` | 4 | Envision mirror tool (multiple versions) | ARCHIVE | 4 files, all versions of the same mirror tool. One-time infrastructure. |
| S9 | **my-own-stuff** | `1C3wtEgS...` | 6 | People API, contact printing, versioned experiments | ARCHIVE | Personal experiments. Name suggests personal/scratch use. |
| S10 | **nap-test** | `144KOAER...` | 1 | Test script | ARCHIVE | Single Code.js test file. Clearly a test/experiment. |
| S11 | **personal-scripts-master** | `1DPS3yk8...` | 13 | Rekap combining, APV cleaning, NAP auto, Gemini lead fill, attachment fetch, logo extract, PDF rename | REVIEW | **Highest file count in STAGING (13 files).** Contains multiple operational utilities: APV cleaning, NAP automation, Gemini lead fill, PDF rename. Some may still be in active use. |
| S12 | **satellite-discovery** | `1RRLpRCX...` | 2 | Bound script auditing | ARCHIVE | 2-file audit utility. One-time discovery task, superseded by discovery-engine. |
| S13 | **untitled-v1** | `14HIyxZp...` | 1 | Unnamed experiment | ARCHIVE | Single Code.js, unnamed. Clearly experimental. |
| S14 | **untitled-v2** | `14CdGxG3...` | 1 | Unnamed experiment | ARCHIVE | Single Code.js, unnamed. Clearly experimental. |
| S15 | **untitled-v3** | `1vY2SMzj...` | 1 | Unnamed experiment | ARCHIVE | Single Code.js, unnamed. Clearly experimental. |

### Summary

| Classification | Count | Projects |
|---------------|-------|----------|
| **ARCHIVE** | 12 | S1, S3, S4, S5, S7, S8, S9, S10, S12, S13, S14, S15 |
| **REVIEW (needs user input)** | 3 | S2 (candid-legacy), S6 (fingers-crossed), S11 (personal-scripts-master) |

### REVIEW Projects -- Why They Need User Input

1. **S2 candid-legacy** (7 files) -- Contains AI summary processing code. If this is used for ongoing AI-powered content operations, it may still be active.

2. **S6 fingers-crossed** (7 files) -- Drive file operations (count, extract, move, dedup). These are the kind of utilities that get run periodically for Drive maintenance. May still be in ad-hoc use.

3. **S11 personal-scripts-master** (13 files) -- The largest STAGING project. Contains APV cleaning, NAP automation, Gemini lead fill, and PDF rename utilities. Several of these sound like recurring operational tasks rather than one-time scripts.

### PF-2 Verdict: CONDITIONAL PASS

12 of 15 STAGING projects are classified ARCHIVE with high confidence. 3 projects require user confirmation before decommissioning. None of the 15 are PLATFORM dependencies.

---

## PF-3: LEGACY Trigger Status

### Objective

Confirm whether any LEGACY GAS project triggers are still firing. LEGACY projects have separate scriptIds from their PLATFORM counterparts.

### LEGACY ScriptId Registry

| # | Project | scriptId | PLATFORM Equivalent | Reconciliation Verdict |
|---|---------|----------|--------------------|-----------------------|
| L1 | **KAA** (LEGACY) | **None** (no .clasp.json, .gs-only archive) | P1 KAA (`1qO29v3N...`) | ARCHIVE -- .gs export, no clasp linkage. Cannot have triggers. |
| L2 | **loan-tracker** (LEGACY) | `1G7fHdoP09hMu6yHhIdentQAQ663pCs3larxRsNqqm_JDm9UPaA1tzsQD` | P4 loan-tracker (`1BNRlOSu...`) | DUPLICATE -- 14/14 shared files are IDENTICAL to PLATFORM. Safe to decommission. |
| L3 | **production-master** (LEGACY) | `12E0GgPFMNzC6E09NI3WrdjGajE4K3UTwef4I9p1x0h8BrKanHVUqYJbH` | P3 production-master (`1OJcQdB_...`) | SUBSET -- 10/12 identical, 1 trivial diff (CoreOS access), 1 significant diff (cleanPayables.js). PLATFORM is the evolved version. |
| L4 | **sales-master** (LEGACY) | `11xr4-Q4iKtvGfospjp-ZVzbswHm4yaeAQOtcQH08V-gtLEyANXJN0-cw` | P2 sales-master (`1i6M0pLz...`) | SUBSET -- 16/20 identical, 3 trivial diffs (CoreOS access), 1 significant diff (margin.js). PLATFORM is the evolved version. |
| L5 | **sales-tool** (LEGACY) | `109eEZrg0rTlVQxg5lO4Rm1MvEDfi5j4jKthd_Vh9VdR6yzyUaa-gwauC` | P5 sales-tool (`1D-55fwq...`) | OUTDATED -- All 4 shared files differ. LEGACY has hardcoded Drive IDs, no Location feature. |

### Additional Decommission Targets

| # | Project | scriptId | Category | Verdict |
|---|---------|----------|----------|---------|
| L6 | **os-script-directory** (shim) | `1rMFYRgfeHK1k9dGUXmMz2jAYdV1VMZzWIvT64-lxJ0B0x6XhZv94WAh_` | LEGACY shim | ARCHIVE -- 1-file stub (ghostlibrarycall.js). |
| Q1 | **surgical-strike** | `1N5HsPBzGxooC2-q-qq3sw_sqPJFWWyiiyxuw69PzGvIkeTmNJdQ5g8ht` | QUARANTINE | ARCHIVE -- Fork of LEGACY/sales-master with different config. Superseded by PLATFORM/sales-master. |

### Trigger Analysis

**Cannot confirm trigger status from code/filesystem alone.** However, the following evidence informs the assessment:

#### Evidence For LEGACY Triggers Being Inactive

1. **PLATFORM versions use `SpreadsheetApp.openById(CoreOS.getGlobalConfig()...)`** -- This explicitly opens sheets by ID from config, meaning PLATFORM projects are designed to run as standalone bound scripts that can be triggered independently.

2. **LEGACY versions use `SpreadsheetApp.getActive()`** -- This only works when the script is bound to a specific sheet and triggered from that sheet's context. If the PLATFORM version was deployed to the same sheet, the LEGACY scriptId would no longer be bound.

3. **The reconciliation confirms PLATFORM is the superset** -- Every LEGACY project is either a pure subset or an outdated version of its PLATFORM counterpart. The PLATFORM versions were designed to supersede them.

4. **KAA LEGACY has no `.clasp.json`** -- It cannot be deployed via clasp and cannot have managed triggers.

#### Evidence For Residual Risk

1. **LEGACY scriptIds are real** -- 4 of 5 LEGACY projects have valid `.clasp.json` entries with distinct scriptIds. These are separate Apps Script projects that could independently have time-driven or form-submit triggers.

2. **No `clasp list` validation** -- Without checking the Apps Script console, we cannot see whether these scriptIds have active triggers configured.

3. **Bound scripts could still be receiving triggers** -- If a LEGACY scriptId is bound to a Google Sheet that is still in use (even passively), its `onOpen` or `onEdit` triggers would still fire.

### Recommended Verification Steps

To definitively close PF-3, the following must be done from the Apps Script console (script.google.com):

```
For each LEGACY scriptId:
1. Open https://script.google.com/home/projects/{scriptId}
2. Navigate to Triggers (clock icon)
3. Document: trigger type, function, event source, last run time
4. If triggers exist: delete them (after confirming PLATFORM equivalent is active)
```

| scriptId | Check URL |
|----------|-----------|
| `1G7fHdoP...` (loan-tracker) | `https://script.google.com/home/projects/1G7fHdoP09hMu6yHhIdentQAQ663pCs3larxRsNqqm_JDm9UPaA1tzsQD/triggers` |
| `12E0GgPF...` (production-master) | `https://script.google.com/home/projects/12E0GgPFMNzC6E09NI3WrdjGajE4K3UTwef4I9p1x0h8BrKanHVUqYJbH/triggers` |
| `11xr4-Q4...` (sales-master) | `https://script.google.com/home/projects/11xr4-Q4iKtvGfospjp-ZVzbswHm4yaeAQOtcQH08V-gtLEyANXJN0-cw/triggers` |
| `109eEZrg...` (sales-tool) | `https://script.google.com/home/projects/109eEZrg0rTlVQxg5lO4Rm1MvEDfi5j4jKthd_Vh9VdR6yzyUaa-gwauC/triggers` |
| `1rMFYRgf...` (os-script-directory) | `https://script.google.com/home/projects/1rMFYRgfeHK1k9dGUXmMz2jAYdV1VMZzWIvT64-lxJ0B0x6XhZv94WAh_/triggers` |
| `1N5HsPBz...` (surgical-strike) | `https://script.google.com/home/projects/1N5HsPBzGxooC2-q-qq3sw_sqPJFWWyiiyxuw69PzGvIkeTmNJdQ5g8ht/triggers` |

### PF-3 Verdict: CONDITIONAL PASS

Code analysis strongly suggests LEGACY triggers are inactive (PLATFORM versions superseded them). However, definitive confirmation requires checking the Apps Script console for each LEGACY scriptId. **No LEGACY triggers should be deleted until this console check is performed.**

---

## Summary: Preflight Gates Status

| Gate | Status | Blocker |
|------|--------|---------|
| **PF-1** PLATFORM ScriptId Registry | CONDITIONAL PASS | Needs `clasp list` to confirm live deployment status |
| **PF-2** STAGING Classification | CONDITIONAL PASS | 3 of 15 projects need user input (S2, S6, S11) |
| **PF-3** LEGACY Trigger Status | CONDITIONAL PASS | Needs Apps Script console check for 6 scriptIds |

### Actions Required Before Wave 6 (Cleanup)

1. **Run `clasp login` + `clasp list`** with the candidmixers.com account. Cross-reference output against the 30 known scriptIds.
2. **User decision on 3 STAGING projects:** candid-legacy, fingers-crossed, personal-scripts-master -- archive or keep?
3. **Check Apps Script console triggers** for 6 LEGACY/QUARANTINE scriptIds listed in PF-3.

### Actions NOT Blocked

Waves 1-5 (migration of business logic) are **not blocked** by these preflight gates. The gates only affect Wave 6 (decommission scope). Migration work can proceed immediately.
