'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/components/providers';
import { Session } from '@/lib/session';
import {
  Leaf, LayoutDashboard, ClipboardList, BarChart3, Target, Map, FileText,
  Award, Bot, Settings, Shield, Menu, X, Globe, Sun, Moon, LogOut,
  ChevronLeft, Bell, User
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

const ADMIN_ITEMS = [
  { href: '/dashboard/admin', icon: Shield, label: 'nav.admin' },
];

export function DashboardShell({ session, children }: Props) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAr = locale === 'ar';

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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

        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className={`${styles.navItem} ${isActive(item.href) ? styles.navItemActive : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <item.icon size={20} />
              {sidebarOpen && <span>{t(item.label)}</span>}
            </Link>
          ))}

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
      </div>
    </div>
  );
}
