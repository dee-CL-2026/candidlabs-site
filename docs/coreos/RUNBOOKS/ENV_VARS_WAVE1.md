# Wave 1 Environment Variables

Required environment variables for the GAS (Google Apps Script) adapter integration.

## Variables

| Variable | Purpose | Type | Configuration Location |
|---|---|---|---|
| `GAS_API_KEY` | Shared secret for authenticating requests between the Worker and GAS adapter endpoints. Both the Worker and the GAS webapp must share this value. | Secret | Cloudflare Dashboard > Workers & Pages > candidlabs-site > Settings > Variables > Encrypted |
| `GAS_DOCGEN_URL` | Full URL of the KAA document generator Google Apps Script webapp (e.g. `https://script.google.com/macros/s/.../exec`). | Non-secret | `wrangler.toml` under `[vars]` |
| `GAS_EMAIL_URL` | Full URL of the KAA email sender Google Apps Script webapp (e.g. `https://script.google.com/macros/s/.../exec`). | Non-secret | `wrangler.toml` under `[vars]` |

## Configuration

### Secrets (Cloudflare Dashboard)

Secrets must **never** be committed to the repository. Set them via the Cloudflare Dashboard or the Wrangler CLI:

```bash
npx wrangler secret put GAS_API_KEY
```

### Non-secrets (wrangler.toml)

Add non-secret URLs to the `[vars]` section of `wrangler.toml`:

```toml
[vars]
GAS_DOCGEN_URL = "https://script.google.com/macros/s/<deployment-id>/exec"
GAS_EMAIL_URL  = "https://script.google.com/macros/s/<deployment-id>/exec"
```

## Validation

The Worker should verify all three variables are present at startup. Missing variables should cause a clear error in the response rather than a silent failure.
