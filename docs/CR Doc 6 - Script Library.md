This document marks the official conclusion of the **SCRIPT LIBRARY**
documentation phase (CDoc D) and initiates the documentation of the
final core governance components required by the Candid Labs Master
Index.

### Status Update: Script Library (CDoc D) Complete

We have successfully catalogued, reconciled, and generated the **Script
Definition Cards** for the entire Apps Script code base relevant to the
Candid Labs Sales DB and Production DB data engines.

-   The **final, authoritative Script Index** has been confirmed,
    > containing **37 unique functions** \[Conversation History\].

-   The Script Definition Cards (as generated in the previous step)
    > provide the necessary metadata---including Core Responsibility,
    > Primary Inputs, Primary Outputs, and Location (Sales DB or
    > Production DB)---for every operational function.

### Focus of CR Doc 6

With the function documentation solidified, this phase shifts from
defining the code architecture to defining the **operational and
structural rules** that ensure the data engine's reliability and
compliance.

The primary objective of this document is to transition into the next
scheduled component of the governance framework, focusing on **Tab
Structure Consistency** (CDoc F) and/or the detailed **Standard
Operating Procedures (SOPs)** (CDoc E) that dictate VA interaction and
maintenance requirements for the newly documented 37 scripts.

The goal is to leverage the precise definitions established for
functions such as freezeAndProtectHeaders(), listSheetHeaders(), and
setupProductionDbTabs() to formalize the mandatory structure required
across both the Sales DB and Production DB environments.

## CANDID LABS SCRIPT DEFINITION CARDS (37 Total)

### A. Sales DB Script Definition Cards (19 Cards)

  --------------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**      **runAllSalesTools**   **runReceivablesPipeline**   **runRevenueMasterPipeline**   **runConfigPipeline**   **runAccountStatusPipeline**
  -------------- ---------------------- ---------------------------- ------------------------------ ----------------------- ------------------------------
  **Function     runAllSalesTools       runReceivablesPipeline       runRevenueMasterPipeline       runConfigPipeline       runAccountStatusPipeline
  Name**                                                                                                                    

  **What it      Master trigger: Runs   Processes the raw            Regenerates the primary Sales  Refreshes all mapping   Updates the active/dormant
  does**         the full end-to-end    receivables data into a      Revenue Master from cleaned    configs (Customers,     status of all customer
                 sales data pipeline.   clean format.                invoice data.                  SKUs, Venues).          accounts.

  **Inputs**     All Raw Inputs         RECEIVABLES_RAW              RECEIVABLES_CLEAN              CONFIG_MAPPING          SALES_REVENUE_MASTER

  **Outputs**    All Master Outputs     RECEIVABLES_CLEAN            SALES_REVENUE_MASTER           CONFIG_VALIDATION       ACCOUNT_STATUS

  **Location**   Sales DB               Sales DB                     Sales DB                       Sales DB                Sales DB

  **SLA for VA   High (Primary          High (Orchestrated Pipeline  High (Orchestrated Pipeline    High (Orchestrated      High (Orchestrated Pipeline
  Use**          One-Click Entry Point) Step)                        Step)                          Pipeline Step)          Step)
  --------------------------------------------------------------------------------------------------------------------------------------------------------

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**      **cleanReceivableDetailRaw**   **rebuildSalesRevenueMasterFromReceivables**   **rebuildAccountStatus**   **checkDormantAccounts**   **listSheetHeaders**
  -------------- ------------------------------ ---------------------------------------------- -------------------------- -------------------------- ----------------------
  **Function     cleanReceivableDetailRaw       rebuildSalesRevenueMasterFromReceivables       rebuildAccountStatus       checkDormantAccounts       listSheetHeaders
  Name**                                                                                                                                             

  **What it      Standardizes the raw Xero      Core logic: Transforms invoice line items into Calculates last order date Flags accounts that        Utility to list
  does**         Receivables export (Dates,     the master sales record.                       and status for every       haven\'t ordered in X      headers for
                 Amounts).                                                                     account.                   days.                      debugging/mapping.

  **Inputs**     RECEIVABLES_RAW                RECEIVABLES_CLEAN                              SALES_REVENUE_MASTER       ACCOUNT_STATUS             Active Sheet

  **Outputs**    RECEIVABLES_CLEAN              SALES_REVENUE_MASTER                           ACCOUNT_STATUS             DORMANT_ACCOUNTS           Logger / UI

  **Location**   Sales DB                       Sales DB                                       Sales DB                   Sales DB                   Sales DB

  **SLA for VA   High (Pipeline Step)           High (Pipeline Step)                           High (Pipeline Step)       High (Pipeline Step)       Low (Developer/Mapping
  Use**                                                                                                                                              Use)
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  ----------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**      **runConfigToolsRefresh**   **rebuildConfigLists**   **getHeaderIndex**   **applyMappingValidations**   **freezeAndProtectHeaders**
  -------------- --------------------------- ------------------------ -------------------- ----------------------------- -----------------------------
  **Function     runConfigToolsRefresh       rebuildConfigLists       getHeaderIndex       applyMappingValidations       freezeAndProtectHeaders
  Name**                                                                                                                 

  **What it      Refreshes the tools and     Updates dropdown lists   Helper to find       Applies data validation rules Locks the header rows of all
  does**         lookup tables used by the   and validation ranges    column numbers by    to the mapping tab.           output sheets to prevent
                 sheet.                      from the Master Config.  name (critical for                                 accidental edits.
                                                                      mapping).                                          

  **Inputs**     CONFIG_MAPPING              CONFIG_MAPPING           Target Sheet         CONFIG_MAPPING                All Output Tabs

  **Outputs**    N/A                         DATA_VALIDATION          Return Value         CONFIG_MAPPING                All Output Tabs

  **Location**   Sales DB                    Sales DB                 Sales DB             Sales DB                      Sales DB

  **SLA for VA   High (Orchestrated Pipeline Low (System Utility)     N/A (Internal        High (Mapping Governance)     High (Automated Security)
  Use**          Step)                                                Helper)                                            
  ----------------------------------------------------------------------------------------------------------------------------------------------------

  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**      **syncVenueMappingFromAccountTracking**   **forceMappingKeyToStaticText**   **generateMissingAccountIDs**   **onOpen**     **setupSalesDbStructure**
  -------------- ----------------------------------------- --------------------------------- ------------------------------- -------------- ---------------------------
  **Function     syncVenueMappingFromAccountTracking       forceMappingKeyToStaticText       generateMissingAccountIDs       onOpen         setupSalesDbStructure
  Name**                                                                                                                                    

  **What it      Syncs new venues found in Account         Converts formula-based keys to    Creates unique IDs for new      Initializes    Creates/Repairs the
  does**         Tracking to the Mapping Config.           static text to prevent            accounts found in the sales     the \"Candid   required tab structure for
                                                           calculation errors.               data.                           Sales\" custom the Sales database.
                                                                                                                             menu.          

  **Inputs**     ACCOUNT_STATUS                            CONFIG_MAPPING                    CONFIG_MAPPING                  N/A            N/A

  **Outputs**    CONFIG_MAPPING                            CONFIG_MAPPING                    CONFIG_MAPPING                  N/A            TAB_STRUCTURE

  **Location**   Sales DB                                  Sales DB                          Sales DB                        Sales DB       Sales DB

  **SLA for VA   High (Mapping Governance)                 High (Mapping Governance)         High (Mapping Governance)       High (UI       Low (Setup/Utility)
  Use**                                                                                                                      Requirement)   
  ---------------------------------------------------------------------------------------------------------------------------------------------------------------------

### B. Production DB Script Definition Cards (18 Cards)

  ---------------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**      **runXeroMonthEndRefresh**   **cleanPayableDetailRaw**   **rebuildPayableDetailClean**   **snapshotArApFromRaw**   **cleanAgedPayables**
  -------------- ---------------------------- --------------------------- ------------------------------- ------------------------- -----------------------
  **Function     runXeroMonthEndRefresh       cleanPayableDetailRaw       rebuildPayableDetailClean       snapshotArApFromRaw       cleanAgedPayables
  Name**                                                                                                                            

  **What it      Master trigger to refresh    Sanitizes the raw Xero      Cleans raw payable data to      Archives the current      Formats the Aged
  does**         all financial data           export (removes             create a standardized detail    AR/AP position for        Payables report for
                 (Payables/Purchases) for     headers/footers).           view.                           historical trending.      dashboard ingestion.
                 month-end.                                                                                                         

  **Inputs**     PAYABLE_DETAIL_RAW           PAYABLE_DETAIL_RAW          PAYABLE_DETAIL_RAW              PAYABLE_DETAIL_RAW        AGED_PAYABLES_RAW

  **Outputs**    PAYABLE_DETAIL_CLEAN         PAYABLE_DETAIL_RAW          PAYABLE_DETAIL_CLEAN            AR_AP_SUMMARY             AGED_PAYABLES_CLEAN

  **Location**   Production DB                Production DB               Production DB                   Production DB             Production DB

  **SLA for VA   High (Primary One-Click      High (Pipeline Step)        High (Pipeline Step)            Low (System Tracking)     High (Pipeline Step)
  Use**          Entry Point)                                                                                                       
  ---------------------------------------------------------------------------------------------------------------------------------------------------------

  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**      **rebuildPurchasesSummary**   **buildPurchasesSummaryFromPayables**   **buildKmiPackagingMovements**   **analyseKmiData**   **buildProductionRunsClean**
  -------------- ----------------------------- --------------------------------------- -------------------------------- -------------------- ------------------------------
  **Function     rebuildPurchasesSummary       buildPurchasesSummaryFromPayables       buildKmiPackagingMovements       analyseKmiData       buildProductionRunsClean
  Name**                                                                                                                                     

  **What it      Aggregates individual payable Logic engine for the purchases          Tracks movement of packaging     Master function to   Standardizes the production
  does**         lines into a summary by       aggregation (called by                  inventory at KMI (Co-packer).    parse all KMI raw    run logs from the
                 Supplier/Category.            rebuildPurchasesSummary).                                                data files (Stock,   manufacturing partner.
                                                                                                                        Usage, Production).  

  **Inputs**     PAYABLE_DETAIL_CLEAN          PAYABLE_DETAIL_CLEAN                    KMI_PACKAGING_RAW                KMI_PACKAGING_RAW,   PRODUCTION_RUNS_RAW
                                                                                                                        KMI_RM_RAW           

  **Outputs**    PURCHASES_SUMMARY             PURCHASES_SUMMARY                       KMI_MOVEMENTS                    Multiple KMI Tabs    PRODUCTION_RUNS_CLEAN

  **Location**   Production DB                 Production DB                           Production DB                    Production DB        Production DB

  **SLA for VA   High (Pipeline Step)          N/A (Internal Logic)                    High (Pipeline Step)             High (Orchestrated   High (Pipeline Step)
  Use**                                                                                                                 Step)                
  -------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  -----------------------------------------------------------------------------------------------------------------------------------------------------------
  **Field**      **runAllKmiFgParsers**   **buildKmiFgBatchClean**   **buildKmiFgShipmentsRaw**   **buildKmiFgShipmentsClean**   **buildKmiFgStockSummary**
  -------------- ------------------------ -------------------------- ---------------------------- ------------------------------ ----------------------------
  **Function     runAllKmiFgParsers       buildKmiFgBatchClean       buildKmiFgShipmentsRaw       buildKmiFgShipmentsClean       buildKmiFgStockSummary
  Name**                                                                                                                         

  **What it      Triggers all Finished    Cleans the batch-level     Ingests raw shipment data    Standardizes shipment data for Calculates final stock
  does**         Goods (FG) parsers for   production data for        from the 3PL/Co-packer.      logistics tracking.            positions for Finished
                 stock reconciliation.    traceability.                                                                          Goods.

  **Inputs**     KMI_FG_STOCK_RAW         KMI_FG_BATCH_RAW           External CSV/Paste           KMI_FG_SHIPMENTS_RAW           KMI_FG_STOCK_CLEAN

  **Outputs**    KMI_FG_STOCK_CLEAN       KMI_FG_BATCH_CLEAN         KMI_FG_SHIPMENTS_RAW         KMI_FG_SHIPMENTS_CLEAN         FG_STOCK_SUMMARY

  **Location**   Production DB            Production DB              Production DB                Production DB                  Production DB

  **SLA for VA   High (Orchestrated       High (Pipeline Step)       High (Input Step)            High (Pipeline Step)           High (Final Pipeline Step)
  Use**          Pipeline Step)                                                                                                  
  -----------------------------------------------------------------------------------------------------------------------------------------------------------

  ---------------------------------------------------------------------------
  **Field**      **onOpen**               **setupProductionDbTabs**
  -------------- ------------------------ -----------------------------------
  **Function     onOpen                   setupProductionDbTabs
  Name**                                  

  **What it      Initializes the \"Candid Creates/Repairs the required tab
  does**         Production\" custom      structure for the Production
                 menu.                    database.

  **Inputs**     N/A                      N/A

  **Outputs**    N/A                      Multiple System Tabs

  **Location**   Production DB            Production DB

  **SLA for VA   High (UI Requirement)    Low (Setup/Utility)
  Use**                                   
  ---------------------------------------------------------------------------

This comprehensive set of 37 cards now represents the final and complete
documentation package for the **Candid Labs Script Library**.
