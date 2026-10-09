const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../db/database.sqlite');
const backupDir = path.join(__dirname, '../db/backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupDir, `database-${timestamp}.sqlite`);

try {
  fs.copyFileSync(dbPath, backupPath);
  console.log(`Successfully backed up database to ${backupPath}`);
} catch (err) {
  console.error('Database backup failed:', err);
}
