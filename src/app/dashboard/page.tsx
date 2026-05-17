import { Suspense } from 'react';
import { getSession } from '@/lib/session';
import { DashboardOverview } from './overview';
import { Skeleton } from '@/components/ui/skeleton';

async function DashboardContent() {
  const session = await getSession();

  let company = null;
  let assessment = null;
  let benchmarks = null;
  let score = null;
  let reporterClients = null;

  try {
    const { getCompanyById, getAssessmentForCompany, getCompanyScore, getIndustryBenchmarks, getReporterClients } = await import('@/lib/db');

    const effectiveCompanyId = session?.activeCompanyId || session?.companyId;

    if (effectiveCompanyId) {
      company = await getCompanyById(effectiveCompanyId);
      assessment = await getAssessmentForCompany(effectiveCompanyId);
      score = await getCompanyScore(effectiveCompanyId);
      benchmarks = await getIndustryBenchmarks(company?.sector);
    } else if (session?.role === 'reporter' && session?.reporterId) {
      const clients = await getReporterClients(session.reporterId);
      const clientsWithData = await Promise.all(clients.map(async (c: any) => {
        const cScore = await getCompanyScore(c.id);
        const cAssessment = await getAssessmentForCompany(c.id);
        return { ...c, score: cScore, assessment: cAssessment };
      }));
      reporterClients = clientsWithData;
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }

  if (session?.role === 'reporter' && !session?.activeCompanyId && reporterClients) {
    const { ReporterAnalytics } = await import('./reporter-analytics');
    return <ReporterAnalytics session={session} clients={reporterClients} />;
  }

  return <DashboardOverview session={session!} company={company} assessment={assessment} score={score} benchmarks={benchmarks} />;
}

function DashboardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <Skeleton className="h-[100px] w-full" style={{ height: '100px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Skeleton style={{ height: '120px' }} />
        <Skeleton style={{ height: '120px' }} />
        <Skeleton style={{ height: '120px' }} />
        <Skeleton style={{ height: '120px' }} />
      </div>
      <Skeleton style={{ height: '200px', width: '100%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
        <Skeleton style={{ height: '100px' }} />
        <Skeleton style={{ height: '100px' }} />
        <Skeleton style={{ height: '100px' }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
