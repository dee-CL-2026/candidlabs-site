import { type AppConfig, type AppEnv, type Role, isRole } from "../config/env";

export interface SessionUser {
  email: string;
  role: Role;
  name?: string;
}

interface SessionRecord {
  user: SessionUser;
  createdAt: string;
}

const sessionMemory = new Map<string, SessionRecord>();

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey || rest.length === 0) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

function setCookieHeader(cookieName: string, value: string, secure: boolean): string {
  const securePart = secure ? "Secure; " : "";
  return `${cookieName}=${encodeURIComponent(value)}; HttpOnly; ${securePart}Path=/; SameSite=Lax; Max-Age=86400`;
}

function clearCookieHeader(cookieName: string, secure: boolean): string {
  const securePart = secure ? "Secure; " : "";
  return `${cookieName}=; HttpOnly; ${securePart}Path=/; SameSite=Lax; Max-Age=0`;
}

function getStore(env: AppEnv): KVNamespace | null {
  return env.SESSION_KV || null;
}

async function signSessionId(sessionId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(sessionId));
  const hex = [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${sessionId}.${hex}`;
}

async function verifySignedSession(raw: string, secret: string): Promise<string | null> {
  const [sessionId, signature] = raw.split(".");
  if (!sessionId || !signature) return null;
  const expected = await signSessionId(sessionId, secret);
  return expected === raw ? sessionId : null;
}

export function isAllowedDomain(email: string, allowedDomain: string): boolean {
  const lowerEmail = email.toLowerCase();
  const suffix = `@${allowedDomain.toLowerCase()}`;
  return lowerEmail.endsWith(suffix);
}

export async function createSession(
  env: AppEnv,
  config: AppConfig,
  user: SessionUser
): Promise<{ sessionId: string; cookie: string }> {
  const sessionId = crypto.randomUUID();
  const record: SessionRecord = { user, createdAt: new Date().toISOString() };
  const store = getStore(env);
  if (store) {
    await store.put(sessionId, JSON.stringify(record), { expirationTtl: 86400 });
  } else {
    sessionMemory.set(sessionId, record);
  }
  return {
    sessionId,
    cookie: setCookieHeader(
      config.sessionCookieName,
      await signSessionId(sessionId, config.sessionSecret),
      config.cookieSecure
    )
  };
}

export async function destroySession(
  env: AppEnv,
  config: AppConfig,
  request: Request
): Promise<string> {
  const sessionId = getSessionIdFromRequest(config, request);
  if (sessionId) {
    const store = getStore(env);
    if (store) {
      await store.delete(sessionId);
    } else {
      sessionMemory.delete(sessionId);
    }
  }
  return clearCookieHeader(config.sessionCookieName, config.cookieSecure);
}

function getSessionIdFromRequest(config: AppConfig, request: Request): string | null {
  const cookies = parseCookies(request.headers.get("Cookie"));
  return cookies[config.sessionCookieName] || null;
}

export async function loadSessionUser(
  env: AppEnv,
  config: AppConfig,
  request: Request
): Promise<SessionUser | null> {
  const rawSession = getSessionIdFromRequest(config, request);
  if (!rawSession) return null;
  const sessionId = await verifySignedSession(rawSession, config.sessionSecret);
  if (!sessionId) return null;

  const store = getStore(env);
  const raw = store ? await store.get(sessionId) : JSON.stringify(sessionMemory.get(sessionId));
  if (!raw) return null;

  let parsed: SessionRecord | undefined;
  try {
    parsed = JSON.parse(raw) as SessionRecord;
  } catch {
    return null;
  }

  if (!parsed || !parsed.user || !isRole(parsed.user.role) || !parsed.user.email) return null;
  return parsed.user;
}
