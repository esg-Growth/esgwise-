'use server';

import getDb from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export async function issueCertificate(assessmentId: string) {
  const db = getDb();
  
  // 1. Get assessment and company details
  const assessment = db.prepare(`
    SELECT a.*, c.name as company_name, c.sector, s.overall_score, s.rating
    FROM assessments a
    JOIN companies c ON a.company_id = c.id
    LEFT JOIN esg_scores s ON a.id = s.assessment_id
    WHERE a.id = ?
  `).get(assessmentId) as any;

  if (!assessment) throw new Error('Assessment not found');
  if (!assessment.overall_score) throw new Error('Assessment must be scored before issuing certificate');

  // 2. Generate a unique verification code (human-readable-ish)
  const prefix = 'ESG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const verificationCode = `${prefix}-${timestamp}-${random}`;

  // 3. Set expiry (e.g., 1 year from now)
  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  // 4. Insert into certificates table
  const certificateId = uuidv4();
  
  try {
    db.prepare(`
      INSERT INTO certificates (
        id, company_id, assessment_id, score, rating, sector, 
        issued_at, expires_at, verification_code, is_valid
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      certificateId,
      assessment.company_id,
      assessmentId,
      assessment.overall_score,
      assessment.rating,
      assessment.sector,
      issuedAt,
      expiresAt,
      verificationCode
    );

    // 5. Update assessment status
    db.prepare('UPDATE assessments SET status = "certified", updated_at = datetime("now") WHERE id = ?')
      .run(assessmentId);

    revalidatePath('/dashboard/assessment');
    return { success: true, certificateId, verificationCode };
  } catch (error: any) {
    console.error('Failed to issue certificate:', error);
    return { success: false, error: error.message };
  }
}
