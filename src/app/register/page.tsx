'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { SECTORS } from '@/lib/gri-standards';
import { Leaf, Eye, EyeOff, Mail, Lock, User, Building2, Globe } from 'lucide-react';
import styles from '../login/auth.module.css';

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const { t, locale, setLocale } = useI18n();
  const router = useRouter();
  const isAr = locale === 'ar';

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [companySize, setCompanySize] = useState('small');
  const [country, setCountry] = useState('Jordan');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName, sector, companySize, country }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      const { signIn } = await import('next-auth/react');
      const signInRes = await signIn('credentials', {
        email,
        password,
        redirect: false
      });
      
      if (signInRes?.error) {
        throw new Error('Could not automatically sign in after registration');
      }
      
      router.push('/dashboard');
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
            <p>{isAr ? 'ابدأ رحلة الاستدامة لشركتك' : 'Begin your sustainability journey'}</p>
            <div className={styles.decorStats}>
              <div><strong>3</strong><span>{isAr ? 'خطوات' : 'Steps'}</span></div>
              <div><strong>5</strong><span>{isAr ? 'دقائق' : 'Minutes'}</span></div>
              <div><strong>∞</strong><span>{isAr ? 'تأثير' : 'Impact'}</span></div>
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

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            {[1, 2, 3].map(s => (
              <div key={s} className={`${styles.stepDot} ${s === step ? styles.stepDotActive : ''} ${s < step ? styles.stepDotDone : ''}`} />
            ))}
          </div>

          {error && <div className={styles.authError}>{error}</div>}

          {/* Step 1: Account */}
          {step === 1 && (
            <>
              <h1>{isAr ? 'أنشئ حسابك' : 'Create Your Account'}</h1>
              <p className={styles.authSubtitle}>{isAr ? 'الخطوة 1: معلومات الحساب' : 'Step 1: Account information'}</p>

              <div className="form-group">
                <label className="form-label">{t('auth.name')}</label>
                <div className={styles.inputIcon}>
                  <User size={18} className={styles.inputIconSvg} />
                  <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder={isAr ? 'الاسم الكامل' : 'Full name'} required style={{ paddingLeft: 40 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <div className={styles.inputIcon}>
                  <Mail size={18} className={styles.inputIconSvg} />
                  <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder={isAr ? 'البريد الإلكتروني' : 'Work email'} required style={{ paddingLeft: 40 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <div className={styles.inputIcon}>
                  <Lock size={18} className={styles.inputIconSvg} />
                  <input type={showPassword ? 'text' : 'password'} className="form-input" value={password} onChange={e => setPassword(e.target.value)} placeholder={isAr ? 'كلمة مرور قوية' : 'Strong password'} required minLength={8} style={{ paddingLeft: 40, paddingRight: 40 }} />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary btn-full btn-lg" onClick={() => { if (name && email && password.length >= 8) setStep(2); else setError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all fields (password min 8 chars)'); }}>
                {t('common.next')}
              </button>
            </>
          )}

          {/* Step 2: Company */}
          {step === 2 && (
            <>
              <h1>{isAr ? 'معلومات الشركة' : 'Company Information'}</h1>
              <p className={styles.authSubtitle}>{isAr ? 'الخطوة 2: أخبرنا عن شركتك' : 'Step 2: Tell us about your company'}</p>

              <div className="form-group">
                <label className="form-label">{t('auth.company')}</label>
                <div className={styles.inputIcon}>
                  <Building2 size={18} className={styles.inputIconSvg} />
                  <input className="form-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={isAr ? 'اسم الشركة' : 'Company name'} required style={{ paddingLeft: 40 }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{isAr ? 'البلد' : 'Country'}</label>
                <select className="form-input form-select" value={country} onChange={e => setCountry(e.target.value)}>
                  <option value="Jordan">{isAr ? 'الأردن' : 'Jordan'}</option>
                  <option value="Saudi Arabia">{isAr ? 'السعودية' : 'Saudi Arabia'}</option>
                  <option value="UAE">{isAr ? 'الإمارات' : 'UAE'}</option>
                  <option value="Egypt">{isAr ? 'مصر' : 'Egypt'}</option>
                  <option value="Other">{isAr ? 'أخرى' : 'Other'}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{isAr ? 'حجم الشركة' : 'Company Size'}</label>
                <div className={styles.sizeGrid}>
                  {[
                    { value: 'micro', label: isAr ? 'أقل من 10' : '<10', sub: isAr ? 'ناشئة' : 'Micro' },
                    { value: 'small', label: '10-49', sub: isAr ? 'صغيرة' : 'Small' },
                    { value: 'medium', label: '50-249', sub: isAr ? 'متوسطة' : 'Medium' },
                  ].map(s => (
                    <div key={s.value} className={`${styles.sizeOption} ${companySize === s.value ? styles.sizeOptionActive : ''}`} onClick={() => setCompanySize(s.value)}>
                      <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{s.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-sm">
                <button className="btn btn-secondary btn-lg" onClick={() => setStep(1)} style={{ flex: '0 0 auto' }}>{t('common.back')}</button>
                <button className="btn btn-primary btn-full btn-lg" onClick={() => { if (companyName) setStep(3); else setError(isAr ? 'يرجى إدخال اسم الشركة' : 'Please enter company name'); }}>
                  {t('common.next')}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Sector */}
          {step === 3 && (
            <>
              <h1>{isAr ? 'اختر قطاعك' : 'Select Your Sector'}</h1>
              <p className={styles.authSubtitle}>{isAr ? 'الخطوة 3: سنخصص التقييم لقطاعك' : 'Step 3: We\'ll customize the assessment for your sector'}</p>

              <div className={styles.sectorGrid}>
                {SECTORS.map(s => (
                  <div key={s.id} className={`${styles.sectorOption} ${sector === s.id ? styles.sectorOptionActive : ''}`} onClick={() => setSector(s.id)}>
                    <span className={styles.sectorEmoji}>{s.icon}</span>
                    <span className={styles.sectorName}>{isAr ? s.name_ar : s.name}</span>
                  </div>
                ))}
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className={styles.checkboxLabel} style={{ display: 'flex', gap: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', color: '#4b5563' }}>
                  <input type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} style={{ width: '1.25rem', height: '1.25rem', marginTop: '0.125rem' }} />
                  <span>
                    {isAr ? (
                      <>أوافق على <Link href="/terms" className="link">شروط الخدمة</Link> و <Link href="/privacy" className="link">سياسة الخصوصية</Link></>
                    ) : (
                      <>I agree to the <Link href="/terms" className="link">Terms of Service</Link> and <Link href="/privacy" className="link">Privacy Policy</Link></>
                    )}
                  </span>
                </label>
              </div>

              <div className="flex gap-sm">
                <button className="btn btn-secondary btn-lg" onClick={() => setStep(2)} style={{ flex: '0 0 auto' }}>{t('common.back')}</button>
                <button className="btn btn-primary btn-full btn-lg" onClick={() => { if (sector && agreedToTerms) handleSubmit(); else if (!agreedToTerms) setError(isAr ? 'يجب الموافقة على الشروط والخصوصية' : 'You must agree to the Terms and Privacy Policy'); else setError(isAr ? 'يرجى اختيار قطاع' : 'Please select a sector'); }} disabled={loading}>
                  {loading ? <span className="spinner" /> : (isAr ? 'إنشاء الحساب' : 'Create Account')}
                </button>
              </div>
            </>
          )}

          <p className={styles.authSwitch}>
            {t('auth.has_account')} <Link href="/login">{t('auth.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
