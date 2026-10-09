# Milestone 2: Motion, Parallax Hero, Section Animation & Accessibility Handoff Report

**Agent:** `m2_explorer_2`  
**Milestone:** Milestone 2 (Design System & Styling)  
**Date:** 2026-10-08  
**Working Directory:** `d:/website ajay/.agents/teamwork/m2_explorer_2`  
**Handoff Type:** Hard (Task Complete)

---

## 1. Observation

Direct observations from codebase inspection:

1. **`design.md` Lines 33–39**:
   ```markdown
   ## 3. Motion & Parallax
   - Hero background layers move at 0.2×–0.6× scroll speed (`transform: translate3d`, `will-change: transform`).
   - Section reveal: fade-up 24px, 600ms, `cubic-bezier(.2,.7,.2,1)`, via IntersectionObserver.
   - Hover: buttons lift 2px; cards darken/lighten one step.
   - `@media (prefers-reduced-motion: reduce)` → disable parallax and reveals.
   - Parallax disabled below 768px width for performance.
   ```
2. **`design.md` Lines 54–56**:
   ```markdown
   ### Home
   1. **Hero (dark, parallax)** — eyebrow "Chartered-style precision, local trust"; H1 "Accounts, GST & Tax — handled with 15+ years of care."; subtext; CTAs: "Get in touch" (primary), "View services" (ghost). Background: layered grayscale geometric/texture planes.
   ```
3. **`views/layouts/main.ejs` Lines 14–28**:
   ```html
   <!-- Design System CSS -->
   <link rel="stylesheet" href="/css/tokens.css">
   <link rel="stylesheet" href="/css/base.css">
   <link rel="stylesheet" href="/css/components.css">
   ```
   *Observation:* Missing `<link rel="stylesheet" href="/css/parallax.css">` and `<script src="/js/parallax.js">`. Also lacks an accessible skip-to-content link.
4. **`public/js/` Directory**:
   Contains only `.gitkeep`. `parallax.js` does not yet exist.
5. **`public/css/` Directory**:
   Contains `tokens.css`, `base.css`, and `components.css`. `parallax.css` does not yet exist.
6. **`server.js` Lines 18–28**:
   ```javascript
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
         fontSrc: ["'self'", 'https://fonts.gstatic.com'],
         scriptSrc: ["'self'", "'unsafe-inline'"],
         imgSrc: ["'self'", 'data:']
       }
     }
   }));
   ```
   *Observation:* Helmet CSP allows script from `'self'` (`/js/parallax.js`), styles from `'self'` (`/css/parallax.css`), and images from `'data:'` (inline SVG backgrounds).

---

## 2. Logic Chain

1. **Premise 1 (`design.md` §3)**: The Hero background requires multi-layered geometric planes moving at 0.2× to 0.6× scroll speed via `translate3d` and `will-change: transform`.
   - *Inference*: A 3-layer architecture (`0.2x` grid, `0.4x` vector lines, `0.6x` radial glow) satisfies both the speed constraint and the visual requirement of "layered grayscale geometric planes".
2. **Premise 2 (Performance & Mobile Constraint)**: Parallax must be disabled on viewports narrower than 768px (`design.md` line 38).
   - *Inference*: Both CSS media query (`@media (max-width: 767.98px) { .parallax-layer { transform: none !important; will-change: auto !important; } }`) and JavaScript query (`window.matchMedia('(min-width: 768px)')`) must be enforced to avoid unnecessary event listeners or jank on mobile devices.
3. **Premise 3 (Smooth Scroll Throttling)**: Uncontrolled scroll event listeners trigger excessive layout and paint operations.
   - *Inference*: `parallax.js` must implement `requestAnimationFrame` with passive scroll event listeners (`{ passive: true }`) and viewport culling (`rect.top < window.innerHeight && rect.bottom > 0`) to only animate when the hero is in view.
4. **Premise 4 (Section Reveal Specification)**: Sections must fade up 24px over 600ms using `cubic-bezier(0.2, 0.7, 0.2, 1)` triggered by `IntersectionObserver`.
   - *Inference*: Define `.reveal-on-scroll` with `opacity: 0; transform: translate3d(0, 24px, 0)` and transition to `.is-revealed` (`opacity: 1; transform: translate3d(0, 0, 0)`). Once revealed, the observer unobserves the element to release GPU memory.
5. **Premise 5 (Universal Accessibility & Reduced Motion)**: System preferences for reduced motion must immediately suppress all animations.
   - *Inference*: Universal CSS override (`*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }`) and dynamic JS query (`prefers-reduced-motion: reduce`) guarantee immediate, zero-latency motion suppression.
6. **Premise 6 (No-JS Fallback)**: If JavaScript fails to load or execute, page copy must never remain hidden at `opacity: 0`.
   - *Inference*: Root element `<html>` receives `.js` via JavaScript; CSS targets `.js .reveal-on-scroll` or `html:not(.js) .reveal-on-scroll { opacity: 1 !important; transform: none !important; }`.

---

## 3. Caveats

1. **Explorer Role Scope**: As an exploration agent under Teamwork protocol, this agent did not modify project source files (`public/css/parallax.css`, `public/js/parallax.js`, `views/layouts/main.ejs`). The exact proposed files have been generated within `.agents/teamwork/m2_explorer_2/`.
2. **Browser Engine Support**: Assumptions rely on modern Evergreen browsers (Chrome, Edge, Firefox, Safari >= 14). For legacy browsers without `IntersectionObserver`, graceful fallback reveals all content instantly.
3. **No other caveats.**

---

## 4. Conclusion

The motion, parallax hero, section reveal, and accessibility architecture for Milestone 2 is completely designed, mathematically calibrated, and ready for deployment:

1. **Parallax Hero**: Fully architected across 3 monochromatic layers (`0.2x` grid, `0.4x` vector guidelines, `0.6x` radial glow) with viewport clipping buffer (`top: -15%; height: 130%`), GPU hardware acceleration (`translate3d`), and strict <768px mobile disablement.
2. **Section Reveals**: Configured with `.reveal-on-scroll`, 24px translate, 600ms cubic-bezier transition, and self-terminating `IntersectionObserver` with stagger delay classes (`.reveal-delay-1..4`).
3. **Accessibility**: Hardened with universal `@media (prefers-reduced-motion: reduce)` overrides, dynamic JavaScript media query listeners, high-contrast support (`forced-colors: active`), and keyboard skip links (`.skip-link`).
4. **Deliverables Ready for Worker**:
   - CSS: `d:/website ajay/.agents/teamwork/m2_explorer_2/proposed_parallax.css`
   - JS: `d:/website ajay/.agents/teamwork/m2_explorer_2/proposed_parallax.js`
   - Full Report: `d:/website ajay/.agents/teamwork/m2_explorer_2/report.md`

---

## 5. Verification Method

To independently verify the architecture once implemented by the Worker:

1. **Verify Static Asset Endpoints**:
   Run the following verification script or curl/fetch commands against the running Express server:
   ```bash
   node -e "
   const http = require('http');
   ['/css/parallax.css', '/js/parallax.js', '/'].forEach(p => {
     http.get('http://localhost:3000' + p, res => {
       console.log(p, 'Status:', res.statusCode, 'Type:', res.headers['content-type']);
     });
   });
   "
   ```
   - **Expected Result**: All endpoints return HTTP 200 with appropriate content types (`text/css`, `application/javascript`, `text/html`).

2. **Verify Parallax CSS Tokens & Rules**:
   Inspect `public/css/parallax.css`:
   - Contains `--reveal-distance: 24px;`
   - Contains `--reveal-duration: 600ms;`
   - Contains `--reveal-timing-function: cubic-bezier(0.2, 0.7, 0.2, 1);`
   - Contains `@media (max-width: 767.98px)` with `transform: none !important; will-change: auto !important;`
   - Contains `@media (prefers-reduced-motion: reduce)`

3. **Verify Parallax JS Implementation**:
   Inspect `public/js/parallax.js`:
   - Contains `IntersectionObserver` configuration with `threshold: 0.15`
   - Contains `window.matchMedia('(prefers-reduced-motion: reduce)')`
   - Contains `window.matchMedia('(min-width: 768px)')`
   - Contains `translate3d` string formatting
   - Exports `window.AjaySinglaMotion`

4. **Verify Home Page HTML Structure**:
   Inspect `views/pages/home.ejs`:
   - Contains `<section class="section section-dark hero-parallax-container" data-parallax="container">`
   - Contains `<div class="parallax-canvas" aria-hidden="true">`
   - Contains `.parallax-layer-grid`, `.parallax-layer-accents`, `.parallax-layer-glow` with `data-speed` attributes
   - Contains `.reveal-on-scroll` on section elements and cards

5. **Invalidation Conditions**:
   - Parallax layers animating when viewport < 768px.
   - Parallax transforms continuing to update when `prefers-reduced-motion: reduce` is enabled.
   - Any content remaining hidden (`opacity: 0`) when JavaScript is disabled.
