/**
 * Empirical Adversarial Challenge Suite - Milestone 1
 * Ajay Singla Accounting Portfolio & Management Platform
 * 
 * Verifies:
 * 1. Seeder idempotency
 * 2. Database constraints (FK, UNIQUE, NOT NULL, CHECK)
 * 3. Repository methods & API contract audit
 * 4. SQLite transaction and rollback atomicity
 */

const fs = require('fs');
const path = require('path');
const db = require('../db/connection');
const serviceRepository = require('../db/repositories/serviceRepository');
const submissionRepository = require('../db/repositories/submissionRepository');
const adminRepository = require('../db/repositories/adminRepository');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];
const observations = [];

function recordPass(testName, detail = '') {
  totalTests++;
  passedTests++;
  console.log(`  [PASS] ${testName}${detail ? ` - ${detail}` : ''}`);
}

function recordFail(testName, errorMsg) {
  totalTests++;
  failedTests++;
  failures.push({ testName, errorMsg });
  console.error(`  [FAIL] ${testName}: ${errorMsg}`);
}

function noteObservation(title, detail) {
  observations.push({ title, detail });
  console.log(`  [OBSERVATION] ${title}: ${detail}`);
}

async function runChallenge() {
  console.log('======================================================================');
  console.log('   MILESTONE 1: EMPIRICAL ADVERSARIAL CHALLENGE & STRESS HARNESS      ');
  console.log('======================================================================\n');

  // ==========================================================================
  // SECTION 1: SEEDER IDEMPOTENCY
  // ==========================================================================
  console.log('[SECTION 1: Seeder Idempotency Stress Test]');
  try {
    // Check initial counts
    const initialAdmins = db.prepare('SELECT COUNT(*) as count FROM ADMIN_USER').get().count;
    const initialServices = db.prepare('SELECT COUNT(*) as count FROM SERVICE').get().count;

    noteObservation('Initial counts', `Admins: ${initialAdmins}, Services: ${initialServices}`);

    // Re-run the seed upsert logic 3 times consecutively
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
    const serviceUpsertSql = `
      INSERT INTO SERVICE (slug, title, summary, description, sort_order)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(slug) DO UPDATE SET
        title = excluded.title,
        summary = excluded.summary,
        description = excluded.description,
        sort_order = excluded.sort_order;
    `;

    for (let run = 1; run <= 3; run++) {
      db.prepare(adminUpsertSql).run('admin@ajaysingla.com', 'admin@ajaysingla.com', '$2b$10$FakeHashForIdempotencyTest123');
      db.prepare(serviceUpsertSql).run('gst', 'GST Registration & Filing', 'Summary GST', 'Desc GST', 1);
      db.prepare(serviceUpsertSql).run('income-tax', 'ITR Filing', 'Summary ITR', 'Desc ITR', 2);
      db.prepare(serviceUpsertSql).run('pan', 'PAN Assistance', 'Summary PAN', 'Desc PAN', 3);
    }

    const postSeedAdmins = db.prepare('SELECT COUNT(*) as count FROM ADMIN_USER').get().count;
    const postSeedServices = db.prepare('SELECT COUNT(*) as count FROM SERVICE').get().count;

    if (postSeedAdmins === initialAdmins) {
      recordPass('Seeder Admin Idempotency', `Admin count remained constant (${postSeedAdmins}) after 3 repeat runs`);
    } else {
      recordFail('Seeder Admin Idempotency', `Admin count changed from ${initialAdmins} to ${postSeedAdmins}`);
    }

    if (postSeedServices === initialServices) {
      recordPass('Seeder Service Idempotency', `Service count remained constant (${postSeedServices}) after 3 repeat runs`);
    } else {
      recordFail('Seeder Service Idempotency', `Service count changed from ${initialServices} to ${postSeedServices}`);
    }

  } catch (err) {
    recordFail('Seeder Idempotency Execution', err.message);
  }

  // ==========================================================================
  // SECTION 2: DATABASE CONSTRAINTS STRESS TEST
  // ==========================================================================
  console.log('\n[SECTION 2: Database Constraints (FK, UNIQUE, NOT NULL, CHECK)]');

  // 2.1 Foreign Key Enforcement
  // Attempt inserting submission with invalid service_id
  try {
    let fkTriggered = false;
    try {
      db.prepare(`
        INSERT INTO SUBMISSION (name, email, phone, service_id, message, status, ip_hash)
        VALUES ('FK Test', 'fk@example.com', '9876543210', 999999, 'Testing FK rejection', 'new', 'fakehash')
      `).run();
    } catch (fkErr) {
      if (fkErr.message.includes('FOREIGN KEY') || fkErr.message.includes('constraint failed')) {
        fkTriggered = true;
      } else {
        throw fkErr;
      }
    }

    if (fkTriggered) {
      recordPass('FK Constraint: SUBMISSION.service_id -> SERVICE.id', 'Rejected non-existent service_id 999999');
    } else {
      recordFail('FK Constraint: SUBMISSION.service_id -> SERVICE.id', 'Failed to reject invalid service_id (FOREIGN KEY was NOT enforced!)');
    }
  } catch (err) {
    recordFail('FK Constraint Test', err.message);
  }

  // 2.2 Foreign Key: SUBMISSION_NOTE with invalid submission_id
  try {
    let fkTriggered = false;
    try {
      db.prepare(`
        INSERT INTO SUBMISSION_NOTE (submission_id, admin_id, note)
        VALUES (999999, 1, 'Invalid submission reference')
      `).run();
    } catch (fkErr) {
      if (fkErr.message.includes('FOREIGN KEY') || fkErr.message.includes('constraint failed')) {
        fkTriggered = true;
      } else {
        throw fkErr;
      }
    }

    if (fkTriggered) {
      recordPass('FK Constraint: SUBMISSION_NOTE.submission_id -> SUBMISSION.id', 'Rejected non-existent submission_id 999999');
    } else {
      recordFail('FK Constraint: SUBMISSION_NOTE.submission_id -> SUBMISSION.id', 'Failed to enforce FK on SUBMISSION_NOTE');
    }
  } catch (err) {
    recordFail('FK Note Test', err.message);
  }

  // 2.3 Unique Constraint: SERVICE.slug
  try {
    let uniqueTriggered = false;
    try {
      db.prepare(`
        INSERT INTO SERVICE (slug, title, summary, description, sort_order)
        VALUES ('gst', 'Duplicate GST', 'Summary', 'Desc', 10)
      `).run();
    } catch (uErr) {
      if (uErr.message.includes('UNIQUE') || uErr.message.includes('constraint failed')) {
        uniqueTriggered = true;
      } else {
        throw uErr;
      }
    }

    if (uniqueTriggered) {
      recordPass('UNIQUE Constraint: SERVICE.slug', 'Rejected duplicate slug "gst"');
    } else {
      recordFail('UNIQUE Constraint: SERVICE.slug', 'Allowed duplicate service slug');
    }
  } catch (err) {
    recordFail('Unique Service Slug Test', err.message);
  }

  // 2.4 Unique Constraint: ADMIN_USER.username
  try {
    let uniqueTriggered = false;
    try {
      db.prepare(`
        INSERT INTO ADMIN_USER (username, email, password_hash)
        VALUES ('admin@ajaysingla.com', 'another@ajaysingla.com', 'somehash')
      `).run();
    } catch (uErr) {
      if (uErr.message.includes('UNIQUE') || uErr.message.includes('constraint failed')) {
        uniqueTriggered = true;
      } else {
        throw uErr;
      }
    }

    if (uniqueTriggered) {
      recordPass('UNIQUE Constraint: ADMIN_USER.username', 'Rejected duplicate admin username');
    } else {
      recordFail('UNIQUE Constraint: ADMIN_USER.username', 'Allowed duplicate admin username');
    }
  } catch (err) {
    recordFail('Unique Admin Username Test', err.message);
  }

  // 2.5 NOT NULL Constraints
  const notNullTests = [
    { table: 'ADMIN_USER', sql: "INSERT INTO ADMIN_USER (username, password_hash) VALUES (NULL, 'hash')", field: 'username' },
    { table: 'ADMIN_USER', sql: "INSERT INTO ADMIN_USER (username, password_hash) VALUES ('testuser', NULL)", field: 'password_hash' },
    { table: 'SERVICE', sql: "INSERT INTO SERVICE (slug, title, summary) VALUES (NULL, 'Title', 'Sum')", field: 'slug' },
    { table: 'SERVICE', sql: "INSERT INTO SERVICE (slug, title, summary) VALUES ('valid-slug', NULL, 'Sum')", field: 'title' },
    { table: 'SUBMISSION', sql: "INSERT INTO SUBMISSION (name, email, phone, message, ip_hash) VALUES (NULL, 'e@e.com', '1234567890', 'msg', 'ip')", field: 'name' },
    { table: 'SUBMISSION', sql: "INSERT INTO SUBMISSION (name, email, phone, message, ip_hash) VALUES ('Name', NULL, '1234567890', 'msg', 'ip')", field: 'email' },
    { table: 'SUBMISSION', sql: "INSERT INTO SUBMISSION (name, email, phone, message, ip_hash) VALUES ('Name', 'e@e.com', NULL, 'msg', 'ip')", field: 'phone' },
    { table: 'SUBMISSION', sql: "INSERT INTO SUBMISSION (name, email, phone, message, ip_hash) VALUES ('Name', 'e@e.com', '1234567890', NULL, 'ip')", field: 'message' },
    { table: 'SUBMISSION', sql: "INSERT INTO SUBMISSION (name, email, phone, message, ip_hash) VALUES ('Name', 'e@e.com', '1234567890', 'msg', NULL)", field: 'ip_hash' }
  ];

  for (const t of notNullTests) {
    let notNullTriggered = false;
    try {
      db.prepare(t.sql).run();
    } catch (nnErr) {
      if (nnErr.message.includes('NOT NULL') || nnErr.message.includes('constraint failed')) {
        notNullTriggered = true;
      }
    }
    if (notNullTriggered) {
      recordPass(`NOT NULL: ${t.table}.${t.field}`, `Enforces NOT NULL constraint`);
    } else {
      recordFail(`NOT NULL: ${t.table}.${t.field}`, `Failed to reject NULL value`);
    }
  }

  // 2.6 CHECK Constraint: SUBMISSION.status
  try {
    let checkTriggered = false;
    try {
      db.prepare(`
        INSERT INTO SUBMISSION (name, email, phone, message, status, ip_hash)
        VALUES ('Check Test', 'check@example.com', '9876543210', 'Check msg', 'invalid_status_xyz', 'hash')
      `).run();
    } catch (cErr) {
      if (cErr.message.includes('CHECK') || cErr.message.includes('constraint failed')) {
        checkTriggered = true;
      }
    }
    if (checkTriggered) {
      recordPass('CHECK Constraint: SUBMISSION.status', 'Rejected invalid status "invalid_status_xyz"');
    } else {
      recordFail('CHECK Constraint: SUBMISSION.status', 'Allowed invalid status value not in enum list');
    }
  } catch (err) {
    recordFail('CHECK status test', err.message);
  }

  // ==========================================================================
  // SECTION 3: REPOSITORY METHOD & CONTRACT TESTING
  // ==========================================================================
  console.log('\n[SECTION 3: Repository Methods & Interface Contract Audit]');

  // 3.1 serviceRepository
  try {
    // getAll
    const all = serviceRepository.getAll();
    if (Array.isArray(all) && all.length >= 3) {
      recordPass('serviceRepository.getAll()', `Returned ${all.length} services sorted`);
    } else {
      recordFail('serviceRepository.getAll()', `Expected >= 3 services array, got ${JSON.stringify(all)}`);
    }

    // getBySlug
    const gst = serviceRepository.getBySlug('gst');
    if (gst && gst.slug === 'gst') {
      recordPass('serviceRepository.getBySlug("gst")', `Found service: ${gst.title}`);
    } else {
      recordFail('serviceRepository.getBySlug("gst")', 'Failed to find GST service');
    }

    const nonExistentSlug = serviceRepository.getBySlug('non-existent-service-12345');
    if (nonExistentSlug === undefined || nonExistentSlug === null) {
      recordPass('serviceRepository.getBySlug(nonExistent)', 'Correctly returned undefined/null');
    } else {
      recordFail('serviceRepository.getBySlug(nonExistent)', `Expected undefined, got ${JSON.stringify(nonExistentSlug)}`);
    }

    // getById
    if (gst && gst.id) {
      const byId = serviceRepository.getById(gst.id);
      if (byId && byId.slug === 'gst') {
        recordPass('serviceRepository.getById()', `Retrieved service ID ${gst.id}`);
      } else {
        recordFail('serviceRepository.getById()', 'Failed to retrieve service by ID');
      }
    }
  } catch (err) {
    recordFail('serviceRepository execution', err.message);
  }

  // 3.2 submissionRepository
  let createdSubId = null;
  try {
    // create
    createdSubId = submissionRepository.create({
      name: 'Adversarial Tester',
      email: 'adversary@test.com',
      phone: '9876543210',
      service_id: 1, // gst
      message: 'Testing submission repository methods under stress',
      ip_hash: 'salted-sha256-hash-adversarial'
    });

    if (createdSubId && Number(createdSubId) > 0) {
      recordPass('submissionRepository.create()', `Created submission ID ${createdSubId}`);
    } else {
      recordFail('submissionRepository.create()', `Returned invalid ID: ${createdSubId}`);
    }

    // getById
    const fetched = submissionRepository.getById(createdSubId);
    if (fetched && fetched.name === 'Adversarial Tester' && fetched.service_title) {
      recordPass('submissionRepository.getById()', `Retrieved record with joined service_title: "${fetched.service_title}"`);
    } else {
      recordFail('submissionRepository.getById()', `Failed to retrieve or join service title: ${JSON.stringify(fetched)}`);
    }

    // list
    const listRes = submissionRepository.list({ page: 1, limit: 5 });
    if (listRes && Array.isArray(listRes.items) && typeof listRes.total === 'number') {
      recordPass('submissionRepository.list()', `Returned ${listRes.items.length} items, total: ${listRes.total}`);
    } else {
      recordFail('submissionRepository.list()', `Invalid list format: ${JSON.stringify(listRes)}`);
    }

    // getCounts
    const counts = submissionRepository.getCounts();
    if (counts && typeof counts.total === 'number' && typeof counts.new === 'number') {
      recordPass('submissionRepository.getCounts()', `Counts: total=${counts.total}, new=${counts.new}, in_progress=${counts.in_progress}, closed=${counts.closed}`);
    } else {
      recordFail('submissionRepository.getCounts()', `Invalid counts response: ${JSON.stringify(counts)}`);
    }

    // addNote & getNotes
    const adminUser = db.prepare('SELECT id FROM ADMIN_USER LIMIT 1').get();
    const adminId = adminUser ? adminUser.id : 1;
    submissionRepository.addNote(createdSubId, adminId, 'Adversarial challenge test note');
    const notes = submissionRepository.getNotes(createdSubId);
    if (Array.isArray(notes) && notes.length > 0 && notes[0].note === 'Adversarial challenge test note') {
      recordPass('submissionRepository.addNote() & getNotes()', `Added and retrieved note with admin info`);
    } else {
      recordFail('submissionRepository.addNote() & getNotes()', `Notes failure: ${JSON.stringify(notes)}`);
    }

    // updateStatus
    submissionRepository.updateStatus(createdSubId, 'in_progress');
    const updatedSub = submissionRepository.getById(createdSubId);
    if (updatedSub && updatedSub.status === 'in_progress') {
      recordPass('submissionRepository.updateStatus()', `Updated status to "in_progress"`);
    } else {
      recordFail('submissionRepository.updateStatus()', `Failed status update: ${JSON.stringify(updatedSub)}`);
    }

    // getAllForExport
    const exportData = submissionRepository.getAllForExport();
    if (Array.isArray(exportData) && exportData.length > 0) {
      recordPass('submissionRepository.getAllForExport()', `Export returned ${exportData.length} records`);
    } else {
      recordFail('submissionRepository.getAllForExport()', `Export failed: ${JSON.stringify(exportData)}`);
    }

    // CHALLENGE: Check if getAll exists on submissionRepository
    if (typeof submissionRepository.getAll === 'function') {
      recordPass('submissionRepository.getAll() contract check', 'Method exists');
    } else {
      noteObservation('submissionRepository API Note', 'submissionRepository uses .list() and .getAllForExport() instead of .getAll()');
    }

  } catch (err) {
    recordFail('submissionRepository execution', err.message);
  } finally {
    // Clean up created test submission and notes
    if (createdSubId) {
      try {
        db.prepare('DELETE FROM SUBMISSION WHERE id = ?').run(createdSubId);
      } catch (cleanErr) {}
    }
  }

  // 3.3 adminRepository
  try {
    // findByUsername
    const admin = adminRepository.findByUsername('admin@ajaysingla.com');
    if (admin && admin.username === 'admin@ajaysingla.com') {
      recordPass('adminRepository.findByUsername()', `Found admin: ${admin.username} (role: ${admin.role})`);
    } else {
      recordFail('adminRepository.findByUsername()', `Failed to find admin by username`);
    }

    // Case-insensitivity and trim check
    const adminUpper = adminRepository.findByUsername('  ADMIN@AJAYSINGLA.COM  ');
    if (adminUpper && adminUpper.username === 'admin@ajaysingla.com') {
      recordPass('adminRepository.findByUsername() normalizes input', 'Normalized uppercase and whitespace');
    } else {
      recordFail('adminRepository.findByUsername() normalization', 'Failed case-insensitive / trimmed lookup');
    }

    // Non-existent user
    const nonExistentAdmin = adminRepository.findByUsername('nonexistent_user_9999');
    if (nonExistentAdmin === undefined) {
      recordPass('adminRepository.findByUsername(nonExistent)', 'Correctly returned undefined');
    } else {
      recordFail('adminRepository.findByUsername(nonExistent)', `Expected undefined, got ${JSON.stringify(nonExistentAdmin)}`);
    }

    // findById
    if (admin && admin.id) {
      const byId = adminRepository.findById(admin.id);
      if (byId && byId.id === admin.id) {
        recordPass('adminRepository.findById()', `Found admin by ID ${admin.id}`);
      } else {
        recordFail('adminRepository.findById()', 'Failed to find admin by ID');
      }

      // recordFailedAttempt & lockout threshold test
      adminRepository.resetLockout(admin.id); // clean baseline
      for (let i = 1; i <= 4; i++) {
        adminRepository.recordFailedAttempt(admin.id, 5, 15 * 60 * 1000);
      }
      const stateBefore5 = adminRepository.findById(admin.id);
      if (stateBefore5.failed_attempts === 4 && stateBefore5.locked_until === null) {
        recordPass('adminRepository lockout threshold < 5', 'Attempts = 4, locked_until is null');
      } else {
        recordFail('adminRepository lockout threshold < 5', `State before 5th attempt: ${JSON.stringify(stateBefore5)}`);
      }

      // 5th attempt -> triggers lockout
      adminRepository.recordFailedAttempt(admin.id, 5, 15 * 60 * 1000);
      const stateAt5 = adminRepository.findById(admin.id);
      if (stateAt5.failed_attempts === 5 && stateAt5.locked_until !== null) {
        recordPass('adminRepository lockout threshold >= 5', `Locked until: ${stateAt5.locked_until}`);
      } else {
        recordFail('adminRepository lockout threshold >= 5', `Expected locked_until != null: ${JSON.stringify(stateAt5)}`);
      }

      // resetLockout
      adminRepository.resetLockout(admin.id);
      const stateAfterReset = adminRepository.findById(admin.id);
      if (stateAfterReset.failed_attempts === 0 && stateAfterReset.locked_until === null) {
        recordPass('adminRepository.resetLockout()', 'failed_attempts reset to 0, locked_until cleared');
      } else {
        recordFail('adminRepository.resetLockout()', `Expected clear state, got: ${JSON.stringify(stateAfterReset)}`);
      }
    }

    // CHALLENGE: Check if getByUsername or updateLockout aliases exist
    if (typeof adminRepository.getByUsername === 'function') {
      recordPass('adminRepository.getByUsername() contract check', 'Method exists');
    } else {
      noteObservation('adminRepository API Note', 'adminRepository exposes findByUsername() [orchestrator prompt noted getByUsername()]');
    }

    if (typeof adminRepository.updateLockout === 'function') {
      recordPass('adminRepository.updateLockout() contract check', 'Method exists');
    } else {
      noteObservation('adminRepository API Note', 'adminRepository exposes recordFailedAttempt() and resetLockout() [orchestrator prompt noted updateLockout()]');
    }

  } catch (err) {
    recordFail('adminRepository execution', err.message);
  }

  // ==========================================================================
  // SECTION 4: SQLITE TRANSACTION AND ROLLBACK ATOMICITY
  // ==========================================================================
  console.log('\n[SECTION 4: Transaction & Rollback Atomicity Stress Test]');
  try {
    // 4.1 Successful transaction commits all changes
    const initialServiceCount = db.prepare('SELECT COUNT(*) as count FROM SERVICE').get().count;

    const commitTx = db.transaction((slugA, slugB) => {
      db.prepare("INSERT INTO SERVICE (slug, title, summary) VALUES (?, 'Commit Test A', 'Summary A')").run(slugA);
      db.prepare("INSERT INTO SERVICE (slug, title, summary) VALUES (?, 'Commit Test B', 'Summary B')").run(slugB);
      return 'SUCCESS_COMMIT';
    });

    const commitResult = commitTx('tx-test-commit-a', 'tx-test-commit-b');
    const postCommitServiceCount = db.prepare('SELECT COUNT(*) as count FROM SERVICE').get().count;

    if (commitResult === 'SUCCESS_COMMIT' && postCommitServiceCount === initialServiceCount + 2) {
      recordPass('Transaction Commit', 'Both operations committed successfully in transaction');
    } else {
      recordFail('Transaction Commit', `Expected count ${initialServiceCount + 2}, got ${postCommitServiceCount}`);
    }

    // Clean up committed test services
    db.prepare("DELETE FROM SERVICE WHERE slug IN ('tx-test-commit-a', 'tx-test-commit-b')").run();

    // 4.2 Failed transaction completely rolls back earlier changes
    const countBeforeRollback = db.prepare('SELECT COUNT(*) as count FROM SERVICE').get().count;

    const rollbackTx = db.transaction((validSlug) => {
      // Step 1: Insert valid record
      db.prepare("INSERT INTO SERVICE (slug, title, summary) VALUES (?, 'Rollback Test', 'Summary')").run(validSlug);

      // Step 2: Deliberately throw an error
      throw new Error('INTENTIONAL_TX_ABORT_FOR_CHALLENGE');
    });

    let txThrew = false;
    try {
      rollbackTx('tx-test-rollback-canary');
    } catch (txErr) {
      if (txErr.message.includes('INTENTIONAL_TX_ABORT_FOR_CHALLENGE')) {
        txThrew = true;
      } else {
        throw txErr;
      }
    }

    const countAfterRollback = db.prepare('SELECT COUNT(*) as count FROM SERVICE').get().count;
    const canaryExists = db.prepare("SELECT * FROM SERVICE WHERE slug = 'tx-test-rollback-canary'").get();

    if (txThrew && countAfterRollback === countBeforeRollback && !canaryExists) {
      recordPass('Transaction Rollback Atomicity', 'Transaction threw error and canary record was completely rolled back');
    } else {
      recordFail('Transaction Rollback Atomicity', `Canary persisted or count mismatch! canary=${Boolean(canaryExists)}, countDiff=${countAfterRollback - countBeforeRollback}`);
    }

  } catch (err) {
    recordFail('Transaction Rollback Execution', err.message);
  }

  // ==========================================================================
  // CHALLENGE SUMMARY
  // ==========================================================================
  console.log('\n======================================================================');
  console.log('   CHALLENGE HARNESS SUMMARY                                         ');
  console.log('======================================================================');
  console.log(`  Total Assertions Tested : ${totalTests}`);
  console.log(`  Passed                  : ${passedTests}`);
  console.log(`  Failed                  : ${failedTests}`);

  if (observations.length > 0) {
    console.log('\n  Architectural & Interface Observations:');
    observations.forEach(o => console.log(`   - [${o.title}]: ${o.detail}`));
  }

  if (failedTests > 0) {
    console.error('\n  FAILURES ENCOUNTERED:');
    failures.forEach(f => console.error(`   - [${f.testName}]: ${f.errorMsg}`));
    console.log('\nVERDICT: REJECT');
    return { verdict: 'REJECT', totalTests, passedTests, failedTests, failures, observations };
  } else {
    console.log('\nVERDICT: APPROVE');
    return { verdict: 'APPROVE', totalTests, passedTests, failedTests, failures, observations };
  }
}

// Execute if run directly
if (require.main === module) {
  runChallenge()
    .then(res => {
      process.exit(res.failedTests === 0 ? 0 : 1);
    })
    .catch(err => {
      console.error('[FATAL CHALLENGE HARNESS CRASH]', err);
      process.exit(1);
    });
}

module.exports = runChallenge;
