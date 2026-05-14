import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

// Simplified auth for MVP — in production use NextAuth.js
export async function POST(req: Request) {
  try {
    const { name, email, password, companyName, sector, companySize, country } = await req.json();

    if (!email || !password || !name || !companyName || !sector) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Dynamically import to avoid build issues with better-sqlite3
    const { getUserByEmail, createUser } = await import('@/lib/db');
    const bcrypt = await import('bcryptjs');

    // Check existing user
    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const { id: userId, company_id: companyId } = await createUser(email, passwordHash, companyName);

    const response = NextResponse.json({ success: true, userId, companyId });
    response.cookies.set('esgwise_session', JSON.stringify({ userId, companyId, email, name, role: 'owner' }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
