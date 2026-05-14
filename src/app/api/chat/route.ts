import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();
    const cookieStore = await cookies();
    const sessionRaw = cookieStore.get('esgwise_session')?.value;
    const session = sessionRaw ? JSON.parse(sessionRaw) : null;

    let context = "";
    if (session?.companyId) {
      try {
        const { getFirestore } = await import('firebase-admin/firestore');
        const firestore = getFirestore();
        
        const companyDoc = await firestore.collection('companies').doc(session.companyId).get();
        const company = companyDoc.exists ? companyDoc.data() : null;
        
        const assessmentSnap = await firestore.collection('assessments')
          .where('company_id', '==', session.companyId)
          .orderBy('created_at', 'desc')
          .limit(1)
          .get();
        
        const assessment = !assessmentSnap.empty ? assessmentSnap.docs[0].data() : null;
        
        context = `The user is from company "${company?.name || 'Unknown'}" in the "${company?.sector || 'Unknown'}" sector. `;
        if (assessment) {
          context += `They have an active assessment titled "${assessment.title}" with status "${assessment.status}". `;
        }
      } catch (e) {
        console.error('Failed to get context from firestore for chat:', e);
      }
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `You are the ESGwise AI Assistant, a professional expert in Environmental, Social, and Governance (ESG) standards, specifically the GRI (Global Reporting Initiative) standards.
Your goal is to help businesses in Jordan and the MENA region understand their ESG obligations and improve their sustainability performance.

Context: ${context}

Guidelines:
1. Be professional, helpful, and concise.
2. If asked about specific ESG metrics, refer to GRI standards.
3. Help users understand how to fill out their assessment on the ESGwise platform.
4. If they ask about their score, explain that it's calculated based on their answers in the "Assessment" module.
5. Provide actionable advice for improving ESG ratings.
6. Support both English and Arabic. If the user writes in Arabic, respond in Arabic.

Current conversation:
${history.map((h: any) => `${h.role}: ${h.content}`).join('\n')}
user: ${message}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    return NextResponse.json({ response: "I'm sorry, I encountered an error. Please try again later." }, { status: 500 });
  }
}
