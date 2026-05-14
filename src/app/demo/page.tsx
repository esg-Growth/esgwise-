'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/auth/demo', { method: 'POST' });
        router.push('/dashboard');
      } catch (err) {
        console.error('Demo login failed:', err);
        router.push('/login');
      }
    })();
  }, [router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
      <span className="spinner" />
      <p style={{ color: '#6b7280', fontWeight: 500 }}>Preparing your demo experience...</p>
    </div>
  );
}
