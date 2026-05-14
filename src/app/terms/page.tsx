'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { Leaf, FileText, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const { locale } = useI18n();
  const isAr = locale === 'ar';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', padding: '3rem', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', padding: '0.75rem', borderRadius: '0.75rem' }}>
            <FileText size={32} />
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#111827', margin: 0 }}>{isAr ? 'شروط الخدمة' : 'Terms of Service'}</h1>
            <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>{isAr ? 'آخر تحديث: 14 مايو 2026' : 'Last Updated: May 14, 2026'}</p>
          </div>
        </div>

        <div style={{ color: '#374151', lineHeight: 1.6 }}>
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '1. قبول الشروط' : '1. Acceptance of Terms'}</h2>
            <p>
              {isAr 
                ? 'باستخدامك لمنصة ESGwise، فإنك توافق على الالتزام بهذه الشروط والأحكام.' 
                : 'By using the ESGwise platform, you agree to be bound by these terms and conditions.'}
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '2. حساب المستخدم' : '2. User Accounts'}</h2>
            <p>
              {isAr 
                ? 'أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.' 
                : 'You are responsible for maintaining the confidentiality of your account information and password.'}
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '3. الاستخدام المقبول' : '3. Acceptable Use'}</h2>
            <p>
              {isAr 
                ? 'توافق على عدم استخدام المنصة لأي غرض غير قانوني أو انتهاك حقوق الآخرين.' 
                : 'You agree not to use the platform for any illegal purpose or to violate the rights of others.'}
            </p>
          </section>

          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', marginBottom: '1rem' }}>{isAr ? '4. الملكية الفكرية' : '4. Intellectual Property'}</h2>
            <p>
              {isAr 
                ? 'جميع المحتويات والبرمجيات في المنصة هي ملك لشركة ESGwise أو مرخصيها.' 
                : 'All content and software on the platform are the property of ESGwise or its licensors.'}
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
