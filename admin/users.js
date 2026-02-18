(function () {
  'use strict';

  function mustBeAdmin() {
    if (!window.CandidAuth || !CandidAuth.isSignedIn || !CandidAuth.isSignedIn()) {
      window.location.href = '../login.html?next=' + encodeURIComponent('admin/users.html');
      return false;
    }
    if (!CandidAuth.hasRole || !CandidAuth.hasRole('admin')) {
      window.location.href = '../index.html';
      return false;
    }
    return true;
  }

  function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
  }

  function renderOverrides() {
    var overrides = CandidAuth.getRoleOverrides ? CandidAuth.getRoleOverrides() : {};
    var rows = Object.keys(overrides).sort();
    var emptyEl = document.getElementById('role-empty');
    var tableWrap = document.getElementById('role-table-wrap');
    var tbody = document.getElementById('role-table-body');

    tbody.innerHTML = '';
    if (!rows.length) {
      tableWrap.style.display = 'none';
      emptyEl.style.display = '';
      return;
    }

    rows.forEach(function (email) {
      var tr = document.createElement('tr');

      var emailTd = document.createElement('td');
      emailTd.style.padding = '8px';
      emailTd.style.borderBottom = '1px solid var(--border-color)';
      emailTd.textContent = email;

      var roleTd = document.createElement('td');
      roleTd.style.padding = '8px';
      roleTd.style.borderBottom = '1px solid var(--border-color)';
      roleTd.textContent = overrides[email];

      var actionTd = document.createElement('td');
      actionTd.style.padding = '8px';
      actionTd.style.borderBottom = '1px solid var(--border-color)';
      actionTd.style.textAlign = 'right';
      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn-secondary btn-sm';
      removeBtn.textContent = 'Remove';
      removeBtn.addEventListener('click', function () {
        CandidAuth.removeRoleOverride(email);
        renderOverrides();
      });
      actionTd.appendChild(removeBtn);

      tr.appendChild(emailTd);
      tr.appendChild(roleTd);
      tr.appendChild(actionTd);
      tbody.appendChild(tr);
    });

    emptyEl.style.display = 'none';
    tableWrap.style.display = '';
  }

  function bindForm() {
    var form = document.getElementById('role-form');
    var emailInput = document.getElementById('role-email');
    var roleSelect = document.getElementById('role-value');
    var msg = document.getElementById('role-msg');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = normalizeEmail(emailInput.value);
      var role = roleSelect.value;
      if (!email) {
        msg.textContent = 'Enter a valid email.';
        return;
      }
      var ok = CandidAuth.setRoleOverride(email, role);
      if (!ok) {
        msg.textContent = 'Unable to save role override.';
        return;
      }
      msg.textContent = 'Saved override: ' + email + ' -> ' + role;
      emailInput.value = '';
      renderOverrides();
    });
  }

  function renderEmailList(items, listEl, emptyEl, onRemove, buttonLabel) {
    listEl.innerHTML = '';
    if (!items.length) {
      emptyEl.style.display = '';
      return;
    }
    emptyEl.style.display = 'none';
    items.forEach(function (email) {
      var li = document.createElement('li');
      li.style.display = 'flex';
      li.style.justifyContent = 'space-between';
      li.style.alignItems = 'center';
      li.style.border = '1px solid var(--border-color)';
      li.style.borderRadius = '8px';
      li.style.padding = '8px 10px';

      var text = document.createElement('span');
      text.textContent = email;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = buttonLabel;
      btn.addEventListener('click', function () {
        onRemove(email);
      });

      li.appendChild(text);
      li.appendChild(btn);
      listEl.appendChild(li);
    });
  }

  function renderAllowList() {
    var list = CandidAuth.getAllowedEmails ? CandidAuth.getAllowedEmails() : [];
    renderEmailList(
      list,
      document.getElementById('allow-list'),
      document.getElementById('allow-empty'),
      function (email) {
        CandidAuth.removeAllowedEmail(email);
        renderAllowList();
      },
      'Remove'
    );
  }

  function renderBlockList() {
    var list = CandidAuth.getBlockedEmails ? CandidAuth.getBlockedEmails() : [];
    renderEmailList(
      list,
      document.getElementById('block-list'),
      document.getElementById('block-empty'),
      function (email) {
        CandidAuth.removeBlockedEmail(email);
        renderBlockList();
      },
      'Unblock'
    );
  }

  function bindAllowForm() {
    var form = document.getElementById('allow-form');
    var emailInput = document.getElementById('allow-email');
    var msg = document.getElementById('allow-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = normalizeEmail(emailInput.value);
      if (!email) {
        msg.textContent = 'Enter a valid email.';
        return;
      }
      var ok = CandidAuth.addAllowedEmail(email);
      msg.textContent = ok ? ('Added allow exception: ' + email) : 'Unable to add allow exception.';
      emailInput.value = '';
      renderAllowList();
    });
  }

  function bindBlockForm() {
    var form = document.getElementById('block-form');
    var emailInput = document.getElementById('block-email');
    var msg = document.getElementById('block-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = normalizeEmail(emailInput.value);
      if (!email) {
        msg.textContent = 'Enter a valid email.';
        return;
      }
      var ok = CandidAuth.addBlockedEmail(email);
      msg.textContent = ok ? ('Added blocked exception: ' + email) : 'Unable to block email.';
      emailInput.value = '';
      renderBlockList();
    });
  }

  if (!mustBeAdmin()) return;
  bindForm();
  bindAllowForm();
  bindBlockForm();
  renderOverrides();
  renderAllowList();
  renderBlockList();
})();
