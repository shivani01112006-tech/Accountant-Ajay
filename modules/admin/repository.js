const db = require('../../db/connection');

exports.getAdminByUsername = (username) => {
  return db.prepare('SELECT * FROM ADMIN_USER WHERE username = ?').get(username);
};

exports.updateFailedAttempts = (id, count, locked_until) => {
  db.prepare('UPDATE ADMIN_USER SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(count, locked_until, id);
};

exports.getSubmissions = (search, status, limit, offset) => {
  let sql = 'SELECT s.*, srv.title as service_title FROM SUBMISSION s LEFT JOIN SERVICE srv ON s.service_id = srv.id WHERE 1=1';
  const params = [];
  
  if (status) {
    sql += ' AND s.status = ?';
    params.push(status);
  }
  
  if (search) {
    sql += ' AND (s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  sql += ' ORDER BY s.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const countSql = 'SELECT COUNT(*) as count FROM SUBMISSION s WHERE 1=1' + (status ? ' AND s.status = ?' : '') + (search ? ' AND (s.name LIKE ? OR s.email LIKE ? OR s.phone LIKE ?)' : '');
  const countParams = status && search ? [status, `%${search}%`, `%${search}%`, `%${search}%`] : status ? [status] : search ? [`%${search}%`, `%${search}%`, `%${search}%`] : [];
  
  const total = db.prepare(countSql).get(...countParams).count;
  const data = db.prepare(sql).all(...params);
  
  return { total, data };
};

exports.getSubmissionById = (id) => {
  return db.prepare('SELECT s.*, srv.title as service_title FROM SUBMISSION s LEFT JOIN SERVICE srv ON s.service_id = srv.id WHERE s.id = ?').get(id);
};

exports.updateSubmissionStatus = (id, status) => {
  db.prepare('UPDATE SUBMISSION SET status = ? WHERE id = ?').run(status, id);
};

exports.getNotes = (submissionId) => {
  return db.prepare('SELECT n.*, a.username FROM SUBMISSION_NOTE n JOIN ADMIN_USER a ON n.admin_id = a.id WHERE n.submission_id = ? ORDER BY n.created_at DESC').all(submissionId);
};

exports.addNote = (submissionId, adminId, note) => {
  db.prepare('INSERT INTO SUBMISSION_NOTE (submission_id, admin_id, note) VALUES (?, ?, ?)').run(submissionId, adminId, note);
};
