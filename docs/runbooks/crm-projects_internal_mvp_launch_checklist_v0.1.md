CANDIDLABS — CRM + PROJECTS — INTERNAL MVP LAUNCH CHECKLIST v0.1
Date:
Tester:
Branch:
Commit:

============================================================
A) Projects smoke test
[ ] Open /projects/index.html
[ ] Switch Overview → Projects → Tasks (no console errors)
[ ] Create Project (status=active)
[ ] Create Task linked to that Project
[ ] Delete Task (works)
[ ] Delete Project (works; cascades tasks if any remain)
[ ] Refresh page; data state is as expected

Notes:

============================================================
B) CRM smoke test
[ ] Open /crm/index.html
[ ] Create Company
[ ] Create Contact linked to Company
[ ] Create Deal linked to Company + Contact
[ ] Attempt delete Contact → must BLOCK (linked deals)
[ ] Attempt delete Company → must BLOCK (linked contacts/deals)
[ ] Delete Deal
[ ] Delete Contact (now succeeds)
[ ] Delete Company (now succeeds)
[ ] Refresh page; data state is as expected

Notes:

============================================================
RESULT
Projects: PASS / FAIL
CRM: PASS / FAIL
