// Agreements Module - Data & Logic Engine
// Storage: CandidStore (D1 via API) with localStorage fallback.
// Pattern: matches projects.js switchTool() sidebar navigation and crm.js CRUD conventions.

// ============================================================
// DATA LAYER
// ============================================================

var _agrAgreements = null;
var _agrCompanies = null;
var _agrDataReady = false;
var _agrCurrentDetailId = null;

// Status filter
var _agrStatusFilter = 'all';

// Sort state
var _agrSortCol = 'agreementDate';
var _agrSortDir = 'desc';

// ---- Load all data from CandidStore ----

function agrLoadAll() {
  if (typeof CandidStore === 'undefined') {
    return Promise.resolve({ agreements: [], companies: [] });
  }
  return Promise.all([
    CandidStore.load('agreements'),
    CandidStore.load('companies')
  ]).then(function (results) {
    _agrAgreements = results[0] || [];
    _agrCompanies = results[1] || [];
    _agrDataReady = true;
    return { agreements: _agrAgreements, companies: _agrCompanies };
  });
}

function agrGetAgreements() { return _agrAgreements || []; }
function agrGetCompanies() { return _agrCompanies || []; }

// ============================================================
// FORMAT HELPERS
// ============================================================

function agrFormatDate(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function agrEscapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function agrCompanyName(companyId) {
  if (!companyId) return '-';
  var companies = agrGetCompanies();
  for (var i = 0; i < companies.length; i++) {
    if (companies[i].id === companyId) return companies[i].name || companyId;
  }
  return companyId;
}

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

function agrSwitchTool(toolId) {
  document.querySelectorAll('.tool-btn').forEach(function (btn) {
    btn.classList.toggle('active', btn.dataset.tool === toolId);
  });
  document.querySelectorAll('.tool-panel').forEach(function (panel) {
    panel.classList.toggle('active', panel.id === 'tool-' + toolId);
  });
  if (toolId === 'overview') agrRenderOverview();
  else if (toolId === 'agreements') agrRenderTable();
}

// ============================================================
// OVERVIEW PANEL
// ============================================================

function agrRenderOverview() {
  var agreements = agrGetAgreements();
  var draft = 0, active = 0, expired = 0, terminated = 0;

  agreements.forEach(function (a) {
    var s = a.status || 'draft';
    if (s === 'draft') draft++;
    else if (s === 'active') active++;
    else if (s === 'expired') expired++;
    else if (s === 'terminated') terminated++;
  });

  document.getElementById('stat-agr-total').textContent = agreements.length;
  document.getElementById('stat-agr-draft').textContent = draft;
  document.getElementById('stat-agr-active').textContent = active;
  document.getElementById('stat-agr-expired').textContent = expired;
  document.getElementById('stat-agr-terminated').textContent = terminated;

  // Recent agreements
  var recent = agreements.slice().sort(function (a, b) {
    return (b.createdAt || '').localeCompare(a.createdAt || '');
  }).slice(0, 5);

  var container = document.getElementById('agr-recent-list');
  if (!recent.length) {
    container.innerHTML = '<div class="pm-empty"><div class="pm-empty-icon">&#128203;</div><p>No agreements yet</p><button class="btn-add" onclick="agrSwitchTool(\'agreements\'); agrOpenAdd();">+ New Agreement</button></div>';
    return;
  }

  container.innerHTML = '<h3 style="font-size:1rem;margin-bottom:12px;color:var(--text-primary);">Recent Agreements</h3>' +
    recent.map(function (a) {
      return '<div class="agr-recent-card" onclick="agrOpenDetail(\'' + a.id + '\')" style="cursor:pointer;">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">' +
          '<span style="font-weight:500;color:var(--text-primary);">' + agrEscapeHtml(a.accountName) + '</span>' +
          '<span class="agr-status ' + (a.status || 'draft') + '">' + agrEscapeHtml(a.status || 'draft') + '</span>' +
        '</div>' +
        '<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:4px;">' +
          agrEscapeHtml(a.agreementType || '-') + ' &middot; ' + agrFormatDate(a.agreementDate) +
        '</div>' +
      '</div>';
    }).join('');
}

// ============================================================
// AGREEMENTS TABLE
// ============================================================

function agrFilterStatus(status) {
  _agrStatusFilter = status;
  document.querySelectorAll('.pm-filter-tab').forEach(function (tab) {
    tab.classList.toggle('active', tab.dataset.status === status);
  });
  agrRenderTable();
}

function agrSort(col) {
  if (_agrSortCol === col) {
    _agrSortDir = _agrSortDir === 'asc' ? 'desc' : 'asc';
  } else {
    _agrSortCol = col;
    _agrSortDir = 'asc';
  }
  // Update sort arrows
  document.querySelectorAll('.agr-sort-btn').forEach(function (btn) {
    var arrow = btn.querySelector('.sort-arrow');
    if (btn.dataset.col === col) {
      arrow.textContent = _agrSortDir === 'asc' ? ' \u25B2' : ' \u25BC';
    } else {
      arrow.textContent = '';
    }
  });
  agrRenderTable();
}

function agrRenderTable() {
  var agreements = agrGetAgreements().slice();
  var search = (document.getElementById('agr-search').value || '').toLowerCase();

  // Filter by status
  if (_agrStatusFilter !== 'all') {
    agreements = agreements.filter(function (a) { return (a.status || 'draft') === _agrStatusFilter; });
  }

  // Filter by search
  if (search) {
    agreements = agreements.filter(function (a) {
      return (a.accountName || '').toLowerCase().indexOf(search) !== -1 ||
             (a.contactName || '').toLowerCase().indexOf(search) !== -1 ||
             (a.agreementKey || '').toLowerCase().indexOf(search) !== -1 ||
             (a.agreementType || '').toLowerCase().indexOf(search) !== -1;
    });
  }

  // Sort
  var col = _agrSortCol;
  var dir = _agrSortDir === 'asc' ? 1 : -1;
  agreements.sort(function (a, b) {
    var va = a[col] || '';
    var vb = b[col] || '';
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });

  var tbody = document.getElementById('agr-tbody');
  if (!agreements.length) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-muted);">No agreements found</td></tr>';
    return;
  }

  tbody.innerHTML = agreements.map(function (a) {
    return '<tr>' +
      '<td><button class="pm-project-name-link" onclick="agrOpenDetail(\'' + a.id + '\')">' + agrEscapeHtml(a.accountName) + '</button></td>' +
      '<td class="row-secondary">' + agrEscapeHtml(a.agreementType || '-') + '</td>' +
      '<td><span class="agr-status ' + (a.status || 'draft') + '">' + agrEscapeHtml(a.status || 'draft') + '</span></td>' +
      '<td class="row-secondary">' + agrFormatDate(a.agreementDate) + '</td>' +
      '<td class="row-secondary">' + agrFormatDate(a.endDate) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-row-action" onclick="agrOpenEdit(\'' + a.id + '\')">Edit</button>' +
        '<button class="btn-row-action danger" onclick="agrDelete(\'' + a.id + '\')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
}

// ============================================================
// FORM DRAWER — Add / Edit
// ============================================================

function agrOpenModal(id) {
  document.getElementById(id + '-backdrop').classList.add('active');
  document.getElementById(id).classList.add('active');
}

function agrCloseModal(id) {
  document.getElementById(id + '-backdrop').classList.remove('active');
  document.getElementById(id).classList.remove('active');
}

function agrPopulateCompanyDropdown() {
  var select = document.getElementById('agr-company-id');
  var companies = agrGetCompanies();
  // Keep existing first option
  select.innerHTML = '<option value="">-- Select Company --</option>';
  companies.forEach(function (c) {
    select.innerHTML += '<option value="' + agrEscapeHtml(c.id) + '">' + agrEscapeHtml(c.name) + '</option>';
  });
}

function agrOpenAdd() {
  document.getElementById('agr-modal-title').textContent = 'New Agreement';
  document.getElementById('agr-edit-id').value = '';
  document.getElementById('agr-form').reset();
  agrPopulateCompanyDropdown();
  agrOpenModal('agr-modal');
}

function agrOpenEdit(id) {
  var agreements = agrGetAgreements();
  var agr = null;
  for (var i = 0; i < agreements.length; i++) {
    if (agreements[i].id === id) { agr = agreements[i]; break; }
  }
  if (!agr) return;

  document.getElementById('agr-modal-title').textContent = 'Edit Agreement';
  document.getElementById('agr-edit-id').value = id;
  document.getElementById('agr-account-name').value = agr.accountName || '';
  document.getElementById('agr-contact-name').value = agr.contactName || '';
  agrPopulateCompanyDropdown();
  document.getElementById('agr-company-id').value = agr.companyId || '';
  document.getElementById('agr-agreement-type').value = agr.agreementType || 'distribution';
  document.getElementById('agr-agreement-date').value = agr.agreementDate || '';
  document.getElementById('agr-start-date').value = agr.startDate || '';
  document.getElementById('agr-end-date').value = agr.endDate || '';
  document.getElementById('agr-terms').value = agr.terms || '';
  document.getElementById('agr-notes').value = agr.notes || '';

  agrOpenModal('agr-modal');
}

function agrSave() {
  var editId = document.getElementById('agr-edit-id').value;
  var data = {
    accountName: document.getElementById('agr-account-name').value.trim(),
    contactName: document.getElementById('agr-contact-name').value.trim(),
    companyId: document.getElementById('agr-company-id').value || null,
    agreementType: document.getElementById('agr-agreement-type').value,
    agreementDate: document.getElementById('agr-agreement-date').value || null,
    startDate: document.getElementById('agr-start-date').value || null,
    endDate: document.getElementById('agr-end-date').value || null,
    terms: document.getElementById('agr-terms').value.trim(),
    notes: document.getElementById('agr-notes').value.trim()
  };

  if (!data.accountName) {
    alert('Account Name is required.');
    return;
  }

  var promise;
  if (editId) {
    promise = CandidStore.update('agreements', editId, data);
  } else {
    // Generate agreement_key from account name + date
    data.agreementKey = (data.accountName.replace(/\s+/g, '-').toLowerCase() + '-' + (data.agreementDate || new Date().toISOString().slice(0, 10)));
    promise = CandidStore.create('agreements', data);
  }

  promise.then(function (result) {
    if (result && result.error) {
      alert(result.error.message || 'Save failed');
      return;
    }
    agrCloseModal('agr-modal');
    agrLoadAll().then(function () {
      agrRenderTable();
      agrRenderOverview();
      if (_agrCurrentDetailId) agrOpenDetail(_agrCurrentDetailId);
    });
  }).catch(function (err) {
    alert('Error saving agreement: ' + (err.message || err));
  });
}

function agrDelete(id) {
  if (!confirm('Delete this agreement? This cannot be undone.')) return;
  CandidStore.remove('agreements', id).then(function () {
    agrLoadAll().then(function () {
      agrRenderTable();
      agrRenderOverview();
      if (_agrCurrentDetailId === id) agrCloseDetail();
    });
  });
}

// ============================================================
// DETAIL DRAWER
// ============================================================

function agrOpenDetail(id) {
  _agrCurrentDetailId = id;
  var agreements = agrGetAgreements();
  var agr = null;
  for (var i = 0; i < agreements.length; i++) {
    if (agreements[i].id === id) { agr = agreements[i]; break; }
  }
  if (!agr) return;

  document.getElementById('agr-detail-name').textContent = agr.accountName || 'Agreement';
  var statusEl = document.getElementById('agr-detail-status');
  statusEl.textContent = agr.status || 'draft';
  statusEl.className = 'agr-status ' + (agr.status || 'draft');

  // Meta
  var meta = document.getElementById('agr-detail-meta');
  meta.innerHTML =
    '<div class="agr-meta-row"><span class="agr-meta-label">Type</span><span>' + agrEscapeHtml(agr.agreementType || '-') + '</span></div>' +
    '<div class="agr-meta-row"><span class="agr-meta-label">Contact</span><span>' + agrEscapeHtml(agr.contactName || '-') + '</span></div>' +
    '<div class="agr-meta-row"><span class="agr-meta-label">Company</span><span>' + agrEscapeHtml(agrCompanyName(agr.companyId)) + '</span></div>' +
    '<div class="agr-meta-row"><span class="agr-meta-label">Agreement Date</span><span>' + agrFormatDate(agr.agreementDate) + '</span></div>' +
    '<div class="agr-meta-row"><span class="agr-meta-label">Start Date</span><span>' + agrFormatDate(agr.startDate) + '</span></div>' +
    '<div class="agr-meta-row"><span class="agr-meta-label">End Date</span><span>' + agrFormatDate(agr.endDate) + '</span></div>' +
    (agr.agreementKey ? '<div class="agr-meta-row"><span class="agr-meta-label">Key</span><span style="font-family:monospace;font-size:0.8rem;">' + agrEscapeHtml(agr.agreementKey) + '</span></div>' : '');

  // Terms
  var termsSection = document.getElementById('agr-detail-terms-section');
  var termsEl = document.getElementById('agr-detail-terms');
  if (agr.terms) {
    termsSection.style.display = '';
    termsEl.textContent = agr.terms;
  } else {
    termsSection.style.display = 'none';
  }

  // Notes
  var notesSection = document.getElementById('agr-detail-notes-section');
  var notesEl = document.getElementById('agr-detail-notes');
  if (agr.notes) {
    notesSection.style.display = '';
    notesEl.textContent = agr.notes;
  } else {
    notesSection.style.display = 'none';
  }

  // Status action buttons
  agrRenderDetailActions(agr);

  // Comments
  agrLoadComments(id);

  // Show drawer
  document.getElementById('agr-detail-overlay').classList.add('pm-drawer-overlay--visible');
  document.getElementById('agr-detail-drawer').classList.add('pm-drawer--open');
}

function agrCloseDetail() {
  _agrCurrentDetailId = null;
  document.getElementById('agr-detail-overlay').classList.remove('pm-drawer-overlay--visible');
  document.getElementById('agr-detail-drawer').classList.remove('pm-drawer--open');
}

function agrEditFromDetail() {
  if (_agrCurrentDetailId) agrOpenEdit(_agrCurrentDetailId);
}

// ============================================================
// STATUS ACTIONS
// ============================================================

function agrRenderDetailActions(agr) {
  var actions = document.getElementById('agr-detail-actions');
  var status = agr.status || 'draft';
  var html = '';

  // Generate Document button — always available
  html += '<button class="btn-modal primary" onclick="agrGenerateDoc(\'' + agr.id + '\')">Generate Document</button>';

  if (status === 'draft') {
    html += '<button class="btn-modal primary" onclick="agrTransition(\'' + agr.id + '\', \'active\')">Activate</button>';
    html += '<button class="btn-modal secondary" onclick="agrTransition(\'' + agr.id + '\', \'terminated\')">Terminate</button>';
  } else if (status === 'active') {
    html += '<button class="btn-modal secondary" onclick="agrTransition(\'' + agr.id + '\', \'expired\')">Mark Expired</button>';
    html += '<button class="btn-modal secondary" onclick="agrTransition(\'' + agr.id + '\', \'terminated\')">Terminate</button>';
  }

  actions.innerHTML = html;
}

function agrTransition(id, newStatus) {
  var label = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
  if (!confirm('Change status to ' + label + '?')) return;

  CandidStore.update('agreements', id, { status: newStatus }).then(function (result) {
    if (result && result.error) {
      alert(result.error.message || 'Transition failed');
      return;
    }
    agrLoadAll().then(function () {
      agrRenderTable();
      agrRenderOverview();
      agrOpenDetail(id);
    });
  }).catch(function (err) {
    alert('Error: ' + (err.message || err));
  });
}

// ============================================================
// DOCUMENT GENERATION
// ============================================================

var AGR_API_BASE = 'https://candidlabs-api.dieterwerwath.workers.dev/api';

function agrGenerateDoc(id) {
  if (!confirm('Generate document for this agreement?')) return;

  var btn = event && event.target;
  if (btn) { btn.disabled = true; btn.textContent = 'Generating...'; }

  fetch(AGR_API_BASE + '/agreements/' + id + '/generate-doc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }).then(function (res) { return res.json(); })
    .then(function (body) {
      if (btn) { btn.disabled = false; btn.textContent = 'Generate Document'; }
      if (body.ok) {
        var docUrl = body.result && body.result.docUrl;
        if (docUrl) {
          alert('Document generated successfully.\nJob ID: ' + body.job_id);
          window.open(docUrl, '_blank');
        } else {
          alert('Document generation job created.\nJob ID: ' + body.job_id + '\nCheck Jobs for result.');
        }
      } else {
        alert('Document generation failed: ' + (body.error ? body.error.message : 'Unknown error'));
      }
    }).catch(function (err) {
      if (btn) { btn.disabled = false; btn.textContent = 'Generate Document'; }
      alert('Error: ' + (err.message || err));
    });
}

// ============================================================
// COMMENTS
// ============================================================

function agrLoadComments(recordId) {
  if (typeof CandidStore === 'undefined') return;
  CandidStore.loadComments('agreements', recordId).then(function (comments) {
    document.getElementById('agr-detail-comments-count').textContent = comments.length;
    var list = document.getElementById('agr-detail-comments-list');
    if (!comments.length) {
      list.innerHTML = '<p class="pm-drawer-empty">No comments yet</p>';
      return;
    }
    list.innerHTML = comments.map(function (c) {
      return '<div class="drawer-note-item">' +
        '<div class="drawer-note-text">' + agrEscapeHtml(c.body) + '</div>' +
        '<div class="drawer-note-meta">' + agrEscapeHtml(c.authorName || c.authorEmail) + ' &middot; ' + agrFormatDate(c.createdAt) + '</div>' +
      '</div>';
    }).join('');
  });
}

function agrSaveComment() {
  if (!_agrCurrentDetailId) return;
  var input = document.getElementById('agr-detail-comment-input');
  var body = input.value.trim();
  if (!body) return;

  CandidStore.postComment('agreements', _agrCurrentDetailId, body).then(function () {
    input.value = '';
    agrLoadComments(_agrCurrentDetailId);
  });
}

// ============================================================
// INIT
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
  agrLoadAll().then(function () {
    agrRenderOverview();
  });
});
