import type { AppEnv } from "../config/env";

// ============================================================
// Record interfaces
// ============================================================

export interface AccountRecord {
  account_id: string;
  legal_name: string | null;
  display_name: string;
  channel: string | null;
  market: string | null;
  city: string | null;
  status: string;
  first_order_date: string | null;
  latest_order_date: string | null;
  owner_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactRecord {
  contact_id: string;
  account_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_primary: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRecord {
  project_id: string;
  account_id: string | null;
  name: string;
  description: string | null;
  type: string;
  status: string;
  priority: string;
  owner_email: string | null;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskRecord {
  task_id: string;
  project_id: string;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigned_to: string | null;
  start_date: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityRecord {
  activity_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_email: string;
  details_json: string | null;
  created_at: string;
}

// ============================================================
// Helpers
// ============================================================

function generateId(prefix: string): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomUUID().replaceAll("-", "").slice(0, 10);
  return `${prefix}_${ts}_${rand}`;
}

function now(): string {
  return new Date().toISOString();
}

// ============================================================
// CRM DB Client
// ============================================================

export class CrmDb {
  private readonly db: D1Database;

  constructor(env: AppEnv) {
    this.db = env.DB;
  }

  // ----------------------------------------------------------
  // Accounts
  // ----------------------------------------------------------

  async listAccounts(filters?: {
    status?: string;
    channel?: string;
    owner_email?: string;
    search?: string;
  }): Promise<AccountRecord[]> {
    let sql = "SELECT * FROM accounts WHERE 1=1";
    const params: unknown[] = [];

    if (filters?.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }
    if (filters?.channel) {
      sql += " AND channel = ?";
      params.push(filters.channel);
    }
    if (filters?.owner_email) {
      sql += " AND owner_email = ?";
      params.push(filters.owner_email);
    }
    if (filters?.search) {
      sql += " AND (display_name LIKE ? OR legal_name LIKE ? OR city LIKE ?)";
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY updated_at DESC";

    const stmt = params.length > 0
      ? this.db.prepare(sql).bind(...params)
      : this.db.prepare(sql);
    const result = await stmt.all<AccountRecord>();
    return result.results ?? [];
  }

  async getAccount(accountId: string): Promise<AccountRecord | null> {
    return this.db.prepare("SELECT * FROM accounts WHERE account_id = ?")
      .bind(accountId).first<AccountRecord>();
  }

  async createAccount(data: {
    display_name: string;
    legal_name?: string;
    channel?: string;
    market?: string;
    city?: string;
    status?: string;
    owner_email?: string;
    notes?: string;
  }): Promise<AccountRecord> {
    const id = generateId("acc");
    const ts = now();
    await this.db.prepare(
      `INSERT INTO accounts (account_id, display_name, legal_name, channel, market, city, status, owner_email, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.display_name,
      data.legal_name ?? null,
      data.channel ?? null,
      data.market ?? null,
      data.city ?? null,
      data.status ?? "active",
      data.owner_email ?? null,
      data.notes ?? null,
      ts, ts
    ).run();

    const row = await this.getAccount(id);
    if (!row) throw new Error("Account creation failed");
    return row;
  }

  async updateAccount(accountId: string, data: Partial<{
    display_name: string;
    legal_name: string;
    channel: string;
    market: string;
    city: string;
    status: string;
    first_order_date: string;
    latest_order_date: string;
    owner_email: string;
    notes: string;
  }>): Promise<AccountRecord> {
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (sets.length === 0) {
      const existing = await this.getAccount(accountId);
      if (!existing) throw new Error("Account not found");
      return existing;
    }

    sets.push("updated_at = ?");
    params.push(now());
    params.push(accountId);

    await this.db.prepare(
      `UPDATE accounts SET ${sets.join(", ")} WHERE account_id = ?`
    ).bind(...params).run();

    const row = await this.getAccount(accountId);
    if (!row) throw new Error("Account not found");
    return row;
  }

  // ----------------------------------------------------------
  // Contacts
  // ----------------------------------------------------------

  async listContacts(accountId: string): Promise<ContactRecord[]> {
    const result = await this.db.prepare(
      "SELECT * FROM contacts WHERE account_id = ? ORDER BY is_primary DESC, name ASC"
    ).bind(accountId).all<ContactRecord>();
    return result.results ?? [];
  }

  async getContact(contactId: string): Promise<ContactRecord | null> {
    return this.db.prepare("SELECT * FROM contacts WHERE contact_id = ?")
      .bind(contactId).first<ContactRecord>();
  }

  async createContact(data: {
    account_id: string;
    name: string;
    role?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
    is_primary?: boolean;
    notes?: string;
  }): Promise<ContactRecord> {
    const id = generateId("con");
    const ts = now();
    await this.db.prepare(
      `INSERT INTO contacts (contact_id, account_id, name, role, email, phone, whatsapp, is_primary, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.account_id,
      data.name,
      data.role ?? null,
      data.email ?? null,
      data.phone ?? null,
      data.whatsapp ?? null,
      data.is_primary ? 1 : 0,
      data.notes ?? null,
      ts, ts
    ).run();

    const row = await this.getContact(id);
    if (!row) throw new Error("Contact creation failed");
    return row;
  }

  async updateContact(contactId: string, data: Partial<{
    name: string;
    role: string;
    email: string;
    phone: string;
    whatsapp: string;
    is_primary: boolean;
    notes: string;
  }>): Promise<ContactRecord> {
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        if (key === "is_primary") {
          sets.push("is_primary = ?");
          params.push(value ? 1 : 0);
        } else {
          sets.push(`${key} = ?`);
          params.push(value);
        }
      }
    }

    if (sets.length === 0) {
      const existing = await this.getContact(contactId);
      if (!existing) throw new Error("Contact not found");
      return existing;
    }

    sets.push("updated_at = ?");
    params.push(now());
    params.push(contactId);

    await this.db.prepare(
      `UPDATE contacts SET ${sets.join(", ")} WHERE contact_id = ?`
    ).bind(...params).run();

    const row = await this.getContact(contactId);
    if (!row) throw new Error("Contact not found");
    return row;
  }

  async deleteContact(contactId: string): Promise<void> {
    await this.db.prepare("DELETE FROM contacts WHERE contact_id = ?")
      .bind(contactId).run();
  }

  // ----------------------------------------------------------
  // Projects
  // ----------------------------------------------------------

  async listProjects(filters?: {
    type?: string;
    status?: string;
    account_id?: string;
    owner_email?: string;
  }): Promise<ProjectRecord[]> {
    let sql = "SELECT * FROM projects WHERE 1=1";
    const params: unknown[] = [];

    if (filters?.type) {
      sql += " AND type = ?";
      params.push(filters.type);
    }
    if (filters?.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }
    if (filters?.account_id) {
      sql += " AND account_id = ?";
      params.push(filters.account_id);
    }
    if (filters?.owner_email) {
      sql += " AND owner_email = ?";
      params.push(filters.owner_email);
    }

    sql += " ORDER BY CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, updated_at DESC";

    const stmt = params.length > 0
      ? this.db.prepare(sql).bind(...params)
      : this.db.prepare(sql);
    const result = await stmt.all<ProjectRecord>();
    return result.results ?? [];
  }

  async getProject(projectId: string): Promise<ProjectRecord | null> {
    return this.db.prepare("SELECT * FROM projects WHERE project_id = ?")
      .bind(projectId).first<ProjectRecord>();
  }

  async createProject(data: {
    name: string;
    description?: string;
    type?: string;
    status?: string;
    priority?: string;
    account_id?: string;
    owner_email?: string;
    start_date?: string;
    target_date?: string;
  }): Promise<ProjectRecord> {
    const id = generateId("prj");
    const ts = now();
    await this.db.prepare(
      `INSERT INTO projects (project_id, name, description, type, status, priority, account_id, owner_email, start_date, target_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.name,
      data.description ?? null,
      data.type ?? "internal",
      data.status ?? "planning",
      data.priority ?? "medium",
      data.account_id ?? null,
      data.owner_email ?? null,
      data.start_date ?? null,
      data.target_date ?? null,
      ts, ts
    ).run();

    const row = await this.getProject(id);
    if (!row) throw new Error("Project creation failed");
    return row;
  }

  async updateProject(projectId: string, data: Partial<{
    name: string;
    description: string;
    type: string;
    status: string;
    priority: string;
    account_id: string;
    owner_email: string;
    start_date: string;
    target_date: string;
  }>): Promise<ProjectRecord> {
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (sets.length === 0) {
      const existing = await this.getProject(projectId);
      if (!existing) throw new Error("Project not found");
      return existing;
    }

    sets.push("updated_at = ?");
    params.push(now());
    params.push(projectId);

    await this.db.prepare(
      `UPDATE projects SET ${sets.join(", ")} WHERE project_id = ?`
    ).bind(...params).run();

    const row = await this.getProject(projectId);
    if (!row) throw new Error("Project not found");
    return row;
  }

  // ----------------------------------------------------------
  // Tasks
  // ----------------------------------------------------------

  async listTasks(filters?: {
    project_id?: string;
    status?: string;
    assigned_to?: string;
    priority?: string;
  }): Promise<TaskRecord[]> {
    let sql = "SELECT * FROM tasks WHERE 1=1";
    const params: unknown[] = [];

    if (filters?.project_id) {
      sql += " AND project_id = ?";
      params.push(filters.project_id);
    }
    if (filters?.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }
    if (filters?.assigned_to) {
      sql += " AND assigned_to = ?";
      params.push(filters.assigned_to);
    }
    if (filters?.priority) {
      sql += " AND priority = ?";
      params.push(filters.priority);
    }

    sql += " ORDER BY CASE priority WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END, due_date ASC NULLS LAST, updated_at DESC";

    const stmt = params.length > 0
      ? this.db.prepare(sql).bind(...params)
      : this.db.prepare(sql);
    const result = await stmt.all<TaskRecord>();
    return result.results ?? [];
  }

  async getTask(taskId: string): Promise<TaskRecord | null> {
    return this.db.prepare("SELECT * FROM tasks WHERE task_id = ?")
      .bind(taskId).first<TaskRecord>();
  }

  async createTask(data: {
    project_id: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    parent_task_id?: string;
    assigned_to?: string;
    start_date?: string;
    due_date?: string;
    estimated_hours?: number;
    created_by?: string;
  }): Promise<TaskRecord> {
    const id = generateId("tsk");
    const ts = now();
    await this.db.prepare(
      `INSERT INTO tasks (task_id, project_id, parent_task_id, title, description, status, priority, assigned_to, start_date, due_date, estimated_hours, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.project_id,
      data.parent_task_id ?? null,
      data.title,
      data.description ?? null,
      data.status ?? "backlog",
      data.priority ?? "medium",
      data.assigned_to ?? null,
      data.start_date ?? null,
      data.due_date ?? null,
      data.estimated_hours ?? null,
      data.created_by ?? null,
      ts, ts
    ).run();

    const row = await this.getTask(id);
    if (!row) throw new Error("Task creation failed");
    return row;
  }

  async updateTask(taskId: string, data: Partial<{
    title: string;
    description: string;
    status: string;
    priority: string;
    assigned_to: string;
    start_date: string;
    due_date: string;
    estimated_hours: number;
    actual_hours: number;
  }>): Promise<TaskRecord> {
    const sets: string[] = [];
    const params: unknown[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sets.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (sets.length === 0) {
      const existing = await this.getTask(taskId);
      if (!existing) throw new Error("Task not found");
      return existing;
    }

    sets.push("updated_at = ?");
    params.push(now());
    params.push(taskId);

    await this.db.prepare(
      `UPDATE tasks SET ${sets.join(", ")} WHERE task_id = ?`
    ).bind(...params).run();

    const row = await this.getTask(taskId);
    if (!row) throw new Error("Task not found");
    return row;
  }

  // ----------------------------------------------------------
  // Activities
  // ----------------------------------------------------------

  async logActivity(data: {
    entity_type: string;
    entity_id: string;
    action: string;
    actor_email: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    const id = generateId("act");
    await this.db.prepare(
      `INSERT INTO activities (activity_id, entity_type, entity_id, action, actor_email, details_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.entity_type,
      data.entity_id,
      data.action,
      data.actor_email,
      data.details ? JSON.stringify(data.details) : null,
      now()
    ).run();
  }

  async listActivities(entityType: string, entityId: string, limit = 50): Promise<ActivityRecord[]> {
    const result = await this.db.prepare(
      "SELECT * FROM activities WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC LIMIT ?"
    ).bind(entityType, entityId, limit).all<ActivityRecord>();
    return result.results ?? [];
  }
}
