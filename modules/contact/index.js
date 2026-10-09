const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('./controller');
const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many enquiries from this IP, please try again after 15 minutes'
});

router.get('/', controller.showForm);
router.post('/', contactLimiter, controller.submitForm);

module.exports = router;
