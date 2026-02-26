# Production Cost Engine Audit

Generated: 2026-02-26
Scope: All files, sheets, scripts, and modules involved in production costing
Source: GAS source code (candid-labs-production-master, candid-labs-sales-master), schema exports, migration docs

---

## Production Components

### Files and Scripts

| # | File | Location | Purpose | Inputs | Outputs | FIFO |
|---|------|----------|---------|--------|---------|------|
| 1 | `Costing_Engine.js` | candid-labs-production-master | 3-tier pricing waterfall: SKU-level COGS | CONFIG_BOM_UNLEASHED, PAYABLE_DETAIL_CLEAN, CONFIG_XERO_ITEMS | SKU_COSTING_MASTER | No |
| 2 | `build_batch_cogs.js` | candid-labs-production-master | Batch-level COGS per production run | CONFIG_BOM_MASTER, PRODUCTION_RUNS_KMI, COMPONENT_COST_HISTORY | BATCH_COGS_MASTER | No |
| 3 | `build_component_cost_history.js` | candid-labs-production-master | Cumulative average component pricing by month | PAYABLE_DETAIL_CLEAN | COMPONENT_COST_HISTORY | No |
| 4 | `cleanPayables.js` | candid-labs-production-master | Transform raw Xero payables export to structured data | PAYABLE_DETAIL_RAW | PAYABLE_DETAIL_CLEAN | No |
| 5 | `buildProductionRuns.js` | candid-labs-production-master | Parse KMI daily packaging data into production batches | KMI_PACKAGING_RAW | PRODUCTION_RUNS_KMI | No |
| 6 | `Pipelines.js` | candid-labs-production-master | Master orchestrator (chains steps 1-4 in sequence) | All above | All above | No |
| 7 | `margin.js` | candid-labs-sales-master | Gross margin calculation per month | SALES_REVENUE_MASTER + SKU_COSTING_MASTER (cross-sheet) | DECK_METRICS.Gross_Margin_Pct, COGS_EXCEPTIONS | No |
| 8 | `import_bom_master.js` | candid-labs-production-master | Seed CONFIG_BOM_MASTER from Unleashed CSV | CONFIG_BOM_UNLEASHED | CONFIG_BOM_MASTER | N/A |
| 9 | `import_config_components.js` | candid-labs-production-master | Seed CONFIG_COMPONENTS | Hardcoded data | CONFIG_COMPONENTS | N/A |
| 10 | `kmiPackagingMovements.js` | candid-labs-production-master | Normalize KMI stock movements | KMI_PACKAGING_RAW | KMI_PACKAGING_MOVEMENTS | No |
| 11 | `kmiFgParser.js` | candid-labs-production-master | Parse KMI finished goods tabs | KMI_TAB-CLUB-RAW, KMI_TAB-IMPERIAL-RAW, KMI_TAB-GINGER-RAW | KMI_FG_BATCH_CLEAN, KMI_FG_SHIPMENTS_RAW/CLEAN, KMI_FG_STOCK_SUMMARY | No |
| 12 | `ARAPSnapshot.js` | candid-labs-production-master | Accounts receivable/payable aging snapshots | AGED_RECEIVABLES_RAW, AGED_PAYABLES_RAW | AR_AP_SUMMARY | N/A |

### Google Sheets (Production DB)

Sheet ID: `1QE7g5HvSXszM6S3JtljmrMIHZGeftftNPUusK-W9l1U` — 33 tabs, 68,138 rows

| # | Tab | Type | Rows | Purpose | VA Manual Entry |
|---|-----|------|------|---------|-----------------|
| 1 | CONFIG_BOM_MASTER | Config | 1,000 | SKU → Component mapping (SKU_Code, Component_Code, Quantity_Per_Can, UoM) | No (seeded by script) |
| 2 | CONFIG_BOM_UNLEASHED | Config | 1,000 | Raw BOM from Unleashed CSV (23 cols incl. Xero mapping in col P) | Yes (CSV paste) |
| 3 | CONFIG_COMPONENTS | Config | 1,000 | Component registry (Type, Category, SKU_Group, Vendor, Price_Type) | No (seeded by script) |
| 4 | CONFIG_XERO_ITEMS | Config | 983 | Xero product catalog (Code, Name, Cost price, Sale price) | Yes (Xero export paste) |
| 5 | CONFIG_COST_CATEGORIES | Config | 1,000 | Cost category taxonomy | Manual |
| 6 | CONFIG_RM_USAGE | Config | 1,000 | RM usage per batch | Manual |
| 7 | PAYABLE_DETAIL_RAW | Raw | 4,037 | Xero payables export (Invoice Date, Supplier, Item Code, Qty, Prices) | Yes (Xero export paste) |
| 8 | PAYABLE_DETAIL_CLEAN | Processed | 2,498 | Cleaned payables (output of cleanPayables.js) | No (script output) |
| 9 | PURCHASES_SUMMARY | Processed | 1,000 | Aggregated purchase summary | No (script output) |
| 10 | KMI_PACKAGING_RAW | Raw | 13,771 | KMI daily stock movements (Indonesian: Tanggal, No Material, Stock awal, Masuk, Pemakaian produksi, BPB, Retur, Stock akhir) | Yes (KMI report paste) |
| 11 | KMI_PACKAGING_MOVEMENTS | Processed | 20,391 | Normalized packaging movements | No (script output) |
| 12 | KMI_RM_RAW | Raw | 1,000 | KMI raw material movements | Yes (KMI report paste) |
| 13 | KMI_TAB-CLUB-RAW | Raw | 1,000 | KMI finished goods — Club Soda | Yes (KMI report paste) |
| 14 | KMI_TAB-IMPERIAL-RAW | Raw | 132 | KMI finished goods — Imperial Tonic | Yes (KMI report paste) |
| 15 | KMI_TAB-GINGER-RAW | Raw | 102 | KMI finished goods — Ginger Ale | Yes (KMI report paste) |
| 16 | PRODUCTION_RUNS_KMI | Processed | 1,000 | Production batches (Batch_ID, Date, SKU, Cans/Cases) | No (script output) |
| 17 | PRODUCTION_RUNS_RAW | Raw | 1,000 | Legacy production runs | Manual |
| 18 | PRODUCTION_RUNS_CLEAN | Processed | 1,000 | Legacy cleaned production runs | No (script output) |
| 19 | COMPONENT_COST_HISTORY | Processed | 1,264 | Monthly cumulative average cost per component | No (script output) |
| 20 | SKU_COSTING_MASTER | Output | 1,000 | Final SKU costs (SKU_Code, SKU_Name, Raw_COGS_IDR) | No (script output) |
| 21 | BATCH_COGS_MASTER | Output | 1,000 | Per-batch COGS with component breakdown | No (script output) |
| 22 | STOCK_MOVEMENTS_RAW | Raw | 1,000 | Journal-level stock movements | Yes (Xero export paste) |
| 23 | STOCK_SUMMARY | Processed | 1,000 | Stock position snapshots | No (script output) |
| 24 | KMI_FG_BATCH_CLEAN | Processed | 1,000 | Cleaned FG batch records | No (script output) |
| 25 | KMI_FG_SHIPMENTS_RAW | Processed | 1,000 | FG shipment records (raw) | No (script output) |
| 26 | KMI_FG_SHIPMENTS_CLEAN | Processed | 1,000 | FG shipment records (cleaned) | No (script output) |
| 27 | KMI_FG_STOCK_SUMMARY | Processed | 1,000 | FG closing stock by batch | No (script output) |
| 28 | AGED_RECEIVABLES_RAW | Raw | 992 | Xero aged receivables | Yes (Xero export paste) |
| 29 | AGED_PAYABLES_RAW | Raw | 968 | Xero aged payables | Yes (Xero export paste) |
| 30 | AR_AP_SUMMARY | Processed | 1,000 | ARAP aging snapshots | No (script output) |

**VA Manual Entry tabs (pasted from external sources): 10**
- PAYABLE_DETAIL_RAW (Xero)
- AGED_RECEIVABLES_RAW (Xero)
- AGED_PAYABLES_RAW (Xero)
- CONFIG_BOM_UNLEASHED (Unleashed CSV)
- CONFIG_XERO_ITEMS (Xero)
- KMI_PACKAGING_RAW (KMI)
- KMI_RM_RAW (KMI)
- KMI_TAB-CLUB-RAW (KMI)
- KMI_TAB-IMPERIAL-RAW (KMI)
- KMI_TAB-GINGER-RAW (KMI)
- STOCK_MOVEMENTS_RAW (Xero)

**Post-Xero sync, automatable:** PAYABLE_DETAIL_RAW, AGED_RECEIVABLES_RAW, AGED_PAYABLES_RAW, CONFIG_XERO_ITEMS, STOCK_MOVEMENTS_RAW (5 tabs)
**Remains manual (3rd party KMI data):** KMI_PACKAGING_RAW, KMI_RM_RAW, KMI_TAB-CLUB-RAW, KMI_TAB-IMPERIAL-RAW, KMI_TAB-GINGER-RAW (5 tabs)
**Remains manual (config):** CONFIG_BOM_UNLEASHED (1 tab)

---

## Current Cost Logic

### Formula 1: SKU-Level COGS (Costing_Engine.js — `runCostingPipeline`)

```
For each SKU in CONFIG_BOM_UNLEASHED:
  For each component in SKU's BOM:
    xeroCode = BOM.col_P_mapping || globalComponentMap[unleashedCode] || unleashedCode

    price = WATERFALL:
      IF payableWAC[xeroCode] > 0  → payableWAC[xeroCode]          # Tier 1: Actual POs
      ELSE IF xeroStdCost[xeroCode] > 0 → xeroStdCost[xeroCode]    # Tier 2: Xero standard
      ELSE → BOM.staticCost                                          # Tier 3: BOM estimate

    componentCost = component.qty × price

  SKU.Raw_COGS_IDR = SUM(componentCost) for all components
```

- **Location:** `Costing_Engine.js:9-73`
- **Dependencies:** CONFIG_BOM_UNLEASHED, PAYABLE_DETAIL_CLEAN, CONFIG_XERO_ITEMS

### Formula 2: Weighted Average Cost (Costing_Engine.js — `getWacFromPayables`)

```
For each item_code in PAYABLE_DETAIL_CLEAN:
  totalQty[item_code] += row.Quantity
  totalVal[item_code] += row.Gross_IDR

WAC[item_code] = totalVal[item_code] / totalQty[item_code]
```

- **Location:** `Costing_Engine.js:164-199`
- **Dependencies:** PAYABLE_DETAIL_CLEAN (Item_Code, Quantity, Gross_IDR columns)
- **Note:** Aggregates ALL historical payables. No date filtering. No per-period WAC.

### Formula 3: Cumulative Average Cost by Month (build_component_cost_history.js)

```
purchases = PAYABLE_DETAIL_CLEAN filtered by:
  isProductionComponent(supplier, item, desc)  # supplier-based filter
  normalizeComponent(item, desc)                # code normalization
  exclude voided entries

Sort purchases by date ASC

For each purchase (running cumulative):
  componentTotals[item].qty += purchase.qty
  componentTotals[item].cost += purchase.cost
  avgPrice = componentTotals[item].cost / componentTotals[item].qty

  monthlyData[month][item] = { qty: cumQty, cost: cumCost, avgPrice }
```

- **Location:** `build_component_cost_history.js:5-291`
- **Dependencies:** PAYABLE_DETAIL_CLEAN
- **Note:** Running cumulative average. Price at month M = total spend / total qty from all POs up to and including month M.

### Formula 4: Batch COGS (build_batch_cogs.js — `buildBatchCOGS`)

```
For each batch in PRODUCTION_RUNS_KMI:
  monthKey = formatDate(batch.Production_Date, 'yyyy-MM')
  recipe = BOM[batch.SKU_Code]  # from CONFIG_BOM_MASTER
  cases = batch.Cans_Produced / 24

  For each component in recipe:
    price = findPrice(component, monthKey):
      IF COMPONENT_COST_HISTORY[monthKey][component] exists → use it
      ELSE → scan backwards through months, use most recent prior month's price
      ELSE → 0 (flag "Missing")

    cost = component.Quantity_Per_Can × price

    Categorize by component code:
      PTUC*         → can_cost
      Box*/BOX*     → box_cost
      KMI PROD*     → filling_cost
      Citiric       → citric_cost
      BENZOATE      → benzoat_cost
      MN-BIT001     → bitter_agent_cost
      MNBITCIT      → bitter_citrus_cost
      MNF           → bergamot_cost
      SIIFLV Ginger → ginger_flavour_cost

  Total_COGS_per_can = SUM(all component costs)
```

- **Location:** `build_batch_cogs.js:4-198`
- **Dependencies:** CONFIG_BOM_MASTER, PRODUCTION_RUNS_KMI, COMPONENT_COST_HISTORY

### Formula 5: Gross Margin (margin.js — `updateGrossMarginMetrics`)

```
For each row in SALES_REVENUE_MASTER:
  SKIP if SKU_Name contains: accrued, ppn, freight, other, adjustment, credit

  monthKey = formatDate(Invoice_Date, 'yyyy-MM')

  unitCost = SKU_COSTING_MASTER lookup:
    MATCH by SKU_Code (exact, canonical only — no fuzzy matching)
    IF no match → track in COGS_EXCEPTIONS, skip COGS accumulation

  monthStats[monthKey].revenue += Revenue_IDR
  monthStats[monthKey].cogs += Quantity_Cans × unitCost

DQ Gate:
  coverage = (revenue - missingCostRevenue) / revenue
  IF coverage < 0.98 → DQ_Flag = "COGS_COVERAGE_<98%", skip GM calculation

Gross_Margin_Pct = (revenue - cogs) / revenue × 100
Gross_Margin_vs_Prev_Mo = (current_GM - previous_GM) × 100  # in ppts
```

- **Location:** `margin.js:27-448` (candid-labs-sales-master)
- **Dependencies:** SKU_COSTING_MASTER (Production DB, cross-sheet), SALES_REVENUE_MASTER (Sales DB)
- **DQ threshold:** 98% COGS coverage required

### Formula 6: Cost Per Case (derived)

```
Cost_per_case = Total_COGS_per_can × 24
```

- **Location:** Implicit. BATCH_COGS_MASTER stores `Total_COGS_per_can`. Cases = Cans / 24.
- **Not stored as a separate column.**

### Formula 7: Batch Total Cost (derived)

```
Batch_total_cost = Total_COGS_per_can × Cans_Produced
```

- **Location:** Not calculated or stored. Can be derived from BATCH_COGS_MASTER.

### Inventory Depletion

**Not implemented.** No inventory valuation, no stock draw-down logic, no finished goods ledger.

---

## Data Model

### Implicit Entities Currently in Use

| Entity | Fields Stored | Where Stored | Unique ID | Timestamped | Immutable |
|--------|--------------|--------------|-----------|-------------|-----------|
| **SKU** | SKU_Code, SKU_Name, Raw_COGS_IDR | SKU_COSTING_MASTER | SKU_Code (not enforced unique) | No | No (overwritten on each pipeline run) |
| **Batch** | Batch_ID, Production_Date, SKU_Code, SKU_Name, Plant_Name, Cans_Produced, Cases_Produced | PRODUCTION_RUNS_KMI | Batch_ID (`YYYYMMDD_SKU_CODE`) | Production_Date | No (overwritten on each pipeline run) |
| **BOM Recipe** | SKU_Code, Component_Code, Quantity_Per_Can, UoM, Notes | CONFIG_BOM_MASTER | Composite (SKU_Code + Component_Code) | No | No (overwritten by import script) |
| **Component** | Type, Category, SKU_Group, KMI_Item_Name, Component_Code, UoM, Vendor, Price_Type | CONFIG_COMPONENTS | Component_Code (not enforced) | No | No |
| **Component Cost (monthly)** | Month_Key, Component_Code, Component_Name, Cumulative_Qty, Cumulative_Cost_IDR, Cumulative_Avg_Price_IDR | COMPONENT_COST_HISTORY | Composite (Month_Key + Component_Code) | Month_Key | No (overwritten on each pipeline run) |
| **Payable Line** | Invoice_Date, Supplier_Name, Invoice_Number, Item_Code, Quantity, Gross_IDR, etc. | PAYABLE_DETAIL_CLEAN | None (no PK) | Invoice_Date | No (entire sheet rebuilt on each run) |
| **Batch COGS** | Batch_ID, Production_Date, SKU_Code, Cans, Cases, Total_COGS_per_can, 9 component cost columns | BATCH_COGS_MASTER | Batch_ID (not enforced) | Production_Date | No (overwritten on each pipeline run) |
| **KMI Packaging Movement** | Tanggal, No Material, Material, Stock awal, Masuk, Pemakaian produksi, BPB, Retur, Stock akhir | KMI_PACKAGING_RAW | None (no PK) | Tanggal (date) | No (raw paste) |
| **KMI FG Batch** | SKU_Code, Batch_ID, Production_Date, Cases/Cans | KMI_FG_BATCH_CLEAN | Batch_ID | Production_Date | No (overwritten on each run) |
| **KMI FG Shipment** | Shipment_Date, SKU_Code, Batch_ID, DO_Number, Destination, Qty | KMI_FG_SHIPMENTS_CLEAN | Composite (Shipment_Date + DO_Number) | Shipment_Date | No (overwritten on each run) |
| **ARAP Snapshot** | Snapshot_Date, Metric_Type, Contact_Name, aging buckets | AR_AP_SUMMARY | Composite (Snapshot_Date + Contact) | Snapshot_Date | No (overwritten on each run) |
| **Revenue Transaction** | Transaction_ID, Invoice_Date, SKU_Name, Quantity_Cans, Revenue_IDR | SALES_REVENUE_MASTER (Sales DB) | Transaction_ID | Invoice_Date | No |
| **Deck Metrics** | Month_Key, Gross_Margin_Pct, Gross_Margin_vs_Prev_Mo, DQ_Flag | DECK_METRICS (Sales DB) | Month_Key | N/A | No (overwritten on each run) |
| **COGS Exception** | SKU_Code, SKU_Name, Total_Revenue_Impact, First_Seen_Date, Row_Count, Reason | COGS_EXCEPTIONS (Sales DB) | SKU_Code or SKU_Name | First/Last_Seen_Date | No (accumulative updates) |
| **Xero Item** | Code, Name, Cost price, Sale price | CONFIG_XERO_ITEMS | Code | No | No (manual paste) |

### Missing Entities (not modelled anywhere)

- **RawMaterialLot** — No lot-level tracking. All purchases aggregated globally or by month.
- **PackagingLot** — No lot-level tracking.
- **ProductionEvent** — Partially covered by PRODUCTION_RUNS_KMI but no linkage to consumed input lots.
- **SalesEvent at can level** — Revenue is at invoice line level, not individual can level.
- **FinishedGoodsInventory** — No on-hand valuation. KMI_FG_STOCK_SUMMARY tracks physical counts but not cost layers.
- **PurchaseOrder** — Not modelled. Payables are invoice lines, not POs.

---

## FIFO Status

### 1. Is FIFO actually implemented?

**No.**

### 2. What logic is being used instead?

**Two separate averaging methods, neither of which is FIFO:**

#### A. SKU-Level Costing (Costing_Engine.js)
- **Method:** Global Weighted Average Cost (WAC) across all historical payables
- **Calculation:** `totalCostAllTime / totalQtyAllTime`
- **No date scoping.** A purchase from 2024-01 has the same weight as one from 2026-02.
- **Falls through** to Xero standard cost or BOM estimate if no payable data exists.

#### B. Batch-Level Costing (build_batch_cogs.js)
- **Method:** Month-based cumulative average from COMPONENT_COST_HISTORY
- **Calculation:** For production in month M, look up `Cumulative_Avg_Price_IDR` for month M.
- **Fallback:** If no cost data for month M, scan backwards to find most recent prior month's price.
- **Not FIFO** because:
  - No individual purchase lots are tracked
  - No layer depletion (consuming oldest cost layer first)
  - Price is a running cumulative average, not a cost layer
  - Same price applies to all units consumed in a month regardless of actual purchase timing

#### C. Inventory Depletion
- **Not implemented.** No mechanism to:
  - Track opening/closing stock by cost layer
  - Deplete oldest layers first
  - Value remaining inventory at layered costs

---

## Structural Gaps

### Missing Data for True FIFO

1. **No purchase lot identity.** Payables are aggregated by item code. Individual PO lines lose their identity after `cleanPayables()`.
2. **No lot-level quantity tracking.** Cannot determine how many units from PO #X remain unconsumed.
3. **No production-to-PO linkage.** No record of which production batch consumed units from which purchase lot.
4. **No opening/closing inventory by cost layer.** No mechanism to carry forward unconsumed lots from month to month.
5. **No date-scoped WAC.** The SKU-level WAC uses all-time aggregation, making it impossible to isolate costs to a period.

### Manual Steps

1. VA pastes Xero payables export into PAYABLE_DETAIL_RAW (monthly).
2. VA pastes Xero aged reports into AGED_RECEIVABLES_RAW and AGED_PAYABLES_RAW.
3. VA pastes Xero product list into CONFIG_XERO_ITEMS.
4. VA pastes KMI daily packaging report into KMI_PACKAGING_RAW (monthly or as received).
5. VA pastes KMI raw material movements into KMI_RM_RAW.
6. VA pastes KMI finished goods data into KMI_TAB-CLUB-RAW, KMI_TAB-IMPERIAL-RAW, KMI_TAB-GINGER-RAW.
7. VA pastes Unleashed BOM CSV into CONFIG_BOM_UNLEASHED (when BOM changes).
8. VA triggers `runAllProductionPipelines()` after paste.

### Fragile Assumptions

1. **Supplier-based component filtering.** `isProductionComponent()` uses hardcoded supplier name matching (`UNITED` → cans, `CMI` → boxes, `KMI` → filling). Adding a new supplier requires code change.
2. **Component normalization map.** `NORMALIZE_MAP` in `build_component_cost_history.js` contains 40+ hardcoded string-to-code mappings. New products or supplier naming changes require code update.
3. **`KMI_CAN_MATERIAL_MAP` for production runs.** `buildProductionRuns.js` uses a hardcoded map from KMI material numbers to SKU codes. Adding a new SKU requires code change.
4. **Cases = Cans / 24.** Hardcoded. No support for different pack sizes.
5. **IDR-only assumption.** WAC calculation reads `Gross_IDR` — no multi-currency support. FX conversion happens in `cleanPayables()` but is hardcoded to `Currency: 'IDR', FX_Rate: 1`.
6. **BOM is static.** No BOM versioning or effective dates. A BOM change retroactively affects all historical batch COGS on next pipeline run.
7. **All outputs are destructive rebuilds.** Every pipeline run clears and rewrites: PAYABLE_DETAIL_CLEAN, COMPONENT_COST_HISTORY, SKU_COSTING_MASTER, BATCH_COGS_MASTER, PRODUCTION_RUNS_KMI. No append, no history.

### Places Where Accountants Override Cost

1. **CONFIG_BOM_UNLEASHED col 4 (static cost).** Tier 3 fallback. Manually maintained. Used when neither PO nor Xero standard cost exists.
2. **CONFIG_XERO_ITEMS.** Standard costs set in Xero by finance team. Used as Tier 2 fallback. Can be updated in Xero at any time.
3. **COGS_EXCEPTIONS manual resolution.** Unmatched SKUs flagged in COGS_EXCEPTIONS must be manually resolved (map SKU code, or add missing cost) before margin is accurate.

### Circular Dependencies

1. **SKU_COSTING_MASTER → margin.js → DECK_METRICS.** Margin calculation depends on costing output. If costing pipeline hasn't run, margin uses stale costs. No dependency enforcement.
2. **COMPONENT_COST_HISTORY → BATCH_COGS_MASTER.** Batch COGS depends on component cost history. Both are rebuilt from PAYABLE_DETAIL_CLEAN. If payables data is stale, both outputs are stale. No staleness detection.
3. **No circular formula dependencies.** The pipeline is strictly sequential: cleanPayables → buildComponentCostHistory → costingEngine → buildBatchCOGS → margin. But there is no enforcement — any step can be run in isolation with stale inputs.
