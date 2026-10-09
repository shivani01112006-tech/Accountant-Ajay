# Project Phases

| Phase | Name | Goal | Exit criteria |
|---|---|---|---|
| 0 | Discovery & Content | Collect content and confirm details | Bio, services text, email confirmed, photo, logo/wordmark, GA4 property ID |
| 1 | Foundation | Project scaffold & DB | Node + Express running, folder structure, `.env`, SQLite schema + migrations, feature-flag config |
| 2 | Design System & Layout | Build tokens, layout, components | Navbar, footer, buttons, cards, parallax hero working per design.md |
| 3 | Public Pages | Home, About, Services, Contact UI | All pages responsive, content in place |
| 4 | Contact + Storage | Form → DB | Validation, honeypot, rate limit, saved to SQLite, success state |
| 5 | Admin Panel | Secure submission management | Login, dashboard, list/search/filter, detail, status, notes, CSV |
| 6 | Chatbot (MVP) | Rule-based side widget | FAQ JSON engine, widget UI, fallback to contact form |
| 7 | Analytics & SEO | Tracking and discoverability | GA4 events (lead, chat, clicks), consent bar, meta/OG, sitemap, schema.org |
| 8 | QA & Hardening | Quality and security | Lighthouse ≥ 90, a11y check, security headers, cross-device tests, backup script for SQLite |
| 9 | Deploy & Handover | Go live | VPS/host with persistent disk, HTTPS, domain, admin credentials changed, owner guide |
| 10 | Future Enhancements | Extend | Email alerts, WhatsApp chat, blog, testimonials, booking, RAG chatbot (Chroma/FAISS), multi-language |

## Phase Task Detail
**Phase 1:** `npm init`, install express, ejs, better-sqlite3, helmet, express-session, bcrypt, dotenv, express-rate-limit, validator · create schema.sql (admin_user, service, submission, submission_note, chat tables) · seed admin via script (never hard-code password).
**Phase 4:** server validation (name length, email format, 10-digit phone, message length), store hashed IP only.
**Phase 5:** lockout after repeated failed logins; session timeout 30 min.
**Phase 7:** load gtag only after consent; test with GA4 DebugView.
**Phase 9:** daily SQLite file backup; log rotation.

## Risks
| Risk | Mitigation |
|---|---|
| Serverless host loses SQLite file | Use VPS/persistent disk or migrate to Postgres |
| Spam submissions | Honeypot + rate limit (+ CAPTCHA later) |
| Missing content delays | Placeholder copy flagged in code |
| Over-promising claims in copy | Review copy with disclaimer |
