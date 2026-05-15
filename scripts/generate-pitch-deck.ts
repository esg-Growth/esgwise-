import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun, HeadingLevel, PageBreak, ShadingType, Header, Footer, TabStopPosition, TabStopType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

const BRAND = { primary: '0F766E', gold: 'B8960C', dark: '1A1A2E', light: 'F0FDF4', blue: '3B82F6', purple: '8B5CF6', red: 'EF4444', gray: '6B7280' };
const IMG_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\dca7e56f-aef8-4b43-b850-1deabbfe5395';
const OUT_DIR = path.join(process.cwd(), 'docs-private');

function loadImg(name: string) {
  const p = path.join(IMG_DIR, name);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  return null;
}

function heading(text: string, level: any = HeadingLevel.HEADING_1, color = BRAND.primary): Paragraph {
  return new Paragraph({ heading: level, spacing: { before: 400, after: 200 }, children: [new TextRun({ text, bold: true, color, font: 'Calibri', size: level === HeadingLevel.HEADING_1 ? 48 : level === HeadingLevel.HEADING_2 ? 36 : 28 })] });
}

function para(text: string, opts: any = {}): Paragraph {
  return new Paragraph({ spacing: { after: 120 }, alignment: opts.align, children: [new TextRun({ text, font: 'Calibri', size: 22, color: opts.color || '333333', bold: opts.bold, italics: opts.italic, ...opts })] });
}

function bulletPoint(text: string, bold_prefix?: string): Paragraph {
  const children: TextRun[] = [];
  if (bold_prefix) {
    children.push(new TextRun({ text: bold_prefix + ' ', bold: true, font: 'Calibri', size: 22, color: BRAND.primary }));
  }
  children.push(new TextRun({ text, font: 'Calibri', size: 22, color: '333333' }));
  return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children });
}

function cell(text: string, opts: any = {}): TableCell {
  return new TableCell({
    width: { size: opts.width || 2500, type: WidthType.DXA },
    shading: opts.shading ? { type: ShadingType.SOLID, color: opts.shading } : undefined,
    children: [new Paragraph({ alignment: opts.align || AlignmentType.LEFT, children: [new TextRun({ text, font: 'Calibri', size: 20, bold: opts.bold, color: opts.color || (opts.shading ? 'FFFFFF' : '333333') })] })],
  });
}

function tableRow(cells: { text: string; opts?: any }[]): TableRow {
  return new TableRow({ children: cells.map(c => cell(c.text, c.opts || {})) });
}

function headerRow(texts: string[], width = 2500): TableRow {
  return new TableRow({ children: texts.map(t => cell(t, { bold: true, shading: BRAND.primary, color: 'FFFFFF', width })) });
}

function imgParagraph(imgData: Buffer | null, w = 680, h = 380): Paragraph | null {
  if (!imgData) return null;
  return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new ImageRun({ data: imgData, transformation: { width: w, height: h }, type: 'png' })] });
}

function pageBreak(): Paragraph { return new Paragraph({ children: [new PageBreak()] }); }

async function main() {
  const landing = loadImg('landing_page_1778814083655.png');
  const dashboard = loadImg('dashboard_page_1778814103470.png');
  const adminTop = loadImg('admin_panel_top_v2_1778814540366.png');
  const portfolio = loadImg('admin_panel_portfolio_v2_1778814555662.png');

  const sections: (Paragraph | Table)[] = [];

  // === COVER PAGE ===
  sections.push(new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'ESGwise', font: 'Calibri', size: 72, bold: true, color: BRAND.primary })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'AI-Powered ESG Assessment Platform', font: 'Calibri', size: 36, color: BRAND.gold })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: 'for Emerging Market SMEs', font: 'Calibri', size: 36, color: BRAND.gold })] }));
  sections.push(new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'INVESTOR PITCH DECK', font: 'Calibri', size: 28, bold: true, color: BRAND.gray })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Confidential · May 2026', font: 'Calibri', size: 22, color: BRAND.gray, italics: true })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'TechnoSeeds International', font: 'Calibri', size: 24, color: BRAND.primary })] }));
  sections.push(pageBreak());

  // === THE OPPORTUNITY ===
  sections.push(heading('🌍 The Opportunity'));
  sections.push(heading('The Problem', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(para('$4.8 Trillion in ESG-linked capital demands credible sustainability data — yet 85% of SMEs in emerging markets cannot afford the $50K–$250K that traditional ESG consultancies charge per assessment.', { bold: true }));
  sections.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Pain Point', 'Impact'], 4500),
    tableRow([{ text: 'Manual ESG assessments cost $50K–$250K', opts: { width: 4500 } }, { text: 'Only large corporates can afford compliance', opts: { width: 4500 } }]),
    tableRow([{ text: 'Consultants spend 6–12 weeks per assessment', opts: { width: 4500 } }, { text: 'Slow turnaround kills deal flow', opts: { width: 4500 } }]),
    tableRow([{ text: 'No standardized framework for MENA region', opts: { width: 4500 } }, { text: 'Fragmented, unreliable data', opts: { width: 4500 } }]),
    tableRow([{ text: 'Investors lack portfolio-level ESG visibility', opts: { width: 4500 } }, { text: 'Risk exposure remains opaque', opts: { width: 4500 } }]),
  ] }));
  sections.push(para('$35B+ in annual ESG investment flows into the MENA region. Less than 5% of SMEs have the tools to participate.', { bold: true, color: BRAND.primary }));
  sections.push(pageBreak());

  // === THE SOLUTION ===
  sections.push(heading('💡 The Solution'));
  sections.push(heading('ESGwise: Democratizing ESG for the Next Billion Enterprises', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(para('ESGwise is an AI-powered SaaS platform that enables ESG consultants and SMEs to conduct GRI-aligned, IFRS S1/S2 compliant assessments in hours instead of months — at a fraction of the cost.'));
  const landingImg = imgParagraph(landing);
  if (landingImg) sections.push(landingImg);
  sections.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Feature', 'Traditional', 'ESGwise'], 3000),
    tableRow([{ text: 'Assessment Time', opts: { width: 3000 } }, { text: '6–12 weeks', opts: { width: 3000 } }, { text: '< 24 hours', opts: { width: 3000, bold: true, color: BRAND.primary } }]),
    tableRow([{ text: 'Cost', opts: { width: 3000 } }, { text: '$50K–$250K', opts: { width: 3000 } }, { text: '$500–$2,000', opts: { width: 3000, bold: true, color: BRAND.primary } }]),
    tableRow([{ text: 'Frameworks', opts: { width: 3000 } }, { text: 'Single', opts: { width: 3000 } }, { text: 'GRI + IFRS + SDG', opts: { width: 3000, bold: true, color: BRAND.primary } }]),
    tableRow([{ text: 'Scalability', opts: { width: 3000 } }, { text: '5–10 clients/yr', opts: { width: 3000 } }, { text: 'Unlimited', opts: { width: 3000, bold: true, color: BRAND.primary } }]),
    tableRow([{ text: 'Languages', opts: { width: 3000 } }, { text: 'English only', opts: { width: 3000 } }, { text: 'English + Arabic', opts: { width: 3000, bold: true, color: BRAND.primary } }]),
  ] }));
  sections.push(pageBreak());

  // === PRODUCT ===
  sections.push(heading('🏗️ Product Overview'));
  sections.push(heading('Company Dashboard', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(para('Every registered company gets a personalized dashboard showing their ESG performance across Environmental, Social, and Governance pillars with actionable progress tracking.'));
  const dashImg = imgParagraph(dashboard);
  if (dashImg) sections.push(dashImg);
  sections.push(pageBreak());

  sections.push(heading('Consultant Command Center', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(para('The Admin panel transforms ESGwise into a consulting practice management tool — giving consultants portfolio-wide visibility, per-company scoring breakdowns, and one-click professional advisory report generation.'));
  const adminImg = imgParagraph(adminTop);
  if (adminImg) sections.push(adminImg);
  sections.push(heading('Client Portfolio & Advisory Reports', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(para('Consultants generate branded, professional PDF and DOCX advisory reports for each client — with strengths, weaknesses, gap analysis, and prioritized action plans.'));
  const portImg = imgParagraph(portfolio);
  if (portImg) sections.push(portImg);
  sections.push(pageBreak());

  // === MARKET SIZE ===
  sections.push(heading('📈 Market Size'));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Metric', 'Value'], 4500),
    tableRow([{ text: 'Global ESG Software Market (2026)', opts: { width: 4500 } }, { text: '$1.8B', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'MENA ESG Market Growth (CAGR)', opts: { width: 4500 } }, { text: '22.4%', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'Target: MENA SMEs (addressable)', opts: { width: 4500 } }, { text: '120,000+ companies', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'SOM Year 1', opts: { width: 4500 } }, { text: '500 companies × $1,500 = $750K ARR', opts: { width: 4500, bold: true, color: BRAND.primary } }]),
    tableRow([{ text: 'SOM Year 3', opts: { width: 4500 } }, { text: '5,000 companies × $2,000 = $10M ARR', opts: { width: 4500, bold: true, color: BRAND.primary } }]),
  ] }));
  sections.push(para('Why MENA First? Jordan, Saudi Arabia, UAE, and Egypt are implementing mandatory ESG disclosure regulations between 2025–2028. First-mover advantage is critical.', { italic: true, color: BRAND.primary }));
  sections.push(pageBreak());

  // === BUSINESS MODEL ===
  sections.push(heading('💰 Business Model'));
  sections.push(heading('Revenue Streams', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Stream', 'Description', 'Pricing'], 3000),
    tableRow([{ text: 'SaaS Subscriptions', opts: { width: 3000, bold: true } }, { text: 'Company self-service platform', opts: { width: 3000 } }, { text: '$99–$499/mo', opts: { width: 3000 } }]),
    tableRow([{ text: 'Consultant Licenses', opts: { width: 3000, bold: true } }, { text: 'Multi-client portfolio management', opts: { width: 3000 } }, { text: '$199–$999/mo', opts: { width: 3000 } }]),
    tableRow([{ text: 'Advisory Report Credits', opts: { width: 3000, bold: true } }, { text: 'Professional PDF/DOCX exports', opts: { width: 3000 } }, { text: '$25–$100/report', opts: { width: 3000 } }]),
    tableRow([{ text: 'Certificate Verification', opts: { width: 3000, bold: true } }, { text: 'Verifiable ESG certificates', opts: { width: 3000 } }, { text: '$50/certificate', opts: { width: 3000 } }]),
    tableRow([{ text: 'Enterprise API', opts: { width: 3000, bold: true } }, { text: 'ESG data for banks & investors', opts: { width: 3000 } }, { text: 'Custom pricing', opts: { width: 3000 } }]),
  ] }));
  sections.push(heading('Unit Economics', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Metric', 'Value'], 4500),
    tableRow([{ text: 'CAC', opts: { width: 4500 } }, { text: '~$120', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'LTV', opts: { width: 4500 } }, { text: '~$3,600', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'LTV/CAC Ratio', opts: { width: 4500 } }, { text: '30x', opts: { width: 4500, bold: true, color: BRAND.primary } }]),
    tableRow([{ text: 'Gross Margin', opts: { width: 4500 } }, { text: '85%+', opts: { width: 4500, bold: true, color: BRAND.primary } }]),
  ] }));
  sections.push(pageBreak());

  // === COMPETITIVE MOAT ===
  sections.push(heading('🛡️ Competitive Moat'));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Competitor', 'Region', 'Target', 'AI', 'Arabic', 'Price'], 1500),
    tableRow([{ text: 'Sustainalytics', opts: { width: 1500 } }, { text: 'Global', opts: { width: 1500 } }, { text: 'Enterprise', opts: { width: 1500 } }, { text: '❌', opts: { width: 1500 } }, { text: '❌', opts: { width: 1500 } }, { text: '$$$$$', opts: { width: 1500 } }]),
    tableRow([{ text: 'EcoVadis', opts: { width: 1500 } }, { text: 'Europe', opts: { width: 1500 } }, { text: 'Mid-market', opts: { width: 1500 } }, { text: '❌', opts: { width: 1500 } }, { text: '❌', opts: { width: 1500 } }, { text: '$$$$', opts: { width: 1500 } }]),
    tableRow([{ text: 'ESGwise', opts: { width: 1500, bold: true, color: BRAND.primary } }, { text: 'MENA-first', opts: { width: 1500, bold: true } }, { text: 'SMEs', opts: { width: 1500, bold: true } }, { text: '✅ Full', opts: { width: 1500, bold: true, color: BRAND.primary } }, { text: '✅ Native', opts: { width: 1500, bold: true, color: BRAND.primary } }, { text: '$', opts: { width: 1500, bold: true, color: BRAND.primary } }]),
  ] }));
  sections.push(pageBreak());

  // === GTM ===
  sections.push(heading('🗺️ Go-to-Market Strategy'));
  sections.push(heading('Phase 1: Jordan (2026 Q3–Q4)', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(bulletPoint('Partner with 5 ESG consulting firms'));
  sections.push(bulletPoint('Onboard 50 pilot companies'));
  sections.push(bulletPoint('Achieve $50K MRR'));
  sections.push(heading('Phase 2: MENA Expansion (2027)', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(bulletPoint('Launch in Saudi Arabia, UAE, Egypt'));
  sections.push(bulletPoint('Regulatory partnership with local stock exchanges'));
  sections.push(bulletPoint('Target 500 companies, $200K MRR'));
  sections.push(heading('Phase 3: Global Scale (2028+)', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(bulletPoint('Enterprise API for banks, PE firms, VCs'));
  sections.push(bulletPoint('White-label for major consultancies'));
  sections.push(bulletPoint('Target 5,000+ companies, $800K+ MRR'));
  sections.push(pageBreak());

  // === THE ASK ===
  sections.push(heading('💵 The Ask'));
  sections.push(heading('Raising: $500K Pre-Seed', HeadingLevel.HEADING_2, BRAND.gold));
  sections.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    headerRow(['Use of Funds', 'Allocation'], 4500),
    tableRow([{ text: 'Product Development & AI', opts: { width: 4500 } }, { text: '40% ($200K)', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'Sales & Marketing', opts: { width: 4500 } }, { text: '25% ($125K)', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'ESG Content & Compliance', opts: { width: 4500 } }, { text: '15% ($75K)', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'Operations & Infra', opts: { width: 4500 } }, { text: '10% ($50K)', opts: { width: 4500, bold: true } }]),
    tableRow([{ text: 'Reserve', opts: { width: 4500 } }, { text: '10% ($50K)', opts: { width: 4500, bold: true } }]),
  ] }));
  sections.push(heading('12-Month Milestones', HeadingLevel.HEADING_2, BRAND.dark));
  sections.push(bulletPoint('Launch v1.0 with 50 paying companies'));
  sections.push(bulletPoint('Achieve $50K MRR'));
  sections.push(bulletPoint('3 consulting firm partnerships'));
  sections.push(bulletPoint('GRI official alignment certification'));
  sections.push(bulletPoint('Series A readiness ($3M round)'));
  sections.push(pageBreak());

  // === CONTACT ===
  sections.push(new Paragraph({ spacing: { before: 3000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ESGwise', font: 'Calibri', size: 56, bold: true, color: BRAND.primary })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'by TechnoSeeds International', font: 'Calibri', size: 28, color: BRAND.gray })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '"We\'re not just building a tool — we\'re building the ESG infrastructure for emerging markets."', font: 'Calibri', size: 24, italics: true, color: BRAND.dark })] }));
  sections.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 600 }, children: [new TextRun({ text: '🌐 esgwise.jo  ·  ✉️ invest@esgwise.jo', font: 'Calibri', size: 22, color: BRAND.primary })] }));

  const doc = new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [{ children: sections }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, 'ESGwise_Investor_Pitch_Deck.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Pitch deck saved: ${outPath}`);
}

main().catch(console.error);
