import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize
if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;
  if (serviceAccount) {
    initializeApp({ credential: cert(serviceAccount) });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

async function setupDemo() {
  const companyId = 'demo_company';
  const userId = 'demo_user';

  console.log('Setting up demo data...');

  await db.collection('companies').doc(companyId).set({
    name: 'Demo Corporation',
    sector: 'Technology',
    created_at: new Date().toISOString(),
  });

  await db.collection('users').doc(userId).set({
    email: 'demo@esgwise.com',
    name: 'Demo User',
    company_id: companyId,
    role: 'user',
    created_at: new Date().toISOString(),
  });

  await db.collection('assessments').doc('demo_assessment').set({
    company_id: companyId,
    title: 'Demo ESG Assessment 2024',
    period: '2024',
    status: 'completed',
    progress: 100,
    overall_score: 74,
    responses: {
      'gri-201-1': { value: 'High', justification: 'Excellent economic performance' },
      'gri-302-1': { value: 'Medium', justification: 'Energy consumption is moderate' },
    },
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  });

  console.log('Demo data setup complete.');
}

setupDemo().catch(console.error);
