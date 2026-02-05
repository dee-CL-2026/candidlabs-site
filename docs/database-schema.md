# Candid Labs Database Schema

*Auto-generated from Global Tab Analyser — 2026-02-05*

---

## Summary

| Database | Tabs | Total Rows | Max Cols |
|----------|------|------------|----------|
| 1) Sales DB | 25 | 32,258 | 36 |
| 2) Production DB | 33 | 68,138 | 35 |
| 3) Sales Tools | 3 | 3,001 | 26 |
| Loan Tracker | 6 | 6,015 | 27 |
| Sales Data Updates | 3 | 1,631 | 26 |
| Control Centre | 8 | 8,000 | 26 |
| **All Raw Data** | **12** | **22,868** | **35** |
| **TOTAL** | **90** | **141,911** | |

---

## 1) CANDID LABS Sales DB
`1kFEsYr6USq5Tm7CAIHNtI1lpUinBEXSOCTe5PTKc5Vk`

| Tab | Rows | Key Columns |
|-----|------|-------------|
| README | 1,000 | Section, Item, Details |
| AGED_RECEIVABLES_RAW | 1,000 | Contact, Current, < 1 Month, 1-3 Months, Older, Total |
| VIZ_DataDictionary | 1,000 | Source Sheet, DECK_METRICS |
| VIZ_Revenue_Margin_Trend | 1,000 | Month, Total_Revenue, Gross_Margin_Pct |
| VIZ_Channel_Split | 1,000 | Channel, Revenue (input) |
| VIZ_Top_SKUs | 1,000 | SKU, Revenue/Units (input) |
| VIZ_Stock_Cover | 1,000 | Month, SKU, Stock_On_Hand_Units/Cases, Avg_Disbursement |
| COGS_EXCEPTIONS | 1,000 | SKU_Code, SKU_Name, Total_Revenue_Impact, Dates, Reason |
| RECEIVABLE_DETAIL_RAW | 1,548 | Invoice Number, Date, Source, Item Code, Quantity, Prices |
| CASH_ON_HAND | 1,000 | Snapshot_Date, Balance Type, Bank_Name, Currency, Value |
| **SALES_REVENUE_MASTER** | 426 | Transaction_ID, Invoice_Date, Distributor, Account, SKU, Qty |
| **DECK_METRICS** | 1,000 | Month_Key, Revenue, MoM%, YoY%, Gross_Margin |
| COGS_LOOKUP | 1,000 | SKU_Name, SKU_Code, Raw_COGS_IDR |
| CONFIG_MAPPING | 593 | Raw_Value → Internal_Venue_Name, Market, Channel, Distributor |
| CONFIG_CONSTANTS | 65 | Parameter, Value, Options |
| RECEIVABLE_DETAIL_CLEAN | 999 | Invoice_Date, Customer, Invoice_Number, Item, Qty, Prices |
| MAPPING_HEALTH | 1,000 | Field_Name, Total_Rows, NonBlank_Count, Percent_Filled |
| CRM_CONTACTS | 1,000 | Account_ID, Venue_Name, Market, Channel, PIC details |
| UNLEASHED_SO_HISTORICAL | 1,000 | (Sales Orders) |
| UNLEASHED_SI_HISTORICAL | 1,000 | (Sales Invoices) |
| **ACCOUNT_TRACKING** | 9,627 | Transaction_ID, Date, Distributor, Venue, SKU, Qty |
| LEDGER_RAW | 1,000 | IDR totals |
| ACCOUNT_STATUS | 1,000 | Venue, Market, Channel, First/Latest Order, Days_Since |
| DORMANT_ACCOUNTS | 1,000 | Venue, Latest_Order_Date, Days_Since, Status |
| TAB STRUCTURE | 1,000 | (metadata) |

---

## 2) CANDID LABS Production DB
`1QE7g5HvSXszM6S3JtljmrMIHZGeftftNPUusK-W9l1U`

| Tab | Rows | Key Columns |
|-----|------|-------------|
| README | 1,000 | |
| Cash in Hand | 1,000 | Snapshot_Date, Balance Type, Bank_Name, Currency, Value |
| CONFIG_BOM_MASTER | 1,000 | SKU_Code, Component_Code, Quantity_Per_Can, UoM |
| CONFIG_COMPONENTS | 1,000 | Type, Category, SKU_Group, Component_Code, Vendor, Price_Type |
| **BATCH_COGS_MASTER** | 1,000 | Batch_ID, Production_Date, SKU_Code, Cans/Cases, COGS breakdown |
| COMPONENT_COST_HISTORY | 1,264 | Month_Key, Component_Code, Cumulative_Qty/Cost/Avg_Price |
| AGED_RECEIVABLES_RAW | 992 | Contact, aging buckets, Total |
| AGED_PAYABLES_RAW | 968 | Contact, aging buckets, Total |
| PAYABLE_DETAIL_RAW | 4,037 | Invoice Date, Item Code, Quantity, Prices, Tax |
| STOCK_MOVEMENTS_RAW | 1,000 | Movement_Date, Source_Type, Journal_Reference, Net/Tax/Gross |
| **KMI_PACKAGING_RAW** | 13,771 | Tanggal, Material, Stock awal/Masuk/Pemakaian/Stock akhir |
| KMI_TAB-CLUB-RAW | 1,000 | (Club Soda production data) |
| KMI_TAB-IMPERIAL-RAW | 132 | (Imperial Tonic production data) |
| KMI_TAB-GINGER-RAW | 102 | (Ginger Ale production data) |
| AR_AP_SUMMARY | 1,000 | Snapshot_Date, Metric_Type, Contact, Buckets |
| PAYABLE_DETAIL_CLEAN | 2,498 | Invoice_Date, Supplier, Line items, Amounts |
| PURCHASES_SUMMARY | 1,000 | Supplier, Invoice, Cost_Category, Amount_IDR |
| PRODUCTION_RUNS_RAW | 1,000 | Batch_ID, Production_Date, SKU, Plant, Cases/Cans |
| PRODUCTION_RUNS_CLEAN | 1,000 | Batch_ID, Components breakdown |
| STOCK_SUMMARY | 1,000 | Snapshot_Date, SKU, Opening/Purchases/Production Qty & Value |
| CONFIG_COST_CATEGORIES | 1,000 | Cost_Category_Code, Name, Type |
| CONFIG_RM_USAGE | 1,000 | SKU_Code, Component_Code, Quantity_Per_Batch |
| KMI_FG_BATCH_CLEAN | 1,000 | SKU, Batch_ID, Production_Date, Cases/Cans |
| KMI_FG_SHIPMENTS_RAW | 1,000 | Shipment_Date, SKU, Batch_ID, DO_Number, Qty_Cases |
| KMI_FG_STOCK_SUMMARY | 1,000 | SKU, Batch_ID, Closing_Cases/Cans |
| **KMI_PACKAGING_MOVEMENTS** | 20,391 | Movement_Date, Material, Qty, Stock_Opening/Closing |
| KMI_RM_RAW | 1,000 | Date, Material, Stock awal/Masuk/Keluar/Akhir |
| PRODUCTION_RUNS_KMI | 1,000 | Batch_ID, SKU, Cases/Cans |
| KMI_FG_SHIPMENTS_CLEAN | 1,000 | Shipment_Date, SKU, DO_Number, Destination |
| **SKU_COSTING_MASTER** | 1,000 | SKU_Code, SKU_Name, Raw_COGS_IDR |
| CONFIG_BOM_UNLEASHED | 1,000 | Assembled Product, Component, Quantity |
| CONFIG_XERO_ITEMS | 983 | Code, Name, Cost price, Sale price |

---

## 3) CANDID LABS Sales Tools
`19kDef25LdbvPssTkMusFGu8FmNbj2rWuF7NNF9SBSvs`

| Tab | Rows | Key Columns |
|-----|------|-------------|
| Config_Team | 1,000 | Email, Name, Phone |
| Config_Pricing | 1,001 | Location, Channel, Tier, Price per SKU, Discount % |
| Logs | 1,000 | Timestamp, User, Rep, Location, Action, File Link |

---

## Candid Labs Loan Tracker
`1B_CPSmsqk0xSwNIBDwNd7lAFHviHTkly7hNZffY68sQ`

| Tab | Rows | Key Columns |
|-----|------|-------------|
| Lender Profiles | 995 | Lender, Agreement Date, Original Loan, Novation details |
| CHECK_SHEET | 1,000 | Lender, Period, Opening/Closing Balance, Interest |
| Loan Data | 867 | Lender, Date, Balances, Principal, Interest |
| Loan Transactions | 996 | Date, Lender, Type, Amount |
| Daily Interest | 1,157 | Date, Interest by Lender |
| ANALYSER_OUTPUT | 1,000 | (metadata) |

---

## Candid Labs - Sales Data Updates
`1Y4SQBDGn4TqeI33s5fFoz3_negfe8egF3CI_da7alXc`

| Tab | Rows | Key Columns |
|-----|------|-------------|
| Raw | 601 | (raw import data) |
| New | 1,000 | Account, Venue, Market, Channel, Distributor |
| Config | 30 | Group_Name, Market, City, Channel, Distributor |

---

## All Raw Data (Source Hub)
`1JDkl-_Ii-Lh3_aKdB0wn80bScVubaWrWiJOvoq0-2gs`

**This is THE input layer — VA drops data here, IMPORTRANGE pulls to DBs**

| Tab | Rows | Key Columns |
|-----|------|-------------|
| Read.me | 1,000 | |
| **IMPORTRANGE_FORMULAS** | 1,000 | Tab Name, Target Spoke, Status, Column Range |
| Cash in Hand | 1,000 | Snapshot_Date, Balance Type, Bank_Name, Currency, Value |
| AGED_RECEIVABLES_RAW | 1,000 | Contact, aging buckets |
| AGED_PAYABLES_RAW | 1,000 | Contact, aging buckets |
| PAYABLE_DETAIL_RAW | 2,939 | Invoice Date, Item Code, Quantity, Prices |
| RECEIVABLE_DETAIL_RAW | 1,048 | Invoice Number/Date, Item, Quantity, Prices |
| KMI_PACKAGING_RAW | 9,881 | Tanggal, Material, Stock awal/Masuk/Pemakaian/Stock akhir |
| KMI_TAB-CLUB-RAW | 1,000 | Club Soda finished goods |
| KMI_TAB-IMPERIAL-RAW | 1,000 | Imperial Tonic finished goods |
| KMI_TAB-GINGER-RAW | 1,000 | Ginger Ale finished goods |
| KMI_RM_RAW | 1,000 | Raw materials tracking |

**Data Flow:**
```
All Raw Data (VA input)
    ├── IMPORTRANGE → Sales DB (receivables, cash)
    ├── IMPORTRANGE → Production DB (payables, KMI data)
    └── IMPORTRANGE_FORMULAS tab = the mapping
```

---

## Key Tables for Analytics

**Revenue & Sales:**
- `SALES_REVENUE_MASTER` — transaction-level sales
- `ACCOUNT_TRACKING` — 9.6K rows of venue/SKU tracking
- `DECK_METRICS` — pre-aggregated monthly KPIs

**Production & Inventory:**
- `KMI_PACKAGING_MOVEMENTS` — 20K+ material movements
- `KMI_PACKAGING_RAW` — 13K+ raw packaging data
- `BATCH_COGS_MASTER` — batch-level costing
- `SKU_COSTING_MASTER` — SKU cost reference

**Finance:**
- `AGED_RECEIVABLES_RAW` / `AGED_PAYABLES_RAW` — AR/AP aging
- `PAYABLE_DETAIL_RAW` / `_CLEAN` — 4K+ payable records
- `Cash in Hand` — cash position snapshots
- `Loan Tracker` — founder loan tracking

**Config & Reference:**
- `CONFIG_MAPPING` — venue/account mapping
- `CONFIG_BOM_MASTER` — bill of materials
- `CONFIG_COMPONENTS` — component registry

---

*Last updated: 2026-02-05 by Torque via Global Tab Analyser*
