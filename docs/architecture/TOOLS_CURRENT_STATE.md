# Tools – Current State (Evidence)

This document captures the known current state of tools based on targeted inspection. Items marked "Needs verification" must be confirmed in the tiered GAS repo.

---

## KAA Generator (GAS)

- Location: `tools/candid-labs/LEGACY/key-account-agreement-generator`
- Entrypoints:
  - Google Form submission
  - Spreadsheet menu actions
- Core scripts:
  - GenerateDoc.gs
  - Mapping.gs
  - Helpers.gs
  - Constants.gs
- Outputs:
  - Draft Google Doc
  - Canonical sheet record
- Status: Active (approval required)

---

## Sales Asset Generator (GAS – WIP)

- Location: `tools/candid-labs/LEGACY/sales-tool`
- Entrypoints:
  - `onOpen()` menu
  - `doGet()` serving Form.html
  - `generatePDF()` server-side
- Core scripts:
  - Menu.js
  - code.js
  - SetUp.js
  - constants.js
- Outputs:
  - Branded pricing PDF
- Status: Partial, needs verification

---

## Report Generator (GAS – WIP)

- Location: `tools/candid-labs/LEGACY/sales-master/ReportGenerator.js`
- Entrypoints:
  - Spreadsheet menu
  - UI prompt for month selection
- Data dependencies:
  - DECK_METRICS sheet
  - Slides template ID (Constants.js)
- Outputs:
  - Monthly partner deck
- Status: Partial, needs verification

---

## Budget Planner (Site)

- Location:
  - `sites/candidlabs-site/budget.html`
  - `budget.js`
  - `budget-data.js`
- Current run method:
  - Static client-side JS
- Risk:
  - Client-side sensitive data exposure
- Status:
  - UI-only; backend migration optional
