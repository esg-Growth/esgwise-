import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getFirestore } from 'firebase-admin/firestore';
import { ASSESSMENT_SECTIONS } from '@/lib/questionnaire';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { assessmentId, actions } = await req.json();
    // actions: [{ provenanceId, questionId, value, action: 'accept' | 'reject' | 'edit' }]

    if (!assessmentId || !actions?.length) {
      return NextResponse.json({ error: 'assessmentId and actions are required' }, { status: 400 });
    }

    const db = getFirestore();
    const assessmentRef = db.collection('assessments').doc(assessmentId);
    
    await db.runTransaction(async (t) => {
      const assessmentDoc = await t.get(assessmentRef);
      if (!assessmentDoc.exists) throw new Error('Assessment not found');
      
      const assessmentData = assessmentDoc.data() || {};
      const responses = assessmentData.responses || {};

      for (const action of actions) {
        if (action.action === 'accept' || action.action === 'edit') {
          const val = action.action === 'edit' ? action.editedValue : action.value;
          responses[action.questionId] = val;

          if (action.provenanceId) {
            t.update(db.collection('kpi_provenance').doc(action.provenanceId), { accepted: 1 });
          }
        } else if (action.action === 'reject') {
          if (action.provenanceId) {
            t.update(db.collection('kpi_provenance').doc(action.provenanceId), { accepted: 2 });
          }
        }
      }

      // Recalculate progress
      const totalQuestions = ASSESSMENT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
      const answered = Object.values(responses).filter(v => v !== null && v !== '').length;
      const progress = Math.round((answered / totalQuestions) * 100);

      t.update(assessmentRef, {
        responses,
        progress,
        updated_at: new Date().toISOString()
      });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Accept error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
