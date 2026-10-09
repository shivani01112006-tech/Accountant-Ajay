/**
 * Ajay Singla Accounting Portfolio - Main Client Script
 * Handles: Sticky navbar blur on scroll, mobile hamburger drawer toggle,
 * accessible keyboard interactions, body scroll lock.
 * Milestone 2: Design System & Styling
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // ------------------------------------------------------------------------
    // 1. Navbar Blur-on-Scroll Controller (> 40px scroll)
    // ------------------------------------------------------------------------
    var navbar = document.getElementById('navbar') || document.querySelector('.navbar');
    if (navbar) {
      var handleScroll = function () {
        var isScrolled = (window.pageYOffset || document.documentElement.scrollTop || 0) > 40;
        if (isScrolled) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      };

      // Passive scroll listener for 60fps performance
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial evaluation on page load
    }

    // ------------------------------------------------------------------------
    // 2. Mobile Hamburger Menu Toggle & Accessible Drawer
    // ------------------------------------------------------------------------
    var toggleBtn = document.getElementById('navbar-toggle');
    var menuDrawer = document.getElementById('navbar-menu');

    if (toggleBtn && menuDrawer) {
      var setMenuOpen = function (isOpen) {
        toggleBtn.classList.toggle('is-open', isOpen);
        menuDrawer.classList.toggle('is-open', isOpen);
        toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        document.body.classList.toggle('nav-menu-open', isOpen);
      };

      toggleBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
        setMenuOpen(!isOpen);
      });

      // Close menu when clicking any nav link
      var navLinks = menuDrawer.querySelectorAll('.nav-link, .navbar-cta-btn');
      navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
          setMenuOpen(false);
        });
      });

      // Close menu when pressing Escape key
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
          setMenuOpen(false);
          toggleBtn.focus();
        }
      });

      // Close menu when clicking outside drawer
      document.addEventListener('click', function (e) {
        if (
          toggleBtn.getAttribute('aria-expanded') === 'true' &&
          !menuDrawer.contains(e.target) &&
          !toggleBtn.contains(e.target)
        ) {
          setMenuOpen(false);
        }
      });
    }
  });
})();
