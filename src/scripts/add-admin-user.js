const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

async function addAdminUser() {
  const dbPath = path.join(process.cwd(), 'data', 'esgwise.db');
  const db = new Database(dbPath);

  const email = 'admin@esgwise.com';
  const name = 'System Admin';
  const newPassword = 'adminpassword123';
  
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);
  
  // Create a unique id
  const { randomUUID } = require('crypto');
  const userId = randomUUID();

  // Insert the new admin user
  db.prepare(`
    INSERT OR REPLACE INTO users 
    (id, email, password_hash, name, role, is_admin, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, email, hash, name, 'owner', 1, 1);
  
  console.log('Added new admin user:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${newPassword}`);
}

addAdminUser().catch(console.error);
