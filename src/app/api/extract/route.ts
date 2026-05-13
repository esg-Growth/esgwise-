import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuid } from 'uuid';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { documentId } = await req.json();
    if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 });

    const getDb = (await import('@/lib/db')).default;
    const db = getDb();

    const doc = db.prepare('SELECT * FROM uploaded_documents WHERE id = ?').get(documentId) as any;
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // Update status to processing
    db.prepare("UPDATE uploaded_documents SET status = 'processing' WHERE id = ?").run(documentId);

    // Parse file content
    const { parseFileContent, extractEsgData } = await import('@/lib/extraction-engine');
    const buffer = fs.readFileSync(doc.file_path);
    const content = await parseFileContent(buffer, doc.mime_type || '', doc.original_name);

    // Extract with Gemini AI
    const result = await extractEsgData(content, doc.category, documentId, doc.mime_type);

    // Save extraction results
    db.prepare("UPDATE uploaded_documents SET status = 'completed', extraction_result = ?, raw_summary = ?, raw_summary_ar = ?, processed_at = datetime('now') WHERE id = ?")
      .run(JSON.stringify(result), result.summary, result.summary_ar, documentId);

    // Save individual KPI provenance records
    const stmt = db.prepare(`INSERT INTO kpi_provenance (id, assessment_id, question_id, document_id, extracted_value, confidence, evidence) VALUES (?, ?, ?, ?, ?, ?, ?)`);

    for (const kpi of result.extractedKpis) {
      if (kpi.questionId) {
        stmt.run(uuid(), doc.assessment_id, kpi.questionId, documentId, kpi.value, kpi.confidence, kpi.evidence);
      }
    }

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Extraction error:', err);

    // Mark as failed
    try {
      const { documentId } = await req.clone().json().catch(() => ({ documentId: null }));
      if (documentId) {
        const getDb = (await import('@/lib/db')).default;
        getDb().prepare("UPDATE uploaded_documents SET status = 'failed' WHERE id = ?").run(documentId);
      }
    } catch {}

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
