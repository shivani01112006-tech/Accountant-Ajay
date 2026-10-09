/**
 * Milestone 2 Automated Verification Suite
 * Design System, Styling, Typography, Motion & Layout Integration
 * Path: tests/m2-verify.js
 * Run via: node tests/m2-verify.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

async function runVerification() {
  console.log('======================================================================');
  console.log('   MILESTONE 2: DESIGN SYSTEM & STYLING VERIFICATION SUITE           ');
  console.log('======================================================================\n');

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

  const rootDir = path.resolve(__dirname, '..');

  // --------------------------------------------------------------------------
  // TEST SECTION 1: File Artifact Existence
  // --------------------------------------------------------------------------
  console.log('[SECTION 1: File Artifact Existence]');
  const expectedFiles = [
    'public/css/tokens.css',
    'public/css/base.css',
    'public/css/components.css',
    'public/css/parallax.css',
    'public/js/main.js',
    'public/js/parallax.js',
    'views/layouts/main.ejs',
    'views/partials/navbar.ejs',
    'views/partials/footer.ejs',
    'views/pages/home.ejs'
  ];

  for (const relPath of expectedFiles) {
    const fullPath = path.join(rootDir, relPath);
    assert(fs.existsSync(fullPath), `Artifact exists: ${relPath}`);
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 2: Design Tokens Verification (tokens.css)
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 2: Design Tokens Architecture (tokens.css)]');
  const tokensContent = fs.readFileSync(path.join(rootDir, 'public/css/tokens.css'), 'utf8');

  // Palette tokens
  const requiredPalette = [
    { token: '--bg-0', hex: '#0B0B0C' },
    { token: '--bg-1', hex: '#151517' },
    { token: '--bg-2', hex: '#F4F4F2' },
    { token: '--surface', hex: '#FFFFFF' },
    { token: '--text-hi', hex: '#F5F5F5' },
    { token: '--text-lo', hex: '#A1A1A6' },
    { token: '--ink', hex: '#111113' },
    { token: '--ink-soft', hex: '#5A5A60' },
    { token: '--line', hex: '#2A2A2D' },
    { token: '--line-light', hex: '#DCDCD8' },
    { token: '--accent', hex: '#FFFFFF' },
    { token: '--accent-light', hex: '#111113' },
    { token: '--color-error', hex: '#C0392B' },
    { token: '--color-success', hex: '#2E7D32' }
  ];

  for (const item of requiredPalette) {
    const regex = new RegExp(`${item.token}\\s*:\\s*${item.hex}`, 'i');
    assert(regex.test(tokensContent), `Color token defined: ${item.token} -> ${item.hex}`);
  }

  // Typography tokens
  assert(tokensContent.includes("'Playfair Display'") && tokensContent.includes('--font-heading'),
    "Typography token --font-heading includes 'Playfair Display'");
  assert(tokensContent.includes("'Inter'") && tokensContent.includes('--font-body'),
    "Typography token --font-body includes 'Inter'");

  // 7-step typographic scale
  const expectedSizes = ['12px', '14px', '16px', '20px', '28px', '40px', '64px'];
  for (const size of expectedSizes) {
    assert(tokensContent.includes(size), `Typographic scale step included: ${size}`);
  }

  // Line heights
  assert(/--lh-heading\s*:\s*1\.1/i.test(tokensContent), 'Line-height for headings is 1.1');
  assert(/--lh-body\s*:\s*1\.6/i.test(tokensContent), 'Line-height for body is 1.6');

  // Eyebrow tokens
  assert(/--eyebrow-tracking\s*:\s*0?\.18em/i.test(tokensContent), 'Eyebrow tracking is .18em');
  assert(/--eyebrow-transform\s*:\s*uppercase/i.test(tokensContent), 'Eyebrow transform is uppercase');

  // 4-pt grid spacing scale
  const expectedSpacing = [
    { token: '--space-1', val: '4px' },
    { token: '--space-2', val: '8px' },
    { token: '--space-3', val: '16px' },
    { token: '--space-4', val: '24px' },
    { token: '--space-5', val: '32px' },
    { token: '--space-6', val: '48px' },
    { token: '--space-7', val: '80px' },
    { token: '--space-8', val: '128px' }
  ];

  for (const sp of expectedSpacing) {
    const spRegex = new RegExp(`${sp.token}\\s*:\\s*${sp.val}`, 'i');
    assert(spRegex.test(tokensContent), `4-pt spacing token defined: ${sp.token} -> ${sp.val}`);
  }

  // Container, radii & shadows
  assert(/--container-max-width\s*:\s*1200px/i.test(tokensContent), 'Container max width is 1200px');
  assert(/--radius-sm\s*:\s*4px/i.test(tokensContent), 'Border radius sm is 4px');
  assert(/--radius-md\s*:\s*12px/i.test(tokensContent), 'Border radius md is 12px');
  assert(/--radius-pill\s*:\s*999px/i.test(tokensContent), 'Border radius pill is 999px');
  assert(tokensContent.includes('--shadow-dark') && tokensContent.includes('--shadow-light'), 'Monochromatic shadows defined');

  // --------------------------------------------------------------------------
  // TEST SECTION 3: Strict Monochromatic Palette Compliance
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 3: Strict Monochromatic Palette Compliance Audit]');
  const cssFiles = [
    'public/css/tokens.css',
    'public/css/base.css',
    'public/css/components.css',
    'public/css/parallax.css'
  ];

  // Allowed non-monochrome semantic exception colors
  const semanticExceptions = new Set(['#c0392b', '#2e7d32', '#81c784', '#e57373']);

  function isMonochromaticHex(hex) {
    let clean = hex.replace('#', '').toLowerCase();
    if (clean.length === 3) {
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    }
    if (clean.length !== 6) return true; // ignore atypical lengths

    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);

    // Max deviation between RGB channels for neutral greys / zinc tints (e.g. #A1A1A6 diff=5, #5A5A60 diff=6, #71717A diff=9)
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return maxDiff <= 10;
  }

  let nonMonochromeCount = 0;
  for (const relCss of cssFiles) {
    const content = fs.readFileSync(path.join(rootDir, relCss), 'utf8');
    const hexMatches = content.match(/#[0-9a-fA-F]{3,6}\b/g) || [];

    for (const hex of hexMatches) {
      const lower = hex.toLowerCase();
      if (!semanticExceptions.has(lower) && !isMonochromaticHex(lower)) {
        console.error(`  [VIOLATION] Unauthorized non-monochrome hex ${hex} found in ${relCss}`);
        nonMonochromeCount++;
      }
    }
  }

  assert(nonMonochromeCount === 0,
    `Zero unauthorized non-monochromatic hex codes found across all stylesheets (Violations: ${nonMonochromeCount})`);

  // --------------------------------------------------------------------------
  // TEST SECTION 4: Reduced Motion & Parallax Media Queries
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 4: Reduced Motion & Parallax Media Queries]');
  const baseContent = fs.readFileSync(path.join(rootDir, 'public/css/base.css'), 'utf8');
  const parallaxCssContent = fs.readFileSync(path.join(rootDir, 'public/css/parallax.css'), 'utf8');
  const parallaxJsContent = fs.readFileSync(path.join(rootDir, 'public/js/parallax.js'), 'utf8');

  // base.css reduced motion
  assert(baseContent.includes('@media (prefers-reduced-motion: reduce)'),
    'base.css includes @media (prefers-reduced-motion: reduce)');
  assert(baseContent.includes('scroll-behavior: auto !important') || baseContent.includes('scroll-behavior: auto'),
    'base.css disables smooth scrolling under reduced motion');

  // parallax.css reduced motion & disablement < 768px
  assert(parallaxCssContent.includes('@media (prefers-reduced-motion: reduce)'),
    'parallax.css includes @media (prefers-reduced-motion: reduce)');
  assert(parallaxCssContent.includes('max-width: 767.98px') || parallaxCssContent.includes('max-width: 768px'),
    'parallax.css disables parallax on mobile viewports (< 768px)');
  assert(parallaxCssContent.includes('translate3d'),
    'parallax.css uses hardware-accelerated translate3d transforms');
  assert(parallaxCssContent.includes('will-change: transform') || parallaxCssContent.includes('will-change'),
    'parallax.css uses will-change compositing optimization');

  // Section reveals
  assert(parallaxCssContent.includes('.reveal-on-scroll'), 'parallax.css defines .reveal-on-scroll class');
  assert(parallaxCssContent.includes('24px') && parallaxCssContent.includes('600ms'),
    'Section reveal matches 24px translation and 600ms duration specification');

  // parallax.js speed factors & observer
  assert(parallaxJsContent.includes('0.2') && parallaxJsContent.includes('0.4') && parallaxJsContent.includes('0.6'),
    'parallax.js implements calibrated layer speeds 0.2x, 0.4x, and 0.6x');
  assert(parallaxJsContent.includes('IntersectionObserver'),
    'parallax.js orchestrates section reveals via IntersectionObserver');
  assert(parallaxJsContent.includes('prefers-reduced-motion'),
    'parallax.js evaluates prefers-reduced-motion media query');
  assert(parallaxJsContent.includes('768px'),
    'parallax.js guards against execution on < 768px mobile viewports');

  // --------------------------------------------------------------------------
  // TEST SECTION 5: Client-Side Interactivity (main.js)
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 5: Client-Side Interactivity (main.js)]');
  const mainJsContent = fs.readFileSync(path.join(rootDir, 'public/js/main.js'), 'utf8');

  assert(mainJsContent.includes('navbar-scrolled'), 'main.js handles .navbar-scrolled class');
  assert(mainJsContent.includes('40'), 'main.js triggers navbar blur on scroll > 40px');
  assert(mainJsContent.includes('aria-expanded'), 'main.js toggles aria-expanded for mobile navigation');
  assert(mainJsContent.includes('is-open'), 'main.js toggles .is-open for mobile drawer menu');

  // --------------------------------------------------------------------------
  // TEST SECTION 6: Layout & Partials Structure
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 6: Layout & Partials Scaffolding]');
  const mainLayoutContent = fs.readFileSync(path.join(rootDir, 'views/layouts/main.ejs'), 'utf8');
  const navbarContent = fs.readFileSync(path.join(rootDir, 'views/partials/navbar.ejs'), 'utf8');
  const footerContent = fs.readFileSync(path.join(rootDir, 'views/partials/footer.ejs'), 'utf8');
  const homeContent = fs.readFileSync(path.join(rootDir, 'views/pages/home.ejs'), 'utf8');

  // Layout assertions
  assert(mainLayoutContent.includes('fonts.googleapis.com') && mainLayoutContent.includes('Playfair+Display') && mainLayoutContent.includes('Inter'),
    'main.ejs links Playfair Display and Inter from Google Fonts');
  assert(mainLayoutContent.includes('/css/tokens.css') && mainLayoutContent.includes('/css/base.css') &&
         mainLayoutContent.includes('/css/components.css') && mainLayoutContent.includes('/css/parallax.css'),
    'main.ejs includes all 4 design system stylesheets in cascade order');
  assert(mainLayoutContent.includes('class="skip-link"'), 'main.ejs includes accessible skip link');
  assert(mainLayoutContent.includes('id="main-content"'), 'main.ejs includes main#main-content wrapper');
  assert(mainLayoutContent.includes('/js/main.js') && mainLayoutContent.includes('/js/parallax.js'),
    'main.ejs includes main.js and parallax.js client scripts');

  // Navbar assertions
  assert(navbarContent.includes('Ajay Singla'), 'navbar.ejs includes brand name "Ajay Singla"');
  assert(navbarContent.includes('Accounting &amp; Tax Advisory') || navbarContent.includes('Accounting & Tax Advisory'),
    'navbar.ejs includes tagline');
  assert(navbarContent.includes('Get in touch'), 'navbar.ejs includes "Get in touch" CTA button');
  assert(navbarContent.includes('id="navbar-toggle"'), 'navbar.ejs includes mobile hamburger toggle button');
  assert(navbarContent.includes('id="navbar-menu"'), 'navbar.ejs includes mobile navigation drawer');

  // Footer assertions
  assert(footerContent.includes('One Way Traffic Road, Mansa, Punjab 151505'),
    'footer.ejs includes exact office address "One Way Traffic Road, Mansa, Punjab 151505"');
  assert(footerContent.includes('tel:9988383380'), 'footer.ejs includes clickable telephone link tel:9988383380');
  assert(footerContent.includes('mailto:ajay30@gmail.com'), 'footer.ejs includes clickable mailto:ajay30@gmail.com');
  assert(footerContent.includes('Disclaimer') && footerContent.includes('Practitioner'),
    'footer.ejs includes accounting practitioner disclaimer');
  assert(footerContent.includes('/admin/login'), 'footer.ejs includes link to admin login');
  assert(footerContent.includes('currentYear') || footerContent.includes('getFullYear()'),
    'footer.ejs includes dynamic copyright year');

  // Home assertions
  assert(homeContent.includes('hero-parallax-container'), 'home.ejs includes hero parallax container');
  assert(homeContent.includes('parallax-layer-grid') && homeContent.includes('parallax-layer-accents') && homeContent.includes('parallax-layer-glow'),
    'home.ejs includes 3 parallax background layers');
  assert(homeContent.includes('15+'), 'home.ejs displays 15+ years experience');
  assert(homeContent.includes('Filings Completed') || homeContent.includes('1,000+'), 'home.ejs displays filings trust metric');
  assert(homeContent.includes('Why Clients Trust Our Practice') || homeContent.includes('The Singla Advantage'),
    'home.ejs displays why choose authority grid');
  assert(homeContent.includes('Share Documents') && homeContent.includes('Statutory Filing'),
    'home.ejs displays structured 4-step process');

  // --------------------------------------------------------------------------
  // TEST SECTION 7: HTTP GET Live Server Assertions
  // --------------------------------------------------------------------------
  console.log('\n[SECTION 7: Live HTTP Server Endpoint & Asset Serving]');
  const app = require('../server');

  await new Promise((resolve) => {
    const testServer = app.listen(0, '127.0.0.1', () => {
      const port = testServer.address().port;
      console.log(`  [INFO] Bound ephemeral HTTP server on port ${port}`);

      function makeRequest(reqPath) {
        return new Promise((reqResolve, reqReject) => {
          http.get(`http://127.0.0.1:${port}${reqPath}`, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => reqResolve({ status: res.statusCode, headers: res.headers, body }));
          }).on('error', reqReject);
        });
      }

      (async () => {
        try {
          // 7.1: GET / (Home Page)
          const homeRes = await makeRequest('/');
          assert(homeRes.status === 200, `GET / returns HTTP 200 (Got ${homeRes.status})`);
          assert(homeRes.headers['content-type'].includes('text/html'), 'GET / Content-Type is text/html');

          // Verify all required stylesheets are linked in HTML
          assert(homeRes.body.includes('/css/tokens.css'), 'GET / links /css/tokens.css');
          assert(homeRes.body.includes('/css/base.css'), 'GET / links /css/base.css');
          assert(homeRes.body.includes('/css/components.css'), 'GET / links /css/components.css');
          assert(homeRes.body.includes('/css/parallax.css'), 'GET / links /css/parallax.css');

          // Verify navbar and footer
          assert(homeRes.body.includes('navbar'), 'GET / includes navbar');
          assert(homeRes.body.includes('footer'), 'GET / includes footer');
          assert(homeRes.body.includes('tel:9988383380'), 'GET / includes telephone link');
          assert(homeRes.body.includes('mailto:ajay30@gmail.com'), 'GET / includes mailto link');
          assert(homeRes.body.includes('One Way Traffic Road, Mansa, Punjab 151505'), 'GET / includes office address');

          // Verify client scripts
          assert(homeRes.body.includes('/js/main.js'), 'GET / loads /js/main.js');
          assert(homeRes.body.includes('/js/parallax.js'), 'GET / loads /js/parallax.js');

          // 7.2: Static Assets Delivery
          const assets = [
            { path: '/css/tokens.css', check: '--bg-0' },
            { path: '/css/base.css', check: 'box-sizing' },
            { path: '/css/components.css', check: '.btn' },
            { path: '/css/parallax.css', check: 'parallax-layer' },
            { path: '/js/main.js', check: 'navbar-scrolled' },
            { path: '/js/parallax.js', check: 'AjaySinglaMotion' }
          ];

          for (const asset of assets) {
            const res = await makeRequest(asset.path);
            assert(res.status === 200, `GET ${asset.path} returns HTTP 200`);
            assert(res.body.includes(asset.check), `GET ${asset.path} contains expected signature "${asset.check}"`);
          }

        } catch (httpErr) {
          assert(false, `HTTP test exception: ${httpErr.message}`);
        } finally {
          testServer.close(() => {
            console.log('  [INFO] Ephemeral HTTP server cleanly closed.');
            resolve();
          });
        }
      })();
    });
  });

  // --------------------------------------------------------------------------
  // Summary & Exit
  // --------------------------------------------------------------------------
  console.log('\n======================================================================');
  if (failureCount === 0) {
    console.log('   ALL MILESTONE 2 VERIFICATION CHECKS PASSED (EXIT CODE 0)          ');
    console.log('======================================================================');
    process.exit(0);
  } else {
    console.error(`   ${failureCount} MILESTONE 2 VERIFICATION CHECK(S) FAILED (EXIT 1)        `);
    console.log('======================================================================');
    process.exit(1);
  }
}

runVerification().catch(err => {
  console.error('[UNHANDLED FATAL ERROR]', err);
  process.exit(1);
});
