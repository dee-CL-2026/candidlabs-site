# Runbook: Xero OAuth Connect

> End-to-end steps to create a Xero app, configure OAuth, store tokens, and verify first sync.

## Prerequisites

- Admin access to Xero Developer Portal (developer.xero.com)
- Wrangler CLI installed and authenticated
- D1 migration 011_xero.sql applied

## Step 1: Create Xero App (if not done)

1. Go to https://developer.xero.com/app/manage
2. Click "New app"
3. Fill in:
   - **App name:** Candidlabs Platform
   - **Integration type:** Web app
   - **Company or application URL:** `https://candidlabs.pages.dev`
   - **Redirect URI:** `https://candidlabs-api.dieterwerwath.workers.dev/api/auth/xero/callback`
4. Save. Note the **Client ID** and generate a **Client Secret**.

## Step 2: Set Secrets via Wrangler

```bash
cd api/
wrangler secret put XERO_CLIENT_ID
# Paste Client ID when prompted

wrangler secret put XERO_CLIENT_SECRET
# Paste Client Secret when prompted
```

These are stored as encrypted secrets — never in `wrangler.toml` or git.

The following are set as `[vars]` in `wrangler.toml` (already committed):
- `XERO_REDIRECT_URI` = `https://candidlabs-api.dieterwerwath.workers.dev/api/auth/xero/callback`
- `XERO_SCOPES` = `offline_access accounting.transactions.read accounting.contacts.read accounting.settings.read`
- `APP_BASE_URL` = `https://candidlabs.pages.dev`

## Step 3: Apply D1 Migration

```bash
cd api/
npx wrangler d1 execute candidlabs --remote --file=db/migrations/011_xero.sql
```

Verify tables created:
```bash
npx wrangler d1 execute candidlabs --remote --command="SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'xero_%' OR name = 'sync_runs'"
```

Expected: `xero_tokens`, `xero_invoices`, `xero_line_items`, `xero_items`, `xero_contacts`, `sync_runs`.

## Step 4: Deploy Worker

```bash
npx wrangler deploy
```

## Step 5: Initiate OAuth Flow

1. Navigate to `/sales/` in the platform (admin role required).
2. Click "Xero Sync" in the sidebar.
3. Click "Connect Xero" button.
4. This redirects to `GET /api/auth/xero/start` → Xero authorization page.
5. Authorize the app in Xero.
6. Xero redirects to `/api/auth/xero/callback` → exchanges code for tokens → stores in `xero_tokens` → redirects to `/sales/?xero=connected`.

## Step 6: Verify Connection

```bash
curl -s "https://candidlabs-api.dieterwerwath.workers.dev/api/auth/xero/status" | python3 -m json.tool
```

Expected:
```json
{
  "ok": true,
  "connected": true,
  "tenant_id": "...",
  "token_expired": false,
  "expires_at": "2026-...",
  "connected_at": "2026-..."
}
```

## Step 7: Run First Sync

Via UI: Click "Sync Current Month" in the Xero Sync panel.

Via CLI:
```bash
# Current month
curl -s -X POST "https://candidlabs-api.dieterwerwath.workers.dev/api/sales/sync-xero" | python3 -m json.tool

# Specific month
curl -s -X POST "https://candidlabs-api.dieterwerwath.workers.dev/api/sales/sync-xero?month_key=2026-01" | python3 -m json.tool

# Backfill range
curl -s -X POST "https://candidlabs-api.dieterwerwath.workers.dev/api/sales/sync-xero/backfill?from=2025-01&to=2026-02" | python3 -m json.tool
```

Check sync history:
```bash
curl -s "https://candidlabs-api.dieterwerwath.workers.dev/api/sync_runs" | python3 -m json.tool
```

## Step 8: Cron (Automatic)

The daily cron trigger is configured in `wrangler.toml`:
```toml
[triggers]
crons = ["0 23 * * *"]  # 06:00 WIB = 23:00 UTC previous day
```

It syncs the current month and previous month automatically.

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| OAuth redirect fails | Wrong redirect URI | Verify XERO_REDIRECT_URI in wrangler.toml matches Xero app config exactly |
| Token refresh fails | Refresh token expired (60 days inactivity) | Re-run OAuth flow from Step 5 |
| 429 rate limit | Too many API calls | Check sync_runs for frequency. Reduce sync calls. |
| Empty sync results | Wrong tenant_id | Check xero_tokens. Disconnect and re-authorize. |
| "Xero not connected" error | No tokens in DB | Run OAuth flow (Step 5) |

## Token Lifecycle

- Access token: valid 30 minutes.
- Refresh token: valid 60 days of inactivity. Rotates on each use.
- Tokens stored in D1 `xero_tokens` table (single row, id='default').
- Auto-refresh: `getXeroAccessToken()` helper refreshes automatically when expired.
