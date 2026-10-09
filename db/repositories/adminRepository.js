const db = require('../connection');

const adminRepository = {
  async findByUsername(identifier) {
    if (!identifier) return undefined;
    const cleanIdentifier = identifier.trim().toLowerCase();
    const { rows } = await db.query('SELECT * FROM ADMIN_USER WHERE username = $1 OR email = $2', [cleanIdentifier, cleanIdentifier]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await db.query('SELECT id, username, email, role, failed_attempts, locked_until, created_at FROM ADMIN_USER WHERE id = $1', [id]);
    return rows[0];
  },

  async recordFailedAttempt(id, maxAttempts = 5, lockoutDurationMs = 15 * 60 * 1000) {
    const { rows: userRows } = await db.query('SELECT failed_attempts FROM ADMIN_USER WHERE id = $1', [id]);
    if (userRows.length === 0) return null;
    const user = userRows[0];

    const newAttempts = (user.failed_attempts || 0) + 1;
    let lockedUntil = null;
    if (newAttempts >= maxAttempts) {
      lockedUntil = new Date(Date.now() + lockoutDurationMs).toISOString();
    }

    await db.query('UPDATE ADMIN_USER SET failed_attempts = $1, locked_until = $2 WHERE id = $3', [newAttempts, lockedUntil, id]);

    return { failed_attempts: newAttempts, locked_until: lockedUntil };
  },

  async resetLockout(id) {
    return await db.query('UPDATE ADMIN_USER SET failed_attempts = 0, locked_until = NULL WHERE id = $1', [id]);
  },

  async updatePassword(id, passwordHash) {
    return await db.query('UPDATE ADMIN_USER SET password_hash = $1, failed_attempts = 0, locked_until = NULL WHERE id = $2', [passwordHash, id]);
  }
};

module.exports = adminRepository;
