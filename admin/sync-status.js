// admin/sync-status.js — Sync Status panel for Xero ingestion
(function () {
  const API_BASE = window.API_BASE || '/api';

  async function loadStatus() {
    try {
      const resp = await fetch(`${API_BASE}/xero/sync-status`);
      const data = await resp.json();
      if (!data.ok) throw new Error(data.error?.message || 'Failed to load sync status');

      // Entity counts
      const counts = data.data.entity_counts || {};
      for (const [entity, count] of Object.entries(counts)) {
        const el = document.getElementById(`cnt-${entity}`);
        if (el) el.textContent = count.toLocaleString();
      }

      // Sync runs table
      const tbody = document.getElementById('syncRuns');
      const runs = data.data.runs || [];
      if (runs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9">No sync runs yet</td></tr>';
        return;
      }

      tbody.innerHTML = runs.map(r => `
        <tr>
          <td title="${r.id}">${r.id.slice(-8)}</td>
          <td>${r.sync_type || '-'}</td>
          <td>${r.entity_type || '-'}</td>
          <td>${r.month_key || '-'}</td>
          <td>${r.started_at ? new Date(r.started_at).toLocaleString() : '-'}</td>
          <td class="status-${r.status}">${r.status}</td>
          <td>${r.records_fetched ?? '-'}</td>
          <td>${r.records_upserted ?? '-'}</td>
          <td title="${r.error || ''}">${r.error ? r.error.slice(0, 40) + '...' : '-'}</td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load sync status:', err);
      document.getElementById('syncRuns').innerHTML =
        `<tr><td colspan="9" style="color:red;">${err.message}</td></tr>`;
    }
  }

  async function triggerSync(endpoint) {
    const logEl = document.getElementById('syncLog');
    logEl.style.display = 'block';
    logEl.textContent = `Triggering ${endpoint}...`;

    try {
      const resp = await fetch(`${API_BASE}${endpoint.startsWith('/api') ? endpoint.slice(4) : endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await resp.json();
      logEl.textContent = JSON.stringify(data, null, 2);
      loadStatus(); // Refresh
    } catch (err) {
      logEl.textContent = `Error: ${err.message}`;
    }
  }

  // Expose for onclick handlers
  window.triggerSync = triggerSync;

  // Initial load
  loadStatus();
})();
