/**
 * Candidlabs Authentication Module
 *
 * Lightweight auth using Google Identity Services (GIS).
 * Designed for a static site hosted on GitHub Pages / similar.
 *
 * Architecture decisions:
 * - Google Sign-In chosen because the team already uses Google Workspace.
 * - Auth state stored in localStorage (user profile + role).
 * - Role mapping is client-side: a config maps emails -> roles.
 *   This is NOT a security boundary -- the real data lives behind
 *   Google Sheets / Looker permissions. This layer controls UI visibility.
 * - Any Google account not in the allowed domain or explicit list is rejected.
 *
 * Roles:
 *   "admin"  — full access to all tools, reports, and data
 *   "team"   — access to own data, limited tool visibility
 *   "viewer" — read-only access to shared dashboards
 */

var CandidAuth = (function () {
  'use strict';

  // ===========================================
  // Configuration
  // ===========================================

  // Google OAuth Client ID — replace with actual value when deploying.
  // To obtain: Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client ID (Web)
  var GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  // Allowed email domain(s). Users outside these domains are rejected
  // unless explicitly listed in ADMIN_EMAILS.
  var ALLOWED_DOMAINS = ['candidmixers.com', 'candidlabs.com'];

  // Emails with admin role. Everyone else on an allowed domain gets "team" role.
  var ADMIN_EMAILS = [
    // Add admin emails here, e.g.:
    // 'dieter@candidmixers.com',
  ];

  // Storage key
  var STORAGE_KEY = 'candidlabs_auth';

  // ===========================================
  // State
  // ===========================================

  var currentUser = null;
  var onAuthChangeCallbacks = [];

  // ===========================================
  // Initialization
  // ===========================================

  /**
   * Load persisted auth state from localStorage on module init.
   */
  function loadPersistedUser() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        currentUser = JSON.parse(stored);
      }
    } catch (e) {
      // Corrupted storage — clear it
      localStorage.removeItem(STORAGE_KEY);
      currentUser = null;
    }
  }

  /**
   * Initialize Google Identity Services.
   * Call this once from pages that include the GIS script.
   */
  function initGoogleSignIn() {
    if (typeof google === 'undefined' || !google.accounts) {
      console.warn('CandidAuth: Google Identity Services SDK not loaded.');
      return;
    }

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
  }

  // ===========================================
  // Google Sign-In Callback
  // ===========================================

  /**
   * Decode a JWT payload (Google credential response).
   * This is a lightweight base64url decode — no signature verification
   * because we trust the Google JS SDK delivered the token.
   */
  function decodeJwtPayload(token) {
    var parts = token.split('.');
    if (parts.length !== 3) return null;
    var payload = parts[1];
    // base64url -> base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    try {
      return JSON.parse(atob(payload));
    } catch (e) {
      return null;
    }
  }

  /**
   * Handle the credential response from Google Sign-In.
   */
  function handleGoogleCredentialResponse(response) {
    var payload = decodeJwtPayload(response.credential);
    if (!payload || !payload.email) {
      showAuthError('Sign-in failed. Could not read account information.');
      return;
    }

    var email = payload.email.toLowerCase();
    var domain = email.split('@')[1];

    // Check if user is allowed
    var isAllowedDomain = ALLOWED_DOMAINS.some(function (d) {
      return domain === d;
    });
    var isAdminEmail = ADMIN_EMAILS.some(function (e) {
      return email === e.toLowerCase();
    });

    if (!isAllowedDomain && !isAdminEmail) {
      showAuthError('Access denied. Your account (' + email + ') is not authorized for Candidlabs.');
      return;
    }

    // Determine role
    var role = isAdminEmail ? 'admin' : 'team';

    currentUser = {
      email: email,
      name: payload.name || email.split('@')[0],
      picture: payload.picture || '',
      role: role,
      domain: domain,
      signedInAt: new Date().toISOString()
    };

    // Persist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));

    // Notify listeners
    fireAuthChange();

    // Redirect to home if on login page
    if (window.location.pathname.endsWith('login.html')) {
      window.location.href = 'index.html';
    }
  }

  // ===========================================
  // Auth State API
  // ===========================================

  /**
   * Returns the current user object, or null if not signed in.
   */
  function getUser() {
    return currentUser;
  }

  /**
   * Returns true if a user is signed in.
   */
  function isSignedIn() {
    return currentUser !== null;
  }

  /**
   * Returns the current user's role, or null.
   */
  function getRole() {
    return currentUser ? currentUser.role : null;
  }

  /**
   * Returns true if the current user has the given role.
   */
  function hasRole(role) {
    if (!currentUser) return false;
    if (role === 'admin') return currentUser.role === 'admin';
    if (role === 'team') return currentUser.role === 'admin' || currentUser.role === 'team';
    if (role === 'viewer') return true; // all authenticated users can view
    return false;
  }

  /**
   * Sign out: clear state and redirect to login.
   */
  function signOut() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);

    // Revoke Google session if GIS is loaded
    if (typeof google !== 'undefined' && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }

    fireAuthChange();
    window.location.href = 'login.html';
  }

  // ===========================================
  // Auth Change Listeners
  // ===========================================

  /**
   * Register a callback for auth state changes.
   */
  function onAuthChange(callback) {
    if (typeof callback === 'function') {
      onAuthChangeCallbacks.push(callback);
    }
  }

  function fireAuthChange() {
    onAuthChangeCallbacks.forEach(function (cb) {
      try { cb(currentUser); } catch (e) { console.error('Auth change callback error:', e); }
    });
  }

  // ===========================================
  // UI Helpers
  // ===========================================

  /**
   * Show a Google Sign-In button inside the given container element.
   */
  function renderGoogleButton(containerElement) {
    if (typeof google === 'undefined' || !google.accounts) {
      console.warn('CandidAuth: Cannot render button — GIS SDK not loaded.');
      return;
    }
    google.accounts.id.renderButton(containerElement, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      width: 300
    });
  }

  /**
   * Update the navbar to reflect auth state.
   * Replaces the Login button with user info + sign-out, or shows Login link.
   */
  function updateNavbar() {
    // Desktop login button
    var loginBtns = document.querySelectorAll('.btn-login');
    // Mobile login link
    var mobileLoginLinks = document.querySelectorAll('.mobile-menu a[href="login.html"]');

    if (isSignedIn()) {
      var user = getUser();

      loginBtns.forEach(function (btn) {
        // Replace with user menu
        var userMenu = document.createElement('div');
        userMenu.className = 'user-menu';
        userMenu.innerHTML =
          '<div class="user-info">' +
            (user.picture
              ? '<img src="' + escapeHtml(user.picture) + '" alt="" class="user-avatar" referrerpolicy="no-referrer">'
              : '<span class="user-avatar-placeholder">' + escapeHtml(user.name.charAt(0).toUpperCase()) + '</span>') +
            '<span class="user-name">' + escapeHtml(user.name.split(' ')[0]) + '</span>' +
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
        btn.href = 'login.html';
        btn.textContent = 'Login';
        btn.setAttribute('aria-label', 'Login');
      });

      mobileLoginLinks.forEach(function (link) {
        link.href = 'login.html';
        link.textContent = 'Login';
      });
    }
  }

  /**
   * Require authentication on the current page.
   * If not signed in, redirects to login.html.
   */
  function requireAuth() {
    if (!isSignedIn()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  }

  /**
   * Show/hide elements based on role.
   * Elements with data-auth-role="admin" are only visible to admins.
   * Elements with data-auth-role="team" are visible to admin and team.
   * Elements with data-auth-hide="signed-in" are hidden when signed in.
   * Elements with data-auth-hide="signed-out" are hidden when signed out.
   */
  function applyRoleVisibility() {
    // Role-based visibility
    var roleElements = document.querySelectorAll('[data-auth-role]');
    roleElements.forEach(function (el) {
      var requiredRole = el.getAttribute('data-auth-role');
      if (hasRole(requiredRole)) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // Auth-state visibility
    var hideElements = document.querySelectorAll('[data-auth-hide]');
    hideElements.forEach(function (el) {
      var hideWhen = el.getAttribute('data-auth-hide');
      if (hideWhen === 'signed-in' && isSignedIn()) {
        el.style.display = 'none';
      } else if (hideWhen === 'signed-out' && !isSignedIn()) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });
  }

  /**
   * Show an auth error message. Used on the login page.
   */
  function showAuthError(message) {
    var errorEl = document.getElementById('auth-error');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'block';
    } else {
      alert(message);
    }
  }

  /**
   * Escape HTML to prevent XSS when inserting user data into the DOM.
   */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ===========================================
  // Bootstrap
  // ===========================================

  // Load persisted user on script load
  loadPersistedUser();

  // When DOM is ready, update nav and apply role visibility
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateNavbar();
      applyRoleVisibility();
    });
  } else {
    // DOM already ready
    updateNavbar();
    applyRoleVisibility();
  }

  // ===========================================
  // Public API
  // ===========================================

  return {
    init: initGoogleSignIn,
    getUser: getUser,
    isSignedIn: isSignedIn,
    getRole: getRole,
    hasRole: hasRole,
    signOut: signOut,
    requireAuth: requireAuth,
    onAuthChange: onAuthChange,
    updateNavbar: updateNavbar,
    applyRoleVisibility: applyRoleVisibility,
    renderGoogleButton: renderGoogleButton
  };

})();
