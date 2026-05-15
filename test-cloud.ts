const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

process.env.GOOGLE_CLOUD_PROJECT = "esgwise-6d39e";
initializeApp();

const db = getFirestore();

async function main() {
  console.log("Checking Cloud DB for gm@technoseedsjo.com...");
  const snap = await db.collection('users').where('email', '==', 'gm@technoseedsjo.com').get();
  console.log("Docs found:", snap.size);
  if (snap.size > 0) console.log("User:", snap.docs[0].data());
}

main().catch(console.error);
