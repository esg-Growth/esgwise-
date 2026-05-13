import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = JSON.parse(raw);

    const getDb = (await import('@/lib/db')).default;
    const { calculateEsgScore } = await import('@/lib/esg-scoring');
    const db = getDb();

    const company = db.prepare('SELECT * FROM companies WHERE id = ?').get(session.companyId) as any;
    const assessment = db.prepare("SELECT * FROM assessments WHERE company_id = ? ORDER BY created_at DESC LIMIT 1").get(session.companyId) as any;

    if (!assessment) return NextResponse.json({ error: 'No assessment found' }, { status: 404 });

    const rows = db.prepare('SELECT question_id, value FROM assessment_responses WHERE assessment_id = ?').all(assessment.id) as any[];
    const responses: Record<string, string> = {};
    rows.forEach((r: any) => { responses[r.question_id] = r.value; });

    const score = calculateEsgScore(responses, company?.sector || 'other');

    const certificate = db.prepare('SELECT * FROM certificates WHERE assessment_id = ?').get(assessment.id) as any;

    return NextResponse.json({ company, assessment, score, certificate });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
