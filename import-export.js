/**
 * CandidIO — CSV Import/Export + Deduplication Library
 *
 * IIFE exposing CandidIO global. No external dependencies.
 * Custom CSV parser handles quoted fields, commas, escaped quotes.
 *
 * Functions: parseCSV, downloadTemplate, exportCSV, resolveFK,
 *            findDuplicates, findDuplicatesInSet, similarity, validateRows
 */

var CandidIO = (function () {
  'use strict';

  // ============================================================
  // CSV Parser — handles quoted fields, commas, escaped quotes
  // ============================================================

  function parseCSV(text) {
    if (!text || !text.trim()) return [];

    var lines = [];
    var current = '';
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < text.length && text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        if (ch === '\r' && i + 1 < text.length && text[i + 1] === '\n') i++;
        if (current.trim()) lines.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    if (current.trim()) lines.push(current);

    if (lines.length < 2) return [];

    var headers = _parseCSVLine(lines[0]).map(function (h) {
      return h.trim().replace(/\*$/, '');
    });
    var rows = [];
    for (var j = 1; j < lines.length; j++) {
      var values = _parseCSVLine(lines[j]);
      var row = {};
      for (var k = 0; k < headers.length; k++) {
        row[headers[k]] = (values[k] || '').trim();
      }
      row._row = j + 1;
      rows.push(row);
    }
    return rows;
  }

  function _parseCSVLine(line) {
    var fields = [];
    var current = '';
    var inQuotes = false;

    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current);
    return fields;
  }

  // ============================================================
  // Template Definitions
  // ============================================================

  var TEMPLATES = {
    contacts: {
      headers: ['first_name', 'last_name', 'email', 'phone', 'role', 'company_name', 'notes'],
      required: ['first_name'],
      example: { first_name: 'John', last_name: 'Doe', email: 'john@example.com', phone: '+62812345678', role: 'Account Manager', company_name: 'PT Example', notes: 'Met at trade show' }
    },
    companies: {
      headers: ['name', 'type', 'market', 'channel', 'status', 'notes'],
      required: ['name'],
      example: { name: 'PT Example', type: 'distributor', market: 'Jakarta', channel: 'Distributor', status: 'active', notes: 'Key account' }
    },
    projects: {
      headers: ['name', 'description', 'owner', 'status', 'start_date', 'due_date'],
      required: ['name'],
      example: { name: 'Q1 Launch', description: 'Product launch plan', owner: 'Dieter', status: 'active', start_date: '2026-01-01', due_date: '2026-03-31' }
    },
    tasks: {
      headers: ['title', 'project_name', 'assignee', 'status', 'priority', 'due_date'],
      required: ['title'],
      example: { title: 'Design mockups', project_name: 'Q1 Launch', assignee: 'Jules', status: 'to-do', priority: 'high', due_date: '2026-02-15' }
    }
  };

  // ============================================================
  // Template Download
  // ============================================================

  function downloadTemplate(collection) {
    var tmpl = TEMPLATES[collection];
    if (!tmpl) return;

    var csvContent = tmpl.headers.map(function (h) {
      return tmpl.required.indexOf(h) !== -1 ? h + '*' : h;
    }).join(',') + '\n';

    csvContent += tmpl.headers.map(function (h) {
      var val = tmpl.example[h] || '';
      if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1) {
        return '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    }).join(',') + '\n';

    _downloadBlob(csvContent, collection + '_template.csv', 'text/csv');
  }

  // ============================================================
  // Export CSV
  // ============================================================

  function exportCSV(collection, records, lookupData) {
    var tmpl = TEMPLATES[collection];
    if (!tmpl || !records.length) return;

    var companyMap = {};
    var projectMap = {};
    if (lookupData) {
      (lookupData.companies || []).forEach(function (c) { companyMap[c.id] = c.name; });
      (lookupData.projects || []).forEach(function (p) { projectMap[p.id] = p.name; });
    }

    var headerRow = tmpl.headers.join(',');
    var dataRows = records.map(function (rec) {
      return tmpl.headers.map(function (h) {
        var val = '';
        if (h === 'company_name') {
          val = companyMap[rec.companyId || rec.company_id] || '';
        } else if (h === 'project_name') {
          val = projectMap[rec.projectId || rec.project_id] || '';
        } else if (h === 'first_name') {
          val = rec.firstName || rec.first_name || '';
          if (!val && rec.name) {
            val = rec.name.split(' ')[0] || '';
          }
        } else if (h === 'last_name') {
          val = rec.lastName || rec.last_name || '';
          if (!val && rec.name) {
            var parts = rec.name.split(' ');
            val = parts.length > 1 ? parts.slice(1).join(' ') : '';
          }
        } else {
          var camel = h.replace(/_([a-z])/g, function (_, c) { return c.toUpperCase(); });
          val = rec[camel] !== undefined ? rec[camel] : (rec[h] !== undefined ? rec[h] : '');
        }
        val = String(val || '');
        if (val.indexOf(',') !== -1 || val.indexOf('"') !== -1 || val.indexOf('\n') !== -1) {
          return '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      }).join(',');
    });

    var csv = headerRow + '\n' + dataRows.join('\n') + '\n';
    var date = new Date().toISOString().slice(0, 10);
    _downloadBlob(csv, collection + '_export_' + date + '.csv', 'text/csv');
  }

  // ============================================================
  // FK Resolution
  // ============================================================

  function resolveFK(rows, collection, lookupData) {
    if (!lookupData) return rows;

    var companyMap = {};
    var projectMap = {};
    (lookupData.companies || []).forEach(function (c) {
      companyMap[(c.name || '').toLowerCase().trim()] = c.id;
    });
    (lookupData.projects || []).forEach(function (p) {
      projectMap[(p.name || '').toLowerCase().trim()] = p.id;
    });

    return rows.map(function (row) {
      var out = {};
      for (var k in row) {
        if (Object.prototype.hasOwnProperty.call(row, k)) out[k] = row[k];
      }

      if (collection === 'contacts' || collection === 'deals') {
        if (out.company_name) {
          var cid = companyMap[out.company_name.toLowerCase().trim()];
          if (cid) {
            out.company_id = cid;
            out._companyResolved = true;
          } else {
            out._companyResolved = false;
          }
        }
      }

      if (collection === 'tasks') {
        if (out.project_name) {
          var pid = projectMap[out.project_name.toLowerCase().trim()];
          if (pid) {
            out.project_id = pid;
            out._projectResolved = true;
          } else {
            out._projectResolved = false;
          }
        }
      }

      return out;
    });
  }

  // ============================================================
  // Deduplication — Import-time
  // ============================================================

  var DEDUPE_CONFIG = {
    contacts: {
      primaryMatch: function (row, existing) {
        if (!row.email) return null;
        var email = row.email.toLowerCase().trim();
        for (var i = 0; i < existing.length; i++) {
          if ((existing[i].email || '').toLowerCase().trim() === email) return existing[i];
        }
        return null;
      },
      secondaryMatch: function (row, existing) {
        var name = ((row.first_name || '') + ' ' + (row.last_name || '')).trim().toLowerCase();
        if (!name) return null;
        for (var i = 0; i < existing.length; i++) {
          var e = existing[i];
          var eName = ((e.firstName || e.first_name || '') + ' ' + (e.lastName || e.last_name || e.name || '')).trim().toLowerCase();
          if (similarity(name, eName) >= 0.85) return e;
        }
        return null;
      }
    },
    companies: {
      primaryMatch: function (row, existing) {
        var name = (row.name || '').toLowerCase().trim();
        if (!name) return null;
        for (var i = 0; i < existing.length; i++) {
          if ((existing[i].name || '').toLowerCase().trim() === name) return existing[i];
        }
        return null;
      },
      secondaryMatch: function (row, existing) {
        var name = (row.name || '').toLowerCase().trim();
        if (!name) return null;
        for (var i = 0; i < existing.length; i++) {
          if (similarity(name, (existing[i].name || '').toLowerCase().trim()) >= 0.80) return existing[i];
        }
        return null;
      }
    },
    projects: {
      primaryMatch: function (row, existing) {
        var name = (row.name || '').toLowerCase().trim();
        if (!name) return null;
        for (var i = 0; i < existing.length; i++) {
          if ((existing[i].name || '').toLowerCase().trim() === name) return existing[i];
        }
        return null;
      },
      secondaryMatch: function (row, existing) {
        var name = (row.name || '').toLowerCase().trim();
        if (!name) return null;
        for (var i = 0; i < existing.length; i++) {
          if (similarity(name, (existing[i].name || '').toLowerCase().trim()) >= 0.80) return existing[i];
        }
        return null;
      }
    },
    tasks: {
      primaryMatch: function (row, existing) {
        var title = (row.title || '').toLowerCase().trim();
        var pid = row.project_id || '';
        if (!title) return null;
        for (var i = 0; i < existing.length; i++) {
          var e = existing[i];
          if ((e.title || '').toLowerCase().trim() === title &&
              (e.projectId || e.project_id || '') === pid) return e;
        }
        return null;
      },
      secondaryMatch: function (row, existing) {
        var title = (row.title || '').toLowerCase().trim();
        var pid = row.project_id || '';
        if (!title) return null;
        for (var i = 0; i < existing.length; i++) {
          var e = existing[i];
          if ((e.projectId || e.project_id || '') === pid &&
              similarity(title, (e.title || '').toLowerCase().trim()) >= 0.85) return e;
        }
        return null;
      }
    }
  };

  function findDuplicates(rows, existing, collection) {
    var config = DEDUPE_CONFIG[collection];
    if (!config) return rows;

    return rows.map(function (row) {
      var out = {};
      for (var k in row) {
        if (Object.prototype.hasOwnProperty.call(row, k)) out[k] = row[k];
      }

      var match = config.primaryMatch(out, existing);
      if (match) {
        out._dupeOf = match.id;
        out._dupeType = 'exact';
        return out;
      }

      match = config.secondaryMatch(out, existing);
      if (match) {
        out._dupeOf = match.id;
        out._dupeType = 'fuzzy';
        return out;
      }

      return out;
    });
  }

  // ============================================================
  // Deduplication — Standalone (within existing data)
  // ============================================================

  function findDuplicatesInSet(records, collection) {
    var groups = [];
    var used = {};

    for (var i = 0; i < records.length; i++) {
      if (used[i]) continue;
      var canonical = records[i];
      var dupes = [];

      for (var j = i + 1; j < records.length; j++) {
        if (used[j]) continue;
        if (_isMatch(canonical, records[j], collection)) {
          dupes.push(records[j]);
          used[j] = true;
        }
      }

      if (dupes.length > 0) {
        used[i] = true;
        groups.push({ canonical: canonical, duplicates: dupes });
      }
    }

    return groups;
  }

  function _isMatch(a, b, collection) {
    if (collection === 'contacts') {
      var aEmail = (a.email || '').toLowerCase().trim();
      var bEmail = (b.email || '').toLowerCase().trim();
      if (aEmail && bEmail && aEmail === bEmail) return true;
      var aName = ((a.firstName || a.first_name || '') + ' ' + (a.lastName || a.last_name || a.name || '')).trim().toLowerCase();
      var bName = ((b.firstName || b.first_name || '') + ' ' + (b.lastName || b.last_name || b.name || '')).trim().toLowerCase();
      if (aName && bName && similarity(aName, bName) >= 0.85) return true;
      return false;
    }
    if (collection === 'companies') {
      var aN = (a.name || '').toLowerCase().trim();
      var bN = (b.name || '').toLowerCase().trim();
      if (aN && bN && aN === bN) return true;
      if (aN && bN && similarity(aN, bN) >= 0.80) return true;
      return false;
    }
    if (collection === 'projects') {
      var aPn = (a.name || '').toLowerCase().trim();
      var bPn = (b.name || '').toLowerCase().trim();
      if (aPn && bPn && aPn === bPn) return true;
      if (aPn && bPn && similarity(aPn, bPn) >= 0.80) return true;
      return false;
    }
    if (collection === 'tasks') {
      var aT = (a.title || '').toLowerCase().trim();
      var bT = (b.title || '').toLowerCase().trim();
      var aPid = a.projectId || a.project_id || '';
      var bPid = b.projectId || b.project_id || '';
      if (aT && bT && aT === bT && aPid === bPid) return true;
      if (aT && bT && aPid === bPid && similarity(aT, bT) >= 0.85) return true;
      return false;
    }
    return false;
  }

  // ============================================================
  // Levenshtein Similarity (0–1)
  // ============================================================

  function similarity(a, b) {
    if (a === b) return 1;
    if (!a || !b) return 0;
    var la = a.length;
    var lb = b.length;
    var matrix = [];
    for (var i = 0; i <= la; i++) {
      matrix[i] = [i];
    }
    for (var j = 0; j <= lb; j++) {
      matrix[0][j] = j;
    }
    for (var i2 = 1; i2 <= la; i2++) {
      for (var j2 = 1; j2 <= lb; j2++) {
        var cost = a[i2 - 1] === b[j2 - 1] ? 0 : 1;
        matrix[i2][j2] = Math.min(
          matrix[i2 - 1][j2] + 1,
          matrix[i2][j2 - 1] + 1,
          matrix[i2 - 1][j2 - 1] + cost
        );
      }
    }
    var maxLen = Math.max(la, lb);
    return maxLen === 0 ? 1 : 1 - matrix[la][lb] / maxLen;
  }

  // ============================================================
  // Row Validation
  // ============================================================

  function validateRows(rows, collection) {
    var tmpl = TEMPLATES[collection];
    if (!tmpl) return rows;

    return rows.map(function (row) {
      var out = {};
      for (var k in row) {
        if (Object.prototype.hasOwnProperty.call(row, k)) out[k] = row[k];
      }

      var errors = [];
      tmpl.required.forEach(function (field) {
        if (!out[field] || String(out[field]).trim() === '') {
          errors.push(field + ' is required');
        }
      });

      if (errors.length > 0) {
        out._errors = errors;
      }

      return out;
    });
  }

  // ============================================================
  // Helper — download blob
  // ============================================================

  function _downloadBlob(content, filename, type) {
    var blob = new Blob([content], { type: type + ';charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ============================================================
  // Public API
  // ============================================================

  return {
    parseCSV: parseCSV,
    downloadTemplate: downloadTemplate,
    exportCSV: exportCSV,
    resolveFK: resolveFK,
    findDuplicates: findDuplicates,
    findDuplicatesInSet: findDuplicatesInSet,
    similarity: similarity,
    validateRows: validateRows,
    TEMPLATES: TEMPLATES
  };
})();
