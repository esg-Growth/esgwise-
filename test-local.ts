import * as dbLocal from './src/lib/db-local';

async function main() {
  console.log("Checking SQLite DB...");
  const users = await dbLocal.getAllUsers();
  console.log("Users in local DB:", users.map(u => ({ email: u.email, id: u.id, is_active: u.is_active })));
}

main().catch(console.error);
