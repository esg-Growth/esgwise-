import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import { getDocumentById, updateDocumentExtraction } from '@/lib/db';
import { getFirestore } from 'firebase-admin/firestore';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { documentId } = await req.json();
    if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 });

    const doc = await getDocumentById(documentId);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // Update status to processing
    const db = getFirestore();
    await db.collection('uploaded_documents').doc(documentId).update({ status: 'processing' });

    // Parse file content
    const { parseFileContent, extractEsgData } = await import('@/lib/extraction-engine');
    const buffer = fs.readFileSync(doc.file_path);
    const content = await parseFileContent(buffer, doc.mime_type || '', doc.original_name);

    // Extract with Gemini AI
    const result = await extractEsgData(content, doc.category, documentId, doc.mime_type);

    // Save extraction results
    await updateDocumentExtraction(documentId, result);

    // Save individual KPI provenance records
    const batch = db.batch();
    for (const kpi of result.extractedKpis) {
      if (kpi.questionId) {
        const kpiRef = db.collection('kpi_provenance').doc(uuid());
        batch.set(kpiRef, {
          assessment_id: doc.assessment_id,
          question_id: kpi.questionId,
          document_id: documentId,
          extracted_value: kpi.value,
          confidence: kpi.confidence,
          evidence: kpi.evidence
        });
      }
    }
    await batch.commit();

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Extraction error:', err);

    // Mark as failed
    try {
      const { documentId } = await req.clone().json().catch(() => ({ documentId: null }));
      if (documentId) {
        const db = getFirestore();
        await db.collection('uploaded_documents').doc(documentId).update({ status: 'failed' });
      }
    } catch {}

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
