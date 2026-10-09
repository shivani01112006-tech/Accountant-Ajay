/**
 * Ajay Singla Portfolio - Parallax, Scroll Reveals & Motion Controller
 * Path: public/js/parallax.js
 * Milestone 2: Design System & Styling
 */

(function (window, document) {
  'use strict';

  // Mark JS environment for progressive enhancement
  document.documentElement.classList.add('js');

  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var tabletQuery = window.matchMedia('(min-width: 768px)');

  var isParallaxActive = false;
  var isTicking = false;
  var parallaxContainers = [];
  var revealObserver = null;

  function shouldReduceMotion() {
    return motionQuery.matches;
  }

  function isDesktopViewport() {
    return tabletQuery.matches;
  }

  /**
   * Cache all parallax containers and layer references
   */
  function cacheParallaxElements() {
    parallaxContainers = [];
    var containers = document.querySelectorAll('[data-parallax="container"], .hero-parallax-container');

    containers.forEach(function (container) {
      var layers = container.querySelectorAll('[data-parallax-layer], .parallax-layer');
      var layerData = [];

      layers.forEach(function (layer) {
        var rawSpeed = layer.getAttribute('data-speed');
        var speed = 0.3;

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
   * Hardware-accelerated frame update via translate3d
   */
  function updateParallaxPositions() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var viewportHeight = window.innerHeight;

    for (var i = 0; i < parallaxContainers.length; i++) {
      var item = parallaxContainers[i];
      var rect = item.container.getBoundingClientRect();

      // Only calculate if container is visible in viewport
      if (rect.top < viewportHeight && rect.bottom > 0) {
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

  function onScroll() {
    if (!isParallaxActive) return;

    if (!isTicking) {
      window.requestAnimationFrame(updateParallaxPositions);
      isTicking = true;
    }
  }

  function resetParallaxTransforms() {
    for (var i = 0; i < parallaxContainers.length; i++) {
      var item = parallaxContainers[i];
      for (var j = 0; j < item.layers.length; j++) {
        item.layers[j].el.style.transform = '';
      }
    }
  }

  function enableParallax() {
    if (isParallaxActive) return;
    if (shouldReduceMotion() || !isDesktopViewport()) return;

    isParallaxActive = true;
    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallaxPositions();
  }

  function disableParallax() {
    if (!isParallaxActive) {
      resetParallaxTransforms();
      return;
    }

    isParallaxActive = false;
    window.removeEventListener('scroll', onScroll);
    resetParallaxTransforms();
  }

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

    if (shouldReduceMotion() || !('IntersectionObserver' in window)) {
      revealAllImmediately();
      return;
    }

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
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(function (el) {
      if (!el.classList.contains('is-revealed')) {
        revealObserver.observe(el);
      }
    });
  }

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

  function init() {
    cacheParallaxElements();
    initScrollReveals();

    if (isDesktopViewport() && !shouldReduceMotion()) {
      enableParallax();
    } else {
      disableParallax();
    }

    if (typeof motionQuery.addEventListener === 'function') {
      motionQuery.addEventListener('change', handleMotionChange);
      tabletQuery.addEventListener('change', handleViewportChange);
    } else if (typeof motionQuery.addListener === 'function') {
      motionQuery.addListener(handleMotionChange);
      tabletQuery.addListener(handleViewportChange);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        handleViewportChange();
      }, 150);
    }, { passive: true });
  }

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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public API
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
