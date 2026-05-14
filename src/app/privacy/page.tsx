'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Leaf, Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '3rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#ecfdf5', color: '#10b981', padding: '0.75rem', borderRadius: '0.75rem' }}>
            <Shield size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', margin: 0 }}>{isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}</h1>
            <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{isAr ? 'آخر تحديث: 14 مايو 2026' : 'Last Updated: May 14, 2026'}</p>
          </div>
        </div>

        <div style={{ color: '#374151', lineHeight: 1.6 }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '1. جمع البيانات' : '1. Information Collection'}</h2>
            <p>
              {isAr 
                ? 'نحن نجمع المعلومات التي تقدمها مباشرة إلينا، بما في ذلك بيانات الشركة، والتقييمات البيئية والاجتماعية والحوكمة (ESG)، ومعلومات الاتصال.' 
                : 'We collect information you provide directly to us, including company data, ESG assessments, and contact information.'}
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '2. استخدام البيانات' : '2. How We Use Data'}</h2>
            <p>
              {isAr 
                ? 'نستخدم البيانات لتوليد تقارير ESG، وتقديم رؤى تحليلية، وتحسين خدماتنا. نحن لا نبيع بياناتك لأطراف ثالثة.' 
                : 'We use the data to generate ESG reports, provide analytical insights, and improve our services. We do not sell your data to third parties.'}
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '3. أمن البيانات' : '3. Data Security'}</h2>
            <p>
              {isAr 
                ? 'نحن نستخدم تدابير أمنية تقنية وتنظيمية لحماية بياناتك من الوصول غير المصرح به أو الفقدان.' 
                : 'We implement technical and organizational security measures to protect your data from unauthorized access or loss.'}
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '4. ملفات تعريف الارتباط' : '4. Cookies'}</h2>
            <p>
              {isAr 
                ? 'نحن نستخدم ملفات تعريف الارتباط لتحسين تجربة المستخدم وتحليل حركة المرور على الموقع.' 
                : 'We use cookies to enhance user experience and analyze website traffic.'}
            </p>
          </section>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600 }}>
              <Leaf size={20} />
              <span>ESGwise</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
              © 2026 ESGwise Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
