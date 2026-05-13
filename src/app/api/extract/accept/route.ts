import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = JSON.parse(raw);

    const { assessmentId, actions } = await req.json();
    // actions: [{ provenanceId, questionId, value, action: 'accept' | 'reject' | 'edit' }]

    if (!assessmentId || !actions?.length) {
      return NextResponse.json({ error: 'assessmentId and actions are required' }, { status: 400 });
    }

    const getDb = (await import('@/lib/db')).default;
    const db = getDb();

    const saveResponse = db.prepare(`INSERT OR REPLACE INTO assessment_responses (id, assessment_id, question_id, section, pillar, value, numeric_value, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`);

    const updateProvenance = db.prepare('UPDATE kpi_provenance SET accepted = ? WHERE id = ?');

    // Need questionnaire sections to map question → section/pillar
    const { ASSESSMENT_SECTIONS } = await import('@/lib/questionnaire');
    const questionMap = new Map<string, { section: string; pillar: string }>();
    for (const section of ASSESSMENT_SECTIONS) {
      for (const q of section.questions) {
        questionMap.set(q.id, { section: section.id, pillar: section.pillar });
      }
    }

    const transaction = db.transaction(() => {
      for (const action of actions) {
        if (action.action === 'accept' || action.action === 'edit') {
          const mapping = questionMap.get(action.questionId);
          if (!mapping) continue;

          const val = action.action === 'edit' ? action.editedValue : action.value;
          const numVal = parseFloat(val);
          const existing = db.prepare('SELECT id FROM assessment_responses WHERE assessment_id = ? AND question_id = ?').get(assessmentId, action.questionId) as any;
          const id = existing?.id || uuid();

          saveResponse.run(id, assessmentId, action.questionId, mapping.section, mapping.pillar, val, isNaN(numVal) ? null : numVal, session.userId);
          if (action.provenanceId) updateProvenance.run(1, action.provenanceId);
        } else if (action.action === 'reject') {
          if (action.provenanceId) updateProvenance.run(2, action.provenanceId);
        }
      }

      // Recalculate progress
      const totalQuestions = ASSESSMENT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
      const answered = db.prepare('SELECT COUNT(*) as cnt FROM assessment_responses WHERE assessment_id = ? AND value IS NOT NULL AND value != ""').get(assessmentId) as any;
      const progress = Math.round(((answered?.cnt || 0) / totalQuestions) * 100);
      db.prepare('UPDATE assessments SET progress = ?, updated_at = datetime(\'now\') WHERE id = ?').run(progress, assessmentId);
    });

    transaction();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Accept error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
