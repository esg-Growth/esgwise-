import { getSession } from '@/lib/session';
import { DashboardOverview } from './overview';

export default async function DashboardPage() {
  const session = await getSession();

  let company = null;
  let assessment = null;
  try {
    const { getFirestore } = await import('firebase-admin/firestore');
    const db = getFirestore();
    
    if (session?.companyId) {
      const companyDoc = await db.collection('companies').doc(session.companyId).get();
      if (companyDoc.exists) {
        company = { id: companyDoc.id, ...companyDoc.data() };
      }

      const assessmentsSnap = await db.collection('assessments')
        .where('company_id', '==', session.companyId)
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();
        
      if (!assessmentsSnap.empty) {
        assessment = { id: assessmentsSnap.docs[0].id, ...assessmentsSnap.docs[0].data() };
      }
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }

  return <DashboardOverview session={session!} company={company} assessment={assessment} />;
}
