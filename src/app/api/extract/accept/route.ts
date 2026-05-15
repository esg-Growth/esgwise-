import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { processKpiActions } from '@/lib/db';
import { ASSESSMENT_SECTIONS } from '@/lib/questionnaire';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { assessmentId, actions } = await req.json();
    // actions: [{ provenanceId, questionId, value, action: 'accept' | 'reject' | 'edit' }]

    if (!assessmentId || !actions?.length) {
      return NextResponse.json({ error: 'assessmentId and actions are required' }, { status: 400 });
    }

    const totalQuestions = ASSESSMENT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);

    await processKpiActions(assessmentId, actions, totalQuestions);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Accept error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
