/**
 * Database Seeding Engine
 * Ajay Singla Accounting Portfolio & Management Platform
 * 
 * Command: node db/seed.js (or npm.cmd run seed)
 */

const path = require('path');
const config = require('../config');
const db = require('./connection');

// Resilient bcrypt loader (tries bcrypt, falls back to bcryptjs)
let bcrypt;
try {
  bcrypt = require('bcrypt');
} catch (e) {
  try {
    bcrypt = require('bcryptjs');
  } catch (err) {
    console.error('[SEED] Fatal: Neither "bcrypt" nor "bcryptjs" is available.');
    process.exit(1);
  }
}

async function runSeed() {
  console.log('====================================================');
  console.log('   AJAY SINGLA PORTFOLIO - DATABASE SEEDING ENGINE   ');
  console.log('====================================================');

  // 1. Ensure schema is initialized
  try {
    console.log('[1/4] Ensuring database schema and tables exist...');
    db.initDatabase();
    console.log('      [OK] Schema tables and indexes verified.');
  } catch (err) {
    console.error('      [FAIL] Error applying schema:', err.message);
    process.exit(1);
  }

  // 2. Admin User Seeding
  console.log('\n[2/4] Seeding Administrator Account...');
  const adminUsername = (config.admin.username || 'admin@ajaysingla.com').trim().toLowerCase();
  const adminEmail = (config.admin.email || adminUsername).trim().toLowerCase();
  const adminPassword = config.admin.password || 'AdminSecure123!';
  
  // Hash password using cost factor 10
  const saltRounds = 10;
  const passwordHash = bcrypt.hashSync(adminPassword, saltRounds);

  const adminUpsertSql = `
    INSERT INTO ADMIN_USER (username, email, password_hash, role, failed_attempts, locked_until)
    VALUES (?, ?, ?, 'admin', 0, NULL)
    ON CONFLICT(username) DO UPDATE SET
      email = excluded.email,
      password_hash = excluded.password_hash,
      role = 'admin',
      failed_attempts = 0,
      locked_until = NULL;
  `;

  try {
    const adminStmt = db.prepare(adminUpsertSql);
    adminStmt.run(adminUsername, adminEmail, passwordHash);
    console.log(`      [OK] Admin user upserted: ${adminUsername} (Email: ${adminEmail})`);
    console.log(`      [OK] Password hashed with bcrypt (cost factor: ${saltRounds})`);
  } catch (err) {
    console.error('      [FAIL] Error seeding admin user:', err.message);
    process.exit(1);
  }

  // 3. Core Services Seeding
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
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      summary = excluded.summary,
      description = excluded.description,
      sort_order = excluded.sort_order;
  `;

  try {
    const serviceStmt = db.prepare(serviceUpsertSql);
    for (const s of services) {
      serviceStmt.run(s.slug, s.title, s.summary, s.description, s.sort_order);
      console.log(`      [OK] Service seeded: [${s.slug}] "${s.title}" (order: ${s.sort_order})`);
    }
  } catch (err) {
    console.error('      [FAIL] Error seeding services:', err.message);
    process.exit(1);
  }

  // 4. Verification Output
  console.log('\n[4/4] Verifying Seeded Data from SQLite...');
  const seededAdmin = db.prepare('SELECT id, username, email, role, failed_attempts, created_at FROM ADMIN_USER WHERE username = ?').get(adminUsername);
  const seededServices = db.prepare('SELECT id, slug, title, sort_order FROM SERVICE ORDER BY sort_order ASC').all();

  console.log('\n--- Admin User Record ---');
  console.table([seededAdmin]);

  console.log('--- Services Records ---');
  console.table(seededServices);

  console.log('====================================================');
  console.log('   DATABASE SEEDING COMPLETED SUCCESSFULLY (EXIT 0)  ');
  console.log('====================================================');

  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[SEED] Unhandled Exception during seeding:', err);
  process.exit(1);
});
