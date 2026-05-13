'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { ASSESSMENT_SECTIONS, Section, Question, getSectionsForPillar, calculateSectionProgress } from '@/lib/questionnaire';
import { Leaf, Users, Shield, CheckCircle, ChevronRight, Send, AlertCircle, Upload, FileText } from 'lucide-react';
import { DataUploadPanel } from './data-upload';
import styles from './assessment.module.css';

type Pillar = 'Environmental' | 'Social' | 'Governance';
type Tab = 'upload' | 'manual';

const PILLARS: { key: Pillar; icon: any; color: string }[] = [
  { key: 'Environmental', icon: Leaf, color: 'var(--color-env)' },
  { key: 'Social', icon: Users, color: 'var(--color-soc)' },
  { key: 'Governance', icon: Shield, color: 'var(--color-gov)' },
];

export default function AssessmentPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [activePillar, setActivePillar] = useState<Pillar>('Environmental');
  const [activeSection, setActiveSection] = useState<string>('energy');
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing assessment
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get' }) });
        const data = await res.json();
        if (data.assessment) {
          setAssessmentId(data.assessment.id);
          setResponses(data.responses || {});
        } else {
          const createRes = await fetch('/api/assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'create' }) });
          const createData = await createRes.json();
          setAssessmentId(createData.assessmentId);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    })();
  }, []);

  // When AI extraction accepts KPIs, merge into responses
  const handleKpisAccepted = useCallback((newResponses: Record<string, string>) => {
    setResponses(prev => ({ ...prev, ...newResponses }));
  }, []);

  // Auto-save for manual entry
  const autoSave = useCallback(async (updatedResponses: Record<string, string>) => {
    if (!assessmentId) return;
    setSaving(true);
    setSaved(false);
    const section = ASSESSMENT_SECTIONS.find(s => s.id === activeSection);
    if (!section) return;

    const payload = section.questions
      .filter(q => updatedResponses[q.id] !== undefined)
      .map(q => ({ questionId: q.id, section: section.id, pillar: section.pillar, value: updatedResponses[q.id] || '' }));

    try {
      await fetch('/api/assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', assessmentId, responses: payload }) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  }, [assessmentId, activeSection]);

  const handleChange = (questionId: string, value: string) => {
    const updated = { ...responses, [questionId]: value };
    setResponses(updated);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => autoSave(updated), 1500);
  };

  const handleComplete = async () => {
    if (!assessmentId) return;
    if (activeTab === 'manual') await autoSave(responses);
    await fetch('/api/assessment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'complete', assessmentId }) });
    window.location.href = '/dashboard/analysis';
  };

  const currentSections = getSectionsForPillar(activePillar);
  const currentSection = ASSESSMENT_SECTIONS.find(s => s.id === activeSection);
  const totalAnswered = Object.values(responses).filter(v => v && v.trim() !== '').length;
  const totalQuestions = ASSESSMENT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
  const overallProgress = Math.round((totalAnswered / totalQuestions) * 100);

  if (loading) return <div className="flex flex-center" style={{ height: '60vh' }}><div className="spinner spinner-lg" /></div>;

  return (
    <div className={styles.assessment}>
      {/* Header */}
      <div className={styles.assessmentHeader}>
        <div>
          <h1>{isAr ? 'تقييم ESG' : 'ESG Assessment'}</h1>
          <p className="text-secondary">{isAr ? `${totalAnswered} من ${totalQuestions} مؤشر مكتمل` : `${totalAnswered} of ${totalQuestions} indicators populated`}</p>
        </div>
        <div className={styles.headerActions}>
          {saving && <span className={styles.saveStatus}><div className="spinner" /> {isAr ? 'جاري الحفظ...' : 'Saving...'}</span>}
          {saved && <span className={styles.saveStatus} style={{ color: 'var(--color-success)' }}><CheckCircle size={16} /> {isAr ? 'تم الحفظ' : 'Saved'}</span>}
          <button className="btn btn-primary" onClick={handleComplete} disabled={overallProgress < 10}>
            <Send size={16} /> {isAr ? 'إنهاء وتحليل' : 'Complete & Analyze'}
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className={`card ${styles.progressCard}`}>
        <div className="progress-bar" style={{ height: 6 }}>
          <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
        </div>
        <div className={styles.progressLabel}>{overallProgress}% {isAr ? 'مكتمل' : 'complete'}</div>
      </div>

      {/* Tab Switcher */}
      <div className={styles.tabSwitcher}>
        <button className={`${styles.tabBtn} ${activeTab === 'upload' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('upload')}>
          <Upload size={18} />
          <span>{isAr ? 'رفع البيانات' : 'Upload Data'}</span>
          <span className={styles.tabHint}>{isAr ? 'مستحسن' : 'Recommended'}</span>
        </button>
        <button className={`${styles.tabBtn} ${activeTab === 'manual' ? styles.tabBtnActive : ''}`} onClick={() => setActiveTab('manual')}>
          <FileText size={18} />
          <span>{isAr ? 'إدخال يدوي' : 'Manual Entry'}</span>
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && assessmentId && (
        <DataUploadPanel
          assessmentId={assessmentId}
          responses={responses}
          onKpisAccepted={handleKpisAccepted}
        />
      )}

      {/* Manual Entry Tab */}
      {activeTab === 'manual' && (
        <>
          {/* Pillar Tabs */}
          <div className={styles.pillarTabs}>
            {PILLARS.map(p => (
              <button key={p.key} className={`${styles.pillarTab} ${activePillar === p.key ? styles.pillarTabActive : ''}`} onClick={() => { setActivePillar(p.key); setActiveSection(getSectionsForPillar(p.key)[0]?.id || ''); }} style={{ '--pillar-color': p.color } as any}>
                <p.icon size={18} />
                <span>{isAr ? (p.key === 'Environmental' ? 'البيئة' : p.key === 'Social' ? 'المجتمع' : 'الحوكمة') : p.key}</span>
              </button>
            ))}
          </div>

          <div className={styles.assessmentBody}>
            {/* Section Nav */}
            <div className={styles.sectionNav}>
              {currentSections.map(section => {
                const prog = calculateSectionProgress(responses, section);
                return (
                  <button key={section.id} className={`${styles.sectionBtn} ${activeSection === section.id ? styles.sectionBtnActive : ''}`} onClick={() => setActiveSection(section.id)}>
                    <div className={styles.sectionBtnContent}>
                      <span className={styles.sectionTitle}>{isAr ? section.title_ar : section.title}</span>
                      <span className={styles.sectionMeta}>{section.gri_codes.join(', ')}</span>
                    </div>
                    <div className={styles.sectionProgress}>
                      <div className={styles.miniProgress}><div className={styles.miniProgressFill} style={{ width: `${prog}%` }} /></div>
                      <span>{prog}%</span>
                    </div>
                    <ChevronRight size={14} />
                  </button>
                );
              })}
            </div>

            {/* Questions */}
            <div className={styles.questionsPanel}>
              {currentSection && (
                <>
                  <div className={styles.sectionHeader}>
                    <h2>{isAr ? currentSection.title_ar : currentSection.title}</h2>
                    <p className="text-secondary">{isAr ? currentSection.description_ar : currentSection.description}</p>
                    <div className={styles.griTags}>
                      {currentSection.gri_codes.map(c => <span key={c} className="badge badge-neutral">{c}</span>)}
                    </div>
                  </div>

                  <div className={styles.questionsList}>
                    {currentSection.questions.map((q, idx) => (
                      <div key={q.id} className={`card ${styles.questionCard}`}>
                        <div className={styles.questionHeader}>
                          <span className={styles.questionNum}>{idx + 1}</span>
                          <label className={styles.questionLabel}>{isAr ? q.label_ar : q.label}</label>
                          {q.gri_code && <span className="badge badge-neutral text-xs">{q.gri_code}</span>}
                        </div>
                        {q.hint && <p className={styles.questionHint}>{isAr ? q.hint_ar : q.hint}</p>}

                        <div className={styles.questionInput}>
                          {q.type === 'number' && (
                            <div className={styles.numberInput}>
                              <input type="number" className="form-input" value={responses[q.id] || ''} onChange={e => handleChange(q.id, e.target.value)} placeholder="0" />
                              {q.unit && <span className={styles.unitLabel}>{isAr ? q.unit_ar : q.unit}</span>}
                            </div>
                          )}
                          {q.type === 'percentage' && (
                            <div className={styles.numberInput}>
                              <input type="number" className="form-input" value={responses[q.id] || ''} onChange={e => handleChange(q.id, e.target.value)} min="0" max="100" placeholder="0" />
                              <span className={styles.unitLabel}>%</span>
                            </div>
                          )}
                          {q.type === 'yes_no' && (
                            <div className={styles.yesNoGroup}>
                              <button className={`${styles.yesNoBtn} ${responses[q.id] === 'yes' ? styles.yesNoBtnActive : ''}`} onClick={() => handleChange(q.id, 'yes')}>
                                <CheckCircle size={16} /> {isAr ? 'نعم' : 'Yes'}
                              </button>
                              <button className={`${styles.yesNoBtn} ${responses[q.id] === 'no' ? styles.yesNoBtnActiveNo : ''}`} onClick={() => handleChange(q.id, 'no')}>
                                <AlertCircle size={16} /> {isAr ? 'لا' : 'No'}
                              </button>
                            </div>
                          )}
                          {q.type === 'text' && (
                            <textarea className="form-input" value={responses[q.id] || ''} onChange={e => handleChange(q.id, e.target.value)} rows={3} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
