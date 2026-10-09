# Milestone 2 Architectural Analysis: Shared Navigation, Layout Structure & Design System Integration

**Agent:** `m2_explorer_3`  
**Date:** 2026-10-08  
**Scope:** Milestone 2 (Design System & Styling) — Layout, Navbar, Footer, and Verification Strategy  
**Reference Documents:** `ORIGINAL_REQUEST.md`, `PROJECT.md`, `design.md`, `spec_miner_ui_1/spec_report.md`

---

## 1. Executive Summary

Milestone 2 establishes the visual foundation and reusable layout shell for Ajay Singla's accounting portfolio website. This report focuses on the integration of the design system into the shared layout and UI partials:
1. **Shared Master Layout (`views/layouts/main.ejs`)**: Provides the HTML5 document scaffolding, SEO and accessibility metadata, Google Fonts preconnect and stylesheet links (*Playfair Display* & *Inter*), CSS cascading hierarchy (`tokens.css` → `base.css` → `components.css` → `parallax.css`), skip link, semantic `<main id="main-content">`, and modular client-side script tags.
2. **Shared Navigation (`views/partials/navbar.ejs`)**: Implements a sticky/fixed navigation bar with backdrop blur (`backdrop-filter: blur(12px)`), brand wordmark "Ajay Singla" in *Playfair Display*, navigation links with active indicators and `aria-current="page"`, primary "Get in touch" CTA button, and an accessible mobile hamburger menu with animated drawer toggle.
3. **Shared Footer (`views/partials/footer.ejs`)**: Implements a dark-themed (`--bg-0`) footer featuring verified office coordinates ("One Way Traffic Road, Mansa, Punjab"), clickable telephone link (`tel:9988383380`), clickable email link (`mailto:ajay30@gmail.com`), professional accounting practitioner disclaimer, comprehensive quick navigation links, and dynamic copyright.
4. **Verification Strategy**: Delivers an automated, reproducible testing methodology to verify tokens, typography fallbacks, font loading, layout rendering, and responsive behavior.

---

## 2. Current State vs. Target Specification Audit

An audit of the current codebase (`views/layouts/main.ejs`, `views/partials/navbar.ejs`, `views/partials/footer.ejs`, and `public/css/components.css`) revealed specific gaps:

| Component | Current State | Required Target State | Gap / Action Required |
|---|---|---|---|
| **`views/layouts/main.ejs`** | Minimal layout; links `tokens.css`, `base.css`, `components.css`. No `parallax.css`. No `<script>` tags. `<main>` lacks `id="main-content"`. No skip-to-content link. | Includes all 4 stylesheets (`tokens.css`, `base.css`, `components.css`, `parallax.css`), preconnected Google Fonts, skip link, dynamic page title/description, `<script src="/js/main.js">`, and `<main id="main-content">`. | Add missing stylesheet links, script tags, skip link, and semantic IDs. |
| **`views/partials/navbar.ejs`** | Static desktop list; no mobile hamburger button; no mobile drawer menu; always solid dark blur without dynamic scroll transition. | Fixed/sticky navbar with scroll-triggered blur transition (`backdrop-filter: blur(12px)`), wordmark "Ajay Singla", active state styling, "Get in touch" CTA, and accessible mobile hamburger toggle (`aria-expanded`, `aria-controls`). | Add hamburger button, collapsible mobile menu, `aria-current` attributes, and scroll transition styling/script. |
| **`views/partials/footer.ejs`** | Address is generic ("Mansa, Punjab 151505"); telephone number is missing; disclaimer is abbreviated and lacks practitioner attribution; missing quick links. | Full address ("One Way Traffic Road, Mansa, Punjab"), phone (`tel:9988383380`), email (`mailto:ajay30@gmail.com`), full disclaimer ("Services provided by Ajay Singla, Accounting & Tax Practitioner..."), quick links, copyright. | Update address, inject telephone link, expand disclaimer to full legal text, and refine quick links. |
| **`public/js/main.js`** | Does not exist (`public/js/` only contains `.gitkeep`). | Manages navbar scroll state (adds `.navbar-scrolled` on `scrollY > 40px`) and mobile menu toggle (toggles `aria-expanded` and `.is-open`). | Implement `public/js/main.js`. |
| **`public/css/components.css`** | Contains baseline navbar and footer styles, but lacks mobile hamburger styles, mobile drawer styles, active link indicators, and scroll state transitions. | Comprehensive CSS rules for `.navbar-toggle`, `.navbar-menu`, `.navbar.navbar-scrolled`, `.nav-link.active`, and responsive drawer media queries. | Extend `components.css` with mobile navigation and state transitions. |

---

## 3. Component Architecture & Blueprint Specifications

### 3.1 Shared Master Layout (`views/layouts/main.ejs`)

#### Architectural Requirements
- **DOCTYPE & Lang**: Standard HTML5 `<!DOCTYPE html><html lang="en">`.
- **Viewport & Meta**: `<meta name="viewport" content="width=device-width, initial-scale=1.0">` to guarantee mobile responsiveness and prevent unwanted browser scaling.
- **Dynamic SEO Title & Description**:
  - Title: `<title><%= typeof title !== 'undefined' ? (title.includes('Ajay Singla') ? title : title + ' | Ajay Singla') : 'Ajay Singla | Accounting & Tax Advisory' %></title>`
  - Meta description: Configurable with a robust fallback highlighting 15+ years experience in GST, Income Tax, and PAN assistance in Mansa, Punjab.
- **Font Preconnection & Loading**:
  - `preconnect` to `https://fonts.googleapis.com` and `https://fonts.gstatic.com` with `crossorigin` to shave ~100–200ms off TCP/TLS handshakes.
  - Google Fonts stylesheet loading *Playfair Display* (weights 600, 700; italic 400, 600) and *Inter* (weights 400, 500, 600, 700) with `display=swap` to avoid Flash of Invisible Text (FOIT).
- **CSS Cascading Hierarchy**:
  1. `/css/tokens.css` (Design tokens: palette, typography variables, spacing grid, radii, elevation shadows)
  2. `/css/base.css` (Global reset, base typography rules, container `.container`, section wrappers `.section`, reduced-motion foundation)
  3. `/css/components.css` (Buttons, cards, badges, navbar, footer, form controls)
  4. `/css/parallax.css` (Hero parallax, scroll animations, `.reveal-on-scroll`)
  5. Optional page-specific CSS via `<% if (typeof extraCss !== 'undefined') { %><link rel="stylesheet" href="<%= extraCss %>"><% } %>`
- **Accessibility**:
  - Screen reader skip link: `<a href="#main-content" class="skip-link">Skip to main content</a>` positioned as the very first child of `<body>`.
  - Main semantic element with target id: `<main id="main-content"><%- body %></main>`.
- **Scripts**:
  - Core UI script: `<script src="/js/main.js" defer></script>`
  - Optional parallax script: `<script src="/js/parallax.js" defer></script>`
  - Page-specific scripts: `<% if (typeof extraScript !== 'undefined') { %><script src="<%= extraScript %>" defer></script><% } %>`

#### Implementation Blueprint: `views/layouts/main.ejs`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? (title.includes('Ajay Singla') ? title : title + ' | Ajay Singla') : 'Ajay Singla | Accounting & Tax Advisory' %></title>
  <meta name="description" content="<%= typeof description !== 'undefined' ? description : 'Professional Accounting, GST Registration & Filing, and Income Tax Services in Mansa, Punjab. 15+ years of trusted financial expertise.' %>">
  
  <!-- Favicon -->
  <link rel="icon" href="/img/favicon.ico" type="image/x-icon">

  <!-- Typography: Google Fonts Preconnect & Stylesheets (Playfair Display & Inter) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,400;1,600&display=swap" rel="stylesheet">

  <!-- Design System CSS Cascade -->
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/parallax.css">
  <% if (typeof extraCss !== 'undefined' && extraCss) { %>
    <link rel="stylesheet" href="<%= extraCss %>">
  <% } %>
</head>
<body class="<%= typeof bodyClass !== 'undefined' ? bodyClass : '' %>">
  <!-- Accessibility Skip Link -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Shared Navigation -->
  <%- include('../partials/navbar') %>

  <!-- Main Content Body -->
  <main id="main-content">
    <%- body %>
  </main>

  <!-- Shared Footer -->
  <%- include('../partials/footer') %>

  <!-- Optional Feature Widgets -->
  <% if (typeof features !== 'undefined' && features.chatbot) { %>
    <%- include('../partials/chat-widget') %>
  <% } %>

  <!-- Client-Side Scripts -->
  <script src="/js/main.js" defer></script>
  <script src="/js/parallax.js" defer></script>
  <% if (typeof extraScript !== 'undefined' && extraScript) { %>
    <script src="<%= extraScript %>" defer></script>
  <% } %>
</body>
</html>
```

---

### 3.2 Shared Navigation (`views/partials/navbar.ejs`)

#### Architectural Requirements
- **Semantic Structure**: `<header class="navbar" id="navbar">` wrapping a `.container.navbar-inner`.
- **Brand Wordmark**:
  - Anchor tag linking to `/`.
  - Brand Name: "Ajay Singla" in *Playfair Display*, 22px, font-weight 700, color `--text-hi` (`#F5F5F5`).
  - Subtitle Tagline: "Accounting & Tax Advisory" in *Inter*, 12px, font-weight 500, color `--text-lo` (`#A1A1A6`).
- **Desktop Navigation Links**:
  - `Home` (`/`)
  - `About` (`/about`)
  - `Services` (`/services`)
  - `Contact` (`/contact`)
  - Active indicator logic: Checks `currentPath === linkPath`, adds `.active` class and `aria-current="page"`.
- **Primary Call to Action (CTA)**:
  - Button text: "Get in touch"
  - Link: `/contact`
  - Classes: `.btn .btn-primary` (solid white background `#FFFFFF`, black text `#0B0B0C`, uppercase, 14px, 4px radius).
- **Mobile Hamburger Toggle Button**:
  - Hit area: minimum 44px × 44px for touch accessibility.
  - Accessible attributes: `id="navbar-toggle"`, `aria-label="Toggle navigation menu"`, `aria-expanded="false"`, `aria-controls="navbar-menu"`.
  - Visual: 3 horizontal bars (`.navbar-toggle-bar`) animating into an "X" when `.is-open` is active.
- **Mobile Collapsible Menu Drawer**:
  - `id="navbar-menu"` with `.navbar-menu`.
  - Hidden on mobile (`display: none` or translated off-screen) until `.is-open` class is toggled.
  - Trapped or accessible keyboard focus when open.
- **Scroll Behavior & Blur Effect**:
  - Initial state at page top (`scrollY < 40px`): Background is transparent or subtle gradient with hairline border.
  - Scrolled state (`scrollY >= 40px`): Class `.navbar-scrolled` is added, rendering `background-color: rgba(11, 11, 12, 0.88)`, `backdrop-filter: blur(12px)`, `-webkit-backdrop-filter: blur(12px)`, and `border-bottom: 1px solid var(--line)`.

#### Implementation Blueprint: `views/partials/navbar.ejs`

```html
<header class="navbar" id="navbar">
  <div class="container navbar-inner">
    <!-- Brand Wordmark -->
    <a href="/" class="navbar-brand" aria-label="Ajay Singla Home">
      <span class="navbar-logo">Ajay Singla</span>
      <span class="navbar-tagline">Accounting &amp; Tax Advisory</span>
    </a>

    <!-- Mobile Hamburger Toggle -->
    <button class="navbar-toggle" id="navbar-toggle" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="navbar-menu">
      <span class="navbar-toggle-bar"></span>
      <span class="navbar-toggle-bar"></span>
      <span class="navbar-toggle-bar"></span>
    </button>

    <!-- Navigation Menu (Desktop & Mobile Drawer) -->
    <nav class="navbar-menu" id="navbar-menu" aria-label="Main Navigation">
      <ul class="navbar-nav">
        <li>
          <a href="/" class="nav-link <%= typeof currentPath !== 'undefined' && currentPath === '/' ? 'active' : '' %>" <%= typeof currentPath !== 'undefined' && currentPath === '/' ? 'aria-current="page"' : '' %>>Home</a>
        </li>
        <li>
          <a href="/about" class="nav-link <%= typeof currentPath !== 'undefined' && currentPath === '/about' ? 'active' : '' %>" <%= typeof currentPath !== 'undefined' && currentPath === '/about' ? 'aria-current="page"' : '' %>>About</a>
        </li>
        <li>
          <a href="/services" class="nav-link <%= typeof currentPath !== 'undefined' && currentPath === '/services' ? 'active' : '' %>" <%= typeof currentPath !== 'undefined' && currentPath === '/services' ? 'aria-current="page"' : '' %>>Services</a>
        </li>
        <li>
          <a href="/contact" class="nav-link <%= typeof currentPath !== 'undefined' && currentPath === '/contact' ? 'active' : '' %>" <%= typeof currentPath !== 'undefined' && currentPath === '/contact' ? 'aria-current="page"' : '' %>>Contact</a>
        </li>
        <li class="navbar-cta-item">
          <a href="/contact" class="btn btn-primary navbar-cta-btn">Get in touch</a>
        </li>
      </ul>
    </nav>
  </div>
</header>
```

---

### 3.3 Shared Footer (`views/partials/footer.ejs`)

#### Architectural Requirements
- **Theme & Geometry**:
  - Dark background (`--bg-0` `#0B0B0C`), top border (`1px solid var(--line)` `#2A2A2D`), vertical padding 64px–80px.
- **4-Column Grid Layout (Responsive to 1 Column on Mobile)**:
  - **Column 1: Profile & Authority**:
    - Heading: "Ajay Singla & Associates" (*Playfair Display*, 20px).
    - Summary: "Independent accounting, GST compliance, and income tax advisory with over 15 years of dedicated practice in Mansa, Punjab."
    - Professional Disclaimer:
      *"Services provided by Ajay Singla, Accounting & Tax Practitioner, are professional accounting and tax compliance assistance. No guaranteed refunds or statutory exemptions are promised. All filings are made per prevailing Indian Income Tax and GST laws."*
  - **Column 2: Statutory Services**:
    - GST Registration & Monthly Returns (`/services#gst`)
    - Income Tax Returns (ITR) (`/services#income-tax`)
    - PAN Card Applications & Corrections (`/services#pan`)
    - Business Accounting Advisory (`/services`)
  - **Column 3: Direct Contact Coordinates**:
    - Office Location: "One Way Traffic Road, Mansa, Punjab 151505" (with link to Google Maps or map modal)
    - Clickable Phone: `<a href="tel:9988383380">9988383380</a>` (with clickable `tel:` protocol)
    - Clickable Email: `<a href="mailto:ajay30@gmail.com">ajay30@gmail.com</a>` (with clickable `mailto:` protocol)
    - Office Hours: "Mon – Sat: 9:30 AM – 7:30 PM | Sunday: Closed"
  - **Column 4: Quick Navigation & Admin Access**:
    - Home (`/`)
    - About Ajay Singla (`/about`)
    - Services & FAQ (`/services`)
    - Contact Office (`/contact`)
    - Admin Login (`/admin/login` styled discreetly)
- **Footer Bottom Bar**:
  - Copyright: `&copy; <%= typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear() %> Ajay Singla. All rights reserved.`
  - Monochromatic design note or privacy link.

#### Implementation Blueprint: `views/partials/footer.ejs`

```html
<footer class="footer" id="footer">
  <div class="container">
    <div class="footer-grid">
      <!-- Col 1: Profile & Disclaimer -->
      <div class="footer-col footer-col-brand">
        <h4 class="footer-title">Ajay Singla &amp; Associates</h4>
        <p class="footer-bio">
          Independent accounting, GST compliance, and income tax advisory with over 15 years of dedicated practice in Mansa, Punjab.
        </p>
        <p class="footer-disclaimer">
          <strong>Disclaimer:</strong> Services provided by Ajay Singla, Accounting &amp; Tax Practitioner, are professional accounting and tax compliance assistance. No guaranteed refunds or statutory exemptions are promised. All filings are made per prevailing Indian Income Tax and GST laws.
        </p>
      </div>

      <!-- Col 2: Services -->
      <div class="footer-col">
        <h4 class="footer-title">Services</h4>
        <ul class="footer-links">
          <li><a href="/services#gst">GST Registration &amp; Returns</a></li>
          <li><a href="/services#income-tax">Income Tax Returns (ITR)</a></li>
          <li><a href="/services#pan">PAN Card Applications</a></li>
          <li><a href="/services">Accounting &amp; Bookkeeping</a></li>
        </ul>
      </div>

      <!-- Col 3: Contact Coordinates -->
      <div class="footer-col">
        <h4 class="footer-title">Contact</h4>
        <ul class="footer-links footer-contact-info">
          <li>
            <span class="footer-label">Office:</span>
            <span>One Way Traffic Road, Mansa, Punjab 151505</span>
          </li>
          <li>
            <span class="footer-label">Phone:</span>
            <a href="tel:9988383380" class="footer-contact-link">9988383380</a>
          </li>
          <li>
            <span class="footer-label">Email:</span>
            <a href="mailto:ajay30@gmail.com" class="footer-contact-link">ajay30@gmail.com</a>
          </li>
          <li>
            <span class="footer-label">Hours:</span>
            <span>Mon &ndash; Sat: 9:30 AM &ndash; 7:30 PM</span>
          </li>
        </ul>
      </div>

      <!-- Col 4: Quick Links -->
      <div class="footer-col">
        <h4 class="footer-title">Quick Links</h4>
        <ul class="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About Ajay Singla</a></li>
          <li><a href="/services">Tax &amp; GST Services</a></li>
          <li><a href="/contact">Book Consultation</a></li>
          <li><a href="/admin/login" class="footer-admin-link">Admin Portal</a></li>
        </ul>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <p class="footer-copyright">&copy; <%= typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear() %> Ajay Singla. All rights reserved.</p>
      <p class="footer-meta">Chartered-Style Precision &bull; Monochromatic Design System</p>
    </div>
  </div>
</footer>
```

---

### 3.4 CSS Component Extensions for Navbar & Footer (`public/css/components.css`)

To support the sticky/fixed blur, mobile hamburger drawer, active page indicator, and skip link, `components.css` requires the following modular rules:

```css
/* ==========================================================================
   Skip Link (Accessibility WCAG 2.1 AA)
   ========================================================================== */
.skip-link {
  position: absolute;
  top: -9999px;
  left: var(--space-4);
  background-color: var(--accent);
  color: var(--bg-0);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: var(--text-sm);
  z-index: 9999;
  text-decoration: none;
}

.skip-link:focus {
  top: var(--space-3);
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* ==========================================================================
   Navbar
   ========================================================================== */
.navbar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: rgba(11, 11, 12, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-bottom: 1px solid transparent;
  transition: background-color var(--transition-base),
              backdrop-filter var(--transition-base),
              border-color var(--transition-base),
              box-shadow var(--transition-base);
}

/* Scrolled State Triggered via JS or CSS Fallback */
.navbar.navbar-scrolled {
  background-color: rgba(11, 11, 12, 0.90);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom-color: var(--line);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
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
  text-decoration: none;
}

.navbar-logo {
  font-family: var(--font-heading);
  font-size: 22px;
  font-weight: 700;
  color: var(--text-hi);
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.navbar-tagline {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--text-lo);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Desktop Navigation Menu */
.navbar-menu {
  display: flex;
  align-items: center;
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  list-style: none;
}

.nav-link {
  position: relative;
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-lo);
  padding: var(--space-2) 0;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--text-hi);
}

/* Active Page Indicator */
.nav-link.active {
  color: var(--text-hi);
  font-weight: 600;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent);
  border-radius: 1px;
}

/* Hamburger Button (Default hidden on desktop) */
.navbar-toggle {
  display: none;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--space-2);
  width: 44px;
  height: 44px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5px;
  z-index: 1001;
}

.navbar-toggle-bar {
  display: block;
  width: 24px;
  height: 2px;
  background-color: var(--text-hi);
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

/* Animated Hamburger to X */
.navbar-toggle.is-open .navbar-toggle-bar:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.navbar-toggle.is-open .navbar-toggle-bar:nth-child(2) {
  opacity: 0;
}
.navbar-toggle.is-open .navbar-toggle-bar:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile & Tablet Viewport (< 1024px) */
@media (max-width: 1023px) {
  .navbar-toggle {
    display: flex;
  }

  .navbar-menu {
    position: fixed;
    top: 72px;
    left: 0;
    width: 100%;
    height: calc(100vh - 72px);
    background-color: var(--bg-0);
    border-top: 1px solid var(--line);
    padding: var(--space-6) var(--space-5);
    flex-direction: column;
    align-items: flex-start;
    overflow-y: auto;
    display: none; /* Controlled via .is-open */
  }

  .navbar-menu.is-open {
    display: flex;
  }

  .navbar-nav {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: var(--space-4);
  }

  .nav-link {
    font-size: var(--text-md);
    width: 100%;
    padding: var(--space-3) 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .nav-link.active::after {
    display: none;
  }
  .nav-link.active {
    border-left: 3px solid var(--accent);
    padding-left: var(--space-3);
  }

  .navbar-cta-item {
    margin-top: var(--space-4);
    width: 100%;
  }

  .navbar-cta-btn {
    width: 100%;
  }
}

/* ==========================================================================
   Footer
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
  grid-template-columns: 2fr 1fr 1.5fr 1fr;
  gap: var(--space-6);
  margin-bottom: var(--space-7);
}

@media (max-width: 1023px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }
}

.footer-col-brand {
  max-width: 440px;
}

.footer-title {
  font-family: var(--font-heading);
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--text-hi);
  margin-bottom: var(--space-4);
}

.footer-bio {
  font-size: var(--text-sm);
  line-height: 1.6;
  margin-bottom: var(--space-3);
}

.footer-disclaimer {
  font-size: var(--text-xs);
  line-height: 1.5;
  color: #71717A;
  border-left: 2px solid var(--line);
  padding-left: var(--space-3);
  margin-top: var(--space-4);
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  font-size: var(--text-sm);
}

.footer-links a {
  color: var(--text-lo);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--text-hi);
}

.footer-contact-info li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #71717A;
}

.footer-contact-link {
  color: var(--text-hi) !important;
}

.footer-admin-link {
  font-size: var(--text-xs);
  opacity: 0.7;
}

.footer-bottom {
  border-top: 1px solid var(--line);
  padding-top: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  color: #71717A;
}

@media (max-width: 640px) {
  .footer-bottom {
    flex-direction: column;
    gap: var(--space-2);
    text-align: center;
  }
}
```

---

### 3.5 Client-Side Controller (`public/js/main.js`)

#### Architectural Requirements
- **Navbar Scroll Blur Management**:
  - Monitors `window.scrollY`.
  - When `scrollY > 40px`, adds `.navbar-scrolled` to `#navbar`.
  - When `scrollY <= 40px`, removes `.navbar-scrolled`.
  - Uses `requestAnimationFrame` or passive event listener for 60fps scrolling performance.
- **Mobile Hamburger Toggle**:
  - Listens for clicks on `#navbar-toggle`.
  - Toggles `.is-open` on `#navbar-toggle` and `#navbar-menu`.
  - Updates `aria-expanded` attribute (`"true"` vs `"false"`).
  - Toggles `document.body.classList.toggle('nav-menu-open')` to prevent background scrolling when menu is open.
  - Closes the menu when user clicks a link inside the menu or presses the `Escape` key.

#### Implementation Blueprint: `public/js/main.js`

```javascript
/**
 * Ajay Singla Accounting Portfolio - Main Client Script
 * Handles: Navbar scroll blur, mobile hamburger drawer, accessible keyboard trap
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    // ------------------------------------------------------------------------
    // 1. Navbar Blur-on-Scroll Controller
    // ------------------------------------------------------------------------
    var navbar = document.getElementById('navbar');
    if (navbar) {
      var handleScroll = function () {
        var isScrolled = window.scrollY > 40;
        if (isScrolled) {
          navbar.classList.add('navbar-scrolled');
        } else {
          navbar.classList.remove('navbar-scrolled');
        }
      };

      // Passive scroll listener for smooth performance
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Initial check on load
    }

    // ------------------------------------------------------------------------
    // 2. Mobile Hamburger Menu Toggle
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

      // Close menu when pressing Escape
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') {
          setMenuOpen(false);
          toggleBtn.focus();
        }
      });

      // Close menu when clicking outside
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
```

---

## 4. EJS Layout Rendering Integration in Express

### Current Architecture & Observation
In Milestone 1, `views/layouts/main.ejs` was created, but Express's default `res.render('pages/home')` was rendering `home.ejs`, which itself had duplicated `<!DOCTYPE html><head>...<body>...`.
There are two clean paths for Milestone 2 & Milestone 3 to unify layout rendering:

#### Path A: Zero-Dependency Layout Rendering Wrapper (Recommended for standard Node/Express)
Without introducing external npm packages, `server.js` or controllers can use a layout rendering helper:
```javascript
// Add to server.js middleware
app.use((req, res, next) => {
  const originalRender = res.render.bind(res);
  res.renderWithLayout = (view, locals = {}, layout = 'layouts/main') => {
    req.app.render(view, { ...res.locals, ...locals }, (err, bodyHtml) => {
      if (err) return next(err);
      originalRender(layout, { ...res.locals, ...locals, body: bodyHtml });
    });
  };
  next();
});
```
This allows `pages/home.ejs` to contain solely the inner page sections, automatically wrapping them in `views/layouts/main.ejs` where `<%- body %>` is populated.

#### Path B: Header & Footer Partial Direct Inclusion
Alternatively, pages continue to include `<%- include('../partials/navbar') %>` and `<%- include('../partials/footer') %>`, while `views/layouts/main.ejs` serves as the golden master template for all full-page layouts.

---

## 5. Comprehensive Verification Strategy

To guarantee that the Design System, Layout, Navbar, and Footer satisfy all requirements, the following 4-tier verification strategy must be executed:

### 5.1 Token Verification in Stylesheets
- **Automated Verification Script (`tests/m2-verify.js`)**:
  - Parse `public/css/tokens.css` and verify:
    - Palette tokens: `--bg-0` (`#0B0B0C`), `--bg-1` (`#151517`), `--bg-2` (`#F4F4F2`), `--surface` (`#FFFFFF`), `--text-hi` (`#F5F5F5`), `--text-lo` (`#A1A1A6`), `--ink` (`#111113`), `--ink-soft` (`#5A5A60`), `--line` (`#2A2A2D`), `--line-light` (`#DCDCD8`), `--accent` (`#FFFFFF`), `--accent-light` (`#111113`).
    - Semantic exceptions: `--color-error` (`#C0392B`), `--color-success` (`#2E7D32`).
    - Typography tokens: `--font-heading` (`'Playfair Display', Georgia, serif`), `--font-body` (`'Inter', ...`), 7-step scale (`12px`, `14px`, `16px`, `20px`, `28px`, `40px`, `64px`).
    - Spacing tokens: `--space-1` through `--space-8` (4, 8, 16, 24, 32, 48, 80, 128px).
    - Radii tokens: `--radius-sm` (4px), `--radius-md` (12px), `--radius-pill` (999px).
    - Max container width: `--container-max-width` (1200px).
  - Grep audit: Verify that `tokens.css`, `base.css`, and `components.css` contain **zero unauthorized non-monochromatic hex codes** (e.g., `#007bff`, `#ff00ff`).

### 5.2 Font Loading & Fallback Verification
- **HTML Head Inspection**:
  - Assert presence of `<link rel="preconnect" href="https://fonts.googleapis.com">`.
  - Assert presence of `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
  - Assert Google Fonts link URL includes both `family=Inter` and `family=Playfair+Display` with `display=swap`.
- **CSS Fallback Verification**:
  - Verify that `--font-heading` declares `'Playfair Display', Georgia, serif` so layout renders cleanly without layout shifts even if the network is disconnected.
  - Verify that `--font-body` declares `'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.

### 5.3 Layout & Route Rendering Verification
- **Route & Status Tests**:
  - `GET /`: Returns HTTP 200, Content-Type `text/html`.
  - `GET /health`: Returns HTTP 200, JSON `{ status: 'ok' }`.
  - `GET /unknown-path`: Returns HTTP 404, styled 404 view.
- **Rendered HTML Structure Tests**:
  - Head contains all 4 CSS link tags:
    - `<link rel="stylesheet" href="/css/tokens.css">`
    - `<link rel="stylesheet" href="/css/base.css">`
    - `<link rel="stylesheet" href="/css/components.css">`
    - `<link rel="stylesheet" href="/css/parallax.css">`
  - Body contains `<a href="#main-content" class="skip-link">`.
  - Main container `<main id="main-content">` is present.
  - Bottom scripts contain `<script src="/js/main.js" defer></script>`.
- **Navbar Verification in HTML**:
  - Contains brand wordmark "Ajay Singla" and tagline "Accounting & Tax Advisory".
  - Contains links for `Home`, `About`, `Services`, `Contact`.
  - Contains CTA button "Get in touch" pointing to `/contact`.
  - Contains mobile hamburger `<button id="navbar-toggle" aria-expanded="false" aria-controls="navbar-menu">`.
  - Verifies active indicator `<a ... class="nav-link active" aria-current="page">` matches the rendered route.
- **Footer Verification in HTML**:
  - Contains office address: "One Way Traffic Road, Mansa, Punjab".
  - Contains telephone number with link: `<a href="tel:9988383380">9988383380</a>`.
  - Contains email address with link: `<a href="mailto:ajay30@gmail.com">ajay30@gmail.com</a>`.
  - Contains professional disclaimer: "Services provided by Ajay Singla, Accounting & Tax Practitioner...".
  - Contains dynamic copyright with year (`new Date().getFullYear()`).
  - Contains quick links for Home, About, Services, Contact, and Admin Portal.

### 5.4 Responsiveness & Accessibility Verification
- **Meta Tag**:
  - Assert `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- **Breakpoint CSS Rules**:
  - Verify `@media (max-width: 1023px)` rule for `.navbar-toggle` and `.navbar-menu` exists.
  - Verify `@media (max-width: 768px)` or `@media (max-width: 640px)` rule collapsing `.footer-grid` to single/two columns.
  - Verify container padding adjusts from 16px (mobile) to 24px/32px (desktop).
- **Reduced Motion Support**:
  - Verify `@media (prefers-reduced-motion: reduce)` block in `base.css` sets `animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important;`.
- **Static Asset Delivery**:
  - `GET /css/tokens.css` → 200 OK.
  - `GET /css/base.css` → 200 OK.
  - `GET /css/components.css` → 200 OK.
  - `GET /css/parallax.css` → 200 OK.
  - `GET /js/main.js` → 200 OK.

---

## 6. Implementation Checklist for Worker

The worker implementing Milestone 2 should execute the following sequence:

1. [ ] **Update `views/layouts/main.ejs`**:
   - Add `<link rel="stylesheet" href="/css/parallax.css">`.
   - Add `<a href="#main-content" class="skip-link">Skip to main content</a>`.
   - Add `id="main-content"` to `<main>`.
   - Add `<script src="/js/main.js" defer></script>`.
   - Ensure Google Fonts link includes *Playfair Display* and *Inter* with `display=swap`.
2. [ ] **Update `views/partials/navbar.ejs`**:
   - Add brand tagline "Accounting & Tax Advisory".
   - Add mobile toggle button `#navbar-toggle` with `aria-controls` and `aria-expanded`.
   - Add `<nav class="navbar-menu" id="navbar-menu">`.
   - Ensure active link has `aria-current="page"`.
   - Ensure CTA button says "Get in touch" and links to `/contact`.
3. [ ] **Update `views/partials/footer.ejs`**:
   - Add address "One Way Traffic Road, Mansa, Punjab 151505".
   - Add telephone `<a href="tel:9988383380">9988383380</a>`.
   - Add email `<a href="mailto:ajay30@gmail.com">ajay30@gmail.com</a>`.
   - Add verbatim practitioner disclaimer ("Services provided by Ajay Singla, Accounting & Tax Practitioner...").
   - Add complete quick links including `/admin/login`.
4. [ ] **Create `public/js/main.js`**:
   - Implement navbar scroll blur handler (adds `.navbar-scrolled` on `window.scrollY > 40`).
   - Implement mobile menu toggle (toggles `aria-expanded`, `.is-open`, and body scroll lock).
5. [ ] **Update `public/css/components.css`**:
   - Add styles for `.skip-link`, `.navbar.navbar-scrolled`, `.navbar-toggle`, `.navbar-menu`, `.navbar-menu.is-open`, `.nav-link.active`, and responsive footer.
6. [ ] **Run Verification Suite**:
   - Execute verification tests (`tests/m2-verify.js` or automated assertions) to validate all checks.
