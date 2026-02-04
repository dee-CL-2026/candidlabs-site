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
  const base = historicalData.fy2025;  // Base on FY2025

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

  // Update YoY changes (vs FY2025)
  const fy25 = historicalData.fy2025;
  const revenueChange = ((budget.revenue - fy25.revenue) / fy25.revenue) * 100;
  const grossChange = budget.grossMarginPct - fy25.grossMarginPct;
  const ebitdaChange = ((budget.ebitda - fy25.netProfit) / Math.abs(fy25.netProfit)) * 100;

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

// ===============================
// DETAILED BUDGET PLANNER
// ===============================

// Store custom values
const customBudget = {};

// Calculate suggested FY2026 value based on historical trend
function calculateSuggested(item) {
  const fy24 = item.fy2024;
  const fy25 = item.fy2025;

  // If it's a header, return 0
  if (item.isHeader) return 0;

  // For revenue, use the scenario assumption based on FY2025
  if (item.category === 'revenue' && item.name === 'Sales') {
    return Math.round(fy25 * (1 + currentAssumptions.revenueGrowthPct / 100));
  }

  // For COGS, use the COGS ratio assumption
  if (item.category === 'cogs' && item.name === 'Cost of Goods Sold') {
    const fy25Revenue = detailedLineItems.find(i => i.name === 'Sales').fy2025;
    const suggestedRevenue = fy25Revenue * (1 + currentAssumptions.revenueGrowthPct / 100);
    return Math.round(suggestedRevenue * (currentAssumptions.cogsRatioPct / 100));
  }

  // Calculate YoY growth rate from FY24 to FY25
  let growthRate = 0;
  if (fy24 > 0 && fy25 > 0) {
    growthRate = (fy25 - fy24) / fy24;
  } else if (fy25 > 0 && fy24 === 0) {
    // New expense in FY25, assume flat
    return Math.round(fy25);
  } else if (fy25 === 0 && fy24 > 0) {
    // Expense dropped to zero, keep at zero
    return 0;
  }

  // For expenses, apply a reasonable growth (cap at 30% growth, min -30%)
  const cappedGrowth = Math.max(-0.3, Math.min(0.3, growthRate));

  // Default: use FY25 as base and apply capped growth
  const baseValue = fy25 > 0 ? fy25 : fy24;
  return Math.round(baseValue * (1 + cappedGrowth * 0.5)); // Moderate the trend
}

// Calculate % of revenue
function calcPctOfRevenue(amount, revenue) {
  if (!revenue || revenue === 0) return 0;
  return (amount / revenue) * 100;
}

// Populate detailed budget table
function populateDetailedTable() {
  const tbody = document.getElementById('detailed-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  const revenue2024 = historicalData.fy2024.revenue;
  const suggestedRevenue = calculateSuggested(detailedLineItems.find(i => i.name === 'Sales'));

  detailedLineItems.forEach((item, index) => {
    const tr = document.createElement('tr');

    // Add row classes
    if (item.isHeader) tr.classList.add('header-row');
    if (item.category === 'subtotal') tr.classList.add('subtotal-row');
    if (item.category === 'total') tr.classList.add('total-row');

    const suggested = calculateSuggested(item);
    const customValue = customBudget[item.name] !== undefined ? customBudget[item.name] : suggested;

    // YoY calculation (FY25 vs FY24)
    let yoyChange = 0;
    let yoyDisplay = '-';
    if (item.fy2024 > 0 && item.fy2025 !== 0) {
      yoyChange = ((item.fy2025 - item.fy2024) / item.fy2024) * 100;
      const sign = yoyChange >= 0 ? '+' : '';
      yoyDisplay = `${sign}${yoyChange.toFixed(0)}%`;
    } else if (item.fy2024 === 0 && item.fy2025 > 0) {
      yoyDisplay = 'New';
    } else if (item.fy2024 > 0 && item.fy2025 === 0) {
      yoyDisplay = '-100%';
      yoyChange = -100;
    }

    // % of revenue
    const pctOfRev2024 = calcPctOfRevenue(item.fy2024, revenue2024);
    const pctOfRevCustom = calcPctOfRevenue(customValue, suggestedRevenue);

    tr.innerHTML = `
      <td class="${item.isHeader ? '' : 'indent'}">${item.name}</td>
      <td class="value">${item.isHeader ? '' : formatIDR(item.fy2024)}</td>
      <td class="pct-of-rev">${item.isHeader || item.category === 'revenue' ? '' : formatPct(pctOfRev2024)}</td>
      <td class="value">${item.isHeader ? '' : formatIDR(item.fy2025)}</td>
      <td>${item.isHeader ? '' : `<span class="yoy-change ${yoyChange >= 0 ? 'yoy-positive' : 'yoy-negative'}">${yoyDisplay}</span>`}</td>
      <td class="value suggested-value">${item.isHeader ? '' : formatIDR(suggested)}</td>
      <td class="custom-col">
        ${item.editable ? `<input type="number" id="custom-${index}" value="${Math.round(customValue)}" onchange="updateCustomValue('${item.name}', this.value)">` :
          (item.isHeader ? '' : `<span class="value">${formatIDR(customValue)}</span>`)}
      </td>
      <td class="custom-col pct-of-rev">${item.isHeader || item.category === 'revenue' ? '' : formatPct(pctOfRevCustom)}</td>
    `;

    tbody.appendChild(tr);
  });

  updateDetailedTotals();
}

// Update custom value
function updateCustomValue(name, value) {
  customBudget[name] = parseFloat(value) || 0;
  updateDetailedTotals();
}

// Calculate and update totals
function updateDetailedTotals() {
  // Get custom or suggested values
  const getValue = (name) => {
    const item = detailedLineItems.find(i => i.name === name);
    if (!item) return 0;
    return customBudget[name] !== undefined ? customBudget[name] : calculateSuggested(item);
  };

  // Revenue
  const revenue = getValue('Sales');

  // COGS
  const cogs = getValue('Cost of Goods Sold');

  // Gross Profit
  const grossProfit = revenue - cogs;

  // Sum all expenses
  let totalOpex = 0;
  detailedLineItems.forEach(item => {
    if (item.category === 'expense' && item.editable) {
      totalOpex += customBudget[item.name] !== undefined ? customBudget[item.name] : calculateSuggested(item);
    }
  });

  // Other income
  const otherIncome = getValue('Interest Income');

  // Net profit
  const netProfit = grossProfit - totalOpex + otherIncome;

  // Update summary cards
  document.getElementById('summary-revenue').textContent = formatIDR(revenue);
  document.getElementById('summary-cogs').textContent = formatIDR(cogs);
  document.getElementById('summary-gross').textContent = formatIDR(grossProfit);
  document.getElementById('summary-opex').textContent = formatIDR(totalOpex);

  const netEl = document.getElementById('summary-net');
  netEl.textContent = formatIDR(netProfit);
  netEl.className = 'amount ' + (netProfit >= 0 ? 'positive' : 'negative');
}

// Export to CSV
function exportToCSV() {
  const suggestedRevenue = calculateSuggested(detailedLineItems.find(i => i.name === 'Sales'));

  let csv = 'Line Item,FY2024 Actual,% of Rev,FY2025 YTD,FY2026 Budget,Budget % of Rev\n';

  detailedLineItems.forEach(item => {
    if (item.isHeader) {
      csv += `\n${item.name},,,,\n`;
    } else {
      const customValue = customBudget[item.name] !== undefined ? customBudget[item.name] : calculateSuggested(item);
      const pct2024 = calcPctOfRevenue(item.fy2024, historicalData.fy2024.revenue);
      const pctBudget = calcPctOfRevenue(customValue, suggestedRevenue);

      csv += `${item.name},${item.fy2024},${pct2024.toFixed(1)}%,${item.fy2025},${Math.round(customValue)},${pctBudget.toFixed(1)}%\n`;
    }
  });

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Candid_Budget_FY2026.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Copy table to clipboard
function copyToClipboard() {
  const table = document.getElementById('detailed-budget-table');
  const range = document.createRange();
  range.selectNode(table);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  document.execCommand('copy');
  window.getSelection().removeAllRanges();
  alert('Table copied to clipboard! Paste into Excel or Google Sheets.');
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

  // Populate FY25 actuals
  const fy25 = historicalData.fy2025;
  document.getElementById('fy25-revenue').textContent = formatIDR(fy25.revenue);
  document.getElementById('fy25-cogs').textContent = formatIDR(fy25.cogs);
  document.getElementById('fy25-gross').textContent = formatIDR(fy25.grossProfit);
  document.getElementById('fy25-gross-pct').textContent = formatPct(fy25.grossMarginPct);
  document.getElementById('fy25-opex').textContent = formatIDR(fy25.totalOpex);
  document.getElementById('fy25-ebitda').textContent = formatIDR(fy25.netProfit);
  document.getElementById('fy25-ebitda-pct').textContent = formatPct(fy25.netMarginPct);

  initSliders();
  updateBudgetDisplay();

  // Initialize detailed planner
  populateDetailedTable();
});
