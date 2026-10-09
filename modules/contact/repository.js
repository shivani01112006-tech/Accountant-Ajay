const db = require('../../db/connection');

function createSubmission({ name, email, phone, service_id, message, ip_hash }) {
  const sql = `
    INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash)
    VALUES (?, ?, ?, ?, ?, 'new', ?)
  `;
  const stmt = db.prepare(sql);
  const result = stmt.run(name, email, phone, service_id || null, message, ip_hash);
  return result.lastInsertRowid;
}

module.exports = {
  createSubmission
};
