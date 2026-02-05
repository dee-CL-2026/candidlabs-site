# CDoc 4 --- Data Governance & QA Framework

## 1. Purpose

Defines the governance, quality assurance, and operational guardrails
that ensure Candid Labs data remains accurate, consistent, secure, and
scalable. This document sets the rules for validation, access,
structure, naming, versioning, and monthly inspection across all
systems.

## 2. Governance Principles

Candid Labs operates under five core governance standards:

### 2.1 Accuracy

All transformations must preserve financial truth (Xero) and operational
accuracy (KMI, SKD). Manual edits are minimised and audited.

### 2.2 Consistency

Naming conventions, headers, formats, and validation rules must be
identical across Production DB and Sales DB.

### 2.3 Traceability

Every value must be traceable back to a raw source, either internal or
external.

### 2.4 Security

Sensitive tabs are protected. VA-facing tools are safe to run without
exposing formulas or breaking logic.

### 2.5 Scalability

All governance rules must allow future automation (API ingestion,
expanded dashboards, ML forecasting).

## 3. Governance Scope

Governance applies to:

-   Data sources

-   Scripts and pipelines

-   Database structures (Production DB + Sales DB)

-   Mappings and constants

-   Automations

-   Reporting outputs (Looker + monthly pack)

-   Documentation and versioning

## 4. Key Governance Rules

### 4.1 Naming Conventions

**Files, tabs, and fields follow strict naming rules:**

-   Tabs: UPPERCASE_WITH_UNDERSCORES

-   Versioned documents: CDoc X --- Title --- v1.0

-   Scripts: function names in camelCase

-   Columns: PascalCase (e.g., Invoice_Date, Quantity_Cans)

### 4.2 Folder Structure Governance

All files follow this structure:

Candid Labs/

Production DB/

Raw/

Clean/

Scripts/

Sales DB/

Raw/

Clean/

Scripts/

CDoc Library/

Versioned Docs/

Archive/

### 4.3 Tab Structure Consistency

Every tab must:

-   Have headers in row 1

-   Follow the column order defined in its CDoc

-   Be included in **TAB STRUCTURE** for schema inspection

-   Be protected from row 2+ accidental overwrites

### 4.4 Script Governance

Scripts must:

-   Follow the Import → Clean → Rebuild → QA pattern

-   Include error trapping and logging

-   Never overwrite headers

-   Log counts of rows processed and skipped

-   Fail safely: skip invalid rows without crashing

### 4.5 Mapping Governance

CONFIG_MAPPING must:

-   Be maintained only through tools

-   Never be manually reordered

-   Use static Raw_Value keys

-   Pass validation rules each refresh

### 4.6 Data Validation Rules

Validation includes:

-   Dropdowns from CONFIG_CONSTANTS

-   Enforced Active/Inactive flags

-   Required fields for mapping

-   Automated QA checks after each rebuild

### 4.7 Access Control Rules

-   Production logic tabs are **edit-protected**

-   VA tabs (RAW imports) are **unprotected**

-   Only owners can update scripts

-   Version history enabled and reviewed monthly

## 5. QA Tools (Automated)

Candid Labs uses built-in QA functions across both DBs.

### 5.1 TAB STRUCTURE Checker

Checks:

-   Column positions

-   Header accuracy

-   New or missing tabs

-   Unexpected schema changes

### 5.2 Mapping Validator

Checks:

-   Missing account IDs

-   Inactive or mismatched fields

-   Missing Raw_Value keys

### 5.3 Dormancy & Account Health

Highlights venues with:

-   No sales in X days

-   Misclassification

-   Mapping inconsistencies

### 5.4 Data Integrity Checks

Ensures:

-   No duplicate transaction IDs

-   No negative revenue entries unless CN/credit

-   All statuses accepted/excluded correctly

## 6. QA Processes (Manual)

The following checks occur after each month-end close.

### 6.1 Financial Consistency Check

-   Cross-check SALES_REVENUE_MASTER total vs. Xero AR report

-   Cross-check Purchases Summary vs. Xero Payables

### 6.2 Production Consistency Check

-   Batch totals vs. FG stock movement

-   RM usage vs. expected BOM

### 6.3 Mapping Review

-   New venues auto-synced

-   Unknown customers flagged for mapping

### 6.4 Looker Refresh Review

-   Dashboard loads without error

-   All metric totals match DB outputs

## 7. Monthly Governance Cycle

1.  VA imports Xero + KMI files

2.  Run full orchestrators (Production + Sales DB)

3.  Run TAB STRUCTURE checker

4.  Run manual financial consistency checks

5.  Review LOOKER dashboards

6.  Update monthly reporting pack

7.  Update CDocs if schema changed

8.  Upload updated docs to NotebookLM

## 8. Audit & Versioning Rules

-   All CDocs use semantic versions: v1.0, v1.1, v2.0

-   All changes recorded in a CHANGELOG section

-   New versions uploaded to NotebookLM

-   Old versions archived, not deleted

## 9. Future Enhancements

-   Automated schema alerts

-   Automated reconciliation scripts

-   Warehouse-specific governance (multi-location stock)

-   Auto-ingest via API for Xero + KMI

-   ML-driven anomaly detection

## 10. Appendices

-   Appendix A --- Validation field definitions

-   Appendix B --- User roles & access rights

-   Appendix C --- Monthly Governance Checklist
