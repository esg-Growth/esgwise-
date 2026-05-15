import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import Database from 'better-sqlite3';
import path from 'path';

async function setupDemo() {
  const companyId = 'demo_company';
  const userId = 'demo_user';

  console.log('Setting up demo data...');
  const now = new Date().toISOString();

  if (process.env.USE_LOCAL_DB === 'true') {
    const { default: getDb } = require('../lib/db-local');
    const db = getDb();
    
    db.prepare(`
      INSERT OR REPLACE INTO companies (id, name, sector, created_at)
      VALUES (?, ?, ?, ?)
    `).run(companyId, 'Demo Corporation', 'Technology', now);

    db.prepare(`
      INSERT OR REPLACE INTO users (id, email, password_hash, name, company_id, role, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, 'demo@esgwise.com', '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQixbw.B.mZ1oXj', 'Demo User', companyId, 'user', 1, now);

    db.prepare(`
      INSERT OR REPLACE INTO assessments (id, company_id, title, period, status, progress, updated_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('demo_assessment', companyId, 'Demo ESG Assessment 2024', '2024', 'completed', 100, now, now);

    db.prepare('DELETE FROM assessment_responses WHERE assessment_id = ?').run('demo_assessment');
    
    db.prepare(`
      INSERT OR REPLACE INTO assessment_responses (id, assessment_id, question_id, section, pillar, value)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('demo_resp_1', 'demo_assessment', 'gri-201-1', 'economic_performance', 'governance', 'High');
    
    db.prepare(`
      INSERT OR REPLACE INTO assessment_responses (id, assessment_id, question_id, section, pillar, value)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('demo_resp_2', 'demo_assessment', 'gri-302-1', 'energy', 'environment', 'Medium');

    db.prepare(`
      INSERT OR REPLACE INTO esg_scores (id, assessment_id, company_id, overall_score, env_score, soc_score, gov_score, rating, data_completeness, strengths, weaknesses, gaps, ai_analysis, recommendations, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('demo_score_1', 'demo_assessment', companyId, 74, 80, 70, 72, 'A', 95, JSON.stringify(['Strong community engagement', 'Good energy management']), JSON.stringify(['Supply chain transparency']), JSON.stringify(['Scope 3 emissions data']), 'Overall positive performance with room for improvement in supply chain tracking.', JSON.stringify(['Implement supplier code of conduct', 'Start tracking scope 3 emissions']), now);

    console.log('Demo data setup complete (SQLite).');
  } else {
    if (!getApps().length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : null;
      if (serviceAccount) {
        initializeApp({ credential: cert(serviceAccount) });
      } else {
        initializeApp();
      }
    }
    const db = getFirestore();

    await db.collection('companies').doc(companyId).set({
      name: 'Demo Corporation',
      sector: 'Technology',
      created_at: now,
    });

    await db.collection('users').doc(userId).set({
      email: 'demo@esgwise.com',
      name: 'Demo User',
      company_id: companyId,
      role: 'user',
      is_active: true,
      created_at: now,
    });

    await db.collection('assessments').doc('demo_assessment').set({
      company_id: companyId,
      title: 'Demo ESG Assessment 2024',
      period: '2024',
      status: 'completed',
      progress: 100,
      responses: {
        'gri-201-1': { value: 'High', justification: 'Excellent economic performance' },
        'gri-302-1': { value: 'Medium', justification: 'Energy consumption is moderate' },
      },
      updated_at: now,
      created_at: now,
    });

    await db.collection('esg_scores').doc('demo_score_1').set({
      assessment_id: 'demo_assessment',
      company_id: companyId,
      overall_score: 74,
      env_score: 80,
      soc_score: 70,
      gov_score: 72,
      rating: 'A',
      data_completeness: 95,
      strengths: ['Strong community engagement', 'Good energy management'],
      weaknesses: ['Supply chain transparency'],
      gaps: ['Scope 3 emissions data'],
      ai_analysis: 'Overall positive performance with room for improvement in supply chain tracking.',
      recommendations: ['Implement supplier code of conduct', 'Start tracking scope 3 emissions'],
      created_at: now,
    });

    console.log('Demo data setup complete (Firestore).');
  }
}

setupDemo().catch(console.error);
