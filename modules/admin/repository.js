const db = require('../../db/connection');

exports.getAdminByUsername = async (username) => {
  const { rows } = await db.query('SELECT * FROM ADMIN_USER WHERE username = $1', [username]);
  return rows[0];
};

exports.updateFailedAttempts = async (id, count, locked_until) => {
  await db.query('UPDATE ADMIN_USER SET failed_attempts = $1, locked_until = $2 WHERE id = $3', [count, locked_until, id]);
};

exports.getSubmissions = async (search, status, limit, offset) => {
  let sql = 'SELECT s.*, srv.title as service_title FROM SUBMISSION s LEFT JOIN SERVICE srv ON s.service_id = srv.id WHERE 1=1';
  const params = [];
  let paramCount = 1;
  
  if (status) {
    sql += ` AND s.status = $${paramCount++}`;
    params.push(status);
  }
  
  if (search) {
    sql += ` AND (s.name ILIKE $${paramCount} OR s.email ILIKE $${paramCount} OR s.phone ILIKE $${paramCount})`;
    params.push(`%${search}%`);
    paramCount++;
  }
  
  sql += ` ORDER BY s.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
  params.push(limit, offset);
  
  let countSql = 'SELECT COUNT(*) as count FROM SUBMISSION s WHERE 1=1';
  const countParams = [];
  let countParamCount = 1;

  if (status) {
    countSql += ` AND s.status = $${countParamCount++}`;
    countParams.push(status);
  }
  if (search) {
    countSql += ` AND (s.name ILIKE $${countParamCount} OR s.email ILIKE $${countParamCount} OR s.phone ILIKE $${countParamCount})`;
    countParams.push(`%${search}%`);
  }
  
  const totalRes = await db.query(countSql, countParams);
  const total = parseInt(totalRes.rows[0].count, 10);
  const dataRes = await db.query(sql, params);
  
  return { total, data: dataRes.rows };
};

exports.getSubmissionById = async (id) => {
  const { rows } = await db.query('SELECT s.*, srv.title as service_title FROM SUBMISSION s LEFT JOIN SERVICE srv ON s.service_id = srv.id WHERE s.id = $1', [id]);
  return rows[0];
};

exports.updateSubmissionStatus = async (id, status) => {
  await db.query('UPDATE SUBMISSION SET status = $1 WHERE id = $2', [status, id]);
};

exports.getNotes = async (submissionId) => {
  const { rows } = await db.query('SELECT n.*, a.username FROM SUBMISSION_NOTE n JOIN ADMIN_USER a ON n.admin_id = a.id WHERE n.submission_id = $1 ORDER BY n.created_at DESC', [submissionId]);
  return rows;
};

exports.addNote = async (submissionId, adminId, note) => {
  await db.query('INSERT INTO SUBMISSION_NOTE (submission_id, admin_id, note) VALUES ($1, $2, $3)', [submissionId, adminId, note]);
};
