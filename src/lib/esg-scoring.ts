import { ASSESSMENT_SECTIONS, Section } from './questionnaire';
import { getSectorById, getRatingFromScore } from './gri-standards';

export interface ScoreBreakdown {
  overall: number;
  env: number;
  soc: number;
  gov: number;
  rating: string;
  dataCompleteness: number;
  sectionScores: Record<string, { score: number; answered: number; total: number }>;
  strengths: string[];
  weaknesses: string[];
  gaps: string[];
}

export function calculateEsgScore(responses: Record<string, string>, sectorId: string): ScoreBreakdown {
  const sector = getSectorById(sectorId);
  const weights = sector?.weights || { env: 33, soc: 34, gov: 33 };

  const sectionScores: Record<string, { score: number; answered: number; total: number }> = {};
  const pillarScores: Record<string, number[]> = { Environmental: [], Social: [], Governance: [] };
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const gaps: string[] = [];

  let totalAnswered = 0;
  let totalQuestions = 0;

  for (const section of ASSESSMENT_SECTIONS) {
    let sectionScore = 0;
    let answered = 0;

    for (const q of section.questions) {
      totalQuestions++;
      const val = responses[q.id];
      if (!val || val.trim() === '') {
        gaps.push(`${section.title}: ${q.label} (${q.gri_code || 'N/A'})`);
        continue;
      }

      answered++;
      totalAnswered++;
      let qScore = 0;

      if (q.type === 'yes_no') {
        qScore = val === 'yes' ? 100 : 20;
      } else if (q.type === 'percentage') {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          // Check if it's a "bad" metric (lower is better)
          const lowerIsBetter = q.id.includes('turnover') || q.id.includes('injury') || q.id.includes('fatalities') || q.id.includes('discrimination') || q.id.includes('corruption') || q.id.includes('breaches');
          qScore = lowerIsBetter ? Math.max(0, 100 - num * 2) : Math.min(100, num);
        }
      } else if (q.type === 'number') {
        const num = parseFloat(val);
        if (!isNaN(num)) {
          const lowerIsBetter = q.id.includes('injury') || q.id.includes('fatalities') || q.id.includes('discrimination') || q.id.includes('corruption') || q.id.includes('breaches') || q.id.includes('hazardous');
          qScore = num > 0 ? (lowerIsBetter ? Math.max(0, 80 - num * 10) : Math.min(100, 60 + Math.log10(num + 1) * 15)) : 30;
        }
      } else {
        qScore = val.length > 10 ? 70 : 40;
      }

      sectionScore += qScore;
    }

    const total = section.questions.length;
    const avgScore = answered > 0 ? Math.round(sectionScore / answered) : 0;
    const completenessBonus = Math.round((answered / total) * 20);
    const finalScore = Math.min(100, avgScore + completenessBonus - (total - answered) * 3);

    sectionScores[section.id] = { score: Math.max(0, finalScore), answered, total };
    pillarScores[section.pillar].push(Math.max(0, finalScore));

    if (finalScore >= 70) strengths.push(section.title);
    else if (finalScore < 40 && answered > 0) weaknesses.push(section.title);
  }

  const envScores = pillarScores['Environmental'];
  const socScores = pillarScores['Social'];
  const govScores = pillarScores['Governance'];

  const env = envScores.length > 0 ? Math.round(envScores.reduce((a, b) => a + b, 0) / envScores.length) : 0;
  const soc = socScores.length > 0 ? Math.round(socScores.reduce((a, b) => a + b, 0) / socScores.length) : 0;
  const gov = govScores.length > 0 ? Math.round(govScores.reduce((a, b) => a + b, 0) / govScores.length) : 0;

  const overall = Math.round((env * weights.env + soc * weights.soc + gov * weights.gov) / 100);
  const dataCompleteness = Math.round((totalAnswered / totalQuestions) * 100);
  const rating = getRatingFromScore(overall);

  return { overall, env, soc, gov, rating, dataCompleteness, sectionScores, strengths, weaknesses, gaps: gaps.slice(0, 15) };
}
