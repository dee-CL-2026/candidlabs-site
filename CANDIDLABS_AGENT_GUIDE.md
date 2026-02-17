# CANDIDLABS SITE — AGENT GUIDE

Scope:
- Applies ONLY to agents working inside THIS repository:
  - Claude Code sessions
  - Codex sessions
- Does NOT apply to:
  - OpenClaw
  - Torque agents
  - Any external orchestration layer

Canonical spec (must read first):
- docs/specs/candidlabs-crm-projects_mvp-and-seams_v0.1.md

Hard rules:
1) Read the canonical spec before making recommendations or edits.
2) Do not change scope (auth/backend/refactors) unless the spec is updated first.
3) Keep diffs small: one concern per commit.
4) Local dev routing: use explicit paths:
   - /crm/index.html
   - /projects/index.html
