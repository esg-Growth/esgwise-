import { getCertificateByCode } from '@/lib/db';
import { notFound } from 'next/navigation';
import styles from './verify.module.css';
import { format } from 'date-fns';
import { CheckCircle, Shield, Award, Calendar, Globe, Building2 } from 'lucide-react';

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const code = params.code;
  
  // We need to implement this in db.ts
  const certificate = await getCertificateByCode(code);

  if (!certificate) {
    notFound();
  }

  const isValid = certificate.is_valid === 1;

  return (
    <div className={styles.container}>
      <div className={styles.backgroundBlur} />
      
      <main className={styles.certificateCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Award className={styles.awardIcon} />
            <span>ESGwise</span>
          </div>
          <div className={`${styles.badge} ${isValid ? styles.valid : styles.invalid}`}>
            {isValid ? (
              <>
                <CheckCircle className={styles.statusIcon} />
                <span>Verified Certificate</span>
              </>
            ) : (
              <span>Invalid/Expired</span>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>Verification of ESG Assessment</h1>
          <p className={styles.subtitle}>This document confirms that the following entity has completed a formal ESG assessment on the ESGwise Platform.</p>

          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <Building2 className={styles.detailIcon} />
              <div className={styles.detailInfo}>
                <label>Certified Entity</label>
                <span>{certificate.company_name}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Globe className={styles.detailIcon} />
              <div className={styles.detailInfo}>
                <label>Sector</label>
                <span>{certificate.sector}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Award className={styles.detailIcon} />
              <div className={styles.detailInfo}>
                <label>Rating Achieved</label>
                <div className={styles.ratingBadge}>
                  <span className={styles.ratingText}>{certificate.rating}</span>
                  <span className={styles.scoreText}>({certificate.score}%)</span>
                </div>
              </div>
            </div>

            <div className={styles.detailItem}>
              <Calendar className={styles.detailIcon} />
              <div className={styles.detailInfo}>
                <label>Issue Date</label>
                <span>{format(new Date(certificate.issued_at), 'MMMM dd, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className={styles.verificationSection}>
            <div className={styles.verificationCode}>
              <label>Verification ID</label>
              <code>{certificate.verification_code}</code>
            </div>
            <div className={styles.securitySeal}>
              <Shield className={styles.shieldIcon} />
              <div className={styles.sealText}>
                <strong>Cryptographic Proof</strong>
                <p>This certificate is anchored to a unique assessment hash and is verifiable on the blockchain.</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <p>© 2025 ESGwise Platform. All rights reserved.</p>
          <div className={styles.links}>
            <a href="/">About the Platform</a>
            <a href="/transparency">Transparency Policy</a>
          </div>
        </div>
      </main>
    </div>
  );
}
