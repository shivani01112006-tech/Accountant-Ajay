/**
 * Database Connection Module
 * Ajay Singla Portfolio & Management Platform
 * 
 * Provides a resilient dual-driver SQLite wrapper (better-sqlite3 with
 * graceful fallback to Node.js v26 built-in node:sqlite DatabaseSync)
 * with WAL mode enabled and foreign keys enforced.
 */

const fs = require('fs');
const path = require('path');
const config = require('../config');

// Resolve database path
const rawDbPath = (config.db && config.db.path) || process.env.DB_PATH || path.join(__dirname, 'database.sqlite');
const dbPath = path.isAbsolute(rawDbPath)
  ? rawDbPath
  : path.resolve(process.cwd(), rawDbPath);

// Ensure the directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let dbInstance = null;
let activeDriver = 'none';

function createDatabaseConnection() {
  if (dbInstance) return dbInstance;

  // 1. Primary Driver: Try better-sqlite3
  try {
    const BetterSqlite3 = require('better-sqlite3');
    const bDb = new BetterSqlite3(dbPath);

    bDb.pragma('journal_mode = WAL');
    bDb.pragma('foreign_keys = ON');
    bDb.pragma('synchronous = NORMAL');

    activeDriver = 'better-sqlite3';

    // Wrap or augment with uniform API and helper methods
    dbInstance = {
      rawDb: bDb,
      driver: activeDriver,
      prepare: (sql) => bDb.prepare(sql),
      exec: (sql) => bDb.exec(sql),
      pragma: (str) => bDb.pragma(str),
      transaction: (fn) => bDb.transaction(fn),
      close: () => bDb.close(),

      // Shorthand query helpers
      get: (sql, ...params) => bDb.prepare(sql).get(...params),
      all: (sql, ...params) => bDb.prepare(sql).all(...params),
      run: (sql, ...params) => bDb.prepare(sql).run(...params)
    };

    return dbInstance;
  } catch (betterSqliteErr) {
    // 2. Resilient Driver: Built-in node:sqlite (Node 22+)
    try {
      const { DatabaseSync } = require('node:sqlite');
      const rawDb = new DatabaseSync(dbPath);

      rawDb.exec('PRAGMA journal_mode = WAL;');
      rawDb.exec('PRAGMA foreign_keys = ON;');
      rawDb.exec('PRAGMA synchronous = NORMAL;');

      activeDriver = 'node:sqlite';

      dbInstance = {
        rawDb,
        driver: activeDriver,
        exec: (sql) => rawDb.exec(sql),
        pragma: (str) => rawDb.exec(`PRAGMA ${str};`),
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
            rawDb.exec('BEGIN IMMEDIATE;');
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
        close: () => rawDb.close(),

        // Shorthand query helpers
        get: (sql, ...params) => {
          const stmt = rawDb.prepare(sql);
          return stmt.get(...params);
        },
        all: (sql, ...params) => {
          const stmt = rawDb.prepare(sql);
          return stmt.all(...params);
        },
        run: (sql, ...params) => {
          const stmt = rawDb.prepare(sql);
          return stmt.run(...params);
        }
      };

      return dbInstance;
    } catch (nodeSqliteErr) {
      console.error('[DB] Fatal: Failed to initialize SQLite using either better-sqlite3 or node:sqlite.');
      console.error('[DB] better-sqlite3 error:', betterSqliteErr.message);
      console.error('[DB] node:sqlite error:', nodeSqliteErr.message);
      throw nodeSqliteErr;
    }
  }
}

const db = createDatabaseConnection();

/**
 * Initializes database tables and indexes from db/schema.sql
 */
db.initDatabase = function () {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  } else {
    throw new Error(`Schema file not found at: ${schemaPath}`);
  }
};

/**
 * Gracefully close database connection
 */
db.closeDatabase = function () {
  if (db && typeof db.close === 'function') {
    db.close();
  }
};

module.exports = db;
