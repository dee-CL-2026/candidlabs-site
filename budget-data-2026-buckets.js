// Budget Data - PT Unisoda Mitra Jaya (Candid Mixers)
// FY2026 Bottom-Up Bucket Approach
// Source: Anders Planning Call (Feb 4, 2026) + Dee clarifications (Feb 5)
// Currency: IDR

// =============================================================================
// SKU MIX & PRICING
// =============================================================================

const skuMix = {
  clubSoda: { pct: 65, pricePerCase: 90000 },
  imperioTonic: { pct: 30, pricePerCase: 102000 },
  gingerAle: { pct: 5, pricePerCase: 102000 },  // "Very light"
  blendedAvgPrice: 94200  // Weighted average
};

const newSkus = {
  greenTea: { pricePerCase: 102000, launchScenarios: { conservative: 'Q4', base: 'Q4', stretch: 'Q3' } },
  nipisMadu: { pricePerCase: 102000, launchScenarios: { conservative: null, base: 'Q4', stretch: 'Q3' } }
};

// =============================================================================
// FY2025 BASELINE
// =============================================================================

const fy2025_baseline = {
  revenue: 5516371625,
  estimatedCases: 58700,  // ~5.52B / 94k avg
  organicGrowthPct: 7,    // Assumed modest growth on existing
  projectedBase: 5900000000  // ~5.9B after organic growth
};

// =============================================================================
// CHANNEL BUCKETS
// =============================================================================

// New incremental buckets from Anders call
// Format: { casesPerMonth, rampStart, annualizedCases, notes }

const buckets = {
  conservative: {
    hwg: {
      name: 'Holywings Group',
      casesPerMonth: 500,
      rampStart: 'Jan',
      fullMonths: 12,
      annualCases: 6000,
      revenueAnnual: 565200000,
      notes: '40+ outlets nationally'
    },
    bigChains: {
      name: 'Big Chains (LYD, Club Med)',
      casesPerMonth: 300,
      rampStart: 'Q2',
      fullMonths: 9,
      annualCases: 2700,
      revenueAnnual: 254340000
    },
    modernTrade: {
      name: 'Modern Trade',
      casesPerMonth: 800,
      rampStart: 'Gradual',
      fullMonths: 9,  // Effective
      annualCases: 7200,
      revenueAnnual: 678240000
    },
    hotels: {
      name: 'Hotels',
      casesPerMonth: 400,
      rampStart: 'Gradual',
      fullMonths: 9,
      annualCases: 3600,
      revenueAnnual: 339120000
    },
    newSkus: {
      name: 'New SKUs',
      launchTiming: 'Q4 - 1 SKU only',
      annualCases: 2000,
      revenueAnnual: 204000000
    },
    total: {
      annualCases: 21500,
      revenueAnnual: 2040900000
    }
  },

  base: {
    hwg: {
      name: 'Holywings Group',
      casesPerMonth: 1000,
      rampStart: 'Jan',
      fullMonths: 12,
      annualCases: 12000,
      revenueAnnual: 1130400000
    },
    bigChains: {
      name: 'Big Chains (LYD, Club Med)',
      casesPerMonth: 1000,
      rampStart: 'Q2',
      fullMonths: 9,
      annualCases: 9000,
      revenueAnnual: 847800000
    },
    modernTrade: {
      name: 'Modern Trade',
      casesPerMonth: 2000,
      rampStart: 'Gradual',
      fullMonths: 9,
      annualCases: 18000,
      revenueAnnual: 1695600000
    },
    hotels: {
      name: 'Hotels',
      casesPerMonth: 1000,
      rampStart: 'Q2',
      fullMonths: 9,
      annualCases: 9000,
      revenueAnnual: 847800000
    },
    newSkus: {
      name: 'New SKUs',
      launchTiming: 'Q4 - Both SKUs',
      annualCases: 4000,
      revenueAnnual: 408000000
    },
    total: {
      annualCases: 52000,
      revenueAnnual: 4929600000
    }
  },

  stretch: {
    hwg: {
      name: 'Holywings Group',
      casesPerMonth: 1200,
      rampStart: 'Jan',
      fullMonths: 12,
      annualCases: 14400,
      revenueAnnual: 1356480000
    },
    bigChains: {
      name: 'Big Chains (LYD, Club Med)',
      casesPerMonth: 1200,
      rampStart: 'Q1',
      fullMonths: 11,
      annualCases: 13200,
      revenueAnnual: 1243440000
    },
    modernTrade: {
      name: 'Modern Trade',
      casesPerMonth: 2500,
      rampStart: 'Aggressive',
      fullMonths: 10.8,
      annualCases: 27000,
      revenueAnnual: 2543400000
    },
    hotels: {
      name: 'Hotels',
      casesPerMonth: 1200,
      rampStart: 'Q1',
      fullMonths: 11,
      annualCases: 13200,
      revenueAnnual: 1243440000
    },
    newSkus: {
      name: 'New SKUs',
      launchTiming: 'Q3 - Both SKUs',
      annualCases: 8000,
      revenueAnnual: 816000000
    },
    total: {
      annualCases: 75800,
      revenueAnnual: 7202760000
    }
  }
};

// =============================================================================
// SCENARIO TOTALS
// =============================================================================

const scenarioTotals = {
  conservative: {
    name: 'Conservative',
    targetGrowthPct: 50,
    originalTarget: 8280000000,
    baseline: fy2025_baseline.projectedBase,
    bucketsRevenue: buckets.conservative.total.revenueAnnual,
    calculatedRevenue: 5900000000 + 2040900000,  // 7.94B
    delta: -340000000,  // Below target
    notes: 'Bucket volumes may need adjustment to hit 8.3B'
  },
  base: {
    name: 'Base',
    targetGrowthPct: 75,
    originalTarget: 9660000000,
    baseline: fy2025_baseline.projectedBase,
    bucketsRevenue: buckets.base.total.revenueAnnual,
    calculatedRevenue: 5900000000 + 4929600000,  // 10.83B
    delta: 1170000000,  // Above target
    notes: 'Anders bucket numbers produce higher growth than target'
  },
  stretch: {
    name: 'Stretch',
    targetGrowthPct: 100,
    originalTarget: 11030000000,
    baseline: fy2025_baseline.projectedBase,
    bucketsRevenue: buckets.stretch.total.revenueAnnual,
    calculatedRevenue: 5900000000 + 7202760000,  // 13.1B
    delta: 2070000000,  // Well above target
    notes: 'Full bucket execution exceeds stretch significantly'
  }
};

// =============================================================================
// DATA GAPS - NEEDS DEE INPUT
// =============================================================================

const dataGaps = {
  finns: {
    status: 'MISSING',
    question: 'Current Finns volume (cases/month), pricing, FY26 trajectory?',
    placeholder: 1580000000  // From top-down draft
  },
  marketingBudget: {
    status: 'UNCLEAR',
    deeQuote: '70k 50k same as this year 10k extras for paid campaigns 10k for Press release budget',
    question: 'Units? 70M+50M=120M? But FY25 marketing was 533M',
    fy25Actual: 533385084
  },
  rampUpCurves: {
    status: 'ASSUMED',
    question: 'When do buckets actually start delivering? All from Jan or staggered?'
  }
};

// =============================================================================
// COST STRUCTURE TARGETS
// =============================================================================

const costTargets = {
  conservative: { cogsPct: 45, grossMarginPct: 55 },
  base: { cogsPct: 44, grossMarginPct: 56 },
  stretch: { cogsPct: 43, grossMarginPct: 57 }
};

// =============================================================================
// EXPORTS
// =============================================================================

module.exports = {
  skuMix,
  newSkus,
  fy2025_baseline,
  buckets,
  scenarioTotals,
  dataGaps,
  costTargets
};

if (typeof window !== 'undefined') {
  window.candidBudget2026Buckets = {
    skuMix,
    newSkus,
    fy2025_baseline,
    buckets,
    scenarioTotals,
    dataGaps,
    costTargets
  };
}
