# Technical Specification Report: Architecture, Backend, Database, Auth & Security

**Project:** Ajay Singla Accounting Portfolio Website  
**Scope:** Phases 1 to 5 (Foundation, Design System, Public Pages, Contact Form + Storage, Admin Panel)  
**Author:** `spec_miner_arch_1` (Specification Miner)  
**Date:** 2026-10-07  
**Authoritative Sources:**
- `d:/website ajay/.agents/teamwork/ORIGINAL_REQUEST.md`
- `d:/website ajay/architecture.md`
- `d:/website ajay/prd.md`
- `d:/website ajay/memory.md`
- `d:/website ajay/phase.md`
- `d:/website ajay/design.md`

---

## 1. Executive Summary & Architectural Overview

The application is a Node.js + Express multi-page application (MPA) rendered server-side using EJS templates with vanilla CSS and client-side JavaScript. The data persistence layer is backed by a local SQLite file managed via `better-sqlite3` and abstracted behind a clean repository pattern (`db/repositories/*`). The architecture follows a strict 5-layer separation of concerns:
```
Browser → Express Routes → Controllers → Services → Repositories → SQLite Database
```
The codebase is structured around modular feature folders (`modules/`) with a centralized feature-flagging system (`config/features.js`) enabling plug-and-play future enhancements (such as chatbot, document checklists, and booking) without touching core routes.

---

## 2. Directory Structure & Server Configuration

### 2.1 File & Directory Layout
```
d:/website ajay/
├── server.js                        # Main application entry point & Express server bootstrap
├── package.json                     # Dependencies, scripts (start, seed, test)
├── .env                             # Local environment variables
├── .env.example                     # Template environment variables
├── config/
│   ├── index.js                     # Centralized config loader (reads process.env)
│   └── features.js                  # Feature toggle flags (chatbot, analytics, etc.)
├── db/
│   ├── connection.js                # SQLite singleton connection via better-sqlite3 (WAL mode)
│   ├── schema.sql                   # DDL table creation and index definitions
│   ├── seed.js                      # Database seeder (admin credentials & 3 core services)
│   └── repositories/                # Data access layer
│       ├── adminRepository.js       # Admin user lookup and verification
│       ├── serviceRepository.js     # Service queries (listing, lookup by ID/slug)
│       └── submissionRepository.js  # Contact submission creation, pagination, filtering, notes
├── middleware/
│   ├── auth.js                      # Session authentication & route protection middleware
│   ├── csrf.js                      # CSRF token generation & validation middleware
│   ├── rateLimit.js                 # Rate limiters for contact form & admin login
│   ├── security.js                  # Helmet configuration & security headers
│   └── validate.js                  # Request validation helper / middleware
├── modules/
│   ├── contact/                     # Contact enquiry module (routes, controller, service)
│   │   ├── contactRoutes.js
│   │   ├── contactController.js
│   │   └── contactService.js
│   ├── admin/                       # Admin management module (routes, controller, service)
│   │   ├── adminRoutes.js
│   │   ├── adminController.js
│   │   └── adminService.js
│   └── chatbot/                     # MVP FAQ rule-based chatbot (vectorless)
│       ├── chatbotRoutes.js
│       ├── chatbotController.js
│       ├── faq.json
│       └── engine.js
├── views/
│   ├── layouts/
│   │   └── main.ejs                 # Base HTML layout (head, navbar, footer, scripts)
│   ├── partials/
│   │   ├── navbar.ejs               # Header navigation
│   │   ├── footer.ejs               # Footer with contact details & legal disclaimer
│   │   ├── flash.ejs                # Success / error notification banners
│   │   └── chatbotWidget.ejs        # Floating FAQ chatbot widget
│   ├── pages/
│   │   ├── home.ejs                 # Home page (hero, trust strip, preview, process)
│   │   ├── about.ejs                # About page (bio, experience, timeline, values)
│   │   ├── services.ejs             # Services page (GST, ITR, PAN detailed breakdowns)
│   │   ├── contact.ejs              # Contact form & location information
│   │   ├── 404.ejs                  # Not found error page
│   │   └── 500.ejs                  # Internal server error page
│   └── admin/
│       ├── login.ejs                # Admin login form
│       ├── dashboard.ejs            # Submissions table, search, filters, metrics
│       └── detail.ejs               # Submission detail view, status editor, notes history
└── public/
    ├── css/
    │   ├── main.css                 # Design tokens, typography, grid, utilities
    │   └── admin.css                # Minimal clean light theme for admin panel
    ├── js/
    │   ├── main.js                  # Parallax, mobile nav, form submission, reveal observers
    │   └── admin.js                 # Admin panel interactivity, note submission
    └── img/                         # Grayscale icons, placeholders, static assets
```

### 2.2 Server Entry Point (`server.js`) Specifications
- **Framework:** Express 4.x / 5.x.
- **View Engine:** EJS (`app.set('view engine', 'ejs')`), views directory set to `views/`.
- **Static Assets:** Express static middleware mounted on `/public` (serving CSS, JS, images).
- **Body Parsing:** `express.urlencoded({ extended: true, limit: '10kb' })` and `express.json({ limit: '10kb' })`.
- **Session Store:** `express-session` configured with secure cookie attributes.
- **Port:** Configurable via `process.env.PORT || 3000`.
- **Database Initialization:** Auto-check and verify SQLite schema on boot, ensure WAL mode is active.

### 2.3 Environment Variables (`.env`)
| Variable | Required | Default | Purpose / Specification |
|---|---|---|---|
| `PORT` | Optional | `3000` | Port on which the HTTP server listens |
| `NODE_ENV` | Optional | `development` | Environment mode (`development` or `production`) |
| `SESSION_SECRET` | **Required** | *Must be generated* | Cryptographic secret for signing session cookies (min 32 chars) |
| `ADMIN_EMAIL` | **Required** | `ajay30@gmail.com` | Primary admin email / username for login |
| `ADMIN_PASSWORD` | **Required** | *Set during setup* | Initial plaintext admin password used by `npm run seed` |
| `IP_HASH_SALT` | Optional | Falls back to `SESSION_SECRET` | Salt string used to SHA-256 hash client IP addresses |
| `GA4_MEASUREMENT_ID`| Optional | `""` | Google Analytics 4 measurement tag ID (e.g. `G-XXXXXXXXXX`) |
| `DB_PATH` | Optional | `./db/portfolio.db` | Relative or absolute path to the SQLite database file |

---

## 3. Database Specifications (SQLite + better-sqlite3)

### 3.1 Connection & Pragma Configuration
The SQLite database connection (`db/connection.js`) uses `better-sqlite3` (synchronous, in-process C-binding):
- **WAL Mode:** Executed immediately upon opening connection:  
  `PRAGMA journal_mode = WAL;`  
  *Rationale:* Write-Ahead Logging allows concurrent readers during writes and significantly boosts throughput.
- **Foreign Key Enforcement:**  
  `PRAGMA foreign_keys = ON;`  
  *Rationale:* Enforces relational integrity on `service_id`, `submission_id`, and `admin_id`.
- **Synchronous Mode:**  
  `PRAGMA synchronous = NORMAL;` (balances durability and speed in WAL mode).

### 3.2 Schema Definition (`db/schema.sql`)
The schema implements 6 tables:

```sql
-- 1. Admin Users Table
CREATE TABLE IF NOT EXISTS ADMIN_USER (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS SERVICE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- 3. Contact Form Submissions Table
CREATE TABLE IF NOT EXISTS SUBMISSION (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_id INTEGER,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'replied', 'archived')),
    ip_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES SERVICE(id) ON DELETE SET NULL
);

-- 4. Submission Notes Table (Admin follow-ups)
CREATE TABLE IF NOT EXISTS SUBMISSION_NOTE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES SUBMISSION(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES ADMIN_USER(id) ON DELETE RESTRICT
);

-- 5. Chatbot Sessions Table (MVP / Extension)
CREATE TABLE IF NOT EXISTS CHAT_SESSION (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Chatbot Messages Table
CREATE TABLE IF NOT EXISTS CHAT_MESSAGE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'bot')),
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES CHAT_SESSION(id) ON DELETE CASCADE
);

-- Indexes for performance & query optimization
CREATE INDEX IF NOT EXISTS idx_submission_status ON SUBMISSION(status);
CREATE INDEX IF NOT EXISTS idx_submission_created_at ON SUBMISSION(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_service_id ON SUBMISSION(service_id);
CREATE INDEX IF NOT EXISTS idx_submission_note_submission_id ON SUBMISSION_NOTE(submission_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_session_id ON CHAT_MESSAGE(session_id);
```

### 3.3 Seeding Specifications (`npm run seed`)
Executed via `node db/seed.js`:
1. **Admin User Seeding:**
   - Reads `ADMIN_EMAIL` (defaulting to `ajay30@gmail.com`) and `ADMIN_PASSWORD` from `.env`.
   - Hashes `ADMIN_PASSWORD` using `bcrypt.hash(password, 12)`.
   - Performs idempotent upsert: `INSERT INTO ADMIN_USER (username, password_hash) VALUES (?, ?) ON CONFLICT(username) DO UPDATE SET password_hash = excluded.password_hash;` or `INSERT OR IGNORE`.
2. **Core Services Seeding:**
   - Pre-populates the 3 core offerings identified in the PRD and requirements:
     1. **GST:** `slug: 'gst'`, `title: 'GST Registration & Returns'`, `summary: 'Comprehensive GST registration, monthly/quarterly return filing (GSTR-1, GSTR-3B), and annual compliance for businesses.'`, `sort_order: 1`.
     2. **Income Tax:** `slug: 'income-tax'`, `title: 'Income Tax Return Filing'`, `summary: 'Expert ITR filing for salaried individuals, freelancers, professionals, and small businesses with deduction optimization.'`, `sort_order: 2`.
     3. **PAN:** `slug: 'pan'`, `title: 'PAN Card Applications'`, `summary: 'Assistance with new PAN card applications, data corrections, name changes, and duplicate reprint requests.'`, `sort_order: 3`.
   - Inserts using `INSERT OR IGNORE INTO SERVICE (slug, title, summary, sort_order) VALUES (?, ?, ?, ?)`.

---

## 4. Contact Form Backend Specifications

### 4.1 Endpoint Definition
- **Route:** `POST /contact`
- **Content-Type:** `application/x-www-form-urlencoded` or `application/json`

### 4.2 Server-Side Validation Rules
| Field | Type | Required | Constraints / Validation Logic | Error Message |
|---|---|---|---|---|
| `name` | String | Yes | Trimmed; length 2–100 chars; must contain letters; reject script tags/null bytes | "Please enter your full name (2 to 100 characters)." |
| `email` | String | Yes | Trimmed; valid email format RFC 5322 (`validator.isEmail`); max 100 chars | "Please provide a valid email address." |
| `phone` | String | Yes | Trimmed; exactly 10 digits; standard Indian mobile regex `/^[6-9]\d{9}$/` | "Please enter a valid 10-digit mobile number." |
| `service_id` | Integer | No | If provided: must parse as integer matching a valid ID in `SERVICE` table | "Please select a valid service." |
| `message` | String | Yes | Trimmed; min 10 chars, max 2000 chars | "Please write a message between 10 and 2000 characters." |
| `consent` | String/Bool | Yes | Must be checked (`'on'` or `'true'`) per design.md privacy compliance | "You must agree to the privacy policy to submit." |
| `_csrf` | String | Yes | Must match active session/cookie CSRF token | "Invalid session security token. Please refresh." |

### 4.3 Honeypot Field Specification
- **Form Field Name:** `website` (or `contact_fax` / `company_url`)
- **Hidden Styling in HTML:**
  ```html
  <div style="display:none !important; position:absolute; left:-9999px; width:0; height:0; overflow:hidden;" aria-hidden="true">
    <label for="website">Leave this field blank</label>
    <input type="text" name="website" id="website" tabindex="-1" autocomplete="off" value="" />
  </div>
  ```
- **Rejection Behavior:**
  - If `req.body.website` is present and non-empty (after trim):
  - Request is flagged as automated bot spam.
  - Immediate response: HTTP 400 Bad Request with generic rejection ("Submission rejected as spam"), or silent fake success response to prevent bot adaptation. Per acceptance criteria: *"Submitting a contact form with the honeypot field filled is rejected."* Returning HTTP 400 satisfies the test assertion.

### 4.4 Rate Limiting Specification
- **Engine:** `express-rate-limit`
- **Mount Path:** `POST /contact`
- **Window:** 15 minutes (`15 * 60 * 1000` ms)
- **Max Requests:** 5 submissions per IP within the 15-minute window.
- **Response on Exceeded:** HTTP 429 Too Many Requests:
  - Header: `Retry-After: 900`
  - HTML Response / JSON: `"Too many enquiries submitted from your IP address. Please wait 15 minutes before submitting again."`

### 4.5 IP Hashing Specification (Zero Raw IP Storage)
- **Raw IP Capture:** Extracted from `req.ip` or first entry of `req.headers['x-forwarded-for']`.
- **Hashing Algorithm:** SHA-256 with secret salt.
  ```javascript
  const crypto = require('crypto');
  const salt = process.env.IP_HASH_SALT || process.env.SESSION_SECRET || 'ajay-secure-salt';
  const ipHash = crypto.createHash('sha256').update(rawIp + salt).digest('hex');
  ```
- **Storage:** Only `ipHash` (64-character hexadecimal string) is stored in the `SUBMISSION.ip_hash` column.
- **Privacy Rule:** Under no circumstances is the plaintext raw IP logged or persisted to SQLite.

### 4.6 Parameterized SQL Insertion
Executed via `better-sqlite3` prepared statement:
```javascript
const stmt = db.prepare(`
  INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash, created_at)
  VALUES (?, ?, ?, ?, ?, 'new', ?, CURRENT_TIMESTAMP)
`);
const info = stmt.run(name, email, phone, serviceId || null, message, ipHash);
```
Guarantees full protection against SQL injection attacks.

### 4.7 Response States & Analytics Triggers
1. **Validation Failure (HTTP 400):**
   - Re-renders `views/pages/contact.ejs` with HTTP status 400.
   - Passes `errors` map and re-populates user's input `values` (excluding honeypot and CSRF token) so the visitor does not retype their message.
2. **Success (HTTP 200 or Redirect):**
   - HTML Form: Renders contact page with success banner (`success: true`) or redirects with flash message.
   - JSON Client: Returns HTTP 201 `{ success: true, message: 'Your enquiry has been received.' }`.
   - Client JS executes GA4 event: `gtag('event', 'generate_lead', { event_category: 'Contact', event_label: serviceTitle });`.

---

## 5. Admin Panel & Authentication Specifications

### 5.1 Route Inventory & Access Control
| Route | Method | Access | Functionality |
|---|---|---|---|
| `/admin` | GET | Protected | Redirects to `/admin/submissions` or renders Dashboard |
| `/admin/login` | GET | Public | Renders admin login form; redirects to `/admin` if already authenticated |
| `/admin/login` | POST | Public | Validates admin credentials, creates session, enforces lockout |
| `/admin/logout` | POST / GET | Protected | Destroys session, clears cookie, redirects to `/admin/login` |
| `/admin/submissions` | GET | Protected | Lists submissions with pagination, search, status filter, and counts |
| `/admin/submissions/:id` | GET | Protected | View submission detail and chronological notes |
| `/admin/submissions/:id/status`| POST | Protected | Update submission status (`new`, `read`, `replied`, `archived`) |
| `/admin/submissions/:id/notes` | POST | Protected | Append follow-up note to submission |
| `/admin/submissions/export.csv`| GET | Protected | Stream/download RFC 4180 CSV export of submissions |

### 5.2 Authentication & Session Architecture
1. **Password Hashing:**
   - Library: `bcrypt` (or `bcryptjs`).
   - Cost Factor (Rounds): 12.
   - Comparison: `bcrypt.compare(passwordInput, user.password_hash)`.
2. **Session Configuration (`express-session`):**
   - `secret`: `process.env.SESSION_SECRET`.
   - `name`: `as_admin_sid` (custom name to obscure Express defaults).
   - `resave`: `false`.
   - `saveUninitialized`: `false`.
   - `cookie.maxAge`: `30 * 60 * 1000` (30 minutes idle timeout).
   - `cookie.httpOnly`: `true` (prohibits JavaScript document.cookie access).
   - `cookie.sameSite`: `'lax'` (CSRF mitigation).
   - `cookie.secure`: `process.env.NODE_ENV === 'production'`.
   - `rolling`: `true` (resets expiration timer on every active admin request).
3. **Session Fixation Prevention:**
   - On successful authentication: call `req.session.regenerate()` prior to storing `adminId` and `username`.
4. **Brute-Force Login Lockout:**
   - Dedicated rate limiter on `POST /admin/login`: max 5 attempts per IP per 15 minutes.
   - Lockout state tracked in memory/cache by username/IP:
     - After 5 consecutive failed logins, login endpoint blocks further attempts for 15 minutes with HTTP 429: *"Too many failed login attempts. Account temporarily locked for 15 minutes."*
     - Successful login clears failed attempt count.
     - Always returns generic error: *"Invalid username or password"* to avoid username enumeration.

### 5.3 Protected Route Middleware (`middleware/auth.js`)
```javascript
function requireAuth(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.redirect('/admin/login');
}
```

### 5.4 Dashboard & Submissions List View
- **Dashboard Metrics (Counts):**
  - Total Submissions: `SELECT COUNT(*) AS total FROM SUBMISSION`
  - New Submissions: `SELECT COUNT(*) AS new_count FROM SUBMISSION WHERE status = 'new'`
  - Submissions This Week: `SELECT COUNT(*) AS week_count FROM SUBMISSION WHERE created_at >= datetime('now', '-7 days')`
  - Replied Submissions: `SELECT COUNT(*) AS replied_count FROM SUBMISSION WHERE status = 'replied'`
  - Archived Submissions: `SELECT COUNT(*) AS archived_count FROM SUBMISSION WHERE status = 'archived'`
- **List & Filtering Parameters:**
  - `page`: 1-based integer (default `1`).
  - `limit`: items per page (default `10` or `20`).
  - `status`: filter enum (`'all'`, `'new'`, `'read'`, `'replied'`, `'archived'`).
  - `search`: search string matching `name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?`.
- **Query Construction:**
  - Utilizes parameterized clauses: `WHERE (status = ? OR ? = 'all') AND (name LIKE ? OR email LIKE ? OR phone LIKE ? OR message LIKE ?) ORDER BY created_at DESC LIMIT ? OFFSET ?`.
- **Display Elements:**
  - Table columns: Date, Name, Phone (`tel:` action), Service Name, Status Chip (`new` = bold dark outline, `read` = grey, `replied` = soft grey, `archived` = muted), Actions ("View").

### 5.5 Submission Detail & Notes View
- **Detail Elements:**
  - Full Name, Email (`mailto:` link), Phone (`tel:` link), Service requested, Submission Timestamp, Hashed IP, Full Enquiry Message.
  - Status Changer: Dropdown or buttons to change status to `new`, `read`, `replied`, or `archived`.
  - Notes History: Chronological list of admin notes showing timestamp, author username, and note content.
  - Add Note Form: Textarea + submit button (`POST /admin/submissions/:id/notes`).

### 5.6 CSV Export Specifications (`GET /admin/submissions/export.csv`)
- **Headers Sent:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="submissions-YYYY-MM-DD.csv"`
- **Columns Exported:**
  `ID,Date,Name,Email,Phone,Service,Status,Message`
- **RFC 4180 Escaping & Sanitization:**
  - Fields containing commas, line breaks (`\n`, `\r`), or quotes are wrapped in double quotes `"..."`.
  - Inner double quotes are escaped as `""`.
  - **CSV Formula Injection Defense:** If a field starts with formula trigger characters (`=`, `+`, `-`, `@`), a leading single quote `'` is prepended so spreadsheet applications (Excel, LibreOffice) do not execute formulas.

---

## 6. Security Suite Specifications

### 6.1 Helmet Configuration (`middleware/security.js`)
Configures HTTP response security headers:
- `Content-Security-Policy`:
  - `default-src: ["'self'"]`
  - `script-src: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"]`
  - `style-src: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"]`
  - `font-src: ["'self'", "https://fonts.gstatic.com"]`
  - `img-src: ["'self'", "data:", "https:"]`
  - `connect-src: ["'self'", "https://www.google-analytics.com"]`
- `X-Frame-Options`: `DENY` (prevents clickjacking)
- `X-Content-Type-Options`: `nosniff` (prevents MIME type sniffing)
- `Strict-Transport-Security`: `max-age=15552000; includeSubDomains` (enforced when in production)
- `Referrer-Policy`: `strict-origin-when-cross-origin`

### 6.2 CSRF Protection Specification
- Every HTML form rendered (`/contact`, `/admin/login`, `/admin/submissions/:id/status`, `/admin/submissions/:id/notes`, `/admin/logout`) must include a hidden CSRF token input:
  `<input type="hidden" name="_csrf" value="<%= csrfToken %>">`
- CSRF middleware validates `_csrf` against the session or signed double-submit cookie.
- Rejection of invalid/missing token: HTTP 403 Forbidden with clear diagnostic ("CSRF token validation failed").

### 6.3 EJS Output Escaping
- Strict rule: All dynamic user-supplied data (`submission.name`, `submission.email`, `submission.message`, `note.note`) must be rendered using `<%= %>` which automatically escapes HTML entities (`&`, `<`, `>`, `"`, `'`).
- The unescaped tag `<%- %>` is strictly prohibited for any user input or database text.

### 6.4 Cookie Security
- `httpOnly: true` (inaccessible to `document.cookie`).
- `sameSite: 'lax'` (protects against cross-site request forgery).
- `secure: process.env.NODE_ENV === 'production'` (transferred only via HTTPS in production).

### 6.5 Error Handling Middleware
- **404 Handler:** Catch-all route handler for non-existent paths renders `views/pages/404.ejs` with HTTP 404 status.
- **Centralized 500 Handler:** `(err, req, res, next)`:
  - Development mode: logs full stack trace to console.
  - Production mode: logs error internally, hides stack trace from client, renders `views/pages/500.ejs` with friendly generic message.
  - Special handling for CSRF errors: returns HTTP 403 with `views/pages/error.ejs` ("Invalid session or form expired. Please refresh and try again.").

---

## 7. Features Discovered & Specification Matrix

## Features Discovered
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Server Architecture | Express Server Initialization | Node.js Express server listening on configured port | `PORT`, `NODE_ENV` | HTTP server listening on port 3000 | Port collision / bind error triggers unhandled exception or exit | `ORIGINAL_REQUEST.md`, `architecture.md` |
| 2 | Server Architecture | Modular Feature Structure | Feature modules organized in `modules/` with routes, controller, service | Module registrations in `server.js` | Modular HTTP route handlers | Missing module throws module resolution error | `architecture.md` §3 |
| 3 | Server Architecture | Feature Flagging Configuration | Feature toggles defined in `config/features.js` | Feature flags (`chatbot: true`, `analytics: true`) | Conditioned route/UI activation | Unknown flag defaults to false | `architecture.md` §3, `memory.md` |
| 4 | Database | SQLite WAL Mode Connection | In-process SQLite connection via `better-sqlite3` in WAL mode | `DB_PATH`, `PRAGMA journal_mode = WAL` | Database connection instance | File permission / lock failure throws error | `architecture.md`, `prd.md`, `phase.md` |
| 5 | Database | Foreign Key Enforcement | Enforces relational integrity across tables | `PRAGMA foreign_keys = ON` | FK constraints enabled | Constraint violations throw SQLite constraint error | `architecture.md` §4, `db/schema.sql` |
| 6 | Database | Schema Initialization | DDL execution creating tables and indexes | `db/schema.sql` | 6 SQLite tables & 5 indexes created | Syntax error in SQL throws schema error | `ORIGINAL_REQUEST.md` R1, `architecture.md` §4 |
| 7 | Database | Seeding Script (`npm run seed`) | Populates initial admin user and 3 core services | `.env` credentials, services data | Seeded rows in `ADMIN_USER` and `SERVICE` | Missing env vars fallback to default or error | `ORIGINAL_REQUEST.md` R1, `phase.md` |
| 8 | Database | Repository Pattern Abstraction | Separation of SQL queries from business logic | Method arguments (params) | Domain entities / plain objects | Query errors caught and wrapped | `architecture.md` §1, `memory.md` |
| 9 | Contact Form | Public Contact Submission | Form endpoint accepting visitor enquiries | `name`, `email`, `phone`, `service_id`, `message`, `consent`, `_csrf` | Success message / HTTP 201 / DB row | Validation failure returns HTTP 400 with field errors | `ORIGINAL_REQUEST.md` R3, `architecture.md` §7 |
| 10 | Contact Form | Server-Side Validation | String validation for name, email format, 10-digit phone, message | Request body parameters | Validation pass boolean / error array | Returns 400 Bad Request, re-renders form with values | `phase.md` Phase 4, `prd.md` §5 |
| 11 | Contact Form | Honeypot Spam Protection | Hidden input field `website` to detect and block bots | `website` honeypot field | Allows processing if empty | Non-empty input triggers 400 Bad Request rejection | `ORIGINAL_REQUEST.md` R3, `architecture.md` §9 |
| 12 | Contact Form | Enquiry Rate Limiting | IP-based request throttling on `/contact` | Client IP | Request pass or HTTP 429 response | Exceeding 5 requests/15m returns 429 Too Many Requests | `ORIGINAL_REQUEST.md` R3, `architecture.md` §9 |
| 13 | Contact Form | IP Hashing | One-way SHA-256 IP hashing with secret salt | Client IP (`req.ip`), `IP_HASH_SALT` | 64-char hex hash stored in `SUBMISSION.ip_hash` | Fallback to session secret if salt missing | `ORIGINAL_REQUEST.md` R3, `phase.md` Phase 4 |
| 14 | Contact Form | Parameterized SQL Insertion | Safe insertion into `SUBMISSION` table | Sanitized form values | Created row ID | SQLite constraint violation returns error | `ORIGINAL_REQUEST.md` R3, `architecture.md` §9 |
| 15 | Contact Form | CSRF Form Protection | Token verification on form submission | `_csrf` form field | Validated request | Missing or invalid token returns HTTP 403 Forbidden | `ORIGINAL_REQUEST.md` R5, `architecture.md` §9 |
| 16 | Admin Panel | Admin Login Page | Renders login view at `/admin/login` | GET `/admin/login` | Login HTML view with CSRF token | Redirects to `/admin` if already logged in | `architecture.md` §7, `design.md` §5 |
| 17 | Admin Panel | Admin Credential Authentication | Verifies admin email/username and bcrypt password | `username`, `password`, `_csrf` | Regenerated session + redirect to `/admin` | Invalid credentials return 401 with generic error | `ORIGINAL_REQUEST.md` R4, `phase.md` Phase 5 |
| 18 | Admin Panel | Brute-Force Login Lockout | Rate limiting and attempt lockout on `/admin/login` | Failed login attempts | Account lockout timer (15 mins) | >5 failed attempts returns HTTP 429 lockout | `phase.md` Phase 5, `ORIGINAL_REQUEST.md` R4 |
| 19 | Admin Panel | Session Expiration (30 min) | Automatic expiration of idle admin sessions | Rolling session timer | Invalidated session after 30 mins idle | Accessing admin after timeout redirects to login | `ORIGINAL_REQUEST.md` R4, `phase.md` Phase 5 |
| 20 | Admin Panel | Admin Authentication Guard | Middleware intercepting unauthenticated admin access | Session cookie | Allows request to `/admin/*` | Missing session redirects to `/admin/login` | `ORIGINAL_REQUEST.md` R4, Acceptance Criteria |
| 21 | Admin Panel | Admin Logout | Destroys admin session and clears cookies | POST or GET `/admin/logout` | Session destroyed, redirect to `/admin/login` | Session destruction failure handled cleanly | `architecture.md` §7 |
| 22 | Admin Panel | Dashboard Counts View | Aggregated metric counters on dashboard | Database query | Total, New, This Week, Replied, Archived counts | Database error falls back to zeros or 500 | `ORIGINAL_REQUEST.md` R4, `design.md` §5 |
| 23 | Admin Panel | Submissions List & Pagination | Paginated table of enquiries | `page`, `limit` query params | Enquiries list, pagination metadata | Invalid page defaults to page 1 | `ORIGINAL_REQUEST.md` R4, `architecture.md` §7 |
| 24 | Admin Panel | Submissions Status Filtering | Filter list by status | `status=all\|new\|read\|replied\|archived` | Filtered enquiries list | Invalid status parameter defaults to 'all' | `ORIGINAL_REQUEST.md` R4, `design.md` §5 |
| 25 | Admin Panel | Submissions Search | Search enquiries by name, email, phone, or message | `search` query string | Matching enquiries | Malformed search string escaped safely in SQL LIKE | `ORIGINAL_REQUEST.md` R4, `design.md` §5 |
| 26 | Admin Panel | Submission Detail View | Comprehensive enquiry view with customer details | `id` route param | Submission detail view + notes list | Non-existent ID returns HTTP 404 | `ORIGINAL_REQUEST.md` R4, `architecture.md` §7 |
| 27 | Admin Panel | Submission Status Update | Changes enquiry status (`new`, `read`, `replied`, etc.) | `status`, `_csrf` | Updated record + redirect to detail view | Invalid status returns 400 Bad Request | `ORIGINAL_REQUEST.md` R4, `architecture.md` §6 |
| 28 | Admin Panel | Submission Admin Notes | Append internal follow-up notes to submission | `note`, `_csrf`, `req.session.adminId` | Created `SUBMISSION_NOTE` record | Empty note returns 400 Bad Request | `architecture.md` §4, `phase.md` Phase 1 |
| 29 | Admin Panel | CSV Data Export | Download all or filtered submissions as RFC 4180 CSV | GET `/admin/submissions/export.csv` | Downloadable CSV file with sanitized values | Export failure returns HTTP 500 | `ORIGINAL_REQUEST.md` R4, `architecture.md` §7 |
| 30 | Security Suite | Helmet Security Headers | Applies secure HTTP response headers | HTTP requests | HSTS, CSP, X-Frame-Options, X-Content-Type | Misconfigured CSP logs console warning | `ORIGINAL_REQUEST.md` R5, `architecture.md` §9 |
| 31 | Security Suite | Secure Cookie Attributes | Enforces HttpOnly, SameSite, and Secure flags | `express-session` cookie settings | Protected session cookie | In dev (HTTP), secure flag is disabled | `ORIGINAL_REQUEST.md` R5, `architecture.md` §9 |
| 32 | Security Suite | Output Escaping in EJS | Automatic HTML entity escaping | Template variables | Clean HTML without script execution | Unescaped output `<%- %>` strictly forbidden | `ORIGINAL_REQUEST.md` R5, `architecture.md` §9 |
| 33 | Security Suite | Centralized Error Handling | 404 and 500 error pages without stack leaks | Unhandled errors / 404 routes | Error template response | In production, detailed errors suppressed | `prd.md` §6, `phase.md` Phase 8 |
| 34 | Public UI Backend | Public Pages Routing | Renders Home, About, Services, Contact | GET `/`, `/about`, `/services`, `/contact` | HTTP 200 EJS views | Route not found falls to 404 handler | `ORIGINAL_REQUEST.md` R2, Acceptance Criteria |
| 35 | Public UI Backend | Dynamic Services Data | Feeds active services from DB to Services view | Database query on `SERVICE` table | Rendered services sections & select options | Fallback to hardcoded services if DB empty | `design.md` §5 (Services) |
| 36 | Extension / Chatbot | MVP FAQ Chatbot Endpoint | Rule-based vectorless keyword/intent matching | `POST /api/chat`, `text`, `session_token` | JSON `{ reply: string }` | No match returns fallback + link to contact form | `architecture.md` §8, `prd.md` §5 |

---

## 8. Edge Cases & Boundary Behaviors

## Edge Cases
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Contact Validation | Name containing emojis or non-ASCII scripts (e.g. Punjabi/Hindi "ਅਜੈ" / "अजय") | Validation allows Unicode letters if using inclusive regex or standard string length check (2–100 chars); rejects if strictly restricted to ASCII regex. Recommended: allow all valid unicode letters. |
| 2 | Contact Validation | Phone with international formatting (e.g. `+91 9988383380`, `99883-83380`) | Phone sanitizer strips spaces, dashes, parentheses, and leading `+91` or `0` before asserting exactly 10 digits (`/^[6-9]\d{9}$/`). |
| 3 | Contact Validation | Email with trailing spaces or uppercase characters (e.g. ` User@Example.COM `) | Sanitizer trims whitespace and converts to lower-case before validating via `validator.isEmail` and storing. |
| 4 | Contact Validation | Message exceeding 2000 characters | Triggers validation error: "Message must not exceed 2000 characters." Prevents database payload bloat. |
| 5 | Contact Validation | Missing or unchecked consent checkbox | Triggers validation error: "You must agree to the privacy policy to submit." |
| 6 | Contact Honeypot | Honeypot field filled with whitespace only (`"   "`) | Sanitizer trims input; if length > 0, triggers honeypot rejection (HTTP 400 or silent rejection). |
| 7 | Contact Honeypot | Screen reader user or automated autofill fills honeypot | Autocomplete is explicitly disabled (`autocomplete="off"`), field has `tabindex="-1"` and `aria-hidden="true"` with clear label warning to minimize accidental user entry. |
| 8 | Rate Limiting | Behind a reverse proxy (Nginx / Cloudflare / Render) | Express must enable `app.set('trust proxy', 1)` so `req.ip` resolves to the client's public IP rather than the proxy internal IP (which would throttle all users globally). |
| 9 | IP Hashing | IPv6 client address (e.g. `2001:0db8:85a3::8a2e:0370:7334`) | Formats and hashes IPv6 string properly with salt; produces consistent 64-char hex SHA-256 hash. |
| 10 | Admin Auth | Password with leading/trailing spaces or special characters | Handled safely by bcrypt without truncation (up to 72 bytes); no string modification to passwords. |
| 11 | Admin Lockout | Repeated failed logins across multiple IP addresses for single user | Both IP and username failure attempts are tracked; account locks after 5 consecutive failures regardless of IP rotation. |
| 12 | Admin Session | Admin tab remains open idle for 31 minutes | Session cookie expires on server (`maxAge: 30 * 60 * 1000`). Next interaction redirects to `/admin/login` with flash: "Session expired. Please log in again." |
| 13 | Admin Session | Admin logs in from two distinct browsers simultaneously | Each browser establishes independent valid session; logging out of one does not invalidate the other unless session revocation is explicitly enforced. |
| 14 | Admin Submissions Search | Search string with SQL wildcard characters (`%`, `_`, `\`) | Query builder properly escapes `%` and `_` in `LIKE` expressions or uses parameterized queries to avoid wildcard injection. |
| 15 | Admin Submissions Pagination | Negative page number or `page=99999` beyond total records | Page <= 0 defaults to page 1; page > totalPages displays empty table with "No submissions found" and valid pagination controls back to page 1. |
| 16 | Admin CSV Export | Submission message containing quotes, commas, and line breaks | Encapsulated in double quotes; inner double quotes replaced with `""`; line breaks preserved within quoted string per RFC 4180. |
| 17 | Admin CSV Export | Enquiry message starting with `=SUM(A1:A10)` or `@cmd` | Prepends `'` (single quote) to sanitize formula injection and protect admin spreadsheets from CSV code execution. |
| 18 | Database Integrity | Submission attempted with deleted/invalid `service_id` | Foreign key constraint on `SUBMISSION(service_id)` has `ON DELETE SET NULL`. Invalid service_id during insert throws FK constraint error; backend validation prevents invalid service_id prior to SQL execution. |
| 19 | Database Concurrency | High-concurrency simultaneous contact submissions | SQLite WAL mode (`PRAGMA journal_mode = WAL;`) allows multiple readers during writes and queues synchronous writes safely without `SQLITE_BUSY` lock errors. |
| 20 | CSRF Token | Form submitted in duplicate tab with refreshed token | Submitting with stale token returns HTTP 403 Forbidden with prompt to refresh page. |
| 21 | XSS Payload in Input | Submissions containing `<script>alert(1)</script>` or `onload=...` | Stored in SQLite as raw sanitized text, but rendered in EJS exclusively via `<%= %>` which escapes HTML entities (`&lt;script&gt;...`), neutralizing XSS completely. |
| 22 | Seeding Idempotency | `npm run seed` executed repeatedly on existing database | Runs `INSERT OR IGNORE` or `ON CONFLICT DO UPDATE` ensuring admin user and initial services are not duplicated and IDs remain consistent. |

---

## 9. Verification & Acceptance Criteria Mapping

| Acceptance Criterion | Verification Method | Status |
|---|---|---|
| `npm install && npm run seed && npm start` starts server on port 3000 | Verify `package.json` scripts (`start: "node server.js"`, `seed: "node db/seed.js"`), port config, and successful DB initialization | Fully Specified |
| Public pages (`/`, `/about`, `/services`, `/contact`) return HTTP 200 | Verify route handlers in `server.js` / `modules/contact/` render respective EJS views | Fully Specified |
| Contact form submission creates row in `SUBMISSION` table and returns success | Verify `POST /contact` executes parameterized INSERT, populates `ip_hash`, and returns success | Fully Specified |
| Contact form with honeypot field filled is rejected | Verify `POST /contact` checks `req.body.website` and rejects with HTTP 400 if populated | Fully Specified |
| Navigating to `/admin` without session redirects to `/admin/login` | Verify `requireAuth` middleware redirects to `/admin/login` | Fully Specified |
| Logging in with seeded admin credentials grants access to dashboard | Verify `POST /admin/login` validates bcrypt hash and creates session cookie | Fully Specified |
| Admin dashboard displays contact form submissions data | Verify `GET /admin/submissions` queries `SUBMISSION` table and renders records | Fully Specified |
