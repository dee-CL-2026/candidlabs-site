/**
 * Candidlabs Authentication Module
 *
 * Auth via Cloudflare Access (Google Workspace).
 * The site is gated by CF Access, which injects the authenticated user's
 * email into requests. A Pages Function at /api/me reads that header and
 * returns { email, displayName, role }.
 *
 * This module:
 *   1. Fetches /api/me on load to identify the current user
 *   2. Caches the result in localStorage for fast subsequent page loads
 *   3. Exposes the same public API as before (getUser, hasRole, etc.)
 *
 * Roles: 'admin' | 'team' | 'viewer'
 *
 * Sign-out: redirects to CF Access logout which clears the Access cookie.
 */

var CandidAuth = (function () {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────

  var STORAGE_KEY = 'candidlabs_auth';
  var API_ME = '/api/me';
  var CF_LOGOUT_URL = 'https://candidlabs-hub.pages.dev/cdn-cgi/access/logout';

  // ─── State ────────────────────────────────────────────────────────────────

  var currentUser = null;        // Resolved user object (or null)
  var fetchDone = false;         // True once /api/me has responded
  var onAuthChangeCallbacks = [];

  // ─── Helpers ──────────────────────────────────────────────────────────────

  function fireAuthChange() {
    onAuthChangeCallbacks.forEach(function (cb) {
      try { cb(currentUser); } catch (e) { console.error('CandidAuth callback error:', e); }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(String(str || '')));
    return div.innerHTML;
  }

  function getLoginPath() {
    var path = window.location.pathname || '';
    if (path.indexOf('/crm/') !== -1 ||
        path.indexOf('/projects/') !== -1 ||
        path.indexOf('/admin/') !== -1) {
      return '../login.html';
    }
    return 'login.html';
  }

  // ─── Cache ────────────────────────────────────────────────────────────────

  function loadCachedUser() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === 'string' && parsed.role) {
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function saveCachedUser(user) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {}
  }

  // ─── Identity Fetch ───────────────────────────────────────────────────────

  /**
   * Fetch /api/me (Pages Function) to get the CF Access identity.
   * Updates currentUser and fires auth change callbacks on completion.
   */
  function fetchIdentity() {
    return fetch(API_ME, { credentials: 'same-origin' })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        fetchDone = true;
        if (data.ok && data.data && data.data.email) {
          var user = {
            email: data.data.email,
            name: data.data.displayName || data.data.email.split('@')[0],
            role: data.data.role || 'team',
            picture: '',
            domain: data.data.email.split('@')[1] || ''
          };
          var changed = !currentUser || currentUser.email !== user.email || currentUser.role !== user.role;
          currentUser = user;
          saveCachedUser(user);
          if (changed) fireAuthChange();
        } else {
          // /api/me returned error — user not authenticated or not allowed
          var hadUser = !!currentUser;
          currentUser = null;
          saveCachedUser(null);
          if (hadUser) fireAuthChange();
        }
      })
      .catch(function (err) {
        // Network error or local dev — keep cached user, log warning
        fetchDone = true;
        console.warn('CandidAuth: /api/me fetch failed (local dev?)', err);
        // fireAuthChange in case page is waiting
        fireAuthChange();
      });
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /** Returns the current user object, or null. */
  function getUser() {
    return currentUser;
  }

  /** Returns true if a user is resolved. */
  function isSignedIn() {
    return currentUser !== null;
  }

  /** Returns the current user's role, or null. */
  function getRole() {
    return currentUser ? currentUser.role : null;
  }

  /** Returns true if the current user has at least the given role. */
  function hasRole(role) {
    if (!currentUser) return false;
    if (role === 'admin') return currentUser.role === 'admin';
    if (role === 'team') return currentUser.role === 'admin' || currentUser.role === 'team';
    if (role === 'viewer') return true; // any authenticated user
    return false;
  }

  /**
   * Sign out: clear cached identity, redirect to CF Access logout.
   * Access will then redirect back to the site login page.
   */
  function signOut() {
    currentUser = null;
    saveCachedUser(null);
    fireAuthChange();
    window.location.href = CF_LOGOUT_URL;
  }

  /**
   * Require auth on the current page.
   * - If user is known → returns true.
   * - If fetch is still pending → returns true (CF Access guarantees auth).
   * - If fetch is done and no user → redirects to login and returns false.
   */
  function requireAuth() {
    if (currentUser) return true;
    if (!fetchDone) {
      // Fetch still in flight — trust CF Access (user is authenticated).
      // onAuthChange will fire when fetch completes; page should react there.
      return true;
    }
    // Fetch returned no user (local dev or genuine unauth)
    window.location.href = getLoginPath();
    return false;
  }

  /** Register a callback for auth state changes. */
  function onAuthChange(callback) {
    if (typeof callback === 'function') {
      onAuthChangeCallbacks.push(callback);
    }
  }

  /**
   * init() — no-op in CF Access mode.
   * Kept for backward compatibility with pages that call CandidAuth.init().
   * Identity fetch has already started on module load.
   */
  function init() {
    // No-op. /api/me is fetched on module load.
    // Previously initialized Google Identity Services SDK.
  }

  // ─── UI Helpers ───────────────────────────────────────────────────────────

  /** Update navbar to show user info or login link. */
  function updateNavbar() {
    var loginBtns = document.querySelectorAll('.btn-login');
    var mobileLoginLinks = document.querySelectorAll('.mobile-menu a[href$="login.html"]');

    if (isSignedIn()) {
      var user = getUser();
      var displayName = user.name || user.email.split('@')[0];
      var firstName = displayName.split(' ')[0];
      var displayInitial = firstName.charAt(0).toUpperCase();

      loginBtns.forEach(function (btn) {
        var userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML =
          '<div class="user-info">' +
            (user.picture
              ? '<img src="' + escapeHtml(user.picture) + '" alt="" class="user-avatar" referrerpolicy="no-referrer">'
              : '<span class="user-avatar-placeholder">' + escapeHtml(displayInitial) + '</span>') +
            '<span class="user-name">' + escapeHtml(firstName) + '</span>' +
          '</div>';

        var signOutBtn = document.createElement('button');
        signOutBtn.type = 'button';
        signOutBtn.className = 'btn btn-secondary btn-sm btn-signout';
        signOutBtn.textContent = 'Sign Out';
        signOutBtn.addEventListener('click', signOut);
        userMenu.appendChild(signOutBtn);

        btn.parentNode.replaceChild(userMenu, btn);
      });

      mobileLoginLinks.forEach(function (link) {
        link.textContent = 'Sign Out';
        link.href = '#';
        link.addEventListener('click', function (e) {
          e.preventDefault();
          signOut();
        });
      });
    } else {
      loginBtns.forEach(function (btn) {
        btn.href = getLoginPath();
        btn.textContent = 'Login';
        btn.setAttribute('aria-label', 'Login');
      });
      mobileLoginLinks.forEach(function (link) {
        link.href = getLoginPath();
        link.textContent = 'Login';
      });
    }
  }

  /**
   * Show/hide elements based on role:
   *   data-auth-role="admin"     → only admins
   *   data-auth-role="team"      → admin + team
   *   data-auth-hide="signed-in" → hidden when signed in
   *   data-auth-hide="signed-out"→ hidden when signed out
   */
  function applyRoleVisibility() {
    document.querySelectorAll('[data-auth-role]').forEach(function (el) {
      el.style.display = hasRole(el.getAttribute('data-auth-role')) ? '' : 'none';
    });
    document.querySelectorAll('[data-auth-hide]').forEach(function (el) {
      var when = el.getAttribute('data-auth-hide');
      if ((when === 'signed-in' && isSignedIn()) || (when === 'signed-out' && !isSignedIn())) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });
  }

  /**
   * renderGoogleButton — no-op in CF Access mode.
   * Authentication is handled by CF Access (Google Workspace).
   */
  function renderGoogleButton() {
    // No-op. CF Access handles Google authentication automatically.
  }

  // ─── Bootstrap ────────────────────────────────────────────────────────────

  // 1. Restore cached user synchronously (fast path for returning visitors)
  currentUser = loadCachedUser();

  // 2. Start identity fetch immediately (validates/refreshes the cached user)
  fetchIdentity();

  // 3. Wire up DOM-ready UI updates
  function onDomReady() {
    updateNavbar();
    applyRoleVisibility();
    // Re-apply when fetch completes (in case cached user was stale)
    onAuthChange(function () {
      updateNavbar();
      applyRoleVisibility();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
  } else {
    onDomReady();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  return {
    // Core
    init: init,
    getUser: getUser,
    isSignedIn: isSignedIn,
    getRole: getRole,
    hasRole: hasRole,
    signOut: signOut,
    requireAuth: requireAuth,
    onAuthChange: onAuthChange,
    // UI
    updateNavbar: updateNavbar,
    applyRoleVisibility: applyRoleVisibility,
    renderGoogleButton: renderGoogleButton,
    // Stubs for backward compatibility (role overrides were client-side before)
    getRoleOverrides: function () { return {}; },
    setRoleOverride: function () { return false; },
    removeRoleOverride: function () { return false; },
    getAllowedEmails: function () { return []; },
    getBlockedEmails: function () { return []; },
    addAllowedEmail: function () { return false; },
    removeAllowedEmail: function () { return false; },
    addBlockedEmail: function () { return false; },
    removeBlockedEmail: function () { return false; }
  };

})();
