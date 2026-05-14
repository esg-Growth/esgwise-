import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

async function listUsers() {
  if (!getApps().length) {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      initializeApp({ credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)) });
    } else {
      initializeApp();
    }
  }

  const auth = getAuth();
  const listUsersResult = await auth.listUsers(1000);
  console.log('Total users:', listUsersResult.users.length);
  listUsersResult.users.forEach((userRecord) => {
    console.log(`User: ${userRecord.email}, UID: ${userRecord.uid}, Disabled: ${userRecord.disabled}`);
    if (userRecord.disabled) {
       console.log(`-> Re-enabling user ${userRecord.email}`);
       auth.updateUser(userRecord.uid, { disabled: false }).then(() => {
         console.log(`-> Successfully re-enabled ${userRecord.email}`);
       }).catch(err => {
         console.error(`-> Failed to re-enable ${userRecord.email}:`, err);
       });
    }
  });
}

listUsers().catch(console.error);
