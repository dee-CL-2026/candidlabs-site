/**
 * Seed Data Script — Run once to populate D1 with real project/task data.
 *
 * Usage: Open the browser console on any candidlabs page where CandidStore
 * is loaded, paste this script, and run it. Or load as <script src="seed-data.js">
 * on a one-time basis.
 *
 * Idempotency: Checks if data already exists before seeding.
 */

(function () {
  'use strict';

  var API_BASE = 'https://candidlabs-api.dieterwerwath.workers.dev/api';

  function post(collection, record) {
    return fetch(API_BASE + '/' + collection, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    }).then(function (res) { return res.json(); });
  }

  // ---- Projects ----
  var projects = [
    { name: 'Holywings Group Account', owner: 'Jules', status: 'active', description: 'Major hospitality group — recently signed, 150 cases/mo min, 11+ outlets', start_date: '2026-02-10', meta: JSON.stringify({ collaborators: ['Dieter', 'Mirzan', 'Anders'] }) },
    { name: 'SKD Partnership & Distribution', owner: 'Dieter', status: 'active', description: 'Core distributor — monthly alignment, rebates, event planning', start_date: '2026-01-05', meta: JSON.stringify({ collaborators: ['Jules', 'Mirzan', 'Ferry'] }) },
    { name: 'Jakarta Account Recovery', owner: 'Jules', status: 'active', description: 'Rebuilding lost accounts: CJ\'s, Hotel Mulia, Basque, Swill Farm', start_date: '2026-01-12', meta: JSON.stringify({ collaborators: ['Alistair', 'Mirzan'] }) },
    { name: 'Indonesia Regional Expansion', owner: 'Jules', status: 'active', description: 'Branch visits (Bandung, Makassar, Malang), post-Ramadan roadshows', start_date: '2026-01-20', meta: JSON.stringify({ collaborators: ['Mirzan', 'Dieter'] }) },
    { name: 'New SKU Development', owner: 'Jay', status: 'active', description: 'Green tea (4 variants) + lime soda (4 variants), launch Q2-Q3', start_date: '2026-01-15', meta: JSON.stringify({ collaborators: ['Dieter', 'Jules'] }) },
    { name: 'KMI Production Contract', owner: 'Dieter', status: 'active', description: '2026 agreement revision — payment terms, volume commitments', start_date: '2026-01-08', meta: JSON.stringify({ collaborators: ['Jay'] }) },
    { name: 'Investment & Fundraising', owner: 'Dieter', status: 'active', description: 'Pitch deck, Merrick buyout, 6-month timeline to funding', start_date: '2026-01-05', meta: JSON.stringify({ collaborators: ['Anders', 'Alistair'] }) },
    { name: 'CEO Recruitment', owner: 'Dieter', status: 'active', description: 'CEO candidate (Elliot) — face-to-face mid-late March', start_date: '2026-02-01', meta: JSON.stringify({ collaborators: ['Anders', 'Alistair'] }) },
    { name: 'PT Unisoda Governance', owner: 'Dieter', status: 'active', description: 'Commissioner replacement, Ministry formalization', start_date: '2026-01-05', meta: JSON.stringify({ collaborators: ['Anders', 'Alistair'] }) },
    { name: 'Financial Planning & Budget', owner: 'Dieter', status: 'active', description: '2026 budget (10-12B target), Xero reconciliation', start_date: '2026-01-05', meta: JSON.stringify({ collaborators: ['Anders', 'Ferry'] }) },
    { name: 'Vietnam Market Expansion', owner: 'Anders', status: 'active', description: 'Alchemy Group partnership, budget trip planned', start_date: '2026-02-01', meta: JSON.stringify({ collaborators: ['Dieter'] }) },
    { name: 'CRM & Database Building', owner: 'Ferry', status: 'active', description: 'Contact database across all accounts, SKD branches, PICs', start_date: '2026-01-20', meta: JSON.stringify({ collaborators: ['Jules', 'Mirzan', 'Dieter'] }) },
    { name: 'Candidlabs Platform', owner: 'Dieter', status: 'active', description: 'Internal ops platform — CRM, Projects, Prospecting, Dashboards', start_date: '2026-02-01', meta: JSON.stringify({ collaborators: ['Ferry'] }) }
  ];

  // ---- Tasks (keyed by project name) ----
  var tasksByProject = {
    'Holywings Group Account': [
      { title: 'Push SKD for Holywings rebate process details', assignee: 'Jules', priority: 'high', status: 'to-do' },
      { title: 'Follow up daily with Holywings to maintain engagement', assignee: 'Jules', priority: 'high', status: 'in-progress' },
      { title: 'Build full list of all Holywings outlets', assignee: 'Jules', priority: 'high', status: 'to-do' },
      { title: 'Arrange meeting with Fanny to discuss Holywings win', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Monitor and chase initial orders', assignee: 'Dieter', priority: 'high', status: 'in-progress' }
    ],
    'SKD Partnership & Distribution': [
      { title: 'Push SKD for detailed branch data and sales projections', assignee: 'Jules', priority: 'high', status: 'to-do' },
      { title: 'Arrange monthly meeting with Sukanda Jakarta team', assignee: 'Jules', priority: 'medium', status: 'to-do' },
      { title: 'Coordinate PMB/FOC 3-month depletion plan with Nares', assignee: 'Jules', priority: 'high', status: 'to-do' },
      { title: 'Get written policy from SKD on expired product returns', assignee: 'Mirzan', priority: 'medium', status: 'to-do' },
      { title: 'Raise product recall stock replacement with Mirzan', assignee: 'Dieter', priority: 'medium', status: 'to-do' }
    ],
    'Jakarta Account Recovery': [
      { title: 'Get contact details for CJ\'s F&B director', assignee: 'Alistair', priority: 'high', status: 'to-do' },
      { title: 'Push Hotel Mulia on event support budget (500 cases/mo min)', assignee: 'Jules', priority: 'medium', status: 'in-progress' },
      { title: 'Reconnect with CJ\'s manager (Ari) on pricing', assignee: 'Jules', priority: 'medium', status: 'to-do' },
      { title: 'Follow up with Swill Farm and Basque', assignee: 'Jules', priority: 'medium', status: 'to-do' },
      { title: 'Continue pushing ClubMed account opening', assignee: 'Anders', priority: 'high', status: 'in-progress' }
    ],
    'Indonesia Regional Expansion': [
      { title: 'Coordinate branch visits (Bandung, Makassar, Malang) with SKD', assignee: 'Jules', priority: 'high', status: 'to-do' },
      { title: 'Push for post-Ramadan roadshow dates from SKD', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Check with Nikki about Makassar trip timing', assignee: 'Jules', priority: 'medium', status: 'to-do' }
    ],
    'New SKU Development': [
      { title: 'Develop 4 green tea + 4 lime soda variants', assignee: 'Jay', priority: 'high', status: 'in-progress' },
      { title: 'Coordinate with KMI for new variant production', assignee: 'Jules', priority: 'high', status: 'to-do' },
      { title: 'Launch two new SKUs in H2', assignee: 'Dieter', priority: 'high', status: 'to-do' }
    ],
    'KMI Production Contract': [
      { title: 'Prepare new 2026 contract proposal', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Meet face-to-face with Pad to discuss revised agreement', assignee: 'Dieter', priority: 'high', status: 'to-do' }
    ],
    'Investment & Fundraising': [
      { title: 'Start building skeleton of pitch deck', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Share updated valuation models for Merrick buyout', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Develop detailed 10-month roadmap (sales, dev, fundraising)', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Begin building investment deck (6-month timeline)', assignee: 'Dieter', priority: 'high', status: 'to-do' }
    ],
    'CEO Recruitment': [
      { title: 'Schedule face-to-face group meeting including Anders', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Evaluate Elliot — face-to-face mid-late March', assignee: 'Dieter', priority: 'high', status: 'to-do' }
    ],
    'PT Unisoda Governance': [
      { title: 'Formalize Commissioner replacement with Ministry', assignee: 'Dieter', priority: 'high', status: 'in-progress' },
      { title: 'Circulate board meeting minutes', assignee: 'Dieter', priority: 'medium', status: 'to-do' },
      { title: 'Formally notify KMI that Marek no longer involved', assignee: 'Dieter', priority: 'high', status: 'to-do' }
    ],
    'Financial Planning & Budget': [
      { title: 'Send 2024/2025 financial data to Anders', assignee: 'Dieter', priority: 'high', status: 'to-do' },
      { title: 'Follow up with PKF on subscription recording', assignee: 'Ferry', priority: 'high', status: 'to-do' },
      { title: 'Review all petty cash transactions and attach missing invoices', assignee: 'Ferry', priority: 'high', status: 'to-do' },
      { title: 'Write and implement expenses policy', assignee: 'Dieter', priority: 'medium', status: 'to-do' }
    ],
    'CRM & Database Building': [
      { title: 'Collect and share contact details from all SKD interactions', assignee: 'Jules', priority: 'high', status: 'in-progress' },
      { title: 'Start building database of contacts (names, numbers, positions)', assignee: 'Jules', priority: 'high', status: 'in-progress' },
      { title: 'Share existing SKD org chart and continue updating', assignee: 'Mirzan', priority: 'medium', status: 'to-do' },
      { title: 'Incentivize SKD staff to collect account contact details', assignee: 'Dieter', priority: 'medium', status: 'to-do' }
    ],
    'Candidlabs Platform': [
      { title: 'Implement auth + role system', assignee: 'Dieter', priority: 'high', status: 'in-progress' },
      { title: 'Wire dashboard with live data', assignee: 'Dieter', priority: 'medium', status: 'to-do' },
      { title: 'Build AI prospecting pipeline', assignee: 'Dieter', priority: 'high', status: 'done' },
      { title: 'Migrate Projects to D1 backend', assignee: 'Dieter', priority: 'high', status: 'in-progress' }
    ]
  };

  // ---- Execute ----
  async function seed() {
    // Check if data already exists
    var existingRes = await fetch(API_BASE + '/projects');
    var existing = await existingRes.json();
    if (existing.data && existing.data.length > 5) {
      console.log('Seed skipped: ' + existing.data.length + ' projects already exist in D1.');
      return;
    }

    console.log('Seeding ' + projects.length + ' projects...');
    var projectMap = {};

    for (var i = 0; i < projects.length; i++) {
      var p = projects[i];
      var res = await post('projects', p);
      if (res.ok && res.data) {
        projectMap[p.name] = res.data.id;
        console.log('  Project: ' + p.name + ' → ' + res.data.id);
      } else {
        console.error('  Failed to create project: ' + p.name, res);
      }
    }

    var taskCount = 0;
    for (var projName in tasksByProject) {
      var projectId = projectMap[projName];
      if (!projectId) {
        console.warn('  No project ID for: ' + projName);
        continue;
      }
      var tasks = tasksByProject[projName];
      for (var j = 0; j < tasks.length; j++) {
        var t = tasks[j];
        t.project_id = projectId;
        var tRes = await post('tasks', t);
        if (tRes.ok) {
          taskCount++;
        } else {
          console.error('  Failed to create task: ' + t.title, tRes);
        }
      }
    }

    console.log('Seed complete: ' + projects.length + ' projects, ' + taskCount + ' tasks.');
  }

  seed().catch(function (err) { console.error('Seed error:', err); });
})();
