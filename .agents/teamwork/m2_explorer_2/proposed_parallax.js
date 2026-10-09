/**
 * Ajay Singla Portfolio - Parallax, Scroll Reveals & Motion Controller
 * Path: public/js/parallax.js
 * 
 * Milestone 2: Design System & Styling
 * 
 * Responsibilities:
 * 1. Parallax Hero:
 *    - 0.2x–0.6x scroll speed translation using hardware-accelerated translate3d.
 *    - Viewport culling (only updates when hero is in active viewport).
 *    - Disabled on viewports narrower than 768px (<768px).
 * 2. Section Scroll Reveals:
 *    - Fade-up 24px, 600ms cubic-bezier(0.2, 0.7, 0.2, 1) via IntersectionObserver.
 *    - Threshold: 0.15, rootMargin: '0px 0px -40px 0px'.
 *    - One-shot reveal with unobserve cleanup.
 * 3. Accessibility & Reduced Motion:
 *    - Responsive to prefers-reduced-motion: reduce at load and during runtime.
 *    - Immediately disables parallax transforms and reveals all content.
 */

(function (window, document) {
  'use strict';

  // Mark HTML root as having JavaScript enabled (supports no-js CSS fallback)
  document.documentElement.classList.add('js');

  // Media queries
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var tabletQuery = window.matchMedia('(min-width: 768px)');

  // State
  var isParallaxActive = false;
  var isTicking = false;
  var parallaxContainers = [];
  var revealObserver = null;

  /**
   * Helper: Check if motion should be suppressed
   */
  function shouldReduceMotion() {
    return motionQuery.matches;
  }

  /**
   * Helper: Check if viewport is wide enough for parallax (>= 768px)
   */
  function isDesktopViewport() {
    return tabletQuery.matches;
  }

  /* ==========================================================================
     Section 1: Parallax Hero Controller
     ========================================================================== */

  /**
   * Cache all parallax containers and their respective layers
   */
  function cacheParallaxElements() {
    parallaxContainers = [];
    var containers = document.querySelectorAll('[data-parallax="container"], .hero-parallax-container');

    containers.forEach(function (container) {
      var layers = container.querySelectorAll('[data-parallax-layer], .parallax-layer');
      var layerData = [];

      layers.forEach(function (layer) {
        var rawSpeed = layer.getAttribute('data-speed');
        var speed = 0.3; // fallback default speed

        if (rawSpeed !== null) {
          speed = parseFloat(rawSpeed);
        } else if (layer.classList.contains('parallax-layer-grid')) {
          speed = 0.2;
        } else if (layer.classList.contains('parallax-layer-accents')) {
          speed = 0.4;
        } else if (layer.classList.contains('parallax-layer-glow')) {
          speed = 0.6;
        }

        layerData.push({
          el: layer,
          speed: isNaN(speed) ? 0.3 : speed
        });
      });

      if (layerData.length > 0) {
        parallaxContainers.push({
          container: container,
          layers: layerData
        });
      }
    });
  }

  /**
   * Perform transform update on all visible parallax layers
   */
  function updateParallaxPositions() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var viewportHeight = window.innerHeight;

    for (var i = 0; i < parallaxContainers.length; i++) {
      var item = parallaxContainers[i];
      var rect = item.container.getBoundingClientRect();

      // Viewport culling: only calculate if container is visible in window
      if (rect.top < viewportHeight && rect.bottom > 0) {
        // Calculate offset relative to container position on page
        var containerTop = item.container.offsetTop || 0;
        var relativeOffset = scrollY - containerTop;

        for (var j = 0; j < item.layers.length; j++) {
          var layerObj = item.layers[j];
          var translateY = (relativeOffset * layerObj.speed).toFixed(2);
          layerObj.el.style.transform = 'translate3d(0, ' + translateY + 'px, 0)';
        }
      }
    }

    isTicking = false;
  }

  /**
   * Scroll event handler with requestAnimationFrame throttling
   */
  function onScroll() {
    if (!isParallaxActive) return;

    if (!isTicking) {
      window.requestAnimationFrame(updateParallaxPositions);
      isTicking = true;
    }
  }

  /**
   * Reset all parallax layers (strip inline transform)
   */
  function resetParallaxTransforms() {
    for (var i = 0; i < parallaxContainers.length; i++) {
      var item = parallaxContainers[i];
      for (var j = 0; j < item.layers.length; j++) {
        item.layers[j].el.style.transform = '';
      }
    }
  }

  /**
   * Enable parallax scrolling listener
   */
  function enableParallax() {
    if (isParallaxActive) return;
    if (shouldReduceMotion() || !isDesktopViewport()) return;

    isParallaxActive = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    // Trigger initial frame calculation
    updateParallaxPositions();
  }

  /**
   * Disable parallax scrolling listener and clear transforms
   */
  function disableParallax() {
    if (!isParallaxActive) {
      resetParallaxTransforms();
      return;
    }

    isParallaxActive = false;
    window.removeEventListener('scroll', onScroll);
    resetParallaxTransforms();
  }

  /* ==========================================================================
     Section 2: Scroll Reveal Controller (IntersectionObserver)
     ========================================================================== */

  /**
   * Immediately reveal all elements (for reduced motion or fallback)
   */
  function revealAllImmediately() {
    var revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(function (el) {
      el.classList.add('is-revealed');
    });
  }

  /**
   * Initialize IntersectionObserver for scroll reveals
   */
  function initScrollReveals() {
    var revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (revealElements.length === 0) return;

    // If user prefers reduced motion, reveal immediately without animation
    if (shouldReduceMotion()) {
      revealAllImmediately();
      return;
    }

    // Graceful fallback for older browsers without IntersectionObserver
    if (!('IntersectionObserver' in window)) {
      revealAllImmediately();
      return;
    }

    // Clean up existing observer if re-initializing
    if (revealObserver) {
      revealObserver.disconnect();
    }

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.15
    };

    revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          // One-shot reveal: unobserve after triggering
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function (el) {
      // If already revealed, do not re-observe
      if (!el.classList.contains('is-revealed')) {
        revealObserver.observe(el);
      }
    });
  }

  /* ==========================================================================
     Section 3: Reactive Media Query Listeners & Lifecycle
     ========================================================================== */

  function handleMotionChange() {
    if (shouldReduceMotion()) {
      disableParallax();
      revealAllImmediately();
    } else {
      initScrollReveals();
      if (isDesktopViewport()) {
        enableParallax();
      }
    }
  }

  function handleViewportChange() {
    if (isDesktopViewport() && !shouldReduceMotion()) {
      enableParallax();
    } else {
      disableParallax();
    }
  }

  /**
   * Main Initialization Routine
   */
  function init() {
    cacheParallaxElements();
    initScrollReveals();

    if (isDesktopViewport() && !shouldReduceMotion()) {
      enableParallax();
    } else {
      disableParallax();
    }

    // Modern and fallback media query change listeners
    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange);
      tabletQuery.addEventListener('change', handleViewportChange);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(handleMotionChange);
      tabletQuery.addListener(handleViewportChange);
    }

    // Re-check on window resize (debounced)
    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        handleViewportChange();
      }, 150);
    }, { passive: true });
  }

  /**
   * Teardown / Cleanup Routine
   */
  function destroy() {
    disableParallax();
    if (revealObserver) {
      revealObserver.disconnect();
      revealObserver = null;
    }
    if (typeof motionQuery.removeEventListener === 'function') {
      motionQuery.removeEventListener('change', handleMotionChange);
      tabletQuery.removeEventListener('change', handleViewportChange);
    }
  }

  // Auto-boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export public API for verification and debugging
  window.AjaySinglaMotion = {
    init: init,
    destroy: destroy,
    enableParallax: enableParallax,
    disableParallax: disableParallax,
    initScrollReveals: initScrollReveals,
    updateParallaxPositions: updateParallaxPositions,
    shouldReduceMotion: shouldReduceMotion,
    isDesktopViewport: isDesktopViewport
  };

})(window, document);
