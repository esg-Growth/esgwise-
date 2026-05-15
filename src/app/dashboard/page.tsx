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
  try {
    if (session?.companyId) {
      const { getCompanyById, getAssessmentForCompany, getCompanyScore, getIndustryBenchmarks } = await import('@/lib/db');
      company = await getCompanyById(session.companyId);
      assessment = await getAssessmentForCompany(session.companyId);
      score = await getCompanyScore(session.companyId);
      benchmarks = await getIndustryBenchmarks(company?.sector);
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
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
