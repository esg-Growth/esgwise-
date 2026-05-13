'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type Locale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

const translations: Record<string, Record<Locale, string>> = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', ar: 'لوحة التحكم' },
  'nav.assessment': { en: 'Assessment', ar: 'التقييم' },
  'nav.analysis': { en: 'Analysis', ar: 'التحليل' },
  'nav.gaps': { en: 'Gap Analysis', ar: 'تحليل الفجوات' },
  'nav.roadmap': { en: 'Roadmap', ar: 'خارطة الطريق' },
  'nav.reports': { en: 'Reports', ar: 'التقارير' },
  'nav.certificate': { en: 'Certificate', ar: 'الشهادة' },
  'nav.assistant': { en: 'AI Assistant', ar: 'المساعد الذكي' },
  'nav.settings': { en: 'Settings', ar: 'الإعدادات' },
  'nav.admin': { en: 'Admin', ar: 'المسؤول' },

  // Auth
  'auth.login': { en: 'Sign In', ar: 'تسجيل الدخول' },
  'auth.register': { en: 'Create Account', ar: 'إنشاء حساب' },
  'auth.email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'auth.password': { en: 'Password', ar: 'كلمة المرور' },
  'auth.name': { en: 'Full Name', ar: 'الاسم الكامل' },
  'auth.company': { en: 'Company Name', ar: 'اسم الشركة' },
  'auth.forgot': { en: 'Forgot password?', ar: 'نسيت كلمة المرور؟' },
  'auth.no_account': { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  'auth.has_account': { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' },
  'auth.show_password': { en: 'Show password', ar: 'إظهار كلمة المرور' },

  // ESG
  'esg.environmental': { en: 'Environmental', ar: 'البيئة' },
  'esg.social': { en: 'Social', ar: 'المجتمع' },
  'esg.governance': { en: 'Governance', ar: 'الحوكمة' },
  'esg.score': { en: 'ESG Score', ar: 'درجة ESG' },
  'esg.overall': { en: 'Overall Score', ar: 'الدرجة الإجمالية' },
  'esg.rating': { en: 'Rating', ar: 'التصنيف' },

  // Sectors
  'sector.agriculture': { en: 'Agriculture', ar: 'الزراعة' },
  'sector.manufacturing': { en: 'Manufacturing', ar: 'التصنيع' },
  'sector.food': { en: 'Food & Beverage', ar: 'الأغذية والمشروبات' },
  'sector.energy': { en: 'Energy', ar: 'الطاقة' },
  'sector.construction': { en: 'Construction', ar: 'البناء والتشييد' },
  'sector.waste': { en: 'Waste Management', ar: 'إدارة النفايات' },
  'sector.logistics': { en: 'Logistics', ar: 'الخدمات اللوجستية' },
  'sector.technology': { en: 'Technology', ar: 'التكنولوجيا' },
  'sector.healthcare': { en: 'Healthcare', ar: 'الرعاية الصحية' },
  'sector.other': { en: 'Other', ar: 'أخرى' },

  // Common
  'common.save': { en: 'Save', ar: 'حفظ' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.delete': { en: 'Delete', ar: 'حذف' },
  'common.edit': { en: 'Edit', ar: 'تعديل' },
  'common.next': { en: 'Next', ar: 'التالي' },
  'common.back': { en: 'Back', ar: 'السابق' },
  'common.submit': { en: 'Submit', ar: 'إرسال' },
  'common.loading': { en: 'Loading...', ar: 'جاري التحميل...' },
  'common.search': { en: 'Search', ar: 'بحث' },
  'common.filter': { en: 'Filter', ar: 'تصفية' },
  'common.export': { en: 'Export', ar: 'تصدير' },
  'common.download': { en: 'Download', ar: 'تحميل' },
  'common.view': { en: 'View', ar: 'عرض' },
  'common.complete': { en: 'Complete', ar: 'مكتمل' },
  'common.pending': { en: 'Pending', ar: 'قيد الانتظار' },
  'common.in_progress': { en: 'In Progress', ar: 'قيد التنفيذ' },

  // Landing
  'landing.hero_title': { en: 'AI-Powered ESG Assessment\nfor the Modern Enterprise', ar: 'تقييم ESG بالذكاء الاصطناعي\nللمؤسسات العصرية' },
  'landing.hero_subtitle': { en: 'Simplify sustainability reporting with GRI-aligned assessments, AI-driven insights, and investor-grade reports — all in one platform.', ar: 'بسّط تقارير الاستدامة من خلال تقييمات متوافقة مع GRI، ورؤى مدعومة بالذكاء الاصطناعي، وتقارير بمستوى المستثمرين — في منصة واحدة.' },
  'landing.get_started': { en: 'Start Free Assessment', ar: 'ابدأ التقييم المجاني' },
  'landing.learn_more': { en: 'Learn More', ar: 'اعرف المزيد' },
};

interface I18nContextType {
  locale: Locale;
  dir: Direction;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en',
  dir: 'ltr',
  t: (key: string) => key,
  setLocale: () => {},
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');

  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';

  const t = useCallback((key: string): string => {
    return translations[key]?.[locale] ?? key;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLocale;
  }, []);

  return (
    <I18nContext.Provider value={{ locale, dir, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
