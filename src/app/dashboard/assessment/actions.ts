'use server';

import { getFirestore } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function issueCertificate(assessmentId: string) {
  const db = getFirestore();
  
  try {
    // 1. Get assessment and company details
    const assessmentDoc = await db.collection('assessments').doc(assessmentId).get();
    if (!assessmentDoc.exists) throw new Error('Assessment not found');
    const assessment = assessmentDoc.data() as any;

    if (!assessment.overall_score) throw new Error('Assessment must be scored before issuing certificate');

    const companyDoc = await db.collection('companies').doc(assessment.company_id).get();
    const company = companyDoc.exists ? companyDoc.data() : { sector: 'Technology', name: 'Unknown' };

    // 2. Generate a unique verification code (human-readable-ish)
    const prefix = 'ESG';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    const verificationCode = `${prefix}-${timestamp}-${random}`;

    // 3. Set expiry (e.g., 1 year from now)
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    // 4. Insert into certificates table
    const certRef = await db.collection('certificates').add({
      company_id: assessment.company_id,
      assessment_id: assessmentId,
      score: assessment.overall_score,
      rating: assessment.rating || 'A',
      sector: assessment.sector_id || company?.sector || 'General',
      issued_at: issuedAt,
      expires_at: expiresAt,
      verification_code: verificationCode,
      is_valid: 1
    });

    // 5. Update assessment status
    await db.collection('assessments').doc(assessmentId).update({
      status: 'certified',
      updated_at: new Date().toISOString()
    });

    revalidatePath('/dashboard/assessment');
    return { success: true, certificateId: certRef.id, verificationCode };
  } catch (error: any) {
    console.error('Failed to issue certificate:', error);
    return { success: false, error: error.message };
  }
}
