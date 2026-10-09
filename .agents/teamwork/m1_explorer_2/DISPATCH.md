## 2026-10-07T17:24:14Z
You are m1_explorer_2, an exploration agent for Milestone 1 (Scaffold & Foundation).
Your working directory is d:/website ajay/.agents/teamwork/m1_explorer_2.
You MUST read:
1. d:/website ajay/.agents/teamwork/ORIGINAL_REQUEST.md
2. d:/website ajay/.agents/teamwork/orchestrator_1/PROJECT.md
3. d:/website ajay/architecture.md and d:/website ajay/memory.md

TASK:
Analyze and formulate the exact database specifications, DDL schema, connection wrapper, and seed script for Milestone 1.
1. DDL Schema (`db/schema.sql`):
   - Table `ADMIN_USER` (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, failed_attempts INTEGER DEFAULT 0, locked_until DATETIME, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)
   - Table `SERVICE` (id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL, summary TEXT NOT NULL, description TEXT, sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)
   - Table `SUBMISSION` (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, service_id INTEGER, message TEXT NOT NULL, status TEXT DEFAULT 'new', ip_hash TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (service_id) REFERENCES SERVICE(id))
   - Table `SUBMISSION_NOTE` (id INTEGER PRIMARY KEY AUTOINCREMENT, submission_id INTEGER NOT NULL, admin_id INTEGER NOT NULL, note TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (submission_id) REFERENCES SUBMISSION(id), FOREIGN KEY (admin_id) REFERENCES ADMIN_USER(id))
   - Table `CHAT_SESSION`, `CHAT_MESSAGE`
   - Indexes on `SUBMISSION(status)`, `SUBMISSION(created_at)`, `SERVICE(slug)`.
2. Connection (`db/connection.js`):
   - SQLite initialization with WAL mode (`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`).
   - Resilient database path resolution from `process.env.DB_PATH || path.join(__dirname, 'database.sqlite')`.
   - Export prepared statement helpers or database instance.
3. Seeding (`db/seed.js`):
   - Executable via `npm.cmd run seed` (`node db/seed.js`).
   - Reads `.env` for admin credentials (`ADMIN_EMAIL` / `ADMIN_USERNAME`, `ADMIN_PASSWORD`), hashes password with bcrypt (cost factor 10), upserts admin user.
   - Populates 3 initial services:
     - GST: slug "gst", title "GST Registration & Filing"
     - Income Tax: slug "income-tax", title "Income Tax Return (ITR) Filing"
     - PAN: slug "pan", title "PAN Card Application & Assistance"
   - Logs clean verification output.

OUTPUT REQUIREMENTS:
Write your findings to d:/website ajay/.agents/teamwork/m1_explorer_2/report.md and write d:/website ajay/.agents/teamwork/m1_explorer_2/handoff.md following the Handoff Protocol.
Update progress.md for liveness.
Notify the orchestrator via send_message when complete.
