const validator = require('validator');
const crypto = require('crypto');
const repository = require('./repository');
const serviceRepository = require('../../db/repositories/serviceRepository');
const config = require('../../config');

function getHash(ip) {
  return crypto.createHash('sha256').update(ip + config.sessionSecret).digest('hex');
}

exports.showForm = async (req, res) => {
  try {
    const services = await serviceRepository.getAll();
    res.render('pages/contact', { title: 'Contact | Ajay Singla', services, currentPath: '/contact', query: req.query });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.submitForm = async (req, res) => {
  let services = [];
  try {
    services = await serviceRepository.getAll();
  } catch (err) {
    console.error(err);
  }

  const { name, email, phone, service_id, message, website } = req.body;

  // Honeypot check
  if (website) {
    return res.status(400).render('pages/contact', {
      title: 'Contact | Ajay Singla', services, currentPath: '/contact',
      error: 'Form submission blocked.',
      body: req.body
    });
  }

  // Basic Validation
  if (!name || name.trim().length < 2) {
    return res.render('pages/contact', { title: 'Contact | Ajay Singla', services, currentPath: '/contact', error: 'Please provide a valid name.', body: req.body });
  }
  if (!email || !validator.isEmail(email)) {
    return res.render('pages/contact', { title: 'Contact | Ajay Singla', services, currentPath: '/contact', error: 'Please provide a valid email.', body: req.body });
  }
  if (!phone || !validator.isMobilePhone(phone, 'en-IN') && phone.length < 10) {
    return res.render('pages/contact', { title: 'Contact | Ajay Singla', services, currentPath: '/contact', error: 'Please provide a valid phone number.', body: req.body });
  }
  if (!message || message.trim().length < 10) {
    return res.render('pages/contact', { title: 'Contact | Ajay Singla', services, currentPath: '/contact', error: 'Message is too short.', body: req.body });
  }

  try {
    const ip = req.ip || req.connection.remoteAddress;
    const ip_hash = getHash(ip);
    
    await repository.createSubmission({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      service_id: service_id ? parseInt(service_id, 10) : null,
      message: message.trim(),
      ip_hash
    });

    res.render('pages/contact', { title: 'Contact | Ajay Singla', services, currentPath: '/contact', success: true });
  } catch (err) {
    console.error('Contact Form Error:', err);
    res.render('pages/contact', { title: 'Contact | Ajay Singla', services, currentPath: '/contact', error: 'Internal server error. Please try again later.', body: req.body });
  }
};
