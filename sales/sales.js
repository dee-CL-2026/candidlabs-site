// Sales Module - Data & Logic Engine
// Storage: CandidStore (D1 via API) with localStorage fallback.
// Pattern: matches agreements.js sidebar navigation and crm.js CRUD conventions.

// ============================================================
// DATA LAYER
// ============================================================

var _slsRevenue = null;
var _slsAccounts = null;
var _slsDeck = null;
var _slsDataReady = false;

var SLS_API_BASE = 'https://candidlabs-api.dieterwerwath.workers.dev/api';

// Sort state
var _slsRevSortCol = 'invoice_date';
var _slsRevSortDir = 'desc';

// Account filter
var _slsAcctStatusFilter = 'all';

// Pagination
var _slsRevPage = 1;
var _slsRevPerPage = 50;

// ---- Load all data from CandidStore ----

function slsLoadAll() {
  if (typeof CandidStore === 'undefined') {
    return Promise.resolve({ revenue: [], accounts: [], deck: [] });
  }
  return Promise.all([
    CandidStore.load('revenue_transactions'),
    CandidStore.load('account_status'),
    CandidStore.load('deck_metrics')
  ]).then(function (results) {
    _slsRevenue = results[0] || [];
    _slsAccounts = results[1] || [];
    _slsDeck = results[2] || [];
    _slsDataReady = true;
    return { revenue: _slsRevenue, accounts: _slsAccounts, deck: _slsDeck };
  });
}

function slsGetRevenue() { return _slsRevenue || []; }
function slsGetAccounts() { return _slsAccounts || []; }
function slsGetDeck() { return _slsDeck || []; }

// ============================================================
// FORMAT HELPERS
// ============================================================

function slsFormatDate(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function slsFormatIDR(num) {
  if (num == null || isNaN(num)) return '-';
  if (num >= 1e9) return 'IDR ' + (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return 'IDR ' + (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return 'IDR ' + (num / 1e3).toFixed(0) + 'K';
  return 'IDR ' + num.toLocaleString();
}

function slsEscapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

function slsSwitchTool(toolId) {
  document.querySelectorAll('.tool-btn[data-tool]').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.tool === toolId);
  });
  document.querySelectorAll('.tool-panel').forEach(function (panel) {
    panel.classList.toggle('active', panel.id === 'tool-' + toolId);
  });
  if (toolId === 'overview') slsRenderOverview();
  else if (toolId === 'revenue') slsRenderRevenue();
  else if (toolId === 'accounts') slsRenderAccounts();
  else if (toolId === 'deck') slsRenderDeck();
}

// ============================================================
// OVERVIEW PANEL
// ============================================================

function slsRenderOverview() {
  var rev = slsGetRevenue();
  var accts = slsGetAccounts();
  var deck = slsGetDeck();

  // Total revenue
  var totalRev = 0;
  rev.forEach(function (r) { totalRev += (r.revenue_idr || 0); });
  document.getElementById('stat-sls-total-rev').textContent = slsFormatIDR(totalRev);
  document.getElementById('stat-sls-txn-count').textContent = rev.length;

  // Active accounts
  var active = 0;
  accts.forEach(function (a) { if (a.status === 'Active') active++; });
  document.getElementById('stat-sls-active-accts').textContent = active;
  document.getElementById('stat-sls-deck-months').textContent = deck.length;

  // Latest deck metrics
  var details = document.getElementById('sls-overview-details');
  if (deck.length) {
    var sorted = deck.slice().sort(function (a, b) { return (b.month_key || '').localeCompare(a.month_key || ''); });
    var latest = sorted[0];
    details.innerHTML =
      '<h3 style="font-size:1rem;margin:20px 0 12px;color:var(--text-primary);">Latest Deck: ' + slsEscapeHtml(latest.month_label || latest.month_key) + '</h3>' +
      '<div class="pm-stats" style="margin-bottom:0;">' +
        '<div class="pm-stat-card"><div class="pm-stat-number">' + slsFormatIDR(latest.total_revenue_idr) + '</div><div class="pm-stat-label">Revenue</div></div>' +
        '<div class="pm-stat-card"><div class="pm-stat-number">' + (latest.gross_margin_pct != null ? latest.gross_margin_pct + '%' : '-') + '</div><div class="pm-stat-label">Gross Margin</div></div>' +
        '<div class="pm-stat-card"><div class="pm-stat-number">' + slsEscapeHtml(latest.gross_margin_vs_prev || '-') + '</div><div class="pm-stat-label">vs Previous</div></div>' +
        '<div class="pm-stat-card"><div class="pm-stat-number"><span class="sls-dq ' + slsEscapeHtml(latest.dq_flag || '') + '">' + slsEscapeHtml(latest.dq_flag || '-') + '</span></div><div class="pm-stat-label">DQ Status</div></div>' +
      '</div>' +
      (latest.headline ? '<p style="margin-top:12px;font-size:0.9rem;color:var(--text-secondary);">' + slsEscapeHtml(latest.headline) + '</p>' : '');
  } else {
    details.innerHTML = '<div class="pm-empty"><div class="pm-empty-icon">&#128202;</div><p>No deck metrics yet. Import receivables and run the pipeline.</p></div>';
  }
}

// ============================================================
// REVENUE TABLE
// ============================================================

function slsRevSort(col) {
  if (_slsRevSortCol === col) {
    _slsRevSortDir = _slsRevSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _slsRevSortCol = col;
    _slsRevSortDir = 'desc';
  }
  document.querySelectorAll('.sls-rev-sort').forEach(function (btn) {
    var arrow = btn.querySelector('.sort-arrow');
    if (btn.dataset.col === col) {
      arrow.textContent = _slsRevSortDir === 'asc' ? ' \u25B2' : ' \u25BC';
    } else {
      arrow.textContent = '';
    }
  });
  _slsRevPage = 1;
  slsRenderRevenue();
}

function slsRenderRevenue() {
  var rev = slsGetRevenue().slice();
  var search = (document.getElementById('sls-rev-search').value || '').toLowerCase();

  if (search) {
    rev = rev.filter(function (r) {
      return (r.venue_name || '').toLowerCase().indexOf(search) !== -1 ||
             (r.sku_name || '').toLowerCase().indexOf(search) !== -1 ||
             (r.sku_code || '').toLowerCase().indexOf(search) !== -1 ||
             (r.distributor_name || '').toLowerCase().indexOf(search) !== -1 ||
             (r.invoice_number || '').toLowerCase().indexOf(search) !== -1;
    });
  }

  // Sort
  var col = _slsRevSortCol;
  var dir = _slsRevSortDir === 'asc' ? 1 : -1;
  rev.sort(function (a, b) {
    var va = a[col] == null ? '' : a[col];
    var vb = b[col] == null ? '' : b[col];
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    va = String(va); vb = String(vb);
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  // Paginate
  var total = rev.length;
  var totalPages = Math.max(1, Math.ceil(total / _slsRevPerPage));
  if (_slsRevPage > totalPages) _slsRevPage = totalPages;
  var start = (_slsRevPage - 1) * _slsRevPerPage;
  var page = rev.slice(start, start + _slsRevPerPage);

  var tbody = document.getElementById('sls-rev-tbody');
  if (!page.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No revenue transactions found</td></tr>';
  } else {
    tbody.innerHTML = page.map(function (r) {
      return '<tr>' +
        '<td class="row-secondary">' + slsFormatDate(r.invoice_date) + '</td>' +
        '<td class="row-secondary" style="font-family:monospace;font-size:0.8rem;">' + slsEscapeHtml(r.invoice_number || '-') + '</td>' +
        '<td>' + slsEscapeHtml(r.venue_name || '-') + '</td>' +
        '<td class="row-secondary">' + slsEscapeHtml(r.sku_name || r.sku_code || '-') + '</td>' +
        '<td class="sls-rev-num">' + (r.quantity_cases != null ? r.quantity_cases : '-') + '</td>' +
        '<td class="sls-rev-num">' + slsFormatIDR(r.revenue_idr) + '</td>' +
        '<td class="row-secondary">' + slsEscapeHtml(r.channel || '-') + '</td>' +
      '</tr>';
    }).join('');
  }

  // Pagination controls
  var pagEl = document.getElementById('sls-rev-pagination');
  if (totalPages <= 1) {
    pagEl.innerHTML = total + ' transaction' + (total !== 1 ? 's' : '');
  } else {
    pagEl.innerHTML =
      '<button ' + (_slsRevPage <= 1 ? 'disabled' : '') + ' onclick="_slsRevPage--;slsRenderRevenue();">&laquo; Prev</button>' +
      '<span>Page ' + _slsRevPage + ' of ' + totalPages + ' (' + total + ' rows)</span>' +
      '<button ' + (_slsRevPage >= totalPages ? 'disabled' : '') + ' onclick="_slsRevPage++;slsRenderRevenue();">Next &raquo;</button>';
  }
}

// ============================================================
// ACCOUNTS TABLE
// ============================================================

function slsAcctFilter(status) {
  _slsAcctStatusFilter = status;
  document.querySelectorAll('#tool-accounts .pm-filter-tab').forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.status === status);
  });
  slsRenderAccounts();
}

function slsRenderAccounts() {
  var accts = slsGetAccounts().slice();
  var search = (document.getElementById('sls-acct-search').value || '').toLowerCase();

  if (_slsAcctStatusFilter !== 'all') {
    accts = accts.filter(function (a) { return (a.status || '') === _slsAcctStatusFilter; });
  }

  if (search) {
    accts = accts.filter(function (a) {
      return (a.venue_name || '').toLowerCase().indexOf(search) !== -1 ||
             (a.account_id || '').toLowerCase().indexOf(search) !== -1;
    });
  }

  accts.sort(function (a, b) {
    return (a.venue_name || '').localeCompare(b.venue_name || '');
  });

  var tbody = document.getElementById('sls-acct-tbody');
  if (!accts.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">No accounts found</td></tr>';
    return;
  }

  tbody.innerHTML = accts.map(function (a) {
    var statusClass = (a.status || '').replace(/\s+/g, '-');
    return '<tr>' +
      '<td>' + slsEscapeHtml(a.venue_name || '-') + '</td>' +
      '<td class="row-secondary" style="font-family:monospace;font-size:0.8rem;">' + slsEscapeHtml(a.account_id || '-') + '</td>' +
      '<td><span class="sls-status ' + statusClass + '">' + slsEscapeHtml(a.status || '-') + '</span></td>' +
      '<td class="row-secondary">' + slsFormatDate(a.first_order_date) + '</td>' +
      '<td class="row-secondary">' + slsFormatDate(a.latest_order_date) + '</td>' +
      '<td class="sls-rev-num">' + (a.days_since_last != null ? a.days_since_last : '-') + '</td>' +
    '</tr>';
  }).join('');
}

// ============================================================
// DECK METRICS TABLE
// ============================================================

function slsRenderDeck() {
  var deck = slsGetDeck().slice();
  var search = (document.getElementById('sls-deck-search').value || '').toLowerCase();

  if (search) {
    deck = deck.filter(function (d) {
      return (d.month_key || '').toLowerCase().indexOf(search) !== -1 ||
             (d.month_label || '').toLowerCase().indexOf(search) !== -1;
    });
  }

  deck.sort(function (a, b) { return (b.month_key || '').localeCompare(a.month_key || ''); });

  var tbody = document.getElementById('sls-deck-tbody');
  if (!deck.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted);">No deck metrics found</td></tr>';
    return;
  }

  tbody.innerHTML = deck.map(function (d) {
    var meta = {};
    try { meta = JSON.parse(d.meta || '{}'); } catch (e) {}
    var presLink = meta.presentation_url
      ? '<a href="' + slsEscapeHtml(meta.presentation_url) + '" target="_blank" rel="noopener" style="font-size:0.78rem;">View Deck</a> '
      : '';
    return '<tr>' +
      '<td style="font-weight:500;">' + slsEscapeHtml(d.month_label || d.month_key) + '</td>' +
      '<td class="sls-rev-num">' + slsFormatIDR(d.total_revenue_idr) + '</td>' +
      '<td class="sls-rev-num">' + (d.gross_margin_pct != null ? d.gross_margin_pct + '%' : '-') + '</td>' +
      '<td class="row-secondary">' + slsEscapeHtml(d.gross_margin_vs_prev || '-') + '</td>' +
      '<td><span class="sls-dq ' + slsEscapeHtml(d.dq_flag || '') + '">' + slsEscapeHtml(d.dq_flag || '-') + '</span></td>' +
      '<td class="row-secondary" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + slsEscapeHtml(d.headline || '-') + '</td>' +
      '<td><div class="row-actions">' + presLink +
        '<button class="btn-row-action" onclick="slsGenerateDeck(\'' + slsEscapeHtml(d.month_key) + '\')">Generate Deck</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
}

// ============================================================
// API ACTIONS
// ============================================================

function slsApiPost(endpoint, body) {
  return fetch(SLS_API_BASE + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : '{}'
  }).then(function (res) { return res.json(); });
}

function slsImportReceivables() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,.csv';
  input.onchange = function () {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var rows;
      if (file.name.endsWith('.csv')) {
        rows = slsParseCsv(e.target.result);
      } else {
        try { rows = JSON.parse(e.target.result); } catch (err) { alert('Invalid JSON'); return; }
        if (!Array.isArray(rows)) { alert('Expected array of rows'); return; }
      }
      slsApiPost('/sales/import-receivables', { rows: rows })
        .then(function (body) {
          if (body.ok) {
            alert('Imported ' + (body.imported || 0) + ' transactions, ' + (body.skipped || 0) + ' skipped.');
            slsLoadAll().then(function () { slsRenderOverview(); slsRenderRevenue(); });
          } else {
            alert('Import failed: ' + (body.error ? body.error.message : 'Unknown error'));
          }
        }).catch(function (err) { alert('Error: ' + err.message); });
    };
    reader.readAsText(file);
  };
  input.click();
}

function slsParseCsv(text) {
  var lines = text.split('\n').filter(function (l) { return l.trim(); });
  if (lines.length < 2) return [];
  var headers = lines[0].split(',').map(function (h) { return h.trim().replace(/^"|"$/g, ''); });
  var rows = [];
  for (var i = 1; i < lines.length; i++) {
    var vals = lines[i].split(',').map(function (v) { return v.trim().replace(/^"|"$/g, ''); });
    var obj = {};
    headers.forEach(function (h, idx) { obj[h] = vals[idx] || ''; });
    rows.push(obj);
  }
  return rows;
}

function slsRefreshDeckMetrics() {
  if (!confirm('Refresh deck metrics from current revenue data?')) return;
  slsApiPost('/sales/refresh-deck-metrics')
    .then(function (body) {
      if (body.ok) {
        alert('Deck metrics refreshed: ' + (body.months_refreshed || 0) + ' months.');
        slsLoadAll().then(function () { slsRenderOverview(); slsRenderDeck(); });
      } else {
        alert('Refresh failed: ' + (body.error ? body.error.message : 'Unknown error'));
      }
    }).catch(function (err) { alert('Error: ' + err.message); });
}

function slsRebuildAccountStatus() {
  if (!confirm('Rebuild account status snapshots from revenue data?')) return;
  slsApiPost('/sales/rebuild-account-status')
    .then(function (body) {
      if (body.ok) {
        alert('Account status rebuilt: ' + (body.accounts_processed || 0) + ' accounts.');
        slsLoadAll().then(function () { slsRenderOverview(); slsRenderAccounts(); });
      } else {
        alert('Rebuild failed: ' + (body.error ? body.error.message : 'Unknown error'));
      }
    }).catch(function (err) { alert('Error: ' + err.message); });
}

function slsSyncMapping() {
  if (!confirm('Sync account mapping and enrich revenue transactions?')) return;
  slsApiPost('/sales/sync-mapping')
    .then(function (body) {
      if (body.ok) {
        alert('Mapping synced: ' + (body.upserted || 0) + ' mappings, ' + (body.enriched || 0) + ' transactions enriched.');
        slsLoadAll().then(function () { slsRenderRevenue(); });
      } else {
        alert('Sync failed: ' + (body.error ? body.error.message : 'Unknown error'));
      }
    }).catch(function (err) { alert('Error: ' + err.message); });
}

function slsRunPipeline() {
  if (!confirm('Run the full sales pipeline?\n\nThis will: import → compute margins → generate deck metrics.')) return;
  slsApiPost('/sales/run-pipeline')
    .then(function (body) {
      if (body.ok) {
        alert('Pipeline completed.\nJob ID: ' + body.job_id + '\nSteps completed: ' + (body.steps ? body.steps.length : 0));
        slsLoadAll().then(function () { slsRenderOverview(); });
      } else {
        alert('Pipeline failed: ' + (body.error ? body.error.message : 'Unknown error'));
      }
    }).catch(function (err) { alert('Error: ' + err.message); });
}

function slsGenerateDeck(monthKey) {
  if (!confirm('Generate slides deck for ' + monthKey + '?')) return;
  slsApiPost('/deck-metrics/' + encodeURIComponent(monthKey) + '/generate-deck')
    .then(function (body) {
      if (body.ok && body.result && body.result.presentation_url) {
        alert('Deck generated successfully.\nJob ID: ' + body.job_id);
        window.open(body.result.presentation_url, '_blank');
        slsLoadAll().then(function () { slsRenderDeck(); });
      } else if (body.ok) {
        alert('Deck generation job created.\nJob ID: ' + body.job_id + '\nCheck Jobs for result.');
      } else {
        alert('Deck generation failed: ' + (body.error ? body.error.message : 'Unknown error'));
      }
    }).catch(function (err) { alert('Error: ' + err.message); });
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  slsLoadAll().then(function () {
    slsRenderOverview();
  });
});
