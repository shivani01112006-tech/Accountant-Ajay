## 2026-10-07T17:33:43Z
You are m1_worker_1, a worker agent implementing Milestone 1 (Scaffold & Foundation) for Ajay Singla's portfolio website.
Your working directory is d:/website ajay/.agents/teamwork/m1_worker_1.

You MUST read:
1. d:/website ajay/.agents/teamwork/ORIGINAL_REQUEST.md
2. d:/website ajay/.agents/teamwork/orchestrator_1/PROJECT.md
3. Explorer reports:
   - d:/website ajay/.agents/teamwork/m1_explorer_1/report.md
   - d:/website ajay/.agents/teamwork/m1_explorer_2/report.md
   - d:/website ajay/.agents/teamwork/m1_explorer_3/report.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

WRITE OWNERSHIP:
You exclusively own and may create/modify the following files in d:/website ajay/:
- package.json
- .env.example, .env
- config/index.js, config/features.js
- db/schema.sql, db/connection.js, db/seed.js
- db/repositories/serviceRepository.js, db/repositories/submissionRepository.js, db/repositories/adminRepository.js
- server.js
- views/layouts/main.ejs, views/partials/navbar.ejs, views/partials/footer.ejs, views/pages/home.ejs, views/pages/404.ejs, views/pages/500.ejs
- public/css/tokens.css, public/css/base.css, public/css/components.css
- tests/m1-verify.js

TASK:
1. Initialize package.json:
   - scripts: "start": "node server.js", "seed": "node db/seed.js", "test": "node tests/m1-verify.js"
   - dependencies: express, ejs, better-sqlite3, dotenv, bcrypt, bcryptjs, express-session, helmet, express-rate-limit, validator.
   - Run `npm.cmd install` (MUST use npm.cmd on this Windows setup).
2. Create folder layout: config, db, db/repositories, modules, views/layouts, views/partials, views/pages, views/admin, public/css, public/js, public/img, middleware, tests.
3. Create db/schema.sql:
   - Tables: ADMIN_USER, SERVICE, SUBMISSION, SUBMISSION_NOTE, CHAT_SESSION, CHAT_MESSAGE, plus indexes on status, created_at, slug.
4. Create db/connection.js:
   - Dual-driver SQLite wrapper (tries better-sqlite3; if native binding error on Node 26 ABI 147, gracefully uses built-in node:sqlite DatabaseSync) providing uniform API (`prepare`, `run`, `get`, `all`, `exec`, `transaction`).
   - Enable WAL mode (`PRAGMA journal_mode = WAL`) and foreign keys (`PRAGMA foreign_keys = ON`).
5. Create db/seed.js:
   - Reads admin credentials from .env (defaults: admin@ajaysingla.com / AdminSecure123!).
   - Hashes password with bcrypt (or bcryptjs fallback) cost factor 10.
   - Seeds admin user.
   - Seeds the 3 required services: GST (slug: gst), Income Tax (slug: income-tax), PAN (slug: pan).
6. Create db repositories: serviceRepository.js, submissionRepository.js, adminRepository.js.
7. Create .env.example, .env, config/index.js, config/features.js.
8. Create server.js:
   - Express server with EJS view engine, static assets from public, GET / rendering home page, GET /health returning { status: 'ok', uptime }, 404 handler, 500 error handler.
   - Decoupled app and listen (only listen if require.main === module).
9. Create starter views and basic CSS tokens so GET / returns HTTP 200 with navbar and footer partials.
10. VERIFICATION:
   - Run `npm.cmd install`
   - Run `npm.cmd run seed`
   - Run `node tests/m1-verify.js` (or test server startup and HTTP responses)
   - Ensure all commands exit 0 and test queries succeed.

OUTPUT REQUIREMENTS:
Write your implementation report to d:/website ajay/.agents/teamwork/m1_worker_1/report.md.
Write your handoff report to d:/website ajay/.agents/teamwork/m1_worker_1/handoff.md following the Handoff Protocol (Observation, Logic Chain, Caveats, Conclusion, Verification Method with exact command outputs).
Update progress.md for liveness.
Notify orchestrator via send_message when complete.
