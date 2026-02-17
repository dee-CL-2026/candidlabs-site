# Agent Instructions (Claude / Codex / Torque)

## Must-read canonical spec
- docs/specs/candidlabs-crm-projects_mvp-and-seams_v0.1.md

## Hard rules
1) Read the canonical spec before making recommendations or edits.
2) Do not change scope (auth/backend/refactors) unless the spec is updated first.
3) Keep diffs small: one concern per commit.
4) Local dev: use explicit paths for sub-app pages:
   - /crm/index.html
   - /projects/index.html
