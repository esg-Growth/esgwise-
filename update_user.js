const Database = require('better-sqlite3');
const path = require('path');
const DB_PATH = path.join(process.cwd(), 'data', 'esgwise.db');
const db = new Database(DB_PATH);

const rows = db.prepare("SELECT id, name, email, role, is_admin FROM users WHERE email='zahra1471990@gmail.com'").all();
console.log("Current user:", rows);
if (rows.length > 0) {
  const result = db.prepare("UPDATE users SET is_admin = 1, role = 'owner' WHERE email = 'zahra1471990@gmail.com'").run();
  console.log(`Row(s) updated: ${result.changes}`);
}
