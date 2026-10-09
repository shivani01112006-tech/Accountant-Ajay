/**
 * Ajay Singla Accounting Portfolio - Main Application Server
 * Milestone 1: Scaffold & Foundation
 */

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const config = require('./config');
const { isFeatureEnabled } = require('./config/features');
const serviceRepository = require('./db/repositories/serviceRepository');

const app = express();

// ============================================================================
// 1. Security Headers (Helmet)
// ============================================================================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:']
    }
  }
}));

// ============================================================================
// 2. View Engine Setup (EJS)
// ============================================================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================================
// 3. Core Middleware
// ============================================================================
// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// Request body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Common view locals
app.use((req, res, next) => {
  res.locals.features = {
    contactForm: isFeatureEnabled('contactForm'),
    adminDashboard: isFeatureEnabled('adminDashboard'),
    chatbot: isFeatureEnabled('chatbot'),
    analytics: isFeatureEnabled('analytics')
  };
  res.locals.currentYear = new Date().getFullYear();
  res.locals.currentPath = req.path;
  next();
});

// ============================================================================
// 4. Core Routes
// ============================================================================

// Lightweight health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    env: config.nodeEnv
  });
});

// Home Page: renders starter home view with services from DB
app.get('/', async (req, res, next) => {
  try {
    let services = [];
    try {
      services = await serviceRepository.getAll();
    } catch (dbErr) {
      console.warn('[SERVER] Could not load services from DB:', dbErr.message);
    }

    res.status(200).render('pages/home', {
      title: 'Ajay Singla | Accounting & Tax Consultant',
      services,
      currentPath: '/'
    });
  } catch (err) {
    next(err);
  }
});

// Session and Additional Modules
const session = require('express-session');
const contactRouter = require('./modules/contact');
const adminRouter = require('./modules/admin');
const chatbotRouter = require('./modules/chatbot');

app.use(session({
  secret: config.sessionSecret || 'dev-insecure-secret-ajay-singla-session-2026-min-32-chars',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: config.isProduction, httpOnly: true, maxAge: 30 * 60 * 1000 }
}));

app.get('/about', (req, res) => res.render('pages/about', { title: 'About | Ajay Singla', currentPath: '/about' }));
app.get('/services', async (req, res) => {
  let services = [];
  try { services = await serviceRepository.getAll(); } catch(e) {}
  res.render('pages/services', { title: 'Services | Ajay Singla', services, currentPath: '/services' });
});

app.use('/contact', contactRouter);
app.use('/admin', adminRouter);
app.use('/api', chatbotRouter);

// ============================================================================
// 5. 404 Catch-All Middleware
// ============================================================================
app.use((req, res) => {
  res.status(404);
  if (req.accepts('html')) {
    let displayUrl = req.originalUrl;
    try {
      displayUrl = decodeURIComponent(req.originalUrl);
    } catch (e) {}
    try {
      res.render('pages/404', { url: displayUrl });
    } catch {
      res.send(`<h1>404 Not Found</h1><p>The requested page could not be found.</p>`);
    }
  } else if (req.accepts('json')) {
    res.json({ error: 'Not Found', path: req.originalUrl });
  } else {
    res.type('txt').send('404 Not Found');
  }
});

// ============================================================================
// 6. 500 Error-Handling Middleware
// ============================================================================
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = err.status || err.statusCode || 500;
  console.error(`[Server Error ${statusCode}]`, err);

  res.status(statusCode);

  const errorData = {
    message: err.message || 'Internal Server Error',
    error: config.isProduction ? null : err.stack,
    url: req.originalUrl
  };

  if (req.accepts('html')) {
    try {
      res.render('pages/500', errorData);
    } catch {
      res.send(`<h1>500 Internal Server Error</h1><p>${config.isProduction ? 'An unexpected error occurred.' : err.message}</p>`);
    }
  } else {
    res.json(errorData);
  }
});

// ============================================================================
// 7. Server Listener & Startup
// ============================================================================
let server = null;
if (require.main === module) {
  const PORT = config.port;
  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down server gracefully...`);
    if (server) {
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;
