# Ajay Singla Portfolio Website — UI Design System, Components & Pages Specification

**Document Version:** 1.0.0  
**Author:** spec_miner_ui_1 (Specification Miner)  
**Date:** 2026-10-07  
**Source Documents:** `ORIGINAL_REQUEST.md`, `design.md`, `prd.md`, `phase.md`, `architecture.md`, `memory.md`

---

## 1. Executive Summary & Design Philosophy

The website for **Ajay Singla** (self-employed accountant with 15+ years of experience in Mansa, Punjab) is a high-performance, accessible, responsive portfolio website. 

### Core Design Principles:
1. **Monochromatic & Authoritative:** One hue family (neutral grayscale / carbon / white). Visual hierarchy is driven strictly by typography scale, font weight, generous whitespace, and subtle depth — never arbitrary accent colors.
2. **Calm, Trustworthy & Professional:** High readability, clean line work, serif headlines (*Playfair Display*) balanced with an ultra-clean sans-serif UI (*Inter*).
3. **Subtle & Purposeful Motion:** Parallax effects add depth to the hero and process sections without distracting the user. Parallax is completely disabled on mobile devices (<768px) and for users with `prefers-reduced-motion`.
4. **Mobile-First & Accessible:** Designed primarily for phone screens (prevalent among local clients in Punjab) while scaling seamlessly up to ultra-wide desktop monitors, adhering to WCAG 2.1 AA standards.

---

## 2. Design Tokens & CSS Custom Properties

### 2.1 Color Palette (Strictly Monochromatic)

The system enforces a strict monochromatic palette with only two isolated semantic exceptions for form validation states.

| CSS Variable | Hex Code | Role & Application | Usage Context |
|---|---|---|---|
| `--bg-0` | `#0B0B0C` | Deepest Black / Carbon | Hero section background, dark process section, footer, mobile overlay menu |
| `--bg-1` | `#151517` | Dark Surface / Elevated Dark | Cards placed on dark sections, chatbot panel body, modal backdrops |
| `--bg-2` | `#F4F4F2` | Warm Off-White / Light Background | Light content sections (Trust strip, Services preview, Contact content) |
| `--surface` | `#FFFFFF` | Pure White / Elevated Light | Cards on light sections, form field backgrounds, user chat bubble |
| `--text-hi` | `#F5F5F5` | High-contrast light text | Headings and primary copy on dark backgrounds (`--bg-0`, `--bg-1`) |
| `--text-lo` | `#A1A1A6` | Muted / Secondary light text | Subtitles, labels, metadata, and icons on dark backgrounds |
| `--ink` | `#111113` | Deep Charcoal / Primary dark text | Headings and primary copy on light backgrounds (`--bg-2`, `--surface`) |
| `--ink-soft` | `#5A5A60` | Muted Charcoal / Secondary dark text | Subtitles, helper text, and secondary body on light backgrounds |
| `--line-dark` | `#2A2A2D` | Hairline border on dark surfaces | Dividers, card borders, and nav borders in dark contexts |
| `--line-light` | `#DCDCD8` | Hairline border on light surfaces | Dividers, card borders, input borders in light contexts |
| `--accent-dark` | `#FFFFFF` | Primary accent on dark background | Button backgrounds, active indicators in dark sections |
| `--accent-light` | `#111113` | Primary accent on light background | Button backgrounds, active indicators in light sections |
| `--focus-ring` | `#FFFFFF` / `#111113` | Accessible outline | 2px solid outline with 2px offset on keyboard focus |
| `--semantic-error` | `#C0392B` | Error red (semantic exception) | Form validation errors, invalid input borders, alert banners |
| `--semantic-success`| `#2E7D32` | Success green (semantic exception) | Form submission confirmation banner, checkmark indicators |

*Rule:* No ad-hoc blues, purples, or yellows. Semantic colors must only appear during form feedback or status indicators.

---

### 2.2 Typography Specification

The site combines a classic, trustworthy serif typeface for editorial authority with an ultra-legible modern sans-serif for UI and body text.

#### Font Families
- **Headings Font Family:** `'Playfair Display', Georgia, 'Times New Roman', serif`
  - Used for: H1, H2, H3, H4, hero titles, section headlines, brand wordmark.
- **Body & UI Font Family:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif`
  - Used for: Body text, navigation links, buttons, form inputs, labels, tables, badges, captions.

#### Typographic Scale & Line Heights

| Level | Size (px / rem) | Line Height | Font Weight | Letter Spacing | Target Elements |
|---|---|---|---|---|---|
| **Display / H1** | 64px / 4.0rem (desktop)<br>36px / 2.25rem (mobile) | 1.1 | 700 (Bold) | -0.02em | Hero headline on Home, main page titles on About/Services/Contact |
| **H2** | 40px / 2.5rem (desktop)<br>28px / 1.75rem (mobile) | 1.15 | 600 (Semi-bold) | -0.01em | Major section headers (Services, Why Choose Us, Process, FAQ) |
| **H3** | 28px / 1.75rem (desktop)<br>22px / 1.375rem (mobile) | 1.25 | 600 (Semi-bold) | 0.0em | Service card titles, sub-section headings, bio milestone headings |
| **H4** | 20px / 1.25rem | 1.35 | 600 (Semi-bold) | 0.0em | Step headers, card titles, trust stat labels |
| **Body Large** | 18px / 1.125rem | 1.6 | 400 (Regular) | 0.0em | Hero subtext, lead paragraphs, value propositions |
| **Body / UI** | 16px / 1.0rem | 1.6 | 400 (Regular) / 500 (Medium) | 0.0em | Primary paragraph copy, form input values, nav links, table content |
| **UI Small** | 14px / 0.875rem | 1.5 | 500 (Medium) | 0.01em | Buttons, form labels, footer quick links, table headers, metadata |
| **Eyebrow / Chip**| 12px / 0.75rem | 1.4 | 600 (Semi-bold) | +0.18em (Uppercase) | Section category tags, status badges, chips, legal disclaimer |

---

### 2.3 4-pt Spacing Grid Scale

All margins, paddings, gaps, and structural offsets must adhere to multiples of 4 pixels:

| Token | Pixels | Rem Equivalent | Primary Application |
|---|---|---|---|
| `--space-1` | 4px | 0.25rem | Hairline offsets, chip padding vertical, icon-to-text gap |
| `--space-2` | 8px | 0.5rem | Small gaps, button icon spacing, list item padding |
| `--space-3` | 12px | 0.75rem | Input vertical padding, chip horizontal padding |
| `--space-4` | 16px | 1.0rem | Base gutter, card small padding, form field gap |
| `--space-5` | 24px | 1.5rem | Container mobile padding, card medium padding, grid column gap |
| `--space-6` | 32px | 2.0rem | Card standard padding (desktop), section sub-element margins |
| `--space-7` | 48px | 3.0rem | Section header bottom margin, major element separation |
| `--space-8` | 64px | 4.0rem | Mobile section vertical padding, hero bottom spacing |
| `--space-9` | 80px | 5.0rem | Desktop section vertical padding (compact) |
| `--space-10` | 96px | 6.0rem | Desktop section vertical padding (standard) |
| `--space-11` | 128px | 8.0rem | Desktop section vertical padding (generous / hero / CTA bands) |

#### Container Dimensions
- **Max Content Width:** `1200px` (centered horizontally with `margin-inline: auto`).
- **Container Gutter Padding:** `16px` (mobile <480px), `24px` (tablet 480px–1024px), `32px` (desktop >1024px).

---

### 2.4 Border Radii

| Token | Value | Applied Elements |
|---|---|---|
| `--radius-sm` | 4px | Form text inputs, textareas, select inputs, primary & ghost buttons |
| `--radius-md` | 12px | Content cards, service feature cards, trust tiles, code/info boxes |
| `--radius-lg` | 16px | Chatbot widget container panel, modal dialogue boxes |
| `--radius-full`| 999px | Pill status badges, filter chips, floating chat launcher button |

---

### 2.5 Elevation & Shadows

| Token | CSS Value | Use Case |
|---|---|---|
| `--shadow-dark` | `0 20px 60px rgba(0, 0, 0, 0.35)` | Elevated cards on dark backgrounds (`--bg-0`), chatbot panel |
| `--shadow-light` | `0 10px 30px rgba(0, 0, 0, 0.08)` | Elevated cards on light backgrounds (`--bg-2`), dropdown menus |
| `--shadow-subtle`| `0 4px 12px rgba(0, 0, 0, 0.05)` | Input focus glow, standard light card idle state |

---

### 2.6 Responsive Breakpoints

| Breakpoint Name | Viewport Width | Typical Target Devices | Key Layout Adjustments |
|---|---|---|---|
| **Mobile Small (`xs`)** | `< 480px` | Small smartphones | Single column, 36px H1, 16px padding, stacked buttons |
| **Mobile / Phablet (`sm`)** | `480px – 767px` | Large smartphones | Single column, full-width cards, mobile hamburger menu |
| **Tablet (`md`)** | `768px – 1023px` | Tablets, iPads, small laptops | 2-column grids for cards, enable parallax if performance permits |
| **Desktop (`lg`)** | `1024px – 1279px` | Laptops, desktop monitors | Horizontal desktop navbar, 3-column service grid, 2-column contact layout |
| **Wide Desktop (`xl`)** | `≥ 1280px` | Large desktop displays | Maximum container width capped at 1200px, 128px section padding |

---

## 3. Motion, Parallax & Accessibility Specifications

### 3.1 Parallax Hero Mechanics
- **Visual Composition:** Layered geometric/monochrome graphic planes behind the hero typography (e.g. subtle subtle angled hairline grids, neutral dark gradients, watermark chartered/ruler geometry).
- **Parallax Rate:** Background layers translate on the Y-axis at **0.2× to 0.6×** of scroll speed.
- **Technical Implementation:**
  - Track `window.scrollY` via `requestAnimationFrame`.
  - Apply CSS transforms: `transform: translate3d(0, calc(var(--scroll-y) * factor), 0)`.
  - Use `will-change: transform` on animated layers for GPU acceleration.
- **Mobile Restriction:** Parallax transforms are **disabled completely** below `768px` viewport width to preserve battery life and prevent scroll stutter on mobile devices.

### 3.2 Section Reveal Transitions
- Elements with `.reveal-on-scroll` initiate at `opacity: 0; transform: translateY(24px)`.
- Triggered by `IntersectionObserver` with `threshold: 0.15` and `rootMargin: '0px 0px -50px 0px'`.
- Animated via CSS:
  ```css
  transition: opacity 600ms cubic-bezier(0.2, 0.7, 0.2, 1), 
              transform 600ms cubic-bezier(0.2, 0.7, 0.2, 1);
  ```
- On entering viewport: `opacity: 1; transform: translateY(0)`.

### 3.3 Micro-interactions & Hover States
- **Buttons:**
  - Hover: Lift up by 2px (`transform: translateY(-2px)`), transition `150ms ease-out`.
  - Active: Press down (`transform: translateY(0)`).
- **Cards:**
  - Dark cards: Surface background shifts slightly lighter (e.g., `#151517` → `#1c1c1f`).
  - Light cards: Subtle elevation shadow increases (`--shadow-light`).

### 3.4 Reduced-Motion Query Support (`prefers-reduced-motion: reduce`)
All animations must strictly obey user accessibility settings:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  .parallax-layer {
    transform: none !important;
    will-change: auto !important;
  }
  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
  }
}
```

### 3.5 Accessibility & WCAG Compliance
- **Color Contrast:** Text-to-background contrast must exceed **4.5:1** for standard body text and **3.0:1** for large headings (Playfair Display 28px+).
  - `#F5F5F5` on `#0B0B0C`: 17.5:1 (Passed AAA).
  - `#111113` on `#FFFFFF`: 19.3:1 (Passed AAA).
  - `#A1A1A6` on `#0B0B0C`: 6.8:1 (Passed AA).
  - `#5A5A60` on `#F4F4F2`: 6.2:1 (Passed AA).
- **Keyboard Navigation:** All interactive elements (`<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`) must show an unmistakable focus indicator:
  - Outline: `2px solid var(--accent)` with `outline-offset: 2px`.
- **Screen Reader Support:** Semantic HTML5 (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`). `aria-expanded` and `aria-controls` on mobile hamburger and accordions.

---

## 4. Shared UI Components Specification

### 4.1 Navbar (`views/partials/navbar.ejs`)
- **Structure & Layout:**
  - Fixed at page top: `position: fixed; top: 0; left: 0; width: 100%; z-index: 1000; height: 72px`.
  - Content container: max-width 1200px, flexbox layout (align-items: center, justify-content: space-between).
- **Scroll Behavior:**
  - At scroll top (`scrollY < 40px`): Transparent background, no border.
  - After scrolling (`scrollY >= 40px`): Transitions to blurred translucent dark bar (`background-color: rgba(11, 11, 12, 0.88); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--line-dark)`).
- **Brand Logo / Wordmark:**
  - Text: **"Ajay Singla"**
  - Font: *Playfair Display*, 22px, font-weight 700, color: `--text-hi`, text-decoration: none.
  - Subtitle badge / descriptor (optional small): "Accounting & Tax".
- **Navigation Links (Desktop):**
  - Items:
    1. Home (`/`)
    2. About (`/about`)
    3. Services (`/services`)
    4. Contact (`/contact`)
  - Typography: *Inter*, 14px, font-weight 500, letter-spacing 0.02em, color: `--text-lo`.
  - Hover state: Color transitions to `--text-hi` (`color: #F5F5F5`).
  - Active page state: High contrast `--text-hi`, underline indicator or subtle bottom bar, `aria-current="page"`.
- **Header Action CTA:**
  - Button text: **"Get in touch"**
  - Styling: Primary compact button linking to `/contact`.
- **Mobile Hamburger Menu:**
  - Visible on screens `< 1024px` (hidden on desktop).
  - Button: 44px × 44px hit target, 3-line hamburger icon transforming to "X" when open (`aria-label="Toggle navigation menu"`, `aria-expanded="false"`).
  - Mobile Menu Overlay: Full-width slide-down or full-screen menu with dark background (`--bg-0`), containing large stacked nav links (24px, Playfair/Inter), contact details, and "Get in touch" CTA button.

---

### 4.2 Footer (`views/partials/footer.ejs`)
- **Visual Style:** Dark background (`--bg-0`), top hairline border (`1px solid var(--line-dark)`), vertical padding 64px–80px.
- **Sections / Columns:**
  1. **Brand & Profile:**
     - Heading: "Ajay Singla" (Playfair Display, 24px).
     - Bio summary: "Self-employed accountant with 15+ years of experience helping businesses and individuals in Mansa, Punjab achieve accurate, timely statutory compliance."
  2. **Direct Contact Info:**
     - Address: "One Way Traffic Road, Mansa, Punjab" (with Google Maps link).
     - Phone: `<a href="tel:9988383380">9988383380</a>` (clickable tel protocol).
     - Email: `<a href="mailto:ajay30@gmail.com">ajay30@gmail.com</a>` (clickable mailto protocol).
     - Office Hours: "Mon – Sat: 9:30 AM – 7:30 PM | Sunday: Closed".
  3. **Quick Navigation Links:**
     - Home, About Ajay Singla, Tax & GST Services, Contact Office, Admin Login (`/admin/login`).
  4. **Legal & Disclaimer Bar:**
     - Disclaimer Text (12px, `--text-lo`, line-height 1.5):  
       *"Disclaimer: Services provided are professional accounting and tax compliance assistance. No guaranteed refunds or statutory exemptions are promised. All filings are made per prevailing Indian Income Tax and GST laws."*
     - Copyright: `© 2026 Ajay Singla. All rights reserved.`

---

### 4.3 Buttons

All buttons adhere to uppercase styling, 14px typography, and 4px border radius.

| Button Variant | Classes | Appearance & Styling | Hover & Active State |
|---|---|---|---|
| **Primary (Dark Bg)** | `.btn .btn-primary` | Background: `--accent-dark` (`#FFFFFF`), Text: `#0B0B0C`, Font: 14px, uppercase, letter-spacing 0.08em, weight 600, padding: 14px 28px, border-radius: 4px | Hover: `transform: translateY(-2px); box-shadow: 0 4px 16px rgba(255,255,255,0.2)`. Active: `translateY(0)` |
| **Primary (Light Bg)**| `.btn .btn-primary-dark` | Background: `--accent-light` (`#111113`), Text: `#FFFFFF`, padding: 14px 28px, border-radius: 4px | Hover: `transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.2)`. Active: `translateY(0)` |
| **Ghost / Outline** | `.btn .btn-ghost` | Background: transparent, Border: `1px solid var(--line-dark)` or `var(--line-light)`, Text: matching context text color, padding: 14px 28px, border-radius: 4px | Hover: Border color brightens, subtle background tint (`rgba(255,255,255,0.06)` or `rgba(0,0,0,0.04)`), `transform: translateY(-2px)` |
| **Compact Button** | `.btn .btn-sm` | Same styling as primary/ghost but with padding: `8px 16px`, font size: 12px | Same hover lift |
| **Text Link CTA** | `.btn-link` | Text with trailing arrow (`Learn more →`), underline animation on hover | Color transition to pure white / deep black, underline expands |

---

### 4.4 Form Controls & Inputs

Form controls are designed for maximum clarity, touch-friendliness (48px height), and seamless validation feedback.

- **Input / Select / Textarea Base Styling:**
  - Height: `48px` for inputs/select; `min-height: 120px` for textarea.
  - Background: `--surface` (`#FFFFFF`) on light backgrounds, or `--bg-1` (`#151517`) on dark backgrounds.
  - Border: `1px solid var(--line-light)` or `var(--line-dark)`.
  - Border Radius: `4px`.
  - Padding: `12px 16px`.
  - Typography: *Inter*, 16px (prevents automatic iOS zoom on mobile), color: `--ink` or `--text-hi`.
- **Focus State:**
  - Border: `1px solid var(--accent-light)` or `var(--accent-dark)`.
  - Outline: `2px solid rgba(0,0,0,0.15)` or `2px solid rgba(255,255,255,0.2)`.
  - Outline offset: `2px`.
- **Floating / Top Labels:**
  - Typography: *Inter*, 14px, weight 500, color: `--ink-soft` or `--text-lo`.
  - Required marker: Red asterisk (`*`) or clear `(Required)` indicator.
- **Error State:**
  - Border: `1px solid #C0392B`.
  - Focus Ring: `2px solid rgba(192, 57, 43, 0.4)`.
  - Inline error message: 12px, font-weight 500, color: `#C0392B`, positioned directly beneath the field with `aria-live="polite"`.
- **Honeypot Anti-Spam Field:**
  - Invisible input trap to catch automated bots without frustrating real users.
  - Field name: `website` (or `secondary_phone`).
  - Required CSS: `display: none !important; position: absolute; left: -9999px; opacity: 0; pointer-events: none;` with `tabindex="-1"` and `autocomplete="off"`.

---

### 4.5 Status Badges & Chips

- **Pill Shape:** Border radius `999px`.
- **Typography:** *Inter*, 12px, uppercase, font-weight 600, letter-spacing 0.08em.
- **Padding:** `4px 12px`.
- **Variants:**
  - Public / Service Chip: Light grey background (`#E8E8E6`), text `#111113`.
  - Admin "New": Dark charcoal background, white text (`#111113` / `#FFFFFF`).
  - Admin "Read": Neutral border chip (`1px solid #DCDCD8`, text `#5A5A60`).
  - Admin "Replied": Success green subtle tint (`#E8F5E9`, text `#2E7D32`).
  - Admin "Archived": Muted background (`#F4F4F2`, text `#8E8E93`).

---

### 4.6 Cards

- **Base Card:**
  - Background: `--surface` (`#FFFFFF`) on light sections, `--bg-1` (`#151517`) on dark sections.
  - Border: `1px solid var(--line-light)` or `1px solid var(--line-dark)`.
  - Border Radius: `12px`.
  - Padding: `32px` desktop, `20px` mobile.
  - Shadow: `--shadow-light` or `--shadow-dark`.
  - Transitions: `all 250ms cubic-bezier(0.2, 0.7, 0.2, 1)`.
- **Interactive Card Hover:**
  - Subtle lift: `transform: translateY(-4px)`.
  - Enhanced elevation shadow.

---

### 4.7 FAQ Accordion Component

- Used on the **Services** page.
- Container: Bordered list or card container with hairline dividers (`--line-light`).
- Accordion Header / Trigger:
  - Button element with `aria-expanded="false"`, `aria-controls="faq-answer-N"`.
  - Typography: *Inter*, 18px, font-weight 600, color: `--ink`.
  - Expand/Collapse Icon: Plus/minus (`+`/`−`) or rotating chevron (`▼`), smooth 200ms rotation.
- Accordion Content Panel:
  - Collapsed state: `max-height: 0; opacity: 0; overflow: hidden; transition: max-height 300ms ease, opacity 250ms ease`.
  - Expanded state: `max-height: 500px; opacity: 1; padding-top: 12px`.
  - Typography: *Inter*, 15px, line-height 1.6, color: `--ink-soft`.

---

### 4.8 Chatbot Side Widget Component (`views/partials/chat-widget.ejs`)

- **Floating Launcher Button:**
  - Position: Fixed at bottom-right (`bottom: 24px; right: 24px; z-index: 999`).
  - Dimensions: `56px × 56px` circular button (`border-radius: 999px`).
  - Background: `--accent-dark` (`#FFFFFF`) or high-contrast carbon (`#111113`).
  - Icon: Clean chat bubble icon (24px SVG).
  - Hover: Scale `1.05`, lift `translateY(-2px)`.
- **Chat Window Panel:**
  - Dimensions: `360px` width × `520px` height (on mobile `<480px`: full-screen or bottom sheet `calc(100vw - 32px)`).
  - Position: `bottom: 92px; right: 24px`.
  - Background: Dark theme `--bg-1` (`#151517`).
  - Border: `1px solid var(--line-dark)`, border-radius `16px`.
  - Elevation: `--shadow-dark` (`0 20px 60px rgba(0,0,0,0.35)`).
- **Internal Structure:**
  - Header: "Ask Ajay Singla", online status dot (green or monochromatic pulse), close button (`×`).
  - Message Area: Scrollable conversation stream.
    - User message bubble: Aligned right, background `--surface` (`#FFFFFF`), text `--ink` (`#111113`), radius 12px (bottom-right 2px).
    - Bot message bubble: Aligned left, background `--bg-0` (`#0B0B0C`), text `--text-hi` (`#F5F5F5`), border `1px solid var(--line-dark)`, radius 12px (bottom-left 2px).
  - Quick Suggestion Chips: Scrollable horizontal chips ("Documents for GST?", "ITR filing last date?", "PAN card cost?").
  - Input Bar: Bottom text field with placeholder "Type your tax question...", send button (SVG arrow icon).
  - Fallback prompt: "Need personal assistance? [Fill our contact form](/contact)".

---

### 4.9 Cookie Consent Notice (`views/partials/cookie-notice.ejs`)

- Position: Fixed at bottom-left (`bottom: 24px; left: 24px; z-index: 998; max-width: 380px`).
- Background: Translucent dark card (`rgba(21, 21, 23, 0.95); backdrop-filter: blur(10px); border: 1px solid var(--line-dark); border-radius: 12px; padding: 20px`).
- Content: Explains anonymous usage analytics (GA4) to improve accounting services.
- Actions: "Accept Cookies" (primary button) & "Decline" (ghost button).

---

## 5. Public Pages Detailed Specification

### 5.1 Home Page (`/`)

The Home page introduces Ajay Singla, conveys 15+ years of authority, presents the primary services, outlines the client journey, and prompts contact.

1. **Section 1: Hero Section (Dark `--bg-0`, Parallax Enabled)**
   - **Eyebrow:** "CHARTERED-STYLE PRECISION, LOCAL TRUST" (12px, uppercase, letter-spacing .18em, color: `--text-lo`).
   - **H1 Headline:** "Accounts, GST & Tax — handled with 15+ years of care." (*Playfair Display*, 64px desktop / 36px mobile, bold, color: `--text-hi`, line-height 1.1).
   - **Subtext:** "Professional accounting, accurate GST return filing, and dependable tax planning for shopkeepers, traders, and businesses in Mansa and beyond." (18px, *Inter*, color: `--text-lo`, line-height 1.6).
   - **Action CTAs:**
     - Primary button: "GET IN TOUCH" (links to `/contact`).
     - Ghost button: "VIEW SERVICES" (links to `/services`).
   - **Parallax Background:** Layered geometric/monochrome background elements translating at 0.2×–0.6× scroll rate.
2. **Section 2: Trust Strip (Light `--bg-2`)**
   - 4 Highlight Stat Tiles in a responsive grid (4 columns desktop, 2 columns mobile):
     - **Stat 1:** `15+` → "Years of Accounting Practice"
     - **Stat 2:** `100%` → "Timely Statutory Compliance"
     - **Stat 3:** `GST & ITR` → "Monthly & Annual Returns Handled"
     - **Stat 4:** `Local & Direct` → "One Way Traffic Road, Mansa"
   - Numbers styled in bold *Playfair Display* (40px), descriptions in *Inter* (14px).
3. **Section 3: Featured Services Preview (Light `--bg-2`)**
   - **Section Header:** Eyebrow ("OUR SERVICES") + H2 ("Comprehensive Tax & Accounting Solutions") + Subtext.
   - **3 Featured Service Cards:**
     - *Card 1: GST Registration & Returns:* New GSTIN, monthly GSTR-1 & GSTR-3B filings, input tax credit audits.
     - *Card 2: Income Tax Returns (ITR):* Salaried, business, and capital gains returns filed accurately with maximum legitimate exemptions.
     - *Card 3: PAN Card Applications:* New PAN issuance, name/DOB corrections, e-PAN processing, and Aadhaar linking.
   - Cards feature hairline borders, 32px padding, bullet checklists with checkmark icons, and a "Learn more & required documents →" link to `/services`.
4. **Section 4: Why Choose Ajay Singla (2×2 Grid)**
   - **Grid Item 1: Proven Accuracy:** Verified numbers, zero calculation errors, reconciling statements before filing.
   - **Grid Item 2: Strict Deadlines:** Proactive follow-ups ensuring GST and ITR cut-off dates are met without late fees.
   - **Grid Item 3: Local & Transparent:** Physical office on One Way Traffic Road, Mansa; clear fees with no surprise extras.
   - **Grid Item 4: 15+ Years Domain Experience:** Deep working knowledge of Indian statutory compliance and practical tax issues.
5. **Section 5: Process Section (Dark `--bg-0`, Parallax Accents)**
   - **Section Header:** Eyebrow ("HOW WE WORK") + H2 ("A Seamless 4-Step Process")
   - **4 Step Process Cards / Timeline:**
     - *Step 1: Share Documents* — Provide bills, statements, or bank books in person or digitally.
     - *Step 2: Review & Reconciliation* — Meticulous verification of books, invoices, and applicable tax sections.
     - *Step 3: Portal Filing* — Secure, timely submission onto official GST / Income Tax government portals.
     - *Step 4: Confirmation & Acknowledgment* — Delivery of official government filing receipts and tax computation copies.
6. **Section 6: Call-to-Action (CTA) Band (Dark `--bg-0` or Contrast Card)**
   - **H2:** "Need help with your upcoming tax filing?"
   - **Subtext:** "Schedule an in-person consultation at our Mansa office or enquire online today."
   - **Button:** "BOOK A CONSULTATION" (Primary button linking to `/contact`).

---

### 5.2 About Page (`/about`)

The About page establishes Ajay Singla's professional story, credentials, local roots, and client-centric philosophy.

1. **Section 1: Page Hero (Dark `--bg-0`, Short)**
   - Eyebrow: "BACKGROUND & VALUES"
   - H1: "About Ajay Singla" (*Playfair Display*, 52px)
   - Subtext: "Dedicated commercial accounting and tax compliance professional serving the Mansa trade community for over 15 years."
2. **Section 2: Bio Narrative & Professional Portrait**
   - Two-column layout on desktop:
     - Left: Professional grayscale portrait photo / placeholder (high-contrast black-and-white framing, rounded 12px).
     - Right: Narrative copy (3 structured paragraphs):
       - *Paragraph 1:* Overview of Ajay Singla's independent practice in Mansa, starting over 15 years ago focusing on retail bookkeeping, commission agents, and local trade enterprises.
       - *Paragraph 2:* Transition through major Indian tax overhauls, including the nationwide GST rollout in 2017, mastering online filing systems, input tax credits, and digital ITR portals.
       - *Paragraph 3:* Core philosophy: combining rigorous statutory compliance with personal, approachable guidance. No complex jargon—just clear advice and on-time submissions.
3. **Section 3: Professional Qualifications & Practice Highlights**
   - 3-card or highlight list:
     - Commercial accounting & double-entry bookkeeping specialist.
     - Hands-on expertise in GST portal operations, e-way bills, annual GST audits.
     - Income tax computation under both Old and New Tax Regimes for individuals, HUFs, and firms.
     - Official disclaimer note: "Professional tax & accounting practitioner assistance".
4. **Section 4: Milestones & Career Timeline**
   - Clean vertical timeline with monochromatic dots and hairline connector lines:
     - *2008 – Practice Established:* Commenced accounting and bookkeeping services in Mansa.
     - *2017 – The GST Transition:* Successfully migrated over 100+ local businesses to the unified Goods and Services Tax system.
     - *2020 – Modern Digital Compliance:* Fully digitized filing pipelines, faceless assessment support, and e-verification.
     - *Present – Comprehensive Advisory:* Trusted partner for hundreds of recurring clients across Punjab.
5. **Section 5: Core Philosophy & Values (3 Cards)**
   - *Card 1: Uncompromising Integrity* — Every ledger entry and tax credit reconciled truthfully.
   - *Card 2: Deadline Discipline* — Relentless tracking of government cut-off dates to protect clients from late penalties.
   - *Card 3: Personal Availability* — Direct communication with Ajay Singla himself, not an outsourced helpline.
6. **Section 6: Page CTA Band**
   - "Have questions about your accounts?" → "Get in Touch" button.

---

### 5.3 Services Page (`/services`)

The Services page delivers comprehensive explanations of Ajay Singla's statutory offerings, required documentation lists, and answers frequently asked questions.

1. **Section 1: Page Hero (Dark `--bg-0`)**
   - Eyebrow: "PRACTICE AREAS"
   - H1: "Accounting, GST & Tax Services"
   - Subtext: "Comprehensive statutory compliance, accurate portal filings, and personalized accounting support."
2. **Section 2: Detailed Service Breakdowns (Alternating Layout / Cards)**
   - Dynamic database-driven rendering with static fallbacks for core services:
   - **Service 1: Goods & Services Tax (GST) Filing & Registration**
     - Slug: `gst`
     - Overview: Complete GST compliance for proprietorships, partnerships, and traders.
     - *What We Handle:*
       - New GSTIN registration and amendments
       - Monthly GSTR-1 (sales details) & GSTR-3B (tax payment & ITC)
       - Annual GSTR-9 returns and reconciliation
       - E-way bill generation and compliance assistance
       - Input Tax Credit (ITC) verification against GSTR-2B
     - *Documents Required Checklist:* PAN card, Aadhaar card, Business address proof (rent deed/electricity bill), Bank account proof (cancelled cheque), Business trade name.
     - CTA Button: "Enquire About GST" (pre-selects GST on `/contact?service=gst`).
   - **Service 2: Income Tax Return (ITR) Filing**
     - Slug: `itr`
     - Overview: Tax filing and advance tax computations for salaried individuals, professionals, and small businesses.
     - *What We Handle:*
       - ITR-1 (Sahaj), ITR-2, ITR-3, and ITR-4 (Sugam) filing
       - Old vs New Tax Regime comparative analysis
       - Verification of Annual Information Statement (AIS) & Taxpayer Information Summary (TIS)
       - Deductions under Chapter VI-A (80C, 80D, 80G, etc.)
       - Tracking income tax refunds and responding to portal intimations
     - *Documents Required Checklist:* Form 16 / Salary certificate, Bank account statements, Investment receipts, PAN and Aadhaar numbers.
     - CTA Button: "Enquire About ITR" (pre-selects ITR on `/contact?service=itr`).
   - **Service 3: PAN Card Applications & Corrections**
     - Slug: `pan`
     - Overview: Swift processing of Permanent Account Numbers through authorized government portals.
     - *What We Handle:*
       - New PAN applications for Indian citizens (Form 49A)
       - Correction of name, father's name, or date of birth in existing PAN records
       - Re-issuance of lost or damaged physical PAN cards
       - Mandatory linking of PAN with Aadhaar
     - *Documents Required Checklist:* Identity proof (Aadhaar / Voter ID), Address proof, Proof of Date of Birth, Passport size photographs.
     - CTA Button: "Enquire About PAN" (pre-selects PAN on `/contact?service=pan`).
   - **Future Service Slot:** Slot to dynamically render additional services populated in the database `SERVICE` table.
3. **Section 3: Frequently Asked Questions (FAQ Accordion)**
   - Collapsible accordion items answering high-frequency client questions:
     - *Q1: What is the due date for monthly GST return filing?*  
       *A: GSTR-1 is generally due on the 11th of the succeeding month, and GSTR-3B is due between the 20th and 24th depending on turnover and registration category.*
     - *Q2: Which income tax regime is better for me — Old or New?*  
       *A: We calculate your exact liability under both regimes factoring in your deductions, investments, and salary structure to choose the option that maximizes your savings.*
     - *Q3: What happens if I file my ITR after the deadline?*  
       *A: Late filing incurs fees under Section 234F (up to ₹5,000) and interest on unpaid taxes under Section 234A. We help you file promptly to avoid all penalties.*
     - *Q4: How long does it take to receive a new PAN card?*  
       *A: Digital e-PAN is usually generated within 3 to 5 business days, while the physical PVC card arrives by postal delivery within 10 to 15 days.*
4. **Section 4: Services CTA Band**
   - "Unsure which service applies to your business?" → "Talk to Ajay Singla" (`/contact`).

---

### 5.4 Contact Page (`/contact`)

The Contact page provides verified office details, directions, and a spam-protected, rate-limited enquiry form.

1. **Section 1: Page Hero (Dark `--bg-0`, Short)**
   - Eyebrow: "GET IN TOUCH"
   - H1: "Contact Our Office"
   - Subtext: "Visit us at our Mansa office or submit an online query for prompt personal attention."
2. **Section 2: Two-Column Contact Layout (Desktop) / Stacked (Mobile)**
   - **Left Column: Office & Direct Contact Details:**
     - Office Location Card:
       - Street: One Way Traffic Road
       - City & State: Mansa, Punjab
       - Landmark: Central Market Area
       - Embedded Monochrome Map: Monochromatic iframe or stylized map card with "View on Google Maps" external link.
     - Direct Contact Details:
       - Phone: `+91 9988383380` (with icon and direct `tel:` link).
       - Email: `ajay30@gmail.com` (with icon and direct `mailto:` link).
     - Business Working Hours:
       - Monday to Saturday: `9:30 AM – 7:30 PM`
       - Sunday: `Closed / By Appointment`
   - **Right Column: Interactive Contact Form:**
     - Form container card with hairline border (`--line-light`), white surface (`--surface`), 32px padding.
     - Form Header: "Send an Enquiry" with subtitle "Ajay Singla will review your query and call or email you back."
     - **Form Fields:**
       1. **Full Name** (`name`):
          - Type: `text`, required, minlength: 2, maxlength: 100.
          - Label: "Your Full Name *"
          - Placeholder: "e.g. Ramesh Kumar"
       2. **Email Address** (`email`):
          - Type: `email`, required.
          - Label: "Email Address *"
          - Placeholder: "ramesh@example.com"
       3. **Phone Number** (`phone`):
          - Type: `tel`, required, 10-digit Indian pattern `^[6-9]\d{9}$`.
          - Label: "Mobile Number *"
          - Placeholder: "9876543210"
       4. **Service Required** (`service_id` or `service`):
          - Type: `<select>`, required.
          - Options: "Select a service...", "GST Registration & Returns", "Income Tax Filing (ITR)", "PAN Card Services", "Other Accounting Advisory".
          - Dynamic pre-selection based on URL query parameter `?service=gst`.
       5. **Message** (`message`):
          - Type: `<textarea>`, required, minlength: 10, maxlength: 1000.
          - Label: "How can we help? *"
          - Placeholder: "Describe your accounting or tax requirements..."
       6. **Honeypot Anti-Spam Field** (`website`):
          - Hidden field (`display: none !important; opacity: 0; position: absolute; left: -9999px`). Real users leave this empty; bots auto-fill it.
       7. **Consent Checkbox** (`consent`):
          - Label: "I consent to Ajay Singla storing my details to contact me regarding this enquiry."
          - Required checkbox.
       8. **CSRF Protection Field** (`_csrf`):
          - Hidden token generated by server middleware.
       9. **Submit Button:**
          - Full-width or auto primary button: **"SUBMIT ENQUIRY"**.
     - **Form Feedback States:**
       - **Validation Errors:** High-visibility banner at form top + inline field red outlines and error descriptions.
       - **Submitting State:** Button disables with text "Sending enquiry...".
       - **Success State:** The form gracefully transitions / is replaced by a high-contrast Success Confirmation Card:
         - Success icon (Checkmark)
         - H3: "Enquiry Sent Successfully"
         - Message: "Thank you, [Name]. Your enquiry has been received. Ajay Singla will get in touch with you shortly at [Phone/Email]."
         - Button: "Send another message" (resets form).

---

### 5.5 Error Pages

1. **404 Page Not Found (`/404` & wildcard route)**
   - Wrapped in main layout with shared navbar and footer.
   - Central centered card on dark background:
     - Eyebrow: "ERROR 404"
     - H1: "Page Not Found" (*Playfair Display*, 48px)
     - Message: "The page you are looking for does not exist, has been removed, or the link may be outdated."
     - Actions: Primary button "Return to Home Page" (`/`) + Ghost button "Contact Office" (`/contact`).
2. **500 Server Error (`/500` & error handler middleware)**
   - Wrapped in main layout.
   - Central card:
     - Eyebrow: "ERROR 500"
     - H1: "Server Error" (*Playfair Display*, 48px)
     - Message: "An unexpected error occurred while processing your request. Please try again or contact Ajay Singla directly at 9988383380."
     - Action: Primary button "Return to Home Page" (`/`).

---

## 6. Layout & Template Structure for Express + EJS

### 6.1 Directory Organization

The project uses standard Express view resolution with partials and layouts:

```
d:/website ajay/
├── views/
│   ├── layouts/
│   │   ├── main.ejs                 # Master public layout (HTML head, nav, body, footer, chat widget)
│   │   └── admin.ejs                # Admin layout (clean minimal light theme)
│   ├── partials/
│   │   ├── navbar.ejs               # Fixed header, wordmark, nav links, CTA, hamburger menu
│   │   ├── footer.ejs               # Dark footer, contact info, disclaimer, copyright
│   │   ├── chat-widget.ejs          # Floating chat launcher & popup panel
│   │   ├── cookie-notice.ejs        # Bottom-left consent notice
│   │   ├── meta-tags.ejs            # SEO title, meta description, OpenGraph tags
│   │   └── admin-nav.ejs            # Admin navigation bar & logout button
│   ├── pages/
│   │   ├── home.ejs                 # Hero, trust strip, services preview, why choose, process, CTA
│   │   ├── about.ejs                # Page hero, bio, timeline, credentials, values, CTA
│   │   ├── services.ejs             # Page hero, GST/ITR/PAN sections, FAQ accordion, CTA
│   │   └── contact.ejs              # Page hero, contact details, map, contact form, success panel
│   ├── admin/
│   │   ├── login.ejs                # Admin login form (username, password, CSRF)
│   │   ├── dashboard.ejs            # Stat tiles (Total, New, This Week)
│   │   ├── submissions.ejs          # Submissions table with search, status filters, pagination, CSV export
│   │   └── submission-detail.ejs    # Submission view, status dropdown, notes list, quick action buttons
│   └── errors/
│       ├── 404.ejs                  # Not found error template
│       └── 500.ejs                  # Server error template
└── public/
    ├── css/
    │   ├── tokens.css               # CSS custom properties (colors, typography, spacing, radii, shadows)
    │   ├── base.css                 # Reset, typography rules, container layout
    │   ├── components.css           # Buttons, cards, form inputs, badges, accordion, chat widget
    │   ├── parallax.css             # Parallax layers, transitions, prefers-reduced-motion overrides
    │   ├── style.css                # Master CSS bundle importing all styles
    │   └── admin.css                # Admin panel specific light theme
    ├── js/
    │   ├── main.js                  # Navbar scroll handler, mobile menu, scroll reveal observer, parallax
    │   ├── contact.js               # Form client validation, AJAX submission, success replacement
    │   └── chat.js                  # Chatbot UI interactions, rule-based FAQ engine / API
    └── img/
        ├── favicon.ico              # Site favicon
        ├── portrait-placeholder.jpg # Bio placeholder image (monochrome)
        └── og-image.jpg             # OpenGraph share image
```

### 6.2 Master Layout Pattern (`views/layouts/main.ejs`)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof title !== 'undefined' ? title + ' | Ajay Singla' : 'Ajay Singla | Accounting & Tax Services' %></title>
  <meta name="description" content="<%= typeof description !== 'undefined' ? description : 'Ajay Singla — Self-employed accountant with 15+ years experience in GST, Income Tax Return filing, and PAN card applications in Mansa, Punjab.' %>">
  
  <!-- Typography: Google Fonts (Playfair Display & Inter) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,400&display=swap" rel="stylesheet">
  
  <!-- Master Stylesheet -->
  <link rel="stylesheet" href="/css/style.css">
  
  <!-- Google Analytics 4 (Loaded with consent check) -->
  <% if (typeof ga4Id !== 'undefined' && ga4Id) { %>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<%= ga4Id %>"></script>
  <% } %>
</head>
<body class="<%= typeof bodyClass !== 'undefined' ? bodyClass : '' %>">
  <%- include('../partials/navbar') %>

  <main id="main-content">
    <%- body %>
  </main>

  <%- include('../partials/footer') %>
  <%- include('../partials/chat-widget') %>
  <%- include('../partials/cookie-notice') %>

  <script src="/js/main.js"></script>
  <% if (typeof extraScript !== 'undefined') { %>
    <script src="<%= extraScript %>"></script>
  <% } %>
</body>
</html>
```

---

## 7. Admin UI Specification (Discovered in Specs)

While the public website is predominantly dark and dramatic, the Admin Dashboard utilizes a **clean, minimal light theme** for high operational clarity during data review and record editing:

1. **Admin Login (`/admin/login`):**
   - Centered card on neutral background (`--bg-2` `#F4F4F2`).
   - Card dimensions: `400px` width, `--surface` white background, hairline border, `--radius-md` 12px.
   - Branding: "Ajay Singla — Admin Portal".
   - Inputs: Username (`username`), Password (`password`), hidden CSRF token (`_csrf`).
   - Submit button: Primary dark button ("Sign In").
   - Lockout banner: Displayed after repeated failed attempts.
2. **Admin Dashboard (`/admin`):**
   - Header bar with user greeting, logout button, and navigation.
   - Stat Tiles (3 cards):
     - **Total Submissions** (all time)
     - **New / Unread Enquiries**
     - **Submissions This Week**
3. **Submissions Table View (`/admin/submissions`):**
   - Action Bar: Search input (by name, phone, email), Status filter dropdown (All, New, Read, Replied, Archived), and **"Export CSV"** button.
   - Responsive Data Table:
     - Columns: Date/Time, Name, Phone, Email, Service Requested, Status Chip, Actions ("View Details").
     - Pagination controls: Previous / Next page, page count indicator.
4. **Submission Detail View (`/admin/submissions/:id`):**
   - Submission Details Panel: Full Name, Email, Phone, Service Requested, IP Hash (privacy-preserving), Timestamp, Original Message.
   - Status Changer: Dropdown select (`new`, `read`, `replied`, `archived`) with instant update.
   - Quick Action Buttons:
     - "Call Client" (`tel:` link with client phone number).
     - "Email Client" (`mailto:` link with client email address and pre-filled subject).
   - Internal Notes Section:
     - Feed of existing notes with author name and timestamp.
     - New note textarea and "Add Note" button.

---

## 8. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Design Tokens | Monochromatic Palette | Strict grayscale palette (`#0B0B0C`, `#151517`, `#F4F4F2`, `#FFFFFF`, `#F5F5F5`, `#A1A1A6`, `#111113`, `#5A5A60`, `#2A2A2D`, `#DCDCD8`) with semantic red (`#C0392B`) & green (`#2E7D32`) | CSS variable references | Computed color styles | Rejection of non-token colors | `design.md` § 2 |
| 2 | Typography | Dual Font Hierarchy | *Playfair Display* for headings and *Inter* for body/UI, scale 12px to 64px, line-height 1.6 body and 1.1 headings | Text content | Styled typography | Fallback to Georgia / system-ui | `design.md` § 2 |
| 3 | Spacing & Layout | 4-pt Spacing Grid | Modular scale (4, 8, 16, 24, 32, 48, 80, 128px), container max-width 1200px, section padding 96–128px desktop, 64px mobile | Spacing utility classes / CSS vars | Consistent spacing rhythm | Clamped to container width | `design.md` § 2 |
| 4 | Motion | Parallax Hero | Multi-layer background translating at 0.2×–0.6× scroll rate via `translate3d` and `will-change: transform` | Window scroll position | Smooth parallax movement | Disabled if viewport < 768px | `design.md` § 3 |
| 5 | Accessibility | Reduced Motion Support | Disables parallax, scroll reveals, and counter animations when user specifies `prefers-reduced-motion: reduce` | System media query | Static instant styling | Graceful degradation without animation | `design.md` § 3 |
| 6 | Motion | Section Scroll Reveal | Smooth fade-up (24px translateY, 600ms, cubic-bezier(.2,.7,.2,1)) triggered via IntersectionObserver | Viewport intersection | Animated entrance | Instant display if observer unsupported or motion reduced | `design.md` § 3 |
| 7 | Shared UI | Fixed Navbar | Fixed navigation bar transitioning from transparent to backdrop blur (`backdrop-filter: blur(12px)`) after 40px scroll | Scroll offset, link clicks | Rendered navigation header | Fallbacks for browsers without backdrop-filter | `design.md` § 4 |
| 8 | Shared UI | Mobile Hamburger Menu | Collapsible slide-down menu for mobile viewports (<1024px) with accessible aria controls | Hamburger button toggle | Full/half screen navigation overlay | Trapped focus within overlay | `design.md` § 4 |
| 9 | Shared UI | Footer Component | Dark theme footer with contact details, address in Mansa, tel/mailto links, quick links, professional disclaimer, and copyright | Page render | Standard footer block | Validated links | `design.md` § 4, `prd.md` § 1 |
| 10 | Shared UI | Primary & Ghost Buttons | Monochromatic buttons with uppercase 14px typography, 14×28 padding, 4px border radius, 2px hover lift | Click event | Visual click response & navigation | Disabled state prevents click | `design.md` § 4 |
| 11 | Shared UI | Form Inputs & Textarea | 48px height form fields, 4px border-radius, floating/top labels, hairline border, focus ring, inline error states | User typing / selection | Value capture, validation display | Red border and inline error text | `design.md` § 4 |
| 12 | Shared UI | Status Chips & Badges | 999px border-radius pill chips for services and admin status tags | Tag label | Stylized pill chip | Truncated text if overflowing | `design.md` § 2 |
| 13 | Shared UI | Cards Component | Elevated container with 12px border radius, hairline border, 32px padding, subtle shadow and hover lightness shift | Card content | Elevated UI block | Responsive padding collapse on mobile | `design.md` § 4 |
| 14 | Shared UI | Chatbot Side Widget | 56px circular launcher button opening 360×520 panel with message bubbles, quick prompt chips, and FAQ responder | User input query | Bot message response / fallback link | Fallback to contact form if query unknown | `design.md` § 4, `prd.md` § 3 |
| 15 | Shared UI | Cookie Consent Banner | Slim bottom-left bar with Accept/Decline options controlling GA4 script activation | Consent button click | Stored consent cookie, GA4 load | GA4 blocked on decline | `design.md` § 4, `prd.md` § 6 |
| 16 | Public Page | Home Page (`/`) | Complete landing experience: Parallax Hero, Trust Strip (15+ yrs, filings), Services preview, Why Choose Us (2×2 grid), 4-step Process, CTA Band | HTTP GET `/` | Fully rendered Home page | Returns 500 on server error | `design.md` § 5, `ORIGINAL_REQUEST.md` |
| 17 | Public Page | About Page (`/about`) | Narrative overview of Ajay Singla: 15+ years experience, grayscale portrait, qualifications/credentials, career milestones timeline, 3 core values, CTA | HTTP GET `/about` | Fully rendered About page | Returns 500 on server error | `design.md` § 5 |
| 18 | Public Page | Services Page (`/services`) | Detailed service sections (GST, ITR, PAN) with descriptions, "What you get" checklists, required documents, interactive FAQ accordion, enquiry CTA | HTTP GET `/services` | Fully rendered Services page | Renders core services if DB empty | `design.md` § 5, `architecture.md` |
| 19 | Public Page | Contact Page (`/contact`) | Office details (One Way Traffic Road, Mansa), clickable tel/mailto, monochrome map link, contact form with CSRF, validation, honeypot, success state | HTTP GET `/contact` | Fully rendered Contact page | Client/server validation messages | `design.md` § 5, `prd.md` § 1 |
| 20 | Contact Form | Honeypot Anti-Spam Field | Hidden form field invisible to human users (`display:none !important`, tabindex -1) to detect automated spam bots | Form submission payload | Rejects or silently discards if filled | Returns 400 Bad Request or silent rejection | `ORIGINAL_REQUEST.md`, `design.md` § 5 |
| 21 | Contact Form | Success Confirmation State | Replaces the form with a high-contrast thank-you confirmation panel without page reload | Valid form POST response | Rendered confirmation panel | Form retains input values on error | `design.md` § 5, `architecture.md` |
| 22 | Error Page | 404 Not Found Page | Monochromatic branded 404 page sharing standard layout with message and "Return to Home" button | Invalid URL request | 404 HTTP status & template | Graceful fallback | `ORIGINAL_REQUEST.md` |
| 23 | Error Page | 500 Server Error Page | Monochromatic branded 500 page sharing standard layout with apology and direct phone contact | Unhandled server exception | 500 HTTP status & template | Graceful fallback | `ORIGINAL_REQUEST.md` |
| 24 | Admin UI | Minimal Light Theme | Clean light-themed interface (`#F4F4F2`, `#FFFFFF`, `#111113`) for admin login, dashboard tiles, submissions table, and detail editor | Admin session routes | Rendered admin views | Redirects to `/admin/login` if unauthenticated | `design.md` § 5, `architecture.md` |

---

## 9. Edge Cases & Boundary Behaviors

| # | Feature | Input / Condition | Observed / Documented Behavior |
|---|---|---|---|
| 1 | Parallax Hero | Viewport width < 768px (Mobile) | Parallax transform script is deactivated; background layers remain fixed (`transform: none`) to preserve battery life and eliminate mobile scroll jitter. |
| 2 | Motion & Animation | `prefers-reduced-motion: reduce` enabled in OS/Browser | All CSS transitions and keyframes drop to 0.01ms; parallax layers and `.reveal-on-scroll` elements display instantly at full opacity without translation. |
| 3 | Fixed Navbar | User scrolls down past 40px | Navbar seamlessly transitions from transparent background to `backdrop-filter: blur(12px)` and `background-color: rgba(11, 11, 12, 0.88)` with a hairline bottom border. |
| 4 | Mobile Navigation | User opens mobile menu on smartphone | Menu slides in / drops down with `aria-expanded="true"`; page scrolling is locked or managed; selecting any navigation link closes the menu and smoothly navigates. |
| 5 | Contact Form Submission | Automated bot fills honeypot field (`website != ''`) | Backend rejects submission (HTTP 400 or silent rejection) and prevents insertion into the SQLite database. |
| 6 | Contact Form Phone | Non-Indian format or alphabetic characters entered | Frontend pattern validation and backend server validation flag error: "Please enter a valid 10-digit mobile number". Field highlights red (`#C0392B`). |
| 7 | Contact Form Message | Input < 10 characters or empty | Validation triggers inline error: "Please provide a brief description of your requirements (min 10 characters)". |
| 8 | Contact Form Submission | Valid submission sent via AJAX | Form smoothly fades out and is replaced by the Confirmation Card containing personalized thank-you message and direct phone assistance. |
| 9 | Contact Form Direct POST | JavaScript disabled in user's browser | Standard HTTP POST submission succeeds; server redirects or re-renders contact page with success alert banner. |
| 10 | Services Page | Dynamic service list loaded from SQLite database | DB records from `SERVICE` table render cleanly into the modular service grid; if DB is unseeded, fallback default cards (GST, ITR, PAN) render safely. |
| 11 | FAQ Accordion | User clicks an already-open accordion item | The active item collapses back to `max-height: 0` and `aria-expanded="false"` while retaining keyboard focus. |
| 12 | Chatbot Widget | Viewport < 480px (Small Phone) | Widget panel expands to near full-screen width with margin (`calc(100vw - 32px)`) so messages and keyboard do not overflow screen boundaries. |
| 13 | Chatbot Query | User submits query not in FAQ JSON | Bot gracefully returns fallback response: "I don't have that specific tax detail right now. Please leave your details in our Contact Form and Ajay Singla will assist you directly." with link to `/contact`. |
| 14 | Cookie Notice | User clicks "Decline" | Notice dismisses, consent cookie saved as `rejected`, GA4 `gtag` script remains unloaded to respect visitor privacy. |
| 15 | Browser Typography Fallback | Google Fonts fails to load or user offline | Layout degrades gracefully: Headings fall back to `Georgia, 'Times New Roman', serif`, body text falls back to `system-ui, sans-serif` without layout shifts. |
