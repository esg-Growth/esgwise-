import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = JSON.parse(raw);

    const { getAssessment, getCertificateByCode } = await import('@/lib/db');
    const { calculateEsgScore } = await import('@/lib/esg-scoring');

    const assessment = await getAssessment(session.userId);
    if (!assessment) return NextResponse.json({ error: 'No assessment found' }, { status: 404 });

    const score = calculateEsgScore(assessment.responses, assessment.sector_id || 'other');

    let certificate = null;
    try {
      const { getFirestore } = await import('firebase-admin/firestore');
      const firestore = getFirestore();
      const certSnap = await firestore.collection('certificates').where('assessment_id', '==', assessment.id).limit(1).get();
      if (!certSnap.empty) {
        certificate = { id: certSnap.docs[0].id, ...certSnap.docs[0].data() };
      }
    } catch (e) {
      console.error('Error fetching certificate:', e);
    }

    return NextResponse.json({ 
      company: { id: assessment.company_id, name: assessment.company_name || 'My Company' }, 
      assessment, 
      score, 
      certificate 
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
