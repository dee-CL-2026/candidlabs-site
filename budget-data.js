// Historical Financial Data - PT Unisoda Mitra Jaya (Candid Mixers)
// Source: PKF Indonesia / Xero P&L Reports
// Currency: IDR

const historicalData = {
  fy2024: {
    revenue: 5032806434,
    cogs: 2985848724,
    grossProfit: 2046957710,
    opex: {
      salaries: 133550000,        // Wages and Salaries
      marketing: 672064626,       // Marketing + Listing Fees
      consulting: 59000000,       // Consulting & Accounting
      travel: 67605274,           // Flight and Accommodation
      storage: 86160000,          // Storage and Warehousing
      transport: 146103750,       // Transport/Logistics
      subscriptions: 46128497,    // Subscriptions
      legal: 287234299,           // Legal expenses
      thirdParty: 25381523,       // Third Party Expenses
      taxes: 24296150,            // PPh Income Tax
      other: 28592916             // Office, depreciation, bank fees, etc.
    },
    totalOpex: 1576117035,
    otherIncome: 723988,
    netProfit: 471564185,
    // Calculated ratios
    grossMarginPct: 40.7,
    opexPct: 31.3,
    netMarginPct: 9.4
  },

  fy2025_ytd: {
    // Jan - Mar 2025 (Q1)
    months: 3,
    revenue: 611886227,
    cogs: 113192554,
    grossProfit: 498693673,
    totalOpex: 672205418,  // Includes high legal fees (one-time)
    netProfit: -172509205,
    // Note: Q1 has unusually high OpEx due to one-time legal costs
    notes: "Q1 includes ~400M IDR one-time legal expenses"
  },

  // Monthly breakdown for 2024 (for trend analysis)
  fy2024_monthly: {
    revenue: [
      214556928,   // Jan
      148129730,   // Feb
      182620541,   // Mar
      555360000,   // Apr
      485827276,   // May
      465408000,   // Jun
      565907027,   // Jul
      629054097,   // Aug
      510848088,   // Sep
      509204432,   // Oct
      397163243,   // Nov
      324660000    // Dec
    ],
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  }
};

// Default assumptions for 2026 budget
const defaultAssumptions = {
  revenueGrowthPct: 20,      // 20% YoY growth
  cogsRatioPct: 55,          // Target 55% COGS (improve from 59%)
  salaryIncreasePct: 10,     // 10% salary increase
  headcountChange: 2,        // Add 2 people
  avgSalaryPerHead: 5000000, // 5M IDR/month per new head
  marketingPct: 8,           // 8% of revenue
  adminGrowthPct: 5,         // 5% growth in admin costs
  newChannelRevenue: 0       // Additional revenue from new channels
};

// Stretch scenario
const stretchAssumptions = {
  revenueGrowthPct: 35,
  cogsRatioPct: 52,
  salaryIncreasePct: 15,
  headcountChange: 4,
  avgSalaryPerHead: 5000000,
  marketingPct: 10,
  adminGrowthPct: 8,
  newChannelRevenue: 500000000
};

// Conservative scenario
const conservativeAssumptions = {
  revenueGrowthPct: 10,
  cogsRatioPct: 58,
  salaryIncreasePct: 5,
  headcountChange: 0,
  avgSalaryPerHead: 5000000,
  marketingPct: 6,
  adminGrowthPct: 3,
  newChannelRevenue: 0
};

// Detailed P&L Line Items with Historical Data
// Source: PKF Indonesia / Xero Monthly P&L (Jan 2024 - Mar 2025)
const detailedLineItems = [
  { name: "Trading Income", fy2024: 0, fy2025_ytd: 0, category: "revenue", isHeader: true },
  { name: "Sales", fy2024: 5032806434, fy2025_ytd: 611886227, category: "revenue", isHeader: false },

  { name: "Cost of Sales", fy2024: 0, fy2025_ytd: 0, category: "cogs", isHeader: true },
  { name: "Cost of Goods Sold", fy2024: 2985848724, fy2025_ytd: 113192554, category: "cogs", isHeader: false },

  { name: "Gross Profit", fy2024: 2046957710, fy2025_ytd: 498693673, category: "subtotal", isHeader: false },

  { name: "Operating Expenses", fy2024: 0, fy2025_ytd: 0, category: "expense", isHeader: true },
  { name: "Wages and Salaries", fy2024: 170550000, fy2025_ytd: 173825528, category: "expense", isHeader: false, editable: true },
  { name: "BPJS Kesehatan", fy2024: 3600000, fy2025_ytd: 4800000, category: "expense", isHeader: false, editable: true },
  { name: "BPJS Ketenagakerjaan", fy2024: 8734014, fy2025_ytd: 8939000, category: "expense", isHeader: false, editable: true },
  { name: "Marketing", fy2024: 405491137, fy2025_ytd: 271236348, category: "expense", isHeader: false, editable: true },
  { name: "Listing Fee", fy2024: 111740946, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Transport/Logistics", fy2024: 148445730, fy2025_ytd: 5212000, category: "expense", isHeader: false, editable: true },
  { name: "Storage and Warehousing", fy2024: 85680000, fy2025_ytd: 29790000, category: "expense", isHeader: false, editable: true },
  { name: "Consulting & Accounting", fy2024: 71000000, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Legal expenses", fy2024: 286984299, fy2025_ytd: 136920376, category: "expense", isHeader: false, editable: true, note: "Includes one-time costs" },
  { name: "Flight and Accommodation", fy2024: 62509289, fy2025_ytd: 8674060, category: "expense", isHeader: false, editable: true },
  { name: "Meal and Entertainment", fy2024: 47795672, fy2025_ytd: 1582350, category: "expense", isHeader: false, editable: true },
  { name: "Subscriptions", fy2024: 40031346, fy2025_ytd: 15332396, category: "expense", isHeader: false, editable: true },
  { name: "Third Party Expenses", fy2024: 29481523, fy2025_ytd: 8562654, category: "expense", isHeader: false, editable: true },
  { name: "PPh Income Tax", fy2024: 26525228, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Shareholder Strategy Meeting", fy2024: 17084232, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Outsourcing", fy2024: 15175207, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Research and Development", fy2024: 10825000, fy2025_ytd: 2722500, category: "expense", isHeader: false, editable: true },
  { name: "Motor Vehicle Expenses", fy2024: 7002794, fy2025_ytd: 1178852, category: "expense", isHeader: false, editable: true },
  { name: "Pallet Rent", fy2024: 7388200, fy2025_ytd: 1180000, category: "expense", isHeader: false, editable: true },
  { name: "Unrealized FX Gain/Loss", fy2024: 6863143, fy2025_ytd: 286773, category: "expense", isHeader: false, editable: true },
  { name: "Tax Allowance", fy2024: 5423200, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Office Expenses", fy2024: 3841757, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Bank Fees", fy2024: 1557469, fy2025_ytd: 1821095, category: "expense", isHeader: false, editable: true },
  { name: "Depreciation", fy2024: 1361004, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Bad Debt", fy2024: 799200, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Telephone & Internet", fy2024: 226645, fy2025_ytd: 0, category: "expense", isHeader: false, editable: true },
  { name: "Interest Expense", fy2024: 0, fy2025_ytd: 141486, category: "expense", isHeader: false, editable: true },

  { name: "Total Operating Expenses", fy2024: 1576117035, fy2025_ytd: 672205418, category: "subtotal", isHeader: false },

  { name: "Other Income", fy2024: 0, fy2025_ytd: 0, category: "other_income", isHeader: true },
  { name: "Interest Income", fy2024: 723510, fy2025_ytd: 1002540, category: "other_income", isHeader: false, editable: true },

  { name: "Net Profit", fy2024: 471564185, fy2025_ytd: -172509205, category: "total", isHeader: false },
];
