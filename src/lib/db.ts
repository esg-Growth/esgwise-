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
export const saveChatMessage = db.saveChatMessage;
export const getChatHistory = db.getChatHistory;
export const issueCertificate = db.issueCertificate;
export const getCertificateByCode = db.getCertificateByCode;

// Export default for backwards compatibility with any code calling getDb()
export default function getDb() {
  if (USE_LOCAL) {
    return (local as any).default();
  }
  return null; // Firestore doesn't use the same pattern
}
