'use client';

import { useState, useRef } from 'react';
import { useI18n } from '@/lib/i18n';
import { Shield, ShieldAlert, Trash2, ShieldCheck, User, Building2, Users, FileText, Activity, CheckCircle, Clock, FileDown, Settings, Eye, X, Palette, Type, Image, Download } from 'lucide-react';
import { toggleAdminStatus, removeUser } from './actions';
import styles from './admin.module.css';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  is_admin: number;
  company_name?: string;
  created_at: string;
}

interface AdminAnalytics {
  totalUsers: number;
  totalCompanies: number;
  assessments: {
    total: number;
    completed: number;
    draft: number;
  };
  averageScores: {
    overall: number;
    env: number;
    soc: number;
    gov: number;
  };
  sectors: { name: string; count: number }[];
  sizes: { name: string; count: number }[];
  totalCertificates: number;
  recentAssessments: {
    id: string;
    title: string;
    company: string;
    status: string;
    progress: number;
    date: string;
  }[];
}

interface CompanyWithScore {
  id: string;
  name: string;
  nameAr: string;
  sector: string;
  size: string;
  country: string;
  score: number | null;
  rating: string | null;
  envScore: number;
  socScore: number;
  govScore: number;
  assessmentStatus: string;
  progress: number;
  hasScore: boolean;
}

export function AdminPanel({ initialUsers, analytics, companies = [], tenantSettings }: { initialUsers: AdminUser[], analytics?: AdminAnalytics, companies?: CompanyWithScore[], tenantSettings?: any }) {
  const { t, locale } = useI18n();
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);
  const [previewCompany, setPreviewCompany] = useState<CompanyWithScore | null>(null);
  const isAr = locale === 'ar';

  const consultantName = tenantSettings?.consultantName || 'ESGwise Consultant';
  const brandName = tenantSettings?.brandName || 'ESGwise';
  const primaryColor = tenantSettings?.primaryColor || '#0f766e';
  const logoUrl = tenantSettings?.logoUrl || null;
  const introText = tenantSettings?.introText || 'This advisory report has been prepared to provide a comprehensive assessment of your organization\'s Environmental, Social, and Governance (ESG) performance. Our analysis identifies key strengths, areas for improvement, and actionable recommendations.';
  const closingText = tenantSettings?.closingText || 'We recommend scheduling a follow-up consultation to develop a detailed implementation timeline. Re-assess in 6 months to measure progress.';

  const handleToggleAdmin = async (userId: string, currentIsAdmin: number) => {
    setIsProcessing(userId);
    setError(null);
    try {
      const makeAdmin = currentIsAdmin === 0;
      const res = await toggleAdminStatus(userId, makeAdmin);
      if (res.success) {
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, is_admin: makeAdmin ? 1 : 0, role: makeAdmin ? 'owner' : 'member' } 
            : u
        ));
      } else {
        setError(res.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المستخدم؟' : 'Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    setIsProcessing(userId + '-delete');
    setError(null);
    try {
      const res = await removeUser(userId);
      if (res.success) {
        setUsers(users.filter(u => u.id !== userId));
      } else {
        setError(res.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat(isAr ? 'ar-JO' : 'en-US', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(date);
  };

  const ratingBg = (r: string | null) => {
    if (!r) return '#9ca3af';
    if (r === 'AAA' || r === 'AA') return '#10b981';
    if (r === 'A' || r === 'BBB') return '#0ea5e9';
    if (r === 'BB' || r === 'B') return '#f59e0b';
    return '#ef4444';
  };

  const handleExport = async (companyId: string, format: 'pdf' | 'docx') => {
    setExporting(`${companyId}-${format}`);
    try {
      const endpoint = format === 'pdf' ? '/api/reports/advisory' : '/api/reports/advisory-docx';
      
      const payload = { 
        companyId 
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const company = companies.find(c => c.id === companyId);
      const safeName = (company?.name || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
      const a = document.createElement('a');
      a.href = url;
      a.download = `ESG_Advisory_${safeName}.${format === 'pdf' ? 'pdf' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  const openPreview = (c: CompanyWithScore) => {
    setPreviewCompany(c);
  };

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.header}>
        <h1>{isAr ? 'إدارة المستشار (لوحة التحكم)' : 'Consultant Administration'}</h1>
        <p className={styles.subtitle} style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          {isAr 
            ? 'احصل على رؤى شاملة لعملائك لتقديم توجيهات استراتيجية وتحسين أداء ESG.' 
            : 'Gain comprehensive insights into your clients to provide strategic guidance and improve ESG performance.'}
        </p>
      </div>

      {analytics && (
        <>
          <div className={styles.analyticsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Building2 size={24} /></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{isAr ? 'إجمالي الشركات المستضافة' : 'Total Hosted Companies'}</span>
                <span className={styles.statValue}>{analytics.totalCompanies}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><Users size={24} /></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{isAr ? 'المستخدمين النشطين' : 'Active Users'}</span>
                <span className={styles.statValue}>{analytics.totalUsers}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><FileText size={24} /></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{isAr ? 'إجمالي التقييمات الجارية' : 'Total Ongoing Assessments'}</span>
                <span className={styles.statValue}>{analytics.assessments.total}</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><ShieldCheck size={24} /></div>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>{isAr ? 'الشهادات المُصدرة' : 'Certificates Issued'}</span>
                <span className={styles.statValue} style={{ color: 'var(--color-success)' }}>{analytics.totalCertificates}</span>
              </div>
            </div>
          </div>

          <div className={styles.chartsGrid}>
            <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
              <h3><Activity size={20} /> {isAr ? 'تحليل أداء شبكة العملاء (متوسط E, S, G)' : 'Client Network Performance (Avg ESG)'}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                {isAr ? 'استخدم هذه البيانات لتحديد نقاط ضعف العملاء وبناء استراتيجيات مخصصة.' : 'Use this data to identify client weaknesses and build tailored strategies.'}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className={styles.scoreBox} style={{ flex: 1, padding: '1.5rem', background: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>{analytics.averageScores.overall}%</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{isAr ? 'المتوسط الكلي' : 'Overall Average'}</div>
                </div>
                <div className={styles.scoreBox} style={{ flex: 1, padding: '1.5rem', background: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>{analytics.averageScores.env}%</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{isAr ? 'البيئة (E)' : 'Environment (E)'}</div>
                </div>
                <div className={styles.scoreBox} style={{ flex: 1, padding: '1.5rem', background: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>{analytics.averageScores.soc}%</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{isAr ? 'المجتمع (S)' : 'Social (S)'}</div>
                </div>
                <div className={styles.scoreBox} style={{ flex: 1, padding: '1.5rem', background: 'var(--color-background-alt)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#8b5cf6' }}>{analytics.averageScores.gov}%</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{isAr ? 'الحوكمة (G)' : 'Governance (G)'}</div>
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3><CheckCircle size={20} /> {isAr ? 'تقدم التقييمات' : 'Assessment Progress'}</h3>
              
              <div className={styles.progressWrapper}>
                <div className={styles.progressLabel}>
                  <span>{isAr ? 'مكتملة ومُصدقة' : 'Completed & Certified'}</span>
                  <span>{analytics.assessments.completed}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${analytics.assessments.total > 0 ? (analytics.assessments.completed / analytics.assessments.total) * 100 : 0}%`, backgroundColor: 'var(--color-success)' }}
                  />
                </div>
              </div>

              <div className={styles.progressWrapper}>
                <div className={styles.progressLabel}>
                  <span>{isAr ? 'مسودات (قيد التنفيذ)' : 'Drafts (In Progress)'}</span>
                  <span>{analytics.assessments.draft}</span>
                </div>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${analytics.assessments.total > 0 ? (analytics.assessments.draft / analytics.assessments.total) * 100 : 0}%`, backgroundColor: 'var(--color-warning)' }}
                  />
                </div>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3><Building2 size={20} /> {isAr ? 'توزيع القطاعات والأحجام' : 'Sectors & Sizes'}</h3>
              <div className={styles.sectorList} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{isAr ? 'القطاعات:' : 'Sectors:'}</h4>
                {analytics.sectors.length > 0 ? (
                  analytics.sectors.map(sector => (
                    <div key={sector.name} className={styles.sectorItem}>
                      <span className={styles.sectorName}>{sector.name}</span>
                      <span className={styles.sectorCount}>{sector.count}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {isAr ? 'لا توجد بيانات قطاعات بعد' : 'No sector data yet'}
                  </div>
                )}
              </div>
              <div className={styles.sectorList}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>{isAr ? 'أحجام الشركات:' : 'Company Sizes:'}</h4>
                {analytics.sizes.length > 0 ? (
                  analytics.sizes.map(size => (
                    <div key={size.name} className={styles.sectorItem}>
                      <span className={styles.sectorName}>{size.name}</span>
                      <span className={styles.sectorCount}>{size.count}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {isAr ? 'لا توجد بيانات أحجام بعد' : 'No size data yet'}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.card} style={{ marginTop: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} />
              {isAr ? 'أحدث التقييمات للعملاء' : 'Recent Client Assessments'}
            </h3>
            <div className={styles.tableContainer}>
              <table className={styles.usersTable} dir={isAr ? 'rtl' : 'ltr'}>
                <thead>
                  <tr>
                    <th>{isAr ? 'الشركة' : 'Company'}</th>
                    <th>{isAr ? 'التقييم' : 'Assessment'}</th>
                    <th>{isAr ? 'الحالة' : 'Status'}</th>
                    <th>{isAr ? 'التقدم' : 'Progress'}</th>
                    <th>{isAr ? 'آخر تحديث' : 'Last Updated'}</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentAssessments.map(assessment => (
                    <tr key={assessment.id}>
                      <td style={{ fontWeight: 500 }}>{assessment.company}</td>
                      <td>{assessment.title}</td>
                      <td>
                        <span className={styles.roleBadge} style={{
                          backgroundColor: assessment.status === 'certified' ? 'rgba(16, 185, 129, 0.1)' : 
                                         assessment.status === 'completed' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                          color: assessment.status === 'certified' ? '#10b981' : 
                                 assessment.status === 'completed' ? '#3b82f6' : '#f59e0b',
                        }}>
                          {assessment.status.charAt(0).toUpperCase() + assessment.status.slice(1)}
                        </span>
                      </td>
                      <td>{assessment.progress}%</td>
                      <td>{formatDate(assessment.date)}</td>
                    </tr>
                  ))}
                  {analytics.recentAssessments.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-text-muted)' }}>
                        {isAr ? 'لا توجد نشاطات حديثة' : 'No recent activities'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ───── Client Portfolio & Advisory Reports ───── */}
      {companies.length > 0 && (
        <div className={styles.card} style={{ marginTop: '2rem' }}>
          <div className={styles.advisoryHeader}>
            <h3>
              <FileDown size={20} />
              {isAr ? 'محفظة العملاء وتقارير الاستشارات' : 'Client Portfolio & Advisory Reports'}
            </h3>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.usersTable} dir={isAr ? 'rtl' : 'ltr'}>
              <thead>
                <tr>
                  <th>{isAr ? 'الشركة' : 'Company'}</th>
                  <th>{isAr ? 'القطاع' : 'Sector'}</th>
                  <th>{isAr ? 'النتيجة' : 'Score'}</th>
                  <th>{isAr ? 'التصنيف' : 'Rating'}</th>
                  <th style={{ textAlign: 'center' }}>{isAr ? 'البيئة' : 'E'}</th>
                  <th style={{ textAlign: 'center' }}>{isAr ? 'المجتمع' : 'S'}</th>
                  <th style={{ textAlign: 'center' }}>{isAr ? 'الحوكمة' : 'G'}</th>
                  <th>{isAr ? 'تصدير تقرير' : 'Export Report'}</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{isAr ? (c.nameAr || c.name) : c.name}</td>
                    <td style={{ textTransform: 'capitalize' }}>{c.sector}</td>
                    <td className={styles.scoreCell} style={{ color: c.hasScore ? ratingBg(c.rating) : '#9ca3af' }}>
                      {c.hasScore ? `${c.score}%` : '—'}
                    </td>
                    <td>
                      {c.rating ? (
                        <span className={styles.ratingBadgeInline} style={{ backgroundColor: ratingBg(c.rating) }}>{c.rating}</span>
                      ) : '—'}
                    </td>
                    <td style={{ textAlign: 'center', color: '#10b981', fontWeight: 500 }}>{c.hasScore ? c.envScore : '—'}</td>
                    <td style={{ textAlign: 'center', color: '#3b82f6', fontWeight: 500 }}>{c.hasScore ? c.socScore : '—'}</td>
                    <td style={{ textAlign: 'center', color: '#8b5cf6', fontWeight: 500 }}>{c.hasScore ? c.govScore : '—'}</td>
                    <td>
                      {c.hasScore ? (
                        <div className={styles.exportBtns}>
                          <button
                            className={`${styles.exportBtn} ${styles.exportBtnPreview}`}
                            onClick={() => openPreview(c)}
                            title="Preview & Export"
                            style={{ padding: '8px 16px', fontWeight: 600, width: '100%', justifyContent: 'center' }}
                          >
                            <FileDown size={14} /> {isAr ? 'إنشاء التقرير' : 'Generate Report'}
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', display: 'block', textAlign: 'center' }}>
                          {isAr ? 'لا تقييم' : 'No score'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className={styles.card} style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={20} />
          {isAr ? 'إدارة حسابات المنصة' : 'Platform User Accounts'}
        </h3>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        <div className={styles.tableContainer}>
          <table className={styles.usersTable} dir={isAr ? 'rtl' : 'ltr'}>
            <thead>
              <tr>
                <th>{isAr ? 'المستخدم' : 'User'}</th>
                <th>{isAr ? 'الشركة' : 'Company'}</th>
                <th>{isAr ? 'الدور' : 'Role'}</th>
                <th>{isAr ? 'تاريخ الانضمام' : 'Joined'}</th>
                <th>{isAr ? 'الإجراءات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userInfo}>
                      <div className={styles.avatar}>
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className={styles.userDetails}>
                        <span className={styles.userName}>{user.name}</span>
                        <span className={styles.userEmail}>{user.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={styles.companyName}>{user.company_name || '-'}</span>
                  </td>
                  <td>
                    <span className={`${styles.roleBadge} ${user.is_admin ? styles.roleAdmin : styles.roleMember}`}>
                      {user.is_admin 
                        ? (isAr ? 'مسؤول' : 'Admin') 
                        : (isAr ? 'عضو' : 'Member')
                      }
                    </span>
                  </td>
                  <td>
                    <span className={styles.date}>{formatDate(user.created_at)}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        className={`btn btn-sm ${styles.btnAction} ${user.is_admin ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => handleToggleAdmin(user.id, user.is_admin)}
                        disabled={isProcessing === user.id}
                        title={user.is_admin ? (isAr ? 'إلغاء الصلاحيات' : 'Revoke Admin') : (isAr ? 'ترقية لمسؤول' : 'Make Admin')}
                      >
                        {user.is_admin ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                        <span>{user.is_admin ? (isAr ? 'إلغاء' : 'Revoke') : (isAr ? 'ترقية' : 'Promote')}</span>
                      </button>
                      
                      <button 
                        className={`btn btn-ghost btn-icon btn-sm ${styles.btnAction}`}
                        style={{ color: 'var(--color-danger)' }}
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isProcessing === user.id + '-delete'}
                        title={isAr ? 'حذف المستخدم' : 'Delete User'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                    {isAr ? 'لا يوجد مستخدمين' : 'No users found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ───── Editable Report Preview Modal ───── */}
      {previewCompany && (
        <div className={styles.previewOverlay} onClick={() => setPreviewCompany(null)}>
          <div className={styles.previewModal} onClick={e => e.stopPropagation()}>
            <div className={styles.previewToolbar}>
              <h3><Eye size={18} /> {isAr ? 'معاينة التقرير الاستشاري' : 'Advisory Report Preview'}</h3>
              <div className={styles.previewActions}>
                <button
                  className={`${styles.exportBtn} ${styles.exportBtnPdf}`}
                  onClick={() => { handleExport(previewCompany.id, 'pdf'); }}
                  disabled={exporting === `${previewCompany.id}-pdf`}
                >
                  <Download size={12} /> PDF
                </button>
                <button
                  className={`${styles.exportBtn} ${styles.exportBtnDocx}`}
                  onClick={() => { handleExport(previewCompany.id, 'docx'); }}
                  disabled={exporting === `${previewCompany.id}-docx`}
                >
                  <Download size={12} /> DOCX
                </button>
                <button
                  className={styles.exportBtn}
                  onClick={() => setPreviewCompany(null)}
                  style={{ background: '#f3f4f6', color: '#6b7280' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className={styles.previewContent}>
              {/* Cover */}
              <div className={styles.reportCover} style={{ borderColor: primaryColor }}>
                {logoUrl && <img src={logoUrl} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 8 }} />}
                <h1 style={{ color: primaryColor }}>{brandName}</h1>
                <h2>ESG Advisory Report</h2>
                <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0' }}>
                  <strong>{isAr ? (previewCompany.nameAr || previewCompany.name) : previewCompany.name}</strong>
                  {' · '}{previewCompany.sector} · {previewCompany.country}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  Prepared by {consultantName} · {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Introduction — read-only */}
              <div className={styles.reportSection}>
                <h3 style={{ borderColor: primaryColor, color: primaryColor }}>📋 Introduction</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>
                  {introText}
                </p>
              </div>

              {/* ESG Scores */}
              <div className={styles.reportSection}>
                <h3 style={{ borderColor: primaryColor, color: primaryColor }}>📊 ESG Performance Summary</h3>
                <div className={styles.reportScoreGrid}>
                  <div className={styles.reportScoreCard}>
                    <div className="scoreValue" style={{ color: primaryColor, fontSize: '1.5rem', fontWeight: 700 }}>{previewCompany.score || 0}%</div>
                    <div className="scoreLabel" style={{ fontSize: '0.75rem', color: '#6b7280' }}>Overall</div>
                  </div>
                  <div className={styles.reportScoreCard}>
                    <div className="scoreValue" style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 700 }}>{previewCompany.envScore}</div>
                    <div className="scoreLabel" style={{ fontSize: '0.75rem', color: '#6b7280' }}>Environment</div>
                  </div>
                  <div className={styles.reportScoreCard}>
                    <div className="scoreValue" style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: 700 }}>{previewCompany.socScore}</div>
                    <div className="scoreLabel" style={{ fontSize: '0.75rem', color: '#6b7280' }}>Social</div>
                  </div>
                  <div className={styles.reportScoreCard}>
                    <div className="scoreValue" style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: 700 }}>{previewCompany.govScore}</div>
                    <div className="scoreLabel" style={{ fontSize: '0.75rem', color: '#6b7280' }}>Governance</div>
                  </div>
                </div>
                <p style={{ textAlign: 'center', fontSize: '0.9rem' }}>
                  Rating: <strong style={{ color: primaryColor, fontSize: '1.1rem' }}>{previewCompany.rating || 'N/A'}</strong>
                </p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className={styles.reportSection}>
                <h3 style={{ borderColor: '#10b981', color: '#10b981' }}>✅ Key Strengths</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                  Identified from the assessment data for this company.
                </p>
              </div>

              <div className={styles.reportSection}>
                <h3 style={{ borderColor: '#ef4444', color: '#ef4444' }}>⚠️ Areas for Improvement</h3>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', fontStyle: 'italic' }}>
                  Priority areas requiring attention for ESG rating improvement.
                </p>
              </div>

              {/* Closing — read-only */}
              <div className={styles.reportSection}>
                <h3 style={{ borderColor: primaryColor, color: primaryColor }}>🎯 Next Steps & Recommendations</h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#374151', whiteSpace: 'pre-wrap' }}>
                  {closingText}
                </p>
              </div>

              {/* Footer */}
              <div style={{ textAlign: 'center', padding: '1.5rem 0 0', borderTop: '1px solid #e5e7eb', marginTop: '1rem' }}>
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontStyle: 'italic' }}>
                  © {new Date().getFullYear()} {brandName}. This report has been prepared by {consultantName}.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
