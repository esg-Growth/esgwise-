import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { getCompanyById, getUserByEmail, getTenantSettings, getUsersByCompany } from '@/lib/db';
import styles from './settings.module.css';

export const metadata = {
  title: 'Settings - ESGwise',
  description: 'Manage your ESGwise account and preferences',
};

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/login');
  }

  // Fetch full user details to ensure we have the latest
  const user = await getUserByEmail(session.email as string);
  
  if (!user) {
    redirect('/login');
  }

  // Optionally fetch company info
  let company = null;
  let teamMembers: any[] = [];
  if (user.company_id) {
     company = await getCompanyById(user.company_id);
  }

  if (user.is_admin === 1 || session.isAdmin) {
    teamMembers = await getUsersByCompany(user.company_id || null);
  }

  // Fetch tenant settings
  const tenantSettings = await getTenantSettings();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your account settings and preferences.</p>
      </header>

      <SettingsClient 
        user={{
          name: user.name || session.name || '',
          email: user.email,
          role: user.role,
        }}
        company={{
          name: company?.name || 'My Company',
          id: user.company_id,
        }}
        isAdmin={user.is_admin === 1 || !!session.isAdmin}
        initialTenantSettings={tenantSettings}
        teamMembers={teamMembers}
      />
    </div>
  );
}
