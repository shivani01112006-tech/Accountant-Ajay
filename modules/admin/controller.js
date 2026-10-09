const bcrypt = require('bcryptjs');
const repository = require('./repository');

exports.showLogin = (req, res) => {
  if (req.session.adminId) return res.redirect('/admin/dashboard');
  res.render('admin/login', { error: null });
};

exports.postLogin = (req, res) => {
  const { username, password } = req.body;
  const user = repository.getAdminByUsername(username);

  if (!user) {
    return res.render('admin/login', { error: 'Invalid credentials' });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return res.render('admin/login', { error: 'Account locked. Try again later.' });
  }

  const match = bcrypt.compareSync(password, user.password_hash);
  if (!match) {
    const attempts = user.failed_attempts + 1;
    const locked_until = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    repository.updateFailedAttempts(user.id, attempts, locked_until);
    return res.render('admin/login', { error: 'Invalid credentials' });
  }

  repository.updateFailedAttempts(user.id, 0, null);
  req.session.adminId = user.id;
  req.session.username = user.username;
  res.redirect('/admin/dashboard');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
};

exports.dashboard = (req, res) => {
  const { search = '', status = '', page = 1 } = req.query;
  const limit = 10;
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * limit;

  const { total, data } = repository.getSubmissions(search, status, limit, offset);
  const totalPages = Math.ceil(total / limit);

  res.render('admin/dashboard', {
    submissions: data,
    total,
    page: parseInt(page, 10),
    totalPages,
    search,
    status
  });
};

exports.submissionDetail = (req, res) => {
  const submission = repository.getSubmissionById(req.params.id);
  if (!submission) return res.status(404).send('Not Found');
  
  const notes = repository.getNotes(req.params.id);
  res.render('admin/detail', { submission, notes });
};

exports.updateStatus = (req, res) => {
  const { status } = req.body;
  repository.updateSubmissionStatus(req.params.id, status);
  res.redirect(`/admin/submissions/${req.params.id}`);
};

exports.addNote = (req, res) => {
  const { note } = req.body;
  if (note && note.trim()) {
    repository.addNote(req.params.id, req.session.adminId, note.trim());
  }
  res.redirect(`/admin/submissions/${req.params.id}`);
};

exports.exportCSV = (req, res) => {
  const { data } = repository.getSubmissions('', '', 10000, 0);
  const header = ['id', 'name', 'email', 'phone', 'service_title', 'status', 'created_at'].join(',');
  const rows = data.map(row => 
    [row.id, `"${row.name}"`, `"${row.email}"`, `"${row.phone}"`, `"${row.service_title || ''}"`, `"${row.status}"`, `"${row.created_at}"`].join(',')
  );
  const output = [header, ...rows].join('\\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="submissions.csv"');
  res.send(output);
};
