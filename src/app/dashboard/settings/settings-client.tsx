'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { useTheme } from '@/components/providers';
import { User, Building, Shield, Globe, Moon, Sun, Lock } from 'lucide-react';

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
}

export function SettingsClient({ user, company }: SettingsClientProps) {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const isAr = locale === 'ar';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Globe },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-xl)', flexDirection: 'row' }}>
      {/* Sidebar / Tabs */}
      <div style={{ 
        width: '250px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--spacing-xs)' 
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: activeTab === tab.id ? 'var(--color-primary-light)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary-dark)' : 'var(--color-text)',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all var(--transition-base)'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: '800px' }}>
        <div style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--spacing-xl)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-md)' }}>Profile Information</h2>
              
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 600
                }}>
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)' }}>{user.name}</h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>{user.role}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)' }}>
                <div className="form-control">
                  <label htmlFor="fullName">Full Name</label>
                  <input id="fullName" type="text" className="input" defaultValue={user.name} disabled />
                  <small style={{ color: 'var(--color-text-muted)', marginTop: '4px' }}>Contact an admin to change your name.</small>
                </div>
                <div className="form-control">
                  <label htmlFor="emailAddress">Email Address</label>
                  <input id="emailAddress" type="email" className="input" defaultValue={user.email} disabled />
                </div>
                <div className="form-control" style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="companyName" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={16} /> Company</label>
                  <input id="companyName" type="text" className="input" defaultValue={company.name} disabled />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-md)' }}>App Preferences</h2>
              
              <div className="form-control">
                <label>Language</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
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

              <div className="form-control" style={{ marginTop: 'var(--spacing-md)' }}>
                <label>Theme</label>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xs)' }}>
                  <button 
                    className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={toggle}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Sun size={16} /> Light Mode
                  </button>
                  <button 
                    className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={toggle}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Moon size={16} /> Dark Mode
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
              <h2 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-md)' }}>Security</h2>
              
              <div style={{ padding: 'var(--spacing-md)', background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-md)' }}>
                  <Lock size={20} color="var(--color-text-muted)" />
                  <div>
                    <h4 style={{ fontWeight: 600 }}>Password</h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>You are currently using email and password to log in.</p>
                  </div>
                </div>
                <button className="btn btn-outline" disabled>Change Password</button>
                <p style={{ marginTop: 'var(--spacing-sm)', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Password changes are currently managed by administrators.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
