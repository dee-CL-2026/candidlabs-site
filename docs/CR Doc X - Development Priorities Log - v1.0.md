## CANDID LABS -- DEVELOPMENT PRIORITIES LOG (v1.0)

**Date:** Nov 2025

**Owner:** Candid Labs

### 1. Current Phase Focus & Immediate Deliverable

The immediate priority remains the completion of the **REPORTING LAYER**
and finalising the operational governance documents.

-   **Deliverable:** **Looker Dashboards**.

    -   This task requires the successful completion of the **Sales DB
        > Refresh SOP** and **Production DB Refresh SOP** to ensure
        > validated data is available in the final cleaned tables (e.g.,
        > SALES_REVENUE_MASTER, Stock Summary). The **Looker Upload
        > SOP** must be followed to maintain data integrity.

-   **Documentation:** Finalize **CR Doc 5 --- SOP Library** (currently
    > v0.9 DRAFT) and **Tab Structure Consistency** (CDoc F).

### 2. New Development Focus: Unleashed Ingestion Scripts

A new development priority has been introduced to generate ingestion
files for **Unleashed**. This task focuses on leveraging existing ETL
outputs to create structured output files compatible with the Unleashed
system.

-   **Task:** Create scripts to take existing ETL outputs and generate
    > ingestion files for **Unleashed**.

-   **System Context:** Unleashed is identified in the **System
    > Architecture Map** as a **Source System**. Scripts supporting new
    > output formats align with the **Database Output** or **Automated
    > Assets** core pillars.

-   **Governance Note:** This development involves creating **new
    > functions** (scripts) and potentially defining new output schemas.
    > This constitutes a **Major Update** (v1.0 \$\\rightarrow\$ v2.0)
    > under the **Change Control SOP**. Once built, these scripts must
    > be documented with their own **Script Definition Cards** (CDoc D)
    > and added to the **Script Index** (CDoc B).

### 3. Deferred Enhancement: Automated Schema Checker

The request to enhance the **TAB STRUCTURE Checker** utility by
automatically comparing the live schema against a stored baseline and
highlighting changes will be formally logged and deferred to the
**FUTURE DEVELOPMENT ROADMAP**.

-   **Enhancement:** Enhance the TAB STRUCTURE Checker (using
    > listSheetHeaders() utility) to compare the current schema against
    > a baseline and highlight discrepancies (New, Missing, Reordered
    > headers).

-   **Recording Location:** This item is officially recorded in:

    -   **CR Doc 4 --- Data Governance & QA Framework**, Section 9,
        > under **Future Enhancements** (aligned with **Automated schema
        > alerts**).

    -   **CR Doc 1 --- Master Index**, Section 9, **FUTURE DEVELOPMENT
        > ROADMAP** (aligned with **API integrations (Unleashed/Xero if
        > opened)** and other major features).

-   **Rationale:** The existing utility verifies header accuracy and
    > column position, but the comparison logic is an enhancement that
    > is correctly deferred to prioritise the **Looker Dashboards**
    > output.

### 4. Source Management Strategy

To ensure traceability of this development shift, this document is saved
in the CDoc library and will be referenced in the **MASTER INDEX
(LIVE)**. Saving this as a separate Drive file source is compliant with
the **Knowledge Base / NotebookLM Setup** which mandates using clean,
consistently formatted sources for knowledge consumption.
