# CR Doc 5 --- SOP Library --- v0.9 (DRAFT)

**Document Status:** DRAFT - Compiled for Time-to-Deployment
Acceleration

**Owner:** Candid Labs

**Last Updated:** Nov 2025

### MANDATE FOR FUTURE REVIEW

This document comprises the five initial required Standard Operating
Procedures (SOPs) as defined in Section 6 of the Master Index &
Documentation Map: Sales DB Refresh, Production DB Refresh, Looker
Upload, Monthly Reporting Pack, and Change Control.

**This compiled version (v0.9) is a draft and requires formal internal
review and finalization before being tagged v1.0**.

**Immediate Action Required (Prior to v1.0 Approval):**

1.  **Validation:** Review each SOP\'s Step-by-step Instructions against
    > the live Apps Script code and the formalized 1-Click Pipeline
    > definitions (Section 4).

2.  **Compliance Check:** Verify that the \'Validation Checklist\' and
    > \'Common Errors\' sections for each SOP are complete and adhere to
    > the latest QA Framework (CLDoc 4).

3.  **Final Formatting:** Ensure the document adheres to the strict
    > governance rules for Naming Conventions and Formatting prior to
    > archival and submission to the NotebookLM Knowledge Base.

Once reviewed and finalized, the version must be incremented to
**v1.0**.

## 1. Sales DB -- VA Refresh SOP

  -------------------------------------------------------------------------
  **Document    **Sales DB -- VA    **Version**   **v1.0**
  Name**        Refresh SOP**                     
  ------------- ------------------- ------------- -------------------------
  **Owner**     Candid Labs         **Review      Monthly / Upon Major
                                    Cadence**     Schema Change

  -------------------------------------------------------------------------

**Purpose:** To execute the standardized, one-click process for
transforming raw Xero receivable data into the clean, analysis-ready
dataset required for Looker and Monthly Reporting.

**Pre-requisites:**

1.  The Xero Receivable Invoice Detail report must be exported in CSV
    > format.

2.  The VA must have access to the **CANDID LABS SALES & FINANCE DB**
    > (Sales DB) and the corresponding Apps Script project.

3.  The previous month\'s SALES_REVENUE_MASTER must be successfully
    > archived (if required by month-end process).

**Step-by-step Instructions:**

1.  Open the Sales DB Google Sheet file.

2.  Paste the **Xero Receivable Invoice Detail** export directly into
    > the RECEIVABLE_DETAIL_RAW tab, starting at Row 2.

3.  Access the custom menu: **Sales DB Tools**.

4.  Select the **"✨ Run All Sales Tools"** option.

5.  Wait for the script execution to complete. This single action
    > executes the full Sales Pipeline, which automatically performs:

    -   cleanReceivableDetailRaw() (RAW \$\\rightarrow\$ CLEAN
        > receivables).

    -   rebuildSalesRevenueMasterFromReceivables() (CLEAN
        > \$\\rightarrow\$ SALES_REVENUE_MASTER).

    -   runConfigToolsRefresh() (Rebuild mappings & validations).

    -   rebuildAccountStatus() and checkDormantAccounts().

    -   Freeze and protect headers.

**Validation Checklist:**

-   Verify the SALES_REVENUE_MASTER total revenue against the official
    > Xero Aged Receivables report total.

-   Run the TAB STRUCTURE Checker to confirm no column schema changes
    > occurred.

-   Check the DORMANT_ACCOUNTS table to ensure customers flagged as
    > Dormant or Lost align with expectations.

-   Confirm the script logged the counts of processed and skipped rows.

**Common Errors:**

-   **RAW exports pasted incorrectly:** The control is the CLEAN script
    > validation and header lock. The VA should ensure data is pasted
    > starting at Row 2.

-   **Mapping errors:** This is controlled by the automated
    > runConfigToolsRefresh() and applied validation rules. If errors
    > persist, flag unknown customers for manual mapping.

## 2. Production DB -- VA Refresh SOP

  -------------------------------------------------------------------------
  **Document   **Production DB -- VA  **Version**   **v1.0**
  Name**       Refresh SOP**                        
  ------------ ---------------------- ------------- -----------------------
  **Owner**    Candid Labs            **Review      Monthly / Upon Major
                                      Cadence**     Schema Change

  -------------------------------------------------------------------------

**Purpose:** To execute the one-click process for importing KMI and Xero
payable data to build the COGS, production planning, and stock
visibility tables.

**Pre-requisites:**

1.  The Xero Payable Invoice Detail export is ready.

2.  The KMI Reports (Production Runs, RM Usage, FG Shipments) are ready
    > for import.

3.  The VA has access to the **CANDID LABS COGS & PRODUCTION DB**
    > (Production DB).

**Step-by-step Instructions:**

1.  Open the Production DB Google Sheet file.

2.  Paste the raw Xero Payable Invoice Detail into the
    > PAYABLE_DETAIL_RAW tab.

3.  Import all required KMI reports into their respective RAW tabs
    > (e.g., KMI RM / Packaging Raw).

4.  Access the custom menu (or run the orchestrator function):
    > **Production DB Tools → "runAllProductionTools()"**.

5.  Wait for the script execution to complete. This single action
    > executes the full Production Pipeline, which automatically
    > performs:

    -   Import and clean KMI reports (importKmiRmRaw(),
        > buildProductionRunsClean()).

    -   Clean payable detail (cleanPayableDetailRaw()) and build
        > purchases summary.

    -   Build all Finished Goods (FG) and Production tables
        > (buildKmiFgBatchClean(), buildKmiFgStockSummary()).

    -   Build the stock summary (buildStockSummary()).

    -   Lock headers.

**Validation Checklist:**

-   Cross-check the generated Purchases Summary against the official
    > Xero Payables report.

-   Verify that batch totals match expected FG stock movement.

-   Run the TAB STRUCTURE Checker using the Production DB utility to
    > verify schema integrity.

**Common Errors:**

-   **Production logic tabs accidentally overwritten:** Production logic
    > tabs are **edit-protected** by the Governance Layer.

-   **Schema changes unrecognized:** The TAB STRUCTURE Checker should
    > identify and report unexpected schema changes.

## 3. Looker Upload SOP

  ------------------------------------------------------------------------
  **Document Name**   **Looker Upload SOP**  **Version**        **v1.0**
  ------------------- ---------------------- ------------------ ----------
  **Owner**           Candid Labs            **Review Cadence** Monthly

  ------------------------------------------------------------------------

**Purpose:** To ensure the Looker dashboards receive the latest
validated data from both Sales DB and Production DB, maintaining the
integrity of the unified reporting layer.

**Pre-requisites:**

1.  **Sales DB Refresh SOP** must be completed successfully
    > (SALES_REVENUE_MASTER is ready).

2.  **Production DB Refresh SOP** must be completed successfully (Stock
    > Summary/COGS data is ready).

3.  Manual financial consistency checks must be completed successfully
    > (Financial Consistency Check, Mapping Review).

**Step-by-step Instructions:**

1.  Log into the Looker Studio environment.

2.  Force a data refresh on the main data sources connected to the Sales
    > DB (SALES_REVENUE_MASTER, ACCOUNT_STATUS) and Production DB (Stock
    > Summary, Purchases Summary).

3.  Review the four core dashboard pages (Executive Summary, Account
    > Health, SKU Review, Financial Health).

4.  Perform the **Looker Refresh Review** (Manual QA Process).

**Validation Checklist:**

-   Confirm the dashboard loads without error.

-   Verify that the key monthly metric totals (e.g., total Revenue,
    > Inventory Value, AR) shown on the dashboard match the totals
    > confirmed in the DB output files.

-   Ensure that Looker is pulling only **final cleaned tables**, never
    > RAW imports.

**Common Errors:**

-   **Inconsistent Numbers:** This is controlled by using the
    > SALES_REVENUE_MASTER as the single authoritative source for
    > revenue metrics. If numbers differ, the DB is the source of truth,
    > and the Looker connection must be debugged.

## 4. Monthly Reporting Pack SOP

  -------------------------------------------------------------------------
  **Document       **Monthly Reporting Pack     **Version**      **v1.0**
  Name**           SOP**                                         
  ---------------- ---------------------------- ---------------- ----------
  **Owner**        Candid Labs                  **Review         Monthly
                                                Cadence**        

  -------------------------------------------------------------------------

**Purpose:** To assemble the final Monthly Reporting Pack (10-slide
deck) and generate associated automated assets for internal and
shareholder communication.

**Pre-requisites:**

1.  **Looker Upload SOP** must be complete, confirming all data is
    > validated and loaded.

2.  The unified reporting layer has generated the necessary output data.

3.  The NotebookLM Knowledge Base has been updated with the latest CDocs
    > and summaries.

**Step-by-step Instructions:**

1.  Access the template file for the **Monthly Reporting Pack**.

2.  Run the necessary automation scripts (e.g., those using SlidesApp)
    > to replace placeholders like {{MONTHLY_REVENUE}} with actual
    > figures sourced from the DB.

3.  Generate the required Auto-Generated Assets, such as infographics or
    > short video summaries (via GPT/Sora workflow).

4.  Review the content for the defined sections: Executive summary,
    > Volume + revenue analysis, Account health summary, etc..

5.  Upload the updated documentation (CDocs) to NotebookLM to assist in
    > draft narratives and insights generation.

**Validation Checklist:**

-   Confirm all financial metrics and operational figures match the
    > validated data in the Looker dashboards and the DB outputs.

-   Ensure the deck follows the required 10-slide structure and includes
    > the mandatory sections.

**Common Errors:**

-   **Narrative inconsistency:** Rely on NotebookLM, which receives
    > structured CDocs and summaries, acting as the \"single source of
    > narrative truth\" to maintain consistency.

## 5. Change Control SOP

  -------------------------------------------------------------------------
  **Document   **Change Control SOP     **Version**   **v1.0**
  Name**       (Versioning Rules)**                   
  ------------ ------------------------ ------------- ---------------------
  **Owner**    Candid Labs              **Review      Upon any
                                        Cadence**     Schema/Process Change

  -------------------------------------------------------------------------

**Purpose:** To define the process for managing and documenting all
changes, updates, and versions across the documentation (CDocs),
scripts, and database schema, adhering to the versioning policy.

**Pre-requisites:**

1.  A change, fix, or update has been planned and approved.

2.  The document owner must be identified.

3.  The change is necessary for security, scalability, or governance.

**Step-by-step Instructions:**

1.  Determine the type of change using the **Versioning Rules**:

    -   **Minor Update (e.g., v1.0 \$\\rightarrow\$ v1.1):** Used for
        > small text updates or bug fixes that do not change the
        > underlying data structure or process.

    -   **Major Update (e.g., v1.1 \$\\rightarrow\$ v2.0):** Used for a
        > process change, schema change, or introduction of a new
        > pipeline.

2.  Update the document name using the strict format: **\[CDoc #\] -
    > Name - vX.X - YYYYMMDD**.

3.  Apply the change (in the script or schema) and run the TAB STRUCTURE
    > Checker to verify that schema consistency is maintained.

4.  Record all changes in a designated CHANGELOG section (or tab).

5.  Archive the previous version of the document in the /Candid Labs
    > Archive folder. **Old versions are archived, not deleted**.

6.  Upload the new version of the document (CDoc) to the NotebookLM
    > knowledge base, ensuring the source strategy requirements are met.

**Validation Checklist:**

-   Is the new version number correct (vX.X)?.

-   Has the old version been archived in the /Archive folder?.

-   Are the new fields compliant with the Naming Conventions (PascalCase
    > for columns, UPPERCASE_WITH_UNDERSCORES for tabs)?.

-   Has the updated document been uploaded to NotebookLM?.

**Common Errors:**

-   **Deleting previous versions:** All old versions must be archived to
    > maintain traceability.

-   **Non-compliant naming:** All governance rules, including naming
    > conventions, must be enforced during schema changes.
