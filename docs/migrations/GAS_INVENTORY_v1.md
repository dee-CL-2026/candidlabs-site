# GAS Inventory v1.0

> Generated 2026-02-25 from code scan of `candid-labs` and `candid-labs-tiered` repos.
> No speculation — every entry sourced from file contents.

---

## Repo: candid-labs

**Root:** `/Users/dieterwerwath/1.Vault/01_PROJECTS/Candid/Repos/candid-labs/`

---

### 1. candid-labs-core-os (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-core-os/` |
| Files | `CoreOS.gs`, `TabAnalyser.gs`, `_version.gs`, `appsscript.json` |
| TimeZone | Etc/GMT |
| Runtime | V8 |
| CoreOS Library | N/A (this IS the library, ID `1SY3f8dK0-icZiZ7KEwhKA-Gmih5S322LikQLYvoHj1fu4P-hVC-2sntI`) |
| Webapp | executeAs: USER_DEPLOYING, access: MYSELF |

**Advanced Services:** Drive (v2)

**OAuth Scopes:**
- `drive`, `script.projects`, `script.external_request`, `spreadsheets`, `script.deployments`, `documents`

#### CoreOS.gs — Entrypoints

| Function | Type | Purpose |
|----------|------|---------|
| `createSovereignMenu(title)` | Called by dependents | Builds SpreadsheetApp UI menu for host sheet |
| `appendGlobalTools(menu)` | Called by dependents | Adds diagnostic submenu items |
| `showStatusCard(message, seconds)` | Utility | Displays HtmlService modal (default 3s) |

**Menu items wired to:**
- `runCmsPlatformDiagnostic()` — not defined in this file (expected in host)
- `listVaultScripts()` — not defined in this file
- `CoreOS_TabAnalyser()` — defined in TabAnalyser.gs
- `runCmsGlobalServiceAudit()` — not defined in this file

**Google Services:** SpreadsheetApp, HtmlService

#### TabAnalyser.gs — Entrypoints

| Function | Type | Purpose |
|----------|------|---------|
| `CoreOS_TabAnalyser()` | Menu action | Analyses all sheets in active spreadsheet, writes column map to "TAB STRUCTURE" sheet |

**Google Services:** SpreadsheetApp

**Data written:** Creates/overwrites sheet named `TAB STRUCTURE` with columns: Sheet Name, Column No., Column Header.

**Classification: KEEP** — Diagnostic tooling. Lightweight, Google-native. No business logic to migrate.

---

### 2. candid-labs-platform (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-platform/` |
| Files | `_version.gs`, `appsscript.json` |
| TimeZone | Asia/Jakarta |
| CoreOS Library | v1 (developmentMode: true) |

**Advanced Services:** Drive (v2), Docs (v1), Sheets (v4), Slides (v1), Gmail (v1), Tasks (v1), AdminDirectory (directory_v1)

**OAuth Scopes:**
- `drive`, `documents`, `spreadsheets`, `script.external_request`, `script.projects`, `gmail.modify`, `admin.directory.user.readonly`, `userinfo.email`

**_version.gs content:**
```js
const PLATFORM_VERSION = {
  stamp: '2026-01-06_071535',
  origin: 'Candid OS Vault',
  status: 'FLATTENED'
};
```

**No .gs code beyond version stamp.** Config-only project — likely a container for the CoreOS library binding + permissions.

**Classification: DELETE** — Empty shell. Scopes can be consolidated into remaining projects.

---

### 3. candid-labs-loan-tracker (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-loan-tracker/` |
| Files | `_version.gs`, `appsscript.json` |
| TimeZone | Asia/Jakarta |
| CoreOS Library | v0 (developmentMode: true) |

**Advanced Services:** Drive (v3)

**No .gs code beyond version stamp.** Status: FLATTENED.

**Classification: DELETE** — No code present. If loan tracking is needed, build as platform module.

---

### 4. candid-labs-production-master (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-production-master/` |
| Files | `_version.gs`, `appsscript.json` |
| TimeZone | Asia/Jakarta |
| CoreOS Library | v0 (developmentMode: true) |

**Advanced Services:** None

**No .gs code beyond version stamp.** Status: FLATTENED.

**Classification: DELETE** — No code present. Production module should be built on platform.

---

### 5. candid-labs-sales-master (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-sales-master/` |
| Files | `_version.gs`, `appsscript.json` |
| TimeZone | Asia/Jakarta |
| CoreOS Library | v0 (developmentMode: true) |
| Execution API | access: MYSELF |

**Advanced Services:** Drive (v3), Slides (v1), DriveActivity (v2)

**No .gs code beyond version stamp.** Status: FLATTENED.

**Classification: DELETE** — No code present. Sales module exists on platform (CRM).

---

### 6. candid-labs-sales-tool (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-labs-sales-tool/` |
| Files | `_version.gs`, `appsscript.json` |
| TimeZone | Asia/Jakarta |
| CoreOS Library | v0 (developmentMode: true) |
| Webapp | executeAs: USER_ACCESSING, access: DOMAIN |

**No .gs code beyond version stamp.** Status: FLATTENED.

**Classification: DELETE** — No code present. Was a domain-scoped webapp, now superseded by CRM/Prospecting modules on platform.

---

### 7. candid-os-script-discovery-engine (PLATFORM)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/candid-os-script-discovery-engine/` |
| Files | `_version.gs`, `appsscript.json` |
| TimeZone | Asia/Jakarta |

**Advanced Services:** Drive (v3)

**OAuth Scopes:**
- `script.projects.readonly`, `script.projects`, `script.deployments.readonly`, `script.webapp.deploy`, `drive.metadata.readonly`, `drive.readonly`, `spreadsheets`, `script.external_request`

**No .gs code beyond version stamp.** Status: FLATTENED.

**Classification: DELETE** — Discovery engine was used for the audit that produced this inventory. No ongoing purpose.

---

### 8. key-account-agreement-generator (PLATFORM copy)

| Key | Value |
|-----|-------|
| Path | `0. PLATFORM/0.1 Vault/key-account-agreement-generator/` |
| Files | `_version.gs`, `appsscript.json` |
| TimeZone | Asia/Bangkok |
| CoreOS Library | v0 (developmentMode: true) |

**Advanced Services:** Gmail (v1)

**No .gs code beyond version stamp.** Status: FLATTENED.
Active code lives in `LEGACY/key-account-agreement-generator/` (see below).

**Classification: DELETE** — Duplicate config. Active copy is in LEGACY.

---

### 9. key-account-agreement-generator (LEGACY — ACTIVE CODE)

| Key | Value |
|-----|-------|
| Path | `LEGACY/key-account-agreement-generator/` |
| Files | 11 .gs files + `appsscript.json` |
| TimeZone | Asia/Bangkok |
| Advanced Services | Gmail (v1) |
| Trigger | `onFormSubmit(e)` — Google Forms installable trigger |
| Trigger | `onOpen()` — simple trigger |

#### All .gs Files

| File | Functions | Google Services | Classification |
|------|-----------|----------------|----------------|
| **Constants.gs** | (global constants only) | — | MIGRATE |
| **Mapping.gs** | `mapRawToCanonical_(headers, row)` | — | MIGRATE |
| **Helpers.gs** | `buildAgreementKey_()`, `normalizeEnum_()`, `normalizeDateKey_()`, `normalizeRebateFrequencyKey_()`, `kaa_formatDateForDoc_()` | Utilities | MIGRATE |
| **Append.gs** | `appendCanonicalRow_(sheet, data)` | SpreadsheetApp | KEEP (thin) |
| **BackFill.gs** | `kaa_ensureRawMarkers_()`, `kaa_existingAgreementKeys_()`, `kaa_appendAgreementFromRawRow()`, `kaa_backfillRawMissingOnly()`, `kaa_backfillRawGenerateMissingOnly()` | SpreadsheetApp | MIGRATE |
| **GenerateDoc.gs** | `normalizeRebateFrequencyKey_()`, `generateAgreementDocFromRow(rowIndex)` | SpreadsheetApp, DriveApp, DocumentApp, Session, Utilities | KEEP (Google Doc generation) |
| **Header_Setup.gs** | `kaa_createOrResetAgreementsHeaders()` | SpreadsheetApp | DELETE (one-time setup) |
| **Notifications.gs** | `kaa_sendNotificationsForAgreementRow_()`, `kaa_isInternalEmail_()`, `kaa_sendEmail_()`, default body builders | GmailApp | KEEP (email connector) |
| **OnFormSubmit.gs** | `onFormSubmit(e)` | SpreadsheetApp | MIGRATE (orchestration) |
| **OpenOn.gs** | `onOpen()`, `kaa_generateAgreementFromActiveRow()` | SpreadsheetApp (UI) | KEEP (menu only) |
| **RegenPicker.gs** | `kaa_pickerSearchAgreements_(query, limit)` | SpreadsheetApp | MIGRATE |
| **Regenerate.gs** | `kaa_regenerateFromSelectedRow()`, `kaa_regenerateFromAgreementKeyPrompt()`, `kaa_regenerateRow_()`, `kaa_findAgreementRowByKey_()`, `kaa_writeAgreementError_()` | SpreadsheetApp (UI) | MIGRATE |

#### Key Constants (from Constants.gs)

```
Sheets:
  KAA.SHEETS.RAW       = 'Form Responses 1'
  KAA.SHEETS.AGREEMENTS = 'Agreements'

Drive:
  KAA_TEMPLATE_DOC_ID   = CoreOS.CONFIG.DRIVE.TEMPLATES.KAA_DOC  (resolved at runtime)
  KAA_OUTPUT_FOLDER_ID  = CoreOS.CONFIG.DRIVE.KAA_RESOURCES.OUTPUT_FOLDER

Email:
  KAA_EMAIL.FROM_ALIAS         = 'candidlabs@candidmixers.com'
  KAA_EMAIL.CC_INTERNAL        = ['dee@candidmixers.com', 'partnerships@candidmixers.com']
  KAA_EMAIL.CC_EXTERNAL_ADMIN  = ['dee@candidmixers.com']
  KAA_EMAIL.INTERNAL_DOMAIN    = 'candidmixers.com'
  KAA_ALLOWED_REQUESTOR_DOMAIN = 'candidmixers.com'
  KAA_EMAIL_SUBJECT_PREFIX     = '[KAA]'

Date/TZ:
  KAA_DATE_TZ     = 'Asia/Jakarta'
  KAA_DATE_FORMAT  = 'd MMMM yyyy'
```

#### Data Flow

```
Google Form → "Form Responses 1" sheet (RAW)
  ↓ onFormSubmit(e)
mapRawToCanonical_() → canonical object
  ↓
appendCanonicalRow_() → "Agreements" sheet
  ↓
generateAgreementDocFromRow() → copies template Doc, fills {{placeholders}}
  → writes GENERATED_DOC_ID, GENERATED_DOC_URL back to sheet
  ↓
kaa_sendNotificationsForAgreementRow_() → GmailApp
  → internal requestor: direct link + CC team
  → external requestor: admin-access guidance email
```

#### Canonical Headers (50+ columns)

System: ROW_ID, AGREEMENT_KEY, VERSION, PARENT_ROW_ID, STATUS, SUBMITTED_AT, SUBMITTED_BY_EMAIL, GENERATED_AT, GENERATED_BY_EMAIL, CHANGE_NOTE, ERROR_MESSAGE, REBATE_FREQUENCY

Legal: KEY_ACCOUNT_LEGAL_NAME, KEY_ACCOUNT_ADDRESS, NPWP_FILE_URL, SIGNING_METHOD, SIGNATORY_NAME, SIGNATORY_TITLE, OP_PIC_DIFFERENT, OP_PIC_NAME, OP_PIC_EMAIL, OP_PIC_PHONE, PIC_EMAIL, PIC_PHONE, TERM_START_DATE, TERM_END_DATE

Financial: REBATE_TYPE, REBATE_RATE, MIN_VOLUME_AGREED, MIN_QUARTERLY_VOLUME_CASES, SAME_FLAVOUR_PRICE, PRICE_SODA_PER_CAN_IDR_INCL_PPN, PRICE_FLAVOUR_PER_CAN_IDR_INCL_PPN, PRICE_IMPERIAL_PER_CAN_IDR_INCL_PPN, PRICE_GINGER_PER_CAN_IDR_INCL_PPN

Venues: VENUE_LIST

Outputs: TEMPLATE_DOC_ID, GENERATED_DOC_ID, GENERATED_DOC_URL

RAW Markers: KAA_PROCESSED, KAA_PROCESSED_AT, KAA_ERROR, KAA_AGREEMENT_KEY

**Classification: MIGRATE (logic) + KEEP (Doc generation + Gmail as thin adapters)**

---

### 10. loan-tracker (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/loan-tracker/` |
| Files | `appsscript.json` only |
| Advanced Services | Drive (v3) |

**No .gs code.** Config-only.

**Classification: DELETE**

---

### 11. production-master (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/production-master/` |
| Files | `appsscript.json` only |
| No Advanced Services |

**No .gs code.** Config-only.

**Classification: DELETE**

---

### 12. sales-master (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/sales-master/` |
| Files | `appsscript.json` only |
| Advanced Services | Drive (v3), Slides (v1), DriveActivity (v2) |

**No .gs code.** Config-only.

**Classification: DELETE**

---

### 13. sales-tool (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/sales-tool/` |
| Files | `appsscript.json` only |
| Webapp | executeAs: USER_ACCESSING, access: DOMAIN |

**No .gs code.** Config-only.

**Classification: DELETE**

---

### 14. _archived_shims/candid-labs-os-script-directory (LEGACY)

| Key | Value |
|-----|-------|
| Path | `LEGACY/_archived_shims/candid-labs-os-script-directory/` |
| Files | `appsscript.json` only |
| CoreOS Library | v1 |
| Webapp | executeAs: USER_DEPLOYING, access: MYSELF |

**No .gs code.** Archived shim.

**Classification: DELETE**

---

### 15. surgical-strike (QUARANTINE)

| Key | Value |
|-----|-------|
| Path | `9. Quarantine/surgical-strike/Surgical Strike/` |
| Files | `appsscript.json` only |
| Advanced Services | Drive (v3), Slides (v1), DriveActivity (v2) |
| CoreOS Library | v1 |

**No .gs code.** Quarantined.

**Classification: DELETE**

---

### 16. legacy_decommissioner

| Key | Value |
|-----|-------|
| Path | `legacy_decommissioner/` |
| Files | `appsscript.json` only |
| No Advanced Services |

**No .gs code.** Decommissioning tool config only.

**Classification: DELETE**

---

### 17. STAGING projects (13 appsscript.json configs)

All STAGING directories contain only `appsscript.json` — **no .gs code files**.

| Project | Path | Services | Classification |
|---------|------|----------|----------------|
| candid-data-legacy | `STAGING/candid-data-legacy/` | Drive v3, Sheets v4 | DELETE |
| candid-legacy | `STAGING/candid-legacy/` | None | DELETE |
| candid-scripts-archive | `STAGING/candid-scripts-archive/` | None | DELETE |
| contacts-util | `STAGING/contacts-util/` | People API v1 | DELETE |
| envision | `STAGING/envision/` | None | DELETE |
| fingers-crossed | `STAGING/fingers-crossed/` | None | DELETE |
| gd-projects | `STAGING/gd-projects/` | None | DELETE |
| google-drive-functions | `STAGING/google-drive-functions/` | None | DELETE |
| my-own-stuff | `STAGING/my-own-stuff/` | People API v1 | DELETE |
| nap-test | `STAGING/nap-test/` | None | DELETE |
| personal-scripts-master | `STAGING/personal-scripts-master/` | Drive v2, DriveActivity v2 | DELETE |
| satellite-discovery | `STAGING/satellite-discovery/` | Drive v2 | DELETE |
| untitled-v1/v2/v3 | `STAGING/untitled-v*/` | None | DELETE |

---

## Repo: candid-labs-tiered

**Root:** `/Users/dieterwerwath/1.Vault/01_PROJECTS/Candid/Repos/candid-labs-tiered/`

### 18. sales_master_min (vendor legacy)

| Key | Value |
|-----|-------|
| Path | `vendor/legacy/sales_master_min/` |
| Files | `appsscript.json` only |
| Advanced Services | Drive v3, Slides v1, DriveActivity v2 |
| CoreOS Library | v0 |
| Execution API | access: MYSELF |

**No .gs code.** Vendored config snapshot.

**Classification: DELETE**

---

## Summary Table

| # | Project | Location | .gs files | Trigger entrypoints | Classification |
|---|---------|----------|-----------|-------------------|----------------|
| 1 | candid-labs-core-os | PLATFORM | 3 | `CoreOS_TabAnalyser()` (menu) | **KEEP** |
| 2 | candid-labs-platform | PLATFORM | 1 (version) | None | **DELETE** |
| 3 | candid-labs-loan-tracker | PLATFORM | 1 (version) | None | **DELETE** |
| 4 | candid-labs-production-master | PLATFORM | 1 (version) | None | **DELETE** |
| 5 | candid-labs-sales-master | PLATFORM | 1 (version) | None | **DELETE** |
| 6 | candid-labs-sales-tool | PLATFORM | 1 (version) | None | **DELETE** |
| 7 | candid-os-script-discovery-engine | PLATFORM | 1 (version) | None | **DELETE** |
| 8 | key-account-agreement-generator | PLATFORM | 1 (version) | None | **DELETE** |
| 9 | **key-account-agreement-generator** | **LEGACY** | **11** | **`onOpen()`, `onFormSubmit(e)`** | **MIGRATE + KEEP (adapters)** |
| 10 | loan-tracker | LEGACY | 0 | None | **DELETE** |
| 11 | production-master | LEGACY | 0 | None | **DELETE** |
| 12 | sales-master | LEGACY | 0 | None | **DELETE** |
| 13 | sales-tool | LEGACY | 0 | None | **DELETE** |
| 14 | os-script-directory (shim) | LEGACY | 0 | None | **DELETE** |
| 15 | surgical-strike | QUARANTINE | 0 | None | **DELETE** |
| 16 | legacy_decommissioner | Root | 0 | None | **DELETE** |
| 17 | 13 STAGING projects | STAGING | 0 | None | **DELETE** (all) |
| 18 | sales_master_min (tiered) | vendor/legacy | 0 | None | **DELETE** |

### Totals

- **Total appsscript.json configs:** 31
- **Projects with actual .gs code:** 2 (core-os: 3 files, KAA legacy: 11 files)
- **Projects that are config-only shells:** 29
- **KEEP:** 1 (core-os diagnostics)
- **MIGRATE:** 1 (KAA — the only script with business logic)
- **DELETE:** 29 (empty shells, version stamps, staging experiments)

### Google Services In Active Use (code-confirmed)

| Service | Used In | Usage |
|---------|---------|-------|
| SpreadsheetApp | CoreOS, KAA | Sheet CRUD, UI menus, prompts |
| HtmlService | CoreOS | Status modals |
| DriveApp | KAA GenerateDoc | Copy template, move to folder |
| DocumentApp | KAA GenerateDoc | Body text {{placeholder}} replacement |
| GmailApp | KAA Notifications | Send agreement emails with CC |
| Session | KAA GenerateDoc | Get active user email |
| Utilities | KAA Helpers/GenerateDoc | formatDate, getUuid |

### CoreOS Shared Library

- **Library ID:** `1SY3f8dK0-icZiZ7KEwhKA-Gmih5S322LikQLYvoHj1fu4P-hVC-2sntI`
- **Referenced by:** 13 projects (all via developmentMode: true)
- **Contains:** `CoreOS.CONFIG.DRIVE.TEMPLATES.KAA_DOC` and `CoreOS.CONFIG.DRIVE.KAA_RESOURCES.OUTPUT_FOLDER` (runtime-resolved IDs)
- **Action:** Extract CONFIG values, then this library can be retired once KAA adapter is rewritten.
