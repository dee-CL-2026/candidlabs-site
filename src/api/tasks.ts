import type { SessionUser } from "../auth/session";
import type { AppEnv } from "../config/env";
import { CrmDb } from "../db/crm";

interface ApiContext {
  env: AppEnv;
  request: Request;
  user: SessionUser;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

async function parseJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleTasksApi(
  ctx: ApiContext,
  segments: string[]
): Promise<Response> {
  const method = ctx.request.method.toUpperCase();
  const db = new CrmDb(ctx.env);
  // segments: ["api", "tasks", ...rest]
  const rest = segments.slice(2);

  // GET /api/tasks (cross-project listing)
  if (rest.length === 0 && method === "GET") {
    const url = new URL(ctx.request.url);
    const tasks = await db.listTasks({
      project_id: url.searchParams.get("project_id") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      assigned_to: url.searchParams.get("assigned_to") ?? undefined,
      priority: url.searchParams.get("priority") ?? undefined,
    });
    return json(tasks);
  }

  // GET /api/tasks/:id
  if (rest.length === 1 && method === "GET") {
    const task = await db.getTask(rest[0]);
    if (!task) return json({ error: "Task not found" }, 404);

    const activities = await db.listActivities("task", task.task_id, 20);
    return json({ ...task, activities });
  }

  // PUT /api/tasks/:id
  if (rest.length === 1 && method === "PUT") {
    const body = await parseJson(ctx.request);
    if (!body) return json({ error: "Invalid JSON" }, 400);

    const before = await db.getTask(rest[0]);
    if (!before) return json({ error: "Task not found" }, 404);

    const task = await db.updateTask(rest[0], {
      title: typeof body.title === "string" ? body.title.trim() : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      priority: typeof body.priority === "string" ? body.priority : undefined,
      assigned_to: typeof body.assigned_to === "string" ? body.assigned_to : undefined,
      start_date: typeof body.start_date === "string" ? body.start_date : undefined,
      due_date: typeof body.due_date === "string" ? body.due_date : undefined,
      estimated_hours: typeof body.estimated_hours === "number" ? body.estimated_hours : undefined,
      actual_hours: typeof body.actual_hours === "number" ? body.actual_hours : undefined,
    });

    let action = "updated";
    if (body.status && body.status !== before.status) action = "status_changed";
    else if (body.assigned_to && body.assigned_to !== before.assigned_to) action = "assigned";

    await db.logActivity({
      entity_type: "task",
      entity_id: task.task_id,
      action,
      actor_email: ctx.user.email,
      details: body,
    });

    return json(task);
  }

  return json({ error: "Not found" }, 404);
}
