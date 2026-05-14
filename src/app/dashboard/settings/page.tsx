import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SettingsClient } from './settings-client';
import { getCompanyById, getUserByEmail } from '@/lib/db';

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
  if (user.company_id) {
     company = await getCompanyById(user.company_id);
  }

  return (
    <div style={{ padding: 'var(--spacing-md)' }}>
      <header style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 600 }}>Settings</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>Manage your account settings and preferences.</p>
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
      />
    </div>
  );
}
