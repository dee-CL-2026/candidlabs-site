# 

# 

# CDoc 7 --- Monthly Partner Deck Template (10--20--30 Format)

This document defines the **master slide structure** for Candid's
monthly partner reporting. It provides exact content guidance for each
slide, notes on source data, and rules for narrative consistency. All
monthly reports must follow this template.

## 1. Purpose

Provide a consistent, governance-aligned, 10--20--30 executive reporting
deck for partners. The deck focuses on key insights, business health,
and strategic guidance---not operational noise.

## 2. Slide Structure (10 Slides)

Each slide includes: objective, mandatory content, data sources, and
narrative rules.

### **Slide 1 --- Executive Summary**

**Objective:** Present the month in one slide.

-   3 Wins

-   3 Challenges

-   3 Actions taken / required

-   Overall business health statement (traffic light: Green / Amber /
    > Red) **Data Sources:** Manual narrative + Sales DB + Production DB
    > **Notes:** Should be written by CEO only.

### **Slide 2 --- Revenue Pulse**

**Objective:** Show topline revenue performance clearly.

-   Monthly revenue (IDR)

-   MoM change (%)

-   YTD revenue vs target

-   Mini trendline (last 6 months) **Data Sources:**
    > SALES_REVENUE_MASTER, Looker

### **Slide 3 --- SKU Mix Pulse**

**Objective:** Show which SKUs drive growth.

-   Volume by SKU (cans + cases)

-   Revenue by SKU

-   Mix change vs previous month **Data Sources:** SALES_REVENUE_MASTER

### **Slide 4 --- Distributor Performance**

**Objective:** Provide a quick view of partner contributions.

-   Sales by distributor

-   \% share of total

-   Growth vs last month **Data Sources:** SALES_REVENUE_MASTER

### **Slide 5 --- Key Account Movements**

**Objective:** Highlight account-level win/loss signals.

-   Top 5 gains

-   Top 5 declines

-   Notable new listings / lost listings **Data Sources:**
    > ACCOUNT_TRACKING, ACCOUNT_STATUS

### **Slide 6 --- Commercial & Marketing Highlights**

**Objective:** Summarise outward-facing progress.

-   Major campaigns / PR

-   Sales initiatives

-   Pipeline opportunities

-   Partnership updates **Data Sources:** Manual + Marketing logs

### **Slide 7 --- Operations & Supply Chain**

**Objective:** Show readiness, stability, and risks.

-   Production runs completed

-   Inventory status (cases per SKU)

-   Supplier updates (RM, packaging)

-   Quality / efficiency notes **Data Sources:** Production DB (All KMI
    > tables + Stock Summary)

### **Slide 8 --- Cash & Financial Position**

**Objective:** Provide financial risk visibility without recreating a
P&L.

-   Cash position

-   Outstanding receivables (top 5) & ageing

-   Outstanding payables (top 5) & ageing

-   High-level runway estimate **Data Sources:** Finance (Xero) + Sales
    > DB + Production DB

### **Slide 9 --- Strategic Priorities**

**Objective:** Track progress on long-term goals.

-   Top 3--5 strategic projects

-   RAG status

-   Risks / mitigations

-   Timeline snapshot **Data Sources:** Manual + CEO inputs

### **Slide 10 --- Focus for Next Month**

**Objective:** Convert insights into actions.

-   3 commercial targets

-   3 operational/production targets

-   3 strategic priorities

-   Owner (person) + due date **Data Sources:** Manual

## 3. Appendices (Optional)

These should only be attached when necessary.

### **Appendix A --- Detailed Financials**

-   Revenue tables

-   SKU margin summaries

-   Distributor-level breakdowns **Source:** Looker Export + Accountant
    > inputs

### **Appendix B --- Sales & Operational Tables**

-   Full account-level tables

-   Inventory tables **Source:** Sales DB + Production DB

### **Appendix C --- Risks & Issues Log**

-   Issues, owner, severity, timeline

### **Appendix D --- Additional Slides (Funding / R&D / Special Projects)**

Used only when needed.

## 4. Design Rules (10--20--30 Format)

-   **Max 10 slides** (excluding appendices)

-   **Min 20pt font equivalent** (Google Slides: 18--20pt modern font)

-   **Max 30 minutes presentation time**

-   Clean, simple visuals; no dense tables

-   Narrative always comes first, charts support---not replace---story

## 

## 

## 

## 

## 5. Data Automation Mapping

Defines which slides can be pre-populated automatically.

  -----------------------------------------------------------------------
  **Slide**               **Automatic**           **Source**
  ----------------------- ----------------------- -----------------------
  1                       Partial                 Manual summary + key
                                                  KPIs from DBs

                                                  

  2                       Full                    SALES_REVENUE_MASTER

  3                       Full                    SALES_REVENUE_MASTER

  4                       Full                    SALES_REVENUE_MASTER

  5                       Full                    ACCOUNT_STATUS +
                                                  ACCOUNT_TRACKING

  6                       No                      Manual

  7                       Full                    Production DB tables

  8                       Partial                 DB + Finance inputs

  9                       No                      Manual

  10                      No                      Manual
  -----------------------------------------------------------------------

## 6. Monthly Workflow

1.  Run all DB refresh pipelines (via VA one‑click).

2.  Export Looker tables where needed.

3.  Auto-fill Slides 2--5 and 7--8.

4.  CEO drafts Slides 1, 6, 9, 10.

5.  Final review + export to PDF.

## 7. Versioning

-   File name: **Candid Monthly Report --- YYYY-MM (vX.X)**

-   All decks stored under: **Candid Labs → Reporting**

-   Annual archive created each January

## 8. Next Steps

-   Build CDoc 7A: KPI → Slide automation mapping

-   Build CDoc 7B: Slide design templates (Google Slides)

-   Prepare November report using this template
