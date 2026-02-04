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
  if (Math.abs(num) >= 1000000000) {
    return 'IDR ' + (num / 1000000000).toFixed(2) + 'B';
  } else if (Math.abs(num) >= 1000000) {
    return 'IDR ' + (num / 1000000).toFixed(0) + 'M';
  }
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

// Calculate scenario from simple inputs (growth %, COGS %, OpEx growth %)
function calculateScenarioSimple(revenueGrowthPct, cogsPct, opexGrowthPct) {
  const fy25 = historicalData.fy2025;

  const revenue = fy25.revenue * (1 + revenueGrowthPct / 100);
  const cogs = revenue * (cogsPct / 100);
  const grossProfit = revenue - cogs;
  const totalOpex = fy25.totalOpex * (1 + opexGrowthPct / 100);
  const netProfit = grossProfit - totalOpex;
  const netMarginPct = (netProfit / revenue) * 100;

  return { revenue, cogs, grossProfit, totalOpex, netProfit, netMarginPct };
}

// Update all three scenarios in the comparison table
function updateAllScenarios() {
  const fy24 = historicalData.fy2024;
  const fy25 = historicalData.fy2025;

  // Get inputs
  const consGrowth = parseFloat(document.getElementById('cons-growth-input').value) || 0;
  const consCogs = parseFloat(document.getElementById('cons-cogs-input').value) || 50;
  const consOpex = parseFloat(document.getElementById('cons-opex-input').value) || 0;

  const baseGrowth = parseFloat(document.getElementById('base-growth-input').value) || 0;
  const baseCogs = parseFloat(document.getElementById('base-cogs-input').value) || 50;
  const baseOpex = parseFloat(document.getElementById('base-opex-input').value) || 0;

  const strGrowth = parseFloat(document.getElementById('str-growth-input').value) || 0;
  const strCogs = parseFloat(document.getElementById('str-cogs-input').value) || 50;
  const strOpex = parseFloat(document.getElementById('str-opex-input').value) || 0;

  // Calculate scenarios
  const cons = calculateScenarioSimple(consGrowth, consCogs, consOpex);
  const base = calculateScenarioSimple(baseGrowth, baseCogs, baseOpex);
  const str = calculateScenarioSimple(strGrowth, strCogs, strOpex);

  // Update FY24 column
  document.getElementById('fy24-revenue').textContent = formatIDR(fy24.revenue);
  document.getElementById('fy24-cogs').textContent = formatIDR(fy24.cogs);
  document.getElementById('fy24-gross').textContent = formatIDR(fy24.grossProfit);
  document.getElementById('fy24-opex').textContent = formatIDR(fy24.totalOpex);
  document.getElementById('fy24-ebitda').textContent = formatIDR(fy24.netProfit);
  document.getElementById('fy24-margin').textContent = formatPct(fy24.netMarginPct);

  // Update FY25 column
  document.getElementById('fy25-revenue').textContent = formatIDR(fy25.revenue);
  document.getElementById('fy25-cogs').textContent = formatIDR(fy25.cogs);
  document.getElementById('fy25-gross').textContent = formatIDR(fy25.grossProfit);
  document.getElementById('fy25-opex').textContent = formatIDR(fy25.totalOpex);
  document.getElementById('fy25-ebitda').textContent = formatIDR(fy25.netProfit);
  document.getElementById('fy25-margin').textContent = formatPct(fy25.netMarginPct);

  // Update Conservative column
  document.getElementById('cons-revenue').textContent = formatIDR(cons.revenue);
  document.getElementById('cons-cogs').textContent = formatIDR(cons.cogs);
  document.getElementById('cons-gross').textContent = formatIDR(cons.grossProfit);
  document.getElementById('cons-opex').textContent = formatIDR(cons.totalOpex);
  document.getElementById('cons-net').textContent = formatIDR(cons.netProfit);
  document.getElementById('cons-margin').textContent = formatPct(cons.netMarginPct);

  // Update Base column
  document.getElementById('base-revenue').textContent = formatIDR(base.revenue);
  document.getElementById('base-cogs').textContent = formatIDR(base.cogs);
  document.getElementById('base-gross').textContent = formatIDR(base.grossProfit);
  document.getElementById('base-opex').textContent = formatIDR(base.totalOpex);
  document.getElementById('base-net').textContent = formatIDR(base.netProfit);
  document.getElementById('base-margin').textContent = formatPct(base.netMarginPct);

  // Update Stretch column
  document.getElementById('str-revenue').textContent = formatIDR(str.revenue);
  document.getElementById('str-cogs').textContent = formatIDR(str.cogs);
  document.getElementById('str-gross').textContent = formatIDR(str.grossProfit);
  document.getElementById('str-opex').textContent = formatIDR(str.totalOpex);
  document.getElementById('str-net').textContent = formatIDR(str.netProfit);
  document.getElementById('str-margin').textContent = formatPct(str.netMarginPct);

  // Also update the current assumptions for the detailed planner
  currentAssumptions.revenueGrowthPct = baseGrowth;
  currentAssumptions.cogsRatioPct = baseCogs;
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

  let csv = 'Line Item,FY2024 Actual,% of Rev,FY2025 Actual,YoY %,FY2026 Budget,Budget % of Rev\n';

  detailedLineItems.forEach(item => {
    if (item.isHeader) {
      csv += `\n${item.name},,,,,\n`;
    } else {
      const customValue = customBudget[item.name] !== undefined ? customBudget[item.name] : calculateSuggested(item);
      const pct2024 = calcPctOfRevenue(item.fy2024, historicalData.fy2024.revenue);
      const pctBudget = calcPctOfRevenue(customValue, suggestedRevenue);

      // Calculate YoY % (FY25 vs FY24)
      let yoyPct = '';
      if (item.fy2024 > 0 && item.fy2025 !== 0) {
        const yoyChange = ((item.fy2025 - item.fy2024) / item.fy2024) * 100;
        yoyPct = (yoyChange >= 0 ? '+' : '') + yoyChange.toFixed(0) + '%';
      } else if (item.fy2024 === 0 && item.fy2025 > 0) {
        yoyPct = 'New';
      } else if (item.fy2024 > 0 && item.fy2025 === 0) {
        yoyPct = '-100%';
      }

      csv += `${item.name},${item.fy2024},${pct2024.toFixed(1)}%,${item.fy2025},${yoyPct},${Math.round(customValue)},${pctBudget.toFixed(1)}%\n`;
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

// ===============================
// REVENUE BUILDER
// ===============================

// SKU state
let priceUnit = 'can'; // 'can' or 'case'
const skuPrices = {}; // Store edited prices (per can)
const skuVolumes = {}; // Store volumes (in cases)

// Set builder mode
function setBuilderMode(mode) {
  // Update buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Update panels
  document.querySelectorAll('.builder-mode').forEach(panel => {
    panel.classList.toggle('active', panel.id === mode + '-mode');
  });
}

// Set price display unit (can vs case)
function setPriceUnit(unit) {
  priceUnit = unit;

  // Update toggle buttons
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.unit === unit);
  });

  // Update header
  const header = document.getElementById('price-header');
  if (header) {
    header.textContent = unit === 'can' ? 'Price/Can (IDR)' : 'Price/Case (IDR)';
  }

  // Re-render table with new unit
  initSkuTable();
}

// Initialize SKU table
function initSkuTable() {
  const tbody = document.getElementById('sku-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  skuData.forEach((item, index) => {
    // Get current price (from edited state or default)
    const pricePerCan = skuPrices[item.sku] !== undefined ? skuPrices[item.sku] : item.pricePerCan;
    const pricePerCase = pricePerCan * item.cansPerCase;
    const displayPrice = priceUnit === 'can' ? pricePerCan : pricePerCase;

    // Get current volume
    const volume = skuVolumes[item.sku] || 0;

    const tr = document.createElement('tr');
    if (!item.active && pricePerCan === 0) {
      tr.classList.add('sku-inactive');
    }

    tr.innerHTML = `
      <td>${item.sku}</td>
      <td>
        <input type="number" class="price-input" id="sku-price-${index}"
               value="${displayPrice}" min="0" onchange="updateSkuPrice(${index}, this.value)">
      </td>
      <td>
        <input type="number" id="sku-vol-${index}" value="${volume}" min="0" onchange="updateSkuRevenue()">
      </td>
      <td class="value" id="sku-rev-${index}">IDR 0</td>
    `;
    tbody.appendChild(tr);
  });

  // Calculate initial revenue
  updateSkuRevenue();
}

// Update SKU price when edited
function updateSkuPrice(index, value) {
  const item = skuData[index];
  const inputPrice = parseFloat(value) || 0;

  // Convert to price per can for storage
  const pricePerCan = priceUnit === 'can' ? inputPrice : inputPrice / item.cansPerCase;
  skuPrices[item.sku] = pricePerCan;

  updateSkuRevenue();
}

// Update SKU revenue calculations
function updateSkuRevenue() {
  let totalCases = 0;
  let totalRevenue = 0;

  skuData.forEach((item, index) => {
    const volInput = document.getElementById(`sku-vol-${index}`);
    const revCell = document.getElementById(`sku-rev-${index}`);
    if (!volInput || !revCell) return;

    const volume = parseInt(volInput.value) || 0;
    skuVolumes[item.sku] = volume;

    // Get price per can (edited or default)
    const pricePerCan = skuPrices[item.sku] !== undefined ? skuPrices[item.sku] : item.pricePerCan;
    const pricePerCase = pricePerCan * item.cansPerCase;

    // Revenue = cases × price per case
    const revenue = volume * pricePerCase;

    totalCases += volume;
    totalRevenue += revenue;

    revCell.textContent = formatIDRFull(revenue);
  });

  document.getElementById('total-cases').textContent = totalCases.toLocaleString();
  document.getElementById('total-sku-revenue').textContent = formatIDRFull(totalRevenue);
}

// Calculate growth-based targets
function calculateGrowthTargets() {
  const fy25 = historicalData.fy2025;

  const revGrowth = parseFloat(document.getElementById('growth-revenue-pct').value) || 0;
  const cogsPct = parseFloat(document.getElementById('growth-cogs-pct').value) || 45;
  const opexGrowth = parseFloat(document.getElementById('growth-opex-pct').value) || 0;

  const targetRevenue = fy25.revenue * (1 + revGrowth / 100);
  const targetCogs = targetRevenue * (cogsPct / 100);
  const targetGross = targetRevenue - targetCogs;
  const grossMarginPct = (targetGross / targetRevenue) * 100;
  const targetOpex = fy25.totalOpex * (1 + opexGrowth / 100);
  const targetNet = targetGross - targetOpex;
  const netMarginPct = (targetNet / targetRevenue) * 100;

  // Calculate YoY change vs FY2025
  const netChange = ((targetNet - fy25.netProfit) / Math.abs(fy25.netProfit)) * 100;

  // Estimate cases needed (based on avg 90K/case - Club Soda pricing)
  const avgCasePrice = 90000;
  const casesNeeded = Math.round(targetRevenue / avgCasePrice);

  // Update table values
  document.getElementById('growth-revenue-target').textContent = formatIDR(targetRevenue);
  document.getElementById('growth-cogs-target').textContent = formatIDR(targetCogs);
  document.getElementById('growth-gross-target').textContent = formatIDR(targetGross);
  document.getElementById('growth-opex-target').textContent = formatIDR(targetOpex);

  // Update result card
  document.getElementById('growth-net-profit').textContent = formatIDRFull(targetNet);
  document.getElementById('growth-net-margin').textContent = targetNet >= 0 ? 'Profit' : 'Loss';

  // Color the net profit
  const netEl = document.getElementById('growth-net-profit');
  netEl.style.color = targetNet >= 0 ? '#10b981' : '#ef4444';

  // Update additional metrics
  document.getElementById('growth-gross-margin').textContent = formatPct(grossMarginPct);
  document.getElementById('growth-net-margin-pct').textContent = formatPct(netMarginPct);

  const vsEl = document.getElementById('growth-vs-fy25');
  vsEl.textContent = (netChange >= 0 ? '+' : '') + formatPct(netChange);
  vsEl.style.color = netChange >= 0 ? '#10b981' : '#ef4444';

  document.getElementById('growth-rev-per-case').textContent = casesNeeded.toLocaleString() + ' cases';
}

// Reverse calculator - find required revenue from target profit
function calculateReverseRevenue() {
  const targetProfit = parseFloat(document.getElementById('target-profit').value) || 0;
  const plannedOpex = parseFloat(document.getElementById('planned-opex').value) || 0;
  const targetGmPct = parseFloat(document.getElementById('target-gm-pct').value) || 50;

  // Required Gross Profit = Target Net Profit + OpEx
  const requiredGross = targetProfit + plannedOpex;

  // Required Revenue = Gross Profit / Gross Margin %
  const requiredRevenue = requiredGross / (targetGmPct / 100);

  // Required COGS = Revenue - Gross Profit
  const requiredCogs = requiredRevenue - requiredGross;
  const cogsPct = 100 - targetGmPct;

  // Growth vs FY2025
  const fy25Revenue = historicalData.fy2025.revenue;
  const growthVsFy25 = ((requiredRevenue - fy25Revenue) / fy25Revenue) * 100;

  // Update display
  document.getElementById('required-revenue').textContent = formatIDRFull(requiredRevenue);
  document.getElementById('required-growth').textContent = (growthVsFy25 >= 0 ? '+' : '') + formatPct(growthVsFy25) + ' vs FY2025';
  document.getElementById('required-gross').textContent = formatIDRFull(requiredGross);
  document.getElementById('reverse-opex').textContent = formatIDRFull(plannedOpex);
  document.getElementById('reverse-net').textContent = formatIDRFull(targetProfit);
  document.getElementById('reverse-cogs-pct').textContent = formatPct(cogsPct);
  document.getElementById('required-cogs').textContent = formatIDRFull(requiredCogs);

  // Color the growth indicator
  const growthEl = document.getElementById('required-growth');
  growthEl.style.color = growthVsFy25 <= 30 ? '#10b981' : (growthVsFy25 <= 50 ? '#f59e0b' : '#ef4444');
}

// Current assumptions state (used by detailed planner)
let currentAssumptions = { ...defaultAssumptions };

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize scenario comparison
  updateAllScenarios();

  // Initialize detailed planner
  populateDetailedTable();

  // Initialize revenue builder
  initSkuTable();
  calculateGrowthTargets();
  calculateReverseRevenue();
});
