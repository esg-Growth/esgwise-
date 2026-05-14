'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Session } from '@/lib/session';
import { getSectorById } from '@/lib/gri-standards';
import {
  ClipboardList, BarChart3, Target, Map, FileText, Award,
  ArrowRight, Leaf, TrendingUp, Users, Shield, AlertTriangle,
  CheckCircle, Clock, Zap
} from 'lucide-react';
import styles from './dashboard.module.css';

interface Props {
  session: Session;
  company: any;
  assessment: any;
}

export function DashboardOverview({ session, company, assessment }: Props) {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  const sector = company ? getSectorById(company.sector) : null;

  const hasAssessment = !!assessment;
  const progress = assessment?.progress || 0;

  return (
    <div className={styles.dashboard}>
      {/* Welcome */}
      <div className={styles.welcome}>
        <div>
          <h1>{isAr ? `مرحباً، ${session.name}` : `Welcome, ${session.name}`} 👋</h1>
          <p className="text-secondary">
            {company ? (isAr ? `${company.name} • ${sector?.name_ar || company.sector}` : `${company.name} • ${sector?.name || company.sector}`) : ''}
          </p>
        </div>
        {!hasAssessment && (
          <Link href="/dashboard/assessment" className="btn btn-primary btn-lg">
            <Zap size={20} />
            {isAr ? 'ابدأ التقييم' : 'Start Assessment'}
          </Link>
        )}
      </div>

      {/* Quick Stats */}
      <div className={styles.statsGrid}>
        <div className={`card ${styles.statCard} ${styles.statEnv}`}>
          <div className={styles.statIcon}><Leaf size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'البيئة' : 'Environmental'}</div>
          <div className={styles.statValue}>{hasAssessment ? '—' : '—'}</div>
          <div className={styles.statHint}>{isAr ? 'ابدأ التقييم لحساب الدرجة' : 'Start assessment to calculate'}</div>
        </div>
        <div className={`card ${styles.statCard} ${styles.statSoc}`}>
          <div className={styles.statIcon}><Users size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'المجتمع' : 'Social'}</div>
          <div className={styles.statValue}>—</div>
          <div className={styles.statHint}>{isAr ? 'بانتظار البيانات' : 'Awaiting data'}</div>
        </div>
        <div className={`card ${styles.statCard} ${styles.statGov}`}>
          <div className={styles.statIcon}><Shield size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'الحوكمة' : 'Governance'}</div>
          <div className={styles.statValue}>—</div>
          <div className={styles.statHint}>{isAr ? 'بانتظار البيانات' : 'Awaiting data'}</div>
        </div>
        <div className={`card ${styles.statCard} ${styles.statOverall}`}>
          <div className={styles.statIcon}><TrendingUp size={24} /></div>
          <div className={styles.statLabel}>{isAr ? 'الدرجة الإجمالية' : 'Overall ESG Score'}</div>
          <div className={styles.statValue}>—</div>
          <div className={styles.statHint}>{isAr ? 'لم يتم التقييم بعد' : 'Not yet assessed'}</div>
        </div>
      </div>

      {/* Assessment Progress */}
      {hasAssessment && (
        <div className={`card ${styles.progressCard}`}>
          <div className="card-header">
            <div>
              <h3 className="card-title">{isAr ? 'تقدم التقييم' : 'Assessment Progress'}</h3>
              <p className="card-subtitle">{assessment.title} • {assessment.period}</p>
            </div>
            <span className={`badge ${assessment.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
              {assessment.status === 'completed' ? (isAr ? 'مكتمل' : 'Completed') : (isAr ? 'قيد التنفيذ' : 'In Progress')}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.progressMeta}>
            <span>{progress}% {isAr ? 'مكتمل' : 'complete'}</span>
            <Link href="/dashboard/assessment" className={styles.continueLink}>
              {isAr ? 'متابعة' : 'Continue'} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <h2 className={styles.sectionTitle}>{isAr ? 'إجراءات سريعة' : 'Quick Actions'}</h2>
      <div className={styles.actionsGrid}>
        {[
          { href: '/dashboard/assessment', icon: ClipboardList, title: isAr ? 'التقييم' : 'Assessment', desc: isAr ? 'ابدأ أو أكمل تقييم ESG' : 'Start or continue ESG assessment', color: 'var(--color-env)' },
          { href: '/dashboard/analysis', icon: BarChart3, title: isAr ? 'التحليل' : 'Analysis', desc: isAr ? 'اعرض درجاتك وتحليلك' : 'View scores and AI analysis', color: 'var(--color-soc)' },
          { href: '/dashboard/gaps', icon: Target, title: isAr ? 'الفجوات' : 'Gap Analysis', desc: isAr ? 'اكتشف نقاط التحسين' : 'Find improvement areas', color: 'var(--color-warning)' },
          { href: '/dashboard/roadmap', icon: Map, title: isAr ? 'خارطة الطريق' : 'Roadmap', desc: isAr ? 'خطط التحسين المقترحة' : 'AI-generated improvement plan', color: 'var(--color-gov)' },
          { href: '/dashboard/reports', icon: FileText, title: isAr ? 'التقارير' : 'Reports', desc: isAr ? 'أنشئ تقارير احترافية' : 'Generate professional reports', color: 'var(--color-primary)' },
          { href: '/dashboard/certificate', icon: Award, title: isAr ? 'الشهادة' : 'Certificate', desc: isAr ? 'احصل على شهادة ESG' : 'Get ESG readiness certificate', color: 'var(--color-accent)' },
        ].map((action, i) => (
          <Link key={i} href={action.href} className={`card ${styles.actionCard}`}>
            <div className={styles.actionIcon} style={{ background: `${action.color}15`, color: action.color }}>
              <action.icon size={22} />
            </div>
            <div>
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
            </div>
            <ArrowRight size={16} className={styles.actionArrow} />
          </Link>
        ))}
      </div>

      {/* Year-over-Year Performance */}
      <h2 className={styles.sectionTitle} style={{ marginTop: '2.5rem' }}>{isAr ? 'الأداء السنوي' : 'Year-over-Year Performance'}</h2>
      <div className={`card ${styles.comparisonCard}`}>
        <div className={styles.comparisonGrid}>
          <div className={styles.comparisonItem}>
            <div className={styles.comparisonHeader}>
              <div className={styles.comparisonDot} style={{ background: 'var(--color-primary)' }} />
              <span>{isAr ? 'العام الحالي (2024)' : 'Current Year (2024)'}</span>
            </div>
            <div className={styles.comparisonValue}>
              {hasAssessment && assessment.status === 'completed' ? '74%' : '—'}
            </div>
          </div>
          <div className={styles.comparisonItem}>
            <div className={styles.comparisonHeader}>
              <div className={styles.comparisonDot} style={{ background: 'var(--color-text-muted)' }} />
              <span>{isAr ? 'العام السابق (2023)' : 'Previous Year (2023)'}</span>
            </div>
            <div className={styles.comparisonValue}>
              62%
            </div>
          </div>
          <div className={styles.comparisonTrend}>
            <div className={styles.trendIcon} style={{ color: 'var(--color-success)' }}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.trendLabel}>
              <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>+12%</span>
              <p>{isAr ? 'تحسن في الأداء' : 'Performance Improvement'}</p>
            </div>
          </div>
        </div>
        <div className={styles.comparisonChart}>
          <div className={styles.chartBar} style={{ height: '74%', background: 'var(--color-primary)' }}>
            <span className={styles.chartBarLabel}>2024</span>
          </div>
          <div className={styles.chartBar} style={{ height: '62%', background: 'var(--color-text-muted)', opacity: 0.5 }}>
            <span className={styles.chartBarLabel}>2023</span>
          </div>
        </div>
      </div>

      {/* Sector Info */}
      {sector && (
        <div className={`card ${styles.sectorInfo}`}>
          <div className="card-header">
            <h3 className="card-title">{isAr ? 'قطاعك' : 'Your Sector'}: {isAr ? sector.name_ar : sector.name} {sector.icon}</h3>
          </div>
          <div className={styles.sectorDetails}>
            <div>
              <span className={styles.sectorLabel}>{isAr ? 'معايير GRI المرتبطة' : 'Mapped GRI Standards'}</span>
              <div className={styles.griTags}>
                {sector.griStandards.slice(0, 8).map(id => (
                  <span key={id} className="badge badge-neutral">{id.replace('gri-', 'GRI ')}</span>
                ))}
                {sector.griStandards.length > 8 && <span className="badge badge-info">+{sector.griStandards.length - 8}</span>}
              </div>
            </div>
            <div className={styles.sectorWeights}>
              <span className={styles.sectorLabel}>{isAr ? 'أوزان الأعمدة' : 'Pillar Weights'}</span>
              <div className={styles.weightBars}>
                <div className={styles.weightBar}><span>E</span><div className="progress-bar"><div className="progress-fill" style={{ width: `${sector.weights.env}%`, background: 'var(--color-env)' }} /></div><span>{sector.weights.env}%</span></div>
                <div className={styles.weightBar}><span>S</span><div className="progress-bar"><div className="progress-fill" style={{ width: `${sector.weights.soc}%`, background: 'var(--color-soc)' }} /></div><span>{sector.weights.soc}%</span></div>
                <div className={styles.weightBar}><span>G</span><div className="progress-bar"><div className="progress-fill" style={{ width: `${sector.weights.gov}%`, background: 'var(--color-gov)' }} /></div><span>{sector.weights.gov}%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
