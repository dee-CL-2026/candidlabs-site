# Runbook: Deploy to Production

> Step-by-step procedure for deploying changes to the production environment.

## Overview

`<Describe the deployment architecture: what deploys where, and how.>`

## Prerequisites

- `<Access requirements>`
- `<Tools required>`
- `<Environment setup>`

## Branching

1. Create a feature branch from the primary branch.
2. Make changes, commit, push to remote.
3. `<Describe preview/staging deploy process if applicable.>`
4. Test the preview deployment.

## Production Deploy

1. Merge feature branch to primary branch.
2. `<Describe auto-deploy or manual deploy steps.>`
3. Verify production.

## Database Migration Deploy

`<Describe how migrations are applied — automatically or manually.>`

1. Run the migration.
2. Verify via API or direct query.

## Rollback

### Application Rollback

`<Describe how to roll back a bad deploy.>`

### Database Rollback

`<Describe how to handle a bad migration. Note: many databases do not support automatic rollback of DDL.>`

## Checklist

- [ ] Preview/staging deploy tested
- [ ] Database migration applied (if applicable)
- [ ] API redeployed (if applicable)
- [ ] Production smoke test passed
- [ ] Documentation updated
