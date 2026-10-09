## 2026-10-08T05:33:12Z
You are m2_worker_1, a worker agent implementing Milestone 2 (Design System & Styling) for Ajay Singla's portfolio website.
Your working directory is d:/website ajay/.agents/teamwork/m2_worker_1.

You MUST read:
1. d:/website ajay/.agents/teamwork/ORIGINAL_REQUEST.md
2. d:/website ajay/.agents/teamwork/orchestrator_1/PROJECT.md
3. Explorer reports and blueprints:
   - d:/website ajay/.agents/teamwork/m2_explorer_1/report.md
   - d:/website ajay/.agents/teamwork/m2_explorer_2/report.md
   - d:/website ajay/.agents/teamwork/m2_explorer_2/proposed_parallax.css
   - d:/website ajay/.agents/teamwork/m2_explorer_2/proposed_parallax.js
   - d:/website ajay/.agents/teamwork/m2_explorer_3/report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

WRITE OWNERSHIP:
You exclusively own and may create/modify the following files in d:/website ajay/:
- public/css/tokens.css
- public/css/base.css
- public/css/components.css
- public/css/parallax.css
- public/js/main.js
- public/js/parallax.js
- views/layouts/main.ejs
- views/partials/navbar.ejs
- views/partials/footer.ejs
- views/pages/home.ejs
- tests/m2-verify.js

TASK:
1. Implement `public/css/tokens.css`:
   - Monochromatic palette precisely matching design.md: --bg-0 (#0B0B0C), --bg-1 (#151517), --bg-2 (#F4F4F2), --surface (#FFFFFF), --text-hi (#F5F5F5), --text-lo (#A1A1A6), --ink (#111113), --ink-soft (#5A5A60), --line (#2A2A2D / #DCDCD8), --accent (#FFFFFF / #111113), semantic error (#C0392B), semantic success (#2E7D32).
   - Typography tokens: font families ('Playfair Display', serif / 'Inter', sans-serif), scale (12, 14, 16, 20, 28, 40, 64px), line-heights (1.1 headings, 1.6 body), eyebrow uppercase 12px with .18em letter spacing.
   - 4-pt spacing grid (4, 8, 16, 24, 32, 48, 80, 128px), container max width (1200px), border radii (4px, 12px, 999px), monochromatic shadows.
2. Implement `public/css/base.css`:
   - Modern reset, box-sizing, smooth scrolling, typography baseline, focus ring utility, skip link styling.
3. Implement `public/css/components.css`:
   - Buttons (.btn, .btn-primary, .btn-ghost, hover lift), cards (.card, .card-dark, .card-light, border transitions), status badges (.badge), form controls (input, textarea, floating labels, inline error), trust indicators, process steps.
4. Implement `public/css/parallax.css` and `public/js/parallax.js`:
   - Parallax hero background layers moving at 0.2x-0.6x scroll rate via hardware-accelerated `translate3d` with `will-change: transform`.
   - Disabled on viewports < 768px.
   - Section reveal animations via `IntersectionObserver` (fade-up 24px, 600ms).
   - Complete `@media (prefers-reduced-motion: reduce)` accessibility overrides disabling all transforms, parallax, transitions, and smooth scroll.
5. Implement `public/js/main.js`:
   - Sticky navbar blur on scroll (> 40px adds `.navbar-scrolled`).
   - Mobile hamburger menu toggle (`aria-expanded`, `.is-open`, body scroll lock).
6. Implement `views/layouts/main.ejs`:
   - Google Fonts preconnect & links (*Playfair Display* and *Inter*), CSS link hierarchy (tokens -> base -> components -> parallax), accessible skip-to-content link, main wrapper, footer, modular script loading.
7. Implement `views/partials/navbar.ejs`:
   - Brand wordmark "Ajay Singla", navigation links (Home, About, Services, Contact), "Get in touch" CTA button, mobile hamburger toggle button, mobile menu drawer.
8. Implement `views/partials/footer.ejs`:
   - Complete 4-column layout: office address ("One Way Traffic Road, Mansa, Punjab 151505"), tel link (9988383380), mailto link (ajay30@gmail.com), business hours, full accounting practitioner disclaimer, quick links (including admin login), dynamic year copyright.
9. Update `views/pages/home.ejs`:
   - Parallax hero section, 3 background layers, trust metrics (15+ years experience, filings completed), featured services preview, why choose cards, process steps, CTA section.
10. VERIFICATION:
   - Create `tests/m2-verify.js` to assert:
     - All design tokens exist in tokens.css.
     - Strict monochrome palette adherence (zero non-monochrome colors except error/success).
     - Playfair Display and Inter font family rules.
     - Reduced motion media query presence and coverage.
     - Parallax disabled media query (< 768px).
     - HTTP GET / returns 200 with all stylesheets, navbar, footer, and scripts.
   - Run `node tests/m2-verify.js` and ensure 100% pass with exit code 0.
