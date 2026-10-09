# Original User Request

## 2026-10-07T17:13:03Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: [none — teamwork routes from the description]

Build a portfolio website for Ajay Singla, a self-employed accountant with 15+ years of experience. The scope covers Phases 1 to 5 (Foundation, Design System, Public Pages, Contact + Storage, Admin Panel) using Node.js, Express, EJS, and SQLite.

Working directory: d:/website ajay

## Requirements

### R1. Scaffold and Foundation (Phase 1)
Set up the Node.js project, Express server, folder structure (`config`, `db`, `modules`, etc.), and SQLite database (`better-sqlite3`). Create `db/schema.sql` and a seed script that creates the admin user (credentials from `.env`) and populates three services (GST, Income Tax, PAN).

### R2. Design System and UI (Phase 2 & 3)
Implement the design system precisely following the design tokens in `docs/design.md` (strictly monochrome, Playfair Display + Inter, 4-pt spacing, parallax hero, reduced-motion support). Build the Home, About, Services, and Contact pages with responsive shared navbar and footer partials, using clear placeholder copy where needed.

### R3. Contact Form Backend (Phase 4)
Implement the contact form backend with server-side validation, a honeypot field, rate limiting, and parameterized SQL. Ensure the form saves to the SQLite database (storing only a hashed IP) and returns a success state.

### R4. Admin Panel (Phase 5)
Build an admin dashboard at `/admin` with `bcrypt` + `express-session` login (with lockout and 30-min timeout). Include a dashboard counts view, a paginated submissions list with search and status filtering, a detail view for changing status and adding notes, and a CSV export feature.

### R5. Security
Apply `helmet`, CSRF tokens on forms, output escaping, and secure cookies.

## Acceptance Criteria

### Scaffold & UI
- [ ] `npm install && npm run seed && npm start` successfully starts the server on port 3000.
- [ ] The public pages (/, /about, /services, /contact) return HTTP 200 and include the shared navbar and footer.
- [ ] CSS uses the monochromatic palette and tokens defined in `design.md`.

### Functional
- [ ] Submitting a valid contact form creates a new row in the `SUBMISSION` SQLite table and returns a success response.
- [ ] Submitting a contact form with the honeypot field filled is rejected.
- [ ] Navigating to `/admin` without a session redirects to `/admin/login`.
- [ ] Logging in with seeded admin credentials grants access to the dashboard.
- [ ] The admin dashboard displays the submitted contact form data.

## 2026-10-08T05:12:03Z

The server restarted and you were stopped. Please resume your work from where you left off. Review phase of Milestone 1 was underway.
