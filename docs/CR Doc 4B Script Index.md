# CDoc B --- Script Index

A consolidated, human‑readable catalogue of all Google Apps Script
functions across the Production DB and Sales DB. This index is
maintained to ensure clear ownership, faster debugging, and easier
onboarding of new team members or VAs.

## 1. Purpose

The Script Index documents every function used inside the Candid Labs
Data Engine. It covers:

-   Function names

-   System location (Sales DB / Production DB)

-   File name (.gs)

-   Core responsibility

-   Dependencies (inputs/outputs)

-   Trigger type (manual, onOpen menu, orchestrator)

This appendix ensures that the entire engineering system is fully
traceable.

## 2. Structure of this Index

Each function is listed in the following format:

**Function:** functionName() **Location:** Sales DB / Production DB
**File:** filename.gs **Used in:** Orchestrator / Sub‑menu / VA workflow
**Description:** One‑sentence summary **Inputs:** Tabs used **Outputs:**
Tabs written **Notes:** Exceptions, risks, or special logic

## 3. Sales DB --- Functions

### 3.1 Core Orchestration

-   **runAllSalesTools()** --- Master VA one‑click function.

-   **runConfigToolsRefresh()** --- Full mapping + validation refresh.

### 3.2 Receivables Pipeline

-   cleanReceivableDetailRaw() --- Cleans Xero receivable export.

-   rebuildSalesRevenueMasterFromReceivables() --- Produces
    > SALES_REVENUE_MASTER.

### 3.3 Mapping & Config

-   syncVenueMappingFromAccountTracking() --- Ensures CONFIG_MAPPING
    > contains all venues.

-   generateMissingAccountIDs() --- Creates Account_ID values.

-   rebuildConfigLists() --- Rebuilds dropdown lists in
    > CONFIG_CONSTANTS.

-   applyMappingValidations() --- Applies data validation.

-   forceMappingKeyToStaticText() --- Ensures Raw_Value is not a
    > formula.

### 3.4 Account Status

-   rebuildAccountStatus() --- Computes active/inactive flags.

-   checkDormantAccounts() --- Flags dormant or lost accounts.

### 3.5 Utilities

-   listSheetHeaders() --- Generates TAB STRUCTURE.

-   freezeAndProtectHeaders() --- Protects header rows.

## 4. Production DB --- Functions

### 4.1 Core Orchestration

-   **runAllProductionTools()** --- VA one‑click function.

### 4.2 Payables Pipeline

-   cleanPayableDetailRaw() --- Cleans Xero payable export.

-   buildPurchasesSummaryFromPayables() --- Rebuilds purchases summary.

### 4.3 KMI Pipelines

-   runAllKmiFgParsers() --- Batch job for all FG tables.

-   importKmiRmRaw() --- Imports RM report.

-   importKmiPackagingRaw() --- Imports packaging report.

-   buildProductionRunsClean() --- Cleans production runs.

-   buildKmiFgBatchClean() --- Builds FG batch table.

-   buildKmiFgShipmentsRaw() --- Processes FG shipments.

-   buildKmiFgStockSummary() --- FG stock summary.

### 4.4 Stock Movement

-   buildStockMovements() --- Calculates all stock flows.

-   buildStockSummary() --- Final stock on hand snapshot.

### 4.5 Utilities

-   listProductionSheetHeaders() --- TAB STRUCTURE for Production DB.

-   setupProductionDbTabs() --- Rebuilds key tabs.

-   resetAllDataTabs() --- Clears all \*\_CLEAN and \*\_RAW tabs.

## 5. How This Index is Maintained

-   Updated whenever a new function is created.

-   Versioned in the CDoc library.

-   Referenced by developers and VAs.

-   Required reading before modifying any script.

End of Doc B
