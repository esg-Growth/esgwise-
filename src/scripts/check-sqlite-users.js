const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve('local-data', 'esgwise.db');
const db = new Database(dbPath);

const users = db.prepare('SELECT id, email, role, is_active FROM users').all();
console.table(users);

// Enable any disabled users
users.forEach(u => {
    if (u.is_active === 0 || u.is_active === false || u.is_active === null) {
        db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(u.id);
        console.log(`Enabled user: ${u.email}`);
    }
});
