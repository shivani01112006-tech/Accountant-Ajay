# Handoff Report: UI Design System, Components & Pages Specification

**Agent:** `spec_miner_ui_1`  
**Working Directory:** `d:/website ajay/.agents/teamwork/spec_miner_ui_1`  
**Date:** 2026-10-07T17:22:00Z  
**Recipient:** Orchestrator (`7d27c425-3d4f-421a-8fa0-15f1da26daa3`)  
**Artifact Generated:** `d:/website ajay/.agents/teamwork/spec_miner_ui_1/spec_report.md`

---

## 1. Observation

Direct examination of workspace specification documents revealed the following authoritative definitions:

1. **`ORIGINAL_REQUEST.md` (lines 20-22):**
   > "R2. Design System and UI (Phase 2 & 3): Implement the design system precisely following the design tokens in `docs/design.md` (strictly monochrome, Playfair Display + Inter, 4-pt spacing, parallax hero, reduced-motion support). Build the Home, About, Services, and Contact pages with responsive shared navbar and footer partials, using clear placeholder copy where needed."

2. **`design.md` (lines 7-20) — Monochromatic Color Tokens:**
   > - `--bg-0`: `#0B0B0C` (Hero / dark sections)
   > - `--bg-1`: `#151517` (Cards on dark)
   > - `--bg-2`: `#F4F4F2` (Light sections)
   > - `--surface`: `#FFFFFF` (Cards on light)
   > - `--text-hi`: `#F5F5F5` (Text on dark)
   > - `--text-lo`: `#A1A1A6` (Secondary on dark)
   > - `--ink`: `#111113` (Text on light)
   > - `--ink-soft`: `#5A5A60` (Secondary on light)
   > - `--line`: `#2A2A2D` / `#DCDCD8` (Borders)
   > - `--accent`: `#FFFFFF` (dark) / `#111113` (light)
   > - Only semantic exceptions: form error (`#C0392B`) and success (`#2E7D32`), used sparingly.

3. **`design.md` (lines 22-31) — Typography, Spacing, Radii, Shadows, Breakpoints:**
   > - Headings: *Playfair Display* (serif, premium) — fallback Georgia
   > - Body/UI: *Inter* — fallback system-ui
   > - Scale: 12 / 14 / 16 / 20 / 28 / 40 / 64 px; line-height 1.6 body, 1.1 headings
   > - Eyebrow labels: 12px, uppercase, letter-spacing .18em
   > - Spacing: 4-pt grid (4, 8, 16, 24, 32, 48, 80, 128). Section padding 96–128px desktop, 64px mobile.
   > - Radius: 4px (inputs), 12px (cards), 999px (chips). Max width: 1200px.
   > - Shadow: `0 20px 60px rgba(0,0,0,.35)` on dark; `0 10px 30px rgba(0,0,0,.08)` on light.
   > - Breakpoints: 480 / 768 / 1024 / 1280.

4. **`design.md` (lines 33-39) — Motion & Parallax:**
   > - Hero background layers move at 0.2×–0.6× scroll speed (`transform: translate3d`, `will-change: transform`).
   > - Section reveal: fade-up 24px, 600ms, `cubic-bezier(.2,.7,.2,1)`, via IntersectionObserver.
   > - Hover: buttons lift 2px; cards darken/lighten one step.
   > - `@media (prefers-reduced-motion: reduce)` → disable parallax and reveals.
   > - Parallax disabled below 768px width for performance.

5. **`design.md` (lines 40-52) & `prd.md` (lines 4-8, 25-34) — Global Components & Contact Details:**
   > - Navbar: Fixed, transparent over hero → solid blur (`backdrop-filter`) after 40px scroll. Logo wordmark "Ajay Singla" + links Home / About / Services / Contact + "Get in touch" button.
   > - Footer: Dark; contact details (One Way Traffic Road, Mansa, Punjab; Phone: 9988383380; Email: ajay30@gmail.com), quick links, copyright, disclaimer.
   > - Contact Form: Name*, Email*, Phone*, Service (select), Message*, hidden honeypot, consent checkbox. Replaces form with success panel on submit.
   > - Chatbot widget: 56px circular button bottom-right; opens 360×520 panel.
   > - Cookie notice: Slim bar bottom-left, controls GA4 consent.

6. **`architecture.md` (lines 27-38) — Folder & Template Structure:**
   > Express + EJS architecture with `views/` (`layouts/`, `partials/`, `pages/`, `admin/`, `errors/`) and `public/` (`css/`, `js/`, `img/`).

---

## 2. Logic Chain

1. **Step 1 (Source Verification):** Read `ORIGINAL_REQUEST.md`, `design.md`, `prd.md`, `phase.md`, and `architecture.md`. All files consistently specify a monochrome, high-trust accounting aesthetic using Playfair Display + Inter and a 4-pt grid.
2. **Step 2 (Token Rigor):** Extracted all hex color values, font scales, line heights, border radii, shadows, and breakpoints directly from `design.md`. Confirmed that no non-monochrome accent colors are permitted except the two semantic feedback colors (`#C0392B` error and `#2E7D32` success).
3. **Step 3 (Motion & Accessibility Constraints):** Cross-referenced motion specs with accessibility requirements. Parallax must execute via `translate3d` with hardware acceleration (`will-change: transform`) and must be strictly disabled both on mobile devices (<768px) and under `prefers-reduced-motion: reduce`.
4. **Step 4 (Component & Page Decomposition):** Deconstructed all four public pages (Home, About, Services, Contact) into granular sections, verifying required data fields (such as Ajay Singla's 15+ years experience, Mansa office address, phone, email, and GST/ITR/PAN service details).
5. **Step 5 (Template & Form Architecture):** Structured EJS view layouts and partials (`views/layouts/main.ejs`, `views/partials/navbar.ejs`, etc.), incorporating security and UX requirements (CSRF token, honeypot field `website`, client-side/server-side validation, inline errors, and interactive success states).
6. **Step 6 (Comprehensive Synthesis):** Compiled the entire UI design system into `spec_report.md` accompanied by the standard Features Discovered and Edge Cases tables.

---

## 3. Caveats

1. **Actual Owner Assets:** High-resolution portrait photographs of Ajay Singla and official registration certificate numbers are pending confirmation by the owner; placeholder grayscale graphics and disclaimer text are defined in the spec.
2. **Chatbot Backend Scope:** In the MVP (Phases 1-5), the chatbot widget UI is specified along with a rule-based FAQ JSON engine. Advanced vector/RAG embedding (Chroma/FAISS) is designated as a future extension (Phase 10).
3. **CSS Framework:** The specification relies on vanilla CSS custom properties (tokens) without external heavy frameworks (like Tailwind or Bootstrap) to maintain maximum lightweight performance, LCP < 2.5s, and Lighthouse ≥ 90.

---

## 4. Conclusion

The UI specification is fully mined, verified against all project documents, and documented in detail in `d:/website ajay/.agents/teamwork/spec_miner_ui_1/spec_report.md`. It covers:
- Complete design tokens (monochrome colors, typography scale, 4-pt grid, radii, shadows, breakpoints).
- Parallax hero and `prefers-reduced-motion` mechanics.
- Shared components (navbar, footer, buttons, form inputs, status chips, cards, FAQ accordion, chatbot widget, cookie banner).
- Granular section blueprints for Home (`/`), About (`/about`), Services (`/services`), Contact (`/contact`), and Error pages (404, 500).
- Express + EJS layout and file structure.
- 24 discovered features and 15 edge case specifications.

The implementation team (Milestones 2 & 3) can execute immediately based on `spec_report.md`.

---

## 5. Verification Method

To independently verify the extracted specifications:

1. **Token Check:** Inspect `spec_report.md` Section 2 against `d:/website ajay/design.md` lines 7–31. Verify hex codes (`#0B0B0C` through `#2E7D32`), font families (`Playfair Display`, `Inter`), and spacing scale (4 to 128px).
2. **Motion Check:** Inspect `spec_report.md` Section 3 against `design.md` lines 33–39. Verify parallax factor (0.2×–0.6×), breakpoint threshold (<768px), and `@media (prefers-reduced-motion: reduce)` rules.
3. **Component & Page Check:** Inspect `spec_report.md` Sections 4 & 5 against `design.md` lines 40–84 and `prd.md` lines 25–33. Verify all page sections (Home 6 sections, About 6 sections, Services 4 sections, Contact 2-column layout with honeypot).
4. **Invalidation Condition:** If any file in `d:/website ajay/` is updated with different brand colors, fonts, or pages, `spec_report.md` will require revision.
