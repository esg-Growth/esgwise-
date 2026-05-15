'use client';

import { useState, useRef, useEffect } from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/components/providers';
import { User, Building, Shield, Globe, Moon, Sun, Lock, FileText, Palette, Type, Image, Save, CheckCircle, Layout, Briefcase, PenTool, Hash, AlignLeft, Info, Loader2, Users, Plus, Eye, EyeOff } from 'lucide-react';
import styles from './settings.module.css';
import { saveUserProfile, saveTenantSettings, addCompanyAdminUser, updatePasswordAction } from './actions';

interface SettingsClientProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  company: {
    name: string;
    id: string;
  };
  isAdmin?: boolean;
  initialTenantSettings?: any;
  teamMembers?: any[];
}

export function SettingsClient({ user, company, isAdmin, initialTenantSettings, teamMembers = [] }: SettingsClientProps) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const isAr = locale === 'ar';

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['profile', 'preferences', 'security', 'team', 'branding'];
    
    if (hash && validTabs.includes(hash)) {
      if ((hash === 'team' || hash === 'branding') && !isAdmin) {
        return;
      }
      setActiveTab(hash);
    } else {
      const stored = localStorage.getItem('settingsActiveTab');
      if (stored && validTabs.includes(stored)) {
        if ((stored === 'team' || stored === 'branding') && !isAdmin) {
          return;
        }
        setActiveTab(stored);
        window.history.replaceState(null, '', '#' + stored);
      }
    }
  }, [isAdmin]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    window.history.replaceState(null, '', '#' + tabId);
    localStorage.setItem('settingsActiveTab', tabId);
  };

  // ── Profile state ──
  const [profileName, setProfileName] = useState(user.name);
  const [companyName, setCompanyName] = useState(company.name);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [newAdminRole, setNewAdminRole] = useState('member'); // 'member' or 'admin'
  const [adminAddError, setAdminAddError] = useState('');
  const [adminAddSuccess, setAdminAddSuccess] = useState('');

  // ── Security state ──
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // ── Report Branding state (admin only) ──
  const headerData = initialTenantSettings?.report_header_text ? JSON.parse(initialTenantSettings.report_header_text) : {};
  const footerData = initialTenantSettings?.report_footer_text ? JSON.parse(initialTenantSettings.report_footer_text) : {};

  const [consultantName, setConsultantName] = useState(headerData.consultantName || 'ESGwise Consultant');
  const [brandName, setBrandName] = useState(headerData.brandName || 'ESGwise');
  const [primaryColor, setPrimaryColor] = useState(initialTenantSettings?.primary_color || '#0f766e');
  const [logoUrl, setLogoUrl] = useState<string | null>(initialTenantSettings?.logo_base64 || null);
  const [headerTagline, setHeaderTagline] = useState(headerData.headerTagline || 'AI-Powered ESG Advisory Services');
  const [footerText, setFooterText] = useState(footerData.footerText || 'This report is confidential and intended solely for the use of the recipient organization.');
  const [footerDisclaimer, setFooterDisclaimer] = useState(footerData.footerDisclaimer || '© 2026 ESGwise. All rights reserved. The ESG scores and ratings herein are advisory and do not constitute legal or financial advice.');
  const [introText, setIntroText] = useState(headerData.introText || 'This advisory report has been prepared to provide a comprehensive assessment of your organization\'s Environmental, Social, and Governance (ESG) performance. Our analysis identifies key strengths, areas for improvement, and actionable recommendations.');
  const [closingText, setClosingText] = useState(footerData.closingText || 'We recommend scheduling a follow-up consultation to develop a detailed implementation timeline. Re-assess in 6 months to measure progress.');
  
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSaveBranding = async () => {
    setIsSavingBranding(true);
    await saveTenantSettings({
      primary_color: primaryColor,
      secondary_color: '#1e293b',
      logo_base64: logoUrl,
      report_header_text: JSON.stringify({ consultantName, brandName, headerTagline, introText }),
      report_footer_text: JSON.stringify({ footerText, footerDisclaimer, closingText }),
    });
    setIsSavingBranding(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    await saveUserProfile(profileName, company.id, companyName);
    setIsSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAddError('');
    setAdminAddSuccess('');
    setIsAddingAdmin(true);

    if (!newAdminName || !newAdminEmail || !newAdminPassword) {
      setAdminAddError(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all fields');
      setIsAddingAdmin(false);
      return;
    }

    const res = await addCompanyAdminUser(newAdminName, newAdminEmail, newAdminPassword, newAdminRole === 'admin');
    setIsAddingAdmin(false);

    if (res.success) {
      setAdminAddSuccess(isAr ? 'تمت إضافة المستخدم بنجاح' : 'User added successfully');
      setNewAdminName('');
      setNewAdminEmail('');
      setNewAdminPassword('');
      setNewAdminRole('member');
      setTimeout(() => setAdminAddSuccess(''), 3000);
    } else {
      setAdminAddError(res.error || 'Failed to add user');
    }
  };

  const handleSavePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPasswordError(isAr ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError(isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    setIsSavingPassword(true);
    const res = await updatePasswordAction(newPassword);
    setIsSavingPassword(false);

    if (res.success) {
      setPasswordSuccess(isAr ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess('');
      }, 2000);
    } else {
      setPasswordError(res.error || 'Failed to update password');
    }
  };


  const tabs = [
    { id: 'profile', label: isAr ? 'الملف الشخصي' : 'Profile', icon: User },
    { id: 'preferences', label: isAr ? 'التفضيلات' : 'Preferences', icon: Globe },
    { id: 'security', label: isAr ? 'الأمان' : 'Security', icon: Shield },
    ...(isAdmin ? [
      { id: 'team', label: isAr ? 'الفريق' : 'Team', icon: Users },
      { id: 'branding', label: isAr ? 'هوية التقارير' : 'Report Branding', icon: FileText }
    ] : []),
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar / Tabs */}
      <div className={styles.sidebar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.card}>
          {activeTab === 'profile' && (
            <div className={styles.premiumCard}>
              <div className={styles.brandingHeader} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ marginBottom: '0.25rem' }}>{isAr ? 'المعلومات الشخصية' : 'Profile Information'}</h2>
                  <p className={styles.helperText} style={{ marginTop: 0 }}>
                    {isAr ? 'قم بتحديث تفاصيل حسابك ومعلومات الشركة.' : 'Update your account details and company information.'}
                  </p>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveProfile} 
                  disabled={isSavingProfile}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: 'fit-content' }}
                >
                  {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : 
                   profileSaved ? <><CheckCircle size={16} /> {isAr ? 'تم الحفظ' : 'Saved!'}</> : 
                   <><Save size={16} /> {isAr ? 'حفظ التغييرات' : 'Save Changes'}</>}
                </button>
              </div>
              
              <div className={styles.profileHeader}>
                <div className={styles.avatarWrapper}>
                  <div className={styles.avatar}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className={styles.avatarStatus}></div>
                </div>
                <div className={styles.profileInfo}>
                  <h3>{user.name}</h3>
                  <p className={styles.roleBadge}>{user.role}</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.premiumInputGroup}>
                  <label htmlFor="fullName" className={styles.premiumLabel}>{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                  <div className={styles.inputWrapper}>
                    <User size={18} className={styles.inputIcon} />
                    <input 
                      id="fullName" 
                      type="text" 
                      className={styles.premiumInput} 
                      value={profileName} 
                      onChange={e => setProfileName(e.target.value)} 
                    />
                  </div>
                </div>
                <div className={styles.premiumInputGroup}>
                  <label htmlFor="emailAddress" className={styles.premiumLabel}>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                  <div className={styles.inputWrapper}>
                    <Globe size={18} className={styles.inputIcon} />
                    <input id="emailAddress" type="email" className={`${styles.premiumInput} ${styles.disabledInput}`} defaultValue={user.email} disabled />
                  </div>
                </div>
                <div className={`${styles.premiumInputGroup} ${styles.fullWidth}`}>
                  <label htmlFor="companyName" className={styles.premiumLabel}>
                    {isAr ? 'الشركة' : 'Company'}
                  </label>
                  <div className={styles.inputWrapper}>
                    <Building size={18} className={styles.inputIcon} />
                    <input 
                      id="companyName" 
                      type="text" 
                      className={styles.premiumInput} 
                      value={companyName} 
                      onChange={e => setCompanyName(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <h2 className={styles.sectionTitle}>{isAr ? 'تفضيلات التطبيق' : 'App Preferences'}</h2>
              
              <div className={styles.preferencesGroup}>
                <label className={styles.premiumLabel}>{isAr ? 'اللغة' : 'Language'}</label>
                <div className={styles.buttonGroup}>
                  <button 
                    className={`btn ${!isAr ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setLocale('en')}
                  >
                    English
                  </button>
                  <button 
                    className={`btn ${isAr ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setLocale('ar')}
                  >
                    العربية
                  </button>
                </div>
              </div>

              <div className={styles.preferencesGroup}>
                <label className={styles.premiumLabel}>{isAr ? 'المظهر' : 'Theme'}</label>
                <div className={styles.buttonGroup}>
                  <button 
                    className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => theme !== 'light' && toggle()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Sun size={16} /> {isAr ? 'الوضع المضيء' : 'Light Mode'}
                  </button>
                  <button 
                    className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => theme !== 'dark' && toggle()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Moon size={16} /> {isAr ? 'الوضع المظلم' : 'Dark Mode'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className={styles.sectionTitle}>{isAr ? 'الأمان' : 'Security'}</h2>
              
              <div className={styles.securityCard}>
                <div className={styles.securityHeader}>
                  <Lock size={24} color="var(--color-text-muted)" />
                  <div>
                    <h4>{isAr ? 'كلمة المرور' : 'Password'}</h4>
                    <p>{isAr ? 'أنت تستخدم حالياً البريد الإلكتروني وكلمة المرور لتسجيل الدخول.' : 'You are currently using email and password to log in.'}</p>
                  </div>
                </div>
                
                {!isChangingPassword ? (
                  <button className="btn btn-outline" onClick={() => setIsChangingPassword(true)}>
                    {isAr ? 'تغيير كلمة المرور' : 'Change Password'}
                  </button>
                ) : (
                  <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                    <div className={styles.premiumInputGroup}>
                      <label className={styles.premiumLabel}>{isAr ? 'كلمة المرور الجديدة' : 'New Password'}</label>
                      <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input 
                          type={showNewPassword ? "text" : "password"} 
                          className={styles.premiumInput} 
                          value={newPassword} 
                          onChange={e => setNewPassword(e.target.value)} 
                          placeholder="••••••••"
                          style={{ paddingRight: '40px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className={styles.premiumInputGroup}>
                      <label className={styles.premiumLabel}>{isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                      <div className={styles.inputWrapper}>
                        <Lock size={18} className={styles.inputIcon} />
                        <input 
                          type={showConfirmPassword ? "text" : "password"} 
                          className={styles.premiumInput} 
                          value={confirmPassword} 
                          onChange={e => setConfirmPassword(e.target.value)} 
                          placeholder="••••••••"
                          style={{ paddingRight: '40px' }}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    
                    {passwordError && (
                      <div style={{ color: '#ef4444', fontSize: '0.875rem', gridColumn: '1 / -1' }}>{passwordError}</div>
                    )}
                    {passwordSuccess && (
                      <div style={{ color: '#10b981', fontSize: '0.875rem', gridColumn: '1 / -1' }}>{passwordSuccess}</div>
                    )}
                    
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                      <button 
                        className="btn btn-primary" 
                        onClick={handleSavePassword}
                        disabled={isSavingPassword}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {isAr ? 'حفظ كلمة المرور' : 'Save Password'}
                      </button>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => {
                          setIsChangingPassword(false);
                          setNewPassword('');
                          setConfirmPassword('');
                          setPasswordError('');
                          setShowNewPassword(false);
                          setShowConfirmPassword(false);
                        }}
                      >
                        {isAr ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Team Tab (Admin Only) ── */}
          {activeTab === 'team' && isAdmin && (
            <div>
              <div className={styles.brandingHeader}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ marginBottom: '0.25rem' }}>
                    {isAr ? 'إدارة الفريق' : 'Team Management'}
                  </h2>
                  <p className={styles.helperText} style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                    {isAr ? 'إدارة أعضاء فريق الشركة الخاص بك وإضافة مستخدمين أو مسؤولين جدد.' : 'Manage your company team members and add new users or administrators.'}
                  </p>
                </div>
              </div>

              <div className={styles.securityCard} style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                  {isAr ? 'إضافة مستخدم جديد' : 'Add New User'}
                </h3>
                <form onSubmit={handleAddAdmin} className={styles.formGrid}>
                  <div className={styles.premiumInputGroup}>
                    <label className={styles.premiumLabel}>{isAr ? 'الاسم' : 'Name'}</label>
                    <div className={styles.inputWrapper}>
                      <User size={18} className={styles.inputIcon} />
                      <input 
                        type="text" 
                        className={styles.premiumInput} 
                        value={newAdminName} 
                        onChange={e => setNewAdminName(e.target.value)} 
                        placeholder={isAr ? 'اسم المستخدم' : 'User Name'}
                      />
                    </div>
                  </div>
                  <div className={styles.premiumInputGroup}>
                    <label className={styles.premiumLabel}>{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
                    <div className={styles.inputWrapper}>
                      <Globe size={18} className={styles.inputIcon} />
                      <input 
                        type="email" 
                        className={styles.premiumInput} 
                        value={newAdminEmail} 
                        onChange={e => setNewAdminEmail(e.target.value)} 
                        placeholder="admin@example.com"
                      />
                    </div>
                  </div>
                  <div className={`${styles.premiumInputGroup} ${styles.fullWidth}`}>
                    <label className={styles.premiumLabel}>{isAr ? 'كلمة المرور المؤقتة' : 'Temporary Password'}</label>
                    <div className={styles.inputWrapper}>
                      <Lock size={18} className={styles.inputIcon} />
                      <input 
                        type={showAdminPassword ? "text" : "password"} 
                        className={styles.premiumInput} 
                        value={newAdminPassword} 
                        onChange={e => setNewAdminPassword(e.target.value)} 
                        placeholder="••••••••"
                        style={{ paddingRight: '40px' }}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className={`${styles.premiumInputGroup} ${styles.fullWidth}`}>
                    <label className={styles.premiumLabel}>{isAr ? 'الدور / الصلاحية' : 'User Role'}</label>
                    <div className={styles.inputWrapper}>
                      <Shield size={18} className={styles.inputIcon} />
                      <select 
                        className={styles.premiumInput} 
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value)}
                        style={{ paddingLeft: '40px', appearance: 'none' }}
                      >
                        <option value="member">{isAr ? 'عضو' : 'Member'}</option>
                        <option value="admin">{isAr ? 'مسؤول' : 'Administrator'}</option>
                      </select>
                      <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }}>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {adminAddError && (
                    <div style={{ color: '#ef4444', fontSize: '0.875rem', gridColumn: '1 / -1' }}>{adminAddError}</div>
                  )}
                  {adminAddSuccess && (
                    <div style={{ color: '#10b981', fontSize: '0.875rem', gridColumn: '1 / -1' }}>{adminAddSuccess}</div>
                  )}

                  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={isAddingAdmin}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isAddingAdmin ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {isAr ? 'إضافة مستخدم' : 'Add User'}
                    </button>
                  </div>
                </form>
              </div>

              <div className={styles.brandingSectionCard}>
                <div className={styles.brandingSectionLabel} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <Users size={18} /> {isAr ? 'أعضاء الفريق' : 'Team Members'}
                </div>
                
                {teamMembers.length === 0 ? (
                  <p className={styles.helperText}>{isAr ? 'لا يوجد أعضاء في الفريق حالياً.' : 'No team members found.'}</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {teamMembers.map((member: any) => (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-secondary)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div className={styles.avatar} style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                            {member.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{member.name || 'Unnamed User'}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{member.email}</div>
                          </div>
                        </div>
                        <div>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '0.75rem', 
                            fontWeight: 600,
                            background: member.is_admin === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                            color: member.is_admin === 1 ? '#10b981' : 'var(--color-text-muted)',
                            border: member.is_admin === 1 ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--color-border)'
                          }}>
                            {member.is_admin === 1 ? (isAr ? 'مسؤول' : 'Admin') : (isAr ? 'عضو' : 'Member')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Report Branding Tab (Admin Only) ── */}
          {activeTab === 'branding' && isAdmin && (
            <div>
              <div className={styles.brandingHeader}>
                <div>
                  <h2 className={styles.sectionTitle} style={{ marginBottom: '0.25rem' }}>
                    {isAr ? 'هوية التقارير الاستشارية' : 'Advisory Report Branding'}
                  </h2>
                  <p className={styles.helperText} style={{ marginTop: 0, marginBottom: '1.5rem' }}>
                    {isAr ? 'تخصيص رأس وتذييل التقارير المرسلة للشركات العملاء.' : 'Customize header & footer for client advisory reports.'}
                  </p>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveBranding} 
                  disabled={isSavingBranding}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', height: 'fit-content' }}
                >
                  {isSavingBranding ? <Loader2 size={16} className="animate-spin" /> : 
                   saved ? <><CheckCircle size={16} /> {isAr ? 'تم الحفظ' : 'Saved!'}</> : 
                   <><Save size={16} /> {isAr ? 'حفظ' : 'Save'}</>}
                </button>
              </div>

              {/* ── HEADER Section ── */}
              <div className={styles.brandingSectionCard}>
                <div className={styles.brandingSectionLabel}>
                  <Layout size={18} /> {isAr ? 'رأس التقرير (Header)' : 'Report Header'}
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.premiumInputGroup}>
                    <label className={styles.premiumLabel}>{isAr ? 'اسم العلامة التجارية' : 'Brand Name'}</label>
                    <div className={styles.inputWrapper}>
                      <Briefcase size={18} className={styles.inputIcon} />
                      <input className={styles.premiumInput} value={brandName} onChange={e => setBrandName(e.target.value)} placeholder="Acme Corp" />
                    </div>
                  </div>
                  <div className={styles.premiumInputGroup}>
                    <label className={styles.premiumLabel}>{isAr ? 'اسم المستشار' : 'Consultant Name'}</label>
                    <div className={styles.inputWrapper}>
                      <User size={18} className={styles.inputIcon} />
                      <input className={styles.premiumInput} value={consultantName} onChange={e => setConsultantName(e.target.value)} placeholder="John Doe" />
                    </div>
                  </div>
                  <div className={`\${styles.premiumInputGroup} \${styles.fullWidth}`}>
                    <label className={styles.premiumLabel}>{isAr ? 'شعار الهيدر' : 'Header Tagline'}</label>
                    <div className={styles.inputWrapper}>
                      <PenTool size={18} className={styles.inputIcon} />
                      <input className={styles.premiumInput} value={headerTagline} onChange={e => setHeaderTagline(e.target.value)} placeholder="e.g. AI-Powered ESG Advisory Services" />
                    </div>
                  </div>
                </div>

                <div className={styles.brandingRow}>
                  <div className={styles.premiumInputGroup} style={{ flex: 1 }}>
                    <label className={styles.premiumLabel}>{isAr ? 'اللون الأساسي' : 'Primary Color'}</label>
                    <div className={styles.colorInput}>
                      <div className={styles.colorSwatch}>
                        <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                      </div>
                      <div className={styles.inputWrapper} style={{ flex: 1 }}>
                        <Hash size={18} className={styles.inputIcon} />
                        <input className={styles.premiumInput} value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.premiumInputGroup} style={{ flex: 1 }}>
                    <label className={styles.premiumLabel}>{isAr ? 'الشعار (Logo)' : 'Logo'}</label>
                    <div className={styles.logoRow}>
                      <div className={styles.logoBox}>
                        {logoUrl ? <img src={logoUrl} alt="Logo" /> : <Image size={28} color="var(--color-text-muted)" />}
                      </div>
                      <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                      <button className="btn btn-outline" onClick={() => logoInputRef.current?.click()}>
                        {isAr ? 'تصفح الملفات' : 'Browse Files'}
                      </button>
                      {logoUrl && (
                        <button className="btn btn-ghost" onClick={() => setLogoUrl(null)} style={{ color: '#ef4444' }}>
                          {isAr ? 'إزالة' : 'Remove'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CONTENT Section ── */}
              <div className={styles.brandingSectionCard}>
                <div className={styles.brandingSectionLabel}>
                  <AlignLeft size={18} /> {isAr ? 'محتوى التقرير' : 'Report Content'}
                </div>
                <div className={styles.premiumInputGroup}>
                  <label className={styles.premiumLabel}>{isAr ? 'فقرة المقدمة' : 'Introduction Paragraph'}</label>
                  <textarea className={styles.premiumTextarea} rows={3} value={introText} onChange={e => setIntroText(e.target.value)} placeholder="Enter the introductory text for the report..." />
                </div>
                <div className={styles.premiumInputGroup} style={{ marginTop: '1.5rem' }}>
                  <label className={styles.premiumLabel}>{isAr ? 'فقرة الخاتمة / الخطوات التالية' : 'Closing / Next Steps'}</label>
                  <textarea className={styles.premiumTextarea} rows={2} value={closingText} onChange={e => setClosingText(e.target.value)} placeholder="Enter the closing remarks or next steps..." />
                </div>
              </div>

              {/* ── FOOTER Section ── */}
              <div className={styles.brandingSectionCard}>
                <div className={styles.brandingSectionLabel}>
                  <FileText size={18} /> {isAr ? 'تذييل التقرير (Footer)' : 'Report Footer'}
                </div>
                <div className={styles.premiumInputGroup}>
                  <label className={styles.premiumLabel}>{isAr ? 'نص السرية' : 'Confidentiality Notice'}</label>
                  <div className={styles.inputWrapper}>
                    <Shield size={18} className={styles.inputIcon} style={{ top: 16 }} />
                    <textarea className={`\${styles.premiumTextarea}`} rows={2} value={footerText} onChange={e => setFooterText(e.target.value)} style={{ paddingLeft: '44px', minHeight: 80 }} />
                  </div>
                </div>
                <div className={styles.premiumInputGroup} style={{ marginTop: '1.5rem' }}>
                  <label className={styles.premiumLabel}>{isAr ? 'إخلاء المسؤولية / حقوق النشر' : 'Disclaimer / Copyright'}</label>
                  <div className={styles.inputWrapper}>
                    <Info size={18} className={styles.inputIcon} style={{ top: 16 }} />
                    <textarea className={`\${styles.premiumTextarea}`} rows={2} value={footerDisclaimer} onChange={e => setFooterDisclaimer(e.target.value)} style={{ paddingLeft: '44px', minHeight: 80 }} />
                  </div>
                </div>
              </div>

              {/* ── Live Preview ── */}
              <div className={styles.brandingSectionCard} style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
                <div className={styles.brandingSectionLabel} style={{ marginBottom: '1rem' }}>
                  <Globe size={18} /> {isAr ? 'معاينة مباشرة' : 'Live Preview'}
                </div>
                <div className={styles.livePreviewWrapper}>
                  <div className={styles.livePreview}>
                    {/* Header */}
                    <div className={styles.lpHeader} style={{ borderBottomColor: primaryColor }}>
                      <div className={styles.lpHeaderLeft}>
                        {logoUrl && <img src={logoUrl} alt="logo" className={styles.lpLogo} />}
                        <div>
                          <div className={styles.lpBrand} style={{ color: primaryColor }}>{brandName}</div>
                          <div className={styles.lpTagline}>{headerTagline}</div>
                        </div>
                      </div>
                      <div className={styles.lpMeta}>
                        <span>Prepared by {consultantName}</span>
                        <span>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className={styles.lpBody}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#111827' }}>ESG Advisory Report</h3>
                      <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: 1.6 }}>{introText.substring(0, 200)}{introText.length > 200 ? '...' : ''}</p>
                      <div style={{ display: 'flex', gap: '1rem', margin: '1.25rem 0' }}>
                        {['Overall: 72%', 'E: 68', 'S: 75', 'G: 74'].map((s, i) => (
                          <span key={i} style={{ padding: '6px 12px', background: i === 0 ? `\${primaryColor}15` : '#f3f4f6', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: i === 0 ? primaryColor : '#374151', border: i === 0 ? `1px solid \${primaryColor}30` : '1px solid transparent' }}>{s}</span>
                        ))}
                      </div>
                      <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '8px', borderLeft: `4px solid \${primaryColor}` }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#111827' }}>Next Steps</h4>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>{closingText.substring(0, 150)}{closingText.length > 150 ? '...' : ''}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.lpFooter} style={{ borderTopColor: primaryColor }}>
                      <p>{footerText}</p>
                      <p>{footerDisclaimer}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
