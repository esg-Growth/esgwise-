import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = JSON.parse(raw);

    const { action, assessmentId, responses } = await req.json();
    const getDb = (await import('@/lib/db')).default;
    const db = getDb();

    if (action === 'create') {
      const id = uuid();
      const now = new Date().toISOString();
      db.prepare(`INSERT INTO assessments (id, company_id, title, period, status, started_by) VALUES (?, ?, ?, ?, 'in_progress', ?)`)
        .run(id, session.companyId, 'ESG Assessment', new Date().getFullYear().toString(), session.userId);
      return NextResponse.json({ success: true, assessmentId: id });
    }

    if (action === 'save') {
      if (!assessmentId || !responses) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

      const stmt = db.prepare(`INSERT OR REPLACE INTO assessment_responses (id, assessment_id, question_id, section, pillar, value, numeric_value, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);

      const saveMany = db.transaction(() => {
        for (const r of responses) {
          const existing = db.prepare('SELECT id FROM assessment_responses WHERE assessment_id = ? AND question_id = ?').get(assessmentId, r.questionId) as any;
          const id = existing?.id || uuid();
          const numVal = parseFloat(r.value);
          stmt.run(id, assessmentId, r.questionId, r.section, r.pillar, r.value, isNaN(numVal) ? null : numVal, session.userId);
        }
      });
      saveMany();

      // Update progress
      const totalQuestions = 48; // from questionnaire.ts
      const answered = db.prepare('SELECT COUNT(*) as cnt FROM assessment_responses WHERE assessment_id = ? AND value IS NOT NULL AND value != ""').get(assessmentId) as any;
      const progress = Math.round((answered.cnt / totalQuestions) * 100);
      db.prepare('UPDATE assessments SET progress = ?, updated_at = datetime(\'now\') WHERE id = ?').run(progress, assessmentId);

      return NextResponse.json({ success: true, progress });
    }

    if (action === 'get') {
      const assessment = db.prepare('SELECT * FROM assessments WHERE company_id = ? ORDER BY created_at DESC LIMIT 1').get(session.companyId) as any;
      if (!assessment) return NextResponse.json({ assessment: null, responses: {} });

      const rows = db.prepare('SELECT question_id, value FROM assessment_responses WHERE assessment_id = ?').all(assessment.id) as any[];
      const resMap: Record<string, string> = {};
      rows.forEach((r: any) => { resMap[r.question_id] = r.value; });

      return NextResponse.json({ assessment, responses: resMap });
    }

    if (action === 'complete') {
      db.prepare("UPDATE assessments SET status = 'completed', completed_at = datetime('now'), progress = 100 WHERE id = ?").run(assessmentId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Assessment API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
