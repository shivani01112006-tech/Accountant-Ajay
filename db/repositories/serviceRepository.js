/**
 * Service Repository
 * Handles database operations for SERVICE catalog
 */

const db = require('../connection');

const serviceRepository = {
  /**
   * Get all active services sorted by display order
   * @returns {Array<Object>}
   */
  getAll() {
    return db.prepare('SELECT * FROM SERVICE ORDER BY sort_order ASC, id ASC').all();
  },

  /**
   * Get a single service by slug (e.g., 'gst', 'income-tax', 'pan')
   * @param {string} slug
   * @returns {Object|undefined}
   */
  getBySlug(slug) {
    return db.prepare('SELECT * FROM SERVICE WHERE slug = ?').get(slug);
  },

  /**
   * Get a single service by primary key ID
   * @param {number} id
   * @returns {Object|undefined}
   */
  getById(id) {
    return db.prepare('SELECT * FROM SERVICE WHERE id = ?').get(id);
  }
};

module.exports = serviceRepository;
