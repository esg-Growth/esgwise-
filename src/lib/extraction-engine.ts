import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Data Source Categories ───

export interface DataSource {
  id: string;
  category: string;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  icon: string;
  acceptedFormats: string[];
  mappedQuestionIds: string[];
  exampleFiles: string;
  exampleFiles_ar: string;
}

export const DATA_SOURCES: DataSource[] = [
  {
    id: 'hr', category: 'hr', title: 'HR & Employees', title_ar: 'الموارد البشرية والموظفين',
    description: 'Upload employee lists, payroll data, or org charts',
    description_ar: 'ارفع قوائم الموظفين أو بيانات الرواتب أو الهيكل التنظيمي',
    icon: '👥', acceptedFormats: ['.xlsx', '.csv', '.pdf', '.docx'],
    mappedQuestionIds: ['s_employees', 's_turnover', 's_new_hires', 's_benefits', 's_parental_leave', 's_gender_ratio', 's_gender_mgmt', 's_training_hours', 's_training_budget', 's_injury_rate', 's_fatalities'],
    exampleFiles: 'Employee list, payroll summary, HR report',
    exampleFiles_ar: 'قائمة الموظفين، ملخص الرواتب، تقرير الموارد البشرية',
  },
  {
    id: 'energy', category: 'energy', title: 'Energy & Electricity', title_ar: 'الطاقة والكهرباء',
    description: 'Upload electricity bills, fuel receipts, or energy reports',
    description_ar: 'ارفع فواتير الكهرباء أو إيصالات الوقود أو تقارير الطاقة',
    icon: '⚡', acceptedFormats: ['.pdf', '.xlsx', '.csv', '.jpg', '.png'],
    mappedQuestionIds: ['e_energy_total', 'e_energy_reduction', 'e_energy_intensity', 'e_scope1', 'e_scope2'],
    exampleFiles: 'Electricity bill, fuel purchase log, energy audit',
    exampleFiles_ar: 'فاتورة كهرباء، سجل شراء الوقود، تدقيق الطاقة',
  },
  {
    id: 'solar', category: 'solar', title: 'Solar / PV Production', title_ar: 'إنتاج الطاقة الشمسية',
    description: 'Upload PV monitoring data, inverter reports, or solar production logs',
    description_ar: 'ارفع بيانات مراقبة الألواح الشمسية أو تقارير العاكس',
    icon: '☀️', acceptedFormats: ['.xlsx', '.csv', '.pdf'],
    mappedQuestionIds: ['e_energy_renewable', 'e_energy_total', 'e_emission_reduction'],
    exampleFiles: 'PV system report, monthly generation data, inverter export',
    exampleFiles_ar: 'تقرير النظام الشمسي، بيانات التوليد الشهرية',
  },
  {
    id: 'water', category: 'water', title: 'Water', title_ar: 'المياه',
    description: 'Upload water utility bills or meter readings',
    description_ar: 'ارفع فواتير المياه أو قراءات العدادات',
    icon: '💧', acceptedFormats: ['.pdf', '.xlsx', '.csv', '.jpg', '.png'],
    mappedQuestionIds: ['e_water_total', 'e_water_recycled'],
    exampleFiles: 'Water bill, meter reading log, treatment report',
    exampleFiles_ar: 'فاتورة مياه، سجل قراءات العدادات',
  },
  {
    id: 'waste', category: 'waste', title: 'Waste & Recycling', title_ar: 'النفايات وإعادة التدوير',
    description: 'Upload waste collection receipts or recycling reports',
    description_ar: 'ارفع إيصالات جمع النفايات أو تقارير إعادة التدوير',
    icon: '🗑️', acceptedFormats: ['.pdf', '.xlsx', '.csv'],
    mappedQuestionIds: ['e_waste_total', 'e_waste_recycled', 'e_waste_hazardous'],
    exampleFiles: 'Waste manifest, recycling certificate, disposal report',
    exampleFiles_ar: 'بيان النفايات، شهادة إعادة التدوير',
  },
  {
    id: 'policies', category: 'policies', title: 'Policies & Documents', title_ar: 'السياسات والوثائق',
    description: 'Upload company policies, handbooks, or codes of conduct',
    description_ar: 'ارفع سياسات الشركة أو كتيبات الموظفين أو مدونات السلوك',
    icon: '📋', acceptedFormats: ['.pdf', '.docx', '.doc'],
    mappedQuestionIds: ['e_energy_policy', 'e_water_policy', 'e_waste_policy', 'e_emission_target', 's_ohs_system', 's_safety_training', 's_skill_program', 's_equal_pay', 'g_ethics_code', 'g_anticorruption_policy', 'g_whistleblower', 'g_ethics_training', 'g_risk_framework', 'g_esg_risks', 'g_privacy_policy'],
    exampleFiles: 'HR handbook, ethics policy, safety manual, privacy policy',
    exampleFiles_ar: 'كتيب الموارد البشرية، سياسة الأخلاقيات، دليل السلامة',
  },
  {
    id: 'financial', category: 'financial', title: 'Financial Data', title_ar: 'البيانات المالية',
    description: 'Upload annual reports or financial statements',
    description_ar: 'ارفع التقارير السنوية أو البيانات المالية',
    icon: '💰', acceptedFormats: ['.pdf', '.xlsx', '.csv'],
    mappedQuestionIds: ['e_energy_intensity', 'g_board_size', 'g_board_independent', 'g_board_diversity', 'g_esg_committee'],
    exampleFiles: 'Annual report, financial statement, board composition',
    exampleFiles_ar: 'التقرير السنوي، البيانات المالية، تشكيل مجلس الإدارة',
  },
  {
    id: 'custom', category: 'custom', title: 'Other Documents', title_ar: 'مستندات أخرى',
    description: 'Upload any ESG-relevant document',
    description_ar: 'ارفع أي مستند ذي صلة بالاستدامة',
    icon: '📊', acceptedFormats: ['.pdf', '.xlsx', '.csv', '.docx', '.jpg', '.png'],
    mappedQuestionIds: [],
    exampleFiles: 'CSR report, sustainability audit, certifications',
    exampleFiles_ar: 'تقرير المسؤولية الاجتماعية، تدقيق الاستدامة',
  },
];

// ─── Extraction Types ───

export interface ExtractedKpi {
  questionId: string;
  label: string;
  value: string;
  unit?: string;
  confidence: number;
  evidence: string;
}

export interface ExtractionResult {
  documentId: string;
  category: string;
  extractedKpis: ExtractedKpi[];
  summary: string;
  summary_ar: string;
}

// ─── Category-specific extraction prompts ───

function getExtractionPrompt(category: string, content: string): string {
  const base = `You are an ESG data extraction specialist. Analyze the following document content and extract ESG-relevant Key Performance Indicators (KPIs). The user is a small/medium business — they uploaded raw data and don't know ESG terminology.

Return a JSON object with this exact structure:
{
  "kpis": [
    {
      "questionId": "<the question ID from the list below>",
      "label": "<human-readable label for what was extracted>",
      "value": "<extracted numeric value or 'yes'/'no'>",
      "unit": "<unit if applicable>",
      "confidence": <0.0-1.0 confidence score>,
      "evidence": "<exact quote or reference from the document supporting this value>"
    }
  ],
  "summary": "<2-3 sentence English summary of what was found>",
  "summary_ar": "<2-3 sentence Arabic summary of what was found>"
}

IMPORTANT RULES:
- Only extract KPIs you can clearly find or calculate from the data
- For yes/no questions, return "yes" or "no" based on whether the document indicates the policy/practice exists
- For numeric values, convert to the standard unit (MWh for energy, tonnes for waste, m³ for water, etc.)
- confidence should reflect how certain you are: 0.9+ for clear data, 0.5-0.8 for inferred/calculated, <0.5 for uncertain
- If a percentage can be calculated (e.g., female/total employees), calculate it
- Return ONLY valid JSON, no markdown formatting\n\n`;

  const categoryPrompts: Record<string, string> = {
    hr: `CONTEXT: This is HR/Employee data. Extract workforce metrics.
QUESTION IDS TO MAP:
- s_employees: Total number of employees (count all rows if it's an employee list)
- s_turnover: Employee turnover rate (% of employees who left)
- s_new_hires: Number of new hires in the period
- s_benefits: Whether benefits are provided to full-time employees (yes/no)
- s_parental_leave: Whether parental leave policy exists (yes/no)
- s_gender_ratio: Percentage of female employees (count females / total * 100)
- s_gender_mgmt: Women in management positions (%)
- s_training_hours: Average training hours per employee
- s_training_budget: Training budget as % of payroll
- s_injury_rate: Work-related injury rate
- s_fatalities: Work-related fatalities
- s_discrimination: Discrimination incidents reported`,

    energy: `CONTEXT: This is an energy/electricity document (bill, report, meter data).
QUESTION IDS TO MAP:
- e_energy_total: Total energy consumption in MWh (convert from kWh if needed: divide by 1000)
- e_energy_reduction: Energy reduction year-over-year (%)
- e_energy_intensity: Energy intensity ratio (MWh per revenue unit)
- e_scope2: Scope 2 emissions from electricity (use emission factor ~0.5 tCO₂e/MWh if available)
- e_scope1: Scope 1 direct emissions from fuel (use standard emission factors)`,

    solar: `CONTEXT: This is solar/PV production data.
QUESTION IDS TO MAP:
- e_energy_renewable: Percentage of energy from renewable sources
- e_energy_total: If total generation data is available
- e_emission_reduction: Carbon offset from solar (estimate using ~0.5 tCO₂e/MWh)`,

    water: `CONTEXT: This is a water utility document.
QUESTION IDS TO MAP:
- e_water_total: Total water withdrawal in m³ (cubic meters)
- e_water_recycled: Percentage of water recycled/reused`,

    waste: `CONTEXT: This is a waste management document.
QUESTION IDS TO MAP:
- e_waste_total: Total waste generated in tonnes
- e_waste_recycled: Percentage of waste recycled
- e_waste_hazardous: Hazardous waste in tonnes`,

    policies: `CONTEXT: This is a company policy document. Determine which policies/practices exist.
QUESTION IDS TO MAP (answer yes/no for each one that the document covers):
- e_energy_policy: Energy management policy
- e_water_policy: Water management policy
- e_waste_policy: Waste management policy
- e_emission_target: Emission reduction target
- s_ohs_system: Occupational health & safety management system
- s_safety_training: Safety training for employees
- s_skill_program: Skill development programs
- s_equal_pay: Equal pay policy
- g_ethics_code: Code of conduct/ethics
- g_anticorruption_policy: Anti-corruption policy
- g_whistleblower: Whistleblower mechanism
- g_ethics_training: Ethics training
- g_risk_framework: Risk management framework
- g_esg_risks: ESG risks formally identified
- g_privacy_policy: Data privacy policy`,

    financial: `CONTEXT: This is a financial document or annual report.
QUESTION IDS TO MAP:
- g_board_size: Number of board members
- g_board_independent: Percentage of independent board members
- g_board_diversity: Board gender diversity (% female)
- g_esg_committee: Whether ESG/sustainability committee exists (yes/no)
- e_energy_intensity: Energy intensity ratio if revenue data available`,

    custom: `CONTEXT: This is a general document. Extract any ESG-relevant data you can find.
Look for data related to any of these topics: energy, emissions, water, waste, employees, safety, training, diversity, governance, ethics, privacy, risk management.
Map to the most relevant question IDs from:
- e_energy_total, e_energy_renewable, e_energy_reduction, e_scope1, e_scope2, e_scope3
- e_water_total, e_water_recycled
- e_waste_total, e_waste_recycled, e_waste_hazardous
- s_employees, s_turnover, s_new_hires, s_gender_ratio, s_gender_mgmt, s_training_hours
- g_board_size, g_board_independent, g_board_diversity, g_corruption_incidents, g_data_breaches`,
  };

  return base + (categoryPrompts[category] || categoryPrompts.custom) + `\n\nDOCUMENT CONTENT:\n${content}`;
}

// ─── File Parsing ───

export async function parseFileContent(buffer: Buffer, mimeType: string, filename: string): Promise<string> {
  // Excel / CSV
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || filename.endsWith('.xlsx') || filename.endsWith('.xls') || filename.endsWith('.csv')) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    let content = '';
    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      content += `\n--- Sheet: ${sheetName} ---\n`;
      for (const row of json.slice(0, 500)) { // Limit rows for API
        content += row.join('\t') + '\n';
      }
    }
    return content;
  }

  // PDF
  if (mimeType === 'application/pdf' || filename.endsWith('.pdf')) {
    try {
      const pdfModule = await import('pdf-parse');
      // @ts-ignore
      const pdfParse = pdfModule.default || pdfModule;
      const data = await pdfParse(buffer);
      return data.text.slice(0, 15000); // Limit for API
    } catch (e) {
      return '[PDF parsing failed — content could not be extracted]';
    }
  }

  // Plain text / CSV
  if (mimeType.includes('text') || filename.endsWith('.csv') || filename.endsWith('.txt')) {
    return buffer.toString('utf-8').slice(0, 15000);
  }

  // Images — send as base64 to Gemini vision
  if (mimeType.startsWith('image/')) {
    return `[IMAGE_BASE64:${buffer.toString('base64')}]`;
  }

  return buffer.toString('utf-8').slice(0, 15000);
}

// ─── AI Extraction ───

export async function extractEsgData(
  content: string,
  category: string,
  documentId: string,
  mimeType?: string,
): Promise<ExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let result;

  // Handle image files — use vision
  if (content.startsWith('[IMAGE_BASE64:')) {
    const base64 = content.replace('[IMAGE_BASE64:', '').replace(']', '');
    const prompt = getExtractionPrompt(category, '[See attached image of a document/invoice]');

    result = await model.generateContent([
      prompt,
      { inlineData: { data: base64, mimeType: mimeType || 'image/jpeg' } },
    ]);
  } else {
    const prompt = getExtractionPrompt(category, content);
    result = await model.generateContent(prompt);
  }

  const text = result.response.text();

  // Parse JSON from response (handle markdown code blocks)
  let parsed;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { kpis: [], summary: 'No data extracted', summary_ar: 'لم يتم استخراج بيانات' };
  } catch {
    parsed = { kpis: [], summary: 'Failed to parse AI response', summary_ar: 'فشل في تحليل استجابة الذكاء الاصطناعي' };
  }

  return {
    documentId,
    category,
    extractedKpis: (parsed.kpis || []).map((k: any) => ({
      questionId: k.questionId || '',
      label: k.label || '',
      value: String(k.value || ''),
      unit: k.unit,
      confidence: Math.min(1, Math.max(0, Number(k.confidence) || 0.5)),
      evidence: k.evidence || '',
    })),
    summary: parsed.summary || '',
    summary_ar: parsed.summary_ar || '',
  };
}

export function getDataSourceById(id: string): DataSource | undefined {
  return DATA_SOURCES.find(s => s.id === id);
}
