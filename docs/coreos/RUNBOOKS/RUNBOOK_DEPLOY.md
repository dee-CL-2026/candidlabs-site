# Runbook: Deploy to Production

## Overview

Candidlabs deploys via Cloudflare Pages (static site) and Cloudflare Workers (API). Both deploy on push to `main`.

## Branching

1. Create a feature branch from `main`:
   ```
   git checkout -b feature/your-change
   ```
2. Make changes, commit, push to remote.
3. Cloudflare Pages automatically creates a **preview deploy** on the branch.
4. Test the preview URL (shown in Cloudflare dashboard or GitHub PR checks).

## Preview Testing

- Preview URL format: `https://<branch-slug>.candidlabs.pages.dev`
- Verify: page loads, nav works, API health check responds.
- If the change includes a D1 migration: the preview uses the **same D1 database** as production. Migrations are safe (additive only) but be aware of this.

## Production Deploy

1. Merge feature branch to `main` (via PR or direct push).
2. Cloudflare Pages auto-deploys within ~60 seconds.
3. Verify production: `https://candidlabs.pages.dev`

## D1 Migration Deploy

Migrations are **not auto-applied**. After merging:

1. Run the migration manually:
   ```
   cd api/
   npx wrangler d1 execute candidlabs-db --file=db/migrations/NNN_name.sql
   ```
2. Verify via API: create and read a record in the new collection.

## Worker Deploy

If `api/src/index.js` changed:

```
cd api/
npx wrangler deploy
```

## Rollback

### Static site rollback
- Cloudflare Pages → Deployments → click a previous deployment → "Rollback to this deploy".
- Instant. No downtime.

### Worker rollback
- Cloudflare dashboard → Workers → candidlabs-api → Deployments → rollback.
- Or: `git revert <commit>` → push to `main`.

### D1 rollback
- D1 migrations are **not reversible** via Cloudflare tooling.
- Write a new corrective migration (e.g., `DROP TABLE IF EXISTS` or `ALTER TABLE DROP COLUMN`).
- Never delete or modify existing migration files.

## Checklist

- [ ] Preview deploy tested
- [ ] D1 migration applied (if applicable)
- [ ] Worker redeployed (if `api/src/index.js` changed)
- [ ] Production smoke test passed
- [ ] Release log updated in `docs/COREOS_MANIFEST.md`
