const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

async function makeGmAdmin() {
  const dbPath = path.join(process.cwd(), 'data', 'esgwise.db');
  const db = new Database(dbPath);
  const email = 'gm@technoseedsjo.com';

  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);

  const newPassword = 'adminpassword123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  if (user) {
    db.prepare(`
      UPDATE users 
      SET role = 'owner', is_admin = 1, is_active = 1, password_hash = ?
      WHERE id = ?
    `).run(hash, user.id);
    console.log(`Updated existing user ${email} to admin. Password reset to: ${newPassword}`);
  } else {
    const userId = randomUUID();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name, role, is_admin, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, email, hash, 'General Manager', 'owner', 1, 1);
    
    console.log(`Created new admin user ${email} with password: ${newPassword}`);
  }
}

makeGmAdmin().catch(console.error);
