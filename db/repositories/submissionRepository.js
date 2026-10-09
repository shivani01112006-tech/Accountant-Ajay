/**
 * Submission Repository
 * Handles database operations for contact submissions and internal notes
 */

const db = require('../connection');

const submissionRepository = {
  /**
   * Create a new contact submission
   * @param {Object} data
   * @returns {number|bigint} lastInsertRowid
   */
  create({ name, email, phone, service_id, message, ip_hash }) {
    const stmt = db.prepare(`
      INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash, created_at)
      VALUES (?, ?, ?, ?, ?, 'new', ?, datetime('now'))
    `);
    const info = stmt.run(name, email, phone, service_id || null, message, ip_hash);
    return info.lastInsertRowid;
  },

  /**
   * Get single submission by ID with joined service details
   * @param {number} id
   * @returns {Object|undefined}
   */
  getById(id) {
    const stmt = db.prepare(`
      SELECT s.*, srv.title as service_title, srv.slug as service_slug
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
      WHERE s.id = ?
    `);
    return stmt.get(id);
  },

  /**
   * List submissions with optional filtering, search, and pagination
   * @param {Object} options
   * @returns {Object} { items, total, page, limit, totalPages }
   */
  list({ status = null, search = null, page = 1, limit = 10 } = {}) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (safePage - 1) * safeLimit;

    const whereClauses = [];
    const params = [];

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

    // Total count query
    const countRow = db.prepare(`SELECT COUNT(*) as count FROM SUBMISSION s ${whereSql}`).get(...params);
    const total = countRow ? countRow.count : 0;

    // Paginated list query
    const items = db.prepare(`
      SELECT s.*, srv.title as service_title, srv.slug as service_slug
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
      ${whereSql}
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, safeLimit, offset);

    return {
      items,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1
    };
  },

  /**
   * Update the status of a submission
   * @param {number} id
   * @param {string} status
   * @returns {Object}
   */
  updateStatus(id, status) {
    return db.prepare('UPDATE SUBMISSION SET status = ? WHERE id = ?').run(status, id);
  },

  /**
   * Add an internal note to a submission
   * @param {number} submission_id
   * @param {number} admin_id
   * @param {string} note
   * @returns {Object}
   */
  addNote(submission_id, admin_id, note) {
    const stmt = db.prepare(`
      INSERT INTO SUBMISSION_NOTE (submission_id, admin_id, note, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    return stmt.run(submission_id, admin_id, note);
  },

  /**
   * Get all internal notes for a submission
   * @param {number} submission_id
   * @returns {Array<Object>}
   */
  getNotes(submission_id) {
    return db.prepare(`
      SELECT n.*, a.username as admin_username
      FROM SUBMISSION_NOTE n
      LEFT JOIN ADMIN_USER a ON n.admin_id = a.id
      WHERE n.submission_id = ?
      ORDER BY n.created_at ASC
    `).all(submission_id);
  },

  /**
   * Get aggregate submission counts by status
   * @returns {Object} { total, new, in_progress, closed }
   */
  getCounts() {
    const rows = db.prepare('SELECT status, COUNT(*) as count FROM SUBMISSION GROUP BY status').all();
    const counts = { total: 0, new: 0, in_progress: 0, closed: 0 };
    for (const r of rows) {
      counts.total += r.count;
      if (r.status === 'new') {
        counts.new = r.count;
      } else if (r.status === 'in_progress') {
        counts.in_progress = r.count;
      } else if (r.status === 'closed' || r.status === 'replied' || r.status === 'archived') {
        counts.closed += r.count;
      }
    }
    return counts;
  },

  /**
   * Export submissions for CSV reporting
   * @param {string|null} status
   * @returns {Array<Object>}
   */
  getAllForExport(status = null) {
    let sql = `
      SELECT s.id, s.name, s.email, s.phone, srv.title as service, s.status, s.created_at
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
    `;
    const params = [];
    if (status && status !== 'all') {
      sql += ' WHERE s.status = ?';
      params.push(status);
    }
    sql += ' ORDER BY s.created_at DESC';
    return db.prepare(sql).all(...params);
  }
};

module.exports = submissionRepository;
