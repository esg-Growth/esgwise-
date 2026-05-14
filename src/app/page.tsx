'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/components/providers';
import { Leaf, BarChart3, Shield, FileText, Award, Bot, ArrowRight, Globe, Sun, Moon, CheckCircle, TrendingUp, Users, Zap } from 'lucide-react';
import styles from './landing.module.css';

const FEATURES = [
  { icon: BarChart3, title: 'Smart Assessment', title_ar: 'تقييم ذكي', desc: 'Guided ESG questionnaires customized for your industry sector with auto-save and progress tracking.', desc_ar: 'استبيانات ESG موجهة ومخصصة لقطاع صناعتك مع الحفظ التلقائي وتتبع التقدم.' },
  { icon: Zap, title: 'AI Analysis', title_ar: 'تحليل بالذكاء الاصطناعي', desc: 'Automatic ESG scoring, benchmarking, gap detection, and actionable recommendations powered by AI.', desc_ar: 'تسجيل ESG تلقائي، والمقارنة المعيارية، وكشف الثغرات، وتوصيات عملية مدعومة بالذكاء الاصطناعي.' },
  { icon: TrendingUp, title: 'Gap Analysis', title_ar: 'تحليل الفجوات', desc: 'Interactive heatmaps and dashboards showing exactly where you stand and what needs improvement.', desc_ar: 'خرائط حرارية تفاعلية ولوحات معلومات تُظهر موقفك بدقة وما يحتاج للتحسين.' },
  { icon: FileText, title: 'GRI Reports', title_ar: 'تقارير GRI', desc: 'Generate professional, investor-grade sustainability reports aligned with GRI, IFRS S1/S2, and SDGs.', desc_ar: 'إنشاء تقارير استدامة احترافية بمستوى المستثمرين متوافقة مع GRI وIFRS S1/S2 وأهداف التنمية المستدامة.' },
  { icon: Award, title: 'ESG Certificate', title_ar: 'شهادة ESG', desc: 'Receive a verifiable ESG Readiness Certificate upon completing your assessment.', desc_ar: 'احصل على شهادة جاهزية ESG قابلة للتحقق عند إتمام التقييم.' },
  { icon: Bot, title: 'AI Assistant', title_ar: 'مساعد ذكي', desc: 'An AI chatbot that explains ESG concepts, GRI indicators, and helps you fill gaps in your data.', desc_ar: 'روبوت دردشة ذكي يشرح مفاهيم ESG ومؤشرات GRI ويساعدك في ملء فجوات بياناتك.' },
];

const STATS = [
  { value: '500+', label: 'ESG Assessments', label_ar: 'تقييم ESG' },
  { value: '250+', label: 'SMEs Empowered', label_ar: 'شركة تم تمكينها' },
  { value: '19+', label: 'GRI Standards', label_ar: 'معيار GRI' },
  { value: '17', label: 'SDGs Mapped', label_ar: 'أهداف تنمية مستدامة' },
];

const SECTORS_PREVIEW = [
  { icon: '🌾', name: 'Agriculture', name_ar: 'الزراعة' },
  { icon: '🏭', name: 'Manufacturing', name_ar: 'التصنيع' },
  { icon: '🍽️', name: 'Food & Beverage', name_ar: 'الأغذية' },
  { icon: '⚡', name: 'Energy', name_ar: 'الطاقة' },
  { icon: '🏗️', name: 'Construction', name_ar: 'البناء' },
  { icon: '♻️', name: 'Waste Mgmt', name_ar: 'النفايات' },
  { icon: '🚛', name: 'Logistics', name_ar: 'اللوجستيات' },
  { icon: '💻', name: 'Technology', name_ar: 'التكنولوجيا' },
  { icon: '🏥', name: 'Healthcare', name_ar: 'الصحة' },
  { icon: '🏢', name: 'Other', name_ar: 'أخرى' },
];

export default function LandingPage() {
  const { locale, t, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const isAr = locale === 'ar';

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.logo}>
            <Leaf size={28} />
            <span>ESGwise</span>
          </Link>
          <div className={styles.navActions}>
            <button className="btn btn-ghost btn-sm" onClick={() => setLocale(isAr ? 'en' : 'ar')} title="Toggle Language">
              <Globe size={18} />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>
            <button className="btn btn-ghost btn-icon" onClick={toggle} title="Toggle Theme">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <Link href="/login" className="btn btn-secondary btn-sm">{t('auth.login')}</Link>
            <Link href="/register" className="btn btn-primary btn-sm">{t('auth.register')}</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Leaf size={14} />
            <span>{isAr ? 'منصة ESG الأولى للشركات الصغيرة والمتوسطة' : 'The #1 ESG Platform for SMEs'}</span>
          </div>
          <h1 className={styles.heroTitle}>{t('landing.hero_title')}</h1>
          <p className={styles.heroSubtitle}>{t('landing.hero_subtitle')}</p>
          <div className={styles.heroCta}>
            <Link href="/register" className="btn btn-accent btn-lg">
              {t('landing.get_started')}
              <ArrowRight size={20} />
            </Link>
            <Link href="/demo" className="btn btn-secondary btn-lg">{isAr ? 'جرب العرض التجريبي' : 'Try Demo'}</Link>
          </div>
          <div className={styles.heroTrust}>
            <CheckCircle size={16} className={styles.trustIcon} />
            <span>{isAr ? 'متوافق مع GRI • IFRS S1/S2 • أهداف التنمية المستدامة' : 'GRI Aligned • IFRS S1/S2 • SDG Mapped'}</span>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.scoreCard}>
            <div className={styles.scoreRing}>
              <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" strokeWidth="8" />
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeDasharray="270 327" strokeLinecap="round" transform="rotate(-90 60 60)" className={styles.scoreArc} />
              </svg>
              <div className={styles.scoreValue}>82</div>
            </div>
            <div className={styles.scoreLabel}>{isAr ? 'الدرجة الإجمالية' : 'Overall Score'}</div>
            <div className={styles.scoreRating}>AA</div>
            <div className={styles.scoreBars}>
              <div className={styles.scoreBarRow}><span className={styles.barLabel}>E</span><div className={styles.barTrack}><div className={styles.barFill} style={{ width: '85%', background: 'var(--color-env)' }} /></div><span className={styles.barVal}>85</span></div>
              <div className={styles.scoreBarRow}><span className={styles.barLabel}>S</span><div className={styles.barTrack}><div className={styles.barFill} style={{ width: '78%', background: 'var(--color-soc)' }} /></div><span className={styles.barVal}>78</span></div>
              <div className={styles.scoreBarRow}><span className={styles.barLabel}>G</span><div className={styles.barTrack}><div className={styles.barFill} style={{ width: '82%', background: 'var(--color-gov)' }} /></div><span className={styles.barVal}>82</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className={styles.trustedBy}>
        <p>{isAr ? 'موثوق به من قبل الشركات الرائدة' : 'Trusted by forward-thinking companies'}</p>
        <div className={styles.logoStrip}>
          <img src="/client_logos_strip_1778770998539.png" alt="Trusted Clients" />
        </div>
      </section>

      {/* Stats */}
      <section className={styles.stats}>
        {STATS.map((s, i) => (
          <div key={i} className={styles.statItem}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{isAr ? s.label_ar : s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>{isAr ? 'كل ما تحتاجه لرحلة ESG' : 'Everything You Need for Your ESG Journey'}</h2>
        <p className={styles.sectionSubtitle}>{isAr ? 'من جمع البيانات إلى تقارير المستثمرين - نغطي كل خطوة' : 'From data collection to investor reports — we cover every step'}</p>
        <div className={styles.featureGrid}>
          {FEATURES.map((f, i) => (
            <div key={i} className={`card ${styles.featureCard}`}>
              <div className={styles.featureIcon}><f.icon size={24} /></div>
              <h3>{isAr ? f.title_ar : f.title}</h3>
              <p>{isAr ? f.desc_ar : f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sectors */}
      <section className={styles.sectors}>
        <h2 className={styles.sectionTitle}>{isAr ? 'مخصص لقطاعك' : 'Tailored to Your Sector'}</h2>
        <p className={styles.sectionSubtitle}>{isAr ? 'تقييمات مخصصة لكل قطاع مع معايير GRI ذات الصلة' : 'Customized assessments for each sector with relevant GRI standards'}</p>
        <div className={styles.sectorGrid}>
          {SECTORS_PREVIEW.map((s, i) => (
            <div key={i} className={styles.sectorChip}>
              <span className={styles.sectorIcon}>{s.icon}</span>
              <span>{isAr ? s.name_ar : s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.howItWorks}>
        <h2 className={styles.sectionTitle}>{isAr ? 'كيف يعمل' : 'How It Works'}</h2>
        <div className={styles.steps}>
          {[
            { num: '1', title: isAr ? 'سجّل شركتك' : 'Register Your Company', desc: isAr ? 'أنشئ حسابًا واختر قطاعك' : 'Create an account and select your industry sector' },
            { num: '2', title: isAr ? 'أدخل بيانات ESG' : 'Enter ESG Data', desc: isAr ? 'أكمل الاستبيان الموجه' : 'Complete the guided questionnaire with auto-save' },
            { num: '3', title: isAr ? 'احصل على التحليل' : 'Get AI Analysis', desc: isAr ? 'تحليل ذكي فوري' : 'Instant AI-powered scoring, gaps, and recommendations' },
            { num: '4', title: isAr ? 'حمّل التقرير' : 'Download Reports', desc: isAr ? 'تقارير احترافية وشهادات' : 'Professional reports, roadmaps, and certificates' },
          ].map((step, i) => (
            <div key={i} className={styles.step}>
              <div className={styles.stepNum}>{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample Reports */}
      <section className={styles.samples}>
        <div className={styles.samplesGrid}>
          <div className={styles.samplesContent}>
            <h2 className={styles.sectionTitle} style={{ textAlign: isAr ? 'right' : 'left' }}>{isAr ? 'تقارير احترافية جاهزة للمستثمرين' : 'Professional, Investor-Ready Reports'}</h2>
            <p className={styles.sectionSubtitle} style={{ textAlign: isAr ? 'right' : 'left', margin: '0 0 2rem 0' }}>
              {isAr 
                ? 'احصل على تقارير شاملة تتوافق مع المعايير العالمية بضغطة زر واحدة.' 
                : 'Generate comprehensive reports aligned with global standards in a single click.'}
            </p>
            <ul className={styles.sampleList} style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}><CheckCircle size={18} color="#10b981" /> {isAr ? 'توافق كامل مع GRI' : 'Full GRI Alignment'}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}><CheckCircle size={18} color="#10b981" /> {isAr ? 'رؤى تحليلية ذكية' : 'Smart Analytical Insights'}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}><CheckCircle size={18} color="#10b981" /> {isAr ? 'تتبع التقدم السنوي' : 'Annual Progress Tracking'}</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}><CheckCircle size={18} color="#10b981" /> {isAr ? 'شهادات قابلة للتحقق' : 'Verifiable Certificates'}</li>
            </ul>
            <div style={{ marginTop: '2rem' }}>
              <Link href="/samples" className="btn btn-primary">{isAr ? 'مشاهدة عينات التقارير' : 'View Sample Reports'}</Link>
            </div>
          </div>
          <div className={styles.samplesVisual}>
            <img src="/sample_esg_report_preview_1778771025327.png" alt="Sample ESG Report" style={{ width: '100%', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2>{isAr ? 'ابدأ رحلة الاستدامة اليوم' : 'Start Your Sustainability Journey Today'}</h2>
          <p>{isAr ? 'انضم إلى مئات الشركات التي تبني مستقبلاً مستدامًا' : 'Join hundreds of companies building a sustainable future'}</p>
          <Link href="/register" className="btn btn-accent btn-lg">
            {t('landing.get_started')}
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <Leaf size={20} />
            <span>ESGwise</span>
          </div>
          <div className={styles.footerLinks}>
            <Link href="/privacy">{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
            <Link href="/terms">{isAr ? 'شروط الخدمة' : 'Terms of Service'}</Link>
            <span>{isAr ? 'متوافق مع' : 'Aligned with'}: GRI • IFRS S1/S2 • SDGs • GHG Protocol</span>
          </div>
          <div className={styles.footerCopy}>© 2026 ESGwise. {isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}.</div>
        </div>
      </footer>
    </div>
  );
}
