import { type Tool } from "../../config/env";

const TOOL_LABELS: Record<Tool, string> = {
  kaa: "KAA Generator",
  "sales-assets": "Sales Asset Generator",
  reports: "Report Generator",
  budget: "Budget Planner"
};

function pageChrome(title: string, content: string): string {
  return `<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: sans-serif; margin: 2rem; }
      nav a { margin-right: 0.75rem; }
      .tool-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem; }
      .card { border: 1px solid #ccc; border-radius: 6px; padding: 1rem; }
      button { padding: 0.45rem 0.85rem; }
      pre { background: #f6f6f6; padding: 0.75rem; overflow: auto; }
      .muted { color: #666; }
    </style>
  </head>
  <body>
    <nav>
      <a href="/tools">Tools</a>
      <a href="/login">Login</a>
      <form method="post" action="/auth/logout" style="display:inline;">
        <button type="submit">Logout</button>
      </form>
    </nav>
    ${content}
  </body>
</html>`;
}

export function renderToolsIndex(): string {
  return pageChrome(
    "Candidlabs Hub Tools",
    `<h1>Tools</h1>
<p class="muted">Phase 1 placeholders.</p>
<div id="user"></div>
<div class="tool-grid">
  <article class="card"><h2>${TOOL_LABELS.kaa}</h2><a href="/tools/kaa">Open</a></article>
  <article class="card"><h2>${TOOL_LABELS["sales-assets"]}</h2><a href="/tools/sales-assets">Open</a></article>
  <article class="card"><h2>${TOOL_LABELS.reports}</h2><a href="/tools/reports">Open</a></article>
  <article class="card"><h2>${TOOL_LABELS.budget}</h2><a href="/tools/budget">Open</a></article>
</div>
<script>
  fetch('/api/me').then(r => r.json()).then(data => {
    const el = document.getElementById('user');
    if (el) el.textContent = 'Signed in as: ' + data.email + ' (' + data.role + ')';
  }).catch(() => {});
</script>`
  );
}

export function renderToolPage(tool: Tool): string {
  const label = TOOL_LABELS[tool];
  return pageChrome(
    `${label} Stub`,
    `<h1>${label}</h1>
<p class="muted">Stub actions only. No real execution is performed.</p>
<div id="user"></div>
<p>
  <button id="run">Run (stub)</button>
  <button id="approve">Approve</button>
</p>
<pre id="status">No run yet.</pre>
<script>
  const tool = ${JSON.stringify(tool)};
  let latestRunId = null;
  const statusEl = document.getElementById('status');

  function setStatus(data) {
    statusEl.textContent = JSON.stringify(data, null, 2);
  }

  fetch('/api/me')
    .then(r => r.json())
    .then(data => {
      const el = document.getElementById('user');
      if (el) el.textContent = 'Signed in as: ' + data.email + ' (' + data.role + ')';
    })
    .catch(() => {});

  document.getElementById('run').addEventListener('click', async () => {
    const idempotencyKey = crypto.randomUUID();
    const res = await fetch('/api/tools/' + tool + '/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idempotencyKey, input: { source: 'ui' }, options: { dryRun: false } })
    });
    const data = await res.json();
    latestRunId = data.runId || latestRunId;
    setStatus(data);
  });

  document.getElementById('approve').addEventListener('click', async () => {
    if (!latestRunId) {
      setStatus({ error: 'Run first, then approve if authorised.' });
      return;
    }
    const res = await fetch('/api/tools/' + tool + '/runs/' + latestRunId + '/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision: 'approved', notes: 'Phase 1 stub approval' })
    });
    const data = await res.json();
    setStatus(data);
  });
</script>`
  );
}
