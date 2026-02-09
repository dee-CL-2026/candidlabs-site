import { type AppConfig, type AppEnv, type Tool } from "../config/env";
import { type SessionUser } from "../auth/session";

export interface AppContext {
  env: AppEnv;
  config: AppConfig;
  request: Request;
  user: SessionUser;
}

export async function handleToolsApi(_context: AppContext, _tool: Tool, _segments: string[]): Promise<Response> {
  return new Response(
    JSON.stringify({
      error: "Phase 1 API scaffold in progress"
    }),
    {
      status: 501,
      headers: { "content-type": "application/json; charset=utf-8" }
    }
  );
}
