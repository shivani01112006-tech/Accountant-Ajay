const db = require('../../db/connection');

async function createSubmission({ name, email, phone, service_id, message, ip_hash }) {
  const sql = `
    INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash)
    VALUES ($1, $2, $3, $4, $5, 'new', $6)
    RETURNING id
  `;
  const { rows } = await db.query(sql, [name, email, phone, service_id || null, message, ip_hash]);
  return rows[0].id;
}

module.exports = {
  createSubmission
};
