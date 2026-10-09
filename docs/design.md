# Design System & Page Specs

## 1. Principles
Monochromatic, premium, calm, trustworthy. One hue family (neutral greys), hierarchy through size, weight, space and depth — not colour. Parallax is subtle and purposeful.

## 2. Design Tokens
**Colour (monochrome)**
| Token | Value | Use |
|---|---|---|
| `--bg-0` | #0B0B0C | Hero / dark sections |
| `--bg-1` | #151517 | Cards on dark |
| `--bg-2` | #F4F4F2 | Light sections |
| `--surface` | #FFFFFF | Cards on light |
| `--text-hi` | #F5F5F5 | Text on dark |
| `--text-lo` | #A1A1A6 | Secondary on dark |
| `--ink` | #111113 | Text on light |
| `--ink-soft` | #5A5A60 | Secondary on light |
| `--line` | #2A2A2D / #DCDCD8 | Borders |
| `--accent` | #FFFFFF (dark) / #111113 (light) | Buttons, links (still monochrome) |
Only semantic exceptions: form error (#C0392B) and success (#2E7D32), used sparingly.

**Typography**
- Headings: *Playfair Display* (serif, premium) — fallback Georgia
- Body/UI: *Inter* — fallback system-ui
- Scale: 12 / 14 / 16 / 20 / 28 / 40 / 64 px; line-height 1.6 body, 1.1 headings
- Eyebrow labels: 12px, uppercase, letter-spacing .18em

**Spacing:** 4-pt grid (4, 8, 16, 24, 32, 48, 80, 128). Section padding 96–128px desktop, 64px mobile.
**Radius:** 4px (inputs), 12px (cards), 999px (chips). **Max width:** 1200px.
**Shadow:** `0 20px 60px rgba(0,0,0,.35)` on dark; `0 10px 30px rgba(0,0,0,.08)` on light.
**Breakpoints:** 480 / 768 / 1024 / 1280.

## 3. Motion & Parallax
- Hero background layers move at 0.2×–0.6× scroll speed (`transform: translate3d`, `will-change: transform`).
- Section reveal: fade-up 24px, 600ms, `cubic-bezier(.2,.7,.2,1)`, via IntersectionObserver.
- Hover: buttons lift 2px; cards darken/lighten one step.
- `@media (prefers-reduced-motion: reduce)` → disable parallax and reveals.
- Parallax disabled below 768px width for performance.

## 4. Global Components
| Component | Spec |
|---|---|
| Navbar | Fixed, transparent over hero → solid blur (`backdrop-filter`) after 40px scroll. Logo wordmark "Ajay Singla" + links Home / About / Services / Contact + "Get in touch" button |
| Button primary | Solid accent, 14px uppercase, 14×28 padding, radius 4px |
| Button ghost | 1px border, transparent |
| Card | surface bg, radius 12, 32px padding, hairline border |
| Section header | eyebrow + H2 + 1-line subtext |
| Footer | Dark; contact details, quick links, copyright, disclaimer |
| Chat widget | Circular 56px button bottom-right; opens 360×520 panel (dark, rounded 16), header "Ask us", message bubbles (user light, bot dark-grey), input + send |
| Cookie notice | Slim bar bottom-left, Accept/Decline, controls GA4 consent |
| Form field | 48px height, bottom-border or 1px border, floating label, inline error text |

## 5. Page Specs
### Home
1. **Hero (dark, parallax)** — eyebrow "Chartered-style precision, local trust"; H1 "Accounts, GST & Tax — handled with 15+ years of care."; subtext; CTAs: "Get in touch" (primary), "View services" (ghost). Background: layered grayscale geometric/texture planes.
2. **Trust strip (light)** — 3–4 stats: 15+ Years, GST, ITR, PAN (counters animate).
3. **Services preview** — 3 cards (GST, Income Tax, PAN) → link to Services.
4. **Why choose** — 4 points in a 2×2 grid (accuracy, deadlines, transparency, local presence).
5. **Process (dark, parallax)** — 4 steps: Share documents → Review → File → Confirm.
6. **CTA band** — "Need help with your filing?" + button.

### About
1. Page hero (short, dark) — "About Ajay Singla"
2. Bio — portrait placeholder (grayscale) + 2–3 paragraphs, experience summary
3. Timeline / milestones (placeholder values until supplied)
4. Values — 3 cards
5. CTA

### Services
1. Page hero
2. Alternating sections per service (image/icon + description + "what you get" list + documents needed + CTA):
   - GST Registration & Returns
   - Income Tax Return Filing
   - PAN Card Application
   - (Slot for future services — rendered from DB `SERVICE` table)
3. FAQ accordion (also feeds chatbot)
4. CTA

### Contact
1. Page hero
2. Two columns: left — details (address, phone with `tel:` link, email with `mailto:`, hours placeholder, map link); right — form
3. **Form fields:** Name*, Email*, Phone*, Service (select), Message*, hidden honeypot; consent checkbox. Submit → success panel replaces form.
4. Map embed or static map image (monochrome-filtered)

### Admin (separate minimal light theme)
- **Login:** centred card, username + password.
- **Dashboard:** stat tiles (Total, New, This week).
- **Submissions:** table (date, name, phone, service, status chip), search, status filter, pagination, CSV export.
- **Detail:** all fields, status dropdown, notes, "Call"/"Email" quick actions.

## 6. Copy & Tone
Professional, plain English, no jargon walls, no guarantees ("We help you file correctly and on time"). Add disclaimer in footer.

## 7. Consistency Checklist
- [ ] Only tokens above used; no ad-hoc colours
- [ ] One H1 per page; heading order logical
- [ ] Contrast ≥ 4.5:1 body text
- [ ] Same navbar/footer/CTA component on every page
- [ ] Alt text on all images; focus states visible
- [ ] Reduced-motion tested
