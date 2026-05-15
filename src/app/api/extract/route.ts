import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs';
import { getDocumentById, updateDocumentExtraction, updateDocumentStatus, saveKpiProvenanceBatch } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const { documentId } = await req.json();
    if (!documentId) return NextResponse.json({ error: 'documentId is required' }, { status: 400 });

    const doc = await getDocumentById(documentId);
    if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 });

    // Update status to processing
    await updateDocumentStatus(documentId, 'processing');

    // Parse file content
    const { parseFileContent, extractEsgData } = await import('@/lib/extraction-engine');
    const buffer = fs.readFileSync(doc.file_path);
    const content = await parseFileContent(buffer, doc.mime_type || '', doc.original_name);

    // Extract with Gemini AI
    const result = await extractEsgData(content, doc.category, documentId, doc.mime_type);

    // Save extraction results
    await updateDocumentExtraction(documentId, result);

    // Save individual KPI provenance records
    await saveKpiProvenanceBatch(doc.assessment_id, documentId, result.extractedKpis || []);

    return NextResponse.json({ success: true, result });
  } catch (err: any) {
    console.error('Extraction error:', err);

    // Mark as failed
    try {
      const { documentId } = await req.clone().json().catch(() => ({ documentId: null }));
      if (documentId) {
        await updateDocumentStatus(documentId, 'failed');
      }
    } catch {}

    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
