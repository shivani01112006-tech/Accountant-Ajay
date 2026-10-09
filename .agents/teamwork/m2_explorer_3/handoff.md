# Handoff Report: Milestone 2 — Shared Navigation, Layout Structure & Design System Integration

**Agent:** `m2_explorer_3`  
**Date:** 2026-10-08  
**Type:** Hard Handoff  
**Target:** Milestone 2 Worker / Orchestrator  

---

## 1. Observation

Direct observations from inspection of the codebase and specifications:

1. **`views/layouts/main.ejs` (lines 1–28)**:
   - Does NOT link `/css/parallax.css` (only links `tokens.css`, `base.css`, `components.css` at lines 15–17).
   - Does NOT contain any client-side `<script>` tags before `</body>` (line 27 ends with `</body></html>`).
   - The `<main>` element (line 22) lacks `id="main-content"` and there is no accessible skip-to-content link for screen readers.
   - Dynamic title is `<title><%= typeof title !== 'undefined' ? title : 'Ajay Singla | Accounting & Tax Consultant' %></title>`.
2. **`views/partials/navbar.ejs` (lines 1–19)**:
   - Contains a desktop-only `<nav aria-label="Main Navigation">` (line 8) and `<ul>` list (lines 9–15).
   - Lacks a mobile hamburger toggle button (`<button class="navbar-toggle">`) and lacks an `aria-expanded` / `aria-controls` collapsible container.
   - Wordmark at line 4 is `<span class="navbar-logo">Ajay Singla</span>` with `<span class="navbar-tagline">Accounting & Tax Advisory</span>` (line 5).
   - Links include Home (`/`), About (`/about`), Services (`/services`), Contact (`/contact`), and CTA button `<a href="/contact" class="btn btn-primary">Get in Touch</a>` (lines 10–14).
   - Lacks scroll-based dynamic blur transition logic (it relies solely on a static CSS backdrop-filter).
3. **`views/partials/footer.ejs` (lines 1–35)**:
   - Line 22 contains only generic location: `<li>Mansa, Punjab 151505</li>`. The required street address `"One Way Traffic Road, Mansa, Punjab"` is absent.
   - Telephone number `9988383380` is completely missing from the footer links (lines 21–25 only list address, email, and "Book Consultation").
   - Email is present at line 23: `<a href="mailto:ajay30@gmail.com">ajay30@gmail.com</a>`.
   - Disclaimer at line 7 reads: `"Disclaimer: We help you file correctly and on time. All services adhere to statutory guidelines under the Income Tax Department and GST Network."` — this does NOT contain the required text `"Services provided by Ajay Singla, Accounting & Tax Practitioner..."`.
   - Copyright at line 30 reads: `&copy; <%= typeof currentYear !== 'undefined' ? currentYear : new Date().getFullYear() %> Ajay Singla. All rights reserved.`.
4. **`public/css/components.css` (lines 55–114 & lines 162–223)**:
   - The `.navbar` rule (lines 55–66) has `position: sticky; top: 0; left: 0; background-color: rgba(11, 11, 12, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line);`.
   - It lacks class definitions for `.navbar-toggle`, `.navbar-toggle-bar`, `.navbar-menu`, `.navbar-menu.is-open`, `.navbar-scrolled`, and `.skip-link`.
   - The `.footer-grid` (lines 170–182) has `grid-template-columns: 2fr 1fr 1fr;` which accommodates only 3 columns rather than the full 4-column breakdown specified in `spec_miner_ui_1/spec_report.md` (lines 228–243).
5. **`public/js/`**:
   - Contains only `.gitkeep`. There is no `public/js/main.js` to manage the navbar scroll blur state or hamburger menu toggle.
6. **Baseline Test Execution**:
   - Ran `node tests/m1-verify.js` which exited with code 0 (all 20+ checks passed).

---

## 2. Logic Chain

1. **Premise 1 (Master Layout Completeness)**: Per `PROJECT.md` § Feature 11 and `spec_miner_ui_1/spec_report.md` § 6.2, the shared layout must link all design system stylesheets (`tokens.css`, `base.css`, `components.css`, `parallax.css`) and include core interactive scripts (`/js/main.js`).
   - *Connecting Observation 1 & 5*: Because `views/layouts/main.ejs` currently omits `parallax.css` and script tags, any hero parallax, mobile hamburger interaction, or scroll blur deployed in Milestone 2 would fail to render or execute without updating `main.ejs` and creating `public/js/main.js`.
2. **Premise 2 (Navbar Responsiveness & Scroll Dynamics)**: Per `design.md` § 4 and the dispatch task, the navbar must feature a fixed/sticky blurred background (`backdrop-filter: blur(12px)`) active upon scroll, wordmark "Ajay Singla", navigation links (Home, About, Services, Contact), CTA button "Get in touch", active page indicators, and a mobile hamburger menu toggle.
   - *Connecting Observation 2 & 4*: Because `views/partials/navbar.ejs` currently has neither a hamburger button nor collapsible drawer, mobile viewports (<1024px) would suffer horizontal overflow. Updating `navbar.ejs`, adding CSS rules for `.navbar-toggle` and `.navbar-menu` in `components.css`, and attaching toggle logic in `main.js` satisfies both visual fidelity and WCAG 2.1 AA accessibility.
3. **Premise 3 (Footer Contact & Legal Compliance)**: Per `ORIGINAL_REQUEST.md` and dispatch prompt, the footer must contain the exact office location ("One Way Traffic Road, Mansa, Punjab"), telephone ("9988383380"), email ("ajay30@gmail.com"), copyright, quick links, and professional disclaimer ("Services provided by Ajay Singla, Accounting & Tax Practitioner...").
   - *Connecting Observation 3*: Because the current footer omits the street address, telephone number, and practitioner disclaimer, it fails acceptance requirements. Updating `views/partials/footer.ejs` resolves all required business coordinates and legal notices.
4. **Premise 4 (Verification Feasibility)**: The design system requires validation of tokens, typography, layout rendering, and responsive behavior without manual browser intervention.
   - *Connecting Observation 6*: An automated test script (`tests/m2-verify.js`) running against an ephemeral Express server can verify HTTP status codes, HTML substrings (navbar brand, phone links, disclaimers, skip link), CSS token definitions, and asset endpoints deterministically.

---

## 3. Caveats

1. **Parallax Motion Implementation**: Parallax CSS and JavaScript details (`public/css/parallax.css` and `public/js/parallax.js`) are being formulated by peer agent `m2_explorer_2`. This layout blueprint coordinates directly with that structure by providing the standard link and script references.
2. **Token & Base CSS Definitions**: Detailed `:root` token mappings and CSS resets in `tokens.css` and `base.css` are being formulated by peer agent `m2_explorer_1`. This layout analysis adheres strictly to the tokens established in `design.md` and `tokens.css`.
3. **Page-Specific Body Content**: Milestone 2 focuses on Design System & Shared Layouts. Full page-specific body content for `/about`, `/services`, and `/contact` will be fully fleshed out in Milestone 3, but the shared layout and partials must be completely ready to host them.

---

## 4. Conclusion

The shared layout (`views/layouts/main.ejs`), navigation (`views/partials/navbar.ejs`), and footer (`views/partials/footer.ejs`) require specific, well-defined updates to fulfill the Milestone 2 design system requirements:
1. **`views/layouts/main.ejs`**: Add `<link rel="stylesheet" href="/css/parallax.css">`, skip link, `<main id="main-content">`, Google Fonts preconnect with *Playfair Display* & *Inter*, and `<script src="/js/main.js" defer></script>`.
2. **`views/partials/navbar.ejs`**: Add `#navbar-toggle` button with 3 animated bars, `#navbar-menu` collapsible container, `aria-expanded` and `aria-current="page"` attributes, and "Get in touch" CTA button.
3. **`views/partials/footer.ejs`**: Update office location to "One Way Traffic Road, Mansa, Punjab 151505", add telephone link `<a href="tel:9988383380">9988383380</a>`, add email link `<a href="mailto:ajay30@gmail.com">ajay30@gmail.com</a>`, update disclaimer to verbatim practitioner text, and implement 4-column responsive grid.
4. **`public/js/main.js`**: Create the client-side controller to manage scroll-based blur (`.navbar-scrolled`) and mobile menu toggling.
5. **`public/css/components.css`**: Append classes for `.skip-link`, `.navbar.navbar-scrolled`, `.navbar-toggle`, `.navbar-menu`, `.nav-link.active`, and responsive footer columns.

Complete code blueprints for all components are provided in `d:/website ajay/.agents/teamwork/m2_explorer_3/report.md`.

---

## 5. Verification Method

To verify these implementations independently:

1. **Static Inspection**:
   - Check `views/layouts/main.ejs`: verify lines linking `tokens.css`, `base.css`, `components.css`, `parallax.css`, and `main.js`.
   - Check `views/partials/navbar.ejs`: verify `#navbar-toggle` button and `#navbar-menu`.
   - Check `views/partials/footer.ejs`: grep for `"One Way Traffic Road"`, `"9988383380"`, and `"Services provided by Ajay Singla, Accounting & Tax Practitioner"`.
   - Check `public/js/main.js`: verify presence and correct event listener bindings.
2. **Automated Verification Command**:
   - Run the baseline test harness:
     ```powershell
     node tests/m1-verify.js
     ```
     Ensure all baseline checks continue to pass (exit code 0).
3. **Milestone 2 Layout & Asset Test**:
   - Query the running Express application via ephemeral port:
     ```javascript
     // Verify GET / returns 200 and rendered HTML contains all partials
     http.get('http://127.0.0.1:3000/', (res) => { ... });
     ```
   - Assert HTML includes:
     - `link rel="stylesheet" href="/css/tokens.css"`
     - `link rel="stylesheet" href="/css/parallax.css"`
     - `header class="navbar"`
     - `button class="navbar-toggle"`
     - `footer class="footer"`
     - `href="tel:9988383380"`
     - `href="mailto:ajay30@gmail.com"`
     - `One Way Traffic Road, Mansa, Punjab`
     - `Services provided by Ajay Singla, Accounting & Tax Practitioner`
     - `script src="/js/main.js"`
4. **Invalidation Conditions**:
   - If `views/partials/footer.ejs` lacks the telephone link or street address, the handoff is invalidated.
   - If `views/partials/navbar.ejs` lacks mobile hamburger markup, the handoff is invalidated.
   - If `views/layouts/main.ejs` omits `parallax.css` or `main.js`, the handoff is invalidated.
