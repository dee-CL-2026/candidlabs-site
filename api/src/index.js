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
  },
  sync_runs: {
    table: 'sync_runs',
    prefix: 'SYN',
    required: ['sync_type'],
    columns: ['id', 'sync_type', 'month_key', 'started_at', 'finished_at',
              'records_fetched', 'records_upserted', 'status', 'error', 'meta'],
    searchable: ['sync_type', 'status', 'month_key'],
    orderBy: 'started_at'
  },
  xero_invoices: {
    table: 'xero_invoices',
    prefix: 'XIV',
    required: ['xero_invoice_id', 'type', 'status'],
    columns: ['id', 'xero_invoice_id', 'invoice_number', 'type', 'status', 'contact_name',
              'xero_contact_id', 'invoice_date', 'due_date', 'currency_code', 'sub_total',
              'total_tax', 'total', 'amount_due', 'amount_paid', 'reference',
              'updated_date_utc', 'meta', 'synced_at'],
    searchable: ['invoice_number', 'contact_name', 'status'],
    orderBy: 'invoice_date'
  },
  xero_contacts: {
    table: 'xero_contacts',
    prefix: 'XCT',
    required: ['xero_contact_id', 'name'],
    columns: ['id', 'xero_contact_id', 'name', 'email', 'phone', 'is_customer',
              'is_supplier', 'contact_status', 'meta', 'synced_at'],
    searchable: ['name', 'email'],
    orderBy: 'name'
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
  email: 'GAS_EMAIL_URL',
  slides: 'GAS_SLIDES_URL'
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
// Sales pipeline endpoints (Wave 2)
// ============================================================

// POST /api/sales/import-receivables — replaces cleanReceivables + buildRevenueMaster
async function salesImportReceivables(req, env) {
  const body = await req.json().catch(() => ({}));
  const rows = body.rows || body.data || [];
  if (!Array.isArray(rows) || rows.length === 0) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'rows array is required' } }, 400);
  }

  const now = new Date().toISOString();
  const jobId = generateId('JOB');
  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(jobId, 'import_receivables', 'running', JSON.stringify({ row_count: rows.length }), body.created_by || 'platform', now, now).run();

  let imported = 0;
  let skipped = 0;
  const errors = [];

  for (const row of rows) {
    try {
      const txnId = row.transaction_id || row.TransactionID || `${row.invoice_number || ''}-${row.venue_name || ''}-${row.sku_code || ''}-${row.invoice_date || ''}`;
      if (!txnId || !row.invoice_date) {
        skipped++;
        continue;
      }

      // Look up account mapping for venue enrichment
      let accountId = row.account_id || null;
      let market = row.market || null;
      let city = row.city || null;
      let channel = row.channel || null;
      let groupName = row.group_name || null;

      if (row.venue_name && !accountId) {
        const mapping = await env.DB.prepare(
          'SELECT account_id, market, city, channel, group_name FROM account_mapping WHERE raw_value = ? OR internal_venue_name = ?'
        ).bind(row.venue_name, row.venue_name).first();
        if (mapping) {
          accountId = mapping.account_id;
          market = market || mapping.market;
          city = city || mapping.city;
          channel = channel || mapping.channel;
          groupName = groupName || mapping.group_name;
        }
      }

      const id = generateId('RTX');
      await env.DB.prepare(
        `INSERT OR REPLACE INTO revenue_transactions
         (id, transaction_id, invoice_date, invoice_number, distributor_name, venue_name,
          account_id, sku_code, sku_name, quantity_cases, quantity_cans,
          invoice_value_idr, revenue_idr, market, city, channel, group_name, source,
          meta, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, txnId, row.invoice_date, row.invoice_number || null,
        row.distributor_name || null, row.venue_name || null,
        accountId, row.sku_code || null, row.sku_name || null,
        row.quantity_cases || null, row.quantity_cans || null,
        row.invoice_value_idr || null, row.revenue_idr || row.invoice_value_idr || null,
        market, city, channel, groupName,
        row.source || 'xero', JSON.stringify(row.meta || {}), now, now
      ).run();
      imported++;
    } catch (err) {
      errors.push({ row: row.transaction_id || row.invoice_number, error: err.message });
      skipped++;
    }
  }

  const finishedAt = new Date().toISOString();
  const result = { imported, skipped, errors: errors.slice(0, 10), total: rows.length };
  await env.DB.prepare('UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?')
    .bind('completed', JSON.stringify(result), finishedAt, jobId).run();
  const logId = generateId('JLG');
  await env.DB.prepare('INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(logId, jobId, 'import_receivables', 'completed', JSON.stringify(result), finishedAt).run();

  return json({ ok: true, job_id: jobId, result });
}

// POST /api/sales/refresh-margins — replaces margin.js DQ-gated calculation
async function salesRefreshMargins(req, env) {
  const body = await req.json().catch(() => ({}));
  const monthKey = body.month_key || new Date().toISOString().slice(0, 7);

  const now = new Date().toISOString();
  const jobId = generateId('JOB');
  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(jobId, 'refresh_margins', 'running', JSON.stringify({ month_key: monthKey }), body.created_by || 'platform', now, now).run();

  try {
    // Get revenue for the month
    const { results: txns } = await env.DB.prepare(
      "SELECT sku_code, SUM(revenue_idr) as total_revenue, SUM(quantity_cases) as total_cases FROM revenue_transactions WHERE invoice_date LIKE ? GROUP BY sku_code"
    ).bind(monthKey + '%').all();

    if (txns.length === 0) {
      const result = { month_key: monthKey, status: 'no_data', message: 'No transactions found for this month' };
      const finishedAt = new Date().toISOString();
      await env.DB.prepare('UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?')
        .bind('completed', JSON.stringify(result), finishedAt, jobId).run();
      return json({ ok: true, job_id: jobId, result });
    }

    // Compute totals
    let totalRevenue = 0;
    let matchedRevenue = 0;
    let totalCogs = 0;

    for (const txn of txns) {
      totalRevenue += txn.total_revenue || 0;
      // Attempt cost lookup from sku_costing (Wave 3 dependency — graceful fallback)
      if (txn.sku_code) {
        const cost = await env.DB.prepare('SELECT unit_cost FROM sku_costing WHERE sku_code = ?')
          .bind(txn.sku_code).first().catch(() => null);
        if (cost && cost.unit_cost) {
          totalCogs += cost.unit_cost * (txn.total_cases || 0);
          matchedRevenue += txn.total_revenue || 0;
        }
      }
    }

    // DQ gate: require 98% coverage for valid margin
    const coverage = totalRevenue > 0 ? matchedRevenue / totalRevenue : 0;
    const dqPass = coverage >= 0.98;
    const grossMarginPct = totalRevenue > 0 && dqPass
      ? ((totalRevenue - totalCogs) / totalRevenue * 100).toFixed(2)
      : null;

    // Get previous month for comparison
    const [year, month] = monthKey.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMetric = await env.DB.prepare('SELECT gross_margin_pct FROM deck_metrics WHERE month_key = ?')
      .bind(prevKey).first();
    const prevMargin = prevMetric ? prevMetric.gross_margin_pct : null;
    const marginVsPrev = grossMarginPct && prevMargin
      ? (parseFloat(grossMarginPct) - prevMargin).toFixed(2) + 'pp'
      : null;

    // Upsert deck_metrics for this month
    const existing = await env.DB.prepare('SELECT id FROM deck_metrics WHERE month_key = ?').bind(monthKey).first();
    if (existing) {
      await env.DB.prepare(
        'UPDATE deck_metrics SET total_revenue_idr = ?, gross_margin_pct = ?, gross_margin_vs_prev = ?, dq_flag = ?, updated_at = ? WHERE month_key = ?'
      ).bind(totalRevenue, grossMarginPct ? parseFloat(grossMarginPct) : null, marginVsPrev, dqPass ? 'PASS' : 'FAIL', now, monthKey).run();
    } else {
      const dkmId = generateId('DKM');
      const monthLabel = prevDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long' }).replace(/.*,/, monthKey);
      await env.DB.prepare(
        'INSERT INTO deck_metrics (id, month_key, month_label, total_revenue_idr, gross_margin_pct, gross_margin_vs_prev, dq_flag, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(dkmId, monthKey, monthKey, totalRevenue, grossMarginPct ? parseFloat(grossMarginPct) : null, marginVsPrev, dqPass ? 'PASS' : 'FAIL', now, now).run();
    }

    const result = {
      month_key: monthKey, total_revenue: totalRevenue, total_cogs: totalCogs,
      gross_margin_pct: grossMarginPct, dq_coverage: (coverage * 100).toFixed(1) + '%',
      dq_flag: dqPass ? 'PASS' : 'FAIL', margin_vs_prev: marginVsPrev, sku_count: txns.length
    };
    const finishedAt = new Date().toISOString();
    await env.DB.prepare('UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?')
      .bind('completed', JSON.stringify(result), finishedAt, jobId).run();
    const logId = generateId('JLG');
    await env.DB.prepare('INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(logId, jobId, 'refresh_margins', 'completed', JSON.stringify(result), finishedAt).run();

    return json({ ok: true, job_id: jobId, result });
  } catch (err) {
    const finishedAt = new Date().toISOString();
    await env.DB.prepare('UPDATE jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?')
      .bind('failed', err.message, finishedAt, jobId).run();
    return json({ ok: false, error: { code: 'COMPUTATION_ERROR', message: err.message }, job_id: jobId }, 500);
  }
}

// POST /api/sales/refresh-deck-metrics — replaces Deck_Metrics_Wrapper orchestration
async function salesRefreshDeckMetrics(req, env) {
  const body = await req.json().catch(() => ({}));
  const monthKey = body.month_key || new Date().toISOString().slice(0, 7);

  const now = new Date().toISOString();

  // Get or create deck_metrics row
  let metric = await env.DB.prepare('SELECT * FROM deck_metrics WHERE month_key = ?').bind(monthKey).first();
  if (!metric) {
    const dkmId = generateId('DKM');
    await env.DB.prepare(
      'INSERT INTO deck_metrics (id, month_key, month_label, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(dkmId, monthKey, monthKey, now, now).run();
    metric = await env.DB.prepare('SELECT * FROM deck_metrics WHERE month_key = ?').bind(monthKey).first();
  }

  // Aggregate revenue by month
  const revRow = await env.DB.prepare(
    "SELECT SUM(revenue_idr) as total FROM revenue_transactions WHERE invoice_date LIKE ?"
  ).bind(monthKey + '%').first();
  const totalRevenue = revRow ? revRow.total || 0 : 0;

  // Headline MoM: compare with previous month
  const [year, month] = monthKey.split('-').map(Number);
  const prevDate = new Date(year, month - 2, 1);
  const prevKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
  const prevRevRow = await env.DB.prepare(
    "SELECT SUM(revenue_idr) as total FROM revenue_transactions WHERE invoice_date LIKE ?"
  ).bind(prevKey + '%').first();
  const prevRevenue = prevRevRow ? prevRevRow.total || 0 : 0;
  const momChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : null;
  const headline = momChange !== null
    ? `Revenue ${parseFloat(momChange) >= 0 ? 'up' : 'down'} ${Math.abs(parseFloat(momChange))}% MoM`
    : `Revenue: IDR ${(totalRevenue / 1e6).toFixed(1)}M`;

  // Sales performance: top 5 accounts by revenue
  const { results: topAccounts } = await env.DB.prepare(
    "SELECT venue_name, SUM(revenue_idr) as rev FROM revenue_transactions WHERE invoice_date LIKE ? AND venue_name IS NOT NULL GROUP BY venue_name ORDER BY rev DESC LIMIT 5"
  ).bind(monthKey + '%').all();
  const salesPerformance = JSON.stringify(topAccounts.map(a => ({ venue: a.venue_name, revenue: a.rev })));

  // Channel performance MoM
  const { results: channels } = await env.DB.prepare(
    "SELECT channel, SUM(revenue_idr) as rev FROM revenue_transactions WHERE invoice_date LIKE ? AND channel IS NOT NULL GROUP BY channel"
  ).bind(monthKey + '%').all();
  const channelPerformance = JSON.stringify(channels.map(c => ({ channel: c.channel, revenue: c.rev })));

  // Update deck_metrics
  await env.DB.prepare(
    'UPDATE deck_metrics SET total_revenue_idr = ?, headline = ?, sales_performance = ?, channel_performance = ?, updated_at = ? WHERE month_key = ?'
  ).bind(totalRevenue, headline, salesPerformance, channelPerformance, now, monthKey).run();

  return json({
    ok: true,
    data: { month_key: monthKey, total_revenue_idr: totalRevenue, headline, mom_change: momChange,
            top_accounts: topAccounts.length, channels: channels.length }
  });
}

// POST /api/sales/rebuild-account-status — replaces account_status.js
async function salesRebuildAccountStatus(req, env) {
  const body = await req.json().catch(() => ({}));
  const snapshotDate = body.snapshot_date || new Date().toISOString().slice(0, 10);

  const now = new Date().toISOString();
  const jobId = generateId('JOB');
  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(jobId, 'rebuild_account_status', 'running', JSON.stringify({ snapshot_date: snapshotDate }), body.created_by || 'platform', now, now).run();

  try {
    // Get first and latest order per venue
    const { results: accounts } = await env.DB.prepare(
      `SELECT venue_name, account_id,
              MIN(invoice_date) as first_order, MAX(invoice_date) as latest_order
       FROM revenue_transactions
       WHERE venue_name IS NOT NULL
       GROUP BY venue_name`
    ).all();

    // Delete existing snapshot for this date
    await env.DB.prepare('DELETE FROM account_status WHERE snapshot_date = ?').bind(snapshotDate).run();

    let processed = 0;
    for (const acct of accounts) {
      const daysSince = Math.floor((new Date(snapshotDate) - new Date(acct.latest_order)) / 86400000);
      let status = 'Active';
      if (daysSince > 90) status = 'Dormant';
      else if (daysSince > 60) status = 'At Risk';

      // Check if first order is within last 90 days
      const daysSinceFirst = Math.floor((new Date(snapshotDate) - new Date(acct.first_order)) / 86400000);
      if (daysSinceFirst <= 90) status = 'New';

      const id = generateId('AST');
      await env.DB.prepare(
        'INSERT INTO account_status (id, snapshot_date, venue_name, account_id, first_order_date, latest_order_date, days_since_last, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, snapshotDate, acct.venue_name, acct.account_id, acct.first_order, acct.latest_order, daysSince, status, now).run();
      processed++;
    }

    const result = { snapshot_date: snapshotDate, accounts_processed: processed };
    const finishedAt = new Date().toISOString();
    await env.DB.prepare('UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?')
      .bind('completed', JSON.stringify(result), finishedAt, jobId).run();
    const logId = generateId('JLG');
    await env.DB.prepare('INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(logId, jobId, 'rebuild_account_status', 'completed', JSON.stringify(result), finishedAt).run();

    return json({ ok: true, job_id: jobId, result });
  } catch (err) {
    const finishedAt = new Date().toISOString();
    await env.DB.prepare('UPDATE jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?')
      .bind('failed', err.message, finishedAt, jobId).run();
    return json({ ok: false, error: { code: 'COMPUTATION_ERROR', message: err.message }, job_id: jobId }, 500);
  }
}

// POST /api/sales/sync-mapping — replaces mapping_sync.js + tracking_enrichment.js
async function salesSyncMapping(req, env) {
  const body = await req.json().catch(() => ({}));
  const mappings = body.mappings || body.rows || [];
  if (!Array.isArray(mappings) || mappings.length === 0) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'mappings array is required' } }, 400);
  }

  const now = new Date().toISOString();
  let upserted = 0;
  let enriched = 0;

  for (const m of mappings) {
    if (!m.raw_value) continue;

    // Generate account_id if missing
    const accountId = m.account_id || ('ACC-' + m.raw_value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toUpperCase());

    // Upsert account_mapping
    const existing = await env.DB.prepare('SELECT id FROM account_mapping WHERE raw_value = ?').bind(m.raw_value).first();
    if (existing) {
      await env.DB.prepare(
        'UPDATE account_mapping SET internal_venue_name = ?, account_id = ?, group_name = ?, market = ?, city = ?, channel = ?, active_flag = ?, updated_at = ? WHERE raw_value = ?'
      ).bind(m.internal_venue_name || m.raw_value, accountId, m.group_name || null, m.market || null, m.city || null, m.channel || null, m.active_flag || 'Active', now, m.raw_value).run();
    } else {
      const id = generateId('AMP');
      await env.DB.prepare(
        'INSERT INTO account_mapping (id, raw_value, internal_venue_name, account_id, group_name, market, city, channel, active_flag, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, m.raw_value, m.internal_venue_name || m.raw_value, accountId, m.group_name || null, m.market || null, m.city || null, m.channel || null, m.active_flag || 'Active', now, now).run();
    }
    upserted++;

    // Enrich existing revenue_transactions that match this venue
    const { meta: updateMeta } = await env.DB.prepare(
      'UPDATE revenue_transactions SET account_id = ?, market = ?, city = ?, channel = ?, group_name = ?, updated_at = ? WHERE (venue_name = ? OR venue_name = ?) AND account_id IS NULL'
    ).bind(accountId, m.market || null, m.city || null, m.channel || null, m.group_name || null, now, m.raw_value, m.internal_venue_name || m.raw_value).run();
    enriched += updateMeta ? updateMeta.changes || 0 : 0;
  }

  return json({ ok: true, data: { mappings_upserted: upserted, transactions_enriched: enriched } });
}

// POST /api/sales/bridge-crm — replaces CRM.js syncCrmFromConfigMapping
async function salesBridgeCrm(req, env) {
  const now = new Date().toISOString();

  // Read all active account mappings
  const { results: mappings } = await env.DB.prepare(
    "SELECT DISTINCT account_id, internal_venue_name, group_name, market, city, channel FROM account_mapping WHERE active_flag = 'Active' AND account_id IS NOT NULL"
  ).all();

  let companiesCreated = 0;
  let companiesUpdated = 0;

  for (const m of mappings) {
    const companyName = m.internal_venue_name || m.account_id;

    // Check if company already exists (by name match)
    const existing = await env.DB.prepare('SELECT id FROM companies WHERE name = ?').bind(companyName).first();
    if (existing) {
      await env.DB.prepare(
        'UPDATE companies SET market = ?, channel = ?, updated_at = ? WHERE id = ?'
      ).bind(m.market || null, m.channel || null, now, existing.id).run();
      companiesUpdated++;
    } else {
      const id = generateId('CMP');
      await env.DB.prepare(
        'INSERT INTO companies (id, name, type, market, channel, status, meta, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, companyName, 'venue', m.market || null, m.channel || null, 'active', JSON.stringify({ account_id: m.account_id, group_name: m.group_name, city: m.city }), now, now).run();
      companiesCreated++;
    }
  }

  return json({ ok: true, data: { companies_created: companiesCreated, companies_updated: companiesUpdated, mappings_processed: mappings.length } });
}

// POST /api/sales/run-pipeline — orchestration: import → margins → deck metrics
async function salesRunPipeline(req, env) {
  const body = await req.json().catch(() => ({}));
  const monthKey = body.month_key;
  if (!monthKey) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'month_key is required' } }, 400);
  }
  if (!body.rows && !body.data) {
    return json({ ok: false, error: { code: 'VALIDATION', message: 'rows/data array is required for import' } }, 400);
  }

  const now = new Date().toISOString();
  const pipelineJobId = generateId('JOB');
  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(pipelineJobId, 'sales_pipeline', 'running', JSON.stringify({ month_key: monthKey, row_count: (body.rows || body.data || []).length }), body.created_by || 'platform', now, now).run();

  const steps = [];
  try {
    // Step 1: Import receivables
    const importReq = new Request('http://internal/api/sales/import-receivables', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: body.rows || body.data, created_by: body.created_by })
    });
    const importRes = await salesImportReceivables(importReq, env);
    const importData = await importRes.json();
    steps.push({ step: 'import_receivables', status: importData.ok ? 'completed' : 'failed', result: importData.result || importData.error });
    const logId1 = generateId('JLG');
    await env.DB.prepare('INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(logId1, pipelineJobId, 'import_receivables', importData.ok ? 'completed' : 'failed', JSON.stringify(importData.result || importData.error), new Date().toISOString()).run();
    if (!importData.ok) throw new Error('Import failed: ' + JSON.stringify(importData.error));

    // Step 2: Refresh margins
    const marginReq = new Request('http://internal/api/sales/refresh-margins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month_key: monthKey, created_by: body.created_by })
    });
    const marginRes = await salesRefreshMargins(marginReq, env);
    const marginData = await marginRes.json();
    steps.push({ step: 'refresh_margins', status: marginData.ok ? 'completed' : 'failed', result: marginData.result || marginData.error });
    const logId2 = generateId('JLG');
    await env.DB.prepare('INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(logId2, pipelineJobId, 'refresh_margins', marginData.ok ? 'completed' : 'failed', JSON.stringify(marginData.result || marginData.error), new Date().toISOString()).run();
    if (!marginData.ok) throw new Error('Margin refresh failed: ' + JSON.stringify(marginData.error));

    // Step 3: Refresh deck metrics
    const deckReq = new Request('http://internal/api/sales/refresh-deck-metrics', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month_key: monthKey })
    });
    const deckRes = await salesRefreshDeckMetrics(deckReq, env);
    const deckData = await deckRes.json();
    steps.push({ step: 'refresh_deck_metrics', status: deckData.ok ? 'completed' : 'failed', result: deckData.data || deckData.error });
    const logId3 = generateId('JLG');
    await env.DB.prepare('INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(logId3, pipelineJobId, 'refresh_deck_metrics', deckData.ok ? 'completed' : 'failed', JSON.stringify(deckData.data || deckData.error), new Date().toISOString()).run();

    const finishedAt = new Date().toISOString();
    const pipelineResult = { month_key: monthKey, steps, status: 'completed' };
    await env.DB.prepare('UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?')
      .bind('completed', JSON.stringify(pipelineResult), finishedAt, pipelineJobId).run();

    return json({ ok: true, job_id: pipelineJobId, result: pipelineResult });
  } catch (err) {
    const finishedAt = new Date().toISOString();
    await env.DB.prepare('UPDATE jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?')
      .bind('failed', err.message, finishedAt, pipelineJobId).run();
    return json({ ok: false, error: { code: 'PIPELINE_ERROR', message: err.message }, job_id: pipelineJobId, steps }, 500);
  }
}

// ============================================================
// Xero OAuth + Sync helpers
// ============================================================

async function getXeroAccessToken(env) {
  const row = await env.DB.prepare("SELECT * FROM xero_tokens WHERE id = 'default'").first();
  if (!row) return null;

  // Check if token is still valid (with 60s buffer)
  const expiresAt = new Date(row.expires_at).getTime();
  if (Date.now() < expiresAt - 60000) {
    return { access_token: row.access_token, tenant_id: row.tenant_id };
  }

  // Refresh the token
  const resp = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: row.refresh_token,
      client_id: env.XERO_CLIENT_ID,
      client_secret: env.XERO_CLIENT_SECRET
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    throw new Error('Xero token refresh failed: ' + errText);
  }

  const tokens = await resp.json();
  const newExpiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const now = new Date().toISOString();

  await env.DB.prepare(
    "UPDATE xero_tokens SET access_token = ?, refresh_token = ?, expires_at = ?, updated_at = ? WHERE id = 'default'"
  ).bind(tokens.access_token, tokens.refresh_token, newExpiresAt, now).run();

  return { access_token: tokens.access_token, tenant_id: row.tenant_id };
}

// GET /api/auth/xero/start — redirect to Xero authorize
async function xeroAuthStart(req, env) {
  const redirectUri = env.XERO_REDIRECT_URI;
  const scopes = env.XERO_SCOPES;
  const state = crypto.randomUUID();
  const url = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${encodeURIComponent(env.XERO_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
  return new Response(null, { status: 302, headers: { Location: url } });
}

// GET /api/auth/xero/callback — exchange code for tokens
async function xeroAuthCallback(req, env, url) {
  const code = url.searchParams.get('code');
  if (!code) return json({ ok: false, error: { code: 'BAD_REQUEST', message: 'Missing code parameter' } }, 400);

  // Exchange code for tokens
  const resp = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.XERO_REDIRECT_URI,
      client_id: env.XERO_CLIENT_ID,
      client_secret: env.XERO_CLIENT_SECRET
    })
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return json({ ok: false, error: { code: 'XERO_AUTH_ERROR', message: errText } }, 502);
  }

  const tokens = await resp.json();
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
  const now = new Date().toISOString();

  // Get tenant ID from /connections
  const connResp = await fetch('https://api.xero.com/connections', {
    headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' }
  });
  const connections = await connResp.json();
  if (!connections.length) {
    return json({ ok: false, error: { code: 'XERO_NO_TENANT', message: 'No Xero tenants found' } }, 400);
  }
  const tenantId = connections[0].tenantId;

  // Upsert token row
  await env.DB.prepare(
    `INSERT INTO xero_tokens (id, tenant_id, access_token, refresh_token, token_type, expires_at, scopes, connected_at, updated_at)
     VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET tenant_id=excluded.tenant_id, access_token=excluded.access_token,
       refresh_token=excluded.refresh_token, expires_at=excluded.expires_at, scopes=excluded.scopes, updated_at=excluded.updated_at`
  ).bind(tenantId, tokens.access_token, tokens.refresh_token, tokens.token_type || 'Bearer',
         expiresAt, env.XERO_SCOPES, now, now).run();

  // Redirect to app
  const appBase = env.APP_BASE_URL || 'https://candidlabs.pages.dev';
  return new Response(null, { status: 302, headers: { Location: `${appBase}/sales/?xero=connected` } });
}

// GET /api/auth/xero/status
async function xeroAuthStatus(env) {
  const row = await env.DB.prepare("SELECT tenant_id, expires_at, connected_at, updated_at, scopes FROM xero_tokens WHERE id = 'default'").first();
  if (!row) return json({ ok: true, connected: false });
  const expired = new Date(row.expires_at).getTime() < Date.now();
  return json({ ok: true, connected: true, tenant_id: row.tenant_id, token_expired: expired,
    expires_at: row.expires_at, connected_at: row.connected_at, updated_at: row.updated_at });
}

// POST /api/auth/xero/disconnect
async function xeroAuthDisconnect(env) {
  await env.DB.prepare("DELETE FROM xero_tokens WHERE id = 'default'").run();
  return json({ ok: true, message: 'Xero disconnected' });
}

// Core sync: fetch invoices for a single month from Xero and upsert
async function xeroSyncMonth(env, monthKey) {
  const syncId = generateId('SYN');
  const now = new Date().toISOString();
  await env.DB.prepare(
    'INSERT INTO sync_runs (id, sync_type, month_key, started_at, status) VALUES (?, ?, ?, ?, ?)'
  ).bind(syncId, 'xero_invoices', monthKey, now, 'running').run();

  try {
    const tokenData = await getXeroAccessToken(env);
    if (!tokenData) throw new Error('Xero not connected — no tokens found');

    const { access_token, tenant_id } = tokenData;
    const [year, month] = monthKey.split('-').map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;

    let page = 1;
    let allInvoices = [];
    const whereClause = `Type=="ACCREC" AND Date >= DateTime(${year},${month},1) AND Date < DateTime(${nextYear},${nextMonth},1)`;

    // Paginate invoices
    while (true) {
      const apiUrl = `https://api.xero.com/api.xro/2.0/Invoices?where=${encodeURIComponent(whereClause)}&page=${page}`;
      const resp = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Xero-Tenant-Id': tenant_id,
          Accept: 'application/json'
        }
      });
      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Xero API error (${resp.status}): ${errText}`);
      }
      const data = await resp.json();
      const invoices = data.Invoices || [];
      if (invoices.length === 0) break;
      allInvoices = allInvoices.concat(invoices);
      if (invoices.length < 100) break; // Xero returns up to 100 per page
      page++;
    }

    // Also fetch contacts for this org
    let allContacts = [];
    let contactPage = 1;
    while (true) {
      const contactUrl = `https://api.xero.com/api.xro/2.0/Contacts?page=${contactPage}`;
      const resp = await fetch(contactUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          'Xero-Tenant-Id': tenant_id,
          Accept: 'application/json'
        }
      });
      if (!resp.ok) break; // Non-critical — continue with invoices
      const data = await resp.json();
      const contacts = data.Contacts || [];
      if (contacts.length === 0) break;
      allContacts = allContacts.concat(contacts);
      if (contacts.length < 100) break;
      contactPage++;
    }

    // Upsert contacts
    for (const c of allContacts) {
      const cId = generateId('XCT');
      await env.DB.prepare(
        `INSERT INTO xero_contacts (id, xero_contact_id, name, email, phone, is_customer, is_supplier, contact_status, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(xero_contact_id) DO UPDATE SET name=excluded.name, email=excluded.email, phone=excluded.phone,
           is_customer=excluded.is_customer, is_supplier=excluded.is_supplier, contact_status=excluded.contact_status, synced_at=excluded.synced_at`
      ).bind(cId, c.ContactID, c.Name || '', c.EmailAddress || null,
             (c.Phones && c.Phones[0] ? c.Phones[0].PhoneNumber : null),
             c.IsCustomer ? 1 : 0, c.IsSupplier ? 1 : 0, c.ContactStatus || null, now).run();
    }

    let recordsUpserted = 0;

    // Upsert invoices + line items + revenue_transactions
    for (const inv of allInvoices) {
      const invId = generateId('XIV');
      await env.DB.prepare(
        `INSERT INTO xero_invoices (id, xero_invoice_id, invoice_number, type, status, contact_name, xero_contact_id,
           invoice_date, due_date, currency_code, sub_total, total_tax, total, amount_due, amount_paid,
           reference, updated_date_utc, synced_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(xero_invoice_id) DO UPDATE SET invoice_number=excluded.invoice_number, status=excluded.status,
           contact_name=excluded.contact_name, sub_total=excluded.sub_total, total_tax=excluded.total_tax,
           total=excluded.total, amount_due=excluded.amount_due, amount_paid=excluded.amount_paid,
           reference=excluded.reference, updated_date_utc=excluded.updated_date_utc, synced_at=excluded.synced_at`
      ).bind(invId, inv.InvoiceID, inv.InvoiceNumber || null, inv.Type, inv.Status,
             inv.Contact ? inv.Contact.Name : null, inv.Contact ? inv.Contact.ContactID : null,
             inv.DateString || null, inv.DueDateString || null, inv.CurrencyCode || 'IDR',
             inv.SubTotal || 0, inv.TotalTax || 0, inv.Total || 0, inv.AmountDue || 0, inv.AmountPaid || 0,
             inv.Reference || null, inv.UpdatedDateUTC || null, now).run();

      // Replace line items for this invoice
      const lines = inv.LineItems || [];
      await env.DB.prepare('DELETE FROM xero_line_items WHERE xero_invoice_id = ?').bind(inv.InvoiceID).run();
      for (const li of lines) {
        const liId = generateId('XLI');
        await env.DB.prepare(
          `INSERT INTO xero_line_items (id, xero_invoice_id, item_code, description, quantity, unit_amount,
             tax_amount, line_amount, discount_rate, account_code, tax_type, tracking, synced_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(liId, inv.InvoiceID, li.ItemCode || null, li.Description || null,
               li.Quantity || 0, li.UnitAmount || 0, li.TaxAmount || 0, li.LineAmount || 0,
               li.DiscountRate || 0, li.AccountCode || null, li.TaxType || null,
               JSON.stringify(li.Tracking || []), now).run();
      }

      // Transform ACCREC invoice → revenue_transaction (bridges Xero → sales pipeline)
      if (inv.Type === 'ACCREC' && inv.Status !== 'VOIDED' && inv.Status !== 'DELETED') {
        const txId = generateId('RTX');
        const transactionId = `XERO-${inv.InvoiceNumber || inv.InvoiceID}`;
        await env.DB.prepare(
          `INSERT INTO revenue_transactions (id, transaction_id, invoice_date, invoice_number, distributor_name,
             venue_name, invoice_value_idr, revenue_idr, source, meta, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(transaction_id) DO UPDATE SET invoice_date=excluded.invoice_date,
             invoice_value_idr=excluded.invoice_value_idr, revenue_idr=excluded.revenue_idr,
             source=excluded.source, updated_at=excluded.updated_at`
        ).bind(txId, transactionId, inv.DateString || monthKey + '-01', inv.InvoiceNumber || null,
               null, inv.Contact ? inv.Contact.Name : null,
               inv.Total || 0, inv.Total || 0, 'xero',
               JSON.stringify({ xero_invoice_id: inv.InvoiceID, xero_status: inv.Status }),
               now, now).run();
        recordsUpserted++;
      }
    }

    const finishedAt = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE sync_runs SET status = ?, finished_at = ?, records_fetched = ?, records_upserted = ? WHERE id = ?'
    ).bind('completed', finishedAt, allInvoices.length, recordsUpserted, syncId).run();

    return { ok: true, sync_id: syncId, month_key: monthKey, invoices_fetched: allInvoices.length,
             contacts_fetched: allContacts.length, revenue_transactions_upserted: recordsUpserted };
  } catch (err) {
    const finishedAt = new Date().toISOString();
    await env.DB.prepare(
      'UPDATE sync_runs SET status = ?, finished_at = ?, error = ? WHERE id = ?'
    ).bind('failed', finishedAt, err.message, syncId).run();
    throw err;
  }
}

// POST /api/sales/sync-xero — sync single month (defaults to current)
async function xeroSyncHandler(req, env, url) {
  const monthKey = url.searchParams.get('month_key') || new Date().toISOString().slice(0, 7);
  try {
    const result = await xeroSyncMonth(env, monthKey);
    return json(result);
  } catch (err) {
    return json({ ok: false, error: { code: 'SYNC_ERROR', message: err.message } }, 500);
  }
}

// POST /api/sales/sync-xero/backfill — range sync
async function xeroBackfillHandler(req, env, url) {
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (!from || !to) return json({ ok: false, error: { code: 'VALIDATION', message: 'from and to query params required (YYYY-MM)' } }, 400);

  const results = [];
  const [fromY, fromM] = from.split('-').map(Number);
  const [toY, toM] = to.split('-').map(Number);
  let y = fromY, m = fromM;

  while (y < toY || (y === toY && m <= toM)) {
    const mk = `${y}-${String(m).padStart(2, '0')}`;
    try {
      const result = await xeroSyncMonth(env, mk);
      results.push(result);
    } catch (err) {
      results.push({ ok: false, month_key: mk, error: err.message });
    }
    m++;
    if (m > 12) { m = 1; y++; }
  }

  return json({ ok: true, backfill: { from, to, months: results.length }, results });
}

// POST /api/deck-metrics/:monthKey/generate-deck — slides adapter
async function deckMetricsGenerateDeck(req, env, monthKey) {
  const metric = await env.DB.prepare('SELECT * FROM deck_metrics WHERE month_key = ?').bind(monthKey).first();
  if (!metric) return json({ ok: false, error: { code: 'NOT_FOUND', message: `No deck metrics for ${monthKey}` } }, 404);

  const gasUrl = env.GAS_SLIDES_URL;
  if (!gasUrl) {
    return json({ ok: false, error: { code: 'CONFIG_ERROR', message: 'Slides adapter URL not configured' } }, 500);
  }

  // Build 22 placeholders from deck_metrics
  const meta = JSON.parse(metric.meta || '{}');
  const salesPerf = JSON.parse(metric.sales_performance || '[]');
  const channelPerf = JSON.parse(metric.channel_performance || '[]');

  const payload = {
    action: 'generate',
    template: 'monthly_deck',
    placeholders: {
      '{{MONTH}}': metric.month_label || metric.month_key,
      '{{TOTAL_REVENUE}}': metric.total_revenue_idr ? `IDR ${(metric.total_revenue_idr / 1e6).toFixed(1)}M` : '-',
      '{{GROSS_MARGIN}}': metric.gross_margin_pct ? `${metric.gross_margin_pct}%` : '-',
      '{{MARGIN_VS_PREV}}': metric.gross_margin_vs_prev || '-',
      '{{DQ_FLAG}}': metric.dq_flag || '-',
      '{{HEADLINE}}': metric.headline || '-',
      '{{TOP_1_VENUE}}': salesPerf[0] ? salesPerf[0].venue : '-',
      '{{TOP_1_REV}}': salesPerf[0] ? `IDR ${(salesPerf[0].revenue / 1e6).toFixed(1)}M` : '-',
      '{{TOP_2_VENUE}}': salesPerf[1] ? salesPerf[1].venue : '-',
      '{{TOP_2_REV}}': salesPerf[1] ? `IDR ${(salesPerf[1].revenue / 1e6).toFixed(1)}M` : '-',
      '{{TOP_3_VENUE}}': salesPerf[2] ? salesPerf[2].venue : '-',
      '{{TOP_3_REV}}': salesPerf[2] ? `IDR ${(salesPerf[2].revenue / 1e6).toFixed(1)}M` : '-',
      '{{TOP_4_VENUE}}': salesPerf[3] ? salesPerf[3].venue : '-',
      '{{TOP_4_REV}}': salesPerf[3] ? `IDR ${(salesPerf[3].revenue / 1e6).toFixed(1)}M` : '-',
      '{{TOP_5_VENUE}}': salesPerf[4] ? salesPerf[4].venue : '-',
      '{{TOP_5_REV}}': salesPerf[4] ? `IDR ${(salesPerf[4].revenue / 1e6).toFixed(1)}M` : '-',
      '{{CH_1_NAME}}': channelPerf[0] ? channelPerf[0].channel : '-',
      '{{CH_1_REV}}': channelPerf[0] ? `IDR ${(channelPerf[0].revenue / 1e6).toFixed(1)}M` : '-',
      '{{CH_2_NAME}}': channelPerf[1] ? channelPerf[1].channel : '-',
      '{{CH_2_REV}}': channelPerf[1] ? `IDR ${(channelPerf[1].revenue / 1e6).toFixed(1)}M` : '-',
      '{{CH_3_NAME}}': channelPerf[2] ? channelPerf[2].channel : '-',
      '{{CH_3_REV}}': channelPerf[2] ? `IDR ${(channelPerf[2].revenue / 1e6).toFixed(1)}M` : '-'
    },
    month_key: monthKey,
    created_by: req.headers.get('X-Agent-Id') || 'platform'
  };

  const now = new Date().toISOString();
  const jobId = generateId('JOB');
  await env.DB.prepare(
    'INSERT INTO jobs (id, job_type, status, payload, created_by, started_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(jobId, 'slides', 'running', JSON.stringify(payload), payload.created_by, now, now).run();

  try {
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

    await env.DB.prepare('UPDATE jobs SET status = ?, result = ?, finished_at = ? WHERE id = ?')
      .bind('completed', JSON.stringify(result), finishedAt, jobId).run();
    const logId = generateId('JLG');
    await env.DB.prepare('INSERT INTO job_logs (id, job_id, step, status, message, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(logId, jobId, 'generate_deck', 'completed', JSON.stringify(result), finishedAt).run();

    // Store presentation URL in deck_metrics.meta
    if (result.ok && result.presentation_url) {
      const updatedMeta = JSON.stringify({ ...meta, presentation_url: result.presentation_url, presentation_id: result.presentation_id });
      await env.DB.prepare('UPDATE deck_metrics SET meta = ?, updated_at = ? WHERE month_key = ?')
        .bind(updatedMeta, finishedAt, monthKey).run();
    }

    return json({ ok: true, job_id: jobId, result });
  } catch (err) {
    const finishedAt = new Date().toISOString();
    await env.DB.prepare('UPDATE jobs SET status = ?, error = ?, finished_at = ? WHERE id = ?')
      .bind('failed', err.message, finishedAt, jobId).run();
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

  // Xero OAuth routes
  if (path === '/api/auth/xero/start' && req.method === 'GET') return xeroAuthStart(req, env);
  if (path === '/api/auth/xero/callback' && req.method === 'GET') return xeroAuthCallback(req, env, url);
  if (path === '/api/auth/xero/status' && req.method === 'GET') return xeroAuthStatus(env);
  if (path === '/api/auth/xero/disconnect' && req.method === 'POST') return xeroAuthDisconnect(env);

  // Sales pipeline actions
  if (path === '/api/sales/import-receivables' && req.method === 'POST') return salesImportReceivables(req, env);
  if (path === '/api/sales/refresh-margins' && req.method === 'POST') return salesRefreshMargins(req, env);
  if (path === '/api/sales/refresh-deck-metrics' && req.method === 'POST') return salesRefreshDeckMetrics(req, env);
  if (path === '/api/sales/rebuild-account-status' && req.method === 'POST') return salesRebuildAccountStatus(req, env);
  if (path === '/api/sales/sync-mapping' && req.method === 'POST') return salesSyncMapping(req, env);
  if (path === '/api/sales/bridge-crm' && req.method === 'POST') return salesBridgeCrm(req, env);
  if (path === '/api/sales/run-pipeline' && req.method === 'POST') return salesRunPipeline(req, env);

  // Xero sync routes
  if (path === '/api/sales/sync-xero/backfill' && req.method === 'POST') return xeroBackfillHandler(req, env, url);
  if (path === '/api/sales/sync-xero' && req.method === 'POST') return xeroSyncHandler(req, env, url);

  // Reports: deck generation (new canonical route)
  const reportsDeckMatch = path.match(/^\/api\/reports\/deck\/([^/]+)\/generate$/);
  if (reportsDeckMatch && req.method === 'POST') return deckMetricsGenerateDeck(req, env, reportsDeckMatch[1]);

  // Legacy deck route — 301 redirect to new reports path
  const deckGenMatch = path.match(/^\/api\/deck-metrics\/([^/]+)\/generate-deck$/);
  if (deckGenMatch && req.method === 'POST') return deckMetricsGenerateDeck(req, env, deckGenMatch[1]);

  // Bulk import: /api/{collection}/import
  const importMatch = path.match(/^\/api\/(contacts|companies|deals|projects|tasks|rnd_projects|rnd_documents|rnd_trial_entries|rnd_stage_history|rnd_approvals|skus|agreements|jobs|job_logs|revenue_transactions|account_mapping|account_status|deck_metrics|sync_runs|xero_invoices|xero_contacts)\/import$/);
  if (importMatch && req.method === 'POST') return bulkImport(req, env, importMatch[1]);

  // CRUD routes: /api/{collection}[/{id}]
  const match = path.match(/^\/api\/(contacts|companies|deals|projects|tasks|rnd_projects|rnd_documents|rnd_trial_entries|rnd_stage_history|rnd_approvals|skus|agreements|jobs|job_logs|revenue_transactions|account_mapping|account_status|deck_metrics|sync_runs|xero_invoices|xero_contacts)(?:\/([^/]+))?$/);
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
  },

  async scheduled(event, env, ctx) {
    // Daily cron: sync current month + previous month from Xero
    const now = new Date();
    const currMonth = now.toISOString().slice(0, 7);
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prev.toISOString().slice(0, 7);

    try {
      await xeroSyncMonth(env, currMonth);
    } catch (err) {
      console.error('Cron sync failed for', currMonth, err.message);
    }
    try {
      await xeroSyncMonth(env, prevMonth);
    } catch (err) {
      console.error('Cron sync failed for', prevMonth, err.message);
    }
  }
};
