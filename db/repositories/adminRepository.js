/**
 * Admin Repository
 * Handles authentication, lockout management, and credentials for ADMIN_USER
 */

const db = require('../connection');

const adminRepository = {
  /**
   * Find administrator record by username or email
   * @param {string} identifier
   * @returns {Object|undefined}
   */
  findByUsername(identifier) {
    if (!identifier) return undefined;
    const cleanIdentifier = identifier.trim().toLowerCase();
    return db.prepare('SELECT * FROM ADMIN_USER WHERE username = ? OR email = ?').get(cleanIdentifier, cleanIdentifier);
  },

  /**
   * Find administrator by ID
   * @param {number} id
   * @returns {Object|undefined}
   */
  findById(id) {
    return db.prepare('SELECT id, username, email, role, failed_attempts, locked_until, created_at FROM ADMIN_USER WHERE id = ?').get(id);
  },

  /**
   * Record a failed login attempt; lock out if threshold exceeded
   * @param {number} id
   * @param {number} maxAttempts
   * @param {number} lockoutDurationMs
   * @returns {Object|null}
   */
  recordFailedAttempt(id, maxAttempts = 5, lockoutDurationMs = 15 * 60 * 1000) {
    const user = db.prepare('SELECT failed_attempts FROM ADMIN_USER WHERE id = ?').get(id);
    if (!user) return null;

    const newAttempts = (user.failed_attempts || 0) + 1;
    let lockedUntil = null;
    if (newAttempts >= maxAttempts) {
      lockedUntil = new Date(Date.now() + lockoutDurationMs).toISOString();
    }

    db.prepare('UPDATE ADMIN_USER SET failed_attempts = ?, locked_until = ? WHERE id = ?')
      .run(newAttempts, lockedUntil, id);

    return { failed_attempts: newAttempts, locked_until: lockedUntil };
  },

  /**
   * Reset failed login counter and clear lockout state
   * @param {number} id
   * @returns {Object}
   */
  resetLockout(id) {
    return db.prepare('UPDATE ADMIN_USER SET failed_attempts = 0, locked_until = NULL WHERE id = ?').run(id);
  },

  /**
   * Update admin password hash
   * @param {number} id
   * @param {string} passwordHash
   * @returns {Object}
   */
  updatePassword(id, passwordHash) {
    return db.prepare('UPDATE ADMIN_USER SET password_hash = ?, failed_attempts = 0, locked_until = NULL WHERE id = ?')
      .run(passwordHash, id);
  }
};

module.exports = adminRepository;
