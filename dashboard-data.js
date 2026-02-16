/**
 * Dashboard Data Module
 *
 * Fetches live KPI data and populates the dashboard scorecards.
 *
 * Data source options (configure one):
 * 1. Google Apps Script Web App — deploy a doGet() that returns JSON KPI data
 * 2. Google Sheets published CSV — parse a published sheet range
 * 3. Static fallback — use hardcoded data for development/demo
 *
 * The module respects auth roles: admin-only KPI cards are hidden by
 * CandidAuth.applyRoleVisibility() in auth.js; this module only handles
 * data fetching and display.
 *
 * Expected JSON format from the data endpoint:
 * {
 *   "timestamp": "2026-02-17T10:00:00Z",
 *   "kpis": {
 *     "cases_ytd":      { "value": 12450, "format": "number" },
 *     "revenue_ytd":    { "value": 3240000000, "format": "currency_idr" },
 *     "active_outlets":  { "value": 87, "format": "number" },
 *     "markets_opened":  { "value": 12, "format": "number" },
 *     "gross_margin":    { "value": 0.42, "format": "percent" },
 *     "cogs_ytd":        { "value": 1880000000, "format": "currency_idr" },
 *     "production_ytd":  { "value": 14200, "format": "number" },
 *     "ar_outstanding":  { "value": 520000000, "format": "currency_idr" }
 *   }
 * }
 */

var DashboardData = (function () {
  'use strict';

  // ===========================================
  // Configuration
  // ===========================================

  // Google Apps Script Web App URL that returns KPI JSON.
  // Deploy as: Execute as "Me", Access "Anyone" (within org).
  // Replace with actual URL when deploying.
  var DATA_ENDPOINT = '';

  // Cache duration in milliseconds (5 minutes)
  var CACHE_DURATION = 5 * 60 * 1000;
  var CACHE_KEY = 'candidlabs_dashboard_cache';

  // ===========================================
  // Number Formatting
  // ===========================================

  /**
   * Format a value based on its format type.
   */
  function formatValue(value, format) {
    if (value === null || value === undefined) return '--';

    switch (format) {
      case 'number':
        return Number(value).toLocaleString('en-US');

      case 'currency_idr':
        // Show in billions/millions for readability
        var num = Number(value);
        if (num >= 1e9) {
          return 'Rp ' + (num / 1e9).toFixed(1) + 'B';
        } else if (num >= 1e6) {
          return 'Rp ' + (num / 1e6).toFixed(1) + 'M';
        } else if (num >= 1e3) {
          return 'Rp ' + (num / 1e3).toFixed(0) + 'K';
        }
        return 'Rp ' + num.toLocaleString('en-US');

      case 'percent':
        return (Number(value) * 100).toFixed(1) + '%';

      default:
        return String(value);
    }
  }

  // ===========================================
  // Data Fetching
  // ===========================================

  /**
   * Try to load data from localStorage cache.
   */
  function loadFromCache() {
    try {
      var cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      var parsed = JSON.parse(cached);
      var age = Date.now() - parsed.cachedAt;
      if (age > CACHE_DURATION) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return parsed.data;
    } catch (e) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }

  /**
   * Save data to localStorage cache.
   */
  function saveToCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        cachedAt: Date.now(),
        data: data
      }));
    } catch (e) {
      // Storage full or unavailable — ignore
    }
  }

  /**
   * Fetch KPI data from the configured endpoint.
   * Falls back to cache, then to demo data.
   */
  function fetchData(callback) {
    // Try cache first
    var cached = loadFromCache();
    if (cached) {
      callback(null, cached);
      return;
    }

    // If no endpoint configured, use demo data
    if (!DATA_ENDPOINT) {
      var demoData = getDemoData();
      callback(null, demoData);
      return;
    }

    // Fetch from endpoint
    var xhr = new XMLHttpRequest();
    xhr.open('GET', DATA_ENDPOINT, true);
    xhr.timeout = 10000;

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          saveToCache(data);
          callback(null, data);
        } catch (e) {
          callback('Failed to parse dashboard data');
        }
      } else {
        callback('Data endpoint returned status ' + xhr.status);
      }
    };

    xhr.onerror = function () {
      // Fall back to cache (even if expired) or demo data
      var stale = loadFromCache();
      if (stale) {
        callback(null, stale);
      } else {
        callback(null, getDemoData());
      }
    };

    xhr.ontimeout = function () {
      callback(null, getDemoData());
    };

    xhr.send();
  }

  /**
   * Demo data for development and when no endpoint is configured.
   * Replace with real endpoint in production.
   */
  function getDemoData() {
    return {
      timestamp: new Date().toISOString(),
      demo: true,
      kpis: {
        cases_ytd:      { value: 12450,      format: 'number' },
        revenue_ytd:    { value: 3240000000,  format: 'currency_idr' },
        active_outlets:  { value: 87,          format: 'number' },
        markets_opened:  { value: 12,          format: 'number' },
        gross_margin:    { value: 0.42,        format: 'percent' },
        cogs_ytd:        { value: 1880000000,  format: 'currency_idr' },
        production_ytd:  { value: 14200,       format: 'number' },
        ar_outstanding:  { value: 520000000,   format: 'currency_idr' }
      }
    };
  }

  // ===========================================
  // DOM Update
  // ===========================================

  /**
   * Populate KPI cards with fetched data.
   */
  function renderKPIs(data) {
    if (!data || !data.kpis) return;

    var kpiCards = document.querySelectorAll('[data-kpi]');
    kpiCards.forEach(function (card) {
      var key = card.getAttribute('data-kpi');
      var kpi = data.kpis[key];
      var valueEl = card.querySelector('.kpi-value');

      if (kpi && valueEl) {
        valueEl.textContent = formatValue(kpi.value, kpi.format);
        valueEl.classList.remove('kpi-loading');
      }
    });

    // Update timestamp
    var timestampEl = document.getElementById('data-timestamp');
    if (timestampEl && data.timestamp) {
      var dateStr = new Date(data.timestamp).toLocaleString();
      var prefix = data.demo ? 'Demo data' : 'Last updated';
      timestampEl.textContent = prefix + ': ' + dateStr;
    }
  }

  /**
   * Show error state on KPI cards.
   */
  function renderError(message) {
    var kpiCards = document.querySelectorAll('[data-kpi]');
    kpiCards.forEach(function (card) {
      var valueEl = card.querySelector('.kpi-value');
      if (valueEl) {
        valueEl.textContent = '--';
        valueEl.classList.remove('kpi-loading');
        valueEl.classList.add('kpi-error');
      }
    });

    var timestampEl = document.getElementById('data-timestamp');
    if (timestampEl) {
      timestampEl.textContent = 'Data unavailable: ' + message;
      timestampEl.style.color = 'var(--color-error)';
    }
  }

  // ===========================================
  // Initialize
  // ===========================================

  function init() {
    // Only run on pages with the KPI grid
    if (!document.getElementById('kpi-grid')) return;

    // Only fetch if user is authenticated
    if (typeof CandidAuth !== 'undefined' && !CandidAuth.isSignedIn()) return;

    fetchData(function (err, data) {
      if (err) {
        renderError(err);
      } else {
        renderKPIs(data);
      }
    });
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ===========================================
  // Public API (for manual refresh)
  // ===========================================
  return {
    refresh: function () {
      localStorage.removeItem(CACHE_KEY);
      init();
    }
  };

})();
