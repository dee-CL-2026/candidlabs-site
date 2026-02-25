CANDIDLABS — PARTNER WALKTHROUGH & QA
Version: 0.2 | Date: 2026-02-25
Site: https://candidlabs-hub.pages.dev

============================================================
WHAT IS THIS?

Candidlabs is our internal operations platform. It replaces
the scattered Google Sheets and GAS scripts with a single
web app covering CRM, prospecting, projects, reporting, and
production tools.

============================================================
SIGNING IN

You'll receive a login link to your registered email address.
On the login screen, choose "Sign in with One-time PIN", enter
your email, and check your inbox for a 6-digit code.

If your email is @candidmixers.com you can also use the
Google sign-in option.

============================================================
WHAT YOU'LL SEE

HOME (/)
  Your dashboard. Shows pipeline value, active deals, projects,
  and open tasks at a glance. Recent activity feed below.

CRM (/crm/)
  Contacts, companies, and deals pipeline. Three tabs:
  - Contacts — add/edit people (first name + last name),
    link them to companies. Each row has Email and WhatsApp
    quick-action icons to reach out directly.
  - Companies — accounts we're working with (markets, channels)
  - Deals — sales pipeline with list + kanban board view
  Click any name to open the detail drawer (slides in from right).
  Add/edit forms also slide in as drawers from the right.

PROSPECTING (/prospecting/)
  AI-driven lead discovery queue. This is where new venue
  leads land before they enter the CRM. Cards show:
  - Venue name, market, fit score, contact channels (WA/IG/Tel/Email)
  - AI-generated draft outreach message
  - Approve/reject actions for VA review
  - WA number verification (manual check via wa.me link)
  - "Migrate to CRM" graduates approved leads into the CRM
  Currently has 3 test prospects (Bali + Jakarta venues).

PROJECTS (/projects/)
  Project + task management. Three views:
  - Overview — project cards with progress bars
  - Projects — table view, add/edit/delete projects
  - Tasks — list + kanban view, filter by project/assignee/status
  Click any project card to open the drawer with tasks + notes.

  IMPORTANT: You will only see projects where you have been
  added as a collaborator (or listed as owner). If you don't
  see any projects, ask Dee to add you as a collaborator on
  the relevant ones.

REPORTS (/reports/)
  Links to dashboards. Only "Management Overview" is live —
  the rest are marked "Coming Soon".

MANAGEMENT OVERVIEW (/dashboard.html)
  KPI scorecards: cases sold, revenue, active outlets, markets.
  Financial metrics (margin, COGS, AR) visible to admin only.
  Embedded Looker Studio dashboard below.

TOOLS (nav dropdown)
  Quick links to external tools:
  - KAA Form (Google Form)
  - Quote Generator (Google Sheet)
  - Submit Expenses (Xero)

============================================================
WHAT YOU WON'T SEE

Some features are restricted to admin users. As a partner
you will not see:
- CSV Import / Export / Download Template buttons
- "Find Duplicates" buttons
- Delete buttons on records
- Financial metrics on the dashboard

This is expected — those tools are for internal data
management only.

============================================================
SIMPLE QA — PLEASE TRY THESE

Sign in at https://candidlabs-hub.pages.dev using the
One-time PIN method with your registered email. Work through
each item and note any issues (screenshot if possible).

GENERAL
[ ] Site loads, you see the homepage with your name
[ ] Dark/light theme toggle works (moon icon, top right)
[ ] All nav links work (CRM, Prospecting, Projects, Reports)
[ ] On mobile: hamburger menu opens and all links work

CRM
[ ] Open CRM — three tabs visible (Overview, Contacts, Companies/Deals)
[ ] Click a contact name — detail drawer slides open from right
[ ] Add a test contact (+ Add Contact) — drawer opens with
    First Name + Last Name fields; save it and it appears in the table
[ ] On a contact row, try the Email icon (opens mail client)
    and the WhatsApp icon (opens wa.me chat)
[ ] Add a test deal — it appears in list and kanban board
[ ] Comments: in a detail drawer, post a comment — it saves

PROSPECTING
[ ] Open Prospecting — you see 3 test prospect cards
[ ] Click a prospect name — detail drawer opens with full info
[ ] Try Approve on a pending prospect — status changes
[ ] Try "Copy Message" on a card with a draft message
[ ] Click the WA or IG link on a card — opens in new tab
[ ] Click "+ Add Manually" — drawer opens, fill in a test venue, save
[ ] Click "Verify" next to a WA number — modal shows manual + API options

PROJECTS
[ ] Open Projects — you see projects you've been added to
    (if empty, ask Dee to add you as collaborator on a project)
[ ] Click a project card — drawer opens with tasks + notes
[ ] Switch to Tasks tab — try list view and kanban view
[ ] Add a test task — it appears in both views
[ ] Change a task status — kanban card moves columns

REPORTS / DASHBOARD
[ ] Open Reports — tiles show, Management Overview links to dashboard
[ ] Dashboard loads with KPI cards (some may show placeholder data)

============================================================
FEEDBACK

For each section, note:
1. Does it work? (bugs, errors, things that don't load)
2. Does it make sense? (confusing layout, unclear labels)
3. What's missing? (features you expected but didn't see)

Send notes to Dee — screenshots are very helpful.
