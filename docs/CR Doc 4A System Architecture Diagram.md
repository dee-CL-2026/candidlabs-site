# CDoc A --- System Architecture Diagram (Appendix A)

## 1. Purpose

This appendix provides a clear, visual, and structured representation of
the entire Candid Labs data ecosystem. It defines how data flows through
the organisation, how each component interacts, and how the two‑database
architecture (Production DB + Sales DB) connects to the reporting and
governance layers.

It includes three representations:

1.  Narrative overview

2.  System architecture diagram (logical flow)

3.  Mermaid-based diagram (NotebookLM‑friendly)

4.  Hierarchical list structure (for indexing and cross‑referencing)

## 2. Narrative Overview of the System

Candid Labs runs a fully structured data engine built on:

-   Shared standards across databases

-   Automated cleaning and transformation pipelines

-   Strict mapping and validation rules

-   A unified reporting layer (Looker, Monthly Deck, NotebookLM)

The engine operates end‑to‑end:

**Inputs → Pipelines → Databases → Reporting → Knowledge base**

### 2.1 Inputs

-   **Xero** → financial source of truth (payables + receivables)

-   **KMI** → production, RM, packaging, FG output, FG shipments

-   **Distributor sales data (SKD)** → account‑level sales behaviour

-   **Internal mapping and metadata** → CONFIG_MAPPING /
    > CONFIG_CONSTANTS

### 2.2 Pipelines

Standardised Google Apps Scripts perform:

-   Cleaning

-   Normalisation

-   Rebuilding structured tables

-   Validation

-   Mapping enrichment

### 2.3 Databases

-   **Production DB** → procurement, production, stock

-   **Sales DB** → revenue, account behaviour, mapping, status

### 2.4 Output Systems

-   Looker dashboards

-   Monthly reporting pack

-   NotebookLM knowledge base

## 3. System Architecture Diagram (Logical Flow)

**Data Sources**

-   Xero Payables

-   Xero Receivables

-   KMI Reports

-   Distributor Sales Reports

-   Mapping & Metadata

⬇

**Cleaning & Normalisation Pipelines**

-   Payable detail cleaner

-   Receivable detail cleaner

-   KMI cleaners

-   Mapping validation & enrichment tools

⬇

**Databases (Google Sheets)**

-   **Production DB**

    -   PAYABLE_DETAIL_CLEAN

    -   Purchases Summary

    -   Production Runs Clean

    -   FG Batch / FG Shipments / FG Summary

    -   Stock Movements / Stock Summary

-   **Sales DB**

    -   RECEIVABLE_DETAIL_CLEAN

    -   SALES_REVENUE_MASTER

    -   CONFIG_MAPPING / CONFIG_CONSTANTS

    -   ACCOUNT_TRACKING / ACCOUNT_STATUS

    -   DORMANT_ACCOUNTS

⬇

**Unified Reporting Layer**

-   Looker dashboards

-   Monthly Reporting Pack

⬇

**Knowledge Layer (NotebookLM)**

-   Ingests CDocs

-   Ingests combined summaries

-   Supports automated draft narratives, insights, and decks

## 4. Mermaid Diagram (NotebookLM‑Friendly)

graph TD;

A\[Xero Payables\] \--\> B\[Payable Cleaner\];

A2\[Xero Receivables\] \--\> C\[Receivable Cleaner\];

KMI\[KMI Production + FG Reports\] \--\> D\[KMI Cleaners\];

DIST\[Distributor Sales Reports\] \--\> E\[Distributor Import Process\];

MAP\[Mapping + Metadata\] \--\> F\[Validation + Mapping Sync\];

B \--\> PRODDB\[Production DB\];

D \--\> PRODDB;

C \--\> SALESDB\[Sales DB\];

E \--\> SALESDB;

F \--\> SALESDB;

PRODDB \--\> LOOKER\[Looker Dashboards\];

SALESDB \--\> LOOKER;

LOOKER \--\> MONTHLY\[Monthly Reporting Pack\];

LOOKER \--\> NLM\[NotebookLM\];

SALESDB \--\> NLM;

PRODDB \--\> NLM;

## 5. Hierarchical System Representation

**1. Data Sources**

-   Xero

    -   Payable Invoice Detail

    -   Receivable Invoice Detail

-   KMI

    -   RM Usage

    -   Packaging Usage

    -   Production Runs

    -   FG Summary

    -   FG Shipments

-   Distributor Reports

-   Internal Mapping & Metadata

**2. Pipelines**

-   Cleaners

    -   Payable cleaner

    -   Receivable cleaner

    -   KMI cleaners

-   Rebuilders

    -   Purchases summary

    -   Production runs

    -   FG batch/shipments/summary

    -   Sales revenue master

-   Validation + Mapping

    -   Config lists

    -   Mapping validations

    -   Account tracking enrichment

**3. Databases (Sheets)**

-   Production DB

-   Sales DB

**4. Output Layers**

-   Looker dashboards

-   Monthly Reports

-   NotebookLM knowledge base

## 6. Notes for Maintenance

-   Diagram must be updated if any pipeline or naming structure changes.

-   Diagram should remain versioned (CDoc A vX.X).

-   SVG/PNG export versions may be added later for inclusion in slide
    > decks.

## 7. Versioning

-   **v1.0** --- Initial system architecture created (Nov 2025)
