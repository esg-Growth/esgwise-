'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { Session } from '@/lib/session';
import {
  Users, Plus, Building2, ArrowRight, Search, Mail, Globe, Shield,
  BarChart3, ClipboardList, ChevronRight, AlertCircle, CheckCircle2,
  Clock, Briefcase, Copy, ExternalLink
} from 'lucide-react';
import styles from './clients.module.css';

interface Props {
  session: Session;
  initialClients: any[];
}

export function ClientsManager({ session, initialClients }: Props) {
  const { locale } = useI18n();
  const router = useRouter();
  const isAr = locale === 'ar';

  const [clients] = useState(initialClients);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '', name_ar: '', sector: 'agriculture', country: 'Jordan', size: 'small', data_mode: 'reporter_managed'
  });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const filtered = clients.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.name_ar?.includes(search)
  );

  const handleAddClient = async () => {
    setAddLoading(true);
    setAddError('');
    try {
      const res = await fetch('/api/reporter/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newClient, reporterId: session.reporterId || session.userId }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setShowAddModal(false);
      router.refresh();
    } catch (e: any) {
      setAddError(e.message);
    } finally {
      setAddLoading(false);
    }
  };

  const handleSwitchTo = async (companyId: string) => {
    try {
      const { useSession } = await import('next-auth/react');
      // For server-side switching, redirect with query param
      router.push(`/dashboard?switchCompany=${companyId}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyInvite = async (companyId: string) => {
    try {
      const res = await fetch('/api/reporter/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });
      const data = await res.json();
      if (data.link) {
        await navigator.clipboard.writeText(data.link);
        setCopiedLink(companyId);
        setTimeout(() => setCopiedLink(null), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />;
      case 'in_progress': return <Clock size={16} style={{ color: 'var(--color-warning)' }} />;
      default: return <AlertCircle size={16} style={{ color: 'var(--color-text-muted)' }} />;
    }
  };

  const getDataModeBadge = (mode: string) => {
    if (mode === 'self_entry') {
      return <span className={styles.badgeSelf}>{isAr ? 'إدخال ذاتي' : 'Self-Entry'}</span>;
    }
    return <span className={styles.badgeManaged}>{isAr ? 'إدارة مستشار' : 'Reporter-Managed'}</span>;
  };

  return (
    <div className={styles.clients}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>
            <Users size={28} style={{ color: 'var(--color-primary)' }} />
            {isAr ? 'إدارة العملاء' : 'Client Management'}
          </h1>
          <p className={styles.subtitle}>
            {isAr
              ? `لديك ${clients.length} عميل مسجل في محفظتك`
              : `You have ${clients.length} client${clients.length !== 1 ? 's' : ''} in your portfolio`}
          </p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          {isAr ? 'إضافة عميل' : 'Add Client'}
        </button>
      </div>

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={18} className={styles.searchIcon} />
        <input
          className="form-input"
          placeholder={isAr ? 'بحث عن عميل...' : 'Search clients...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>

      {/* Summary Cards */}
      <div className={styles.summaryGrid}>
        <div className="card">
          <div className={styles.summaryIcon} style={{ background: 'var(--color-primary-lightest)', color: 'var(--color-primary)' }}>
            <Building2 size={24} />
          </div>
          <div className={styles.summaryValue}>{clients.length}</div>
          <div className={styles.summaryLabel}>{isAr ? 'إجمالي العملاء' : 'Total Clients'}</div>
        </div>
        <div className="card">
          <div className={styles.summaryIcon} style={{ background: 'var(--color-env-bg)', color: 'var(--color-env)' }}>
            <ClipboardList size={24} />
          </div>
          <div className={styles.summaryValue}>{clients.filter(c => c.latestAssessment?.status === 'in_progress').length}</div>
          <div className={styles.summaryLabel}>{isAr ? 'تقييمات جارية' : 'Active Assessments'}</div>
        </div>
        <div className="card">
          <div className={styles.summaryIcon} style={{ background: 'var(--color-soc-bg)', color: 'var(--color-soc)' }}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.summaryValue}>{clients.filter(c => c.latestAssessment?.status === 'completed').length}</div>
          <div className={styles.summaryLabel}>{isAr ? 'تقييمات مكتملة' : 'Completed'}</div>
        </div>
        <div className="card">
          <div className={styles.summaryIcon} style={{ background: 'var(--color-gov-bg)', color: 'var(--color-gov)' }}>
            <Shield size={24} />
          </div>
          <div className={styles.summaryValue}>{clients.filter(c => c.data_mode === 'self_entry').length}</div>
          <div className={styles.summaryLabel}>{isAr ? 'إدخال ذاتي' : 'Self-Entry'}</div>
        </div>
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Briefcase size={48} style={{ color: 'var(--color-text-muted)' }} />
          <h3>{isAr ? 'لا يوجد عملاء بعد' : 'No clients yet'}</h3>
          <p>{isAr ? 'أضف عميلك الأول لبدء إدارة تقييمات ESG' : 'Add your first client to start managing ESG assessments'}</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />{isAr ? 'إضافة عميل' : 'Add Client'}
          </button>
        </div>
      ) : (
        <div className={styles.clientGrid}>
          {filtered.map(client => (
            <div key={client.id} className={`card ${styles.clientCard}`}>
              <div className={styles.clientHeader}>
                <div className={styles.clientAvatar}>
                  {client.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div className={styles.clientInfo}>
                  <h3>{client.name}</h3>
                  {client.name_ar && <p className={styles.clientNameAr}>{client.name_ar}</p>}
                </div>
                {getDataModeBadge(client.data_mode)}
              </div>

              <div className={styles.clientMeta}>
                <span><Globe size={14} /> {client.country || 'Jordan'}</span>
                <span><Building2 size={14} /> {client.sector}</span>
              </div>

              {client.latestAssessment && (
                <div className={styles.assessmentRow}>
                  {getStatusIcon(client.latestAssessment.status)}
                  <span>{client.latestAssessment.title}</span>
                  <span className={styles.assessmentProgress}>{client.latestAssessment.progress}%</span>
                </div>
              )}

              <div className={styles.clientActions}>
                <button className="btn btn-primary btn-sm" onClick={() => handleSwitchTo(client.id)}>
                  <ArrowRight size={14} />{isAr ? 'فتح' : 'Open'}
                </button>
                {client.data_mode === 'self_entry' && (
                  <button className="btn btn-secondary btn-sm" onClick={() => handleCopyInvite(client.id)}>
                    {copiedLink === client.id ? <><CheckCircle2 size={14} />{isAr ? 'تم النسخ!' : 'Copied!'}</> : <><Copy size={14} />{isAr ? 'رابط الدعوة' : 'Invite Link'}</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>
              <Plus size={24} style={{ color: 'var(--color-primary)' }} />
              {isAr ? 'إضافة عميل جديد' : 'Add New Client'}
            </h2>

            {addError && <div className={styles.error}>{addError}</div>}

            <div className="form-group">
              <label className="form-label">{isAr ? 'اسم الشركة (EN)' : 'Company Name (EN)'}</label>
              <input className="form-input" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })} placeholder="Company name" />
            </div>

            <div className="form-group">
              <label className="form-label">{isAr ? 'اسم الشركة (AR)' : 'Company Name (AR)'}</label>
              <input className="form-input" value={newClient.name_ar} onChange={e => setNewClient({ ...newClient, name_ar: e.target.value })} placeholder="اسم الشركة" dir="rtl" />
            </div>

            <div className="form-group">
              <label className="form-label">{isAr ? 'القطاع' : 'Sector'}</label>
              <select className="form-input form-select" value={newClient.sector} onChange={e => setNewClient({ ...newClient, sector: e.target.value })}>
                <option value="agriculture">Agriculture</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="food">Food & Beverage</option>
                <option value="energy">Energy</option>
                <option value="construction">Construction</option>
                <option value="waste">Waste Management</option>
                <option value="logistics">Logistics</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{isAr ? 'نظام إدخال البيانات' : 'Data Entry Mode'}</label>
              <div className={styles.modeSelector}>
                <div
                  className={`${styles.modeOption} ${newClient.data_mode === 'reporter_managed' ? styles.modeActive : ''}`}
                  onClick={() => setNewClient({ ...newClient, data_mode: 'reporter_managed' })}
                >
                  <Briefcase size={20} />
                  <div>
                    <strong>{isAr ? 'إدارة المستشار' : 'Reporter-Managed'}</strong>
                    <p>{isAr ? 'أنت تدخل البيانات' : 'You enter the data'}</p>
                  </div>
                </div>
                <div
                  className={`${styles.modeOption} ${newClient.data_mode === 'self_entry' ? styles.modeActive : ''}`}
                  onClick={() => setNewClient({ ...newClient, data_mode: 'self_entry' })}
                >
                  <ExternalLink size={20} />
                  <div>
                    <strong>{isAr ? 'إدخال ذاتي' : 'Self-Entry'}</strong>
                    <p>{isAr ? 'العميل يدخل بياناته' : 'Client enters their own data'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>{isAr ? 'إلغاء' : 'Cancel'}</button>
              <button className="btn btn-primary" onClick={handleAddClient} disabled={addLoading || !newClient.name}>
                {addLoading ? <span className="spinner" /> : (isAr ? 'إضافة' : 'Add Client')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
