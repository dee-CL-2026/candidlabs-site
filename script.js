/**
 * Candidlabs - Main JavaScript
 * Handles dark mode toggle, mobile navigation, and scroll effects
 */

(function() {
  'use strict';

  // ===========================================
  // DOM Elements
  // ===========================================
  const themeToggle = document.getElementById('theme-toggle');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const navbar = document.querySelector('.navbar');

  // ===========================================
  // Theme Management
  // ===========================================

  /**
   * Get the current theme from localStorage or system preference
   */
  function getPreferredTheme() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Apply theme to document
   */
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update aria-label for accessibility
    if (themeToggle) {
      const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeToggle.setAttribute('aria-label', label);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }

  // Initialize theme on page load
  setTheme(getPreferredTheme());

  // Theme toggle click handler
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // ===========================================
  // Mobile Navigation
  // ===========================================

  /**
   * Toggle mobile menu visibility
   */
  function toggleMobileMenu() {
    const isActive = mobileMenu.classList.contains('active');

    mobileMenu.classList.toggle('active');
    mobileMenuToggle.classList.toggle('active');

    // Update aria-expanded for accessibility
    mobileMenuToggle.setAttribute('aria-expanded', !isActive);

    // Prevent body scroll when menu is open
    document.body.style.overflow = isActive ? '' : 'hidden';
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileMenuToggle.classList.remove('active');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Mobile menu toggle click handler
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) &&
          !mobileMenuToggle.contains(e.target) &&
          mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
        mobileMenuToggle.focus();
      }
    });
  }

  // Close mobile menu on window resize (if switching to desktop view)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      closeMobileMenu();
    }
  });

  // ===========================================
  // Navbar Scroll Effect
  // ===========================================

  let lastScrollY = 0;
  let ticking = false;

  /**
   * Handle scroll effects for navbar
   */
  function handleScroll() {
    const scrollY = window.scrollY;

    // Add shadow when scrolled
    if (navbar) {
      if (scrollY > 10) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  });

  // ===========================================
  // Active Navigation Link
  // ===========================================

  /**
   * Set active state on current page nav link.
   * Handles root and subdirectory pages, plus sub-page mappings
   * (e.g. dashboard.html → Reports, budget.html → Tools).
   */
  function setActiveNavLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    if (!navLinks.length) return;

    const path = (window.location.pathname || '').split('?')[0].split('#')[0];
    const filename = path.substring(path.lastIndexOf('/') + 1);
    const parentDir = path.split('/').filter(Boolean).slice(-2, -1)[0] || '';

    // Determine which nav target should be active
    let activeTarget = '';
    if (filename === 'tools.html' || filename === 'budget.html') {
      activeTarget = 'tools.html';
    } else if (filename === 'testing.html') {
      activeTarget = 'testing.html';
    } else if (filename === 'reports.html' || filename === 'dashboard.html') {
      activeTarget = 'reports.html';
    } else if (parentDir === 'crm' && filename === 'index.html') {
      activeTarget = 'crm/index.html';
    } else if (parentDir === 'projects' && filename === 'index.html') {
      activeTarget = 'projects/index.html';
    }

    navLinks.forEach(function(link) {
      link.classList.remove('active');
      if (!activeTarget) return;

      // Strip leading ../ for comparison
      const href = (link.getAttribute('href') || '').replace(/^\.\.\//, '');
      if (href === activeTarget) {
        link.classList.add('active');
      }
    });
  }

  setActiveNavLink();

  // ===========================================
  // Card Hover Effects Enhancement
  // ===========================================

  /**
   * Add keyboard accessibility to cards
   */
  document.querySelectorAll('.card').forEach(card => {
    const link = card.querySelector('a, button');
    if (link) {
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          link.click();
        }
      });
    }
  });

  // ===========================================
  // Smooth Scroll for Anchor Links
  // ===========================================

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // ===========================================
  // Auth Integration & Role-Based Views
  // ===========================================

  function getRootPathPrefix() {
    const path = window.location.pathname || '';
    if (path.indexOf('/crm/') !== -1 || path.indexOf('/projects/') !== -1 || path.indexOf('/admin/') !== -1) {
      return '../';
    }
    return '';
  }

  function renderQuickActionsDock() {
    if (document.getElementById('quick-actions-sidebar')) return;
    if (!document.body || document.body.getAttribute('data-disable-quick-actions') === 'true') return;
    if ((window.location.pathname || '').indexOf('login.html') !== -1) return;
    if (typeof CandidAuth === 'undefined' || !CandidAuth.isSignedIn || !CandidAuth.isSignedIn()) return;

    const root = getRootPathPrefix();
    const isAdmin = !!(CandidAuth.hasRole && CandidAuth.hasRole('admin'));
    const actions = [
      { label: 'KAA Form', href: 'https://docs.google.com/forms/d/18dshhMSz7csbJBbeLg_fba6SAJMG5uyd3DnkW59rVSw/viewform', external: true },
      { label: 'Submit Expenses', href: 'https://my.xero.com', external: true },
      { label: 'CRM', href: root + 'crm/index.html' },
      { label: 'Projects', href: root + 'projects/index.html' },
      { label: 'Tools', href: root + 'tools.html' }
    ];

    if (isAdmin) {
      actions.push({ label: 'Testing', href: root + 'testing.html' });
      actions.push({ label: 'Budget', href: root + 'budget.html' });
      actions.push({ label: 'User Roles', href: root + 'admin/users.html' });
    }

    const dock = document.createElement('aside');
    dock.id = 'quick-actions-sidebar';
    dock.className = 'quick-actions-sidebar';

    const panel = document.createElement('div');
    panel.className = 'quick-actions-shell';

    const title = document.createElement('div');
    title.className = 'quick-actions-title';
    title.textContent = 'Quick Actions';
    panel.appendChild(title);

    const list = document.createElement('ul');
    list.className = 'quick-actions-list';
    actions.forEach(function (action) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'quick-actions-link';
      link.href = action.href;
      link.textContent = action.label;
      if (action.external) {
        link.target = '_blank';
        link.rel = 'noopener';
      }
      li.appendChild(link);
      list.appendChild(li);
    });
    panel.appendChild(list);

    dock.appendChild(panel);
    document.body.appendChild(dock);
  }

  function runAuthIntegration() {
    if (typeof CandidAuth === 'undefined') return false;

    // Gate: redirect to login if page requires auth and user is not signed in
    if (document.body.getAttribute('data-auth-require') === 'true') {
      CandidAuth.requireAuth();
    }

    // Show a welcome greeting on the homepage if signed in
    var heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle && CandidAuth.isSignedIn()) {
      var user = CandidAuth.getUser();
      var firstName = user.name ? user.name.split(' ')[0] : '';
      if (firstName) {
        heroSubtitle.textContent = 'Welcome back, ' + firstName;
      }
    }

    // Display user role badge on dashboard pages
    var dashboardHeader = document.querySelector('.dashboard-header');
    if (dashboardHeader && CandidAuth.isSignedIn()) {
      var role = CandidAuth.getRole();
      var roleBadge = document.createElement('span');
      roleBadge.className = 'badge ' + (role === 'admin' ? 'badge-info' : 'badge-success');
      roleBadge.textContent = role.toUpperCase();
      dashboardHeader.querySelector('div').appendChild(roleBadge);
    }

    renderQuickActionsDock();
    CandidAuth.onAuthChange(function () {
      var existingDock = document.getElementById('quick-actions-sidebar');
      if (existingDock) existingDock.remove();
      renderQuickActionsDock();
    });
    return true;
  }

  /**
   * Page-level auth gates and role-based content filtering.
   * Relies on CandidAuth (auth.js) being loaded first.
   *
   * Pages that require authentication add data-auth-require="true" to <body>.
   * Elements that require a specific role use data-auth-role="admin"|"team".
   * Elements hidden by auth state use data-auth-hide="signed-in"|"signed-out".
   *
   * Auth is a UI visibility layer only. Real data access is controlled
   * by Google Sheets/Looker permissions on the backend.
   */
  if (!runAuthIntegration()) {
    var authInitAttempts = 0;
    var authInitTimer = setInterval(function () {
      authInitAttempts += 1;
      if (runAuthIntegration() || authInitAttempts > 40) {
        clearInterval(authInitTimer);
      }
    }, 50);
  }

  // ===========================================
  // Console Welcome Message
  // ===========================================

  console.log(
    '%c Candidlabs',
    'font-size: 24px; font-weight: bold; color: #1b708b;'
  );
  console.log(
    '%cInternal Business Platform for Candid Mixers',
    'font-size: 14px; color: #64748b;'
  );

})();
