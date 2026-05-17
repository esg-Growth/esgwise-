import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, ImageRun, HeadingLevel, PageBreak, ShadingType } from 'docx';
import * as fs from 'fs';
import * as path from 'path';

const BRAND = { primary: '0F766E', gold: 'B8960C', dark: '1A1A2E', gray: '6B7280' };
const OLD_IMG_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\dca7e56f-aef8-4b43-b850-1deabbfe5395';
const CURRENT_IMG_DIR = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\ae60c3d1-f5d3-4996-a38a-074a408496e7';
const OUT_DIR = path.join(process.cwd(), 'docs-private');

function loadImg(name: string) {
  let p = path.join(CURRENT_IMG_DIR, name);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  p = path.join(OLD_IMG_DIR, name);
  if (fs.existsSync(p)) return fs.readFileSync(p);
  return null;
}
function h1(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 }, children: [new TextRun({ text: t, bold: true, color: BRAND.primary, font: 'Calibri', size: 48 })] }); }
function h2(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 150 }, children: [new TextRun({ text: t, bold: true, color: BRAND.dark, font: 'Calibri', size: 36 })] }); }
function h3(t: string) { return new Paragraph({ heading: HeadingLevel.HEADING_3, spacing: { before: 200, after: 100 }, children: [new TextRun({ text: t, bold: true, color: BRAND.primary, font: 'Calibri', size: 28 })] }); }
function p(t: string, o: any = {}) { return new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: t, font: 'Calibri', size: 22, color: o.color || '333333', bold: o.bold, italics: o.italic })] }); }
function bullet(t: string) { return new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: t, font: 'Calibri', size: 22, color: '333333' })] }); }
function cel(t: string, o: any = {}) { return new TableCell({ width: { size: o.w || 4500, type: WidthType.DXA }, shading: o.sh ? { type: ShadingType.SOLID, color: o.sh } : undefined, children: [new Paragraph({ children: [new TextRun({ text: t, font: 'Calibri', size: 20, bold: o.b, color: o.c || (o.sh ? 'FFFFFF' : '333333') })] })] }); }
function hRow(ts: string[], w = 4500) { return new TableRow({ children: ts.map(t => cel(t, { b: true, sh: BRAND.primary, c: 'FFFFFF', w })) }); }
function dRow(cs: [string, any?][]) { return new TableRow({ children: cs.map(c => cel(c[0], c[1] || {})) }); }
function img(d: Buffer | null, w = 680, h = 380) { return d ? new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 }, children: [new ImageRun({ data: d, transformation: { width: w, height: h }, type: 'png' })] }) : null; }
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

async function main() {
  const landing = loadImg('home_page_1779034499093.png') || loadImg('landing_page_1778814083655.png');
  const regType = loadImg('registration_type_step_1779034923365.png');
  const repStep = loadImg('reporter_step_1_1779034943432.png');
  const compStep = loadImg('company_step_1_1779034984033.png');
  const dashboard = loadImg('dashboard_page_1778814103470.png');
  const assessment = loadImg('assessment_page_loading_1778814119002.png');
  const assessManual = loadImg('assessment_page_manual_entry_1778814128573.png');
  const analysis = loadImg('analysis_page_final_1778814153974.png');
  const adminTop = loadImg('clients_page_logged_in_1779035033306.png') || loadImg('admin_panel_top_v2_1778814540366.png');
  const portfolio = loadImg('clients_page_logged_in_1779035033306.png') || loadImg('admin_panel_portfolio_v2_1778814555662.png');
  const reports = loadImg('reports_page_final_1778814196292.png');

  const s: (Paragraph | Table)[] = [];

  // COVER
  s.push(new Paragraph({ spacing: { before: 2500 }, alignment: AlignmentType.CENTER, children: [] }));
  s.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ESGwise', font: 'Calibri', size: 72, bold: true, color: BRAND.primary })] }));
  s.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: 'Technical & Business Vision Document', font: 'Calibri', size: 32, color: BRAND.gold })] }));
  s.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: 'Version 1.0 · May 2026 · Confidential', font: 'Calibri', size: 22, color: BRAND.gray, italics: true })] }));
  s.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 }, children: [new TextRun({ text: 'TechnoSeeds International', font: 'Calibri', size: 24, color: BRAND.primary })] }));
  s.push(pb());

  // TOC
  s.push(h1('Table of Contents'));
  ['1. Executive Summary','2. Business Vision','3. Platform Architecture','4. Product Modules','5. Data Model & Schema','6. AI Integration','7. Security & Compliance','8. Deployment & Infrastructure','9. Product Roadmap'].forEach(t => s.push(p(t, { color: BRAND.primary, bold: true })));
  s.push(pb());

  // 1. EXECUTIVE SUMMARY
  s.push(h1('1. Executive Summary'));
  s.push(p('ESGwise is a full-stack SaaS platform that automates Environmental, Social, and Governance (ESG) assessment, scoring, and advisory reporting for Small and Medium Enterprises (SMEs) in emerging markets.'));
  s.push(p('The platform serves two primary user types:'));
  s.push(bullet('Companies — conducting self-assessments, tracking ESG progress, and earning verifiable certificates'));
  s.push(bullet('ESG Consultants — managing client portfolios, generating actionable advisory reports, and scaling their consulting practice'));
  s.push(new Paragraph({ spacing: { before: 200 }, children: [] }));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Capability', 'Description']),
    dRow([['AI-First Assessment', { b: true }], ['Gemini-powered document analysis auto-extracts ESG indicators']]),
    dRow([['Framework Alignment', { b: true }], ['GRI Standards, IFRS S1/S2, UN SDG mapping']]),
    dRow([['Bilingual (EN/AR)', { b: true }], ['Full Arabic localization for MENA market']]),
    dRow([['Consultant-as-Platform', { b: true }], ['Admin panel transforms into a consulting practice tool']]),
    dRow([['Multi-Format Export', { b: true }], ['Professional PDF and DOCX advisory reports with customizable branding']]),
  ] }));
  s.push(pb());

  // 2. BUSINESS VISION
  s.push(h1('2. Business Vision'));
  s.push(h2('Mission'));
  s.push(p('Democratize ESG assessment for the next billion enterprises in emerging markets.', { bold: true, color: BRAND.primary }));
  s.push(h2('Market Opportunity'));
  s.push(p('The global ESG software market is projected to reach $1.8B by 2027 (CAGR 22.4%). In the MENA region alone, 120,000+ SMEs face upcoming mandatory ESG disclosure regulations between 2025–2028.'));
  s.push(h2('Revenue Model'));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Stream', 'Model', 'Price'], 3000),
    dRow([['Company Subscriptions', { w: 3000 }], ['Monthly SaaS', { w: 3000 }], ['$99–$499/mo', { w: 3000 }]]),
    dRow([['Consultant Licenses', { w: 3000 }], ['Multi-client management', { w: 3000 }], ['$199–$999/mo', { w: 3000 }]]),
    dRow([['Advisory Report Credits', { w: 3000 }], ['Per-export credits', { w: 3000 }], ['$25–$100 each', { w: 3000 }]]),
    dRow([['Certificate Verification', { w: 3000 }], ['Annual verification', { w: 3000 }], ['$50/yr', { w: 3000 }]]),
    dRow([['Enterprise API', { w: 3000 }], ['Custom for institutions', { w: 3000 }], ['$5K–$50K/yr', { w: 3000 }]]),
  ] }));
  s.push(pb());

  // 3. ARCHITECTURE
  s.push(h1('3. Platform Architecture'));
  s.push(h2('Technology Stack'));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Layer', 'Technology', 'Rationale'], 3000),
    dRow([['Frontend', { w: 3000, b: true }], ['Next.js 15 (App Router)', { w: 3000 }], ['Server Components, streaming, edge-ready', { w: 3000 }]]),
    dRow([['Styling', { w: 3000, b: true }], ['CSS Modules + Design Tokens', { w: 3000 }], ['Zero-dependency, themeable, RTL-native', { w: 3000 }]]),
    dRow([['Database (Local)', { w: 3000, b: true }], ['SQLite via better-sqlite3', { w: 3000 }], ['Zero-config, embedded, instant queries', { w: 3000 }]]),
    dRow([['Database (Cloud)', { w: 3000, b: true }], ['Firebase Firestore', { w: 3000 }], ['Scalable NoSQL with real-time sync', { w: 3000 }]]),
    dRow([['Authentication', { w: 3000, b: true }], ['Custom session-based auth', { w: 3000 }], ['bcrypt hashing, HTTP-only cookies', { w: 3000 }]]),
    dRow([['AI Engine', { w: 3000, b: true }], ['Google Gemini Pro', { w: 3000 }], ['Document analysis, ESG extraction', { w: 3000 }]]),
    dRow([['PDF Generation', { w: 3000, b: true }], ['@react-pdf/renderer', { w: 3000 }], ['Server-side React-to-PDF rendering', { w: 3000 }]]),
    dRow([['DOCX Generation', { w: 3000, b: true }], ['docx (npm)', { w: 3000 }], ['Programmatic Word document creation', { w: 3000 }]]),
  ] }));
  s.push(h2('Database Abstraction'));
  s.push(p('ESGwise uses a dual-database architecture with a unified abstraction layer. The USE_LOCAL_DB environment variable switches between SQLite and Firestore implementations at startup, both exporting identical function signatures.'));
  s.push(pb());

  // 4. PRODUCT MODULES
  s.push(h1('4. Product Modules'));

  s.push(h2('4.1 Landing Page & Onboarding'));
  s.push(p('The public-facing landing page communicates ESGwise\'s value proposition with a modern, professional design featuring interactive ESG score visualization, bilingual toggle (EN/AR with full RTL), and dark/light mode.'));
  const li = img(landing); if (li) s.push(li);
  
  s.push(p('A unified entry point allows both Companies (Self-Service) and Consultants (Reporters) to register and manage their distinct workflows securely.'));
  const regImg = img(regType); if (regImg) s.push(regImg);
  
  s.push(p('Consultants (Reporters) are guided through a tailored onboarding flow to set up their consulting practice and manage client companies.'));
  const repsi = img(repStep); if (repsi) s.push(repsi);
  
  s.push(p('Companies are guided through an onboarding flow to input their sector, size, and other details necessary for the AI-powered ESG assessment.'));
  const compsi = img(compStep); if (compsi) s.push(compsi);
  
  s.push(pb());

  s.push(h2('4.2 Company Dashboard'));
  s.push(p('Each company gets a personalized dashboard showing ESG performance across all three pillars with actionable progress tracking.'));
  const di = img(dashboard); if (di) s.push(di);
  s.push(bullet('ESG Score Cards — Environmental, Social, Governance, and Overall scores'));
  s.push(bullet('Assessment Progress Tracker — visual progress bar with status badges'));
  s.push(bullet('Quick Actions — one-click access to Assessment, Analysis, Gap Analysis, Roadmap'));
  s.push(pb());

  s.push(h2('4.3 ESG Assessment Engine'));
  s.push(h3('AI-Powered Document Upload'));
  s.push(p('Companies upload sustainability reports. The Gemini AI engine extracts ESG-relevant data points, maps to GRI Standards, identifies strengths/weaknesses, and generates preliminary scores.'));
  const ai = img(assessment); if (ai) s.push(ai);
  s.push(h3('Manual Structured Questionnaire'));
  s.push(p('A guided questionnaire covering 50+ ESG indicators across Environmental, Social, and Governance categories with sector-specific materiality weighting.'));
  const mi = img(assessManual); if (mi) s.push(mi);
  s.push(pb());

  s.push(h2('4.4 ESG Analysis & Scoring'));
  s.push(p('Multi-stage scoring algorithm: Raw Responses → Materiality Weighting → Sector Benchmarking → Pillar Scores (E/S/G) → Overall Score (0–100) → Rating (CCC to AAA).'));
  const an = img(analysis); if (an) s.push(an);
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Rating', 'Score', 'Meaning'], 3000),
    dRow([['AAA', { w: 3000, b: true, c: BRAND.primary }], ['90–100', { w: 3000 }], ['ESG Leader', { w: 3000 }]]),
    dRow([['AA', { w: 3000, b: true, c: BRAND.primary }], ['80–89', { w: 3000 }], ['Strong Performer', { w: 3000 }]]),
    dRow([['A', { w: 3000, b: true }], ['70–79', { w: 3000 }], ['Above Average', { w: 3000 }]]),
    dRow([['BBB', { w: 3000, b: true }], ['60–69', { w: 3000 }], ['Average', { w: 3000 }]]),
    dRow([['BB', { w: 3000, b: true }], ['50–59', { w: 3000 }], ['Below Average', { w: 3000 }]]),
    dRow([['B', { w: 3000, b: true }], ['40–49', { w: 3000 }], ['Weak', { w: 3000 }]]),
    dRow([['CCC', { w: 3000, b: true }], ['0–39', { w: 3000 }], ['Laggard', { w: 3000 }]]),
  ] }));
  s.push(pb());

  s.push(h2('4.5 Consultant Command Center'));
  s.push(p('The Admin panel is designed for ESG consultants managing multiple client companies — portfolio-level analytics, per-company scoring, and one-click advisory report generation.'));
  const at = img(adminTop); if (at) s.push(at);
  s.push(bullet('Total Hosted Companies, Active Users, Ongoing Assessments, Certificates Issued'));
  s.push(bullet('Client Network Performance — portfolio-wide average E/S/G scores'));
  s.push(bullet('Assessment Progress & Sector/Size Distribution'));
  s.push(pb());

  s.push(h2('4.6 Client Portfolio & Advisory Reports'));
  s.push(p('Consultants generate branded, professional PDF and DOCX advisory reports for each client with strengths, weaknesses, gap analysis, and prioritized action plans.'));
  const po = img(portfolio); if (po) s.push(po);
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Format', 'Use Case']),
    dRow([['PDF', { b: true }], ['Professional delivery to clients, board presentations']]),
    dRow([['DOCX', { b: true }], ['Editable reports for consultant customization']]),
  ] }));
  s.push(pb());

  s.push(h2('4.7 Reports & Document History'));
  const ri = img(reports); if (ri) s.push(ri);
  s.push(pb());

  s.push(h2('4.8 ESG Certificate & Verification'));
  s.push(p('Certified companies receive digitally verifiable ESG certificates with company name, sector, assessment period, ESG score/rating, unique verification code, and QR code for public verification.'));
  s.push(pb());

  // 5. DATA MODEL
  s.push(h1('5. Data Model & Schema'));
  s.push(h2('Core Entities'));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Entity', 'Key Fields', 'Relationships'], 3000),
    dRow([['Users', { w: 3000, b: true }], ['id, email, name, role, is_admin', { w: 3000 }], ['belongs to Company', { w: 3000 }]]),
    dRow([['Companies', { w: 3000, b: true }], ['id, name, name_ar, sector, size, country', { w: 3000 }], ['has Assessments, Users', { w: 3000 }]]),
    dRow([['Assessments', { w: 3000, b: true }], ['id, company_id, title, status, progress', { w: 3000 }], ['belongs to Company', { w: 3000 }]]),
    dRow([['ESG Scores', { w: 3000, b: true }], ['overall, env, soc, gov, rating, strengths, weaknesses', { w: 3000 }], ['belongs to Assessment', { w: 3000 }]]),
    dRow([['Certificates', { w: 3000, b: true }], ['score, rating, verification_code, is_valid, expires_at', { w: 3000 }], ['belongs to Assessment', { w: 3000 }]]),
  ] }));
  s.push(h2('Supporting Tables'));
  s.push(bullet('assessment_responses — Individual question responses per assessment'));
  s.push(bullet('uploaded_documents — AI-analyzed document metadata'));
  s.push(bullet('activity_log — Audit trail for all platform actions'));
  s.push(bullet('chat_messages — AI Assistant conversation history'));
  s.push(pb());

  // 6. AI
  s.push(h1('6. AI Integration'));
  s.push(h2('Document Analysis Pipeline'));
  s.push(p('1. User uploads document (PDF/DOCX) → 2. API sends to Gemini Pro with ESG extraction prompt → 3. AI returns structured ESG indicators JSON → 4. KPIs stored in database → 5. User reviews and accepts/modifies → 6. Assessment responses finalized.'));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['AI Capability', 'Implementation']),
    dRow([['Document ESG extraction', { b: true }], ['Gemini Pro with structured output']]),
    dRow([['Score narratives', { b: true }], ['Context-aware executive summaries']]),
    dRow([['Recommendations', { b: true }], ['Sector-specific improvement suggestions']]),
    dRow([['Gap identification', { b: true }], ['Cross-referencing against GRI indicators']]),
    dRow([['Chat assistance', { b: true }], ['Conversational ESG guidance']]),
  ] }));
  s.push(pb());

  // 7. SECURITY
  s.push(h1('7. Security & Compliance'));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Feature', 'Implementation']),
    dRow([['Password hashing', { b: true }], ['bcrypt (12 rounds)']]),
    dRow([['Sessions', { b: true }], ['HTTP-only secure cookies']]),
    dRow([['Access control', { b: true }], ['Admin / Owner / Member roles']]),
    dRow([['Route protection', { b: true }], ['Server-side middleware checks']]),
    dRow([['Data encryption', { b: true }], ['At rest (SQLite WAL, Firestore native)']]),
    dRow([['API security', { b: true }], ['CORS, input sanitization, parameterized queries']]),
  ] }));
  s.push(h2('Framework Compliance'));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Standard', 'Status']),
    dRow([['GRI Standards'], ['✅ Aligned']]),
    dRow([['IFRS S1/S2'], ['✅ Mapped']]),
    dRow([['UN SDGs'], ['✅ Mapped']]),
    dRow([['ISO 14001'], ['🔄 Planned']]),
    dRow([['CDP Integration'], ['🔄 Planned']]),
  ] }));
  s.push(pb());

  // 8. DEPLOYMENT
  s.push(h1('8. Deployment & Infrastructure'));
  s.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
    hRow(['Component', 'Service']),
    dRow([['Web Application', { b: true }], ['Next.js 15 on Node.js']]),
    dRow([['Static Assets', { b: true }], ['Firebase Hosting CDN']]),
    dRow([['Database (Dev)', { b: true }], ['SQLite (local file)']]),
    dRow([['Database (Prod)', { b: true }], ['Firebase Firestore']]),
    dRow([['AI Processing', { b: true }], ['Google Gemini API']]),
    dRow([['File Storage', { b: true }], ['Firebase Storage']]),
  ] }));
  s.push(h2('Scaling Strategy'));
  s.push(p('Phase 1 (Current): Single Node.js + SQLite/Firestore'));
  s.push(p('Phase 2 (Growth): Containerized Cloud Run + PostgreSQL + Redis'));
  s.push(p('Phase 3 (Scale): Kubernetes + Multi-region DB + CDN Edge Functions'));
  s.push(pb());

  // 9. ROADMAP
  s.push(h1('9. Product Roadmap'));
  s.push(h2('2026 Q3 — Foundation ✅'));
  s.push(bullet('Core assessment engine (AI + Manual)'));
  s.push(bullet('ESG scoring with sector weighting'));
  s.push(bullet('Company dashboard with E/S/G visualization'));
  s.push(bullet('Bilingual EN/AR support'));
  s.push(bullet('Certificate generation and verification'));
  s.push(bullet('Consultant Command Center'));
  s.push(bullet('Advisory report export (PDF + DOCX)'));
  s.push(h2('2026 Q4 — Growth'));
  s.push(bullet('Gap Analysis module with improvement roadmap'));
  s.push(bullet('AI-powered ESG chatbot assistant'));
  s.push(bullet('Bulk assessment (CSV import)'));
  s.push(bullet('Client comparison and benchmarking'));
  s.push(h2('2027 — Scale'));
  s.push(bullet('Enterprise API for banks and investors'));
  s.push(bullet('White-label solution for consulting firms'));
  s.push(bullet('Mobile progressive web app'));
  s.push(bullet('Blockchain-verified certificate registry'));
  s.push(h2('2028 — Global'));
  s.push(bullet('Expansion to Africa, South Asia, Latin America'));
  s.push(bullet('Multi-language support (French, Spanish, Hindi)'));
  s.push(bullet('ESG risk scoring for financial institutions'));
  s.push(bullet('Carbon credit marketplace integration'));
  s.push(pb());

  // CLOSING
  s.push(new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'ESGwise', font: 'Calibri', size: 56, bold: true, color: BRAND.primary })] }));
  s.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Building the ESG infrastructure for emerging markets.', font: 'Calibri', size: 24, italics: true, color: BRAND.dark })] }));
  s.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 400 }, children: [new TextRun({ text: '© 2026 TechnoSeeds International. All rights reserved.', font: 'Calibri', size: 20, color: BRAND.gray })] }));

  // 10. APPENDIX
  s.push(pb());
  s.push(h1('10. Appendix: Full Screen Flow'));
  s.push(p('The following screens represent a comprehensive capture of the ESGwise platform, showing end-to-end workflows.'));
  
  const allFiles = fs.readdirSync(CURRENT_IMG_DIR);
  const autoScreens = allFiles.filter(f => f.startsWith('auto_screen_')).sort((a, b) => {
    return parseInt(a.split('_')[2]) - parseInt(b.split('_')[2]);
  });
  for (const screen of autoScreens) {
     const imgData = loadImg(screen);
     const pImg = img(imgData);
     if (pImg) s.push(pImg);
  }
  const doc = new Document({ styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } }, sections: [{ children: s }] });
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(OUT_DIR, 'ESGwise_Technical_Vision.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`✅ Technical vision saved: ${outPath}`);
}

main().catch(console.error);
