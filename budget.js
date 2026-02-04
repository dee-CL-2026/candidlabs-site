// Budget Planner - Calculation Engine

// Format number as IDR
function formatIDR(num) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + 'B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toFixed(0);
}

// Format as full IDR with separators
function formatIDRFull(num) {
  return 'IDR ' + Math.round(num).toLocaleString('id-ID');
}

// Format percentage
function formatPct(num) {
  return num.toFixed(1) + '%';
}

// Calculate 2026 budget based on assumptions
function calculateBudget(assumptions) {
  const base = historicalData.fy2024;

  // Revenue
  const baseRevenue = base.revenue;
  const growthRevenue = baseRevenue * (assumptions.revenueGrowthPct / 100);
  const newChannelRev = assumptions.newChannelRevenue || 0;
  const totalRevenue = baseRevenue + growthRevenue + newChannelRev;

  // COGS
  const cogs = totalRevenue * (assumptions.cogsRatioPct / 100);
  const grossProfit = totalRevenue - cogs;
  const grossMarginPct = (grossProfit / totalRevenue) * 100;

  // Operating Expenses
  const baseSalaries = base.opex.salaries;
  const salaryIncrease = baseSalaries * (assumptions.salaryIncreasePct / 100);
  const newHeadcountCost = assumptions.headcountChange * assumptions.avgSalaryPerHead * 12;
  const totalSalaries = baseSalaries + salaryIncrease + newHeadcountCost;

  const marketing = totalRevenue * (assumptions.marketingPct / 100);

  // Other OpEx (grow at admin rate)
  const baseOtherOpex = base.opex.consulting + base.opex.travel + base.opex.storage +
                        base.opex.transport + base.opex.subscriptions +
                        base.opex.thirdParty + base.opex.taxes + base.opex.other;
  const otherOpex = baseOtherOpex * (1 + assumptions.adminGrowthPct / 100);

  // Exclude one-time legal from baseline
  const totalOpex = totalSalaries + marketing + otherOpex;

  // EBITDA / Net Profit (simplified - no interest/tax adjustments)
  const ebitda = grossProfit - totalOpex;
  const netMarginPct = (ebitda / totalRevenue) * 100;

  return {
    revenue: totalRevenue,
    revenueGrowth: growthRevenue + newChannelRev,
    revenueGrowthPct: ((totalRevenue - baseRevenue) / baseRevenue) * 100,
    cogs: cogs,
    cogsPct: assumptions.cogsRatioPct,
    grossProfit: grossProfit,
    grossMarginPct: grossMarginPct,
    opex: {
      salaries: totalSalaries,
      marketing: marketing,
      other: otherOpex
    },
    totalOpex: totalOpex,
    opexPct: (totalOpex / totalRevenue) * 100,
    ebitda: ebitda,
    netMarginPct: netMarginPct
  };
}

// Current assumptions state
let currentAssumptions = { ...defaultAssumptions };

// Update display with calculated budget
function updateBudgetDisplay() {
  const budget = calculateBudget(currentAssumptions);
  const fy24 = historicalData.fy2024;

  // Update FY26 Budget column
  document.getElementById('fy26-revenue').textContent = formatIDR(budget.revenue);
  document.getElementById('fy26-cogs').textContent = formatIDR(budget.cogs);
  document.getElementById('fy26-gross').textContent = formatIDR(budget.grossProfit);
  document.getElementById('fy26-gross-pct').textContent = formatPct(budget.grossMarginPct);
  document.getElementById('fy26-opex').textContent = formatIDR(budget.totalOpex);
  document.getElementById('fy26-ebitda').textContent = formatIDR(budget.ebitda);
  document.getElementById('fy26-ebitda-pct').textContent = formatPct(budget.netMarginPct);

  // Update YoY changes
  const revenueChange = ((budget.revenue - fy24.revenue) / fy24.revenue) * 100;
  const grossChange = budget.grossMarginPct - fy24.grossMarginPct;
  const ebitdaChange = ((budget.ebitda - fy24.netProfit) / Math.abs(fy24.netProfit)) * 100;

  updateChangeIndicator('revenue-change', revenueChange);
  updateChangeIndicator('gross-change', grossChange, true);
  updateChangeIndicator('ebitda-change', ebitdaChange);

  // Update assumption displays
  document.getElementById('revenue-growth-value').textContent = currentAssumptions.revenueGrowthPct + '%';
  document.getElementById('cogs-ratio-value').textContent = currentAssumptions.cogsRatioPct + '%';
  document.getElementById('headcount-value').textContent = (currentAssumptions.headcountChange >= 0 ? '+' : '') + currentAssumptions.headcountChange;
  document.getElementById('marketing-value').textContent = currentAssumptions.marketingPct + '%';
  document.getElementById('salary-increase-value').textContent = currentAssumptions.salaryIncreasePct + '%';
}

// Update change indicator element
function updateChangeIndicator(elementId, change, isPercentagePoints = false) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const arrow = change >= 0 ? '↑' : '↓';
  const sign = change >= 0 ? '+' : '';
  const suffix = isPercentagePoints ? 'pp' : '%';

  el.textContent = `${arrow} ${sign}${change.toFixed(1)}${suffix}`;
  el.className = 'change-indicator ' + (change >= 0 ? 'positive' : 'negative');
}

// Slider event handlers
function initSliders() {
  const sliders = {
    'revenue-growth': { key: 'revenueGrowthPct', min: 0, max: 50 },
    'cogs-ratio': { key: 'cogsRatioPct', min: 40, max: 70 },
    'headcount': { key: 'headcountChange', min: -5, max: 10 },
    'marketing': { key: 'marketingPct', min: 0, max: 20 },
    'salary-increase': { key: 'salaryIncreasePct', min: 0, max: 25 }
  };

  Object.entries(sliders).forEach(([id, config]) => {
    const slider = document.getElementById(id + '-slider');
    if (slider) {
      slider.min = config.min;
      slider.max = config.max;
      slider.value = currentAssumptions[config.key];

      slider.addEventListener('input', (e) => {
        currentAssumptions[config.key] = parseFloat(e.target.value);
        updateBudgetDisplay();
      });
    }
  });
}

// Scenario buttons
function loadScenario(scenario) {
  switch(scenario) {
    case 'base':
      currentAssumptions = { ...defaultAssumptions };
      break;
    case 'stretch':
      currentAssumptions = { ...stretchAssumptions };
      break;
    case 'conservative':
      currentAssumptions = { ...conservativeAssumptions };
      break;
  }

  // Update slider positions
  document.getElementById('revenue-growth-slider').value = currentAssumptions.revenueGrowthPct;
  document.getElementById('cogs-ratio-slider').value = currentAssumptions.cogsRatioPct;
  document.getElementById('headcount-slider').value = currentAssumptions.headcountChange;
  document.getElementById('marketing-slider').value = currentAssumptions.marketingPct;
  document.getElementById('salary-increase-slider').value = currentAssumptions.salaryIncreasePct;

  // Update active button
  document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-scenario="${scenario}"]`).classList.add('active');

  updateBudgetDisplay();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Populate FY24 actuals
  const fy24 = historicalData.fy2024;
  document.getElementById('fy24-revenue').textContent = formatIDR(fy24.revenue);
  document.getElementById('fy24-cogs').textContent = formatIDR(fy24.cogs);
  document.getElementById('fy24-gross').textContent = formatIDR(fy24.grossProfit);
  document.getElementById('fy24-gross-pct').textContent = formatPct(fy24.grossMarginPct);
  document.getElementById('fy24-opex').textContent = formatIDR(fy24.totalOpex);
  document.getElementById('fy24-ebitda').textContent = formatIDR(fy24.netProfit);
  document.getElementById('fy24-ebitda-pct').textContent = formatPct(fy24.netMarginPct);

  initSliders();
  updateBudgetDisplay();
});
