/**
 * CandidStore — Data Adapter Layer
 *
 * Unified data access for CRM and Projects modules.
 * Talks to the Worker API (/api/{collection}) when available,
 * falls back to localStorage for offline/local dev.
 *
 * All methods return Promises.
 *
 * Collections: contacts, companies, deals, projects, tasks
 */

var CandidStore = (function () {
  'use strict';

  var API_BASE = 'https://candidlabs-api.dieterwerwath.workers.dev/api';
  var _useApi = true; // Will be set to false if API is unreachable

  // ============================================================
  // Case conversion: JS uses camelCase, D1 uses snake_case
  // ============================================================

  function toSnake(str) {
    return str.replace(/([A-Z])/g, function (m) { return '_' + m.toLowerCase(); });
  }

  function toCamel(str) {
    return str.replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); });
  }

  function keysToSnake(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    var out = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        out[toSnake(key)] = obj[key];
      }
    }
    return out;
  }

  function keysToCamel(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
    var out = {};
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        out[toCamel(key)] = obj[key];
      }
    }
    return out;
  }

  function arrayToCamel(arr) {
    return arr.map(keysToCamel);
  }

  // ============================================================
  // localStorage fallback
  // ============================================================

  var LS_KEYS = {
    contacts: 'crm_contacts',
    companies: 'crm_companies',
    deals: 'crm_deals',
    projects: 'pm_projects',
    tasks: 'pm_tasks',
    rnd_projects: 'rnd_projects',
    rnd_documents: 'rnd_documents',
    rnd_trial_entries: 'rnd_trial_entries',
    rnd_stage_history: 'rnd_stage_history',
    rnd_approvals: 'rnd_approvals',
    skus: 'rnd_skus'
  };

  function lsLoad(collection) {
    var raw = localStorage.getItem(LS_KEYS[collection]);
    if (raw) {
      try { return JSON.parse(raw); }
      catch (e) { return []; }
    }
    return null;
  }

  function lsSave(collection, data) {
    localStorage.setItem(LS_KEYS[collection], JSON.stringify(data));
  }

  // ============================================================
  // API helpers
  // ============================================================

  function apiFetch(path, opts) {
    return fetch(API_BASE + path, opts).then(function (res) {
      if (!res.ok && res.status >= 500) throw new Error('API error ' + res.status);
      return res.json();
    });
  }

  function checkApi() {
    return fetch(API_BASE + '/health', { method: 'GET' })
      .then(function (res) { return res.ok; })
      .catch(function () { return false; });
  }

  // ============================================================
  // Public API — all methods return Promises
  // ============================================================

  function load(collection, opts) {
    if (!_useApi) {
      return Promise.resolve(lsLoad(collection) || []);
    }
    var query = '';
    if (opts) {
      var params = [];
      if (opts.search) params.push('search=' + encodeURIComponent(opts.search));
      if (opts.filter && opts.filterCol) {
        params.push('filter=' + encodeURIComponent(opts.filter));
        params.push('filterCol=' + encodeURIComponent(opts.filterCol));
      }
      if (params.length) query = '?' + params.join('&');
    }
    return apiFetch('/' + collection + query)
      .then(function (body) { return arrayToCamel(body.data || []); })
      .catch(function () { return lsLoad(collection) || []; });
  }

  function get(collection, id) {
    if (!_useApi) {
      var all = lsLoad(collection) || [];
      var item = null;
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) { item = all[i]; break; }
      }
      return Promise.resolve(item);
    }
    return apiFetch('/' + collection + '/' + id)
      .then(function (body) { return body.data ? keysToCamel(body.data) : null; })
      .catch(function () { return null; });
  }

  function create(collection, record) {
    if (!_useApi) {
      var all = lsLoad(collection) || [];
      all.push(record);
      lsSave(collection, all);
      return Promise.resolve(record);
    }
    return apiFetch('/' + collection, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToSnake(record))
    }).then(function (body) {
      return body.data ? keysToCamel(body.data) : record;
    }).catch(function () {
      var all = lsLoad(collection) || [];
      all.push(record);
      lsSave(collection, all);
      return record;
    });
  }

  function update(collection, id, fields) {
    if (!_useApi) {
      var all = lsLoad(collection) || [];
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) {
          for (var k in fields) {
            if (Object.prototype.hasOwnProperty.call(fields, k)) {
              all[i][k] = fields[k];
            }
          }
          break;
        }
      }
      lsSave(collection, all);
      return Promise.resolve(all.find(function (x) { return x.id === id; }));
    }
    return apiFetch('/' + collection + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToSnake(fields))
    }).then(function (body) {
      return body.data ? keysToCamel(body.data) : null;
    }).catch(function () {
      return null;
    });
  }

  function remove(collection, id) {
    if (!_useApi) {
      var all = lsLoad(collection) || [];
      var filtered = all.filter(function (x) { return x.id !== id; });
      lsSave(collection, filtered);
      return Promise.resolve(true);
    }
    return apiFetch('/' + collection + '/' + id, { method: 'DELETE' })
      .then(function (body) { return body.ok; })
      .catch(function () { return false; });
  }

  function save(collection, data) {
    lsSave(collection, data);
    return Promise.resolve();
  }

  // ============================================================
  // Visibility functions (pure, for future enforcement)
  // ============================================================

  function canSee(user, entity) {
    if (user && user.role === 'admin') return true;
    if (!user || !entity) return false;

    var roles = entity.visibleToRoles;
    if (Array.isArray(roles) && roles.length > 0) {
      if (roles.indexOf(user.role) === -1) return false;
    }

    var teams = entity.visibleToTeams;
    if (Array.isArray(teams) && teams.length > 0 && user.team) {
      if (teams.indexOf(user.team) === -1) return false;
    }

    return true;
  }

  function filterForUser(user, entities) {
    if (!Array.isArray(entities)) return [];
    if (user && user.role === 'admin') return entities;
    return entities.filter(function (e) { return canSee(user, e); });
  }

  // ============================================================
  // Schema enums and defaults
  // ============================================================

  var TEAM_ENUM = ['leadership', 'sales', 'ops', 'rnd', 'tech', 'finance', 'va', 'marketing_partner'];
  var PROJECT_TYPE_ENUM = ['commercial', 'rnd', 'tech', 'operations', 'people', 'marketing'];

  var PROJECT_DEFAULTS = {
    projectType: 'operations',
    ownerTeam: 'leadership',
    visibleToRoles: ['admin'],
    visibleToTeams: [],
    visibilityMode: 'internal_only',
    orgId: 'candid',
    branchId: null,
    externalOrgId: null
  };

  var TASK_DEFAULTS = {
    ownerTeam: 'leadership',
    visibleToRoles: ['admin'],
    visibleToTeams: []
  };

  function applyDefaults(record, defaults) {
    var out = {};
    for (var k in record) {
      if (Object.prototype.hasOwnProperty.call(record, k)) out[k] = record[k];
    }
    for (var dk in defaults) {
      if (Object.prototype.hasOwnProperty.call(defaults, dk) && (out[dk] === undefined || out[dk] === null)) {
        var val = defaults[dk];
        out[dk] = Array.isArray(val) ? val.slice() : val;
      }
    }
    if (out.projectType && out.projectType !== 'commercial') {
      out.orgId = 'candid';
      out.branchId = null;
      out.externalOrgId = null;
    }
    if (Array.isArray(out.visibleToTeams) && out.visibleToTeams.length === 0 && out.ownerTeam) {
      out.visibleToTeams = [out.ownerTeam];
    }
    return out;
  }

  // ============================================================
  // Comments (always API-only — no localStorage fallback)
  // ============================================================

  function loadComments(recordType, recordId) {
    return fetch(API_BASE + '/comments?recordType=' + encodeURIComponent(recordType) + '&recordId=' + encodeURIComponent(recordId))
      .then(function (res) { return res.json(); })
      .then(function (body) { return arrayToCamel(body.data || []); })
      .catch(function () { return []; });
  }

  function postComment(recordType, recordId, commentBody) {
    var user = null;
    try { user = JSON.parse(localStorage.getItem('candidlabs_auth')); } catch (e) {}
    return fetch(API_BASE + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        record_type: recordType,
        record_id: recordId,
        author_email: user ? user.email : 'unknown@candidmixers.com',
        author_name: user ? user.name : 'Unknown',
        body: commentBody
      })
    }).then(function (res) { return res.json(); })
      .then(function (body) { return body.data ? keysToCamel(body.data) : null; });
  }

  function removeComment(id) {
    return fetch(API_BASE + '/comments/' + id, { method: 'DELETE' })
      .then(function (res) { return res.json(); })
      .then(function (body) { return body.ok; })
      .catch(function () { return false; });
  }

  // ============================================================
  // Init — probe API availability on load
  // ============================================================

  checkApi().then(function (ok) {
    _useApi = ok;
    if (!ok) console.info('CandidStore: API unreachable, using localStorage fallback');
  });

  // ============================================================
  // Public interface
  // ============================================================

  return {
    load: load,
    get: get,
    create: create,
    update: update,
    remove: remove,
    save: save,

    loadComments: loadComments,
    postComment: postComment,
    removeComment: removeComment,

    canSee: canSee,
    filterForUser: filterForUser,

    applyDefaults: applyDefaults,
    PROJECT_DEFAULTS: PROJECT_DEFAULTS,
    TASK_DEFAULTS: TASK_DEFAULTS,
    TEAM_ENUM: TEAM_ENUM,
    PROJECT_TYPE_ENUM: PROJECT_TYPE_ENUM,

    isApiMode: function () { return _useApi; },

    // Bulk import — POST to /{collection}/import, fallback to sequential create
    bulkCreate: function (collection, records) {
      if (!_useApi) {
        // localStorage fallback: sequential insert
        var all = lsLoad(collection) || [];
        records.forEach(function (r) { all.push(r); });
        lsSave(collection, all);
        return Promise.resolve({ imported: records.length, skipped: 0, errors: [], records: records });
      }

      var snakeRecords = records.map(function (r) { return keysToSnake(r); });

      return apiFetch('/' + collection + '/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: snakeRecords })
      }).then(function (body) {
        if (body.ok) {
          return {
            imported: body.data.imported || 0,
            skipped: body.data.skipped || 0,
            errors: body.data.errors || [],
            records: body.data.records ? arrayToCamel(body.data.records) : []
          };
        }
        throw new Error(body.error ? body.error.message : 'Import failed');
      }).catch(function (err) {
        // Fallback: sequential create if bulk endpoint not available
        if (err.message && err.message.indexOf('404') !== -1) {
          var results = { imported: 0, skipped: 0, errors: [], records: [] };
          var chain = Promise.resolve();
          snakeRecords.forEach(function (rec, idx) {
            chain = chain.then(function () {
              return apiFetch('/' + collection, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rec)
              }).then(function (body) {
                if (body.ok) {
                  results.imported++;
                  if (body.data) results.records.push(keysToCamel(body.data));
                } else {
                  results.errors.push({ row: idx + 1, error: body.error ? body.error.message : 'Failed' });
                }
              }).catch(function (e) {
                results.errors.push({ row: idx + 1, error: e.message || 'Failed' });
              });
            });
          });
          return chain.then(function () { return results; });
        }
        throw err;
      });
    }
  };
})();
