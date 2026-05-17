'use client';

import { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/components/providers';
import { Session } from '@/lib/session';
import { useSession } from 'next-auth/react';
import {
  Leaf, LayoutDashboard, ClipboardList, BarChart3, Target, Map, FileText,
  Award, Bot, Settings, Shield, Menu, X, Globe, Sun, Moon, LogOut,
  ChevronLeft, Bell, User, Users, Briefcase, ChevronDown, Building2
} from 'lucide-react';
import styles from './shell.module.css';

interface Props {
  session: Session;
  children: ReactNode;
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'nav.dashboard' },
  { href: '/dashboard/assessment', icon: ClipboardList, label: 'nav.assessment' },
  { href: '/dashboard/analysis', icon: BarChart3, label: 'nav.analysis' },
  { href: '/dashboard/gaps', icon: Target, label: 'nav.gaps' },
  { href: '/dashboard/roadmap', icon: Map, label: 'nav.roadmap' },
  { href: '/dashboard/reports', icon: FileText, label: 'nav.reports' },
  { href: '/dashboard/certificate', icon: Award, label: 'nav.certificate' },
  { href: '/dashboard/assistant', icon: Bot, label: 'nav.assistant' },
];

const REPORTER_ITEMS = [
  { href: '/dashboard/clients', icon: Users, label: 'nav.clients' },
];

const ADMIN_ITEMS = [
  { href: '/dashboard/admin', icon: Shield, label: 'nav.admin' },
];

export function DashboardShell({ session, children }: Props) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { update } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [clientCompanies, setClientCompanies] = useState<any[]>([]);
  const [activeCompanyName, setActiveCompanyName] = useState<string | null>(null);
  const isAr = locale === 'ar';

  useEffect(() => {
    // Show onboarding for new non-demo users or first-time visitors
    const hasSeenOnboarding = localStorage.getItem('esgwise_onboarding_seen');
    if (!hasSeenOnboarding && !session.isDemo) {
      setShowOnboarding(true);
    }
  }, [session.isDemo]);

  const closeOnboarding = () => {
    localStorage.setItem('esgwise_onboarding_seen', 'true');
    setShowOnboarding(false);
  };

  // Load reporter's client companies for the switcher
  useEffect(() => {
    if (session.role === 'reporter') {
      fetch('/api/reporter/clients')
        .then(r => r.json())
        .then(data => {
          setClientCompanies(data.clients || []);
          // If there's an active company, find its name
          if (session.activeCompanyId) {
            const active = (data.clients || []).find((c: any) => c.id === session.activeCompanyId);
            setActiveCompanyName(active?.name || null);
          }
        })
        .catch(() => {});
    }
  }, [session.role, session.activeCompanyId]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleSwitchCompany = async (companyId: string, companyName: string) => {
    setActiveCompanyName(companyName);
    setCompanySwitcherOpen(false);
    // Update the NextAuth session with the new active company
    await update({ activeCompanyId: companyId });
    router.refresh();
  };

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href));

  return (
    <div className={styles.shell}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? '' : styles.sidebarCollapsed} ${mobileMenuOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/dashboard" className={styles.sidebarLogo}>
            <Leaf size={24} />
            {sidebarOpen && <span>ESGwise</span>}
          </Link>
          <button className={`btn btn-ghost btn-icon ${styles.collapseBtn}`} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <ChevronLeft size={18} style={{ transform: sidebarOpen ? 'none' : 'rotate(180deg)', transition: 'var(--transition-base)' }} />
          </button>
        </div>

        {/* Company Switcher for Reporters */}
        {session.role === 'reporter' && sidebarOpen && (
          <div className={styles.companySwitcher}>
            <button
              className={styles.switcherBtn}
              onClick={() => setCompanySwitcherOpen(!companySwitcherOpen)}
            >
              <Building2 size={16} />
              <span className={styles.switcherLabel}>
                {activeCompanyName || (isAr ? 'اختر شركة' : 'Select Company')}
              </span>
              <ChevronDown size={14} style={{ transform: companySwitcherOpen ? 'rotate(180deg)' : 'none', transition: 'var(--transition-fast)', marginLeft: 'auto' }} />
            </button>
            {companySwitcherOpen && (
              <div className={styles.switcherDropdown}>
                {clientCompanies.length === 0 ? (
                  <div className={styles.switcherEmpty}>
                    {isAr ? 'لا يوجد عملاء' : 'No clients yet'}
                  </div>
                ) : (
                  clientCompanies.map(c => (
                    <button
                      key={c.id}
                      className={`${styles.switcherItem} ${c.id === session.activeCompanyId ? styles.switcherItemActive : ''}`}
                      onClick={() => handleSwitchCompany(c.id, c.name)}
                    >
                      <span className={styles.switcherDot} />
                      {c.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <item.icon size={20} />
              {sidebarOpen && <span>{t(item.label)}</span>}
            </Link>
          ))}

          {session.role === 'reporter' && (
            <>
              <div className={styles.navDivider} />
              {REPORTER_ITEMS.map(item => (
                <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <item.icon size={20} />
                  {sidebarOpen && <span>{t(item.label)}</span>}
                </Link>
              ))}
            </>
          )}

          {session.isAdmin && (
            <>
              <div className={styles.navDivider} />
              {ADMIN_ITEMS.map(item => (
                <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
                  <item.icon size={20} />
                  {sidebarOpen && <span>{t(item.label)}</span>}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/dashboard/settings" className={styles.navItem} onClick={() => setMobileMenuOpen(false)}>
            <Settings size={20} />
            {sidebarOpen && <span>{t('nav.settings')}</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && <div className={styles.mobileOverlay} onClick={() => setMobileMenuOpen(false)} />}

      {/* Main */}
      <div className={styles.main}>
        {/* Demo Banner */}
        {session.isDemo && (
          <div className={styles.demoBanner}>
            <div className={styles.demoBadge}>DEMO</div>
            <span>{isAr ? 'أنت في وضع العرض التجريبي. البيانات المدخلة لن تُحفظ بشكل دائم.' : 'You are in Demo Mode. Data entered will not be saved permanently.'}</span>
            <Link href="/register" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>{isAr ? 'سجل الآن' : 'Register Now'}</Link>
          </div>
        )}

        {/* Header */}
        <header className={styles.header}>
          <button className={`btn btn-ghost btn-icon ${styles.mobileMenuBtn}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className={styles.headerRight}>
            <button className="btn btn-ghost btn-sm" onClick={() => setLocale(isAr ? 'en' : 'ar')}>
              <Globe size={16} />{isAr ? 'EN' : 'عربي'}
            </button>
            <button className="btn btn-ghost btn-icon" onClick={toggle}>
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button className="btn btn-ghost btn-icon"><Bell size={16} /></button>
            <div className={styles.userMenu}>
              <div className={styles.userAvatar}>{session.name?.[0]?.toUpperCase() || 'U'}</div>
              {sidebarOpen && (
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{session.name}</span>
                  <span className={styles.userRole}>{session.role}</span>
                </div>
              )}
              <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          {children}
        </main>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <Leaf size={32} color="var(--color-primary)" />
                <h2>{isAr ? 'أهلاً بك في ESGwise' : 'Welcome to ESGwise'}</h2>
              </div>
              <div className={styles.modalBody}>
                <p>{isAr ? 'لنبدأ رحلة الاستدامة الخاصة بك. اتبع هذه الخطوات البسيطة:' : 'Let\'s start your sustainability journey. Follow these simple steps:'}</p>
                <div className={styles.onboardingSteps}>
                  <div className={styles.onboardingStep}>
                    <div className={styles.onboardingNum}>1</div>
                    <div>
                      <h4>{isAr ? 'أكمل التقييم' : 'Complete Assessment'}</h4>
                      <p>{isAr ? 'أجب على الأسئلة المخصصة لقطاعك' : 'Answer tailored questions for your sector'}</p>
                    </div>
                  </div>
                  <div className={styles.onboardingStep}>
                    <div className={styles.onboardingNum}>2</div>
                    <div>
                      <h4>{isAr ? 'حمّل المستندات' : 'Upload Documents'}</h4>
                      <p>{isAr ? 'استخدم الذكاء الاصطناعي لتحليل بياناتك' : 'Use AI to extract and analyze your data'}</p>
                    </div>
                  </div>
                  <div className={styles.onboardingStep}>
                    <div className={styles.onboardingNum}>3</div>
                    <div>
                      <h4>{isAr ? 'صدر التقارير' : 'Export Reports'}</h4>
                      <p>{isAr ? 'احصل على تقرير GRI وشهادة ESG' : 'Get your GRI report and ESG certificate'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button className="btn btn-primary btn-full" onClick={closeOnboarding}>{isAr ? 'ابدأ الآن' : 'Get Started'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
