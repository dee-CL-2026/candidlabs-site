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
