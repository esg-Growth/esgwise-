export type QuestionType = 'number' | 'percentage' | 'yes_no' | 'text' | 'select' | 'multi_select';

export interface Question {
  id: string;
  label: string;
  label_ar: string;
  type: QuestionType;
  unit?: string;
  unit_ar?: string;
  hint?: string;
  hint_ar?: string;
  options?: { value: string; label: string; label_ar: string }[];
  required?: boolean;
  gri_code?: string;
  conditional?: { questionId: string; value: string };
}

export interface Section {
  id: string;
  pillar: 'Environmental' | 'Social' | 'Governance';
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  gri_codes: string[];
  questions: Question[];
}

export const ASSESSMENT_SECTIONS: Section[] = [
  // ─── ENVIRONMENTAL ───
  {
    id: 'energy', pillar: 'Environmental', title: 'Energy Management', title_ar: 'إدارة الطاقة', description: 'Energy consumption and efficiency data', description_ar: 'بيانات استهلاك الطاقة والكفاءة', gri_codes: ['GRI 302'],
    questions: [
      { id: 'e_energy_total', label: 'Total energy consumption', label_ar: 'إجمالي استهلاك الطاقة', type: 'number', unit: 'MWh', unit_ar: 'ميغاواط/ساعة', gri_code: 'GRI 302-1' },
      { id: 'e_energy_renewable', label: 'Renewable energy used', label_ar: 'الطاقة المتجددة المستخدمة', type: 'percentage', hint: 'Percentage of total energy from renewable sources', hint_ar: 'نسبة الطاقة من مصادر متجددة', gri_code: 'GRI 302-1' },
      { id: 'e_energy_reduction', label: 'Energy reduction achieved', label_ar: 'خفض الطاقة المحقق', type: 'percentage', hint: 'Year-over-year reduction', hint_ar: 'التخفيض مقارنة بالعام السابق', gri_code: 'GRI 302-4' },
      { id: 'e_energy_policy', label: 'Energy management policy in place?', label_ar: 'هل توجد سياسة لإدارة الطاقة؟', type: 'yes_no', gri_code: 'GRI 302-1' },
      { id: 'e_energy_intensity', label: 'Energy intensity ratio', label_ar: 'نسبة كثافة الطاقة', type: 'number', unit: 'MWh/revenue', unit_ar: 'ميغاواط/إيراد', gri_code: 'GRI 302-3' },
    ]
  },
  {
    id: 'emissions', pillar: 'Environmental', title: 'Emissions', title_ar: 'الانبعاثات', description: 'Greenhouse gas emissions tracking', description_ar: 'تتبع انبعاثات الغازات الدفيئة', gri_codes: ['GRI 305'],
    questions: [
      { id: 'e_scope1', label: 'Scope 1 emissions (direct)', label_ar: 'انبعاثات النطاق 1 (مباشرة)', type: 'number', unit: 'tCO₂e', unit_ar: 'طن CO₂ معادل', gri_code: 'GRI 305-1' },
      { id: 'e_scope2', label: 'Scope 2 emissions (electricity)', label_ar: 'انبعاثات النطاق 2 (كهرباء)', type: 'number', unit: 'tCO₂e', unit_ar: 'طن CO₂ معادل', gri_code: 'GRI 305-2' },
      { id: 'e_scope3', label: 'Scope 3 emissions (supply chain)', label_ar: 'انبعاثات النطاق 3 (سلسلة التوريد)', type: 'number', unit: 'tCO₂e', unit_ar: 'طن CO₂ معادل', gri_code: 'GRI 305-3' },
      { id: 'e_emission_target', label: 'Emission reduction target set?', label_ar: 'هل تم وضع هدف لخفض الانبعاثات؟', type: 'yes_no', gri_code: 'GRI 305-5' },
      { id: 'e_emission_reduction', label: 'Emissions reduced year-over-year', label_ar: 'الانبعاثات المخفضة مقارنة بالعام السابق', type: 'percentage', gri_code: 'GRI 305-5' },
    ]
  },
  {
    id: 'water', pillar: 'Environmental', title: 'Water & Effluents', title_ar: 'المياه والصرف', description: 'Water consumption and management', description_ar: 'استهلاك المياه وإدارتها', gri_codes: ['GRI 303'],
    questions: [
      { id: 'e_water_total', label: 'Total water withdrawal', label_ar: 'إجمالي سحب المياه', type: 'number', unit: 'm³', unit_ar: 'م³', gri_code: 'GRI 303-3' },
      { id: 'e_water_recycled', label: 'Water recycled/reused', label_ar: 'المياه المعاد تدويرها', type: 'percentage', gri_code: 'GRI 303-3' },
      { id: 'e_water_policy', label: 'Water management policy in place?', label_ar: 'هل توجد سياسة لإدارة المياه؟', type: 'yes_no', gri_code: 'GRI 303-1' },
    ]
  },
  {
    id: 'waste', pillar: 'Environmental', title: 'Waste Management', title_ar: 'إدارة النفايات', description: 'Waste generation and recycling', description_ar: 'توليد النفايات وإعادة التدوير', gri_codes: ['GRI 306'],
    questions: [
      { id: 'e_waste_total', label: 'Total waste generated', label_ar: 'إجمالي النفايات المولدة', type: 'number', unit: 'tonnes', unit_ar: 'أطنان', gri_code: 'GRI 306-3' },
      { id: 'e_waste_recycled', label: 'Waste recycled', label_ar: 'النفايات المعاد تدويرها', type: 'percentage', gri_code: 'GRI 306-4' },
      { id: 'e_waste_hazardous', label: 'Hazardous waste', label_ar: 'النفايات الخطرة', type: 'number', unit: 'tonnes', unit_ar: 'أطنان', gri_code: 'GRI 306-3' },
      { id: 'e_waste_policy', label: 'Waste management policy in place?', label_ar: 'هل توجد سياسة لإدارة النفايات؟', type: 'yes_no', gri_code: 'GRI 306-2' },
    ]
  },

  // ─── SOCIAL ───
  {
    id: 'employment', pillar: 'Social', title: 'Employment', title_ar: 'التوظيف', description: 'Workforce and employment practices', description_ar: 'القوى العاملة وممارسات التوظيف', gri_codes: ['GRI 401'],
    questions: [
      { id: 's_employees', label: 'Total number of employees', label_ar: 'إجمالي عدد الموظفين', type: 'number', gri_code: 'GRI 2-7' },
      { id: 's_turnover', label: 'Employee turnover rate', label_ar: 'معدل دوران الموظفين', type: 'percentage', gri_code: 'GRI 401-1' },
      { id: 's_new_hires', label: 'New hires in reporting period', label_ar: 'التعيينات الجديدة في فترة التقرير', type: 'number', gri_code: 'GRI 401-1' },
      { id: 's_benefits', label: 'Benefits provided to full-time employees?', label_ar: 'هل يتم تقديم مزايا للموظفين بدوام كامل؟', type: 'yes_no', gri_code: 'GRI 401-2' },
      { id: 's_parental_leave', label: 'Parental leave policy in place?', label_ar: 'هل توجد سياسة لإجازة الوالدين؟', type: 'yes_no', gri_code: 'GRI 401-3' },
    ]
  },
  {
    id: 'health_safety', pillar: 'Social', title: 'Health & Safety', title_ar: 'الصحة والسلامة', description: 'Occupational health and safety', description_ar: 'الصحة والسلامة المهنية', gri_codes: ['GRI 403'],
    questions: [
      { id: 's_ohs_system', label: 'OHS management system in place?', label_ar: 'هل يوجد نظام إدارة الصحة والسلامة؟', type: 'yes_no', gri_code: 'GRI 403-1' },
      { id: 's_injury_rate', label: 'Work-related injury rate', label_ar: 'معدل إصابات العمل', type: 'number', unit: 'per 200,000 hrs', unit_ar: 'لكل 200,000 ساعة', gri_code: 'GRI 403-9' },
      { id: 's_fatalities', label: 'Work-related fatalities', label_ar: 'الوفيات المتعلقة بالعمل', type: 'number', gri_code: 'GRI 403-9' },
      { id: 's_safety_training', label: 'Safety training provided?', label_ar: 'هل يتم تقديم تدريب السلامة؟', type: 'yes_no', gri_code: 'GRI 403-5' },
    ]
  },
  {
    id: 'training', pillar: 'Social', title: 'Training & Development', title_ar: 'التدريب والتطوير', description: 'Employee training and development', description_ar: 'تدريب وتطوير الموظفين', gri_codes: ['GRI 404'],
    questions: [
      { id: 's_training_hours', label: 'Average training hours per employee', label_ar: 'متوسط ساعات التدريب لكل موظف', type: 'number', unit: 'hours', unit_ar: 'ساعات', gri_code: 'GRI 404-1' },
      { id: 's_training_budget', label: 'Training budget (% of payroll)', label_ar: 'ميزانية التدريب (% من الرواتب)', type: 'percentage', gri_code: 'GRI 404-1' },
      { id: 's_skill_program', label: 'Skill development programs offered?', label_ar: 'هل يتم تقديم برامج تطوير المهارات؟', type: 'yes_no', gri_code: 'GRI 404-2' },
    ]
  },
  {
    id: 'diversity', pillar: 'Social', title: 'Diversity & Inclusion', title_ar: 'التنوع والشمول', description: 'Workforce diversity and equal opportunity', description_ar: 'تنوع القوى العاملة وتكافؤ الفرص', gri_codes: ['GRI 405'],
    questions: [
      { id: 's_gender_ratio', label: 'Percentage of female employees', label_ar: 'نسبة الموظفات', type: 'percentage', gri_code: 'GRI 405-1' },
      { id: 's_gender_mgmt', label: 'Women in management positions', label_ar: 'النساء في المناصب الإدارية', type: 'percentage', gri_code: 'GRI 405-1' },
      { id: 's_equal_pay', label: 'Equal pay policy in place?', label_ar: 'هل توجد سياسة للأجر المتساوي؟', type: 'yes_no', gri_code: 'GRI 405-2' },
      { id: 's_discrimination', label: 'Discrimination incidents reported', label_ar: 'حوادث التمييز المبلغ عنها', type: 'number', gri_code: 'GRI 406-1' },
    ]
  },

  // ─── GOVERNANCE ───
  {
    id: 'board', pillar: 'Governance', title: 'Board & Leadership', title_ar: 'مجلس الإدارة والقيادة', description: 'Governance structure and practices', description_ar: 'هيكل الحوكمة والممارسات', gri_codes: ['GRI 2-9'],
    questions: [
      { id: 'g_board_size', label: 'Number of board members', label_ar: 'عدد أعضاء مجلس الإدارة', type: 'number', gri_code: 'GRI 2-9' },
      { id: 'g_board_independent', label: 'Independent board members', label_ar: 'أعضاء مجلس الإدارة المستقلون', type: 'percentage', gri_code: 'GRI 2-9' },
      { id: 'g_board_diversity', label: 'Board gender diversity (% female)', label_ar: 'تنوع المجلس (% إناث)', type: 'percentage', gri_code: 'GRI 405-1' },
      { id: 'g_esg_committee', label: 'ESG/sustainability committee exists?', label_ar: 'هل يوجد لجنة ESG/استدامة؟', type: 'yes_no', gri_code: 'GRI 2-12' },
    ]
  },
  {
    id: 'ethics', pillar: 'Governance', title: 'Ethics & Anti-Corruption', title_ar: 'الأخلاقيات ومكافحة الفساد', description: 'Ethical conduct and anti-corruption measures', description_ar: 'السلوك الأخلاقي وإجراءات مكافحة الفساد', gri_codes: ['GRI 205'],
    questions: [
      { id: 'g_ethics_code', label: 'Code of conduct/ethics in place?', label_ar: 'هل يوجد ميثاق سلوك/أخلاقيات؟', type: 'yes_no', gri_code: 'GRI 2-23' },
      { id: 'g_anticorruption_policy', label: 'Anti-corruption policy in place?', label_ar: 'هل توجد سياسة لمكافحة الفساد؟', type: 'yes_no', gri_code: 'GRI 205-2' },
      { id: 'g_corruption_incidents', label: 'Corruption incidents reported', label_ar: 'حوادث الفساد المبلغ عنها', type: 'number', gri_code: 'GRI 205-3' },
      { id: 'g_whistleblower', label: 'Whistleblower mechanism in place?', label_ar: 'هل توجد آلية للإبلاغ عن المخالفات؟', type: 'yes_no', gri_code: 'GRI 2-26' },
      { id: 'g_ethics_training', label: 'Ethics training provided to employees?', label_ar: 'هل يتم تقديم تدريب على الأخلاقيات؟', type: 'yes_no', gri_code: 'GRI 205-2' },
    ]
  },
  {
    id: 'risk_privacy', pillar: 'Governance', title: 'Risk & Data Privacy', title_ar: 'المخاطر وخصوصية البيانات', description: 'Risk management and data protection', description_ar: 'إدارة المخاطر وحماية البيانات', gri_codes: ['GRI 418'],
    questions: [
      { id: 'g_risk_framework', label: 'Risk management framework in place?', label_ar: 'هل يوجد إطار لإدارة المخاطر؟', type: 'yes_no' },
      { id: 'g_esg_risks', label: 'ESG risks formally identified?', label_ar: 'هل تم تحديد مخاطر ESG رسمياً؟', type: 'yes_no' },
      { id: 'g_data_breaches', label: 'Data breaches in reporting period', label_ar: 'خروقات البيانات في فترة التقرير', type: 'number', gri_code: 'GRI 418-1' },
      { id: 'g_privacy_policy', label: 'Data privacy policy in place?', label_ar: 'هل توجد سياسة لخصوصية البيانات؟', type: 'yes_no', gri_code: 'GRI 418-1' },
    ]
  },
];

export function getSectionsForPillar(pillar: string): Section[] {
  return ASSESSMENT_SECTIONS.filter(s => s.pillar === pillar);
}

export function getTotalQuestions(): number {
  return ASSESSMENT_SECTIONS.reduce((sum, s) => sum + s.questions.length, 0);
}

export function calculateSectionProgress(responses: Record<string, string>, section: Section): number {
  const answered = section.questions.filter(q => responses[q.id] && responses[q.id].trim() !== '').length;
  return Math.round((answered / section.questions.length) * 100);
}
