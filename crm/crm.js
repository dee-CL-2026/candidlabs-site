// CRM Module - Data & Logic Engine
// Storage: CandidStore (Worker API + D1) with localStorage fallback.
// Pattern: matches budget.js switchTool() sidebar navigation.

// ============================================================
// DATA LAYER - CandidStore backed (API/D1, localStorage fallback)
// ============================================================

var KAA_FORM_URL = 'https://docs.google.com/forms/d/18dshhMSz7csbJBbeLg_fba6SAJMG5uyd3DnkW59rVSw/viewform';

// In-memory cache — populated by initData() on page load
var _contacts = [];
var _companies = [];
var _deals = [];

// Synchronous read from in-memory cache (always up-to-date after initData)
function loadData(key) {
  if (key === 'contacts') return _contacts.slice();
  if (key === 'companies') return _companies.slice();
  if (key === 'deals') return _deals.slice();
  return [];
}

// Load all collections from CandidStore (API/D1) into cache, then render
function initData() {
  return Promise.all([
    CandidStore.load('contacts'),
    CandidStore.load('companies'),
    CandidStore.load('deals')
  ]).then(function(results) {
    _contacts = results[0] || [];
    _companies = results[1] || [];
    _deals = results[2] || [];
    _populateContactsCompanyFilter();
  });
}

function generateId(prefix) {
  const num = Date.now().toString(36).slice(-4).toUpperCase();
  return prefix + '-' + num;
}

// ============================================================
// SORT ENGINE
// ============================================================

var _sort = {
  contacts: { col: null, dir: 1 },
  companies: { col: null, dir: 1 },
  deals: { col: null, dir: 1 }
};

function sortTable(collection, col) {
  var s = _sort[collection];
  if (s.col === col) { s.dir *= -1; } else { s.col = col; s.dir = 1; }
  _updateSortArrows(collection);
  if (collection === 'contacts') renderContacts(document.getElementById('contacts-search').value);
  else if (collection === 'companies') renderCompanies(document.getElementById('companies-search').value);
  else if (collection === 'deals') { if (_dealView === 'board') renderDealsKanban(); else renderDeals(document.getElementById('deals-search').value); }
}

function _updateSortArrows(collection) {
  var s = _sort[collection];
  document.querySelectorAll('[id^="sort-' + collection + '-"]').forEach(function(el) { el.textContent = ''; });
  if (s.col) {
    var el = document.getElementById('sort-' + collection + '-' + s.col);
    if (el) el.textContent = s.dir === 1 ? ' ↑' : ' ↓';
  }
}

function _applySorted(arr, collection, resolveField) {
  var s = _sort[collection];
  if (!s.col) return arr.slice();
  return arr.slice().sort(function(a, b) {
    if (s.col === 'value') {
      return ((parseFloat(a.value) || 0) - (parseFloat(b.value) || 0)) * s.dir;
    }
    var av = String(resolveField ? resolveField(a, s.col) : (a[s.col] || '')).toLowerCase();
    var bv = String(resolveField ? resolveField(b, s.col) : (b[s.col] || '')).toLowerCase();
    if (av < bv) return -s.dir;
    if (av > bv) return s.dir;
    return 0;
  });
}

// ============================================================
// DEALS KANBAN VIEW
// ============================================================

var _dealView = 'list';

var DEAL_KANBAN_COLUMNS = [
  { key: 'prospecting', label: 'Prospecting', color: '#64748b' },
  { key: 'proposal',    label: 'Proposal',    color: '#1b708b' },
  { key: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
  { key: 'closed-won',  label: 'Closed Won',  color: '#10b981' },
  { key: 'closed-lost', label: 'Closed Lost', color: '#ef4444' }
];

function setDealView(view) {
  _dealView = view;
  document.getElementById('deals-list-view').style.display = view === 'list' ? '' : 'none';
  document.getElementById('deals-board-view').style.display = view === 'board' ? '' : 'none';
  document.getElementById('deals-list-btn').classList.toggle('active', view === 'list');
  document.getElementById('deals-board-btn').classList.toggle('active', view === 'board');
  document.getElementById('deals-filter-tabs').style.display = view === 'list' ? '' : 'none';
  if (view === 'board') renderDealsKanban();
  else renderDeals(document.getElementById('deals-search').value);
}

function renderDealsKanban() {
  var query = (document.getElementById('deals-search').value || '').toLowerCase();
  var deals = _deals.slice();
  if (query) deals = deals.filter(function(d) { return d.title.toLowerCase().indexOf(query) !== -1; });

  var board = document.getElementById('deals-kanban-board');
  if (!board) return;

  board.innerHTML = DEAL_KANBAN_COLUMNS.map(function(col) {
    var colDeals = _applySorted(
      deals.filter(function(d) { return (d.stage || 'prospecting') === col.key; }),
      'deals',
      function(d, key) {
        if (key === 'companyName') { var c = _companies.find(function(co) { return co.id === d.companyId; }); return c ? c.name : ''; }
        return d[key] || '';
      }
    );
    var total = colDeals.reduce(function(s, d) { return s + (d.value || 0); }, 0);

    return '<div class="crm-kanban-col">' +
      '<div class="crm-kanban-col-header" style="border-top:3px solid ' + col.color + '">' +
        '<span class="crm-kanban-col-dot" style="background:' + col.color + '"></span>' +
        '<span class="crm-kanban-col-label">' + col.label + '</span>' +
        '<span class="crm-kanban-col-count">' + colDeals.length + '</span>' +
        (total > 0 ? '<span class="crm-kanban-col-value">' + formatIDR(total) + '</span>' : '') +
      '</div>' +
      '<div class="crm-kanban-col-cards">' +
        (colDeals.length === 0
          ? '<div class="crm-kanban-empty">No deals</div>'
          : colDeals.map(function(d) {
              var co = _companies.find(function(c) { return c.id === d.companyId; });
              return '<div class="crm-kanban-card" onclick="openDetail(\'deal\',\'' + d.id + '\')">' +
                '<div class="crm-kanban-card-title">' + escapeHtml(d.title) + '</div>' +
                (co ? '<div class="crm-kanban-card-company">' + escapeHtml(co.name) + '</div>' : '') +
                '<div class="crm-kanban-card-footer">' +
                  '<span class="crm-kanban-card-value">' + formatIDR(d.value || 0) + '</span>' +
                  '<button class="btn-row-action" onclick="event.stopPropagation();openEditDeal(\'' + d.id + '\')">Edit</button>' +
                '</div>' +
              '</div>';
            }).join('')
        ) +
      '</div>' +
    '</div>';
  }).join('');
}

function openKAAForm() {
  window.open(KAA_FORM_URL, '_blank', 'noopener');
}

function openKAAForCompany(companyId) {
  if (!companyId) return openKAAForm();
  return openKAAForm();
}

function openKAAForDeal(dealId) {
  if (!dealId) return openKAAForm();
  return openKAAForm();
}

// ============================================================
// FORMAT HELPERS
// ============================================================

function formatIDR(num) {
  if (num >= 1000000000) return 'IDR ' + (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return 'IDR ' + (num / 1000000).toFixed(0) + 'M';
  return 'IDR ' + Math.round(num).toLocaleString('id-ID');
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ============================================================
// SIDEBAR NAVIGATION - matches budget.js switchTool() pattern
// ============================================================

function switchTool(toolId) {
  document.querySelectorAll('.tool-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.tool === toolId);
  });
  document.querySelectorAll('.tool-panel').forEach(function(panel) {
    panel.classList.toggle('active', panel.id === 'tool-' + toolId);
  });
  // Refresh the active panel's data
  if (toolId === 'contacts') renderContacts();
  else if (toolId === 'companies') renderCompanies();
  else if (toolId === 'deals') renderDeals();
  else if (toolId === 'overview') renderOverview();
}

// ============================================================
// OVERVIEW PANEL
// ============================================================

function renderOverview() {
  var contacts = loadData('contacts');
  var companies = loadData('companies').filter(function(c) { return c.status !== 'prospect'; });
  var deals = loadData('deals');

  document.getElementById('stat-contacts').textContent = contacts.length;
  document.getElementById('stat-companies').textContent = companies.length;
  document.getElementById('stat-deals').textContent = deals.length;

  var pipelineValue = deals
    .filter(function(d) { return d.stage !== 'closed-lost'; })
    .reduce(function(sum, d) { return sum + (d.value || 0); }, 0);
  document.getElementById('stat-pipeline').textContent = formatIDR(pipelineValue);
}

// ============================================================
// CONTACTS PANEL
// ============================================================

function _populateContactsCompanyFilter() {
  var sel = document.getElementById('contacts-company-filter');
  if (!sel) return;
  var current = sel.value;
  sel.innerHTML = '<option value="">All Companies</option>' +
    _companies.slice().sort(function(a,b){ return a.name.localeCompare(b.name); }).map(function(co) {
      return '<option value="' + co.id + '">' + escapeHtml(co.name) + '</option>';
    }).join('');
  sel.value = current;
}

function renderContacts(filter) {
  var companies = loadData('companies');
  var query = (filter || '').toLowerCase();
  var companyFilter = (document.getElementById('contacts-company-filter') || {}).value || '';

  var contacts = _applySorted(_contacts, 'contacts', function(c, key) {
    if (key === 'companyName') { var co = companies.find(function(x) { return x.id === c.companyId; }); return co ? co.name : ''; }
    return c[key] || '';
  });

  if (query) {
    contacts = contacts.filter(function(c) {
      return c.name.toLowerCase().indexOf(query) !== -1 ||
             (c.firstName || c.first_name || '').toLowerCase().indexOf(query) !== -1 ||
             (c.lastName || c.last_name || '').toLowerCase().indexOf(query) !== -1 ||
             (c.email || '').toLowerCase().indexOf(query) !== -1 ||
             (c.role || '').toLowerCase().indexOf(query) !== -1;
    });
  }
  if (companyFilter) {
    contacts = contacts.filter(function(c) { return c.companyId === companyFilter; });
  }

  var tbody = document.getElementById('contacts-tbody');
  if (!contacts.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="crm-empty"><div class="crm-empty-icon">&#128100;</div><p>No contacts found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = contacts.map(function(c) {
    var company = companies.find(function(co) { return co.id === c.companyId; });
    var companyName = company ? company.name : '-';
    return '<tr>' +
      '<td class="row-name"><button class="row-name-link" onclick="openDetail(\'contact\',\'' + c.id + '\')">' + (escapeHtml((c.firstName || c.first_name || '') + ' ' + (c.lastName || c.last_name || '')).trim() || escapeHtml(c.name)) + '</button></td>' +
      '<td class="row-secondary">' + escapeHtml(companyName) + '</td>' +
      '<td class="row-secondary">' + escapeHtml(c.role || '-') + '</td>' +
      '<td class="row-secondary">' + escapeHtml(c.email) + '</td>' +
      '<td class="row-secondary">' + escapeHtml(c.phone || '-') + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-row-action" onclick="openEditContact(\'' + c.id + '\')">Edit</button>' +
        '<button class="btn-row-action danger" data-auth-role="admin" onclick="deleteContact(\'' + c.id + '\')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  applyAuthVisibility();
}

function openAddContact() {
  document.getElementById('contact-modal-title').textContent = 'Add Contact';
  document.getElementById('contact-form').reset();
  document.getElementById('contact-edit-id').value = '';
  document.getElementById('inline-new-company').style.display = 'none';
  populateCompanySelect('contact-company');
  document.getElementById('contact-modal').classList.add('active');
}

function openEditContact(id) {
  var contacts = loadData('contacts');
  var contact = contacts.find(function(c) { return c.id === id; });
  if (!contact) return;

  document.getElementById('contact-modal-title').textContent = 'Edit Contact';
  document.getElementById('contact-edit-id').value = contact.id;
  document.getElementById('contact-first-name').value = contact.firstName || contact.first_name || (contact.name ? contact.name.split(' ')[0] : '');
  document.getElementById('contact-last-name').value = contact.lastName || contact.last_name || (contact.name && contact.name.indexOf(' ') !== -1 ? contact.name.split(' ').slice(1).join(' ') : '');
  document.getElementById('contact-email').value = contact.email;
  document.getElementById('contact-phone').value = contact.phone || '';
  document.getElementById('contact-role').value = contact.role || '';
  populateCompanySelect('contact-company');
  document.getElementById('contact-company').value = contact.companyId || '';
  document.getElementById('contact-notes').value = contact.notes || '';
  document.getElementById('contact-modal').classList.add('active');
}

function saveContact() {
  var editId = document.getElementById('contact-edit-id').value;
  var companySelectVal = document.getElementById('contact-company').value;

  function doSave(resolvedCompanyId) {
    var firstName = document.getElementById('contact-first-name').value.trim();
    var lastName = document.getElementById('contact-last-name').value.trim();
    var record = {
      firstName: firstName,
      lastName: lastName,
      name: (firstName + ' ' + lastName).trim(),
      email: document.getElementById('contact-email').value.trim(),
      phone: document.getElementById('contact-phone').value.trim(),
      role: document.getElementById('contact-role').value.trim(),
      companyId: resolvedCompanyId || '',
      notes: document.getElementById('contact-notes').value.trim()
    };
    if (!firstName) return;

    var promise = editId
      ? CandidStore.update('contacts', editId, record)
      : CandidStore.create('contacts', record);

    promise.then(function() {
      return CandidStore.load('contacts');
    }).then(function(contacts) {
      _contacts = contacts;
      closeModal('contact-modal');
      renderContacts();
      renderCompanies();
      renderOverview();
    }).catch(function() {
      alert('Could not save contact. Please try again.');
    });
  }

  // Handle inline new company creation
  if (companySelectVal === '__new__') {
    var newCompanyName = (document.getElementById('inline-company-name') || {}).value || '';
    newCompanyName = newCompanyName.trim();
    if (!newCompanyName) {
      document.getElementById('inline-company-name').focus();
      document.getElementById('inline-company-name').style.borderColor = 'var(--color-error)';
      return;
    }
    var newCompanyData = {
      name: newCompanyName,
      market: (document.getElementById('inline-company-market') || {}).value || '',
      channel: (document.getElementById('inline-company-channel') || {}).value || '',
      status: 'lead',
      notes: ''
    };
    CandidStore.create('companies', newCompanyData).then(function(created) {
      return CandidStore.load('companies').then(function(companies) {
        _companies = companies;
        document.getElementById('inline-new-company').style.display = 'none';
        doSave(created.id);
      });
    }).catch(function() {
      alert('Could not create company. Please try again.');
    });
  } else {
    doSave(companySelectVal);
  }
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  var linkedDeals = _deals.filter(function(d) { return d.contactId === id; }).length;
  if (linkedDeals > 0) {
    alert('Cannot delete: this contact is linked to ' + linkedDeals + ' deals.');
    return;
  }
  CandidStore.remove('contacts', id).then(function() {
    _contacts = _contacts.filter(function(c) { return c.id !== id; });
    renderContacts();
    renderOverview();
  }).catch(function() {
    alert('Could not delete contact. Please try again.');
  });
}

// ============================================================
// COMPANIES PANEL
// ============================================================

function renderCompanies(filter) {
  var contacts = loadData('contacts');
  var query = (filter || '').toLowerCase();
  var typeFilter = (document.getElementById('companies-type-filter') || {}).value || '';

  var companies = _applySorted(_companies.filter(function(c) { return c.status !== 'prospect'; }), 'companies');

  if (query) {
    companies = companies.filter(function(c) {
      return c.name.toLowerCase().indexOf(query) !== -1 ||
             (c.market || '').toLowerCase().indexOf(query) !== -1 ||
             (c.channel || '').toLowerCase().indexOf(query) !== -1;
    });
  }
  if (typeFilter) {
    companies = companies.filter(function(c) { return (c.type || '') === typeFilter; });
  }

  var tbody = document.getElementById('companies-tbody');
  if (!companies.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="crm-empty"><div class="crm-empty-icon">&#127970;</div><p>No companies found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = companies.map(function(co) {
    var numContacts = contacts.filter(function(c) { return c.companyId === co.id; }).length;
    var statusClass = (co.status || 'active').toLowerCase();
    return '<tr>' +
      '<td class="row-name"><button class="row-name-link" onclick="openDetail(\'company\',\'' + co.id + '\')">' + escapeHtml(co.name) + '</button></td>' +
      '<td class="row-secondary">' + escapeHtml(co.market || '-') + '</td>' +
      '<td class="row-secondary">' + escapeHtml(co.channel || '-') + '</td>' +
      '<td><span class="crm-status ' + statusClass + '">' + escapeHtml(co.status || 'active') + '</span></td>' +
      '<td class="row-secondary">' + numContacts + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-row-action" onclick="openEditCompany(\'' + co.id + '\')">Edit</button>' +
        '<button class="btn-row-action" onclick="openKAAForCompany(\'' + co.id + '\')">KAA</button>' +
        '<button class="btn-row-action danger" data-auth-role="admin" onclick="deleteCompany(\'' + co.id + '\')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  applyAuthVisibility();
}

function openAddCompany() {
  document.getElementById('company-modal-title').textContent = 'Add Company';
  document.getElementById('company-form').reset();
  document.getElementById('company-edit-id').value = '';
  document.getElementById('company-modal').classList.add('active');
}

function openEditCompany(id) {
  var companies = loadData('companies');
  var company = companies.find(function(c) { return c.id === id; });
  if (!company) return;

  document.getElementById('company-modal-title').textContent = 'Edit Company';
  document.getElementById('company-edit-id').value = company.id;
  document.getElementById('company-name').value = company.name;
  document.getElementById('company-market').value = company.market || '';
  document.getElementById('company-channel').value = company.channel || '';
  document.getElementById('company-status').value = company.status || 'active';
  document.getElementById('company-notes').value = company.notes || '';
  document.getElementById('company-modal').classList.add('active');
}

function saveCompany() {
  var editId = document.getElementById('company-edit-id').value;
  var record = {
    name: document.getElementById('company-name').value.trim(),
    market: document.getElementById('company-market').value.trim(),
    channel: document.getElementById('company-channel').value,
    status: document.getElementById('company-status').value,
    notes: document.getElementById('company-notes').value.trim()
  };
  if (!record.name) return;

  var promise = editId
    ? CandidStore.update('companies', editId, record)
    : CandidStore.create('companies', record);

  promise.then(function() {
    return CandidStore.load('companies');
  }).then(function(companies) {
    _companies = companies;
    _populateContactsCompanyFilter();
    closeModal('company-modal');
    renderCompanies();
    renderOverview();
  }).catch(function() {
    alert('Could not save company. Please try again.');
  });
}

function deleteCompany(id) {
  if (!confirm('Delete this company?')) return;
  var linkedContacts = _contacts.filter(function(c) { return c.companyId === id; }).length;
  var linkedDeals = _deals.filter(function(d) { return d.companyId === id; }).length;
  if (linkedContacts > 0 || linkedDeals > 0) {
    alert('Cannot delete: this company is linked to ' + linkedContacts + ' contacts and ' + linkedDeals + ' deals.');
    return;
  }
  CandidStore.remove('companies', id).then(function() {
    _companies = _companies.filter(function(c) { return c.id !== id; });
    _populateContactsCompanyFilter();
    renderCompanies();
    renderOverview();
  }).catch(function() {
    alert('Could not delete company. Please try again.');
  });
}

// ============================================================
// DEALS PANEL
// ============================================================

var currentDealFilter = 'all';

function renderDeals(filter) {
  var companies = loadData('companies');
  var contacts = loadData('contacts');
  var query = (filter || '').toLowerCase();

  var deals = _applySorted(_deals, 'deals', function(d, key) {
    if (key === 'companyName') { var c = companies.find(function(co) { return co.id === d.companyId; }); return c ? c.name : ''; }
    return d[key] || '';
  });

  if (query) {
    deals = deals.filter(function(d) {
      return d.title.toLowerCase().indexOf(query) !== -1;
    });
  }

  if (currentDealFilter !== 'all') {
    deals = deals.filter(function(d) { return d.stage === currentDealFilter; });
  }

  var tbody = document.getElementById('deals-tbody');
  if (!deals.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="crm-empty"><div class="crm-empty-icon">&#128176;</div><p>No deals found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = deals.map(function(d) {
    var company = companies.find(function(co) { return co.id === d.companyId; });
    var companyName = company ? company.name : '-';
    var stageClass = (d.stage || '').toLowerCase();
    var stageLabel = d.stage ? d.stage.replace('-', ' ') : '-';
    return '<tr>' +
      '<td class="row-name"><button class="row-name-link" onclick="openDetail(\'deal\',\'' + d.id + '\')">' + escapeHtml(d.title) + '</button></td>' +
      '<td class="row-secondary">' + escapeHtml(companyName) + '</td>' +
      '<td class="deal-value">' + formatIDR(d.value || 0) + '</td>' +
      '<td><span class="crm-stage ' + stageClass + '">' + escapeHtml(stageLabel) + '</span></td>' +
      '<td class="row-secondary">' + formatDate(d.createdAt) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-row-action" onclick="openEditDeal(\'' + d.id + '\')">Edit</button>' +
        '<button class="btn-row-action" onclick="openKAAForDeal(\'' + d.id + '\')">KAA</button>' +
        '<button class="btn-row-action danger" data-auth-role="admin" onclick="deleteDeal(\'' + d.id + '\')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  applyAuthVisibility();
}

function filterDeals(stage) {
  currentDealFilter = stage;
  document.querySelectorAll('.crm-filter-tab').forEach(function(tab) {
    tab.classList.toggle('active', tab.dataset.stage === stage);
  });
  renderDeals(document.getElementById('deals-search') ? document.getElementById('deals-search').value : '');
}

function openAddDeal() {
  document.getElementById('deal-modal-title').textContent = 'Add Deal';
  document.getElementById('deal-form').reset();
  document.getElementById('deal-edit-id').value = '';
  populateCompanySelect('deal-company');
  populateContactSelect('deal-contact', '');
  document.getElementById('deal-modal').classList.add('active');
}

function openEditDeal(id) {
  var deals = loadData('deals');
  var deal = deals.find(function(d) { return d.id === id; });
  if (!deal) return;

  document.getElementById('deal-modal-title').textContent = 'Edit Deal';
  document.getElementById('deal-edit-id').value = deal.id;
  document.getElementById('deal-title').value = deal.title;
  populateCompanySelect('deal-company');
  document.getElementById('deal-company').value = deal.companyId || '';
  populateContactSelect('deal-contact', deal.companyId || '');
  document.getElementById('deal-contact').value = deal.contactId || '';
  document.getElementById('deal-value').value = deal.value || 0;
  document.getElementById('deal-stage').value = deal.stage || 'prospecting';
  document.getElementById('deal-notes').value = deal.notes || '';
  document.getElementById('deal-modal').classList.add('active');
}

function saveDeal() {
  var editId = document.getElementById('deal-edit-id').value;
  var record = {
    title: document.getElementById('deal-title').value.trim(),
    companyId: document.getElementById('deal-company').value,
    contactId: document.getElementById('deal-contact').value,
    value: parseInt(document.getElementById('deal-value').value, 10) || 0,
    stage: document.getElementById('deal-stage').value,
    notes: document.getElementById('deal-notes').value.trim()
  };
  if (!record.title) return;

  var promise = editId
    ? CandidStore.update('deals', editId, record)
    : CandidStore.create('deals', record);

  promise.then(function() {
    return CandidStore.load('deals');
  }).then(function(deals) {
    _deals = deals;
    closeModal('deal-modal');
    renderDeals();
    renderOverview();
  }).catch(function() {
    alert('Could not save deal. Please try again.');
  });
}

function deleteDeal(id) {
  if (!confirm('Delete this deal?')) return;
  CandidStore.remove('deals', id).then(function() {
    _deals = _deals.filter(function(d) { return d.id !== id; });
    renderDeals();
    renderOverview();
  }).catch(function() {
    alert('Could not delete deal. Please try again.');
  });
}

// ============================================================
// SELECT HELPERS
// ============================================================

function populateCompanySelect(selectId) {
  var companies = loadData('companies');
  var select = document.getElementById(selectId);
  select.innerHTML = '<option value="">-- Select Company --</option>' +
    companies.map(function(co) {
      return '<option value="' + co.id + '">' + escapeHtml(co.name) + '</option>';
    }).join('') +
    '<option value="__new__" style="color:var(--color-primary);font-weight:600;">＋ Create new company…</option>';
}

function onContactCompanySelectChange() {
  var val = document.getElementById('contact-company').value;
  var inlineForm = document.getElementById('inline-new-company');
  if (!inlineForm) return;
  if (val === '__new__') {
    inlineForm.style.display = '';
    var nameInput = document.getElementById('inline-company-name');
    if (nameInput) nameInput.focus();
  } else {
    inlineForm.style.display = 'none';
  }
}

function populateContactSelect(selectId, companyId) {
  var contacts = loadData('contacts');
  if (companyId) {
    contacts = contacts.filter(function(c) { return c.companyId === companyId; });
  }
  var select = document.getElementById(selectId);
  select.innerHTML = '<option value="">-- Select Contact --</option>' +
    contacts.map(function(c) {
      var displayName = ((c.firstName || '') + ' ' + (c.lastName || '')).trim() || c.name;
      return '<option value="' + c.id + '">' + escapeHtml(displayName) + '</option>';
    }).join('');
}

// When deal company changes, update contact dropdown
function onDealCompanyChange() {
  var companyId = document.getElementById('deal-company').value;
  populateContactSelect('deal-contact', companyId);
}

// ============================================================
// MODAL HELPERS
// ============================================================

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// ============================================================
// HTML ESCAPING - prevent XSS
// ============================================================

function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ============================================================
// ============================================================
// DETAIL DRAWER — record view + comments
// ============================================================

var _detailState = { type: null, id: null };

function openDetail(type, id) {
  var contacts = loadData('contacts');
  var companies = loadData('companies');
  var deals = loadData('deals');
  var record;

  _detailState = { type: type, id: id };

  if (type === 'contact') {
    record = contacts.find(function(c) { return c.id === id; });
    if (!record) return;
    var company = companies.find(function(co) { return co.id === record.companyId; });
    document.getElementById('detail-title').textContent = ((record.firstName || record.first_name || '') + ' ' + (record.lastName || record.last_name || '')).trim() || record.name;
    document.getElementById('detail-meta').innerHTML =
      '<span class="badge badge-type">Contact</span>' +
      (record.role ? '<span class="meta-text">' + escapeHtml(record.role) + '</span>' : '') +
      (company ? '<span class="meta-text">· ' + escapeHtml(company.name) + '</span>' : '');
    document.getElementById('detail-fields').innerHTML =
      field('Email', record.email ? '<a href="mailto:' + escapeHtml(record.email) + '">' + escapeHtml(record.email) + '</a>' : '—') +
      field('Phone', record.phone || '—') +
      field('Company', company ? escapeHtml(company.name) : '—') +
      field('Role', record.role || '—') +
      field('Added', formatDate(record.createdAt)) +
      (record.notes ? '<div class="crm-detail-field full-width">' + fieldLabel('Notes') + '<div class="crm-detail-field-value">' + escapeHtml(record.notes) + '</div></div>' : '');

  } else if (type === 'company') {
    record = companies.find(function(c) { return c.id === id; });
    if (!record) return;
    var contactCount = contacts.filter(function(c) { return c.companyId === id; }).length;
    var dealCount = deals.filter(function(d) { return d.companyId === id; }).length;
    document.getElementById('detail-title').textContent = record.name;
    document.getElementById('detail-meta').innerHTML =
      '<span class="badge badge-type">Company</span>' +
      '<span class="badge badge-status">' + escapeHtml(record.status || 'lead') + '</span>';
    document.getElementById('detail-fields').innerHTML =
      field('Market', record.market || '—') +
      field('Channel', record.channel || '—') +
      field('Status', record.status || '—') +
      field('Contacts', contactCount) +
      field('Deals', dealCount) +
      field('Added', formatDate(record.createdAt)) +
      (record.notes ? '<div class="crm-detail-field full-width">' + fieldLabel('Notes') + '<div class="crm-detail-field-value">' + escapeHtml(record.notes) + '</div></div>' : '');

  } else if (type === 'deal') {
    record = deals.find(function(d) { return d.id === id; });
    if (!record) return;
    var company = companies.find(function(co) { return co.id === record.companyId; });
    var contact = contacts.find(function(c) { return c.id === record.contactId; });
    document.getElementById('detail-title').textContent = record.title;
    document.getElementById('detail-meta').innerHTML =
      '<span class="badge badge-type">Deal</span>' +
      '<span class="meta-text">' + formatIDR(record.value || 0) + '</span>' +
      '<span class="meta-text">· ' + escapeHtml(record.stage || 'prospecting') + '</span>';
    document.getElementById('detail-fields').innerHTML =
      field('Company', company ? escapeHtml(company.name) : '—') +
      field('Contact', contact ? escapeHtml(contact.name) : '—') +
      field('Value', formatIDR(record.value || 0)) +
      field('Stage', record.stage || '—') +
      field('Created', formatDate(record.createdAt)) +
      (record.notes ? '<div class="crm-detail-field full-width">' + fieldLabel('Notes') + '<div class="crm-detail-field-value">' + escapeHtml(record.notes) + '</div></div>' : '');
  }

  document.getElementById('detail-drawer').classList.add('active');
  document.getElementById('detail-backdrop').classList.add('active');
  document.getElementById('detail-comment-input').value = '';
  loadDetailComments(type, id);
}

function field(label, valueHtml) {
  return '<div class="crm-detail-field">' + fieldLabel(label) + '<div class="crm-detail-field-value">' + valueHtml + '</div></div>';
}
function fieldLabel(label) {
  return '<div class="crm-detail-field-label">' + escapeHtml(label) + '</div>';
}

function closeDetail() {
  document.getElementById('detail-drawer').classList.remove('active');
  document.getElementById('detail-backdrop').classList.remove('active');
  _detailState = { type: null, id: null };
}

function openDetailEdit() {
  var type = _detailState.type;
  var id = _detailState.id;
  closeDetail();
  if (type === 'contact') openEditContact(id);
  else if (type === 'company') openEditCompany(id);
  else if (type === 'deal') openEditDeal(id);
}

function loadDetailComments(type, id) {
  var list = document.getElementById('detail-comments-list');
  list.innerHTML = '<p class="crm-comment-empty">Loading…</p>';
  if (typeof CandidStore === 'undefined' || !CandidStore.loadComments) {
    list.innerHTML = '<p class="crm-comment-empty">Comments require the API to be available.</p>';
    return;
  }
  CandidStore.loadComments(type, id).then(function(comments) {
    renderDetailComments(comments, type, id);
  }).catch(function() {
    list.innerHTML = '<p class="crm-comment-empty">Could not load comments.</p>';
  });
}

function renderDetailComments(comments, type, id) {
  var list = document.getElementById('detail-comments-list');
  if (!comments || comments.length === 0) {
    list.innerHTML = '<p class="crm-comment-empty">No comments yet — be the first.</p>';
    return;
  }
  var userAuth = null;
  try { userAuth = JSON.parse(localStorage.getItem('candidlabs_auth')); } catch(e) {}
  var isAdmin = userAuth && userAuth.role === 'admin';

  list.innerHTML = comments.map(function(c) {
    var initials = (c.authorName || c.authorEmail || '?').split(' ').map(function(w) { return w[0]; }).slice(0,2).join('').toUpperCase();
    var canDelete = isAdmin || (userAuth && userAuth.email === c.authorEmail);
    return '<div class="crm-comment-item">' +
      '<div class="crm-comment-avatar">' + escapeHtml(initials) + '</div>' +
      '<div class="crm-comment-body">' +
        '<div class="crm-comment-byline">' +
          '<span class="crm-comment-author">' + escapeHtml(c.authorName || c.authorEmail) + '</span>' +
          '<span class="crm-comment-time">' + formatCommentTime(c.createdAt) + '</span>' +
        '</div>' +
        '<div class="crm-comment-text">' + escapeHtml(c.body) + '</div>' +
      '</div>' +
      (canDelete ? '<button class="crm-comment-delete" onclick="deleteDetailComment(\'' + c.id + '\',\'' + type + '\',\'' + id + '\')" title="Delete">&#10005;</button>' : '') +
    '</div>';
  }).join('');
  list.scrollTop = list.scrollHeight;
}

function formatCommentTime(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var now = new Date();
  var diffMs = now - d;
  var diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return diffMin + 'm ago';
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + 'h ago';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function submitDetailComment() {
  var input = document.getElementById('detail-comment-input');
  var text = input.value.trim();
  if (!text || !_detailState.type || !_detailState.id) return;
  var btn = document.getElementById('detail-comment-submit');
  btn.disabled = true;
  CandidStore.postComment(_detailState.type, _detailState.id, text)
    .then(function() {
      input.value = '';
      loadDetailComments(_detailState.type, _detailState.id);
    })
    .catch(function() { alert('Could not post comment. Please try again.'); })
    .finally(function() { btn.disabled = false; });
}

function deleteDetailComment(commentId, type, recordId) {
  if (!confirm('Delete this comment?')) return;
  CandidStore.removeComment(commentId).then(function() {
    loadDetailComments(type, recordId);
  });
}

// ============================================================
// AUTH VISIBILITY - re-apply after dynamic renders
// ============================================================

function applyAuthVisibility() {
  if (typeof CandidAuth !== 'undefined') {
    CandidAuth.applyRoleVisibility();
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  if (typeof CandidAuth !== 'undefined') {
    CandidAuth.requireAuth();
  }

  // Load all data from API/D1, then render
  initData().then(function() {
    switchTool('overview');
  });

  // Set up search handlers
  var contactsSearch = document.getElementById('contacts-search');
  if (contactsSearch) {
    contactsSearch.addEventListener('input', function() {
      renderContacts(this.value);
    });
  }

  var companiesSearch = document.getElementById('companies-search');
  if (companiesSearch) {
    companiesSearch.addEventListener('input', function() {
      renderCompanies(this.value);
    });
  }

  var dealsSearch = document.getElementById('deals-search');
  if (dealsSearch) {
    dealsSearch.addEventListener('input', function() {
      renderDeals(this.value);
    });
  }

  // Close modals when clicking overlay
  document.querySelectorAll('.crm-modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Deal company change listener
  var dealCompanySelect = document.getElementById('deal-company');
  if (dealCompanySelect) {
    dealCompanySelect.addEventListener('change', onDealCompanyChange);
  }

  // Import modal: upload area click + drag
  var crmUploadArea = document.getElementById('crm-upload-area');
  if (crmUploadArea) {
    crmUploadArea.addEventListener('click', function() {
      document.getElementById('crm-import-file').click();
    });
    crmUploadArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      crmUploadArea.classList.add('dragover');
    });
    crmUploadArea.addEventListener('dragleave', function() {
      crmUploadArea.classList.remove('dragover');
    });
    crmUploadArea.addEventListener('drop', function(e) {
      e.preventDefault();
      crmUploadArea.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        document.getElementById('crm-import-file').files = e.dataTransfer.files;
        crmHandleFile(document.getElementById('crm-import-file'));
      }
    });
  }

  // Close import/dedupe modals on overlay click
  var crmImportModal = document.getElementById('crm-import-modal');
  if (crmImportModal) {
    crmImportModal.addEventListener('click', function(e) {
      if (e.target === crmImportModal) crmCloseImport();
    });
  }
  var crmDedupeModal = document.getElementById('crm-dedupe-modal');
  if (crmDedupeModal) {
    crmDedupeModal.addEventListener('click', function(e) {
      if (e.target === crmDedupeModal) crmCloseDedupe();
    });
  }
});

// ============================================================
// IMPORT / EXPORT / DEDUPE
// ============================================================

var _crmImportCollection = null;
var _crmImportRows = [];

function crmExport(collection) {
  var records, lookupData = { companies: loadData('companies') };
  if (collection === 'contacts') {
    records = loadData('contacts');
  } else {
    records = loadData('companies');
  }
  if (!records.length) { alert('No records to export.'); return; }
  CandidIO.exportCSV(collection, records, lookupData);
}

function crmOpenImport(collection) {
  _crmImportCollection = collection;
  window._crmImportCollection = collection;
  _crmImportRows = [];
  document.getElementById('crm-import-title').textContent = 'Import ' + collection.charAt(0).toUpperCase() + collection.slice(1);
  document.querySelectorAll('#crm-import-modal .io-step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('crm-import-step-upload').classList.add('active');
  document.getElementById('crm-import-confirm-btn').style.display = 'none';
  document.getElementById('crm-import-file').value = '';
  // Show/hide auto-create companies option (only for contacts)
  var createCo = document.getElementById('crm-import-create-companies');
  if (createCo) createCo.closest('label').style.display = collection === 'contacts' ? '' : 'none';
  document.getElementById('crm-import-modal').classList.add('active');
}

function crmCloseImport() {
  document.getElementById('crm-import-modal').classList.remove('active');
  _crmImportCollection = null;
  _crmImportRows = [];
}

function crmHandleFile(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var rows = CandidIO.parseCSV(e.target.result);
    if (!rows.length) { alert('No data found in CSV.'); return; }

    rows = CandidIO.validateRows(rows, _crmImportCollection);
    var lookupData = { companies: loadData('companies'), projects: [] };
    rows = CandidIO.resolveFK(rows, _crmImportCollection, lookupData);
    var existing = _crmImportCollection === 'contacts' ? loadData('contacts') : loadData('companies');
    rows = CandidIO.findDuplicates(rows, existing, _crmImportCollection);

    _crmImportRows = rows;
    _crmRenderPreview(rows);

    document.querySelectorAll('#crm-import-modal .io-step').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById('crm-import-step-preview').classList.add('active');
    document.getElementById('crm-import-confirm-btn').style.display = '';
  };
  reader.readAsText(file);
}

function _crmRenderPreview(rows) {
  var tmpl = CandidIO.TEMPLATES[_crmImportCollection];
  var headers = tmpl.headers;
  var newCount = 0, dupeCount = 0, errorCount = 0;

  rows.forEach(function(r) {
    if (r._errors) errorCount++;
    else if (r._dupeOf) dupeCount++;
    else newCount++;
  });

  document.getElementById('crm-import-stats').innerHTML =
    '<div class="io-stat"><span class="io-stat-dot total"></span> ' + rows.length + ' rows</div>' +
    '<div class="io-stat"><span class="io-stat-dot new"></span> ' + newCount + ' new</div>' +
    '<div class="io-stat"><span class="io-stat-dot dupe"></span> ' + dupeCount + ' duplicates</div>' +
    '<div class="io-stat"><span class="io-stat-dot error"></span> ' + errorCount + ' errors</div>';

  var html = '<table class="io-preview-table"><thead><tr><th>#</th><th>Status</th>';
  headers.forEach(function(h) { html += '<th>' + escapeHtml(h) + '</th>'; });
  html += '</tr></thead><tbody>';

  rows.forEach(function(r, idx) {
    var cls = r._errors ? 'io-row-error' : (r._dupeOf ? 'io-row-dupe' : 'io-row-new');
    var badge = r._errors ? '<span class="io-row-badge error">Error</span>'
              : (r._dupeOf ? '<span class="io-row-badge dupe">' + (r._dupeType === 'exact' ? 'Exact' : 'Fuzzy') + ' Dupe</span>'
              : '<span class="io-row-badge new">New</span>');
    html += '<tr class="' + cls + '"><td>' + (r._row || idx + 2) + '</td><td>' + badge + '</td>';
    headers.forEach(function(h) { html += '<td>' + escapeHtml(r[h] || '') + '</td>'; });
    html += '</tr>';
  });

  html += '</tbody></table>';
  document.getElementById('crm-import-preview').innerHTML = html;
}

function crmConfirmImport() {
  var skipDupes = document.getElementById('crm-import-skip-dupes').checked;
  var createCompanies = document.getElementById('crm-import-create-companies').checked;

  var toImport = _crmImportRows.filter(function(r) {
    if (r._errors) return false;
    if (skipDupes && r._dupeOf) return false;
    return true;
  });

  if (!toImport.length) { alert('No rows to import.'); return; }

  document.querySelectorAll('#crm-import-modal .io-step').forEach(function(s) { s.classList.remove('active'); });
  document.getElementById('crm-import-step-progress').classList.add('active');
  document.getElementById('crm-import-confirm-btn').style.display = 'none';
  document.getElementById('crm-import-progress-fill').style.width = '20%';

  // Auto-create missing companies if option checked
  var companiesPromise = Promise.resolve();
  if (_crmImportCollection === 'contacts' && createCompanies) {
    var missingCompanies = {};
    toImport.forEach(function(r) {
      if (r.company_name && r._companyResolved === false) {
        missingCompanies[r.company_name.toLowerCase().trim()] = r.company_name.trim();
      }
    });
    var companyNames = Object.keys(missingCompanies);
    if (companyNames.length > 0) {
      var newCompanies = companyNames.map(function(key) {
        return { name: missingCompanies[key], status: 'lead' };
      });
      companiesPromise = CandidStore.bulkCreate('companies', newCompanies).then(function() {
        return CandidStore.load('companies');
      }).then(function(companies) {
        _companies = companies;
        // Re-resolve FKs
        var lookupData = { companies: _companies, projects: [] };
        toImport = CandidIO.resolveFK(toImport, _crmImportCollection, lookupData);
      });
    }
  }

  document.getElementById('crm-import-progress-fill').style.width = '40%';

  companiesPromise.then(function() {
    var tmpl = CandidIO.TEMPLATES[_crmImportCollection];
    var cleanRecords = toImport.map(function(r) {
      var rec = {};
      tmpl.headers.forEach(function(h) {
        if (r[h]) rec[h] = r[h];
      });
      if (r.company_id) rec.company_id = r.company_id;
      return rec;
    });

    document.getElementById('crm-import-progress-fill').style.width = '60%';

    return CandidStore.bulkCreate(_crmImportCollection, cleanRecords);
  }).then(function(result) {
    document.getElementById('crm-import-progress-fill').style.width = '100%';

    setTimeout(function() {
      document.querySelectorAll('#crm-import-modal .io-step').forEach(function(s) { s.classList.remove('active'); });
      document.getElementById('crm-import-step-results').classList.add('active');

      var errHtml = '';
      if (result.errors && result.errors.length) {
        errHtml = '<div class="io-error-list">' +
          result.errors.map(function(e) { return '<div class="io-error-item">Row ' + e.row + ': ' + escapeHtml(e.error) + '</div>'; }).join('') +
          '</div>';
      }

      document.getElementById('crm-import-results').innerHTML =
        '<div class="io-results-icon">&#9989;</div>' +
        '<h4>Import Complete</h4>' +
        '<div class="io-results-stats">' +
          '<div class="io-results-stat"><span class="num">' + (result.imported || 0) + '</span><span class="label">Imported</span></div>' +
          '<div class="io-results-stat"><span class="num">' + (_crmImportRows.filter(function(r) { return r._dupeOf; }).length) + '</span><span class="label">Skipped (dupes)</span></div>' +
          '<div class="io-results-stat"><span class="num">' + (result.errors ? result.errors.length : 0) + '</span><span class="label">Errors</span></div>' +
        '</div>' + errHtml;

      // Refresh
      initData().then(function() {
        renderContacts();
        renderCompanies();
        renderOverview();
      });
    }, 400);
  }).catch(function(err) {
    alert('Import failed: ' + (err.message || err));
    crmCloseImport();
  });
}

// ---- Standalone Dedupe ----

function crmFindDupes(collection) {
  document.getElementById('crm-dedupe-title').textContent = 'Find Duplicates — ' + collection.charAt(0).toUpperCase() + collection.slice(1);
  document.getElementById('crm-dedupe-modal').classList.add('active');
  document.getElementById('crm-dedupe-body').innerHTML = '<p style="text-align:center;">Scanning...</p>';

  var records = collection === 'contacts' ? loadData('contacts') : loadData('companies');
  var groups = CandidIO.findDuplicatesInSet(records, collection);

  if (!groups.length) {
    document.getElementById('crm-dedupe-body').innerHTML =
      '<div class="io-dedupe-empty"><div class="io-dedupe-empty-icon">&#10004;</div><p>No duplicates found!</p></div>';
    return;
  }

  var html = '<p style="margin-bottom:12px;">' + groups.length + ' duplicate group(s) found.</p>';
  groups.forEach(function(g, gi) {
    var nameField = collection === 'contacts' ? 'name' : 'name';
    var displayName = collection === 'contacts'
      ? ((g.canonical.firstName || '') + ' ' + (g.canonical.lastName || '')).trim() || g.canonical.name
      : g.canonical.name;
    html += '<div class="io-dedupe-group">';
    html += '<div class="io-dedupe-group-header"><span>' + escapeHtml(displayName || 'Unnamed') + '</span><span class="badge">' + (g.duplicates.length + 1) + ' records</span></div>';
    html += '<div class="io-dedupe-item canonical"><span><span class="tag keep">KEEP</span> ' + escapeHtml(displayName) + ' <small style="color:var(--text-muted);">(' + (g.canonical.email || g.canonical.id || '') + ')</small></span></div>';
    g.duplicates.forEach(function(d) {
      var dName = collection === 'contacts'
        ? ((d.firstName || '') + ' ' + (d.lastName || '')).trim() || d.name
        : d.name;
      html += '<div class="io-dedupe-item"><span><span class="tag dup">DUP</span> ' + escapeHtml(dName) + ' <small style="color:var(--text-muted);">(' + (d.email || d.id || '') + ')</small></span></div>';
    });
    html += '<div class="io-dedupe-actions"><button class="btn-io primary" onclick="crmMergeDupes(\'' + collection + '\',' + gi + ')">Merge (keep first, delete others)</button><button class="btn-io" onclick="this.closest(\'.io-dedupe-group\').remove()">Dismiss</button></div>';
    html += '</div>';
  });

  document.getElementById('crm-dedupe-body').innerHTML = html;
  window._crmDedupeGroups = groups;
}

function crmMergeDupes(collection, groupIndex) {
  var groups = window._crmDedupeGroups;
  if (!groups || !groups[groupIndex]) return;
  var g = groups[groupIndex];

  // For contacts: update linked deals to point to canonical
  var updatePromises = [];
  if (collection === 'contacts') {
    g.duplicates.forEach(function(dupe) {
      var linkedDeals = _deals.filter(function(d) { return d.contactId === dupe.id; });
      linkedDeals.forEach(function(deal) {
        updatePromises.push(CandidStore.update('deals', deal.id, { contactId: g.canonical.id }));
      });
    });
  }

  var deletePromises = g.duplicates.map(function(d) {
    return CandidStore.remove(collection, d.id);
  });

  Promise.all(updatePromises).then(function() {
    return Promise.all(deletePromises);
  }).then(function() {
    return initData();
  }).then(function() {
    renderContacts();
    renderCompanies();
    renderOverview();
    crmFindDupes(collection);
  });
}

function crmCloseDedupe() {
  document.getElementById('crm-dedupe-modal').classList.remove('active');
  window._crmDedupeGroups = null;
}
