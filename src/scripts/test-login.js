const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

async function testLogin(email, password) {
  const dbPath = path.join(process.cwd(), 'data', 'esgwise.db');
  const db = new Database(dbPath);
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    console.log(`User ${email} NOT FOUND in DB.`);
    return;
  }
  
  console.log(`User ${email} found. Role: ${user.role}, Active: ${user.is_active}`);
  console.log(`Hash in DB: ${user.password_hash}`);
  
  const valid = await bcrypt.compare(password, user.password_hash);
  console.log(`Password match: ${valid}`);
}

testLogin('gm@technoseedsjo.com', 'adminpassword123').catch(console.error);
testLogin('admin@esgwise.com', 'adminpassword123').catch(console.error);
