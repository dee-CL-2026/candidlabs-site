import { isRunStatus, isRole, isTool, type AppEnv, type Role, type RunStatus, type Tool } from "../config/env";

export interface UserRecord {
  email: string;
  name: string | null;
  role: Role;
  disabled: number;
  created_at: string;
  last_login_at: string | null;
}

export interface ToolRunRecord {
  run_id: string;
  idempotency_key: string;
  tool: Tool;
  requested_by_email: string;
  status: RunStatus;
  input_json: string;
  output_json: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApprovalRecord {
  id: number;
  run_id: string;
  tool: Tool;
  decision: "approved" | "rejected";
  decided_by_email: string;
  notes: string | null;
  decided_at: string;
}

function generateRunId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  return `run_${timestamp}_${randomPart}`;
}

function toUserRecord(row: unknown): UserRecord | null {
  const v = row as Partial<UserRecord> | null;
  if (!v || typeof v.email !== "string" || typeof v.role !== "string" || !isRole(v.role)) return null;
  return {
    email: v.email,
    name: typeof v.name === "string" ? v.name : null,
    role: v.role,
    disabled: Number(v.disabled || 0),
    created_at: String(v.created_at || ""),
    last_login_at: typeof v.last_login_at === "string" ? v.last_login_at : null
  };
}

function toToolRunRecord(row: unknown): ToolRunRecord | null {
  const v = row as Partial<ToolRunRecord> | null;
  if (
    !v ||
    typeof v.run_id !== "string" ||
    typeof v.tool !== "string" ||
    !isTool(v.tool) ||
    typeof v.status !== "string" ||
    !isRunStatus(v.status)
  ) {
    return null;
  }
  return {
    run_id: v.run_id,
    idempotency_key: String(v.idempotency_key || ""),
    tool: v.tool,
    requested_by_email: String(v.requested_by_email || ""),
    status: v.status,
    input_json: String(v.input_json || "{}"),
    output_json: typeof v.output_json === "string" ? v.output_json : null,
    error: typeof v.error === "string" ? v.error : null,
    created_at: String(v.created_at || ""),
    updated_at: String(v.updated_at || "")
  };
}

export class DbClient {
  constructor(private readonly env: AppEnv) {}

  get binding(): D1Database {
    return this.env.DB;
  }

  async getUserByEmail(email: string): Promise<UserRecord | null> {
    const row = await this.binding.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
    return toUserRecord(row);
  }

  async upsertUser(email: string, name: string, role: Role): Promise<UserRecord> {
    const now = new Date().toISOString();
    await this.binding
      .prepare(
        `INSERT INTO users (email, name, role, last_login_at)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(email) DO UPDATE SET
           name = excluded.name,
           role = excluded.role,
           last_login_at = excluded.last_login_at`
      )
      .bind(email, name || null, role, now)
      .run();

    const user = await this.getUserByEmail(email);
    if (!user) throw new Error("User upsert failed");
    return user;
  }

  async createToolRun(
    tool: Tool,
    requestedByEmail: string,
    inputJson: string,
    idempotencyKey: string
  ): Promise<ToolRunRecord> {
    const existing = await this.binding
      .prepare("SELECT * FROM tool_runs WHERE tool = ? AND requested_by_email = ? AND idempotency_key = ?")
      .bind(tool, requestedByEmail, idempotencyKey)
      .first();
    const existingRun = toToolRunRecord(existing);
    if (existingRun) return existingRun;

    const runId = generateRunId();
    const now = new Date().toISOString();
    await this.binding
      .prepare(
        `INSERT INTO tool_runs (
           run_id, idempotency_key, tool, requested_by_email, status, input_json, output_json, created_at, updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(runId, idempotencyKey, tool, requestedByEmail, "queued", inputJson, null, now, now)
      .run();

    const created = await this.getToolRun(runId);
    if (!created) throw new Error("Tool run creation failed");
    return created;
  }

  async updateToolRunStatus(runId: string, status: RunStatus, outputJson?: string, error?: string): Promise<ToolRunRecord> {
    const now = new Date().toISOString();
    await this.binding
      .prepare(
        `UPDATE tool_runs
         SET status = ?, output_json = COALESCE(?, output_json), error = COALESCE(?, error), updated_at = ?
         WHERE run_id = ?`
      )
      .bind(status, outputJson ?? null, error ?? null, now, runId)
      .run();

    const updated = await this.getToolRun(runId);
    if (!updated) throw new Error("Tool run update failed");
    return updated;
  }

  async createApproval(
    runId: string,
    tool: Tool,
    decision: "approved" | "rejected",
    decidedByEmail: string,
    notes?: string
  ): Promise<ApprovalRecord> {
    const now = new Date().toISOString();
    const result = await this.binding
      .prepare(
        `INSERT INTO approvals (run_id, tool, decision, decided_by_email, notes, decided_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(runId, tool, decision, decidedByEmail, notes ?? null, now)
      .run();

    const id = Number(result.meta.last_row_id);
    const row = await this.binding.prepare("SELECT * FROM approvals WHERE id = ?").bind(id).first();
    if (!row) throw new Error("Approval creation failed");

    const parsed = row as Partial<ApprovalRecord>;
    return {
      id,
      run_id: String(parsed.run_id),
      tool: String(parsed.tool) as Tool,
      decision: String(parsed.decision) as "approved" | "rejected",
      decided_by_email: String(parsed.decided_by_email),
      notes: typeof parsed.notes === "string" ? parsed.notes : null,
      decided_at: typeof parsed.decided_at === "string" ? parsed.decided_at : now
    };
  }

  async getToolRun(runId: string): Promise<ToolRunRecord | null> {
    const row = await this.binding.prepare("SELECT * FROM tool_runs WHERE run_id = ?").bind(runId).first();
    return toToolRunRecord(row);
  }
}
