/**
 * ESGwise Database — Cloud-Only (Firestore)
 * 
 * This file re-exports all database operations from the cloud Firestore
 * implementation. The local SQLite implementation has been retired in favour
 * of a single, authoritative Firestore backend.
 */

export {
  // ── User & Company ──
  getUserByEmail,
  createUser,
  createReporter,
  createDirectCompany,
  getUsersByCompany,
  createCompanyUser,
  getCompanyById,
  updateUserPassword,
  saveResetToken,
  verifyResetToken,
  invalidateResetToken,

  // ── Reporter / Client Management ──
  getReporterClients,
  createClientCompany,
  updateClientCompany,
  setCompanyDataMode,
  getReporterById,
  getAllReporters,

  // ── Assessment ──
  getAssessment,
  getAssessmentForCompany,
  saveAssessment,

  // ── Documents ──
  createDocument,
  getDocumentById,
  updateDocumentExtraction,
  updateDocumentStatus,
  getDocuments,
  saveKpiProvenanceBatch,
  processKpiActions,

  // ── Chat ──
  saveChatMessage,
  getChatHistory,

  // ── Certificates ──
  issueCertificate,
  getCertificateByCode,
  getCertificateForAssessment,

  // ── Scores & Benchmarks ──
  getCompanyScore,
  getIndustryBenchmarks,

  // ── Admin ──
  getAllUsers,
  updateUserAdminStatus,
  updateUserRole,
  deleteUser,
  getAdminAnalytics,
  getAdminCompaniesWithScores,

  // ── Settings ──
  updateUserProfile,
  getTenantSettings,
  updateTenantSettings,

  // ── Invitations ──
  createInvitation,
  verifyInvitation,
  consumeInvitation,
} from './db-cloud';
