'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { ScoreBreakdown } from '@/lib/esg-scoring';
import { getRatingColor } from '@/lib/gri-standards';
import { ASSESSMENT_SECTIONS } from '@/lib/questionnaire';
import { TrendingUp, Leaf, Users, Shield, AlertTriangle, CheckCircle, Target, ArrowRight, Award } from 'lucide-react';
import Link from 'next/link';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { issueCertificate } from '../assessment/actions';
import styles from './analysis.module.css';

export default function AnalysisPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const [data, setData] = useState<{ score: ScoreBreakdown; company: any; assessment: any; certificate?: any } | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/analysis');
        if (!res.ok) { setError(isAr ? 'لا يوجد تقييم مكتمل' : 'No completed assessment found'); return; }
        setData(await res.json());
      } catch { setError('Failed to load'); }
      setLoading(false);
    })();
  }, [isAr]);

  if (loading) return <div className="flex flex-center" style={{ height: '60vh' }}><div className="spinner spinner-lg" /></div>;
  if (error || !data) return (
    <div className={styles.empty}>
      <AlertTriangle size={48} />
      <h2>{error || (isAr ? 'لا توجد بيانات' : 'No data available')}</h2>
      <p>{isAr ? 'أكمل التقييم أولاً للحصول على التحليل' : 'Complete the assessment first to get analysis'}</p>
      <Link href="/dashboard/assessment" className="btn btn-primary">{isAr ? 'ابدأ التقييم' : 'Start Assessment'} <ArrowRight size={16} /></Link>
    </div>
  );

  const { score } = data;
  const radarData = [
    { subject: isAr ? 'البيئة' : 'Environmental', value: score.env, fullMark: 100 },
    { subject: isAr ? 'المجتمع' : 'Social', value: score.soc, fullMark: 100 },
    { subject: isAr ? 'الحوكمة' : 'Governance', value: score.gov, fullMark: 100 },
  ];

  const sectionData = ASSESSMENT_SECTIONS.map(s => ({
    name: isAr ? s.title_ar : s.title,
    score: score.sectionScores[s.id]?.score || 0,
    pillar: s.pillar,
  }));

  const pillarColors: Record<string, string> = {
    Environmental: '#22C55E', Social: '#3B82F6', Governance: '#8B5CF6',
  };

  return (
    <div className={styles.analysis}>
      <h1>{isAr ? 'تحليل ESG' : 'ESG Analysis'}</h1>
      <p className="text-secondary" style={{ marginBottom: 'var(--space-xl)' }}>
        {isAr ? `بناءً على تقييم ${data.assessment?.period || '2025'}` : `Based on ${data.assessment?.period || '2025'} assessment`}
      </p>

      {/* Score Overview */}
      <div className={styles.scoreOverview}>
        <div className={`card ${styles.mainScore}`}>
          <div className={styles.scoreGauge}>
            <svg viewBox="0 0 120 120" width="160" height="160">
              <circle cx="60" cy="60" r="52" fill="none" stroke="var(--color-border)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke={getRatingColor(score.rating)} strokeWidth="8"
                strokeDasharray={`${(score.overall / 100) * 327} 327`} strokeLinecap="round" transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dasharray 1s ease' }} />
            </svg>
            <div className={styles.gaugeCenter}>
              <span className={styles.gaugeValue}>{score.overall}</span>
              <span className={styles.gaugeLabel}>/100</span>
            </div>
          </div>
          <div className={styles.ratingBadge} style={{ background: `${getRatingColor(score.rating)}20`, color: getRatingColor(score.rating) }}>
            {score.rating}
          </div>
          <p className={styles.completeness}>{isAr ? 'اكتمال البيانات' : 'Data Completeness'}: {score.dataCompleteness}%</p>
        </div>

        <div className={styles.pillarCards}>
          {[
            { key: 'env', label: isAr ? 'البيئة' : 'Environmental', value: score.env, icon: Leaf, color: 'var(--color-env)', bg: 'var(--color-env-bg)' },
            { key: 'soc', label: isAr ? 'المجتمع' : 'Social', value: score.soc, icon: Users, color: 'var(--color-soc)', bg: 'var(--color-soc-bg)' },
            { key: 'gov', label: isAr ? 'الحوكمة' : 'Governance', value: score.gov, icon: Shield, color: 'var(--color-gov)', bg: 'var(--color-gov-bg)' },
          ].map(p => (
            <div key={p.key} className={`card ${styles.pillarCard}`}>
              <div className={styles.pillarIcon} style={{ background: p.bg, color: p.color }}><p.icon size={20} /></div>
              <span className={styles.pillarLabel}>{p.label}</span>
              <span className={styles.pillarValue} style={{ color: p.color }}>{p.value}</span>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${p.value}%`, background: p.color }} /></div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        <div className={`card ${styles.chartCard}`}>
          <h3 className="card-title">{isAr ? 'توزيع الأعمدة' : 'Pillar Distribution'}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--color-border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar dataKey="value" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className={`card ${styles.chartCard}`}>
          <h3 className="card-title">{isAr ? 'الدرجات حسب القسم' : 'Scores by Section'}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={sectionData} layout="vertical" margin={{ left: 10 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {sectionData.map((entry, i) => (
                  <Cell key={i} fill={pillarColors[entry.pillar] || '#999'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className={styles.insightsGrid}>
        <div className={`card ${styles.insightCard}`}>
          <h3 className="card-title"><CheckCircle size={18} style={{ color: 'var(--color-success)' }} /> {isAr ? 'نقاط القوة' : 'Strengths'}</h3>
          {score.strengths.length > 0 ? (
            <ul className={styles.insightList}>
              {score.strengths.map((s, i) => <li key={i}><CheckCircle size={14} /> {s}</li>)}
            </ul>
          ) : <p className="text-muted">{isAr ? 'لم يتم تحديد نقاط قوة بعد' : 'No strengths identified yet'}</p>}
        </div>

        <div className={`card ${styles.insightCard}`}>
          <h3 className="card-title"><AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} /> {isAr ? 'نقاط الضعف' : 'Weaknesses'}</h3>
          {score.weaknesses.length > 0 ? (
            <ul className={styles.insightList}>
              {score.weaknesses.map((w, i) => <li key={i}><AlertTriangle size={14} /> {w}</li>)}
            </ul>
          ) : <p className="text-muted">{isAr ? 'لم يتم تحديد نقاط ضعف' : 'No weaknesses identified'}</p>}
        </div>

        <div className={`card ${styles.insightCard}`}>
          <h3 className="card-title"><Target size={18} style={{ color: 'var(--color-danger)' }} /> {isAr ? 'الفجوات' : 'Top Gaps'}</h3>
          {score.gaps.length > 0 ? (
            <ul className={styles.insightList}>
              {score.gaps.slice(0, 8).map((g, i) => <li key={i}><Target size={14} /> {g}</li>)}
            </ul>
          ) : <p className="text-muted">{isAr ? 'لا توجد فجوات' : 'No gaps — excellent!'}</p>}
        </div>
      </div>

      <div className={styles.ctaBar}>
        <Link href="/dashboard/gaps" className="btn btn-secondary"><Target size={16} /> {isAr ? 'تحليل الفجوات المفصل' : 'Detailed Gap Analysis'}</Link>
        <Link href="/dashboard/roadmap" className="btn btn-primary"><TrendingUp size={16} /> {isAr ? 'اعرض خارطة الطريق' : 'View Improvement Roadmap'}</Link>
        
        {data.certificate ? (
          <Link href={`/verify/${data.certificate.verification_code}`} target="_blank" className="btn btn-success">
            <Award size={16} /> {isAr ? 'عرض الشهادة العامة' : 'View Public Certificate'}
          </Link>
        ) : (
          <button 
            className="btn btn-success" 
            onClick={async () => {
              setIssuing(true);
              const res = await issueCertificate(data.assessment.id);
              if (res.success) {
                // Refresh data to show the certificate
                const freshRes = await fetch('/api/analysis');
                setData(await freshRes.json());
              }
              setIssuing(false);
            }}
            disabled={issuing}
          >
            {issuing ? <div className="spinner" /> : <Award size={16} />}
            {isAr ? 'إصدار شهادة ESG عامة' : 'Issue Public ESG Certificate'}
          </button>
        )}
      </div>
    </div>
  );
}
