// Project Management Module - Data & Logic Engine
// Storage: CandidStore (D1 via API) with localStorage fallback.
// Pattern: matches budget.js switchTool() sidebar navigation and crm.js CRUD conventions.

// ============================================================
// DATA LAYER — CandidStore backed (async)
// ============================================================

// Cached data — loaded once from API, kept in sync on mutations
var _pmProjects = null;
var _pmTasks = null;
var _pmDataReady = false;

function pmApplyAuthVisibility() {
  if (typeof CandidAuth !== 'undefined') {
    CandidAuth.applyRoleVisibility();
  }
}

// ---- Data scoping ----

var PM_TEAM_MEMBERS = ['Dieter', 'Jules', 'Mirzan', 'Ferry', 'Anders', 'Jay', 'Alistair'];

function isMyProject(project, userName) {
  if (project.owner === userName) return true;
  var meta = project.meta ? (typeof project.meta === 'string' ? JSON.parse(project.meta) : project.meta) : {};
  var collabs = meta.collaborators || [];
  return collabs.indexOf(userName) !== -1;
}

function scopedProjects(allProjects) {
  var user = (typeof CandidAuth !== 'undefined') ? CandidAuth.getUser() : null;
  if (!user) return allProjects;
  if (typeof CandidAuth !== 'undefined' && CandidAuth.hasRole('partner')) return allProjects;
  return allProjects.filter(function(p) { return isMyProject(p, user.name); });
}

function scopedTasks(allTasks, allProjects) {
  var user = (typeof CandidAuth !== 'undefined') ? CandidAuth.getUser() : null;
  if (!user) return allTasks;
  if (typeof CandidAuth !== 'undefined' && CandidAuth.hasRole('partner')) return allTasks;
  // Build set of project IDs I collaborate on
  var myProjectIds = {};
  allProjects.forEach(function(p) {
    if (isMyProject(p, user.name)) myProjectIds[p.id] = true;
  });
  return allTasks.filter(function(t) {
    return myProjectIds[t.projectId] || t.assignee === user.name;
  });
}

// ---- Load all data from CandidStore ----

function pmLoadAll() {
  if (typeof CandidStore === 'undefined') {
    return Promise.resolve({ projects: [], tasks: [] });
  }
  return Promise.all([
    CandidStore.load('projects'),
    CandidStore.load('tasks')
  ]).then(function(results) {
    _pmProjects = results[0] || [];
    _pmTasks = results[1] || [];
    _pmDataReady = true;
    return { projects: _pmProjects, tasks: _pmTasks };
  });
}

// Sync access to cached data (use after pmLoadAll resolves)
function pmGetProjects() { return _pmProjects || []; }
function pmGetTasks() { return _pmTasks || []; }

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
  var projects = scopedProjects(pmGetProjects());
  var tasks = scopedTasks(pmGetTasks(), pmGetProjects());

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

    return '<div class="pm-project-card" onclick="openProjectDrawer(\'' + p.id + '\')" style="cursor:pointer;">' +
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
  var projects = scopedProjects(pmGetProjects());
  var tasks = scopedTasks(pmGetTasks(), pmGetProjects());
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
      '<td class="row-name"><button class="pm-project-name-link" onclick="openProjectDrawer(\'' + p.id + '\')">' + pmEscapeHtml(p.name) + '</button></td>' +
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
  _resetCollaboratorCheckboxes();
  document.getElementById('project-modal').classList.add('active');
}

function openEditProject(id) {
  var projects = pmGetProjects();
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

  // Populate collaborator checkboxes
  var meta = project.meta ? (typeof project.meta === 'string' ? JSON.parse(project.meta) : project.meta) : {};
  var collabs = meta.collaborators || [];
  _resetCollaboratorCheckboxes(collabs);

  document.getElementById('project-modal').classList.add('active');
}

function _resetCollaboratorCheckboxes(selected) {
  var container = document.getElementById('project-collaborators');
  if (!container) return;
  var sel = selected || [];
  container.innerHTML = PM_TEAM_MEMBERS.map(function(name) {
    var checked = sel.indexOf(name) !== -1 ? ' checked' : '';
    return '<label class="pm-collab-label"><input type="checkbox" value="' + pmEscapeHtml(name) + '"' + checked + '> ' + pmEscapeHtml(name) + '</label>';
  }).join('');
}

function _getSelectedCollaborators() {
  var container = document.getElementById('project-collaborators');
  if (!container) return [];
  var boxes = container.querySelectorAll('input[type="checkbox"]:checked');
  var result = [];
  boxes.forEach(function(cb) { result.push(cb.value); });
  return result;
}

function saveProject() {
  var editId = document.getElementById('project-edit-id').value;
  var collaborators = _getSelectedCollaborators();
  var metaObj = { collaborators: collaborators };

  var record = {
    name: document.getElementById('project-name').value.trim(),
    description: document.getElementById('project-description').value.trim(),
    owner: document.getElementById('project-owner').value.trim(),
    status: document.getElementById('project-status').value,
    startDate: document.getElementById('project-start-date').value,
    dueDate: document.getElementById('project-due-date').value,
    meta: JSON.stringify(metaObj)
  };

  if (!record.name) return;

  var promise;
  if (editId) {
    promise = CandidStore.update('projects', editId, record);
  } else {
    promise = CandidStore.create('projects', record);
  }

  promise.then(function() {
    return pmLoadAll();
  }).then(function() {
    pmCloseModal('project-modal');
    renderProjects();
    renderPMOverview();
    refreshProjectDrawer();
  });
}

function deleteProject(id) {
  if (!confirm('Delete this project and all its tasks?')) return;
  // Delete associated tasks first
  var projectTasks = pmGetTasks().filter(function(t) { return t.projectId === id; });
  var deletePromises = projectTasks.map(function(t) { return CandidStore.remove('tasks', t.id); });
  deletePromises.push(CandidStore.remove('projects', id));

  Promise.all(deletePromises).then(function() {
    return pmLoadAll();
  }).then(function() {
    renderProjects();
    renderPMOverview();
  });
}

// ============================================================
// TASKS PANEL
// ============================================================

var currentTaskFilter = 'all';
var currentProjectFilter = 'all';
var currentAssigneeFilter = 'all';

var _taskSort = { col: null, dir: 1 };

function sortTasks(col) {
  if (_taskSort.col === col) { _taskSort.dir *= -1; } else { _taskSort.col = col; _taskSort.dir = 1; }
  _updateTaskSortArrows();
  renderTasks(document.getElementById('tasks-search') ? document.getElementById('tasks-search').value : '');
}

function _updateTaskSortArrows() {
  document.querySelectorAll('.pm-tasks-sort-btn').forEach(function(btn) {
    var arrow = btn.querySelector('.sort-arrow');
    if (!arrow) return;
    if (btn.dataset.col === _taskSort.col) {
      arrow.textContent = _taskSort.dir === 1 ? ' \u2191' : ' \u2193';
    } else {
      arrow.textContent = '';
    }
  });
}

function _applyTaskSort(arr) {
  var s = _taskSort;
  if (!s.col) return arr.slice();
  var PRIORITY_ORDER = { high: 1, medium: 2, low: 3 };
  var STATUS_ORDER = { 'to-do': 1, 'in-progress': 2, 'blocked': 3, 'done': 4 };
  return arr.slice().sort(function(a, b) {
    var av, bv;
    if (s.col === 'dueDate') {
      av = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      bv = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return (av - bv) * s.dir;
    }
    if (s.col === 'priority') {
      av = PRIORITY_ORDER[a.priority] || 9;
      bv = PRIORITY_ORDER[b.priority] || 9;
      return (av - bv) * s.dir;
    }
    if (s.col === 'status') {
      av = STATUS_ORDER[a.status] || 9;
      bv = STATUS_ORDER[b.status] || 9;
      return (av - bv) * s.dir;
    }
    av = String(a[s.col] || '').toLowerCase();
    bv = String(b[s.col] || '').toLowerCase();
    if (av < bv) return -s.dir;
    if (av > bv) return s.dir;
    return 0;
  });
}

function filterTasksByAssignee() {
  var select = document.getElementById('tasks-assignee-filter');
  currentAssigneeFilter = select ? select.value : 'all';
  renderTasks(document.getElementById('tasks-search') ? document.getElementById('tasks-search').value : '');
}

function renderTasks(filter) {
  var tasks = scopedTasks(pmGetTasks(), pmGetProjects());
  var projects = scopedProjects(pmGetProjects());
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

  if (currentAssigneeFilter !== 'all') {
    tasks = tasks.filter(function(t) { return (t.assignee || '') === currentAssigneeFilter; });
  }

  tasks = _applyTaskSort(tasks);

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

  // Populate assignee filter dropdown from all tasks (not filtered)
  var assigneeSelect = document.getElementById('tasks-assignee-filter');
  if (assigneeSelect) {
    var allTasks = scopedTasks(pmGetTasks(), pmGetProjects());
    var assignees = [];
    allTasks.forEach(function(t) {
      if (t.assignee && assignees.indexOf(t.assignee) === -1) assignees.push(t.assignee);
    });
    assignees.sort();
    var savedAssignee = assigneeSelect.value;
    assigneeSelect.innerHTML = '<option value="all">All Assignees</option>' +
      assignees.map(function(a) {
        return '<option value="' + pmEscapeHtml(a) + '">' + pmEscapeHtml(a) + '</option>';
      }).join('');
    assigneeSelect.value = (savedAssignee && assignees.indexOf(savedAssignee) !== -1) ? savedAssignee : (currentAssigneeFilter !== 'all' ? currentAssigneeFilter : 'all');
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
    var statusLabel = t.status ? t.status.replace(/-/g, ' ') : 'to do';
    var priorityClass = (t.priority || 'medium').toLowerCase();
    var blockerHtml = (t.status === 'blocked' && t.blockerNote)
      ? ' <span class="blocker-indicator" title="' + pmEscapeHtml(t.blockerNote) + '">\u26A0</span>'
      : '';

    return '<tr>' +
      '<td class="row-name">' + pmEscapeHtml(t.title) + '</td>' +
      '<td class="row-secondary">' + pmEscapeHtml(projectName) + '</td>' +
      '<td><span class="pm-assignee pm-assignee-link" onclick="openReassignModal(\'' + t.id + '\')" title="Click to reassign"><span class="pm-assignee-dot"></span> ' + pmEscapeHtml(t.assignee || 'Unassigned') + '</span></td>' +
      '<td><span class="task-status ' + statusClass + '">' + pmEscapeHtml(statusLabel) + '</span>' + blockerHtml + '</td>' +
      '<td><span class="task-priority ' + priorityClass + '">' + pmEscapeHtml(t.priority || 'medium') + '</span></td>' +
      '<td class="row-secondary ' + pmDueClass(t.dueDate) + '">' + pmFormatDate(t.dueDate) + '</td>' +
      '<td><div class="row-actions">' +
        '<button class="btn-row-action" onclick="openEditTask(\'' + t.id + '\')">Edit</button>' +
        '<button class="btn-row-action danger" data-auth-role="admin" onclick="deleteTask(\'' + t.id + '\')">Delete</button>' +
      '</div></td>' +
    '</tr>';
  }).join('');
  pmApplyAuthVisibility();
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

function _pmShowBlockerNote(show) {
  var group = document.getElementById('task-blocker-note-group');
  var actions = document.getElementById('task-blocker-actions');
  if (group) group.style.display = show ? 'block' : 'none';
  if (actions) actions.style.display = show ? 'block' : 'none';
}

function openAddTask() {
  document.getElementById('task-modal-title').textContent = 'Add Task';
  document.getElementById('task-form').reset();
  document.getElementById('task-edit-id').value = '';
  _pmShowBlockerNote(false);
  populateProjectSelect('task-project');
  document.getElementById('task-modal').classList.add('active');
}

function openEditTask(id) {
  var tasks = pmGetTasks();
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
  document.getElementById('task-blocker-note').value = task.blockerNote || '';
  _pmShowBlockerNote(task.status === 'blocked');
  document.getElementById('task-modal').classList.add('active');
}

function saveTask() {
  var editId = document.getElementById('task-edit-id').value;

  var newStatus = document.getElementById('task-task-status').value;
  var record = {
    projectId: document.getElementById('task-project').value,
    title: document.getElementById('task-title').value.trim(),
    assignee: document.getElementById('task-assignee').value.trim(),
    status: newStatus,
    priority: document.getElementById('task-priority').value,
    dueDate: document.getElementById('task-due-date').value,
    blockerNote: newStatus === 'blocked' ? (document.getElementById('task-blocker-note').value.trim()) : ''
  };

  if (!record.title) return;

  var promise;
  if (editId) {
    promise = CandidStore.update('tasks', editId, record);
  } else {
    promise = CandidStore.create('tasks', record);
  }

  promise.then(function() {
    // If blocked + follow-up task requested, create it now
    var createFollowup = document.getElementById('task-blocker-create-followup');
    if (newStatus === 'blocked' && createFollowup && createFollowup.checked) {
      var followupTitle = (document.getElementById('task-blocker-followup-title').value || '').trim();
      if (followupTitle) {
        return CandidStore.create('tasks', {
          projectId: record.projectId,
          title: followupTitle,
          assignee: record.assignee,
          status: 'to-do',
          priority: record.priority,
          dueDate: '',
          blockerNote: ''
        });
      }
    }
  }).then(function() {
    return pmLoadAll();
  }).then(function() {
    pmCloseModal('task-modal');
    renderTasks();
    renderPMOverview();
    refreshProjectDrawer();
  });
}

// ============================================================
// REASSIGN
// ============================================================

function openReassignModal(taskId) {
  var tasks = pmGetTasks();
  var task = tasks.find(function(t) { return t.id === taskId; });
  if (!task) return;

  document.getElementById('reassign-task-id').value = taskId;
  document.getElementById('reassign-task-title').textContent = task.title;
  document.getElementById('reassign-assignee').value = task.assignee || '';

  // Populate datalist from all known assignees
  var assignees = [];
  tasks.forEach(function(t) {
    if (t.assignee && assignees.indexOf(t.assignee) === -1) assignees.push(t.assignee);
  });
  assignees.sort();
  document.getElementById('reassign-assignee-list').innerHTML =
    assignees.map(function(a) { return '<option value="' + pmEscapeHtml(a) + '">'; }).join('');

  document.getElementById('reassign-modal').classList.add('active');
}

function saveReassign() {
  var id = document.getElementById('reassign-task-id').value;
  var newAssignee = document.getElementById('reassign-assignee').value.trim();
  if (!id || !newAssignee) return;

  CandidStore.update('tasks', id, { assignee: newAssignee }).then(function() {
    return pmLoadAll();
  }).then(function() {
    pmCloseModal('reassign-modal');
    renderTasks();
    refreshProjectDrawer();
  });
}

function deleteTask(id) {
  if (!confirm('Delete this task?')) return;
  CandidStore.remove('tasks', id).then(function() {
    return pmLoadAll();
  }).then(function() {
    renderTasks();
    renderPMOverview();
    refreshProjectDrawer();
  });
}

// ============================================================
// KANBAN VIEW
// ============================================================

var _taskView = 'list'; // 'list' | 'kanban'

var KANBAN_COLUMNS = [
  { status: 'to-do',       label: 'To Do',       color: '#64748b' },
  { status: 'in-progress', label: 'In Progress',  color: '#1b708b' },
  { status: 'blocked',     label: 'Blocked',      color: '#ef4444' },
  { status: 'done',        label: 'Done',         color: '#10b981' }
];

function setTaskView(view) {
  _taskView = view;
  document.getElementById('tasks-list-view').style.display = view === 'list' ? '' : 'none';
  document.getElementById('tasks-kanban-view').style.display = view === 'kanban' ? '' : 'none';
  document.getElementById('tasks-view-list').classList.toggle('active', view === 'list');
  document.getElementById('tasks-view-kanban').classList.toggle('active', view === 'kanban');
  if (view === 'kanban') {
    populateKanbanProjectFilter();
    renderTasksKanban();
  }
}

function populateKanbanProjectFilter() {
  var projects = scopedProjects(pmGetProjects());
  var select = document.getElementById('kanban-project-filter');
  if (!select) return;
  var current = select.value;
  select.innerHTML = '<option value="all">All Projects</option>' +
    projects.map(function(p) {
      return '<option value="' + p.id + '">' + pmEscapeHtml(p.name) + '</option>';
    }).join('');
  if (current) select.value = current;
}

function renderTasksKanban() {
  var tasks = scopedTasks(pmGetTasks(), pmGetProjects());
  var projects = scopedProjects(pmGetProjects());
  var board = document.getElementById('kanban-board');
  if (!board) return;

  var projectFilter = (document.getElementById('kanban-project-filter') || {}).value || 'all';
  if (projectFilter !== 'all') {
    tasks = tasks.filter(function(t) { return t.projectId === projectFilter; });
  }

  board.innerHTML = KANBAN_COLUMNS.map(function(col) {
    var colTasks = tasks.filter(function(t) { return t.status === col.status; });
    var cards = colTasks.map(function(t) {
      var project = projects.find(function(p) { return p.id === t.projectId; });
      var dueClass = '';
      if (t.dueDate) {
        var due = new Date(t.dueDate);
        var now = new Date();
        var diff = (due - now) / 86400000;
        if (diff < 0) dueClass = 'due-overdue';
        else if (diff <= 3) dueClass = 'due-soon';
      }
      var priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
      var pc = priorityColors[t.priority] || '#64748b';
      return '<div class="kanban-card" onclick="openEditTask(\'' + t.id + '\')">' +
        '<div class="kanban-card-priority" style="background:' + pc + '" title="' + pmEscapeHtml(t.priority || 'medium') + '"></div>' +
        '<div class="kanban-card-body">' +
          '<div class="kanban-card-title">' + pmEscapeHtml(t.title) + '</div>' +
          (project ? '<div class="kanban-card-project">' + pmEscapeHtml(project.name) + '</div>' : '') +
          '<div class="kanban-card-footer">' +
            (t.assignee ? '<span class="kanban-assignee">' + pmEscapeHtml(t.assignee.split(' ')[0]) + '</span>' : '<span></span>') +
            (t.dueDate ? '<span class="kanban-due ' + dueClass + '">' + formatKanbanDate(t.dueDate) + '</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    return '<div class="kanban-column">' +
      '<div class="kanban-col-header">' +
        '<span class="kanban-col-dot" style="background:' + col.color + '"></span>' +
        '<span class="kanban-col-label">' + col.label + '</span>' +
        '<span class="kanban-col-count">' + colTasks.length + '</span>' +
      '</div>' +
      '<div class="kanban-col-cards">' + (cards || '<div class="kanban-empty">No tasks</div>') + '</div>' +
    '</div>';
  }).join('');
}

function formatKanbanDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ============================================================
// SELECT HELPERS
// ============================================================

function populateProjectSelect(selectId) {
  var projects = scopedProjects(pmGetProjects());
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
// PROJECT DRAWER
// ============================================================

var _drawerProjectId = null;

/** Shared populate — updates all drawer content from data */
function _populateProjectDrawer(project, allTasks) {
  var projectTasks = allTasks.filter(function(t) { return t.projectId === project.id; });
  var done    = projectTasks.filter(function(t) { return t.status === 'done'; }).length;
  var total   = projectTasks.length;
  var open    = projectTasks.filter(function(t) { return t.status !== 'done'; }).length;
  var overdue = projectTasks.filter(function(t) {
    return t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date();
  }).length;
  var pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Header
  document.getElementById('drawer-project-name').textContent = project.name;
  var statusEl = document.getElementById('drawer-project-status');
  statusEl.textContent = project.status;
  statusEl.className = 'pm-status ' + (project.status || 'active').replace(/\s+/g, '-');

  // Description
  var descEl = document.getElementById('drawer-description');
  if (descEl) {
    descEl.textContent = project.description || '';
    descEl.style.display = project.description ? '' : 'none';
  }

  // Metrics
  document.getElementById('drawer-pct').textContent = pct + '%';
  document.getElementById('drawer-open-tasks').textContent = open;
  document.getElementById('drawer-done-tasks').textContent = done;
  document.getElementById('drawer-overdue-tasks').textContent = overdue;
  document.getElementById('drawer-progress-fill').style.width = pct + '%';

  // Meta row
  document.getElementById('drawer-owner').textContent = project.owner ? '\uD83D\uDC64 ' + project.owner : '';
  var dates = '';
  if (project.startDate || project.dueDate) {
    dates = (project.startDate ? pmFormatDate(project.startDate) : '?') +
            ' \u2192 ' +
            (project.dueDate ? pmFormatDate(project.dueDate) : '?');
  }
  document.getElementById('drawer-dates').textContent = dates;

  // Task list and notes
  renderDrawerTasks(project.id, projectTasks);
  renderDrawerNotes(project.id);
}

function openProjectDrawer(projectId) {
  var projects = pmGetProjects();
  var tasks    = pmGetTasks();
  var project  = projects.find(function(p) { return p.id === projectId; });
  if (!project) return;

  _drawerProjectId = projectId;
  _populateProjectDrawer(project, tasks);

  document.getElementById('pm-drawer').classList.add('pm-drawer--open');
  document.getElementById('pm-drawer-overlay').classList.add('pm-drawer-overlay--visible');
  document.body.style.overflow = 'hidden';
}

function closeProjectDrawer() {
  document.getElementById('pm-drawer').classList.remove('pm-drawer--open');
  document.getElementById('pm-drawer-overlay').classList.remove('pm-drawer-overlay--visible');
  document.body.style.overflow = '';
  _drawerProjectId = null;
}

/** Call after any save/delete to keep the open drawer in sync */
function refreshProjectDrawer() {
  if (!_drawerProjectId) return;
  var projects = pmGetProjects();
  var tasks    = pmGetTasks();
  var project  = projects.find(function(p) { return p.id === _drawerProjectId; });
  if (!project) { closeProjectDrawer(); return; }
  _populateProjectDrawer(project, tasks);
}

function renderDrawerTasks(projectId, projectTasks) {
  var container = document.getElementById('drawer-tasks-list');
  if (!container) return;
  var countEl = document.getElementById('drawer-tasks-count');
  if (countEl) countEl.textContent = projectTasks.length;

  if (!projectTasks.length) {
    container.innerHTML = '<div class="pm-drawer-empty">No tasks yet \u2014 add one below.</div>';
    return;
  }

  container.innerHTML = projectTasks.map(function(t) {
    var sc  = (t.status || 'to-do').toLowerCase();
    var pri = (t.priority || 'medium').toLowerCase();
    var dueHtml = t.dueDate
      ? '<span class="drawer-task-due ' + pmDueClass(t.dueDate) + '">' + pmFormatDate(t.dueDate) + '</span>'
      : '';
    return '<div class="drawer-task-card">' +
      '<div class="drawer-task-top">' +
        '<select class="drawer-task-status-select ' + sc + '" ' +
                'aria-label="Task status" ' +
                'onchange="quickEditTaskStatus(\'' + t.id + '\', this.value, this)">' +
          '<option value="to-do"'      + (t.status === 'to-do'       ? ' selected' : '') + '>To Do</option>' +
          '<option value="in-progress"' + (t.status === 'in-progress' ? ' selected' : '') + '>In Progress</option>' +
          '<option value="done"'        + (t.status === 'done'        ? ' selected' : '') + '>Done</option>' +
          '<option value="blocked"'     + (t.status === 'blocked'     ? ' selected' : '') + '>Blocked</option>' +
        '</select>' +
        '<span class="task-priority ' + pri + '">' + pmEscapeHtml(t.priority || 'medium') + '</span>' +
      '</div>' +
      '<div class="drawer-task-title">' + pmEscapeHtml(t.title) + '</div>' +
      '<div class="drawer-task-footer">' +
        (t.assignee ? '<span class="drawer-task-assignee">\uD83D\uDC64 ' + pmEscapeHtml(t.assignee) + '</span>' : '<span></span>') +
        dueHtml +
        '<button class="drawer-task-edit-btn" onclick="openEditTask(\'' + t.id + '\')">Edit</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function quickEditTaskStatus(taskId, newStatus, selectEl) {
  CandidStore.update('tasks', taskId, { status: newStatus }).then(function() {
    return pmLoadAll();
  }).then(function() {
    // Update select colour class
    if (selectEl) selectEl.className = 'drawer-task-status-select ' + newStatus.toLowerCase();

    // Refresh metrics in drawer header without re-rendering task list (avoids focus loss)
    if (_drawerProjectId) {
      var tasks = pmGetTasks();
      var projectTasks = tasks.filter(function(t) { return t.projectId === _drawerProjectId; });
      var done    = projectTasks.filter(function(t) { return t.status === 'done'; }).length;
      var total   = projectTasks.length;
      var open    = projectTasks.filter(function(t) { return t.status !== 'done'; }).length;
      var overdue = projectTasks.filter(function(t) {
        return t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date();
      }).length;
      var pct = total > 0 ? Math.round((done / total) * 100) : 0;
      document.getElementById('drawer-pct').textContent = pct + '%';
      document.getElementById('drawer-open-tasks').textContent = open;
      document.getElementById('drawer-done-tasks').textContent = done;
      document.getElementById('drawer-overdue-tasks').textContent = overdue;
      document.getElementById('drawer-progress-fill').style.width = pct + '%';
    }

    renderProjects();
    renderPMOverview();
  });
}

function openAddTaskForProject() {
  openAddTask();
  if (_drawerProjectId) {
    var sel = document.getElementById('task-project');
    if (sel) sel.value = _drawerProjectId;
  }
}

function openEditProjectFromDrawer() {
  if (_drawerProjectId) openEditProject(_drawerProjectId);
}

// Notes
var PM_NOTES_KEY = 'pm_notes';

function pmLoadNotes() {
  try { var r = localStorage.getItem(PM_NOTES_KEY); return r ? JSON.parse(r) : []; }
  catch (e) { return []; }
}

function pmSaveNotes(notes) {
  localStorage.setItem(PM_NOTES_KEY, JSON.stringify(notes));
}

function renderDrawerNotes(projectId) {
  var notes = pmLoadNotes()
    .filter(function(n) { return n.projectId === projectId; })
    .sort(function(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });

  var countEl = document.getElementById('drawer-notes-count');
  if (countEl) countEl.textContent = notes.length;

  var container = document.getElementById('drawer-notes-list');
  if (!container) return;

  if (!notes.length) {
    container.innerHTML = '<div class="pm-drawer-empty">No notes yet.</div>';
    return;
  }

  container.innerHTML = notes.map(function(n) {
    return '<div class="drawer-note-item">' +
      '<div class="drawer-note-text">' + pmEscapeHtml(n.text) + '</div>' +
      '<div class="drawer-note-meta">' + _formatNoteDate(n.createdAt) + '</div>' +
    '</div>';
  }).join('');
}

function saveDrawerNote() {
  if (!_drawerProjectId) return;
  var input = document.getElementById('drawer-note-input');
  var text  = (input ? input.value : '').trim();
  if (!text) return;

  var notes = pmLoadNotes();
  notes.push({
    id: 'NOTE-' + Date.now().toString(36).slice(-4).toUpperCase(),
    projectId: _drawerProjectId,
    text: text,
    createdAt: new Date().toISOString()
  });
  pmSaveNotes(notes);
  if (input) input.value = '';
  renderDrawerNotes(_drawerProjectId);
}

function _formatNoteDate(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  if (typeof CandidAuth !== 'undefined') {
    CandidAuth.requireAuth();
  }

  // Load data from D1 via CandidStore, then render
  pmLoadAll().then(function() {
    renderPMOverview();
  });

  // Re-render when auth state changes (e.g. user identity resolved)
  if (typeof CandidAuth !== 'undefined' && CandidAuth.onAuthChange) {
    CandidAuth.onAuthChange(function() {
      if (_pmDataReady) {
        renderPMOverview();
      }
    });
  }

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

  // Assignee filter for tasks
  var taskAssigneeFilter = document.getElementById('tasks-assignee-filter');
  if (taskAssigneeFilter) {
    taskAssigneeFilter.addEventListener('change', filterTasksByAssignee);
  }

  // Show/hide blocker note field when status changes to/from blocked
  var taskStatusSelect = document.getElementById('task-task-status');
  if (taskStatusSelect) {
    taskStatusSelect.addEventListener('change', function() {
      _pmShowBlockerNote(this.value === 'blocked');
    });
  }

  // Toggle follow-up task input when checkbox is checked
  var blockerFollowupCb = document.getElementById('task-blocker-create-followup');
  if (blockerFollowupCb) {
    blockerFollowupCb.addEventListener('change', function() {
      var fg = document.getElementById('task-blocker-followup-group');
      if (fg) fg.style.display = this.checked ? 'block' : 'none';
    });
  }

  // Close reassign modal on overlay click
  var reassignModal = document.getElementById('reassign-modal');
  if (reassignModal) {
    reassignModal.addEventListener('click', function(e) {
      if (e.target === reassignModal) reassignModal.classList.remove('active');
    });
  }

  // Escape closes drawer (or open modal)
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && _drawerProjectId) closeProjectDrawer();
  });

  switchTool('overview');
});
