# Runbook: Xero OAuth Connect

> End-to-end steps to create a Xero app, configure OAuth, store tokens, and verify first sync.

## Prerequisites

- Admin access to Xero Developer Portal (developer.xero.com)
- Cloudflare dashboard access (Worker env vars)
- D1 migration 007_xero.sql applied

## Step 1: Create Xero App

1. Go to https://developer.xero.com/app/manage
2. Click "New app"
3. Fill in:
   - **App name:** Candidlabs Platform
   - **Integration type:** Web app
   - **Company or application URL:** `https://candidlabs.pages.dev`
   - **Redirect URI:** `https://candidlabs.pages.dev/api/xero/callback`
4. Save. Note the **Client ID** and generate a **Client Secret**.

## Step 2: Configure Worker Env Vars

In Cloudflare dashboard → Workers → candidlabs-api → Settings → Variables:

```
XERO_CLIENT_ID     = <from step 1>
XERO_CLIENT_SECRET = <from step 1>
XERO_REDIRECT_URI  = https://candidlabs.pages.dev/api/xero/callback
XERO_WEBHOOK_KEY   = <generate a random 32-char string for HMAC verification>
```

Mark `XERO_CLIENT_SECRET` and `XERO_WEBHOOK_KEY` as **encrypted**.

## Step 3: Apply D1 Migration

```bash
cd api/
npx wrangler d1 execute candidlabs-db --file=db/migrations/007_xero.sql
```

Verify:
```bash
npx wrangler d1 execute candidlabs-db --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'xero_%'"
```

Expected: xero_tokens, xero_invoices, xero_line_items, xero_contacts, xero_items, xero_sync_log.

## Step 4: Initiate OAuth Flow

1. Navigate to `/admin/xero.html` in the platform.
2. Click "Connect to Xero".
3. This calls `POST /api/xero/connect` which redirects to Xero authorization.
4. Authorize the app in Xero.
5. Xero redirects back to `/api/xero/callback` with an authorization code.
6. Worker exchanges code for access + refresh tokens, stores in `xero_tokens`.

## Step 5: Verify Connection

```
GET /api/xero/status
```

Expected response:
```json
{
  "ok": true,
  "connected": true,
  "tenant_id": "...",
  "token_expires_at": "2026-...",
  "last_sync": null
}
```

## Step 6: Run First Sync

```
POST /api/xero/sync/all
```

This pulls:
- All invoices (ACCREC + ACCPAY)
- All items (product catalog)
- All contacts

Check sync log:
```sql
SELECT * FROM xero_sync_log ORDER BY started_at DESC LIMIT 5;
```

## Step 7: Configure Webhook (Optional)

1. In Xero Developer Portal → your app → Webhooks.
2. Set delivery URL: `https://candidlabs.pages.dev/api/xero/webhook`
3. Xero sends a validation request — the Worker must respond with the correct HMAC.
4. Once validated, Xero pushes invoice/contact changes in near-real-time.

## Step 8: Enable Daily Cron

Add to `wrangler.toml`:
```toml
[triggers]
crons = ["0 23 * * *"]  # 06:00 WIB = 23:00 UTC previous day
```

Redeploy Worker:
```bash
npx wrangler deploy
```

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| OAuth redirect fails | Wrong redirect URI | Verify XERO_REDIRECT_URI matches Xero app config exactly |
| Token refresh fails | Refresh token expired (60 days inactivity) | Re-run OAuth flow from Step 4 |
| 429 rate limit | Too many API calls | Check xero_sync_log for call counts. Reduce sync frequency. |
| Webhook validation fails | Wrong HMAC key | Verify XERO_WEBHOOK_KEY matches Xero app webhook key |
| Empty sync results | Wrong tenant_id | Check xero_tokens.tenant_id. Re-authorize if needed. |

## Token Lifecycle

- Access token: valid 30 minutes.
- Refresh token: valid 60 days of inactivity. Rotates on each use.
- Old refresh token has 30-minute grace period for retry.
- Store tokens atomically in D1 (single UPDATE on xero_tokens).
