// CRM Module - Data & Logic Engine
// Storage: localStorage with JSON. Structure mirrors CRM_CONTACTS sheet in Sales DB.
// Pattern: matches budget.js switchTool() sidebar navigation.

// ============================================================
// DATA LAYER - localStorage backed
// ============================================================

var CRM_STORAGE_KEYS = {
  contacts: 'crm_contacts',
  companies: 'crm_companies',
  deals: 'crm_deals'
};
var KAA_FORM_URL = 'https://docs.google.com/forms/d/18dshhMSz7csbJBbeLg_fba6SAJMG5uyd3DnkW59rVSw/viewform';

// Seed data that mirrors real Candid Labs account structures
function getDefaultData() {
  return {
    contacts: [
      { id: 'CON-001', name: 'Sarah Chen', email: 'sarah@skdistribution.com', phone: '+62 812 3456 7890', role: 'Account Manager', companyId: 'CMP-001', notes: 'Primary contact for all Jakarta orders', createdAt: '2025-09-15' },
      { id: 'CON-002', name: 'Budi Santoso', email: 'budi@ptmandiri.co.id', phone: '+62 813 9876 5432', role: 'Procurement Lead', companyId: 'CMP-002', notes: 'Handles Bali distribution contracts', createdAt: '2025-11-02' },
      { id: 'CON-003', name: 'Lisa Wong', email: 'lisa@grandhotels.com', phone: '+62 821 5555 1234', role: 'F&B Director', companyId: 'CMP-003', notes: 'Decision maker for hotel group', createdAt: '2026-01-10' }
    ],
    companies: [
      { id: 'CMP-001', name: 'SK Distribution', market: 'Jakarta', channel: 'Distributor', status: 'active', contactCount: 1, notes: 'Primary Jakarta distributor', createdAt: '2025-09-01' },
      { id: 'CMP-002', name: 'PT Mandiri Beverages', market: 'Bali', channel: 'Distributor', status: 'active', contactCount: 1, notes: 'Bali & NTB coverage', createdAt: '2025-10-15' },
      { id: 'CMP-003', name: 'Grand Hotel Group', market: 'Jakarta', channel: 'Horeca', status: 'lead', contactCount: 1, notes: '12 properties across Java', createdAt: '2026-01-08' }
    ],
    deals: [
      { id: 'DL-001', title: 'SK Distribution Q1 2026 Order', companyId: 'CMP-001', contactId: 'CON-001', value: 450000000, stage: 'negotiation', notes: 'Quarterly bulk order for Jakarta region', createdAt: '2026-01-20' },
      { id: 'DL-002', title: 'Grand Hotel Trial Program', companyId: 'CMP-003', contactId: 'CON-003', value: 85000000, stage: 'proposal', notes: 'Trial across 3 flagship properties', createdAt: '2026-02-01' },
      { id: 'DL-003', title: 'Mandiri Bali Expansion', companyId: 'CMP-002', contactId: 'CON-002', value: 275000000, stage: 'prospecting', notes: 'Expand coverage to Lombok & Flores', createdAt: '2026-02-10' }
    ]
  };
}

// Data access via CandidStore adapter (localStorage fallback built in)
function loadData(key) {
  var raw = localStorage.getItem(CRM_STORAGE_KEYS[key]);
  if (raw) {
    try { return JSON.parse(raw); }
    catch (e) { return []; }
  }
  var defaults = getDefaultData();
  localStorage.setItem(CRM_STORAGE_KEYS[key], JSON.stringify(defaults[key]));
  return defaults[key];
}

function saveData(key, data) {
  localStorage.setItem(CRM_STORAGE_KEYS[key], JSON.stringify(data));
  // Mirror to CandidStore if available (async, fire-and-forget)
  if (typeof CandidStore !== 'undefined') {
    CandidStore.save(key, data);
  }
}

function generateId(prefix) {
  const num = Date.now().toString(36).slice(-4).toUpperCase();
  return prefix + '-' + num;
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
  var companies = loadData('companies');
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

function renderContacts(filter) {
  var contacts = loadData('contacts');
  var companies = loadData('companies');
  var query = (filter || '').toLowerCase();

  if (query) {
    contacts = contacts.filter(function(c) {
      return c.name.toLowerCase().indexOf(query) !== -1 ||
             c.email.toLowerCase().indexOf(query) !== -1 ||
             (c.role || '').toLowerCase().indexOf(query) !== -1;
    });
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
      '<td class="row-name"><button class="row-name-link" onclick="openDetail(\'contact\',\'' + c.id + '\')">' + escapeHtml(c.name) + '</button></td>' +
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
  document.getElementById('contact-name').value = contact.name;
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
  var contacts = loadData('contacts');
  var companySelectVal = document.getElementById('contact-company').value;

  // Handle inline new company creation
  if (companySelectVal === '__new__') {
    var newCompanyName = (document.getElementById('inline-company-name') || {}).value || '';
    newCompanyName = newCompanyName.trim();
    if (!newCompanyName) {
      document.getElementById('inline-company-name').focus();
      document.getElementById('inline-company-name').style.borderColor = 'var(--color-error)';
      return;
    }
    // Create the company first
    var newCompany = {
      id: generateId('CMP'),
      name: newCompanyName,
      market: (document.getElementById('inline-company-market') || {}).value || '',
      channel: (document.getElementById('inline-company-channel') || {}).value || '',
      status: 'lead',
      notes: '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    var companies = loadData('companies');
    companies.push(newCompany);
    saveData('companies', companies);
    companySelectVal = newCompany.id;
    // Reset inline form
    document.getElementById('inline-new-company').style.display = 'none';
  }

  var record = {
    id: editId || generateId('CON'),
    name: document.getElementById('contact-name').value.trim(),
    email: document.getElementById('contact-email').value.trim(),
    phone: document.getElementById('contact-phone').value.trim(),
    role: document.getElementById('contact-role').value.trim(),
    companyId: companySelectVal || '',
    notes: document.getElementById('contact-notes').value.trim(),
    createdAt: editId ? (contacts.find(function(c) { return c.id === editId; }) || {}).createdAt : new Date().toISOString().split('T')[0]
  };

  if (!record.name) return;

  if (editId) {
    contacts = contacts.map(function(c) { return c.id === editId ? record : c; });
  } else {
    contacts.push(record);
  }

  saveData('contacts', contacts);
  closeModal('contact-modal');
  renderContacts();
  renderCompanies();
  renderOverview();
}

function deleteContact(id) {
  if (!confirm('Delete this contact?')) return;
  var linkedDeals = loadData('deals').filter(function(d) { return d.contactId === id; }).length;
  if (linkedDeals > 0) {
    alert('Cannot delete: this contact is linked to ' + linkedDeals + ' deals.');
    return;
  }
  var contacts = loadData('contacts').filter(function(c) { return c.id !== id; });
  saveData('contacts', contacts);
  renderContacts();
  renderOverview();
}

// ============================================================
// COMPANIES PANEL
// ============================================================

function renderCompanies(filter) {
  var companies = loadData('companies');
  var contacts = loadData('contacts');
  var query = (filter || '').toLowerCase();

  if (query) {
    companies = companies.filter(function(c) {
      return c.name.toLowerCase().indexOf(query) !== -1 ||
             (c.market || '').toLowerCase().indexOf(query) !== -1 ||
             (c.channel || '').toLowerCase().indexOf(query) !== -1;
    });
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
  var companies = loadData('companies');

  var record = {
    id: editId || generateId('CMP'),
    name: document.getElementById('company-name').value.trim(),
    market: document.getElementById('company-market').value.trim(),
    channel: document.getElementById('company-channel').value,
    status: document.getElementById('company-status').value,
    notes: document.getElementById('company-notes').value.trim(),
    createdAt: editId ? (companies.find(function(c) { return c.id === editId; }) || {}).createdAt : new Date().toISOString().split('T')[0]
  };

  if (!record.name) return;

  if (editId) {
    companies = companies.map(function(c) { return c.id === editId ? record : c; });
  } else {
    companies.push(record);
  }

  saveData('companies', companies);
  closeModal('company-modal');
  renderCompanies();
  renderOverview();
}

function deleteCompany(id) {
  if (!confirm('Delete this company? Contacts linked to it will keep their association.')) return;
  var linkedContacts = loadData('contacts').filter(function(c) { return c.companyId === id; }).length;
  var linkedDeals = loadData('deals').filter(function(d) { return d.companyId === id; }).length;
  if (linkedContacts > 0 || linkedDeals > 0) {
    alert('Cannot delete: this company is linked to ' + linkedContacts + ' contacts and ' + linkedDeals + ' deals.');
    return;
  }
  var companies = loadData('companies').filter(function(c) { return c.id !== id; });
  saveData('companies', companies);
  renderCompanies();
  renderOverview();
}

// ============================================================
// DEALS PANEL
// ============================================================

var currentDealFilter = 'all';

function renderDeals(filter) {
  var deals = loadData('deals');
  var companies = loadData('companies');
  var contacts = loadData('contacts');
  var query = (filter || '').toLowerCase();

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
  var deals = loadData('deals');

  var record = {
    id: editId || generateId('DL'),
    title: document.getElementById('deal-title').value.trim(),
    companyId: document.getElementById('deal-company').value,
    contactId: document.getElementById('deal-contact').value,
    value: parseInt(document.getElementById('deal-value').value, 10) || 0,
    stage: document.getElementById('deal-stage').value,
    notes: document.getElementById('deal-notes').value.trim(),
    createdAt: editId ? (deals.find(function(d) { return d.id === editId; }) || {}).createdAt : new Date().toISOString().split('T')[0]
  };

  if (!record.title) return;

  if (editId) {
    deals = deals.map(function(d) { return d.id === editId ? record : d; });
  } else {
    deals.push(record);
  }

  saveData('deals', deals);
  closeModal('deal-modal');
  renderDeals();
  renderOverview();
}

function deleteDeal(id) {
  if (!confirm('Delete this deal?')) return;
  var deals = loadData('deals').filter(function(d) { return d.id !== id; });
  saveData('deals', deals);
  renderDeals();
  renderOverview();
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
      return '<option value="' + c.id + '">' + escapeHtml(c.name) + '</option>';
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
    document.getElementById('detail-title').textContent = record.name;
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

  // Initialize overview stats
  renderOverview();

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

  // Start on overview panel
  switchTool('overview');
});
