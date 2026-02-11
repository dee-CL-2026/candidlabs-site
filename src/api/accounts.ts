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

export async function handleAccountsApi(
  ctx: ApiContext,
  segments: string[]
): Promise<Response> {
  const method = ctx.request.method.toUpperCase();
  const db = new CrmDb(ctx.env);
  // segments: ["api", "accounts", ...rest]
  const rest = segments.slice(2);

  // GET /api/accounts
  if (rest.length === 0 && method === "GET") {
    const url = new URL(ctx.request.url);
    const accounts = await db.listAccounts({
      status: url.searchParams.get("status") ?? undefined,
      channel: url.searchParams.get("channel") ?? undefined,
      owner_email: url.searchParams.get("owner") ?? undefined,
      search: url.searchParams.get("q") ?? undefined,
    });
    return json(accounts);
  }

  // POST /api/accounts
  if (rest.length === 0 && method === "POST") {
    if (ctx.user.role === "finance") return json({ error: "Forbidden" }, 403);

    const body = await parseJson(ctx.request);
    if (!body || typeof body.display_name !== "string" || !body.display_name.trim()) {
      return json({ error: "display_name is required" }, 400);
    }

    const account = await db.createAccount({
      display_name: String(body.display_name).trim(),
      legal_name: typeof body.legal_name === "string" ? body.legal_name.trim() : undefined,
      channel: typeof body.channel === "string" ? body.channel : undefined,
      market: typeof body.market === "string" ? body.market : undefined,
      city: typeof body.city === "string" ? body.city : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      owner_email: typeof body.owner_email === "string" ? body.owner_email : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    await db.logActivity({
      entity_type: "account",
      entity_id: account.account_id,
      action: "created",
      actor_email: ctx.user.email,
      details: { display_name: account.display_name },
    });

    return json(account, 201);
  }

  // GET /api/accounts/:id
  if (rest.length === 1 && method === "GET") {
    const account = await db.getAccount(rest[0]);
    if (!account) return json({ error: "Account not found" }, 404);

    const contacts = await db.listContacts(account.account_id);
    const projects = await db.listProjects({ account_id: account.account_id });
    const activities = await db.listActivities("account", account.account_id, 20);

    return json({ ...account, contacts, projects, activities });
  }

  // PUT /api/accounts/:id
  if (rest.length === 1 && method === "PUT") {
    if (ctx.user.role === "finance") return json({ error: "Forbidden" }, 403);

    const body = await parseJson(ctx.request);
    if (!body) return json({ error: "Invalid JSON" }, 400);

    const account = await db.updateAccount(rest[0], {
      display_name: typeof body.display_name === "string" ? body.display_name.trim() : undefined,
      legal_name: typeof body.legal_name === "string" ? body.legal_name.trim() : undefined,
      channel: typeof body.channel === "string" ? body.channel : undefined,
      market: typeof body.market === "string" ? body.market : undefined,
      city: typeof body.city === "string" ? body.city : undefined,
      status: typeof body.status === "string" ? body.status : undefined,
      owner_email: typeof body.owner_email === "string" ? body.owner_email : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    await db.logActivity({
      entity_type: "account",
      entity_id: account.account_id,
      action: "updated",
      actor_email: ctx.user.email,
      details: body,
    });

    return json(account);
  }

  // GET /api/accounts/:id/contacts
  if (rest.length === 2 && rest[1] === "contacts" && method === "GET") {
    const contacts = await db.listContacts(rest[0]);
    return json(contacts);
  }

  // POST /api/accounts/:id/contacts
  if (rest.length === 2 && rest[1] === "contacts" && method === "POST") {
    if (ctx.user.role === "finance") return json({ error: "Forbidden" }, 403);

    const body = await parseJson(ctx.request);
    if (!body || typeof body.name !== "string" || !body.name.trim()) {
      return json({ error: "name is required" }, 400);
    }

    const contact = await db.createContact({
      account_id: rest[0],
      name: String(body.name).trim(),
      role: typeof body.role === "string" ? body.role : undefined,
      email: typeof body.email === "string" ? body.email : undefined,
      phone: typeof body.phone === "string" ? body.phone : undefined,
      whatsapp: typeof body.whatsapp === "string" ? body.whatsapp : undefined,
      is_primary: body.is_primary === true,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    });

    await db.logActivity({
      entity_type: "contact",
      entity_id: contact.contact_id,
      action: "created",
      actor_email: ctx.user.email,
      details: { name: contact.name, account_id: rest[0] },
    });

    return json(contact, 201);
  }

  return json({ error: "Not found" }, 404);
}
