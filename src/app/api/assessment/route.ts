import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const sessionUser = session.user as any;

    const { action, assessmentId, responses } = await req.json();
    const { getAssessment, saveAssessment } = await import('@/lib/db');

    if (action === 'save') {
      if (!responses) return NextResponse.json({ error: 'Missing data' }, { status: 400 });
      // Transform responses array to object if needed
      const responseMap: Record<string, any> = {};
      if (Array.isArray(responses)) {
        responses.forEach(r => responseMap[r.questionId] = r.value);
      } else {
        Object.assign(responseMap, responses);
      }
      
      const res = await saveAssessment(sessionUser.id, responseMap, 'General');
      return NextResponse.json({ success: true, assessmentId: res.id });
    }

    if (action === 'get') {
      const assessment = await getAssessment(sessionUser.id);
      if (!assessment) return NextResponse.json({ assessment: null, responses: {} });
      return NextResponse.json({ assessment, responses: assessment.responses });
    }

    if (action === 'create') {
      const res = await saveAssessment(sessionUser.id, {}, 'General');
      return NextResponse.json({ success: true, assessmentId: res.id });
    }

    if (action === 'complete') {
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Assessment API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
