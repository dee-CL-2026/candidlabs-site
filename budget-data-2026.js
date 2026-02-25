// Budget Data - PT Unisoda Mitra Jaya (Candid Mixers)
// FY2026 Projections | Source: Anders Planning Call (Feb 4, 2026)
// Currency: IDR

// =============================================================================
// HISTORICAL COMPARISON (FY2024-2025 Actuals)
// =============================================================================

const historicalData = {
  fy2024: {
    revenue: 5032806434,
    cogs: 2985848724,
    grossProfit: 2046957710,
    totalOpex: 1576117035,
    ebitda: 470840675,
    netProfit: 471564185,
    grossMarginPct: 40.7,
    cogsPct: 59.3,
    opexPct: 31.3,
    netMarginPct: 9.4
  },
  fy2025: {
    revenue: 5516371625,
    cogs: 2495023912,
    grossProfit: 3021347713,
    totalOpex: 2531965598,
    ebitda: 489382115,
    netProfit: 445004103,
    grossMarginPct: 54.8,
    cogsPct: 45.2,
    opexPct: 45.9,
    netMarginPct: 8.1
  }
};

// =============================================================================
// FY2026 SCENARIO DEFINITIONS
// =============================================================================

const fy2026_scenarios = {
  conservative: {
    name: "Conservative",
    description: "50% growth - deliver on commitments, minimal risk",
    revenueGrowthPct: 50,
    targetRevenue: 8280000000,
    cogsPct: 45,
    grossMarginPct: 55,
    assumptions: {
      holywingsCasesMonth: 500,
      groupsCasesMonth: 300,
      listingsCasesMonth: 500,
      newSkuLaunch: "Q4",
      seniorHire: false,
      newFieldStaff: 1
    }
  },
  base: {
    name: "Base",
    description: "75% growth - execute the plan, reasonable upside",
    revenueGrowthPct: 75,
    targetRevenue: 9660000000,
    cogsPct: 44,
    grossMarginPct: 56,
    assumptions: {
      holywingsCasesMonth: 1000,
      groupsCasesMonth: 600,
      listingsCasesMonth: 1000,
      newSkuLaunch: "Q3+Q4",
      seniorHire: true,
      seniorHireStart: "Q3",
      newFieldStaff: 2
    }
  },
  stretch: {
    name: "Stretch",
    description: "100% growth - everything clicks, capture full potential",
    revenueGrowthPct: 100,
    targetRevenue: 11030000000,
    cogsPct: 43,
    grossMarginPct: 57,
    assumptions: {
      holywingsCasesMonth: 1200,
      groupsCasesMonth: 1000,
      listingsCasesMonth: 2000,
      newSkuLaunch: "Q3",
      seniorHire: true,
      seniorHireStart: "Q2",
      newFieldStaff: 3,
      aviationChannel: true
    }
  }
};

// =============================================================================
// FY2026 BASE SCENARIO - DETAILED P&L
// =============================================================================

const fy2026_base = {
  // Full Year Projections
  revenue: 9660000000,
  cogs: 4250400000,
  grossProfit: 5409600000,
  opex: {
    salaries: 850000000,          // +33% for new hires + senior hire H2
    marketing: 900000000,         // Ryan's marketing plan
    consulting: 400000000,        // Maintained
    travel: 100000000,            // Increased for roadshows
    storage: 240000000,           // Scaled with volume
    transport: 385000000,         // 4% of revenue
    subscriptions: 150000000,     // Tools & platforms
    legal: 150000000,             // Reduced from FY25 (cleanup done)
    thirdParty: 50000000,         // Minimal
    taxes: 80000000,              // Scaled
    bpjs: 75000000,               // Employee benefits
    other: 260000000              // General admin
  },
  totalOpex: 3440000000,
  ebitda: 919600000,
  interestExpense: -50000000,
  netProfit: 869600000,
  
  // Key Ratios
  grossMarginPct: 56.0,
  cogsPct: 44.0,
  opexPct: 35.6,
  ebitdaMarginPct: 9.5,
  netMarginPct: 9.0
};

// =============================================================================
// FY2026 CONSERVATIVE SCENARIO - DETAILED P&L
// =============================================================================

const fy2026_conservative = {
  revenue: 8280000000,
  cogs: 3726000000,
  grossProfit: 4554000000,
  opex: {
    salaries: 750000000,
    marketing: 700000000,
    consulting: 400000000,
    travel: 80000000,
    storage: 200000000,
    transport: 330000000,
    subscriptions: 130000000,
    legal: 150000000,
    thirdParty: 40000000,
    taxes: 70000000,
    bpjs: 65000000,
    other: 240000000
  },
  totalOpex: 3005000000,
  ebitda: 549000000,
  interestExpense: -40000000,
  netProfit: 509000000,
  
  grossMarginPct: 55.0,
  cogsPct: 45.0,
  opexPct: 36.3,
  ebitdaMarginPct: 6.6,
  netMarginPct: 6.1
};

// =============================================================================
// FY2026 STRETCH SCENARIO - DETAILED P&L
// =============================================================================

const fy2026_stretch = {
  revenue: 11030000000,
  cogs: 4742900000,
  grossProfit: 6287100000,
  opex: {
    salaries: 1000000000,
    marketing: 1100000000,
    consulting: 420000000,
    travel: 120000000,
    storage: 280000000,
    transport: 441000000,
    subscriptions: 170000000,
    legal: 150000000,
    thirdParty: 60000000,
    taxes: 100000000,
    bpjs: 85000000,
    other: 274000000
  },
  totalOpex: 4000000000,
  ebitda: 1287100000,
  interestExpense: -65000000,
  netProfit: 1222100000,
  
  grossMarginPct: 57.0,
  cogsPct: 43.0,
  opexPct: 36.3,
  ebitdaMarginPct: 11.7,
  netMarginPct: 11.1
};

// =============================================================================
// MONTHLY PROJECTIONS - BASE SCENARIO
// =============================================================================

const fy2026_monthly_base = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  
  revenue: [
    650000000,   // Jan - Q1 ramp-up
    620000000,   // Feb - Holywings launch
    700000000,   // Mar
    750000000,   // Apr - Q2 acceleration
    780000000,   // May
    800000000,   // Jun
    900000000,   // Jul - Peak season start, new SKU
    950000000,   // Aug - Peak
    880000000,   // Sep
    850000000,   // Oct - Q4 stabilization
    920000000,   // Nov - Pre-holiday
    860000000    // Dec
  ],
  
  cogs: [
    286000000,   // Jan (44%)
    273000000,   // Feb
    308000000,   // Mar
    330000000,   // Apr
    343000000,   // May
    352000000,   // Jun
    396000000,   // Jul
    418000000,   // Aug
    387000000,   // Sep
    374000000,   // Oct
    405000000,   // Nov
    378000000    // Dec
  ],
  
  grossProfit: [
    364000000,   // Jan
    347000000,   // Feb
    392000000,   // Mar
    420000000,   // Apr
    437000000,   // May
    448000000,   // Jun
    504000000,   // Jul
    532000000,   // Aug
    493000000,   // Sep
    476000000,   // Oct
    515000000,   // Nov
    482000000    // Dec
  ],
  
  opex: [
    270000000,   // Jan
    270000000,   // Feb
    280000000,   // Mar
    280000000,   // Apr
    285000000,   // May
    285000000,   // Jun
    295000000,   // Jul - Senior hire
    295000000,   // Aug
    290000000,   // Sep
    290000000,   // Oct
    300000000,   // Nov
    300000000    // Dec
  ],
  
  ebitda: [
    94000000,    // Jan
    77000000,    // Feb
    112000000,   // Mar
    140000000,   // Apr
    152000000,   // May
    163000000,   // Jun
    209000000,   // Jul
    237000000,   // Aug
    203000000,   // Sep
    186000000,   // Oct
    215000000,   // Nov
    182000000    // Dec
  ],
  
  cases: [
    5000,        // Jan
    4800,        // Feb
    5400,        // Mar
    5800,        // Apr
    6000,        // May
    6200,        // Jun
    7000,        // Jul
    7400,        // Aug
    6800,        // Sep
    6600,        // Oct
    7100,        // Nov
    6700         // Dec
  ]
};

// =============================================================================
// REVENUE BY CHANNEL - BASE SCENARIO
// =============================================================================

const fy2026_channels_base = {
  onTrade: {
    name: "On Trade (Hotels, Bars, Restaurants)",
    annual: 5840000000,
    pctOfTotal: 60.5,
    monthlyAvg: 487000000,
    growth: "Existing SKD accounts + hotel groups"
  },
  finns: {
    name: "Finns (Premium Account)",
    annual: 1580000000,
    pctOfTotal: 16.4,
    monthlyAvg: 132000000,
    growth: "Stable, slight expansion"
  },
  holywings: {
    name: "Holywings",
    annual: 1100000000,
    pctOfTotal: 11.4,
    monthlyAvg: 92000000,
    growth: "New in Feb 2026, ramp to 1000 cases/mo"
  },
  modernTrade: {
    name: "Modern Trade (Supermarkets, Minimarks)",
    annual: 860000000,
    pctOfTotal: 8.9,
    monthlyAvg: 72000000,
    growth: "Target 2000 outlets by year-end"
  },
  newSkus: {
    name: "New SKUs (H2)",
    annual: 280000000,
    pctOfTotal: 2.9,
    monthlyAvg: 47000000,
    growth: "Launch Q3, scale Q4"
  }
};

// =============================================================================
// REVENUE BY SKU - BASE SCENARIO
// =============================================================================

const fy2026_sku_base = {
  clubSoda: {
    name: "Club Soda",
    casesAnnual: 35000,
    pricePerCase: 90000,    // To SKD
    revenueAnnual: 3150000000,
    pctOfTotal: 32.6,
    notes: "Volume leader, 30K production runs"
  },
  imperial: {
    name: "Imperial Tonic",
    casesAnnual: 28000,
    pricePerCase: 102000,
    revenueAnnual: 2856000000,
    pctOfTotal: 29.6,
    notes: "Premium pricing, strong in on-trade"
  },
  ginger: {
    name: "Ginger Ale",
    casesAnnual: 8000,
    pricePerCase: 102000,
    revenueAnnual: 816000000,
    pctOfTotal: 8.4,
    notes: "Niche, slower movement"
  },
  finnBreeze: {
    name: "Finn's Breeze (Private Label)",
    casesAnnual: 16000,
    pricePerCase: 120000,
    revenueAnnual: 1920000000,
    pctOfTotal: 19.9,
    notes: "Finns exclusive, premium margin"
  },
  newSku4: {
    name: "New SKU 4 (TBD)",
    casesAnnual: 5000,
    pricePerCase: 102000,
    revenueAnnual: 510000000,
    pctOfTotal: 5.3,
    notes: "Launch Q3"
  },
  newSku5: {
    name: "New SKU 5 (TBD)",
    casesAnnual: 4000,
    pricePerCase: 102000,
    revenueAnnual: 408000000,
    pctOfTotal: 4.2,
    notes: "Launch Q4"
  }
};

// =============================================================================
// DETAILED P&L LINE ITEMS - FY2026 BASE
// =============================================================================

const detailedLineItems_2026 = [
  // Revenue
  { name: "Trading Income", fy2025: 0, fy2026: 0, category: "revenue", isHeader: true },
  { name: "Sales", fy2025: 5516371625, fy2026: 9660000000, category: "revenue", isHeader: false, change: "+75%" },

  // COGS
  { name: "Cost of Sales", fy2025: 0, fy2026: 0, category: "cogs", isHeader: true },
  { name: "Cost of Goods Sold", fy2025: 2495023912, fy2026: 4250400000, category: "cogs", isHeader: false, change: "+70%", notes: "30K production runs" },

  // Gross Profit
  { name: "Gross Profit", fy2025: 3021347713, fy2026: 5409600000, category: "subtotal", isHeader: false, change: "+79%" },

  // Operating Expenses
  { name: "Operating Expenses", fy2025: 0, fy2026: 0, category: "expense", isHeader: true },
  { name: "Wages and Salaries", fy2025: 605083333, fy2026: 850000000, category: "expense", isHeader: false, change: "+40%", notes: "+2 field staff, senior hire H2" },
  { name: "Marketing", fy2025: 533385084, fy2026: 900000000, category: "expense", isHeader: false, change: "+69%", notes: "Ryan's marketing plan" },
  { name: "Consulting & Accounting", fy2025: 322640840, fy2026: 400000000, category: "expense", isHeader: false, change: "+24%" },
  { name: "Transport/Logistics", fy2025: 222285150, fy2026: 385000000, category: "expense", isHeader: false, change: "+73%", notes: "Scaled with volume" },
  { name: "Legal expenses", fy2025: 209909694, fy2026: 150000000, category: "expense", isHeader: false, change: "-29%", notes: "Cleanup complete" },
  { name: "Storage and Warehousing", fy2025: 142830000, fy2026: 240000000, category: "expense", isHeader: false, change: "+68%", notes: "30K case storage" },
  { name: "Subscriptions", fy2025: 125400887, fy2026: 150000000, category: "expense", isHeader: false, change: "+20%" },
  { name: "Outsourcing", fy2025: 75573701, fy2026: 50000000, category: "expense", isHeader: false, change: "-34%" },
  { name: "Flight and Accommodation", fy2025: 51390190, fy2026: 100000000, category: "expense", isHeader: false, change: "+95%", notes: "Roadshows, Jakarta" },
  { name: "PIT 21 Allowance", fy2025: 51672141, fy2026: 80000000, category: "expense", isHeader: false, change: "+55%" },
  { name: "BPJS Ketenagakerjaan", fy2025: 41407979, fy2026: 50000000, category: "expense", isHeader: false, change: "+21%" },
  { name: "Shareholder Strategy Meeting", fy2025: 27087780, fy2026: 30000000, category: "expense", isHeader: false, change: "+11%" },
  { name: "General Expenses", fy2025: 22806738, fy2026: 50000000, category: "expense", isHeader: false, change: "+119%" },
  { name: "Meal and Entertainment", fy2025: 19512594, fy2026: 40000000, category: "expense", isHeader: false, change: "+105%" },
  { name: "BPJS Kesehatan", fy2025: 18400000, fy2026: 25000000, category: "expense", isHeader: false, change: "+36%" },
  { name: "Printing & Stationery", fy2025: 8853447, fy2026: 15000000, category: "expense", isHeader: false, change: "+69%" },
  { name: "Third Party Expenses", fy2025: 8562654, fy2026: 10000000, category: "expense", isHeader: false, change: "+17%" },
  { name: "Pallet Rent", fy2025: 8068750, fy2026: 15000000, category: "expense", isHeader: false, change: "+86%" },
  { name: "Office Expenses", fy2025: 7185000, fy2026: 15000000, category: "expense", isHeader: false, change: "+109%" },
  { name: "Motor Vehicle Expenses", fy2025: 7212852, fy2026: 15000000, category: "expense", isHeader: false, change: "+108%" },
  { name: "Advertising", fy2025: 6862600, fy2026: 50000000, category: "expense", isHeader: false, change: "+629%", notes: "TikTok, social media" },
  { name: "Bank Fees", fy2025: 6808564, fy2026: 10000000, category: "expense", isHeader: false, change: "+47%" },
  { name: "Research and Development", fy2025: 2722500, fy2026: 50000000, category: "expense", isHeader: false, change: "+1736%", notes: "New SKU development" },
  { name: "Donation", fy2025: 2255000, fy2026: 5000000, category: "expense", isHeader: false, change: "+122%" },
  { name: "Tax Expense", fy2025: 1958075, fy2026: 5000000, category: "expense", isHeader: false, change: "+155%" },
  { name: "Freight & Courier", fy2025: 1803685, fy2026: 5000000, category: "expense", isHeader: false, change: "+177%" },
  { name: "Depreciation", fy2025: 935896, fy2026: 2000000, category: "expense", isHeader: false, change: "+114%" },
  { name: "Listing Fee", fy2025: 0, fy2026: 200000000, category: "expense", isHeader: false, change: "new", notes: "Modern trade listings" },
  { name: "Unrealized FX Gain/Loss", fy2025: 232659, fy2026: 0, category: "expense", isHeader: false },
  { name: "Bad Debt", fy2025: 53700, fy2026: 50000000, category: "expense", isHeader: false, notes: "Provision increased" },

  // Subtotals
  { name: "Total Operating Expenses", fy2025: 2531965598, fy2026: 3440000000, category: "subtotal", isHeader: false, change: "+36%" },
  { name: "EBITDA", fy2025: 489382115, fy2026: 919600000, category: "subtotal", isHeader: false, change: "+88%" },

  // Other Income/Expense
  { name: "Other Income/Expense", fy2025: 0, fy2026: 0, category: "other_income", isHeader: true },
  { name: "Interest Income", fy2025: 3479074, fy2026: 5000000, category: "other_income", isHeader: false },
  { name: "Interest Loan", fy2025: -46441420, fy2026: -50000000, category: "other_income", isHeader: false },
  { name: "Interest Expense", fy2025: -479771, fy2026: -5000000, category: "other_income", isHeader: false },

  // Net Profit
  { name: "Net Profit", fy2025: 445004103, fy2026: 869600000, category: "total", isHeader: false, change: "+95%" },
];

// =============================================================================
// SKU DATA (UPDATED FOR 2026)
// =============================================================================

const skuData_2026 = [
  { sku: "Club Soda", pricePerCan: 3750, cansPerCase: 24, pricePerCase: 90000, active: true, priority: 1 },
  { sku: "Imperial Tonic", pricePerCan: 4250, cansPerCase: 24, pricePerCase: 102000, active: true, priority: 2 },
  { sku: "Ginger Ale", pricePerCan: 4250, cansPerCase: 24, pricePerCase: 102000, active: true, priority: 3 },
  { sku: "Finn's Breeze", pricePerCan: 5000, cansPerCase: 24, pricePerCase: 120000, active: true, priority: 4, notes: "Private label" },
  { sku: "New SKU 4 (TBD)", pricePerCan: 4250, cansPerCase: 24, pricePerCase: 102000, active: false, launchTarget: "Q3 2026" },
  { sku: "New SKU 5 (TBD)", pricePerCan: 4250, cansPerCase: 24, pricePerCase: 102000, active: false, launchTarget: "Q4 2026" },
];

// =============================================================================
// PRODUCTION TARGETS
// =============================================================================

const productionTargets_2026 = {
  thirtyKRuns: {
    target: 2,  // 2 runs per year minimum
    skus: ["Club Soda", "Imperial Tonic"],
    costSavingsPct: 15,  // vs smaller runs
    notes: "Move to 3 runs if stretch scenario"
  },
  totalCasesTarget: {
    conservative: 60000,
    base: 75000,
    stretch: 90000
  },
  monthlyTargets: {
    q1Avg: 5000,
    q2Avg: 6000,
    q3Avg: 7000,
    q4Avg: 7000
  }
};

// =============================================================================
// HEADCOUNT PLAN
// =============================================================================

const headcountPlan_2026 = {
  current: {
    founders: 2,      // Dieter, Anders
    operations: 2,    // Fery, Felicia
    sales: 2,         // Mirzan, Jules
    marketing: 1,     // Ryan (contractor)
    total: 7
  },
  planned: {
    fieldSales: {
      count: 2,
      startDate: "Q1",
      monthlyCost: 15000000,  // each
      annualCost: 360000000
    },
    seniorCommercial: {
      count: 1,
      title: "Commercial Director (Elliot-level)",
      startDate: "Q3",
      monthlyCost: 55000000,
      annualCost: 330000000,  // 6 months
      notes: "Critical hire for professionalization"
    }
  },
  yearEndTotal: 10
};

// =============================================================================
// KEY METRICS & KPIS
// =============================================================================

const kpis_2026 = {
  revenue: {
    target: 9660000000,
    monthly: 805000000,
    minAcceptable: 8000000000
  },
  cases: {
    target: 75000,
    monthly: 6250,
    minAcceptable: 60000
  },
  cogs: {
    targetPct: 44,
    maxAcceptable: 46
  },
  grossMargin: {
    targetPct: 56,
    minAcceptable: 54
  },
  outlets: {
    target: 2000,
    q1: 400,
    q2: 800,
    q3: 1400,
    q4: 2000
  },
  cashBuffer: {
    minimum: 500000000,
    target: 800000000
  }
};

// =============================================================================
// EXPORT ALL DATA
// =============================================================================

module.exports = {
  historicalData,
  fy2026_scenarios,
  fy2026_base,
  fy2026_conservative,
  fy2026_stretch,
  fy2026_monthly_base,
  fy2026_channels_base,
  fy2026_sku_base,
  detailedLineItems_2026,
  skuData_2026,
  productionTargets_2026,
  headcountPlan_2026,
  kpis_2026
};

// For browser/ES6 environments:
if (typeof window !== 'undefined') {
  window.candidBudget2026 = {
    historicalData,
    fy2026_scenarios,
    fy2026_base,
    fy2026_conservative,
    fy2026_stretch,
    fy2026_monthly_base,
    fy2026_channels_base,
    fy2026_sku_base,
    detailedLineItems_2026,
    skuData_2026,
    productionTargets_2026,
    headcountPlan_2026,
    kpis_2026
  };
}
