export const ROLES = ["founder", "admin", "sales", "finance"] as const;
export const TOOLS = ["kaa", "sales-assets", "reports", "budget"] as const;
export const RUN_STATUSES = [
  "queued",
  "running",
  "completed",
  "failed",
  "needs_approval",
  "approved",
  "rejected"
] as const;

export type Role = (typeof ROLES)[number];
export type Tool = (typeof TOOLS)[number];
export type RunStatus = (typeof RUN_STATUSES)[number];

export interface AppEnv {
  DB: D1Database;
  SESSION_KV?: KVNamespace;
  ALLOWED_DOMAIN: string;
  SESSION_SECRET: string;
  SESSION_COOKIE_NAME?: string;
  COOKIE_SECURE?: string;
  RUN_ID_PREFIX?: string;
}

export interface AppConfig {
  allowedDomain: string;
  sessionSecret: string;
  sessionCookieName: string;
  cookieSecure: boolean;
  runIdPrefix: string;
}

function getRequired(name: keyof AppEnv, value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing required env var: ${String(name)}`);
  }
  return value.trim();
}

export function loadConfig(env: AppEnv): AppConfig {
  return {
    allowedDomain: getRequired("ALLOWED_DOMAIN", env.ALLOWED_DOMAIN),
    sessionSecret: getRequired("SESSION_SECRET", env.SESSION_SECRET),
    sessionCookieName: env.SESSION_COOKIE_NAME?.trim() || "__Host-candid_session",
    cookieSecure: env.COOKIE_SECURE !== "false",
    runIdPrefix: env.RUN_ID_PREFIX?.trim() || "run"
  };
}

export function isRole(value: string): value is Role {
  return ROLES.includes(value as Role);
}

export function isTool(value: string): value is Tool {
  return TOOLS.includes(value as Tool);
}

export function isRunStatus(value: string): value is RunStatus {
  return RUN_STATUSES.includes(value as RunStatus);
}
