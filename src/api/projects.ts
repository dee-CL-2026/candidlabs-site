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

export async function handleProjectsApi(
  ctx: ApiContext,
  segments: string[]
): Promise<Response> {
  const method = ctx.request.method.toUpperCase();
  const db = new CrmDb(ctx.env);
  // segments: ["api", "projects", ...rest]
  const rest = segments.slice(2);

  // GET /api/projects
  if (rest.length === 0 && method === "GET") {
    const url = new URL(ctx.request.url);
    const projects = await db.listProjects({
      type: url.searchParams.get("type") ?? undefined,
      status: url.searchParams.get("status") ?? undefined,
      account_id: url.searchParams.get("account_id") ?? undefined,
      owner_email: url.searchParams.get("owner") ?? undefined,
    });
    return json(projects);
  }

  // POST /api/projects
  if (rest.length === 0 && method === "POST") {
    const body = await parseJson(ctx.request);
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return json({ error: "name is required" }, 400);
    }

    const project = await db.createProject({
      name: String(body.name).trim(),
      description: typeof body.description === "string" ? body.description : undefined,
      type: typeof body.type === "string" ? body.type : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      priority: typeof body.priority === "string" ? body.priority : undefined,
      account_id: typeof body.account_id === "string" ? body.account_id : undefined,
      owner_email: typeof body.owner_email === "string" ? body.owner_email : ctx.user.email,
      start_date: typeof body.start_date === "string" ? body.start_date : undefined,
      target_date: typeof body.target_date === "string" ? body.target_date : undefined,
    });

    await db.logActivity({
      entity_type: "project",
      entity_id: project.project_id,
      action: "created",
      actor_email: ctx.user.email,
      details: { name: project.name, type: project.type },
    });

    return json(project, 201);
  }

  // GET /api/projects/:id
  if (rest.length === 1 && method === "GET") {
    const project = await db.getProject(rest[0]);
    if (!project) return json({ error: "Project not found" }, 404);

    const tasks = await db.listTasks({ project_id: project.project_id });
    const activities = await db.listActivities("project", project.project_id, 20);

    return json({ ...project, tasks, activities });
  }

  // PUT /api/projects/:id
  if (rest.length === 1 && method === "PUT") {
    const body = await parseJson(ctx.request);
    if (!body) return json({ error: "Invalid JSON" }, 400);

    const before = await db.getProject(rest[0]);
    if (!before) return json({ error: "Project not found" }, 404);

    const project = await db.updateProject(rest[0], {
      name: typeof body.name === "string" ? body.name.trim() : undefined,
      description: typeof body.description === "string" ? body.description : undefined,
      type: typeof body.type === "string" ? body.type : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      priority: typeof body.priority === "string" ? body.priority : undefined,
      account_id: typeof body.account_id === "string" ? body.account_id : undefined,
      owner_email: typeof body.owner_email === "string" ? body.owner_email : undefined,
      start_date: typeof body.start_date === "string" ? body.start_date : undefined,
      target_date: typeof body.target_date === "string" ? body.target_date : undefined,
    });

    const action = body.status && body.status !== before.status ? "status_changed" : "updated";
    await db.logActivity({
      entity_type: "project",
      entity_id: project.project_id,
      action,
      actor_email: ctx.user.email,
      details: body,
    });

    return json(project);
  }

  // GET /api/projects/:id/tasks
  if (rest.length === 2 && rest[1] === "tasks" && method === "GET") {
    const tasks = await db.listTasks({ project_id: rest[0] });
    return json(tasks);
  }

  // POST /api/projects/:id/tasks
  if (rest.length === 2 && rest[1] === "tasks" && method === "POST") {
    const body = await parseJson(ctx.request);
    if (!body || typeof body.title !== "string" || !body.title.trim()) {
      return json({ error: "title is required" }, 400);
    }

    const task = await db.createTask({
      project_id: rest[0],
      title: String(body.title).trim(),
      description: typeof body.description === "string" ? body.description : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      priority: typeof body.priority === "string" ? body.priority : undefined,
      parent_task_id: typeof body.parent_task_id === "string" ? body.parent_task_id : undefined,
      assigned_to: typeof body.assigned_to === "string" ? body.assigned_to : undefined,
      start_date: typeof body.start_date === "string" ? body.start_date : undefined,
      due_date: typeof body.due_date === "string" ? body.due_date : undefined,
      estimated_hours: typeof body.estimated_hours === "number" ? body.estimated_hours : undefined,
      created_by: ctx.user.email,
    });

    await db.logActivity({
      entity_type: "task",
      entity_id: task.task_id,
      action: "created",
      actor_email: ctx.user.email,
      details: { title: task.title, project_id: rest[0] },
    });

    return json(task, 201);
  }

  return json({ error: "Not found" }, 404);
}
