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
      .row { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
      .stack { display: grid; gap: 0.75rem; }
      .pill { display: inline-block; padding: 0.15rem 0.5rem; border: 1px solid #ddd; border-radius: 999px; font-size: 0.85rem; }
      .danger { border-color: #f0c0c0; background: #fff6f6; }
      input[type="text"] { padding: 0.5rem; }
      label { display:block; margin-top: 0.5rem; }
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

function toolClientScript(tool: Tool): string {
  // Phase 1 client: contract-pure requests and responses.
  // No extra API fields expected beyond runId/status/submittedAt.
  return `<script>
(function () {
  const TOOL = ${JSON.stringify(tool)};
  const runBtn = document.getElementById("runBtn");
  const approveBtn = document.getElementById("approveBtn");
  const statusEl = document.getElementById("status");
  const runIdEl = document.getElementById("runId");
  const submittedEl = document.getElementById("submittedAt");
  const lastRespEl = document.getElementById("lastResp");
  const lastErrEl = document.getElementById("lastErr");
  const notesEl = document.getElementById("notes");
  const decisionEl = document.getElementById("decision");
  const idempotencyEl = document.getElementById("idempotencyKey");

  function setText(el, value) {
    if (!el) return;
    el.textContent = value == null ? "" : String(value);
  }

  function setVisible(el, visible) {
    if (!el) return;
    el.style.display = visible ? "" : "none";
  }

  function showError(msg) {
    setText(lastErrEl, msg);
    setVisible(lastErrEl, !!msg);
  }

  function showResponse(obj) {
    setText(lastRespEl, JSON.stringify(obj, null, 2));
    setVisible(lastRespEl, true);
  }

  async function api(path, method, body) {
    const res = await fetch(path, {
      method,
      headers: { "content-type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = (data && data.error) ? data.error : ("HTTP " + res.status);
      throw new Error(msg);
    }
    return data;
  }

  function updateFromEnvelope(env) {
    setText(runIdEl, env.runId || "");
    setText(statusEl, env.status || "");
    setText(submittedEl, env.submittedAt || "");
    // Approval UI logic (client-side): only show if status requires it.
    setVisible(approveBtn, env.status === "needs_approval");
  }

  async function refresh(runId) {
    const env = await api("/api/tools/" + TOOL + "/runs/" + encodeURIComponent(runId), "GET");
    updateFromEnvelope(env);
    showResponse(env);
  }

  async function runTool() {
    showError("");
    const idem = (idempotencyEl && idempotencyEl.value) ? idempotencyEl.value.trim() : "";
    const idempotencyKey = idem || crypto.randomUUID();

    // Minimal stub input; tool-specific shape comes later.
    const payload = {
      idempotencyKey,
      input: { stub: true, tool: TOOL },
      options: { dryRun: false }
    };

    const env = await api(`\/api\/tools\/\${TOOL}\/run`, "POST", payload);
    updateFromEnvelope(env);
    showResponse(env);

    // Persist last runId in sessionStorage to allow refresh/approve flows.
    if (env.runId) sessionStorage.setItem("lastRunId:" + TOOL, env.runId);
  }

  async function approveRun() {
    showError("");
    const runId = (runIdEl && runIdEl.textContent) || sessionStorage.getItem("lastRunId:" + TOOL) || "";
    if (!runId) throw new Error("No runId available to approve.");
    const decision = decisionEl ? decisionEl.value : "approved";
    const notes = notesEl ? notesEl.value.trim() : "";

    const payload = { decision, notes: notes || undefined };
    const env = await api(`\/api\/tools\/\${TOOL}\/runs\/\${encodeURIComponent(runId)}\/approve`, "POST", payload);
    updateFromEnvelope(env);
    showResponse(env);
  }

  if (runBtn) runBtn.addEventListener("click", () => runTool().catch(e => showError(e.message)));
  if (approveBtn) approveBtn.addEventListener("click", () => approveRun().catch(e => showError(e.message)));

  // On load, try to refresh last run if present.
  const last = sessionStorage.getItem("lastRunId:" + TOOL);
  if (last) refresh(last).catch(() => {});
})();
</script>`;
}

export function renderToolsIndex(): string {
  return pageChrome(
    "Candidlabs Hub Tools",
    `<h1>Tools</h1>
<p class="muted">Phase 1 placeholders.</p>
<div class="tool-grid">
  <article class="card"><h2>${TOOL_LABELS.kaa}</h2><a href="/tools/kaa">Open</a></article>
  <article class="card"><h2>${TOOL_LABELS["sales-assets"]}</h2><a href="/tools/sales-assets">Open</a></article>
  <article class="card"><h2>${TOOL_LABELS.reports}</h2><a href="/tools/reports">Open</a></article>
  <article class="card"><h2>${TOOL_LABELS.budget}</h2><a href="/tools/budget">Open</a></article>
</div>`
  );
}

export function renderToolPage(tool: Tool): string {
  const title = `${TOOL_LABELS[tool]} — Phase 1`;
  const approvalNote =
    tool === "kaa" || tool === "reports"
      ? `<span class="pill">Approval lifecycle</span>`
      : `<span class="pill">RBAC only</span>`;

  return pageChrome(
    title,
    `<div class="stack">
  <div class="row">
    <h1 style="margin:0;">${TOOL_LABELS[tool]}</h1>
    ${approvalNote}
  </div>

  <p class="muted">Phase 1: contract-pure run → (optional approval) → status.</p>

  <section class="card">
    <h2 style="margin-top:0;">Run</h2>
    <label>Idempotency Key (optional)
      <input id="idempotencyKey" type="text" placeholder="leave blank to auto-generate" />
    </label>
    <div class="row" style="margin-top:0.75rem;">
      <button id="runBtn" type="button">Run (stub)</button>
    </div>
  </section>

  <section class="card">
    <h2 style="margin-top:0;">Status</h2>
    <div class="row">
      <div>runId: <code id="runId"></code></div>
      <div>status: <strong id="status"></strong></div>
      <div>submittedAt: <code id="submittedAt"></code></div>
    </div>
    <p id="lastErr" class="danger" style="display:none; padding:0.5rem; border:1px solid; border-radius:6px;"></p>
    <pre id="lastResp" style="display:none;"></pre>
  </section>

  <section class="card">
    <h2 style="margin-top:0;">Approval</h2>
    <p class="muted">Only relevant if status is <code>needs_approval</code> and your role permits approval.</p>
    <label>Decision
      <select id="decision">
        <option value="approved">approved</option>
        <option value="rejected">rejected</option>
      </select>
    </label>
    <label>Notes (optional)
      <input id="notes" type="text" placeholder="short note" />
    </label>
    <div class="row" style="margin-top:0.75rem;">
      <button id="approveBtn" type="button" style="display:none;">Approve / Reject</button>
    </div>
  </section>
</div>
${toolClientScript(tool)}`
  );
}
