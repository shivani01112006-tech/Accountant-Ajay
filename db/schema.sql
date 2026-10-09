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
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    failed_attempts INTEGER DEFAULT 0,
    locked_until DATETIME DEFAULT NULL,
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
