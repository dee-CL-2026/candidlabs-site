// Candidlabs API — Cloudflare Worker + D1
// RESTful CRUD for CRM (contacts, companies, deals) and Projects (projects, tasks)

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, X-Agent-Id'
    }
  });
}

function generateId(prefix) {
  return prefix + '-' + Date.now().toString(16).slice(-6);
}

// ============================================================
// Collection config — defines what tables exist and their rules
// ============================================================

const COLLECTIONS = {
  contacts: {
    table: 'contacts',
    prefix: 'CON',
    required: ['name'],
    columns: ['id', 'name', 'email', 'phone', 'role', 'company_id', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['name', 'email', 'role']
  },
  companies: {
    table: 'companies',
    prefix: 'CMP',
    required: ['name'],
    columns: ['id', 'name', 'type', 'parent_id', 'market', 'channel', 'status', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['name', 'market', 'channel']
  },
  deals: {
    table: 'deals',
    prefix: 'DL',
    required: ['title'],
    columns: ['id', 'title', 'company_id', 'contact_id', 'value', 'stage', 'channel_type', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['title']
  },
  projects: {
    table: 'projects',
    prefix: 'PRJ',
    required: ['name'],
    columns: ['id', 'name', 'description', 'owner', 'status', 'start_date', 'due_date',
              'project_type', 'owner_team', 'visible_to_roles', 'visible_to_teams',
              'visibility_mode', 'org_id', 'branch_id', 'external_org_id', 'meta', 'created_at', 'updated_at'],
    searchable: ['name', 'owner']
  },
  tasks: {
    table: 'tasks',
    prefix: 'TSK',
    required: ['title'],
    columns: ['id', 'title', 'project_id', 'assignee', 'status', 'priority', 'due_date',
              'blocker_note', 'owner_team', 'visible_to_roles', 'visible_to_teams', 'meta', 'created_at', 'updated_at'],
    searchable: ['title', 'assignee']
  }
};

// ============================================================
// Generic CRUD handlers
// ============================================================

async function listCollection(env, collection, url) {
  const cfg = COLLECTIONS[collection];
  const search = url.searchParams.get('search');
  const filter = url.searchParams.get('filter');
  const filterCol = url.searchParams.get('filterCol');

  let sql = `SELECT * FROM ${cfg.table}`;
  const binds = [];
  const wheres = [];

  if (search && cfg.searchable.length > 0) {
    const clause = cfg.searchable.map(col => `${col} LIKE ?`).join(' OR ');
    wheres.push(`(${clause})`);
    cfg.searchable.forEach(() => binds.push(`%${search}%`));
  }

  if (filter && filterCol && cfg.columns.includes(filterCol)) {
    wheres.push(`${filterCol} = ?`);
    binds.push(filter);
  }

  if (wheres.length > 0) {
    sql += ' WHERE ' + wheres.join(' AND ');
  }

  sql += ' ORDER BY created_at DESC';

  const stmt = binds.length > 0
    ? env.DB.prepare(sql).bind(...binds)
    : env.DB.prepare(sql);

  const { results } = await stmt.all();
  return json({ ok: true, data: results, meta: { count: results.length } });
}

async function getOne(env, collection, id) {
  const cfg = COLLECTIONS[collection];
  const row = await env.DB.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).bind(id).first();
  if (!row) return json({ ok: false, error: { code: 'NOT_FOUND', message: `${collection} ${id} not found` } }, 404);
  return json({ ok: true, data: row });
}

async function createOne(req, env, collection) {
  const cfg = COLLECTIONS[collection];
  const body = await req.json().catch(() => ({}));

  for (const field of cfg.required) {
    if (!body[field] || String(body[field]).trim() === '') {
      return json({ ok: false, error: { code: 'VALIDATION', message: `${field} is required` } }, 400);
    }
  }

  const id = generateId(cfg.prefix);
  const now = new Date().toISOString();

  // Build insert from known columns only
  const record = { id, created_at: now, updated_at: now };
  for (const col of cfg.columns) {
    if (col === 'id' || col === 'created_at' || col === 'updated_at') continue;
    if (body[col] !== undefined) {
      record[col] = body[col];
    }
  }

  const cols = Object.keys(record);
  const placeholders = cols.map(() => '?').join(', ');
  const values = cols.map(c => record[c]);

  await env.DB.prepare(
    `INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${placeholders})`
  ).bind(...values).run();

  return json({ ok: true, data: record }, 201);
}

async function updateOne(req, env, collection, id) {
  const cfg = COLLECTIONS[collection];
  const body = await req.json().catch(() => ({}));

  const existing = await env.DB.prepare(`SELECT id FROM ${cfg.table} WHERE id = ?`).bind(id).first();
  if (!existing) return json({ ok: false, error: { code: 'NOT_FOUND', message: `${collection} ${id} not found` } }, 404);

  const sets = [];
  const binds = [];

  for (const col of cfg.columns) {
    if (col === 'id' || col === 'created_at') continue;
    if (col === 'updated_at') {
      sets.push('updated_at = ?');
      binds.push(new Date().toISOString());
      continue;
    }
    if (body[col] !== undefined) {
      sets.push(`${col} = ?`);
      binds.push(body[col]);
    }
  }

  if (sets.length === 0) return json({ ok: false, error: { code: 'VALIDATION', message: 'No fields to update' } }, 400);

  binds.push(id);
  await env.DB.prepare(`UPDATE ${cfg.table} SET ${sets.join(', ')} WHERE id = ?`).bind(...binds).run();

  const updated = await env.DB.prepare(`SELECT * FROM ${cfg.table} WHERE id = ?`).bind(id).first();
  return json({ ok: true, data: updated });
}

async function deleteOne(env, collection, id) {
  const cfg = COLLECTIONS[collection];

  const existing = await env.DB.prepare(`SELECT id FROM ${cfg.table} WHERE id = ?`).bind(id).first();
  if (!existing) return json({ ok: false, error: { code: 'NOT_FOUND', message: `${collection} ${id} not found` } }, 404);

  // Cascade: if deleting a project, delete its tasks
  if (collection === 'projects') {
    await env.DB.prepare('DELETE FROM tasks WHERE project_id = ?').bind(id).run();
  }

  // Referential checks: don't delete company if contacts/deals reference it
  if (collection === 'companies') {
    const linkedContacts = await env.DB.prepare('SELECT COUNT(*) AS c FROM contacts WHERE company_id = ?').bind(id).first();
    const linkedDeals = await env.DB.prepare('SELECT COUNT(*) AS c FROM deals WHERE company_id = ?').bind(id).first();
    if ((linkedContacts?.c || 0) > 0 || (linkedDeals?.c || 0) > 0) {
      return json({ ok: false, error: { code: 'CONFLICT', message: 'Cannot delete company with linked contacts or deals' } }, 409);
    }
  }

  // Don't delete contact if deals reference it
  if (collection === 'contacts') {
    const linkedDeals = await env.DB.prepare('SELECT COUNT(*) AS c FROM deals WHERE contact_id = ?').bind(id).first();
    if ((linkedDeals?.c || 0) > 0) {
      return json({ ok: false, error: { code: 'CONFLICT', message: 'Cannot delete contact with linked deals' } }, 409);
    }
  }

  await env.DB.prepare(`DELETE FROM ${cfg.table} WHERE id = ?`).bind(id).run();
  return json({ ok: true, data: { id } });
}

// ============================================================
// Comments endpoints
// ============================================================

async function listComments(env, url) {
  const recordType = url.searchParams.get('recordType');
  const recordId = url.searchParams.get('recordId');
  if (!recordType || !recordId) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'recordType and recordId are required' } }, 400);
  }
  const { results } = await env.DB.prepare(
    'SELECT * FROM comments WHERE record_type = ? AND record_id = ? ORDER BY created_at ASC'
  ).bind(recordType, recordId).all();
  return json({ ok: true, data: results, meta: { count: results.length } });
}

async function createComment(req, env) {
  const body = await req.json().catch(() => ({}));
  const { record_type, record_id, author_email, author_name, body: commentBody } = body;
  if (!record_type || !record_id || !author_email || !commentBody) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'record_type, record_id, author_email, and body are required' } }, 400);
  }
  const id = 'CMT-' + Date.now().toString(16).slice(-8);
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO comments (id, record_type, record_id, author_email, author_name, body, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, record_type, record_id, author_email, author_name || author_email, commentBody, now, now).run();
  return json({ ok: true, data: { id, record_type, record_id, author_email, author_name: author_name || author_email, body: commentBody, created_at: now } }, 201);
}

async function deleteComment(env, id) {
  const existing = await env.DB.prepare('SELECT id FROM comments WHERE id = ?').bind(id).first();
  if (!existing) return json({ ok: false, error: { code: 'NOT_FOUND', message: `Comment ${id} not found` } }, 404);
  await env.DB.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
  return json({ ok: true, data: { id } });
}

// ============================================================
// Overview / KPI endpoints
// ============================================================

async function crmOverview(env) {
  const contactCount = await env.DB.prepare('SELECT COUNT(*) AS c FROM contacts').first();
  const companyCount = await env.DB.prepare('SELECT COUNT(*) AS c FROM companies').first();
  const dealCount = await env.DB.prepare('SELECT COUNT(*) AS c FROM deals').first();
  const pipeline = await env.DB.prepare(
    "SELECT COALESCE(SUM(value), 0) AS total FROM deals WHERE stage != 'closed-lost'"
  ).first();

  return json({
    ok: true,
    data: {
      contacts: contactCount?.c || 0,
      companies: companyCount?.c || 0,
      deals: dealCount?.c || 0,
      pipelineValue: pipeline?.total || 0
    }
  });
}

async function projectsOverview(env) {
  const activeProjects = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM projects WHERE status = 'active'"
  ).first();
  const totalTasks = await env.DB.prepare('SELECT COUNT(*) AS c FROM tasks').first();
  const completedTasks = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM tasks WHERE status = 'done'"
  ).first();
  const overdueTasks = await env.DB.prepare(
    "SELECT COUNT(*) AS c FROM tasks WHERE status != 'done' AND due_date IS NOT NULL AND due_date < date('now')"
  ).first();

  return json({
    ok: true,
    data: {
      activeProjects: activeProjects?.c || 0,
      totalTasks: totalTasks?.c || 0,
      completedTasks: completedTasks?.c || 0,
      overdueTasks: overdueTasks?.c || 0
    }
  });
}

// ============================================================
// Router
// ============================================================

async function handleApi(req, env, url) {
  const path = url.pathname;

  // Health
  if (path === '/api/health') {
    return json({ ok: true, service: 'candidlabs-api', date: new Date().toISOString() });
  }

  // Overview endpoints
  if (path === '/api/overview/crm' && req.method === 'GET') return crmOverview(env);
  if (path === '/api/overview/projects' && req.method === 'GET') return projectsOverview(env);

  // Comments routes: /api/comments[/{id}]
  if (path === '/api/comments' && req.method === 'GET') return listComments(env, url);
  if (path === '/api/comments' && req.method === 'POST') return createComment(req, env);
  const commentDeleteMatch = path.match(/^\/api\/comments\/([^/]+)$/);
  if (commentDeleteMatch && req.method === 'DELETE') return deleteComment(env, commentDeleteMatch[1]);

  // CRUD routes: /api/{collection}[/{id}]
  const match = path.match(/^\/api\/(contacts|companies|deals|projects|tasks)(?:\/([^/]+))?$/);
  if (!match) return json({ ok: false, error: { code: 'NOT_FOUND', message: 'Unknown endpoint' } }, 404);

  const collection = match[1];
  const id = match[2];

  switch (req.method) {
    case 'GET':
      return id ? getOne(env, collection, id) : listCollection(env, collection, url);
    case 'POST':
      if (id) return json({ ok: false, error: { code: 'BAD_REQUEST', message: 'POST should not include ID' } }, 400);
      return createOne(req, env, collection);
    case 'PUT':
      if (!id) return json({ ok: false, error: { code: 'BAD_REQUEST', message: 'PUT requires an ID' } }, 400);
      return updateOne(req, env, collection, id);
    case 'DELETE':
      if (!id) return json({ ok: false, error: { code: 'BAD_REQUEST', message: 'DELETE requires an ID' } }, 400);
      return deleteOne(env, collection, id);
    default:
      return json({ ok: false, error: { code: 'METHOD_NOT_ALLOWED', message: `${req.method} not supported` } }, 405);
  }
}

// ============================================================
// Export
// ============================================================

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'access-control-allow-headers': 'Content-Type, Authorization, X-Agent-Id',
          'access-control-max-age': '86400'
        }
      });
    }

    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(req, env, url);
      } catch (err) {
        console.error('API error:', err);
        return json({ ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } }, 500);
      }
    }

    return json({ ok: false, error: { code: 'NOT_FOUND', message: 'Not found' } }, 404);
  }
};
