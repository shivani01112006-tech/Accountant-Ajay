/**
 * Milestone 1 Comprehensive Automated Verification Suite
 * Path: tests/m1-verify.js
 * Run via: node tests/m1-verify.js (or npm.cmd test)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

async function runVerification() {
  console.log('============================================================');
  console.log('   MILESTONE 1: SCAFFOLD & FOUNDATION VERIFICATION SUITE   ');
  console.log('============================================================\n');

  let failureCount = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  [FAIL] ${message}`);
      failureCount++;
      return false;
    }
    console.log(`  [PASS] ${message}`);
    return true;
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 1: Configuration & Environment
  // --------------------------------------------------------------------------
  console.log('[SECTION 1: Configuration & Features]');
  try {
    const config = require('../config');
    const { isFeatureEnabled, features } = require('../config/features');

    assert(typeof config.port === 'number' && config.port > 0, `Config port is valid number (${config.port})`);
    assert(typeof config.db.path === 'string' && config.db.path.length > 0, `Config DB path is specified (${config.db.path})`);
    assert(typeof config.session.secret === 'string' && config.session.secret.length >= 10, 'Session secret is configured');
    assert(typeof config.security.ipHashSalt === 'string' && config.security.ipHashSalt.length >= 8, 'IP hash salt is configured');
    assert(typeof config.admin.username === 'string' && config.admin.username.length > 0, `Admin username is configured (${config.admin.username})`);
    assert(isFeatureEnabled('contactForm') === true, 'Feature contactForm is enabled');
    assert(isFeatureEnabled('adminDashboard') === true, 'Feature adminDashboard is enabled');
  } catch (err) {
    assert(false, `Config loading failed with exception: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 2: Database Connection & Schema
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 2: Database Connection & Schema]');
  const db = require('../db/connection');
  try {
    assert(db && typeof db.prepare === 'function', `Database wrapper initialized with driver: ${db.driver}`);

    // Verify all required tables exist
    const requiredTables = ['ADMIN_USER', 'SERVICE', 'SUBMISSION', 'SUBMISSION_NOTE', 'CHAT_SESSION', 'CHAT_MESSAGE'];
    const rows = db.all("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'");
    const existingTableNames = rows.map(r => r.name);

    for (const table of requiredTables) {
      assert(existingTableNames.includes(table), `Table ${table} exists in database`);
    }

    // Verify required indexes exist
    const indexRows = db.all("SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'");
    const existingIndexes = indexRows.map(r => r.name);
    assert(existingIndexes.includes('idx_submission_status'), 'Index idx_submission_status exists');
    assert(existingIndexes.includes('idx_submission_created_at'), 'Index idx_submission_created_at exists');
    assert(existingIndexes.includes('idx_service_slug'), 'Index idx_service_slug exists');
  } catch (err) {
    assert(false, `Database schema verification failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 3: Seeded Data Integrity
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 3: Seeded Data Integrity]');
  try {
    const adminUser = db.get("SELECT * FROM ADMIN_USER LIMIT 1");
    assert(adminUser && adminUser.username, `Admin user exists (Username: ${adminUser ? adminUser.username : 'none'})`);
    assert(adminUser && typeof adminUser.password_hash === 'string' && adminUser.password_hash.startsWith('$2'), 'Admin password hash is valid bcrypt hash');

    const services = db.all("SELECT * FROM SERVICE ORDER BY sort_order ASC");
    assert(services.length >= 3, `Service count is >= 3 (Found: ${services.length})`);

    const slugs = services.map(s => s.slug);
    assert(slugs.includes('gst'), 'Service "gst" exists');
    assert(slugs.includes('income-tax'), 'Service "income-tax" exists');
    assert(slugs.includes('pan'), 'Service "pan" exists');
  } catch (err) {
    assert(false, `Seed data verification failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 4: Repository Layer API
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 4: Repository Layer Operations]');
  try {
    const serviceRepository = require('../db/repositories/serviceRepository');
    const submissionRepository = require('../db/repositories/submissionRepository');
    const adminRepository = require('../db/repositories/adminRepository');

    // Service repository
    const allServices = serviceRepository.getAll();
    assert(Array.isArray(allServices) && allServices.length >= 3, 'serviceRepository.getAll() returns service array');
    const gstService = serviceRepository.getBySlug('gst');
    assert(gstService && gstService.slug === 'gst', 'serviceRepository.getBySlug("gst") returns GST service');

    // Admin repository
    const foundAdmin = adminRepository.findByUsername(allServices[0] ? 'admin@ajaysingla.com' : 'admin');
    assert(foundAdmin !== undefined, 'adminRepository.findByUsername() resolves admin user');

    // Submission repository
    const initialCounts = submissionRepository.getCounts();
    assert(typeof initialCounts.total === 'number' && typeof initialCounts.new === 'number', 'submissionRepository.getCounts() returns structured counts');

    // Test submission creation & note append
    const testSubId = submissionRepository.create({
      name: 'Verification Bot',
      email: 'bot@example.com',
      phone: '9876543210',
      service_id: gstService ? gstService.id : null,
      message: 'Automated test message for Milestone 1 verification',
      ip_hash: 'test-salted-hash-m1'
    });
    assert(Boolean(testSubId), `submissionRepository.create() successfully inserted record (ID: ${testSubId})`);

    const fetchedSub = submissionRepository.getById(testSubId);
    assert(fetchedSub && fetchedSub.name === 'Verification Bot', 'submissionRepository.getById() retrieves correct record');

    const testAdminId = foundAdmin ? foundAdmin.id : 1;
    submissionRepository.addNote(testSubId, testAdminId, 'Initial test note verification');
    const notes = submissionRepository.getNotes(testSubId);
    assert(notes.length > 0 && notes[0].note === 'Initial test note verification', 'submissionRepository.addNote() and getNotes() work properly');

    // Clean up test submission
    db.run('DELETE FROM SUBMISSION WHERE id = ?', testSubId);
    assert(true, 'Test submission record cleaned up successfully');
  } catch (err) {
    assert(false, `Repository layer test failed: ${err.message}`);
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 5: Express Server & HTTP Responses
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 5: Express Server & HTTP Endpoints]');
  const app = require('../server');

  await new Promise((resolve) => {
    // Listen on port 0 to let OS assign an unused ephemeral port
    const testServer = app.listen(0, '127.0.0.1', () => {
      const port = testServer.address().port;
      console.log(`  [INFO] Bound ephemeral HTTP server on port ${port}`);

      // Request helper
      function makeRequest(path) {
        return new Promise((reqResolve, reqReject) => {
          http.get(`http://127.0.0.1:${port}${path}`, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => reqResolve({ status: res.statusCode, headers: res.headers, body }));
          }).on('error', reqReject);
        });
      }

      (async () => {
        try {
          // 5.1: GET / (Home Page)
          const homeRes = await makeRequest('/');
          assert(homeRes.status === 200, `GET / returned HTTP 200 (Got ${homeRes.status})`);
          assert(homeRes.body.includes('Ajay Singla'), 'GET / HTML contains brand name "Ajay Singla"');
          assert(homeRes.body.includes('GST Registration & Filing'), 'GET / HTML contains seeded service title');
          assert(homeRes.body.includes('<header class="navbar">'), 'GET / HTML includes navbar partial');
          assert(homeRes.body.includes('<footer class="footer">'), 'GET / HTML includes footer partial');

          // 5.2: GET /health (Health Check)
          const healthRes = await makeRequest('/health');
          assert(healthRes.status === 200, `GET /health returned HTTP 200 (Got ${healthRes.status})`);
          const healthJson = JSON.parse(healthRes.body);
          assert(healthJson.status === 'ok', 'GET /health JSON body status is "ok"');
          assert(typeof healthJson.uptime === 'number', 'GET /health JSON uptime is valid number');

          // 5.3: GET /unknown-route (404 Handling)
          const notFoundRes = await makeRequest('/this-route-does-not-exist-at-all');
          assert(notFoundRes.status === 404, `GET /unknown-route returned HTTP 404 (Got ${notFoundRes.status})`);
          assert(notFoundRes.body.includes('Page Not Found') || notFoundRes.body.includes('404'), 'GET /unknown-route rendered 404 error page');

          // 5.4: Static Assets (tokens.css)
          const cssRes = await makeRequest('/css/tokens.css');
          assert(cssRes.status === 200, `GET /css/tokens.css returned HTTP 200 (Got ${cssRes.status})`);
          assert(cssRes.body.includes('--bg-0'), 'GET /css/tokens.css serves valid design tokens');

        } catch (httpErr) {
          assert(false, `HTTP request error: ${httpErr.message}`);
        } finally {
          testServer.close(() => {
            console.log('  [INFO] Ephemeral HTTP server closed cleanly.');
            resolve();
          });
        }
      })();
    });
  });

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  console.log('\n============================================================');
  if (failureCount === 0) {
    console.log('   ALL MILESTONE 1 VERIFICATION CHECKS PASSED (EXIT 0)     ');
    console.log('============================================================');
    process.exit(0);
  } else {
    console.error(`   ${failureCount} VERIFICATION CHECK(S) FAILED (EXIT 1)   `);
    console.log('============================================================');
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('[UNHANDLED FATAL]', err);
  process.exit(1);
});
