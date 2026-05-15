/**
 * ESGwise Database Bridge
 * This file delegates database operations to either Cloud Firestore or Local SQLite.
 * By default, it uses Cloud Firestore.
 */

import * as cloud from './db-cloud';
import * as local from './db-local';

const USE_LOCAL = process.env.USE_LOCAL_DB === 'true';

// Choose implementation
const db = USE_LOCAL ? local : cloud;

export const getUserByEmail = db.getUserByEmail;
export const createUser = db.createUser;
export const getAssessment = db.getAssessment;
export const saveAssessment = db.saveAssessment;
export const createDocument = db.createDocument;
export const updateDocumentExtraction = db.updateDocumentExtraction;
export const getDocuments = db.getDocuments;
export const getDocumentById = (db as any).getDocumentById;
export const updateDocumentStatus = db.updateDocumentStatus;
export const saveKpiProvenanceBatch = db.saveKpiProvenanceBatch;
export const processKpiActions = db.processKpiActions;
export const saveChatMessage = db.saveChatMessage;
export const getChatHistory = db.getChatHistory;
export const issueCertificate = db.issueCertificate;
export const getCertificateByCode = db.getCertificateByCode;
export const getCompanyById = db.getCompanyById;
export const getAssessmentForCompany = db.getAssessmentForCompany;
export const getCompanyScore = (db as any).getCompanyScore;
export const getCertificateForAssessment = db.getCertificateForAssessment;
export const getIndustryBenchmarks = db.getIndustryBenchmarks;

// Admin
export const getAllUsers = db.getAllUsers;
export const updateUserAdminStatus = db.updateUserAdminStatus;
export const deleteUser = db.deleteUser;
export const getAdminAnalytics = (db as any).getAdminAnalytics;
export const getAdminCompaniesWithScores = (db as any).getAdminCompaniesWithScores;

// Settings
export const updateUserProfile = (db as any).updateUserProfile;
export const getTenantSettings = (db as any).getTenantSettings;
export const updateTenantSettings = (db as any).updateTenantSettings;
export const getUsersByCompany = (db as any).getUsersByCompany;
export const createCompanyUser = (db as any).createCompanyUser;
export const updateUserPassword = (db as any).updateUserPassword;

// Export default for backwards compatibility with any code calling getDb()
export default function getDb() {
  if (USE_LOCAL) {
    return (local as any).default();
  }
  return null; // Firestore doesn't use the same pattern
}
