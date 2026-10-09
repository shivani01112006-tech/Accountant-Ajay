# Milestone 2 Implementation Report: Design System, Styling & Layout Integration

**Agent:** `m2_worker_1` (Worker — Milestone 2 Implementation)  
**Date:** 2026-10-08  
**Scope:** Milestone 2 (Design System & Styling)  
**Status:** COMPLETE (100% Tests Passing, Zero Regressions)

---

## 1. Executive Summary

Milestone 2 has established the complete production-grade Design System, Styling, Motion, and Layout architecture for Ajay Singla's accounting portfolio website. The implementation strictly adheres to `design.md`, `PROJECT.md`, and the architectural blueprints provided by explorers `m2_explorer_1`, `m2_explorer_2`, and `m2_explorer_3`.

All deliverables were built with genuine, hardware-accelerated CSS and vanilla JavaScript without dummy facades or hardcoded values.

### Core Deliverables Built & Verified:
1. `public/css/tokens.css`: Monochromatic palette, Playfair Display + Inter typography tokens, 7-step scale, 4-pt spacing grid, radii, and monochromatic elevation shadows.
2. `public/css/base.css`: Modern reset, typography baselines, accessible focus indicators, screen reader skip-to-content styling, layout containers, and reduced-motion reset.
3. `public/css/components.css`: Buttons with hover lift, light/dark cards, status badges, form inputs (min-height 48px), sticky navbar blur, mobile hamburger drawer, trust indicator tiles, and 4-column footer.
4. `public/css/parallax.css`: 3-layer hero parallax canvas, section scroll reveals (24px translateY, 600ms), mobile disablement rule (< 768px), high contrast mode overrides, and `@media (prefers-reduced-motion: reduce)`.
5. `public/js/parallax.js`: RAF-throttled scroll parallax with layer velocities 0.2x, 0.4x, 0.6x via hardware-accelerated `translate3d`, `IntersectionObserver` reveals with one-shot unobserve, and dynamic OS motion preference change handlers.
6. `public/js/main.js`: Sticky navbar scroll blur controller (> 40px adds `.navbar-scrolled`), mobile hamburger drawer toggle with `aria-expanded` and body scroll locking.
7. `views/layouts/main.ejs`: Preconnected Google Fonts (*Playfair Display* & *Inter*), 4-level CSS cascade hierarchy, accessible skip link, semantic `<main id="main-content">`, and modular script tags.
8. `views/partials/navbar.ejs`: Brand wordmark "Ajay Singla", "Accounting & Tax Advisory" tagline, navigation links with active state indicator (`aria-current="page"`), "Get in touch" CTA, and accessible mobile hamburger toggle.
9. `views/partials/footer.ejs`: 4-column responsive grid featuring exact office address ("One Way Traffic Road, Mansa, Punjab 151505"), clickable `tel:9988383380`, clickable `mailto:ajay30@gmail.com`, full practitioner disclaimer, quick links, admin portal link, and dynamic copyright year.
10. `views/pages/home.ejs`: Parallax hero section with 3 distinct background planes (coordinate grid, diagonal vectors, radial spotlight), trust statistics strip (15+ years experience, 1,000+ filings), featured services preview from DB, 2x2 why-choose grid, structured 4-step process, and bottom consultation CTA band.
11. `tests/m2-verify.js`: Automated test harness verifying tokens, typography, strict monochrome compliance, motion disablement rules, template partials, and live HTTP endpoint serving.

---

## 2. File Implementation Details

### 2.1 Design Tokens (`public/css/tokens.css`)
- **Palette Tokens**: `--bg-0` (#0B0B0C), `--bg-1` (#151517), `--bg-2` (#F4F4F2), `--surface` (#FFFFFF), `--text-hi` (#F5F5F5), `--text-lo` (#A1A1A6), `--ink` (#111113), `--ink-soft` (#5A5A60), `--line` (#2A2A2D), `--line-light` (#DCDCD8), `--accent` (#FFFFFF), `--accent-light` (#111113).
- **Semantic Exceptions**: `--color-error` (#C0392B), `--color-success` (#2E7D32).
- **Typography Tokens**: `--font-heading` (`'Playfair Display', Georgia, serif`), `--font-body` (`'Inter', system-ui, sans-serif`), `--font-mono`.
- **Typographic Scale**: 12px (`--text-xs`), 14px (`--text-sm`), 16px (`--text-base`), 20px (`--text-md`), 28px (`--text-lg`), 40px (`--text-xl`), 64px (`--text-2xl`).
- **Line Heights**: `--lh-heading` (1.1), `--lh-body` (1.6), `--lh-ui` (1.4).
- **Eyebrow**: `--eyebrow-size` (12px), `--eyebrow-tracking` (0.18em), `--eyebrow-transform` (uppercase), `--eyebrow-weight` (600).
- **4-pt Grid**: `--space-1` (4px), `--space-2` (8px), `--space-3` (16px), `--space-4` (24px), `--space-5` (32px), `--space-6` (48px), `--space-7` (80px), `--space-8` (128px).
- **Geometry**: `--container-max-width` (1200px), `--radius-sm` (4px), `--radius-md` (12px), `--radius-pill` (999px).
- **Elevation**: Monochromatic dark shadow (`0 20px 60px rgba(0,0,0,0.35)`) and light shadow (`0 10px 30px rgba(0,0,0,0.08)`).

### 2.2 Base Stylesheet (`public/css/base.css`)
- Modern box-sizing reset (`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }`).
- Root font size 16px, smooth scrolling.
- Typographic baseline with fluid clamp headings (`h1` clamp(2.25rem, 5vw, 4rem), `h2` clamp(1.75rem, 3.5vw, 2.5rem)).
- High-contrast accessible focus ring (`:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }`).
- Accessible skip link (`.skip-link`) hidden offscreen until focused.
- Screen reader utility `.sr-only`.
- Responsive container grid (`.container` max-width 1200px, responsive padding 16px/24px/32px).
- Section theming (`.section-dark`, `.section-dark-elevated`, `.section-light`).
- `@media (prefers-reduced-motion: reduce)` resets all transitions, animations, and disables smooth scrolling.

### 2.3 UI Components (`public/css/components.css`)
- **Buttons**: `.btn` with 14x28 padding and 4px radius per design.md § 4. Lifts 2px on hover (`transform: translateY(-2px)`). `.btn-primary` (solid white on dark, #111113 on light), `.btn-ghost`, `.btn-link`.
- **Cards**: `.card` with 12px radius and 32px padding desktop. Lifts 4px on hover. `.card-dark` on `--bg-1`, `.card-light` on `--surface`.
- **Status Badges**: `.badge` with 999px radius and uppercase 12px label. Light, dark, success, and error variants.
- **Form Controls**: `.form-control`, `.input`, `.select`, `.textarea` with min-height 48px touch target. Inline error state `.is-invalid`, `.form-error`. Hidden honeypot field `.honeypot-field`. Checkbox label.
- **Navbar**: Sticky header with `backdrop-filter: blur(8px)`, transitioning to `backdrop-filter: blur(12px)` and border on `.navbar-scrolled`. Animated mobile hamburger button and full-screen mobile menu drawer.
- **Footer**: 4-column responsive grid collapsing to 2 columns on tablet and 1 column on mobile.
- **Trust Indicators**: `.stat-tile`, `.stat-number` in Playfair Display, `.stat-label`.
- **Process Step Cards**: `.process-card` with `.process-step-number`.
- **Accordion & Widgets**: `.accordion`, `.chat-launcher`, `.cookie-notice`.

### 2.4 Parallax & Motion (`public/css/parallax.css` & `public/js/parallax.js`)
- **Hero Canvas**: `.hero-parallax-container` with 15% overflow buffer top and bottom on `.parallax-canvas` to prevent white edge detachments during fast scroll velocities.
- **Layer Speeds**:
  - Layer 1 (`.parallax-layer-grid`): 0.2x speed (48px precision accounting coordinate grid).
  - Layer 2 (`.parallax-layer-accents`): 0.4x speed (diagonal compliance lines).
  - Layer 3 (`.parallax-layer-glow`): 0.6x speed (radial spotlight gradient).
- **Hardware Acceleration**: `translate3d(0, y, 0)` with `will-change: transform` and `backface-visibility: hidden`.
- **Mobile Disablement**: CSS rule `@media (max-width: 767.98px) { .parallax-layer { transform: none !important; will-change: auto !important; } }` and JavaScript guard detaching scroll listeners under 768px.
- **Scroll Reveals**: `.reveal-on-scroll` translates 24px upwards with 600ms cubic-bezier(0.2, 0.7, 0.2, 1) upon intersecting the viewport.
- **Reduced Motion Support**: Universal `@media (prefers-reduced-motion: reduce)` override disabling all transforms, animations, reveals, and parallax; JS runtime listener reveals all elements immediately.

### 2.5 Master Layout & Partials (`views/layouts/main.ejs`, `navbar.ejs`, `footer.ejs`, `home.ejs`)
- `views/layouts/main.ejs`:
  - Google Fonts preconnect (`fonts.googleapis.com`, `fonts.gstatic.com`).
  - Google Fonts link for *Playfair Display* & *Inter* with `display=swap`.
  - Ordered CSS hierarchy: tokens.css -> base.css -> components.css -> parallax.css.
  - Skip link `<a href="#main-content" class="skip-link">Skip to main content</a>`.
  - Main wrapper `<main id="main-content">`.
  - Scripts `/js/main.js` and `/js/parallax.js`.
- `views/partials/navbar.ejs`:
  - Brand logo "Ajay Singla" in Playfair Display + "Accounting & Tax Advisory" tagline.
  - Links: Home, About, Services, Contact with dynamic active class and `aria-current="page"`.
  - "Get in touch" CTA button.
  - Mobile toggle `#navbar-toggle` with `aria-expanded` and drawer `#navbar-menu`.
- `views/partials/footer.ejs`:
  - Office address: "One Way Traffic Road, Mansa, Punjab 151505".
  - Clickable phone `<a href="tel:9988383380">9988383380</a>`.
  - Clickable email `<a href="mailto:ajay30@gmail.com">ajay30@gmail.com</a>`.
  - Full statutory disclaimer: *"Services provided by Ajay Singla, Accounting & Tax Practitioner, are professional accounting and tax compliance assistance. No guaranteed refunds or statutory exemptions are promised. All filings are made per prevailing Indian Income Tax and GST laws."*
  - Quick links including `/admin/login`.
  - Dynamic copyright year.
- `views/pages/home.ejs`:
  - Parallax hero with 3 data-driven background layers.
  - Eyebrow "Chartered-Style Precision, Local Trust" and H1 "Accounts, GST & Tax — handled with 15+ years of care."
  - Trust strip with 4 metric tiles (15+ Years Experience, 1,000+ Filings, 100% Compliance, 48-Hr Turnaround).
  - Practice areas preview rendering from database services with fallback cards.
  - Why Choose 2x2 grid (Precision, Deadlines, Transparency, Mansa Practice).
  - 4-step process cards (Share Documents, Thorough Review, Statutory Filing, Confirm & Archive).
  - Consultation CTA band with direct call and contact links.

---

## 3. Verification & Test Results

The implementation was validated using automated test suites:

### 3.1 Milestone 2 Automated Verification (`tests/m2-verify.js`)
Command: `node tests/m2-verify.js`  
Result: **ALL MILESTONE 2 VERIFICATION CHECKS PASSED (EXIT CODE 0)**
- [PASS] All 10 expected files and templates exist.
- [PASS] All 14 color tokens, Playfair Display and Inter font family rules, 7-step scale, 1.1/1.6 line-heights, .18em eyebrow tracking, 4-pt grid spacing tokens, 1200px max container width, and monochromatic shadows confirmed.
- [PASS] Zero unauthorized non-monochromatic hex codes found across all 4 stylesheets.
- [PASS] Reduced motion media queries verified in both `base.css` and `parallax.css`.
- [PASS] Mobile disablement (< 768px) verified in CSS and JS.
- [PASS] Parallax speeds 0.2x, 0.4x, 0.6x and IntersectionObserver reveals verified.
- [PASS] Navbar scroll blur (> 40px) and hamburger drawer toggle verified in `main.js`.
- [PASS] Live ephemeral HTTP server `GET /` responded HTTP 200 with all 4 stylesheets, navbar, footer, telephone link, email link, address, and client scripts.
- [PASS] All static CSS and JS assets return HTTP 200 OK.

### 3.2 Regression Verification
- `node tests/m1-verify.js`: **PASS (EXIT CODE 0)** — All configuration, database schema, seeder data, repository methods, and HTTP endpoints intact.
- `node tests/m1-challenge.js`: **PASS (EXIT CODE 0)** — All 36 adversarial challenge assertions passed.
- `node tests/m1-stress-test.js`: **PASS (EXIT CODE 0)** — All 78 stress assertions passed (server lifecycle, security headers, high-concurrency burst, 404/500 rendering).
- `npm.cmd test`: **PASS (EXIT CODE 0)**.

---

## 4. Conclusion
Milestone 2 (Design System & Styling) is fully implemented, verified, regression-tested, and ready for Milestone 3 (Public Pages & Navigation).
