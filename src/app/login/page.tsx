'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Leaf, Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react';
import styles from './auth.module.css';

export default function LoginPage() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const isAr = locale === 'ar';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { signIn } = await import('next-auth/react');
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        throw new Error('Invalid email or password');
      }
      if (res?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'microsoft-entra-id') => {
    const { signIn } = await import('next-auth/react');
    await signIn(provider, { callbackUrl: '/dashboard' });
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
            <p>{isAr ? 'بسّط رحلة الاستدامة لشركتك' : 'Simplify your sustainability journey'}</p>
            <div className={styles.decorStats}>
              <div><strong>19+</strong><span>{isAr ? 'معيار GRI' : 'GRI Standards'}</span></div>
              <div><strong>10</strong><span>{isAr ? 'قطاعات' : 'Sectors'}</span></div>
              <div><strong>AI</strong><span>{isAr ? 'تحليل ذكي' : 'Analysis'}</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.authRight}>
        <div className={styles.authForm}>
          <div className={styles.langToggle}>
            <button className="btn btn-ghost btn-sm" onClick={() => setLocale(isAr ? 'en' : 'ar')}>
              <Globe size={16} />{isAr ? 'EN' : 'عربي'}
            </button>
          </div>

          <h1>{t('auth.login')}</h1>
          <p className={styles.authSubtitle}>
            {isAr ? 'سجّل الدخول إلى حسابك للوصول إلى لوحة التحكم' : 'Sign in to your account to access your dashboard'}
          </p>

          {error && <div className={styles.authError}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.email')}</label>
              <div className={styles.inputIcon}>
                <Mail size={18} className={styles.inputIconSvg} />
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder={isAr ? 'أدخل بريدك الإلكتروني' : 'Enter your email'} required style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.password')}</label>
              <div className={styles.inputIcon}>
                <Lock size={18} className={styles.inputIconSvg} />
                <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter your password'} required style={{ paddingLeft: 40, paddingRight: 40 }} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.authOptions}>
              <Link href="/forgot-password" className={styles.forgotLink}>{t('auth.forgot')}</Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : t('auth.login')}
            </button>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <div style={{ textAlign: 'center', margin: '0.5rem 0', color: '#888', fontSize: '0.9rem' }}>
                {isAr ? 'أو' : 'OR'}
              </div>
              <button type="button" className="btn btn-outline btn-full" onClick={() => handleOAuth('google')}>
                {isAr ? 'تسجيل الدخول باستخدام جوجل' : 'Sign in with Google'}
              </button>
              <button type="button" className="btn btn-outline btn-full" onClick={() => handleOAuth('microsoft-entra-id')}>
                {isAr ? 'تسجيل الدخول باستخدام مايكروسوفت' : 'Sign in with Microsoft'}
              </button>
            </div>
          </form>

          <p className={styles.authSwitch}>
            {t('auth.no_account')} <Link href="/register">{t('auth.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
