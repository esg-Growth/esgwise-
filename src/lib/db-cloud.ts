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
    is_active: true,
    is_admin: 1,
    role: 'owner',
    created_at: new Date().toISOString(),
  });
  return { id: res.id, company_id: compRes.id };
}

export async function getUsersByCompany(companyId: string | null) {
  const snapshot = await db.collection('users')
    .where('company_id', '==', companyId)
    .orderBy('created_at', 'desc')
    .get();
    
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      email: data.email,
      name: data.name,
      name_ar: data.name_ar,
      role: data.role,
      is_admin: data.is_admin,
      is_active: data.is_active,
      created_at: data.created_at,
      last_login: data.last_login
    };
  }) as any[];
}

export async function createCompanyUser(email: string, passwordHash: string, name: string, companyId: string, role: string, isAdmin: boolean) {
  const res = await db.collection('users').add({
    email,
    password_hash: passwordHash,
    name,
    company_id: companyId,
    role,
    is_admin: isAdmin ? 1 : 0,
    is_active: true,
    created_at: new Date().toISOString(),
  });
  return { id: res.id, company_id: companyId };
}

export async function getCompanyById(companyId: string) {
  const doc = await db.collection('companies').doc(companyId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as any;
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

  return getAssessmentForCompany(companyId);
}

export async function getAssessmentForCompany(companyId: string) {
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

export async function updateDocumentStatus(documentId: string, status: string) {
  await db.collection('uploaded_documents').doc(documentId).update({ status });
}

export async function saveKpiProvenanceBatch(assessmentId: string, documentId: string, kpis: any[]) {
  const batch = db.batch();
  const uuid = require('uuid').v4;
  for (const kpi of kpis) {
    if (kpi.questionId) {
      const kpiRef = db.collection('kpi_provenance').doc(uuid());
      batch.set(kpiRef, {
        assessment_id: assessmentId,
        question_id: kpi.questionId,
        document_id: documentId,
        extracted_value: kpi.value,
        confidence: kpi.confidence,
        evidence: kpi.evidence,
        created_at: new Date().toISOString()
      });
    }
  }
  await batch.commit();
}

export async function processKpiActions(assessmentId: string, actions: any[], totalQuestions: number) {
  const assessmentRef = db.collection('assessments').doc(assessmentId);
  await db.runTransaction(async (t) => {
    const assessmentDoc = await t.get(assessmentRef);
    if (!assessmentDoc.exists) throw new Error('Assessment not found');
    
    const assessmentData = assessmentDoc.data() || {};
    const responses = assessmentData.responses || {};

    for (const action of actions) {
      if (action.action === 'accept' || action.action === 'edit') {
        const val = action.action === 'edit' ? action.editedValue : action.value;
        responses[action.questionId] = val;

        if (action.provenanceId) {
          t.update(db.collection('kpi_provenance').doc(action.provenanceId), { accepted: 1 });
        }
      } else if (action.action === 'reject') {
        if (action.provenanceId) {
          t.update(db.collection('kpi_provenance').doc(action.provenanceId), { accepted: 2 });
        }
      }
    }

    const answered = Object.values(responses).filter(v => v !== null && v !== '').length;
    const progress = Math.round((answered / totalQuestions) * 100);

    t.update(assessmentRef, {
      responses,
      progress,
      updated_at: new Date().toISOString()
    });
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

export async function issueCertificate(assessmentId: string) {
  const assessmentDoc = await db.collection('assessments').doc(assessmentId).get();
  if (!assessmentDoc.exists) throw new Error('Assessment not found');
  const assessment = assessmentDoc.data() as any;

  if (!assessment.overall_score) throw new Error('Assessment must be scored before issuing certificate');

  const companyDoc = await db.collection('companies').doc(assessment.company_id).get();
  const company = companyDoc.exists ? companyDoc.data() : { sector: 'Technology', name: 'Unknown' };

  const crypto = require('crypto');
  const prefix = 'ESG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  const verificationCode = `${prefix}-${timestamp}-${random}`;

  const issuedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

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

  await db.collection('assessments').doc(assessmentId).update({
    status: 'certified',
    updated_at: new Date().toISOString()
  });

  return { success: true, certificateId: certRef.id, verificationCode };
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

export async function getCertificateForAssessment(assessmentId: string) {
  const snap = await db.collection('certificates').where('assessment_id', '==', assessmentId).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
}

export async function getIndustryBenchmarks(sectorId?: string) {
  let query: any = db.collection('assessments');
  if (sectorId) {
    query = query.where('sector_id', '==', sectorId);
  }
  const snapshot = await query.get();
  
  if (snapshot.empty) return null;
  
  const { calculateScore } = require('./esg-scoring');
  let totalEnv = 0, totalSoc = 0, totalGov = 0, totalOverall = 0;
  let count = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.responses && Object.keys(data.responses).length > 0) {
      const score = calculateScore(data.responses);
      totalEnv += score.env;
      totalSoc += score.soc;
      totalGov += score.gov;
      totalOverall += score.overall;
      count++;
    }
  }
  
  return {
    overall: totalOverall / count,
    env: totalEnv / count,
    soc: totalSoc / count,
    gov: totalGov / count,
    count
  };
}

// ─── Admin Logic ───

export async function getAllUsers() {
  const snapshot = await db.collection('users').orderBy('created_at', 'desc').get();
  const users = [] as any[];
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    let company_name = '';
    if (data.company_id) {
      const compDoc = await db.collection('companies').doc(data.company_id).get();
      company_name = compDoc.data()?.name || '';
    }
    users.push({
      id: doc.id,
      ...data,
      company_name
    });
  }
  
  return users;
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean) {
  await db.collection('users').doc(userId).update({
    is_admin: isAdmin ? 1 : 0,
    role: isAdmin ? 'owner' : 'member',
    updated_at: new Date().toISOString()
  });
}

export async function deleteUser(userId: string) {
  // In a real Firestore app, we would use a Cloud Function or batch job to clean up references.
  // For now we just delete the user document.
  await db.collection('users').doc(userId).delete();
}

export async function getAdminAnalytics() {
  const usersSnapshot = await db.collection('users').get();
  const totalUsers = usersSnapshot.size;

  const companiesSnapshot = await db.collection('companies').get();
  const totalCompanies = companiesSnapshot.size;

  const assessmentsSnapshot = await db.collection('assessments').get();
  const totalAssessments = assessmentsSnapshot.size;
  let completedAssessments = 0;
  const recentAssessments: any[] = [];
  assessmentsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.status === 'completed' || data.status === 'certified') completedAssessments++;
    recentAssessments.push({ id: doc.id, ...data });
  });

  const scoresSnapshot = await db.collection('esg_scores').get();
  let totalEnv = 0, totalSoc = 0, totalGov = 0, totalOverall = 0;
  scoresSnapshot.forEach(doc => {
    const data = doc.data();
    totalEnv += data.env_score || 0;
    totalSoc += data.soc_score || 0;
    totalGov += data.gov_score || 0;
    totalOverall += data.overall_score || 0;
  });
  const scoresCount = scoresSnapshot.size || 1; // avoid division by zero

  const certificatesSnapshot = await db.collection('certificates').get();
  const totalCertificates = certificatesSnapshot.size;

  const sectorsMap: Record<string, number> = {};
  const sizesMap: Record<string, number> = {};
  
  // To populate company names in recent assessments
  const companyNames: Record<string, string> = {};

  companiesSnapshot.forEach(doc => {
    const data = doc.data();
    companyNames[doc.id] = data.name || 'Unknown';
    if (data.sector) {
      sectorsMap[data.sector] = (sectorsMap[data.sector] || 0) + 1;
    }
    const size = data.size || 'small';
    sizesMap[size] = (sizesMap[size] || 0) + 1;
  });

  const sectors = Object.entries(sectorsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const sizes = Object.entries(sizesMap)
    .map(([name, count]) => ({ name, count }));

  recentAssessments.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());
  const formattedRecentAssessments = recentAssessments.slice(0, 5).map(a => ({
    id: a.id,
    title: a.title || 'Assessment',
    company: companyNames[a.company_id] || 'Unknown',
    status: a.status || 'draft',
    progress: a.progress || 0,
    date: a.updated_at
  }));

  return {
    totalUsers,
    totalCompanies,
    assessments: {
      total: totalAssessments,
      completed: completedAssessments,
      draft: totalAssessments - completedAssessments,
    },
    averageScores: {
      overall: Math.round(totalOverall / scoresCount),
      env: Math.round(totalEnv / scoresCount),
      soc: Math.round(totalSoc / scoresCount),
      gov: Math.round(totalGov / scoresCount),
    },
    sectors,
    sizes,
    totalCertificates,
    recentAssessments: formattedRecentAssessments
  };
}

export async function updateUserProfile(userId: string, name: string, companyId: string, companyName: string) {
  await db.collection('users').doc(userId).update({ name, updated_at: new Date().toISOString() });
  if (companyId && companyName) {
    await db.collection('companies').doc(companyId).update({ name: companyName, updated_at: new Date().toISOString() });
  }
}

export async function getTenantSettings() {
  const doc = await db.collection('tenant_settings').doc('default').get();
  if (!doc.exists) {
    return {
      primary_color: '#16a34a',
      secondary_color: '#1e293b',
      logo_base64: null,
      report_header_text: '',
      report_footer_text: ''
    };
  }
  return doc.data();
}

export async function updateTenantSettings(data: any) {
  await db.collection('tenant_settings').doc('default').set({
    primary_color: data.primary_color || '#16a34a',
    secondary_color: data.secondary_color || '#1e293b',
    logo_base64: data.logo_base64 || null,
    report_header_text: data.report_header_text || '',
    report_footer_text: data.report_footer_text || '',
    updated_at: new Date().toISOString()
  }, { merge: true });
}

export async function getCompanyScore(companyId: string) {
  const snapshot = await db.collection('esg_scores')
    .where('company_id', '==', companyId)
    .orderBy('created_at', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();

  let assessment_date = data.created_at;
  if (data.assessment_id) {
    const aDoc = await db.collection('assessments').doc(data.assessment_id).get();
    if (aDoc.exists) {
      assessment_date = aDoc.data()?.updated_at || data.created_at;
    }
  }

  return {
    id: snapshot.docs[0].id,
    ...data,
    assessment_date
  } as any;
}
