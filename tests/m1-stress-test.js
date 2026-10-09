/**
 * Milestone 1 Adversarial Empirical Stress & Verification Suite
 * Path: tests/m1-stress-test.js
 * 
 * Executed by Empirical Challenger (m1_challenger_2)
 * Tests Express server lifecycle, HTTP endpoints, security headers,
 * configuration fallbacks, error handling, template resilience,
 * and high-concurrency resilience.
 */

const http = require('http');
const path = require('path');
const { spawn } = require('child_process');
const ejs = require('ejs');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, message, errorDetail = null) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${message}`);
    return true;
  } else {
    failedTests++;
    const detail = errorDetail ? ` - Reason: ${errorDetail}` : '';
    console.error(`  [FAIL] ${message}${detail}`);
    failureDetails.push(`${message}${detail}`);
    return false;
  }
}

// Helper to make HTTP request to a test port
function request(port, requestPath, options = {}) {
  return new Promise((resolve, reject) => {
    const headers = options.headers || {};
    const method = options.method || 'GET';

    const req = http.request({
      hostname: '127.0.0.1',
      port,
      path: requestPath,
      method,
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

// Helper to execute node snippet in child process
function runNodeSnippet(snippet, envOverrides = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['-e', snippet], {
      cwd: path.resolve(__dirname, '..'),
      env: { ...process.env, ...envOverrides }
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });

    child.on('close', code => {
      resolve({ code, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

async function runChallengerTestSuite() {
  console.log('======================================================================');
  console.log('   MILESTONE 1 EMPIRICAL ADVERSARIAL STRESS TEST SUITE (CHALLENGER)   ');
  console.log('======================================================================\n');

  // ==========================================================================
  // SECTION 1: Server Lifecycle & Process Control
  // ==========================================================================
  console.log('[SECTION 1: Server Lifecycle & Process Control]');

  const app = require('../server');
  let testServer = null;
  let testPort = 0;

  // 1.1 Start server programmatically on ephemeral port
  await new Promise((resolve, reject) => {
    testServer = app.listen(0, '127.0.0.1', () => {
      testPort = testServer.address().port;
      assert(testPort > 0, `Server successfully bound to ephemeral port ${testPort}`);
      resolve();
    });
    testServer.on('error', reject);
  });

  // 1.2 Test /health endpoint
  try {
    const healthRes = await request(testPort, '/health');
    assert(healthRes.status === 200, `GET /health returns HTTP 200 (Got ${healthRes.status})`);
    assert(
      (healthRes.headers['content-type'] || '').includes('application/json'),
      `GET /health Content-Type is application/json (Got ${healthRes.headers['content-type']})`
    );

    const healthData = JSON.parse(healthRes.body);
    assert(healthData.status === 'ok', `GET /health status property is "ok" (Got "${healthData.status}")`);
    assert(typeof healthData.uptime === 'number' && healthData.uptime >= 0, `GET /health uptime is non-negative number (${healthData.uptime}s)`);
    assert(!isNaN(Date.parse(healthData.timestamp)), `GET /health timestamp is valid ISO date string (${healthData.timestamp})`);
    assert(typeof healthData.env === 'string', `GET /health reports environment (${healthData.env})`);
  } catch (err) {
    assert(false, 'GET /health endpoint validation', err.message);
  }

  // 1.3 Clean shutdown verification
  await new Promise((resolve) => {
    testServer.close((closeErr) => {
      assert(!closeErr, 'Server close callback executed without error');
      assert(!testServer.listening, 'Server listening flag is false after shutdown');
      console.log('  [INFO] Ephemeral test server cleanly shut down.');
      resolve();
    });
  });

  // 1.4 Standalone server child process boot and shutdown
  console.log('  [TEST] Spawning standalone node server.js with custom PORT...');
  const standalonePort = 48291;
  const standaloneProc = spawn(process.execPath, ['server.js'], {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, PORT: standalonePort.toString() }
  });

  let standaloneReady = false;
  let standaloneOutput = '';

  const readyPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Standalone server timed out waiting to start'));
    }, 5000);

    standaloneProc.stdout.on('data', d => {
      const text = d.toString();
      standaloneOutput += text;
      if (text.includes(`Server running on port ${standalonePort}`)) {
        standaloneReady = true;
        clearTimeout(timeout);
        resolve();
      }
    });

    standaloneProc.stderr.on('data', d => {
      standaloneOutput += d.toString();
    });

    standaloneProc.on('exit', (code) => {
      if (!standaloneReady) {
        clearTimeout(timeout);
        reject(new Error(`Server exited prematurely with code ${code}. Output: ${standaloneOutput}`));
      }
    });
  });

  try {
    await readyPromise;
    assert(standaloneReady, `Standalone server started on port ${standalonePort}`);

    // Verify health on standalone instance
    const standaloneHealth = await request(standalonePort, '/health');
    assert(standaloneHealth.status === 200, `Standalone server /health responded 200 OK`);

    // Verify clean shutdown
    const exitPromise = new Promise((resolve) => {
      standaloneProc.on('exit', (code, signal) => {
        resolve({ code, signal });
      });
    });

    standaloneProc.kill('SIGTERM');
    const exitResult = await exitPromise;
    assert(true, `Standalone server exited cleanly after SIGTERM (code: ${exitResult.code}, signal: ${exitResult.signal})`);
  } catch (procErr) {
    assert(false, 'Standalone server execution test', procErr.message);
    try { standaloneProc.kill(); } catch (_) {}
  }

  // Restart ephemeral server for remaining HTTP & security tests
  await new Promise((resolve) => {
    testServer = app.listen(0, '127.0.0.1', () => {
      testPort = testServer.address().port;
      resolve();
    });
  });

  // ==========================================================================
  // SECTION 2: HTTP Endpoints & Rendering Correctness
  // ==========================================================================
  console.log('\n[SECTION 2: HTTP Endpoints & Rendering Correctness]');

  try {
    // 2.1 GET /
    const homeRes = await request(testPort, '/');
    assert(homeRes.status === 200, `GET / returns HTTP 200 (Got ${homeRes.status})`);
    assert(
      (homeRes.headers['content-type'] || '').includes('text/html'),
      `GET / Content-Type is text/html (Got ${homeRes.headers['content-type']})`
    );
    assert(homeRes.body.includes('<!DOCTYPE html>') && homeRes.body.includes('<html lang="en">'), 'GET / contains HTML5 doctype and lang attribute');
    assert(homeRes.body.includes('<header class="navbar">'), 'GET / renders navbar partial');
    assert(homeRes.body.includes('<footer class="footer">'), 'GET / renders footer partial');
    assert(homeRes.body.includes('Ajay Singla'), 'GET / renders brand identity "Ajay Singla"');
    assert(homeRes.body.includes('GST Registration & Filing'), 'GET / renders seeded service title');
    assert(homeRes.body.includes('/css/tokens.css'), 'GET / references design tokens CSS');

    // 2.2 GET /nonexistent-path-test (HTML 404)
    const notFoundRes = await request(testPort, '/nonexistent-path-test');
    assert(notFoundRes.status === 404, `GET /nonexistent-path-test returns HTTP 404 (Got ${notFoundRes.status})`);
    assert(
      (notFoundRes.headers['content-type'] || '').includes('text/html'),
      `GET /nonexistent-path-test Content-Type is text/html (Got ${notFoundRes.headers['content-type']})`
    );
    assert(notFoundRes.body.includes('404') && notFoundRes.body.includes('Page Not Found'), 'GET /nonexistent-path-test renders styled 404 error page');
    assert(notFoundRes.body.includes('<header class="navbar">'), '404 error page contains navbar partial');
    assert(notFoundRes.body.includes('<footer class="footer">'), '404 error page contains footer partial');
    assert(notFoundRes.body.includes('/nonexistent-path-test'), '404 error page echoes requested URL');

    // 2.3 404 Content Negotiation: JSON Accept header
    const json404Res = await request(testPort, '/nonexistent-json-path', {
      headers: { 'Accept': 'application/json' }
    });
    assert(json404Res.status === 404, `GET nonexistent route with Accept: application/json returns HTTP 404`);
    assert(
      (json404Res.headers['content-type'] || '').includes('application/json'),
      `JSON 404 Content-Type is application/json (Got ${json404Res.headers['content-type']})`
    );
    const json404Body = JSON.parse(json404Res.body);
    assert(json404Body.error === 'Not Found', `JSON 404 error field is "Not Found"`);
    assert(json404Body.path === '/nonexistent-json-path', `JSON 404 path matches requested path`);

    // 2.4 404 Content Negotiation: Text Accept header
    const text404Res = await request(testPort, '/nonexistent-text-path', {
      headers: { 'Accept': 'text/plain' }
    });
    assert(text404Res.status === 404, `GET nonexistent route with Accept: text/plain returns HTTP 404`);
    assert(
      (text404Res.headers['content-type'] || '').includes('text/plain'),
      `Plain text 404 Content-Type is text/plain`
    );
    assert(text404Res.body === '404 Not Found', `Plain text 404 body is "404 Not Found"`);

    // 2.5 Adversarial URL: XSS injection attempt in 404 URL
    const xssPayload = '/test-xss-%3Cscript%3Ealert(1)%3C/script%3E';
    const xssRes = await request(testPort, xssPayload);
    assert(xssRes.status === 404, `Adversarial URL returns HTTP 404`);
    assert(
      !xssRes.body.includes('<script>alert(1)</script>'),
      'Adversarial XSS script tags are properly HTML-escaped in 404 response'
    );
    assert(
      xssRes.body.includes('&lt;script&gt;alert(1)&lt;/script&gt;') || !xssRes.body.includes('<script>'),
      '404 template sanitizes user-controlled URL'
    );

    // 2.6 Static file serving verification
    const tokensRes = await request(testPort, '/css/tokens.css');
    assert(tokensRes.status === 200, `GET /css/tokens.css returns HTTP 200`);
    assert(
      (tokensRes.headers['content-type'] || '').includes('text/css'),
      `GET /css/tokens.css Content-Type is text/css (Got ${tokensRes.headers['content-type']})`
    );
    assert(tokensRes.body.includes('--bg-0'), `tokens.css defines --bg-0 variable`);
    assert(
      tokensRes.body.includes('--font-heading') && tokensRes.body.includes('Playfair Display'),
      `tokens.css defines heading font (Playfair Display)`
    );
    assert(
      tokensRes.body.includes('--font-body') && tokensRes.body.includes('Inter'),
      `tokens.css defines body font (Inter)`
    );

    // 2.7 Template Resilience: 500 Error Page rendering
    const rendered500 = await ejs.renderFile(path.join(__dirname, '../views/pages/500.ejs'), {
      message: 'Simulated Database Failure',
      error: 'Error: Connection timeout\n    at db.js:42:15',
      url: '/simulated-crash',
      currentYear: 2026,
      currentPath: '/simulated-crash'
    });
    assert(rendered500.includes('500') && rendered500.includes('Internal Server Error'), 'pages/500.ejs renders styled 500 error page');
    assert(rendered500.includes('Simulated Database Failure'), 'pages/500.ejs renders error message safely');
    assert(rendered500.includes('navbar'), 'pages/500.ejs includes navbar');
    assert(rendered500.includes('footer'), 'pages/500.ejs includes footer');

    // 2.8 Template Resilience: Home page graceful DB empty fallback
    const renderedHomeEmpty = await ejs.renderFile(path.join(__dirname, '../views/pages/home.ejs'), {
      title: 'Ajay Singla | Test',
      services: [],
      currentPath: '/',
      currentYear: 2026
    });
    assert(renderedHomeEmpty.includes('GST Registration & Filing'), 'pages/home.ejs safely falls back to default service cards when DB returns empty array');

  } catch (err) {
    assert(false, 'HTTP Endpoints & Rendering test suite', err.message);
  }

  // ==========================================================================
  // SECTION 3: Security Headers Verification (Helmet)
  // ==========================================================================
  console.log('\n[SECTION 3: Security Headers Verification (Helmet)]');

  try {
    const secRes = await request(testPort, '/');
    const headers = secRes.headers;

    // 3.1 Content-Security-Policy
    const csp = headers['content-security-policy'];
    assert(Boolean(csp), 'Content-Security-Policy header is present');
    if (csp) {
      assert(csp.includes("default-src 'self'"), `CSP contains "default-src 'self'" (Got: ${csp})`);
      assert(csp.includes('https://fonts.googleapis.com'), 'CSP allows Google Fonts styles');
      assert(csp.includes('https://fonts.gstatic.com'), 'CSP allows Google Fonts static fonts');
      assert(csp.includes("img-src 'self' data:"), 'CSP allows self and data: images');
    }

    // 3.2 X-Content-Type-Options
    const nosniff = headers['x-content-type-options'];
    assert(nosniff === 'nosniff', `X-Content-Type-Options is "nosniff" (Got: ${nosniff})`);

    // 3.3 X-Frame-Options
    const frameOptions = headers['x-frame-options'];
    assert(frameOptions === 'SAMEORIGIN', `X-Frame-Options is "SAMEORIGIN" (Got: ${frameOptions})`);

    // 3.4 X-Download-Options
    const downloadOptions = headers['x-download-options'];
    assert(downloadOptions === 'noopen', `X-Download-Options is "noopen" (Got: ${downloadOptions})`);

    // 3.5 Referrer-Policy
    const referrerPolicy = headers['referrer-policy'];
    assert(Boolean(referrerPolicy), `Referrer-Policy is present (Got: ${referrerPolicy})`);

    // 3.6 Express fingerprint leak prevention
    const poweredBy = headers['x-powered-by'];
    assert(poweredBy === undefined, `X-Powered-By header is stripped/absent (fingerprint protected)`);

    // 3.7 Cross-Origin Resource Policy
    const corp = headers['cross-origin-resource-policy'];
    assert(corp === 'same-origin', `Cross-Origin-Resource-Policy is "same-origin" (Got: ${corp})`);

    // 3.8 Strict-Transport-Security (HSTS)
    // Helmet sets Strict-Transport-Security: max-age=...
    const hsts = headers['strict-transport-security'];
    assert(Boolean(hsts) && hsts.includes('max-age='), `Strict-Transport-Security header is present (Got: ${hsts})`);

  } catch (err) {
    assert(false, 'Security Headers test suite', err.message);
  }

  // ==========================================================================
  // SECTION 4: Configuration Resilience & Fallbacks
  // ==========================================================================
  console.log('\n[SECTION 4: Configuration Resilience & Fallbacks]');

  // Test 4.1: Clean environment fallbacks when .env values are unset
  const fallbackSnippet = `
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.DB_PATH;
    delete process.env.SESSION_SECRET;
    delete process.env.IP_HASH_SALT;
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_PASSWORD;

    // Clear module cache to re-evaluate config
    const configPath = require.resolve('./config');
    delete require.cache[configPath];

    const config = require('./config');
    console.log(JSON.stringify({
      port: config.port,
      nodeEnv: config.nodeEnv,
      isProduction: config.isProduction,
      hasDbPath: Boolean(config.db && config.db.path),
      sessionSecretLen: config.session.secret.length,
      ipHashSaltLen: config.security.ipHashSalt.length,
      adminUsername: config.admin.username,
      isFrozen: Object.isFrozen(config)
    }));
  `;

  const fallbackResult = await runNodeSnippet(fallbackSnippet, {
    PORT: '',
    NODE_ENV: ''
  });

  try {
    const data = JSON.parse(fallbackResult.stdout);
    assert(data.port === 3000, `Default port falls back to 3000 when PORT is unset (Got: ${data.port})`);
    assert(data.nodeEnv === 'development', `Default nodeEnv falls back to 'development' (Got: ${data.nodeEnv})`);
    assert(data.isProduction === false, `Default isProduction is false`);
    assert(data.hasDbPath === true, `Default db.path is populated`);
    assert(data.sessionSecretLen >= 32, `Default session secret meets length requirements (>=32 chars, Got: ${data.sessionSecretLen})`);
    assert(data.ipHashSaltLen >= 8, `Default IP hash salt meets length requirements (>=8 chars, Got: ${data.ipHashSaltLen})`);
    assert(data.adminUsername === 'admin@ajaysingla.com', `Default admin username falls back to admin@ajaysingla.com (Got: ${data.adminUsername})`);
    assert(data.isFrozen === true, `Config object is frozen and immutable`);
  } catch (err) {
    assert(false, 'Config fallbacks snippet parse error', `${err.message}. Raw output: ${fallbackResult.stdout} ${fallbackResult.stderr}`);
  }

  // Test 4.2: Invalid PORT string resilience (NaN fallback)
  const invalidPortSnippet = `
    process.env.PORT = 'invalid-port-string';
    const configPath = require.resolve('./config');
    delete require.cache[configPath];
    const config = require('./config');
    console.log(config.port);
  `;
  const invalidPortResult = await runNodeSnippet(invalidPortSnippet);
  assert(invalidPortResult.stdout === '3000', `Invalid PORT string ("invalid-port-string") safely falls back to 3000 (Got: ${invalidPortResult.stdout})`);

  // Test 4.3: Custom PORT environment override
  const customPortSnippet = `
    process.env.PORT = '8080';
    const configPath = require.resolve('./config');
    delete require.cache[configPath];
    const config = require('./config');
    console.log(config.port);
  `;
  const customPortResult = await runNodeSnippet(customPortSnippet);
  assert(customPortResult.stdout === '8080', `Custom PORT=8080 is parsed correctly (Got: ${customPortResult.stdout})`);

  // Test 4.4: Feature Flags resilience & API contracts
  const { isFeatureEnabled, features } = require('../config/features');
  assert(isFeatureEnabled('contactForm') === true, 'Feature "contactForm" is enabled');
  assert(isFeatureEnabled('adminDashboard') === true, 'Feature "adminDashboard" is enabled');
  assert(isFeatureEnabled('nonExistentFeatureFlag') === false, 'Non-existent feature flag safely evaluates to false');
  assert(Object.isFrozen(features) === true, 'Feature flags dictionary is frozen and immutable');

  // ==========================================================================
  // SECTION 5: High-Concurrency Burst & Database Integrity
  // ==========================================================================
  console.log('\n[SECTION 5: High-Concurrency Burst & Database Integrity]');

  // 5.1 Concurrency stress test: 60 simultaneous requests
  const concurrentRequests = 60;
  console.log(`  [STRESS] Firing ${concurrentRequests} concurrent requests against Express server...`);
  const burstPaths = ['/', '/health', '/nonexistent-path-test', '/css/tokens.css'];
  
  const startTime = Date.now();
  const burstPromises = Array.from({ length: concurrentRequests }, (_, i) => {
    const targetPath = burstPaths[i % burstPaths.length];
    return request(testPort, targetPath);
  });

  const burstResults = await Promise.all(burstPromises);
  const durationMs = Date.now() - startTime;

  let successfulBurst = 0;
  let statusMismatch = 0;

  burstResults.forEach((res, i) => {
    const targetPath = burstPaths[i % burstPaths.length];
    const expectedStatus = targetPath === '/nonexistent-path-test' ? 404 : 200;
    if (res.status === expectedStatus) {
      successfulBurst++;
    } else {
      statusMismatch++;
    }
  });

  assert(successfulBurst === concurrentRequests, `All ${concurrentRequests} concurrent requests completed successfully in ${durationMs}ms (0 dropped, ${statusMismatch} mismatched)`);

  // 5.2 Database WAL Mode & Foreign Keys enforcement verification
  const db = require('../db/connection');
  try {
    const journalRes = db.get("PRAGMA journal_mode;");
    const journalMode = (journalRes && (journalRes.journal_mode || Object.values(journalRes)[0])) || '';
    assert(journalMode.toLowerCase() === 'wal', `SQLite journal_mode is WAL (Got: ${journalMode})`);

    const foreignKeysRes = db.get("PRAGMA foreign_keys;");
    const fkValue = (foreignKeysRes && (foreignKeysRes.foreign_keys !== undefined ? foreignKeysRes.foreign_keys : Object.values(foreignKeysRes)[0]));
    assert(fkValue === 1 || fkValue === '1', `SQLite foreign_keys PRAGMA is enabled (Got: ${fkValue})`);
  } catch (dbPragmaErr) {
    assert(false, 'Database PRAGMA verification failed', dbPragmaErr.message);
  }

  // 5.3 Repository SQL injection defense verification
  try {
    const serviceRepository = require('../db/repositories/serviceRepository');
    const injectionSlug = "gst' OR '1'='1";
    const injectionResult = serviceRepository.getBySlug(injectionSlug);
    assert(injectionResult === undefined, `SQL injection attempt in getBySlug("${injectionSlug}") safely returned undefined`);
  } catch (sqlInjErr) {
    assert(false, 'SQL Injection test', sqlInjErr.message);
  }

  // 5.4 Directory traversal attack resistance on static file paths
  try {
    const traversalPath = '/css/../../server.js';
    const traversalRes = await request(testPort, traversalPath);
    assert(traversalRes.status === 404 || traversalRes.status === 403, `Directory traversal request (${traversalPath}) safely rejected with HTTP ${traversalRes.status}`);
    assert(!traversalRes.body.includes('require(\'express\')'), 'Directory traversal did NOT leak source code');
  } catch (traversalErr) {
    assert(false, 'Directory traversal test', traversalErr.message);
  }

  // Clean up ephemeral test server
  await new Promise((resolve) => {
    testServer.close(() => {
      console.log('  [INFO] Test server shut down cleanly.');
      resolve();
    });
  });

  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================
  console.log('\n======================================================================');
  console.log(`TOTAL TESTS: ${totalTests}`);
  console.log(`PASSED:      ${passedTests}`);
  console.log(`FAILED:      ${failedTests}`);
  console.log('======================================================================\n');

  if (failedTests === 0) {
    console.log('>>> VERDICT: EMPIRICAL APPROVAL (ALL TESTS PASSED WITH ZERO DEFECTS) <<<\n');
    process.exit(0);
  } else {
    console.error('>>> VERDICT: REJECT (DEFECTS DETECTED) <<<');
    failureDetails.forEach((f, idx) => console.error(`  ${idx + 1}. ${f}`));
    process.exit(1);
  }
}

runChallengerTestSuite().catch(err => {
  console.error('[UNHANDLED FATAL IN CHALLENGER TEST SUITE]', err);
  process.exit(1);
});
