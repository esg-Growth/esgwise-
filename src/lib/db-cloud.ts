import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// ─── Initialization ───

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

const db = getFirestore();

// ─────────────────────────────────────────────────────────
// MULTI-TENANT ROLES
// ─────────────────────────────────────────────────────────
// platform_admin  — full platform access
// reporter        — manages multiple client companies
// company_admin   — admin of one company (self-entry mode)
// company_member  — team member within a company
// ─────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════
//  USER & COMPANY
// ═══════════════════════════════════════════════════════════

export async function getUserByEmail(email: string) {
  const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const data = doc.data();

  let company_name = '';
  if (data.company_id) {
    const compDoc = await db.collection('companies').doc(data.company_id).get();
    company_name = compDoc.data()?.name || '';
  }

  return {
    id: doc.id,
    ...data,
    company_name,
    // Normalise legacy is_admin to boolean-compatible value
    is_admin: data.is_admin ?? 0,
  } as any;
}

/** Original single-company creation — kept for backward compat (direct self-entry). */
export async function createUser(email: string, passwordHash: string, companyName: string) {
  const compRes = await db.collection('companies').add({
    name: companyName,
    sector: 'Technology',
    data_mode: 'self_entry', // default for direct registrations
    created_at: new Date().toISOString(),
  });

  const res = await db.collection('users').add({
    email,
    password_hash: passwordHash,
    name: email.split('@')[0],
    company_id: compRes.id,
    is_active: true,
    is_admin: 1,
    role: 'company_admin',
    created_at: new Date().toISOString(),
  });
  return { id: res.id, company_id: compRes.id };
}

/** Register a new Reporter (ESG consultant). */
export async function createReporter(email: string, passwordHash: string, name: string, firmName?: string) {
  const reporterRef = await db.collection('reporters').add({
    name,
    firm_name: firmName || '',
    email,
    created_at: new Date().toISOString(),
  });

  const userRef = await db.collection('users').add({
    email,
    password_hash: passwordHash,
    name,
    reporter_id: reporterRef.id,
    company_id: null,
    is_active: true,
    is_admin: 0,
    role: 'reporter',
    created_at: new Date().toISOString(),
  });

  return { id: userRef.id, reporter_id: reporterRef.id };
}

/** Register a direct company (self-service, no reporter). */
export async function createDirectCompany(
  email: string, passwordHash: string, name: string,
  companyName: string, sector: string, companySize?: string, country?: string,
) {
  const compRes = await db.collection('companies').add({
    name: companyName,
    sector,
    size: companySize || 'small',
    country: country || '',
    data_mode: 'self_entry',
    reporter_id: null,
    created_at: new Date().toISOString(),
  });

  const userRef = await db.collection('users').add({
    email,
    password_hash: passwordHash,
    name,
    company_id: compRes.id,
    reporter_id: null,
    is_active: true,
    is_admin: 1,
    role: 'company_admin',
    created_at: new Date().toISOString(),
  });

  return { id: userRef.id, company_id: compRes.id };
}

export async function getUsersByCompany(companyId: string | null) {
  const snapshot = await db.collection('users').where('company_id', '==', companyId).get();
  const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
  return users.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
}

export async function createCompanyUser(email: string, passwordHash: string, name: string, companyId: string, role: string, isAdmin: boolean) {
  const res = await db.collection('users').add({
    email, password_hash: passwordHash, name,
    company_id: companyId, role, is_admin: isAdmin ? 1 : 0,
    is_active: true, created_at: new Date().toISOString(),
  });
  return { id: res.id, company_id: companyId };
}

export async function getCompanyById(companyId: string) {
  const doc = await db.collection('companies').doc(companyId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as any;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  await db.collection('users').doc(userId).update({ password_hash: passwordHash, updated_at: new Date().toISOString() });
}

export async function saveResetToken(email: string, token: string) {
  const expires = new Date();
  expires.setHours(expires.getHours() + 1);
  await db.collection('password_resets').add({ email, token, expires_at: expires.toISOString(), created_at: new Date().toISOString() });
}

export async function verifyResetToken(token: string) {
  const snapshot = await db.collection('password_resets').where('token', '==', token).orderBy('created_at', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  if (new Date() > new Date(data.expires_at)) return null;
  return data.email;
}

// ═══════════════════════════════════════════════════════════
//  REPORTER / CLIENT MANAGEMENT
// ═══════════════════════════════════════════════════════════

export async function getReporterById(reporterId: string) {
  const doc = await db.collection('reporters').doc(reporterId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as any;
}

export async function getAllReporters() {
  const snapshot = await db.collection('reporters').orderBy('created_at', 'desc').get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

/** Get all companies managed by a reporter. */
export async function getReporterClients(reporterId: string) {
  const snapshot = await db.collection('companies').where('reporter_id', '==', reporterId).orderBy('created_at', 'desc').get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
}

/** Reporter creates a new client company. */
export async function createClientCompany(
  reporterId: string, companyName: string, sector: string,
  dataMode: 'reporter_managed' | 'self_entry' = 'reporter_managed',
  extra?: { size?: string; country?: string },
) {
  const ref = await db.collection('companies').add({
    name: companyName,
    sector,
    data_mode: dataMode,
    reporter_id: reporterId,
    size: extra?.size || 'small',
    country: extra?.country || '',
    created_at: new Date().toISOString(),
  });
  return { id: ref.id };
}

export async function updateClientCompany(companyId: string, data: Record<string, any>) {
  await db.collection('companies').doc(companyId).update({ ...data, updated_at: new Date().toISOString() });
}

export async function setCompanyDataMode(companyId: string, mode: 'reporter_managed' | 'self_entry') {
  await db.collection('companies').doc(companyId).update({ data_mode: mode, updated_at: new Date().toISOString() });
}

// ═══════════════════════════════════════════════════════════
//  INVITATIONS
// ═══════════════════════════════════════════════════════════

export async function createInvitation(companyId: string, email: string, role: string, invitedBy: string) {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.collection('invitations').add({
    company_id: companyId, email, role, token, invited_by: invitedBy,
    status: 'pending', expires_at: expiresAt, created_at: new Date().toISOString(),
  });
  return { token };
}

export async function verifyInvitation(token: string) {
  const snap = await db.collection('invitations').where('token', '==', token).where('status', '==', 'pending').limit(1).get();
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  if (new Date() > new Date(data.expires_at)) return null;
  return { id: snap.docs[0].id, ...data } as any;
}

export async function consumeInvitation(invitationId: string) {
  await db.collection('invitations').doc(invitationId).update({ status: 'consumed', consumed_at: new Date().toISOString() });
}

// ═══════════════════════════════════════════════════════════
//  ASSESSMENTS
// ═══════════════════════════════════════════════════════════

export async function getAssessment(userId: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;
  if (!companyId) return null;
  return getAssessmentForCompany(companyId);
}

export async function getAssessmentForCompany(companyId: string) {
  const snapshot = await db.collection('assessments').where('company_id', '==', companyId).orderBy('updated_at', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data(), responses: doc.data().responses || {} } as any;
}

export async function saveAssessment(userId: string, responses: any, sectorId: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;
  if (!companyId) throw new Error('User has no company');

  const snapshot = await db.collection('assessments').where('company_id', '==', companyId).limit(1).get();
  const now = new Date().toISOString();
  const payload = { company_id: companyId, responses, sector_id: sectorId, updated_at: now };

  if (!snapshot.empty) {
    await snapshot.docs[0].ref.update(payload);
    return { id: snapshot.docs[0].id };
  }
  const res = await db.collection('assessments').add({ ...payload, title: 'Initial Assessment', period: '2024', created_at: now });
  return { id: res.id };
}

// ═══════════════════════════════════════════════════════════
//  DOCUMENTS
// ═══════════════════════════════════════════════════════════

export async function createDocument(userId: string, filename: string, mimeType: string, category: string, assessmentId: string, filePath: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;
  const res = await db.collection('uploaded_documents').add({
    user_id: userId, company_id: companyId, assessment_id: assessmentId,
    file_path: filePath, filename, original_name: filename,
    mime_type: mimeType, category, status: 'pending', created_at: new Date().toISOString(),
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
    extraction_result: JSON.stringify(result), raw_summary: result.summary,
    raw_summary_ar: result.summary_ar, status: 'processed', processed_at: new Date().toISOString(),
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
      const ref = db.collection('kpi_provenance').doc(uuid());
      batch.set(ref, {
        assessment_id: assessmentId, question_id: kpi.questionId, document_id: documentId,
        extracted_value: kpi.value, confidence: kpi.confidence, evidence: kpi.evidence,
        created_at: new Date().toISOString(),
      });
    }
  }
  await batch.commit();
}

export async function processKpiActions(assessmentId: string, actions: any[], totalQuestions: number) {
  const assessmentRef = db.collection('assessments').doc(assessmentId);
  await db.runTransaction(async (t) => {
    const aDoc = await t.get(assessmentRef);
    if (!aDoc.exists) throw new Error('Assessment not found');
    const responses = aDoc.data()?.responses || {};

    for (const action of actions) {
      if (action.action === 'accept' || action.action === 'edit') {
        responses[action.questionId] = action.action === 'edit' ? action.editedValue : action.value;
        if (action.provenanceId) t.update(db.collection('kpi_provenance').doc(action.provenanceId), { accepted: 1 });
      } else if (action.action === 'reject' && action.provenanceId) {
        t.update(db.collection('kpi_provenance').doc(action.provenanceId), { accepted: 2 });
      }
    }

    const answered = Object.values(responses).filter(v => v !== null && v !== '').length;
    t.update(assessmentRef, { responses, progress: Math.round((answered / totalQuestions) * 100), updated_at: new Date().toISOString() });
  });
}

export async function getDocuments(userId: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;
  const snapshot = await db.collection('uploaded_documents').where('company_id', '==', companyId).orderBy('created_at', 'desc').get();
  return snapshot.docs.map(d => {
    const data = d.data();
    return { id: d.id, ...data, extraction_result: data.extraction_result ? JSON.parse(data.extraction_result) : null };
  }) as any[];
}

// ═══════════════════════════════════════════════════════════
//  CHAT
// ═══════════════════════════════════════════════════════════

export async function saveChatMessage(userId: string, role: string, content: string) {
  const user = await db.collection('users').doc(userId).get();
  const companyId = user.data()?.company_id;
  await db.collection('chat_messages').add({ user_id: userId, company_id: companyId, role, content, created_at: new Date().toISOString() });
}

export async function getChatHistory(userId: string, limitCount = 20) {
  const snap = await db.collection('chat_messages').where('user_id', '==', userId).orderBy('created_at', 'asc').limit(limitCount).get();
  return snap.docs.map(d => d.data()) as any[];
}

// ═══════════════════════════════════════════════════════════
//  CERTIFICATES
// ═══════════════════════════════════════════════════════════

export async function issueCertificate(assessmentId: string) {
  const aDoc = await db.collection('assessments').doc(assessmentId).get();
  if (!aDoc.exists) throw new Error('Assessment not found');
  const assessment = aDoc.data() as any;
  if (!assessment.overall_score) throw new Error('Assessment must be scored before issuing certificate');

  const compDoc = await db.collection('companies').doc(assessment.company_id).get();
  const company = compDoc.exists ? compDoc.data() : { sector: 'Technology', name: 'Unknown' };

  const crypto = require('crypto');
  const verificationCode = `ESG-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

  const certRef = await db.collection('certificates').add({
    company_id: assessment.company_id, assessment_id: assessmentId,
    score: assessment.overall_score, rating: assessment.rating || 'A',
    sector: assessment.sector_id || company?.sector || 'General',
    issued_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    verification_code: verificationCode, is_valid: 1,
  });

  await db.collection('assessments').doc(assessmentId).update({ status: 'certified', updated_at: new Date().toISOString() });
  return { success: true, certificateId: certRef.id, verificationCode };
}

export async function getCertificateByCode(code: string) {
  const snap = await db.collection('certificates').where('verification_code', '==', code).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  const certData = doc.data();
  const compDoc = await db.collection('companies').doc(certData.company_id).get();
  return { id: doc.id, ...certData, company_name: compDoc.data()?.name || 'ESGwise Partner' } as any;
}

export async function getCertificateForAssessment(assessmentId: string) {
  const snap = await db.collection('certificates').where('assessment_id', '==', assessmentId).limit(1).get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as any;
}

export async function getIndustryBenchmarks(sectorId?: string) {
  let query: any = db.collection('assessments');
  if (sectorId) query = query.where('sector_id', '==', sectorId);
  const snapshot = await query.get();
  if (snapshot.empty) return null;

  const { calculateScore } = require('./esg-scoring');
  let totalEnv = 0, totalSoc = 0, totalGov = 0, totalOverall = 0, count = 0;
  for (const doc of snapshot.docs) {
    const data = doc.data();
    if (data.responses && Object.keys(data.responses).length > 0) {
      const score = calculateScore(data.responses);
      totalEnv += score.env; totalSoc += score.soc; totalGov += score.gov; totalOverall += score.overall;
      count++;
    }
  }
  if (!count) return null;
  return { overall: totalOverall / count, env: totalEnv / count, soc: totalSoc / count, gov: totalGov / count, count };
}

// ═══════════════════════════════════════════════════════════
//  ADMIN
// ═══════════════════════════════════════════════════════════

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
    users.push({ id: doc.id, ...data, company_name });
  }
  return users;
}

export async function updateUserAdminStatus(userId: string, isAdmin: boolean) {
  await db.collection('users').doc(userId).update({
    is_admin: isAdmin ? 1 : 0, role: isAdmin ? 'company_admin' : 'company_member', updated_at: new Date().toISOString(),
  });
}

export async function deleteUser(userId: string) {
  await db.collection('users').doc(userId).delete();
}

export async function getAdminAnalytics() {
  const [usersSnap, companiesSnap, assessmentsSnap, scoresSnap, certsSnap] = await Promise.all([
    db.collection('users').get(), db.collection('companies').get(),
    db.collection('assessments').get(), db.collection('esg_scores').get(),
    db.collection('certificates').get(),
  ]);

  let completedAssessments = 0;
  const recentAssessments: any[] = [];
  assessmentsSnap.forEach(doc => {
    const d = doc.data();
    if (d.status === 'completed' || d.status === 'certified') completedAssessments++;
    recentAssessments.push({ id: doc.id, ...d });
  });

  let totalEnv = 0, totalSoc = 0, totalGov = 0, totalOverall = 0;
  scoresSnap.forEach(doc => {
    const d = doc.data();
    totalEnv += d.env_score || 0; totalSoc += d.soc_score || 0;
    totalGov += d.gov_score || 0; totalOverall += d.overall_score || 0;
  });
  const sc = scoresSnap.size || 1;

  const companyNames: Record<string, string> = {};
  const sectorsMap: Record<string, number> = {};
  const sizesMap: Record<string, number> = {};
  companiesSnap.forEach(doc => {
    const d = doc.data();
    companyNames[doc.id] = d.name || 'Unknown';
    if (d.sector) sectorsMap[d.sector] = (sectorsMap[d.sector] || 0) + 1;
    sizesMap[d.size || 'small'] = (sizesMap[d.size || 'small'] || 0) + 1;
  });

  recentAssessments.sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

  return {
    totalUsers: usersSnap.size, totalCompanies: companiesSnap.size,
    assessments: { total: assessmentsSnap.size, completed: completedAssessments, draft: assessmentsSnap.size - completedAssessments },
    averageScores: { overall: Math.round(totalOverall / sc), env: Math.round(totalEnv / sc), soc: Math.round(totalSoc / sc), gov: Math.round(totalGov / sc) },
    sectors: Object.entries(sectorsMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    sizes: Object.entries(sizesMap).map(([name, count]) => ({ name, count })),
    totalCertificates: certsSnap.size,
    totalReporters: (await db.collection('reporters').get()).size,
    recentAssessments: recentAssessments.slice(0, 5).map(a => ({
      id: a.id, title: a.title || 'Assessment', company: companyNames[a.company_id] || 'Unknown',
      status: a.status || 'draft', progress: a.progress || 0, date: a.updated_at,
    })),
  };
}

export async function getAdminCompaniesWithScores() {
  const companiesSnap = await db.collection('companies').get();
  const results: any[] = [];
  for (const doc of companiesSnap.docs) {
    const company = { id: doc.id, ...doc.data() } as any;
    const scoreSnap = await db.collection('esg_scores').where('company_id', '==', doc.id).orderBy('created_at', 'desc').limit(1).get();
    const score = scoreSnap.empty ? null : scoreSnap.docs[0].data();
    results.push({ ...company, score });
  }
  return results;
}

// ═══════════════════════════════════════════════════════════
//  SETTINGS
// ═══════════════════════════════════════════════════════════

export async function updateUserProfile(userId: string, name: string, companyId: string, companyName: string) {
  await db.collection('users').doc(userId).update({ name, updated_at: new Date().toISOString() });
  if (companyId && companyName) {
    await db.collection('companies').doc(companyId).update({ name: companyName, updated_at: new Date().toISOString() });
  }
}

export async function getTenantSettings() {
  const doc = await db.collection('tenant_settings').doc('default').get();
  if (!doc.exists) return { primary_color: '#16a34a', secondary_color: '#1e293b', logo_base64: null, report_header_text: '', report_footer_text: '' };
  return doc.data();
}

export async function updateTenantSettings(data: any) {
  await db.collection('tenant_settings').doc('default').set({
    primary_color: data.primary_color || '#16a34a', secondary_color: data.secondary_color || '#1e293b',
    logo_base64: data.logo_base64 || null, report_header_text: data.report_header_text || '',
    report_footer_text: data.report_footer_text || '', updated_at: new Date().toISOString(),
  }, { merge: true });
}

export async function getCompanyScore(companyId: string) {
  const snapshot = await db.collection('esg_scores').where('company_id', '==', companyId).orderBy('created_at', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data();
  let assessment_date = data.created_at;
  if (data.assessment_id) {
    const aDoc = await db.collection('assessments').doc(data.assessment_id).get();
    if (aDoc.exists) assessment_date = aDoc.data()?.updated_at || data.created_at;
  }
  return { id: snapshot.docs[0].id, ...data, assessment_date } as any;
}
