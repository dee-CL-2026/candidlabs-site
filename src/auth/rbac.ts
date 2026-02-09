import { type Role, type Tool } from "../config/env";

const VIEW_HUB_ROLES: Role[] = ["founder", "admin", "sales", "finance"];

const RUN_TOOL_ROLES: Record<Tool, Role[]> = {
  kaa: ["founder", "admin", "sales"],
  "sales-assets": ["founder", "admin", "sales"],
  reports: ["founder", "admin", "finance"],
  budget: ["admin", "finance"]
};

const APPROVE_TOOL_ROLES: Record<Tool, Role[]> = {
  kaa: ["founder", "admin"],
  "sales-assets": ["founder", "admin"],
  reports: ["founder", "admin", "finance"],
  budget: ["admin", "finance"]
};

export function canViewHub(role: Role): boolean {
  return VIEW_HUB_ROLES.includes(role);
}

export function canRunTool(role: Role, tool: Tool): boolean {
  return RUN_TOOL_ROLES[tool].includes(role);
}

export function canApproveTool(role: Role, tool: Tool): boolean {
  return APPROVE_TOOL_ROLES[tool].includes(role);
}
