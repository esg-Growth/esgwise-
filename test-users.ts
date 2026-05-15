import * as fs from 'fs';
import * as path from 'path';

const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim().replace(/^"|"$/g, '');
    }
  });
}

import { getUserByEmail } from './src/lib/db';

async function main() {
  console.log("Checking gm@technoseedsjo.com...");
  try {
    const gm = await getUserByEmail('gm@technoseedsjo.com');
    console.log(gm);
  } catch (e) {
    console.error("Error fetching gm:", e);
  }

  console.log("\nChecking zahra1471990@gmail.com...");
  try {
    const zahra = await getUserByEmail('zahra1471990@gmail.com');
    console.log(zahra);
  } catch (e) {
    console.error("Error fetching zahra:", e);
  }
}

main().catch(console.error);
