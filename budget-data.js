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

  fy2025: {
    // Full Year Jan - Dec 2025
    revenue: 5516371625,
    cogs: 2495023912,
    grossProfit: 3021347713,
    opex: {
      salaries: 605083333,
      marketing: 533385084,
      consulting: 322640840,
      travel: 51390190,
      storage: 142830000,
      transport: 222285150,
      subscriptions: 125400887,
      legal: 209909694,
      thirdParty: 8562654,
      taxes: 51672141,
      other: 258805625
    },
    totalOpex: 2531965598,
    ebitda: 489382115,
    netProfit: 445004103,
    // Calculated ratios
    grossMarginPct: 54.8,
    opexPct: 45.9,
    netMarginPct: 8.1
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
// Source: PKF Indonesia / Xero Monthly P&L
// FY2024: Jan-Dec 2024 | FY2025: Jan-Dec 2025 (Full Year)
const detailedLineItems = [
  { name: "Trading Income", fy2024: 0, fy2025: 0, category: "revenue", isHeader: true },
  { name: "Sales", fy2024: 5032806434, fy2025: 5516371625, category: "revenue", isHeader: false },

  { name: "Cost of Sales", fy2024: 0, fy2025: 0, category: "cogs", isHeader: true },
  { name: "Cost of Goods Sold", fy2024: 2985848724, fy2025: 2495023912, category: "cogs", isHeader: false },

  { name: "Gross Profit", fy2024: 2046957710, fy2025: 3021347713, category: "subtotal", isHeader: false },

  { name: "Operating Expenses", fy2024: 0, fy2025: 0, category: "expense", isHeader: true },
  { name: "Wages and Salaries", fy2024: 170550000, fy2025: 605083333, category: "expense", isHeader: false, editable: true },
  { name: "Marketing", fy2024: 405491137, fy2025: 533385084, category: "expense", isHeader: false, editable: true },
  { name: "Consulting & Accounting", fy2024: 71000000, fy2025: 322640840, category: "expense", isHeader: false, editable: true },
  { name: "Transport/Logistics", fy2024: 148445730, fy2025: 222285150, category: "expense", isHeader: false, editable: true },
  { name: "Legal expenses", fy2024: 286984299, fy2025: 209909694, category: "expense", isHeader: false, editable: true },
  { name: "Storage and Warehousing", fy2024: 85680000, fy2025: 142830000, category: "expense", isHeader: false, editable: true },
  { name: "Subscriptions", fy2024: 40031346, fy2025: 125400887, category: "expense", isHeader: false, editable: true },
  { name: "Outsourcing", fy2024: 15175207, fy2025: 75573701, category: "expense", isHeader: false, editable: true },
  { name: "Flight and Accommodation", fy2024: 62509289, fy2025: 51390190, category: "expense", isHeader: false, editable: true },
  { name: "PIT 21 Allowance", fy2024: 5423200, fy2025: 51672141, category: "expense", isHeader: false, editable: true },
  { name: "BPJS Ketenagakerjaan", fy2024: 8734014, fy2025: 41407979, category: "expense", isHeader: false, editable: true },
  { name: "Shareholder Strategy Meeting", fy2024: 17084232, fy2025: 27087780, category: "expense", isHeader: false, editable: true },
  { name: "General Expenses", fy2024: 0, fy2025: 22806738, category: "expense", isHeader: false, editable: true },
  { name: "Meal and Entertainment", fy2024: 47795672, fy2025: 19512594, category: "expense", isHeader: false, editable: true },
  { name: "BPJS Kesehatan", fy2024: 3600000, fy2025: 18400000, category: "expense", isHeader: false, editable: true },
  { name: "Printing & Stationery", fy2024: 0, fy2025: 8853447, category: "expense", isHeader: false, editable: true },
  { name: "Third Party Expenses", fy2024: 29481523, fy2025: 8562654, category: "expense", isHeader: false, editable: true },
  { name: "Pallet Rent", fy2024: 7388200, fy2025: 8068750, category: "expense", isHeader: false, editable: true },
  { name: "Office Expenses", fy2024: 3841757, fy2025: 7185000, category: "expense", isHeader: false, editable: true },
  { name: "Motor Vehicle Expenses", fy2024: 7002794, fy2025: 7212852, category: "expense", isHeader: false, editable: true },
  { name: "Advertising", fy2024: 0, fy2025: 6862600, category: "expense", isHeader: false, editable: true },
  { name: "Bank Fees", fy2024: 1557469, fy2025: 6808564, category: "expense", isHeader: false, editable: true },
  { name: "Research and Development", fy2024: 10825000, fy2025: 2722500, category: "expense", isHeader: false, editable: true },
  { name: "Donation", fy2024: 0, fy2025: 2255000, category: "expense", isHeader: false, editable: true },
  { name: "Tax Expense", fy2024: 0, fy2025: 1958075, category: "expense", isHeader: false, editable: true },
  { name: "Freight & Courier", fy2024: 0, fy2025: 1803685, category: "expense", isHeader: false, editable: true },
  { name: "Depreciation", fy2024: 1361004, fy2025: 935896, category: "expense", isHeader: false, editable: true },
  { name: "Unrealized FX Gain/Loss", fy2024: 6863143, fy2025: 232659, category: "expense", isHeader: false, editable: true },
  { name: "Bad Debt", fy2024: 799200, fy2025: 53700, category: "expense", isHeader: false, editable: true },
  { name: "Listing Fee", fy2024: 111740946, fy2025: 0, category: "expense", isHeader: false, editable: true },
  { name: "PPh Income Tax", fy2024: 26525228, fy2025: 0, category: "expense", isHeader: false, editable: true },

  { name: "Total Operating Expenses", fy2024: 1576117035, fy2025: 2531965598, category: "subtotal", isHeader: false },

  { name: "EBITDA", fy2024: 470840675, fy2025: 489382115, category: "subtotal", isHeader: false },

  { name: "Other Income/Expense", fy2024: 0, fy2025: 0, category: "other_income", isHeader: true },
  { name: "Interest Income", fy2024: 723510, fy2025: 3479074, category: "other_income", isHeader: false, editable: true },
  { name: "Interest Loan", fy2024: 0, fy2025: -46441420, category: "other_income", isHeader: false, editable: true },
  { name: "Interest Expense", fy2024: 0, fy2025: -479771, category: "other_income", isHeader: false, editable: true },

  { name: "Net Profit", fy2024: 471564185, fy2025: 445004103, category: "total", isHeader: false },
];

// SKU Data for Revenue Builder
// Prices in IDR per case
const skuData = [
  { sku: "Club Soda", pricePerCase: 163200, fy2025Volume: 0, channel: "On Trade" },
  { sku: "Imperial", pricePerCase: 163200, fy2025Volume: 0, channel: "On Trade" },
  { sku: "Ginger", pricePerCase: 163200, fy2025Volume: 0, channel: "On Trade" },
  { sku: "Green Tea", pricePerCase: 115200, fy2025Volume: 0, channel: "On Trade" },
  { sku: "Finn's Breeze", pricePerCase: 163200, fy2025Volume: 0, channel: "On Trade" },
];

// Channel data
const channelData = [
  { channel: "On Trade", fy2024: 5032806434, fy2025: 5516371625, description: "Hotels, Restaurants, Bars" },
  { channel: "Modern Trade", fy2024: 0, fy2025: 0, description: "Supermarkets, Convenience Stores" },
  { channel: "E-commerce", fy2024: 0, fy2025: 0, description: "Online marketplaces" },
];

// Expense ratios based on FY2025 actuals (as % of revenue)
const expenseRatios = {
  cogs: 45.2,           // COGS as % of revenue
  wages: 11.0,          // Wages & salaries
  marketing: 9.7,       // Marketing
  consulting: 5.8,      // Consulting & accounting
  transport: 4.0,       // Transport/logistics
  storage: 2.6,         // Storage & warehousing
  legal: 3.8,           // Legal
  subscriptions: 2.3,   // Subscriptions
  other: 6.5,           // Other OpEx
  totalOpex: 45.9,      // Total OpEx as % of revenue
};
