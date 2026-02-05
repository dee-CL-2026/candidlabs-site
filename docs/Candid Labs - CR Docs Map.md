# 

# Candid Labs --- Master Index & Documentation Map (v1.0)

This document defines the structure of all Candid Labs documentation.\
Every document created going forward must follow this hierarchy.

## 1. STRATEGIC OVERVIEW

### 1.1 Candid Labs Overview

Purpose, mission and scope of Candid Labs as the internal data,
automation and reporting engine for Candid.

### 1.2 Core Pillars

-   **Data Ingestion**

-   **Data Normalisation**

-   **Data Enrichment**

-   **Database Output**

-   **Reporting & Insights**

-   **Automated Assets (Decks / Infographics / Video)**

### 1.3 System Architecture Map

High-level diagram showing:

-   Source systems (Xero, Unleashed, KMI, manual files).

-   Processing engines (Apps Script pipelines).

-   Databases (Sales DB, Production DB).

-   Output layers (Looker dashboards, reporting decks, assets).

## 2. DATABASES

### 2.1 Sales DB

-   Purpose

-   Data sources

-   Key scripts

-   Output tabs

-   Dependencies (mapping, constants, statuses)

### 2.2 Production DB

-   Purpose

-   Data sources

-   Key scripts

-   Output tabs

-   Dependencies (KMI FG/RM/PKG reports, Stock movements)

## 3. SCRIPT LIBRARY

All scripts grouped by functional area.

### 3.1 Sales DB Scripts

-   Clean Receivable Detail (RAW → CLEAN)

-   Build Sales Revenue Master

-   Config refresh tools (mapping, constants, tracking)

-   Account status + Dormant logic

-   Header protection tools

### 3.2 Production DB Scripts

-   KMI ingestion & cleaning

-   Production runs parser

-   FG stock builder

-   Stock movement summariser

-   Header protection tools

### 3.3 Common Utilities

-   Tab creation utilities

-   Header analyser (TAB STRUCTURE)

-   Reset tools

-   Logging standards

Each script will receive its own **Script Definition Card**:

-   What it does

-   Inputs

-   Outputs

-   Location

-   Known issues

-   SLA for VA use

## 4. PIPELINES (END-TO-END WORKFLOWS)

### 4.1 Sales Pipeline (1-Click)

-   Clean receivables

-   Build revenue master

-   Refresh mapping + config

-   Rebuild status + dormant

-   Lock headers

### 4.2 Production Pipeline (1-Click)

-   Import KMI reports

-   Build all FG + Production tables

-   Build stock summary

-   Lock headers

### 4.3 Cross-Database Touch-Points

-   SKU constants

-   Distributor mapping

-   Shared calendar triggers (if added later)

## 5. REPORTING LAYER

### 5.1 Looker Dashboards (v2.0)

-   Sales performance

-   Account health

-   Volume breakdown

-   Production & stock

-   FG vs RM variances

-   Distributor scorecards

### 5.2 Monthly Reporting Pack

-   Executive summary

-   Key market insights

-   Volume + revenue analysis

-   Account health summary

-   Production summary

-   Distributor performance

-   Forecasts & risks

### 5.3 Auto-Generated Assets

-   Infographics

-   Data-driven slides

-   Short video summaries (via GPT/Sora workflow)

-   Future: Auto-email reports

## 6. SOP LIBRARY

Each SOP follows the Candid Labs template with:

-   Purpose

-   Pre-requisites

-   Step-by-step instructions

-   Validation checklist

-   Common errors

-   Review cadence

Initial required SOPs:

1.  **Sales DB -- VA Refresh SOP**

2.  **Production DB -- VA Refresh SOP**

3.  **Looker Upload SOP**

4.  **Monthly Reporting Pack SOP**

5.  **Change Control SOP** (versioning rules)

## 7. VERSIONING POLICY

### 7.1 Format

\[CDoc #\] - Name - vX.X - YYYYMMDD

### 7.2 Rules

-   v1.0 = first approved version

-   Minor = 1.1 → small text updates

-   Major = 2.0 → process change

-   Old versions archived in /Archive folder

## 8. KNOWLEDGE BASE / NOTEBOOKLM SETUP

### 8.1 Folder Structure

-   /Candid Labs Docs

-   /Candid Labs Scripts

-   /Candid Labs Sources

-   /Candid Labs Archive

### 8.2 NotebookLM Source Strategy

-   Group docs into **logical bundles**

-   Use **clean, consistent formatting**

-   Include **reference infographics**

-   Refresh sources monthly

## 9. FUTURE DEVELOPMENT ROADMAP

-   API integrations (Unleashed/Xero if opened)

-   Automated distributor reporting

-   Daily micro-dashboards via WhatsApp

-   AI-assisted anomaly detector

-   Self-healing data models

## 10. MASTER INDEX (LIVE)

List of all active documents maintained monthly:

-   Document name

-   Version

-   Last updated

-   Owner

-   Link

-   Notes
