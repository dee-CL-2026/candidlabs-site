// Project Management Module - Data & Logic Engine
// Storage: localStorage with JSON.
// Pattern: matches budget.js switchTool() sidebar navigation and crm.js CRUD conventions.

// ============================================================
// DATA LAYER - localStorage backed
// ============================================================

var PM_STORAGE_KEYS = {
  projects: 'pm_projects',
  tasks: 'pm_tasks'
};

function pmApplyAuthVisibility() { return; }

// Seed data reflecting real Candid Labs operational projects
function getPMDefaultData() {
  return {
    projects: [
      {
        id: 'PRJ-001',
        name: 'Looker Dashboard Rollout',
        description: 'Build and deploy Looker dashboards for exec, sales, ops, and finance views.',
        owner: 'Dieter',
        status: 'active',
        startDate: '2026-01-15',
        dueDate: '2026-04-30',
        createdAt: '2026-01-10'
      },
      {
        id: 'PRJ-002',
        name: 'candidlabs Platform Build',
        description: 'Build the internal candidlabs web platform with tools, CRM, PM, and dashboards.',
        owner: 'Dieter',
        status: 'active',
        startDate: '2026-02-01',
        dueDate: '2026-06-30',
        createdAt: '2026-02-01'
      },
      {
        id: 'PRJ-003',
        name: 'Q1 2026 Sales Push',
        description: 'Expand Jakarta and Bali distribution with 5 new accounts targeted.',
        owner: 'Sales Team',
        status: 'active',
        startDate: '2026-01-01',
        dueDate: '2026-03-31',
        createdAt: '2025-12-20'
      }
    ],
    tasks: [
      { id: 'TSK-001', projectId: 'PRJ-001', title: 'Define exec dashboard KPIs', assignee: 'Dieter', status: 'done', priority: 'high', dueDate: '2026-02-01', createdAt: '2026-01-10' },
      { id: 'TSK-002', projectId: 'PRJ-001', title: 'Build Sales_Looker data source', assignee: 'Dieter', status: 'in-progress', priority: 'high', dueDate: '2026-02-28', createdAt: '2026-01-15' },
      { id: 'TSK-003', projectId: 'PRJ-001', title: 'Build Finance_Looker data source', assignee: 'Dieter', status: 'to-do', priority: 'medium', dueDate: '2026-03-15', createdAt: '2026-01-15' },
      { id: 'TSK-004', projectId: 'PRJ-001', title: 'Deploy Production_Looker views', assignee: 'Dieter', status: 'to-do', priority: 'medium', dueDate: '2026-03-31', createdAt: '2026-01-15' },
      { id: 'TSK-005', projectId: 'PRJ-002', title: 'Build CRM module', assignee: 'Dieter', status: 'done', priority: 'high', dueDate: '2026-02-17', createdAt: '2026-02-01' },
      { id: 'TSK-006', projectId: 'PRJ-002', title: 'Build PM module', assignee: 'Dieter', status: 'in-progress', priority: 'high', dueDate: '2026-02-17', createdAt: '2026-02-01' },
      { id: 'TSK-007', projectId: 'PRJ-002', title: 'Implement auth system', assignee: 'Dieter', status: 'in-progress', priority: 'high', dueDate: '2026-02-28', createdAt: '2026-02-01' },
      { id: 'TSK-008', projectId: 'PRJ-002', title: 'Wire dashboard with live data', assignee: 'Dieter', status: 'to-do', priority: 'medium', dueDate: '2026-03-15', createdAt: '2026-02-01' },
      { id: 'TSK-009', projectId: 'PRJ-003', title: 'Onboard 3 new Jakarta accounts', assignee: 'Sales Team', status: 'in-progress', priority: 'high', dueDate: '2026-02-28', createdAt: '2025-12-20' },
      { id: 'TSK-010', projectId: 'PRJ-003', title: 'Launch Bali hotel trial program', assignee: 'Sales Team', status: 'to-do', priority: 'medium', dueDate: '2026-03-15', createdAt: '2025-12-20' }
    ]
  };
}

function pmLoadData(key) {
  var raw = localStorage.getItem(PM_STORAGE_KEYS[key]);
  if (raw) {
    return JSON.parse(raw);
  }
  var defaults = getPMDefaultData();
  localStorage.setItem(PM_STORAGE_KEYS[key], JSON.stringify(defaults[key]));
  return defaults[key];
}

function pmSaveData(key, data) {
  localStorage.setItem(PM_STORAGE_KEYS[key], JSON.stringify(data));
}

function pmGenerateId(prefix) {
  var num = Date.now().toString(36).slice(-4).toUpperCase();
  return prefix + '-' + num;
}

// ============================================================
// FORMAT HELPERS
// ============================================================

function pmFormatDate(dateStr) {
  if (!dateStr) return '-';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function pmDueClass(dateStr) {
  if (!dateStr) return 'due-ok';
  var due = new Date(dateStr);
  var now = new Date();
  var diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return 'due-overdue';
  if (diff < 7) return 'due-soon';
  return 'due-ok';
}

// ============================================================
// SIDEBAR NAVIGATION - matches budget.js switchTool()
// ============================================================

function switchTool(toolId) {
  document.querySelectorAll('.tool-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.tool === toolId);
  });
  document.querySelectorAll('.tool-panel').forEach(function(panel) {
    panel.classList.toggle('active', panel.id === 'tool-' + toolId);
  });
  if (toolId === 'overview') renderPMOverview();
  else if (toolId === 'projects') renderProjects();
  else if (toolId === 'tasks') renderTasks();
}

// ============================================================
// OVERVIEW PANEL
// ============================================================

function renderPMOverview() {
  var projects = pmLoadData('projects');
  var tasks = pmLoadData('tasks');

  var activeProjects = projects.filter(function(p) { return p.status === 'active'; });
  var totalTasks = tasks.length;
  var doneTasks = tasks.filter(function(t) { return t.status === 'done'; }).length;
  var overdueTasks = tasks.filter(function(t) {
    return t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date();
  }).length;

  document.getElementById('stat-projects').textContent = activeProjects.length;
  document.getElementById('stat-tasks').textContent = totalTasks;
  document.getElementById('stat-completed').textContent = doneTasks;
  document.getElementById('stat-overdue').textContent = overdueTasks;

  // Render project cards
  var cardsContainer = document.getElementById('project-cards');
  if (!activeProjects.length) {
    cardsContainer.innerHTML = '<div class="pm-empty"><div class="pm-empty-icon">&#128203;</div><p>No active projects</p></div>';
    return;
  }

  cardsContainer.innerHTML = activeProjects.map(function(p) {
    var projectTasks = tasks.filter(function(t) { return t.projectId === p.id; });
    var done = projectTasks.filter(function(t) { return t.status === 'done'; }).length;
    var total = projectTasks.length;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;

    return '<div class="pm-project-card" onclick="switchTool(\'tasks\')">' +
      '<div class="pm-project-card-header">' +
        '<h4>' + pmEscapeHtml(p.name) + '</h4>' +
        '<span class="pm-status ' + p.status + '">' + pmEscapeHtml(p.status) + '</span>' +
      '</div>' +
      '<div class="pm-project-card-meta">' +
        pmEscapeHtml(p.owner || '-') + ' &middot; Due ' + pmFormatDate(p.dueDate) +
      '</div>' +
      '<div class="pm-progress-bar"><div class="pm-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="pm-progress-text">' + done + '/' + total + ' tasks (' + pct + '%)</div>' +
    '</div>';
  }).join('');
}

// ============================================================
// PROJECTS PANEL
// ============================================================

function renderProjects(filter) {
  var projects = pmLoadData('projects');
  var tasks = pmLoadData('tasks');
  var query = (filter || '').toLowerCase();

  if (query) {
    projects = projects.filter(function(p) {
      return p.name.toLowerCase().indexOf(query) !== -1 ||
             (p.owner || '').toLowerCase().indexOf(query) !== -1;
    });
  }

  var tbody = document.getElementById('projects-tbody');
  if (!projects.length) {
    tbody.innerHTML = '<tr><td colspan="6"><div class="pm-empty"><div class="pm-empty-icon">&#128203;</div><p>No projects found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = projects.map(function(p) {
    var projectTasks = tasks.filter(function(t) { return t.projectId === p.id; });
    var done = projectTasks.filter(function(t) { return t.status === 'done'; }).length;
    var total = projectTasks.length;
    var pct = total > 0 ? Math.round((done / total) * 100) : 0;
    var statusClass = (p.status || 'active').replace(/\s+/g, '-').toLowerCase();

    return '<tr>' +
      '<td class="row-name">' + pmEscapeHtml(p.name) + '</td>' +
      '<td class="row-secondary">' + pmEscapeHtml(p.owner || '-') + '</td>' +
      '<td><span class="pm-status ' + statusClass + '">' + pmEscapeHtml(p.status) + '</span></td>' +
      '<td class="row-secondary">' +
        '<div class="pm-progress-bar"><div class="pm-progress-fill" style="width:' + pct + '%"></div></div>' +
        '<div class="pm-progress-text">' + done + '/' + total + '</div>' +
      '</td>' +
      '<td class="row-secondary ' + pmDueClass(p.dueDate) + '">' + pmFormatDate(p.dueDate) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-row-action" onclick="openEditProject(\'' + p.id + '\')">Edit</button>' +
        '<button class="btn-row-action danger" data-auth-role="admin" onclick="deleteProject(\'' + p.id + '\')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  pmApplyAuthVisibility();
}

function openAddProject() {
  document.getElementById('project-modal-title').textContent = 'Add Project';
  document.getElementById('project-form').reset();
  document.getElementById('project-edit-id').value = '';
  document.getElementById('project-modal').classList.add('active');
}

function openEditProject(id) {
  var projects = pmLoadData('projects');
  var project = projects.find(function(p) { return p.id === id; });
  if (!project) return;

  document.getElementById('project-modal-title').textContent = 'Edit Project';
  document.getElementById('project-edit-id').value = project.id;
  document.getElementById('project-name').value = project.name;
  document.getElementById('project-description').value = project.description || '';
  document.getElementById('project-owner').value = project.owner || '';
  document.getElementById('project-status').value = project.status || 'active';
  document.getElementById('project-start-date').value = project.startDate || '';
  document.getElementById('project-due-date').value = project.dueDate || '';
  document.getElementById('project-modal').classList.add('active');
}

function saveProject() {
  var editId = document.getElementById('project-edit-id').value;
  var projects = pmLoadData('projects');

  var record = {
    id: editId || pmGenerateId('PRJ'),
    name: document.getElementById('project-name').value.trim(),
    description: document.getElementById('project-description').value.trim(),
    owner: document.getElementById('project-owner').value.trim(),
    status: document.getElementById('project-status').value,
    startDate: document.getElementById('project-start-date').value,
    dueDate: document.getElementById('project-due-date').value,
    createdAt: editId ? (projects.find(function(p) { return p.id === editId; }) || {}).createdAt : new Date().toISOString().split('T')[0]
  };

  if (!record.name) return;

  if (editId) {
    projects = projects.map(function(p) { return p.id === editId ? record : p; });
  } else {
    projects.push(record);
  }

  pmSaveData('projects', projects);
  pmCloseModal('project-modal');
  renderProjects();
  renderPMOverview();
}

function deleteProject(id) {
  if (!confirm('Delete this project and all its tasks?')) return;
  var projects = pmLoadData('projects').filter(function(p) { return p.id !== id; });
  var tasks = pmLoadData('tasks').filter(function(t) { return t.projectId !== id; });
  pmSaveData('projects', projects);
  pmSaveData('tasks', tasks);
  renderProjects();
  renderPMOverview();
}

// ============================================================
// TASKS PANEL
// ============================================================

var currentTaskFilter = 'all';
var currentProjectFilter = 'all';

function renderTasks(filter) {
  var tasks = pmLoadData('tasks');
  var projects = pmLoadData('projects');
  var query = (filter || '').toLowerCase();

  if (query) {
    tasks = tasks.filter(function(t) {
      return t.title.toLowerCase().indexOf(query) !== -1 ||
             (t.assignee || '').toLowerCase().indexOf(query) !== -1;
    });
  }

  if (currentTaskFilter !== 'all') {
    tasks = tasks.filter(function(t) { return t.status === currentTaskFilter; });
  }

  if (currentProjectFilter !== 'all') {
    tasks = tasks.filter(function(t) { return t.projectId === currentProjectFilter; });
  }

  // Populate project filter dropdown
  var projectSelect = document.getElementById('task-project-filter');
  if (projectSelect) {
    var currentVal = projectSelect.value;
    projectSelect.innerHTML = '<option value="all">All Projects</option>' +
      projects.map(function(p) {
        return '<option value="' + p.id + '">' + pmEscapeHtml(p.name) + '</option>';
      }).join('');
    projectSelect.value = currentVal || 'all';
  }

  var tbody = document.getElementById('tasks-tbody');
  if (!tasks.length) {
    tbody.innerHTML = '<tr><td colspan="7"><div class="pm-empty"><div class="pm-empty-icon">&#9745;</div><p>No tasks found</p></div></td></tr>';
    return;
  }

  tbody.innerHTML = tasks.map(function(t) {
    var project = projects.find(function(p) { return p.id === t.projectId; });
    var projectName = project ? project.name : '-';
    var statusClass = (t.status || 'to-do').toLowerCase();
    var statusLabel = t.status ? t.status.replace('-', ' ') : 'to do';
    var priorityClass = (t.priority || 'medium').toLowerCase();

    return '<tr>' +
      '<td class="row-name">' + pmEscapeHtml(t.title) + '</td>' +
      '<td class="row-secondary">' + pmEscapeHtml(projectName) + '</td>' +
      '<td><span class="pm-assignee"><span class="pm-assignee-dot"></span> ' + pmEscapeHtml(t.assignee || 'Unassigned') + '</span></td>' +
      '<td><span class="task-status ' + statusClass + '">' + pmEscapeHtml(statusLabel) + '</span></td>' +
      '<td><span class="task-priority ' + priorityClass + '">' + pmEscapeHtml(t.priority || 'medium') + '</span></td>' +
      '<td class="row-secondary ' + pmDueClass(t.dueDate) + '">' + pmFormatDate(t.dueDate) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-row-action" onclick="openEditTask(\'' + t.id + '\')">Edit</button>' +
        '<button class="btn-row-action danger" data-auth-role="admin" onclick="deleteTask(\'' + t.id + '\')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
}

function filterTasks(status) {
  currentTaskFilter = status;
  document.querySelectorAll('.pm-filter-tab').forEach(function(tab) {
    tab.classList.toggle('active', tab.dataset.status === status);
  });
  renderTasks(document.getElementById('tasks-search') ? document.getElementById('tasks-search').value : '');
}

function filterTasksByProject() {
  var select = document.getElementById('task-project-filter');
  currentProjectFilter = select ? select.value : 'all';
  renderTasks(document.getElementById('tasks-search') ? document.getElementById('tasks-search').value : '');
}

function openAddTask() {
  document.getElementById('task-modal-title').textContent = 'Add Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-edit-id').value = '';
  populateProjectSelect('task-project');
  document.getElementById('task-modal').classList.add('active');
}

function openEditTask(id) {
  var tasks = pmLoadData('tasks');
  var task = tasks.find(function(t) { return t.id === id; });
  if (!task) return;

  document.getElementById('task-modal-title').textContent = 'Edit Task';
  document.getElementById('task-edit-id').value = task.id;
  document.getElementById('task-title').value = task.title;
  populateProjectSelect('task-project');
  document.getElementById('task-project').value = task.projectId || '';
  document.getElementById('task-assignee').value = task.assignee || '';
  document.getElementById('task-task-status').value = task.status || 'to-do';
  document.getElementById('task-priority').value = task.priority || 'medium';
  document.getElementById('task-due-date').value = task.dueDate || '';
  document.getElementById('task-modal').classList.add('active');
}

function saveTask() {
  var editId = document.getElementById('task-edit-id').value;
  var tasks = pmLoadData('tasks');

  var record = {
    id: editId || pmGenerateId('TSK'),
    projectId: document.getElementById('task-project').value,
    title: document.getElementById('task-title').value.trim(),
    assignee: document.getElementById('task-assignee').value.trim(),
    status: document.getElementById('task-task-status').value,
    priority: document.getElementById('task-priority').value,
    dueDate: document.getElementById('task-due-date').value,
    createdAt: editId ? (tasks.find(function(t) { return t.id === editId; }) || {}).createdAt : new Date().toISOString().split('T')[0]
  };

  if (!record.title) return;

  if (editId) {
    tasks = tasks.map(function(t) { return t.id === editId ? record : t; });
  } else {
    tasks.push(record);
  }

  pmSaveData('tasks', tasks);
  pmCloseModal('task-modal');
  renderTasks();
  renderPMOverview();
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  var tasks = pmLoadData('tasks').filter(function(t) { return t.id !== id; });
  pmSaveData('tasks', tasks);
  renderTasks();
  renderPMOverview();
}

// ============================================================
// SELECT HELPERS
// ============================================================

function populateProjectSelect(selectId) {
  var projects = pmLoadData('projects');
  var select = document.getElementById(selectId);
  select.innerHTML = '<option value="">-- Select Project --</option>' +
    projects.map(function(p) {
      return '<option value="' + p.id + '">' + pmEscapeHtml(p.name) + '</option>';
    }).join('');
}

// ============================================================
// MODAL HELPERS
// ============================================================

function pmCloseModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// ============================================================
// HTML ESCAPING - prevent XSS
// ============================================================

function pmEscapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  // TODO: Re-enable when Google OAuth is configured
  // if (typeof CandidAuth !== 'undefined') {
  //   CandidAuth.requireAuth();
  // }

  renderPMOverview();

  var projectsSearch = document.getElementById('projects-search');
  if (projectsSearch) {
    projectsSearch.addEventListener('input', function() {
      renderProjects(this.value);
    });
  }

  var tasksSearch = document.getElementById('tasks-search');
  if (tasksSearch) {
    tasksSearch.addEventListener('input', function() {
      renderTasks(this.value);
    });
  }

  // Close modals on overlay click
  document.querySelectorAll('.pm-modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  // Project filter for tasks
  var taskProjectFilter = document.getElementById('task-project-filter');
  if (taskProjectFilter) {
    taskProjectFilter.addEventListener('change', filterTasksByProject);
  }

  switchTool('overview');
});
