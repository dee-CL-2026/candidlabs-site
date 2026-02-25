/**
 * Candidlabs Identity Endpoint — Cloudflare Pages Function
 *
 * Route: GET /api/me
 *
 * Reads the `cf-access-authenticated-user-email` header injected by
 * Cloudflare Access and returns the current user's identity + role.
 *
 * This runs at the edge as part of the Pages site, so it always
 * receives the Access-injected header when the site is behind Access.
 *
 * Role resolution:
 *   - Listed in TEAM → use configured role
 *   - Any @candidmixers.com → default "team" role
 *   - Anything else → 403 (Access should have blocked these already)
 */

// Team roster — add members here as the team grows.
// role: 'admin' | 'partner' | 'team' | 'viewer'
const TEAM = [
  { email: 'dee@candidmixers.com', displayName: 'Dee', role: 'admin' },
  { email: 'anders@candidmixers.com', displayName: 'Anders', role: 'partner' },
  { email: 'jay@candidmixers.com', displayName: 'Jay', role: 'partner' },
  { email: 'partnerships@candidmixers.com', displayName: 'Alistair', role: 'partner' },
  { email: 'torqueassistant@gmail.com', displayName: 'Test Partner', role: 'partner' },
];

const ALLOWED_DOMAINS = ['candidmixers.com', 'candidlabs.com'];

function resolveUser(email) {
  const normalized = email.toLowerCase().trim();
  if (!normalized) return null;

  // Check explicit team roster first
  const member = TEAM.find(m => m.email === normalized);
  if (member) {
    return { email: normalized, displayName: member.displayName, role: member.role };
  }

  // Fallback: any allowed domain gets 'team' role
  const domain = normalized.split('@')[1] || '';
  if (ALLOWED_DOMAINS.includes(domain)) {
    const displayName = normalized.split('@')[0];
    return { email: normalized, displayName, role: 'team' };
  }

  return null; // Not allowed
}

export async function onRequest(context) {
  const rawEmail = context.request.headers.get('cf-access-authenticated-user-email') || '';
  const user = resolveUser(rawEmail);

  if (!rawEmail) {
    // No Access header — unauthenticated (local dev or Access misconfigured)
    return Response.json(
      { ok: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  if (!user) {
    // Email present but not in allowed domain
    return Response.json(
      { ok: false, error: 'Access denied for ' + rawEmail },
      { status: 403 }
    );
  }

  return Response.json({ ok: true, data: user });
}
