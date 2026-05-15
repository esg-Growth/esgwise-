import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { AdvisoryReportDocument } from '@/components/pdf/AdvisoryReportDocument';
import { getSession } from '@/lib/session';
import { getCompanyById, getCompanyScore, getAdminAnalytics } from '@/lib/db';
import React from 'react';

const parseList = (val: any, defaultSplitStr = ',') => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return val.split(defaultSplitStr).map((s: string) => s.trim()).filter(Boolean);
    }
  }
  return [];
};
/**
 * GET /api/reports/advisory?companyId=xxx
 * 
 * Admin-only endpoint. Generates a professional ESG advisory report PDF
 * for a specific client company.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized – Admin only' }, { status: 401 });
    }

    const payload = await request.json();
    const companyId = payload.companyId;
    const consultantName = payload.consultantName || session.name || 'ESGwise Consultant';
    const brandName = payload.brandName || 'ESGwise';
    const primaryColor = payload.primaryColor || '#0f766e';
    const logoUrl = payload.logoUrl || null;
    const introText = payload.introText || '';
    const closingText = payload.closingText || '';

    if (!companyId) {
      return NextResponse.json({ error: 'companyId is required' }, { status: 400 });
    }

    // Fetch company info
    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Fetch score from esg_scores table
    const score = await getCompanyScore(companyId);

    const data = {
      company: {
        name: company.name || 'Unknown',
        sector: company.sector || 'General',
        size: company.size || 'small',
        country: company.country || 'Jordan',
      },
      score: {
        overall: score?.overall_score || 0,
        env:     score?.env_score || 0,
        soc:     score?.soc_score || 0,
        gov:     score?.gov_score || 0,
        rating:  score?.rating || 'CCC',
      },
      strengths:       parseList(score?.strengths),
      weaknesses:      parseList(score?.weaknesses),
      gaps:            parseList(score?.gaps),
      recommendations: parseList(score?.recommendations, ';'),
      assessmentDate:  score?.created_at || new Date().toISOString(),
      consultantName,
      brandName,
    };

    // Audit Log
    console.log(`[AUDIT] Advisory PDF generated for company: ${companyId} by admin: ${session.email} at ${new Date().toISOString()}`);

    const pdfStream = await renderToStream(
      React.createElement(AdvisoryReportDocument, { data }) as any
    );

    const webStream = new ReadableStream({
      start(controller) {
        pdfStream.on('data', (chunk: any) => controller.enqueue(chunk));
        pdfStream.on('end', () => controller.close());
        pdfStream.on('error', (err: any) => controller.error(err));
      }
    });

    const safeName = company.name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ESG_Advisory_${safeName}.pdf"`
      }
    });
  } catch (error) {
    console.error('Failed to generate advisory PDF:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

