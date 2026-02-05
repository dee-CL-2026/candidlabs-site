## **Strategy -- Global Sheet Auditor -- Spec v1.0**

Status: Draft -- Foundation Phase

### **1) Purpose**

Create a canonical, repeatable audit that:

-   **Runs from the Sovereign Menu** on any authorised spreadsheet

-   Writes a **local snapshot** into the active spreadsheet (latest
    > state)

-   Writes a **central log** into **Control Centre** (history +
    > consolidation)

-   Enables architecture decisions (RAW/CLEAN/CURATED separation, Looker
    > readiness, bloat risk) using **objective metrics**, without
    > exporting large datasets.

### **2) Non-Goals (v1.0)**

-   No refactors of existing DB logic or sheet layouts

-   No automatic splitting of RAW/CLEAN into separate spreadsheets

-   No Looker dashboard build

-   No permission hardening beyond standard GAS constraints ("runs as
    > user")

-   No replacement/deletion of existing TAB STRUCTURE / ANALYSER_OUTPUT
    > utilities yet (coexistence only)

### **3) Scope**

Two entry points (menu actions):

1.  **Audit This Spreadsheet (Local + Central)\
    > **

    -   Audits active spreadsheet tabs

    -   Writes local output to that spreadsheet

    -   Appends central outputs to Control Centre

2.  **Audit All Registered Spreadsheets (Central only + optional
    > per-sheet)\
    > **

    -   Reads registry from Control Centre

    -   Audits each enabled spreadsheet ID

    -   Writes to Control Centre (always)

    -   Optional per-sheet local write can be enabled later; default off
        > in v1.0 to reduce runtime/quota risk

### **4) Tooling placement (Hub/Spoke compliance)**

-   **Canonical audit logic lives in Hub** (candid-labs-core-os)

-   Spokes/sheets only provide authorised UI entry points (Sovereign
    > Menu installation and dispatcher calls)

-   No "orphan" one-off scripts

### **5) Sources of Truth / IDs**

-   Control Centre Spreadsheet ID:
    > **1M4HjoWzsO1PeXL6O17J0BsDGzNsOxKGtVIQs_kpYu9E** (confirmed via
    > constants.js)

-   Existing Control Centre tab: **Tab Analysis Log** (populated;
    > retained as run header log)

### **6) Outputs**

#### **6.1 Local outputs (Active spreadsheet)**

Two tabs (created if missing):

1.  **\_TAB_AUDIT** (latest run, per-tab detail)

-   Overwritten each run (single latest snapshot)

-   One row per tab

2.  **\_TAB_AUDIT_RUN** (latest run header)

-   Overwritten each run (single latest run header)

-   1--10 rows; human-readable summary + run identifiers

Local outputs coexist with legacy tabs:

-   TAB STRUCTURE (legacy snapshot)

-   ANALYSER_OUTPUT (legacy permissions snapshot) No changes to those in
    > v1.0.

#### **6.2 Central outputs (Control Centre)**

Three tabs total (1 existing + 2 additions):

1.  **Existing:** Tab Analysis Log\
    > Retained and appended (one row per run).\
    > This becomes the canonical **run header history**.

2.  **New:** Tab Analysis Detail\
    > Appended (many rows per run; one row per tab).\
    > This is the canonical **tab-level dataset**.

3.  **New:** Spreadsheet Registry\
    > Input table listing spreadsheets to audit.

### **7) Central schemas**

#### **7.1 Spreadsheet Registry (Control Centre)**

Header row (row 1), data starts row 2:

-   Audit Enabled (TRUE/FALSE)

-   Spreadsheet Name (text)

-   Spreadsheet ID (text)

-   Area (text; e.g., Sales, Production, Finance, Platform)

-   Owner (text; e.g., VA, System, Finance)

-   Notes (text)

-   Last Audit Timestamp (datetime; populated by script)

-   Last Audit Run ID (text; populated by script)

-   Last Audit Status (text; SUCCESS/FAIL/SKIPPED; populated by script)

#### **7.2 Tab Analysis Log (Control Centre) -- run header (append)**

If existing columns differ, do not break current structure. v1.0 adds
columns only if missing (appended to right). Target columns:

-   Run ID

-   Timestamp (ISO or sheet datetime)

-   Triggered By (user email if available; else "unknown")

-   Mode (THIS_SHEET \| ALL_REGISTERED)

-   Spreadsheet Name

-   Spreadsheet ID

-   Total Tabs

-   Total Used Cells (sum across tabs)

-   Max Rows (max lastRow)

-   Max Cols (max lastCol)

-   Total Formula Cells

-   Formula % (overall) (formulaCells/usedCells)

-   Volatile Functions Found (comma list, deduped)

-   Scan Truncated (TRUE/FALSE)

-   Notes (free text; optional)

#### **7.3 Tab Analysis Detail (Control Centre) -- per-tab detail (append)**

One row per tab per run:

-   Run ID

-   Timestamp

-   Spreadsheet Name

-   Spreadsheet ID

-   Tab Name

-   Tab Index (position)

-   Last Row

-   Last Col

-   Used Cells (lastRow\*lastCol)

-   Has Data (TRUE/FALSE)

-   Formula Cells

-   Formula %

-   Uses IMPORTRANGE (TRUE/FALSE)

-   Uses QUERY (TRUE/FALSE)

-   Uses ARRAYFORMULA (TRUE/FALSE)

-   Uses INDIRECT/OFFSET (TRUE/FALSE)

-   Uses Volatile (NOW/TODAY/RAND) (TRUE/FALSE)

-   Volatile Functions Found (comma list)

-   Top Formula Signatures (optional v1.0-lite; can be blank)

-   Scan Truncated (TRUE/FALSE)

-   Error (blank if none)

### **8) Audit logic (what is measured)**

Per tab:

1.  lastRow, lastCol

2.  usedCells = lastRow \* lastCol

3.  formulaCells by scanning formulas in used range via batch read

4.  formulaPct

5.  Function flags via pattern scanning within formulas:

    -   IMPORTRANGE

    -   QUERY

    -   ARRAYFORMULA

    -   FILTER

    -   INDIRECT

    -   OFFSET

    -   NOW, TODAY, RAND, RANDBETWEEN

6.  "Empty sheet" handling:

    -   if lastCol = 0 or lastRow = 0 → mark Has Data = FALSE and skip
        > formula scan

### **9) Performance and quota constraints**

#### **9.1 Cell-scan caps**

Formula scanning can be expensive on very large ranges. v1.0 must
include a cap:

-   MAX_CELLS_TO_SCAN_PER_TAB (configurable; default e.g. 200,000 cells)

-   If a tab exceeds cap:

    -   scan only the first N rows needed to keep within cap

    -   set Scan Truncated = TRUE

    -   record in both local + central outputs

#### **9.2 Batch I/O rules**

-   No per-cell calls

-   Single getFormulas() call per scanned range

-   Build arrays in memory, then one setValues() per output block

#### **9.3 "Audit all" batching**

For ALL_REGISTERED:

-   Process in batches (configurable, e.g., 5--10 spreadsheets/run)

-   Store cursor in PropertiesService:

    -   last processed row index in Spreadsheet Registry

-   If runtime limit approaches:

    -   persist cursor and exit gracefully

    -   next run continues

v1.0 acceptable alternative: start with "audit all" limited to first N
enabled sheets (explicitly documented) and expand batching in v1.1.

### **10) Sovereign Menu integration (UI spec)**

Under Sovereign Menu → OS Audits:

-   Audit This Spreadsheet

    -   runs audit for active sheet

    -   writes \_TAB_AUDIT, \_TAB_AUDIT_RUN

    -   appends to Control Centre logs

    -   alerts user with summary + run id

-   Audit All Registered Spreadsheets

    -   reads Spreadsheet Registry enabled rows

    -   writes only to Control Centre (v1.0 default)

    -   alerts user with "started" + "completed" summary (or "partial;
        > resume needed")

### **11) Governance / coexistence with legacy tools**

-   Legacy utilities remain callable but are not promoted in Sovereign
    > Menu going forward.

-   v1.0 does not delete or rename:

    -   TAB STRUCTURE

    -   ANALYSER_OUTPUT

-   v1.1+ may:

    -   deprecate old menu items

    -   optionally regenerate TAB STRUCTURE format for backwards
        > compatibility

### **12) Acceptance criteria (definition of done)**

#### **For "Audit This Spreadsheet"**

-   Creates/updates \_TAB_AUDIT and \_TAB_AUDIT_RUN

-   Appends a new run to Tab Analysis Log in Control Centre

-   Appends per-tab rows to Tab Analysis Detail

-   Run ID matches across local + central outputs

-   Handles empty tabs without errors

-   Completes within Apps Script runtime for a typical DB sheet

#### **For "Audit All Registered"**

-   Reads registry correctly and respects Audit Enabled

-   Appends logs and details to Control Centre for processed sheets

-   If batching/cursor is implemented: can resume without duplication

-   Fails gracefully on permission errors:

    -   writes status + error field

    -   continues with next sheet

## **Immediate next setup steps (no code yet)**

1.  In Control Centre, create the new tabs:

    -   Spreadsheet Registry

    -   Tab Analysis Detail

2.  Add headers exactly as specified above.

3.  Add at least 3 spreadsheets into the registry (enabled = TRUE) for
    > initial test:

    -   one small sheet

    -   one medium DB

    -   one large DB (production or sales)

If you want, the next thing I can do is produce the **header rows
formatted exactly** for copy-paste into those two new Control Centre
tabs.
