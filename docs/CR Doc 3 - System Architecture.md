# CDoc 3 --- Candid Labs System Architecture

## 1. Purpose

Establishes a clear, complete, and accurate description of how Candid
Labs' data, automation, and reporting systems operate. It defines the
ecosystem end‑to‑end: inputs, pipelines, databases, outputs, governance,
and future scalability.

## 2. High‑Level Architecture Overview

Candid Labs operates a **two‑database architecture** (Production DB +
Sales DB) connected by a shared set of data standards, pipeline rules,
and governance controls. All systems feed a unified reporting layer
(Looker + Monthly Decks + NotebookLM knowledge base).

### Core Components

-   **Data Sources**

    -   Xero (financial source of truth)

    -   KMI (production, RM, packaging, FG shipments)

    -   Distributor sales reports (SKD, others)

    -   Manual inputs (internal mapping, overrides, metadata)

-   **Pipelines**

    -   Google Apps Script transformations: cleaners → normalisers →
        > rebuilders

-   **Databases**

    -   Production DB (Procurement, Payables, Production, FG, Inventory)

    -   Sales DB (Receivables, Sales Revenue Master, Mapping, Account
        > Tracking, Status)

-   **Output Systems**

    -   Looker dashboards (operational + financial views)

    -   Monthly Reporting Pack

    -   NotebookLM (knowledge consolidation for insight generation)

-   **Governance Layer**

    -   Access rules, naming standards, QA checks, version control

## 3. Data Sources

Each source enters the system with defined expectations on structure,
ownership, and refresh behaviour.

### 3.1 Xero Financial Data

-   **Owner:** Finance / Accountants

-   **Refresh:** Monthly (or ad‑hoc for corrections)

-   **Format:** CSV export

-   **Reports used:**

    -   Payable Invoice Detail (Production DB)

    -   Receivable Invoice Detail (Sales DB)

-   **Role:** Financial system of record. Values are not overridden.

### 3.2 KMI Production Data

-   **Owner:** KMI

-   **Refresh:** Variable, depending on production schedule

-   **Reports:**

    -   Production Runs

    -   RM Usage

    -   Packaging Usage

    -   FG Summary

    -   FG Shipments

-   **Role:** Defines manufacturing output, COGS drivers, and stock
    > flows.

### 3.3 Distributor Sales Data (SKD)

-   **Owner:** Sales + Distributor

-   **Refresh:** Monthly

-   **Format:** Excel/CSV

-   **Role:** Critical for account‑level performance tracking.

### 3.4 Manual Inputs

-   Mapping tables

-   Overrides

-   Metadata for Looker

-   Channel/market/grouping rules

## 4. Databases (Google Sheets Backbone)

### 4.1 Production DB

Purpose: Transform KMI and Xero payable data into clean, structured
tables for COGS, production planning, and stock visibility.

Key Tabs:

-   PAYABLE_DETAIL_RAW / CLEAN

-   KMI RM / Packaging Raw

-   Production Runs Clean

-   KMI FG tables (Batch, Shipments, Summary)

-   Stock Movements

-   Stock Summary

Key Scripts:

-   Payables cleaner

-   Purchases summary builder

-   Production runs cleaner

-   Shipments + FG builders

-   Stock movement + stock summary generators

### 4.2 Sales DB

Purpose: Transform customer invoicing + mapping logic into a unified
revenue dataset.

Key Tabs:

-   RECEIVABLE_DETAIL_RAW / CLEAN

-   SALES_REVENUE_MASTER

-   CONFIG_MAPPING / CONFIG_CONSTANTS

-   ACCOUNT_TRACKING / ACCOUNT_STATUS

-   DORMANT_ACCOUNTS

Key Scripts:

-   Receivables cleaner

-   Revenue master builder

-   Mapping sync tools

-   Account status snapshot

-   Dormancy checker

## 5. Automations & Pipelines

All pipelines follow a consistent pattern: **Import → Clean → Rebuild →
QA → Output**.

### 5.1 Receivables Pipeline (Sales DB)

-   Source: Xero Receivable Invoice Detail

-   Scripts:

    -   cleanReceivableDetailRaw()

    -   rebuildSalesRevenueMasterFromReceivables()

-   Output: SALES_REVENUE_MASTER (clean revenue data)

### 5.2 Payables Pipeline (Production DB)

-   Source: Xero Payable Invoice Detail

-   Scripts:

    -   cleanPayableDetailRaw()

    -   buildPurchasesSummaryFromPayables()

-   Output: Purchases summary + RM/Packaging cost alignment

### 5.3 KMI FG Pipeline

-   Source: KMI FG + production data

-   Scripts:

    -   buildKmiFgBatchClean()

    -   buildKmiFgShipmentsRaw()

    -   buildKmiFgStockSummary()

-   Output: Batch‑level visibility + All FG movement

### 5.4 Stock Movement Pipeline

-   Calculates full stock flow end‑to‑end

-   Uses inputs from Purchases, Production, Shipments, and Sales

### 5.5 Mapping + Config Pipeline

-   Scripts keep mapping current and validated:

    -   syncVenueMappingFromAccountTracking()

    -   generateMissingAccountIDs()

    -   rebuildConfigLists()

    -   applyMappingValidations()

## 6. Data Models (Final Table Definitions)

Each core table uses consistent naming, ordering, and logic.

### SALES_REVENUE_MASTER

  -----------------------------------------------------------------------
  **Field**                           **Description**
  ----------------------------------- -----------------------------------
  Transaction_ID                      Unique key YYYYMMDD‑####

  Invoice_Date                        Parsed from Xero

  Invoice_Number                      Xero invoice reference

  Distributor_Name                    Xero customer name

  Internal_Venue_Name                 From mapping

  Account_ID                          Unique account ID

  SKU_Name                            Product line description

  Quantity_Cases                      Quantity/24

  Quantity_Cans                       Raw quantity

  Invoice_Value_IDR                   Xero Invoice Total IDR

  Revenue_IDR                         Same as invoice value

  Market                              Mapping field

  City                                Mapping field

  Channel                             Mapping field

  Group_Name                          Mapping field
  -----------------------------------------------------------------------

### Purchases Summary

Aggregated view of procurement cost drivers.

### Stock Summary

FG stock on hand by SKU, warehouse, and date.

### Account Tracking & Status

Tracks historical sales behaviour and venue health.

## 7. Output Layers

### 7.1 Looker Dashboards

-   Operational metrics

-   Financial visibility

-   Account performance

-   Distributor effectiveness

### 7.2 Monthly Reporting Pack

-   High‑level performance story

-   Financial summary

-   Operational efficiency metrics

-   Top risks & actions

### 7.3 NotebookLM

-   Acts as the "single source of narrative truth"

-   Receives structured documents (CDocs)

-   Enables automated draft decks, video scripts, summaries

## 8. Governance & Security

### 8.1 Folder Structure

-   Candid Labs → Production DB → scripts, raw, clean

-   Candid Labs → Sales DB → scripts, raw, clean

-   CDoc library → versioned

### 8.2 Version Control

-   All CDocs saved using semantic versioning (v1.0, v1.1, etc.)

-   Updates logged in a CHANGELOG tab (future enhancement)

### 8.3 QA Processes

-   TAB STRUCTURE sheet for ongoing schema verification

-   Header freeze + protection rules

-   Validation layers in CONFIG_CONSTANTS

### 8.4 Access

-   Restricted edit rights for core DB

-   VA‑friendly tools for safe operations

## 9. Future Extensions

-   Direct API ingestion from Xero & KMI

-   Automated distributor sales ingestion

-   ML forecasting for demand & procurement

-   SKU profitability modelling

## 10. Appendices

-   Appendix A --- System Architecture Diagram (to be added)

-   Appendix B --- Script Index

-   Appendix C --- Data Dictionary
