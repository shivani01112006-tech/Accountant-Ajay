# Milestone 2: Motion, Parallax Hero, Section Animation & Accessibility Specification

**Document:** `report.md`  
**Agent:** `m2_explorer_2`  
**Milestone:** Milestone 2 (Design System & Styling)  
**Date:** 2026-10-08  
**Working Directory:** `d:/website ajay/.agents/teamwork/m2_explorer_2`  
**Artifact References:**  
- `proposed_parallax.css` (Target: `public/css/parallax.css`)  
- `proposed_parallax.js` (Target: `public/js/parallax.js`)

---

## 1. Executive Summary & Architecture Overview

This report provides the complete motion, parallax hero, section animation, and accessibility architecture for the portfolio website of **Ajay Singla** (Independent Accountant with 15+ years of experience in Mansa, Punjab).

Per `design.md` and `PROJECT.md`, motion must be **subtle, purposeful, and authoritative**, reinforcing the website's chartered-style precision without causing visual noise or vestibular discomfort. 

### Core Architectural Pillars
1. **Hardware-Accelerated Parallax Hero**:
   - Multi-layered grayscale graphic planes translating along the Y-axis at **0.2×, 0.4×, and 0.6×** scroll speed.
   - Executed strictly via `translate3d(0, y, 0)` with `will-change: transform`.
   - **Completely deactivated on viewport widths < 768px** to prevent mobile frame drops, battery consumption, and address bar jumping.
2. **Scroll-Driven Section Reveals**:
   - Entrance animation: **Fade-up 24px, 600ms with cubic-bezier(0.2, 0.7, 0.2, 1)**.
   - Orchestrated via `IntersectionObserver` with `threshold: 0.15` and `rootMargin: '0px 0px -40px 0px'`.
   - Self-terminating (one-shot unobserve) to free CPU and GPU resources.
3. **Strict Accessibility & Reduced Motion Defense**:
   - Universal `@media (prefers-reduced-motion: reduce)` override eliminating all transforms, smooth scrolling, and transitions immediately.
   - Dynamic JavaScript media query monitoring for real-time operating system preference changes.
   - Full WCAG 2.1 AA and Windows High Contrast (`forced-colors: active`) compliance, including keyboard focus rings and `aria-hidden="true"` on decorative canvases.

---

## 2. Parallax Hero Architecture (`parallax.css` & `parallax.js`)

### 2.1 Mathematical Model & Layer Calibration
The hero parallax effect creates optical depth by translating background planes at fractional rates relative to page scroll:

$$\Delta y_{\text{layer}} = (\text{scrollY} - \text{containerTop}) \times \text{speed}$$

Where:
- $\text{scrollY}$: Current vertical scroll offset of the window (`window.pageYOffset || document.documentElement.scrollTop`).
- $\text{containerTop}$: Top offset of the hero container relative to the document.
- $\text{speed}$: Layer velocity multiplier calibrated within the mandated **0.2× to 0.6×** bracket:

| Layer Identifier | Class Name | Speed Factor | Visual Motif / Texture |
|---|---|---|---|
| **Layer 1 (Deepest)** | `.parallax-layer-grid` | **0.2×** | Subtle 48px precision coordinate grid (`rgba(255, 255, 255, 0.03)`). Evokes accounting ledgers and technical precision. |
| **Layer 2 (Mid-ground)** | `.parallax-layer-accents`| **0.4×** | 45° / 135° hairline angled vector guidelines (`rgba(255, 255, 255, 0.04)`). Evokes balance and structured compliance. |
| **Layer 3 (Foreground)** | `.parallax-layer-glow` | **0.6×** | Soft neutral radial gradient spotlight (`rgba(255, 255, 255, 0.06)`). Creates atmospheric illumination behind hero typography. |

### 2.2 Boundary Bleed & Clipping Prevention
To prevent background edges from detaching during parallax translation, the canvas element `.parallax-canvas` uses negative margins / extended bounding:
```css
.hero-parallax-container {
  position: relative;
  overflow: hidden; /* Clips all inner layers */
}

.parallax-canvas {
  position: absolute;
  top: -15%;
  left: 0;
  width: 100%;
  height: 130%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}
```
This ensures a 15% safety buffer at both top and bottom, preventing blank seams even under rapid scroll velocity.

### 2.3 Hardware Acceleration & Compositing
- `will-change: transform` instructs the browser compositor to isolate layers on the GPU.
- `transform: translate3d(0, y, 0)` activates 3D compositing, bypassing layout reflows and paint recalculations.
- `backface-visibility: hidden` prevents jitter and edge anti-aliasing artifacts on Safari and WebKit.
- `pointer-events: none` ensures all mouse clicks pass through uninhibited to foreground hero links and buttons.

### 2.4 Mobile Disablement Guard (< 768px)
On viewports under 768px, mobile browsers frequently throttle scroll events and resize viewports dynamically due to collapsing address bars. Parallax is disabled at two redundant layers:
1. **CSS Layer**:
   ```css
   @media (max-width: 767.98px) {
     .parallax-canvas {
       top: 0;
       height: 100%;
     }
     .parallax-layer {
       transform: none !important;
       will-change: auto !important;
     }
   }
   ```
2. **JavaScript Layer**:
   - `window.matchMedia('(min-width: 768px)')` is evaluated prior to binding the scroll listener.
   - If width < 768px, the scroll listener is detached, the animation frame loop is halted, and all inline `transform` properties are stripped (`element.style.transform = ''`).

---

## 3. Section Reveal & Interactive Animations

### 3.1 IntersectionObserver Mechanics
Reveal animations highlight content as it enters the viewport.

- **Trigger Class**: `.reveal-on-scroll`
- **Active Class**: `.reveal-on-scroll.is-revealed`
- **Initial State**: `opacity: 0; transform: translate3d(0, 24px, 0);`
- **Revealed State**: `opacity: 1; transform: translate3d(0, 0, 0);`
- **Transition Properties**:
  ```css
  transition: 
    opacity 600ms cubic-bezier(0.2, 0.7, 0.2, 1),
    transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
  ```
- **Observer Configuration**:
  ```javascript
  const observer = new IntersectionObserver(callback, {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.15
  });
  ```
  - `threshold: 0.15`: Triggers when 15% of the card or section is visible.
  - `rootMargin: '0px 0px -40px 0px'`: Provides a 40px bottom lead buffer before intersection.
  - **Resource Recycling**: Upon intersection, the observer invokes `observer.unobserve(entry.target)` and removes `will-change` via CSS class `.is-revealed { will-change: auto; }`.

### 3.2 Stagger Delays for Multi-Card Grids
For structured grids (e.g. Services Preview, Why Choose Us, Process Steps), consecutive items trigger with staggered timing offsets:
- `.reveal-delay-1`: `transition-delay: 100ms;`
- `.reveal-delay-2`: `transition-delay: 200ms;`
- `.reveal-delay-3`: `transition-delay: 300ms;`
- `.reveal-delay-4`: `transition-delay: 400ms;`

### 3.3 Interactive Micro-Interactions
1. **Buttons (`.btn`)**:
   - Hover: Lifts by 2px (`transform: translateY(-2px)`), transition `150ms ease`.
   - Active: Returns to base (`transform: translateY(0)`).
2. **Cards (`.card`)**:
   - Hover: Lifts by 4px (`transform: translateY(-4px)`), transition `250ms ease`.
   - Dark Cards (`.card-dark`): Border brightens to `#3E3E42`, shadow expands to `0 24px 70px rgba(0, 0, 0, 0.45)`.
   - Light Cards (`.card-light`): Border transitions to `#C5C5C0`, shadow expands to `0 16px 40px rgba(0, 0, 0, 0.12)`.

---

## 4. Accessibility & Motion Preference Hardening

### 4.1 Reduced Motion (`prefers-reduced-motion: reduce`)
Users with vestibular disorders or motion sensitivity must experience an immediate, zero-motion experience:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  html {
    scroll-behavior: auto !important;
  }

  .parallax-layer {
    transform: none !important;
    will-change: auto !important;
    transition: none !important;
  }

  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    will-change: auto !important;
  }

  .btn:hover,
  .btn:active,
  .card:hover {
    transform: none !important;
  }
}
```

### 4.2 Dynamic Preference Handling in JavaScript
The JavaScript engine listens to `window.matchMedia('(prefers-reduced-motion: reduce)')`. If toggled at runtime in the OS/browser:
1. Immediately detaches parallax event listeners.
2. Clears layer transforms.
3. Adds `.is-revealed` immediately to all `.reveal-on-scroll` elements.

### 4.3 High Contrast & Screen Reader Protections
1. **Forced Colors Mode (`forced-colors: active`)**:
   - Decorative parallax canvas is hidden (`display: none;`).
   - Cards and buttons enforce system border lines (`border: 1px solid ButtonText !important`).
   - Focus indicators map to system highlight (`outline: 2px solid Highlight !important`).
2. **Accessible Skip Link**:
   - Keyboard users can immediately bypass navigation to main content via `.skip-link`:
     ```html
     <a href="#main-content" class="skip-link">Skip to main content</a>
     ```
3. **Screen Reader Structure**:
   - Decorative layers are marked `aria-hidden="true"`.
   - Content container `.hero-content` sits cleanly above layers with semantic `<h1>` and interactive controls.

---

## 5. Exact Implementation Blueprints for the Worker

The Worker agent can write the files directly using the following exact contents:

### 5.1 File: `public/css/parallax.css`
*(Source file located at `.agents/teamwork/m2_explorer_2/proposed_parallax.css`)*

```css
/**
 * Ajay Singla Portfolio - Parallax, Motion & Accessibility Stylesheet
 * Path: public/css/parallax.css
 * 
 * Milestone 2: Design System & Styling
 */

:root {
  --reveal-distance: 24px;
  --reveal-duration: 600ms;
  --reveal-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1);
  --btn-lift-distance: -2px;
  --card-lift-distance: -4px;
  --focus-outline-width: 2px;
  --focus-outline-offset: 2px;
}

/* Hero Container */
.hero-parallax-container {
  position: relative;
  overflow: hidden;
  background-color: var(--bg-0, #0B0B0C);
  color: var(--text-hi, #F5F5F5);
  min-height: 540px;
  display: flex;
  align-items: center;
}

/* Parallax Canvas */
.parallax-canvas {
  position: absolute;
  top: -15%;
  left: 0;
  width: 100%;
  height: 130%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

/* Base Parallax Layer */
.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* Layer 1: Deep Precision Grid (Speed: 0.2x) */
.parallax-layer-grid {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 48px 48px;
  background-position: center center;
  opacity: 0.8;
}

/* Layer 2: Mid-ground Architectural Geometry (Speed: 0.4x) */
.parallax-layer-accents {
  background-image:
    linear-gradient(135deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(45deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 144px 144px;
  background-position: 24px 24px;
  opacity: 0.6;
}

/* Layer 3: Foreground Atmospheric Glow (Speed: 0.6x) */
.parallax-layer-glow {
  background: radial-gradient(
    circle at 75% 35%,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.015) 35%,
    transparent 70%
  );
  opacity: 0.9;
}

/* Hero Foreground Content */
.hero-content {
  position: relative;
  z-index: 2;
  width: 100%;
  padding-top: var(--space-8, 64px);
  padding-bottom: var(--space-8, 64px);
}

@media (min-width: 768px) {
  .hero-content {
    padding-top: var(--space-10, 96px);
    padding-bottom: var(--space-10, 96px);
  }
}

/* Mobile Parallax Disablement (<768px) */
@media (max-width: 767.98px) {
  .parallax-canvas {
    top: 0;
    height: 100%;
  }

  .parallax-layer {
    transform: none !important;
    will-change: auto !important;
  }
}

/* Section Scroll Reveals */
.reveal-on-scroll {
  opacity: 0;
  transform: translate3d(0, var(--reveal-distance), 0);
  transition: 
    opacity var(--reveal-duration) var(--reveal-timing-function),
    transform var(--reveal-duration) var(--reveal-timing-function);
  will-change: opacity, transform;
}

.reveal-on-scroll.is-revealed {
  opacity: 1;
  transform: translate3d(0, 0, 0);
  will-change: auto;
}

.reveal-delay-1 { transition-delay: 100ms; }
.reveal-delay-2 { transition-delay: 200ms; }
.reveal-delay-3 { transition-delay: 300ms; }
.reveal-delay-4 { transition-delay: 400ms; }

/* No-JS Fallback */
html:not(.js) .reveal-on-scroll {
  opacity: 1 !important;
  transform: none !important;
}

/* Interactive Hover States */
.btn {
  transition: 
    transform var(--transition-fast, 150ms ease),
    background-color var(--transition-fast, 150ms ease),
    border-color var(--transition-fast, 150ms ease),
    box-shadow var(--transition-fast, 150ms ease);
}

.btn:hover {
  transform: translateY(var(--btn-lift-distance));
}

.btn:active {
  transform: translateY(0);
}

.card {
  transition: 
    transform var(--transition-base, 250ms ease),
    box-shadow var(--transition-base, 250ms ease),
    border-color var(--transition-base, 250ms ease),
    background-color var(--transition-base, 250ms ease);
}

.card:hover {
  transform: translateY(var(--card-lift-distance));
}

.card-dark:hover {
  border-color: #3E3E42;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.45);
}

.card-light:hover {
  border-color: #C5C5C0;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

/* prefers-reduced-motion Overrides */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  html {
    scroll-behavior: auto !important;
  }

  .parallax-layer {
    transform: none !important;
    will-change: auto !important;
    transition: none !important;
  }

  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
    will-change: auto !important;
  }

  .btn:hover,
  .btn:active,
  .card:hover {
    transform: none !important;
  }
}

/* Screen Reader & High-Contrast Hardening */
.skip-link {
  position: absolute;
  top: -100px;
  left: var(--space-4, 16px);
  background-color: var(--surface, #FFFFFF);
  color: var(--ink, #111113);
  padding: 8px 16px;
  border-radius: var(--radius-sm, 4px);
  font-weight: 600;
  font-size: var(--text-sm, 14px);
  z-index: 9999;
  text-decoration: none;
  box-shadow: var(--shadow-light, 0 10px 30px rgba(0,0,0,0.08));
  transition: top var(--transition-fast, 150ms ease);
}

.skip-link:focus {
  top: var(--space-4, 16px);
  outline: var(--focus-outline-width) solid var(--accent, #FFFFFF);
  outline-offset: var(--focus-outline-offset);
}

a:focus-visible,
button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
.btn:focus-visible {
  outline: var(--focus-outline-width) solid currentColor;
  outline-offset: var(--focus-outline-offset);
}

@media (forced-colors: active) {
  .parallax-canvas {
    display: none;
  }

  .btn,
  .card,
  .badge,
  .navbar {
    border: 1px solid ButtonText !important;
  }

  .btn-primary {
    background-color: ButtonText !important;
    color: ButtonFace !important;
  }

  a:focus-visible,
  button:focus-visible,
  .btn:focus-visible {
    outline: 2px solid Highlight !important;
  }
}
```

---

### 5.2 File: `public/js/parallax.js`
*(Source file located at `.agents/teamwork/m2_explorer_2/proposed_parallax.js`)*

```javascript
/**
 * Ajay Singla Portfolio - Parallax, Scroll Reveals & Motion Controller
 * Path: public/js/parallax.js
 * 
 * Milestone 2: Design System & Styling
 */

(function (window, document) {
  'use strict';

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

  function updateParallaxPositions() {
    var scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    var viewportHeight = window.innerHeight;

    for (var i = 0; i < parallaxContainers.length; i++) {
      var item = parallaxContainers[i];
      var rect = item.container.getBoundingClientRect();

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
```

---

### 5.3 Template Integration: `views/layouts/main.ejs`

To integrate motion, styles, and accessibility into the master layout:
1. Add `<a href="#main-content" class="skip-link">Skip to main content</a>` immediately inside `<body>`.
2. Add `<link rel="stylesheet" href="/css/parallax.css">` in `<head>`.
3. Add `<script src="/js/parallax.js" defer></script>` before closing `</body>`.
4. Ensure `<main id="main-content">` has `id="main-content"`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title : 'Ajay Singla | Accounting & Tax Consultant' %></title>
  <meta name="description" content="Professional Accounting, GST Registration & Filing, and Income Tax Services in Mansa, Punjab. 15+ years of trusted financial expertise.">
  
  <!-- Typography: Playfair Display + Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap" rel="stylesheet">

  <!-- Design System & Motion CSS -->
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/parallax.css">
</head>
<body>
  <!-- Accessible Skip Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <%- include('../partials/navbar') %>

  <main id="main-content">
    <%- body %>
  </main>

  <%- include('../partials/footer') %>

  <!-- Motion & Parallax Controller -->
  <script src="/js/parallax.js" defer></script>
</body>
</html>
```

---

### 5.4 Page Integration: `views/pages/home.ejs`

The Home Hero should be updated to instantiate the parallax canvas and reveal classes:

```html
<!-- Hero Section (Dark, Parallax Enabled) -->
<section class="section section-dark hero-parallax-container" data-parallax="container" aria-label="Introduction">
  <!-- Parallax Layers Canvas -->
  <div class="parallax-canvas" aria-hidden="true">
    <div class="parallax-layer parallax-layer-grid" data-parallax-layer data-speed="0.2"></div>
    <div class="parallax-layer parallax-layer-accents" data-parallax-layer data-speed="0.4"></div>
    <div class="parallax-layer parallax-layer-glow" data-parallax-layer data-speed="0.6"></div>
  </div>

  <!-- Hero Foreground Content -->
  <div class="container hero-content">
    <span class="eyebrow reveal-on-scroll">Chartered-Style Precision, Local Trust</span>
    <h1 class="reveal-on-scroll reveal-delay-1">Accounts, GST & Tax — handled with 15+ years of care.</h1>
    <p class="reveal-on-scroll reveal-delay-2">Expert accounting and tax compliance services for individuals and small businesses in Mansa, Punjab.</p>
    <div class="reveal-on-scroll reveal-delay-3" style="display: flex; gap: var(--space-3); margin-top: var(--space-4); flex-wrap: wrap;">
      <a href="/contact" class="btn btn-primary">Get in Touch</a>
      <a href="/services" class="btn btn-ghost">View Services</a>
    </div>
  </div>
</section>

<!-- Services Preview Section (Light) -->
<section class="section section-light" aria-label="Core Services">
  <div class="container">
    <span class="eyebrow reveal-on-scroll" style="color: var(--ink-soft);">Core Practice Areas</span>
    <h2 class="reveal-on-scroll reveal-delay-1">Comprehensive Compliance & Advisory</h2>
    <p class="reveal-on-scroll reveal-delay-2">Reliable financial solutions tailored for your business needs.</p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-5); margin-top: var(--space-6);">
      <!-- Cards with staggered reveal delays -->
      <div class="card card-light reveal-on-scroll reveal-delay-1">
        <span class="badge" style="background: rgba(0,0,0,0.06); color: var(--ink); border-color: var(--line-light);">GST</span>
        <h3 style="margin-top: var(--space-3); margin-bottom: var(--space-2); color: var(--ink);">GST Registration & Filing</h3>
        <p style="color: var(--ink-soft);">Monthly & quarterly GSTR returns and input tax credit reconciliation.</p>
        <a href="/services#gst" class="btn btn-ghost" style="color: var(--ink); border-color: var(--line-light); margin-top: var(--space-3);">Learn More &rarr;</a>
      </div>
      <div class="card card-light reveal-on-scroll reveal-delay-2">
        <span class="badge" style="background: rgba(0,0,0,0.06); color: var(--ink); border-color: var(--line-light);">ITR</span>
        <h3 style="margin-top: var(--space-3); margin-bottom: var(--space-2); color: var(--ink);">Income Tax Return (ITR)</h3>
        <p style="color: var(--ink-soft);">Accurate computation and filing for salaried, HUF, and business owners.</p>
        <a href="/services#income-tax" class="btn btn-ghost" style="color: var(--ink); border-color: var(--line-light); margin-top: var(--space-3);">Learn More &rarr;</a>
      </div>
      <div class="card card-light reveal-on-scroll reveal-delay-3">
        <span class="badge" style="background: rgba(0,0,0,0.06); color: var(--ink); border-color: var(--line-light);">PAN</span>
        <h3 style="margin-top: var(--space-3); margin-bottom: var(--space-2); color: var(--ink);">PAN Card Services</h3>
        <p style="color: var(--ink-soft);">New applications, corrections, and mandatory Aadhaar linking.</p>
        <a href="/services#pan" class="btn btn-ghost" style="color: var(--ink); border-color: var(--line-light); margin-top: var(--space-3);">Learn More &rarr;</a>
      </div>
    </div>
  </div>
</section>
```

---

## 6. Verification & Quality Assurance Strategy

### 6.1 Automated HTTP Verification Test
To verify the asset serving and markup rendering via Node.js:
1. `GET /css/parallax.css`: Returns HTTP 200 with `Content-Type: text/css`. Contains `--reveal-distance: 24px`, `.hero-parallax-container`, `translate3d`, and `@media (prefers-reduced-motion: reduce)`.
2. `GET /js/parallax.js`: Returns HTTP 200 with `Content-Type: application/javascript`. Contains `IntersectionObserver`, `translate3d`, `matchMedia`, and `window.AjaySinglaMotion`.
3. `GET /`: Returns HTTP 200 with `Content-Type: text/html`. Contains `<link rel="stylesheet" href="/css/parallax.css">`, `<script src="/js/parallax.js"`, `.parallax-layer-grid`, and `reveal-on-scroll`.

### 6.2 Browser Edge Case Checklist
- [x] **Small Mobile Screen (<768px)**: Inspect `.parallax-layer` computed style; `transform` must evaluate to `none`.
- [x] **Reduced Motion Emulation**: Emulate `prefers-reduced-motion: reduce` in browser DevTools. Verify that `.reveal-on-scroll` elements have `opacity: 1` and `transform: none` immediately upon page load.
- [x] **Keyboard Navigation & Focus**: Tab through the hero section. Verify that `.skip-link` becomes visible on first tab stop and focused buttons receive a clear 2px outline with 2px offset.
- [x] **No-JS Fallback**: Disable JavaScript in browser settings. All text and service cards must remain fully visible and readable.
- [x] **Helmet Content-Security-Policy**: Verify that `server.js` CSP allows script from `'self'` (`/js/parallax.js`) and styles from `'self'` (`/css/parallax.css`).
