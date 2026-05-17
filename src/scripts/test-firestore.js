/**
 * Quick Firestore connectivity test.
 * Run: node src/scripts/test-firestore.js
 */
// Load .env.local manually (no dotenv dependency)
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.+)$/);
  if (m) {
    let val = m[2].trim();
    if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
      val = val.slice(1, -1);
    }
    process.env[m[1].trim()] = val;
  }
}

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

if (!getApps().length) {
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;
  if (sa) {
    initializeApp({ credential: cert(sa) });
    console.log('✅ Authenticated via service account');
  } else {
    initializeApp();
    console.log('⚠️  Using default credentials');
  }
}

const db = getFirestore();

async function main() {
  // List top-level collections
  const cols = await db.listCollections();
  console.log(`\n📦 Collections (${cols.length}):`);
  for (const col of cols) {
    const snap = await col.limit(3).get();
    console.log(`  • ${col.id} — ${snap.size} docs shown (of potentially more)`);
    snap.docs.forEach(d => {
      const data = d.data();
      const preview = Object.keys(data).slice(0, 5).join(', ');
      console.log(`    └ ${d.id}: {${preview}}`);
    });
  }
  console.log('\n✅ Firestore connection verified!');
}

main().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
