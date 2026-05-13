export interface GRIStandard {
  id: string;
  code: string;
  name: string;
  name_ar: string;
  pillar: 'Environmental' | 'Social' | 'Governance';
  description: string;
  description_ar: string;
}

export interface SectorMapping {
  id: string;
  name: string;
  name_ar: string;
  icon: string;
  griStandards: string[];
  weights: { env: number; soc: number; gov: number };
  materialTopics: string[];
}

export const GRI_STANDARDS: GRIStandard[] = [
  // Environmental
  { id: 'gri-301', code: 'GRI 301', name: 'Materials', name_ar: 'المواد', pillar: 'Environmental', description: 'Materials used by weight or volume, recycled input materials, reclaimed products', description_ar: 'المواد المستخدمة حسب الوزن أو الحجم' },
  { id: 'gri-302', code: 'GRI 302', name: 'Energy', name_ar: 'الطاقة', pillar: 'Environmental', description: 'Energy consumption, intensity, reduction initiatives', description_ar: 'استهلاك الطاقة والكثافة ومبادرات التخفيض' },
  { id: 'gri-303', code: 'GRI 303', name: 'Water & Effluents', name_ar: 'المياه والصرف', pillar: 'Environmental', description: 'Water withdrawal, consumption, discharge, recycling', description_ar: 'سحب المياه والاستهلاك والتصريف وإعادة التدوير' },
  { id: 'gri-304', code: 'GRI 304', name: 'Biodiversity', name_ar: 'التنوع البيولوجي', pillar: 'Environmental', description: 'Operational sites in protected areas, species affected', description_ar: 'المواقع التشغيلية في المناطق المحمية' },
  { id: 'gri-305', code: 'GRI 305', name: 'Emissions', name_ar: 'الانبعاثات', pillar: 'Environmental', description: 'Scope 1, 2, 3 GHG emissions, intensity, reduction', description_ar: 'انبعاثات غازات الاحتباس الحراري النطاق 1، 2، 3' },
  { id: 'gri-306', code: 'GRI 306', name: 'Waste', name_ar: 'النفايات', pillar: 'Environmental', description: 'Waste generation, diversion, disposal methods', description_ar: 'توليد النفايات والتحويل وطرق التخلص' },
  // Social
  { id: 'gri-401', code: 'GRI 401', name: 'Employment', name_ar: 'التوظيف', pillar: 'Social', description: 'New hires, turnover, benefits, parental leave', description_ar: 'التعيينات الجديدة ومعدل الدوران والمزايا' },
  { id: 'gri-403', code: 'GRI 403', name: 'Health & Safety', name_ar: 'الصحة والسلامة', pillar: 'Social', description: 'OHS management, hazard identification, injury rates', description_ar: 'إدارة الصحة والسلامة المهنية' },
  { id: 'gri-404', code: 'GRI 404', name: 'Training & Education', name_ar: 'التدريب والتعليم', pillar: 'Social', description: 'Training hours, skill development programs', description_ar: 'ساعات التدريب وبرامج تطوير المهارات' },
  { id: 'gri-405', code: 'GRI 405', name: 'Diversity & Inclusion', name_ar: 'التنوع والشمول', pillar: 'Social', description: 'Gender diversity, age groups, equal remuneration', description_ar: 'التنوع بين الجنسين والفئات العمرية' },
  { id: 'gri-406', code: 'GRI 406', name: 'Non-discrimination', name_ar: 'عدم التمييز', pillar: 'Social', description: 'Discrimination incidents and corrective actions', description_ar: 'حوادث التمييز والإجراءات التصحيحية' },
  { id: 'gri-413', code: 'GRI 413', name: 'Local Communities', name_ar: 'المجتمعات المحلية', pillar: 'Social', description: 'Community engagement, impact assessments', description_ar: 'مشاركة المجتمع وتقييمات الأثر' },
  { id: 'gri-414', code: 'GRI 414', name: 'Supplier Social Assessment', name_ar: 'تقييم الموردين الاجتماعي', pillar: 'Social', description: 'Social criteria screening for suppliers', description_ar: 'فحص المعايير الاجتماعية للموردين' },
  { id: 'gri-416', code: 'GRI 416', name: 'Customer Health & Safety', name_ar: 'صحة وسلامة العملاء', pillar: 'Social', description: 'Product safety, health impact assessments', description_ar: 'سلامة المنتجات وتقييمات الأثر الصحي' },
  // Governance
  { id: 'gri-205', code: 'GRI 205', name: 'Anti-corruption', name_ar: 'مكافحة الفساد', pillar: 'Governance', description: 'Operations assessed for corruption risks, training', description_ar: 'العمليات المقيّمة لمخاطر الفساد' },
  { id: 'gri-206', code: 'GRI 206', name: 'Anti-competitive Behavior', name_ar: 'السلوك المعادي للمنافسة', pillar: 'Governance', description: 'Legal actions for anti-competitive behavior', description_ar: 'الإجراءات القانونية للسلوك المعادي للمنافسة' },
  { id: 'gri-207', code: 'GRI 207', name: 'Tax', name_ar: 'الضرائب', pillar: 'Governance', description: 'Tax strategy, governance, reporting', description_ar: 'استراتيجية الضرائب والحوكمة والإفصاح' },
  { id: 'gri-308', code: 'GRI 308', name: 'Supplier Environmental Assessment', name_ar: 'تقييم الموردين البيئي', pillar: 'Governance', description: 'Environmental criteria for supplier screening', description_ar: 'المعايير البيئية لفحص الموردين' },
  { id: 'gri-418', code: 'GRI 418', name: 'Customer Privacy', name_ar: 'خصوصية العملاء', pillar: 'Governance', description: 'Data breaches, complaints, privacy policies', description_ar: 'خروقات البيانات والشكاوى وسياسات الخصوصية' },
];

export const SECTORS: SectorMapping[] = [
  {
    id: 'agriculture', name: 'Agriculture', name_ar: 'الزراعة', icon: '🌾',
    griStandards: ['gri-301', 'gri-302', 'gri-303', 'gri-304', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-404', 'gri-405', 'gri-413', 'gri-205'],
    weights: { env: 45, soc: 30, gov: 25 },
    materialTopics: ['Water stewardship', 'Land use', 'Biodiversity', 'Soil health', 'Pesticide management', 'Worker safety', 'Community impact'],
  },
  {
    id: 'manufacturing', name: 'Manufacturing', name_ar: 'التصنيع', icon: '🏭',
    griStandards: ['gri-301', 'gri-302', 'gri-303', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-404', 'gri-405', 'gri-414', 'gri-205', 'gri-308'],
    weights: { env: 40, soc: 35, gov: 25 },
    materialTopics: ['Energy efficiency', 'Waste reduction', 'Emissions', 'Worker safety', 'Supply chain', 'Product quality'],
  },
  {
    id: 'food', name: 'Food & Beverage', name_ar: 'الأغذية والمشروبات', icon: '🍽️',
    griStandards: ['gri-301', 'gri-302', 'gri-303', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-404', 'gri-416', 'gri-413', 'gri-205'],
    weights: { env: 40, soc: 35, gov: 25 },
    materialTopics: ['Food safety', 'Water usage', 'Packaging', 'Nutrition', 'Supply chain traceability', 'Food waste'],
  },
  {
    id: 'energy', name: 'Energy', name_ar: 'الطاقة', icon: '⚡',
    griStandards: ['gri-302', 'gri-303', 'gri-304', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-413', 'gri-205', 'gri-206'],
    weights: { env: 50, soc: 25, gov: 25 },
    materialTopics: ['Climate change', 'Emissions', 'Renewable energy', 'Community impact', 'Worker safety'],
  },
  {
    id: 'construction', name: 'Construction', name_ar: 'البناء والتشييد', icon: '🏗️',
    griStandards: ['gri-301', 'gri-302', 'gri-303', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-404', 'gri-413', 'gri-205'],
    weights: { env: 40, soc: 35, gov: 25 },
    materialTopics: ['Material sourcing', 'Energy use', 'Waste management', 'Worker safety', 'Community impact'],
  },
  {
    id: 'waste', name: 'Waste Management', name_ar: 'إدارة النفايات', icon: '♻️',
    griStandards: ['gri-301', 'gri-302', 'gri-303', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-413', 'gri-205'],
    weights: { env: 50, soc: 25, gov: 25 },
    materialTopics: ['Waste diversion', 'Circular economy', 'Emissions', 'Community health', 'Compliance'],
  },
  {
    id: 'logistics', name: 'Logistics', name_ar: 'الخدمات اللوجستية', icon: '🚛',
    griStandards: ['gri-302', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-404', 'gri-205'],
    weights: { env: 40, soc: 35, gov: 25 },
    materialTopics: ['Fleet emissions', 'Fuel efficiency', 'Driver safety', 'Route optimization', 'Packaging'],
  },
  {
    id: 'technology', name: 'Technology', name_ar: 'التكنولوجيا', icon: '💻',
    griStandards: ['gri-302', 'gri-305', 'gri-401', 'gri-403', 'gri-404', 'gri-405', 'gri-418', 'gri-205'],
    weights: { env: 25, soc: 40, gov: 35 },
    materialTopics: ['Data privacy', 'E-waste', 'Energy use', 'Diversity', 'Digital ethics', 'Talent development'],
  },
  {
    id: 'healthcare', name: 'Healthcare', name_ar: 'الرعاية الصحية', icon: '🏥',
    griStandards: ['gri-302', 'gri-303', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-404', 'gri-416', 'gri-205', 'gri-418'],
    weights: { env: 25, soc: 45, gov: 30 },
    materialTopics: ['Patient safety', 'Medical waste', 'Worker health', 'Access to healthcare', 'Data privacy'],
  },
  {
    id: 'other', name: 'Other', name_ar: 'أخرى', icon: '🏢',
    griStandards: ['gri-302', 'gri-305', 'gri-306', 'gri-401', 'gri-403', 'gri-404', 'gri-405', 'gri-205'],
    weights: { env: 33, soc: 34, gov: 33 },
    materialTopics: ['Energy', 'Emissions', 'Workforce', 'Governance', 'Ethics'],
  },
];

export function getSectorById(id: string): SectorMapping | undefined {
  return SECTORS.find(s => s.id === id);
}

export function getGRIStandard(id: string): GRIStandard | undefined {
  return GRI_STANDARDS.find(s => s.id === id);
}

export function getStandardsForSector(sectorId: string): GRIStandard[] {
  const sector = getSectorById(sectorId);
  if (!sector) return [];
  return sector.griStandards.map(id => getGRIStandard(id)).filter(Boolean) as GRIStandard[];
}

export function getRatingFromScore(score: number): string {
  if (score >= 90) return 'AAA';
  if (score >= 80) return 'AA';
  if (score >= 70) return 'A';
  if (score >= 60) return 'BBB';
  if (score >= 50) return 'BB';
  if (score >= 40) return 'B';
  return 'CCC';
}

export function getRatingColor(rating: string): string {
  const map: Record<string, string> = {
    AAA: 'var(--color-rating-aaa)', AA: 'var(--color-rating-aa)', A: 'var(--color-rating-a)',
    BBB: 'var(--color-rating-bbb)', BB: 'var(--color-rating-bb)', B: 'var(--color-rating-b)',
    CCC: 'var(--color-rating-ccc)',
  };
  return map[rating] || 'var(--color-text-muted)';
}
