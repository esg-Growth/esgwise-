import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// ─── Initialization ───

if (!getApps().length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : null;

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount as ServiceAccount),
    });
  } else {
    initializeApp();
  }
}

const db = getFirestore();

// ─── User & Company Logic ───

export async function getUserByEmail(email: string) {
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  
  // If user has a company_id, fetch company name
  let company_name = '';
  if (data.company_id) {
    const compDoc = await db.collection('companies').doc(data.company_id).get();
    company_name = compDoc.data()?.name || '';
  }

  return { id: doc.id, ...data, company_name } as any;
}

export async function createUser(email: string, passwordHash: string, companyName: string) {
  // Create company first
  const compRes = await db.collection('companies').add({
    name: companyName,
    sector: 'Technology', // Default
    created_at: new Date().toISOString(),
  });

  const res = await db.collection('users').add({
    email,
    password_hash: passwordHash,
    name: email.split('@')[0],
    company_id: compRes.id,
    created_at: new Date().toISOString(),
  });
  return { id: res.id, company_id: compRes.id };
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await db.collection('users').doc(userId).update({
    password_hash: passwordHash,
    updated_at: new Date().toISOString(),
  });
}

export async function saveResetToken(email: string, token: string) {
  const expires = new Date();
  expires.setHours(expires.getHours() + 1); // 1 hour expiration

  await db.collection('password_resets').add({
    email,
    token,
    expires_at: expires.toISOString(),
    created_at: new Date().toISOString(),
  });
}

export async function verifyResetToken(token: string) {
  const snapshot = await db.collection('password_resets')
    .where('token', '==', token)
    .orderBy('created_at', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  
  if (now > expiresAt) return null;
  return data.email;
}

// ─── Assessment Logic ───

export async function getAssessment(userId: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;
  if (!companyId) return null;

  const snapshot = await db.collection('assessments')
    .where('company_id', '==', companyId)
    .orderBy('updated_at', 'desc')
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    responses: data.responses || {},
  } as any;
}

export async function saveAssessment(userId: string, responses: any, sectorId: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;
  if (!companyId) throw new Error('User has no company');

  const snapshot = await db.collection('assessments')
    .where('company_id', '==', companyId)
    .limit(1)
    .get();

  const now = new Date().toISOString();
  const assessmentData = {
    company_id: companyId,
    responses, // Firestore handles objects natively
    sector_id: sectorId,
    updated_at: now,
  };

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update(assessmentData);
    return { id: snapshot.docs[0].id };
  } else {
    const res = await db.collection('assessments').add({
      ...assessmentData,
      title: 'Initial Assessment',
      period: '2024',
      created_at: now,
    });
    return { id: res.id };
  }
}

// ─── Documents Logic ───

export async function createDocument(userId: string, filename: string, mimeType: string, category: string, assessmentId: string, filePath: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;

  const res = await db.collection('uploaded_documents').add({
    user_id: userId,
    company_id: companyId,
    assessment_id: assessmentId,
    file_path: filePath,
    filename,
    original_name: filename,
    mime_type: mimeType,
    category,
    status: 'pending',
    created_at: new Date().toISOString(),
  });
  return { id: res.id };
}

export async function getDocumentById(docId: string) {
  const doc = await db.collection('uploaded_documents').doc(docId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as any;
}

export async function updateDocumentExtraction(documentId: string, result: any) {
  await db.collection('uploaded_documents').doc(documentId).update({
    extraction_result: JSON.stringify(result),
    raw_summary: result.summary,
    raw_summary_ar: result.summary_ar,
    status: 'processed',
    processed_at: new Date().toISOString(),
  });
}

export async function getDocuments(userId: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;

  const snapshot = await db.collection('uploaded_documents')
    .where('company_id', '==', companyId)
    .orderBy('created_at', 'desc')
    .get();
    
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      extraction_result: data.extraction_result ? JSON.parse(data.extraction_result) : null,
    };
  }) as any[];
}

// ─── Chat Logic ───

export async function saveChatMessage(userId: string, role: string, content: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;

  await db.collection('chat_messages').add({
    user_id: userId,
    company_id: companyId,
    role,
    content,
    created_at: new Date().toISOString(),
  });
}

export async function getChatHistory(userId: string, limitCount = 20) {
  const snapshot = await db.collection('chat_messages')
    .where('user_id', '==', userId)
    .orderBy('created_at', 'asc')
    .limit(limitCount)
    .get();
    
  return snapshot.docs.map(doc => doc.data()) as any[];
}

// ─── Certificate Logic ───

export async function issueCertificate(userId: string, assessmentId: string, code: string, data: any) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;

  const res = await db.collection('certificates').add({
    user_id: userId,
    company_id: companyId,
    assessment_id: assessmentId,
    verification_code: code,
    score: data.overall,
    rating: data.rating,
    sector: data.sector || 'General',
    issued_at: new Date().toISOString(),
    is_valid: 1,
  });
  return { id: res.id };
}

export async function getCertificateByCode(code: string) {
  const snapshot = await db.collection('certificates')
    .where('verification_code', '==', code)
    .limit(1)
    .get();
    
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const certData = doc.data();
  
  const compDoc = await db.collection('companies').doc(certData.company_id).get();
  const compData = compDoc.data();
  
  return {
    id: doc.id,
    ...certData,
    company_name: compData?.name || 'ESGwise Partner',
  } as any;
}
