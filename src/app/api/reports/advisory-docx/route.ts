import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType, ImageRun, TabStopPosition, TabStopType, PageBreak } from 'docx';
import { getSession } from '@/lib/session';
import { getCompanyById, getCompanyScore } from '@/lib/db';

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
 * GET /api/reports/advisory-docx?companyId=xxx
 * 
 * Admin-only endpoint. Generates a professional ESG advisory report DOCX
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

    const company = await getCompanyById(companyId);
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const score = await getCompanyScore(companyId);

    const strengths = parseList(score?.strengths);
    const weaknesses = parseList(score?.weaknesses);
    const gaps = parseList(score?.gaps);
    const recommendations = parseList(score?.recommendations, ';');

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const overall = score?.overall_score || 0;
    const env = score?.env_score || 0;
    const soc = score?.soc_score || 0;
    const gov = score?.gov_score || 0;
    const rating = score?.rating || 'CCC';

    const cleanPrimaryColor = primaryColor.replace('#', '');

    // ─── Build DOCX ────────────────────────────────────────────
    const doc = new Document({
      creator: consultantName,
      title: `ESG Advisory Report – ${company.name}`,
      description: `Strategic Sustainability Assessment for ${company.name}`,
      styles: {
        default: {
          document: { run: { font: 'Calibri', size: 22, color: '1f2937' } },
          heading1: { run: { font: 'Calibri', size: 44, bold: true, color: cleanPrimaryColor } },
          heading2: { run: { font: 'Calibri', size: 32, bold: true, color: '111827' } },
          heading3: { run: { font: 'Calibri', size: 26, bold: true, color: '4b5563' } },
        },
      },
      sections: [
        // ───── Cover Page ─────
        {
          properties: {},
          children: [
            new Paragraph({ spacing: { before: 3000 } }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: 'ESG Advisory Report', bold: true, size: 56, font: 'Calibri', color: cleanPrimaryColor })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
              children: [new TextRun({ text: 'Strategic Sustainability Assessment & Action Plan', size: 28, color: '6b7280', italics: true })],
            }),
            new Paragraph({ spacing: { before: 600 } }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Rating: ${rating}`, bold: true, size: 40, color: ratingHex(rating) })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { before: 200 },
              children: [new TextRun({ text: `Overall Score: ${overall}%`, size: 32, color: '374151' })],
            }),
            new Paragraph({ spacing: { before: 800 } }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: company.name, bold: true, size: 36, color: '0ea5e9' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [new TextRun({ text: `${company.sector} · ${company.size} · ${company.country || 'Jordan'}`, size: 22, color: '6b7280' })],
            }),
            new Paragraph({ spacing: { before: 1600 } }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Prepared by ${brandName}`, size: 20, color: cleanPrimaryColor })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Consultant: ${consultantName}`, size: 20, color: '6b7280' })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `Report Date: ${today}`, size: 20, color: '9ca3af' })],
            }),
          ],
        },

        // ───── Content Pages ─────
        {
          properties: {},
          children: [
            // Executive Summary
            new Paragraph({ heading: HeadingLevel.HEADING_1, text: '1. Executive Summary', spacing: { after: 200 } }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun({
                text: introText || `This advisory report presents the findings of a comprehensive ESG assessment conducted for ${company.name}. Operating in the ${company.sector} sector as a ${company.size}-sized enterprise, the company received an overall ESG score of ${overall}% with a rating of ${rating}.`,
              })],
            }),
            new Paragraph({
              spacing: { after: 300 },
              children: [new TextRun({
                text: overall >= 70
                  ? 'The organization demonstrates strong sustainability practices and is well-positioned for continued ESG leadership.'
                  : overall >= 50
                    ? 'The organization shows moderate sustainability awareness with notable gaps that could significantly improve stakeholder confidence.'
                    : 'The organization is at an early stage of its ESG journey. Immediate and focused action is recommended to mitigate material risks.',
              })],
            }),

            // Performance Overview
            new Paragraph({ heading: HeadingLevel.HEADING_1, text: '2. Performance Overview', spacing: { after: 200 } }),
            createScoreTable(overall, env, soc, gov, rating),
            new Paragraph({ spacing: { after: 300 } }),

            // Detailed Analysis
            new Paragraph({ heading: HeadingLevel.HEADING_1, text: '3. Detailed Analysis', spacing: { after: 200 } }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, text: '✓ Strengths', spacing: { after: 100 } }),
            ...bulletList(strengths.length > 0 ? strengths : ['No significant strengths identified yet.'], '10b981'),

            new Paragraph({ heading: HeadingLevel.HEADING_2, text: '⚠ Areas for Improvement', spacing: { before: 200, after: 100 } }),
            ...bulletList(weaknesses.length > 0 ? weaknesses : ['No critical weaknesses identified.'], 'f59e0b'),

            new Paragraph({ heading: HeadingLevel.HEADING_2, text: '✗ Data & Policy Gaps', spacing: { before: 200, after: 100 } }),
            ...bulletList(gaps.length > 0 ? gaps : ['No major data gaps identified.'], 'ef4444'),

            // Recommendations
            new Paragraph({ children: [new PageBreak()] }),
            new Paragraph({ heading: HeadingLevel.HEADING_1, text: '4. Strategic Recommendations & Action Plan', spacing: { after: 200 } }),
            new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun({ text: 'The following recommendations are prioritized by potential impact and urgency.', italics: true, color: '6b7280' })],
            }),
            ...recommendations.map((rec: string, i: number) => new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: `Recommendation ${i + 1}: `, bold: true, color: cleanPrimaryColor }),
                new TextRun({ text: rec }),
              ],
            })),

            // Next Steps
            new Paragraph({ heading: HeadingLevel.HEADING_2, text: 'Next Steps', spacing: { before: 300, after: 100 } }),
            closingText ? new Paragraph({
              spacing: { after: 200 },
              children: [new TextRun({ text: closingText })],
            }) : new Paragraph({ text: '' }),
            ...(!closingText ? bulletList([
              'Schedule a follow-up consultation to develop a detailed implementation timeline.',
              'Assign internal owners for each action item and establish quarterly ESG review cadence.',
              'Re-assess in 6 months to measure progress and update the ESG rating.',
            ], cleanPrimaryColor) : []),

            new Paragraph({ spacing: { before: 600 } }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 100 },
              children: [new TextRun({ text: `This report has been prepared by ${brandName} based on data provided during the assessment process.`, size: 18, color: '9ca3af', italics: true })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`, size: 18, color: '9ca3af' })],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    const safeName = company.name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_');

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="ESG_Advisory_${safeName}.docx"`
      }
    });
  } catch (error) {
    console.error('Failed to generate advisory DOCX:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── Helpers ────────────────────────────────────────────────────
function ratingHex(rating: string) {
  if (rating === 'AAA' || rating === 'AA') return '10b981';
  if (rating === 'A' || rating === 'BBB') return '0ea5e9';
  if (rating === 'BB' || rating === 'B') return 'f59e0b';
  return 'ef4444';
}

function bulletList(items: string[], color: string): Paragraph[] {
  return items.map(item => new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: '  •  ', bold: true, color }),
      new TextRun({ text: item }),
    ],
  }));
}

function createScoreTable(overall: number, env: number, soc: number, gov: number, rating: string): Table {
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: 'e5e7eb' },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e5e7eb' },
    left: { style: BorderStyle.SINGLE, size: 1, color: 'e5e7eb' },
    right: { style: BorderStyle.SINGLE, size: 1, color: 'e5e7eb' },
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createScoreCell('Overall', `${overall}% (${rating})`, ratingHex(rating), cellBorder),
          createScoreCell('Environmental', `${env}%`, '10b981', cellBorder),
          createScoreCell('Social', `${soc}%`, '3b82f6', cellBorder),
          createScoreCell('Governance', `${gov}%`, '8b5cf6', cellBorder),
        ],
      }),
    ],
  });
}

function createScoreCell(label: string, value: string, color: string, borders: any): TableCell {
  return new TableCell({
    width: { size: 25, type: WidthType.PERCENTAGE },
    borders,
    shading: { type: ShadingType.SOLID, fill: 'f9fafb', color: 'f9fafb' },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100 }, children: [new TextRun({ text: label, size: 18, color: '6b7280' })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: value, bold: true, size: 28, color })] }),
    ],
  });
}

