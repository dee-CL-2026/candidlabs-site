# Candid Labs Database Schema

*Exported: 2026-02-05T04:13:11.828Z*

---

## CandidLabs - CMS - Control Centre (v2)
- **ID:** `1M4HjoWzsO1PeXL6O17J0BsDGzNsOxKGtVIQs_kpYu9E`
- **Tabs:** 8
- **Rows:** 8,000
- **Columns:** 26

```
01 | Logs | 1,000 x 26 | Header: Timestamp, Event, Detail
02 | Config | 1,000 x 26 | Header: Key, Value, Notes
03 | Folder Map | 1,000 x 26 | Header: Folder Name, Folder Path, Folder ID, Open, Parent Folder ID, Total Subfolders, Total Files, Last Modified, Last Modif...
04 | File Directory | 1,000 x 26 | Header: File Name, Folder Path, File ID, Open, MIME Type, Created, Last Modified, CMS Area, Updated By, Timestamp
05 | Folder Metadata | 1,000 x 26 | Header: Folder Name, Folder ID, Open, Total Files, Total Subfolders, Size (Bytes), Last Modified, Last Modified By, Last Scan...
06 | Archived Files | 1,000 x 26 | Header: File Name, File ID, Open, Original Folder Path, Archived Folder Path, Archived At, Archived By, Reason / Notes
07 | Script Directory | 1,000 x 26 | Header: Tool Name, Script Project, Function Name, Type (CMS/GAS/Utility), Trigger, Frequency, Status, Owner Type (Personal/Ca...
08 | Tab Analysis Log | 1,000 x 9 | Header: Run ID, Timestamp, Analysed Sheet Name, Analysed Sheet ID, Open, Total Tabs, Total Rows (sum), Total Cols (max), Tab ...
```

---

## 1) CANDID LABS Sales DB
- **ID:** `1kFEsYr6USq5Tm7CAIHNtI1lpUinBEXSOCTe5PTKc5Vk`
- **Tabs:** 25
- **Rows:** 32,258
- **Columns:** 36

```
01 | README | 1,000 x 26 | Header: Section, Item, Details
02 | AGED_RECEIVABLES_RAW | 1,000 x 26 | Header: Contact, Current, < 1 Month, 1 Month, 2 Months, 3 Months, Older, Total
03 | VIZ_DataDictionary | 1,000 x 26 | Header: Source Sheet, DECK_METRICS
04 | VIZ_Revenue_Margin_Trend | 1,000 x 26 | Header: Month, Total_Revenue, Gross_Margin_Pct
05 | VIZ_Channel_Split | 1,000 x 26 | Header: REQUIRED INPUT, This tab expects a numeric table (e.g., Channel, Revenue) for a selected month.
06 | VIZ_Top_SKUs | 1,000 x 26 | Header: REQUIRED INPUT, This tab expects a numeric table (e.g., SKU, Revenue/Units) for a selected month.
07 | VIZ_Stock_Cover | 1,000 x 26 | Header: Month, SKU, Stock_On_Hand_Units, Stock_On_Hand_Cases, Avg_Disbursement_Units_Per_Week, Avg_Disbursement_Cases_Per_Wee...
08 | COGS_EXCEPTIONS | 1,000 x 26 | Header: SKU_Code, SKU_Name, Total_Revenue_Impact, First_Seen_Date, Last_Seen_Date, Row_Count, Reason
09 | RECEIVABLE_DETAIL_RAW | 1,548 x 26 | Header: Invoice Number, Invoice Date, Source, Reference, Item Code, Description, Quantity, Unit Price (ex) (Source), Discount...
10 | CASH_ON_HAND | 1,000 x 26 | Header: Snapshot_Date, Balance Type, Bank_Name, Currency, Value
11 | SALES_REVENUE_MASTER | 426 x 26 | Header: Transaction_ID, Invoice_Date, Invoice_Number, Distributor_Name, Internal_Venue_Name, Account_ID, SKU_Name, Quantity_C...
12 | DECK_METRICS | 1,000 x 36 | Header: Month_Key, Month_Label, Headline_MoM_Changes, Total_Revenue, Revenue_vs_Prev_Mo_Pct, Revenue_vs_Last_Year_Pct, Gross_...
13 | COGS_LOOKUP | 1,000 x 25 | Header: A: SKU_Name, B: Raw_COGS_IDR, SKU_Code, SKU_Name, Raw_COGS_IDR
14 | CONFIG_MAPPING | 593 x 12 | Header: Raw_Value, Internal_Venue_Name, Account_ID, Group_Name, Market, City, Channel, Distributor_Code, Distributor_Name, Notes
15 | CONFIG_CONSTANTS | 65 x 26 | Header: Parameter, Value, Parameter Options, Active_Flag, Channel, #REF!, Distributor_Name, Group_Name, Mapping_Type, Market
16 | RECEIVABLE_DETAIL_CLEAN | 999 x 26 | Header: Invoice_Date, Customer_Name, Invoice_Number, Line_Description, Item_Code, Quantity, Unit_Price_Source, Discount_Sourc...
17 | MAPPING_HEALTH | 1,000 x 26 | Header: Field_Name, Total_Active_Rows, NonBlank_Count, Percent_Filled, Notes
18 | CRM_CONTACTS | 1,000 x 26 | Header: Account_ID, Internal_Venue_Name, Venue_Group, Market, City, Channel, PIC_Name, PIC_Role, PIC_Email, PIC_Phone
19 | UNLEASHED_SO_HISTORICAL | 1,000 x 26 | Header: Totals, Cash on hand
20 | UNLEASHED_SI_HISTORICAL | 1,000 x 26
21 | ACCOUNT_TRACKING | 9,627 x 14 | Header: Transaction_ID, Date_of_Sale, Distributor_Name, Venue_Account_Name, Internal_Venue_Name, Product_Name, SKU_Name, Quan...
22 | LEDGER_RAW | 1,000 x 26 | Header: Totals, IDR
23 | ACCOUNT_STATUS | 1,000 x 26 | Header: Snapshot_Date, Venue_Account_Name, Venue_Group, Market, City, Channel, First_Order_Date, Latest_Order_Date, Days_Sinc...
24 | DORMANT_ACCOUNTS | 1,000 x 26 | Header: Venue_Account_Name, Venue_Group, Market, City, Channel, Latest_Order_Date, Days_Since_Last_Order, Status, Active_Flag
25 | TAB STRUCTURE | 1,000 x 26 | Header: Summary
```

---

## 2) CANDID LABS Production DB
- **ID:** `1QE7g5HvSXszM6S3JtljmrMIHZGeftftNPUusK-W9l1U`
- **Tabs:** 33
- **Rows:** 68,138
- **Columns:** 35

```
01 | README | 1,000 x 26
02 | Cash in Hand | 1,000 x 26 | Header: Snapshot_Date, Balance Type, Bank_Name, Currency, Value
03 | CONFIG_BOM_MASTER | 1,000 x 26 | Header: SKU_Code, Component_Code, Quantity_Per_Can, UoM, Notes
04 | CONFIG_COMPONENTS | 1,000 x 26 | Header: Type, Category, SKU_Group, KMI_Item_Name, Component_Code, UoM, Vendor, Price_Type
05 | BATCH_COGS_MASTER | 1,000 x 26 | Header: Batch_ID, Production_Date, SKU_Code, Cans_Produced, Cases_Produced, Total_COGS_per_can, Can_Cost, Box_Cost, Filling_C...
06 | COMPONENT_COST_HISTORY | 1,264 x 26 | Header: Month_Key, Component_Code, Component_Name, Component_Type, Cumulative_Qty, Cumulative_Cost_IDR, Cumulative_Avg_Price_IDR
07 | TAB STRUCTURE | 1,000 x 26 | Header: Summary
08 | AGED_RECEIVABLES_RAW | 992 x 23 | Header: Contact, < 1 Month, 1 Month, 2 Months, 3 Months, Older, Total
09 | AGED_PAYABLES_RAW | 968 x 26 | Header: Contact, Current, < 1 Month, 1 Month, 2 Months, 3 Months, Older, Total
10 | PAYABLE_DETAIL_RAW | 4,037 x 25 | Header: Invoice Date, Source, Reference, Item Code, Description, Quantity, Unit Price (ex) (Source), Tax (Source), Gross (Sou...
11 | STOCK_MOVEMENTS_RAW | 1,000 x 26 | Header: Movement_Date, Source_Type, Journal_Reference, Contact_Name, Description, Net_IDR, Tax_IDR, Gross_IDR, Status, Notes
12 | KMI_PACKAGING_RAW | 13,771 x 21 | Header: Tanggal, No Material, Material, sat, Stock awal, Masuk, Pemakaian produksi, BPB, Retur, Stock akhir
13 | KMI_TAB-CLUB-RAW | 1,000 x 35 | Header: SERAH TERIMA PRODUK JADI, PO, PO/KMI/IV/2024, PO/KMI/IV/2024 + PO/KMIOP/VI/2024, PO/KMI/VIII/2024 + PO/KMI/OP/VIII/2024
14 | KMI_TAB-IMPERIAL-RAW | 132 x 26 | Header: SERAH TERIMA PRODUK JADI, PO, PO/KMI/IV/2024, PO/KMI/IV/2024 + PO/KMI/VI/2024-, PO/KMI/VI/2024- + PO/KMIOP/VI/2024, P...
15 | KMI_TAB-GINGER-RAW | 102 x 26 | Header: SERAH TERIMA PRODUK JADI, PO Ginger, PO/KMI/IV/2024 + PO/KMIOP/V/2024, PO/KMI/VI/2025
16 | AR_AP_SUMMARY | 1,000 x 26 | Header: Snapshot_Date, Metric_Type, Contact_Name, Bucket_Current, Bucket_LT_1_Month, Bucket_1_Month, Bucket_2_Months, Bucket_...
17 | PAYABLE_DETAIL_CLEAN | 2,498 x 26 | Header: Invoice_Date, Supplier_Name, Invoice_Number, Line_Description, Item_Code, Quantity, Unit_Price_Source, Tax_Source, Gr...
18 | PURCHASES_SUMMARY | 1,000 x 26 | Header: Supplier_Name, Invoice_Number, Invoice_Date, Cost_Category, Currency, Amount_Source, Amount_IDR, Notes
19 | PRODUCTION_RUNS_RAW | 1,000 x 26 | Header: Batch_ID, Production_Date, SKU_Code, SKU_Name, Plant_Name, Batch_Size_Unit, Batch_Size_Quantity, Cases_Produced, Cans...
20 | PRODUCTION_RUNS_CLEAN | 1,000 x 26 | Header: Batch_ID, Production_Date, SKU_Code, SKU_Name, Plant_Name, Component_Code, Component_Name, Component_Type, Quantity_U...
21 | STOCK_SUMMARY | 1,000 x 26 | Header: Snapshot_Date, SKU_Code, SKU_Name, Opening_Qty, Opening_Value_IDR, Purchases_Qty, Purchases_Value_IDR, Production_Qty...
22 | CONFIG_COST_CATEGORIES | 1,000 x 26 | Header: Cost_Category_Code, Cost_Category_Name, Cost_Type, Default_Account_Code, Active_Flag, Notes
23 | CONFIG_RM_USAGE | 1,000 x 26 | Header: SKU_Code, SKU_Name, Component_Code, Component_Name, Component_Type, Quantity_Per_Batch, UoM, Notes
24 | KMI_FG_BATCH_CLEAN | 1,000 x 26 | Header: SKU_Code, SKU_Name, Batch_ID, Production_Date, Plant_Name, Batch_Size_Unit, Batch_Size_Quantity, Cases_Produced, Cans...
25 | KMI_FG_SHIPMENTS_RAW | 1,000 x 26 | Header: Shipment_Date, SKU_Code, SKU_Name, Batch_ID, DO_Number, Destination, Transporter, Vehicle_Type, Truck_Plate, Qty_Cases
26 | KMI_FG_STOCK_SUMMARY | 1,000 x 26 | Header: SKU_Code, SKU_Name, Batch_ID, Production_Date, Closing_Cases, Closing_Cans
27 | KMI_PACKAGING_MOVEMENTS | 20,391 x 26 | Header: Movement_Date, Material_Code, Material_Name, UoM, Movement_Type, Qty, Stock_Opening, Stock_Closing, OS, Pallet_Standard
28 | KMI_RM_RAW | 1,000 x 31 | Header: TANGGAL, BULAN, TAHUN, MATERIAL, SAT, Stok awal, Masuk, Keluar, Stok Akhir, Batch
29 | PRODUCTION_RUNS_KMI | 1,000 x 26 | Header: Batch_ID, Production_Date, SKU_Code, SKU_Name, Plant_Name, Batch_Size_Unit, Batch_Size_Quantity, Cases_Produced, Cans...
30 | KMI_FG_SHIPMENTS_CLEAN | 1,000 x 26 | Header: Shipment_Date, Shipment_Date_Key, SKU_Code, SKU_Name, Batch_ID, DO_Number_Raw, DO_Number_Key, Destination, Transporte...
31 | SKU_COSTING_MASTER | 1,000 x 26 | Header: SKU_Code, SKU_Name, Raw_COGS_IDR, Notes
32 | CONFIG_BOM_UNLEASHED | 1,000 x 23 | Header: *Assembled Product Code, *Component Product Code, *Quantity, Price Sanity Check
33 | CONFIG_XERO_ITEMS | 983 x 26 | Header: Code, Name, Cost price, Sale price
```

---

## 3) CANDID LABS Sales Tools
- **ID:** `19kDef25LdbvPssTkMusFGu8FmNbj2rWuF7NNF9SBSvs`
- **Tabs:** 3
- **Rows:** 3,001
- **Columns:** 26

```
01 | Config_Team | 1,000 x 26 | Header: Email, Name, Phone
02 | Config_Pricing | 1,001 x 25 | Header: Location, Channel, Tier, Price_Soda, Price_Imperial, Price_Ginger, Discount %, Net
03 | Logs | 1,000 x 26 | Header: Timestamp, User Email, Rep Name, Location, Channel, Tier, Action, File Link
```

---

## Candid Labs Loan Tracker
- **ID:** `1B_CPSmsqk0xSwNIBDwNd7lAFHviHTkly7hNZffY68sQ`
- **Tabs:** 6
- **Rows:** 6,015
- **Columns:** 27

```
01 | Lender Profiles | 995 x 26 | Header: Lender, Agreement Date, Original Loan (SGD), Pre-Novation Repayments (SGD), Novation Date, Novated Principal (SGD), N...
02 | CHECK_SHEET | 1,000 x 26 | Header: Lender, Period (YYYY-MM), Opening Balance, Principal Δ (net), Interest Accrued, Closing Balance, Check
03 | Loan Data | 867 x 24 | Header: Lender, Date, Opening Balance, Principal Payment, Interest Accrued, Closing Balance, Notes
04 | Loan Transactions | 996 x 26 | Header: Date, Lender, Type, Amount, Notes
05 | Daily Interest | 1,157 x 27 | Header: Date, Alistair Toyne, Jay Hearn
06 | ANALYSER_OUTPUT | 1,000 x 26 | Header: SPREADSHEET INFO
```

---

## Candid Labs - Sales Data Updates
- **ID:** `1Y4SQBDGn4TqeI33s5fFoz3_negfe8egF3CI_da7alXc`
- **Tabs:** 3
- **Rows:** 1,631
- **Columns:** 26

```
01 | Raw | 601 x 15 | Header: 0, 99, 55, 92, 25, 36, 109, 5, 8, 591
02 | New | 1,000 x 15 | Header: NEW Account, Internal_Venue_Name, Account_ID, Group_Name, Market, City, Channel, Distributor_Code, Distributor, Activ...
03 | Config | 30 x 26 | Header: Group_Name, Market, City, Channel, Distributor_Code, Distributor
```

---

## All Raw Data
- **ID:** `1JDkl-_Ii-Lh3_aKdB0wn80bScVubaWrWiJOvoq0-2gs`
- **Tabs:** 12
- **Rows:** 22,868
- **Columns:** 35

```
01 | Read.me | 1,000 x 26
02 | IMPORTRANGE_FORMULAS | 1,000 x 26 | Header: Tab Name, Target Spoke, Status, Column Range
03 | Cash in Hand | 1,000 x 26 | Header: Snapshot_Date, Balance Type, Bank_Name, Currency, Value
04 | AGED_RECEIVABLES_RAW | 1,000 x 26 | Header: Contact, Current, < 1 Month, 1 Month, 2 Months, 3 Months, Older, Total
05 | AGED_PAYABLES_RAW | 1,000 x 26 | Header: Contact, Current, < 1 Month, 1 Month, 2 Months, 3 Months, Older, Total
06 | PAYABLE_DETAIL_RAW | 2,939 x 26 | Header: Invoice Date, Source, Reference, Item Code, Description, Quantity, Unit Price (ex) (Source), Tax (Source), Gross (Sou...
07 | RECEIVABLE_DETAIL_RAW | 1,048 x 26 | Header: Invoice Number, Invoice Date, Source, Reference, Item Code, Description, Quantity, Unit Price (ex) (Source), Discount...
08 | KMI_PACKAGING_RAW | 9,881 x 26 | Header: Tanggal, No Material, Material, sat, Stock awal, Masuk, Pemakaian produksi, BPB, Retur, Stock akhir
09 | KMI_TAB-CLUB-RAW | 1,000 x 35 | Header: SERAH TERIMA PRODUK JADI, PO, PO/KMI/IV/2024, PO/KMI/IV/2024 + PO/KMIOP/VI/2024, PO/KMI/VIII/2024 + PO/KMI/OP/VIII/2024
10 | KMI_TAB-IMPERIAL-RAW | 1,000 x 26 | Header: SERAH TERIMA PRODUK JADI, PO, PO/KMI/IV/2024, PO/KMI/IV/2024 + PO/KMI/VI/2024-, PO/KMI/VI/2024- + PO/KMIOP/VI/2024, P...
11 | KMI_TAB-GINGER-RAW | 1,000 x 26 | Header: SERAH TERIMA PRODUK JADI, PO Ginger, PO/KMI/IV/2024 + PO/KMIOP/V/2024, PO/KMI/VI/2025
12 | KMI_RM_RAW | 1,000 x 31 | Header: TANGGAL, BULAN, TAHUN, MATERIAL, SAT, Stok awal, Masuk, Keluar, Stok Akhir, Batch
```

---

