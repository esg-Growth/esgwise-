'use server';

import { issueCertificate as dbIssueCertificate } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function issueCertificate(assessmentId: string) {
  try {
    const result = await dbIssueCertificate(assessmentId);
    revalidatePath('/dashboard/assessment');
    return result;
  } catch (error: any) {
    console.error('Failed to issue certificate:', error);
    return { success: false, error: error.message };
  }
}
