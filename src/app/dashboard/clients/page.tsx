import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ClientsManager } from './clients-manager';

export default async function ClientsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Only reporters and admins can access this page
  if (session.role !== 'reporter' && !session.isAdmin) {
    redirect('/dashboard');
  }

  let clients: any[] = [];
  try {
    const { getReporterClients } = await import('@/lib/db');
    clients = await getReporterClients(session.reporterId || session.userId);
  } catch (err) {
    console.error('Error fetching clients:', err);
  }

  return <ClientsManager session={session} initialClients={clients} />;
}
