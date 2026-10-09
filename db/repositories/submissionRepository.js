const db = require('../connection');

const submissionRepository = {
  async create({ name, email, phone, service_id, message, ip_hash }) {
    const stmt = `
      INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash, created_at)
      VALUES ($1, $2, $3, $4, $5, 'new', $6, NOW()) RETURNING id
    `;
    const { rows } = await db.query(stmt, [name, email, phone, service_id || null, message, ip_hash]);
    return rows[0].id;
  },

  async getById(id) {
    const stmt = `
      SELECT s.*, srv.title as service_title, srv.slug as service_slug
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
      WHERE s.id = $1
    `;
    const { rows } = await db.query(stmt, [id]);
    return rows[0];
  },

  async list({ status = null, search = null, page = 1, limit = 10 } = {}) {
    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (safePage - 1) * safeLimit;

    const whereClauses = [];
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      whereClauses.push(`s.status = $${paramIndex++}`);
      params.push(status);
    }

    if (search && search.trim() !== '') {
      whereClauses.push(`(s.name ILIKE $${paramIndex} OR s.email ILIKE $${paramIndex} OR s.phone ILIKE $${paramIndex} OR s.message ILIKE $${paramIndex})`);
      const pattern = `%${search.trim()}%`;
      params.push(pattern);
      paramIndex++;
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countRes = await db.query(`SELECT COUNT(*) as count FROM SUBMISSION s ${whereSql}`, params);
    const total = parseInt(countRes.rows[0].count, 10) || 0;

    params.push(safeLimit, offset);
    const itemsRes = await db.query(`
      SELECT s.*, srv.title as service_title, srv.slug as service_slug
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
      ${whereSql}
      ORDER BY s.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `, params);

    return {
      items: itemsRes.rows,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit) || 1
    };
  },

  async updateStatus(id, status) {
    return await db.query('UPDATE SUBMISSION SET status = $1 WHERE id = $2', [status, id]);
  },

  async addNote(submission_id, admin_id, note) {
    const stmt = `
      INSERT INTO SUBMISSION_NOTE (submission_id, admin_id, note, created_at)
      VALUES ($1, $2, $3, NOW())
    `;
    return await db.query(stmt, [submission_id, admin_id, note]);
  },

  async getNotes(submission_id) {
    const { rows } = await db.query(`
      SELECT n.*, a.username as admin_username
      FROM SUBMISSION_NOTE n
      LEFT JOIN ADMIN_USER a ON n.admin_id = a.id
      WHERE n.submission_id = $1
      ORDER BY n.created_at ASC
    `, [submission_id]);
    return rows;
  },

  async getCounts() {
    const { rows } = await db.query('SELECT status, COUNT(*) as count FROM SUBMISSION GROUP BY status');
    const counts = { total: 0, new: 0, in_progress: 0, closed: 0 };
    for (const r of rows) {
      const cnt = parseInt(r.count, 10);
      counts.total += cnt;
      if (r.status === 'new') {
        counts.new = cnt;
      } else if (r.status === 'in_progress') {
        counts.in_progress = cnt;
      } else if (r.status === 'closed' || r.status === 'replied' || r.status === 'archived') {
        counts.closed += cnt;
      }
    }
    return counts;
  },

  async getAllForExport(status = null) {
    let sql = `
      SELECT s.id, s.name, s.email, s.phone, srv.title as service, s.status, s.created_at
      FROM SUBMISSION s
      LEFT JOIN SERVICE srv ON s.service_id = srv.id
    `;
    const params = [];
    if (status && status !== 'all') {
      sql += ' WHERE s.status = $1';
      params.push(status);
    }
    sql += ' ORDER BY s.created_at DESC';
    const { rows } = await db.query(sql, params);
    return rows;
  }
};

module.exports = submissionRepository;
