import { type AppConfig, type AppEnv, type Tool } from "../config/env";
import { canApproveTool, canRunTool } from "../auth/rbac";
import { type SessionUser } from "../auth/session";
import { DbClient, type ToolRunRecord } from "../db/client";

export interface AppContext {
  env: AppEnv;
  config: AppConfig;
  request: Request;
  user: SessionUser;
  db: DbClient;
}

interface RunEnvelope {
  idempotencyKey: string;
  input: Record<string, unknown>;
  options?: {
    dryRun?: boolean;
  };
}

interface ApproveEnvelope {
  decision: "approved" | "rejected";
  notes?: string;
}

const TOOLS_REQUIRING_APPROVAL = new Set<Tool>(["kaa", "reports"]);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function responseEnvelope(run: ToolRunRecord): { runId: string; status: ToolRunRecord["status"]; submittedAt: string } {
  return {
    runId: run.run_id,
    status: run.status,
    submittedAt: run.created_at
  };
}

async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function validateRunEnvelope(payload: RunEnvelope | null): { ok: true; value: RunEnvelope } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }

  if (typeof payload.idempotencyKey !== "string" || payload.idempotencyKey.trim() === "") {
    return { ok: false, error: "idempotencyKey must be a non-empty string" };
  }

  if (!payload.input || typeof payload.input !== "object" || Array.isArray(payload.input)) {
    return { ok: false, error: "input must be an object" };
  }

  if (payload.options !== undefined) {
    if (typeof payload.options !== "object" || Array.isArray(payload.options)) {
      return { ok: false, error: "options must be an object when provided" };
    }
    if (payload.options.dryRun !== undefined && typeof payload.options.dryRun !== "boolean") {
      return { ok: false, error: "options.dryRun must be a boolean when provided" };
    }
  }

  return {
    ok: true,
    value: {
      idempotencyKey: payload.idempotencyKey.trim(),
      input: payload.input,
      options: {
        dryRun: payload.options?.dryRun ?? false
      }
    }
  };
}

function validateApproveEnvelope(payload: ApproveEnvelope | null): { ok: true; value: ApproveEnvelope } | { ok: false; error: string } {
  if (!payload || typeof payload !== "object") {
    return { ok: false, error: "Invalid JSON body" };
  }
  if (payload.decision !== "approved" && payload.decision !== "rejected") {
    return { ok: false, error: "decision must be approved or rejected" };
  }
  return { ok: true, value: payload };
}

export async function handleToolsApi(context: AppContext, tool: Tool, segments: string[]): Promise<Response> {
  const method = context.request.method.toUpperCase();

  if (segments.length === 4 && segments[3] === "run" && method === "POST") {
    if (!canRunTool(context.user.role, tool)) return json({ error: "Forbidden" }, 403);

    const parsed = validateRunEnvelope(await parseJson<RunEnvelope>(context.request));
    if (!parsed.ok) return json({ error: parsed.error }, 400);

    let run = await context.db.createToolRun(
      tool,
      context.user.email,
      JSON.stringify(parsed.value.input),
      parsed.value.idempotencyKey
    );

    if (run.status === "queued") {
      if (TOOLS_REQUIRING_APPROVAL.has(tool)) {
        run = await context.db.updateToolRunStatus(run.run_id, "needs_approval");
      } else {
        run = await context.db.updateToolRunStatus(run.run_id, "completed");
      }
    }

    return json(responseEnvelope(run), 200);
  }

  if (segments.length === 5 && segments[3] === "runs" && method === "GET") {
    if (!canRunTool(context.user.role, tool) && !canApproveTool(context.user.role, tool)) {
      return json({ error: "Forbidden" }, 403);
    }
    const run = await context.db.getToolRun(segments[4]);
    if (!run || run.tool !== tool) return json({ error: "Run not found" }, 404);
    return json(responseEnvelope(run), 200);
  }

  if (segments.length === 6 && segments[3] === "runs" && segments[5] === "approve" && method === "POST") {
    if (!canApproveTool(context.user.role, tool)) return json({ error: "Forbidden" }, 403);
    const runId = segments[4];
    const run = await context.db.getToolRun(runId);
    if (!run || run.tool !== tool) return json({ error: "Run not found" }, 404);

    const parsed = validateApproveEnvelope(await parseJson<ApproveEnvelope>(context.request));
    if (!parsed.ok) return json({ error: parsed.error }, 400);

    await context.db.createApproval(runId, tool, parsed.value.decision, context.user.email, parsed.value.notes);
    const updated = await context.db.updateToolRunStatus(
      runId,
      parsed.value.decision === "approved" ? "approved" : "rejected"
    );

    return json(responseEnvelope(updated), 200);
  }

  return json({ error: "Not found" }, 404);
}
