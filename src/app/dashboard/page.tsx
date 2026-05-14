import { getSession } from '@/lib/session';
import { DashboardOverview } from './overview';

export default async function DashboardPage() {
  const session = await getSession();

  let company = null;
  let assessment = null;
  try {
    if (session?.companyId) {
      const { getCompanyById, getAssessmentForCompany } = await import('@/lib/db');
      company = await getCompanyById(session.companyId);
      assessment = await getAssessmentForCompany(session.companyId);
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }

  return <DashboardOverview session={session!} company={company} assessment={assessment} />;
}
