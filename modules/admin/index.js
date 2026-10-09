const express = require('express');
const controller = require('./controller');
const router = express.Router();

const requireAuth = (req, res, next) => {
  if (!req.session.adminId) {
    return res.redirect('/admin/login');
  }
  next();
};

router.get('/login', controller.showLogin);
router.post('/login', controller.postLogin);
router.get('/logout', controller.logout);

router.get('/dashboard', requireAuth, controller.dashboard);
router.get('/submissions', requireAuth, controller.dashboard); // Alias for now
router.get('/submissions/export.csv', requireAuth, controller.exportCSV);
router.get('/submissions/:id', requireAuth, controller.submissionDetail);
router.post('/submissions/:id/status', requireAuth, controller.updateStatus);
router.post('/submissions/:id/note', requireAuth, controller.addNote);

module.exports = router;
