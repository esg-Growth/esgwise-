/**
 * Generates v2.0 of ESGwise Investor Pitch Deck & Technical Vision
 * reflecting the multi-tenant reporter/client transformation.
 */
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, HeadingLevel, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', '..', 'docs-private');

// ── Shared helpers ──
const hdr = (text, level = HeadingLevel.HEADING_1) =>
  new Paragraph({ heading: level, spacing: { before: 300, after: 100 }, children: [new TextRun({ text, bold: true })] });

const para = (text, opts = {}) =>
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text, ...opts })] });

const bullet = (text) => new Paragraph({ bullet: { level: 0 }, children: [new TextRun(text)] });

const tblRow = (cells, header = false) =>
  new TableRow({ children: cells.map(c => new TableCell({
    width: { size: 100 / cells.length, type: WidthType.PERCENTAGE },
    children: [new Paragraph({ children: [new TextRun({ text: c, bold: header })] })],
  })) });

const simpleTable = (headers, rows) =>
  new Table({ width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [tblRow(headers, true), ...rows.map(r => tblRow(r))] });

// ═══════════════════════════════════════════════════════════
//  PITCH DECK v2.0
// ═══════════════════════════════════════════════════════════
async function buildPitchDeck() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        // COVER
        hdr('ESGwise — Investor Pitch Deck'),
        para('Version 2.0 — May 2026', { italics: true }),
        para('Multi-Tenant SaaS for ESG Reporting & Advisory'),
        para('By TechnoSeeds International', { bold: true }),

        // PROBLEM
        hdr('🌍 The Problem'),
        bullet('120,000+ MENA SMEs face mandatory ESG disclosure (2025-2028)'),
        bullet('ESG consulting is expensive ($10K-$50K per engagement)'),
        bullet('No affordable, Arabic-first, AI-powered ESG platform exists'),
        bullet('ESG reporters (consultants) lack multi-client management tools'),

        // SOLUTION
        hdr('💡 The Solution'),
        para('ESGwise is an AI-powered, bilingual (EN/AR) ESG assessment and reporting platform built for the MENA region. It serves two complementary user segments:'),
        hdr('Dual-Mode Architecture', HeadingLevel.HEADING_2),
        simpleTable(
          ['Mode', 'Description', 'User'],
          [
            ['Reporter-Managed', 'ESG consultant enters data on behalf of client companies (NDA/confidential)', 'ESG Reporters'],
            ['Self-Entry', 'Companies manage their own ESG assessments directly', 'Company Teams'],
          ]
        ),
        para(''),
        bullet('Multi-tenant: Each reporter manages a portfolio of client companies'),
        bullet('Company switching: Reporters seamlessly switch between clients'),
        bullet('Role-based access: platform_admin → reporter → company_admin → company_member'),
        bullet('Invitation system: Reporters invite client users; companies invite team members'),
        bullet('Cloud-native: 100% Firestore — no local databases, instant sync'),

        // PRODUCT
        hdr('🛠️ Product Features'),
        bullet('GRI-aligned ESG assessment engine with sector-specific weighting'),
        bullet('AI-powered document analysis (Gemini Pro) for KPI extraction'),
        bullet('Professional report generation (PDF, DOCX) with bilingual support'),
        bullet('Gap analysis with AI-generated improvement roadmaps'),
        bullet('Verifiable ESG certificates with unique verification codes'),
        bullet('Reporter Command Center — multi-client portfolio management'),
        bullet('Company-level data isolation with tenant-scoped Firestore queries'),

        // MARKET
        hdr('📈 Market Size'),
        simpleTable(
          ['Metric', 'Value'],
          [
            ['Global ESG Software Market (2026)', '$1.8B'],
            ['MENA ESG Market Growth (CAGR)', '22.4%'],
            ['Target: MENA SMEs (addressable)', '120,000+ companies'],
            ['Target: MENA ESG Consultants', '2,000+ firms'],
            ['SOM Year 1', '500 companies + 50 reporters = $900K ARR'],
            ['SOM Year 3', '5,000 companies + 300 reporters = $12M ARR'],
          ]
        ),
        para('Why MENA First? Jordan, Saudi Arabia, UAE, and Egypt are implementing mandatory ESG disclosure regulations between 2025–2028. First-mover advantage is critical.', { italics: true }),

        // BUSINESS MODEL
        hdr('💰 Business Model'),
        hdr('Revenue Streams', HeadingLevel.HEADING_2),
        simpleTable(
          ['Stream', 'Description', 'Pricing'],
          [
            ['SaaS Subscriptions', 'Company self-service platform', '$99–$499/mo'],
            ['Reporter Licenses', 'Multi-client portfolio management (per-seat)', '$199–$999/mo'],
            ['Per-Company Add-on', 'Additional client slots for reporters', '$49/company/mo'],
            ['Advisory Report Credits', 'Professional PDF/DOCX exports', '$25–$100/report'],
            ['Certificate Verification', 'Verifiable ESG certificates', '$50/certificate'],
            ['Enterprise API', 'ESG data for banks & investors', 'Custom pricing'],
          ]
        ),
        hdr('Unit Economics', HeadingLevel.HEADING_2),
        simpleTable(
          ['Metric', 'Value'],
          [['CAC', '~$120'], ['LTV', '~$4,200'], ['LTV/CAC Ratio', '35x'], ['Gross Margin', '85%+']]
        ),

        // COMPETITIVE MOAT
        hdr('🛡️ Competitive Moat'),
        simpleTable(
          ['Competitor', 'Region', 'Target', 'AI', 'Arabic', 'Multi-Reporter', 'Price'],
          [
            ['Sustainalytics', 'Global', 'Enterprise', '❌', '❌', '❌', '$$$$$'],
            ['EcoVadis', 'Europe', 'Mid-market', '❌', '❌', '❌', '$$$$'],
            ['ESGwise', 'MENA-first', 'SMEs + Reporters', '✅ Full', '✅ Native', '✅ Built-in', '$'],
          ]
        ),

        // GTM
        hdr('🗺️ Go-to-Market Strategy'),
        hdr('Phase 1: Jordan (2026 Q3–Q4)', HeadingLevel.HEADING_2),
        bullet('Partner with 5 ESG consulting firms as reporter tenants'),
        bullet('Onboard 50 pilot companies (mix of reporter-managed and self-entry)'),
        bullet('Achieve $75K MRR'),
        hdr('Phase 2: MENA Expansion (2027)', HeadingLevel.HEADING_2),
        bullet('Launch in Saudi Arabia, UAE, Egypt'),
        bullet('Regulatory partnership with local stock exchanges'),
        bullet('Target 500 companies + 100 reporters, $300K MRR'),
        hdr('Phase 3: Global Scale (2028+)', HeadingLevel.HEADING_2),
        bullet('Enterprise API for banks, PE firms, VCs'),
        bullet('White-label for major consultancies'),
        bullet('Target 5,000+ companies + 300 reporters, $1M+ MRR'),

        // THE ASK
        hdr('💵 The Ask'),
        hdr('Raising: $500K Pre-Seed', HeadingLevel.HEADING_2),
        simpleTable(
          ['Use of Funds', 'Allocation'],
          [
            ['Product Development & AI', '40% ($200K)'],
            ['Sales & Marketing', '25% ($125K)'],
            ['ESG Content & Compliance', '15% ($75K)'],
            ['Operations & Infra', '10% ($50K)'],
            ['Reserve', '10% ($50K)'],
          ]
        ),
        hdr('12-Month Milestones', HeadingLevel.HEADING_2),
        bullet('Launch v2.0 with multi-tenant reporter platform'),
        bullet('50 paying companies + 10 reporter firms'),
        bullet('Achieve $75K MRR'),
        bullet('GRI official alignment certification'),
        bullet('Series A readiness ($3M round)'),

        // FOOTER
        para(''),
        para('ESGwise', { bold: true }),
        para('by TechnoSeeds International'),
        para('"We\'re not just building a tool — we\'re building the ESG infrastructure for emerging markets."', { italics: true }),
        para('🌐 esgwise.jo  ·  ✉️ invest@esgwise.jo'),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, 'ESGwise_Investor_Pitch_Deck_v2.docx'), buf);
  console.log('✅ Pitch Deck v2.0 written');
}

// ═══════════════════════════════════════════════════════════
//  TECHNICAL VISION v2.0
// ═══════════════════════════════════════════════════════════
async function buildTechVision() {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        hdr('ESGwise — Technical Vision & Architecture'),
        para('Version 2.0 — May 2026', { italics: true }),
        para('Multi-Tenant, Cloud-Native ESG Platform'),

        // 1. EXECUTIVE SUMMARY
        hdr('1. Executive Summary'),
        para('ESGwise is an AI-powered, bilingual (EN/AR) ESG assessment and sustainability reporting platform purpose-built for MENA SMEs and ESG consulting firms. Version 2.0 introduces a multi-tenant architecture supporting both ESG reporters (consultants) and direct company self-service.'),

        // 2. ARCHITECTURE
        hdr('2. System Architecture'),
        hdr('2.1 Multi-Tenant Hierarchy', HeadingLevel.HEADING_2),
        simpleTable(
          ['Role', 'Scope', 'Capabilities'],
          [
            ['platform_admin', 'Full platform', 'All data, user management, analytics'],
            ['reporter', 'Own client portfolio', 'Create/manage companies, enter data, switch companies'],
            ['company_admin', 'Own company', 'Assessment, documents, team management'],
            ['company_member', 'Own company (limited)', 'Data entry, view reports'],
          ]
        ),
        hdr('2.2 Dual Data-Entry Modes', HeadingLevel.HEADING_2),
        simpleTable(
          ['Mode', 'Data Entry By', 'Use Case'],
          [
            ['reporter_managed', 'Reporter', 'Confidential data, NDA agreements, technical guidance'],
            ['self_entry', 'Company team', 'Non-confidential data, direct reporting'],
          ]
        ),
        hdr('2.3 Technology Stack', HeadingLevel.HEADING_2),
        simpleTable(
          ['Component', 'Technology'],
          [
            ['Frontend', 'Next.js 16 (App Router, React 19, Server Components)'],
            ['Styling', 'Vanilla CSS + CSS Modules (dark/light theme)'],
            ['Authentication', 'NextAuth.js v5 (JWT strategy) + bcrypt'],
            ['Database', 'Firebase Firestore (cloud-only, no local SQLite)'],
            ['AI Engine', 'Google Gemini Pro (document analysis, scoring, recommendations)'],
            ['Export', 'DOCX (docx.js), PDF (jsPDF + html2canvas), XLSX'],
            ['Language', 'TypeScript 5, bilingual EN/AR'],
          ]
        ),

        // 3. DATA MODEL
        hdr('3. Data Model (Firestore Collections)'),
        hdr('3.1 Core Collections', HeadingLevel.HEADING_2),
        simpleTable(
          ['Collection', 'Key Fields', 'Relationships'],
          [
            ['reporters', 'name, firm_name, email', 'has many Companies'],
            ['users', 'email, name, role, reporter_id, company_id', 'belongs to Company and/or Reporter'],
            ['companies', 'name, sector, data_mode, reporter_id, size, country', 'has Assessments, Users; optionally belongs to Reporter'],
            ['assessments', 'company_id, responses, sector_id, status, progress', 'belongs to Company'],
            ['esg_scores', 'company_id, overall_score, env_score, soc_score, gov_score', 'belongs to Company'],
            ['certificates', 'company_id, assessment_id, verification_code, is_valid', 'belongs to Assessment'],
            ['invitations', 'company_id, email, role, token, status, expires_at', 'belongs to Company'],
          ]
        ),
        hdr('3.2 Supporting Collections', HeadingLevel.HEADING_2),
        bullet('uploaded_documents — AI-analyzed document metadata'),
        bullet('kpi_provenance — Extracted KPI lineage from documents'),
        bullet('chat_messages — AI Assistant conversation history'),
        bullet('password_resets — Token-based password recovery'),
        bullet('tenant_settings — Platform branding and theming'),

        // 4. AUTH & SESSION
        hdr('4. Authentication & Session Management'),
        para('NextAuth.js v5 with JWT strategy. The JWT token carries:'),
        bullet('userId, email, name, role'),
        bullet('companyId — current company context'),
        bullet('reporterId — present for reporter role'),
        bullet('activeCompanyId — the company the reporter is currently managing'),
        para(''),
        para('Session updates use the NextAuth "update" trigger, allowing reporters to switch active companies without re-authentication.'),

        // 5. REPORTER WORKFLOWS
        hdr('5. Reporter Workflow'),
        bullet('1. Reporter registers → creates reporter profile + user account'),
        bullet('2. Reporter creates client companies → each with a data_mode flag'),
        bullet('3. For reporter_managed companies → reporter enters all ESG data'),
        bullet('4. For self_entry companies → reporter invites company users via email'),
        bullet('5. Reporter switches between companies via the Client Management dashboard'),
        bullet('6. All data queries are scoped to the active company via JWT'),

        // 6. SECURITY
        hdr('6. Security & Data Isolation'),
        simpleTable(
          ['Feature', 'Implementation'],
          [
            ['Password hashing', 'bcrypt (12 rounds)'],
            ['Sessions', 'HTTP-only secure JWT cookies'],
            ['Tenant isolation', 'All Firestore queries scoped by companyId from JWT'],
            ['Reporter scoping', 'Reporter can only access companies where reporter_id matches'],
            ['Role-based access', 'platform_admin / reporter / company_admin / company_member'],
            ['Invitation system', 'Cryptographic tokens with 7-day expiry'],
            ['Data encryption', 'Firestore native encryption at rest'],
          ]
        ),

        // 7. AI INTEGRATION
        hdr('7. AI Integration (Gemini Pro)'),
        bullet('Document ESG extraction — Structured output from uploaded PDF/DOCX'),
        bullet('Score narratives — Context-aware executive summaries'),
        bullet('Gap identification — Cross-referencing against GRI indicators'),
        bullet('Improvement roadmaps — Sector-specific action plans'),
        bullet('Chat assistance — Conversational ESG guidance'),

        // 8. DEPLOYMENT
        hdr('8. Deployment & Infrastructure'),
        simpleTable(
          ['Component', 'Service'],
          [
            ['Web Application', 'Next.js 16 on Node.js'],
            ['Static Assets', 'Firebase Hosting CDN'],
            ['Database', 'Firebase Firestore (cloud-only)'],
            ['AI Processing', 'Google Gemini API'],
            ['File Storage', 'Firebase Storage'],
          ]
        ),
        hdr('Scaling Strategy', HeadingLevel.HEADING_2),
        bullet('Phase 1 (Current): Single Node.js + Firestore'),
        bullet('Phase 2 (Growth): Containerized Cloud Run + PostgreSQL + Redis'),
        bullet('Phase 3 (Scale): Kubernetes + Multi-region DB + CDN Edge Functions'),

        // 9. ROADMAP
        hdr('9. Product Roadmap'),
        hdr('2026 Q3 — Foundation ✅', HeadingLevel.HEADING_2),
        bullet('Core assessment engine (AI + Manual)'),
        bullet('Multi-tenant reporter/client architecture'),
        bullet('Cloud-only Firestore backend'),
        bullet('Role-based access control (4-tier)'),
        bullet('Invitation-based onboarding'),
        bullet('Bilingual EN/AR support'),
        bullet('Certificate generation and verification'),
        bullet('Reporter Command Center'),
        hdr('2026 Q4 — Growth', HeadingLevel.HEADING_2),
        bullet('Client comparison dashboard for reporters'),
        bullet('Bulk assessment (CSV import)'),
        bullet('AI-powered ESG chatbot assistant'),
        bullet('Reporter analytics and portfolio insights'),
        hdr('2027 — Scale', HeadingLevel.HEADING_2),
        bullet('Enterprise API for banks and investors'),
        bullet('White-label solution for consulting firms'),
        bullet('Mobile progressive web app'),
        bullet('Blockchain-verified certificate registry'),
        hdr('2028 — Global', HeadingLevel.HEADING_2),
        bullet('Expansion to Africa, South Asia, Latin America'),
        bullet('Multi-language support (French, Spanish, Hindi)'),
        bullet('ESG risk scoring for financial institutions'),
        bullet('Carbon credit marketplace integration'),

        // FOOTER
        para(''),
        para('ESGwise', { bold: true }),
        para('Building the ESG infrastructure for emerging markets.', { italics: true }),
        para('© 2026 TechnoSeeds International. All rights reserved.'),
      ],
    }],
  });

  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(outDir, 'ESGwise_Technical_Vision_v2.docx'), buf);
  console.log('✅ Technical Vision v2.0 written');
}

(async () => {
  await buildPitchDeck();
  await buildTechVision();
  console.log('Done!');
})();
