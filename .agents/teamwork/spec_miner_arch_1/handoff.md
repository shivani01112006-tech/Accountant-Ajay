# Handoff Report: Architecture, Backend, Database, Auth & Security Specifications

**Agent:** `spec_miner_arch_1`  
**Date:** 2026-10-07  
**Working Directory:** `d:/website ajay/.agents/teamwork/spec_miner_arch_1`  
**Report Type:** Hard Handoff (Task Complete)

---

## 1. Observation

Direct observations from inspection of the project workspace and authoritative source files:

1. **Workspace State:**
   - Listing `d:/website ajay` via `list_dir` revealed no existing runtime code (`package.json`, `server.js`, or `db/` do not yet exist).
   - Only 5 documentation files exist in root:
     - `architecture.md` (4,829 bytes)
     - `design.md` (5,187 bytes)
     - `memory.md` (2,552 bytes)
     - `phase.md` (2,383 bytes)
     - `prd.md` (5,075 bytes)
   - `.agents/teamwork/ORIGINAL_REQUEST.md` (2,686 bytes) contains user requirements and acceptance criteria.

2. **Server Architecture & Structure Specifications:**
   - `architecture.md` lines 27–38 dictates the folder layout:
     ```
     portfolio/
     ├─ server.js
     ├─ .env
     ├─ config/        (index.js, features.js)
     ├─ db/            (schema.sql, connection.js, repositories/)
     ├─ modules/       (contact/, admin/, chatbot/, analytics/)
     ├─ views/         (layouts/, partials/, pages/, admin/)
     ├─ public/        (css/, js/, img/)
     ├─ middleware/    (auth.js, rateLimit.js, validate.js)
     └─ docs/
     ```
   - `architecture.md` line 39 establishes extension rule: *"a new feature = a new folder in modules/ + one line in config/features.js (blog: true)"*.
   - `architecture.md` lines 3–7 specifies layer stack: `Browser → Express routes → Controllers → Services → Repositories → SQLite`.

3. **Database Specifications:**
   - `prd.md` lines 62, 71 specifies SQLite with `better-sqlite3`.
   - `architecture.md` lines 43–92 defines tables and relationships in Mermaid ER diagram:
     - `ADMIN_USER`: `id PK`, `username UK`, `password_hash`, `created_at`
     - `SERVICE`: `id PK`, `slug UK`, `title`, `summary`, `sort_order`
     - `SUBMISSION`: `id PK`, `name`, `email`, `phone`, `service_id FK`, `message`, `status "new|read|replied|archived"`, `ip_hash`, `created_at`
     - `SUBMISSION_NOTE`: `id PK`, `submission_id FK`, `admin_id FK`, `note`, `created_at`
     - `CHAT_SESSION`: `id PK`, `session_token`, `started_at`
     - `CHAT_MESSAGE`: `id PK`, `session_id FK`, `role "user|bot"`, `text`, `created_at`
   - `ORIGINAL_REQUEST.md` line 18 specifies seeding logic: *"Create db/schema.sql and a seed script that creates the admin user (credentials from .env) and populates three services (GST, Income Tax, PAN)."*
   - `phase.md` line 18 specifies: *"create schema.sql (admin_user, service, submission, submission_note, chat tables) · seed admin via script (never hard-code password)."*

4. **Contact Form Backend Specifications:**
   - `ORIGINAL_REQUEST.md` lines 23–25 specifies: *"Implement the contact form backend with server-side validation, a honeypot field, rate limiting, and parameterized SQL. Ensure the form saves to the SQLite database (storing only a hashed IP) and returns a success state."*
   - `ORIGINAL_REQUEST.md` lines 40–41 specifies acceptance criteria:
     - *"Submitting a valid contact form creates a new row in the SUBMISSION SQLite table and returns a success response."*
     - *"Submitting a contact form with the honeypot field filled is rejected."*
   - `phase.md` line 19 specifies: *"server validation (name length, email format, 10-digit phone, message length), store hashed IP only."*
   - `design.md` lines 82–83 specifies: *"Form fields: Name*, Email*, Phone*, Service (select), Message*, hidden honeypot; consent checkbox. Submit → success panel replaces form."*

5. **Admin Panel & Authentication Specifications:**
   - `ORIGINAL_REQUEST.md` lines 26–28 specifies: *"Build an admin dashboard at /admin with bcrypt + express-session login (with lockout and 30-min timeout). Include a dashboard counts view, a paginated submissions list with search and status filtering, a detail view for changing status and adding notes, and a CSV export feature."*
   - `ORIGINAL_REQUEST.md` lines 42–44 specifies acceptance criteria:
     - *"Navigating to /admin without a session redirects to /admin/login."*
     - *"Logging in with seeded admin credentials grants access to the dashboard."*
     - *"The admin dashboard displays the submitted contact form data."*
   - `architecture.md` lines 149–158 specifies API routes:
     - `GET /admin/login`, `POST /admin/login`, `GET/POST /admin/logout`
     - `GET /admin/submissions`
     - `GET/POST /admin/submissions/:id`
     - `GET /admin/submissions/export.csv`
   - `design.md` lines 86–90 specifies admin UI components:
     - Dashboard stat tiles: Total, New, This week
     - Submissions table: date, name, phone, service, status chip, search, status filter, pagination, CSV export
     - Detail view: all fields, status dropdown, notes, quick actions ("Call", "Email").

6. **Security Suite Specifications:**
   - `ORIGINAL_REQUEST.md` line 30 specifies: *"Apply helmet, CSRF tokens on forms, output escaping, and secure cookies."*
   - `architecture.md` line 164 specifies: *"helmet headers, rate limit on /contact and /admin/login, parameterised SQL, server-side validation, honeypot field, bcrypt, session cookie httpOnly; secure; sameSite, escape output."*

---

## 2. Logic Chain

1. **From Observation 1 and 2 (Structure & Layer Stack):**
   The application requires a clean, layered Express structure. Since `architecture.md` and `memory.md` emphasize that features reside in `modules/` and data access is mediated through `db/repositories/*`, implementation must decouple SQL operations from Express route handlers, using repositories (`adminRepository.js`, `serviceRepository.js`, `submissionRepository.js`) to ensure modularity and future portability (e.g. migration to PostgreSQL/Supabase).

2. **From Observation 3 (SQLite & Schema):**
   `better-sqlite3` is synchronous and operates on a local file. To maintain concurrency and integrity in a multi-route environment:
   - WAL mode (`PRAGMA journal_mode = WAL;`) must be executed on connection startup to avoid database table lock contention during concurrent form submissions and admin dashboard reads.
   - `PRAGMA foreign_keys = ON;` must be explicitly enabled because SQLite disables foreign key checks by default.
   - The seed script (`npm run seed`) must read `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`, hash the password via bcrypt (rounds >= 10), and seed the 3 services (`gst`, `income-tax`, `pan`) idempotently.

3. **From Observation 4 (Contact Form Processing):**
   - Validation must enforce name length (2–100), RFC 5322 email format, 10-digit Indian phone (`/^[6-9]\d{9}$/`), message length (10–2000), and consent checkbox.
   - Honeypot: field named `website` must be hidden visually and from screen readers (`style="display:none;"`, `tabindex="-1"`, `autocomplete="off"`). Any presence of text in this field immediately triggers rejection (HTTP 400).
   - Rate limiting: max 5 requests per 15 minutes per IP prevents bot spam.
   - IP Hashing: raw IP (`req.ip`) must be combined with a salt and hashed via SHA-256 before inserting into `SUBMISSION.ip_hash`. The raw IP must never touch the database.

4. **From Observation 5 (Admin & Auth Flow):**
   - Unauthenticated requests to `/admin` or `/admin/submissions` must be intercepted by `requireAuth` middleware and redirected to `/admin/login`.
   - `POST /admin/login` must compare input with bcrypt hash and enforce lockout (max 5 failed attempts locks login for 15 minutes).
   - `express-session` must be set to 30 minutes (`maxAge: 1800000`), `httpOnly: true`, `sameSite: 'lax'`, and `secure` in production.
   - Submissions list queries must use parameterized SQL with `COUNT(*) OVER()` or separate count queries to supply pagination, status filtering, and keyword search (`LIKE ?`).
   - CSV export must conform to RFC 4180 (wrap in quotes, escape `"` with `""`) and neutralize formula injection (prefixing `'` on leading `=`, `+`, `-`, `@`).

5. **From Observation 6 (Security Suite):**
   - Helmet provides CSP, frame protection, and sniffing protection.
   - All rendered forms must include `<input type="hidden" name="_csrf" value="<%= csrfToken %>">`.
   - All EJS variables must be escaped using `<%= %>`.
   - Error handling middleware must intercept 404s and 500s without disclosing stack traces in production.

---

## 3. Caveats

1. **Email Address Confirmation:**
   `prd.md` line 7 notes: `ajay30@gmail.com (confirm)`. The specification configures `ADMIN_EMAIL` to default to `ajay30@gmail.com` via `.env`, which is customizable without code modification.
2. **Reverse Proxy Configuration:**
   When deployed behind a reverse proxy (Nginx, Render, Cloudflare), `app.set('trust proxy', 1)` must be configured in `server.js` so that `req.ip` reflects the client's actual IP rather than the proxy IP for rate limiting and IP hashing.
3. **No Code Implemented:**
   In accordance with the Specification Miner instructions and constraints, no code files were created or modified outside of the `.agents/teamwork/spec_miner_arch_1/` directory.

---

## 4. Conclusion

All architecture, database, API, backend logic, authentication, admin panel, and security specifications have been mined and documented in full detail in:
`d:/website ajay/.agents/teamwork/spec_miner_arch_1/spec_report.md`

The extraction covers:
- Complete directory structure and environment variable definitions.
- Full DDL schema for SQLite with WAL mode, foreign keys, and indexes.
- Seeding specifications for admin user and 3 core services.
- Contact form validation rules, honeypot defense, rate limiting, and SHA-256 IP hashing.
- Complete Admin routes, bcrypt authentication, 30-min session timeout, brute-force lockout, dashboard metrics, search/filter/pagination, and RFC 4180 CSV export.
- Complete security suite: Helmet CSP/headers, CSRF protection, EJS escaping, secure cookie flags, and error middleware.
- 36 discovered features in the Specification Matrix and 22 edge cases with observed/required behaviors.

---

## 5. Verification Method

To verify the extracted specifications:

1. **Inspect Report Files:**
   - View `d:/website ajay/.agents/teamwork/spec_miner_arch_1/spec_report.md` to confirm all 5 areas and tables are present and complete.
   - Cross-check table counts: 36 features documented in `## Features Discovered`, 22 edge cases documented in `## Edge Cases`.
2. **Cross-Check with Authoritative Sources:**
   - Verify DB schema against `architecture.md` lines 43–92.
   - Verify acceptance criteria alignment against `ORIGINAL_REQUEST.md` lines 34–45.
   - Verify rate limiting and validation constraints against `phase.md` lines 18–20.
3. **Downstream Implementation Readiness:**
   - Any implementing agent can directly copy the SQL DDL statements, route tables, and validation schemas from `spec_report.md` into `db/schema.sql`, `db/seed.js`, and Express module files without any ambiguity.
