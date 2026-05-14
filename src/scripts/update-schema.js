const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'esgwise.db');
console.log('Using DB at:', dbPath);

const db = new Database(dbPath);

try {
  db.prepare('ALTER TABLE assessments ADD COLUMN overall_score INTEGER;').run();
  console.log('Added overall_score column to assessments table.');
} catch (e) {
  console.log('overall_score column might already exist:', e.message);
}

try {
  db.prepare('ALTER TABLE assessments ADD COLUMN period TEXT;').run();
  console.log('Added period column to assessments table.');
} catch (e) {
  console.log('period column might already exist:', e.message);
}

try {
  db.prepare('ALTER TABLE assessments ADD COLUMN status TEXT;').run();
  console.log('Added status column to assessments table.');
} catch (e) {
  console.log('status column might already exist:', e.message);
}

try {
  db.prepare('ALTER TABLE assessments ADD COLUMN progress INTEGER;').run();
  console.log('Added progress column to assessments table.');
} catch (e) {
  console.log('progress column might already exist:', e.message);
}

const users = db.prepare('SELECT id, email, role, is_active FROM users').all();
console.table(users);

// Enable any disabled users
users.forEach(u => {
    if (u.is_active === 0 || u.is_active === false || u.is_active === null) {
        db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(u.id);
        console.log(`Enabled user: ${u.email}`);
    }
});

console.log('Done.');
