'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Leaf, Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import styles from '../../login/auth.module.css';

export default function ResetPasswordPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const isAr = locale === 'ar';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    // Verify token validity on mount
    (async () => {
      try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`);
        if (res.ok) setValidToken(true);
      } catch (err) {
        setError(isAr ? 'الرابط غير صالح أو منتهي الصلاحية' : 'Link is invalid or expired');
      } finally {
        setVerifying(false);
      }
    })();
  }, [token, isAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(isAr ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setMessage(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password reset successfully');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <span className="spinner" />
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authLeft}>
        <div className={styles.authDecor}>
          <div className={styles.decorCircle1} />
          <div className={styles.decorCircle2} />
          <div className={styles.decorContent}>
            <Leaf size={48} />
            <h2>ESGwise</h2>
            <p>{isAr ? 'قم بتعيين كلمة مرور جديدة' : 'Set a new password for your account'}</p>
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.authForm}>
          <h1>{isAr ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}</h1>
          
          {error && (
            <div className={styles.authError} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> {error}
            </div>
          )}
          
          {message && (
            <div className={styles.authSuccess} style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={18} /> {message}
            </div>
          )}

          {!validToken && !message && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                {isAr ? 'يبدو أن هذا الرابط منتهي الصلاحية أو غير صحيح.' : 'It seems this link is expired or incorrect.'}
              </p>
              <Link href="/forgot-password" className="btn btn-primary btn-full">
                {isAr ? 'طلب رابط جديد' : 'Request New Link'}
              </Link>
            </div>
          )}

          {validToken && !message && (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                <div className={styles.inputIcon}>
                  <Lock size={18} className={styles.inputIconSvg} />
                  <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: 40 }} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                <div className={styles.inputIcon}>
                  <Lock size={18} className={styles.inputIconSvg} />
                  <input type={showPassword ? 'text' : 'password'} className="form-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ paddingLeft: 40 }} />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : (isAr ? 'تحديث كلمة المرور' : 'Update Password')}
              </button>
            </form>
          )}

          <p className={styles.authSwitch}>
            <Link href="/login">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
