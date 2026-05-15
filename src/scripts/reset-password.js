const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  const dbPath = path.join(process.cwd(), 'data', 'esgwise.db');
  const db = new Database(dbPath);

  const newPassword = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  db.prepare('UPDATE users SET password_hash = ?, is_admin = 1 WHERE email = ?').run(hash, 'ahmad@technoseeds.com');
  
  console.log('Password for ahmad@technoseeds.com reset to:', newPassword);
}

resetPassword().catch(console.error);
