# Candid Labs Master Roadmap

*Single source of truth for all Candid Labs development*

---

## 🎯 Platform Development (candidlabs site)

### Phase 1: Tool Connections
- [ ] Connect CoreOS Hub to Google Sheets
- [ ] Connect Production Master to Google Sheets
- [ ] Connect Sales Master to Google Sheets
- [ ] Connect Financial Tracker to Google Sheets
- [ ] Connect Loan Tracker to Google Sheets
- [ ] Connect KAA Generator to Google Sheets

### Phase 2: Dashboard Integration
- [ ] Embed Looker Studio dashboards
- [ ] Sales performance dashboard
- [ ] Production metrics dashboard
- [ ] Financial overview dashboard

### Phase 3: User Authentication & Access Roles
- [ ] Implement user login system
- [ ] Define access roles (Admin, Finance, Operations, Viewer)
- [ ] Role-based content visibility
- [ ] Secure tool access based on permissions

### Phase 4: Budget Planner Tool
- [x] Import PKF Indonesia historical financials (FY2024-2025)
- [x] Build assumptions engine (growth %, margins, headcount)
- [x] Scenario comparison (Conservative / Base / Stretch)
- [ ] P&L projection with monthly breakdown
- [ ] Section 2: Detailed Budget Planner improvements

### Phase 5: Homepage & UX Improvements
- [ ] Homepage hero/about section
- [ ] Scorecards with key metrics
- [ ] Configurable Quick Access for logged-in users
- [ ] External links (Submit Expenses, etc.)

### Phase 6: Tools Page Overhaul
- [ ] Reorganize tools (team-level vs admin)
- [ ] Define visibility rules
- [ ] Update layout and navigation

### Phase 7: candidCRM
- [ ] Add candidCRM to main navigation
- [ ] Contact/account management
- [ ] Task management
- [ ] Project management
- [ ] R&D tools/trackers

---

## 📊 BI Metrics Implementation (Looker)

*See [[Metric Tracker - Master List]] for full details*

**Total Metrics:** 184 (+ CRM placeholders TBD)
**Current Progress:** 0% shipped

### Metrics by Phase

| Phase | Dashboard | Metrics | Status |
|-------|-----------|---------|--------|
| Phase 1 | Exec | 12 | Not started |
| Phase 2 | Sales | 15 | Not started |
| Phase 3 | Ops | 9 | Not started |
| Phase 4 | Finance | 25 | Not started |
| Later | Master Only | 123 | Backlog |

### Priority Breakdown
- **Must-Have:** 63
- **Nice-to-Have:** 63
- **Future:** 58

### Data Sources
- `Sales_Looker` — sales volume, revenue, pricing
- `Production_Looker` — production, inventory, operations
- `Finance_Looker` — costs, margins, cash, AR/AP
- `Task_Management` — task tracking (future)

---

## 🗃️ Data Governance

*See [[candid-labs-tiered]] for doctrine details*

- [ ] Raw → Cleaned → Ready pipeline
- [ ] sales_master spoke implementation
- [ ] Data dictionary maintenance

---

## 💡 Ideas Pipeline

*See [[BRAINSTORM]] for idea backlog*

Ideas get promoted from BRAINSTORM → ROADMAP when approved.

---

## Related Docs

- [[Metric Tracker - Master List]]
- [[BRAINSTORM]]
- [[CL Doc_ Manifest 1.0]]
- [[CR Doc 3 - System Architecture]]

---

*Last updated: 2026-02-05*
