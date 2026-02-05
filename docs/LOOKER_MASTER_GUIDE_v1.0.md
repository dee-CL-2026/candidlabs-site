Version: v1.0\
**Last updated:** TBC

# 1. Purpose & Scope

This guide defines the shared rules for all Candid Looker Studio
dashboards. It covers constants (colours, fonts, naming), chart styles,
page layout, and the core dashboards we plan to build. The goal is to
ensure that any new chart or page created by the team looks and behaves
like part of a single, consistent Candid reporting system.

# 2. Source Files & Folder Structure

All reporting assets live under the Shared Drive: Candid CMS → 4. CMS →
Candid Reports.

Key subfolders:

-   data_sources -- Google Sheets that act as reporting databases (e.g.
    CANDID LABS Sales DB, CANDID LABS Production DB).

-   dashboards -- Looker Studio reports (one file per dashboard).

-   brand -- Brand guidelines, logos, colour references.

-   docs -- Governance and how‑to documents (including this guide and
    LOOKER_CONSTANTS_v1.0).

Primary data sources for v1.0:

**• CANDID LABS Sales DB**

\- ACCOUNT_TRACKING tab -- transactional sales at account level (source
for most sales & distribution charts).

\- SALES_REVENUE_MASTER tab -- finance‑aligned sales view if needed for
revenue/GM views.

**• CANDID LABS Production DB**

\- Tabs for purchases, BoM, production runs, inventory movements and
snapshots (used for CoGS & stock views once live).

# 3. Constants & Tokens (Colours, Fonts, Naming)

The file LOOKER_CONSTANTS_v1.0 in the docs folder is the source of truth
for all reporting constants. Any change to colours or naming should be
made there first, then applied in Looker.

## 3.1 Brand & SKU Colours

  -----------------------------------------------------------------------
  Name / Usage            Hex Code                Notes
  ----------------------- ----------------------- -----------------------
  CANDID GREY             #707372                 Neutral text, borders,
                                                  secondary elements.

  CANDID SODA BLUE        #003DA5                 Club Soda charts,
                                                  primary accents when
                                                  SKU not split.

  CANDID IMPERIAL YELLOW  #FFB500                 Imperial Tonic charts.

  CANDID GINGER GREEN     #00873E                 Ginger charts.

  CANDID TEAL             #1B708B                 Hero background blocks
                                                  and key KPI tiles.
  -----------------------------------------------------------------------

SKU → colour mapping (for any chart that splits by SKU_Name):

  -----------------------------------------------------------------------
  SKU_Name value                      Colour
  ----------------------------------- -----------------------------------
  CLUB SODA                           CANDID SODA BLUE (#003DA5)

  IMPERIAL                            CANDID IMPERIAL YELLOW (#FFB500)

  GINGER                              CANDID GINGER GREEN (#00873E)
  -----------------------------------------------------------------------

## 3.2 Typography

Font family for all dashboards: **Poppins (or closest available web
equivalent).**

-   Page title: 28--32 pt equivalent, bold, CANDID GREY or white on teal
    block.

-   Section headers: 18--22 pt, semi‑bold.

-   Chart titles: 14--16 pt, semi‑bold.

-   Axis labels & legends: 10--12 pt, regular.

-   Number formatting: use thousands separators; no decimals for
    cases/cans; one decimal for percentages where useful.

# 4. Chart Style Guide

The rules below apply to all charts unless there is a strong reason to
deviate.

-   Background: keep report background white. Use teal blocks behind key
    KPI tiles or section headers only.

-   Gridlines: light grey, minimal. Prefer horizontal gridlines only for
    bar/column charts.

-   Borders: avoid heavy borders. Use subtle card borders or shadows
    only for grouping sections.

-   Legends: place on top or right; avoid overlapping data. Keep SKU
    colours consistent with Section 3.1.

-   Tooltips: leave default behaviour on, but ensure metric names are
    human‑friendly (e.g. \'Cases Sold\' not \'Quantity_Cases\').

-   Filters & controls: use simple dropdowns and date range controls;
    avoid cluttering the page.

# 5. Dashboard Layout Template

We will start with a single master layout that all dashboards follow.
Each page uses a simple grid concept:\
• Top band: page title + filters\
• Left column: key KPIs\
• Main area: core charts and trends\
• Bottom band: detailed tables if needed

Core dashboards for v1.0:

1.  Sales Performance -- volumes and revenue by SKU, market, channel,
    distributor.

2.  Distribution & Account Health -- active vs dormant accounts, new
    wins, account mix by channel/market.

3.  Production & Inventory -- production runs, stock levels, basic CoGS
    once Production DB is ready.

4.  Financial Health -- high‑level AR/AP and cashflow‑relevant metrics
    once the finance data is wired in.

## 5.1 Layout Grid (Per Page)

-   Canvas size: standard 16:9; keep safe margins of at least 24 px on
    all sides.

-   Top row (full width): dashboard title on the left, date range
    control on the right.

-   Row 2: 3--4 KPI tiles (e.g. Total Cases YTD, Active Accounts, %
    At‑Risk, Top SKU). Background teal with white numbers.

-   Middle rows: 2--4 charts (mix of bar, line, and maps if used)
    following the same alignment across all dashboards.

-   Bottom row: one or two detailed tables for drill‑down, ideally full
    width.

# 6. v1.0 Chart Inventory (High Level)

This table lists the initial charts we plan to build. It acts as a
checklist during implementation.

  -----------------------------------------------------------------------------------------
  ID             Dashboard      Chart / KPI    Primary Data Source  Notes
                                               & Tab                
  -------------- -------------- -------------- -------------------- -----------------------
  S1             Sales          Total cases by CANDID LABS Sales DB Colour by SKU_Name
                 Performance    SKU (bar)      -- ACCOUNT_TRACKING  using brand mapping.

  S2             Sales          Cases by       CANDID LABS Sales DB Stacked or clustered
                 Performance    Market &       -- ACCOUNT_TRACKING  bar.
                                Channel                             

  D1             Distribution & Active vs At   CANDID LABS Sales DB Based on
                 Account Health Risk vs Lost   -- ACCOUNT_STATUS    Days_Since_Last_Order
                                accounts                            rules.

  D2             Distribution & Account count  CANDID LABS Sales DB Filterable by Market.
                 Account Health by Channel     -- ACCOUNT_STATUS    

  P1             Production &   Cases produced CANDID LABS          Once production data is
                 Inventory      by SKU         Production DB --     connected.
                                               PRODUCTION_RUNS      

  I1             Production &   Closing stock  CANDID LABS          Monthly snapshot view.
                 Inventory      cases by SKU   Production DB --     
                                               INVENTORY_SNAPSHOT   

  F1             Financial      Receivables    Finance data source  To be wired once
                 Health         ageing by      -- TBC               finance model is
                                customer                            agreed.
  -----------------------------------------------------------------------------------------

# 7. Implementation Notes

-   Always turn off Looker's default colour palettes and manually set
    colours per series for SKU‑based charts.

-   When adding new SKUs, update LOOKER_CONSTANTS_v1.0 and this guide if
    the colour mapping changes.

-   Any new dashboard should be added to the chart inventory table
    before building.

-   If templates are introduced later, they should follow these same
    rules so we only maintain this guide and the constants file.
