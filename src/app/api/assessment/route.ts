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
      
      const res = await saveAssessment(session.userId, responseMap, 'General');
      return NextResponse.json({ success: true, assessmentId: res.id });
    }

    if (action === 'get') {
      const assessment = await getAssessment(session.userId);
      if (!assessment) return NextResponse.json({ assessment: null, responses: {} });
      return NextResponse.json({ assessment, responses: assessment.responses });
    }

    if (action === 'complete') {
       // Cloud implementation can handle completion inside saveAssessment or a separate function
       // For now just return success as saveAssessment updates status implicitly if needed
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Assessment API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
