// Prospecting Pipeline — Discovery queue + VA review
// Uses CandidStore (same API/D1 backend as CRM).
// Prospects are companies with status === 'prospect'.

// ============================================================
// DATA LAYER
// ============================================================

var _prospects = [];

function initProspects() {
  return CandidStore.load('companies').then(function(companies) {
    _prospects = (companies || []).filter(function(c) {
      return c.status === 'prospect';
    });
  });
}

// ============================================================
// META HELPERS
// ============================================================

function parseMeta(record) {
  if (!record) return {};
  if (typeof record.meta === 'object' && record.meta !== null) return record.meta;
  if (typeof record.meta === 'string' && record.meta) {
    try { return JSON.parse(record.meta); } catch(e) { return {}; }
  }
  return {};
}

function serializeMeta(metaObj) {
  return JSON.stringify(metaObj);
}

function mergeProspectMeta(existing, updates) {
  var meta = parseMeta({ meta: existing });
  for (var key in updates) {
    if (updates.hasOwnProperty(key)) {
      meta[key] = updates[key];
    }
  }
  return meta;
}

function calcContactScore(meta) {
  var score = 0;
  if (meta.wa_number) score += 4;
  if (meta.ig_handle) score += 3;
  if (meta.landline) score += 2;
  if (meta.email) score += 1;
  return score;
}

function buildContactChannels(meta) {
  var channels = [];
  if (meta.wa_number) channels.push('wa');
  if (meta.ig_handle) channels.push('ig_dm');
  if (meta.landline) channels.push('landline');
  if (meta.email) channels.push('email');
  return channels;
}

// ============================================================
// RENDER — Stats Bar
// ============================================================

function renderStats() {
  var total = _prospects.length;
  var pending = 0, approved = 0, rejected = 0, contacted = 0, converted = 0;

  _prospects.forEach(function(p) {
    var meta = parseMeta(p);
    var review = meta.review_status || 'pending';
    var outreach = meta.outreach_status || 'not_contacted';

    if (review === 'pending') pending++;
    else if (review === 'approved') approved++;
    else if (review === 'rejected') rejected++;

    if (outreach === 'contacted' || outreach === 'responded' || outreach === 'meeting_set' || outreach === 'converted') contacted++;
    if (outreach === 'converted') converted++;
  });

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-approved').textContent = approved;
  document.getElementById('stat-rejected').textContent = rejected;
  document.getElementById('stat-contacted').textContent = contacted;
  document.getElementById('stat-conversion').textContent = total > 0 ? Math.round((converted / total) * 100) + '%' : '0%';
}

// ============================================================
// RENDER — Discovery Card Queue
// ============================================================

function renderQueue() {
  var query = (document.getElementById('prosp-search').value || '').toLowerCase();
  var sourceFilter = document.getElementById('prosp-source-filter').value;
  var reviewFilter = document.getElementById('prosp-review-filter').value;
  var priorityFilter = document.getElementById('prosp-priority-filter').value;
  var outreachFilter = document.getElementById('prosp-outreach-filter').value;

  var prospects = _prospects.slice();

  // Filter
  if (query) {
    prospects = prospects.filter(function(p) {
      var meta = parseMeta(p);
      return p.name.toLowerCase().indexOf(query) !== -1 ||
             (p.market || '').toLowerCase().indexOf(query) !== -1 ||
             (meta.ig_handle || '').toLowerCase().indexOf(query) !== -1;
    });
  }
  if (sourceFilter) {
    prospects = prospects.filter(function(p) {
      return parseMeta(p).source === sourceFilter;
    });
  }
  if (reviewFilter) {
    prospects = prospects.filter(function(p) {
      return (parseMeta(p).review_status || 'pending') === reviewFilter;
    });
  }
  if (priorityFilter) {
    prospects = prospects.filter(function(p) {
      return (parseMeta(p).priority || 'medium') === priorityFilter;
    });
  }
  if (outreachFilter) {
    prospects = prospects.filter(function(p) {
      return (parseMeta(p).outreach_status || 'not_contacted') === outreachFilter;
    });
  }

  // Sort: pending first, then by fit_score descending
  prospects.sort(function(a, b) {
    var ma = parseMeta(a), mb = parseMeta(b);
    var ra = ma.review_status || 'pending', rb = mb.review_status || 'pending';
    var reviewOrder = { pending: 0, approved: 1, rejected: 2 };
    var orderA = reviewOrder[ra] !== undefined ? reviewOrder[ra] : 1;
    var orderB = reviewOrder[rb] !== undefined ? reviewOrder[rb] : 1;
    if (orderA !== orderB) return orderA - orderB;
    return (mb.fit_score || 0) - (ma.fit_score || 0);
  });

  var container = document.getElementById('prosp-queue');

  if (!prospects.length) {
    container.innerHTML = '<div class="prosp-empty"><div class="prosp-empty-icon">&#128270;</div><p>No prospects match your filters</p></div>';
    return;
  }

  container.innerHTML = prospects.map(function(p) {
    return renderCard(p);
  }).join('');

  applyAuthVisibility();
}

function renderCard(p) {
  var meta = parseMeta(p);
  var source = meta.source || 'manual';
  var fitScore = meta.fit_score || 0;
  var contactScore = meta.contact_score || calcContactScore(meta);
  var priority = meta.priority || 'medium';
  var reviewStatus = meta.review_status || 'pending';
  var outreachStatus = meta.outreach_status || 'not_contacted';
  var outreachLabel = (outreachStatus || '').replace(/_/g, ' ');

  var fitClass = fitScore >= 7 ? 'fit-high' : fitScore >= 4 ? 'fit-medium' : 'fit-low';

  var waLink = meta.wa_number ? 'https://wa.me/' + meta.wa_number.replace(/[^0-9]/g, '') : '';
  var igLink = meta.ig_handle ? 'https://instagram.com/' + meta.ig_handle.replace('@', '') : '';

  var html = '<div class="prosp-card priority-' + escapeHtml(priority) + '">';

  // Header
  html += '<div class="prosp-card-header">';
  html += '<div class="prosp-card-title-row">';
  html += '<h4 class="prosp-card-name"><button class="row-name-link" onclick="openDetail(\'' + p.id + '\')">' + escapeHtml(p.name) + '</button></h4>';
  html += '<div class="prosp-card-meta">';
  if (p.market) html += '<span>' + escapeHtml(p.market) + '</span>';
  if (p.channel) html += '<span>' + escapeHtml(p.channel) + '</span>';
  if (p.type) html += '<span>' + escapeHtml(p.type) + '</span>';
  html += '</div>';
  html += '</div>';
  html += '<div class="prosp-card-badges">';
  if (source === 'ai_discovery') {
    html += '<span class="prosp-badge prosp-badge-ai">AI</span>';
  } else {
    html += '<span class="prosp-badge prosp-badge-manual">Manual</span>';
  }
  if (fitScore > 0) {
    html += '<span class="prosp-badge prosp-badge-fit ' + fitClass + '">' + fitScore + '/10</span>';
  }
  html += '</div>';
  html += '</div>';

  // Body
  html += '<div class="prosp-card-body">';

  // Status row
  html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">';
  html += '<span class="prosp-review-badge ' + escapeHtml(reviewStatus) + '">' + escapeHtml(reviewStatus) + '</span>';
  html += '<button class="prosp-outreach-badge ' + escapeHtml(outreachStatus) + '" onclick="openOutreachUpdate(\'' + p.id + '\')" title="Click to update">' + escapeHtml(outreachLabel) + '</button>';
  if (contactScore > 0) {
    html += '<span class="prosp-badge-contact">reach: ' + contactScore + '/10</span>';
  }
  html += '</div>';

  // Fit reason
  if (meta.fit_reason) {
    html += '<div class="prosp-fit-reason">' + escapeHtml(meta.fit_reason) + '</div>';
  }

  // Contact channels
  html += '<div class="prosp-channels">';
  html += '<a class="prosp-channel-link ' + (meta.wa_number ? 'available' : 'unavailable') + '"' +
    (waLink ? ' href="' + waLink + '" target="_blank" rel="noopener"' : '') +
    '><span class="prosp-channel-icon">&#128172;</span>WA</a>';
  html += '<a class="prosp-channel-link ' + (meta.ig_handle ? 'available' : 'unavailable') + '"' +
    (igLink ? ' href="' + igLink + '" target="_blank" rel="noopener"' : '') +
    '><span class="prosp-channel-icon">&#128247;</span>IG</a>';
  html += '<span class="prosp-channel-link ' + (meta.landline ? 'available' : 'unavailable') +
    '"><span class="prosp-channel-icon">&#128222;</span>Tel</span>';
  html += '<span class="prosp-channel-link ' + (meta.email ? 'available' : 'unavailable') +
    '"><span class="prosp-channel-icon">&#9993;</span>Email</span>';
  html += '</div>';

  // Inline edit fields
  html += '<div class="prosp-inline-edit">';
  html += '<div class="prosp-edit-field">';
  html += '<label>WA</label>';
  html += '<input class="prosp-edit-input" data-id="' + p.id + '" data-field="wa_number" value="' + escapeHtml(meta.wa_number || '') + '" placeholder="+628..." onchange="quickEditProspect(this)">';
  html += '</div>';
  html += '<div class="prosp-edit-field">';
  html += '<label>IG</label>';
  html += '<input class="prosp-edit-input" data-id="' + p.id + '" data-field="ig_handle" value="' + escapeHtml(meta.ig_handle || '') + '" placeholder="@handle" onchange="quickEditProspect(this)">';
  html += '</div>';
  html += '</div>';

  // Distributor intro status row (if applicable)
  if (meta.intro_channel === 'distributor') {
    html += '<div class="prosp-intro-row">';
    html += 'Intro via <strong>' + escapeHtml(meta.intro_requested_from || '?') + '</strong>';
    html += ' &mdash; ' + escapeHtml((meta.intro_status || 'pending').replace(/_/g, ' '));
    html += '</div>';
  }

  // Draft message preview
  if (meta.draft_message) {
    html += '<div class="prosp-draft">';
    html += '<button class="prosp-draft-toggle" onclick="toggleDraft(this)">';
    html += '<span class="prosp-draft-arrow">&#9654;</span> Draft message';
    html += '</button>';
    html += '<div class="prosp-draft-box">';
    html += '<button class="prosp-draft-copy" onclick="event.stopPropagation();copyDraftMessage(\'' + p.id + '\')">Copy</button>';
    html += escapeHtml(meta.draft_message);
    html += '</div>';
    html += '</div>';
  }

  html += '</div>'; // end body

  // Footer actions
  html += '<div class="prosp-card-footer">';

  if (reviewStatus === 'pending') {
    html += '<button class="prosp-btn prosp-btn-approve" onclick="approveProspect(\'' + p.id + '\')">Approve</button>';
    html += '<button class="prosp-btn prosp-btn-reject" onclick="rejectProspect(\'' + p.id + '\')">Reject</button>';
  }

  if (reviewStatus === 'approved') {
    // Copy message button
    if (meta.draft_message) {
      html += '<button class="prosp-btn prosp-btn-secondary" onclick="copyDraftMessage(\'' + p.id + '\')">Copy Message</button>';
    }
    // Distributor intro button for high-score leads
    if (fitScore >= 7 && meta.intro_channel !== 'distributor') {
      html += '<button class="prosp-btn prosp-btn-intro" onclick="requestDistributorIntro(\'' + p.id + '\')">Distributor Intro</button>';
    }
    html += '<span class="prosp-card-spacer"></span>';
    html += '<button class="prosp-btn prosp-btn-migrate" onclick="migrateToCRM(\'' + p.id + '\')">Migrate to CRM</button>';
  }

  if (reviewStatus === 'rejected' && meta.review_notes) {
    html += '<span style="font-size:0.78rem;color:var(--text-secondary);">Rejected: ' + escapeHtml(meta.review_notes) + '</span>';
  }

  html += '</div>';
  html += '</div>'; // end card

  return html;
}

// ============================================================
// ACTIONS
// ============================================================

function approveProspect(id) {
  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;

  var meta = mergeProspectMeta(prospect.meta, { review_status: 'approved' });

  CandidStore.update('companies', id, { meta: serializeMeta(meta) }).then(function() {
    return initProspects();
  }).then(function() {
    renderQueue();
    renderStats();
    showToast('Prospect approved');
  }).catch(function() {
    alert('Could not approve prospect.');
  });
}

function rejectProspect(id) {
  document.getElementById('reject-id').value = id;
  document.getElementById('reject-reason').value = '';
  document.getElementById('reject-modal').classList.add('active');
}

function confirmReject() {
  var id = document.getElementById('reject-id').value;
  var reason = document.getElementById('reject-reason').value.trim();
  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;

  var meta = mergeProspectMeta(prospect.meta, {
    review_status: 'rejected',
    review_notes: reason || ''
  });

  CandidStore.update('companies', id, { meta: serializeMeta(meta) }).then(function() {
    return initProspects();
  }).then(function() {
    closeModal('reject-modal');
    renderQueue();
    renderStats();
    showToast('Prospect rejected');
  }).catch(function() {
    alert('Could not reject prospect.');
  });
}

function quickEditProspect(inputEl) {
  var id = inputEl.dataset.id;
  var field = inputEl.dataset.field;
  var value = inputEl.value.trim();

  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;

  var updates = {};
  updates[field] = value;

  var meta = mergeProspectMeta(prospect.meta, updates);
  // Recalculate contact score and channels
  meta.contact_channels = buildContactChannels(meta);
  meta.contact_score = calcContactScore(meta);

  CandidStore.update('companies', id, { meta: serializeMeta(meta) }).then(function() {
    // Update local cache
    prospect.meta = serializeMeta(meta);
    renderStats();
    showToast('Updated ' + field.replace('_', ' '));
  }).catch(function() {
    alert('Could not update field.');
  });
}

function copyDraftMessage(id) {
  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;
  var meta = parseMeta(prospect);
  var msg = meta.draft_message || '';
  if (!msg) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(function() {
      showToast('Message copied to clipboard');
    });
  } else {
    // Fallback
    var ta = document.createElement('textarea');
    ta.value = msg;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Message copied to clipboard');
  }
}

function migrateToCRM(id) {
  if (!confirm('Migrate this prospect to the CRM as a lead? This will make it visible in the CRM and remove it from the prospecting queue.')) return;

  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;

  var meta = parseMeta(prospect);

  // Change status from 'prospect' to 'lead'
  CandidStore.update('companies', id, { status: 'lead' }).then(function() {
    // Create a contact with the available details
    var contactName = prospect.name + ' Contact';
    var contactData = {
      name: contactName,
      phone: meta.wa_number || meta.landline || '',
      email: meta.email || '',
      companyId: id,
      notes: 'Migrated from prospecting pipeline. IG: ' + (meta.ig_handle || 'N/A')
    };
    return CandidStore.create('contacts', contactData);
  }).then(function() {
    return initProspects();
  }).then(function() {
    renderQueue();
    renderStats();
    showToast('Prospect migrated to CRM');
  }).catch(function() {
    alert('Could not migrate prospect.');
  });
}

function openOutreachUpdate(id) {
  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;
  var meta = parseMeta(prospect);

  document.getElementById('outreach-id').value = id;
  document.getElementById('outreach-status-select').value = meta.outreach_status || 'not_contacted';
  document.getElementById('outreach-modal').classList.add('active');
}

function confirmOutreachUpdate() {
  var id = document.getElementById('outreach-id').value;
  var newStatus = document.getElementById('outreach-status-select').value;
  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;

  var updates = { outreach_status: newStatus };
  if (newStatus === 'contacted' || newStatus === 'responded' || newStatus === 'meeting_set') {
    updates.last_contacted = new Date().toISOString();
  }

  var meta = mergeProspectMeta(prospect.meta, updates);

  CandidStore.update('companies', id, { meta: serializeMeta(meta) }).then(function() {
    return initProspects();
  }).then(function() {
    closeModal('outreach-modal');
    renderQueue();
    renderStats();
    showToast('Outreach status updated');
  }).catch(function() {
    alert('Could not update outreach status.');
  });
}

// ============================================================
// DISTRIBUTOR INTRO
// ============================================================

function requestDistributorIntro(id) {
  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;
  var meta = parseMeta(prospect);

  document.getElementById('intro-id').value = id;
  document.getElementById('intro-contact').value = '';
  document.getElementById('intro-other-group').style.display = 'none';
  document.getElementById('intro-other-name').value = '';

  // Pre-fill intro message
  var msg = 'Hi, I wanted to check if you have a contact at ' + prospect.name;
  if (prospect.market) msg += ' in ' + prospect.market;
  msg += '? They look like a great fit for Candid Mixers';
  if (meta.fit_reason) msg += ' — ' + meta.fit_reason.toLowerCase();
  msg += '. Would you be able to make an introduction?';
  document.getElementById('intro-message').value = msg;

  document.getElementById('intro-modal').classList.add('active');
}

function confirmIntroRequest() {
  var id = document.getElementById('intro-id').value;
  var contactPerson = document.getElementById('intro-contact').value;
  if (!contactPerson) return;

  if (contactPerson === 'Other') {
    contactPerson = document.getElementById('intro-other-name').value.trim() || 'Other';
  }

  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;

  var meta = mergeProspectMeta(prospect.meta, {
    intro_channel: 'distributor',
    intro_requested_from: contactPerson,
    intro_status: 'pending',
    outreach_status: 'distributor_intro'
  });

  CandidStore.update('companies', id, { meta: serializeMeta(meta) }).then(function() {
    return initProspects();
  }).then(function() {
    closeModal('intro-modal');
    renderQueue();
    renderStats();
    showToast('Distributor intro requested via ' + contactPerson);
  }).catch(function() {
    alert('Could not request intro.');
  });
}

function copyIntroMessage() {
  var msg = document.getElementById('intro-message').value;
  if (!msg) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(function() {
      showToast('Intro message copied');
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = msg;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Intro message copied');
  }
}

// ============================================================
// MANUAL PROSPECT
// ============================================================

function openAddManual() {
  document.getElementById('manual-form').reset();
  document.getElementById('manual-drawer').classList.add('active');
  document.getElementById('manual-backdrop').classList.add('active');
}

function closeManualDrawer() {
  document.getElementById('manual-drawer').classList.remove('active');
  document.getElementById('manual-backdrop').classList.remove('active');
}

function saveManual() {
  var name = document.getElementById('manual-name').value.trim();
  if (!name) return;

  var igHandle = document.getElementById('manual-ig').value.trim();
  var waNumber = document.getElementById('manual-wa').value.trim();
  var landline = document.getElementById('manual-landline').value.trim();
  var email = document.getElementById('manual-email').value.trim();

  var meta = {
    source: 'manual',
    ig_handle: igHandle,
    wa_number: waNumber,
    landline: landline,
    email: email,
    review_status: 'approved',
    outreach_status: 'not_contacted',
    priority: document.getElementById('manual-priority').value || 'medium'
  };
  meta.contact_channels = buildContactChannels(meta);
  meta.contact_score = calcContactScore(meta);

  var record = {
    name: name,
    market: document.getElementById('manual-market').value.trim(),
    channel: document.getElementById('manual-channel').value,
    type: document.getElementById('manual-type').value,
    status: 'prospect',
    notes: document.getElementById('manual-notes').value.trim(),
    meta: serializeMeta(meta)
  };

  CandidStore.create('companies', record).then(function() {
    return initProspects();
  }).then(function() {
    closeManualDrawer();
    renderQueue();
    renderStats();
    showToast('Prospect added manually');
  }).catch(function() {
    alert('Could not create prospect.');
  });
}

// ============================================================
// DETAIL DRAWER — slides in from right, shows prospect + comments
// ============================================================

var _detailState = { type: null, id: null };

function openDetail(id) {
  var prospect = _prospects.find(function(p) { return p.id === id; });
  if (!prospect) return;

  var meta = parseMeta(prospect);
  _detailState = { type: 'company', id: id };

  // Title
  document.getElementById('detail-title').textContent = prospect.name;

  // Meta badges
  var source = meta.source || 'manual';
  var reviewStatus = meta.review_status || 'pending';
  var fitScore = meta.fit_score || 0;
  var fitClass = fitScore >= 7 ? 'fit-high' : fitScore >= 4 ? 'fit-medium' : 'fit-low';

  var metaHtml = '<span class="badge badge-type">Prospect</span>';
  if (source === 'ai_discovery') {
    metaHtml += '<span class="prosp-badge prosp-badge-ai">AI</span>';
  }
  metaHtml += '<span class="prosp-review-badge ' + escapeHtml(reviewStatus) + '">' + escapeHtml(reviewStatus) + '</span>';
  if (fitScore > 0) {
    metaHtml += '<span class="prosp-badge prosp-badge-fit ' + fitClass + '">' + fitScore + '/10</span>';
  }
  document.getElementById('detail-meta').innerHTML = metaHtml;

  // Fields
  var outreachStatus = (meta.outreach_status || 'not_contacted').replace(/_/g, ' ');
  var contactScore = meta.contact_score || calcContactScore(meta);
  var waLink = meta.wa_number ? 'https://wa.me/' + meta.wa_number.replace(/[^0-9]/g, '') : '';
  var igLink = meta.ig_handle ? 'https://instagram.com/' + meta.ig_handle.replace('@', '') : '';

  var fieldsHtml =
    field('Market', prospect.market || '—') +
    field('Channel', prospect.channel || '—') +
    field('Type', prospect.type || '—') +
    field('Priority', meta.priority || 'medium') +
    field('Outreach', escapeHtml(outreachStatus)) +
    field('Contact Score', contactScore + '/10') +
    field('WhatsApp', meta.wa_number
      ? '<a href="' + waLink + '" target="_blank" rel="noopener">' + escapeHtml(meta.wa_number) + '</a>'
      : '—') +
    field('Instagram', meta.ig_handle
      ? '<a href="' + igLink + '" target="_blank" rel="noopener">' + escapeHtml(meta.ig_handle) + '</a>'
      : '—') +
    field('Landline', meta.landline || '—') +
    field('Email', meta.email
      ? '<a href="mailto:' + escapeHtml(meta.email) + '">' + escapeHtml(meta.email) + '</a>'
      : '—') +
    field('IG Followers', meta.ig_followers ? meta.ig_followers.toLocaleString() : '—') +
    field('Added', formatDate(prospect.createdAt));

  if (meta.fit_reason) {
    fieldsHtml += '<div class="crm-detail-field full-width">' + fieldLabel('Fit Reason') +
      '<div class="crm-detail-field-value">' + escapeHtml(meta.fit_reason) + '</div></div>';
  }

  if (meta.ig_bio) {
    fieldsHtml += '<div class="crm-detail-field full-width">' + fieldLabel('IG Bio') +
      '<div class="crm-detail-field-value">' + escapeHtml(meta.ig_bio) + '</div></div>';
  }

  if (meta.draft_message) {
    fieldsHtml += '<div class="crm-detail-field full-width">' + fieldLabel('Draft Message') +
      '<div class="crm-detail-field-value" style="font-family:var(--font-mono);font-size:0.82rem;white-space:pre-wrap;">' +
      escapeHtml(meta.draft_message) + '</div></div>';
  }

  if (meta.intro_channel === 'distributor') {
    fieldsHtml += '<div class="crm-detail-field full-width">' + fieldLabel('Distributor Intro') +
      '<div class="crm-detail-field-value">Via ' + escapeHtml(meta.intro_requested_from || '?') +
      ' — ' + escapeHtml((meta.intro_status || 'pending').replace(/_/g, ' ')) + '</div></div>';
  }

  if (meta.review_notes) {
    fieldsHtml += '<div class="crm-detail-field full-width">' + fieldLabel('Review Notes') +
      '<div class="crm-detail-field-value">' + escapeHtml(meta.review_notes) + '</div></div>';
  }

  if (prospect.notes) {
    fieldsHtml += '<div class="crm-detail-field full-width">' + fieldLabel('Notes') +
      '<div class="crm-detail-field-value">' + escapeHtml(prospect.notes) + '</div></div>';
  }

  document.getElementById('detail-fields').innerHTML = fieldsHtml;

  // Open drawer
  document.getElementById('detail-drawer').classList.add('active');
  document.getElementById('detail-backdrop').classList.add('active');
  document.getElementById('detail-comment-input').value = '';
  loadDetailComments('company', id);
}

function field(label, valueHtml) {
  return '<div class="crm-detail-field">' + fieldLabel(label) + '<div class="crm-detail-field-value">' + valueHtml + '</div></div>';
}

function fieldLabel(label) {
  return '<div class="crm-detail-field-label">' + escapeHtml(label) + '</div>';
}

function closeDetail() {
  document.getElementById('detail-drawer').classList.remove('active');
  document.getElementById('detail-backdrop').classList.remove('active');
  _detailState = { type: null, id: null };
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ============================================================
// COMMENTS — same pattern as CRM detail drawer
// ============================================================

function loadDetailComments(type, id) {
  var list = document.getElementById('detail-comments-list');
  list.innerHTML = '<p class="crm-comment-empty">Loading…</p>';
  if (typeof CandidStore === 'undefined' || !CandidStore.loadComments) {
    list.innerHTML = '<p class="crm-comment-empty">Comments require the API.</p>';
    return;
  }
  CandidStore.loadComments(type, id).then(function(comments) {
    renderDetailComments(comments, type, id);
  }).catch(function() {
    list.innerHTML = '<p class="crm-comment-empty">Could not load comments.</p>';
  });
}

function renderDetailComments(comments, type, id) {
  var list = document.getElementById('detail-comments-list');
  if (!comments || comments.length === 0) {
    list.innerHTML = '<p class="crm-comment-empty">No comments yet — be the first.</p>';
    return;
  }
  var userAuth = null;
  try { userAuth = JSON.parse(localStorage.getItem('candidlabs_auth')); } catch(e) {}
  var isAdmin = userAuth && userAuth.role === 'admin';

  list.innerHTML = comments.map(function(c) {
    var initials = (c.authorName || c.authorEmail || '?').split(' ').map(function(w) { return w[0]; }).slice(0,2).join('').toUpperCase();
    var canDelete = isAdmin || (userAuth && userAuth.email === c.authorEmail);
    return '<div class="crm-comment-item">' +
      '<div class="crm-comment-avatar">' + escapeHtml(initials) + '</div>' +
      '<div class="crm-comment-body">' +
        '<div class="crm-comment-byline">' +
          '<span class="crm-comment-author">' + escapeHtml(c.authorName || c.authorEmail) + '</span>' +
          '<span class="crm-comment-time">' + formatCommentTime(c.createdAt) + '</span>' +
        '</div>' +
        '<div class="crm-comment-text">' + escapeHtml(c.body) + '</div>' +
      '</div>' +
      (canDelete ? '<button class="crm-comment-delete" onclick="deleteDetailComment(\'' + c.id + '\',\'' + type + '\',\'' + id + '\')" title="Delete">&#10005;</button>' : '') +
    '</div>';
  }).join('');
  list.scrollTop = list.scrollHeight;
}

function formatCommentTime(iso) {
  if (!iso) return '';
  var d = new Date(iso);
  var now = new Date();
  var diffMs = now - d;
  var diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return diffMin + 'm ago';
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + 'h ago';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function submitDetailComment() {
  var input = document.getElementById('detail-comment-input');
  var text = input.value.trim();
  if (!text || !_detailState.type || !_detailState.id) return;
  var btn = document.getElementById('detail-comment-submit');
  btn.disabled = true;
  CandidStore.postComment(_detailState.type, _detailState.id, text)
    .then(function() {
      input.value = '';
      loadDetailComments(_detailState.type, _detailState.id);
    })
    .catch(function() { alert('Could not post comment.'); })
    .finally(function() { btn.disabled = false; });
}

function deleteDetailComment(commentId, type, recordId) {
  if (!confirm('Delete this comment?')) return;
  CandidStore.removeComment(commentId).then(function() {
    loadDetailComments(type, recordId);
  });
}

// ============================================================
// UI HELPERS
// ============================================================

function toggleDraft(btn) {
  var arrow = btn.querySelector('.prosp-draft-arrow');
  var box = btn.nextElementSibling;
  var isOpen = box.classList.contains('open');
  box.classList.toggle('open');
  arrow.classList.toggle('open');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

function showToast(msg) {
  var toast = document.getElementById('prosp-toast');
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(function() {
    toast.classList.remove('visible');
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

function applyAuthVisibility() {
  if (typeof CandidAuth !== 'undefined') {
    CandidAuth.applyRoleVisibility();
  }
}

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
  if (typeof CandidAuth !== 'undefined') {
    CandidAuth.requireAuth();
  }

  initProspects().then(function() {
    renderStats();
    renderQueue();
  });

  // Search handler
  var searchInput = document.getElementById('prosp-search');
  if (searchInput) {
    searchInput.addEventListener('input', function() { renderQueue(); });
  }

  // Filter handlers
  ['prosp-source-filter', 'prosp-review-filter', 'prosp-priority-filter', 'prosp-outreach-filter'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('change', function() { renderQueue(); });
  });

  // Close modals on backdrop click
  document.querySelectorAll('.crm-modal-overlay').forEach(function(overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  // Intro contact "Other" toggle
  var introContact = document.getElementById('intro-contact');
  if (introContact) {
    introContact.addEventListener('change', function() {
      document.getElementById('intro-other-group').style.display = this.value === 'Other' ? '' : 'none';
    });
  }
});
