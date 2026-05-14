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
