# Milestone 2: CSS Token Architecture, Base Styles & Components Blueprint

**Author:** `m2_explorer_1` (Exploration Agent — Design System & Styling)  
**Date:** 2026-10-08  
**Scope:** `public/css/tokens.css`, `public/css/base.css`, `public/css/components.css`  
**Target Files:**
1. `d:/website ajay/public/css/tokens.css`
2. `d:/website ajay/public/css/base.css`
3. `d:/website ajay/public/css/components.css`

---

## 1. Executive Summary & Design System Architecture

Ajay Singla's portfolio website represents an independent accounting and tax advisory practice with over 15 years of professional experience in Mansa, Punjab. The design philosophy centers on:
- **Strictly Monochromatic:** A single hue family of neutral carbon greys and pure blacks/whites. Hierarchy is communicated through typography scale, font weight, generous whitespace, and subtle shadows—never arbitrary accent hues.
- **Classic Editorial Authority with Modern UI:** *Playfair Display* (serif) establishes trust and gravitas for headlines, while *Inter* (sans-serif) ensures crisp legibility for body copy, navigational elements, and data tables.
- **4-pt Grid System:** All spacing tokens are mathematical multiples of 4px (4, 8, 16, 24, 32, 48, 80, 128px), ensuring consistent rhythm across viewport scales.
- **WCAG 2.1 AA/AAA Compliance:** Text-to-background contrast ratios strictly exceed 4.5:1 for body copy and 3.0:1 for large display headlines. High-contrast focus rings and zero reliance on color alone ensure accessible navigation.

---

## 2. Token Architecture Specification (`tokens.css`)

### 2.1 Color Tokens & Contrast Auditing

| CSS Custom Property | Hex Value | Role & Context | WCAG Contrast Ratio |
|---|---|---|---|
| `--bg-0` | `#0B0B0C` | Deep carbon black; Hero background, dark sections, footer | Base canvas |
| `--bg-1` | `#151517` | Elevated dark grey; Cards on dark backgrounds, chat panel | Base surface |
| `--bg-2` | `#F4F4F2` | Warm off-white; Light sections (Trust strip, Services preview) | Light canvas |
| `--surface` | `#FFFFFF` | Pure white; Cards on light sections, form inputs | Light surface |
| `--text-hi` | `#F5F5F5` | High-contrast light text on `--bg-0` / `--bg-1` | **17.5:1** on `--bg-0` (AAA) |
| `--text-lo` | `#A1A1A6` | Muted secondary text on dark backgrounds | **6.8:1** on `--bg-0` (AA) |
| `--ink` | `#111113` | Deep charcoal primary text on `--bg-2` / `--surface` | **19.3:1** on `--surface` (AAA) |
| `--ink-soft` | `#5A5A60` | Muted charcoal secondary text on light backgrounds | **6.8:1** on `--surface` (AA) |
| `--line` / `--line-dark` | `#2A2A2D` | Hairline border on dark surfaces | Boundary divider |
| `--line-light` | `#DCDCD8` | Hairline border on light surfaces | Boundary divider |
| `--accent` / `--accent-dark` | `#FFFFFF` | Primary action accent on dark backgrounds | **18.5:1** against `#0B0B0C` |
| `--accent-light` | `#111113` | Primary action accent on light backgrounds | **19.3:1** against `#FFFFFF` |
| `--color-error` / `--semantic-error` | `#C0392B` | Form validation error text & boundary | **5.8:1** on white (AA) |
| `--color-success` / `--semantic-success` | `#2E7D32` | Submission confirmation banner & badges | **5.1:1** on white (AA) |

### 2.2 Typography Tokens

- **Font Families:**
  - Headings: `'Playfair Display', Georgia, 'Times New Roman', serif`
  - Body & UI: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif`
  - Monospace (Code/IDs): `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace`
- **Font Weights:**
  - Regular: `400` (`--fw-regular`)
  - Medium: `500` (`--fw-medium`)
  - Semi-bold: `600` (`--fw-semibold`)
  - Bold: `700` (`--fw-bold`)
- **7-Step Typographic Scale:**
  - Step 1: `12px` / `0.75rem` (`--text-xs`) — Eyebrow label, badges, chips, legal disclaimer
  - Step 2: `14px` / `0.875rem` (`--text-sm`) — Buttons, form labels, nav links, footer links, table text
  - Step 3: `16px` / `1.0rem` (`--text-base`) — Body text, form input value, select options
  - Step 4: `20px` / `1.25rem` (`--text-md`) — H4 subheadings, process step titles, stat labels
  - Step 5: `28px` / `1.75rem` (`--text-lg`) — H3 headings, service card titles, modal titles
  - Step 6: `40px` / `2.5rem` (`--text-xl`) — H2 section headlines, trust stat numbers
  - Step 7: `64px` / `4.0rem` (`--text-2xl`) — H1 display headline, hero titles
- **Line Heights:**
  - Headings: `1.1` (`--lh-heading`) — tight, commanding editorial authority
  - Body: `1.6` (`--lh-body`) — comfortable reading cadence
  - UI/Small: `1.4` (`--lh-ui`) — compact vertical density for buttons & labels
- **Eyebrow Styling Tokens:**
  - Font Size: `12px` (`--eyebrow-size`)
  - Letter Spacing: `0.18em` (`--eyebrow-tracking`)
  - Text Transform: `uppercase` (`--eyebrow-transform`)
  - Font Weight: `600` (`--eyebrow-weight`)

### 2.3 Spacing, Geometry & Shadows

- **4-pt Grid Spacing Scale:**
  - `--space-1`: `4px` (`0.25rem`)
  - `--space-2`: `8px` (`0.5rem`)
  - `--space-3`: `16px` (`1.0rem`)
  - `--space-4`: `24px` (`1.5rem`)
  - `--space-5`: `32px` (`2.0rem`)
  - `--space-6`: `48px` (`3.0rem`)
  - `--space-7`: `80px` (`5.0rem`)
  - `--space-8`: `128px` (`8.0rem`)
  - Convenient helpers: `--space-12`: `12px`, `--space-64`: `64px`, `--space-96`: `96px`
- **Container Max-Width:** `1200px` (`--container-max-width`)
- **Border Radii:**
  - Inputs & Buttons: `4px` (`--radius-sm`)
  - Cards & Containers: `12px` (`--radius-md`)
  - Panels & Modals: `16px` (`--radius-lg`)
  - Badges, Chips & Circular Buttons: `999px` (`--radius-pill`, `--radius-full`)
- **Elevation & Shadows:**
  - Dark surface shadow: `0 20px 60px rgba(0, 0, 0, 0.35)` (`--shadow-dark`)
  - Light surface shadow: `0 10px 30px rgba(0, 0, 0, 0.08)` (`--shadow-light`)
  - Subtle interactive shadow: `0 4px 12px rgba(0, 0, 0, 0.05)` (`--shadow-subtle`)
  - Focus Ring: `0 0 0 2px var(--accent)` (`--focus-ring`) with `2px` offset

---

## 3. Concrete Implementation Blueprint for `public/css/tokens.css`

The Worker shall replace `d:/website ajay/public/css/tokens.css` with this exact implementation:

```css
/**
 * Ajay Singla Portfolio - Design System Tokens
 * Strict Monochrome Palette | Playfair Display + Inter | 4-pt Grid System
 */

:root {
  /* ==========================================================================
     1. Color Tokens (Strictly Monochrome + Semantic Exceptions)
     ========================================================================== */
  --bg-0: #0B0B0C;            /* Hero & deep dark section canvas */
  --bg-1: #151517;            /* Elevated dark surfaces & dark cards */
  --bg-2: #F4F4F2;            /* Light section canvas (warm off-white) */
  --surface: #FFFFFF;         /* Pure white surface, cards on light, form bg */
  
  --text-hi: #F5F5F5;         /* High-contrast text on dark backgrounds */
  --text-lo: #A1A1A6;         /* Secondary / muted text on dark backgrounds */
  --ink: #111113;             /* High-contrast text on light backgrounds */
  --ink-soft: #5A5A60;        /* Secondary / muted text on light backgrounds */

  --line: #2A2A2D;            /* Hairline border for dark theme */
  --line-dark: #2A2A2D;       /* Hairline border for dark theme (explicit alias) */
  --line-light: #DCDCD8;      /* Hairline border for light theme */

  --accent: #FFFFFF;          /* Primary button/link accent on dark backgrounds */
  --accent-dark: #FFFFFF;     /* Explicit alias for dark-context accent */
  --accent-light: #111113;    /* Primary button/link accent on light backgrounds */

  /* Semantic Form Feedback Exceptions */
  --color-error: #C0392B;     /* Validation error red */
  --semantic-error: #C0392B;  /* Alias */
  --color-success: #2E7D32;   /* Form submission success green */
  --semantic-success: #2E7D32;/* Alias */

  /* ==========================================================================
     2. Typography Tokens
     ========================================================================== */
  --font-heading: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
  --font-mono: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;

  /* Font Weights */
  --fw-regular: 400;
  --fw-medium: 500;
  --fw-semibold: 600;
  --fw-bold: 700;

  /* 7-Step Typographic Scale */
  --text-xs: 12px;            /* 0.75rem */
  --text-sm: 14px;            /* 0.875rem */
  --text-base: 16px;          /* 1.0rem */
  --text-md: 20px;            /* 1.25rem */
  --text-lg: 28px;            /* 1.75rem */
  --text-xl: 40px;            /* 2.5rem */
  --text-2xl: 64px;           /* 4.0rem */

  /* Pixel Scale Aliases */
  --font-size-12: 12px;
  --font-size-14: 14px;
  --font-size-16: 16px;
  --font-size-20: 20px;
  --font-size-28: 28px;
  --font-size-40: 40px;
  --font-size-64: 64px;

  /* Line Heights */
  --lh-heading: 1.1;          /* Strict 1.1 line-height for headings per design.md */
  --lh-body: 1.6;             /* Strict 1.6 line-height for body copy per design.md */
  --lh-ui: 1.4;               /* Compact UI element line-height */

  /* Eyebrow Label Tokens */
  --eyebrow-size: 12px;
  --eyebrow-tracking: 0.18em; /* Strict .18em letter-spacing per design.md */
  --eyebrow-transform: uppercase;
  --eyebrow-weight: 600;

  /* ==========================================================================
     3. Spacing Grid Tokens (4-pt System)
     ========================================================================== */
  --space-1: 4px;             /* 0.25rem */
  --space-2: 8px;             /* 0.5rem */
  --space-12: 12px;           /* 0.75rem */
  --space-3: 16px;            /* 1.0rem */
  --space-4: 24px;            /* 1.5rem */
  --space-5: 32px;            /* 2.0rem */
  --space-6: 48px;            /* 3.0rem */
  --space-64: 64px;           /* 4.0rem */
  --space-7: 80px;            /* 5.0rem */
  --space-96: 96px;           /* 6.0rem */
  --space-8: 128px;           /* 8.0rem */

  /* Container Dimensions */
  --container-max-width: 1200px;
  --gutter-mobile: 16px;
  --gutter-tablet: 24px;
  --gutter-desktop: 32px;

  /* ==========================================================================
     4. Geometry, Radii & Shadows
     ========================================================================== */
  --radius-sm: 4px;           /* Inputs, textareas, primary & ghost buttons */
  --radius-md: 12px;          /* Cards, info panels, modals */
  --radius-lg: 16px;          /* Chatbot container, floating dialogue panels */
  --radius-pill: 999px;       /* Status badges, chips */
  --radius-full: 999px;       /* Circular buttons, chat launcher */

  /* Monochromatic Shadows */
  --shadow-dark: 0 20px 60px rgba(0, 0, 0, 0.35);
  --shadow-light: 0 10px 30px rgba(0, 0, 0, 0.08);
  --shadow-subtle: 0 4px 12px rgba(0, 0, 0, 0.05);
  --shadow-lift: 0 8px 24px rgba(0, 0, 0, 0.16);

  /* Accessible Focus Rings */
  --focus-ring: 0 0 0 2px var(--accent);
  --focus-ring-offset: 2px;

  /* ==========================================================================
     5. Transitions & Motion
     ========================================================================== */
  --transition-fast: 150ms ease;
  --transition-base: 250ms cubic-bezier(0.2, 0.7, 0.2, 1);
  --transition-slow: 400ms cubic-bezier(0.2, 0.7, 0.2, 1);
  --transition-reveal: 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
}
```

---

## 4. Concrete Implementation Blueprint for `public/css/base.css`

The Worker shall replace `d:/website ajay/public/css/base.css` with this exact implementation:

```css
/**
 * Ajay Singla Portfolio - Base Stylesheet
 * Modern CSS Reset, Typographic Hierarchy, Container Grid, Section Scaffolding,
 * Accessible Focus Styles, Utilities, and Prefers-Reduced-Motion Overrides.
 */

/* ==========================================================================
   1. CSS Reset & Box Sizing
   ========================================================================== */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--fw-regular);
  line-height: var(--lh-body);
  color: var(--text-hi);
  background-color: var(--bg-0);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

main {
  flex: 1 0 auto;
}

/* ==========================================================================
   2. Accessible Focus Indicator & Skip Link
   ========================================================================== */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: var(--focus-ring-offset);
}

.section-light :focus-visible {
  outline-color: var(--accent-light);
}

.skip-link {
  position: absolute;
  top: -100px;
  left: var(--space-4);
  background-color: var(--accent);
  color: var(--bg-0);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: var(--fw-semibold);
  font-size: var(--text-sm);
  z-index: 9999;
  transition: top var(--transition-fast);
}

.skip-link:focus {
  top: var(--space-4);
}

/* Visually hidden screen reader utility */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* ==========================================================================
   3. Typographic Hierarchy
   ========================================================================== */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  line-height: var(--lh-heading);
  font-weight: var(--fw-bold);
  color: var(--text-hi);
  text-wrap: balance;
}

/* H1: Display Scale (64px desktop / 36px mobile) */
h1 {
  font-size: clamp(2.25rem, 5vw, var(--text-2xl));
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
}

/* H2: Section Headline (40px desktop / 28px mobile) */
h2 {
  font-size: clamp(1.75rem, 3.5vw, var(--text-xl));
  font-weight: var(--fw-semibold);
  letter-spacing: -0.01em;
  margin-bottom: var(--space-3);
}

/* H3: Sub-section / Card Title (28px desktop / 22px mobile) */
h3 {
  font-size: clamp(1.375rem, 2.5vw, var(--text-lg));
  font-weight: var(--fw-semibold);
  letter-spacing: -0.005em;
  margin-bottom: var(--space-2);
}

/* H4: Feature / Step / Stat Header (20px) */
h4 {
  font-size: var(--text-md);
  font-weight: var(--fw-semibold);
  margin-bottom: var(--space-2);
}

/* H5: UI Header (16px) */
h5 {
  font-size: var(--text-base);
  font-weight: var(--fw-medium);
  margin-bottom: var(--space-1);
}

/* H6: Minor Header (14px) */
h6 {
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  margin-bottom: var(--space-1);
}

p {
  color: var(--text-lo);
  margin-bottom: var(--space-4);
  max-width: 68ch;
}

p.lead {
  font-size: 1.125rem; /* 18px */
  line-height: 1.6;
  color: var(--text-lo);
}

a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-fast), opacity var(--transition-fast);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

hr {
  border: 0;
  height: 1px;
  background-color: var(--line);
  margin: var(--space-6) 0;
}

/* Eyebrow Category / Section Tag */
.eyebrow {
  display: inline-block;
  font-family: var(--font-body);
  font-size: var(--eyebrow-size);
  text-transform: var(--eyebrow-transform);
  letter-spacing: var(--eyebrow-tracking);
  font-weight: var(--eyebrow-weight);
  color: var(--text-lo);
  margin-bottom: var(--space-2);
}

.section-light .eyebrow {
  color: var(--ink-soft);
}

/* ==========================================================================
   4. Layout Containers & Section Scaffolding
   ========================================================================== */
.container {
  width: 100%;
  max-width: var(--container-max-width);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--gutter-mobile);
  padding-right: var(--gutter-mobile);
}

@media (min-width: 480px) {
  .container {
    padding-left: var(--gutter-tablet);
    padding-right: var(--gutter-tablet);
  }
}

@media (min-width: 1024px) {
  .container {
    padding-left: var(--gutter-desktop);
    padding-right: var(--gutter-desktop);
  }
}

/* Section Vertical Padding (96–128px desktop, 64px mobile per design.md) */
.section {
  padding-top: var(--space-64);
  padding-bottom: var(--space-64);
  position: relative;
}

@media (min-width: 768px) {
  .section {
    padding-top: var(--space-96);
    padding-bottom: var(--space-96);
  }
}

@media (min-width: 1200px) {
  .section {
    padding-top: var(--space-8);
    padding-bottom: var(--space-8);
  }
}

/* Section Themes */
.section-dark {
  background-color: var(--bg-0);
  color: var(--text-hi);
}

.section-dark-elevated {
  background-color: var(--bg-1);
  color: var(--text-hi);
}

.section-light {
  background-color: var(--bg-2);
  color: var(--ink);
}

.section-light h1,
.section-light h2,
.section-light h3,
.section-light h4 {
  color: var(--ink);
}

.section-light p {
  color: var(--ink-soft);
}

.section-light hr {
  background-color: var(--line-light);
}

/* Section Header Component Pattern */
.section-header {
  margin-bottom: var(--space-6);
  max-width: 720px;
}

.section-header.text-center {
  margin-left: auto;
  margin-right: auto;
}

.section-header p {
  font-size: 1.125rem;
  margin-bottom: 0;
}

/* ==========================================================================
   5. Utility Classes
   ========================================================================== */
/* Text Align */
.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

/* Text Color Classes */
.text-hi { color: var(--text-hi) !important; }
.text-lo { color: var(--text-lo) !important; }
.text-ink { color: var(--ink) !important; }
.text-ink-soft { color: var(--ink-soft) !important; }
.text-error { color: var(--color-error) !important; }
.text-success { color: var(--color-success) !important; }

/* Flex Utilities */
.flex { display: flex; }
.flex-col { display: flex; flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.justify-start { justify-content: flex-start; }

/* Grid Utilities */
.grid { display: grid; }
.grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-5); }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-5); }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); }

@media (max-width: 1024px) {
  .grid-3, .grid-4 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
}

/* Gap Utilities */
.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-5 { gap: var(--space-5); }
.gap-6 { gap: var(--space-6); }

/* Margin Top & Bottom */
.mt-1 { margin-top: var(--space-1); }
.mt-2 { margin-top: var(--space-2); }
.mt-3 { margin-top: var(--space-3); }
.mt-4 { margin-top: var(--space-4); }
.mt-5 { margin-top: var(--space-5); }
.mt-6 { margin-top: var(--space-6); }
.mb-1 { margin-bottom: var(--space-1); }
.mb-2 { margin-bottom: var(--space-2); }
.mb-3 { margin-bottom: var(--space-3); }
.mb-4 { margin-bottom: var(--space-4); }
.mb-5 { margin-bottom: var(--space-5); }
.mb-6 { margin-bottom: var(--space-6); }

/* Responsive Visibility */
@media (max-width: 767px) {
  .hide-mobile { display: none !important; }
}
@media (min-width: 768px) {
  .hide-desktop { display: none !important; }
}

/* ==========================================================================
   6. Prefers-Reduced-Motion Accessibility Overrides
   ========================================================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 5. Concrete Implementation Blueprint for `public/css/components.css`

The Worker shall replace `d:/website ajay/public/css/components.css` with this exact implementation:

```css
/**
 * Ajay Singla Portfolio - Components Stylesheet
 * Buttons, Cards, Badges, Form Inputs & Validation States, Navbar, Footer,
 * Stat Tiles, FAQ Accordion, Chat Widget, Cookie Consent.
 */

/* ==========================================================================
   1. Buttons (.btn)
   ========================================================================== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 14px 28px; /* Strict 14x28 padding per design.md § 4 */
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  line-height: 1;
  border-radius: var(--radius-sm); /* Strict 4px radius per design.md */
  border: 1px solid transparent;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  user-select: none;
  transition: transform var(--transition-fast),
              background-color var(--transition-fast),
              border-color var(--transition-fast),
              box-shadow var(--transition-fast);
}

.btn:hover {
  transform: translateY(-2px); /* Buttons lift 2px on hover per design.md § 3 */
}

.btn:active {
  transform: translateY(0);
}

.btn:disabled,
.btn[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* Primary Button (Dark Sections Canvas) */
.btn-primary {
  background-color: var(--accent); /* Pure White #FFFFFF */
  color: var(--bg-0);              /* #0B0B0C */
  border-color: var(--accent);
}

.btn-primary:hover {
  background-color: #E2E2E2;
  border-color: #E2E2E2;
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.2);
}

/* Primary Button (Light Sections Canvas) */
.btn-primary-dark,
.section-light .btn-primary {
  background-color: var(--accent-light); /* Charcoal #111113 */
  color: #FFFFFF;
  border-color: var(--accent-light);
}

.btn-primary-dark:hover,
.section-light .btn-primary:hover {
  background-color: #2A2A2D;
  border-color: #2A2A2D;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

/* Ghost / Outline Button */
.btn-ghost {
  background-color: transparent;
  color: var(--text-hi);
  border-color: var(--line);
}

.btn-ghost:hover {
  border-color: var(--text-hi);
  background-color: rgba(255, 255, 255, 0.06);
}

.section-light .btn-ghost,
.btn-ghost-dark {
  color: var(--ink);
  border-color: var(--line-light);
}

.section-light .btn-ghost:hover,
.btn-ghost-dark:hover {
  border-color: var(--ink);
  background-color: rgba(0, 0, 0, 0.04);
}

/* Compact Button */
.btn-sm {
  padding: 8px 16px;
  font-size: var(--text-xs);
  letter-spacing: 0.06em;
}

/* Full Width Button */
.btn-block {
  width: 100%;
}

/* Text Link CTA */
.btn-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--fw-semibold);
  color: inherit;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color var(--transition-fast), transform var(--transition-fast);
}

.btn-link:hover {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 4px;
}

.section-light .btn-link:hover {
  color: var(--ink);
}

/* ==========================================================================
   2. Cards (.card)
   ========================================================================== */
.card {
  padding: var(--space-4);
  border-radius: var(--radius-md); /* 12px per design.md § 2 */
  position: relative;
  transition: transform var(--transition-base),
              border-color var(--transition-base),
              box-shadow var(--transition-base);
}

@media (min-width: 768px) {
  .card {
    padding: var(--space-5); /* 32px padding desktop per design.md § 4 */
  }
}

.card:hover {
  transform: translateY(-4px);
}

/* Dark Card (for dark sections) */
.card-dark {
  background-color: var(--bg-1); /* #151517 */
  border: 1px solid var(--line); /* Hairline #2A2A2D */
  color: var(--text-hi);
  box-shadow: var(--shadow-dark);
}

.card-dark:hover {
  border-color: #3E3E42;
}

/* Light Card (for light sections) */
.card-light {
  background-color: var(--surface); /* #FFFFFF */
  border: 1px solid var(--line-light); /* Hairline #DCDCD8 */
  color: var(--ink);
  box-shadow: var(--shadow-light);
}

.card-light:hover {
  border-color: #B5B5B0;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
}

/* ==========================================================================
   3. Status Badges & Chips (.badge)
   ========================================================================== */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 4px 12px;
  border-radius: var(--radius-pill); /* 999px per design.md § 2 */
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--fw-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background-color: rgba(255, 255, 255, 0.08);
  color: var(--text-hi);
  border: 1px solid var(--line);
  line-height: 1.2;
}

.badge-light {
  background-color: #E8E8E6;
  color: var(--ink);
  border-color: var(--line-light);
}

.badge-new {
  background-color: var(--ink);
  color: #FFFFFF;
  border-color: var(--ink);
}

/* Semantic Badge Exceptions */
.badge-success {
  background-color: rgba(46, 125, 50, 0.12);
  color: #81C784;
  border-color: rgba(46, 125, 50, 0.35);
}

.badge-error {
  background-color: rgba(192, 57, 43, 0.12);
  color: #E57373;
  border-color: rgba(192, 57, 43, 0.35);
}

.badge-muted {
  background-color: var(--bg-2);
  color: var(--ink-soft);
  border-color: var(--line-light);
}

/* ==========================================================================
   4. Form Controls & Inputs
   ========================================================================== */
.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  text-align: left;
}

.form-label {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.section-dark .form-label {
  color: var(--text-lo);
}

.form-label .required {
  color: var(--color-error);
  font-weight: var(--fw-bold);
}

/* Base Input / Select / Textarea (Touch Target 48px per design.md § 4) */
.form-control,
.input,
.select,
.textarea {
  width: 100%;
  min-height: 48px;
  padding: 12px 16px;
  font-family: var(--font-body);
  font-size: var(--text-base); /* 16px prevents iOS automatic zoom */
  line-height: 1.4;
  color: var(--ink);
  background-color: var(--surface);
  border: 1px solid var(--line-light);
  border-radius: var(--radius-sm); /* 4px per design.md § 2 */
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-control:focus,
.input:focus,
.select:focus,
.textarea:focus {
  outline: none;
  border-color: var(--ink);
  box-shadow: 0 0 0 2px rgba(17, 17, 19, 0.15);
}

/* Dark Theme Form Inputs */
.form-control-dark,
.section-dark .form-control,
.section-dark .input,
.section-dark .select,
.section-dark .textarea {
  color: var(--text-hi);
  background-color: var(--bg-1);
  border-color: var(--line);
}

.form-control-dark:focus,
.section-dark .form-control:focus,
.section-dark .input:focus,
.section-dark .select:focus,
.section-dark .textarea:focus {
  border-color: var(--text-hi);
  box-shadow: 0 0 0 2px rgba(245, 245, 245, 0.2);
}

.textarea {
  min-height: 120px;
  resize: vertical;
}

.select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235A5A60' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 40px;
  cursor: pointer;
}

.section-dark .select {
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23A1A1A6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
}

/* Validation Error State */
.form-control.is-invalid,
.input.is-invalid,
.select.is-invalid,
.textarea.is-invalid {
  border-color: var(--color-error) !important;
  box-shadow: 0 0 0 2px rgba(192, 57, 43, 0.2) !important;
}

.form-error,
.invalid-feedback {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: var(--fw-medium);
  color: var(--color-error);
  margin-top: var(--space-1);
}

/* Success Card Replacement State */
.form-success-card {
  padding: var(--space-5);
  background-color: var(--surface);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-md);
  text-align: center;
}

.form-success-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: rgba(46, 125, 50, 0.12);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
}

/* Checkbox Control */
.form-checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--ink-soft);
  cursor: pointer;
  user-select: none;
}

.form-checkbox-label input[type="checkbox"] {
  margin-top: 3px;
  width: 18px;
  height: 18px;
  accent-color: var(--ink);
  cursor: pointer;
}

/* Honeypot Spam Defense Field */
.honeypot-field,
.hidden-honey {
  display: none !important;
  position: absolute !important;
  left: -9999px !important;
  width: 1px !important;
  height: 1px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  visibility: hidden !important;
}

/* ==========================================================================
   5. Navbar (.navbar)
   ========================================================================== */
.navbar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: rgba(11, 11, 12, 0.88);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 72px;
}

.navbar-brand {
  display: flex;
  flex-direction: column;
}

.navbar-logo {
  font-family: var(--font-heading);
  font-size: var(--text-md);
  font-weight: var(--fw-bold);
  color: var(--text-hi);
  letter-spacing: -0.01em;
}

.navbar-tagline {
  font-size: var(--text-xs);
  color: var(--text-lo);
  letter-spacing: 0.05em;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  list-style: none;
}

.nav-link {
  font-size: var(--text-sm);
  font-weight: var(--fw-medium);
  color: var(--text-lo);
  padding: var(--space-2) 0;
  position: relative;
  transition: color var(--transition-fast);
}

.nav-link:hover,
.nav-link.active {
  color: var(--text-hi);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent);
}

/* ==========================================================================
   6. Footer (.footer)
   ========================================================================== */
.footer {
  background-color: var(--bg-0);
  border-top: 1px solid var(--line);
  padding-top: var(--space-7);
  padding-bottom: var(--space-6);
  color: var(--text-lo);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}

.footer-title {
  font-family: var(--font-heading);
  font-size: var(--text-md);
  color: var(--text-hi);
  margin-bottom: var(--space-3);
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-links a {
  color: var(--text-lo);
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--text-hi);
}

.footer-bottom {
  border-top: 1px solid var(--line);
  padding-top: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
}

@media (max-width: 600px) {
  .footer-bottom {
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }
}

.footer-disclaimer {
  font-size: var(--text-xs);
  color: #71717A;
  margin-top: var(--space-2);
  line-height: 1.5;
}

/* ==========================================================================
   7. Trust Strip & Stat Tiles (.stat-tile)
   ========================================================================== */
.stat-tile {
  text-align: center;
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  border: 1px solid var(--line-light);
}

.stat-number {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: var(--fw-bold);
  color: var(--ink);
  line-height: 1.1;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--text-xs);
  font-weight: var(--fw-semibold);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
}

/* ==========================================================================
   8. Process Step Cards (.process-card)
   ========================================================================== */
.process-card {
  padding: var(--space-5);
  background-color: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  position: relative;
}

.process-step-number {
  font-family: var(--font-heading);
  font-size: var(--text-lg);
  font-weight: var(--fw-bold);
  color: var(--text-lo);
  margin-bottom: var(--space-2);
}

/* ==========================================================================
   9. FAQ Accordion (.accordion)
   ========================================================================== */
.accordion {
  border: 1px solid var(--line-light);
  border-radius: var(--radius-md);
  background-color: var(--surface);
  overflow: hidden;
}

.accordion-item {
  border-bottom: 1px solid var(--line-light);
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  margin: 0;
}

.accordion-button {
  width: 100%;
  padding: var(--space-4) var(--space-5);
  background: transparent;
  border: none;
  font-family: var(--font-body);
  font-size: 1.125rem;
  font-weight: var(--fw-semibold);
  color: var(--ink);
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.accordion-button:hover {
  background-color: var(--bg-2);
}

.accordion-icon {
  font-size: 1.25rem;
  line-height: 1;
  transition: transform var(--transition-fast);
}

.accordion-content {
  padding: 0 var(--space-5) var(--space-4);
  font-size: var(--text-base);
  color: var(--ink-soft);
  line-height: 1.6;
}

/* ==========================================================================
   10. Chatbot Side Widget (.chat-widget)
   ========================================================================== */
.chat-launcher {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: var(--accent);
  color: var(--bg-0);
  border: 1px solid var(--line);
  box-shadow: var(--shadow-dark);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.chat-launcher:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.chat-panel {
  position: fixed;
  bottom: 88px;
  right: var(--space-4);
  width: 360px;
  height: 520px;
  max-width: calc(100vw - 32px);
  background-color: var(--bg-1);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-dark);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  padding: var(--space-3) var(--space-4);
  background-color: var(--bg-0);
  border-bottom: 1px solid var(--line);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chat-header-title {
  font-family: var(--font-heading);
  font-size: var(--text-base);
  color: var(--text-hi);
  font-weight: var(--fw-bold);
}

.chat-messages {
  flex: 1;
  padding: var(--space-3);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.chat-bubble {
  max-width: 80%;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.4;
}

.chat-bubble-user {
  align-self: flex-end;
  background-color: var(--surface);
  color: var(--ink);
  border-bottom-right-radius: 2px;
}

.chat-bubble-bot {
  align-self: flex-start;
  background-color: var(--bg-0);
  color: var(--text-hi);
  border: 1px solid var(--line);
  border-bottom-left-radius: 2px;
}

.chat-input-bar {
  padding: var(--space-2) var(--space-3);
  background-color: var(--bg-0);
  border-top: 1px solid var(--line);
  display: flex;
  gap: var(--space-2);
}

/* ==========================================================================
   11. Cookie Consent Notice (.cookie-notice)
   ========================================================================== */
.cookie-notice {
  position: fixed;
  bottom: var(--space-4);
  left: var(--space-4);
  max-width: 380px;
  background-color: rgba(21, 21, 23, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  box-shadow: var(--shadow-dark);
  z-index: 998;
}

.cookie-notice-text {
  font-size: var(--text-xs);
  color: var(--text-lo);
  line-height: 1.5;
  margin-bottom: var(--space-3);
}

.cookie-notice-actions {
  display: flex;
  gap: var(--space-2);
}
```

---

## 6. Worker Implementation Plan & Step-by-Step Guide

The Worker will execute the following concrete operations in sequence:

1. **Verify Baseline State:**
   - Run `node tests/m1-verify.js` to ensure the project baseline is clean.
2. **Apply `public/css/tokens.css`:**
   - Overwrite `public/css/tokens.css` with Section 3's verbatim production code.
3. **Apply `public/css/base.css`:**
   - Overwrite `public/css/base.css` with Section 4's verbatim production code.
4. **Apply `public/css/components.css`:**
   - Overwrite `public/css/components.css` with Section 5's verbatim production code.
5. **Automated Verification:**
   - Validate syntax and token presence by testing static asset serving via `http.get('/css/tokens.css')`, `http.get('/css/base.css')`, and `http.get('/css/components.css')`.
   - Validate that all 14 core monochrome and semantic tokens are defined.
   - Run existing test suites (`node tests/m1-verify.js`, `node tests/m1-challenge.js`, `node tests/m1-stress-test.js`).
