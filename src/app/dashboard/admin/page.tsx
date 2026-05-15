import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getAllUsers, getAdminAnalytics, getAdminCompaniesWithScores, getTenantSettings } from '@/lib/db';
import { AdminPanel } from './admin-panel';

export default async function AdminPage() {
  const session = await getSession();

  // Protect route
  if (!session?.isAdmin) {
    redirect('/dashboard');
  }

  // Fetch users, analytics, and companies with scores
  const [users, analytics, companies, tenantSettings] = await Promise.all([
    getAllUsers(),
    getAdminAnalytics(),
    getAdminCompaniesWithScores?.() || Promise.resolve([]),
    getTenantSettings(),
  ]);

  return <AdminPanel initialUsers={users} analytics={analytics} companies={companies} tenantSettings={tenantSettings} />;
}
