# Candidlabs Hub (Phase 1 Foundation)

## Local development

1. Install dependencies:
   `npm install`
2. Create `.dev.vars` with:
   - `ALLOWED_DOMAIN`
   - `SESSION_SECRET`
   - `SESSION_COOKIE_NAME` (optional)
   - `COOKIE_SECURE` (optional; use `false` for local HTTP)
   - `RUN_ID_PREFIX` (optional)
3. Run dev worker:
   `npm run dev`

## D1 and KV bindings

- D1 binding name: `DB`
- KV binding name: `SESSION_KV`

Set real IDs in `wrangler.toml` before deployment.
