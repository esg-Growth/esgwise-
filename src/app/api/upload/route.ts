import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = JSON.parse(raw);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const assessmentId = formData.get('assessmentId') as string;

    if (!file || !category || !assessmentId) {
      return NextResponse.json({ error: 'File, category, and assessmentId are required' }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }

    // Save file
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', session.companyId);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.name);
    const filename = `${Date.now()}_${uuid().slice(0, 8)}${ext}`;
    const filePath = path.join(uploadDir, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Create DB record
    const getDb = (await import('@/lib/db')).default;
    const db = getDb();
    const docId = uuid();

    db.prepare(`INSERT INTO uploaded_documents (id, assessment_id, company_id, category, filename, original_name, mime_type, file_size, file_path, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(docId, assessmentId, session.companyId, category, filename, file.name, file.type, file.size, filePath, session.userId);

    return NextResponse.json({ success: true, documentId: docId, filename: file.name });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: list uploaded documents for a company
export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get('esgwise_session')?.value;
    if (!raw) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    const session = JSON.parse(raw);

    const getDb = (await import('@/lib/db')).default;
    const db = getDb();

    const docs = db.prepare('SELECT * FROM uploaded_documents WHERE company_id = ? ORDER BY created_at DESC').all(session.companyId);
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
