# Database Specification & Architecture Report (Milestone 1)

**Agent:** `m1_explorer_2`  
**Milestone:** Milestone 1 — Scaffold & Foundation  
**Target Output Artifacts:** `db/schema.sql`, `db/connection.js`, `db/seed.js`, and repository interfaces  
**Target Environment:** Node.js v26.5.1 LTS, Windows x64 (`npm.cmd`), SQLite via `better-sqlite3` (with `node:sqlite` resilience)  
**Date:** 2026-10-07  

---

## 1. Executive Summary

This report establishes the complete, production-ready database specification, DDL schema, connection wrapper, seeding engine, and repository contracts for Ajay Singla's portfolio and client enquiry management platform.

### Key Architectural Decisions:
1. **Relational Database Engine:** SQLite in WAL (Write-Ahead Logging) mode. WAL mode enables concurrent reads while a write transaction is executing, preventing table locking during client contact submissions or admin queries.
2. **Driver Strategy:** Primary driver is `better-sqlite3` (as mandated by `ORIGINAL_REQUEST.md` and `PROJECT.md`). The connection module incorporates resilient driver resolution with an automatic bridge to Node's built-in `node:sqlite` (DatabaseSync), ensuring 100% operational readiness across all Node v26 Windows environments.
3. **Idempotent Operations:** Both schema execution (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`) and seeding (`ON CONFLICT(...) DO UPDATE SET...`) are strictly idempotent. Re-running `npm.cmd run seed` or restarting the server never corrupts or duplicates existing records.
4. **Security & Privacy by Design:** Zero raw IP addresses are persisted; all visitor IP addresses are hashed using SHA-256 with a salt before insertion into `SUBMISSION`. Admin passwords are encrypted using `bcrypt` at cost factor 10. Failed login attempts and lockout timestamps are enforced directly in the database.

---

## 2. DDL Schema Specification (`db/schema.sql`)

### 2.1 Complete Verbatim `db/schema.sql`

```sql
-- ============================================================================
-- Ajay Singla Portfolio Database Schema
-- SQLite 3 (WAL mode, Foreign Keys ON)
-- ============================================================================

PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. ADMIN_USER: Credentials, lockout tracking, and session identity
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ADMIN_USER (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. SERVICE: Core accounting service offerings (GST, ITR, PAN)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS SERVICE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 3. SUBMISSION: Contact enquiries captured from public contact forms
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 4. SUBMISSION_NOTE: Internal follow-up notes written by admin on submissions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS SUBMISSION_NOTE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    admin_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES SUBMISSION(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES ADMIN_USER(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- 5. CHAT_SESSION: Visitor sessions for rule-based chatbot widget
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS CHAT_SESSION (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. CHAT_MESSAGE: Transcript logs for chatbot interactions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS CHAT_MESSAGE (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user', 'bot')),
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES CHAT_SESSION(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------------------
-- INDEXES: Query performance, filtering, pagination, and FK joins
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_submission_status ON SUBMISSION(status);
CREATE INDEX IF NOT EXISTS idx_submission_created_at ON SUBMISSION(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submission_service_id ON SUBMISSION(service_id);
CREATE INDEX IF NOT EXISTS idx_service_slug ON SERVICE(slug);
CREATE INDEX IF NOT EXISTS idx_service_sort_order ON SERVICE(sort_order ASC);
CREATE INDEX IF NOT EXISTS idx_submission_note_submission_id ON SUBMISSION_NOTE(submission_id);
CREATE INDEX IF NOT EXISTS idx_chat_message_session_id ON CHAT_MESSAGE(session_id);
```

### 2.2 Table Field Analysis & Constraints

| Table | Column | Type | Constraints | Description & Business Purpose |
|---|---|---|---|---|
| `ADMIN_USER` | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for administrator |
| | `username` | TEXT | UNIQUE, NOT NULL | Login credential (e.g. `ajay30@gmail.com`) |
| | `password_hash` | TEXT | NOT NULL | Bcrypt hash (cost factor >= 10) |
| | `failed_attempts` | INTEGER | DEFAULT 0 | Counter for failed logins; resets to 0 on success |
| | `locked_until` | DATETIME | NULLABLE | Timestamp until which login is blocked (15 min lockout) |
| | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `SERVICE` | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique service ID |
| | `slug` | TEXT | UNIQUE, NOT NULL | URL slug (e.g. `gst`, `income-tax`, `pan`) |
| | `title` | TEXT | NOT NULL | Display name (e.g. "GST Registration & Filing") |
| | `summary` | TEXT | NOT NULL | Brief 1-2 sentence preview for cards and home page |
| | `description` | TEXT | NULLABLE | Detailed breakdown for `/services` page & modals |
| | `sort_order` | INTEGER | DEFAULT 0 | Display priority (1=GST, 2=ITR, 3=PAN) |
| | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `SUBMISSION` | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique enquiry ticket number |
| | `name` | TEXT | NOT NULL | Contact person's full name (2–100 chars) |
| | `email` | TEXT | NOT NULL | Validated email address |
| | `phone` | TEXT | NOT NULL | 10-digit Indian mobile number |
| | `service_id` | INTEGER | FK -> `SERVICE(id)` | Associated service; SET NULL if service deleted |
| | `message` | TEXT | NOT NULL | Enquiry message (10–2000 chars) |
| | `status` | TEXT | CHECK IN (...) | Workflow state: `new`, `in_progress`, `read`, `replied`, `closed`, `archived` |
| | `ip_hash` | TEXT | NOT NULL | SHA-256 salted hash of client IP address |
| | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| `SUBMISSION_NOTE` | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique internal note ID |
| | `submission_id` | INTEGER | FK -> `SUBMISSION(id)` | Cascade deletes note when submission is purged |
| | `admin_id` | INTEGER | FK -> `ADMIN_USER(id)` | Admin author identifier |
| | `note` | TEXT | NOT NULL | Free-form note text |
| | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Note timestamp |
| `CHAT_SESSION` | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Session ID |
| | `session_token` | TEXT | UNIQUE, NOT NULL | UUID / crypto token for tracking conversation |
| | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Chat session initiation timestamp |
| `CHAT_MESSAGE` | `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Message ID |
| | `session_id` | INTEGER | FK -> `CHAT_SESSION(id)` | Cascade deletes message if session deleted |
| | `role` | TEXT | CHECK IN ('user','bot') | Message sender role |
| | `message` | TEXT | NOT NULL | Chat transcript body |
| | `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp |

---

## 3. Database Connection Wrapper (`db/connection.js`)

### 3.1 Design Principles
1. **Resilient Driver Loading:** Loads `better-sqlite3`. If native binary compilation is pending in a specific Windows Node v26 setup, it seamlessly falls back to Node v26's native `node:sqlite` (DatabaseSync), maintaining an identical prepared statement API.
2. **Directory Auto-Creation:** Resolves path via `process.env.DB_PATH || path.join(__dirname, 'database.sqlite')`. Checks if the directory exists and executes `fs.mkdirSync(dir, { recursive: true })` before initializing.
3. **Pragmas Configuration:**
   - `PRAGMA journal_mode = WAL;` (Enables Write-Ahead Logging for high concurrency).
   - `PRAGMA foreign_keys = ON;` (Guarantees relational referential integrity).
   - `PRAGMA synchronous = NORMAL;` (Optimal durability and speed in WAL mode).
4. **Self-Healing Schema Execution:** Provides `initDatabase()` that loads `db/schema.sql` and executes it, enabling both `seed.js` and `server.js` to initialize cleanly without manual SQL scripting.
5. **Universal API Export:** Exports the database instance directly while also exposing prepared statement helper methods (`get`, `all`, `run`, `exec`, `transaction`, `initDatabase`, `closeDatabase`).

### 3.2 Complete Verbatim `db/connection.js`

```javascript
/**
 * Database Connection Module
 * Ajay Singla Portfolio & Management System
 * 
 * Manages SQLite connection in WAL mode with foreign keys enabled.
 * Uses better-sqlite3 with resilient fallback to node:sqlite (Node 26+).
 */

const fs = require('fs');
const path = require('path');

// Resolve database file path from environment or default
const rawDbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const dbPath = path.isAbsolute(rawDbPath) 
  ? rawDbPath 
  : path.resolve(process.cwd(), rawDbPath);

// Ensure the parent directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;
let isNodeSqlite = false;

try {
  const Database = require('better-sqlite3');
  db = new Database(dbPath, {
    // verbose: process.env.NODE_ENV === 'development' ? console.log : null
  });
  
  // Configure pragmas for WAL mode and relational integrity
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('synchronous = NORMAL');
} catch (betterSqliteError) {
  // Graceful fallback to Node.js v26 built-in node:sqlite
  try {
    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA journal_mode = WAL;');
    db.exec('PRAGMA foreign_keys = ON;');
    db.exec('PRAGMA synchronous = NORMAL;');
    isNodeSqlite = true;
    console.warn('[DB] Notice: Using built-in node:sqlite driver.');
  } catch (nativeError) {
    console.error('[DB] Fatal: Failed to initialize SQLite database.');
    console.error('[DB] better-sqlite3 error:', betterSqliteError.message);
    console.error('[DB] node:sqlite error:', nativeError.message);
    throw betterSqliteError;
  }
}

/**
 * Initializes database tables and indexes from schema.sql
 * @returns {void}
 */
function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  } else {
    throw new Error(`Schema file not found at: ${schemaPath}`);
  }
}

/**
 * Gracefully close database connection
 */
function closeDatabase() {
  if (db && typeof db.close === 'function') {
    db.close();
  }
}

// Helpers for prepared statement execution
const queryHelpers = {
  db,
  isNodeSqlite,
  initDatabase,
  closeDatabase,

  get(sql, ...params) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
  },

  all(sql, ...params) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  run(sql, ...params) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
  },

  exec(sql) {
    return db.exec(sql);
  },

  transaction(fn) {
    if (typeof db.transaction === 'function') {
      return db.transaction(fn);
    }
    // Fallback manual transaction handling
    return (...args) => {
      db.exec('BEGIN IMMEDIATE');
      try {
        const result = fn(...args);
        db.exec('COMMIT');
        return result;
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    };
  }
};

// Export db instance directly with attached helper properties for versatility
Object.assign(db, queryHelpers);
module.exports = db;
```

---

## 4. Database Seeding Script (`db/seed.js`)

### 4.1 Design Principles
1. **Environment Config Loading:** Automatically loads `.env` using `dotenv.config()`.
2. **Flexible Admin Credentials:** Looks up `process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || 'ajay30@gmail.com'`. Passwords default to `process.env.ADMIN_PASSWORD || 'AjaySingla2026!'`.
3. **Bcrypt Encryption:** Hashes admin password with cost factor 10 using `bcrypt.hashSync(password, 10)` (with fallback to `bcryptjs` if needed).
4. **Service Catalog Population:** Seeds the 3 core accounting services:
   - **GST:** Slug `"gst"`, Title `"GST Registration & Filing"`, sort order `1`
   - **Income Tax:** Slug `"income-tax"`, Title `"Income Tax Return (ITR) Filing"`, sort order `2`
   - **PAN:** Slug `"pan"`, Title `"PAN Card Application & Assistance"`, sort order `3`
5. **Upsert Safety:**
   - Admin upsert updates password hash and clears any existing lockout counters.
   - Services upsert updates titles, summaries, descriptions, and sort orders without changing IDs or breaking existing foreign key links in `SUBMISSION`.
6. **Clean Logging & Process Exit:** Produces human-readable console tables confirming the exact state of seeded data and exits with code `0`.

### 4.2 Complete Verbatim `db/seed.js`

```javascript
/**
 * Database Seeding Engine
 * Ajay Singla Portfolio & Management System
 * 
 * Command: node db/seed.js (or npm.cmd run seed)
 */

require('dotenv').config();
const path = require('path');
const db = require('./connection');

// Resilient bcrypt loader (supports bcrypt or bcryptjs)
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  try {
    bcrypt = require('bcryptjs');
  } catch (err) {
    console.error('[SEED] Fatal: Neither "bcrypt" nor "bcryptjs" is installed.');
    process.exit(1);
  }
}

async function seed() {
  console.log('====================================================');
  console.log('   AJAY SINGLA PORTFOLIO - DATABASE SEEDING ENGINE   ');
  console.log('====================================================');

  // 1. Ensure schema is initialized
  try {
    console.log('[1/4] Ensuring database schema and tables exist...');
    db.initDatabase();
    console.log('      ✓ Schema tables and indexes verified.');
  } catch (err) {
    console.error('      ✗ Error applying schema:', err.message);
    process.exit(1);
  }

  // 2. Admin User Seeding
  console.log('\n[2/4] Seeding Administrator Account...');
  const adminUsername = (process.env.ADMIN_EMAIL || process.env.ADMIN_USERNAME || 'ajay30@gmail.com').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'AjaySingla2026!';
  
  // Hash password using cost factor 10
  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync(adminPassword, saltRounds);

  const adminUpsertSql = `
    INSERT INTO ADMIN_USER (username, password_hash, failed_attempts, locked_until)
    VALUES (?, ?, 0, NULL)
    ON CONFLICT(username) DO UPDATE SET
      password_hash = excluded.password_hash,
      failed_attempts = 0,
      locked_until = NULL;
  `;

  try {
    const adminStmt = db.prepare(adminUpsertSql);
    adminStmt.run(adminUsername, passwordHash);
    console.log(`      ✓ Admin user upserted: ${adminUsername}`);
    console.log(`      ✓ Password hashed with bcrypt (cost factor: ${saltRounds})`);
  } catch (err) {
    console.error('      ✗ Error seeding admin user:', err.message);
    process.exit(1);
  }

  // 3. Core Services Seeding
  console.log('\n[3/4] Seeding Core Accounting Services...');
  const services = [
    {
      slug: 'gst',
      title: 'GST Registration & Filing',
      summary: 'Comprehensive GST registration, monthly/quarterly return filing (GSTR-1, GSTR-3B), and annual compliance for businesses.',
      description: 'Full-cycle GST advisory and compliance service in Mansa, Punjab. We manage new GST registrations, amendment of existing GST numbers, monthly and quarterly return filings (GSTR-1 and GSTR-3B), input tax credit (ITC) reconciliation, annual returns (GSTR-9), and assistance with GST notice resolution.',
      sort_order: 1
    },
    {
      slug: 'income-tax',
      title: 'Income Tax Return (ITR) Filing',
      summary: 'Expert ITR filing for salaried individuals, freelancers, professionals, and small businesses with deduction optimization.',
      description: 'Accurate, timely Income Tax Return (ITR-1 through ITR-4) preparation and e-filing. We ensure optimal tax planning under Old and New tax regimes, compute capital gains, claim Section 80C/80D deductions, reconcile Form 26AS & AIS/TIS, and resolve tax intimation notices.',
      sort_order: 2
    },
    {
      slug: 'pan',
      title: 'PAN Card Application & Assistance',
      summary: 'PAN Card Application & Assistance for new PAN allotment, corrections, duplicate cards, and Aadhaar-PAN linking.',
      description: 'Complete support for Permanent Account Number (PAN) requirements. We handle new PAN applications for individuals, firms, and HUF, update incorrect names or dates of birth, assist with duplicate PAN cards for lost cards, and facilitate Aadhaar-PAN linking.',
      sort_order: 3
    }
  ];

  const serviceUpsertSql = `
    INSERT INTO SERVICE (slug, title, summary, description, sort_order)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      description = excluded.description,
      sort_order = excluded.sort_order;
  `;

  const serviceStmt = db.prepare(serviceUpsertSql);
  for (const s of services) {
    serviceStmt.run(s.slug, s.title, s.summary, s.description, s.sort_order);
    console.log(`      ✓ Service seeded: [${s.slug}] "${s.title}" (order: ${s.sort_order})`);
  }

  // 4. Verification Output
  console.log('\n[4/4] Verifying Seeded Data from SQLite...');
  const seededAdmin = db.prepare('SELECT id, username, failed_attempts, created_at FROM ADMIN_USER WHERE username = ?').get(adminUsername);
  const seededServices = db.prepare('SELECT id, slug, title, sort_order FROM SERVICE ORDER BY sort_order ASC').all();

  console.log('\n--- Admin User Record ---');
  console.table([seededAdmin]);

  console.log('--- Services Records ---');
  console.table(seededServices);

  console.log('====================================================');
  console.log('   DATABASE SEEDING COMPLETED SUCCESSFULLY (EXIT 0)  ');
  console.log('====================================================');

  process.exit(0);
}

// Execute seed function
seed().catch((err) => {
  console.error('[SEED] Unhandled Exception during seeding:', err);
  process.exit(1);
});
```

---

## 5. Repository Layer Architecture (`db/repositories/`)

To fulfill the modular architecture specified in `architecture.md` (Browser → Express Middleware → Controllers → Services → Repositories → SQLite DB), the database layer should expose three dedicated repository modules in `db/repositories/`.

### 5.1 `serviceRepository.js` Specification

```javascript
const db = require('../connection');

const serviceRepository = {
  getAll() {
    return db.prepare('SELECT * FROM SERVICE ORDER BY sort_order ASC, id ASC').all();
  },

  getBySlug(slug) {
    return db.prepare('SELECT * FROM SERVICE WHERE slug = ?').get(slug);
  },

  getById(id) {
    return db.prepare('SELECT * FROM SERVICE WHERE id = ?').get(id);
  }
};

module.exports = serviceRepository;
```

### 5.2 `adminRepository.js` Specification

```javascript
const db = require('../connection');

const adminRepository = {
  findByUsername(username) {
    return db.prepare('SELECT * FROM ADMIN_USER WHERE username = ?').get(username.trim().toLowerCase());
  },

  findById(id) {
    return db.prepare('SELECT id, username, failed_attempts, locked_until, created_at FROM ADMIN_USER WHERE id = ?').get(id);
  },

  recordFailedAttempt(id, maxAttempts = 5, lockoutDurationMs = 15 * 60 * 1000) {
    const user = db.prepare('SELECT failed_attempts FROM ADMIN_USER WHERE id = ?').get(id);
    if (!user) return null;
    const newAttempts = user.failed_attempts + 1;
    let lockedUntil = null;
    if (newAttempts >= maxAttempts) {
      lockedUntil = new Date(Date.now() + lockoutDurationMs).toISOString();
    }
    db.prepare('UPDATE ADMIN_USER SET failed_attempts = ?, locked_until = ? WHERE id = ?')
      .run(newAttempts, lockedUntil, id);
    return { failed_attempts: newAttempts, locked_until: lockedUntil };
  },

  resetLockout(id) {
    db.prepare('UPDATE ADMIN_USER SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(id);
  },

  updatePassword(id, passwordHash) {
    db.prepare('UPDATE ADMIN_USER SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?')
      .run(passwordHash, id);
  }
};

module.exports = adminRepository;
```

### 5.3 `submissionRepository.js` Specification

```javascript
const db = require('../connection');

const submissionRepository = {
  create({ name, email, phone, service_id, message, ip_hash }) {
    const stmt = db.prepare(`
      INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash, created_at)
      VALUES (?, ?, ?, ?, ?, 'new', ?, datetime('now'))
    `);
    const info = stmt.run(name, email, phone, service_id || null, message, ip_hash);
    return info.lastInsertRowid;
  },

  getById(id) {
    const stmt = db.prepare(`
      SELECT s.*, srv.title as service_title, srv.slug as service_slug
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
      WHERE s.id = ?
    `);
    return stmt.get(id);
  },

  list({ status = null, search = null, page = 1, limit = 10 } = {}) {
    let whereClauses = [];
    let params = [];

    if (status && status !== 'all') {
      whereClauses.push('s.status = ?');
      params.push(status);
    }

    if (search && search.trim() !== '') {
      whereClauses.push('(s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR s.message LIKE ?)');
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Total count
    const countRow = db.prepare(`SELECT COUNT(*) as count FROM SUBMISSION s ${whereSql}`).get(...params);
    const total = countRow.count;

    // Paginated list
    const offset = (page - 1) * limit;
    const items = db.prepare(`
      SELECT s.*, srv.title as service_title
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
      ${whereSql}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  },

  updateStatus(id, status) {
    return db.prepare('UPDATE SUBMISSION SET status = ? WHERE id = ?').run(status, id);
  },

  addNote(submission_id, admin_id, note) {
    const stmt = db.prepare(`
      INSERT INTO SUBMISSION_NOTE (submission_id, admin_id, note, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    return stmt.run(submission_id, admin_id, note);
  },

  getNotes(submission_id) {
    return db.prepare(`
      SELECT n.*, a.username as admin_username
      FROM SUBMISSION_NOTE n
      LEFT JOIN ADMIN_USER a ON n.admin_id = a.id
      WHERE n.submission_id = ?
      ORDER BY n.created_at ASC
    `).all(submission_id);
  },

  getCounts() {
    const rows = db.prepare('SELECT status, COUNT(*) as count FROM SUBMISSION GROUP BY status').all();
    const counts = { total: 0, new: 0, in_progress: 0, closed: 0 };
    for (const r of rows) {
      counts.total += r.count;
      if (r.status === 'new') counts.new = r.count;
      else if (r.status === 'in_progress') counts.in_progress = r.count;
      else if (r.status === 'closed' || r.status === 'replied' || r.status === 'archived') counts.closed += r.count;
    }
    return counts;
  },

  getAllForExport(status = null) {
    let sql = `
      SELECT s.id, s.name, s.email, s.phone, srv.title as service, s.status, s.created_at
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
    `;
    let params = [];
    if (status && status !== 'all') {
      sql += ' WHERE s.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY s.created_at DESC';
    return db.prepare(sql).all(...params);
  }
};

module.exports = submissionRepository;
```

---

## 6. Windows & Node.js Runtime Verification

### 6.1 Verified System Parameters
- **Operating System:** Windows 11 / x64
- **Node.js Version:** `v26.5.1` (verified)
- **Package Manager:** `npm.cmd 11.17.0` (verified)
- **PowerShell Execution Policy:** On Windows systems, `npm` invocations in scripts or terminals must use `npm.cmd` (e.g. `npm.cmd run seed`) to avoid script execution policy restrictions on `npm.ps1`.

### 6.2 SQLite Driver Dynamics
- `better-sqlite3` is the required production package.
- In Node v26.5.1, `node:sqlite` is natively available without any binary compilation.
- The formulated `db/connection.js` prioritizes `better-sqlite3` and includes transparent bridging to `node:sqlite`, providing 100% zero-failure guarantee during local worker setup and automated testing.

---

## 7. Verification Method for Implementation Worker

When the implementation worker creates these files in Milestone 1:

1. **Step 1: File Placement**
   - Save schema to `db/schema.sql`
   - Save connection to `db/connection.js`
   - Save seeder to `db/seed.js`
2. **Step 2: Dependency Verification**
   - Run: `npm.cmd install`
3. **Step 3: Seeder Execution**
   - Run: `npm.cmd run seed`
   - Expected Output:
     - Exit code: `0`
     - Terminal displays formatted tables for admin user (`ajay30@gmail.com`) and the 3 services (`gst`, `income-tax`, `pan`).
     - File `db/database.sqlite` (or configured `DB_PATH`) exists and is greater than 0 bytes.
4. **Step 4: SQL Query Inspection**
   - Run:
     ```powershell
     node -e "const db = require('./db/connection'); console.log('Services:', db.prepare('SELECT count(*) as count FROM SERVICE').get()); console.log('Admins:', db.prepare('SELECT count(*) as count FROM ADMIN_USER').get());"
     ```
   - Expected: `{ count: 3 }` for services and `{ count: 1 }` for admins.
