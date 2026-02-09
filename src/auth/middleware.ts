import { canViewHub } from "./rbac";
import { loadSessionUser, type SessionUser } from "./session";
import { type AppConfig, type AppEnv } from "../config/env";

export interface RequestContext {
  user: SessionUser | null;
}

export async function createRequestContext(
  request: Request,
  env: AppEnv,
  config: AppConfig
): Promise<RequestContext> {
  const user = await loadSessionUser(env, config, request);
  return { user };
}

export function requireUser(context: RequestContext): SessionUser | null {
  return context.user;
}

export function requireHubAccess(context: RequestContext): SessionUser | null {
  if (!context.user) return null;
  return canViewHub(context.user.role) ? context.user : null;
}
