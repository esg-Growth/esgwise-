/**
 * Seed script: Populates the SQLite database with diverse demo companies,
 * assessments, ESG scores, and certificates to exercise the admin analytics dashboard.
 *
 * Usage:  npx tsx scripts/seed-demo-data.ts
 */
import Database from 'better-sqlite3';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';

const DB_PATH = path.join(process.cwd(), 'data', 'esgwise.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── helpers ────────────────────────────────────────────────────
function hashPassword(pw: string): string {
  return crypto.createHash('sha256').update(pw).digest('hex');
}

function randomDate(startDays: number, endDays: number): string {
  const now = Date.now();
  const ms = now - Math.random() * (startDays - endDays) * 86400000 - endDays * 86400000;
  return new Date(ms).toISOString();
}

// ─── Demo Companies ────────────────────────────────────────────
interface DemoCompany {
  id: string; name: string; name_ar: string; sector: string; size: string; country: string; website: string; description: string;
}

const companies: DemoCompany[] = [
  { id: uuid(), name: 'GreenHarvest Agriculture', name_ar: 'جرين هارفست للزراعة', sector: 'agriculture', size: 'medium', country: 'Jordan', website: 'www.greenharvest.jo', description: 'Organic farming company focused on sustainable crop production.' },
  { id: uuid(), name: 'Amman Steel Works', name_ar: 'مصانع عمان للصلب', sector: 'manufacturing', size: 'large', country: 'Jordan', website: 'www.ammansteel.com', description: 'Steel manufacturing with focus on recycled materials.' },
  { id: uuid(), name: 'Petra Foods International', name_ar: 'بترا فودز الدولية', sector: 'food', size: 'medium', country: 'Jordan', website: 'www.petrafoods.jo', description: 'Premium food processing and distribution.' },
  { id: uuid(), name: 'SunRay Energy Solutions', name_ar: 'صن راي لحلول الطاقة', sector: 'energy', size: 'small', country: 'Jordan', website: 'www.sunrayenergy.jo', description: 'Solar energy installation and consulting.' },
  { id: uuid(), name: 'BuildRight Construction', name_ar: 'بيلد رايت للإنشاءات', sector: 'construction', size: 'large', country: 'Jordan', website: 'www.buildright.jo', description: 'Green building certified construction company.' },
  { id: uuid(), name: 'EcoWaste Solutions', name_ar: 'إيكو ويست للحلول البيئية', sector: 'waste', size: 'small', country: 'Jordan', website: 'www.ecowaste.jo', description: 'Waste recycling and circular economy consulting.' },
  { id: uuid(), name: 'FastTrack Logistics', name_ar: 'فاست تراك للخدمات اللوجستية', sector: 'logistics', size: 'medium', country: 'Jordan', website: 'www.fasttrackjo.com', description: 'Regional freight and last-mile delivery services.' },
  { id: uuid(), name: 'TechNova Digital', name_ar: 'تك نوفا للتقنية الرقمية', sector: 'technology', size: 'small', country: 'Jordan', website: 'www.technova.jo', description: 'Software development and digital transformation.' },
  { id: uuid(), name: 'Royal Health Group', name_ar: 'رويال هيلث جروب', sector: 'healthcare', size: 'large', country: 'Jordan', website: 'www.royalhealth.jo', description: 'Hospital network and pharmaceutical distribution.' },
  { id: uuid(), name: 'Olive Valley Co-op', name_ar: 'تعاونية وادي الزيتون', sector: 'agriculture', size: 'small', country: 'Jordan', website: 'www.olivevalley.jo', description: 'Traditional olive oil and natural products co-operative.' },
];

// ─── Demo score profiles (varying quality) ──────────────────────
interface ScoreProfile {
  env: number; soc: number; gov: number; overall: number; rating: string;
  strengths: string; weaknesses: string; gaps: string;
  recommendations: string;
}

const profiles: ScoreProfile[] = [
  { env: 78, soc: 65, gov: 72, overall: 72, rating: 'A', strengths: 'Energy Management,Water Stewardship', weaknesses: 'Social Impact Assessment', gaps: 'Biodiversity Policy', recommendations: 'Develop a formal biodiversity protection plan; Increase community engagement programs; Publish annual sustainability report.' },
  { env: 45, soc: 55, gov: 40, overall: 47, rating: 'B', strengths: 'Employee Benefits', weaknesses: 'Emissions Reporting,Waste Management,Board Diversity', gaps: 'Scope 3 Emissions,Supplier Assessment', recommendations: 'Begin Scope 1 & 2 GHG inventory; Establish anti-corruption training; Improve waste diversion rate above 50%; Create supplier code of conduct.' },
  { env: 82, soc: 78, gov: 85, overall: 82, rating: 'AA', strengths: 'Food Safety,Supply Chain Traceability,Anti-corruption', weaknesses: '', gaps: 'Packaging Lifecycle Analysis', recommendations: 'Conduct full packaging lifecycle analysis; Target zero food waste by 2028; Explore regenerative sourcing.' },
  { env: 92, soc: 70, gov: 80, overall: 84, rating: 'AA', strengths: 'Renewable Energy,Emissions Reduction', weaknesses: 'Community Engagement', gaps: '', recommendations: 'Expand community benefit-sharing programs; Obtain ISO 14001 certification; Set science-based targets.' },
  { env: 55, soc: 60, gov: 50, overall: 55, rating: 'BB', strengths: 'Worker Safety', weaknesses: 'Material Sourcing,Energy Efficiency', gaps: 'Environmental Impact Assessment,Green Building Standards', recommendations: 'Adopt LEED or EDGE green building certification; Implement construction waste management plan; Conduct environmental impact assessments for all projects.' },
  { env: 88, soc: 65, gov: 75, overall: 78, rating: 'A', strengths: 'Waste Diversion,Circular Economy', weaknesses: 'Worker Training', gaps: 'Community Health Monitoring', recommendations: 'Invest in specialized worker training; Establish community health monitoring around facilities; Achieve zero waste to landfill.' },
  { env: 50, soc: 58, gov: 55, overall: 54, rating: 'BB', strengths: 'Route Optimization', weaknesses: 'Fleet Emissions,Driver Safety Programs', gaps: 'Carbon Offset Strategy', recommendations: 'Transition 30% of fleet to electric vehicles by 2027; Implement comprehensive driver safety program; Develop carbon offset procurement strategy.' },
  { env: 60, soc: 85, gov: 90, overall: 80, rating: 'AA', strengths: 'Data Privacy,Diversity & Inclusion,Digital Ethics', weaknesses: 'E-waste Management', gaps: '', recommendations: 'Implement e-waste take-back program; Publish transparency report; Set renewable energy target for data centers.' },
  { env: 55, soc: 90, gov: 82, overall: 78, rating: 'A', strengths: 'Patient Safety,Data Privacy,Worker Health', weaknesses: 'Medical Waste Reduction', gaps: 'Pharmaceutical Disposal Tracking', recommendations: 'Reduce medical waste by 20% through segregation improvements; Implement pharmaceutical disposal tracking; Achieve JCI sustainability accreditation.' },
  { env: 70, soc: 50, gov: 45, overall: 56, rating: 'BB', strengths: 'Organic Certification', weaknesses: 'Governance Structure,Anti-corruption Policy', gaps: 'Board Independence,Financial Transparency', recommendations: 'Establish independent board members; Create formal anti-corruption policy; Implement transparent financial reporting; Develop succession planning.' },
];

// ─── Main seed function ────────────────────────────────────────
function seed() {
  console.log('🌱 Seeding ESGwise demo data...');

  db.transaction(() => {
    // 1. Insert companies
    const insertCompany = db.prepare(`
      INSERT OR IGNORE INTO companies (id, name, name_ar, sector, country, size, website, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const c of companies) {
      const createdAt = randomDate(180, 30);
      insertCompany.run(c.id, c.name, c.name_ar, c.sector, c.country, c.size, c.website, c.description, createdAt, createdAt);
    }
    console.log(`  ✅ Inserted ${companies.length} companies.`);

    // 2. Insert users (one per company)
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, email, password_hash, name, name_ar, role, company_id, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const passwordHash = hashPassword('demo123');
    for (const c of companies) {
      const slug = c.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
      const email = `${slug}@demo.esgwise.jo`;
      const userId = uuid();
      insertUser.run(userId, email, passwordHash, c.name.split(' ')[0] + ' Manager', '', 'owner', c.id, 1, randomDate(150, 20));
    }
    console.log(`  ✅ Inserted ${companies.length} users.`);

    // 3. Insert assessments + scores + certificates
    const insertAssessment = db.prepare(`
      INSERT OR IGNORE INTO assessments (id, company_id, title, period, status, progress, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertScore = db.prepare(`
      INSERT OR IGNORE INTO esg_scores (id, assessment_id, company_id, overall_score, env_score, soc_score, gov_score, rating, data_completeness, strengths, weaknesses, gaps, recommendations, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertCert = db.prepare(`
      INSERT OR IGNORE INTO certificates (id, company_id, assessment_id, score, rating, sector, issued_at, expires_at, verification_code, is_valid)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    let certs = 0;
    for (let i = 0; i < companies.length; i++) {
      const c = companies[i];
      const p = profiles[i];

      // Decide status
      const isCompleted = p.overall >= 60;
      const isDraft = p.overall < 40;
      const status = isCompleted ? 'completed' : (isDraft ? 'draft' : 'in_progress');
      const progress = isCompleted ? 100 : (isDraft ? Math.floor(Math.random() * 30 + 10) : Math.floor(Math.random() * 40 + 40));

      const assessmentId = uuid();
      const createdAt = randomDate(120, 10);
      const updatedAt = randomDate(10, 0);

      insertAssessment.run(assessmentId, c.id, `${c.name} ESG Assessment 2024`, '2024', status, progress, createdAt, updatedAt);

      const completeness = isCompleted ? 95 : progress;
      insertScore.run(uuid(), assessmentId, c.id, p.overall, p.env, p.soc, p.gov, p.rating, completeness, p.strengths, p.weaknesses, p.gaps, p.recommendations, updatedAt);

      // Issue certificate for completed assessments with score >= 60
      if (isCompleted && p.overall >= 60) {
        const prefix = 'ESG';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = crypto.randomBytes(3).toString('hex').toUpperCase();
        const verificationCode = `${prefix}-${timestamp}-${random}-${i}`;
        const issuedAt = updatedAt;
        const expiresAt = new Date(new Date(issuedAt).getTime() + 365 * 86400000).toISOString();

        insertCert.run(uuid(), c.id, assessmentId, p.overall, p.rating, c.sector, issuedAt, expiresAt, verificationCode, 1);
        certs++;
      }
    }

    console.log(`  ✅ Inserted ${companies.length} assessments with ESG scores.`);
    console.log(`  ✅ Issued ${certs} certificates.`);
  })();

  console.log('\n🎉 Demo data seeded successfully!');
}

seed();
db.close();
