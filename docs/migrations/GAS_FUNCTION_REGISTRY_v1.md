# GAS Function Registry v1.0

> Generated 2026-02-26 from `gas_function_registry.txt` (400 function matches).
> Every function in every PLATFORM project, classified for migration.
>
> **Legend:**
> - **MIGRATE** — Business logic → Worker + D1
> - **ADAPTER** — Google-native op (Docs/Slides/Gmail/Drive) → thin GAS webapp
> - **SHARED** — CoreOS injected module copy (retires when CoreOS retires)
> - **RETIRE** — Debug / diagnostic / test / one-time setup / replaced by platform UI
> - **KEEP** — Needed during transition (menu, triggers) until project fully migrated

---

## Shared CoreOS Modules (appear in every spoke)

These 10 files are identical copies injected into each PLATFORM spoke. Counted once here — **not repeated** in per-project tables below.

| File | Functions | Classification | Notes |
|------|-----------|---------------|-------|
| **CoreOS.js** | `getGlobalConfig()`, `createSovereignMenu()`, `appendGlobalTools()`, `showStatusCard()`, `runCmsPlatformDiagnostic()`, `listVaultScripts()`, `CoreOS_TabAnalyser()`, `runCmsGlobalServiceAudit()` | SHARED | Config hub + menu builder. Values extracted to Worker env vars. |
| **healthCheck.js** | `runCmsGlobalServiceAudit()` | SHARED | CMS service audit. |
| **scriptEngine.js** | `runMasterScriptsSync()`, `updateRegistry()` | SHARED | Script registry sync. |
| **generateConstantsScan.js** | `generateConstantsCode()` | SHARED | Auto-generates constants. |
| **docEngine.js** | `liberateDocContent()` | SHARED | Doc content migration tool. |
| **liberateCode.js** | `liberateCode()` | SHARED | Code extraction tool. |
| **docWorkFlows.js** | `runCmsDocLiberation()` | SHARED | Doc workflow orchestrator. |
| **VaultScriptsAudit.js** | `listVaultScripts()` | SHARED | Vault script lister. |
| **UITriggers.js** | `getUiSpreadsheetId_()`, `installUiTriggers()` | SHARED | Trigger installer. |
| **Directory.js** | `getOrCreateDirectorySheet()` | SHARED | Directory sheet creator. |
| **TabAnalyser.js** | `CoreOS_TabAnalyser()` | SHARED | Tab structure analysis. |

**Total shared functions: ~25 (× 8 spokes = ~200 of the 400 matches)**
**Classification: All SHARED → retire when CoreOS retires (Wave 6)**

---

## P1. candid-labs-core-os (Hub Library)

| File | Function | Class | Notes |
|------|----------|-------|-------|
| constants.js | `getGlobalConfig()` | SHARED | Central config — values extracted to Worker env vars |
| CoreOS.gs | `createSovereignMenu()` | SHARED | .gs duplicate of CoreOS.js |
| CoreOS.gs | `appendGlobalTools()` | SHARED | |
| CoreOS.gs | `showStatusCard()` | SHARED | |
| CoreOS.js | `createSovereignMenu()` | SHARED | |
| CoreOS.js | `appendGlobalTools()` | SHARED | |
| CoreOS.js | `showStatusCard()` | SHARED | |
| TabAnalyser.gs | `CoreOS_TabAnalyser()` | SHARED | .gs duplicate |
| TabAnalyser.js | `CoreOS_TabAnalyser()` | SHARED | |
| Menu.js | `createSovereignMenu()` | SHARED | Third copy |
| Menu.js | `appendGlobalTools()` | SHARED | |
| Menu.js | `coreos_analyseTabStructure()` | SHARED | Menu wrapper |
| Menu.js | `coreos_checkConnection()` | SHARED | Menu wrapper |
| Menu.js | `coreos_listFunctions()` | SHARED | Menu wrapper |

**Unique business functions: 0** — This is purely the shared library.
**Wave 6: Entire project retires.**

---

## P2. candid-labs-loan-tracker

| File | Function | Class | Notes |
|------|----------|-------|-------|
| **TransactionLogic.js** | `saveTransaction(formData)` | **MIGRATE** | Core: form → ledger entry + balance calc |
| **InterestAccrual.js** | `accrueMonthlyInterest()` | **MIGRATE** | Core: monthly interest posting (entrypoint) |
| InterestAccrual.js | `accrueMonthlyInterestForLender_()` | **MIGRATE** | Core: per-lender daily interest calculation |
| **BulkFromTransactions.js** | `applyTransactionsFromLoanTransactions()` | **MIGRATE** | Core: bulk backfill transactions → ledger |
| **RebuildLoanInterest.js** | `rebuildLoanDataWithInterest()` | **MIGRATE** | Core: full ledger rebuild with recalculated interest |
| **StatementGenerator.js** | `generateStatements(options)` | **ADAPTER** | Doc template + PDF export (DocumentApp + UrlFetchApp) |
| StatementGenerator.js | `getOrCreateLenderPdfFolder_()` | **ADAPTER** | Drive folder management |
| StatementGenerator.js | `exportDocToPdfViaHttp_()` | **ADAPTER** | Drive PDF export via HTTP |
| **BulkStatements.js** | `bulkGenerateStatementsForLender()` | **ADAPTER** | Loops generateStatements per month |
| BulkStatements.js | `promptBulkStatementsForLender()` | **RETIRE** | UI prompt — replaced by platform UI |
| **CheckSheetAndreports.js** | `buildMonthlySummaries_()` | **MIGRATE** | Reporting: monthly summary builder |
| CheckSheetAndreports.js | `generateCheckSheet()` | **MIGRATE** | Reporting: check sheet generator |
| CheckSheetAndreports.js | `generateLenderCheckReport()` | **MIGRATE** | Reporting: per-lender check report |
| **Analyser.js** | `runAnalyser()` | **RETIRE** | Diagnostic: sheet structure analysis |
| Analyser.js | `getEmailsSafe()` | **RETIRE** | Helper for analyser |
| **FolderUtils.js** | `getOrCreateLenderFolder_()` | **ADAPTER** | Drive folder management |
| **Helpers_Sections.js** | `deleteSectionRobustly()` | **ADAPTER** | Doc section manipulation |
| **UIHelpers.js** | `showSuccessToast()` | **RETIRE** | Google UI toast — replaced by platform UI |
| UIHelpers.js | `showErrorToast()` | **RETIRE** | Google UI toast |
| **TEST_ID.js** | `logActiveSpreadsheetId()` | **RETIRE** | Debug utility |
| **OpenOn.js** | `onOpen(e)` | **KEEP** | Menu builder (needed until fully migrated) |
| OpenOn.js | `coreos_menuTestPing()` | **RETIRE** | Debug ping |
| OpenOn.js | `showTransactionForm()` | **RETIRE** | HTML form — replaced by platform UI |
| OpenOn.js | `showGenerateStatementsForm()` | **KEEP** | Statement gen trigger (until adapter built) |
| **SpokeConstants.js** | *(no functions extracted — config only)* | **MIGRATE** | Config values → Worker env vars |

**Summary:**
| Class | Count |
|-------|-------|
| MIGRATE | 7 |
| ADAPTER | 5 |
| KEEP | 2 |
| RETIRE | 7 |
| SHARED | ~14 (CoreOS copies) |

---

## P3. candid-labs-platform (Admin Hub)

| File | Function | Class | Notes |
|------|----------|-------|-------|
| **masterMigration.js** | `runCmsSovereignSearch()` | **RETIRE** | Migration orchestrator (purpose fulfilled) |
| masterMigration.js | `recursiveVaultSearch_()` | **RETIRE** | Recursive Drive search |
| masterMigration.js | `getBoundScriptId_()` | **RETIRE** | Script discovery |
| masterMigration.js | `liberateCode_()` | **RETIRE** | Code extraction |
| masterMigration.js | `getOrCreateDirectorySheet_()` | **RETIRE** | |
| masterMigration.js | `getOrCreateSubfolder_()` | **RETIRE** | |
| masterMigration.js | `logToDirectory_()` | **RETIRE** | |
| **DiscoveryCmsAudit.js** | `runCmsAudit()` | **RETIRE** | CMS audit |
| DiscoveryCmsAudit.js | `performCrawl()` | **RETIRE** | Recursive folder crawl |
| **flattener.js** | `runCmsCodeExportMaster()` | **RETIRE** | Code flattening tool |
| **debuggerONE.js** | `runCmsPlatformDiagnostic()` | **RETIRE** | Diagnostic |
| debuggerONE.js | `diagnosticWalk_()` | **RETIRE** | Diagnostic |
| **OpenOn.js** | `onOpen(e)` | **RETIRE** | Menu — entire project retires |
| OpenOn.js | `coreos_menuTestPing()` | **RETIRE** | |

**Summary: All 14 unique functions → RETIRE (Wave 6). This is migration tooling that fulfills its purpose.**

---

## P4. candid-labs-production-master

| File | Function | Class | Notes |
|------|----------|-------|-------|
| **cleanPayables.js** | `cleanPayables()` | **MIGRATE** | Core pipeline: raw → clean payables transform |
| **ARAPSnapshot.js** | `snapshotArApFromRaw()` | **MIGRATE** | Core pipeline: ARAP snapshot builder |
| ARAPSnapshot.js | `runXeroMonthEndRefresh()` | **MIGRATE** | Orchestrator: chains cleanPayables + ARAP |
| ARAPSnapshot.js | `cleanNumber_()` | **MIGRATE** | Helper: number normalization |
| ARAPSnapshot.js | `getSnapshotDateFromUser_()` | **RETIRE** | UI prompt — replaced by platform UI |
| ARAPSnapshot.js | `buildArApRowsFromSheet_()` | **MIGRATE** | Core: builds AR/AP rows from raw data |
| **buildProductionRuns.js** | `buildProductionRunsClean()` | **MIGRATE** | Core pipeline: KMI packaging → production runs |
| buildProductionRuns.js | `colIdx()` | **MIGRATE** | Helper: column index lookup |
| buildProductionRuns.js | `_numberFromCell_()` | **MIGRATE** | Helper: cell number parsing |
| buildProductionRuns.js | `_parseDateLoose_()` | **MIGRATE** | Helper: flexible date parsing |
| **kmiFgParser.js** | `runAllKmiFgParsers()` | **MIGRATE** | Orchestrator: all KMI FG parsing |
| kmiFgParser.js | `buildKmiFgBatchClean()` | **MIGRATE** | Core: KMI batch data parser |
| kmiFgParser.js | `buildKmiFgShipmentsRaw()` | **MIGRATE** | Core: KMI shipment raw parser |
| kmiFgParser.js | `buildKmiFgShipmentsClean()` | **MIGRATE** | Core: shipment normalization |
| kmiFgParser.js | `buildKmiFgStockSummary()` | **MIGRATE** | Core: stock summary builder |
| kmiFgParser.js | `clearKmiFgOutputTabs_()` | **RETIRE** | Sheet tab clearing — handled by D1 |
| kmiFgParser.js | `parseKmiSkuTab_()` | **MIGRATE** | Core: SKU tab row-structure parser |
| kmiFgParser.js | `normaliseDoNumber_()` | **MIGRATE** | Helper: DO number normalization |
| kmiFgParser.js | `normaliseShipmentDateKey_()` | **MIGRATE** | Helper: date key normalization |
| kmiFgParser.js | `classifyShipmentMovement_()` | **MIGRATE** | Helper: SALE/SAMPLE/INTERNAL classification |
| kmiFgParser.js | `getKmiSkuTabConfig_()` | **MIGRATE** | Config: SKU tab → code mapping |
| kmiFgParser.js | `getOrCreateSheetWithHeaders_()` | **RETIRE** | Sheet creation — handled by D1 |
| kmiFgParser.js | `findRowIndexByLabel_()` | **MIGRATE** | Helper: row search by label |
| **Costing_Engine.js** | `runCostingPipeline()` | **MIGRATE** | Core pipeline: 3-tier cost waterfall |
| Costing_Engine.js | `getStandardCostFromXero()` | **MIGRATE** | Core: Xero standard cost lookup |
| Costing_Engine.js | `getSmartBomData()` | **MIGRATE** | Core: BOM data with component mapping |
| Costing_Engine.js | `getWacFromPayables()` | **MIGRATE** | Core: weighted average cost from payables |
| Costing_Engine.js | `writeToCostMaster()` | **MIGRATE** | Core: write costing results |
| **build_batch_cogs.js** | `buildBatchCOGS()` | **MIGRATE** | Core pipeline: COGS per production batch |
| build_batch_cogs.js | `findPrice()` | **MIGRATE** | Helper: month-based cost lookup with fallback |
| **build_component_cost_history.js** | `buildComponentCostHistory()` | **MIGRATE** | Core pipeline: historical component pricing |
| build_component_cost_history.js | `isProductionComponent()` | **MIGRATE** | Helper: supplier/item filter |
| build_component_cost_history.js | `normalizeComponent()` | **MIGRATE** | Helper: component code normalization |
| **buildPurchaseSummary.js** | `buildPurchasesSummaryFromPayables()` | **MIGRATE** | Core pipeline: purchase summary aggregation |
| buildPurchaseSummary.js | `colIdx()` | **MIGRATE** | Helper: column index lookup |
| **kmiPackagingMovements.js** | `buildKmiPackagingMovements()` | **MIGRATE** | Core pipeline: packaging movement tracking |
| kmiPackagingMovements.js | `h()` | **MIGRATE** | Helper: header index lookup |
| kmiPackagingMovements.js | `pushMovement()` | **MIGRATE** | Helper: movement row builder |
| kmiPackagingMovements.js | `_getKmiPackagingMovementHeaders_()` | **MIGRATE** | Config: movement header definitions |
| kmiPackagingMovements.js | `_numKmi_()` | **MIGRATE** | Helper: KMI number parsing |
| **Pipelines.js** | `runAllProductionPipelines()` | **MIGRATE** | Master orchestrator: chains all steps |
| **analyseKmiData.js** | `analyseKmiData()` | **RETIRE** | Diagnostic: KMI data analysis |
| analyseKmiData.js | `analyseSingleKmiSheet_()` | **RETIRE** | Diagnostic helper |
| analyseKmiData.js | `parseKmiDate_()` | **MIGRATE** | Helper: KMI date parsing (shared with other parsers) |
| **import_bom_master.js** | `importBOMMaster()` | **MIGRATE** | Config seed: hardcoded BOM → D1 |
| **import_config_components.js** | `importConfigComponents()` | **MIGRATE** | Config seed: component config → D1 |
| **Mopper_Tool.js** | `runAutoMapper()` | **MIGRATE** | Auto-mapping utility |
| **Setup.js** | `setupProductionDbTabs()` | **RETIRE** | One-time sheet setup — D1 replaces |
| Setup.js | `getOrCreateSheetWithHeaders_()` | **RETIRE** | Sheet creation |
| **extract_bom.js** | `extractBOM()` | **RETIRE** | Diagnostic: BOM structure logger |
| **audit_cost_coverage.js** | `auditCostCoverage()` | **RETIRE** | Diagnostic |
| **audit_kmi_invoices.js** | `auditKMIInvoices()` | **RETIRE** | Diagnostic |
| **check_component_codes.js** | `checkComponentCodes()` | **RETIRE** | Diagnostic |
| **check_cost_categories.js** | `checkCostCategories()` | **RETIRE** | Diagnostic |
| **check_kmi_raw_data.js** | `checkKMIRawData()` | **RETIRE** | Diagnostic |
| **check_raw_can_data.js** | `checkRawCanData()` | **RETIRE** | Diagnostic |
| **check_united_cans.js** | `checkUnitedCans()` | **RETIRE** | Diagnostic |
| **debug_can_costs.js** | `debugCanCosts()` | **RETIRE** | Debug |
| **debug_missing_components.js** | `debugMissingComponents()` | **RETIRE** | Debug |
| **diagnose_cost_history.js** | `diagnoseCostHistory()` | **RETIRE** | Debug |
| **list_can_purchases.js** | `listCanPurchases()` | **RETIRE** | Diagnostic |
| **Analyser.js** | `listProductionSheetHeaders()` | **RETIRE** | Diagnostic |
| Analyser.js | `setupProductionDbTabs()` | **RETIRE** | Duplicate of Setup.js |
| **OpenOn.js** | `onOpen(e)` | **KEEP** | Menu builder (until migrated) |
| OpenOn.js | `coreos_menuTestPing()` | **RETIRE** | Debug ping |

**Summary:**
| Class | Count |
|-------|-------|
| MIGRATE | 41 |
| ADAPTER | 0 |
| KEEP | 1 |
| RETIRE | 19 |
| SHARED | ~14 (CoreOS copies) |

---

## P5. candid-labs-sales-master

| File | Function | Class | Notes |
|------|----------|-------|-------|
| **cleanReceivables.js** | `cleanReceivableDetailRaw()` | **MIGRATE** | Core pipeline: Xero raw → clean receivables |
| **buildRevenueMaster.js** | `rebuildSalesRevenueMasterFromReceivables()` | **MIGRATE** | Core pipeline: receivables + mapping → revenue fact table |
| **margin.js** | `updateGrossMarginMetrics()` | **MIGRATE** | Core pipeline: GM calculation with DQ gating |
| margin.js | `shouldExcludeSku_()` | **MIGRATE** | Helper: SKU exclusion filter |
| margin.js | `normalizeSkuName_()` | **MIGRATE** | Helper: SKU name normalization |
| margin.js | `fuzzyMatchSkuCode_()` | **MIGRATE** | Helper: fuzzy SKU matching |
| margin.js | `normaliseMonthKeyFromDate_()` | **MIGRATE** | Helper: date → month key |
| margin.js | `normaliseMonthKeyCell_()` | **MIGRATE** | Helper: cell → month key |
| margin.js | `formatMonthLabel_()` | **MIGRATE** | Helper: month key → display label |
| margin.js | `writeCOGSExceptions_()` | **MIGRATE** | Core: unmatched SKU exception writer |
| margin.js | `verifyGrossMarginEngine()` | **MIGRATE** | Diagnostic runner (useful as admin endpoint) |
| **Xero transformer.js** | `uiPromptUpdateDeckMetricsFromXero()` | **RETIRE** | UI prompt — replaced by platform UI |
| Xero transformer.js | `updateDeckMetricsRevenueFromXero_()` | **MIGRATE** | Core: monthly revenue aggregation |
| Xero transformer.js | `normaliseMonthKeyCell_()` | **MIGRATE** | Helper (duplicate of margin.js) |
| Xero transformer.js | `buildMonthlyRevenueFromXeroRaw_()` | **MIGRATE** | Core: raw Xero → monthly aggregates |
| Xero transformer.js | `normaliseMonthKeyFromDate_()` | **MIGRATE** | Helper |
| Xero transformer.js | `parseXeroDate_()` | **MIGRATE** | Helper: Xero date parsing |
| Xero transformer.js | `getReceivableRawSheet_()` | **RETIRE** | Sheet lookup — replaced by D1 query |
| Xero transformer.js | `formatCurrencyIdr_()` | **MIGRATE** | Helper: IDR formatting |
| **CRM.js** | `ensureCrmContactsSheet_()` | **RETIRE** | Sheet setup — platform CRM exists |
| CRM.js | `rebuildCrmContactHealth()` | **MIGRATE** | Core: CRM completeness scoring |
| CRM.js | `pct()` | **MIGRATE** | Helper: percentage calc |
| CRM.js | `syncCrmFromConfigMapping()` | **MIGRATE** | Core: backfill CRM from mapping |
| CRM.js | `idx()` | **MIGRATE** | Helper: header index lookup |
| CRM.js | `cIdx()` | **MIGRATE** | Helper: CRM header index |
| CRM.js | `setIfBlank()` | **MIGRATE** | Helper: conditional cell writer |
| **Mapping_Health.js** | `rebuildMappingHealth()` | **MIGRATE** | Core: mapping completeness report |
| Mapping_Health.js | `idx()` | **MIGRATE** | Helper |
| Mapping_Health.js | `isActive()` | **MIGRATE** | Helper: active flag check |
| **mapping_sync.js** | `syncVenueMappingFromAccountTracking()` | **MIGRATE** | Core: auto-discover new venues |
| mapping_sync.js | `col()` | **MIGRATE** | Helper: column lookup |
| mapping_sync.js | `forceMappingKeyToStaticText()` | **RETIRE** | Sheet formula cleanup — not needed in D1 |
| mapping_sync.js | `generateMissingAccountIDs()` | **MIGRATE** | Core: MD5 hash Account_ID generation |
| **tracking_enrichment.js** | `updateAccountTrackingFromMapping_()` | **MIGRATE** | Core: enrich transactions with hierarchy |
| tracking_enrichment.js | `col()` | **MIGRATE** | Helper: column lookup |
| tracking_enrichment.js | `populateAccountIDs()` | **RETIRE** | UI wrapper — replaced by platform UI |
| **account_status.js** | `rebuildAccountStatus()` | **MIGRATE** | Core: account health snapshot |
| account_status.js | `col()` | **MIGRATE** | Helper |
| account_status.js | `toDate()` | **MIGRATE** | Helper: date normalization |
| account_status.js | `checkDormantAccounts()` | **MIGRATE** | Core: dormant account flagging |
| account_status.js | `colStatus()` | **MIGRATE** | Helper |
| account_status.js | `colMap()` | **MIGRATE** | Helper |
| **deck_metrics_builder.js** | `parseInvoiceDateSafe_()` | **MIGRATE** | Helper: date parsing |
| deck_metrics_builder.js | `rebuildDeckMetricsFromSales()` | **MIGRATE** | Core: rebuild metrics from revenue |
| deck_metrics_builder.js | `colIndexByHeader()` | **MIGRATE** | Helper |
| deck_metrics_builder.js | `updateHeadlineMoMChanges()` | **MIGRATE** | Core: headline narrative generation |
| deck_metrics_builder.js | `formatMonthLabel()` | **MIGRATE** | Helper (×2 copies in file) |
| deck_metrics_builder.js | `formatDeltaPercent()` | **MIGRATE** | Helper (×2 copies) |
| deck_metrics_builder.js | `updateSalesPerformanceSummary()` | **MIGRATE** | Core: sales performance narrative |
| deck_metrics_builder.js | `formatCurrencyIdr()` | **MIGRATE** | Helper |
| deck_metrics_builder.js | `updateChannelPerformanceMoM()` | **MIGRATE** | Core: channel performance narrative |
| deck_metrics_builder.js | `normaliseMonthKeyFromDate_()` | **MIGRATE** | Helper |
| deck_metrics_builder.js | `formatMonthLabel_()` | **MIGRATE** | Helper |
| deck_metrics_builder.js | `normaliseMonthKeyCell_()` | **MIGRATE** | Helper |
| deck_metrics_builder.js | `updateYoYRevenue()` | **MIGRATE** | Core: year-over-year revenue calc |
| deck_metrics_builder.js | `updateMoMRevenue()` | **MIGRATE** | Core: month-over-month revenue calc (×2 copies) |
| **Deck_Metrics_Channel_Narratives.js** | `updateChannelPerformanceMoM()` | **MIGRATE** | Core: channel narrative (alt version) |
| Deck_Metrics_Channel_Narratives.js | `normaliseMonthKeyFromDate_()` | **MIGRATE** | Helper |
| Deck_Metrics_Channel_Narratives.js | `formatMonthLabel_()` | **MIGRATE** | Helper |
| Deck_Metrics_Channel_Narratives.js | `normaliseMonthKeyCell_()` | **MIGRATE** | Helper |
| **Deck_Metrics_Wrapper.js** | `refreshDeckMetricsAll()` | **MIGRATE** | Orchestrator: full deck metrics refresh |
| **ReportGenerator.js** | `uiPromptForReport()` | **RETIRE** | UI prompt — replaced by platform UI |
| ReportGenerator.js | `generateMonthlyDeckForMonth()` | **ADAPTER** | Core: Slides template fill (SlidesApp) |
| ReportGenerator.js | `normaliseMonthKey()` | **MIGRATE** | Helper |
| ReportGenerator.js | `f()` | **MIGRATE** | Helper: intelligent value formatter |
| ReportGenerator.js | `TEST_generateMonthlyDeckForMonth_()` | **RETIRE** | Test |
| **SnapshotOutline.js** | `uiPromptForMarekSnapshotDeck()` | **RETIRE** | UI prompt |
| SnapshotOutline.js | `generateMarekOutlineDeckForMonth_()` | **ADAPTER** | Core: Slides outline deck (SlidesApp) |
| SnapshotOutline.js | `addSlideWithBody()` | **ADAPTER** | Helper: slide builder |
| **slides_template_builder.js** | `buildMonthlyDeckTemplateSlides()` | **RETIRE** | One-time template setup |
| slides_template_builder.js | `addSlideWithTitleAndBody()` | **RETIRE** | One-time helper |
| slides_template_builder.js | `generateMonthlyDeckForMonth_FromTemplateBuilder_()` | **RETIRE** | Alt version of ReportGenerator |
| slides_template_builder.js | `normaliseMonthKey()` | **RETIRE** | Duplicate |
| slides_template_builder.js | `f()` | **RETIRE** | Duplicate |
| **config_lists.js** | `rebuildConfigLists()` | **MIGRATE** | Core: config list rebuilder |
| config_lists.js | `runConfigToolsRefresh()` | **MIGRATE** | Orchestrator: config refresh |
| **config_validation.js** | `getHeaderIndex()` | **MIGRATE** | Helper: header lookup |
| config_validation.js | `applyMappingValidations()` | **MIGRATE** | Core: mapping data validation |
| **header_protect.js** | `freezeAndProtectHeaders()` | **RETIRE** | Sheet protection — not needed in D1 |
| **structure_setup.js** | `setupSalesDbStructure()` | **RETIRE** | One-time sheet setup — D1 replaces |
| structure_setup.js | `listSheetHeaders()` | **RETIRE** | Diagnostic |
| **deck_metrics_tab_setup.js** | `setupDeckMetricsSheet()` | **RETIRE** | One-time sheet setup |
| **SpokeConstants.js** | `getProductionDbId_()` | **MIGRATE** | Config: production DB ID → Worker env var |
| SpokeConstants.js | `getSlidesTemplateId_()` | **MIGRATE** | Config: template ID → Worker env var |
| SpokeConstants.js | `getSlidesOutputFolderId_()` | **MIGRATE** | Config: output folder → Worker env var |
| SpokeConstants.js | `listFolderContents()` | **RETIRE** | Diagnostic: folder lister |
| **find_all_sku_patterns.js** | `findAllSKUPatterns()` | **RETIRE** | Diagnostic |
| **find_unmapped_skus.js** | `findUnmappedSkus()` | **RETIRE** | Diagnostic |
| **check_early_months.js** | `checkEarlyMonthsCOGS()` | **RETIRE** | Diagnostic |
| **check_pni_details.js** | `checkPNIDetails()` | **RETIRE** | Diagnostic |
| **check_problem_months.js** | `checkProblemMonths()` | **RETIRE** | Diagnostic |
| **check_sku_matching.js** | `diagnosticSkuMatching()` | **RETIRE** | Diagnostic |
| **check_cogs_assignment.js** | `checkCOGSAssignment()` | **RETIRE** | Diagnostic |
| **DebugRunner.js** | `TEST_generateMonthlyDeck_2025_10_()` | **RETIRE** | Test |
| **Test Library.js** | `TEST_CoreOSLibrary()` | **RETIRE** | Test |
| Test Library.js | `testSpokesFix()` | **RETIRE** | Test |
| Test Library.js | `TEST_BoardDeckConfig()` | **RETIRE** | Test |
| **Debug.js** | `debug_listTriggers()` | **RETIRE** | Debug |
| **OpenOn.js** | `onOpen(e)` | **KEEP** | Menu builder (until migrated) |
| OpenOn.js | `promptGenerateMonthlyDeck()` | **KEEP** | Deck gen trigger (until adapter built) |
| OpenOn.js | `coreos_menuTestPing()` | **RETIRE** | Debug |

**Summary:**
| Class | Count |
|-------|-------|
| MIGRATE | 62 |
| ADAPTER | 3 |
| KEEP | 2 |
| RETIRE | 28 |
| SHARED | ~14 (CoreOS copies) |

---

## P6. candid-labs-sales-tool

| File | Function | Class | Notes |
|------|----------|-------|-------|
| **code.js** | `getActiveUserIdentity()` | **MIGRATE** | Core: user lookup → CF Access identity |
| code.js | `generatePDF(formData)` | **MIGRATE** | Core: HTML template → PDF generation |
| code.js | `formatCurrency()` | **MIGRATE** | Helper: IDR formatting |
| code.js | `formatPhoneForDisplay()` | **MIGRATE** | Helper: phone formatting |
| code.js | `getPricingFromSheet()` | **MIGRATE** | Core: pricing lookup → D1 query |
| code.js | `logAction()` | **MIGRATE** | Core: audit log → D1 |
| code.js | `loadImageBase64()` | **MIGRATE** | Asset: image loading → R2/static |
| code.js | `debugLogos()` | **RETIRE** | Debug |
| **constants.js** | *(config only — no functions in registry)* | **MIGRATE** | Config → Worker env vars |
| **MenuBuilder.js** | `buildMenus()` | **KEEP** | Menu (until migrated) |
| **SetUp.js** | `runSetup()` | **RETIRE** | One-time sheet setup |
| **Tests.js** | `debugProjectFiles()` | **RETIRE** | Debug |
| **Debug.js** | `debug_listTriggers()` | **RETIRE** | Debug |
| **OpenOn.js** | `onOpen(e)` | **KEEP** | Menu builder |
| OpenOn.js | `coreos_menuTestPing()` | **RETIRE** | Debug |
| OpenOn.js | `showSidebar()` | **KEEP** | Webapp sidebar launcher |
| OpenOn.js | `doGet()` | **MIGRATE** | Webapp entrypoint → platform route |

**Summary:**
| Class | Count |
|-------|-------|
| MIGRATE | 8 |
| ADAPTER | 0 |
| KEEP | 3 |
| RETIRE | 4 |
| SHARED | ~14 (CoreOS copies) |

---

## P7. candid-os-script-discovery-engine

| File | Function | Class | Notes |
|------|----------|-------|-------|
| **GasScan.js** | `discoverAndUpsert_AllScripts()` | **RETIRE** | Admin: script discovery |
| GasScan.js | `listAllScriptsViaDrive_()` | **RETIRE** | Admin: Drive API script listing |
| **SetUp.js** | `runDiscoveryInitialSetup()` | **RETIRE** | One-time setup |
| SetUp.js | `upsertSheet_()` | **RETIRE** | Sheet helper |
| SetUp.js | `ensureHeaders_()` | **RETIRE** | Sheet helper |
| SetUp.js | `formatSheet_()` | **RETIRE** | Sheet helper |
| SetUp.js | `logDiscovery_()` | **RETIRE** | Logging |
| SetUp.js | `resetDataBelowHeader_()` | **RETIRE** | Sheet helper |
| SetUp.js | `makeScanId_()` | **RETIRE** | ID generator |
| **Deep containerAudit.js** | `runDeepContainerAudit()` | **RETIRE** | Admin: container audit |

**Summary: All 10 → RETIRE (Wave 6). Admin tooling.**

---

## P8. key-account-agreement-generator (KAA)

| File | Function | Class | Notes |
|------|----------|-------|-------|
| **OnFormSubmit.js** | `onFormSubmit(e)` | **MIGRATE** | Core trigger: form → canonical → append → doc → email |
| **Mapping.js** | `mapRawToCanonical_()` | **MIGRATE** | Core: raw form data → canonical fields |
| Mapping.js | `buildAgreementKey_()` | **MIGRATE** | Core: unique agreement key generation |
| Mapping.js | `normalizeEnum_()` | **MIGRATE** | Helper: enum normalization |
| Mapping.js | `get()` | **MIGRATE** | Helper: safe field getter |
| **Helpers.js** | `buildAgreementKey_()` | **MIGRATE** | Duplicate of Mapping.js version |
| Helpers.js | `normalizeEnum_()` | **MIGRATE** | Duplicate |
| Helpers.js | `normalizeDateKey_()` | **MIGRATE** | Helper: date normalization |
| Helpers.js | `normalizeRebateFrequencyKey_()` | **MIGRATE** | Helper: rebate enum normalization |
| Helpers.js | `kaa_formatDateForDoc_()` | **ADAPTER** | Helper: date formatting for Doc template |
| **Append.js** | `appendCanonicalRow_()` | **MIGRATE** | Core: write canonical row → D1 INSERT |
| **GenerateDoc.js** | `normalizeRebateFrequencyKey_()` | **MIGRATE** | Duplicate |
| GenerateDoc.js | `generateAgreementDocFromRow()` | **ADAPTER** | Core: Doc template fill (DocumentApp) |
| GenerateDoc.js | `colIndex()` | **MIGRATE** | Helper: column lookup |
| **Notifications.js** | `kaa_sendNotificationsForAgreementRow_()` | **ADAPTER** | Core: email orchestration (GmailApp) |
| Notifications.js | `kaa_isInternalEmail_()` | **MIGRATE** | Helper: email domain check |
| Notifications.js | `kaa_sendEmail_()` | **ADAPTER** | Core: send email (GmailApp) |
| Notifications.js | `kaa_defaultInternalBody_()` | **MIGRATE** | Template: internal email body |
| Notifications.js | `kaa_defaultExternalBody_()` | **MIGRATE** | Template: external email body |
| **BackFill.js** | `kaa_backfillRawMissingOnly()` | **MIGRATE** | Core: backfill missing agreements |
| BackFill.js | `kaa_ensureRawMarkers_()` | **RETIRE** | Sheet marker setup — D1 replaces |
| BackFill.js | `kaa_existingAgreementKeys_()` | **MIGRATE** | Core: dedup check → D1 UNIQUE constraint |
| BackFill.js | `kaa_appendAgreementFromRawRow()` | **MIGRATE** | Core: process single raw row |
| **RegenPicker.js** | `kaa_pickerSearchAgreements_()` | **MIGRATE** | Core: search agreements → D1 query |
| **Regenerate.js** | `kaa_regenerateFromSelectedRow()` | **MIGRATE** | Core: regenerate from active row |
| Regenerate.js | `kaa_regenerateFromRowPrompt()` | **RETIRE** | UI prompt — platform UI replaces |
| Regenerate.js | `kaa_regenerateFromAgreementKeyPrompt()` | **RETIRE** | UI prompt |
| Regenerate.js | `kaa_regenerateRow_()` | **MIGRATE** | Core: regeneration logic |
| Regenerate.js | `kaa_findAgreementRowByKey_()` | **MIGRATE** | Core: key lookup → D1 query |
| Regenerate.js | `kaa_writeAgreementError_()` | **MIGRATE** | Core: error status writer |
| Regenerate.js | `truncateForUi_()` | **RETIRE** | UI helper |
| **Header_Setup.js** | `kaa_createOrResetAgreementsHeaders()` | **RETIRE** | Sheet setup — D1 schema replaces |
| **test_form_submission.js** | `getKaaSpreadsheet_()` | **RETIRE** | Test helper |
| test_form_submission.js | `testFormSubmission()` | **RETIRE** | Test |
| test_form_submission.js | `buildMockFormEvent_()` | **RETIRE** | Test |
| test_form_submission.js | `verifyTestResults_()` | **RETIRE** | Test |
| test_form_submission.js | `testFormSubmissionExternal()` | **RETIRE** | Test |
| test_form_submission.js | `cleanupLastTestRow()` | **RETIRE** | Test |
| **Heartbeat_test.js** | `testSheetConnection()` | **RETIRE** | Test |
| **OpenOn.js** | `onOpen()` | **KEEP** | Menu (until migrated) |
| OpenOn.js | `getKaaUiSpreadsheetId_()` | **KEEP** | Config helper |
| OpenOn.js | `installKaaUiTriggers()` | **KEEP** | Trigger installer |

**Summary:**
| Class | Count |
|-------|-------|
| MIGRATE | 22 |
| ADAPTER | 4 |
| KEEP | 3 |
| RETIRE | 13 |
| SHARED | ~14 (CoreOS copies) |

---

## Grand Total

| Classification | Count | % of unique functions |
|---------------|-------|----------------------|
| **MIGRATE** | 140 | 56% |
| **ADAPTER** | 12 | 5% |
| **KEEP** | 11 | 4% |
| **RETIRE** | 85 | 34% |
| **SHARED (CoreOS copies)** | ~25 unique × 8 spokes | (duplicates, counted once → retire) |

### What "RETIRE" actually means

| Retire category | Count | Explanation |
|----------------|-------|-------------|
| Debug/diagnostic/test | 42 | `check_*`, `debug_*`, `diagnose_*`, `audit_*`, `TEST_*`, `Heartbeat_*` |
| UI prompts | 9 | `uiPrompt*`, `prompt*` — replaced by platform UI |
| One-time setup | 12 | `setup*`, `createOrReset*`, `ensureRawMarkers` — D1 schema replaces |
| Sheet helpers | 8 | `getOrCreateSheet*`, `clearTabs`, `freezeAndProtect` — not needed in D1 |
| Migration tooling | 14 | platform project (all functions) — purpose fulfilled |

**Nothing with business logic is classified RETIRE.** Every function that computes, transforms, validates, or orchestrates business data is classified MIGRATE or ADAPTER.
