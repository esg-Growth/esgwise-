import { NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';

export async function GET(req: Request) {
  // Ensure this can only be run in development to protect data
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Migration can only be run in local development mode' }, { status: 403 });
  }

  try {
    const DB_PATH = path.join(process.cwd(), 'data', 'esgwise.db');
    let sqliteDb;
    try {
      sqliteDb = new Database(DB_PATH, { fileMustExist: true });
    } catch (e) {
      return NextResponse.json({ error: 'Local database file not found. Nothing to migrate.' }, { status: 404 });
    }

    // Make sure Firebase is initialized
    if (!getApps().length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;

      if (serviceAccount) {
        initializeApp({ credential: cert(serviceAccount as ServiceAccount) });
      } else {
        initializeApp();
      }
    }

    const firestore = getFirestore();

    const tables = [
      'companies', 'users', 'assessments', 'assessment_responses', 
      'esg_scores', 'roadmap_items', 'reports', 'certificates', 
      'chat_messages', 'activity_log', 'uploaded_documents'
    ];
    
    const results: Record<string, any> = {};

    for (const table of tables) {
      try {
         const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();
         
         // Firestore limits batches to 500 operations
         // We will chunk the inserts into batches of 400
         let count = 0;
         const chunks = [];
         for (let i = 0; i < rows.length; i += 400) {
             chunks.push(rows.slice(i, i + 400));
         }

         for (const chunk of chunks) {
            const batch = firestore.batch();
            for (const row of chunk as any[]) {
                if (!row.id) continue;
                const docRef = firestore.collection(table).doc(row.id.toString());
                batch.set(docRef, row, { merge: true });
                count++;
            }
            if (chunk.length > 0) {
                await batch.commit();
            }
         }
         results[table] = count;
      } catch(e: any) {
         results[table] = { error: e.message };
      }
    }

    // Migrate tenant_settings if it exists
    try {
        const rows = sqliteDb.prepare(`SELECT * FROM tenant_settings`).all();
        const batch = firestore.batch();
        let count = 0;
        for (const row of rows as any[]) {
            if (!row.id) continue;
            const docRef = firestore.collection('tenant_settings').doc(row.id.toString());
            // Parse JSON fields
            let data = { ...row };
            if (row.colors) {
                try { data.colors = JSON.parse(row.colors); } catch(e) {}
            }
            if (row.features) {
                try { data.features = JSON.parse(row.features); } catch(e) {}
            }
            batch.set(docRef, data, { merge: true });
            count++;
        }
        if (count > 0) {
            await batch.commit();
        }
        results['tenant_settings'] = count;
    } catch(e) {
        // Table might not exist, ignore
    }

    return NextResponse.json({ 
        success: true, 
        message: 'Successfully migrated local SQLite data to Cloud Firestore',
        migrated: results 
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
