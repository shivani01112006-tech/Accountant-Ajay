# Milestone 1 Exploration Report: Server Setup, Configuration & Verification Strategy

**Agent:** `m1_explorer_3`  
**Milestone:** M1 — Scaffold & Foundation  
**Target Workspace:** `d:/website ajay`  
**Date:** 2026-10-07  

---

## 1. Executive Summary

This report establishes the architectural blueprint, concrete code specifications, and automated verification strategy for **Milestone 1 (Scaffold & Foundation)** regarding:
1. **Express Server Initialization (`server.js`)**: Application setup, middleware pipeline, EJS view engine, static asset hosting, baseline route `GET /`, 404 handler, error handling middleware, and port listener.
2. **Configuration & Environment Management (`.env.example`, `.env`, `config/index.js`, `config/features.js`)**: Full environment variable catalog, sensible development fallbacks, centralized config validation, and modular feature flag management.
3. **Worker Verification Strategy**: Automated, self-closing verification scripts and exact Windows command-line workflows (`npm.cmd`) to test database seeding, server booting, and HTTP response codes without hanging terminal processes.

---

## 2. Server Initialization Architecture (`server.js`)

### 2.1 Design Objectives
- **Encapsulation & Testability**: Decouple the Express `app` declaration from the port listening trigger (`app.listen`) using `if (require.main === module)` and `module.exports = app`. This allows automated test harnesses (opaque-box runners, Supertest, ephemeral in-process checkers) to import `app` directly without port collisions.
- **Middleware Pipeline Ordering**:
  1. Built-in body parsing: `express.urlencoded({ extended: true })` for standard HTML form submissions (Contact & Admin login), `express.json()` for JSON payloads (Chatbot & future AJAX).
  2. Static file serving: `express.static(path.join(__dirname, 'public'))` for CSS, client JS, images, fonts.
  3. Template engine: `ejs` registered with `views` directory configured to `path.join(__dirname, 'views')`.
  4. Core / Health routes: `GET /` baseline verification, `GET /health` JSON health check.
  5. 404 Not Found catch-all handler.
  6. 500 Global Error Handling Middleware (`(err, req, res, next)`).
- **Graceful Lifecycle Management**: Clean console startup logging (`Server running on port 3000`) and graceful handling of `SIGINT` / `SIGTERM`.

### 2.2 Complete Concrete Implementation: `server.js`

```javascript
/**
 * Ajay Singla Accounting Portfolio - Main Application Server
 * Milestone 1: Scaffold & Foundation
 */

const path = require('path');
const express = require('express');
const config = require('./config');
const { isFeatureEnabled } = require('./config/features');

const app = express();

// ============================================================================
// 1. View Engine Setup (EJS)
// ============================================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================================
// 2. Core Middleware
// ============================================================================
// Static file serving from /public
app.use(express.static(path.join(__dirname, 'public')));

// Body parsers for URL-encoded forms (contact, admin login) and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Pass common app variables to all views (features, year, current path)
app.use((req, res, next) => {
  res.locals.features = {
    contactForm: isFeatureEnabled('contactForm'),
    adminDashboard: isFeatureEnabled('adminDashboard'),
    chatbot: isFeatureEnabled('chatbot')
  };
  res.locals.currentYear = new Date().getFullYear();
  res.locals.currentPath = req.path;
  next();
});

// ============================================================================
// 3. Routes & Endpoints
// ============================================================================

// Lightweight JSON health check endpoint for monitoring / automation
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// Baseline GET / route for Milestone 1 verification
// In M1, renders baseline home template if present, or sends structured 200 HTML
app.get('/', (req, res, next) => {
  try {
    // Attempt rendering pages/home.ejs if present
    res.status(200).render('pages/home', {
      title: 'Ajay Singla | Accounting & Tax Consultant',
      statusMessage: 'System Operational'
    });
  } catch (err) {
    // If template is missing or in progress during M1 scaffolding, fallback cleanly
    if (err.message && err.message.includes('Failed to lookup view')) {
      return res.status(200).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Ajay Singla - Accounting Portfolio</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0b0b0c; color: #f5f5f5; display: grid; place-content: center; height: 100vh; margin: 0; }
            .card { background: #151517; padding: 2rem 3rem; border: 1px solid #2a2a2d; border-radius: 8px; text-align: center; }
            h1 { margin-bottom: 0.5rem; font-size: 1.5rem; }
            p { color: #a1a1a6; margin: 0; }
            .badge { display: inline-block; margin-top: 1rem; padding: 0.25rem 0.75rem; background: #2e7d32; color: #fff; border-radius: 999px; font-size: 0.85rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Ajay Singla & Associates</h1>
            <p>Accounting, Tax Filing & Advisory Services</p>
            <div class="badge">Milestone 1 Foundation Active</div>
          </div>
        </body>
        </html>
      `);
    }
    next(err);
  }
});

// Note for M2/M3: Future modular routes will mount here:
// app.use('/', require('./modules/public/publicRoutes'));
// app.use('/contact', require('./modules/contact/contactRoutes'));
// app.use('/admin', require('./modules/admin/adminRoutes'));

// ============================================================================
// 4. 404 Catch-All Middleware
// ============================================================================
app.use((req, res) => {
  res.status(404);
  try {
    res.render('pages/404', { url: req.originalUrl });
  } catch {
    if (req.accepts('html')) {
      res.send(`<h1>404 Not Found</h1><p>Cannot find ${req.originalUrl}</p>`);
    } else if (req.accepts('json')) {
      res.json({ error: 'Not Found', path: req.originalUrl });
    } else {
      res.type('txt').send('404 Not Found');
    }
  }
});

// ============================================================================
// 5. 500 Error-Handling Middleware (Must have 4 arguments)
// ============================================================================
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.status || err.statusCode || 500;
  console.error(`[Server Error ${statusCode}]`, err);

  res.status(statusCode);

  const errorData = {
    message: err.message || 'Internal Server Error',
    error: config.isProduction ? null : err.stack
  };

  try {
    res.render('pages/500', errorData);
  } catch {
    if (req.accepts('html')) {
      res.send(`<h1>500 Internal Server Error</h1><p>${config.isProduction ? 'An unexpected error occurred.' : err.message}</p>`);
    } else {
      res.json(errorData);
    }
  }
});

// ============================================================================
// 6. Server Listener & Startup
// ============================================================================
let server = null;
if (require.main === module) {
  const PORT = config.port;
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Graceful shutdown hooks
  const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down cleanly...`);
    if (server) {
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;
```

---

## 3. Configuration & Environment (`.env`, `config/index.js`, `config/features.js`)

### 3.1 Environment Variables Catalog
The following environment variables are specified with their descriptions, security roles, and default fallbacks:

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `PORT` | Optional | `3000` | Port for Express HTTP listener. Parsed as an integer. |
| `NODE_ENV` | Optional | `development` | Environment mode (`development`, `production`, `test`). Affects cookie security & stack traces. |
| `DB_PATH` | Optional | `./db/database.sqlite` | SQLite database file location. Resolved to an absolute path via `path.resolve`. |
| `SESSION_SECRET` | Mandatory in Prod | `dev-insecure-secret-ajay-singla-session-2026-min-32-chars` | Secret key for signing session cookies (`express-session`). |
| `ADMIN_EMAIL` | Optional | `ajay30@gmail.com` | Email address for Ajay Singla / administrator login. |
| `ADMIN_USERNAME` | Optional | `ajay30@gmail.com` | Username for admin login (defaults to `ADMIN_EMAIL`). |
| `ADMIN_PASSWORD` | Optional | `Admin@12345` | Plaintext password used during initial database seeding (`db/seed.js`). |
| `IP_HASH_SALT` | Mandatory in Prod | `dev-salt-ajay-singla-ip-hash-2026-secret` | Salt for SHA-256 IP hashing (`ORIGINAL_REQUEST §R3`) to ensure raw IPs are never stored in SQLite. |

### 3.2 Concrete Specification: `.env.example`

```env
# ============================================================================
# Ajay Singla Accounting Portfolio - Environment Configuration Template
# Copy this file to .env before starting the application:
#   copy .env.example .env
# ============================================================================

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Relative to project root or absolute)
DB_PATH=./db/database.sqlite

# Security & Session Secrets
# In production, replace with a strong random 32+ character string
SESSION_SECRET=dev-insecure-secret-ajay-singla-session-2026-min-32-chars

# Salt for SHA-256 IP hashing (avoids storing raw IP addresses)
IP_HASH_SALT=dev-salt-ajay-singla-ip-hash-2026-secret

# Initial Admin Credentials (used by npm.cmd run seed)
ADMIN_EMAIL=ajay30@gmail.com
ADMIN_USERNAME=ajay30@gmail.com
ADMIN_PASSWORD=Admin@12345
```

### 3.3 Concrete Specification: `config/index.js`

```javascript
/**
 * Centralized Configuration Module
 * Loads environment variables and provides validated defaults.
 */

const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const config = {
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv,
  isProduction,
  isTest,

  db: {
    // Resolve relative DB paths against project root, or default to db/database.sqlite
    path: process.env.DB_PATH
      ? path.resolve(process.cwd(), process.env.DB_PATH)
      : path.resolve(__dirname, '../db/database.sqlite')
  },

  session: {
    secret: process.env.SESSION_SECRET || 'dev-insecure-secret-ajay-singla-session-2026-min-32-chars',
    maxAgeMs: 30 * 60 * 1000 // 30 minutes rolling timeout per ORIGINAL_REQUEST §R4
  },

  security: {
    ipHashSalt: process.env.IP_HASH_SALT || 'dev-salt-ajay-singla-ip-hash-2026-secret'
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'ajay30@gmail.com',
    username: process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || 'ajay30@gmail.com',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345'
  }
};

// Safety warning in production
if (isProduction && config.session.secret.startsWith('dev-insecure')) {
  console.warn('[SECURITY WARNING] Running in production with default SESSION_SECRET!');
}

module.exports = Object.freeze(config);
```

### 3.4 Concrete Specification: `config/features.js`

Per `architecture.md` (Line 39):
> *"Extension rule: a new feature = a new folder in `modules/` + one line in `config/features.js` (`blog: true`)."*

```javascript
/**
 * Feature Flags Configuration
 * Modular toggles for core and optional application capabilities.
 */

const features = {
  // Milestone 1-5 Core Features
  contactForm: true,       // Contact enquiry submission and storage (Phase 4)
  adminDashboard: true,    // Admin panel, authentication, and CSV export (Phase 5)
  servicesCatalog: true,   // Dynamic services listing from database (Phase 3)

  // Extension Features (Default off for MVP)
  chatbot: false,          // Side FAQ chatbot widget (Planned Phase 6 / Phase 10)
  analytics: false,        // Google Analytics 4 tracking (Planned Phase 7)
  blog: false,             // Tax updates & articles (Future plugin)
  appointmentBooking: false // Calendar booking integration (Future plugin)
};

/**
 * Check if a feature flag is currently active
 * @param {string} featureName
 * @returns {boolean}
 */
function isFeatureEnabled(featureName) {
  return Boolean(features[featureName]);
}

module.exports = {
  features: Object.freeze(features),
  isFeatureEnabled
};
```

---

## 4. Verification Strategy for Worker

### 4.1 Windows Execution Environment Constraints
1. **PowerShell Script Execution Restriction**:
   On this Windows host, executing `npm` triggers:
   `npm : File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled on this system.`
   **Rule:** The Worker MUST ALWAYS execute `npm.cmd` directly (e.g. `npm.cmd install`, `npm.cmd run seed`, `npm.cmd test`).
2. **Interactive Server Lockup Prevention**:
   Running `node server.js` interactively will block the terminal synchronously.
   To test server startup and HTTP responses safely, the Worker must execute a **self-closing automated verification script** that binds the Express app, performs HTTP queries, asserts responses, closes the server, and terminates with exit code 0.

### 4.2 Automated In-Process Verification Script: `tests/m1-verify.js`

The Worker should create and execute this standalone verification test:

```javascript
/**
 * Milestone 1 Self-Closing Verification Test
 * Path: tests/m1-verify.js
 * Run via: node tests/m1-verify.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('--- STARTING MILESTONE 1 VERIFICATION ---');

// 1. Verify Configuration Modules
try {
  const config = require('../config');
  const { isFeatureEnabled } = require('../config/features');
  console.log(`[PASS] Config loaded successfully (Port: ${config.port}, Env: ${config.nodeEnv})`);
  console.log(`[PASS] Feature flags loaded (contactForm: ${isFeatureEnabled('contactForm')})`);
} catch (err) {
  console.error('[FAIL] Failed loading config/index.js or config/features.js:', err.message);
  process.exit(1);
}

// 2. Verify Database File Existence & Seed Content
try {
  const config = require('../config');
  if (!fs.existsSync(config.db.path)) {
    console.error(`[FAIL] SQLite database file not found at: ${config.db.path}`);
    console.error('Did you run npm.cmd run seed?');
    process.exit(1);
  }
  console.log(`[PASS] Database file exists at: ${config.db.path} (${fs.statSync(config.db.path).size} bytes)`);

  const Database = require('better-sqlite3');
  const db = new Database(config.db.path, { readonly: true });
  
  const adminRow = db.prepare('SELECT id, username FROM ADMIN_USER LIMIT 1').get();
  if (!adminRow) {
    console.error('[FAIL] ADMIN_USER table is empty!');
    process.exit(1);
  }
  console.log(`[PASS] Seeded Admin User verified: id=${adminRow.id}, username=${adminRow.username}`);

  const services = db.prepare('SELECT slug, title FROM SERVICE ORDER BY id ASC').all();
  if (services.length < 3) {
    console.error(`[FAIL] Expected at least 3 services, found ${services.length}`);
    process.exit(1);
  }
  console.log(`[PASS] Seeded Services verified (${services.length} items):`, services.map(s => s.slug).join(', '));
  db.close();
} catch (err) {
  console.error('[FAIL] Database verification error:', err.message);
  process.exit(1);
}

// 3. Verify Express Server & HTTP Responses (Self-Closing)
try {
  const app = require('../server');

  // Bind to ephemeral port 0 (OS assigns an open port automatically)
  const server = app.listen(0, '127.0.0.1', () => {
    const assignedPort = server.address().port;
    console.log(`[PASS] Express app successfully bound to test port ${assignedPort}`);

    // Test A: GET / -> Expect 200
    http.get(`http://127.0.0.1:${assignedPort}/`, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          console.error(`[FAIL] GET / returned HTTP ${res.statusCode}, expected 200`);
          server.close();
          process.exit(1);
        }
        console.log(`[PASS] GET / responded with HTTP 200 (Body length: ${body.length} bytes)`);

        // Test B: GET /health -> Expect 200 JSON
        http.get(`http://127.0.0.1:${assignedPort}/health`, (hRes) => {
          let hBody = '';
          hRes.on('data', chunk => { hBody += chunk; });
          hRes.on('end', () => {
            if (hRes.statusCode !== 200) {
              console.error(`[FAIL] GET /health returned HTTP ${hRes.statusCode}`);
              server.close();
              process.exit(1);
            }
            console.log(`[PASS] GET /health responded with HTTP 200 JSON: ${hBody.trim()}`);

            // Test C: GET /non-existent-route-check -> Expect 404
            http.get(`http://127.0.0.1:${assignedPort}/non-existent-route-check`, (errRes) => {
              if (errRes.statusCode !== 404) {
                console.error(`[FAIL] GET /non-existent returned HTTP ${errRes.statusCode}, expected 404`);
                server.close();
                process.exit(1);
              }
              console.log(`[PASS] GET /non-existent responded with HTTP 404 as expected`);

              // Clean shutdown
              server.close(() => {
                console.log('--- ALL MILESTONE 1 CHECKS PASSED (EXIT CODE 0) ---');
                process.exit(0);
              });
            });
          });
        });
      });
    }).on('error', (err) => {
      console.error('[FAIL] HTTP GET request failed:', err.message);
      server.close();
      process.exit(1);
    });
  });
} catch (err) {
  console.error('[FAIL] Server startup failed:', err.message);
  process.exit(1);
}
```

### 4.3 Exact Worker Command Sequence
The Worker can execute and verify Milestone 1 completely using this sequence:

```powershell
# 1. Install dependencies
npm.cmd install

# 2. Copy environment template to .env (if not created)
copy .env.example .env

# 3. Seed database
npm.cmd run seed

# 4. Run automated M1 verification suite
node tests/m1-verify.js
```

---

## 5. Milestone 1 Acceptance Criteria Checklist

| Checkpoint | Requirement | Verification Method |
|---|---|---|
| **AC-1** | `package.json` contains required dependencies (`express`, `ejs`, `better-sqlite3`, `dotenv`, `bcrypt`, `express-session`, `helmet`, `express-rate-limit`, `validator`) and npm scripts (`start`, `seed`, `test`). | `view_file` on `package.json` |
| **AC-2** | `npm.cmd install` completes cleanly with exit code 0. | Exit code check |
| **AC-3** | `.env.example` and `.env` contain all 8 specified configuration variables. | Verification via `config/index.js` load |
| **AC-4** | `config/index.js` exports validated `port`, `db.path`, `session`, `security`, `admin` properties. | `node -e "require('./config')"` |
| **AC-5** | `config/features.js` provides feature flags and `isFeatureEnabled()`. | `node -e "require('./config/features')"` |
| **AC-6** | `db/schema.sql` defines `ADMIN_USER`, `SERVICE`, `SUBMISSION`, `SUBMISSION_NOTE`, `CHAT_*` tables. | Verified in DB inspection |
| **AC-7** | `npm.cmd run seed` executes without error (exit code 0) and creates `db/database.sqlite`. | File exists & size > 0 |
| **AC-8** | Seeded database contains 1 admin user and 3 services (`gst`, `income-tax`, `pan`). | SQL query check |
| **AC-9** | `server.js` initializes Express, sets EJS view engine, serves `public/`, and exports `app`. | `node tests/m1-verify.js` |
| **AC-10** | `GET /` returns HTTP 200. | `node tests/m1-verify.js` |
| **AC-11** | Unmatched routes return HTTP 404. | `node tests/m1-verify.js` |
| **AC-12** | Clean startup logging output (`Server running on port 3000`). | Visual inspection during `node server.js` |
