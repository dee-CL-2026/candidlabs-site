// R&D Workspace Module - Data & Logic Engine
// Storage: CandidStore (D1 via API) with localStorage fallback.
// Pattern: matches projects.js switchTool() sidebar navigation and crm.js CRUD conventions.

// ============================================================
// DATA LAYER
// ============================================================

var _rndProjects = null;
var _rndDocs = null;
var _rndTrials = null;
var _skus = null;
var _rndDataReady = false;
var _rndCurrentDetailId = null;

// Stage config
var RND_STAGES = [
  { key: 'idea',        label: 'Idea / Intake',  color: '#64748b' },
  { key: 'feasibility', label: 'Feasibility',     color: '#f59e0b' },
  { key: 'trials',      label: 'R&D Trials',      color: '#1b708b' },
  { key: 'pre-launch',  label: 'Pre-Launch',      color: '#8b5cf6' },
  { key: 'archived',    label: 'Archived',        color: '#10b981' }
];

// Document type schemas — defines form fields for each doc type
var DOC_SCHEMAS = {
  concept_brief: {
    label: 'Concept Brief',
    fields: [
      { key: 'product_name',       label: 'Product Name',              type: 'text' },
      { key: 'product_category',   label: 'Product Category',          type: 'text' },
      { key: 'target_market',      label: 'Target Market',             type: 'text' },
      { key: 'problem_opportunity', label: 'Problem / Opportunity',    type: 'textarea' },
      { key: 'proposed_solution',  label: 'Proposed Solution',         type: 'textarea' },
      { key: 'target_consumer',    label: 'Target Consumer Profile',   type: 'textarea' },
      { key: 'flavour_direction',  label: 'Flavour Direction',         type: 'textarea' },
      { key: 'competitor_ref',     label: 'Competitor Reference',      type: 'textarea' },
      { key: 'est_volume',         label: 'Estimated Volume / Year',   type: 'text' },
      { key: 'target_price',       label: 'Target Price Point',        type: 'text' },
      { key: 'submitted_by',       label: 'Submitted By',              type: 'text' },
      { key: 'submit_date',        label: 'Date',                      type: 'date' }
    ]
  },
  feasibility: {
    label: 'Feasibility Document',
    fields: [
      { key: 'ingredient_availability', label: 'Ingredient Availability',           type: 'textarea' },
      { key: 'regulatory',              label: 'Regulatory Considerations',         type: 'textarea' },
      { key: 'production_capability',   label: 'Production Capability Assessment',  type: 'textarea' },
      { key: 'est_cogs',                label: 'Estimated COGS',                    type: 'number' },
      { key: 'target_margin',           label: 'Target Margin %',                   type: 'number' },
      { key: 'supply_chain',            label: 'Supply Chain Notes',                type: 'textarea' },
      { key: 'recommendation',          label: 'Recommendation',                    type: 'select', options: ['proceed', 'modify', 'reject'] },
      { key: 'reviewer',                label: 'Reviewer',                          type: 'text' },
      { key: 'review_date',             label: 'Review Date',                       type: 'date' }
    ]
  },
  trial_log: {
    label: 'R&D Trial Log',
    fields: [
      { key: 'target_flavour',    label: 'Target Flavour Profile',          type: 'textarea' },
      { key: 'base_recipe',       label: 'Base Recipe / Starting Formula',  type: 'textarea' },
      { key: 'final_recipe',      label: 'Final Approved Recipe',           type: 'textarea' },
      { key: 'signoff_name',      label: 'Sign-off Name',                   type: 'text' },
      { key: 'signoff_date',      label: 'Sign-off Date',                   type: 'date' }
    ]
  },
  pdp: {
    label: 'Product Development Plan',
    fields: [
      { key: 'final_recipe',       label: 'Final Recipe / Formulation',  type: 'textarea' },
      { key: 'packaging_specs',    label: 'Packaging Specs',             type: 'textarea' },
      { key: 'production_process', label: 'Production Process Notes',    type: 'textarea' },
      { key: 'quality_checks',     label: 'Quality Checks / Shelf Life', type: 'textarea' },
      { key: 'labelling',          label: 'Labelling / Compliance',      type: 'textarea' },
      { key: 'costing_breakdown',  label: 'Costing Breakdown',           type: 'textarea' },
      { key: 'target_prod_date',   label: 'Target Production Date',      type: 'date' }
    ]
  },
  gtm: {
    label: 'Go-To-Market Plan',
    fields: [
      { key: 'launch_markets',       label: 'Launch Market(s)',        type: 'text' },
      { key: 'positioning',          label: 'Positioning Statement',   type: 'textarea' },
      { key: 'target_channels',      label: 'Target Channels',        type: 'textarea' },
      { key: 'pricing_strategy',     label: 'Pricing Strategy',       type: 'textarea' },
      { key: 'launch_timeline',      label: 'Launch Timeline',        type: 'textarea' },
      { key: 'marketing_activities', label: 'Marketing Activities',   type: 'textarea' },
      { key: 'sales_targets',        label: 'Sales Targets',          type: 'textarea' },
      { key: 'distribution_plan',    label: 'Distribution Plan',      type: 'textarea' }
    ]
  }
};

var DOC_TYPE_LABELS = {
  concept_brief: 'Concept Brief',
  feasibility:   'Feasibility',
  trial_log:     'Trial Log',
  pdp:           'PDP',
  gtm:           'GTM Plan'
};

// ============================================================
// LOAD DATA
// ============================================================

function rndLoadAll() {
  return Promise.all([
    CandidStore.load('rnd_projects'),
    CandidStore.load('rnd_documents'),
    CandidStore.load('rnd_trial_entries'),
    CandidStore.load('skus')
  ]).then(function (results) {
    _rndProjects = results[0] || [];
    _rndDocs = results[1] || [];
    _rndTrials = results[2] || [];
    _skus = results[3] || [];
    _rndDataReady = true;
  });
}

// Sync accessors
function rndGetProjects() { return _rndProjects || []; }
function rndGetDocs() { return _rndDocs || []; }
function rndGetTrials() { return _rndTrials || []; }
function rndGetSkus() { return _skus || []; }

// ============================================================
// SIDEBAR NAVIGATION
// ============================================================

function rndSwitchTool(toolId) {
  var panels = document.querySelectorAll('.tool-panel');
  var btns = document.querySelectorAll('.tool-btn');
  panels.forEach(function (p) { p.classList.remove('active'); });
  btns.forEach(function (b) { b.classList.remove('active'); });

  var target = document.getElementById('tool-' + toolId);
  if (target) target.classList.add('active');

  var btn = document.querySelector('.tool-btn[data-tool="' + toolId + '"]');
  if (btn) btn.classList.add('active');

  // Render panel content
  if (toolId === 'overview') rndRenderOverview();
  if (toolId === 'pipeline') rndRenderPipeline();
  if (toolId === 'documents') rndRenderDocuments();
  if (toolId === 'skus') rndRenderSkus();
}

// ============================================================
// PIPELINE VIEW TOGGLE
// ============================================================

var _rndPipelineView = 'kanban';

function rndSetPipelineView(view) {
  _rndPipelineView = view;
  document.getElementById('pipeline-view-kanban').classList.toggle('active', view === 'kanban');
  document.getElementById('pipeline-view-list').classList.toggle('active', view === 'list');
  document.getElementById('rnd-pipeline-kanban-view').style.display = view === 'kanban' ? '' : 'none';
  document.getElementById('rnd-pipeline-list-view').style.display = view === 'list' ? '' : 'none';
  rndRenderPipeline();
}

// ============================================================
// OVERVIEW PANEL
// ============================================================

function rndRenderOverview() {
  var projects = rndGetProjects();
  var docs = rndGetDocs();
  var skuList = rndGetSkus();

  var byStage = { idea: 0, feasibility: 0, trials: 0, 'pre-launch': 0, archived: 0 };
  projects.forEach(function (p) {
    var s = p.stage || 'idea';
    if (byStage[s] !== undefined) byStage[s]++;
  });

  document.getElementById('stat-rnd-idea').textContent = byStage.idea;
  document.getElementById('stat-rnd-feasibility').textContent = byStage.feasibility;
  document.getElementById('stat-rnd-trials').textContent = byStage.trials;
  document.getElementById('stat-rnd-prelaunch').textContent = byStage['pre-launch'];
  document.getElementById('stat-rnd-docs').textContent = docs.length;
  document.getElementById('stat-rnd-skus').textContent = skuList.filter(function (s) { return s.status === 'active'; }).length;

  // Recent activity: last 10 items across projects and docs
  var items = [];
  projects.forEach(function (p) {
    items.push({ name: p.name, type: 'project', stage: p.stage, date: p.updatedAt || p.createdAt });
  });
  docs.forEach(function (d) {
    items.push({ name: d.title, type: 'document', docType: d.docType, date: d.updatedAt || d.createdAt });
  });
  items.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
  items = items.slice(0, 10);

  var container = document.getElementById('rnd-recent-activity');
  if (items.length === 0) {
    container.innerHTML = '<div class="rnd-empty"><div class="rnd-empty-icon">&#128300;</div><p>No R&D activity yet. Start by creating a project in the Pipeline tab.</p></div>';
    return;
  }

  var html = '<h3 style="font-size:1rem;margin-bottom:12px;color:var(--text-primary);">Recent Activity</h3>';
  items.forEach(function (item) {
    var badge = item.type === 'project'
      ? '<span class="rnd-stage ' + (item.stage || 'idea') + '">' + (item.stage || 'idea') + '</span>'
      : '<span class="rnd-doc-type ' + (item.docType || '') + '">' + (DOC_TYPE_LABELS[item.docType] || item.docType) + '</span>';
    var dateStr = item.date ? new Date(item.date).toLocaleDateString() : '';
    html += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-color);font-size:0.85rem;">'
      + '<span style="flex:1;color:var(--text-primary);">' + escHtml(item.name) + '</span>'
      + badge
      + '<span style="font-size:0.75rem;color:var(--text-muted);">' + dateStr + '</span>'
      + '</div>';
  });
  container.innerHTML = html;
}

// ============================================================
// PIPELINE — KANBAN
// ============================================================

function rndGetFilteredProjects() {
  var search = (document.getElementById('rnd-pipeline-search').value || '').toLowerCase();
  return rndGetProjects().filter(function (p) {
    if (search && p.name.toLowerCase().indexOf(search) === -1 && (p.owner || '').toLowerCase().indexOf(search) === -1) return false;
    return true;
  });
}

function rndRenderPipeline() {
  if (_rndPipelineView === 'kanban') rndRenderPipelineKanban();
  else rndRenderPipelineList();
}

function rndRenderPipelineKanban() {
  var projects = rndGetFilteredProjects();
  var docs = rndGetDocs();

  var board = document.getElementById('rnd-kanban-board');
  var html = '';

  RND_STAGES.forEach(function (stage) {
    var stageProjects = projects.filter(function (p) { return (p.stage || 'idea') === stage.key; });

    html += '<div class="rnd-kanban-column">'
      + '<div class="rnd-kanban-col-header">'
      + '<div class="rnd-kanban-col-dot" style="background:' + stage.color + '"></div>'
      + '<div class="rnd-kanban-col-label">' + stage.label + '</div>'
      + '<div class="rnd-kanban-col-count">' + stageProjects.length + '</div>'
      + '</div>'
      + '<div class="rnd-kanban-col-cards">';

    if (stageProjects.length === 0) {
      html += '<div class="rnd-kanban-empty">No projects</div>';
    } else {
      stageProjects.forEach(function (p) {
        var docCount = docs.filter(function (d) { return d.rndProjectId === p.id; }).length;
        var priColor = p.priority === 'high' ? '#ef4444' : p.priority === 'medium' ? '#f59e0b' : '#94a3b8';

        html += '<div class="rnd-kanban-card" onclick="rndOpenDetail(\'' + p.id + '\')">'
          + '<div class="rnd-kanban-card-priority" style="background:' + priColor + '"></div>'
          + '<div class="rnd-kanban-card-body">'
          + '<div class="rnd-kanban-card-title">' + escHtml(p.name) + '</div>'
          + (p.owner ? '<div class="rnd-kanban-card-owner">' + escHtml(p.owner) + '</div>' : '')
          + '<div class="rnd-kanban-card-footer">'
          + '<span class="rnd-priority ' + (p.priority || 'medium') + '">' + (p.priority || 'medium') + '</span>'
          + '<span class="rnd-kanban-card-docs">' + docCount + ' doc' + (docCount !== 1 ? 's' : '') + '</span>'
          + '</div></div></div>';
      });
    }

    html += '</div></div>';
  });

  board.innerHTML = html;
}

function rndRenderPipelineList() {
  var projects = rndGetFilteredProjects();
  var tbody = document.getElementById('rnd-pipeline-tbody');

  if (projects.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="rnd-empty" style="padding:32px;">No R&D projects found.</td></tr>';
    return;
  }

  var html = '';
  projects.forEach(function (p) {
    html += '<tr>'
      + '<td><button class="rnd-project-name-link" onclick="rndOpenDetail(\'' + p.id + '\')">' + escHtml(p.name) + '</button></td>'
      + '<td><span class="rnd-stage ' + (p.stage || 'idea') + '">' + (p.stage || 'idea').replace('-', ' ') + '</span></td>'
      + '<td>' + escHtml(p.owner || '—') + '</td>'
      + '<td>' + escHtml(p.productCategory || '—') + '</td>'
      + '<td><span class="rnd-priority ' + (p.priority || 'medium') + '">' + (p.priority || 'medium') + '</span></td>'
      + '<td>' + (p.targetLaunch ? new Date(p.targetLaunch).toLocaleDateString() : '—') + '</td>'
      + '<td class="row-actions">'
      + '<button class="btn-row-action" onclick="rndOpenEditProject(\'' + p.id + '\')">Edit</button>'
      + '<button class="btn-row-action danger" onclick="rndDeleteProject(\'' + p.id + '\')">Del</button>'
      + '</td></tr>';
  });
  tbody.innerHTML = html;
}

// ============================================================
// DOCUMENTS PANEL
// ============================================================

function rndRenderDocuments() {
  var docs = rndGetDocs();
  var projects = rndGetProjects();

  // Populate project filter dropdown
  var filterEl = document.getElementById('rnd-doc-project-filter');
  var currentVal = filterEl.value;
  filterEl.innerHTML = '<option value="all">All Projects</option>';
  projects.forEach(function (p) {
    filterEl.innerHTML += '<option value="' + p.id + '"' + (currentVal === p.id ? ' selected' : '') + '>' + escHtml(p.name) + '</option>';
  });

  var projectFilter = filterEl.value;
  var typeFilter = document.getElementById('rnd-doc-type-filter').value;

  var filtered = docs.filter(function (d) {
    if (projectFilter !== 'all' && d.rndProjectId !== projectFilter) return false;
    if (typeFilter !== 'all' && d.docType !== typeFilter) return false;
    return true;
  });

  var tbody = document.getElementById('rnd-docs-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="rnd-empty" style="padding:32px;">No documents found.</td></tr>';
    return;
  }

  var projectMap = {};
  projects.forEach(function (p) { projectMap[p.id] = p.name; });

  var html = '';
  filtered.forEach(function (d) {
    html += '<tr>'
      + '<td style="font-weight:500;color:var(--text-primary);cursor:pointer;" onclick="rndOpenEditDoc(\'' + d.id + '\')">' + escHtml(d.title) + '</td>'
      + '<td><span class="rnd-doc-type ' + (d.docType || '') + '">' + (DOC_TYPE_LABELS[d.docType] || d.docType) + '</span></td>'
      + '<td>' + escHtml(projectMap[d.rndProjectId] || '—') + '</td>'
      + '<td><span class="rnd-doc-status ' + (d.status || 'draft') + '">' + (d.status || 'draft') + '</span></td>'
      + '<td>' + escHtml(d.author || '—') + '</td>'
      + '<td>' + (d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '—') + '</td>'
      + '<td class="row-actions">'
      + '<button class="btn-row-action" onclick="rndOpenEditDoc(\'' + d.id + '\')">Edit</button>'
      + '<button class="btn-row-action danger" onclick="rndDeleteDoc(\'' + d.id + '\')">Del</button>'
      + '</td></tr>';
  });
  tbody.innerHTML = html;
}

// ============================================================
// SKU CATALOG PANEL
// ============================================================

function rndRenderSkus() {
  var skuList = rndGetSkus();
  var search = (document.getElementById('rnd-sku-search').value || '').toLowerCase();
  var projects = rndGetProjects();
  var projectMap = {};
  projects.forEach(function (p) { projectMap[p.id] = p.name; });

  var filtered = skuList.filter(function (s) {
    if (search && (s.skuCode || '').toLowerCase().indexOf(search) === -1 && (s.productName || '').toLowerCase().indexOf(search) === -1) return false;
    return true;
  });

  var tbody = document.getElementById('rnd-skus-tbody');
  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="rnd-empty" style="padding:32px;">No SKUs found.</td></tr>';
    return;
  }

  var html = '';
  filtered.forEach(function (s) {
    html += '<tr>'
      + '<td style="font-weight:600;font-family:Monaco,Consolas,monospace;color:var(--color-primary);">' + escHtml(s.skuCode || '') + '</td>'
      + '<td>' + escHtml(s.productName || '') + '</td>'
      + '<td>' + escHtml(s.variant || '—') + '</td>'
      + '<td>' + escHtml(s.packSize || '—') + '</td>'
      + '<td><span class="rnd-sku-status ' + (s.status || 'active') + '">' + (s.status || 'active') + '</span></td>'
      + '<td>' + escHtml(projectMap[s.rndProjectId] || '—') + '</td>'
      + '<td class="row-actions">'
      + '<button class="btn-row-action" onclick="rndOpenEditSku(\'' + s.id + '\')">Edit</button>'
      + '<button class="btn-row-action danger" onclick="rndDeleteSku(\'' + s.id + '\')">Del</button>'
      + '</td></tr>';
  });
  tbody.innerHTML = html;
}

// ============================================================
// DRAWER HELPERS
// ============================================================

function rndOpenDrawer(id) {
  var backdrop = document.getElementById(id + '-backdrop');
  var drawer = document.getElementById(id);
  if (backdrop) backdrop.classList.add('active');
  if (drawer) drawer.classList.add('active');
}

function rndCloseModal(id) {
  var backdrop = document.getElementById(id + '-backdrop');
  var drawer = document.getElementById(id);
  if (backdrop) backdrop.classList.remove('active');
  if (drawer) drawer.classList.remove('active');
}

// ============================================================
// R&D PROJECT CRUD
// ============================================================

function rndOpenAddProject() {
  document.getElementById('rnd-project-modal-title').textContent = 'New R&D Project';
  document.getElementById('rnd-project-form').reset();
  document.getElementById('rnd-project-edit-id').value = '';
  rndOpenDrawer('rnd-project-modal');
}

function rndOpenEditProject(id) {
  var p = rndGetProjects().find(function (x) { return x.id === id; });
  if (!p) return;
  document.getElementById('rnd-project-modal-title').textContent = 'Edit R&D Project';
  document.getElementById('rnd-project-edit-id').value = p.id;
  document.getElementById('rnd-project-name').value = p.name || '';
  document.getElementById('rnd-project-stage').value = p.stage || 'idea';
  document.getElementById('rnd-project-priority').value = p.priority || 'medium';
  document.getElementById('rnd-project-owner').value = p.owner || '';
  document.getElementById('rnd-project-category').value = p.productCategory || '';
  document.getElementById('rnd-project-target-market').value = p.targetMarket || '';
  document.getElementById('rnd-project-start-date').value = p.startDate || '';
  document.getElementById('rnd-project-target-launch').value = p.targetLaunch || '';
  document.getElementById('rnd-project-notes').value = p.notes || '';
  rndOpenDrawer('rnd-project-modal');
}

function rndSaveProject() {
  var editId = document.getElementById('rnd-project-edit-id').value;
  var data = {
    name: document.getElementById('rnd-project-name').value.trim(),
    stage: document.getElementById('rnd-project-stage').value,
    priority: document.getElementById('rnd-project-priority').value,
    owner: document.getElementById('rnd-project-owner').value.trim(),
    productCategory: document.getElementById('rnd-project-category').value.trim(),
    targetMarket: document.getElementById('rnd-project-target-market').value.trim(),
    startDate: document.getElementById('rnd-project-start-date').value,
    targetLaunch: document.getElementById('rnd-project-target-launch').value,
    notes: document.getElementById('rnd-project-notes').value.trim()
  };

  if (!data.name) return;

  var promise;
  if (editId) {
    promise = CandidStore.update('rnd_projects', editId, data);
  } else {
    data.id = 'RND-' + Date.now().toString(16).slice(-6);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    promise = CandidStore.create('rnd_projects', data);
  }

  promise.then(function () {
    rndCloseModal('rnd-project-modal');
    return rndLoadAll();
  }).then(function () {
    rndRenderPipeline();
    rndRenderOverview();
    if (_rndCurrentDetailId) rndOpenDetail(_rndCurrentDetailId);
  });
}

function rndDeleteProject(id) {
  if (!confirm('Delete this R&D project and all linked documents?')) return;
  // Delete linked docs and their trials first
  var docs = rndGetDocs().filter(function (d) { return d.rndProjectId === id; });
  var deleteChain = Promise.resolve();
  docs.forEach(function (d) {
    var trials = rndGetTrials().filter(function (t) { return t.rndDocumentId === d.id; });
    trials.forEach(function (t) {
      deleteChain = deleteChain.then(function () { return CandidStore.remove('rnd_trial_entries', t.id); });
    });
    deleteChain = deleteChain.then(function () { return CandidStore.remove('rnd_documents', d.id); });
  });
  // Unlink SKUs
  var linkedSkus = rndGetSkus().filter(function (s) { return s.rndProjectId === id; });
  linkedSkus.forEach(function (s) {
    deleteChain = deleteChain.then(function () { return CandidStore.update('skus', s.id, { rndProjectId: '' }); });
  });
  deleteChain.then(function () {
    return CandidStore.remove('rnd_projects', id);
  }).then(function () {
    return rndLoadAll();
  }).then(function () {
    rndCloseDetail();
    rndRenderPipeline();
    rndRenderOverview();
  });
}

// ============================================================
// R&D PROJECT DETAIL DRAWER
// ============================================================

function rndOpenDetail(id) {
  _rndCurrentDetailId = id;
  var p = rndGetProjects().find(function (x) { return x.id === id; });
  if (!p) return;

  document.getElementById('rnd-detail-name').textContent = p.name;
  var stageEl = document.getElementById('rnd-detail-stage');
  stageEl.textContent = (p.stage || 'idea').replace('-', ' ');
  stageEl.className = 'rnd-stage ' + (p.stage || 'idea');

  // Stage timeline
  var timelineHtml = '';
  var stageIdx = RND_STAGES.findIndex(function (s) { return s.key === (p.stage || 'idea'); });
  RND_STAGES.forEach(function (s, i) {
    var cls = i === stageIdx ? 'current' : i < stageIdx ? 'passed' : '';
    var bg = i <= stageIdx ? 'background:' + s.color + ';' : '';
    timelineHtml += '<div class="rnd-stage-step ' + cls + '" style="' + bg + '" onclick="rndChangeStage(\'' + p.id + '\',\'' + s.key + '\')">' + s.label + '</div>';
  });
  document.getElementById('rnd-detail-timeline').innerHTML = timelineHtml;

  // Meta
  var metaHtml = '';
  if (p.owner) metaHtml += '<span>Owner: <strong>' + escHtml(p.owner) + '</strong></span>';
  if (p.productCategory) metaHtml += '<span>Category: ' + escHtml(p.productCategory) + '</span>';
  if (p.targetMarket) metaHtml += '<span>Market: ' + escHtml(p.targetMarket) + '</span>';
  if (p.targetLaunch) metaHtml += '<span>Launch: ' + new Date(p.targetLaunch).toLocaleDateString() + '</span>';
  if (p.priority) metaHtml += '<span class="rnd-priority ' + p.priority + '">' + p.priority + '</span>';
  document.getElementById('rnd-detail-meta').innerHTML = metaHtml;

  // Notes
  var notesEl = document.getElementById('rnd-detail-notes');
  if (p.notes) {
    notesEl.textContent = p.notes;
    notesEl.style.display = '';
  } else {
    notesEl.style.display = 'none';
  }

  // Documents
  var docs = rndGetDocs().filter(function (d) { return d.rndProjectId === id; });
  document.getElementById('rnd-detail-docs-count').textContent = docs.length;
  var docsHtml = '';
  if (docs.length === 0) {
    docsHtml = '<div class="rnd-empty" style="padding:16px;font-size:0.83rem;">No documents yet. Click + Add Doc to create one.</div>';
  } else {
    docs.forEach(function (d) {
      docsHtml += '<div class="rnd-doc-card" onclick="rndOpenEditDoc(\'' + d.id + '\')">'
        + '<div class="rnd-doc-card-info">'
        + '<div class="rnd-doc-card-title">' + escHtml(d.title) + '</div>'
        + '<div class="rnd-doc-card-meta">'
        + '<span class="rnd-doc-type ' + (d.docType || '') + '">' + (DOC_TYPE_LABELS[d.docType] || d.docType) + '</span>'
        + ' &middot; <span class="rnd-doc-status ' + (d.status || 'draft') + '">' + (d.status || 'draft') + '</span>'
        + (d.author ? ' &middot; ' + escHtml(d.author) : '')
        + '</div></div></div>';
    });
  }
  document.getElementById('rnd-detail-docs-list').innerHTML = docsHtml;

  // SKUs
  var linkedSkus = rndGetSkus().filter(function (s) { return s.rndProjectId === id; });
  document.getElementById('rnd-detail-skus-count').textContent = linkedSkus.length;
  var skusHtml = '';
  if (linkedSkus.length === 0) {
    skusHtml = '<div class="rnd-empty" style="padding:16px;font-size:0.83rem;">No linked SKUs.</div>';
  } else {
    linkedSkus.forEach(function (s) {
      skusHtml += '<div class="rnd-sku-card">'
        + '<div class="rnd-sku-card-info">'
        + '<div class="rnd-sku-card-code">' + escHtml(s.skuCode) + '</div>'
        + '<div class="rnd-sku-card-name">' + escHtml(s.productName) + (s.variant ? ' — ' + escHtml(s.variant) : '') + '</div>'
        + '</div>'
        + '<span class="rnd-sku-status ' + (s.status || 'active') + '">' + (s.status || 'active') + '</span>'
        + '</div>';
    });
  }
  document.getElementById('rnd-detail-skus-list').innerHTML = skusHtml;

  // Comments
  rndLoadComments(id);

  // Open drawer
  var backdrop = document.getElementById('rnd-detail-backdrop');
  var drawer = document.getElementById('rnd-detail-drawer');
  backdrop.classList.add('active');
  drawer.classList.add('active');
}

function rndCloseDetail() {
  _rndCurrentDetailId = null;
  document.getElementById('rnd-detail-backdrop').classList.remove('active');
  document.getElementById('rnd-detail-drawer').classList.remove('active');
  // Also close doc menu
  var menu = document.getElementById('rnd-doc-type-menu');
  if (menu) menu.style.display = 'none';
}

function rndEditFromDetail() {
  if (_rndCurrentDetailId) rndOpenEditProject(_rndCurrentDetailId);
}

function rndChangeStage(projectId, newStage) {
  var p = rndGetProjects().find(function (x) { return x.id === projectId; });
  var fromStage = p ? (p.stage || 'idea') : '';
  var user = null;
  try { user = JSON.parse(localStorage.getItem('candidlabs_auth')); } catch (e) {}

  CandidStore.update('rnd_projects', projectId, { stage: newStage }).then(function () {
    // Log stage transition
    return CandidStore.create('rnd_stage_history', {
      id: 'STH-' + Date.now().toString(16).slice(-6),
      rndProjectId: projectId,
      fromStage: fromStage,
      toStage: newStage,
      changedBy: user ? user.name : '',
      note: '',
      createdAt: new Date().toISOString()
    });
  }).then(function () {
    return rndLoadAll();
  }).then(function () {
    rndOpenDetail(projectId);
    rndRenderPipeline();
    rndRenderOverview();
  });
}

// Doc type dropdown menu
function rndToggleDocMenu() {
  var menu = document.getElementById('rnd-doc-type-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// ============================================================
// COMMENTS
// ============================================================

function rndLoadComments(projectId) {
  CandidStore.loadComments('rnd_project', projectId).then(function (comments) {
    document.getElementById('rnd-detail-comments-count').textContent = comments.length;
    var html = '';
    if (comments.length === 0) {
      html = '<div class="rnd-empty" style="padding:16px;font-size:0.83rem;">No comments yet.</div>';
    } else {
      comments.forEach(function (c) {
        html += '<div class="rnd-comment-item">'
          + '<div class="rnd-comment-text">' + escHtml(c.body || '') + '</div>'
          + '<div class="rnd-comment-meta">' + escHtml(c.authorName || '') + ' &middot; ' + (c.createdAt ? new Date(c.createdAt).toLocaleString() : '') + '</div>'
          + '</div>';
      });
    }
    document.getElementById('rnd-detail-comments-list').innerHTML = html;
  });
}

function rndSaveComment() {
  if (!_rndCurrentDetailId) return;
  var input = document.getElementById('rnd-detail-comment-input');
  var body = input.value.trim();
  if (!body) return;

  CandidStore.postComment('rnd_project', _rndCurrentDetailId, body).then(function () {
    input.value = '';
    rndLoadComments(_rndCurrentDetailId);
  });
}

// ============================================================
// DOCUMENT CRUD
// ============================================================

function rndOpenAddDoc(projectId, docType) {
  // Close doc type menu
  var menu = document.getElementById('rnd-doc-type-menu');
  if (menu) menu.style.display = 'none';

  var pid = projectId || _rndCurrentDetailId;
  if (!pid) return;

  document.getElementById('rnd-doc-modal-title').textContent = 'New ' + (DOC_SCHEMAS[docType] ? DOC_SCHEMAS[docType].label : 'Document');
  document.getElementById('rnd-doc-form').reset();
  document.getElementById('rnd-doc-edit-id').value = '';
  document.getElementById('rnd-doc-project-id').value = pid;
  document.getElementById('rnd-doc-type').value = docType;

  // Auto-fill title
  var proj = rndGetProjects().find(function (p) { return p.id === pid; });
  document.getElementById('rnd-doc-title').value = (proj ? proj.name + ' — ' : '') + (DOC_SCHEMAS[docType] ? DOC_SCHEMAS[docType].label : docType);

  // Auto-fill author
  try {
    var user = JSON.parse(localStorage.getItem('candidlabs_auth'));
    if (user && user.name) document.getElementById('rnd-doc-author').value = user.name;
  } catch (e) {}

  rndRenderDocForm(docType, {});
  rndOpenDrawer('rnd-doc-modal');
}

function rndOpenEditDoc(id) {
  var d = rndGetDocs().find(function (x) { return x.id === id; });
  if (!d) return;

  var docType = d.docType;
  document.getElementById('rnd-doc-modal-title').textContent = 'Edit ' + (DOC_SCHEMAS[docType] ? DOC_SCHEMAS[docType].label : 'Document');
  document.getElementById('rnd-doc-edit-id').value = d.id;
  document.getElementById('rnd-doc-project-id').value = d.rndProjectId;
  document.getElementById('rnd-doc-type').value = docType;
  document.getElementById('rnd-doc-title').value = d.title || '';
  document.getElementById('rnd-doc-author').value = d.author || '';
  document.getElementById('rnd-doc-status').value = d.status || 'draft';
  document.getElementById('rnd-doc-notes').value = d.notes || '';

  var content = {};
  try { content = typeof d.content === 'string' ? JSON.parse(d.content) : (d.content || {}); } catch (e) {}

  rndRenderDocForm(docType, content);

  // If trial_log, render trial entries
  if (docType === 'trial_log') {
    rndRenderTrialEntries(d.id);
  }

  rndOpenDrawer('rnd-doc-modal');
}

function rndRenderDocForm(docType, content) {
  var container = document.getElementById('rnd-doc-dynamic-fields');
  var schema = DOC_SCHEMAS[docType];
  if (!schema) {
    container.innerHTML = '';
    document.getElementById('rnd-doc-trials-section').style.display = 'none';
    return;
  }

  var html = '<div class="rnd-form-section-label">' + escHtml(schema.label) + ' Fields</div>';

  schema.fields.forEach(function (field) {
    var val = content[field.key] || '';
    html += '<div class="rnd-form-group">';
    html += '<label for="rnd-docf-' + field.key + '">' + escHtml(field.label) + '</label>';

    if (field.type === 'textarea') {
      html += '<textarea id="rnd-docf-' + field.key + '" data-doc-field="' + field.key + '">' + escHtml(val) + '</textarea>';
    } else if (field.type === 'select') {
      html += '<select id="rnd-docf-' + field.key + '" data-doc-field="' + field.key + '">';
      html += '<option value="">-- Select --</option>';
      (field.options || []).forEach(function (opt) {
        html += '<option value="' + opt + '"' + (val === opt ? ' selected' : '') + '>' + opt.charAt(0).toUpperCase() + opt.slice(1) + '</option>';
      });
      html += '</select>';
    } else if (field.type === 'number') {
      html += '<input type="number" id="rnd-docf-' + field.key + '" data-doc-field="' + field.key + '" value="' + escHtml(val) + '">';
    } else if (field.type === 'date') {
      html += '<input type="date" id="rnd-docf-' + field.key + '" data-doc-field="' + field.key + '" value="' + escHtml(val) + '">';
    } else {
      html += '<input type="text" id="rnd-docf-' + field.key + '" data-doc-field="' + field.key + '" value="' + escHtml(val) + '">';
    }

    html += '</div>';
  });

  container.innerHTML = html;

  // Show trial section only for trial_log
  document.getElementById('rnd-doc-trials-section').style.display = docType === 'trial_log' ? '' : 'none';
}

function rndCollectDocContent() {
  var content = {};
  var fields = document.querySelectorAll('[data-doc-field]');
  fields.forEach(function (el) {
    content[el.getAttribute('data-doc-field')] = el.value;
  });
  return content;
}

function rndSaveDoc() {
  var editId = document.getElementById('rnd-doc-edit-id').value;
  var content = rndCollectDocContent();

  var data = {
    rndProjectId: document.getElementById('rnd-doc-project-id').value,
    docType: document.getElementById('rnd-doc-type').value,
    title: document.getElementById('rnd-doc-title').value.trim(),
    author: document.getElementById('rnd-doc-author').value.trim(),
    status: document.getElementById('rnd-doc-status').value,
    content: JSON.stringify(content),
    notes: document.getElementById('rnd-doc-notes').value.trim()
  };

  if (!data.title) return;

  var promise;
  if (editId) {
    promise = CandidStore.update('rnd_documents', editId, data);
  } else {
    data.id = 'DOC-' + Date.now().toString(16).slice(-6);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    promise = CandidStore.create('rnd_documents', data);
  }

  promise.then(function () {
    rndCloseModal('rnd-doc-modal');
    return rndLoadAll();
  }).then(function () {
    rndRenderDocuments();
    rndRenderOverview();
    if (_rndCurrentDetailId) rndOpenDetail(_rndCurrentDetailId);
  });
}

function rndDeleteDoc(id) {
  if (!confirm('Delete this document?')) return;
  // Delete linked trials first
  var trials = rndGetTrials().filter(function (t) { return t.rndDocumentId === id; });
  var chain = Promise.resolve();
  trials.forEach(function (t) {
    chain = chain.then(function () { return CandidStore.remove('rnd_trial_entries', t.id); });
  });
  chain.then(function () {
    return CandidStore.remove('rnd_documents', id);
  }).then(function () {
    return rndLoadAll();
  }).then(function () {
    rndRenderDocuments();
    rndRenderOverview();
    if (_rndCurrentDetailId) rndOpenDetail(_rndCurrentDetailId);
  });
}

// ============================================================
// TRIAL ENTRIES
// ============================================================

function rndRenderTrialEntries(docId) {
  var trials = rndGetTrials().filter(function (t) { return t.rndDocumentId === docId; });
  trials.sort(function (a, b) { return (a.trialNumber || 0) - (b.trialNumber || 0); });

  var container = document.getElementById('rnd-doc-trials-list');
  if (trials.length === 0) {
    container.innerHTML = '<div style="font-size:0.83rem;color:var(--text-muted);padding:8px 0;">No trial entries yet.</div>';
    return;
  }

  var html = '<table class="rnd-trials-table"><thead><tr>'
    + '<th>#</th><th>Date</th><th>Recipe</th><th>Result</th><th>Notes</th><th></th>'
    + '</tr></thead><tbody>';

  trials.forEach(function (t) {
    html += '<tr>'
      + '<td>' + (t.trialNumber || '—') + '</td>'
      + '<td>' + (t.date ? new Date(t.date).toLocaleDateString() : '—') + '</td>'
      + '<td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(t.recipe || '—') + '</td>'
      + '<td>' + (t.result ? '<span class="rnd-trial-result ' + t.result + '">' + t.result + '</span>' : '—') + '</td>'
      + '<td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + escHtml(t.tastingNotes || '—') + '</td>'
      + '<td class="row-actions">'
      + '<button class="btn-row-action" onclick="rndOpenEditTrial(\'' + t.id + '\')">Edit</button>'
      + '<button class="btn-row-action danger" onclick="rndDeleteTrial(\'' + t.id + '\')">Del</button>'
      + '</td></tr>';
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

function rndOpenAddTrial() {
  var docId = document.getElementById('rnd-doc-edit-id').value;
  if (!docId) {
    alert('Please save the document first before adding trial entries.');
    return;
  }

  document.getElementById('rnd-trial-modal-title').textContent = 'Add Trial Entry';
  document.getElementById('rnd-trial-form').reset();
  document.getElementById('rnd-trial-edit-id').value = '';
  document.getElementById('rnd-trial-doc-id').value = docId;

  // Auto-set trial number
  var trials = rndGetTrials().filter(function (t) { return t.rndDocumentId === docId; });
  document.getElementById('rnd-trial-number').value = trials.length + 1;
  document.getElementById('rnd-trial-date').value = new Date().toISOString().split('T')[0];

  rndOpenDrawer('rnd-trial-modal');
}

function rndOpenEditTrial(id) {
  var t = rndGetTrials().find(function (x) { return x.id === id; });
  if (!t) return;

  document.getElementById('rnd-trial-modal-title').textContent = 'Edit Trial Entry';
  document.getElementById('rnd-trial-edit-id').value = t.id;
  document.getElementById('rnd-trial-doc-id').value = t.rndDocumentId;
  document.getElementById('rnd-trial-number').value = t.trialNumber || '';
  document.getElementById('rnd-trial-date').value = t.date || '';
  document.getElementById('rnd-trial-recipe').value = t.recipe || '';
  document.getElementById('rnd-trial-result').value = t.result || '';
  document.getElementById('rnd-trial-tasting-notes').value = t.tastingNotes || '';
  document.getElementById('rnd-trial-adjustments').value = t.adjustments || '';

  rndOpenDrawer('rnd-trial-modal');
}

function rndSaveTrial() {
  var editId = document.getElementById('rnd-trial-edit-id').value;
  var data = {
    rndDocumentId: document.getElementById('rnd-trial-doc-id').value,
    trialNumber: parseInt(document.getElementById('rnd-trial-number').value) || null,
    date: document.getElementById('rnd-trial-date').value,
    recipe: document.getElementById('rnd-trial-recipe').value.trim(),
    result: document.getElementById('rnd-trial-result').value,
    tastingNotes: document.getElementById('rnd-trial-tasting-notes').value.trim(),
    adjustments: document.getElementById('rnd-trial-adjustments').value.trim()
  };

  var promise;
  if (editId) {
    promise = CandidStore.update('rnd_trial_entries', editId, data);
  } else {
    data.id = 'TRL-' + Date.now().toString(16).slice(-6);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    promise = CandidStore.create('rnd_trial_entries', data);
  }

  promise.then(function () {
    rndCloseModal('rnd-trial-modal');
    return rndLoadAll();
  }).then(function () {
    // Re-render trial entries in the doc drawer
    var docId = data.rndDocumentId;
    rndRenderTrialEntries(docId);
  });
}

function rndDeleteTrial(id) {
  if (!confirm('Delete this trial entry?')) return;
  var t = rndGetTrials().find(function (x) { return x.id === id; });
  var docId = t ? t.rndDocumentId : null;

  CandidStore.remove('rnd_trial_entries', id).then(function () {
    return rndLoadAll();
  }).then(function () {
    if (docId) rndRenderTrialEntries(docId);
  });
}

// ============================================================
// SKU CRUD
// ============================================================

function rndOpenAddSku() {
  document.getElementById('rnd-sku-modal-title').textContent = 'Add SKU';
  document.getElementById('rnd-sku-form').reset();
  document.getElementById('rnd-sku-edit-id').value = '';
  rndPopulateSkuProjectDropdown('');
  rndOpenDrawer('rnd-sku-modal');
}

function rndOpenEditSku(id) {
  var s = rndGetSkus().find(function (x) { return x.id === id; });
  if (!s) return;
  document.getElementById('rnd-sku-modal-title').textContent = 'Edit SKU';
  document.getElementById('rnd-sku-edit-id').value = s.id;
  document.getElementById('rnd-sku-code').value = s.skuCode || '';
  document.getElementById('rnd-sku-product-name').value = s.productName || '';
  document.getElementById('rnd-sku-variant').value = s.variant || '';
  document.getElementById('rnd-sku-pack-size').value = s.packSize || '';
  document.getElementById('rnd-sku-status').value = s.status || 'active';
  document.getElementById('rnd-sku-notes').value = s.notes || '';
  rndPopulateSkuProjectDropdown(s.rndProjectId || '');
  rndOpenDrawer('rnd-sku-modal');
}

function rndPopulateSkuProjectDropdown(selectedId) {
  var select = document.getElementById('rnd-sku-rnd-project');
  select.innerHTML = '<option value="">-- None --</option>';
  rndGetProjects().forEach(function (p) {
    select.innerHTML += '<option value="' + p.id + '"' + (selectedId === p.id ? ' selected' : '') + '>' + escHtml(p.name) + '</option>';
  });
}

function rndSaveSku() {
  var editId = document.getElementById('rnd-sku-edit-id').value;
  var data = {
    skuCode: document.getElementById('rnd-sku-code').value.trim(),
    productName: document.getElementById('rnd-sku-product-name').value.trim(),
    variant: document.getElementById('rnd-sku-variant').value.trim(),
    packSize: document.getElementById('rnd-sku-pack-size').value.trim(),
    status: document.getElementById('rnd-sku-status').value,
    rndProjectId: document.getElementById('rnd-sku-rnd-project').value,
    notes: document.getElementById('rnd-sku-notes').value.trim()
  };

  if (!data.skuCode || !data.productName) return;

  var promise;
  if (editId) {
    promise = CandidStore.update('skus', editId, data);
  } else {
    data.id = 'SKU-' + Date.now().toString(16).slice(-6);
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();
    promise = CandidStore.create('skus', data);
  }

  promise.then(function () {
    rndCloseModal('rnd-sku-modal');
    return rndLoadAll();
  }).then(function () {
    rndRenderSkus();
    rndRenderOverview();
    if (_rndCurrentDetailId) rndOpenDetail(_rndCurrentDetailId);
  });
}

function rndDeleteSku(id) {
  if (!confirm('Delete this SKU?')) return;
  CandidStore.remove('skus', id).then(function () {
    return rndLoadAll();
  }).then(function () {
    rndRenderSkus();
    rndRenderOverview();
    if (_rndCurrentDetailId) rndOpenDetail(_rndCurrentDetailId);
  });
}

// ============================================================
// UTILITY
// ============================================================

function escHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// INIT
// ============================================================

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    rndLoadAll().then(function () {
      rndRenderOverview();
      // Apply auth visibility
      if (typeof CandidAuth !== 'undefined') {
        CandidAuth.applyRoleVisibility();
      }
    });
  });
})();
