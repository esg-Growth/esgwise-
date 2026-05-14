import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { v4 as uuid } from 'uuid';
import path from 'path';
import fs from 'fs';
import { createDocument, getDocuments } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.companyId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File;
    const allFiles = files.length > 0 ? files : (singleFile ? [singleFile] : []);
    const category = formData.get('category') as string;
    const assessmentId = formData.get('assessmentId') as string;

    if (allFiles.length === 0 || !category || !assessmentId) {
      return NextResponse.json({ error: 'Files, category, and assessmentId are required' }, { status: 400 });
    }

    // Save file locally (or to cloud storage in a real prod env)
    const uploadDir = path.join(process.cwd(), 'data', 'uploads', session.companyId);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const results = [];
    for (const f of allFiles) {
      if (f.size > 10 * 1024 * 1024) continue; // Skip files > 10MB

      const ext = path.extname(f.name);
      const filename = `${Date.now()}_${uuid().slice(0, 8)}${ext}`;
      const filePath = path.join(uploadDir, filename);

      const buffer = Buffer.from(await f.arrayBuffer());
      fs.writeFileSync(filePath, buffer);

      // Create DB record
      const res = await createDocument(session.userId, filename, f.type, category, assessmentId, filePath);
      results.push({ documentId: res.id, filename: f.name });
    }

    return NextResponse.json({ success: true, documents: results });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET: list uploaded documents for a company
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const docs = await getDocuments(session.userId);
    return NextResponse.json({ documents: docs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
