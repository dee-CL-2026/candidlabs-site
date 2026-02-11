/**
 * Platform Registry — single source of truth for all Candid Labs tools/modules.
 * Used by tools.html, index.html, and audit.html to render accurate state.
 */
var PLATFORM_REGISTRY = {
  hub: {
    id: 'core-os',
    name: 'CoreOS Hub',
    icon: '\u2699\uFE0F',
    description: 'Shared library providing configuration, menus, doc engine, health checks, and utilities for all spokes.',
    location: 'apps-script',
    modules: 16,
    capabilities: ['Global config (constants.js)', 'UI framework & menus', 'Document engine (CLDoc v1.0)', 'Health checks & diagnostics', 'Vault script auditing', 'Tab analysis']
  },

  spokes: [
    {
      id: 'production-master',
      name: 'Production Master',
      icon: '\uD83C\uDFED',
      description: 'Costing engine, inventory tracking, Xero/KMI production pipelines, and financial analytics.',
      location: 'apps-script',
      modules: 43,
      capabilities: ['SKU costing engine (waterfall pricing)', 'Xero month-end refresh', 'KMI production run parsing', 'Stock movement tracking', 'BOM extraction & import', 'AR/AP snapshots'],
      dataConnections: ['Xero API', 'KMI System', 'Google Sheets']
    },
    {
      id: 'sales-master',
      name: 'Sales Master',
      icon: '\uD83D\uDCCA',
      description: 'Gross margin calculations, channel performance metrics, deck builder, and revenue tracking.',
      location: 'apps-script',
      modules: 40,
      capabilities: ['Gross margin engine', 'Channel performance metrics', 'Deck metrics builder', 'Revenue master builder', 'SKU mapping & validation', 'Xero data transformation'],
      dataConnections: ['Production Master (COGS)', 'Xero API', 'Google Sheets']
    },
    {
      id: 'loan-tracker',
      name: 'Loan Tracker',
      icon: '\uD83C\uDFE6',
      description: 'Loan portfolio management with interest accrual calculations and statement generation.',
      location: 'apps-script',
      modules: 30,
      capabilities: ['Interest accrual engine', 'Statement generation (PDF/Doc)', 'Bulk transaction import', 'Loan rebuild & reconciliation', 'HTML forms for data entry'],
      dataConnections: ['Google Sheets', 'Google Docs', 'Google Drive']
    },
    {
      id: 'sales-tool',
      name: 'Sales Tool',
      icon: '\uD83D\uDCDD',
      description: 'Sales data management, transaction logging, and form-based data entry.',
      location: 'apps-script',
      modules: 24,
      capabilities: ['Transaction logging', 'Form-based data entry', 'Tab analysis', 'Data validation'],
      dataConnections: ['Google Sheets']
    },
    {
      id: 'kaa-generator',
      name: 'KAA Generator',
      icon: '\uD83D\uDCC4',
      description: 'Auto-generates Key Account Agreement documents from spreadsheet data and templates.',
      location: 'apps-script',
      modules: 30,
      capabilities: ['Document generation from templates', 'Rebate clause injection', 'Minimum volume agreements', 'Email notifications', 'Batch regeneration'],
      dataConnections: ['Google Sheets', 'Google Docs', 'Google Drive', 'Gmail']
    },
    {
      id: 'platform',
      name: 'Platform Utilities',
      icon: '\uD83D\uDD27',
      description: 'Discovery audits, CMS auditing, code flattening, and migration orchestration.',
      location: 'apps-script',
      modules: 9,
      capabilities: ['Discovery CMS audit', 'Code flattening', 'Master migration', 'Debug utilities'],
      dataConnections: ['Google Apps Script API']
    },
    {
      id: 'discovery-engine',
      name: 'Script Discovery Engine',
      icon: '\uD83D\uDD0D',
      description: 'Scans and catalogs all Google Apps Script files and functions across the platform.',
      location: 'apps-script',
      modules: 5,
      capabilities: ['GAS file scanning', 'Container auditing', 'Function cataloging'],
      dataConnections: ['Google Apps Script API']
    }
  ],

  webTools: [
    {
      id: 'budget-planner',
      name: 'Budget Planner',
      icon: '\uD83D\uDCC8',
      description: 'FY2026 budget planning with three-scenario P&L modeling, assumptions editor, and channel-based revenue breakdown.',
      location: 'web',
      status: 'active',
      href: 'budget.html'
    },
    {
      id: 'management-dashboard',
      name: 'Management Dashboard',
      icon: '\uD83D\uDCCB',
      description: 'Executive overview powered by Google Looker Studio with key business metrics.',
      location: 'web',
      status: 'active',
      href: 'dashboard.html'
    },
    {
      id: 'platform-overview',
      name: 'Platform Overview',
      icon: '\uD83C\uDFD7\uFE0F',
      description: 'Architecture map of the entire Candid Labs platform — hub, spokes, modules, and data flows.',
      location: 'web',
      status: 'active',
      href: 'audit.html'
    }
  ],

  planned: [
    {
      id: 'inventory-system',
      name: 'Inventory System',
      icon: '\uD83D\uDCE6',
      description: 'Stock levels and reorder management for inventory optimization.'
    },
    {
      id: 'vendor-portal',
      name: 'Vendor Portal',
      icon: '\uD83E\uDD1D',
      description: 'Supplier relationship management for vendor coordination and procurement.'
    }
  ],

  /** Compute summary stats */
  getStats: function() {
    var totalModules = this.hub.modules;
    for (var i = 0; i < this.spokes.length; i++) {
      totalModules += this.spokes[i].modules;
    }
    return {
      platformModules: this.spokes.length + 1,
      totalFiles: totalModules,
      liveWebTools: this.webTools.length,
      pendingIntegrations: this.spokes.length,
      planned: this.planned.length
    };
  }
};
