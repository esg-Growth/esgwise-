import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const session = {
    userId: 'demo_user',
    companyId: 'demo_company',
    email: 'demo@esgwise.com',
    name: 'Demo User',
    role: 'user',
    isDemo: true,
  };

  const cookieStore = await cookies();
  cookieStore.set('esgwise_session', JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour for demo
    path: '/',
  });

  return NextResponse.json({ success: true });
}
