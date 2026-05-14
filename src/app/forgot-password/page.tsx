'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Leaf, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function ForgotPasswordPage() {
  const { t, locale } = useI18n();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email');
      setMessage(isAr ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' : 'Password reset link has been sent to your email');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authDecor}>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
          <div className={styles.decorContent}>
            <Leaf size={48} />
            <h2>ESGwise</h2>
            <p>{isAr ? 'استعد الوصول إلى حسابك' : 'Recover access to your account'}</p>
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.authForm}>
          <Link href="/login" className={styles.backLink}>
            <ArrowLeft size={16} /> {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
          </Link>

          <h1>{isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}</h1>
          <p className={styles.authSubtitle}>
            {isAr ? 'أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور' : 'Enter your email and we\'ll send you a link to reset your password'}
          </p>

          {error && <div className={styles.authError}>{error}</div>}
          {message && (
            <div className={styles.authSuccess} style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} /> {message}
            </div>
          )}

          {!message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <div className={styles.inputIcon}>
                  <Mail size={18} className={styles.inputIconSvg} />
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'} required style={{ paddingLeft: 40 }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : (isAr ? 'إرسال رابط الإعادة' : 'Send Reset Link')}
              </button>
            </form>
          )}

          <p className={styles.authSwitch}>
            {isAr ? 'تذكرت كلمة المرور؟' : 'Remembered your password?'} <Link href="/login">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
