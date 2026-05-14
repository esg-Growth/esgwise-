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
      const { getCertificateForAssessment } = await import('@/lib/db');
      certificate = await getCertificateForAssessment(assessment.id);
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
