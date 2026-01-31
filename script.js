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
   * Set active state on current page nav link
   */
  function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-menu a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');

      // Check if this link matches the current page
      if (href === currentPath ||
          (href === 'index.html' && (currentPath === '/' || currentPath.endsWith('/'))) ||
          currentPath.endsWith(href)) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
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
  // Console Welcome Message
  // ===========================================

  console.log(
    '%c🧪 Candidlabs',
    'font-size: 24px; font-weight: bold; color: #1b708b;'
  );
  console.log(
    '%cInternal Business Platform for Candid Mixers',
    'font-size: 14px; color: #64748b;'
  );

})();
