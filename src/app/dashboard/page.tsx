import { getSession } from '@/lib/session';
import { DashboardOverview } from './overview';

export default async function DashboardPage() {
  const session = await getSession();

  let company = null;
  let assessment = null;
  try {
    const getDb = (await import('@/lib/db')).default;
    const db = getDb();
    company = db.prepare('SELECT * FROM companies WHERE id = ?').get(session?.companyId) as any;
    assessment = db.prepare('SELECT * FROM assessments WHERE company_id = ? ORDER BY created_at DESC LIMIT 1').get(session?.companyId) as any;
  } catch {}

  return <DashboardOverview session={session!} company={company} assessment={assessment} />;
}
