# Project: Ajay Singla Portfolio Website

## Architecture
- **Stack**: Node.js LTS (v26.5.1), Express.js 4, EJS view engine, SQLite (via `better-sqlite3` or compatible SQLite driver) in WAL mode (`PRAGMA journal_mode = WAL`, `PRAGMA foreign_keys = ON`).
- **Layers**:
  - `Browser` → `Express Middleware` (Helmet, RateLimit, CSRF, Session, Auth) → `Controllers` → `Services` → `Repositories` (`better-sqlite3`) → `SQLite DB`.
- **Security Baseline**:
  - Helmet for security headers and Content Security Policy.
  - CSRF token validation on all state-changing POST requests (`/contact`, `/admin/login`, `/admin/submissions/:id`).
  - Strict input sanitization & validation (`validator`).
  - Honeypot spam defense (`website` hidden field).
  - SHA-256 salted IP hashing (zero raw IP addresses stored).
  - `express-session` with rolling 30-minute timeout, `httpOnly`, `sameSite: 'lax'`, secure cookies in production.
  - Password hashing via `bcrypt` (cost factor >= 10).
  - Rate limiting (5 contact requests / 15 min; 5 admin login attempts / 15 min with lockout).
  - Formula injection sanitization on CSV exports.
  - Context-aware HTML escaping in EJS (`<%= %>`).

## Code Layout
```
d:/website ajay/
├─ server.js                     # Express app initialization & HTTP listener
├─ package.json                  # Dependencies & npm scripts (seed, start, test)
├─ .env.example                  # Template configuration
├─ .env                          # Local environment variables
├─ config/
│  ├─ index.js                   # Centralized env config & defaults
│  └─ features.js                # Feature flags (chatbot, analytics, etc.)
├─ db/
│  ├─ connection.js              # SQLite connection initialization (WAL mode)
│  ├─ schema.sql                 # DDL definitions (tables, constraints, indexes)
│  ├─ seed.js                    # Seeding script (admin user & 3 services)
│  └─ repositories/
│     ├─ serviceRepository.js    # Service querying
│     ├─ submissionRepository.js # Submissions CRUD & notes
│     └─ adminRepository.js      # Admin credentials & lockout tracking
├─ middleware/
│  ├─ auth.js                    # Admin session authentication & lockout
│  ├─ csrf.js                    # CSRF token generator & validator
│  ├─ rateLimit.js               # Rate limiters (contact & login)
│  └─ errorHandler.js            # 404 and 500 error handling
├─ modules/
│  ├─ public/
│  │  ├─ publicController.js     # Home, About, Services, Contact GET
│  │  └─ publicRoutes.js         # Public page route definitions
│  ├─ contact/
│  │  ├─ contactController.js    # POST /contact submission handler
│  │  ├─ contactService.js       # Business logic (hash IP, honeypot, storage)
│  │  └─ contactRoutes.js        # Contact route definitions
│  └─ admin/
│     ├─ adminController.js      # Dashboard, login, list, detail, CSV
│     ├─ adminService.js         # Auth verification, export generation
│     └─ adminRoutes.js          # Admin route definitions
├─ views/
│  ├─ layouts/
│  │  ├─ main.ejs                # Public master layout
│  │  └─ admin.ejs               # Admin master layout
│  ├─ partials/
│  │  ├─ navbar.ejs              # Shared public header & navigation
│  │  ├─ footer.ejs              # Shared public footer
│  │  ├─ flash.ejs               # Flash/notification messages
│  │  └─ cookie-notice.ejs       # Cookie consent banner
│  ├─ pages/
│  │  ├─ home.ejs                # Landing page with parallax hero
│  │  ├─ about.ejs               # Biography, credentials, timeline
│  │  ├─ services.ejs            # GST, Income Tax, PAN details & FAQ
│  │  ├─ contact.ejs             # Contact form & location info
│  │  ├─ 404.ejs                 # Not Found error page
│  │  └─ 500.ejs                 # Server Error page
│  └─ admin/
│     ├─ login.ejs               # Admin login screen
│     ├─ dashboard.ejs           # Metric counts & summary
│     ├─ submissions.ejs         # Submissions list, pagination, filter, search
│     └─ submission-detail.ejs   # Submission details, status update, notes
├─ public/
│  ├─ css/
│  │  ├─ tokens.css              # Monochromatic CSS custom properties & typography
│  │  ├─ base.css                # Reset, typography, utility classes
│  │  ├─ components.css          # Buttons, forms, cards, badges, navbar, footer
│  │  ├─ parallax.css            # Hero parallax & scroll animation styles
│  │  └─ admin.css               # Admin layout & tables styling
│  ├─ js/
│  │  ├─ main.js                 # Mobile menu, notifications, interactions
│  │  ├─ parallax.js             # Parallax hero & IntersectionObserver
│  │  └─ contact.js              # Client-side feedback & validation helpers
│  └─ img/
│     ├─ favicon.ico
│     └─ placeholder-portrait.svg
└─ tests/
   ├─ e2e/                       # Requirement-driven E2E test suite
   └─ test-runner.js             # Opaque-box automated test harness
```

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Node.js & Express Setup | Server setup, Express middleware, npm scripts (`start`, `seed`, `test`) | M1 | ORIGINAL_REQUEST §R1 |
| 2 | SQLite Database & WAL | `better-sqlite3` connection, WAL mode, foreign keys, connection pooling | M1 | architecture.md |
| 3 | Schema Definition | DDL in `db/schema.sql` (`ADMIN_USER`, `SERVICE`, `SUBMISSION`, `SUBMISSION_NOTE`, `CHAT_*`) | M1 | architecture.md |
| 4 | Seeding Engine | `npm.cmd run seed` to populate admin credentials (.env) and 3 services (GST, ITR, PAN) | M1 | ORIGINAL_REQUEST §R1 |
| 5 | Environment & Feature Flags | `.env` configuration parsing, default fallbacks, `config/features.js` | M1 | architecture.md |
| 6 | Monochrome Design Tokens | CSS tokens (`tokens.css`): `--bg-0..2`, `--text-hi/lo`, `--ink`, `--line`, etc. | M2 | design.md |
| 7 | Typography Hierarchy | Playfair Display (headings) + Inter (body/UI), 7-step scale, eyebrow label | M2 | design.md |
| 8 | Spacing & Geometry System | 4-pt grid, max container 1200px, 4px/12px/999px radii, monochromatic shadows | M2 | design.md |
| 9 | Parallax Hero & Reduced Motion | 0.2x-0.6x translate3d parallax, disabled <768px and `prefers-reduced-motion` | M2 | design.md |
| 10 | Shared UI Components | Navbar (blur on scroll), footer, buttons, form controls, cards, badges | M2 | design.md |
| 11 | Master Layouts & Partials | EJS layouts (`layouts/main.ejs`, `partials/navbar.ejs`, `partials/footer.ejs`) | M3 | architecture.md |
| 12 | Home Page (`/`) | Hero, trust strip (15+ yrs, filings), services preview, why choose, process, CTA | M3 | design.md, prd.md |
| 13 | About Page (`/about`) | Biography, 15+ yrs experience, qualifications, career timeline, values, CTA | M3 | design.md, memory.md |
| 14 | Services Page (`/services`) | Detailed GST, Income Tax, PAN sections, document checklists, FAQ accordion | M3 | design.md, prd.md |
| 15 | Contact Page (`/contact`) | Office address (Mansa), phone, email, hours, map, contact form UI | M3 | memory.md, design.md |
| 16 | Branded Error Pages | 404 Not Found and 500 Server Error pages styled with design tokens | M3 | spec_miner_ui |
| 17 | Contact Form Handler | `POST /contact` endpoint accepting name, email, phone, service, message | M4 | ORIGINAL_REQUEST §R3 |
| 18 | Server-Side Validation | Validation of name, email format, 10-digit Indian phone, message length | M4 | architecture.md |
| 19 | Honeypot Spam Defense | Hidden `website` field rejected if filled by bots without DB insert | M4 | ORIGINAL_REQUEST §R3 |
| 20 | Rate Limiting | Rate limiting on contact submissions (5 req / 15 min per IP) | M4 | architecture.md |
| 21 | Salted IP Hashing | SHA-256 IP hashing with salt, zero raw IP stored in SQLite database | M4 | ORIGINAL_REQUEST §R3 |
| 22 | Parameterized SQLite Storage | Parameterized insert into `SUBMISSION` table returning success state | M4 | ORIGINAL_REQUEST §R3 |
| 23 | CSRF Protection | CSRF tokens generated and validated on all POST forms | M4, M5 | ORIGINAL_REQUEST §R5 |
| 24 | Admin Authentication | Bcrypt password check, `express-session`, session persistence | M5 | ORIGINAL_REQUEST §R4 |
| 25 | Session Timeout & Lockout | 30-min idle session expiration, 5 failed attempts lockout (15 min) | M5 | ORIGINAL_REQUEST §R4 |
| 26 | Admin Route Protection | Middleware redirecting unauthenticated requests to `/admin/login` | M5 | ORIGINAL_REQUEST §R4 |
| 27 | Dashboard Summary | Submission counts (Total, New, In-Progress, Closed) and latest items | M5 | ORIGINAL_REQUEST §R4 |
| 28 | Submissions List & Filter | Paginated table, status filtering (`new`, `in_progress`, `closed`), search | M5 | ORIGINAL_REQUEST §R4 |
| 29 | Submission Detail & Notes | View full submission details, change status, append notes to `SUBMISSION_NOTE`| M5 | architecture.md |
| 30 | CSV Export | RFC 4180 CSV export endpoint (`/admin/submissions/export.csv`) with formula safety| M5 | ORIGINAL_REQUEST §R4 |
| 31 | Security Suite Hardening | Helmet headers, secure cookies (`httpOnly`, `sameSite`), output escaping | M5 | ORIGINAL_REQUEST §R5 |
| 32 | Opaque-Box E2E Test Suite | Comprehensive Tiers 1-4 automated test runner & test suites | M-TEST | Dual Track |
| 33 | E2E Acceptance Pass | 100% pass rate across all E2E test tiers | M6 | Final Milestone |
| 34 | Adversarial Hardening | Tier 5 adversarial stress testing and coverage gap analysis | M6 | Final Milestone |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M-TEST | E2E Test Suite Track | Build automated opaque-box test runner & Tiers 1-4 tests (`TEST_READY.md`) | none | IN_PROGRESS |
| M1 | Scaffold & Foundation | Node/Express setup, DB connection, schema DDL, seed script, `.env`, config | none | DONE |
| M2 | Design System & Styling | Monochromatic CSS tokens, typography, 4-pt spacing, components CSS, parallax | M1 | PLANNED |
| M3 | Public Pages & Navigation | Home, About, Services, Contact, 404, 500 EJS views & controllers | M2 | PLANNED |
| M4 | Contact Form Backend & Storage | POST /contact, validation, honeypot, rate limit, IP hash, DB insert, CSRF | M1, M3 | PLANNED |
| M5 | Admin Panel & Security | Auth, session, lockout, dashboard, submissions CRUD, notes, CSV export, Helmet | M1, M4 | PLANNED |
| M6 | Final Integration & Hardening | Phase 1: 100% E2E test suite pass; Phase 2: Tier 5 adversarial hardening | M-TEST, M5 | PLANNED |

## Interface Contracts
### Public Routes ↔ Controllers
- `GET /` → `publicController.renderHome(req, res)`: Returns HTTP 200, renders `pages/home.ejs` with `services` list from DB.
- `GET /about` → `publicController.renderAbout(req, res)`: Returns HTTP 200, renders `pages/about.ejs`.
- `GET /services` → `publicController.renderServices(req, res)`: Returns HTTP 200, renders `pages/services.ejs` with full service definitions.
- `GET /contact` → `publicController.renderContact(req, res)`: Returns HTTP 200, renders `pages/contact.ejs` with CSRF token and service dropdown list.
- `GET /404` & `GET /500`: Standardized error view rendering.

### Contact Submission ↔ Database
- `POST /contact`:
  - Body: `{ name, email, phone, service_id, message, website (honeypot), _csrf }`
  - Validation:
    - `name`: 2-100 characters.
    - `email`: valid email format.
    - `phone`: valid 10-digit Indian phone (regex `^[6-9]\d{9}$`).
    - `message`: 10-2000 characters.
    - `website`: MUST BE EMPTY. If populated, silently reject or return 400 without DB insertion.
  - Processing:
    - IP Hash: `SHA-256(req.ip + process.env.IP_HASH_SALT)`
    - SQL: `INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, 'new', ?, datetime('now'))`
  - Response: HTTP 200/201 with success message card or JSON status `{ success: true, message: "Thank you..." }`.

### Admin Auth & Management ↔ Database
- `GET /admin/login` → Render login form with CSRF token.
- `POST /admin/login`:
  - Body: `{ email, password, _csrf }`
  - Logic: Rate-limit (5 attempts/15 min). Check lockout. Compare `bcrypt.compareSync(password, user.password_hash)`.
  - On success: Regenerate session, set `req.session.adminId = user.id`, reset failed attempts, redirect to `/admin`.
- `GET /admin` → Redirect to `/admin/submissions` or render dashboard metrics.
- `GET /admin/submissions?status=&page=&q=`:
  - Query parameters for status filtering, pagination (10 per page), and search terms.
  - Returns submissions list, pagination metadata, counts.
- `POST /admin/submissions/:id/status`:
  - Body: `{ status, _csrf }` -> Updates `status` in `SUBMISSION`.
- `POST /admin/submissions/:id/notes`:
  - Body: `{ note, _csrf }` -> Inserts into `SUBMISSION_NOTE (submission_id, admin_id, note, created_at)`.
- `GET /admin/submissions/export.csv`:
  - Query or full export of submissions in CSV format.
  - Headers: `ID,Name,Email,Phone,Service,Status,Created At`.
  - Defense against formula injection: Prefix `=, +, -, @` with `'`.
