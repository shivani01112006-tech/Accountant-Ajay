# Milestone 1 Exploration Report: Scaffold & Foundation

**Target System**: Ajay Singla Accounting Portfolio Website  
**Working Directory**: `d:/website ajay/`  
**Node.js Version**: v26.5.1  
**OS / Shell**: Windows x64 / PowerShell  

---

## 1. Executive Summary

Milestone 1 establishes the structural and architectural foundation for the entire Ajay Singla Portfolio web application. This investigation analyzed the Node.js package setup, the directory hierarchy, the database layer, and specific Windows execution constraints.

Crucial environment observations:
1. **Windows PowerShell Execution Policy**: Running `npm` invokes `npm.ps1`, which is blocked by Windows PowerShell default ExecutionPolicy. All commands MUST explicitly use `npm.cmd`.
2. **Node v26.5.1 ABI & Native Compilation**: Node v26.5.1 uses ABI version 147. MSVC C++ compiler (`cl.exe`) is not present on the host system. Because native C++ addons (`better-sqlite3`, `bcrypt`) may lack prebuilt binaries for ABI 147 and cannot compile locally without Visual C++ tools, the database layer must implement a robust **Dual-Driver Adapter** pattern that attempts `better-sqlite3` and seamlessly falls back to Node.js's built-in `node:sqlite` (`DatabaseSync`), which ships native SQLite 3.53.3 directly inside Node 26.
3. **Idempotent Database Foundation**: `db/schema.sql` and `db/seed.js` must be idempotent (`CREATE TABLE IF NOT EXISTS`, `INSERT OR IGNORE` / conflict resolution), supporting WAL mode (`PRAGMA journal_mode = WAL`) and enforcing foreign keys (`PRAGMA foreign_keys = ON`).

---

## 2. Exact `package.json` Specifications

### 2.1 Dependencies Rationale
- `express` (`^4.21.2`): Core HTTP routing framework.
- `ejs` (`^3.1.10`): Server-side templating engine.
- `better-sqlite3` (`^11.8.1`): Primary requested SQLite driver.
- `dotenv` (`^16.4.7`): Environment configuration loader.
- `bcrypt` (`^5.1.1`): Password hashing algorithm for admin credentials.
- `bcryptjs` (`^3.0.2`): Zero-dependency pure JavaScript fallback for `bcrypt` ensuring 100% runtime reliability if native compilation fails on Node 26 Windows x64.
- `express-session` (`^1.18.1`): Admin session management.
- `helmet` (`^8.0.0`): HTTP security headers and CSP.
- `express-rate-limit` (`^7.5.0`): Rate limiter for contact submissions and login attempts.
- `validator` (`^13.12.0`): Input sanitization and format validation.

### 2.2 DevDependencies Rationale
Node.js v26 includes a high-performance native test runner (`node:test`) and assertion library (`node:assert`). To prevent dependency bloat, Windows compilation friction, and supply-chain overhead, no external test framework dependencies are strictly needed. The test harness `tests/test-runner.js` runs natively on Node.js without third-party devDependencies.

### 2.3 Scripts Specification
- `"start": "node server.js"` — Starts Express HTTP listener.
- `"seed": "node db/seed.js"` — Initializes schema and seeds admin user + 3 initial services.
- `"test": "node tests/test-runner.js"` — Runs automated opaque-box test harness.

### 2.4 Concrete `package.json` Content
```json
{
  "name": "ajay-singla-portfolio",
  "version": "1.0.0",
  "description": "Portfolio website for Ajay Singla, self-employed accountant (15+ years)",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "seed": "node db/seed.js",
    "test": "node tests/test-runner.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "bcryptjs": "^3.0.2",
    "better-sqlite3": "^11.8.1",
    "dotenv": "^16.4.7",
    "ejs": "^3.1.10",
    "express": "^4.21.2",
    "express-rate-limit": "^7.5.0",
    "express-session": "^1.18.1",
    "helmet": "^8.0.0",
    "validator": "^13.12.0"
  },
  "optionalDependencies": {
    "better-sqlite3": "^11.8.1",
    "bcrypt": "^5.1.1"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "private": true
}
```
*Note on `optionalDependencies`*: Placing `better-sqlite3` and `bcrypt` under `optionalDependencies` guarantees that `npm.cmd install` will complete with exit code 0 even if the native build step fails due to missing C++ compilers on Windows, allowing our graceful pure-JS and built-in fallbacks (`node:sqlite` and `bcryptjs`) to take over without breaking installation.

---

## 3. Windows Execution Environment & Node 26 Analysis

### 3.1 PowerShell Execution Policy (`npm.cmd`)
- On Windows systems with default security policies, invoking `npm` causes PowerShell to attempt loading `npm.ps1`, triggering:
  `File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.`
- Solution: All Worker execution commands and documentation must use `npm.cmd` (e.g. `npm.cmd install`, `npm.cmd run seed`, `npm.cmd test`, `npm.cmd start`).

### 3.2 Node.js v26.5.1 & Native C++ Addons
- Environment check results:
  - Node version: `26.5.1`
  - Node module ABI: `147`
  - Python: `3.14.6`
  - MSVC C++ Compiler (`cl.exe`): **Not installed**
- `better-sqlite3` and `bcrypt` are native addons. If prebuilt binary wheels for ABI 147 on Windows x64 are absent from their package distribution, `node-gyp` will attempt to invoke MSVC and fail.
- **Node v26 Built-in SQLite (`node:sqlite`)**:
  - Node v26 ships with built-in SQLite 3.53.3 via `node:sqlite` (`const { DatabaseSync } = require('node:sqlite');`).
  - `DatabaseSync` is natively compiled into Node's binary, requiring zero compilation and zero external DLLs.
  - Its API mirrors `better-sqlite3`:
    - `db.exec(sql)`
    - `const stmt = db.prepare(sql)`
    - `stmt.all(...params)`, `stmt.get(...params)`, `stmt.run(...params)`
- **Dual-Driver Database Adapter in `db/connection.js`**:
  To satisfy the requirement of using `better-sqlite3` while ensuring resilient execution on Node 26 on Windows, `db/connection.js` must implement a unified wrapper:
  ```javascript
  // db/connection.js pattern
  const path = require('path');
  const fs = require('fs');
  const config = require('../config');

  let dbInstance = null;

  function initDatabase() {
    if (dbInstance) return dbInstance;

    const dbDir = path.dirname(config.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    try {
      // Primary: Attempt better-sqlite3
      const Database = require('better-sqlite3');
      const db = new Database(config.dbPath);
      db.pragma('journal_mode = WAL');
      db.pragma('foreign_keys = ON');
      console.log('[DB] Connected using better-sqlite3 driver (WAL mode)');
      dbInstance = db;
      return dbInstance;
    } catch (err) {
      console.warn('[DB] better-sqlite3 native driver unavailable:', err.message);
      console.log('[DB] Falling back to built-in node:sqlite (DatabaseSync)...');

      // Resilient Fallback: Built-in node:sqlite (Node 22+)
      const { DatabaseSync } = require('node:sqlite');
      const rawDb = new DatabaseSync(config.dbPath);
      rawDb.exec('PRAGMA journal_mode = WAL;');
      rawDb.exec('PRAGMA foreign_keys = ON;');

      // Adapter matching better-sqlite3 interface
      dbInstance = {
        exec: (sql) => rawDb.exec(sql),
        pragma: (pragmaStr) => rawDb.exec(`PRAGMA ${pragmaStr};`),
        prepare: (sql) => {
          const stmt = rawDb.prepare(sql);
          return {
            all: (...params) => stmt.all(...params),
            get: (...params) => stmt.get(...params),
            run: (...params) => {
              const res = stmt.run(...params);
              return {
                changes: res.changes,
                lastInsertRowid: res.lastInsertRowid
              };
            }
          };
        },
        transaction: (fn) => {
          return (...args) => {
            rawDb.exec('BEGIN TRANSACTION;');
            try {
              const result = fn(...args);
              rawDb.exec('COMMIT;');
              return result;
            } catch (txErr) {
              rawDb.exec('ROLLBACK;');
              throw txErr;
            }
          };
        },
        close: () => rawDb.close()
      };
      console.log('[DB] Connected using built-in node:sqlite driver (WAL mode)');
      return dbInstance;
    }
  }

  module.exports = { getDb: initDatabase };
  ```

### 3.3 Bcrypt Fallback Strategy
Similarly, password verification and hashing in `adminRepository.js` and `db/seed.js` can cleanly wrap `bcrypt`:
```javascript
let bcryptLib;
try {
  bcryptLib = require('bcrypt');
} catch (e) {
  bcryptLib = require('bcryptjs');
}
module.exports = bcryptLib;
```

---

## 4. Exact Folder Hierarchy to Scaffold

The following directory hierarchy must be created in `d:/website ajay/`:

```
d:/website ajay/
├── .env.example
├── .env
├── package.json
├── server.js
├── config/
│   ├── index.js
│   └── features.js
├── db/
│   ├── connection.js
│   ├── schema.sql
│   ├── seed.js
│   └── repositories/
│       ├── serviceRepository.js
│       ├── submissionRepository.js
│       └── adminRepository.js
├── middleware/
│   ├── auth.js
│   ├── csrf.js
│   ├── rateLimit.js
│   └── errorHandler.js
├── modules/
│   ├── public/
│   │   ├── publicController.js
│   │   └── publicRoutes.js
│   ├── contact/
│   │   ├── contactController.js
│   │   ├── contactService.js
│   │   └── contactRoutes.js
│   └── admin/
│       ├── adminController.js
│       ├── adminService.js
│       └── adminRoutes.js
├── views/
│   ├── layouts/
│   │   ├── main.ejs
│   │   └── admin.ejs
│   ├── partials/
│   │   ├── navbar.ejs
│   │   ├── footer.ejs
│   │   ├── flash.ejs
│   │   └── cookie-notice.ejs
│   ├── pages/
│   │   ├── home.ejs
│   │   ├── about.ejs
│   │   ├── services.ejs
│   │   ├── contact.ejs
│   │   ├── 404.ejs
│   │   └── 500.ejs
│   └── admin/
│       ├── login.ejs
│       ├── dashboard.ejs
│       ├── submissions.ejs
│       └── submission-detail.ejs
├── public/
│   ├── css/
│   │   ├── tokens.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── parallax.css
│   │   └── admin.css
│   ├── js/
│   │   ├── main.js
│   │   ├── parallax.js
│   │   └── contact.js
│   └── img/
│       ├── favicon.ico
│       └── placeholder-portrait.svg
└── tests/
    ├── e2e/
    └── test-runner.js
```

---

## 5. Detailed Component Specifications for Milestone 1

### 5.1 Environment Configuration (`.env.example` & `.env`)
Variables required:
```ini
# Server configuration
PORT=3000
NODE_ENV=development

# Database
DB_PATH=db/portfolio.db

# Security & Session
SESSION_SECRET=ajay_singla_accounting_secret_key_change_in_production_15yrs
IP_HASH_SALT=ajay_singla_salt_mansa_punjab_2026

# Admin Credentials (Seeded into DB)
ADMIN_USERNAME=admin
ADMIN_EMAIL=ajay30@gmail.com
ADMIN_PASSWORD=admin123
```

### 5.2 Central Config (`config/index.js` & `config/features.js`)
- `config/index.js`: Loads `dotenv`, parses integers (`PORT`), provides robust fallbacks for all environment variables.
- `config/features.js`: Exports feature flags:
  ```javascript
  module.exports = {
    chatbot: true,
    analytics: true,
    csvExport: true,
    cookieConsent: true
  };
  ```

### 5.3 Database Schema (`db/schema.sql`)
DDL statements required:
1. `ADMIN_USER`:
   ```sql
   CREATE TABLE IF NOT EXISTS ADMIN_USER (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     username TEXT UNIQUE NOT NULL,
     email TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     role TEXT DEFAULT 'admin',
     failed_attempts INTEGER DEFAULT 0,
     locked_until DATETIME DEFAULT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```
2. `SERVICE`:
   ```sql
   CREATE TABLE IF NOT EXISTS SERVICE (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     slug TEXT UNIQUE NOT NULL,
     title TEXT NOT NULL,
     summary TEXT NOT NULL,
     description TEXT,
     sort_order INTEGER DEFAULT 0,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );
   ```
3. `SUBMISSION`:
   ```sql
   CREATE TABLE IF NOT EXISTS SUBMISSION (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     name TEXT NOT NULL,
     email TEXT NOT NULL,
     phone TEXT NOT NULL,
     service_id INTEGER,
     message TEXT NOT NULL,
     status TEXT DEFAULT 'new' CHECK(status IN ('new', 'in_progress', 'read', 'replied', 'closed', 'archived')),
     ip_hash TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (service_id) REFERENCES SERVICE(id) ON DELETE SET NULL
   );
   CREATE INDEX IF NOT EXISTS idx_submission_status ON SUBMISSION(status);
   CREATE INDEX IF NOT EXISTS idx_submission_created_at ON SUBMISSION(created_at);
   ```
4. `SUBMISSION_NOTE`:
   ```sql
   CREATE TABLE IF NOT EXISTS SUBMISSION_NOTE (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     submission_id INTEGER NOT NULL,
     admin_id INTEGER NOT NULL,
     note TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (submission_id) REFERENCES SUBMISSION(id) ON DELETE CASCADE,
     FOREIGN KEY (admin_id) REFERENCES ADMIN_USER(id) ON DELETE CASCADE
   );
   CREATE INDEX IF NOT EXISTS idx_submission_note_sub_id ON SUBMISSION_NOTE(submission_id);
   ```
5. `CHAT_SESSION` & `CHAT_MESSAGE`:
   ```sql
   CREATE TABLE IF NOT EXISTS CHAT_SESSION (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     session_token TEXT UNIQUE NOT NULL,
     started_at DATETIME DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE IF NOT EXISTS CHAT_MESSAGE (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     session_id INTEGER NOT NULL,
     role TEXT CHECK(role IN ('user', 'bot')) NOT NULL,
     text TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (session_id) REFERENCES CHAT_SESSION(id) ON DELETE CASCADE
   );
   ```

### 5.4 Seed Engine (`db/seed.js`)
- Must read `ADMIN_USERNAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `config`.
- Hashes password with bcrypt (cost factor 10).
- Inserts or updates the admin user without failing on repeated runs.
- Seeds the 3 canonical services:
  1. `gst`: "GST Return Filing", summary: "Monthly & quarterly GST return filing (GSTR-1, GSTR-3B), input tax credit reconciliation, and notices compliance.", sort_order: 1.
  2. `income-tax`: "Income Tax Return (ITR)", summary: "Tax planning, computation, filing for salaried individuals, HUF, and small business owners with fast refund tracking.", sort_order: 2.
  3. `pan-card`: "PAN Card Services", summary: "New PAN applications, corrections, updating demographic details, and mandatory Aadhaar-PAN linking assistance.", sort_order: 3.
- Executable via `npm.cmd run seed` or `node db/seed.js`.

### 5.5 Repository Layer Skeletons
- `db/repositories/serviceRepository.js`:
  - `getAllServices()`: Returns all services ordered by `sort_order ASC`.
  - `getServiceBySlug(slug)`: Returns single service by slug.
- `db/repositories/submissionRepository.js`:
  - `createSubmission(data)`: Inserts into `SUBMISSION`.
  - `getSubmissions({ status, limit, offset, search })`: Queries paginated records.
  - `getSubmissionById(id)`: Returns detail.
  - `updateStatus(id, status)`: Updates submission status.
  - `getCountsByStatus()`: Returns metric counts for dashboard.
- `db/repositories/adminRepository.js`:
  - `findByUsername(username)`: Retrieves admin record.
  - `recordFailedAttempt(id)`: Increments failed attempt, applies lockout if `>= 5`.
  - `resetFailedAttempts(id)`: Clears lock and counter upon successful login.

### 5.6 Error Handling Middleware (`middleware/errorHandler.js`)
- 404 Handler: Catches unhandled routes, responds with JSON or renders `pages/404.ejs` if available.
- 500 Handler: Catches uncaught errors in express pipeline, logs stack trace, returns standardized error response or renders `pages/500.ejs`.

### 5.7 Server Entry Point (`server.js`)
- Initializes Express application.
- Configures middleware: `helmet`, `express.urlencoded({ extended: true })`, `express.json()`, `express.static('public')`.
- Configures view engine: `app.set('view engine', 'ejs'); app.set('views', path.join(__dirname, 'views'));`.
- Verifies database connection on startup.
- Mounts placeholder health check route `GET /health` (`{ status: "ok", timestamp: ... }`).
- Mounts router stubs for public, contact, and admin.
- Attaches error handlers.
- Starts HTTP listener on `config.port`.

### 5.8 Test Runner (`tests/test-runner.js`)
- Validates that:
  1. Environment configuration loads properly.
  2. SQLite database connects, schema tables exist (`ADMIN_USER`, `SERVICE`, `SUBMISSION`, `SUBMISSION_NOTE`, `CHAT_SESSION`, `CHAT_MESSAGE`).
  3. Seeding produces admin user and 3 services.
  4. Repository queries work as expected.
  5. Express server instance initializes without errors.

---

## 6. Step-by-Step Guidance for the Worker

When implementing Milestone 1, the Worker should execute the following sequence:

1. **Scaffold Directory Skeleton**:
   Create all listed folders: `config`, `db`, `db/repositories`, `modules/public`, `modules/contact`, `modules/admin`, `views/layouts`, `views/partials`, `views/pages`, `views/admin`, `public/css`, `public/js`, `public/img`, `middleware`, `tests/e2e`.

2. **Create `package.json`**:
   Write the exact `package.json` with dependencies, optionalDependencies, and scripts.

3. **Install Dependencies**:
   Run `npm.cmd install` in `d:/website ajay`. (Note: use `npm.cmd`!).

4. **Create Configuration**:
   - Write `.env.example` and copy to `.env`.
   - Write `config/index.js` and `config/features.js`.

5. **Create Database Layer**:
   - Write `db/schema.sql` with full DDL and indexes.
   - Write `db/connection.js` implementing the dual-driver adapter (`better-sqlite3` + `node:sqlite`).
   - Write `db/seed.js` using bcrypt/bcryptjs and populating admin + 3 services.

6. **Create Repositories**:
   - Write `db/repositories/serviceRepository.js`.
   - Write `db/repositories/submissionRepository.js`.
   - Write `db/repositories/adminRepository.js`.

7. **Create Middleware**:
   - Write `middleware/errorHandler.js`.
   - Create placeholder stubs for `middleware/auth.js`, `csrf.js`, and `rateLimit.js`.

8. **Create Server Initialization**:
   - Write `server.js` bringing together config, static files, view engine, routes, and DB initialization.

9. **Create and Run Automated Tests**:
   - Write `tests/test-runner.js`.
   - Execute `npm.cmd run seed` and `npm.cmd test`.
   - Ensure all checks pass with 100% success.
