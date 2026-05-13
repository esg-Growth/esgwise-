'use client';

import { useState, useEffect, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Download, FileText, Calendar, Building2, BarChart3, AlertCircle, RefreshCw } from 'lucide-react';
import { ScoreBreakdown } from '@/lib/esg-scoring';
import { ASSESSMENT_SECTIONS } from '@/lib/questionnaire';
import styles from './reports.module.css';

interface ReportData {
  company: any;
  assessment: any;
  score: ScoreBreakdown;
  responses: Record<string, string>;
}

export default function ReportsPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';
  
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [analysisRes, companyRes] = await Promise.all([
          fetch('/api/analysis', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'calculate' }) }),
          fetch('/api/company', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'get' }) })
        ]);
        
        const analysis = await analysisRes.json();
        const company = await companyRes.json();
        
        if (analysis.score) {
          setData({
            company: company.company,
            assessment: analysis.assessment,
            score: analysis.score,
            responses: analysis.responses || {}
          });
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    })();
  }, []);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    
    try {
      // Dynamic import to avoid SSR issues and reduce initial bundle
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      // Temporarily modify styles for better print layout
      const originalWidth = reportRef.current.style.width;
      reportRef.current.style.width = '210mm'; // A4 width
      
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        windowWidth: 1200 // Force wide layout even on mobile
      });
      
      reportRef.current.style.width = originalWidth;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // If content is taller than 1 page, we might want to split, but for MVP we scale to fit or let it stretch
      // A better approach for multi-page is standard window.print(), but html2canvas is requested
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`ESG_Report_${data?.company?.name || 'Company'}.pdf`);
    } catch (e) {
      console.error('PDF generation failed:', e);
      alert('Failed to generate PDF. Please try again.');
    }
    
    setExporting(false);
  };

  if (loading) return <div className="flex flex-center" style={{ height: '60vh' }}><RefreshCw className="spin" /></div>;

  if (!data) {
    return (
      <div className={styles.emptyState}>
        <AlertCircle size={48} className="text-muted" />
        <h2>{isAr ? 'لا توجد بيانات تقرير' : 'No Report Data Available'}</h2>
        <p>{isAr ? 'يرجى إكمال تقييم ESG أولاً لإنشاء تقريرك.' : 'Please complete the ESG assessment first to generate your report.'}</p>
      </div>
    );
  }

  const { company, score, responses } = data;

  return (
    <div className={styles.reportsPage}>
      <div className={styles.header}>
        <div>
          <h1>{isAr ? 'التقرير الرسمي' : 'Formal ESG Report'}</h1>
          <p className="text-secondary">{isAr ? 'تقرير أداء الحوكمة البيئية والاجتماعية وحوكمة الشركات' : 'Your comprehensive Environmental, Social, and Governance performance report.'}</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportPDF} disabled={exporting}>
          {exporting ? <RefreshCw size={18} className="spin" /> : <Download size={18} />}
          {isAr ? 'تحميل PDF' : 'Download PDF'}
        </button>
      </div>

      <div className={styles.reportContainerWrapper}>
        {/* Actual Report DOM to capture */}
        <div className={styles.reportDocument} ref={reportRef} dir={isAr ? 'rtl' : 'ltr'}>
          {/* Cover Page */}
          <div className={styles.coverPage}>
            <div className={styles.coverHeader}>
              <div className={styles.logo}>ESGwise</div>
              <div className={styles.date}>{new Date().toLocaleDateString(locale)}</div>
            </div>
            
            <div className={styles.coverTitle}>
              <h1>{isAr ? 'تقرير أداء الاستدامة' : 'Sustainability Performance Report'}</h1>
              <h2>{company?.name || 'Company Name'}</h2>
              <div className={styles.sectorBadge}>{company?.sector || 'Sector'}</div>
            </div>
            
            <div className={styles.coverFooter}>
              <p>{isAr ? 'تم الإنشاء بواسطة منصة ESGwise' : 'Generated by ESGwise Platform'}</p>
              <p>{isAr ? 'يتوافق مع معايير GRI' : 'Aligned with GRI Standards'}</p>
            </div>
          </div>

          <div className="page-break" />

          {/* Executive Summary & Score */}
          <div className={styles.page}>
            <h2 className={styles.sectionTitle}>{isAr ? 'الملخص التنفيذي' : 'Executive Summary'}</h2>
            
            <div className={styles.scoreGrid}>
              <div className={styles.mainScoreCard}>
                <h3>{isAr ? 'التقييم الشامل' : 'Overall ESG Rating'}</h3>
                <div className={styles.ratingBadge} data-rating={score.rating}>
                  {score.rating}
                </div>
                <div className={styles.scoreNumber}>{Math.round(score.overall)} / 100</div>
              </div>
              
              <div className={styles.pillarScores}>
                <div className={styles.pillarScore} style={{ '--pillar-color': 'var(--color-env)' } as any}>
                  <span>{isAr ? 'البيئة' : 'Environmental'}</span>
                  <strong>{Math.round(score.env)}%</strong>
                </div>
                <div className={styles.pillarScore} style={{ '--pillar-color': 'var(--color-soc)' } as any}>
                  <span>{isAr ? 'المجتمع' : 'Social'}</span>
                  <strong>{Math.round(score.soc)}%</strong>
                </div>
                <div className={styles.pillarScore} style={{ '--pillar-color': 'var(--color-gov)' } as any}>
                  <span>{isAr ? 'الحوكمة' : 'Governance'}</span>
                  <strong>{Math.round(score.gov)}%</strong>
                </div>
              </div>
            </div>
            
            <div className={styles.insightsList}>
              <div className={styles.insightBox} style={{ borderColor: 'var(--color-success)' }}>
                <h4>{isAr ? 'نقاط القوة' : 'Key Strengths'}</h4>
                <ul>
                  {score.strengths.slice(0, 3).map((s: any, i: number) => <li key={i}>{isAr ? s.label_ar : s.label}</li>)}
                </ul>
              </div>
              <div className={styles.insightBox} style={{ borderColor: 'var(--color-danger)' }}>
                <h4>{isAr ? 'مجالات التحسين' : 'Areas for Improvement'}</h4>
                <ul>
                  {score.weaknesses.slice(0, 3).map((w: any, i: number) => <li key={i}>{isAr ? w.label_ar : w.label}</li>)}
                </ul>
              </div>
            </div>
          </div>

          <div className="page-break" />

          {/* Detailed Data Tables */}
          <div className={styles.page}>
            <h2 className={styles.sectionTitle}>{isAr ? 'بيانات الأداء التفصيلية' : 'Detailed Performance Data'}</h2>
            
            {ASSESSMENT_SECTIONS.map(section => {
              // Only show sections with at least one answered question
              const answeredQuestions = section.questions.filter(q => responses[q.id]);
              if (answeredQuestions.length === 0) return null;
              
              return (
                <div key={section.id} className={styles.dataSection}>
                  <h3 className={styles.dataSectionTitle}>{isAr ? section.title_ar : section.title}</h3>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>{isAr ? 'المؤشر' : 'Indicator'}</th>
                        <th>GRI</th>
                        <th style={{ textAlign: 'right' }}>{isAr ? 'القيمة' : 'Value'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {answeredQuestions.map(q => {
                        let displayValue = responses[q.id];
                        if (q.type === 'yes_no') {
                          displayValue = displayValue === 'yes' ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No');
                        } else if (q.unit) {
                          displayValue = `${displayValue} ${isAr ? q.unit_ar : q.unit}`;
                        } else if (q.type === 'percentage') {
                          displayValue = `${displayValue}%`;
                        }
                        
                        return (
                          <tr key={q.id}>
                            <td>{isAr ? q.label_ar : q.label}</td>
                            <td><span className={styles.griTag}>{q.gri_code || '-'}</span></td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>{displayValue}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
