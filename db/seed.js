const fs = require('fs');
const path = require('path');
const config = require('../config');
const db = require('./connection');

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  console.error('[SEED] Fatal: "bcryptjs" is not available.');
  process.exit(1);
}

async function runSeed() {
  console.log('====================================================');
  console.log('   AJAY SINGLA PORTFOLIO - DATABASE SEEDING ENGINE   ');
  console.log('====================================================');

  try {
    console.log('[1/4] Ensuring database schema and tables exist...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await db.query(schemaSql);
    console.log('      [OK] Schema tables and indexes verified.');
  } catch (err) {
    console.error('      [FAIL] Error applying schema:', err.message);
    process.exit(1);
  }

  console.log('\n[2/4] Seeding Administrator Account...');
  const adminUsername = (config.admin.username || 'admin@ajaysingla.com').trim().toLowerCase();
  const adminEmail = (config.admin.email || adminUsername).trim().toLowerCase();
  const adminPassword = config.admin.password || 'AdminSecure123!';
  
  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync(adminPassword, saltRounds);

  const adminUpsertSql = `
    INSERT INTO ADMIN_USER (username, email, password_hash, role, failed_attempts, locked_until)
    VALUES ($1, $2, $3, 'admin', 0, NULL)
    ON CONFLICT (username) DO UPDATE SET
      email = EXCLUDED.email,
      password_hash = EXCLUDED.password_hash,
      role = 'admin',
      failed_attempts = 0,
      locked_until = NULL;
  `;

  try {
    await db.query(adminUpsertSql, [adminUsername, adminEmail, passwordHash]);
    console.log(`      [OK] Admin user upserted: ${adminUsername} (Email: ${adminEmail})`);
  } catch (err) {
    console.error('      [FAIL] Error seeding admin user:', err.message);
    process.exit(1);
  }

  console.log('\n[3/4] Seeding Core Accounting Services...');
  const services = [
    {
      slug: 'gst',
      title: 'GST Registration & Filing',
      summary: 'Comprehensive GST registration, monthly/quarterly return filing (GSTR-1, GSTR-3B), and annual compliance for businesses.',
      description: 'Full-cycle GST advisory and compliance service in Mansa, Punjab. We manage new GST registrations, amendment of existing GST numbers, monthly and quarterly return filings (GSTR-1 and GSTR-3B), input tax credit (ITC) reconciliation, annual returns (GSTR-9), and assistance with GST notice resolution.',
      sort_order: 1
    },
    {
      slug: 'income-tax',
      title: 'Income Tax Return (ITR) Filing',
      summary: 'Expert ITR filing for salaried individuals, freelancers, professionals, and small businesses with deduction optimization.',
      description: 'Accurate, timely Income Tax Return (ITR-1 through ITR-4) preparation and e-filing. We ensure optimal tax planning under Old and New tax regimes, compute capital gains, claim Section 80C/80D deductions, reconcile Form 26AS & AIS/TIS, and resolve tax intimation notices.',
      sort_order: 2
    },
    {
      slug: 'pan',
      title: 'PAN Card Application & Assistance',
      summary: 'PAN Card Application & Assistance for new PAN allotment, corrections, duplicate cards, and Aadhaar-PAN linking.',
      description: 'Complete support for Permanent Account Number (PAN) requirements. We handle new PAN applications for individuals, firms, and HUF, update incorrect names or dates of birth, assist with duplicate PAN cards for lost cards, and facilitate Aadhaar-PAN linking.',
      sort_order: 3
    }
  ];

  const serviceUpsertSql = `
    INSERT INTO SERVICE (slug, title, summary, description, sort_order)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      summary = EXCLUDED.summary,
      description = EXCLUDED.description,
      sort_order = EXCLUDED.sort_order;
  `;

  try {
    for (const s of services) {
      await db.query(serviceUpsertSql, [s.slug, s.title, s.summary, s.description, s.sort_order]);
      console.log(`      [OK] Service seeded: [${s.slug}] "${s.title}" (order: ${s.sort_order})`);
    }
  } catch (err) {
    console.error('      [FAIL] Error seeding services:', err.message);
    process.exit(1);
  }

  console.log('\n[4/4] Verifying Seeded Data from PostgreSQL...');
  try {
    const adminRes = await db.query('SELECT id, username, email, role, failed_attempts, created_at FROM ADMIN_USER WHERE username = $1', [adminUsername]);
    const serviceRes = await db.query('SELECT id, slug, title, sort_order FROM SERVICE ORDER BY sort_order ASC');

    console.log('\n--- Admin User Record ---');
    console.table(adminRes.rows);

    console.log('--- Services Records ---');
    console.table(serviceRes.rows);
  } catch (err) {
    console.error('      [FAIL] Error querying seeded data:', err.message);
  }

  console.log('====================================================');
  console.log('   DATABASE SEEDING COMPLETED SUCCESSFULLY (EXIT 0)  ');
  console.log('====================================================');

  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[SEED] Unhandled Exception during seeding:', err);
  process.exit(1);
});
