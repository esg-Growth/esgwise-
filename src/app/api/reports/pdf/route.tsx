import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { EsgReportDocument } from '@/components/pdf/EsgReportDocument';
import { getSession } from '@/lib/session';
import { getCompanyById, getAssessmentForCompany } from '@/lib/db';
import { calculateEsgScore } from '@/lib/esg-scoring';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = session.companyId;
    const { searchParams } = new URL(request.url);
    const isAr = searchParams.get('lang') === 'ar';

    const [company, assessment] = await Promise.all([
      getCompanyById(companyId),
      getAssessmentForCompany(companyId)
    ]);

    if (!company || !assessment) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const score = calculateEsgScore(assessment.responses, company.sectorId || company.sector_id || 'technology');

    const pdfStream = await renderToStream(
      <EsgReportDocument 
        company={company}
        score={score}
        responses={assessment.responses}
        isAr={isAr}
      />
    );

    // Convert NodeJS ReadableStream to Web ReadableStream
    const webStream = new ReadableStream({
      start(controller) {
        pdfStream.on('data', (chunk) => controller.enqueue(chunk));
        pdfStream.on('end', () => controller.close());
        pdfStream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ESG_Report_${company.name.replace(/\s+/g, '_')}.pdf"`
      }
    });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
