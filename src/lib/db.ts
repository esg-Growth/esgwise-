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

export default getDb;
