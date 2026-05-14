import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'esgwise.db');

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_ar TEXT,
      sector TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT 'Jordan',
      size TEXT NOT NULL DEFAULT 'small',
      fiscal_year_start INTEGER DEFAULT 1,
      website TEXT,
      description TEXT,
      description_ar TEXT,
      logo_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      name_ar TEXT,
      role TEXT NOT NULL DEFAULT 'member',
      company_id TEXT,
      avatar_url TEXT,
      language TEXT DEFAULT 'en',
      is_admin INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      last_login TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      title TEXT NOT NULL,
      period TEXT NOT NULL,
      status TEXT DEFAULT 'draft',
      progress INTEGER DEFAULT 0,
      started_by TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (started_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS assessment_responses (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      section TEXT NOT NULL,
      pillar TEXT NOT NULL,
      value TEXT,
      numeric_value REAL,
      unit TEXT,
      file_url TEXT,
      notes TEXT,
      updated_by TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id),
      FOREIGN KEY (updated_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS esg_scores (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      overall_score REAL NOT NULL DEFAULT 0,
      env_score REAL DEFAULT 0,
      soc_score REAL DEFAULT 0,
      gov_score REAL DEFAULT 0,
      rating TEXT DEFAULT 'CCC',
      data_completeness REAL DEFAULT 0,
      strengths TEXT,
      weaknesses TEXT,
      gaps TEXT,
      ai_analysis TEXT,
      recommendations TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS roadmap_items (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      assessment_id TEXT,
      title TEXT NOT NULL,
      title_ar TEXT,
      description TEXT,
      description_ar TEXT,
      pillar TEXT NOT NULL,
      category TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      priority TEXT DEFAULT 'medium',
      impact_score REAL DEFAULT 0,
      gri_standard TEXT,
      suggested_kpi TEXT,
      target_value TEXT,
      status TEXT DEFAULT 'pending',
      department TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id)
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      assessment_id TEXT,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'full',
      format TEXT DEFAULT 'pdf',
      file_url TEXT,
      data TEXT,
      created_by TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      score REAL NOT NULL,
      rating TEXT NOT NULL,
      sector TEXT NOT NULL,
      issued_at TEXT DEFAULT (datetime('now')),
      expires_at TEXT,
      verification_code TEXT UNIQUE NOT NULL,
      is_valid INTEGER DEFAULT 1,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id)
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company_id TEXT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      company_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS uploaded_documents (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      category TEXT NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT,
      file_size INTEGER,
      file_path TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      extraction_result TEXT,
      raw_summary TEXT,
      raw_summary_ar TEXT,
      uploaded_by TEXT,
      processed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id),
      FOREIGN KEY (company_id) REFERENCES companies(id)
    );

    CREATE TABLE IF NOT EXISTS kpi_provenance (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      document_id TEXT NOT NULL,
      extracted_value TEXT,
      confidence REAL,
      evidence TEXT,
      accepted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (document_id) REFERENCES uploaded_documents(id)
    );
  `);
}

export async function getUserByEmail(email: string) {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  if (!user) return null;
  
  if (user.company_id) {
    const comp = db.prepare('SELECT name FROM companies WHERE id = ?').get(user.company_id) as any;
    user.company_name = comp?.name || '';
  }
  return user;
}

export async function createUser(email: string, passwordHash: string, companyName: string) {
  const db = getDb();
  const userId = require('uuid').v4();
  const companyId = require('uuid').v4();
  
  db.prepare('INSERT INTO companies (id, name, sector) VALUES (?, ?, ?)').run(companyId, companyName, 'Technology');
  db.prepare('INSERT INTO users (id, email, password_hash, name, role, company_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)').run(userId, email, passwordHash, email.split('@')[0], 'owner', companyId, 1);
  
  return { id: userId, company_id: companyId };
}

export async function getCompanyById(companyId: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM companies WHERE id = ?').get(companyId) as any;
}

export async function getAssessment(userId: string) {
  const db = getDb();
  const user = db.prepare('SELECT company_id FROM users WHERE id = ?').get(userId) as any;
  if (!user?.company_id) return null;
  
  return getAssessmentForCompany(user.company_id);
}

export async function getAssessmentForCompany(companyId: string) {
  const db = getDb();
  const assessment = db.prepare('SELECT * FROM assessments WHERE company_id = ? ORDER BY updated_at DESC LIMIT 1').get(companyId) as any;
  if (!assessment) return null;
  
  // Also get responses
  const responses = db.prepare('SELECT question_id, value FROM assessment_responses WHERE assessment_id = ?').all(assessment.id) as any[];
  const responseMap: Record<string, string> = {};
  responses.forEach(r => responseMap[r.question_id] = r.value);
  
  return { ...assessment, responses: responseMap };
}

export async function saveAssessment(userId: string, responses: any, sectorId: string) {
  const db = getDb();
  const user = db.prepare('SELECT company_id FROM users WHERE id = ?').get(userId) as any;
  if (!user?.company_id) throw new Error('User has no company');
  
  let assessment = db.prepare('SELECT id FROM assessments WHERE company_id = ? LIMIT 1').get(user.company_id) as any;
  const now = new Date().toISOString();
  
  if (!assessment) {
    const id = require('uuid').v4();
    db.prepare('INSERT INTO assessments (id, company_id, title, period, updated_at) VALUES (?, ?, ?, ?, ?)').run(id, user.company_id, 'Initial Assessment', '2024', now);
    assessment = { id };
  } else {
    db.prepare('UPDATE assessments SET sector_id = ?, updated_at = ? WHERE id = ?').run(sectorId, now, assessment.id);
  }
  
  // Save responses (brute force for MVP)
  db.prepare('DELETE FROM assessment_responses WHERE assessment_id = ?').run(assessment.id);
  const insert = db.prepare('INSERT INTO assessment_responses (id, assessment_id, question_id, section, pillar, value) VALUES (?, ?, ?, ?, ?, ?)');
  
  // This part is complex because we don't have section/pillar here. 
  // In a real app we'd fetch them from the questionnaire.
  for (const [qid, val] of Object.entries(responses)) {
    insert.run(require('uuid').v4(), assessment.id, qid, 'unknown', 'unknown', String(val));
  }
  
  return { id: assessment.id };
}

export async function createDocument(userId: string, filename: string, mimeType: string, category: string) {
  const db = getDb();
  const user = db.prepare('SELECT company_id FROM users WHERE id = ?').get(userId) as any;
  const id = require('uuid').v4();
  
  db.prepare(`
    INSERT INTO uploaded_documents (id, company_id, assessment_id, category, filename, original_name, mime_type, file_path)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, user.company_id, 'main', category, filename, filename, mimeType, 'uploads/' + filename);
  
  return { id };
}

export async function updateDocumentExtraction(documentId: string, result: any) {
  const db = getDb();
  db.prepare('UPDATE uploaded_documents SET extraction_result = ?, raw_summary = ?, raw_summary_ar = ?, status = ?, processed_at = ? WHERE id = ?')
    .run(JSON.stringify(result), result.summary, result.summary_ar, 'processed', new Date().toISOString(), documentId);
}

export async function updateDocumentStatus(documentId: string, status: string) {
  const db = getDb();
  db.prepare('UPDATE uploaded_documents SET status = ? WHERE id = ?').run(status, documentId);
}

export async function saveKpiProvenanceBatch(assessmentId: string, documentId: string, kpis: any[]) {
  const db = getDb();
  const insert = db.prepare('INSERT INTO kpi_provenance (id, assessment_id, question_id, document_id, extracted_value, confidence, evidence) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const uuid = require('uuid').v4;
  
  db.transaction(() => {
    for (const kpi of kpis) {
      if (kpi.questionId) {
        insert.run(uuid(), assessmentId, kpi.questionId, documentId, kpi.value, kpi.confidence, kpi.evidence);
      }
    }
  })();
}

export async function processKpiActions(assessmentId: string, actions: any[], totalQuestions: number) {
  const db = getDb();
  const updateProvenance = db.prepare('UPDATE kpi_provenance SET accepted = ? WHERE id = ?');
  const insertResponse = db.prepare('INSERT INTO assessment_responses (id, assessment_id, question_id, section, pillar, value) VALUES (?, ?, ?, ?, ?, ?)');
  const updateResponse = db.prepare('UPDATE assessment_responses SET value = ?, updated_at = ? WHERE assessment_id = ? AND question_id = ?');
  const checkResponse = db.prepare('SELECT id FROM assessment_responses WHERE assessment_id = ? AND question_id = ?');
  const uuid = require('uuid').v4;

  db.transaction(() => {
    for (const action of actions) {
      if (action.action === 'accept' || action.action === 'edit') {
         const val = action.action === 'edit' ? action.editedValue : action.value;
         const existing = checkResponse.get(assessmentId, action.questionId);
         if (existing) {
            updateResponse.run(String(val), new Date().toISOString(), assessmentId, action.questionId);
         } else {
            insertResponse.run(uuid(), assessmentId, action.questionId, 'unknown', 'unknown', String(val));
         }
         if (action.provenanceId) {
            updateProvenance.run(1, action.provenanceId);
         }
      } else if (action.action === 'reject') {
         if (action.provenanceId) {
            updateProvenance.run(2, action.provenanceId);
         }
      }
    }

    const responses = db.prepare('SELECT COUNT(*) as count FROM assessment_responses WHERE assessment_id = ?').get(assessmentId) as any;
    const progress = Math.round((responses.count / totalQuestions) * 100);
    db.prepare('UPDATE assessments SET progress = ?, updated_at = ? WHERE id = ?').run(progress, new Date().toISOString(), assessmentId);
  })();
}

export async function getDocuments(userId: string) {
  const db = getDb();
  const user = db.prepare('SELECT company_id FROM users WHERE id = ?').get(userId) as any;
  const docs = db.prepare('SELECT * FROM uploaded_documents WHERE company_id = ? ORDER BY created_at DESC').all(user.company_id) as any[];
  
  return docs.map(d => ({
    ...d,
    extraction_result: d.extraction_result ? JSON.parse(d.extraction_result) : null
  }));
}

export async function saveChatMessage(userId: string, role: string, content: string) {
  const db = getDb();
  const user = db.prepare('SELECT company_id FROM users WHERE id = ?').get(userId) as any;
  db.prepare('INSERT INTO chat_messages (id, user_id, company_id, role, content) VALUES (?, ?, ?, ?, ?)')
    .run(require('uuid').v4(), userId, user.company_id, role, content);
}

export async function getChatHistory(userId: string, limitCount = 20) {
  const db = getDb();
  return db.prepare('SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT ?').all(userId, limitCount) as any[];
}

export async function issueCertificate(assessmentId: string) {
  const db = getDb();
  
  const assessment = db.prepare('SELECT * FROM assessments WHERE id = ?').get(assessmentId) as any;
  if (!assessment) throw new Error('Assessment not found');
  
  const score = db.prepare('SELECT overall_score, rating FROM esg_scores WHERE assessment_id = ?').get(assessmentId) as any;
  if (!score || !score.overall_score) throw new Error('Assessment must be scored before issuing certificate');

  const company = db.prepare('SELECT sector FROM companies WHERE id = ?').get(assessment.company_id) as any;
  
  const crypto = require('crypto');
  const prefix = 'ESG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const verificationCode = `${prefix}-${timestamp}-${random}`;

  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const id = require('uuid').v4();

  db.transaction(() => {
    db.prepare(`
      INSERT INTO certificates (id, company_id, assessment_id, score, rating, sector, issued_at, expires_at, verification_code, is_valid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, assessment.company_id, assessmentId, score.overall_score, score.rating || 'A', company?.sector || 'General', issuedAt, expiresAt, verificationCode, 1);
    
    db.prepare('UPDATE assessments SET status = ?, updated_at = ? WHERE id = ?')
      .run('certified', new Date().toISOString(), assessmentId);
  })();

  return { success: true, certificateId: id, verificationCode };
}

export async function getCertificateByCode(code: string) {
  const db = getDb();
  return db.prepare(`
    SELECT c.*, co.name as company_name 
    FROM certificates c
    JOIN companies co ON c.company_id = co.id
    WHERE c.verification_code = ?
  `).get(code) as any;
}

export async function getCertificateForAssessment(assessmentId: string) {
  const db = getDb();
  return db.prepare('SELECT * FROM certificates WHERE assessment_id = ? LIMIT 1').get(assessmentId) as any;
}

export default getDb;
