// Candidlabs API — Cloudflare Worker + D1
// RESTful CRUD for CRM (contacts, companies, deals), Projects (projects, tasks), and R&D (rnd_projects, rnd_documents, rnd_trial_entries, skus)

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, X-Agent-Id, X-Api-Key'
    }
  });
}

function generateId(prefix) {
  return prefix + '-' + Date.now().toString(16).slice(-6);
}

function validateApiKey(request, env) {
  const key = request.headers.get('X-Api-Key');
  if (!key || key !== env.GAS_API_KEY) {
    return json({ ok: false, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } }, 401);
  }
  return null;
}

// ============================================================
// Collection config — defines what tables exist and their rules
// ============================================================

const COLLECTIONS = {
  contacts: {
    table: 'contacts',
    prefix: 'CON',
    required: ['first_name'],
    columns: ['id', 'name', 'first_name', 'last_name', 'email', 'phone', 'role', 'company_id', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['name', 'first_name', 'last_name', 'email', 'role']
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
  },
  rnd_projects: {
    table: 'rnd_projects',
    prefix: 'RND',
    required: ['name'],
    columns: ['id', 'name', 'stage', 'owner', 'target_market', 'product_category',
              'priority', 'start_date', 'target_launch', 'gate_outcome', 'confidence_level',
              'current_score', 'gate_rationale', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['name', 'owner', 'target_market']
  },
  rnd_stage_history: {
    table: 'rnd_stage_history',
    prefix: 'STH',
    required: ['rnd_project_id', 'to_stage'],
    columns: ['id', 'rnd_project_id', 'from_stage', 'to_stage', 'changed_by', 'note', 'created_at'],
    searchable: []
  },
  rnd_approvals: {
    table: 'rnd_approvals',
    prefix: 'APR',
    required: ['rnd_project_id', 'stage'],
    columns: ['id', 'rnd_project_id', 'stage', 'approver', 'decision', 'comment', 'decided_at'],
    searchable: ['approver'],
    orderBy: 'decided_at'
  },
  rnd_documents: {
    table: 'rnd_documents',
    prefix: 'DOC',
    required: ['rnd_project_id', 'doc_type', 'title'],
    columns: ['id', 'rnd_project_id', 'doc_type', 'title', 'content', 'status',
              'author', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['title', 'author']
  },
  rnd_trial_entries: {
    table: 'rnd_trial_entries',
    prefix: 'TRL',
    required: ['rnd_document_id'],
    columns: ['id', 'rnd_document_id', 'trial_number', 'date', 'recipe', 'result',
              'tasting_notes', 'adjustments', 'meta', 'created_at', 'updated_at'],
    searchable: ['tasting_notes']
  },
  skus: {
    table: 'skus',
    prefix: 'SKU',
    required: ['sku_code', 'product_name'],
    columns: ['id', 'sku_code', 'product_name', 'variant', 'pack_size', 'status',
              'rnd_project_id', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['sku_code', 'product_name']
  },
  agreements: {
    table: 'agreements',
    prefix: 'AGR',
    required: ['account_name'],
    columns: ['id', 'agreement_key', 'account_name', 'contact_name', 'company_id',
              'agreement_date', 'start_date', 'end_date', 'agreement_type', 'status',
              'terms', 'notes', 'meta', 'created_at', 'updated_at'],
    searchable: ['account_name', 'contact_name', 'agreement_key'],
    orderBy: 'created_at'
  },
  jobs: {
    table: 'jobs',
    prefix: 'JOB',
    required: ['job_type'],
    columns: ['id', 'job_type', 'status', 'payload', 'result', 'error',
              'created_by', 'started_at', 'finished_at', 'created_at'],
    searchable: ['job_type', 'status'],
    orderBy: 'created_at'
  },
  job_logs: {
    table: 'job_logs',
    prefix: 'JLG',
    required: ['job_id', 'step'],
    columns: ['id', 'job_id', 'step', 'status', 'message', 'created_at'],
    searchable: ['job_id', 'step'],
    orderBy: 'created_at'
  },
  revenue_transactions: {
    table: 'revenue_transactions',
    prefix: 'RTX',
    required: ['transaction_id', 'invoice_date'],
    columns: ['id', 'transaction_id', 'invoice_date', 'invoice_number', 'distributor_name',
              'venue_name', 'account_id', 'sku_code', 'sku_name', 'quantity_cases',
              'quantity_cans', 'invoice_value_idr', 'revenue_idr', 'market', 'city',
              'channel', 'group_name', 'source', 'meta', 'created_at', 'updated_at'],
    searchable: ['venue_name', 'distributor_name', 'sku_name', 'invoice_number'],
    orderBy: 'invoice_date'
  },
  account_mapping: {
    table: 'account_mapping',
    prefix: 'AMP',
    required: ['raw_value'],
    columns: ['id', 'raw_value', 'internal_venue_name', 'account_id', 'group_name',
              'market', 'city', 'channel', 'active_flag', 'meta', 'created_at', 'updated_at'],
    searchable: ['raw_value', 'internal_venue_name', 'account_id', 'group_name'],
    orderBy: 'raw_value'
  },
  account_status: {
    table: 'account_status',
    prefix: 'AST',
    required: ['snapshot_date', 'venue_name'],
    columns: ['id', 'snapshot_date', 'venue_name', 'account_id', 'first_order_date',
              'latest_order_date', 'days_since_last', 'status', 'meta', 'created_at'],
    searchable: ['venue_name', 'account_id', 'status'],
    orderBy: 'snapshot_date'
  },
  deck_metrics: {
    table: 'deck_metrics',
    prefix: 'DKM',
    required: ['month_key'],
    columns: ['id', 'month_key', 'month_label', 'total_revenue_idr', 'gross_margin_pct',
              'gross_margin_vs_prev', 'dq_flag', 'headline', 'sales_performance',
              'channel_performance', 'meta', 'created_at', 'updated_at'],
    searchable: ['month_key', 'month_label'],
    orderBy: 'month_key'
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

  sql += ` ORDER BY ${cfg.orderBy || 'created_at'} DESC`;

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

  // Contacts: auto-compute name from first_name + last_name
  if (collection === 'contacts') {
    if ((body.first_name || body.last_name) && !body.name) {
      body.name = ((body.first_name || '') + ' ' + (body.last_name || '')).trim();
    }
  }

  // Agreements: dedup check on agreement_key, company_id verification, default status
  if (collection === 'agreements') {
    if (body.agreement_key) {
      const dup = await env.DB.prepare(
        'SELECT id FROM agreements WHERE agreement_key = ?'
      ).bind(body.agreement_key).first();
      if (dup) {
        return json({ ok: false, error: { code: 'DUPLICATE', message: `Agreement with key "${body.agreement_key}" already exists (${dup.id})` } }, 409);
      }
    }
    if (body.company_id) {
      const company = await env.DB.prepare('SELECT id FROM companies WHERE id = ?').bind(body.company_id).first();
      if (!company) {
        return json({ ok: false, error: { code: 'VALIDATION', message: `Company ${body.company_id} not found` } }, 400);
      }
    }
    if (!body.status) {
      body.status = 'draft';
    }
  }

  // Build insert from known columns only
  const record = { id };
  if (cfg.columns.includes('created_at')) record.created_at = now;
  if (cfg.columns.includes('updated_at')) record.updated_at = now;
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

  // Contacts: recompute name when first_name or last_name changes
  if (collection === 'contacts' && (body.first_name !== undefined || body.last_name !== undefined)) {
    const cur = await env.DB.prepare(`SELECT first_name, last_name FROM ${cfg.table} WHERE id = ?`).bind(id).first();
    const fn = body.first_name !== undefined ? body.first_name : (cur?.first_name || '');
    const ln = body.last_name !== undefined ? body.last_name : (cur?.last_name || '');
    body.name = (fn + ' ' + ln).trim();
  }

  // Agreements: status transition validation, company_id verification
  if (collection === 'agreements') {
    if (body.status !== undefined) {
      const cur = await env.DB.prepare('SELECT status FROM agreements WHERE id = ?').bind(id).first();
      const from = cur?.status || 'draft';
      const to = body.status;
      const VALID_TRANSITIONS = {
        draft: ['active', 'terminated'],
        active: ['expired', 'terminated'],
        expired: [],
        terminated: []
      };
      const allowed = VALID_TRANSITIONS[from] || [];
      if (from !== to && allowed.indexOf(to) === -1) {
        return json({ ok: false, error: { code: 'VALIDATION', message: `Invalid status transition: ${from} → ${to}` } }, 400);
      }
    }
    if (body.company_id !== undefined && body.company_id !== null && body.company_id !== '') {
      const company = await env.DB.prepare('SELECT id FROM companies WHERE id = ?').bind(body.company_id).first();
      if (!company) {
        return json({ ok: false, error: { code: 'VALIDATION', message: `Company ${body.company_id} not found` } }, 400);
      }
    }
  }

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

  // Cascade: if deleting an rnd_project, delete docs (and their trial entries) and unlink SKUs
  if (collection === 'rnd_projects') {
    // Get all docs for this project
    const { results: rndDocs } = await env.DB.prepare('SELECT id FROM rnd_documents WHERE rnd_project_id = ?').bind(id).all();
    for (const doc of rndDocs) {
      await env.DB.prepare('DELETE FROM rnd_trial_entries WHERE rnd_document_id = ?').bind(doc.id).run();
    }
    await env.DB.prepare('DELETE FROM rnd_documents WHERE rnd_project_id = ?').bind(id).run();
    await env.DB.prepare('UPDATE skus SET rnd_project_id = NULL WHERE rnd_project_id = ?').bind(id).run();
  }

  // Cascade: if deleting an rnd_document, delete its trial entries
  if (collection === 'rnd_documents') {
    await env.DB.prepare('DELETE FROM rnd_trial_entries WHERE rnd_document_id = ?').bind(id).run();
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
// Bulk Import
// ============================================================

async function bulkImport(req, env, collection) {
  const cfg = COLLECTIONS[collection];
  const body = await req.json().catch(() => ({}));
  const records = body.records;

  if (!Array.isArray(records) || records.length === 0) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'records array is required' } }, 400);
  }
  if (records.length > 500) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'Max 500 records per request' } }, 400);
  }

  const imported = [];
  const errors = [];
  const now = new Date().toISOString();
  const stmts = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const row = records[i];

      // Validate required fields
      for (const field of cfg.required) {
        if (!row[field] || String(row[field]).trim() === '') {
          throw new Error(`${field} is required`);
        }
      }

      // Contacts: auto-compute name from first_name + last_name
      if (collection === 'contacts') {
        if ((row.first_name || row.last_name) && !row.name) {
          row.name = ((row.first_name || '') + ' ' + (row.last_name || '')).trim();
        }
      }

      const id = generateId(cfg.prefix);
      const record = { id, created_at: now, updated_at: now };
      for (const col of cfg.columns) {
        if (col === 'id' || col === 'created_at' || col === 'updated_at') continue;
        if (row[col] !== undefined) {
          record[col] = row[col];
        }
      }

      const cols = Object.keys(record);
      const placeholders = cols.map(() => '?').join(', ');
      const values = cols.map(c => record[c]);

      stmts.push(env.DB.prepare(
        `INSERT INTO ${cfg.table} (${cols.join(', ')}) VALUES (${placeholders})`
      ).bind(...values));

      imported.push(record);
    } catch (err) {
      errors.push({ row: i + 1, error: err.message });
    }
  }

  // Execute in batches of 100 (D1 batch limit)
  for (let b = 0; b < stmts.length; b += 100) {
    const batch = stmts.slice(b, b + 100);
    await env.DB.batch(batch);
  }

  return json({
    ok: true,
    data: {
      imported: imported.length,
      skipped: 0,
      errors: errors,
      records: imported
    }
  }, 201);
}

// ============================================================
// Adapter invoke handler
// ============================================================

const ADAPTER_URL_MAP = {
  docgen: 'GAS_DOCGEN_URL',
  email: 'GAS_EMAIL_URL'
};

async function adapterInvoke(req, env, adapterType) {
  const gasEnvVar = ADAPTER_URL_MAP[adapterType];
  if (!gasEnvVar) {
    return json({ ok: false, error: { code: 'BAD_REQUEST', message: `Unknown adapter type: ${adapterType}` } }, 400);
  }

  const gasUrl = env[gasEnvVar];
  if (!gasUrl) {
    return json({ ok: false, error: { code: 'CONFIG_ERROR', message: `Adapter URL not configured for ${adapterType}` } }, 500);
  }

  const body = await req.json().catch(() => ({}));
  const now = new Date().toISOString();
  const jobId = generateId('JOB');

  // Create job record (status: running)
  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(jobId, adapterType, 'running', JSON.stringify(body), body.created_by || null, now, now).run();

  try {
    // GAS web apps cannot read HTTP headers — pass API key as query parameter
    const gasUrlWithKey = gasUrl + (gasUrl.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(env.GAS_API_KEY);
    const gasResponse = await fetch(gasUrlWithKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const resultText = await gasResponse.text();
    let result;
    try { result = JSON.parse(resultText); } catch { result = { raw: resultText }; }
    const finishedAt = new Date().toISOString();

    // Update job to completed
    await env.DB.prepare(
      'UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?'
    ).bind('completed', JSON.stringify(result), finishedAt, jobId).run();

    // Create job_log entry
    const logId = generateId('JLG');
    await env.DB.prepare(
      'INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(logId, jobId, 'invoke', 'completed', JSON.stringify(result), finishedAt).run();

    return json({ ok: true, job_id: jobId, result });
  } catch (err) {
    const finishedAt = new Date().toISOString();

    // Update job to failed
    await env.DB.prepare(
      'UPDATE jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?'
    ).bind('failed', err.message, finishedAt, jobId).run();

    // Create error job_log
    const logId = generateId('JLG');
    await env.DB.prepare(
      'INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(logId, jobId, 'invoke', 'failed', err.message, finishedAt).run();

    return json({ ok: false, error: { code: 'ADAPTER_ERROR', message: err.message }, job_id: jobId }, 502);
  }
}

// ============================================================
// Webhook receiver handler
// ============================================================

async function webhookReceive(req, env, webhookType) {
  const body = await req.json().catch(() => ({}));
  const { job_id, status, result } = body;

  if (!job_id) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'job_id is required' } }, 400);
  }

  const existing = await env.DB.prepare('SELECT id FROM jobs WHERE id = ?').bind(job_id).first();
  if (!existing) {
    return json({ ok: false, error: { code: 'NOT_FOUND', message: `Job ${job_id} not found` } }, 404);
  }

  const now = new Date().toISOString();

  // Update the job record
  await env.DB.prepare(
    'UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?'
  ).bind(status || 'completed', result ? JSON.stringify(result) : null, now, job_id).run();

  // Create a job_log entry recording the callback
  const logId = generateId('JLG');
  await env.DB.prepare(
    'INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(logId, job_id, `webhook_${webhookType}`, status || 'completed', result ? JSON.stringify(result) : null, now).run();

  return json({ ok: true });
}

// ============================================================
// Agreement actions — generate-doc, send-email
// ============================================================

async function agreementGenerateDoc(req, env, agreementId) {
  // Read the agreement record
  const agr = await env.DB.prepare('SELECT * FROM agreements WHERE id = ?').bind(agreementId).first();
  if (!agr) return json({ ok: false, error: { code: 'NOT_FOUND', message: `Agreement ${agreementId} not found` } }, 404);

  // Look up company name if linked
  let companyName = '';
  if (agr.company_id) {
    const company = await env.DB.prepare('SELECT name FROM companies WHERE id = ?').bind(agr.company_id).first();
    if (company) companyName = company.name;
  }

  // Build placeholder map for doc generation
  const payload = {
    action: 'generate',
    template: 'kaa_agreement',
    placeholders: {
      '<<ACCOUNT_NAME>>': agr.account_name || '',
      '<<CONTACT_NAME>>': agr.contact_name || '',
      '<<COMPANY_NAME>>': companyName,
      '<<AGREEMENT_DATE>>': agr.agreement_date || '',
      '<<START_DATE>>': agr.start_date || '',
      '<<END_DATE>>': agr.end_date || '',
      '<<AGREEMENT_TYPE>>': agr.agreement_type || '',
      '<<TERMS>>': agr.terms || '',
      '<<AGREEMENT_KEY>>': agr.agreement_key || ''
    },
    agreement_id: agreementId,
    created_by: req.headers.get('X-Agent-Id') || 'platform'
  };

  // Call the docgen adapter via internal invoke
  const gasUrl = env.GAS_DOCGEN_URL;
  if (!gasUrl) {
    return json({ ok: false, error: { code: 'CONFIG_ERROR', message: 'Doc generator URL not configured' } }, 500);
  }

  const now = new Date().toISOString();
  const jobId = generateId('JOB');

  // Create job record
  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(jobId, 'docgen', 'running', JSON.stringify(payload), payload.created_by, now, now).run();

  try {
    // GAS web apps cannot read HTTP headers — pass API key as query parameter
    const gasUrlWithKey = gasUrl + (gasUrl.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(env.GAS_API_KEY);
    const gasResponse = await fetch(gasUrlWithKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultText = await gasResponse.text();
    let result;
    try { result = JSON.parse(resultText); } catch { result = { raw: resultText }; }
    const finishedAt = new Date().toISOString();

    await env.DB.prepare(
      'UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?'
    ).bind('completed', JSON.stringify(result), finishedAt, jobId).run();

    const logId = generateId('JLG');
    await env.DB.prepare(
      'INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(logId, jobId, 'generate_doc', 'completed', JSON.stringify(result), finishedAt).run();

    return json({ ok: true, job_id: jobId, result });
  } catch (err) {
    const finishedAt = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?'
    ).bind('failed', err.message, finishedAt, jobId).run();

    const logId = generateId('JLG');
    await env.DB.prepare(
      'INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(logId, jobId, 'generate_doc', 'failed', err.message, finishedAt).run();

    return json({ ok: false, error: { code: 'ADAPTER_ERROR', message: err.message }, job_id: jobId }, 502);
  }
}

async function agreementSendEmail(req, env, agreementId) {
  // Read the agreement record
  const agr = await env.DB.prepare('SELECT * FROM agreements WHERE id = ?').bind(agreementId).first();
  if (!agr) return json({ ok: false, error: { code: 'NOT_FOUND', message: `Agreement ${agreementId} not found` } }, 404);

  // Look up contact email from linked contact (via contact_name or company contacts)
  let contactEmail = '';
  let contactName = agr.contact_name || '';
  if (agr.company_id) {
    const contact = await env.DB.prepare(
      'SELECT email, name FROM contacts WHERE company_id = ? LIMIT 1'
    ).bind(agr.company_id).first();
    if (contact) {
      contactEmail = contact.email || '';
      if (!contactName) contactName = contact.name || '';
    }
  }

  // Allow override from request body
  const body = await req.json().catch(() => ({}));
  if (body.to) contactEmail = body.to;
  if (body.contactName) contactName = body.contactName;

  if (!contactEmail) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'No contact email found. Link a company with contacts or provide "to" in request body.' } }, 400);
  }

  const payload = {
    action: 'send',
    to: contactEmail,
    subject: 'Your Agreement - ' + (agr.account_name || 'Agreement'),
    htmlBody: '<h2>Agreement Summary</h2>' +
      '<p><strong>Account:</strong> ' + (agr.account_name || '-') + '</p>' +
      '<p><strong>Type:</strong> ' + (agr.agreement_type || '-') + '</p>' +
      '<p><strong>Date:</strong> ' + (agr.agreement_date || '-') + '</p>' +
      '<p><strong>Start:</strong> ' + (agr.start_date || '-') + '</p>' +
      '<p><strong>End:</strong> ' + (agr.end_date || '-') + '</p>' +
      (agr.terms ? '<p><strong>Terms:</strong> ' + agr.terms + '</p>' : ''),
    agreement_id: agreementId,
    created_by: req.headers.get('X-Agent-Id') || 'platform'
  };

  const gasUrl = env.GAS_EMAIL_URL;
  if (!gasUrl) {
    return json({ ok: false, error: { code: 'CONFIG_ERROR', message: 'Email adapter URL not configured' } }, 500);
  }

  const now = new Date().toISOString();
  const jobId = generateId('JOB');

  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(jobId, 'email', 'running', JSON.stringify(payload), payload.created_by, now, now).run();

  try {
    // GAS web apps cannot read HTTP headers — pass API key as query parameter
    const gasUrlWithKey = gasUrl + (gasUrl.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(env.GAS_API_KEY);
    const gasResponse = await fetch(gasUrlWithKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const resultText = await gasResponse.text();
    let result;
    try { result = JSON.parse(resultText); } catch { result = { raw: resultText }; }
    const finishedAt = new Date().toISOString();

    await env.DB.prepare(
      'UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?'
    ).bind('completed', JSON.stringify(result), finishedAt, jobId).run();

    const logId = generateId('JLG');
    await env.DB.prepare(
      'INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(logId, jobId, 'send_email', 'completed', JSON.stringify(result), finishedAt).run();

    return json({ ok: true, job_id: jobId, result });
  } catch (err) {
    const finishedAt = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?'
    ).bind('failed', err.message, finishedAt, jobId).run();

    const logId = generateId('JLG');
    await env.DB.prepare(
      'INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).bind(logId, jobId, 'send_email', 'failed', err.message, finishedAt).run();

    return json({ ok: false, error: { code: 'ADAPTER_ERROR', message: err.message }, job_id: jobId }, 502);
  }
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

  // Agreement actions: POST /api/agreements/:id/generate-doc
  const agrDocMatch = path.match(/^\/api\/agreements\/([^/]+)\/generate-doc$/);
  if (agrDocMatch && req.method === 'POST') {
    return agreementGenerateDoc(req, env, agrDocMatch[1]);
  }

  // Agreement actions: POST /api/agreements/:id/send-email
  const agrEmailMatch = path.match(/^\/api\/agreements\/([^/]+)\/send-email$/);
  if (agrEmailMatch && req.method === 'POST') {
    return agreementSendEmail(req, env, agrEmailMatch[1]);
  }

  // Adapter invoke: POST /api/adapters/:type/invoke
  const adapterMatch = path.match(/^\/api\/adapters\/([^/]+)\/invoke$/);
  if (adapterMatch && req.method === 'POST') {
    const authError = validateApiKey(req, env);
    if (authError) return authError;
    return adapterInvoke(req, env, adapterMatch[1]);
  }

  // Webhook receiver: POST /api/webhook/:type
  const webhookMatch = path.match(/^\/api\/webhook\/([^/]+)$/);
  if (webhookMatch && req.method === 'POST') {
    const authError = validateApiKey(req, env);
    if (authError) return authError;
    return webhookReceive(req, env, webhookMatch[1]);
  }

  // Bulk import: /api/{collection}/import
  const importMatch = path.match(/^\/api\/(contacts|companies|deals|projects|tasks|rnd_projects|rnd_documents|rnd_trial_entries|rnd_stage_history|rnd_approvals|skus|agreements|jobs|job_logs|revenue_transactions|account_mapping|account_status|deck_metrics)\/import$/);
  if (importMatch && req.method === 'POST') return bulkImport(req, env, importMatch[1]);

  // CRUD routes: /api/{collection}[/{id}]
  const match = path.match(/^\/api\/(contacts|companies|deals|projects|tasks|rnd_projects|rnd_documents|rnd_trial_entries|rnd_stage_history|rnd_approvals|skus|agreements|jobs|job_logs|revenue_transactions|account_mapping|account_status|deck_metrics)(?:\/([^/]+))?$/);
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
          'access-control-allow-headers': 'Content-Type, Authorization, X-Agent-Id, X-Api-Key',
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
