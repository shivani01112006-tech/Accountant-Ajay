# Forensic Audit Report: Milestone 1 (Scaffold & Foundation)

**Auditor Agent**: `m1_auditor_1` (Forensic Integrity Auditor)  
**Target Milestone**: Milestone 1 (Scaffold & Foundation)  
**Target Workspace**: `d:/website ajay`  
**Profile**: General Project (Forensic Integrity)  
**Integrity Mode**: Development / Demo (Ground-truth inferred from `ORIGINAL_REQUEST.md`)  
**Verdict**: **CLEAN**

---

## 1. Executive Summary

A forensic integrity audit was conducted on all Milestone 1 work products in `d:/website ajay`. The objective of this audit is to detect integrity violations, including hardcoded test results, facade implementations, mock masquerading, dummy password hashes, bypassed middleware, or fabricated outputs.

Every claim and component was verified against raw source code, filesystem state, and execution traces.

**Final Binary Gate Verdict**: **CLEAN**  
Zero integrity violations, shortcuts, facade implementations, or cheating mechanisms were detected.

---

## 2. Integrity Forensics Verification Matrix

| # | Forensic Check Item | Scope / File(s) | Observed Evidence | Result |
|---|---|---|---|---|
| 1 | **Hardcoded Test Results Detection** | `tests/m1-verify.js`, `tests/m1-challenge.js`, `tests/m1-stress-test.js` | All assertions dynamically evaluate live SQLite query results, live HTTP network responses from ephemeral servers, or runtime configuration objects. No tests pass by asserting against static string literals or mocked return values. | **PASS (CLEAN)** |
| 2 | **Facade / Stub Detection** | `server.js`, `db/connection.js`, `db/repositories/*.js` | Zero facade functions (`return true`, `return <constant>`, empty stubs). Full implementations of dual-driver SQLite bridging, parameterized CRUD queries, transaction wrappers, and Express middleware. | **PASS (CLEAN)** |
| 3 | **Pre-populated Artifact Detection** | Project root & subdirectories | Ran workspace scan for pre-existing log files (`*.log`), result files (`*result*`), or output dumps (`*output*`). Found 0 pre-populated result artifacts. | **PASS (CLEAN)** |
| 4 | **Database Query Authenticity (No Fake Mocks)** | `db/connection.js`, `db/repositories/*.js` | Real SQLite database file accessed via `node:sqlite` / `better-sqlite3`. Repositories execute genuine parameterized SQL (`SELECT`, `INSERT`, `UPDATE`). No in-memory arrays or proxy mock drivers. | **PASS (CLEAN)** |
| 5 | **Cryptographic Password Hashing Authenticity** | `db/seed.js:47-48`, `ADMIN_USER` | `bcrypt.hashSync(adminPassword, saltRounds)` executed with `saltRounds = 10`. The database stores genuine `$2b$10$...` Blowfish hash, verified with `bcrypt.compareSync`. No dummy or plaintext strings. | **PASS (CLEAN)** |
| 6 | **Server Route & Middleware Execution Authenticity** | `server.js`, `views/` | `server.js` mounts Helmet, body parsers, static file handlers, and view locals. `GET /` queries `serviceRepository.getAll()` and renders `pages/home.ejs` dynamically. `GET /health` returns dynamic uptime. 404/500 handlers execute genuine content negotiation. | **PASS (CLEAN)** |
| 7 | **SQLite Persistence on Disk** | `db/database.sqlite`, `database.sqlite-wal`, `database.sqlite-shm` | Verified physical disk files: `database.sqlite` (73,728 bytes), `database.sqlite-shm` (32,768 bytes), and `database.sqlite-wal` (457,352 bytes). The active WAL journal confirms live disk transactions. | **PASS (CLEAN)** |
| 8 | **Database Record & Constraint Integrity** | `db/schema.sql`, SQLite engine | Table records verified: 1 admin user record, 3 service records (`gst`, `income-tax`, `pan`). Strict enforcement of `PRAGMA foreign_keys = ON`, `UNIQUE(slug)`, `UNIQUE(username)`, `CHECK(status IN (...))`, and NOT NULL constraints. | **PASS (CLEAN)** |
| 9 | **Workspace Layout Compliance** | `.agents/teamwork/` vs project source | `.agents/teamwork/` contains exclusively agent metadata (`.md` files). Zero source code, tests, or application data files are placed inside `.agents/teamwork/`. | **PASS (CLEAN)** |

---

## 3. Deep-Dive Forensic Findings by Category

### 3.1 Static Analysis & Anti-Cheating Verification

#### A. Test Assertions and Expected Responses
- Inspected `tests/m1-verify.js` (224 lines):
  - Section 1 dynamically evaluates `config/index.js` and `config/features.js`.
  - Section 2 queries `sqlite_master` in SQLite directly (`SELECT name FROM sqlite_master WHERE type = 'table'`).
  - Section 3 executes `SELECT * FROM ADMIN_USER LIMIT 1` and `SELECT * FROM SERVICE ORDER BY sort_order ASC`.
  - Section 4 performs live CRUD operations on `submissionRepository` and `adminRepository` with insert, select, update, and delete.
  - Section 5 binds a live HTTP listener on ephemeral port 0 (`app.listen(0, '127.0.0.1')`), fires live HTTP GET requests (`/`, `/health`, `/this-route-does-not-exist`, `/css/tokens.css`), and asserts on the actual returned headers, status codes, and rendered HTML bodies.
  - Failure reporting is strictly tracked via `failureCount`. An assert failure unconditionally increments `failureCount++` and leads to `process.exit(1)`. Zero bypasses or suppression mechanisms exist.

#### B. Database Operations vs. Fake In-Memory Mocks
- In `db/connection.js`:
  ```javascript
  const rawDbPath = (config.db && config.db.path) || process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
  const dbPath = path.isAbsolute(rawDbPath) ? rawDbPath : path.resolve(process.cwd(), rawDbPath);
  ```
  The connection explicitly targets the physical file on disk.
- Dual-driver bridge:
  - If `better-sqlite3` is available, it initializes `new BetterSqlite3(dbPath)`.
  - Under Node.js v26 without MSVC native compilers, it gracefully activates Node's built-in `node:sqlite` (`new DatabaseSync(dbPath)`).
  - Both paths enforce `PRAGMA journal_mode = WAL;`, `PRAGMA foreign_keys = ON;`, and `PRAGMA synchronous = NORMAL;`.
  - Prepared statements wrap genuine statement handles (`rawDb.prepare(sql)`).
  - Transactions wrap genuine SQLite transaction commands (`BEGIN IMMEDIATE`, `COMMIT`, `ROLLBACK`).
- In `db/repositories/`:
  - `adminRepository.js`: executes parameterized statements against `ADMIN_USER`.
  - `serviceRepository.js`: executes parameterized statements against `SERVICE`.
  - `submissionRepository.js`: executes parameterized statements against `SUBMISSION` and `SUBMISSION_NOTE` with SQL JOINs (`LEFT JOIN SERVICE srv ON s.service_id = srv.id`).
  - No fake in-memory mock objects (`mockDb`, in-memory arrays, fake promises) are present in the codebase.

#### C. Password Hashing Authenticity in `db/seed.js`
- Inspected lines 42–69 in `db/seed.js`:
  ```javascript
  const adminPassword = config.admin.password || 'AdminSecure123!';
  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync(adminPassword, saltRounds);

  const adminUpsertSql = `
    INSERT INTO ADMIN_USER (username, email, password_hash, role, failed_attempts, locked_until)
    VALUES (?, ?, ?, 'admin', 0, NULL)
    ON CONFLICT(username) DO UPDATE SET ...
  `;
  const adminStmt = db.prepare(adminUpsertSql);
  adminStmt.run(adminUsername, adminEmail, passwordHash);
  ```
- Evaluated library authenticity: Uses genuine `bcrypt` (`bcryptjs` fallback if native binary unavailable).
- Output verification: The stored hash adheres to the standard modular crypt format (`$2b$10$...`), confirming a 10-round Blowfish key derivation function.
- Cross-agent verification: Independent runs by reviewers verified that `bcrypt.compareSync('AdminSecure123!', user.password_hash)` evaluates to `true`, and invalid passwords evaluate to `false`.

#### D. Server Routes, Middleware, and View Rendering
- In `server.js`:
  - Security headers: Mounted via `helmet({...})` with a strict Content Security Policy.
  - Body parsers: `express.urlencoded({ extended: true })` and `express.json()`.
  - Dynamic view locals: Injects feature toggles (`isFeatureEnabled`), dynamic year (`new Date().getFullYear()`), and request path (`req.path`).
  - Route `GET /health`: Dynamically reports `process.uptime()`, ISO timestamp, and environment.
  - Route `GET /`: Retrieves service records via `serviceRepository.getAll()` and calls `res.render('pages/home', { title, services, currentPath })`.
  - View engine: Standard EJS (`views/pages/home.ejs`) dynamically iterates over `services.forEach(...)` to render service titles, summaries, and links.
  - Error routing: Catch-all 404 handler inspects `req.accepts(...)` to serve styled `pages/404` or JSON `{ error: 'Not Found' }`.
  - Centralized 500 error handler: Protects against stack trace leakage by omitting `err.stack` when `config.isProduction` is true.

---

### 3.2 Runtime & Execution Tracing Verification

#### A. Physical SQLite Persistence
Filesystem inspection of `d:/website ajay/db/` confirms:
- `db/database.sqlite`: **73,728 bytes** (72 KB)
- `db/database.sqlite-shm`: **32,768 bytes** (32 KB)
- `db/database.sqlite-wal`: **457,352 bytes** (~446 KB)

**Forensic significance of `-wal` and `-shm` files**:
When SQLite operates in WAL mode (`PRAGMA journal_mode = WAL`), modifications are appended to the `.sqlite-wal` file before checkpointing back to the main database file. The size of the WAL file (457 KB) confirms that extensive write operations (schema initialization, seeder upserts, test inserts, note creations, and transactions) were written to disk.

#### B. Direct SQLite Database Records
The database file contains:
1. `ADMIN_USER`:
   - `username`: `admin@ajaysingla.com`
   - `email`: `admin@ajaysingla.com`
   - `password_hash`: genuine bcrypt hash (`$2b$10$...`)
   - `role`: `admin`
   - `failed_attempts`: 0
   - `locked_until`: `NULL`
2. `SERVICE`:
   - Row 1: `slug` = `gst`, `title` = `GST Registration & Filing`, `sort_order` = 1
   - Row 2: `slug` = `income-tax`, `title` = `Income Tax Return (ITR) Filing`, `sort_order` = 2
   - Row 3: `slug` = `pan`, `title` = `PAN Card Application & Assistance`, `sort_order` = 3
3. Database Constraints Verified:
   - Foreign keys: inserting a note for invalid submission ID throws `FOREIGN KEY constraint failed`.
   - Unique constraints: inserting duplicate slug `'gst'` throws `UNIQUE constraint failed`.
   - NOT NULL constraints: inserting NULL into required columns throws `NOT NULL constraint failed`.
   - CHECK constraints: inserting invalid status into `SUBMISSION` throws `CHECK constraint failed`.

---

## 4. Mode-Specific Flagging (Phase 2)

Per `ORIGINAL_REQUEST.md`:
- Mode: **Development / Demo Mode**
- Evaluation of observations:

| Pattern | Allowed / Prohibited | Codebase Status | Flag |
|---|---|---|---|
| Hardcoded test results | Prohibited | None | ✅ OK |
| Facade implementations | Prohibited | None | ✅ OK |
| Fabricated verification outputs | Prohibited | None | ✅ OK |
| Mock masquerading as persistence | Prohibited | None | ✅ OK |
| Dummy password hash | Prohibited | None | ✅ OK |
| Unexecuted static mock routes | Prohibited | None | ✅ OK |
| Delegating core deliverable to 3rd party black-box | Prohibited | None | ✅ OK |

Total Flags: **0**

---

## 5. Non-Blocking Quality & Hardening Observations

The following observations do not violate integrity constraints, but are documented for subsequent milestones:

1. **Missing `.gitignore`**: The project root currently lacks `.gitignore`. Before git commits, `.gitignore` should be created to prevent tracking `node_modules/`, `.env`, and `db/*.sqlite*`.
2. **Layout Consistency in Phase 3**: `views/layouts/main.ejs` defines `<%- body %>`, but `views/pages/home.ejs` includes headers/footers via partials directly. Before adding About/Services/Contact pages in Milestone 3, a unified layout strategy should be established.
3. **Pagination Upper Limit**: In `db/repositories/submissionRepository.js:45`, pagination enforces `Math.max(1, limit)` but lacks an upper cap (e.g. `Math.min(100, safeLimit)`). This should be capped when building the Admin Panel in Milestone 5.
4. **Secondary 404 Fallback String**: In `server.js:101`, if `res.render('pages/404')` throws an unexpected error, the fallback `res.send()` embeds raw `${req.originalUrl}`. While primary rendering via EJS escapes the URL, the fallback string should be wrapped with `validator.escape()`.

---

## 6. Final Verdict

**VERDICT**: **CLEAN**

Milestone 1 satisfies all forensic integrity criteria. The work product is authentic, genuine, fully persisted on disk, and contains zero integrity violations or shortcuts.
