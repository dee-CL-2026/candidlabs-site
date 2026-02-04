# Budget Planner - Implementation Plan

**Goal:** Interactive 2026 budget tool grounded in historical performance with adjustable assumptions

---

## Data Structure

### Historical Actuals (from PKF Indonesia)
```
FY2023 | FY2024 | FY2025 (actual/projected)
```

### Budget Categories

| Category | Line Items |
|----------|------------|
| **Revenue** | Total Sales, by Channel (if available) |
| **COGS** | Raw Materials, Packaging, Filling, Production Labor |
| **Gross Profit** | Revenue - COGS |
| **Operating Expenses** | Salaries, Marketing, Distribution, Admin, Other |
| **EBITDA** | Gross Profit - OpEx |
| **Other** | Interest, Depreciation, Tax (if needed) |
| **Net Income** | Bottom line |

---

## Assumptions Engine (User Adjustable)

| Assumption | Default | Range | Impact |
|------------|---------|-------|--------|
| Revenue Growth % | 20% | 0-50% | Scales total revenue |
| COGS % of Revenue | (from historical) | 40-70% | Affects gross margin |
| Headcount Change | 0 | -5 to +10 | Salary expense |
| Avg Salary Increase % | 5% | 0-15% | Salary expense |
| Marketing Spend % | (from historical) | 0-20% | Marketing line |
| New Channel Revenue | 0 | 0-500M IDR | Additional revenue |

---

## UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│  BUDGET PLANNER 2026                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │ ASSUMPTIONS     │  │ P&L SUMMARY                     │  │
│  │                 │  │                                 │  │
│  │ Revenue Growth  │  │        FY24   FY25   FY26(B)   │  │
│  │ [====●====] 20% │  │ Revenue  XX    XX     XX       │  │
│  │                 │  │ COGS     XX    XX     XX       │  │
│  │ COGS %          │  │ Gross    XX    XX     XX       │  │
│  │ [====●====] 55% │  │ OpEx     XX    XX     XX       │  │
│  │                 │  │ EBITDA   XX    XX     XX       │  │
│  │ Headcount +/-   │  │                                 │  │
│  │ [====●====] +2  │  │ [Chart: YoY comparison]        │  │
│  │                 │  │                                 │  │
│  │ Marketing %     │  └─────────────────────────────────┘  │
│  │ [====●====] 8%  │                                       │
│  │                 │  ┌─────────────────────────────────┐  │
│  │ [Base Case]     │  │ SCENARIO COMPARISON             │  │
│  │ [Stretch]       │  │                                 │  │
│  │ [Conservative]  │  │ Base vs Stretch vs Conservative │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Files to Create/Modify
1. `budget.html` - Main tool page (already exists, needs rebuild)
2. `budget.js` - Calculation engine + UI logic
3. `budget-data.js` - Historical data (JSON format)
4. `styles.css` - Add budget-specific styles

### Key Features
- **Real-time calculation:** Sliders update projections instantly
- **Scenario presets:** Base, Stretch, Conservative buttons
- **Export:** Copy to clipboard or download as CSV
- **Responsive:** Works on desktop and tablet

### Data Flow
```
Historical Data (JSON)
    ↓
Assumptions (User Input)
    ↓
Calculation Engine (JS)
    ↓
Display (Tables + Charts)
```

---

## Implementation Steps

### Step 1: Data Setup
- [x] User provides PKF historical data
- [x] Convert to JSON format in `budget-data.js`
- [x] Structure: { fy2024: {...}, fy2025_ytd: {...} }

### Step 2: Build Calculation Engine
- [x] Create `budget.js` with projection functions
- [x] applyGrowth(base, rate)
- [x] calculateCOGS(revenue, cogsPercent)
- [x] calculateOpEx(headcount, avgSalary, marketing, other)
- [x] calculateEBITDA(grossProfit, opex)

### Step 3: Build UI
- [x] Assumptions panel with sliders
- [x] P&L summary table (FY24, FY26 Budget)
- [x] YoY change indicators
- [x] Scenario preset buttons

### Step 4: Add Interactivity
- [x] Slider event listeners
- [x] Real-time recalculation
- [x] Scenario switching
- [x] Number formatting (IDR)

### Step 5: Polish
- [x] Mobile responsive
- [x] Dark mode support (via existing theme toggle)
- [ ] Export functionality (future enhancement)

---

## Questions Before Building

1. **What format is PKF data?** (Excel, PDF - need key numbers)
2. **Currency:** IDR throughout, or need USD conversion?
3. **Fiscal year:** Jan-Dec or different?
4. **Granularity:** Annual totals sufficient, or need monthly?
5. **Who sees this:** Board-level summary or operational detail?

---

## Sample Data Structure (placeholder until real data)

```javascript
const historicalData = {
  fy2024: {
    revenue: 2000000000,      // 2B IDR
    cogs: 1100000000,         // 55%
    grossProfit: 900000000,
    opex: {
      salaries: 400000000,
      marketing: 150000000,
      distribution: 100000000,
      admin: 80000000,
      other: 50000000
    },
    totalOpex: 780000000,
    ebitda: 120000000
  },
  fy2025: {
    // ... similar structure
  }
};
```

---

*Plan created: 2026-02-04*
