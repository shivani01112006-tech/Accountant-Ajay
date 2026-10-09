const db = require('../connection');

const serviceRepository = {
  async getAll() {
    const { rows } = await db.query('SELECT * FROM SERVICE ORDER BY sort_order ASC, id ASC');
    return rows;
  },

  async getBySlug(slug) {
    const { rows } = await db.query('SELECT * FROM SERVICE WHERE slug = $1', [slug]);
    return rows[0];
  },

  async getById(id) {
    const { rows } = await db.query('SELECT * FROM SERVICE WHERE id = $1', [id]);
    return rows[0];
  }
};

module.exports = serviceRepository;
