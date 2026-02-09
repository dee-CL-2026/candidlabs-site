import { createSession, destroySession, isAllowedDomain } from "./auth/session";
import { isRole, isTool, loadConfig, type AppEnv } from "./config/env";
import { handleToolsApi } from "./api/tools";
import { renderLoginPage } from "./ui/routes/login";
import { renderToolPage, renderToolsIndex } from "./ui/routes/tools";
import { DbClient } from "./db/client";
import { createRequestContext, requireHubAccess, requireUser } from "./auth/middleware";

function html(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function redirect(location: string, setCookie?: string): Response {
  const headers = new Headers({ Location: location });
  if (setCookie) headers.set("Set-Cookie", setCookie);
  return new Response(null, { status: 302, headers });
}

async function parseFormOrJson(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await request.json()) as Record<string, unknown>;
  }
  const formData = await request.formData();
  const out: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) out[key] = String(value);
  return out;
}

export default {
  async fetch(request: Request, env: AppEnv): Promise<Response> {
    const config = loadConfig(env);
    const db = new DbClient(env);
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    const context = await createRequestContext(request, env, config);

    if (path === "/") {
      return redirect("/tools");
    }

    if (path === "/login" && method === "GET") {
      return html(renderLoginPage());
    }

    if (path === "/auth/mock-login" && method === "POST") {
      const payload = await parseFormOrJson(request);
      const email = String(payload.email || "").trim().toLowerCase();
      const role = String(payload.role || "").trim().toLowerCase();
      const name = String(payload.name || "").trim();

      if (!email || !isRole(role) || !isAllowedDomain(email, config.allowedDomain)) {
        return json({ error: "Invalid login payload for configured domain." }, 400);
      }

      await db.upsertUser(email, name, role);
      const session = await createSession(env, config, { email, role, name: name || undefined });
      return redirect("/tools", session.cookie);
    }

    if (path === "/auth/logout" && method === "POST") {
      const cookie = await destroySession(env, config, request);
      return redirect("/login", cookie);
    }

    if (path === "/api/me" && method === "GET") {
      const user = requireUser(context);
      if (!user) return json({ error: "Unauthenticated" }, 401);
      return json(user);
    }

    if (path === "/tools" && method === "GET") {
      if (!requireHubAccess(context)) return redirect("/login");
      return html(renderToolsIndex());
    }

    if (path.startsWith("/tools/") && method === "GET") {
      if (!requireHubAccess(context)) return redirect("/login");
      const tool = path.slice("/tools/".length);
      if (!isTool(tool)) return html("Not found", 404);
      return html(renderToolPage(tool));
    }

    if (path.startsWith("/api/tools/")) {
      const user = requireUser(context);
      if (!user) return json({ error: "Unauthenticated" }, 401);
      const segments = path.split("/").filter(Boolean);
      if (segments.length < 3) return json({ error: "Not found" }, 404);
      const tool = segments[2];
      if (!isTool(tool)) return json({ error: "Unknown tool" }, 404);
      return handleToolsApi(
        {
          env,
          config,
          request,
          user
        },
        tool,
        segments
      );
    }

    return json({ error: "Not found" }, 404);
  }
};
