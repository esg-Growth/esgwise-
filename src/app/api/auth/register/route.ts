import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, companyName, sector, companySize, country, registrationType } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }

    const { getUserByEmail, createReporter, createDirectCompany } = await import('@/lib/db');
    const bcrypt = await import('bcryptjs');

    const existing = await getUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    if (registrationType === 'reporter') {
      // Reporter registration — no company needed
      const { id: userId, reporter_id } = await createReporter(email, passwordHash, name, body.firmName);
      return NextResponse.json({ success: true, userId, reporterId: reporter_id });
    } else {
      // Direct company registration (default)
      if (!companyName || !sector) {
        return NextResponse.json({ error: 'Company name and sector are required' }, { status: 400 });
      }
      const { id: userId, company_id: companyId } = await createDirectCompany(
        email, passwordHash, name, companyName, sector, companySize, country,
      );
      return NextResponse.json({ success: true, userId, companyId });
    }
  } catch (err: any) {
    console.error('Register error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
